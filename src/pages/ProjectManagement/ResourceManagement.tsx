import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Users, Calendar, BarChart3, Settings, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ViewDialog, ConfirmDialog,
  formatCurrency, formatDate
} from '../../lib/projectManagement/CRUDComponents';
import { Resource, ResourceAllocation, CapacityPlan, Skill, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [capacityPlans, setCapacityPlans] = useState<CapacityPlan[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'resource' | 'allocation' | 'capacity' | 'skill'>('resource');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Resource Management. Here you can manage team members, track availability, plan capacity, and optimize resource allocation across projects.');
    }
    loadData();
  }, [isEnabled, speak]);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const res = listEntities<Resource>(PM_STORAGE_KEYS.RESOURCES);
    const alloc = listEntities<ResourceAllocation>(PM_STORAGE_KEYS.RESOURCE_ALLOCATIONS);
    const cap = listEntities<CapacityPlan>(PM_STORAGE_KEYS.CAPACITY_PLANS);
    const sk = listEntities<Skill>(PM_STORAGE_KEYS.SKILLS);
    setResources(res);
    setAllocations(alloc);
    setCapacityPlans(cap);
    setSkills(sk);
  }, []);

  const handleCreate = (type: 'resource' | 'allocation' | 'capacity' | 'skill') => {
    setDialogType(type);
    setSelectedItem(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any, type: 'resource' | 'allocation' | 'capacity' | 'skill') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (item: any, type: 'resource' | 'allocation' | 'capacity' | 'skill') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'resource' | 'allocation' | 'capacity' | 'skill') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    let key: any = PM_STORAGE_KEYS.RESOURCES;
    let setter: any = setResources;
    if (dialogType === 'allocation') { key = PM_STORAGE_KEYS.RESOURCE_ALLOCATIONS; setter = setAllocations; }
    else if (dialogType === 'capacity') { key = PM_STORAGE_KEYS.CAPACITY_PLANS; setter = setCapacityPlans; }
    else if (dialogType === 'skill') { key = PM_STORAGE_KEYS.SKILLS; setter = setSkills; }
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Item Deleted', description: 'Item has been deleted successfully.', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.RESOURCES;
    let setter: any = setResources;
    if (dialogType === 'allocation') { key = PM_STORAGE_KEYS.RESOURCE_ALLOCATIONS; setter = setAllocations; }
    else if (dialogType === 'capacity') { key = PM_STORAGE_KEYS.CAPACITY_PLANS; setter = setCapacityPlans; }
    else if (dialogType === 'skill') { key = PM_STORAGE_KEYS.SKILLS; setter = setSkills; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Item Updated', description: 'Item has been updated successfully.' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'resource' ? 'res' : dialogType === 'allocation' ? 'alloc' : dialogType === 'capacity' ? 'cap' : 'skl') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Item Created', description: 'Item has been created successfully.' });
    }
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const resourceColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'availability', header: 'Availability', sortable: true, render: (value: number) => <Progress value={value} className="h-2 w-20" /> },
    { key: 'utilization', header: 'Utilization', sortable: true, render: (value: number) => (
      <Badge variant={value > 90 ? 'destructive' : value > 75 ? 'default' : 'secondary'}>{value}%</Badge>
    )},
    { key: 'costRate', header: 'Cost Rate', render: (v: number) => formatCurrency(v) + '/hr' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={v === 'Active' ? 'default' : 'secondary'}>{v}</Badge> },
  ];

  const allocationColumns = [
    { key: 'projectId', header: 'Project', sortable: true },
    { key: 'resourceId', header: 'Resource', sortable: true },
    { key: 'allocation', header: 'Allocation', sortable: true, render: (v: number) => `${v}%` },
    { key: 'startDate', header: 'Start Date', render: (v: string) => formatDate(v) },
    { key: 'endDate', header: 'End Date', render: (v: string) => formatDate(v) },
    { key: 'role', header: 'Role' },
  ];

  const getFormFields = () => {
    if (dialogType === 'resource') {
      return [
        { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Enter name' },
        { name: 'role', label: 'Role', type: 'text' as const, required: true },
        { name: 'department', label: 'Department', type: 'text' as const },
        { name: 'email', label: 'Email', type: 'email' as const },
        { name: 'phone', label: 'Phone', type: 'text' as const },
        { name: 'availability', label: 'Availability %', type: 'number' as const },
        { name: 'utilization', label: 'Utilization %', type: 'number' as const },
        { name: 'costRate', label: 'Cost Rate', type: 'currency' as const },
        { name: 'status', label: 'Status', type: 'select' as const, options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'On Leave', value: 'On Leave' }
        ]},
      ];
    } else if (dialogType === 'allocation') {
      return [
        { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
        { name: 'resourceId', label: 'Resource ID', type: 'text' as const, required: true },
        { name: 'allocation', label: 'Allocation %', type: 'number' as const, required: true },
        { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
        { name: 'endDate', label: 'End Date', type: 'date' as const, required: true },
        { name: 'role', label: 'Role', type: 'text' as const },
      ];
    } else if (dialogType === 'capacity') {
      return [
        { name: 'resourceId', label: 'Resource ID', type: 'text' as const, required: true },
        { name: 'period', label: 'Period', type: 'text' as const, required: true, placeholder: 'Q1 2025' },
        { name: 'plannedCapacity', label: 'Planned Capacity', type: 'number' as const },
        { name: 'availableCapacity', label: 'Available Capacity', type: 'number' as const },
        { name: 'utilizedCapacity', label: 'Utilized Capacity', type: 'number' as const },
      ];
    } else {
      return [
        { name: 'name', label: 'Skill Name', type: 'text' as const, required: true },
        { name: 'category', label: 'Category', type: 'select' as const, options: [
          { label: 'Technical', value: 'Technical' },
          { label: 'Soft', value: 'Soft' },
          { label: 'Domain', value: 'Domain' },
          { label: 'Certification', value: 'Certification' }
        ]},
        { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
      ];
    }
  };

  const avgUtilization = Math.round(resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length) || 0;
  const availableCount = resources.filter(r => r.availability > 50).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Resource Management"
          description="Manage team resources, capacity planning, and allocation"
          voiceIntroduction="Welcome to Resource Management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Resources" value={resources.length} icon={<Users className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Avg Utilization" value={`${avgUtilization}%`} icon={<BarChart3 className="h-6 w-6 text-green-600" />} />
        <StatCard title="Available" value={availableCount} icon={<Calendar className="h-6 w-6 text-orange-600" />} />
        <StatCard title="Active Projects" value="12" icon={<Settings className="h-6 w-6 text-purple-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          <Card className="p-6">
            <EnhancedCRUDTable
              data={resources}
              columns={resourceColumns}
              title="Team Resources"
              pageSize={10}
              onCreate={() => handleCreate('resource')}
              onEdit={(item) => handleEdit(item, 'resource')}
              onView={(item) => handleView(item, 'resource')}
              onDelete={(item) => handleDelete(item, 'resource')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <Card className="p-6">
            <EnhancedCRUDTable
              data={allocations}
              columns={allocationColumns}
              title="Resource Allocations"
              pageSize={10}
              onCreate={() => handleCreate('allocation')}
              onEdit={(item) => handleEdit(item, 'allocation')}
              onDelete={(item) => handleDelete(item, 'allocation')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Capacity Planning</h3>
              <Button onClick={() => handleCreate('capacity')}><Plus className="h-4 w-4 mr-2" />Add Capacity Plan</Button>
            </div>
            <div className="space-y-4 mb-6">
              {capacityPlans.slice(0, 10).map((cap) => (
                <div key={cap.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{cap.resourceId}</p>
                    <p className="text-sm text-gray-500">{cap.period}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1"><span>Utilized</span><span>{cap.utilizedCapacity}%</span></div>
                      <Progress value={cap.utilizedCapacity} className="h-2" />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(cap, 'capacity')}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cap, 'capacity')}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Team Capacity Overview</h4>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm"><span>Current Utilization</span><span>{avgUtilization}%</span></div><Progress value={avgUtilization} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm"><span>Planned Capacity</span><span>85%</span></div><Progress value={85} className="h-2" /></div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Resource Forecast</h4>
                <div className="space-y-2 text-sm">
                  <p>• Q2 2025: Need 3 additional developers</p>
                  <p>• Q3 2025: Consider hiring 1 PM</p>
                  <p>• Q4 2025: Capacity surplus expected</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Skills Management</h3>
              <Button onClick={() => handleCreate('skill')}><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
            </div>
            <div className="space-y-4 mb-6">
              {skills.slice(0, 10).map((skill) => (
                <div key={skill.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-sm text-gray-500">{skill.category} • {skill.resources?.length || 0} resources</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{skill.category}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(skill, 'skill')}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(skill, 'skill')}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Technical', 'Soft', 'Domain', 'Certification'].map((category) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{category} Skills</h4>
                  <div className="space-y-2">
                    {skills.filter(s => s.category === category).slice(0, 5).map(skill => (
                      <Badge key={skill.id} variant="outline">{skill.name}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogType === 'resource' ? 'Resource' : dialogType === 'allocation' ? 'Allocation' : dialogType === 'capacity' ? 'Capacity Plan' : 'Skill'}
        item={selectedItem}
        onSave={handleSave}
        fields={getFormFields()}
        isEdit={isEditing}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ResourceManagement;
