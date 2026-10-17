import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useGetMerchantStats, getGetMerchantStatsQueryKey, useConfirmPaymentByUtr } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreatePaymentModal } from "@/components/modals/CreatePaymentModal";
import { TransactionDetailModal } from "@/components/modals/TransactionDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Activity, 
  TrendingUp,
  XCircle,
  MoreHorizontal,
  ChevronRight,
  Zap,
  Search,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Flame,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const formatRupees = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
};

export default function Dashboard() {
  const { merchant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [quickUtr, setQuickUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const confirmByUtrMutation = useConfirmPaymentByUtr();

  const handleQuickConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickUtr.trim()) return;
    
    confirmByUtrMutation.mutate({
      data: { utrNumber: quickUtr.trim() }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Payment Confirmed",
          description: data.message || "UTR verified and payment settled.",
        });
        setQuickUtr("");
        queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() });
      },
      onError: (error: any) => {
        toast({
          title: "Confirmation Failed",
          description: error?.message || "UTR not found or mismatch",
          variant: "destructive"
        });
      }
    });
  };

  const copyUpiId = () => {
    if (merchant?.upiId) {
      navigator.clipboard.writeText(merchant.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      toast({
        title: "Copied UPI ID",
        description: merchant.upiId,
      });
    }
  };

  const { data: stats, isLoading: statsLoading, isFetching } = useGetMerchantStats({
    query: {
      queryKey: getGetMerchantStatsQueryKey(),
      refetchInterval: 10000,
    }
  });

  const transactions = stats?.recentTransactions || [];

  const chartData = useMemo(() => {
    const hours = [0, 3, 6, 9, 12, 15, 18, 21];
    return hours.map(h => {
      const hourTxs = transactions.filter(tx => new Date(tx.createdAt).getHours() === h);
      return {
        name: `${h}:00`,
        pending: hourTxs.filter(tx => tx.status === 'PENDING').length,
        confirmed: hourTxs.filter(tx => tx.status === 'CONFIRMED').length,
        rejected: hourTxs.filter(tx => tx.status === 'REJECTED').length,
      };
    });
  }, [transactions]);

  const totalTxs = stats?.totalTransactions || 0;
  const pendingCount = stats?.pendingCount || 0;
  const confirmedToday = stats?.confirmedToday || 0;
  const rejectedCount = stats?.rejectedCount || 0;

  const pieData = useMemo(() => {
    const total = pendingCount + confirmedToday + rejectedCount;
    if (total === 0) {
      return [
        { name: 'Confirmed', value: 1, color: '#10B981' },
      ];
    }
    return [
      { name: 'Confirmed', value: confirmedToday, color: '#10B981' },
      { name: 'Pending', value: pendingCount, color: '#F59E0B' },
      { name: 'Rejected', value: rejectedCount, color: '#EF4444' },
    ];
  }, [pendingCount, confirmedToday, rejectedCount]);

  const avgProcessingTime = useMemo(() => {
    const confirmed = transactions.filter(t => t.status === 'CONFIRMED' && t.confirmedAt);
    if (confirmed.length === 0) return 1;
    const totalMs = confirmed.reduce((acc, t) => {
      return acc + (new Date(t.confirmedAt!).getTime() - new Date(t.createdAt).getTime());
    }, 0);
    return Math.max(1, Math.round(totalMs / confirmed.length / 60000));
  }, [transactions]);

  return (
    <AppLayout>
      <div className="workspace-page dashboard-page flex-1 space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header HUD */}
        <div className="workspace-page-header flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="page-kicker text-[11px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Payment overview
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium">Refreshes every 10 seconds</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground text-balance">
                {merchant?.businessName || "Merchant Dashboard"}
              </h1>
              {merchant?.upiId && (
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-border/80"
                  title="Click to copy UPI ID"
                >
                  <span>{merchant.upiId}</span>
                  {copiedUpi ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: getGetMerchantStatsQueryKey() })}
              className="h-10 px-3 rounded-xl gap-2 text-xs font-semibold"
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button 
              onClick={() => setCreateModalOpen(true)} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-5 h-10 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Payment</span>
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Collections Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Total collected</span>
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <IndianRupee className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {statsLoading ? <Skeleton className="h-8 w-28" /> : formatRupees(stats?.totalCollected || 0)}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {stats?.collectionGrowth ? `${stats.collectionGrowth > 0 ? '+' : ''}${stats.collectionGrowth.toFixed(1)}%` : 'Active'} vs last period
                  </span>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
            </Card>
          </motion.div>

          {/* Pending Requests */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Pending verifications</span>
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : pendingCount}
                </h3>
                <p className="text-[11px] font-semibold text-amber-500/90 mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Awaiting customer UTR proof
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Confirmed Today */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Confirmed today</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : confirmedToday}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1">
                  {stats?.successRate || 0}% overall confirmation rate
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Rejections / Failures */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Rejected / expired</span>
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <XCircle className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : rejectedCount}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">
                  Avg match time: {avgProcessingTime} min
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Instant UTR Power Bar */}
        <Card className="border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <form onSubmit={handleQuickConfirm} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <Zap className="h-5 w-5 fill-primary/30" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Instant UTR Verification</h4>
                <p className="text-xs text-muted-foreground">Input the 12-digit bank reference number to match and confirm instantly.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. 408512345678"
                  value={quickUtr}
                  onChange={(e) => setQuickUtr(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background/80 border-border text-sm font-mono focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={!quickUtr.trim() || confirmByUtrMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-10 px-4 text-xs shrink-0"
              >
                {confirmByUtrMutation.isPending ? "Matching..." : "Match & Verify"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Chart: Hourly Activity */}
          <Card className="lg:col-span-7 glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Payment Velocity & Settlement</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time payment requests mapped across the day</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="confirmedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confirmed" 
                    name="Confirmed"
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#confirmedGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    name="Pending"
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#pendingGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Right Chart: Status Ratio Donut */}
          <Card className="lg:col-span-5 glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-foreground">Status Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution across all requests</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {totalTxs} total
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative h-44 w-44 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {stats?.successRate || 0}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Success
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-foreground">Confirmed</span>
                  </div>
                  <span className="font-bold tabular-nums text-emerald-500">{confirmedToday}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-foreground">Pending UTR</span>
                  </div>
                  <span className="font-bold tabular-nums text-amber-500">{pendingCount}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-foreground">Rejected</span>
                  </div>
                  <span className="font-bold tabular-nums text-rose-500">{rejectedCount}</span>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold mt-2">
              <Link href="/analytics" className="flex items-center justify-center gap-1.5">
                <span>Open Deep Analytics</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>
        </div>

        {/* Live Recent Transactions Feed */}
        <Card className="glass-card p-5 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Recent Transactions</span>
                <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                  Live Feed
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click any transaction to inspect, confirm, or verify bank reference</p>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
              <Link href="/transactions">
                <span>View Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">No Payment Requests Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Create your first payment request to generate a UPI intent link and track real-time settlements.
                </p>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  size="sm"
                  className="mt-4 bg-primary text-primary-foreground font-bold rounded-xl text-xs"
                >
                  Create First Payment
                </Button>
              </div>
            ) : (
              transactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.transactionId)}
                  className="flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-muted/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 rounded-xl border border-border">
                      <AvatarImage src={`https://avatar.vercel.sh/${tx.customerName || tx.id}`} />
                      <AvatarFallback className="rounded-xl font-bold text-xs bg-muted text-muted-foreground">
                        {(tx.customerName || "C")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {tx.customerName || "Customer Payment"}
                        </p>
                        <span className="text-[11px] font-mono text-muted-foreground/80 hidden sm:inline">
                          #{tx.orderId || tx.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{format(new Date(tx.createdAt), 'MMM d, h:mm a')}</span>
                        {tx.utrNumber && (
                          <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                            UTR: {tx.utrNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-black text-foreground tabular-nums">
                        {formatRupees(tx.amount)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          tx.status === 'CONFIRMED' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                            : tx.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <CreatePaymentModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <TransactionDetailModal transactionId={selectedTxId} open={!!selectedTxId} onOpenChange={(open) => !open && setSelectedTxId(null)} />
    </AppLayout>
  );
}
