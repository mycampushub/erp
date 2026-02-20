import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { format } from 'date-fns';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface CrudAction<T> {
  label?: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

interface FormField<T> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'date' | 'datetime' | 'checkbox' | 'currency';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  rows?: number;
}

interface CRUDDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  item: T | null;
  onSave: (item: T) => void;
  fields: FormField<T>[];
  isEdit?: boolean;
}

export function CRUDDialog<T extends { id: string }>({
  open,
  onOpenChange,
  title,
  item,
  onSave,
  fields,
  isEdit = false
}: CRUDDialogProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData(item as Record<string, any>);
    } else {
      setFormData({});
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as T);
    toast({
      title: isEdit ? 'Item Updated' : 'Item Created',
      description: `${title} has been ${isEdit ? 'updated' : 'created'} successfully.`
    });
    onOpenChange(false);
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getValue = (name: string): any => {
    return formData[name] ?? '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} {title}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the' : 'Fill in the'} details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={field.name} className="mb-2 block">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    id={field.name}
                    type="number"
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                  />
                )}
                {field.type === 'email' && (
                  <Input
                    id={field.name}
                    type="email"
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                    rows={field.rows || 3}
                  />
                )}
                {field.type === 'date' && (
                  <Input
                    id={field.name}
                    type="date"
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    disabled={field.disabled}
                  />
                )}
                {field.type === 'datetime' && (
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={getValue(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    disabled={field.disabled}
                  />
                )}
                {field.type === 'select' && (
                  <Select
                    value={getValue(field.name)}
                    onValueChange={(value) => handleChange(field.name, value)}
                    disabled={field.disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === 'currency' && (
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <Input
                      id={field.name}
                      type="number"
                      className="pl-7"
                      value={getValue(field.name)}
                      onChange={(e) => handleChange(field.name, Number(e.target.value))}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={field.disabled}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm'
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ViewDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  item: T | null;
  fields: { key: string; label: string; render?: (value: any) => React.ReactNode }[];
}

export function ViewDialog<T extends { id: string }>({
  open,
  onOpenChange,
  title,
  item,
  fields
}: ViewDialogProps<T>) {
  if (!item) return null;

  const getValue = (key: string): any => {
    return (item as any)[key];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title} Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label className="text-gray-500 text-sm">{field.label}</Label>
              <div className="mt-1">
                {field.render ? field.render(getValue(field.key)) : String(getValue(field.key) || '-')}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EnhancedCRUDTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchPlaceholder?: string;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  actions?: CrudAction<T>[];
  pageSize?: number;
  loading?: boolean;
}

export function EnhancedCRUDTable<T extends { id: string }>({
  data,
  columns,
  title,
  searchPlaceholder = 'Search...',
  onCreate,
  onEdit,
  onDelete,
  onView,
  actions = [],
  pageSize = 10,
  loading = false
}: EnhancedCRUDTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const { toast } = useToast();

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return Object.values(row as Record<string, any>).some(
      (val) => val !== undefined && String(val).toLowerCase().includes(search)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];
    if (aVal === bVal) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleDelete = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
      toast({
        title: 'Item Deleted',
        description: 'The item has been deleted successfully.',
        variant: 'destructive'
      });
    }
    setDeleteItem(null);
  };

  const getCellValue = (row: T, col: Column<T>) => {
    const value = (row as any)[col.key];
    if (col.render) {
      return col.render(value, row);
    }
    return String(value || '');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <div className="flex flex-wrap gap-2">
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete || onView || actions.length > 0) && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {getCellValue(row, col)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView || actions.length > 0) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onView && (
                          <Button variant="ghost" size="sm" onClick={() => onView(row)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant || 'ghost'}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.icon}
                          </Button>
                        ))}
                        {onDelete && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(row)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
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
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </Card>
  );
}

export function formatCurrency(value: number, currency = 'USD'): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return String(date);
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value?.toFixed(1) || 0}%`;
}
