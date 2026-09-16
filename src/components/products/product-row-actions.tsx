"use client";

import { useState } from "react";
import { deactivateProduct } from "@/app/actions/products";
import { ProductModal } from "./product-modal";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductRowActions({
  product,
  categories,
}: {
  product: {
    id: number;
    name: string;
    barcode: string | null;
    categoryId: number | null;
    unit: string;
    purchaseRate: number;
    saleRate: number;
    currentStock: number;
    minStockAlert: number;
  };
  categories: { id: number; name: string }[];
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDeactivate = async () => {
    if (confirm(`Deactivate product "${product.name}"?`)) {
      setDeleting(true);
      await deactivateProduct(product.id);
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <ProductModal categories={categories} productToEdit={product} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={deleting}
        onClick={handleDeactivate}
        className="text-slate-400 hover:text-red-600 h-8 px-2"
        title="Deactivate SKU"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
