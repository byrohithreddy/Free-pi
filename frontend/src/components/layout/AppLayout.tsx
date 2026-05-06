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
} from "lucide-react";
import { BsQrCode } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { merchant, isLoading, logout } = useAuth();
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("fp_theme", theme);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "API Keys", href: "/api-keys", icon: KeySquare },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        {/* Sidebar */}
        <Sidebar className="border-r-0 bg-sidebar text-sidebar-foreground w-[240px]">
          <SidebarHeader className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <BsQrCode className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">Free Pi</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-3 py-2 gap-2"
                  onClick={() => setIsDarkMode((current) => !current)}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-[11px] font-bold">
                    {isDarkMode ? "Switch to light" : "Switch to dark"}
                  </span>
                </Button>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] uppercase font-black tracking-[0.2em] mb-2 px-3 flex justify-between items-center">
                Main MENU
                <ChevronDown className="h-3 w-3" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href || location.startsWith(item.href + "/")}
                        className={`
                          py-6 px-4 rounded-xl transition-all duration-300
                          ${location === item.href 
                            ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70"}
                        `}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${location === item.href ? "text-white" : "text-sidebar-foreground/50"}`} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] uppercase font-black tracking-[0.2em] mb-2 px-3 flex justify-between items-center">
                Help & Settings
                <ChevronDown className="h-3 w-3" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {helpItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className="py-6 px-4 rounded-xl hover:bg-sidebar-accent/50 text-sidebar-foreground/70 transition-all duration-300"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-sidebar-foreground/50" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => logout()}
                      className="py-6 px-4 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-all duration-300 cursor-pointer flex items-center gap-3 mt-1"
                    >
                      <LogOut className="h-5 w-5 opacity-70" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-black/40 p-5 border border-white/5"
            >
              <div className="relative z-10">
                <h4 className="text-sm font-bold text-white">Donate</h4>
                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                  Help keep this project running — your support funds maintenance, improvements, and ongoing availability.
                </p>
                <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold h-10 group">
                  Donate now
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/20 blur-3xl rounded-full" />
            </motion.div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden sm:flex items-center gap-4 bg-black text-white px-4 py-2 rounded-full text-xs font-medium cursor-pointer hover:bg-black/90 transition-colors">
                <Bell className="h-3.5 w-3.5" />
                <span>Support Center</span>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-2 sm:mx-8 flex items-center justify-center sm:justify-start overflow-hidden">
              <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/40 truncate">
                Free Payment Interface
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-foreground leading-none">{merchant.businessName}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{merchant.email}</p>
                {merchant.phone && <p className="text-[9px] text-primary/70 font-bold mt-0.5">{merchant.phone}</p>}
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-white">
                <AvatarImage src={`https://avatar.vercel.sh/${merchant.email}`} />
                <AvatarFallback className="bg-primary text-white font-bold">{merchant.businessName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
