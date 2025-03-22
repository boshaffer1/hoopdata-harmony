import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, ArrowUpDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: Record<string, any>[];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  // Get all column headers from the first data item
  const columns = Object.keys(data[0]);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter data based on search term
  const filteredData = data.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort data based on sort column and direction
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    
    // Check if values are numbers
    const aNum = Number(valueA);
    const bNum = Number(valueB);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }
    
    // Otherwise, sort as strings
    const aStr = String(valueA).toLowerCase();
    const bStr = String(valueB).toLowerCase();
    
    if (sortDirection === "asc") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  // Export data as CSV
  const exportCSV = () => {
    // Create CSV header
    const csvHeader = columns.join(",");
    
    // Create CSV rows
    const csvRows = sortedData.map(row => {
      return columns.map(column => {
        // Handle values that contain commas by wrapping in quotes
        const value = row[column];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      }).join(",");
    });
    
    // Combine header and rows
    const csvString = [csvHeader, ...csvRows].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full md:w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search data..."
            className="pl-9"
          />
        </div>
        
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(column)}
                    >
                      {column}
                      {sortColumn === column && (
                        <ArrowUpDown className={cn(
                          "h-4 w-4 transition-transform",
                          sortDirection === "desc" && "rotate-180"
                        )} />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 align-top truncate max-w-[200px]">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No results found</p>
          </div>
        )}
        
        <div className="bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
          Showing {sortedData.length} of {data.length} entries
        </div>
      </div>
    </div>
  );
};

export default DataTable;
