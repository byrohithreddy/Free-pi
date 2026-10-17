import { useState, useMemo } from "react";
import { format } from "date-fns";
import { keepPreviousData } from "@tanstack/react-query";
import { useListPayments, getListPaymentsQueryKey, ListPaymentsStatus } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreatePaymentModal } from "@/components/modals/CreatePaymentModal";
import { TransactionDetailModal } from "@/components/modals/TransactionDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Receipt,
  X,
  CreditCard,
  Hash
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";

const formatRupees = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100);
};

export default function Transactions() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  
  // Filter state
  const [status, setStatus] = useState<ListPaymentsStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const limit = 15;

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (status !== "ALL") params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [status, debouncedSearch, page]);

  const { data, isLoading, isFetching } = useListPayments(queryParams, {
    query: {
      queryKey: getListPaymentsQueryKey(queryParams),
      placeholderData: keepPreviousData,
    }
  });

  const handleStatusChange = (val: ListPaymentsStatus | "ALL") => {
    setStatus(val);
    setPage(1);
  };

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus) {
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30 font-bold px-2.5 py-0.5 text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/30 font-bold px-2.5 py-0.5 text-[11px] gap-1">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30 font-bold px-2.5 py-0.5 text-[11px] gap-1">
            <Clock className="h-3 w-3 animate-pulse" />
            <span>Pending UTR</span>
          </Badge>
        );
    }
  };

  return (
    <AppLayout>
      <div className="workspace-page transactions-page flex-1 space-y-6 p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-full">
        {/* Header HUD */}
        <div className="workspace-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="page-kicker text-[11px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Payment history
              </span>
              <span className="text-xs text-muted-foreground">• Search and filter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Transactions
            </h1>
          </div>

          <Button 
            onClick={() => setCreateModalOpen(true)} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-5 h-10 shadow-lg shadow-primary/20 gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Payment Request</span>
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Requests" },
              { id: "PENDING", label: "Pending" },
              { id: "CONFIRMED", label: "Confirmed" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => {
              const active = status === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id as any)}
                  aria-pressed={active}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                    ${active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search payments by order ID, customer, or UTR"
              placeholder="Search by order ID, customer, UTR..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-muted/40 border-border"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table Container */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Order Ref</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Payer Info</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">UTR Number</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-72 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
                          <Filter className="h-6 w-6 opacity-40" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">No Transactions Found</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          No matching payment requests for this filter criteria. Try clearing the search or switching status tabs.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      className={`border-border/70 cursor-pointer transition-colors hover:bg-muted/40 ${isFetching ? 'opacity-75' : ''}`}
                      onClick={() => setSelectedTxId(tx.transactionId)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-primary opacity-70" />
                          <span>{tx.orderId || tx.id.slice(0, 8)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a')}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5 max-w-[200px]">
                          <Avatar className="h-7 w-7 rounded-lg border border-border">
                            <AvatarImage src={`https://avatar.vercel.sh/${tx.customerName || tx.id}`} />
                            <AvatarFallback className="rounded-lg text-[10px] font-bold">
                              {(tx.customerName || "C")[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {tx.customerName || "Direct Checkout"}
                            </p>
                            {tx.customerEmail && (
                              <p className="text-[10px] text-muted-foreground truncate">{tx.customerEmail}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {tx.utrNumber ? (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold">
                            {tx.utrNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 italic text-[11px]">—</span>
                        )}
                      </TableCell>

                      <TableCell className="font-extrabold text-foreground tabular-nums text-sm">
                        {formatRupees(tx.amount)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-bold text-foreground">{Math.min(page * limit, data.total)}</span> of{" "}
                <span className="font-bold text-foreground">{data.total}</span> requests
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <span className="text-xs font-mono font-semibold px-2">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages || isLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePaymentModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <TransactionDetailModal transactionId={selectedTxId} open={!!selectedTxId} onOpenChange={(open) => !open && setSelectedTxId(null)} />
    </AppLayout>
  );
}
