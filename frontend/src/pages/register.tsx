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
import { Loader2, Copy, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { BsQrCode } from "react-icons/bs";

const registerSchema = z.object({
  businessName: z.string().min(2, { message: "Business name is required" }),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, { message: "Invalid UPI ID format (e.g., name@bank)" }),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Enter a valid 10-digit Indian mobile number" }),
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
          toast({ title: "Registration successful", description: "Your account has been created." });
        },
        onError: (err: any) => {
          toast({
            title: "Registration failed",
            description: err?.message || "Could not create account. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${type} copied to clipboard.` });
  };

  if (apiKeys) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg border-primary/50 bg-card shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Account Created</CardTitle>
            <CardDescription className="text-muted-foreground">
              Save your API keys now. The secret key will not be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Please copy your Secret Key and store it securely. We cannot recover it if lost.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Public Key</label>
                <div className="flex gap-2">
                  <Input readOnly value={apiKeys.public} className="font-mono text-sm bg-muted/50" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKeys.public, "Public Key")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-destructive">Secret Key</label>
                <div className="flex gap-2">
                  <Input readOnly value={apiKeys.secret} className="font-mono text-sm bg-muted/50 border-destructive/30" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKeys.secret, "Secret Key")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-semibold" onClick={() => setLocation("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BsQrCode className="h-7 w-7 text-primary" />
            <span
              className="text-2xl font-black tracking-tight"
            >
              Free Pi
            </span>
          </div>
          <CardTitle className="text-base font-medium text-foreground">Create Merchant Account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Start accepting UPI payments for free
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" disabled={registerMutation.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID (VPA)</FormLabel>
                    <FormControl>
                      <Input placeholder="merchant@bank" disabled={registerMutation.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Phone Number
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                        <Lock className="h-3 w-3" /> Cannot be changed after registration
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        type="tel"
                        maxLength={10}
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="merchant@example.com" type="email" disabled={registerMutation.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={registerMutation.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-semibold" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
