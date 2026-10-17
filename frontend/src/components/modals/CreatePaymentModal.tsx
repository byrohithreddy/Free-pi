import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePayment, getListPaymentsQueryKey, getGetMerchantStatsQueryKey } from "@workspace/api-client-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, ExternalLink, QrCode, Check, RefreshCw, Sparkles, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const createPaymentSchema = z.object({
  amount: z.coerce.number().min(1, { message: "Amount must be at least ₹1" }).max(100000, { message: "Amount cannot exceed ₹100,000" }),
  orderId: z.string().min(1, { message: "Order ID is required" }),
  description: z.string().optional(),
  customerPhone: z.string().optional(),
});

type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

interface CreatePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePaymentModal({ open, onOpenChange }: CreatePaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreatePayment();
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

  const form = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: undefined,
      orderId: generateOrderId(),
      description: "",
      customerPhone: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        form.reset({
          amount: undefined,
          orderId: generateOrderId(),
          description: "",
          customerPhone: "",
        });
        setCreatedUrl(null);
        setCopied(false);
      }, 200);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (data: CreatePaymentFormValues) => {
    const amountInPaise = Math.round(data.amount * 100);
    
    createMutation.mutate(
      {
        data: {
          ...data,
          amount: amountInPaise,
        },
      },
      {
        onSuccess: (res) => {
          setCreatedUrl(res.paymentUrl);
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Link Ready",
            description: "UPI payment intent created successfully.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Creation Failed",
            description: err?.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Customer payment URL copied to clipboard.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                {createdUrl ? "Payment Link Created!" : "New Payment Request"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {createdUrl 
                  ? "Share this direct UPI checkout URL with your buyer"
                  : "Generate a hosted UPI intent link & QR code for your customer"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-5 py-2">
            <div className="p-5 rounded-2xl bg-muted/30 border border-border flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Hosted Checkout Online</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers can scan QR, launch Google Pay/PhonePe, or submit bank UTR references.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-1">
                <Input 
                  readOnly 
                  value={createdUrl} 
                  className="font-mono text-xs h-10 rounded-xl bg-background select-all" 
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard} 
                  className="h-10 w-10 shrink-0 rounded-xl"
                  title="Copy link"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon" 
                  asChild 
                  className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  title="Open checkout"
                >
                  <a href={createdUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={() => handleOpenChange(false)} 
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Amount (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="1" 
                            placeholder="0.00" 
                            disabled={createMutation.isPending} 
                            className="pl-7 h-10 rounded-xl bg-background font-bold tabular-nums" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold">Order ID</FormLabel>
                        <button
                          type="button"
                          onClick={() => form.setValue("orderId", generateOrderId())}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Regen
                        </button>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="ORD-12345" 
                          disabled={createMutation.isPending} 
                          className="h-10 rounded-xl font-mono text-xs bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Note / Memo (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Website development milestone 1" 
                        disabled={createMutation.isPending} 
                        className="h-10 rounded-xl bg-background text-xs" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)} 
                  disabled={createMutation.isPending}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Generate Payment URL</span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
