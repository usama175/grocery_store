import { Truck, Plus, Search, Edit2, Trash2, Mail, Phone } from "lucide-react";

export default function SuppliersPage() {
  const mockSuppliers = [
    { id: 1, name: "Fresh Farms Inc.", contact: "Ahmed Ali", phone: "0300-1234567", email: "orders@freshfarms.pk", status: "Active" },
    { id: 2, name: "National Foods Dist.", contact: "Sara Khan", phone: "0321-7654321", email: "sales@national.com", status: "Active" },
    { id: 3, name: "Dairy Pure", contact: "Usman Tariq", phone: "0333-9876543", email: "info@dairypure.pk", status: "Inactive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vendor details and contact information.</p>
        </div>
        <button className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search suppliers..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

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
              {mockSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{s.contact}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Phone className="w-3 h-3" /> {s.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {s.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      s.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
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
