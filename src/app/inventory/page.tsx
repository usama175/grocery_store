import Link from "next/link";
import { getCategories, getProducts } from "@/app/actions/products";
import { ProductModal } from "@/components/products/product-modal";
import { ProductRowActions } from "@/components/products/product-row-actions";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import {
  Package,
  Search,
  ArrowUpDown
} from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category, status } = await searchParams;
  const categoryId = category ? Number(category) : undefined;

  const [products, categories] = await Promise.all([
    getProducts(q, categoryId),
    getCategories(),
  ]);

  // Filter by status if needed
  const displayedProducts = products.filter((p) => {
    const stock = decimalToNumber(p.currentStock);
    const minAlert = decimalToNumber(p.minStockAlert);
    if (status === "low") return stock > 0 && stock <= minAlert;
    if (status === "out") return stock <= 0;
    if (status === "in") return stock > minAlert;
    return true;
  });

  const exportData = displayedProducts.map((p) => {
    const stock = decimalToNumber(p.currentStock);
    const cost = decimalToNumber(p.purchaseRate);
    const retail = decimalToNumber(p.saleRate);
    return [
      p.name,
      p.category?.name || "Uncategorized",
      p.barcode || "-",
      cost.toFixed(2),
      retail.toFixed(2),
      `${stock} ${p.unit}`
    ];
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products, pricing, and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
           <ExportButton 
             title="Inventory List"
             filename="inventory_list"
             columns={["Product Name", "Category", "SKU / Barcode", "Cost Price", "Selling Price", "In Stock"]}
             data={exportData}
           />
           <ProductModal categories={categories} />
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
           <form className="flex items-center gap-3 flex-1" method="get">
             <div className="relative max-w-xs w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 name="q"
                 defaultValue={q || ""}
                 placeholder="Search products, SKUs..."
                 className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
               />
             </div>
             
             <select
               name="category"
               defaultValue={category || ""}
               className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
             >
               <option value="">All Categories</option>
               {categories.map((c) => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>

             <select
               name="status"
               defaultValue={status || ""}
               className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
             >
               <option value="">All Statuses</option>
               <option value="in">In Stock</option>
               <option value="low">Low Stock</option>
               <option value="out">Out of Stock</option>
             </select>

             <button type="submit" className="h-9 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200">
               Filter
             </button>
             
             {(q || category || status) && (
                <Link href="/inventory" className="text-sm text-gray-500 hover:text-gray-900 underline ml-2">
                  Clear
                </Link>
             )}
           </form>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 text-xs font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-medium flex items-center gap-1 cursor-pointer hover:text-gray-900">
                  Product <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">SKU / Barcode</th>
                <th className="py-3 px-4 font-medium text-right">Cost Price</th>
                <th className="py-3 px-4 font-medium text-right">Selling Price</th>
                <th className="py-3 px-4 font-medium text-right">In Stock</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedProducts.length === 0 ? (
                 <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                       <Package className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                       <p className="text-sm font-medium text-gray-900">No products found</p>
                       <p className="text-xs text-gray-500 mt-1">Adjust your filters or add a new product.</p>
                    </td>
                 </tr>
              ) : (
                displayedProducts.map((p) => {
                  const stock = decimalToNumber(p.currentStock);
                  const minAlert = decimalToNumber(p.minStockAlert);
                  const cost = decimalToNumber(p.purchaseRate);
                  const retail = decimalToNumber(p.saleRate);
                  
                  const isOut = stock <= 0;
                  const isLow = !isOut && stock <= minAlert;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                         <span className="font-medium text-gray-900">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                         {p.category?.name || "Uncategorized"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                         {p.barcode || "-"}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                         {formatCurrency(cost)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                         {formatCurrency(retail)}
                      </td>
                      <td className="py-3 px-4 text-right">
                         <span className="text-gray-900">{stock}</span>
                         <span className="text-gray-400 text-xs ml-1">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                         {isOut ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                             Out of Stock
                           </span>
                         ) : isLow ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                             Low Stock
                           </span>
                         ) : (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                             In Stock
                           </span>
                         )}
                      </td>
                      <td className="py-3 px-4 text-right">
                         <ProductRowActions
                           product={{
                             id: p.id,
                             name: p.name,
                             barcode: p.barcode,
                             categoryId: p.categoryId,
                             unit: p.unit,
                             purchaseRate: cost,
                             saleRate: retail,
                             currentStock: stock,
                             minStockAlert: minAlert,
                           }}
                           categories={categories}
                         />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
           <span>Showing 1 to {displayedProducts.length} of {products.length} entries</span>
           <div className="flex items-center gap-2">
             <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
