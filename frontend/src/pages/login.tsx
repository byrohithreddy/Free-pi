import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLoginMerchant } from "@workspace/api-client-react";
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
import { Loader2, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { BsQrCode } from "react-icons/bs";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLoginMerchant();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          login(res.token, res.merchant);
          toast({ title: "Welcome Back", description: "Successfully signed in." });
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({
            title: "Authentication Failed",
            description: err?.message || "Invalid credentials. Please verify your email and password.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
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

          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mx-auto group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <BsQrCode className="h-6 w-6 text-slate-950" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                Free Pi
              </span>
            </Link>

            <CardTitle className="text-base font-extrabold text-foreground pt-2">
              Sign in to Merchant Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your registered credentials to access transactions and analytics
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="merchant@example.com" 
                            type="email" 
                            disabled={loginMutation.isPending} 
                            className="pl-9 h-11 rounded-xl bg-muted/40 font-medium text-xs" 
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            disabled={loginMutation.isPending} 
                            className="pl-9 h-11 rounded-xl bg-muted/40 text-xs font-mono" 
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>Sign In to Dashboard</span>
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center py-4 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              New to Free Pi?{" "}
              <Link href="/register" className="text-primary hover:underline font-bold">
                Create merchant account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
