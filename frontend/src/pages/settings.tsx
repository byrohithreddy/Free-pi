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
import { Loader2, Save, User, Shield, Building } from "lucide-react";

const profileSchema = z.object({
  businessName: z.string().min(2, { message: "Business name is required" }),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, { message: "Invalid UPI ID format" }),
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
            description: "Your business profile has been updated.",
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
            title: "Update Failed",
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
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="profile" className="flex gap-2 font-medium">
              <Building className="h-4 w-4" /> Profile & UPI
            </TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2 font-medium">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Update your business details and the UPI ID where you receive funds.
                </CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={updateMutation.isPending} className="bg-muted/30" />
                          </FormControl>
                          <FormDescription>
                            This name is displayed to customers on the payment page.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID (VPA)</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={updateMutation.isPending} className="font-mono bg-muted/30" />
                          </FormControl>
                          <FormDescription>
                            The UPI ID where all generated payment links will route funds.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                          </FormControl>
                          <FormDescription>
                            Your registered contact number (cannot be changed).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Account Email</label>
                      <Input value={merchant.email} readOnly disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 bg-card pt-6">
                    <Button type="submit" disabled={updateMutation.isPending} className="ml-auto">
                      {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay secure.
                </CardDescription>
              </CardHeader>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} disabled={updateMutation.isPending} className="bg-muted/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} disabled={updateMutation.isPending} className="bg-muted/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="border-t border-border/50 bg-card pt-6">
                    <Button type="submit" disabled={updateMutation.isPending} className="ml-auto bg-foreground text-background hover:bg-foreground/90">
                      {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                      Update Password
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
