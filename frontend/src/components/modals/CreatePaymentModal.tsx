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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, ExternalLink, QrCode } from "lucide-react";

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

  const form = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: undefined,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      description: "",
      customerPhone: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        form.reset({
          amount: undefined,
          orderId: `ORD-${Date.now().toString().slice(-6)}`,
          description: "",
          customerPhone: "",
        });
        setCreatedUrl(null);
      }, 200);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (data: CreatePaymentFormValues) => {
    // Convert Rupee to Paise (1 Rupee = 100 Paise)
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
          
          // Invalidate queries to refresh lists
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
          
          toast({
            title: "Payment Link Created",
            description: "Successfully generated UPI payment request.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create payment",
            description: err?.message || "An error occurred.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      toast({
        title: "Copied to clipboard",
        description: "Payment link copied.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{createdUrl ? "Payment Link Ready" : "Create Payment Request"}</DialogTitle>
          <DialogDescription>
            {createdUrl 
              ? "Share this link with your customer to collect payment via UPI."
              : "Generate a new UPI payment link for a customer order."}
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border">
              <QrCode className="h-16 w-16 text-primary mb-4" />
              <div className="text-sm text-center text-muted-foreground mb-4">
                Link generated successfully. Customers can pay via GPay, or any UPI app.
              </div>
              <div className="flex w-full gap-2">
                <Input readOnly value={createdUrl} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy Link">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" asChild title="Open in new tab">
                  <a href={createdUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} className="w-full">Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="1" placeholder="0.00" disabled={createMutation.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <FormControl>
                        <Input placeholder="ORD-12345" disabled={createMutation.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment for services" disabled={createMutation.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Link
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
