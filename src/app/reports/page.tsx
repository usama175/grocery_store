import { BarChart2, TrendingUp, DollarSign, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Insights into your inventory valuation, sales, and profitability.</p>
        </div>
        <button className="inline-flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Inventory Value (Cost)</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">Rs 124,500.00</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Expected Value (Retail)</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">Rs 165,800.00</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Projected Margin</span>
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart2 className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">24.9%</h3>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Chart Visualization Area</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">Connect a charting library (like Recharts or Chart.js) to visualize stock movement, top selling categories, and profit trends over time.</p>
      </div>
    </div>
  );
}
