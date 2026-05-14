import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useGetPublicPayment, getGetPublicPaymentQueryKey, useSaveCustomerDetails, useSubmitCustomerUtr } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, ScanLine, Download, Send } from "lucide-react";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);

function buildAppUrls(genericUrl: string) {
  const params = genericUrl.replace(/^upi:\/\/pay\?/, "");
  const base = `intent://pay?${params}#Intent;scheme=upi`;
  return {
    gpay:     `${base};package=com.google.android.apps.nbu.paisa.user;end`,
    mobikwik: `${base};package=com.mobikwik_new;end`,
  };
}

const UPI_APPS = [
  {
    key: "gpay" as const,
    label: "GooglePay",
    logo: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none">
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" fill="#4285F4"/>
        <path d="M34.6 24.2c0-.7-.06-1.37-.17-2H24v3.79h5.96a5.1 5.1 0 01-2.21 3.34v2.77h3.58c2.1-1.93 3.27-4.77 3.27-7.9z" fill="#4285F4"/>
        <path d="M24 35c2.97 0 5.46-.98 7.28-2.67l-3.58-2.77c-.98.66-2.23 1.05-3.7 1.05-2.84 0-5.25-1.92-6.11-4.5h-3.7v2.86A11 11 0 0024 35z" fill="#34A853"/>
        <path d="M17.89 26.11A6.6 6.6 0 0117.55 24c0-.73.13-1.44.34-2.11v-2.86h-3.7A11 11 0 0013 24c0 1.77.43 3.45 1.19 4.97l3.7-2.86z" fill="#FBBC05"/>
        <path d="M24 17.5c1.6 0 3.04.55 4.17 1.63l3.13-3.13C29.46 14.19 26.97 13 24 13a11 11 0 00-9.81 6.03l3.7 2.86c.86-2.58 3.27-4.39 6.11-4.39z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    key: "mobikwik" as const,
    label: "MobiKwik",
    logo: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none">
        <rect width="48" height="48" rx="12" fill="#F26722"/>
        <path d="M12 24h24v4H12z" fill="white"/>
        <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="3"/>
      </svg>
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
      setError("UTR must be at least 6 characters.");
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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Payment proof submitted</p>
          <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-0.5">
            The merchant will verify your UTR and confirm the payment shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <Send className="h-4 w-4" />
        Submit Payment Proof
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Enter the UTR or transaction reference number from your UPI app to confirm your payment.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
            placeholder="Enter UTR / Ref number"
            maxLength={22}
            className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{utr.length}/22</p>
        </div>
        <button
          type="submit"
          disabled={loading || utr.trim().length < 6}
          className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "…" : "Submit Payment Proof"}
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const renderPill = (index: 1 | 2 | 3, label: string) => {
    const completed = step > index;
    const active = step === index;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${completed ? "bg-emerald-600 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
        >
          {completed ? "✓" : index}
        </span>
        <span className={`text-[11px] font-medium ${active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {renderPill(1, "Details")}
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      {renderPill(2, "Payment")}
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      {renderPill(3, "Confirm")}
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
  const [stepReady, setStepReady] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase()));
  }, []);

  const { data: payment, isLoading, isError } = useGetPublicPayment(params.transactionId || "", {
    query: {
      enabled: !!params.transactionId,
      queryKey: params.transactionId ? getGetPublicPaymentQueryKey(params.transactionId) : ["none"],
      retry: 1,
      refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 5000 : false),
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

  useEffect(() => {
    setStepReady(false);
    const timeout = window.setTimeout(() => setStepReady(true), 10);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();
    const nameValidationError = trimmedName.length < 2 ? "Full Name must be at least 2 characters." : null;
    const emailValidationError = !validateEmail(trimmedEmail) ? "Enter a valid email address." : null;

    setNameError(nameValidationError);
    setEmailError(emailValidationError);

    if (nameValidationError || emailValidationError) {
      return;
    }

    if (!payment?.transactionId) {
      setDetailsError("Payment details are still loading. Please try again.");
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

  const stepTransitionStyle = {
    opacity: stepReady ? 1 : 0,
    transform: stepReady ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Payment Not Found</CardTitle>
            <CardDescription>This payment link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (payment.status === "CONFIRMED") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-500">Payment Successful</CardTitle>
            <CardDescription className="text-base text-green-600/80 dark:text-green-400/80">
              Your payment of <span className="font-bold">{formatRupees(payment.amount)}</span> to {payment.merchantName} was confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-green-100 dark:border-green-900/30 text-sm space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-medium font-mono text-slate-900 dark:text-slate-100">{payment.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="font-medium font-mono text-slate-900 dark:text-slate-100">{payment.transactionId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payment.status === "REJECTED") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-xl border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700 dark:text-red-500">Payment Rejected</CardTitle>
            <CardDescription className="text-base text-red-600/80 dark:text-red-400/80">
              The merchant declined this payment request. Please contact {payment.merchantName} for support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasSubmitted = !!submittedUtr || !!payment.utrNumber;
  const currentUtr = submittedUtr || payment.utrNumber;
  
  // Robust date parsing
  const getValidDate = (dateStr: any) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const initiatedDate = getValidDate(payment.createdAt);
  const displayTime = submissionTime || getValidDate(payment.updatedAt) || initiatedDate;

  if (hasSubmitted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl">
          <div className="h-2 w-full bg-[#D4AF37]" />
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#D4AF37]" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Thank You!</CardTitle>
            <CardDescription className="text-base text-slate-500 dark:text-slate-400">
              Your payment proof has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-sm text-slate-500">Amount Paid</span>
                <span className="text-xl font-bold text-[#D4AF37]">{formatRupees(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-sm text-slate-500">UTR Number</span>
                <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{currentUtr}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-sm text-slate-500">Initiated On</span>
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 text-right">
                  {initiatedDate?.toLocaleString('en-IN', { 
                    day: '2-digit', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit', hour12: true 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Proof Submitted</span>
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 text-right">
                  {displayTime?.toLocaleString('en-IN', { 
                    day: '2-digit', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit', hour12: true 
                  })}
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                Your payment will be confirmed soon. To check the status of your payment, please visit this page again.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl relative group">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status Check URL</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all select-all">
                  {window.location.href}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appUrls = buildAppUrls(payment.upiIntentUrl);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f9fa] dark:bg-[#0f172a] p-4 font-sans">
      <Card className="w-full max-w-[400px] shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-white/10 rounded-2xl">
        <div className="h-2 w-full bg-[#D4AF37]" />

        <CardHeader className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Secure Payment</span>
          </div>
          <CardTitle className="text-xl font-medium text-slate-700 dark:text-slate-300">Paying</CardTitle>
          <div className="text-2xl font-bold text-slate-900 dark:text-white truncate px-4">
            {payment.merchantName}
          </div>
          <div className="text-5xl font-extrabold text-[#D4AF37] tracking-tight py-3 drop-shadow-sm">
            {formatRupees(payment.amount)}
          </div>
          {payment.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{payment.description}"</p>
          )}
        </CardHeader>

        <CardContent className="space-y-5 pb-8">
          <div key={step} style={stepTransitionStyle} className="space-y-5">
            <StepIndicator step={step} />

            {step === 1 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Enter your details to continue</p>
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={savingDetails}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                      />
                      {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={savingDetails}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                      />
                      {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={savingDetails}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 text-sm font-semibold transition"
                    >
                      {savingDetails ? "Saving..." : "Continue to Payment →"}
                    </button>
                    {detailsError && <p className="text-xs text-red-500">{detailsError}</p>}
                  </form>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hi {customerName || "there"}, complete your payment below</p>
                </div>

                <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
                    <ScanLine className="h-4 w-4" />
                    Scan to Pay
                  </div>
                  <div className="relative bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <img src={payment.qrCodeDataUrl} alt="UPI QR Code" className="w-48 h-48 rendering-pixelated" />
                    <a
                      href={payment.qrCodeDataUrl}
                      download={`qr-${payment.transactionId}.png`}
                      className="absolute -bottom-3 -right-3 flex items-center justify-center h-8 w-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all"
                      title="Download QR Code"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-5 max-w-[200px] leading-relaxed">
                    Scan with any UPI app to complete payment
                  </p>
                </div>

                {isMobile && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      <span>or open directly in</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex justify-center gap-2">
                      {UPI_APPS.map((app) => (
                        <a
                          key={app.key}
                          href={appUrls[app.key]}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:shadow-md active:scale-95 transition-all text-center"
                        >
                          {app.logo}
                          <span className="text-[11px] font-medium leading-none">{app.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 text-sm font-semibold transition"
                >
                  I have paid → Enter UTR
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  ← Back
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
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between">
              <span>Order ID: <span className="font-mono">{payment.orderId}</span></span>
              <span>Ref: <span className="font-mono">{payment.transactionId.slice(-6)}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
