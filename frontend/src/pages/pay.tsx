import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useGetPublicPayment, getGetPublicPaymentQueryKey, useSaveCustomerDetails, useSubmitCustomerUtr } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ScanLine, 
  Download, 
  Send, 
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Copy,
  Check,
  Clock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);

function buildAppUrls(genericUrl: string) {
  const params = genericUrl.replace(/^upi:\/\/pay\?/, "");
  const base = `intent://pay?${params}#Intent;scheme=upi`;
  return {
    gpay:     `${base};package=com.google.android.apps.nbu.paisa.user;end`,
    phonepe:  `${base};package=com.phonepe.app;end`,
    paytm:    `${base};package=net.one97.paytm;end`,
    bhim:     `${base};package=in.org.npci.upiapp;end`,
    mobikwik: `${base};package=com.mobikwik_new;end`,
  };
}

const UPI_APPS = [
  {
    key: "gpay" as const,
    label: "Google Pay",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" fill="#4285F4"/>
        <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.3 7.33 24 12 24z" fill="#34A853"/>
        <path d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.43l4.01-3.14z" fill="#FBBC05"/>
        <path d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.27 6.57l4.01 3.14c.95-2.83 3.6-4.94 6.72-4.94z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    key: "phonepe" as const,
    label: "PhonePe",
    logo: (
      <div className="h-5 w-5 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-bold text-xs">
        पे
      </div>
    ),
  },
  {
    key: "paytm" as const,
    label: "Paytm",
    logo: (
      <div className="h-5 w-5 rounded-md bg-[#002e6e] flex items-center justify-center text-[#00baf2] font-black text-[9px]">
        PTM
      </div>
    ),
  },
  {
    key: "bhim" as const,
    label: "BHIM",
    logo: (
      <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-[9px]">
        BH
      </div>
    ),
  },
];

function UtrForm({
  transactionId,
  customerName,
  customerEmail,
  onSuccess,
}: {
  transactionId: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: (utr: string) => void;
}) {
  const [utr, setUtr] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: submitUtr, isPending: loading } = useSubmitCustomerUtr({
    mutation: {
      onSuccess: (_data, variables) => {
        setSubmitted(true);
        onSuccess(variables.data.utrNumber);
      },
      onError: (err: any) => {
        setError(err.data?.error ?? "Unable to submit. Please try again.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = utr.trim();
    if (trimmed.length < 6) {
      setError("UTR reference must be at least 6 characters.");
      return;
    }

    setError(null);
    const payload = {
      utrNumber: trimmed,
      ...(customerName?.trim() ? { customerName: customerName.trim() } : {}),
      ...(customerEmail?.trim() ? { customerEmail: customerEmail.trim() } : {}),
    };

    submitUtr({
      transactionId,
      data: payload,
    });
  };

  if (submitted) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground">Payment Proof Submitted</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The merchant will match your 12-digit UTR and complete confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <span>Submit Payment Proof (UTR)</span>
        </h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Locate the 12-digit UPI Transaction ID or Bank Reference (UTR) in your payment receipt and enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
            placeholder="e.g. 408512345678"
            maxLength={22}
            className="h-11 rounded-xl font-mono text-sm uppercase tracking-wider bg-muted/40 border-border"
          />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono px-1">
            <span>Minimum 6 characters</span>
            <span>{utr.length}/22</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || utr.trim().length < 6}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
        >
          {loading ? "Submitting..." : "Verify & Confirm Payment"}
        </Button>
      </form>

      {error && <p className="text-xs font-semibold text-rose-500 text-center">{error}</p>}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "Customer" },
    { num: 2, label: "Scan & Pay" },
    { num: 3, label: "Verify UTR" },
  ];

  return (
    <div className="flex items-center justify-between gap-2 px-1 pb-2">
      {steps.map((s, idx) => {
        const completed = step > s.num;
        const active = step === s.num;
        return (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-1.5">
              <span
                className={`
                  flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all
                  ${completed
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "bg-muted text-muted-foreground"}
                `}
              >
                {completed ? "✓" : s.num}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 ${completed ? "bg-emerald-500/50" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Pay() {
  const params = useParams<{ transactionId: string }>();
  const [isMobile, setIsMobile] = useState(false);
  const [submittedUtr, setSubmittedUtr] = useState<string | null>(null);
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase()));
  }, []);

  const { data: payment, isLoading, isError } = useGetPublicPayment(params.transactionId || "", {
    query: {
      enabled: !!params.transactionId,
      queryKey: params.transactionId ? getGetPublicPaymentQueryKey(params.transactionId) : ["none"],
      retry: 1,
      refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 4000 : false),
    },
  });

  const { mutate: saveCustomerDetails, isPending: savingDetails } = useSaveCustomerDetails({
    mutation: {
      onSuccess: (_data, variables) => {
        setCustomerName(variables.data.customerName);
        setCustomerEmail(variables.data.customerEmail);
        setDetailsError(null);
        setStep(2);
      },
      onError: (err: any) => {
        if (err?.status === 404) {
          setDetailsError(null);
          setStep(2);
          return;
        }
        setDetailsError(err.data?.error ?? "Unable to save your details. Please try again.");
      },
    },
  });

  useEffect(() => {
    const paymentStatus = payment?.status as string | undefined;
    if (paymentStatus === "UTR_SUBMITTED" || payment?.utrNumber) {
      setStep(3);
    }
  }, [payment?.status, payment?.utrNumber]);

  useEffect(() => {
    if (!payment) return;
    if (payment.customerName && !customerName) setCustomerName(payment.customerName);
    if (payment.customerEmail && !customerEmail) setCustomerEmail(payment.customerEmail);
  }, [payment, customerName, customerEmail]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();
    const nameValidationError = trimmedName.length < 2 ? "Please enter at least 2 characters for full name." : null;
    const emailValidationError = !validateEmail(trimmedEmail) ? "Please enter a valid email address." : null;

    setNameError(nameValidationError);
    setEmailError(emailValidationError);

    if (nameValidationError || emailValidationError) {
      return;
    }

    if (!payment?.transactionId) {
      setDetailsError("Payment data is still initializing. Please retry.");
      return;
    }

    saveCustomerDetails({
      transactionId: payment.transactionId,
      data: {
        customerName: trimmedName,
        customerEmail: trimmedEmail,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass-card p-8 rounded-3xl text-center space-y-4">
          <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-48 w-full rounded-2xl mt-4" />
        </Card>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass-card p-8 rounded-3xl text-center space-y-4 border-rose-500/30">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">Payment Request Not Found</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            This payment link is invalid, expired, or has already been completed.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // Confirmed Screen
  if (payment.status === "CONFIRMED") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <Card className="glass-card rounded-3xl border-emerald-500/30 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-black text-foreground pt-2">Transfer Settled!</h2>
              <p className="text-sm text-muted-foreground">
                Your payment of <span className="font-bold text-foreground">{formatRupees(payment.amount)}</span> to {payment.merchantName} is confirmed.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 border border-border text-xs space-y-2.5 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Order ID</span>
                <span className="font-mono font-bold text-foreground">{payment.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Transaction ID</span>
                <span className="font-mono font-bold text-foreground">{payment.transactionId}</span>
              </div>
              {payment.utrNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Bank UTR</span>
                  <span className="font-mono font-bold text-emerald-500">{payment.utrNumber}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Rejected Screen
  if (payment.status === "REJECTED") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass-card rounded-3xl border-rose-500/30 p-6 sm:p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
            <XCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">Payment Declined</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            The merchant did not confirm this transaction. If you were debited, please contact {payment.merchantName}.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const hasSubmitted = !!submittedUtr || !!payment.utrNumber;
  const currentUtr = submittedUtr || payment.utrNumber;
  const appUrls = buildAppUrls(payment.upiIntentUrl);

  if (hasSubmitted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <Card className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-primary/30">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <Clock className="h-7 w-7 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Verification In Progress</h3>
              <p className="text-xs text-muted-foreground">
                Your payment proof has been transmitted to {payment.merchantName}. This page auto-refreshes when confirmed.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 border border-border text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Amount Due</span>
                <span className="text-lg font-extrabold text-primary tabular-nums">{formatRupees(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Submitted UTR</span>
                <span className="font-mono font-bold text-foreground">{currentUtr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Order Ref</span>
                <span className="font-mono text-muted-foreground">{payment.orderId}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border text-center">
              <p className="text-[11px] font-mono text-muted-foreground">
                Keep this window open or bookmark this link to verify your order status.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 font-sans text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-[420px]"
      >
        <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden border-border/80">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400" />

          <CardHeader className="text-center pb-3 pt-6 space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 text-muted-foreground text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Free Pi Peer-to-Peer Checkout</span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Payment to</p>
              <h2 className="text-xl font-black text-foreground truncate px-2">{payment.merchantName}</h2>
            </div>

            <div className="py-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-primary tabular-nums">
                {formatRupees(payment.amount)}
              </span>
            </div>

            {payment.description && (
              <p className="text-xs text-muted-foreground italic px-4">"{payment.description}"</p>
            )}
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            <StepIndicator step={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <p className="text-xs font-bold text-foreground">Enter payer details</p>
                    <form onSubmit={handleStep1Submit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                        <Input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your Name"
                          disabled={savingDetails}
                          className="h-10 rounded-xl bg-background"
                        />
                        {nameError && <p className="text-[11px] text-rose-500 font-medium">{nameError}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="name@example.com"
                          disabled={savingDetails}
                          className="h-10 rounded-xl bg-background"
                        />
                        {emailError && <p className="text-[11px] text-rose-500 font-medium">{emailError}</p>}
                      </div>

                      <Button
                        type="submit"
                        disabled={savingDetails}
                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                      >
                        <span>{savingDetails ? "Processing..." : "Continue to Payment"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      {detailsError && <p className="text-xs text-rose-500 text-center font-semibold">{detailsError}</p>}
                    </form>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  {/* QR Display */}
                  <div className="flex flex-col items-center justify-center p-5 bg-muted/20 rounded-2xl border border-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-3">
                      <ScanLine className="h-4 w-4 text-primary" />
                      <span>Scan with any UPI App</span>
                    </div>

                    <div className="relative bg-white p-3 rounded-2xl shadow-lg border border-border group">
                      <img 
                        src={payment.qrCodeDataUrl} 
                        alt="UPI Payment QR Code" 
                        className="w-48 h-48 rounded-xl object-contain" 
                      />
                      <a
                        href={payment.qrCodeDataUrl}
                        download={`upi-qr-${payment.orderId}.png`}
                        className="absolute -bottom-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-card border border-border shadow-md text-foreground hover:text-primary transition-all"
                        title="Download QR"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Mobile Direct Pay Trigger */}
                  <div className="space-y-2">
                    <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/20">
                      <a href={payment.upiIntentUrl}>
                        <Smartphone className="h-4 w-4" />
                        <span>Pay via UPI App (GPay, PhonePe, Paytm)</span>
                      </a>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(3)}
                      className="w-full h-10 rounded-xl text-xs font-bold border-border"
                    >
                      <span>I have completed payment → Enter UTR</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to QR Code</span>
                  </button>

                  <UtrForm
                    transactionId={payment.transactionId}
                    customerName={customerName}
                    customerEmail={customerEmail}
                    onSuccess={(utr) => {
                      setSubmittedUtr(utr);
                      setSubmissionTime(new Date());
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Order: #{payment.orderId}</span>
              <span>Txn: #{payment.transactionId.slice(-8)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
