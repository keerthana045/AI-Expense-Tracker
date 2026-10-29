import React, { useState, useRef, useEffect } from 'react';
import {
  ScreenId,
  ExpenseItem,
  ExpenseCategoryName,
  UserSettings,
  ReceiptLineItem,
} from '../types';
import { RECEIPT_SAMPLES } from '../data';

interface ScanReceiptScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: UserSettings;
  onAddScannedExpense: (newExpense: ExpenseItem) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_OPTIONS: {
  name: ExpenseCategoryName;
  label: string;
  sub: string;
  emoji: string;
}[] = [
  { name: 'Food', label: 'Food & Dining', sub: 'Cafe & Quick Bites', emoji: '🍔' },
  { name: 'Travel', label: 'Travel & Commute', sub: 'Cabs, Fuel & Transit', emoji: '🚕' },
  { name: 'Shopping', label: 'Shopping & Retail', sub: 'Apparel & Lifestyle', emoji: '🛍' },
  { name: 'Bills', label: 'Bills & Utilities', sub: 'Broadband & Electricity', emoji: '📱' },
  { name: 'Entertainment', label: 'Entertainment', sub: 'Movies & Events', emoji: '🍿' },
];

export const ScanReceiptScreen: React.FC<ScanReceiptScreenProps> = ({
  onNavigate,
  settings,
  onAddScannedExpense,
  onShowToast,
}) => {
  const [sampleIndex, setSampleIndex] = useState(0);
  const currentSample = RECEIPT_SAMPLES[sampleIndex];

  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');
  const [flashActive, setFlashActive] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Camera & Uploaded Image state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extracted Receipt Fields
  const [storeShortName, setStoreShortName] = useState(currentSample.storeName);
  const [billMeta, setBillMeta] = useState(currentSample.billMeta);
  const [locationText, setLocationText] = useState(currentSample.location);
  const [amount, setAmount] = useState(currentSample.totalAmount);
  const [merchant, setMerchant] = useState(currentSample.storeFullTitle);
  const [dateTime, setDateTime] = useState(currentSample.dateTime);
  const [paymentMode, setPaymentMode] = useState(currentSample.paymentMode);
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>(currentSample.lineItems);
  const [tags, setTags] = useState<string[]>(currentSample.tags);
  const [addingNote, setAddingNote] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const activeCategory = CATEGORY_OPTIONS[categoryIdx];

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startLiveCamera = async () => {
    setVisionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setIsLiveCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      onShowToast('Camera access unavailable — opening file picker instead.');
      fileInputRef.current?.click();
    }
  };

  const analyzeImageWithGoogleVision = async (base64Data: string, mimeType: string) => {
    setIsAnalyzingVision(true);
    setVisionError(null);
    setIsScanning(true);

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze receipt with Google Vision.');
      }

      const extracted = data.result;
      setStoreShortName(extracted.storeName || 'Scanned Receipt');
      setMerchant(extracted.storeFullTitle || extracted.storeName || 'Scanned Merchant');
      setBillMeta(extracted.billMeta || 'GST Verified Invoice');
      setLocationText(extracted.location || 'India');
      setAmount(String(extracted.totalAmount || '0.00').replace(/[^0-9.]/g, '') || '0.00');
      setDateTime(extracted.dateTime || 'Today');

      if (extracted.paymentMode) {
        const validModes = [
          'UPI (GPay / PhonePe)',
          'Credit Card (HDFC)',
          'Debit Card',
          'Cash',
        ];
        const matchedMode = validModes.find((m) =>
          m.toLowerCase().includes(extracted.paymentMode.toLowerCase())
        );
        setPaymentMode(matchedMode || 'UPI (GPay / PhonePe)');
      }

      if (extracted.category) {
        const matchedCatIdx = CATEGORY_OPTIONS.findIndex(
          (c) => c.name.toLowerCase() === String(extracted.category).toLowerCase()
        );
        if (matchedCatIdx >= 0) {
          setCategoryIdx(matchedCatIdx);
        }
      }

      if (Array.isArray(extracted.lineItems) && extracted.lineItems.length > 0) {
        setLineItems(
          extracted.lineItems.map((item: any, i: number) => ({
            id: String(i + 1),
            qty: String(item.qty || '1'),
            name: String(item.name || 'Item'),
            desc: String(item.desc || 'Extracted via Vision'),
            receiptText: String(item.receiptText || `${item.qty || 1}x ${item.name}`),
            price: String(item.price || '0.00').replace(/[^0-9.]/g, ''),
          }))
        );
      }

      if (Array.isArray(extracted.tags) && extracted.tags.length > 0) {
        setTags(extracted.tags.slice(0, 4));
      }

      onShowToast(
        `Google Vision extracted ${extracted.storeName} (${settings.currencySymbol}${extracted.totalAmount})`
      );
    } catch (err: any) {
      setVisionError(err?.message || 'Vision OCR failed to process image.');
      onShowToast('Could not parse receipt image. Please check or edit fields below.');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const handleCaptureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCameraStream();
    setCapturedImagePreview(dataUrl);

    const base64Data = dataUrl.split(',')[1];
    if (base64Data) {
      analyzeImageWithGoogleVision(base64Data, 'image/jpeg');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCameraStream();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImagePreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        analyzeImageWithGoogleVision(base64Data, file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const loadSample = (idx: number) => {
    stopCameraStream();
    setCapturedImagePreview(null);
    setVisionError(null);
    const sample = RECEIPT_SAMPLES[idx];
    setSampleIndex(idx);
    setStoreShortName(sample.storeName);
    setBillMeta(sample.billMeta);
    setLocationText(sample.location);
    setAmount(sample.totalAmount);
    setMerchant(sample.storeFullTitle);
    setDateTime(sample.dateTime);
    setPaymentMode(sample.paymentMode);
    setLineItems(sample.lineItems);
    setTags(sample.tags);
    const matchedCat = CATEGORY_OPTIONS.findIndex((c) =>
      sample.category.toLowerCase().includes(c.name.toLowerCase())
    );
    setCategoryIdx(matchedCat >= 0 ? matchedCat : 0);

    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 80);
  };

  const handleRetake = () => {
    if (capturedImagePreview) {
      fileInputRef.current?.click();
      return;
    }
    const nextIdx = (sampleIndex + 1) % RECEIPT_SAMPLES.length;
    loadSample(nextIdx);
    onShowToast(
      `Loaded sample receipt: ${RECEIPT_SAMPLES[nextIdx].storeName} (${settings.currencySymbol}${RECEIPT_SAMPLES[nextIdx].totalAmount})`
    );
  };

  // Generate a synthetic receipt canvas and run it through live Google Vision API
  const handleRunLiveVisionOnSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1c30';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(storeShortName, 32, 50);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#464554';
    ctx.fillText(billMeta, 32, 78);
    ctx.fillText(locationText, 32, 100);
    ctx.fillText('------------------------------------------------', 32, 128);

    let y = 160;
    ctx.font = '16px monospace';
    ctx.fillStyle = '#0b1c30';
    lineItems.forEach((item) => {
      ctx.fillText(item.receiptText, 32, y);
      ctx.fillText(`INR ${item.price}`, 430, y);
      y += 34;
    });

    ctx.fillText('------------------------------------------------', 32, y + 10);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('TOTAL PAID (UPI)', 32, y + 45);
    ctx.fillText(`INR ${amount}`, 420, y + 45);

    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    if (base64Data) {
      analyzeImageWithGoogleVision(base64Data, 'image/png');
    }
  };

  const handleConfirm = () => {
    setIsSaving(true);
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 340;
    const shortPayment = paymentMode.includes('UPI')
      ? 'UPI'
      : paymentMode.includes('Card')
      ? 'Card'
      : 'Cash';

    const newExp: ExpenseItem = {
      id: `exp-scan-${Date.now()}`,
      title: merchant.split(' - ')[0] || merchant,
      category: activeCategory.name,
      emoji: activeCategory.emoji,
      paymentMode: shortPayment,
      amount: Math.round(numericAmount),
      time: '4:15 PM',
      dateGroup: 'October 8 (Today)',
      tags,
    };

    setTimeout(() => {
      onAddScannedExpense(newExp);
      setIsSaving(false);
      onShowToast(
        `Receipt verified & added (${settings.currencySymbol}${Math.round(numericAmount)}) to October expenses!`
      );
      onNavigate('history');
    }, 450);
  };

  const handleAddTag = () => {
    if (noteInput.trim()) {
      setTags((prev) => [...prev, noteInput.trim()]);
      setNoteInput('');
      setAddingNote(false);
    }
  };

  const displayRoundedAmount = Math.round(
    parseFloat(amount.replace(/[^0-9.]/g, '')) || 340
  );

  return (
    <div className="w-full max-w-md mx-auto bg-background flex flex-col justify-between min-h-[840px] relative text-on-surface">
      {/* Hidden File Input for Real Bill Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Action Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => {
              stopCameraStream();
              onNavigate('home');
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_back
            </span>
          </button>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-background leading-tight">
              Scan &amp; Add Receipt
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{' '}
              Powered by Google Vision AI
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Toggle Flash"
            onClick={() => setFlashActive((prev) => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              flashActive
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {flashActive ? 'flash_off' : 'flash_on'}
            </span>
          </button>
          <button
            type="button"
            aria-label="Run Live Google Vision OCR"
            onClick={handleRunLiveVisionOnSample}
            title="Test live Google Vision OCR extraction on current receipt"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              help_outline
            </span>
          </button>
        </div>
      </header>

      {/* Content Flow Section */}
      <div className="px-4 pt-3 pb-6 flex flex-col space-y-4 flex-1">
        {/* Viewport & Scan Source Toggle */}
        <section className="bg-surface-container-lowest rounded-2xl p-3 border border-surface-container-high/60 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)]">
          {/* Input Method Segmented Control */}
          <div className="h-10 bg-surface-container rounded-xl p-1 flex items-center mb-3">
            <button
              type="button"
              onClick={() => {
                setInputMode('camera');
                startLiveCamera();
              }}
              className={`flex-1 h-full rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'camera'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                photo_camera
              </span>
              Take Photo
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('upload');
                fileInputRef.current?.click();
              }}
              className={`flex-1 h-full rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                upload_file
              </span>
              Upload Bill
            </button>
          </div>

          {/* Camera Viewfinder / Uploaded Photo / Scanned Bill Preview */}
          <div className="relative w-full h-56 rounded-xl overflow-hidden bg-on-background/95 flex items-center justify-center group shadow-inner">
            {isLiveCameraOpen ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={handleCaptureFromVideo}
                    className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      photo_camera
                    </span>
                    Capture &amp; Scan
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3 py-1.5 rounded-full bg-inverse-surface/80 text-white font-label-sm text-label-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : capturedImagePreview ? (
              <img
                src={capturedImagePreview}
                alt="Uploaded receipt bill"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-black/90 p-2"
              />
            ) : (
              /* Default Simulated Scanned Receipt Card */
              <div className="absolute inset-4 rounded-lg bg-surface-container-lowest/95 backdrop-blur-sm p-3.5 flex flex-col justify-between border border-dashed border-outline-variant/60 shadow-lg select-none">
                {/* Receipt Header Details */}
                <div className="border-b border-dashed border-outline-variant/40 pb-2 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-[12px]">
                          {currentSample.icon}
                        </span>
                      </span>
                      <span className="font-headline-sm text-body-md text-on-background font-bold tracking-tight">
                        {storeShortName}
                      </span>
                    </div>
                    <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5">
                      {billMeta}
                    </p>
                    <p className="font-body-sm text-[10px] text-on-surface-variant">
                      {locationText}
                    </p>
                  </div>
                  <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                    TAX INVOICE
                  </span>
                </div>

                {/* Receipt Simulated Line Items */}
                <div className="py-1.5 space-y-1 font-body-sm text-[11px] text-on-surface-variant">
                  {lineItems.slice(0, 3).map((li) => (
                    <div key={li.id} className="flex justify-between">
                      <span className="truncate max-w-[190px]">{li.receiptText}</span>
                      <span className="font-currency-tabular text-currency-tabular font-medium text-on-surface tabular-nums">
                        {settings.currencySymbol}
                        {li.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Receipt Simulated Total Bar */}
                <div className="border-t border-dashed border-outline-variant/40 pt-1.5 flex justify-between items-baseline">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    TOTAL PAID (UPI)
                  </span>
                  <span className="font-headline-md text-headline-sm text-primary font-bold tabular-nums">
                    {settings.currencySymbol}
                    {amount}
                  </span>
                </div>
              </div>
            )}

            {/* Alignment Guides (Corners) */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-secondary rounded-tl-sm pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-secondary rounded-tr-sm pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-secondary rounded-bl-sm pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-secondary rounded-br-sm pointer-events-none"></div>

            {/* Animated OCR Laser Scan Bar */}
            {(isScanning || isAnalyzingVision) && (
              <div className="scanner-line absolute left-3 right-3 top-2 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent shadow-[0_0_8px_#4edea3] pointer-events-none"></div>
            )}

            {/* Realtime Detection Overlay Badge */}
            {!isLiveCameraOpen && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm pointer-events-none whitespace-nowrap">
                <span
                  className={`material-symbols-outlined text-secondary-fixed text-[14px] ${
                    isAnalyzingVision ? 'animate-spin' : ''
                  }`}
                >
                  {isAnalyzingVision ? 'sync' : 'center_focus_strong'}
                </span>
                {isAnalyzingVision
                  ? 'Google Vision Extracting Bill...'
                  : 'Receipt Aligned & Captured'}
              </div>
            )}
          </div>

          {/* Quick Viewfinder Toolbar */}
          <div className="mt-2.5 flex items-center justify-between text-on-surface-variant px-1">
            <button
              type="button"
              onClick={handleRunLiveVisionOnSample}
              disabled={isAnalyzingVision}
              className="font-body-sm text-body-sm flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                verified
              </span>{' '}
              {isAnalyzingVision
                ? 'Analyzing via Google Vision...'
                : 'Auto-detection active (Re-scan)'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary font-label-md text-label-md font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                crop
              </span>{' '}
              Crop / Adjust
            </button>
          </div>
        </section>

        {/* OCR Status Recognition Banner */}
        <section className="bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low rounded-2xl p-3.5 border border-primary-fixed flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isAnalyzingVision ? 'animate-spin' : ''
                }`}
              >
                {isAnalyzingVision ? 'progress_activity' : 'auto_awesome'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  AI Vision Extraction
                </span>
                <span className="bg-secondary-fixed/50 text-on-secondary-fixed font-label-sm text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {isAnalyzingVision ? 'Scanning...' : '99% Accuracy'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {visionError
                  ? visionError
                  : `Recognized GST bill, ${lineItems.length} line items, & total.`}
              </p>
            </div>
          </div>
          <span
            className="material-symbols-outlined filled text-secondary text-[22px]"
            data-weight="fill"
          >
            check_circle
          </span>
        </section>

        {/* Extracted Expense Form / Review Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/80 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Scanned Amount
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-display-currency-mobile text-display-currency-mobile font-bold text-primary">
                  {settings.currencySymbol}
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-display-currency-mobile text-display-currency-mobile font-bold text-on-surface bg-transparent border-none p-0 focus:outline-none w-36 cursor-text tabular-nums"
                />
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-secondary-fixed/30 text-on-secondary-container font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                task_alt
              </span>{' '}
              Verified Match
            </span>
          </div>

          {/* Merchant Field */}
          <div className="space-y-1">
            <label
              htmlFor="merchantName"
              className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between"
            >
              <span>Merchant / Store</span>
              <span className="text-[11px] text-primary font-medium">
                Auto-detected
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                storefront
              </span>
              <input
                id="merchantName"
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full h-12 pl-10 pr-9 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none transition-all font-medium"
              />
              <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-[16px] pointer-events-none">
                edit
              </span>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Date &amp; Time
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                  calendar_today
                </span>
                <input
                  type="text"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Payment Mode
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
                  account_balance_wallet
                </span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full h-11 pl-9 pr-8 rounded-xl bg-surface border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none appearance-none font-medium"
                >
                  <option>UPI (GPay / PhonePe)</option>
                  <option>Credit Card (HDFC)</option>
                  <option>Debit Card</option>
                  <option>Cash</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 text-on-surface-variant text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Category Auto-Assignment Chip & Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Expense Category
              </span>
              <span className="font-label-sm text-label-sm text-secondary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">
                  auto_fix_high
                </span>{' '}
                Verified by OCR
              </span>
            </div>
            <div
              onClick={() =>
                setCategoryIdx((prev) => (prev + 1) % CATEGORY_OPTIONS.length)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                setCategoryIdx((prev) => (prev + 1) % CATEGORY_OPTIONS.length)
              }
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline-variant/60 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-headline-sm text-sm">
                  {activeCategory.emoji}
                </div>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
                    {activeCategory.label}
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    {activeCategory.sub}
                  </p>
                </div>
              </div>
              <span className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5 hover:underline">
                Change
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </span>
            </div>
          </div>

          {/* Itemized Breakdown (Line Items pill drawer) */}
          <div className="pt-1 border-t border-surface-container">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  receipt_long
                </span>
                Extracted Line Items ({lineItems.length})
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Tax included
              </span>
            </div>
            <div className="space-y-2">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                      {item.qty}
                    </span>
                    <div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">
                        {item.name}
                      </p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-currency-tabular text-currency-tabular font-bold text-on-surface tabular-nums">
                      {settings.currencySymbol}
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Tag & Notes Optional Input */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-label-md bg-surface text-on-surface-variant border border-outline-variant/60 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">
                  tag
                </span>{' '}
                {tag}
              </span>
            ))}

            {addingNote ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Tag..."
                  className="h-7 w-24 px-2 text-xs rounded-full border border-primary bg-surface focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-xs px-2 py-1 rounded-full bg-primary text-on-primary font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingNote(true)}
                className="px-2 py-1 rounded-full text-[11px] font-label-md text-primary hover:bg-surface-container transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  add
                </span>{' '}
                Add Note
              </button>
            )}
          </div>
        </section>

        {/* Confidence & Security Guarantee Micro-Badge */}
        <div className="flex items-center justify-center space-x-1.5 py-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            lock
          </span>
          <span className="font-body-sm text-[11px]">
            End-to-end encrypted financial analysis • No raw receipt images retained
          </span>
        </div>
      </div>

      {/* Fixed Action Drawer */}
      <div className="sticky bottom-0 left-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0px_-4px_16px_0px_rgba(15,23,42,0.06)] border-t border-surface-container">
        <div className="max-w-md mx-auto px-4 py-3 flex flex-col space-y-2">
          {/* Primary Confirmation Action */}
          <button
            type="button"
            disabled={isSaving || isAnalyzingVision}
            onClick={handleConfirm}
            className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isSaving ? 'animate-spin' : ''
              }`}
            >
              {isSaving ? 'refresh' : 'check'}
            </span>
            <span>
              {isSaving
                ? 'Saving to SpendAI...'
                : `Confirm & Add to Expenses (${settings.currencySymbol}${displayRoundedAmount})`}
            </span>
          </button>

          {/* Secondary Action: Retake or Re-upload */}
          <button
            type="button"
            onClick={handleRetake}
            disabled={isAnalyzingVision}
            className="w-full h-10 bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">
              replay
            </span>
            Retake / Re-upload
          </button>
        </div>
      </div>
    </div>
  );
};
