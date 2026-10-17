import { useState } from "react";
import { format } from "date-fns";
import { 
  useConfirmPayment, 
  useRejectPayment, 
  useGetPayment,
  getGetPaymentQueryKey,
  getListPaymentsQueryKey,
  getGetMerchantStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Check, 
  Clock,
  ShieldCheck,
  Receipt
} from "lucide-react";
import type { Transaction } from "@workspace/api-client-react";

interface TransactionDetailModalProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatRupees = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100);
};

export function TransactionDetailModal({ transactionId, open, onOpenChange }: TransactionDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [utrNumber, setUtrNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: transaction, isLoading } = useGetPayment(transactionId || "", {
    query: {
      enabled: !!transactionId && open,
      queryKey: transactionId ? getGetPaymentQueryKey(transactionId) : ["none"],
    }
  });

  const confirmMutation = useConfirmPayment();
  const rejectMutation = useRejectPayment();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUtrNumber("");
      setNotes("");
      setCopiedLink(false);
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (!transaction) return;
    
    confirmMutation.mutate(
      {
        transactionId: transaction.transactionId,
        data: {
          utrNumber: utrNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: (updatedTx) => {
          queryClient.setQueryData(getGetPaymentQueryKey(transaction.transactionId), updatedTx);
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Confirmed",
            description: "Transaction settled and marked as confirmed.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Confirmation Failed",
            description: err?.message || "Could not confirm payment.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleReject = () => {
    if (!transaction) return;
    
    rejectMutation.mutate(
      {
        transactionId: transaction.transactionId,
        data: {
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: (updatedTx) => {
          queryClient.setQueryData(getGetPaymentQueryKey(transaction.transactionId), updatedTx);
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Rejected",
            description: "Transaction has been declined.",
            variant: "destructive",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Action Failed",
            description: err?.message || "Could not reject payment.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold px-2.5 py-0.5 text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold px-2.5 py-0.5 text-xs gap-1">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold px-2.5 py-0.5 text-xs gap-1">
            <Clock className="h-3 w-3 animate-pulse" />
            <span>Pending Review</span>
          </Badge>
        );
    }
  };

  const isPending = transaction?.status === "PENDING";
  const isProcessing = confirmMutation.isPending || rejectMutation.isPending;
  const paymentLink = transaction ? `${window.location.origin}/pay/${transaction.transactionId}` : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Receipt className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Transaction Details
              </DialogTitle>
            </div>
            {transaction && getStatusBadge(transaction.status)}
          </div>
          <DialogDescription className="text-xs font-mono text-muted-foreground pt-1">
            ID: {transaction?.transactionId}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !transaction ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Retrieving payment record...</span>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Amount Hero Card */}
            <div className="flex flex-col items-center justify-center p-5 bg-muted/30 border border-border rounded-2xl">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Order Amount</span>
              <div className="text-4xl font-black text-foreground tabular-nums my-1">
                {formatRupees(transaction.amount)}
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Ref Order: <span className="text-foreground">{transaction.orderId}</span>
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/80 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold block mb-0.5">Created At</span>
                <span className="font-bold text-foreground">
                  {format(new Date(transaction.createdAt), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground font-semibold block mb-0.5">Status Updated</span>
                <span className="font-bold text-foreground">
                  {transaction.confirmedAt 
                    ? format(new Date(transaction.confirmedAt), 'MMM d, yyyy • h:mm a')
                    : 'Pending verification'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground font-semibold block mb-0.5">Customer Name</span>
                <span className="font-bold text-foreground truncate block">
                  {transaction.customerName || "Not provided"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground font-semibold block mb-0.5">Customer Email</span>
                <span className="font-bold text-foreground truncate block">
                  {transaction.customerEmail || "Not provided"}
                </span>
              </div>

              {transaction.description && (
                <div className="col-span-2 pt-2 border-t border-border/60">
                  <span className="text-muted-foreground font-semibold block mb-0.5">Memo / Description</span>
                  <span className="text-foreground">{transaction.description}</span>
                </div>
              )}
            </div>

            {/* Shareable Payment Link */}
            <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Customer Checkout URL</span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild>
                    <a href={paymentLink} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
              <Input readOnly value={paymentLink} className="h-8 text-xs font-mono bg-muted/40" />
            </div>

            {/* Resolution Details if settled */}
            {!isPending && (transaction.utrNumber || transaction.merchantNotes) && (
              <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                  Verification Audit
                </span>
                {transaction.utrNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">Matched Bank UTR</span>
                    <span className="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {transaction.utrNumber}
                    </span>
                  </div>
                )}
                {transaction.merchantNotes && (
                  <div>
                    <span className="text-muted-foreground font-semibold block mb-1">Merchant Notes</span>
                    <p className="p-2 rounded-lg bg-background text-foreground font-mono text-[11px]">
                      {transaction.merchantNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pending Action Controls */}
            {isPending && (
              <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-primary/20">
                <Alert className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-2.5">
                  <AlertTriangle className="h-4 w-4 stroke-amber-500" />
                  <AlertDescription className="text-xs font-semibold leading-relaxed">
                    Always confirm credit in your bank app before confirming this request.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="utr" className="text-xs font-semibold">Bank UTR Reference (Optional)</Label>
                    <Input 
                      id="utr" 
                      placeholder="e.g. 408512345678" 
                      value={utrNumber} 
                      onChange={(e) => setUtrNumber(e.target.value)}
                      disabled={isProcessing}
                      className="h-9 rounded-xl font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-xs font-semibold">Internal Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Verified against bank SMS alert" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none h-16 rounded-xl bg-background text-xs"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="h-10 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    Reject Payment
                  </Button>
                  <Button 
                    className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                  >
                    {confirmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>Confirm Received</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
