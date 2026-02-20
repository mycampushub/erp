
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Download, 
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

export interface EnhancedColumn<T = { id: string }> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;
  render?: (value: unknown, row?: T, index?: number) => React.ReactNode;
  filterOptions?: { label: string; value: string }[];
  exportFormatter?: (value: unknown) => string;
}

export interface TableAction<T = { id: string }> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T, index: number) => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  condition?: (row: T) => boolean;
}

interface EnhancedDataTableProps<T extends { id: string } = { id: string }> {
  columns: EnhancedColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  bulkActions?: TableAction<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  exportable?: boolean;
  importable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  onExport?: (data: T[], format: string) => void;
  onImport?: (data: T[]) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

function EnhancedDataTable<T extends { id: string } = { id: string }>({
  columns,
  data,
  actions = [],
  bulkActions = [],
  searchPlaceholder = "Search...",
  pageSize = 10,
  exportable = true,
  importable = false,
  refreshable = false,
  onRefresh,
  onExport,
  className = "",
  emptyMessage = "No data available",
  loading = false
}: EnhancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(row =>
        searchableColumns.some(col => {
          const value = row[col.key as keyof T];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(row => {
          const colValue = row[key as keyof T];
          return String(colValue) === value;
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleExport = () => {
    const exportData = sortedData;
    if (onExport) {
      onExport(exportData, exportFormat);
    } else {
      const csvContent = generateCSV(exportData);
      downloadFile(csvContent, `export.${exportFormat}`, 'text/csv');
    }
    setIsExportDialogOpen(false);
    toast({
      title: 'Export Successful',
      description: `Data exported as ${exportFormat.toUpperCase()}`,
    });
  };

  const generateCSV = (exportData: T[]): string => {
    if (exportData.length === 0) return '';
    
    const headers = columns.map(col => col.header).join(',');
    const rows = exportData.map(row => 
      columns.map(col => {
        const value = col.exportFormatter 
          ? col.exportFormatter(row[col.key as keyof T])
          : row[col.key as keyof T];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((_, i) => i));
    }
  };

  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {columns.filter(col => col.filterable).map(column => (
            <Select
              key={String(column.key)}
              value={filters[String(column.key)] || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, [String(column.key)]: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={`Filter ${column.header}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {column.header}</SelectItem>
                {column.filterOptions?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {refreshable && onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          
          {exportable && (
            <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
              </TableHead>
              {columns.map(column => (
                <TableHead 
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="w-12">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0) + 1} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0) + 1} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => toggleRow(rowIndex)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  {columns.map(column => (
                    <TableCell key={String(column.key)}>
                      {column.render 
                        ? column.render(row[column.key as keyof T], row, rowIndex)
                        : String(row[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {actions
                          .filter(action => !action.condition || action.condition(row))
                          .map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={() => action.onClick(row, rowIndex)}
                            >
                              {action.icon || action.label}
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {isExportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport}>
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedDataTable;
