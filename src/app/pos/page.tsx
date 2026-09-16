import { getCategories, getProducts } from "@/app/actions/products";
import { getCustomers } from "@/app/actions/customers";
import { PosCheckout } from "@/components/pos/pos-checkout";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [products, customers, categories] = await Promise.all([
    getProducts(),
    getCustomers(),
    getCategories(),
  ]);

  const posProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    saleRate: p.saleRate.toString(),
    purchaseRate: p.purchaseRate.toString(),
    currentStock: p.currentStock.toString(),
    unit: p.unit,
    category: p.category,
    categoryId: p.categoryId,
  }));

  const posCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    balance: c.balance.toString(),
  }));

  return (
    <div>
      <PosCheckout
        products={posProducts}
        customers={posCustomers}
        categories={categories}
      />
    </div>
  );
}
