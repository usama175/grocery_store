import { Tags, Edit2, Trash2 } from "lucide-react";
import { getCategories } from "@/app/actions/categories";
import { CategoryModal } from "@/components/products/category-modal";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your inventory into product categories.</p>
        </div>
        <CategoryModal />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 text-xs font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-medium">Category Name</th>
                <th className="py-3 px-4 font-medium">Total Items</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              )}
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                        <Tags className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c._count.products} items</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Edit (Coming Soon)">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete (Coming Soon)">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
