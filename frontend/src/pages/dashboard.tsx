import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useGetMerchantStats, getGetMerchantStatsQueryKey, useListPayments, getListPaymentsQueryKey, useConfirmPaymentByUtr } from "@workspace/api-client-react";
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
  ChevronLeft,
  Calendar as CalendarIcon,
  Smile,
  Zap,
  Search
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

  const confirmByUtrMutation = useConfirmPaymentByUtr();

  const handleQuickConfirm = () => {
    if (!quickUtr) return;
    confirmByUtrMutation.mutate({
      data: { utrNumber: quickUtr }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Payment Confirmed",
          description: data.message,
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

  const { data: stats, isLoading: statsLoading } = useGetMerchantStats({
    query: {
      queryKey: getGetMerchantStatsQueryKey(),
      refetchInterval: 10000,
    }
  });

  const transactions = stats?.recentTransactions || [];

  const chartData = useMemo(() => {
    // Aggregate transactions by hour for the current day
    const hours = Array.from({ length: 8 }).map((_, i) => i * 3); // 0, 3, 6, 9, 12, 15, 18, 21
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

  const pieData = useMemo(() => [
    { name: 'Pending', value: stats?.pendingCount || 0, color: '#F59E0B' },
    { name: 'Confirmed', value: stats?.confirmedToday || 0, color: '#10B981' },
    { name: 'Rejected', value: stats?.rejectedCount || 0, color: '#EF4444' },
  ], [stats]);

  const totalTxs = stats?.totalTransactions || 0;

  const avgProcessingTime = useMemo(() => {
    const confirmed = transactions.filter(t => t.status === 'CONFIRMED' && t.confirmedAt);
    if (confirmed.length === 0) return 0;
    const totalMs = confirmed.reduce((acc, t) => {
      return acc + (new Date(t.confirmedAt!).getTime() - new Date(t.createdAt).getTime());
    }, 0);
    return Math.round(totalMs / confirmed.length / 60000); // in minutes
  }, [transactions]);

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-8 pt-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
          <span>Free Pi</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Dashboard</span>
        </div>

        {/* Welcome Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Welcome Back,
            </h1>
            <p className="text-2xl font-bold text-muted-foreground">
              {merchant?.businessName || "Valued Merchant"}
            </p>
          </div>
          <Button 
            onClick={() => setCreateModalOpen(true)} 
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-6 h-14 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Payment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-sidebar text-sidebar-foreground border-none shadow-2xl relative overflow-hidden h-40 flex flex-col justify-between p-6 rounded-[2rem]">
              <div className="flex justify-between items-start relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">Total Collected</p>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-white/10">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black">{statsLoading ? "..." : formatRupees(stats?.totalCollected || 0)}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">+12% vs last month</p>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 h-40 w-40 bg-primary/10 blur-3xl rounded-full" />
            </Card>
          </motion.div>

          {[
            { title: "Active Requests", value: stats?.pendingCount || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", subtitle: "Pending confirmation" },
            { title: "Confirmed Today", value: stats?.confirmedToday || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", subtitle: "Success rate 100%" },
            { title: "Failed/Rejected", value: stats?.rejectedCount || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", subtitle: "Total failed" }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Card className="bg-card border-none shadow-sm h-40 flex flex-col justify-between p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                  <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground">
                    {statsLoading ? (
                      <Skeleton className="h-9 w-20 bg-muted" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter mt-1">{stat.subtitle}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top Section: Insights, Quick Confirm and Recent Transactions */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <Card className="bg-card border-none shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground">Payment Insights</h3>
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your payment orchestration is performing well. <span className="text-foreground font-bold">{stats?.successRate || 0}% confirmation rate</span> with average processing time of <span className="text-foreground font-bold">{avgProcessingTime} minutes</span>. Continue monitoring pending transactions for optimal merchant experience.
                </p>
              </div>
              <div className="mt-8 p-6 bg-sidebar rounded-3xl text-white relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Action Plan</p>
                  <h4 className="text-sm font-bold mt-2">Improve Success Rate</h4>
                  <p className="text-xs text-white/50 mt-1">Focus on reducing timeout rejects</p>
                  <p className="text-xs text-white/50 mt-1">Reduce the processing time</p>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/20 blur-3xl rounded-full transition-transform group-hover:scale-150" />
              </div>
            </Card>

            <Card className="bg-sidebar text-white border-none shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-5 w-5 text-primary fill-primary" />
                  <h3 className="text-lg font-black">Quick Confirm</h3>
                </div>
                <p className="text-xs text-white/60 mb-6 font-bold uppercase tracking-wider">Confirm by UTR Matching</p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input 
                      placeholder="Enter UTR Number" 
                      value={quickUtr}
                      onChange={(e) => setQuickUtr(e.target.value)}
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/20 pl-11 h-12 rounded-2xl focus-visible:ring-primary/50"
                    />
                  </div>
                  <Button 
                    onClick={handleQuickConfirm}
                    disabled={!quickUtr || confirmByUtrMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20"
                  >
                    {confirmByUtrMutation.isPending ? "Confirming..." : "Auto Match & Confirm"}
                  </Button>
                </div>
              </div>
              <div className="absolute -left-12 -bottom-12 h-40 w-40 bg-primary/10 blur-3xl rounded-full" />
            </Card>
          </div>

          <Card className="lg:col-span-8 bg-card border-none shadow-sm rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-foreground">Recent Transactions</h3>
            </div>

            <div className="space-y-4">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-muted" />
                        <Skeleton className="h-3 w-16 bg-muted" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-12 bg-muted" />
                      <Skeleton className="h-3 w-16 bg-muted ml-auto" />
                    </div>
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">No recent transactions</p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">Create your first payment to see activity</p>
                </div>
              ) : (
                transactions.slice(0, 6).map((tx, i) => (
                  <div key={tx.id} onClick={() => setSelectedTxId(tx.transactionId)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarImage src={`https://avatar.vercel.sh/${tx.customerName || tx.id}`} />
                        <AvatarFallback>{(tx.customerName || "C")[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-black text-foreground truncate max-w-[120px]">{tx.customerName || "Anonymous Customer"}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">TXN_{tx.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{formatRupees(tx.amount)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground/40">{format(new Date(tx.createdAt), 'h:mm a')}</span>
                        <Badge className={`
                          text-[8px] font-black uppercase tracking-widest px-2 py-0 border-none
                          ${tx.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' : 
                            tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 
                            'bg-red-500/10 text-red-500'}
                        `}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" asChild className="w-full mt-4 text-xs font-bold text-primary hover:text-primary/80 group">
              <Link to="/transactions" className="flex items-center justify-center w-full">
                View All Transactions
                <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Card>
        </div>

        {/* Bottom Section: Analytics and Flow Overview */}
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-7 bg-card border-none shadow-sm rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">Analytic View</h3>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>March 2026</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-black text-foreground">{totalTxs > 0 ? "100%" : "0%"}</span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Status</p>
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="flex justify-between items-end border-b border-border/50 pb-2">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total transactions</p>
                  <p className="text-2xl font-black">{totalTxs}</p>
                </div>
                <div className="space-y-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold text-foreground/70 group-hover:text-foreground transition-colors">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 bg-card border-none shadow-sm rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-foreground">Payment Flow</h3>
                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-widest">Live Activity</p>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confirmed" 
                    stroke="#D4AF37" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorConfirmed)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#F59E0B" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPending)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
      
      <CreatePaymentModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <TransactionDetailModal transactionId={selectedTxId} open={!!selectedTxId} onOpenChange={(open) => !open && setSelectedTxId(null)} />
    </AppLayout>
  );
}
