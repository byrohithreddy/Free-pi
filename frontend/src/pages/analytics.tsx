import { useMemo, useState } from "react";
import { useGetMerchantStats, getGetMerchantStatsQueryKey, useListPayments, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowDownRight
} from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7" | "15" | "30">("7");
  
  const { data: stats, isLoading: statsLoading } = useGetMerchantStats({
    query: {
      queryKey: getGetMerchantStatsQueryKey(),
      refetchInterval: 30000,
    }
  });

  const { data: paymentsData } = useListPayments({ limit: 500 }, {
    query: {
      queryKey: getListPaymentsQueryKey({ limit: 500 }),
    }
  });

  const transactions = paymentsData?.transactions || [];

  // 1. Transaction Volume over selected range
  const volumeData = useMemo(() => {
    const daysCount = parseInt(timeRange);
    const days = Array.from({ length: daysCount }).map((_, i) => subDays(new Date(), i)).reverse();
    return days.map(day => {
      const dayTxs = transactions.filter(tx => isSameDay(new Date(tx.createdAt), day));
      return {
        date: format(day, 'MMM dd'),
        count: dayTxs.length,
        amount: dayTxs.reduce((sum, tx) => sum + (tx.status === 'CONFIRMED' ? tx.amount : 0), 0) / 100
      };
    });
  }, [transactions]);

  // 2. Status Distribution
  const statusData = useMemo(() => [
    { name: 'Confirmed', value: stats?.confirmedToday || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pendingCount || 0, color: '#F59E0B' },
    { name: 'Rejected', value: stats?.rejectedCount || 0, color: '#EF4444' },
  ], [stats]);

  // 3. Hourly Activity (Mocked for better visualization if no data, but using real timestamps where possible)
  const hourlyData = useMemo(() => {
    const daysCount = parseInt(timeRange);
    const rangeStart = subDays(new Date(), daysCount);
    const rangeTxs = transactions.filter(tx => new Date(tx.createdAt) > rangeStart);
    
    const hours = Array.from({ length: 12 }).map((_, i) => i * 2);
    return hours.map(h => {
      const hourTxs = rangeTxs.filter(tx => new Date(tx.createdAt).getHours() === h);
      return {
        hour: `${h}:00`,
        volume: Number((hourTxs.length / daysCount).toFixed(1)) // Average per day
      };
    });
  }, [transactions, timeRange]);

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-8 pt-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
          <span>Free Pi</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Analytics</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Advanced Analytics</h1>
            <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-wider">
              Deep dive into your payment ecosystem
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border p-1 rounded-2xl shadow-sm">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full">
              <TabsList className="bg-transparent h-9 border-none">
                <TabsTrigger value="7" className="text-xs font-bold px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">7 Days</TabsTrigger>
                <TabsTrigger value="15" className="text-xs font-bold px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">15 Days</TabsTrigger>
                <TabsTrigger value="30" className="text-xs font-bold px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card border-none shadow-sm p-6 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black">{stats?.successRate || 0}%</h3>
              <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold mb-1.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>+2.4%</span>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-none shadow-sm p-6 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Unique Customers</p>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black">
                {new Set(transactions
                  .filter(t => new Date(t.createdAt) > subDays(new Date(), parseInt(timeRange)))
                  .map(t => t.customerName || "Unknown")
                ).size}
              </h3>
              <div className="flex items-center gap-1 text-blue-500 text-[10px] font-bold mb-1.5">
                <Activity className="h-3 w-3" />
                <span>Stable</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-none shadow-sm p-6 rounded-[2rem]">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg. Ticket Size</p>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black">
                ₹{transactions.length > 0 ? Math.round(transactions.reduce((s, t) => s + t.amount, 0) / transactions.length / 100) : 0}
              </h3>
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold mb-1.5">
                <ArrowDownRight className="h-3 w-3" />
                <span>-1.2%</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Volume Chart */}
          <Card className="lg:col-span-8 bg-card border-none shadow-sm rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-foreground">Transaction Volume</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Count</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
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
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="count" fill="#E5E7EB" radius={[6, 6, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Distribution */}
          <Card className="lg:col-span-4 bg-card border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-lg font-black text-foreground mb-8">Status Health</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-foreground">{stats?.totalTransactions || 0}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Hourly Trend */}
        <Card className="bg-card border-none shadow-sm rounded-[2.5rem] p-8">
          <h3 className="text-lg font-black text-foreground mb-8">Hourly Peak Activity</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#D4AF37" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: "#D4AF37", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
