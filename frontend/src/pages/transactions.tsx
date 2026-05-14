import { useState, useMemo } from "react";
import { format } from "date-fns";
import { keepPreviousData } from "@tanstack/react-query";
import { useListPayments, getListPaymentsQueryKey, ListPaymentsStatus } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreatePaymentModal } from "@/components/modals/CreatePaymentModal";
import { TransactionDetailModal } from "@/components/modals/TransactionDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, Filter, Clock, CheckCircle2, XCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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
  const debouncedSearch = useDebounce(searchTerm, 500);
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

  const handleStatusChange = (val: string) => {
    setStatus(val as ListPaymentsStatus | "ALL");
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus) {
      case "CONFIRMED":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 font-medium px-2 py-0.5"><CheckCircle2 className="mr-1 h-3 w-3" /> Confirmed</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 font-medium px-2 py-0.5"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-medium px-2 py-0.5"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex-none p-6 pb-0 border-b border-border/50 bg-card/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage and verify your payment requests.</p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
            <Tabs value={status} onValueChange={handleStatusChange} className="w-full md:w-auto">
              <TabsList className="bg-muted/50 border border-border/50 h-9">
                <TabsTrigger value="ALL" className="text-xs font-medium">All</TabsTrigger>
                <TabsTrigger value="PENDING" className="text-xs font-medium">Pending</TabsTrigger>
                <TabsTrigger value="CONFIRMED" className="text-xs font-medium">Confirmed</TabsTrigger>
                <TabsTrigger value="REJECTED" className="text-xs font-medium">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order, customer, email, UTR..."
                className="pl-9 h-9 bg-muted/30 border-border/50 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="border border-border rounded-md bg-card shadow-sm flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[180px] font-semibold text-muted-foreground">Order ID</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Customer</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Amount</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Filter className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-base font-medium">No transactions found</p>
                        <p className="text-sm opacity-70 mt-1">Try adjusting your filters or search term.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      className={`border-border cursor-pointer transition-colors hover:bg-muted/40 ${isFetching ? 'opacity-70' : ''}`}
                      onClick={() => setSelectedTxId(tx.transactionId)}
                    >
                      <TableCell className="font-medium font-mono text-sm">{tx.orderId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="truncate max-w-[150px]">
                          {tx.customerName ? (
                            <div>
                              <div className="font-medium truncate">{tx.customerName}</div>
                              {tx.customerEmail && <div className="text-xs text-muted-foreground truncate">{tx.customerEmail}</div>}
                            </div>
                          ) : (
                            tx.customerEmail || <span className="text-muted-foreground/50 italic">Anonymous</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatRupees(tx.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-transparent">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, data.total)}</span> of <span className="font-medium text-foreground">{data.total}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {page} of {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages || isLoading}
                  className="h-8"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
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
