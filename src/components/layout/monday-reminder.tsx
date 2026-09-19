"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Calendar } from "lucide-react";

export function MondayReminder() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    // 1 = Monday
    if (today.getDay() === 1) {
      // Create a unique key for this specific week (e.g. "monday_reminder_2026_09_21")
      const weekKey = `monday_reminder_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
      
      const hasSeen = localStorage.getItem(weekKey);
      if (!hasSeen) {
        setIsVisible(true);
        localStorage.setItem(weekKey, "true");
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-xl shadow-xl p-4 max-w-sm relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Happy Monday!</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Don't forget to download your weekly sales and expense reports for your records.
            </p>
            <div className="mt-3">
              <Link 
                href="/reports"
                onClick={() => setIsVisible(false)}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Go to Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
