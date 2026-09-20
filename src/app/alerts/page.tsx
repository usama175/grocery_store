import { Package, ShoppingCart } from "lucide-react";
import { getLowStockProducts } from "@/lib/services/reports";
import { decimalToNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockAlertsPage() {
  const lowStock = await getLowStockProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            Stock Alerts 
            <span className="bg-rose-100 text-rose-700 text-sm font-medium px-2.5 py-0.5 rounded-full">{lowStock.length}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Items that are low or out of stock.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 text-xs font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Supplier</th>
                <th className="py-3 px-4 font-medium text-right">Current Stock</th>
                <th className="py-3 px-4 font-medium text-right">Min Level</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowStock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No low stock alerts right now.
                  </td>
                </tr>
              ) : (
                lowStock.map((item) => {
                  const stock = decimalToNumber(item.currentStock);
                  const min = decimalToNumber(item.minStockAlert);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{item.category?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-gray-500">N/A</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{stock}</td>
                      <td className="py-3 px-4 text-right text-gray-500">{min}</td>
                      <td className="py-3 px-4 text-center">
                        {stock === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="inline-flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition-colors">
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
