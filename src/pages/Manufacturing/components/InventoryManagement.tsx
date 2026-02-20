
import React, { useState, useEffect } from 'react';
import { Box, Package, TrendingUp, BarChart2, Plus, Edit, Eye, Trash2, Download, ArrowUpDown, ArrowLeftRight, Warehouse as WarehouseIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../../components/data/EnhancedDataTable';
import { useToast } from '../../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../../lib/localCrud';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface InventoryItem {
  id: string;
  materialNumber: string;
  materialDescription: string;
  materialType: 'Raw Material' | 'Semi-Finished' | 'Finished Goods' | 'Trading Goods' | 'Packaging';
  stockQuantity: number;
  unit: string;
  warehouse: string;
  storageLocation: string;
  binLocation: string;
  reorderPoint: number;
  safetyStock: number;
  maxStock: number;
  standardCost: number;
  averageCost: number;
  lastMovementDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstock';
  createdDate: string;
  lastModified: string;
}

interface StockMovement {
  id: string;
  movementNumber: string;
  movementType: 'Goods Receipt' | 'Goods Issue' | 'Transfer' | 'Adjustment';
  materialNumber: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  fromWarehouse: string;
  toWarehouse: string;
  movementDate: string;
  reference: string;
  performedBy: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: 'Storage' | 'Production' | 'Distribution' | 'Returns';
  address: string;
  city: string;
  country: string;
  capacity: number;
  usedCapacity: number;
  manager: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_INVENTORY = 'warehouse_inventory';
const STORAGE_KEY_MOVEMENTS = 'warehouse_movements';
const STORAGE_KEY_WAREHOUSES = 'warehouse_warehouses';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const InventoryManagement: React.FC = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | StockMovement | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    materialNumber: '',
    materialDescription: '',
    materialType: 'Raw Material',
    stockQuantity: 0,
    unit: 'EA',
    warehouse: '',
    storageLocation: '',
    binLocation: '',
    reorderPoint: 0,
    safetyStock: 0,
    maxStock: 0,
    standardCost: 0,
    averageCost: 0,
    lastMovementDate: '',
    status: 'In Stock',
  });

  const [movementForm, setMovementForm] = useState<Partial<StockMovement>>({
    movementNumber: '',
    movementType: 'Goods Receipt',
    materialNumber: '',
    materialDescription: '',
    quantity: 0,
    unit: 'EA',
    fromWarehouse: '',
    toWarehouse: '',
    movementDate: '',
    reference: '',
    performedBy: '',
    status: 'Pending',
    notes: '',
  });

  const loadData = () => {
    const storedInventory = listEntities<InventoryItem>(STORAGE_KEY_INVENTORY);
    if (storedInventory.length === 0) {
      const materials = [
        { code: 'MAT-1001', name: 'Steel Alloy Sheet 4mm', type: 'Raw Material' as const },
        { code: 'MAT-1002', name: 'Aluminum Extrusion Profile', type: 'Raw Material' as const },
        { code: 'MAT-1003', name: 'Copper Wire 2.5mm', type: 'Raw Material' as const },
        { code: 'MAT-1004', name: 'Plastic Pellets PP', type: 'Raw Material' as const },
        { code: 'MAT-2001', name: 'Widget Assembly A', type: 'Semi-Finished' as const },
        { code: 'MAT-2002', name: 'Component Sub-Assembly B', type: 'Semi-Finished' as const },
        { code: 'MAT-3001', name: 'Finished Product X1', type: 'Finished Goods' as const },
        { code: 'MAT-3002', name: 'Finished Product X2', type: 'Finished Goods' as const },
        { code: 'MAT-4001', name: 'Packaging Box Large', type: 'Packaging' as const },
        { code: 'MAT-4002', name: 'Packing Foam Roll', type: 'Packaging' as const },
      ];
      const warehouseCodes = ['WH-001', 'WH-002', 'WH-003', 'WH-004', 'WH-005'];
      const locations = ['A', 'B', 'C', 'D'];
      const statuses: InventoryItem['status'][] = ['In Stock', 'Low Stock', 'Out of Stock', 'Overstock'];
      const units = ['EA', 'KG', 'M', 'L', 'BOX'];

      const sample: InventoryItem[] = Array.from({ length: 30 }, (_, i) => {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const warehouse = warehouseCodes[Math.floor(Math.random() * warehouseCodes.length)];
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const reorderPoint = Math.floor(Math.random() * 200) + 100;
        const safetyStock = Math.floor(reorderPoint * 0.5);
        const maxStock = reorderPoint * 5;
        const stockQuantity = Math.floor(Math.random() * maxStock);
        
        let status: InventoryItem['status'] = 'In Stock';
        if (stockQuantity <= 0) status = 'Out of Stock';
        else if (stockQuantity < safetyStock) status = 'Low Stock';
        else if (stockQuantity > maxStock * 0.9) status = 'Overstock';

        return {
          id: generateId('INV'),
          materialNumber: `${material.code}-${String(i + 1).padStart(3, '0')}`,
          materialDescription: material.name,
          materialType: material.type,
          stockQuantity,
          unit: units[Math.floor(Math.random() * units.length)],
          warehouse,
          storageLocation: `${loc}-${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
          binLocation: `${loc}-${Math.floor(Math.random() * 50) + 1}`,
          reorderPoint,
          safetyStock,
          maxStock,
          standardCost: Math.floor(Math.random() * 500) + 10,
          averageCost: Math.floor(Math.random() * 450) + 15,
          lastMovementDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          status,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_INVENTORY, o as any));
    }
    setInventory(listEntities<InventoryItem>(STORAGE_KEY_INVENTORY));

    const storedMovements = listEntities<StockMovement>(STORAGE_KEY_MOVEMENTS);
    if (storedMovements.length === 0) {
      const materials = [
        { code: 'MAT-1001', name: 'Steel Alloy Sheet 4mm' },
        { code: 'MAT-1002', name: 'Aluminum Extrusion Profile' },
        { code: 'MAT-1003', name: 'Copper Wire 2.5mm' },
        { code: 'MAT-3001', name: 'Finished Product X1' },
        { code: 'MAT-3002', name: 'Finished Product X2' },
      ];
      const warehouseCodes = ['WH-001', 'WH-002', 'WH-003', 'WH-004', 'WH-005'];
      const movementTypes: StockMovement['movementType'][] = ['Goods Receipt', 'Goods Issue', 'Transfer', 'Adjustment'];
      const statuses: StockMovement['status'][] = ['Pending', 'Completed', 'Cancelled'];
      const users = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson'];

      const sample: StockMovement[] = Array.from({ length: 30 }, (_, i) => {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
        const fromWarehouse = movementType === 'Goods Receipt' ? 'External' : warehouseCodes[Math.floor(Math.random() * warehouseCodes.length)];
        const toWarehouse = movementType === 'Goods Issue' ? 'External' : warehouseCodes[Math.floor(Math.random() * warehouseCodes.length)];

        return {
          id: generateId('MOV'),
          movementNumber: `MOV-2025-${String(i + 1).padStart(4, '0')}`,
          movementType,
          materialNumber: material.code,
          materialDescription: material.name,
          quantity: Math.floor(Math.random() * 500) + 10,
          unit: 'EA',
          fromWarehouse,
          toWarehouse,
          movementDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          reference: `PO-${Math.floor(Math.random() * 10000) + 1000}`,
          performedBy: users[Math.floor(Math.random() * users.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_MOVEMENTS, o as any));
    }
    setMovements(listEntities<StockMovement>(STORAGE_KEY_MOVEMENTS));

    const storedWarehouses = listEntities<Warehouse>(STORAGE_KEY_WAREHOUSES);
    if (storedWarehouses.length === 0) {
      const warehouseData = [
        { code: 'WH-001', name: 'Main Storage Facility', type: 'Storage' as const, city: 'Chicago', country: 'USA' },
        { code: 'WH-002', name: 'East Distribution Center', type: 'Distribution' as const, city: 'New York', country: 'USA' },
        { code: 'WH-003', name: 'West Production Warehouse', type: 'Production' as const, city: 'Los Angeles', country: 'USA' },
        { code: 'WH-004', name: 'Returns Processing Center', type: 'Returns' as const, city: 'Dallas', country: 'USA' },
        { code: 'WH-005', name: 'South Regional Hub', type: 'Distribution' as const, city: 'Atlanta', country: 'USA' },
      ];
      const managers = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson'];

      const sample: Warehouse[] = warehouseData.map((w, i) => ({
        id: generateId('WH'),
        warehouseCode: w.code,
        warehouseName: w.name,
        warehouseType: w.type,
        address: `${1000 + i * 100} Industrial Blvd`,
        city: w.city,
        country: w.country,
        capacity: 10000,
        usedCapacity: Math.floor(Math.random() * 8000) + 2000,
        manager: managers[i],
        status: 'Active' as const,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }));
      sample.forEach(o => upsertEntity(STORAGE_KEY_WAREHOUSES, o as any));
    }
    setWarehouses(listEntities<Warehouse>(STORAGE_KEY_WAREHOUSES));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveItem = () => {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: editingItem?.id || generateId('INV'),
      materialNumber: itemForm.materialNumber || '',
      materialDescription: itemForm.materialDescription || '',
      materialType: itemForm.materialType || 'Raw Material',
      stockQuantity: itemForm.stockQuantity || 0,
      unit: itemForm.unit || 'EA',
      warehouse: itemForm.warehouse || '',
      storageLocation: itemForm.storageLocation || '',
      binLocation: itemForm.binLocation || '',
      reorderPoint: itemForm.reorderPoint || 0,
      safetyStock: itemForm.safetyStock || 0,
      maxStock: itemForm.maxStock || 0,
      standardCost: itemForm.standardCost || 0,
      averageCost: itemForm.averageCost || 0,
      lastMovementDate: itemForm.lastMovementDate || now.split('T')[0],
      status: itemForm.status || 'In Stock',
      createdDate: editingItem?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_INVENTORY, newItem as any);
    setInventory(listEntities<InventoryItem>(STORAGE_KEY_INVENTORY));
    setItemDialogOpen(false);
    setEditingItem(null);
    setItemForm({
      materialNumber: '', materialDescription: '', materialType: 'Raw Material', stockQuantity: 0,
      unit: 'EA', warehouse: '', storageLocation: '', binLocation: '', reorderPoint: 0,
      safetyStock: 0, maxStock: 0, standardCost: 0, averageCost: 0, lastMovementDate: '', status: 'In Stock',
    });
    toast({ title: 'Success', description: `Item ${editingItem ? 'updated' : 'created'} successfully` });
  };

  const handleSaveMovement = () => {
    const now = new Date().toISOString();
    const newMovement: StockMovement = {
      id: editingMovement?.id || generateId('MOV'),
      movementNumber: editingMovement?.movementNumber || `MOV-2025-${String(Date.now()).slice(-4)}`,
      movementType: movementForm.movementType || 'Goods Receipt',
      materialNumber: movementForm.materialNumber || '',
      materialDescription: movementForm.materialDescription || '',
      quantity: movementForm.quantity || 0,
      unit: movementForm.unit || 'EA',
      fromWarehouse: movementForm.fromWarehouse || '',
      toWarehouse: movementForm.toWarehouse || '',
      movementDate: movementForm.movementDate || now.split('T')[0],
      reference: movementForm.reference || '',
      performedBy: movementForm.performedBy || '',
      status: movementForm.status || 'Pending',
      notes: movementForm.notes,
      createdDate: editingMovement?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_MOVEMENTS, newMovement as any);
    setMovements(listEntities<StockMovement>(STORAGE_KEY_MOVEMENTS));
    setMovementDialogOpen(false);
    setEditingMovement(null);
    setMovementForm({
      movementNumber: '', movementType: 'Goods Receipt', materialNumber: '', materialDescription: '',
      quantity: 0, unit: 'EA', fromWarehouse: '', toWarehouse: '', movementDate: '', reference: '',
      performedBy: '', status: 'Pending', notes: '',
    });
    toast({ title: 'Success', description: `Movement ${editingMovement ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteItem = (id: string) => {
    removeEntity(STORAGE_KEY_INVENTORY, id);
    setInventory(listEntities<InventoryItem>(STORAGE_KEY_INVENTORY));
    toast({ title: 'Deleted', description: 'Item deleted successfully' });
  };

  const handleDeleteMovement = (id: string) => {
    removeEntity(STORAGE_KEY_MOVEMENTS, id);
    setMovements(listEntities<StockMovement>(STORAGE_KEY_MOVEMENTS));
    toast({ title: 'Deleted', description: 'Movement deleted successfully' });
  };

  const openEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm(item);
    setItemDialogOpen(true);
  };

  const openEditMovement = (movement: StockMovement) => {
    setEditingMovement(movement);
    setMovementForm(movement);
    setMovementDialogOpen(true);
  };

  const openView = (item: InventoryItem | StockMovement) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const inventoryColumns: EnhancedColumn<InventoryItem>[] = [
    { key: 'materialNumber', header: 'Material #', sortable: true },
    { key: 'materialDescription', header: 'Description', sortable: true },
    { key: 'materialType', header: 'Type', sortable: true },
    { key: 'stockQuantity', header: 'Qty', sortable: true },
    { key: 'unit', header: 'Unit', sortable: true },
    { key: 'warehouse', header: 'Warehouse', sortable: true },
    { key: 'storageLocation', header: 'Location', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'In Stock': 'bg-green-100 text-green-800',
          'Low Stock': 'bg-yellow-100 text-yellow-800',
          'Out of Stock': 'bg-red-100 text-red-800',
          'Overstock': 'bg-blue-100 text-blue-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const movementColumns: EnhancedColumn<StockMovement>[] = [
    { key: 'movementNumber', header: 'Movement #', sortable: true },
    { key: 'movementType', header: 'Type', sortable: true },
    { key: 'materialNumber', header: 'Material', sortable: true },
    { key: 'quantity', header: 'Qty', sortable: true },
    { key: 'fromWarehouse', header: 'From', sortable: true },
    { key: 'toWarehouse', header: 'To', sortable: true },
    { key: 'movementDate', header: 'Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-green-100 text-green-800',
          'Cancelled': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const warehouseColumns: EnhancedColumn<Warehouse>[] = [
    { key: 'warehouseCode', header: 'Code', sortable: true },
    { key: 'warehouseName', header: 'Name', sortable: true },
    { key: 'warehouseType', header: 'Type', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'capacity', header: 'Capacity', sortable: true },
    { key: 'usedCapacity', header: 'Used', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Active': 'bg-green-100 text-green-800',
          'Inactive': 'bg-gray-100 text-gray-800',
          'Maintenance': 'bg-yellow-100 text-yellow-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const inventoryActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditItem(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteItem(row.id), variant: 'ghost' },
  ];

  const movementActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditMovement(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteMovement(row.id), variant: 'ghost' },
  ];

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stockQuantity * item.averageCost), 0);
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const usedCapacity = warehouses.reduce((sum, w) => sum + w.usedCapacity, 0);
  const utilizationRate = totalCapacity > 0 ? ((usedCapacity / totalCapacity) * 100).toFixed(1) : '0';
  const inboundOrders = movements.filter(m => m.movementType === 'Goods Receipt' && m.status === 'Pending').length;
  const outboundOrders = movements.filter(m => m.movementType === 'Goods Issue' && m.status === 'Pending').length;

  const statusData = [
    { name: 'In Stock', value: inventory.filter(i => i.status === 'In Stock').length },
    { name: 'Low Stock', value: inventory.filter(i => i.status === 'Low Stock').length },
    { name: 'Out of Stock', value: inventory.filter(i => i.status === 'Out of Stock').length },
    { name: 'Overstock', value: inventory.filter(i => i.status === 'Overstock').length },
  ];

  const warehouseData = warehouses.map(w => ({
    name: w.warehouseCode,
    capacity: w.capacity,
    used: w.usedCapacity,
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
        <Button size="sm" onClick={() => { setEditingItem(null); setItemForm({ materialNumber: '', materialDescription: '', materialType: 'Raw Material', stockQuantity: 0, unit: 'EA', warehouse: '', storageLocation: '', binLocation: '', reorderPoint: 0, safetyStock: 0, maxStock: 0, standardCost: 0, averageCost: 0, lastMovementDate: '', status: 'In Stock' }); setItemDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-2">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-gray-500 truncate">Total Value</div>
              <div className="text-sm font-bold truncate">${totalInventoryValue.toLocaleString()}</div>
            </div>
            <Box className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-gray-500 truncate">Utilization</div>
              <div className="text-sm font-bold truncate">{utilizationRate}%</div>
            </div>
            <WarehouseIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-gray-500 truncate">Inbound</div>
              <div className="text-sm font-bold truncate">{inboundOrders}</div>
            </div>
            <ArrowUpDown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-gray-500 truncate">Outbound</div>
              <div className="text-sm font-bold truncate">{outboundOrders}</div>
            </div>
            <ArrowLeftRight className="h-4 w-4 text-purple-600 flex-shrink-0" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="inventory" className="text-xs px-2 sm:px-3">Inventory ({inventory.length})</TabsTrigger>
          <TabsTrigger value="movements" className="text-xs px-2 sm:px-3">Movements ({movements.length})</TabsTrigger>
          <TabsTrigger value="warehouses" className="text-xs px-2 sm:px-3">Warehouses ({warehouses.length})</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs px-2 sm:px-3">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-base font-semibold">Inventory Items</h3>
              <Button size="sm" onClick={() => { setEditingItem(null); setItemForm({ materialNumber: '', materialDescription: '', materialType: 'Raw Material', stockQuantity: 0, unit: 'EA', warehouse: '', storageLocation: '', binLocation: '', reorderPoint: 0, safetyStock: 0, maxStock: 0, standardCost: 0, averageCost: 0, lastMovementDate: '', status: 'In Stock' }); setItemDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
            </div>
            <EnhancedDataTable columns={inventoryColumns} data={inventory} actions={inventoryActions} searchPlaceholder="Search..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-base font-semibold">Stock Movements</h3>
              <Button size="sm" onClick={() => { setEditingMovement(null); setMovementForm({ movementNumber: '', movementType: 'Goods Receipt', materialNumber: '', materialDescription: '', quantity: 0, unit: 'EA', fromWarehouse: '', toWarehouse: '', movementDate: '', reference: '', performedBy: '', status: 'Pending', notes: '' }); setMovementDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" />Create Movement</Button>
            </div>
            <EnhancedDataTable columns={movementColumns} data={movements} actions={movementActions} searchPlaceholder="Search..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-base font-semibold">Warehouse Locations</h3>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Warehouse</Button>
            </div>
            <EnhancedDataTable columns={warehouseColumns} data={warehouses} searchPlaceholder="Search..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-3">
            <h3 className="text-base font-semibold mb-3">Inventory Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-2 border rounded">
                <h4 className="font-medium mb-2 text-sm">Status Distribution</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={50} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-2 border rounded">
                <h4 className="font-medium mb-2 text-sm">Warehouse Capacity</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={warehouseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="capacity" fill="#3B82F6" name="Capacity" />
                    <Bar dataKey="used" fill="#10B981" name="Used" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Material Number</Label>
              <Input value={itemForm.materialNumber || ''} onChange={e => setItemForm({ ...itemForm, materialNumber: e.target.value })} />
            </div>
            <div>
              <Label>Material Type</Label>
              <Select value={itemForm.materialType} onValueChange={value => setItemForm({ ...itemForm, materialType: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Raw Material">Raw Material</SelectItem>
                  <SelectItem value="Semi-Finished">Semi-Finished</SelectItem>
                  <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                  <SelectItem value="Trading Goods">Trading Goods</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input value={itemForm.materialDescription || ''} onChange={e => setItemForm({ ...itemForm, materialDescription: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={itemForm.stockQuantity || ''} onChange={e => setItemForm({ ...itemForm, stockQuantity: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={itemForm.unit} onValueChange={value => setItemForm({ ...itemForm, unit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EA">EA</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="BOX">BOX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Warehouse</Label>
              <Input value={itemForm.warehouse || ''} onChange={e => setItemForm({ ...itemForm, warehouse: e.target.value })} />
            </div>
            <div>
              <Label>Storage Location</Label>
              <Input value={itemForm.storageLocation || ''} onChange={e => setItemForm({ ...itemForm, storageLocation: e.target.value })} />
            </div>
            <div>
              <Label>Bin Location</Label>
              <Input value={itemForm.binLocation || ''} onChange={e => setItemForm({ ...itemForm, binLocation: e.target.value })} />
            </div>
            <div>
              <Label>Reorder Point</Label>
              <Input type="number" value={itemForm.reorderPoint || ''} onChange={e => setItemForm({ ...itemForm, reorderPoint: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Safety Stock</Label>
              <Input type="number" value={itemForm.safetyStock || ''} onChange={e => setItemForm({ ...itemForm, safetyStock: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Max Stock</Label>
              <Input type="number" value={itemForm.maxStock || ''} onChange={e => setItemForm({ ...itemForm, maxStock: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Standard Cost</Label>
              <Input type="number" value={itemForm.standardCost || ''} onChange={e => setItemForm({ ...itemForm, standardCost: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Average Cost</Label>
              <Input type="number" value={itemForm.averageCost || ''} onChange={e => setItemForm({ ...itemForm, averageCost: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={itemForm.status} onValueChange={value => setItemForm({ ...itemForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem}>{editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMovement ? 'Edit Movement' : 'Create Movement'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Movement Type</Label>
              <Select value={movementForm.movementType} onValueChange={value => setMovementForm({ ...movementForm, movementType: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goods Receipt">Goods Receipt</SelectItem>
                  <SelectItem value="Goods Issue">Goods Issue</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input value={movementForm.reference || ''} onChange={e => setMovementForm({ ...movementForm, reference: e.target.value })} />
            </div>
            <div>
              <Label>Material Number</Label>
              <Input value={movementForm.materialNumber || ''} onChange={e => setMovementForm({ ...movementForm, materialNumber: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={movementForm.materialDescription || ''} onChange={e => setMovementForm({ ...movementForm, materialDescription: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={movementForm.quantity || ''} onChange={e => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={movementForm.unit} onValueChange={value => setMovementForm({ ...movementForm, unit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EA">EA</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Warehouse</Label>
              <Input value={movementForm.fromWarehouse || ''} onChange={e => setMovementForm({ ...movementForm, fromWarehouse: e.target.value })} />
            </div>
            <div>
              <Label>To Warehouse</Label>
              <Input value={movementForm.toWarehouse || ''} onChange={e => setMovementForm({ ...movementForm, toWarehouse: e.target.value })} />
            </div>
            <div>
              <Label>Movement Date</Label>
              <Input type="date" value={movementForm.movementDate || ''} onChange={e => setMovementForm({ ...movementForm, movementDate: e.target.value })} />
            </div>
            <div>
              <Label>Performed By</Label>
              <Input value={movementForm.performedBy || ''} onChange={e => setMovementForm({ ...movementForm, performedBy: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={movementForm.status} onValueChange={value => setMovementForm({ ...movementForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={movementForm.notes || ''} onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMovement}>{editingMovement ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(viewingItem).filter(([key]) => !['id', 'createdDate', 'lastModified'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <div className="text-sm">{String(value) || '-'}</div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
