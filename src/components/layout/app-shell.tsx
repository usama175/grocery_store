"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  AlertTriangle,
  BarChart2,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/alerts", label: "Stock Alerts", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#171717] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
          sidebarOpen ? "md:w-64" : "md:w-20"
        )}
      >
        {/* Brand */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-emerald-50 text-emerald-600">
              <Package className="w-5 h-5" />
            </div>
            {sidebarOpen && <span className="font-semibold text-sm tracking-tight whitespace-nowrap">GrocerAdmin</span>}
          </div>
          <button 
            className="hidden md:flex text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none",
                  active 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-emerald-600" : "text-gray-500")} />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@store.com</p>
               </div>
             </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 z-10 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search */}
            <div className="hidden sm:flex relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search inventory, orders..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
           <div className="max-w-6xl mx-auto space-y-6">
             {/* Breadcrumbs (Optional but requested) */}
             {pathSegments.length > 0 && (
               <nav className="flex items-center space-x-1 text-sm text-gray-500">
                  <Link href="/" className="hover:text-gray-900">Dashboard</Link>
                  {pathSegments.map((segment, index) => (
                    <div key={segment} className="flex items-center space-x-1">
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className={index === pathSegments.length - 1 ? "text-gray-900 font-medium capitalize" : "capitalize"}>
                        {segment.replace(/-/g, ' ')}
                      </span>
                    </div>
                  ))}
               </nav>
             )}
             
             {children}
           </div>
        </div>
      </main>
    </div>
  );
}
