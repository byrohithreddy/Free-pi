import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Heart, 
  Sparkles, 
  ExternalLink, 
  Share2, 
  Star,
  Coffee,
  Zap,
  Rocket,
  Crown,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const UPI_ID = "mushkerohithreddy@upi";

const PRESET_TIERS = [
  { amount: "49", label: "Chai & Fuel", icon: Coffee },
  { amount: "99", label: "Server Host", icon: Zap },
  { amount: "199", label: "Core Supporter", icon: Rocket },
  { amount: "499", label: "Hero Sponsor", icon: Crown },
];

export default function Donate() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("99");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const finalAmount = isCustom ? (customAmount || "0") : amount;
    
    const updateQR = () => {
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Rohith&am=${finalAmount}&cu=INR&tn=Free+Pi+Contribution`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&margin=1`);
    };

    if (isCustom) {
      timeoutId = setTimeout(updateQR, 300);
    } else {
      updateQR();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [amount, customAmount, isCustom]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "UPI ID copied", description: UPI_ID });
    } catch (error) {
      toast({
        title: "Couldn't copy the UPI ID",
        description: error instanceof Error ? error.message : "Copy it manually from the screen.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Free Pi — Open-source UPI payments",
          text: "Open-source UPI payment pages with no transaction fees.",
          url: window.location.origin,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast({
          title: "Couldn't share Free Pi",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Project link copied", description: window.location.origin });
    } catch (error) {
      toast({
        title: "Couldn't copy the project link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const currentDisplayAmount = isCustom ? (customAmount || "0") : amount;
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=Rohith&am=${currentDisplayAmount}&cu=INR&tn=Free+Pi+Contribution`;

  return (
    <main className="donate-page min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between z-10">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-card/60 border border-border backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to App</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span>Open Source Forever</span>
        </div>
      </div>

      {/* Main Donation Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="donate-panel w-full max-w-lg rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8 relative z-10 overflow-hidden"
      >
        <div className="donate-heading text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner mb-1">
            <Heart className="h-6 w-6 fill-primary/30 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Support Free Pi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
            100% peer-to-peer. Zero platform commissions. Help fund server infrastructure & ongoing development.
          </p>
        </div>

        {/* Tier Buttons */}
        <div className="donate-tiers grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {PRESET_TIERS.map((tier) => {
            const isSelected = !isCustom && amount === tier.amount;
            const Icon = tier.icon;
            return (
              <button
                key={tier.amount}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setIsCustom(false);
                  setAmount(tier.amount);
                }}
                className={`
                  p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                  ${isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                    : "bg-muted/30 border-border hover:bg-muted/70 text-foreground"}
                `}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                <span className="text-sm font-extrabold tabular-nums">₹{tier.amount}</span>
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  {tier.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Amount Button / Input Toggle */}
        <div className="donate-custom mb-6">
          {!isCustom ? (
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                if (!customAmount) setCustomAmount("250");
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Choose Custom Amount</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                <input
                  type="number"
                  aria-label="Custom donation amount in rupees"
                  min="1"
                  max="100000"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  autoFocus
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-muted/40 border border-primary/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCustom(false);
                  setAmount("99");
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-10"
              >
                Presets
              </Button>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="donate-code flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border/80 mb-6">
          <div className="p-3 bg-white rounded-2xl shadow-xl relative group">
            {qrUrl ? (
              <img 
                src={qrUrl} 
                alt={`UPI payment QR code for ₹${currentDisplayAmount}`}
                className="w-48 h-48 rounded-xl object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          <div className="text-center mt-3">
            <p className="text-2xl font-black text-foreground tabular-nums">
              ₹{currentDisplayAmount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)
            </p>
          </div>
        </div>

        {/* UPI ID Copy Bar */}
        <div className="donate-recipient flex items-center justify-between p-3 rounded-xl bg-card border border-border mb-4">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Recipient UPI ID</span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-foreground truncate block">{UPI_ID}</span>
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            className="h-8.5 px-3 rounded-lg text-xs font-bold gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        {/* Mobile Direct Pay Trigger */}
        <div className="donate-mobile-pay mb-6">
          <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2">
            <a href={upiIntentUrl}>
              <Smartphone className="h-4 w-4" />
              <span>Open in UPI App (Mobile)</span>
            </a>
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="donate-footer-actions grid grid-cols-2 gap-3 pt-3 border-t border-border/60">
          <Button asChild variant="outline" className="rounded-xl h-10 gap-2 text-xs font-bold">
            <a href="https://github.com/byrohithreddy/Free-pi" target="_blank" rel="noreferrer">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Star on GitHub</span>
            </a>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleShare}
            className="rounded-xl h-10 gap-2 text-xs font-bold"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Project</span>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
