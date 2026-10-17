import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterMerchant } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Copy, AlertTriangle, CheckCircle2, Lock, ArrowRight, Check, Sparkles, Building, Mail, Smartphone, Key } from "lucide-react";
import { BsQrCode } from "react-icons/bs";
import { motion } from "framer-motion";

const registerSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, { message: "Invalid UPI format (e.g. yourname@oksbi)" }),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Enter a valid 10-digit Indian phone number" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterMerchant();
  const [apiKeys, setApiKeys] = useState<{ public: string; secret: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      businessName: "",
      upiId: "",
      phone: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data: data as any },
      {
        onSuccess: (res) => {
          setApiKeys({ public: res.apiKeyPublic, secret: res.apiKeySecret });
          login(res.token, res.merchant);
          toast({ title: "Account Initialized", description: "Your merchant profile has been provisioned." });
        },
        onError: (err: any) => {
          toast({
            title: "Registration Failed",
            description: err?.message || "Could not register account. Please check your inputs.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copied!", description: `${type} copied to clipboard.` });
  };

  if (apiKeys) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
          <Card className="glass-card rounded-3xl shadow-2xl border-primary/30 overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Merchant Account Ready!</h2>
              <p className="text-xs text-muted-foreground">
                Your account is active. Copy and store your API credentials now.
              </p>
            </div>

            <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-500 rounded-2xl py-3">
              <AlertTriangle className="h-4 w-4 stroke-amber-500" />
              <AlertTitle className="text-xs font-bold text-foreground">Important Secret Key Notice</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-0.5">
                The Secret Key is only displayed once and cannot be recovered if lost.
              </AlertDescription>
            </Alert>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Public API Key</label>
                <div className="flex gap-2">
                  <Input readOnly value={apiKeys.public} className="font-mono text-xs bg-muted/40 h-10 rounded-xl select-all" />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyToClipboard(apiKeys.public, "Public Key")}
                    className="h-10 w-10 shrink-0 rounded-xl"
                  >
                    {copiedKey === "Public Key" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-400 uppercase tracking-wider">Secret API Key</label>
                <div className="flex gap-2">
                  <Input readOnly value={apiKeys.secret} className="font-mono text-xs bg-muted/40 border-rose-500/30 h-10 rounded-xl select-all" />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyToClipboard(apiKeys.secret, "Secret Key")}
                    className="h-10 w-10 shrink-0 rounded-xl"
                  >
                    {copiedKey === "Secret Key" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/20" 
              onClick={() => setLocation("/dashboard")}
            >
              <span>Enter Merchant Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 py-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card rounded-3xl shadow-2xl border-border/80 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400" />

          <CardHeader className="space-y-2 text-center pt-6 pb-2">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mx-auto group">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <BsQrCode className="h-6 w-6 text-slate-950" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                Free Pi
              </span>
            </Link>

            <CardTitle className="text-base font-extrabold text-foreground pt-1">
              Create Merchant Account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Zero fees. Collect UPI payments directly to your bank account.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Business Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="e.g. Acme Studio" 
                            disabled={registerMutation.isPending} 
                            className="pl-9 h-10 rounded-xl bg-muted/40 font-medium text-xs" 
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
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Recipient UPI ID (VPA)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="merchant@okhdfcbank" 
                            disabled={registerMutation.isPending} 
                            className="pl-9 h-10 rounded-xl font-mono text-xs bg-muted/40 text-primary font-bold" 
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center justify-between">
                        <span>Mobile Number</span>
                        <span className="text-[10px] text-muted-foreground font-normal">10-digit Indian mobile</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="9876543210"
                            type="tel"
                            maxLength={10}
                            disabled={registerMutation.isPending}
                            className="pl-9 h-10 rounded-xl font-mono text-xs bg-muted/40"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Login Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="you@domain.com" 
                            type="email" 
                            disabled={registerMutation.isPending} 
                            className="pl-9 h-10 rounded-xl text-xs bg-muted/40" 
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Min 8 characters" 
                            type="password" 
                            disabled={registerMutation.isPending} 
                            className="pl-9 h-10 rounded-xl font-mono text-xs bg-muted/40" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/20 mt-2" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Complete Registration</span>
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center py-4 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
