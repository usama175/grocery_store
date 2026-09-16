import { Truck, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { getSuppliers } from "@/app/actions/suppliers";
import { SupplierModal } from "@/components/suppliers/supplier-modal";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vendor details and contact information.</p>
        </div>
        <SupplierModal />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 text-xs font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-medium">Supplier Name</th>
                <th className="py-3 px-4 font-medium">Contact Person</th>
                <th className="py-3 px-4 font-medium">Contact Info</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No suppliers found. Create your first supplier to get started.
                  </td>
                </tr>
              )}
              {suppliers.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{s.contactPerson || '-'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {s.phone && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3 h-3" /> {s.phone}
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {s.email}
                      </div>
                    )}
                    {!s.phone && !s.email && '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      s.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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
