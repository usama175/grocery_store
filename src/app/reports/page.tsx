import { getSalesReport, getExpenseReport, getStockReport, getCustomerReport, getAccountReport } from "@/app/actions/reports";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // Fetch initial data (defaulting to all time or this month, we'll fetch all and filter client side for simplicity given small data size,
  // or we can fetch all on the server. For a large app we'd filter server side. 
  // Given we want instant tab switching and date filtering, we can pass initial data or let the client component fetch.)
  
  // We will fetch initial data for all tabs. 
  const [sales, expenses, stock, customers, accounts] = await Promise.all([
    getSalesReport(),
    getExpenseReport(),
    getStockReport(),
    getCustomerReport(),
    getAccountReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Downloadable insights into your daily sales, expenses, stock, and accounts.
        </p>
      </div>
      
      <ReportsDashboard 
        initialSales={sales}
        initialExpenses={expenses}
        initialStock={stock}
        initialCustomers={customers}
        initialAccounts={accounts}
      />
    </div>
  );
}
