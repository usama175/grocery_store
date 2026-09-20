"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "./button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps {
  title: string;
  filename: string;
  columns: string[];
  data: (string | number)[][];
}

export function ExportButton({ title, filename, columns, data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      autoTable(doc, {
        startY: 35,
        head: [columns],
        body: data,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
      });

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExportPDF}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {isExporting ? "Generating..." : "Download PDF"}
    </Button>
  );
}
