import { Package, ShoppingCart } from "lucide-react";

export default function StockAlertsPage() {
  const mockLowStock = [
    { id: 1, name: "Premium Flour 10kg", category: "Packaged Goods", stock: 2, min: 10, supplier: "National Foods Dist." },
    { id: 2, name: "Fresh Milk 1L", category: "Dairy", stock: 0, min: 20, supplier: "Dairy Pure" },
    { id: 3, name: "Cooking Oil 5L", category: "Packaged Goods", stock: 5, min: 15, supplier: "National Foods Dist." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            Stock Alerts 
            <span className="bg-rose-100 text-rose-700 text-sm font-medium px-2.5 py-0.5 rounded-full">3</span>
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
              {mockLowStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{item.category}</td>
                  <td className="py-3 px-4 text-gray-500">{item.supplier}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{item.stock}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{item.min}</td>
                  <td className="py-3 px-4 text-center">
                    {item.stock === 0 ? (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
