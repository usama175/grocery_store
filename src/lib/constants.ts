export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank", label: "Bank Transfer" },
  { value: "udhaar", label: "Udhaar / Credit" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const EXPENSE_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (m) => m.value !== "udhaar",
);

export const EXPENSE_CATEGORIES = [
  { value: "utilities", label: "Utilities (Electricity)" },
  { value: "rent", label: "Rent" },
  { value: "wages", label: "Staff Wages" },
  { value: "supplies", label: "Packaging / Supplies" },
  { value: "delivery", label: "Vendor Delivery" },
  { value: "refreshments", label: "Refreshments" },
  { value: "other", label: "Miscellaneous" },
] as const;

export const PRODUCT_UNITS = ["pcs", "kg", "pack", "liter"] as const;

export const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash Register" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank", label: "Bank" },
] as const;

export const QUICK_CASH_DENOMINATIONS = [100, 500, 1000, 5000] as const;
