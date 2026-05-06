import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

// Actual UPI ID to replace the placeholder
const UPI_ID = "mushkerohithreddy@upi";

export default function Donate() {
  const [amount, setAmount] = useState<string>("49");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Debounce for custom amount
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const finalAmount = isCustom ? (customAmount || "0") : amount;
    
    // Function to update QR
    const updateQR = () => {
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Rohith&am=${finalAmount}&cu=INR&tn=Portfolio+Support`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`);
    };

    if (isCustom) {
      timeoutId = setTimeout(updateQR, 400);
    } else {
      updateQR();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [amount, customAmount, isCustom]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  const handleShare = useCallback(() => {
    window.location.href = "https://free-pi.pages.dev/";
  }, []);

  const getUpiUrl = () => {
    const finalAmount = isCustom ? (customAmount || "0") : amount;
    return `upi://pay?pa=${UPI_ID}&pn=Rohith&am=${finalAmount}&cu=INR&tn=Portfolio+Support`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes breathing-glow {
          0% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.2), inset 0 0 10px rgba(212, 175, 55, 0.2); }
          50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.5), inset 0 0 15px rgba(212, 175, 55, 0.4); }
          100% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.2), inset 0 0 10px rgba(212, 175, 55, 0.2); }
        }
        .breathing-glow-box {
          animation: breathing-glow 3s ease-in-out infinite;
        }
      `}} />

      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-0 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden relative">
        <Link href="/" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium transition-colors">
          ← Back
        </Link>
        <div className="h-1.5 w-full bg-[#D4AF37]" />
        
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 pt-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot block" />
              Open Source · Free Forever
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support the Work</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scan, pay, keep the project alive.</p>
          </div>

          {/* Amount Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {["49", "99", "199"].map((val) => (
              <button
                key={val}
                onClick={() => { setIsCustom(false); setAmount(val); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!isCustom && amount === val ? 'bg-[#D4AF37] text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                ₹{val}
              </button>
            ))}
            <button
              onClick={() => { setIsCustom(true); if(!customAmount) setCustomAmount("500"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isCustom ? 'bg-[#D4AF37] text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Custom
            </button>
          </div>

          {/* Custom Amount Input */}
          {isCustom && (
            <div className="flex justify-center mt-2">
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Amount"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center pt-2">
            <div className="p-3 bg-white rounded-xl breathing-glow-box">
              {qrUrl ? (
                <img src={qrUrl} alt="Donate QR" className="w-48 h-48 rendering-pixelated" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg" />
              )}
            </div>
            <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              ₹{isCustom ? (customAmount || "0") : amount}
            </p>
          </div>

          {/* UPI ID Row */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-sm text-slate-600 dark:text-slate-300 truncate">{UPI_ID}</span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          {/* Deep Links */}
          <div className="space-y-3 pt-2 md:hidden">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span>or pay via app</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "GPay", color: "#4285F4", letter: "G" },
                { name: "PhonePe", color: "#5F259F", letter: "P" },
                { name: "Paytm", color: "#00BAF2", letter: "T" },
                { name: "BHIM", color: "#FF7A00", letter: "B" },
              ].map((app) => (
                <a
                  key={app.name}
                  href={getUpiUrl()}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: app.color }}>
                    {app.letter}
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{app.name}</span>
                </a>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-400">Opens on mobile devices</p>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://github.com/byrohithreddy/Free-pi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Star
            </a>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
