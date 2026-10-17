import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRegenerateApiKeys, getGetCurrentMerchantQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  Copy, 
  AlertTriangle, 
  KeyRound, 
  Terminal, 
  Check, 
  ShieldAlert, 
  Code2, 
  Lock 
} from "lucide-react";
import { motion } from "framer-motion";

export default function ApiKeys() {
  const { merchant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const regenerateMutation = useRegenerateApiKeys();
  
  const [newKeys, setNewKeys] = useState<{ public: string; secret: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRegenerate = () => {
    regenerateMutation.mutate(
      undefined,
      {
        onSuccess: (res) => {
          setNewKeys({ public: res.apiKeyPublic, secret: res.apiKeySecret });
          if (merchant) {
            queryClient.setQueryData(getGetCurrentMerchantQueryKey(), {
              ...merchant,
              apiKeyPublic: res.apiKeyPublic,
            });
          }
          toast({
            title: "API Credentials Rolled",
            description: "Old secret key has been invalidated immediately.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Roll Failed",
            description: err?.message || "Could not roll API keys.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: "Copied to Clipboard",
      description: `${type} copied.`,
    });
  };

  if (!merchant) return null;

  return (
    <AppLayout>
      <div className="workspace-page api-keys-page flex-1 space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="workspace-page-header pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="page-kicker text-[11px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Developer access
            </span>
            <span className="text-xs text-muted-foreground">• Server-side credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            API keys
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Use these keys from your server to create UPI payment requests.
          </p>
        </div>

        {/* Warning if new keys rolled */}
        {newKeys && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-500 rounded-2xl p-5">
              <KeyRound className="h-5 w-5" />
              <div className="ml-2">
                <AlertTitle className="text-base font-extrabold text-foreground">New secret key generated</AlertTitle>
                <AlertDescription className="mt-1 text-xs text-muted-foreground">
                  Copy this secret key right now. It is hashed for security and will never be presented again.
                  <div className="mt-3 flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={newKeys.secret} 
                      className="font-mono text-xs bg-background text-foreground font-bold h-10 rounded-xl" 
                    />
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard(newKeys.secret, "New Secret Key")}
                      className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
                    >
                      {copiedKey === "New Secret Key" ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === "New Secret Key" ? "Copied" : "Copy Secret Key"}</span>
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Active Credentials Card */}
        <Card className="glass-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-primary" />
                  <span>Merchant Authentication Keys</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Send Secret Key via <code className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">X-API-Key</code> header for authenticated requests.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            {/* Public Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Public Key</Label>
                <span className="text-[10px] text-muted-foreground font-mono">Visible ID</span>
              </div>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={newKeys?.public || merchant.apiKeyPublic} 
                  className="font-mono text-xs bg-muted/40 h-10 rounded-xl select-all" 
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(newKeys?.public || merchant.apiKeyPublic, "Public Key")}
                  className="h-10 w-10 shrink-0 rounded-xl"
                  title="Copy Public Key"
                >
                  {copiedKey === "Public Key" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Identifier used in merchant webhooks and public lookups.</p>
            </div>
            
            {/* Secret Key */}
            <div className="space-y-1.5 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Secret Key</Label>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Server Only</span>
              </div>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value="sk_live_••••••••••••••••••••••••••••••••" 
                  className="font-mono text-xs bg-muted/40 h-10 rounded-xl text-muted-foreground" 
                  type="password" 
                />
                <Button variant="outline" size="icon" disabled className="h-10 w-10 shrink-0 rounded-xl opacity-50">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Stored as a cryptographic hash. Never commit this key to Git or expose in client-side bundles.
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs text-muted-foreground">
              Suspect an API key leak or need to revoke access?
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-9">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Roll / Regenerate Keys</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold">Regenerate API Credentials?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                    This will immediately revoke your active secret key. Any existing servers making API calls with the old key will fail with 401 Unauthorized until updated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl text-xs font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRegenerate} 
                    className="rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {regenerateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Revocation & Roll
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        {/* Integration Guide Snippet Card */}
        <Card className="glass-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Terminal className="h-4.5 w-4.5 text-primary" />
              <span>Quick cURL Integration</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Sample payment request payload to initialize a UPI intent session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-muted/50 text-foreground font-mono text-xs overflow-x-auto border border-border">
{`curl -X POST https://api.free-pi.pages.dev/api/payments \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_live_your_secret_key" \\
  -d '{
    "amount": 49900,
    "orderId": "ORD-98214",
    "description": "Pro Subscription"
  }'`}
              </pre>
            </div>

            <div className="relative group">
              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Example Server Response</p>
              <pre className="p-4 rounded-xl bg-muted/50 text-foreground font-mono text-xs overflow-x-auto border border-border">
{`{
  "transactionId": "TXN_20261017_89AB12CD",
  "paymentUrl": "https://free-pi.pages.dev/pay/TXN_20261017_89AB12CD",
  "amount": 49900,
  "orderId": "ORD-98214",
  "status": "PENDING"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
