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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ExternalLink, Copy, CheckCircle, XCircle } from "lucide-react";
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
  }).format(paise / 100);
};

export function TransactionDetailModal({ transactionId, open, onOpenChange }: TransactionDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [utrNumber, setUtrNumber] = useState("");
  const [notes, setNotes] = useState("");

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
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (!transaction) return;
    
    confirmMutation.mutate(
      {
        transactionId: transaction.transactionId,
        data: {
          utrNumber: utrNumber || undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (updatedTx) => {
          queryClient.setQueryData(getGetPaymentQueryKey(transaction.transactionId), updatedTx);
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Confirmed",
            description: "Transaction marked as confirmed.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Action Failed",
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
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (updatedTx) => {
          queryClient.setQueryData(getGetPaymentQueryKey(transaction.transactionId), updatedTx);
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Rejected",
            description: "Transaction marked as rejected.",
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
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3" /> Confirmed</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
    }
  };

  const isPending = transaction?.status === "PENDING";
  const isProcessing = confirmMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
            {transaction && getStatusBadge(transaction.status)}
          </DialogTitle>
          <DialogDescription>
            {transaction?.transactionId}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !transaction ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Amount</div>
              <div className="text-4xl font-bold text-primary tracking-tight">
                {formatRupees(transaction.amount)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                Order: <span className="font-mono text-foreground">{transaction.orderId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Created At</div>
                <div className="font-medium">{format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}</div>
              </div>
              {transaction.confirmedAt && (
                <div>
                  <div className="text-muted-foreground mb-1">Confirmed At</div>
                  <div className="font-medium">{format(new Date(transaction.confirmedAt), 'MMM d, yyyy h:mm a')}</div>
                </div>
              )}
              {transaction.customerName && (
                <div>
                  <div className="text-muted-foreground mb-1">Customer</div>
                  <div className="font-medium">{transaction.customerName}</div>
                </div>
              )}
              {transaction.description && (
                <div className="col-span-2">
                  <div className="text-muted-foreground mb-1">Description</div>
                  <div className="font-medium">{transaction.description}</div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Payment Link</Label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/pay/${transaction.transactionId}`);
                    toast({ description: "Link copied" });
                  }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <a href={`/pay/${transaction.transactionId}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
              <Input readOnly value={`${window.location.origin}/pay/${transaction.transactionId}`} className="h-8 text-xs font-mono bg-muted/30" />
            </div>

            {isPending && (
              <div className="space-y-4 pt-4 border-t border-border bg-muted/10 p-4 rounded-lg border mt-2">
                <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20 mb-4">
                  <AlertTriangle className="h-4 w-4 stroke-amber-600" />
                  <AlertDescription className="font-medium">
                    Warning: Verify the payment in your bank app before confirming. This action cannot be undone.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="utr">UTR / Reference Number (Optional)</Label>
                    <Input 
                      id="utr" 
                      placeholder="e.g. 123456789012" 
                      value={utrNumber} 
                      onChange={(e) => setUtrNumber(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="notes">Internal Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Verified via SMS alert" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none h-16"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                  >
                    {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Confirm Received
                  </Button>
                </div>
              </div>
            )}

            {!isPending && (transaction.utrNumber || transaction.merchantNotes) && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-medium">Resolution Details</h4>
                {transaction.utrNumber && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">UTR Number</div>
                    <div className="font-mono text-sm bg-muted/50 p-2 rounded">{transaction.utrNumber}</div>
                  </div>
                )}
                {transaction.merchantNotes && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm bg-muted/50 p-2 rounded">{transaction.merchantNotes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
