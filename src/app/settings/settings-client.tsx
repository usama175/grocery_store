"use client";

import { useState } from "react";
import { User, Bell, Shield, Store } from "lucide-react";
import { updateStoreSettings } from "@/app/actions/settings";

type StoreSettingsType = {
  name: string;
  email: string;
  currency: string;
  timezone: string;
};

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: StoreSettingsType;
}) {
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [storeDetails, setStoreDetails] = useState(initialSettings);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateStoreSettings(storeDetails);
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings: " + res.error);
      }
    } catch (e) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store preferences and account settings.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("store")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "store"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Store className="w-4 h-4" /> Store Details
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "notifications"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "security"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {activeTab === "store" && (
            <>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Store Details</h2>
                <p className="text-sm text-gray-500 mt-1">Update your basic store information and preferences.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={storeDetails.name}
                      onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={storeDetails.email}
                      onChange={(e) => setStoreDetails({ ...storeDetails, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select 
                      value={storeDetails.currency}
                      onChange={(e) => setStoreDetails({ ...storeDetails, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="PKR (Rs)">PKR (Rs)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select 
                      value={storeDetails.timezone}
                      onChange={(e) => setStoreDetails({ ...storeDetails, timezone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="Asia/Karachi (PKT)">Asia/Karachi (PKT)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500 mt-1">Profile settings coming soon.</p>
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">Notification preferences coming soon.</p>
            </div>
          )}
          {activeTab === "security" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500 mt-1">Security settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
