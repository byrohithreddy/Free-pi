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
import { Loader2, Copy, AlertTriangle, KeyRound, Terminal } from "lucide-react";

export default function ApiKeys() {
  const { merchant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const regenerateMutation = useRegenerateApiKeys();
  
  // Local state to store new keys right after regeneration
  const [newKeys, setNewKeys] = useState<{ public: string; secret: string } | null>(null);

  const handleRegenerate = () => {
    regenerateMutation.mutate(
      undefined,
      {
        onSuccess: (res) => {
          setNewKeys({ public: res.apiKeyPublic, secret: res.apiKeySecret });
          // Update merchant in cache with new public key
          if (merchant) {
            queryClient.setQueryData(getGetCurrentMerchantQueryKey(), {
              ...merchant,
              apiKeyPublic: res.apiKeyPublic,
            });
          }
          toast({
            title: "API Keys Regenerated",
            description: "Your old keys have been invalidated immediately.",
            variant: "destructive",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Action Failed",
            description: err?.message || "Could not regenerate API keys.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard.`,
    });
  };

  if (!merchant) return null;

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">API Credentials</h2>
          <p className="text-muted-foreground mt-1">Manage keys for server-to-server integration.</p>
        </div>

        {newKeys && (
          <Alert className="bg-primary/10 border-primary/20 text-primary">
            <KeyRound className="h-4 w-4" />
            <AlertTitle className="font-semibold">New Keys Generated</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-foreground">
              Please copy your new secret key now. It will never be shown again.
              <div className="mt-4 flex gap-2">
                <Input readOnly value={newKeys.secret} className="font-mono bg-background border-primary/20" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(newKeys.secret, "Secret Key")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Current Credentials</CardTitle>
            <CardDescription>
              Authenticate API requests by passing your Secret Key in the X-API-Key header.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Public Key</Label>
              <div className="flex gap-2">
                <Input readOnly value={newKeys?.public || merchant.apiKeyPublic} className="font-mono bg-muted/30 text-sm text-muted-foreground" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(newKeys?.public || merchant.apiKeyPublic, "Public Key")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[13px] text-muted-foreground">Safe to expose in frontend code if necessary.</p>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-border/50">
              <Label>Secret Key</Label>
              <div className="flex gap-2">
                <Input readOnly value="sk_live_********************************" className="font-mono bg-muted/30 text-sm text-muted-foreground" type="password" />
                <Button variant="outline" size="icon" disabled>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[13px] text-muted-foreground">Keep this secure. Never commit it to source control.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border/50 pt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Compromised keys?
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Roll Keys
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will immediately invalidate your current Secret Key. Any existing API integrations using the old key will start failing immediately until updated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {regenerateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Yes, Regenerate Keys
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <Card className="border-border shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="h-5 w-5" /> API Usage Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-muted text-muted-foreground font-mono text-sm overflow-x-auto border border-border/50">
{`curl -X POST https://api.yourdomain.com/api/payments \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_live_your_secret_key" \\
  -d '{
    "amount": 50000,
    "orderId": "ORD-123",
    "description": "Premium Plan"
  }'`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
