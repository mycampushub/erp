
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { ArrowLeft, Plus, Edit, Copy, FileText, Eye, Trash2, Download, X, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BOM {
  id: string;
  bomId: string;
  material: string;
  materialDescription: string;
  version: string;
  status: 'Active' | 'Draft' | 'Inactive' | 'Expired';
  validFrom: string;
  validTo: string;
  plant: string;
  baseQuantity: number;
  baseUnit: string;
  bomUsage: string;
  bomCategory: string;
  components: Component[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

interface Component {
  id: string;
  itemNumber: number;
  componentMaterial: string;
  componentDescription: string;
  quantity: number;
  unit: string;
  scrapPercentage: number;
  validFrom: string;
  validTo: string;
  componentType: 'Material' | 'Text' | 'Document';
  procurementType: 'Buy' | 'Make' | 'Transfer';
}

const STORAGE_KEY = 'boms';

const BOMs: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('boms');
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const { toast } = useToast();

  const defaultForm = {
    material: '',
    materialDescription: '',
    version: '1.0',
    status: 'Draft' as const,
    plant: 'Plant 1000',
    baseQuantity: 1,
    baseUnit: 'EA',
    bomUsage: 'Production',
    bomCategory: 'Material BOM',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    components: [] as Component[],
  };

  const [form, setForm] = useState<Omit<BOM, 'id' | 'bomId' | 'createdBy' | 'createdDate' | 'lastModified'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Bill of Materials Management. Create and manage BOMs, component structures, and manufacturing specifications with comprehensive version control.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = () => {
    const existingBOMs = listEntities<BOM>(STORAGE_KEY);
    if (existingBOMs.length === 0) {
      const sampleBOMs = generateSampleBOMs(30);
      sampleBOMs.forEach(bom => upsertEntity(STORAGE_KEY, bom as any));
      setBOMs(sampleBOMs);
    } else {
      setBOMs(existingBOMs);
    }
  };

  const generateSampleBOMs = (count: number): BOM[] => {
    const materials = [
      { code: 'FG-001', desc: 'Finished Product A - Standard' },
      { code: 'FG-002', desc: 'Finished Product B - Premium' },
      { code: 'FG-003', desc: 'Finished Product C - Economy' },
      { code: 'SF-001', desc: 'Semi-Finished Component X' },
      { code: 'SF-002', desc: 'Semi-Finished Component Y' },
      { code: 'SF-003', desc: 'Semi-Finished Assembly Z' },
      { code: 'ASM-001', desc: 'Assembly Unit Alpha' },
      { code: 'ASM-002', desc: 'Assembly Unit Beta' },
      { code: 'PKG-001', desc: 'Packaging Kit Standard' },
      { code: 'PKG-002', desc: 'Packaging Kit Premium' },
    ];

    const components = [
      { code: 'MAT-BASE-001', desc: 'Base Component Steel', unit: 'KG', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-SCREW-001', desc: 'Stainless Steel Screws M6x20', unit: 'PC', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-PLASTIC-001', desc: 'ABS Plastic Pellets', unit: 'KG', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-COPPER-001', desc: 'Copper Wire 2.5mm', unit: 'M', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-ELECTRONIC-001', desc: 'PCB Assembly', unit: 'EA', type: 'Material' as const, proc: 'Make' as const },
      { code: 'MAT-MOTOR-001', desc: 'DC Motor 12V', unit: 'EA', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-BEARING-001', desc: 'Ball Bearing 6204', unit: 'EA', type: 'Material' as const, proc: 'Buy' as const },
      { code: 'MAT-SEAL-001', desc: 'Rubber Seal Ring', unit: 'EA', type: 'Material' as const, proc: 'Buy' as const },
    ];

    const statuses: BOM['status'][] = ['Active', 'Draft', 'Inactive', 'Expired'];
    const users = ['Manufacturing Engineer', 'Process Engineer', 'Production Manager', 'Quality Engineer'];

    const result: BOM[] = [];
    const baseDate = new Date('2024-01-01');

    for (let i = 1; i <= count; i++) {
      const material = materials[i % materials.length];
      const numComponents = Math.floor(Math.random() * 8) + 2;
      const bomComponents: Component[] = [];

      for (let j = 0; j < numComponents; j++) {
        const comp = components[j % components.length];
        bomComponents.push({
          id: generateId('comp'),
          itemNumber: (j + 1) * 10,
          componentMaterial: comp.code,
          componentDescription: comp.desc,
          quantity: Math.floor(Math.random() * 10) + 1,
          unit: comp.unit,
          scrapPercentage: Math.floor(Math.random() * 10),
          validFrom: baseDate.toISOString().split('T')[0],
          validTo: new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          componentType: comp.type,
          procurementType: comp.proc,
        });
      }

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const versionParts = (Math.random() * 2 + 1).toFixed(1).split('.');
      const createdDate = new Date(baseDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000);

      result.push({
        id: generateId('bom'),
        bomId: `BOM-${String(i).padStart(4, '0')}`,
        material: material.code,
        materialDescription: material.desc,
        version: `${versionParts[0]}.${versionParts[1]}`,
        status,
        validFrom: createdDate.toISOString().split('T')[0],
        validTo: status === 'Expired' ? new Date(createdDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(createdDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plant: `Plant ${1000 + (i % 3) * 1000}`,
        baseQuantity: [1, 2, 5, 10, 20][Math.floor(Math.random() * 5)],
        baseUnit: ['EA', 'SET', 'KG', 'L'][Math.floor(Math.random() * 4)],
        bomUsage: ['Production', 'Sales', 'Engineering'][Math.floor(Math.random() * 3)],
        bomCategory: ['Material BOM', 'Sales BOM', 'Phantom BOM', 'Configurable BOM'][Math.floor(Math.random() * 4)],
        components: bomComponents,
        createdBy: users[Math.floor(Math.random() * users.length)],
        createdDate: createdDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      });
    }

    return result;
  };

  const handleCreateBOM = () => {
    setEditingBOM(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const handleEditBOM = (bom: BOM) => {
    setEditingBOM(bom);
    setForm({
      material: bom.material,
      materialDescription: bom.materialDescription,
      version: bom.version,
      status: bom.status,
      plant: bom.plant,
      baseQuantity: bom.baseQuantity,
      baseUnit: bom.baseUnit,
      bomUsage: bom.bomUsage,
      bomCategory: bom.bomCategory,
      validFrom: bom.validFrom,
      validTo: bom.validTo,
      components: bom.components,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsViewDialogOpen(true);
  };

  const handleDeleteBOM = (bomId: string) => {
    removeEntity(STORAGE_KEY, bomId);
    setBOMs(prev => prev.filter(b => b.id !== bomId));
    toast({
      title: 'BOM Deleted',
      description: 'Bill of Materials has been successfully deleted.',
    });
  };

  const handleSaveBOM = () => {
    if (!form.material.trim()) {
      toast({ title: 'Validation Error', description: 'Material is required.', variant: 'destructive' });
      return;
    }

    if (editingBOM) {
      const updatedBOM = { ...editingBOM, ...form, lastModified: new Date().toISOString().split('T')[0] };
      upsertEntity(STORAGE_KEY, updatedBOM as any);
      setBOMs(prev => prev.map(b => b.id === editingBOM.id ? updatedBOM : b));
      toast({
        title: 'BOM Updated',
        description: 'Bill of Materials has been successfully updated.',
      });
    } else {
      const newBOM: BOM = {
        id: generateId('bom'),
        bomId: `BOM-${String(boms.length + 1).padStart(4, '0')}`,
        components: [],
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        ...form
      };
      upsertEntity(STORAGE_KEY, newBOM as any);
      setBOMs(prev => [...prev, newBOM]);
      toast({
        title: 'BOM Created',
        description: 'New Bill of Materials has been successfully created.',
      });
    }
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleCopyBOM = (bom: BOM) => {
    const copiedBOM = {
      ...bom,
      id: generateId('bom'),
      bomId: `BOM-${String(boms.length + 1).padStart(4, '0')}`,
      version: '1.0',
      status: 'Draft' as const,
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    upsertEntity(STORAGE_KEY, copiedBOM as any);
    setBOMs(prev => [...prev, copiedBOM]);
    toast({ title: 'BOM Copied', description: 'BOM has been copied as a new draft.' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Expired': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'bomId', header: 'BOM ID', sortable: true, searchable: true },
    { key: 'material', header: 'Material', searchable: true },
    { key: 'materialDescription', header: 'Description', searchable: true },
    { key: 'version', header: 'Version', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Expired', value: 'Expired' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'plant', header: 'Plant', searchable: true },
    { key: 'baseQuantity', header: 'Base Qty', render: (value: number, row: BOM) => `${value} ${row.baseUnit}` },
    { key: 'components', header: 'Components', render: (_, row: BOM) => row.components.length },
    { key: 'validFrom', header: 'Valid From', sortable: true },
    { key: 'validTo', header: 'Valid To', sortable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewBOM,
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditBOM,
      variant: 'ghost'
    },
    {
      label: 'Copy',
      icon: <Copy className="h-4 w-4" />,
      onClick: handleCopyBOM,
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: BOM) => handleDeleteBOM(row.id),
      variant: 'ghost'
    }
  ];

  const componentColumns: EnhancedColumn[] = [
    { key: 'itemNumber', header: 'Item', sortable: true },
    { key: 'componentMaterial', header: 'Component', searchable: true },
    { key: 'componentDescription', header: 'Description', searchable: true },
    { key: 'quantity', header: 'Quantity', render: (value: number, row: Component) => `${value} ${row.unit}` },
    { key: 'scrapPercentage', header: 'Scrap %', render: (value: number) => `${value}%` },
    { key: 'componentType', header: 'Type' },
    { key: 'procurementType', header: 'Procurement' }
  ];

  const statusData = ['Active', 'Draft', 'Inactive', 'Expired'].map(status => ({
    name: status,
    count: boms.filter(b => b.status === status).length
  }));

  const COLORS = ['#22c55e', '#f59e0b', '#6b7280', '#ef4444'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/manufacturing')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Bill of Materials Management"
          description="Create and manage BOMs, component structures, and manufacturing specifications"
          voiceIntroduction="Welcome to comprehensive Bill of Materials Management with version control."
        />
      </div>

      <VoiceTrainingComponent 
        module="manufacturing"
        topic="Bill of Materials Management"
        examples={[
          "Creating multi-level BOMs with component specifications, routing information, and material master data integration",
          "Managing BOM versions and change control with engineering change management and approval workflows",
          "Processing BOM explosions and where-used analysis for manufacturing planning and cost calculation"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{boms.length}</div>
            <div className="text-sm text-muted-foreground">Total BOMs</div>
            <div className="text-sm text-blue-600">All versions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {boms.filter(b => b.status === 'Active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active BOMs</div>
            <div className="text-sm text-green-600">Currently used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {boms.filter(b => b.status === 'Draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Draft BOMs</div>
            <div className="text-sm text-yellow-600">Pending approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {boms.length > 0 ? Math.round(boms.reduce((sum, b) => sum + b.components.length, 0) / boms.length * 10) / 10 : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg Components</div>
            <div className="text-sm text-purple-600">Per BOM</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="boms">BOMs</TabsTrigger>
          <TabsTrigger value="create">Create BOM</TabsTrigger>
          <TabsTrigger value="details">BOM Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="boms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Bill of Materials
                <Button onClick={handleCreateBOM}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create BOM
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={boms}
                actions={actions}
                searchPlaceholder="Search BOMs..."
                exportable={true}
                refreshable={true}
                onRefresh={loadBOMs}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New BOM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Material *</Label>
                  <Input
                    value={form.material}
                    onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g. FG-001"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.materialDescription}
                    onChange={(e) => setForm(prev => ({ ...prev, materialDescription: e.target.value }))}
                    placeholder="Material description"
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={form.version}
                    onChange={(e) => setForm(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value: BOM['status']) => setForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plant</Label>
                  <Select value={form.plant} onValueChange={(value) => setForm(prev => ({ ...prev, plant: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                      <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                      <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Quantity</Label>
                  <Input type="number" value={form.baseQuantity} onChange={(e) => setForm(prev => ({ ...prev, baseQuantity: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Base Unit</Label>
                  <Select value={form.baseUnit} onValueChange={(value) => setForm(prev => ({ ...prev, baseUnit: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EA">Each</SelectItem>
                      <SelectItem value="KG">Kilogram</SelectItem>
                      <SelectItem value="L">Liter</SelectItem>
                      <SelectItem value="SET">Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>BOM Usage</Label>
                  <Select value={form.bomUsage} onValueChange={(value) => setForm(prev => ({ ...prev, bomUsage: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valid From</Label>
                  <Input type="date" value={form.validFrom} onChange={(e) => setForm(prev => ({ ...prev, validFrom: e.target.value }))} />
                </div>
                <div>
                  <Label>Valid To</Label>
                  <Input type="date" value={form.validTo} onChange={(e) => setForm(prev => ({ ...prev, validTo: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveBOM}>Create BOM</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedBOM ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>BOM Details: {selectedBOM.bomId}</span>
                    <Badge className={getStatusColor(selectedBOM.status)}>{selectedBOM.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><Label>Material</Label><div className="font-medium">{selectedBOM.material}</div></div>
                    <div><Label>Description</Label><div>{selectedBOM.materialDescription}</div></div>
                    <div><Label>Version</Label><div>{selectedBOM.version}</div></div>
                    <div><Label>Plant</Label><div>{selectedBOM.plant}</div></div>
                    <div><Label>Base Qty</Label><div>{selectedBOM.baseQuantity} {selectedBOM.baseUnit}</div></div>
                    <div><Label>Usage</Label><div>{selectedBOM.bomUsage}</div></div>
                    <div><Label>Category</Label><div>{selectedBOM.bomCategory}</div></div>
                    <div><Label>Components</Label><div>{selectedBOM.components.length}</div></div>
                    <div><Label>Valid From</Label><div>{selectedBOM.validFrom}</div></div>
                    <div><Label>Valid To</Label><div>{selectedBOM.validTo}</div></div>
                    <div><Label>Created By</Label><div>{selectedBOM.createdBy}</div></div>
                    <div><Label>Created Date</Label><div>{selectedBOM.createdDate}</div></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Components ({selectedBOM.components.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedDataTable 
                    columns={componentColumns}
                    data={selectedBOM.components}
                    searchPlaceholder="Search components..."
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No BOM Selected</h3>
                <p className="text-muted-foreground">
                  Select a BOM from the BOMs tab to view details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>BOM Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total BOMs</span>
                    <span className="font-medium">{boms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Components</span>
                    <span className="font-medium">{boms.reduce((sum, b) => sum + b.components.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active BOMs</span>
                    <span className="font-medium">{boms.filter(b => b.status === 'Active').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Components/BOM</span>
                    <span className="font-medium">
                      {boms.length > 0 ? (boms.reduce((sum, b) => sum + b.components.length, 0) / boms.length).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complex BOMs (&gt;5 components)</span>
                    <span className="font-medium">
                      {boms.filter(b => b.components.length > 5).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New BOM</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Material *</Label>
              <Input value={form.material} onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))} placeholder="FG-001" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.materialDescription} onChange={(e) => setForm(prev => ({ ...prev, materialDescription: e.target.value }))} />
            </div>
            <div>
              <Label>Version</Label>
              <Input value={form.version} onChange={(e) => setForm(prev => ({ ...prev, version: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: BOM['status']) => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(prev => ({ ...prev, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                  <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                  <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base Quantity</Label>
              <Input type="number" value={form.baseQuantity} onChange={e => setForm(prev => ({ ...prev, baseQuantity: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBOM}>Create BOM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit BOM: {editingBOM?.bomId}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Material *</Label>
              <Input value={form.material} onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.materialDescription} onChange={(e) => setForm(prev => ({ ...prev, materialDescription: e.target.value }))} />
            </div>
            <div>
              <Label>Version</Label>
              <Input value={form.version} onChange={(e) => setForm(prev => ({ ...prev, version: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: BOM['status']) => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(prev => ({ ...prev, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                  <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                  <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base Quantity</Label>
              <Input type="number" value={form.baseQuantity} onChange={e => setForm(prev => ({ ...prev, baseQuantity: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Valid From</Label>
              <Input type="date" value={form.validFrom} onChange={e => setForm(prev => ({ ...prev, validFrom: e.target.value }))} />
            </div>
            <div>
              <Label>Valid To</Label>
              <Input type="date" value={form.validTo} onChange={e => setForm(prev => ({ ...prev, validTo: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBOM}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>BOM Details: {selectedBOM?.bomId}</DialogTitle>
          </DialogHeader>
          {selectedBOM && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Material</Label><div className="font-medium">{selectedBOM.material}</div></div>
                <div><Label>Description</Label><div>{selectedBOM.materialDescription}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedBOM.status)}>{selectedBOM.status}</Badge></div>
                <div><Label>Version</Label><div>{selectedBOM.version}</div></div>
                <div><Label>Plant</Label><div>{selectedBOM.plant}</div></div>
                <div><Label>Base Qty</Label><div>{selectedBOM.baseQuantity} {selectedBOM.baseUnit}</div></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); handleEditBOM(selectedBOM); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="outline" onClick={() => { setIsViewDialogOpen(false); setActiveTab('details'); }}>View Components</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BOMs;
