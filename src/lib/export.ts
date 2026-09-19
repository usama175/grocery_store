import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCSV(data: any[][], filename: string) {
  const csvContent = data
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(headers: string[], data: any[][], title: string, filename: string) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Auto table
  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: data,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
    styles: { fontSize: 9 },
  });

  doc.save(`${filename}.pdf`);
}
