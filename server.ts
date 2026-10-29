import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 receipt images
  app.use(express.json({ limit: '20mb' }));

  app.post('/api/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'Missing imageBase64 or mimeType in request body.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: `Analyze this receipt or bill image using Google Vision OCR and extract structured expense details.
Return accurate values from the receipt:
- storeName: Short merchant/brand name (e.g., "Starbucks Coffee", "Swiggy", "Shell")
- storeFullTitle: Merchant name with branch/neighborhood if visible (e.g., "Starbucks Coffee - Koramangala")
- billMeta: Bill number and GSTIN/Tax ID if visible (e.g., "Bill #4092 • GSTIN: 29AABCS1429B1Z8")
- location: Store address or city if visible
- totalAmount: Total amount paid formatted with 2 decimals (e.g., "340.00")
- dateTime: Date and time from receipt (e.g., "Today, 4:15 PM" or receipt date)
- paymentMode: One of "UPI (GPay / PhonePe)", "Credit Card (HDFC)", "Debit Card", or "Cash" based on receipt
- category: One of "Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"
- subCategory: Short sub-category description (e.g., "Cafe & Quick Bites", "Groceries & Essentials")
- tags: 2-3 relevant short tags (e.g., ["Dining", "Receipt"])
- lineItems: Array of extracted items on the bill with qty, name, desc (short category/size), receiptText (e.g., "1x Caramel Frappuccino"), and price (formatted like "290.00").`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              storeName: { type: Type.STRING },
              storeFullTitle: { type: Type.STRING },
              billMeta: { type: Type.STRING },
              location: { type: Type.STRING },
              totalAmount: { type: Type.STRING },
              dateTime: { type: Type.STRING },
              paymentMode: { type: Type.STRING },
              category: { type: Type.STRING },
              subCategory: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              lineItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    qty: { type: Type.STRING },
                    name: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    receiptText: { type: Type.STRING },
                    price: { type: Type.STRING },
                  },
                  required: ['qty', 'name', 'desc', 'receiptText', 'price'],
                },
              },
            },
            required: [
              'storeName',
              'storeFullTitle',
              'billMeta',
              'location',
              'totalAmount',
              'dateTime',
              'paymentMode',
              'category',
              'subCategory',
              'tags',
              'lineItems',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(500).json({ error: 'Empty response from Vision model.' });
      }

      const parsed = JSON.parse(rawText.trim());
      return res.json({ result: parsed });
    } catch (error: any) {
      console.error('Receipt Vision Error:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to analyze receipt image with Google Vision.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpendAI server listening on http://localhost:${PORT}`);
  });
}

startServer();
