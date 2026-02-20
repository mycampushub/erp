
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus, Filter, Edit, Trash2, MapPin, Users, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';

interface Territory {
  id: string;
  territoryNumber?: string;
  name: string;
  region: string;
  salesRep: string;
  salesRepId?: string;
  manager?: string;
  countries?: string[];
  states?: string[];
  cities?: string[];
  customers?: number;
  prospects?: number;
  revenue?: number;
  target: number;
  achieved?: number;
  achievement?: number;
  lastQuarter?: number;
  growth?: number;
  status: 'Active' | 'Inactive';
}

interface TerritoryRule {
  id: string;
  ruleNumber?: string;
  name: string;
  territoryId?: string;
  type?: string;
  conditionType?: string;
  conditionValue?: string;
  criteria?: string;
  priority?: number;
  isActive?: boolean;
}

const STORAGE_KEY_TERRITORIES = 'sales_territories';
const STORAGE_KEY_RULES = 'sales_territory_rules';

const sampleTerritories: Territory[] = [
  { id: generateId('terr'), name: 'North America', region: 'Americas', salesRep: 'John Smith', target: 5000000, achieved: 3200000, customers: 45, status: 'Active' },
  { id: generateId('terr'), name: 'Europe West', region: 'Europe', salesRep: 'Sarah Johnson', target: 4000000, achieved: 2800000, customers: 38, status: 'Active' },
  { id: generateId('terr'), name: 'Asia Pacific', region: 'Asia', salesRep: 'Mike Brown', target: 3000000, achieved: 2100000, customers: 28, status: 'Active' },
];

const sampleTerritoryRules: TerritoryRule[] = [
  { id: generateId('rule'), name: 'High Value Customers', territoryId: '', conditionType: 'revenue', conditionValue: '>100000', priority: 1 },
  { id: generateId('rule'), name: 'Tech Industry', territoryId: '', conditionType: 'industry', conditionValue: 'Technology', priority: 2 },
];

const TerritoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('territories');
  const [territories, setTerritories] = useState<Territory[]>(() => sampleTerritories);
  const [territoryRules, setTerritoryRules] = useState<TerritoryRule[]>(() => sampleTerritoryRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'territory' | 'rule'>('territory');
  const [selectedItem, setSelectedItem] = useState<Territory | TerritoryRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    setIsLoading(false);
  };

  const filteredTerritories = territories.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.salesRep.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTerritory = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('territory');
    setIsDialogOpen(true);
  };

  const handleCreateRule = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('rule');
    setIsDialogOpen(true);
  };

  const handleEditTerritory = (territory: Territory) => {
    setSelectedItem(territory);
    setIsEditing(true);
    setDialogType('territory');
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: TerritoryRule) => {
    setSelectedItem(rule);
    setIsEditing(true);
    setDialogType('rule');
    setIsDialogOpen(true);
  };

  const handleDeleteTerritory = (territory: Territory) => {
    if (window.confirm(`Delete territory ${territory.name}?`)) {
      removeEntity(STORAGE_KEY_TERRITORIES, territory.id);
      loadData();
      toast({ title: 'Deleted', description: 'Territory has been deleted.' });
    }
  };

  const handleDeleteRule = (rule: TerritoryRule) => {
    if (window.confirm(`Delete rule ${rule.name}?`)) {
      removeEntity(STORAGE_KEY_RULES, rule.id);
      loadData();
      toast({ title: 'Deleted', description: 'Territory rule has been deleted.' });
    }
  };

  const handleSaveTerritory = (data: Partial<Territory>) => {
    if (isEditing && selectedItem) {
      upsertEntity(STORAGE_KEY_TERRITORIES, { ...selectedItem, ...data } as Territory);
      toast({ title: 'Updated', description: 'Territory has been updated.' });
    } else {
      const newTerritory: Territory = {
        id: generateId('terr'),
        territoryNumber: `TERR-${String(territories.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        region: data.region || 'North America',
        salesRep: data.salesRep || '',
        salesRepId: data.salesRepId || '',
        manager: data.manager || '',
        countries: data.countries || [],
        states: data.states || [],
        cities: data.cities || [],
        customers: data.customers || 0,
        prospects: data.prospects || 0,
        revenue: data.revenue || 0,
        target: data.target || 0,
        achievement: data.achievement || 0,
        lastQuarter: data.lastQuarter || 0,
        growth: data.growth || 0,
        status: 'Active'
      };
      upsertEntity(STORAGE_KEY_TERRITORIES, newTerritory);
      toast({ title: 'Created', description: 'Territory has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleSaveRule = (data: Partial<TerritoryRule>) => {
    if (isEditing && selectedItem) {
      upsertEntity(STORAGE_KEY_RULES, { ...selectedItem, ...data } as TerritoryRule);
      toast({ title: 'Updated', description: 'Territory rule has been updated.' });
    } else {
      const newRule: TerritoryRule = {
        id: generateId('terrrule'),
        ruleNumber: `RULE-${String(territoryRules.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        type: data.type || 'Geographic',
        criteria: data.criteria || '',
        priority: data.priority || 1,
        isActive: true
      };
      upsertEntity(STORAGE_KEY_RULES, newRule);
      toast({ title: 'Created', description: 'Territory rule has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const territoryColumns: EnhancedColumn[] = [
    { key: 'territoryNumber', header: 'Territory ID', sortable: true },
    { key: 'name', header: 'Territory Name', sortable: true, searchable: true },
    { key: 'region', header: 'Region', sortable: true },
    { key: 'salesRep', header: 'Sales Rep', sortable: true, searchable: true },
    { key: 'customers', header: 'Customers', sortable: true },
    { key: 'revenue', header: 'Revenue', sortable: true, render: (v: number) => `$${(v / 1000).toFixed(0)}K` },
    { key: 'achievement', header: 'Achievement', sortable: true, render: (v: number) => `${v.toFixed(1)}%` },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'default' : 'outline'}>{value}</Badge>
      )
    }
  ];

  const territoryActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Territory) => handleEditTerritory(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Territory) => handleDeleteTerritory(row),
      variant: 'ghost'
    }
  ];

  const ruleColumns: EnhancedColumn[] = [
    { key: 'ruleNumber', header: 'Rule ID', sortable: true },
    { key: 'name', header: 'Rule Name', sortable: true, searchable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'criteria', header: 'Criteria' },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'isActive', header: 'Status', render: (v: boolean) => <Badge variant={v ? 'default' : 'outline'}>{v ? 'Active' : 'Inactive'}</Badge> }
  ];

  const ruleActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: TerritoryRule) => handleEditRule(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: TerritoryRule) => handleDeleteRule(row),
      variant: 'ghost'
    }
  ];

  const territoryMetrics = [
    { title: 'Total Territories', value: territories.length },
    { title: 'Total Customers', value: territories.reduce((sum, t) => sum + t.customers, 0) },
    { title: 'Total Revenue', value: `$${(territories.reduce((sum, t) => sum + t.revenue, 0) / 1000000).toFixed(1)}M` },
    { title: 'Avg Achievement', value: `${(territories.reduce((sum, t) => sum + t.achievement, 0) / territories.length).toFixed(1)}%` }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Territory Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleCreateRule}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
          <Button onClick={handleCreateTerritory}>
            <Plus className="h-4 w-4 mr-2" />
            Create Territory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {territoryMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="territories">Territories ({territories.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rules">Assignment Rules ({territoryRules.length})</TabsTrigger>
          <TabsTrigger value="planning">Territory Planning</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="territories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search territories..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={territoryColumns}
                  data={filteredTerritories}
                  actions={territoryActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance charts by region and territory.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Assignment Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={ruleColumns}
                  data={territoryRules}
                  actions={ruleActions}
                  exportable={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Territory optimization and capacity planning tools.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Territory Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Territory Performance</span>
                  <span className="text-xs text-muted-foreground">Detailed performance metrics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Coverage Analysis</span>
                  <span className="text-xs text-muted-foreground">Market coverage assessment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'territory' ? (isEditing ? 'Edit Territory' : 'Create New Territory') : (isEditing ? 'Edit Rule' : 'Create Assignment Rule')}
            </DialogTitle>
          </DialogHeader>
          {dialogType === 'territory' ? (
            <TerritoryForm 
              territory={selectedItem as Territory | null}
              onSave={handleSaveTerritory}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <TerritoryRuleForm 
              rule={selectedItem as TerritoryRule | null}
              onSave={handleSaveRule}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TerritoryForm: React.FC<{
  territory: Territory | null;
  onSave: (data: Partial<Territory>) => void;
  onCancel: () => void;
}> = ({ territory, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: territory?.name || '',
    region: territory?.region || 'North America' as const,
    salesRep: territory?.salesRep || '',
    manager: territory?.manager || '',
    target: territory?.target || 0,
    status: territory?.status || 'Active' as const
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Territory Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <Label>Region</Label>
          <Select value={formData.region} onValueChange={(v: any) => setFormData(p => ({ ...p, region: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
              <SelectItem value="Latin America">Latin America</SelectItem>
              <SelectItem value="Middle East">Middle East</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sales Representative</Label>
          <Input value={formData.salesRep} onChange={(e) => setFormData(p => ({ ...p, salesRep: e.target.value }))} />
        </div>
        <div>
          <Label>Territory Manager</Label>
          <Input value={formData.manager} onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))} />
        </div>
        <div>
          <Label>Revenue Target</Label>
          <Input type="number" value={formData.target} onChange={(e) => setFormData(p => ({ ...p, target: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{territory ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

const TerritoryRuleForm: React.FC<{
  rule: TerritoryRule | null;
  onSave: (data: Partial<TerritoryRule>) => void;
  onCancel: () => void;
}> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    type: rule?.type || 'Geographic' as const,
    criteria: rule?.criteria || '',
    priority: rule?.priority || 1
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Rule Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(v: any) => setFormData(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Geographic">Geographic</SelectItem>
              <SelectItem value="Industry">Industry</SelectItem>
              <SelectItem value="Company Size">Company Size</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Criteria</Label>
          <Input value={formData.criteria} onChange={(e) => setFormData(p => ({ ...p, criteria: e.target.value }))} />
        </div>
        <div>
          <Label>Priority</Label>
          <Input type="number" value={formData.priority} onChange={(e) => setFormData(p => ({ ...p, priority: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{rule ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

export default TerritoryManagement;
