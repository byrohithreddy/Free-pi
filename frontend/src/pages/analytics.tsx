import { useMemo, useState } from "react";
import { useGetMerchantStats, getGetMerchantStatsQueryKey, useListPayments, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  Calendar as CalendarIcon,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShieldCheck,
  Zap,
  BarChart3
} from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { motion } from "framer-motion";

const formatRupees = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7" | "15" | "30">("7");
  
  const { data: stats, isLoading: statsLoading } = useGetMerchantStats({
    query: {
      queryKey: getGetMerchantStatsQueryKey(),
      refetchInterval: 30000,
    }
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useListPayments({ limit: 500 }, {
    query: {
      queryKey: getListPaymentsQueryKey({ limit: 500 }),
    }
  });

  const transactions = paymentsData?.transactions || [];

  // 1. Transaction Volume over selected range (fixed dependency to include timeRange)
  const volumeData = useMemo(() => {
    const daysCount = parseInt(timeRange);
    const days = Array.from({ length: daysCount }).map((_, i) => subDays(new Date(), i)).reverse();
    return days.map(day => {
      const dayTxs = transactions.filter(tx => isSameDay(new Date(tx.createdAt), day));
      return {
        date: format(day, 'MMM dd'),
        count: dayTxs.length,
        revenue: dayTxs.reduce((sum, tx) => sum + (tx.status === 'CONFIRMED' ? tx.amount : 0), 0) / 100,
        pendingRevenue: dayTxs.reduce((sum, tx) => sum + (tx.status === 'PENDING' ? tx.amount : 0), 0) / 100,
      };
    });
  }, [transactions, timeRange]);

  // 2. Status Distribution
  const statusData = useMemo(() => [
    { name: 'Confirmed', value: stats?.confirmedToday || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pendingCount || 0, color: '#F59E0B' },
    { name: 'Rejected', value: stats?.rejectedCount || 0, color: '#EF4444' },
  ], [stats]);

  // 3. Hourly Activity
  const hourlyData = useMemo(() => {
    const daysCount = parseInt(timeRange);
    const rangeStart = subDays(new Date(), daysCount);
    const rangeTxs = transactions.filter(tx => new Date(tx.createdAt) > rangeStart);
    
    const hours = Array.from({ length: 8 }).map((_, i) => i * 3);
    return hours.map(h => {
      const hourTxs = rangeTxs.filter(tx => new Date(tx.createdAt).getHours() === h);
      return {
        hour: `${h}:00`,
        volume: Number((hourTxs.length / Math.max(1, daysCount)).toFixed(1)),
      };
    });
  }, [transactions, timeRange]);

  // Key KPI numbers
  const periodTxs = useMemo(() => {
    const daysCount = parseInt(timeRange);
    const rangeStart = subDays(new Date(), daysCount);
    return transactions.filter(tx => new Date(tx.createdAt) > rangeStart);
  }, [transactions, timeRange]);

  const periodRevenue = useMemo(() => {
    return periodTxs.reduce((sum, tx) => sum + (tx.status === 'CONFIRMED' ? tx.amount : 0), 0);
  }, [periodTxs]);

  const uniqueCustomersCount = useMemo(() => {
    return new Set(periodTxs.map(t => t.customerName || t.customerPhone || t.id)).size;
  }, [periodTxs]);

  const avgTicketSize = useMemo(() => {
    const confirmed = periodTxs.filter(t => t.status === 'CONFIRMED');
    if (confirmed.length === 0) return 0;
    return Math.round(confirmed.reduce((s, t) => s + t.amount, 0) / confirmed.length / 100);
  }, [periodTxs]);

  return (
    <AppLayout>
      <div className="workspace-page analytics-page flex-1 space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header HUD */}
        <div className="workspace-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="page-kicker text-[11px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Reporting
              </span>
              <span className="text-xs text-muted-foreground">• Payment activity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Payment analytics
            </h1>
          </div>

          {/* Time range selector pills */}
          <div className="flex items-center p-1 rounded-xl bg-card border border-border self-start sm:self-auto">
            {(["7", "15", "30"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                aria-pressed={timeRange === range}
                className={`
                  px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${timeRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"}
                `}
              >
                Last {range} Days
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI metric cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Range revenue</span>
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <IndianRupee className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {formatRupees(periodRevenue)}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Settled via UPI Intent</span>
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Confirmation rate</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Activity className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {stats?.successRate || 0}%
                </h3>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>High settlement health</span>
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Unique customers</span>
                <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                  <Users className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  {uniqueCustomersCount}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">
                  Across {periodTxs.length} payment requests
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">Average payment</span>
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
                  ₹{avgTicketSize}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">
                  Per confirmed customer order
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Volume Bar Chart */}
          <Card className="lg:col-span-8 glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" />
                  <span>Daily Revenue & Order Volume</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Confirmed revenue (₹) alongside transaction volume</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span>Settled (₹)</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-border" />
                  <span>Total Txns</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                  <XAxis 
                    dataKey="date" 
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
                    formatter={(value: any, name: any) => [
                      name === 'revenue' ? `₹${value}` : value,
                      name === 'revenue' ? 'Settled Revenue' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="count" name="count" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Breakdown Pie */}
          <Card className="lg:col-span-4 glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-base font-bold text-foreground">Verification status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Confirmed today, pending, and rejected payment counts</p>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  {stats?.totalTransactions || 0}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Processed
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold tabular-nums text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Hourly Peak Activity Line */}
        <Card className="glass-card p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Zap className="h-4.5 w-4.5 text-amber-500" />
                <span>Hourly Settlement Heatmap</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Peak transaction density throughout the 24-hour cycle
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
              Avg / Day
            </Badge>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  formatter={(val: any) => [`${val} requests/hr`, 'Average Traffic']}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                  activeDot={{ r: 6, fill: "#10B981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
