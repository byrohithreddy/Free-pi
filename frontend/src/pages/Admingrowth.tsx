import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Lock,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TopMerchant = {
  id: string;
  businessName: string;
  email: string;
  transactionCount: number;
  totalAmount: number;
  confirmedAmount: number;
};

type RecentTransaction = {
  id: string;
  transactionId: string;
  merchantName: string;
  merchantEmail: string | null;
  orderId: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
};

type DailyGrowth = {
  date: string;
  transactionCount: number;
  totalAmount: number;
  confirmedAmount: number;
};

type AdminGrowthStats = {
  totalMerchants: number;
  totalTransactions: number;
  totalAmount: number;
  confirmedAmount: number;
  pendingTransactions: number;
  confirmedTransactions: number;
  rejectedTransactions: number;
  todayTransactions: number;
  todayAmount: number;
  todayMerchants: number;
  averageTransactionAmount: number;
  successRate: number;
  dailyGrowth: DailyGrowth[];
  topMerchants: TopMerchant[];
  recentTransactions: RecentTransaction[];
};

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const adminAuthStorageKey = "fp_admin_growth_auth";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

async function fetchAdminGrowthStats(authHeader: string): Promise<AdminGrowthStats> {
  const response = await fetch(`${apiBaseUrl}/api/merchant/admin-growth`, {
    headers: { Authorization: authHeader },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Unable to load system analytics.");
  }

  return response.json();
}

function StatusBadge({ status }: { status: RecentTransaction["status"] }) {
  if (status === "CONFIRMED") {
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Confirmed</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
  }
  return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-none bg-card p-6 rounded-[2rem] shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-foreground">{value}</h3>
          <p className="mt-2 text-xs font-bold text-muted-foreground">{detail}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

function AdminLogin({ onLogin, error }: { onLogin: (authHeader: string) => void; error?: string }) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = btoa(`${adminId}:${password}`);
    onLogin(`Basic ${credentials}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-7 rounded-[2rem] border-none shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Admingrowth</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Admin ID</label>
            <Input value={adminId} onChange={(e) => setAdminId(e.target.value)} autoComplete="username" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="text-sm font-bold text-red-500">{error}</p>}
          <Button type="submit" className="w-full font-black" disabled={!adminId || !password}>
            Open System Analytics
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function Admingrowth() {
  const [authHeader, setAuthHeader] = useState(() => sessionStorage.getItem(adminAuthStorageKey) || "");
  const [loginError, setLoginError] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-growth", authHeader],
    queryFn: () => fetchAdminGrowthStats(authHeader),
    enabled: !!authHeader,
    retry: false,
    refetchInterval: authHeader ? 30000 : false,
  });

  const statusData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Confirmed", value: data.confirmedTransactions, color: "#22C55E" },
      { name: "Pending", value: data.pendingTransactions, color: "#F59E0B" },
      { name: "Rejected", value: data.rejectedTransactions, color: "#EF4444" },
    ];
  }, [data]);

  const dailyData = useMemo(() => {
    if (!data) return [];
    return data.dailyGrowth.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      transactions: day.transactionCount,
      amount: Math.round(day.totalAmount / 100),
      confirmed: Math.round(day.confirmedAmount / 100),
    }));
  }, [data]);

  const topMerchantChartData = useMemo(() => {
    if (!data) return [];
    return data.topMerchants.map((merchant) => ({
      name: merchant.businessName.length > 14 ? `${merchant.businessName.slice(0, 14)}...` : merchant.businessName,
      amount: Math.round(merchant.totalAmount / 100),
      transactions: merchant.transactionCount,
    }));
  }, [data]);

  const handleLogin = (nextAuthHeader: string) => {
    sessionStorage.setItem(adminAuthStorageKey, nextAuthHeader);
    setAuthHeader(nextAuthHeader);
    setLoginError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(adminAuthStorageKey);
    setAuthHeader("");
  };

  useEffect(() => {
    if (!error) return;
    sessionStorage.removeItem(adminAuthStorageKey);
    setAuthHeader("");
    setLoginError((error as Error).message);
  }, [error]);

  if (!authHeader) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  if (error) {
    return <AdminLogin onLogin={handleLogin} error={(error as Error).message} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="space-y-8 p-8 pt-10 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin System View
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Admingrowth</h1>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              Whole-system analytics across all merchants and all transactions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
            <Button variant="destructive" onClick={handleLogout}>Lock</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-[2rem]" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Merchants" value={data.totalMerchants} detail={`${data.todayMerchants} joined today`} icon={Store} />
              <StatCard title="Total Transactions" value={data.totalTransactions} detail={`${data.todayTransactions} created today`} icon={CreditCard} />
              <StatCard title="All Transaction Amount" value={formatRupees(data.totalAmount)} detail="Irrespective of merchant or status" icon={IndianRupee} />
              <StatCard title="Confirmed Amount" value={formatRupees(data.confirmedAmount)} detail="All confirmed collections" icon={Banknote} />
              <StatCard title="Pending" value={data.pendingTransactions} detail="Awaiting verification" icon={Clock} />
              <StatCard title="Confirmed" value={data.confirmedTransactions} detail={`${data.successRate}% success rate`} icon={CheckCircle2} />
              <StatCard title="Rejected" value={data.rejectedTransactions} detail="Declined payment requests" icon={XCircle} />
              <StatCard title="Average Ticket" value={formatRupees(data.averageTransactionAmount)} detail={`${formatRupees(data.todayAmount)} today`} icon={TrendingUp} />
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="lg:col-span-8 border-none bg-card p-6 rounded-[2.5rem] shadow-sm">
                <h2 className="text-lg font-black text-foreground mb-6">14-Day System Growth</h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }} />
                      <Line type="monotone" dataKey="amount" name="Amount (Rs)" stroke="#D4AF37" strokeWidth={4} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="transactions" name="Transactions" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-4 border-none bg-card p-6 rounded-[2.5rem] shadow-sm">
                <h2 className="text-lg font-black text-foreground mb-6">Status Mix</h2>
                <div className="h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={6} dataKey="value">
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black">{data.totalTransactions}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transactions</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="lg:col-span-5 border-none bg-card p-6 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground">Top Merchants</h2>
                </div>
                <div className="h-[260px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMerchantChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }} />
                      <Bar dataKey="amount" name="Amount (Rs)" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {data.topMerchants.map((merchant) => (
                    <div key={merchant.id} className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-black text-foreground truncate">{merchant.businessName}</p>
                          <p className="text-xs text-muted-foreground truncate">{merchant.email}</p>
                        </div>
                        <p className="text-sm font-black text-primary">{formatRupees(merchant.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-7 border-none bg-card p-6 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground">Recent System Transactions</h2>
                </div>
                <div className="space-y-3">
                  {data.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-foreground truncate">{transaction.merchantName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {transaction.orderId} - {transaction.customerName || transaction.customerEmail || "Anonymous"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground">{formatRupees(transaction.amount)}</p>
                        <div className="mt-1"><StatusBadge status={transaction.status} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
