import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useUpdateMerchantProfile, getGetCurrentMerchantQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, User, Shield, Building, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const profileSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, { message: "Invalid UPI ID format (e.g. name@bank)" }),
  phone: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

export default function Settings() {
  const { merchant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateMerchantProfile();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: merchant?.businessName || "",
      upiId: merchant?.upiId || "",
      phone: merchant?.phone || "",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: (updatedMerchant) => {
          queryClient.setQueryData(getGetCurrentMerchantQueryKey(), updatedMerchant);
          toast({
            title: "Profile Updated",
            description: "Your merchant business credentials have been saved.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Update Failed",
            description: err?.message || "Could not update profile.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const onSecuritySubmit = (data: SecurityFormValues) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          securityForm.reset();
          toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Security Update Failed",
            description: err?.message || "Could not change password.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (!merchant) return null;

  return (
    <AppLayout>
      <div className="workspace-page settings-page flex-1 space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="workspace-page-header pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="page-kicker text-[11px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Account
            </span>
            <span className="text-xs text-muted-foreground">• Profile and security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Business and account settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Update the business details customers see and manage your account security.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-2xl h-11 w-full sm:w-auto inline-flex">
            <TabsTrigger 
              value="profile" 
              className="rounded-xl px-4 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Building className="h-4 w-4" />
              <span>Business profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-xl px-4 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Shield className="h-4 w-4" />
              <span>Password and security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="glass-card rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold text-foreground">Business Details</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  This business name and UPI ID will be rendered on all customer payment screens.
                </CardDescription>
              </CardHeader>
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Business Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={updateMutation.isPending} 
                              className="h-10 rounded-xl bg-muted/40 font-semibold" 
                            />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            Brand name shown to payers during UPI intent checkout.
                          </FormDescription>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Recipient UPI ID (VPA)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={updateMutation.isPending} 
                              className="h-10 rounded-xl font-mono text-xs bg-muted/40 font-semibold text-primary" 
                            />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            Destination virtual payment address for all inbound UPI transactions.
                          </FormDescription>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Registered Phone</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                readOnly 
                                disabled 
                                className="h-10 rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed font-mono text-xs" 
                              />
                            </FormControl>
                            <FormDescription className="text-[10px]">
                              Verified during account creation.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Account Email</label>
                        <Input 
                          value={merchant.email} 
                          readOnly 
                          disabled 
                          className="h-10 rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed font-mono text-xs" 
                        />
                        <p className="text-[10px] text-muted-foreground">Login credential.</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 bg-muted/20 p-4 sm:p-5 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending} 
                      className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save Changes</span>
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="glass-card rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold text-foreground">Password & Auth</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Rotate your dashboard access password regularly to protect your account.
                </CardDescription>
              </CardHeader>

              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••••••"
                              {...field} 
                              disabled={updateMutation.isPending} 
                              className="h-10 rounded-xl bg-muted/40 font-mono" 
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">New Password (Min 8 Characters)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••••••"
                              {...field} 
                              disabled={updateMutation.isPending} 
                              className="h-10 rounded-xl bg-muted/40 font-mono" 
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  <CardFooter className="border-t border-border/60 bg-muted/20 p-4 sm:p-5 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending} 
                      className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      <span>Update Password</span>
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
