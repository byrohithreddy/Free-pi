import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Receipt, 
  Settings, 
  KeySquare, 
  LogOut, 
  Loader2, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Star, 
  Lock,
  Headphones,
  ArrowRight,
  TrendingUp,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Heart,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { BsQrCode } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { merchant, isLoading, logout } = useAuth();
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("fp_theme");
    if (saved) return saved === "dark";
    return document.documentElement.classList.contains("dark") || true;
  });
  const [supportOpen, setSupportOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("fp_theme", theme);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const copyEmail = () => {
    navigator.clipboard.writeText("rohith2005hyd@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <BsQrCode className="h-7 w-7 text-primary" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-primary/30 blur-md -z-10 animate-ping-slow" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Synchronizing Free Pi workspace...</span>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Analytics", href: "/analytics", icon: TrendingUp },
  ];

  const helpItems = [
    { label: "API Keys", href: "/api-keys", icon: KeySquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        {/* Sidebar */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground w-[260px] flex-shrink-0 transition-all duration-300">
          <SidebarHeader className="p-5 pb-3">
            <div className="flex flex-col gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
                  <BsQrCode className="h-6 w-6 text-sidebar" />
                  <div className="absolute -inset-0.5 rounded-2xl bg-primary/40 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-sidebar-foreground">Free Pi</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-sidebar-foreground/60 leading-none mt-0.5">UPI Operations</p>
                </div>
              </Link>

              {/* Live Real-time Status Badge */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-semibold text-sidebar-foreground/80">Realtime Engine</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Active</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase font-extrabold tracking-[0.18em] mb-1.5 px-3">
                Core Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href || location.startsWith(item.href + "/");
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`
                            h-11 px-3.5 rounded-xl transition-all duration-200 text-sm font-semibold
                            ${isActive 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                              : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent"}
                          `}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <item.icon className={`h-4.5 w-4.5 transition-transform duration-200 ${isActive ? "text-primary-foreground scale-110" : "text-sidebar-foreground/60"}`} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase font-extrabold tracking-[0.18em] mb-1.5 px-3">
                Integration & System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {helpItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`
                            h-11 px-3.5 rounded-xl transition-all duration-200 text-sm font-semibold
                            ${isActive 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                              : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent"}
                          `}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"}`} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => logout()}
                      className="h-11 px-3.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer flex items-center gap-3 w-full text-sm font-semibold"
                    >
                      <LogOut className="h-4.5 w-4.5 opacity-80" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3">
            {/* Donate & Support Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sidebar-accent/70 to-sidebar-accent/30 p-4 border border-sidebar-border group hover:border-primary/40 transition-all">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-400 fill-rose-400/20" />
                    <h4 className="text-xs font-bold text-sidebar-foreground">Support Free Pi</h4>
                  </div>
                  <span className="text-[10px] font-bold text-primary">Open Source</span>
                </div>
                <p className="text-[11px] text-sidebar-foreground/65 leading-relaxed">
                  Zero commission & 100% free. Help sustain hosting and continuous upgrades.
                </p>
                <Button asChild size="sm" className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold h-8.5 shadow-sm group-hover:shadow-primary/25 transition-all">
                  <Link href="/donate" className="flex items-center justify-center gap-1.5">
                    <span>Donate Now</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="absolute -right-6 -bottom-6 h-20 w-20 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
            </div>

            {/* Dark / Light Mode Switcher in footer */}
            <div className="mt-2.5 flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors p-1.5 rounded-lg hover:bg-sidebar-accent"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors p-1.5 rounded-lg hover:bg-sidebar-accent flex items-center gap-1.5"
              >
                <Headphones className="h-4 w-4 text-primary" />
                <span>Help</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  Merchant Workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 hover:bg-card hover:border-primary/40 text-xs font-medium text-foreground transition-all"
              >
                <Headphones className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Support</span>
              </button>

              <div className="h-5 w-px bg-border hidden sm:block" />

              {/* Merchant Details Pill */}
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-foreground leading-none">{merchant.businessName}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{merchant.upiId}</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/30 ring-2 ring-primary/10">
                  <AvatarImage src={`https://avatar.vercel.sh/${merchant.email}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                    {merchant.businessName[0]?.toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Body Content with Framer Motion Page Transition */}
          <main className="flex-1 overflow-y-auto bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Headphones className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Free Pi Developer Support</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Have questions regarding webhook integration, UPI intent flows, or merchant verification? Our team is available 24/7.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Email</p>
                <p className="text-sm font-mono font-medium text-foreground">rohith2005hyd@gmail.com</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyEmail}
                className="gap-1.5 text-xs h-8"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <a href="mailto:rohith2005hyd@gmail.com?subject=Free%20Pi%20Support%20Inquiry">
                Open Email Client
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
