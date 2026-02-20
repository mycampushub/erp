
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ArrowLeft, Plus, Edit, Eye, Trash2, FileText, ClipboardCheck, Monitor, Wrench, HardDrive, Bell, Clock, CheckCircle, User } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ServiceRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  type: 'Maintenance Request' | 'Service Request' | 'Incident Report' | 'Improvement';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
  requester: string;
  assignedTo: string;
  equipment: string;
  plant: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  resolution?: string;
}

const STORAGE_KEY = 'service_requests';

const ServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const defaultForm = {
    title: '',
    description: '',
    type: 'Maintenance Request' as const,
    priority: 'Medium' as const,
    status: 'New' as const,
    requester: '',
    assignedTo: '',
    equipment: '',
    plant: 'Plant 1000',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const [form, setForm] = useState<Omit<ServiceRequest, 'id' | 'requestNumber' | 'completedDate' | 'resolution' | 'createdDate'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('You are now in the Service and Asset Management page. Here you can manage maintenance requests, orders, and asset-related activities.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<ServiceRequest>(STORAGE_KEY);
    if (stored.length === 0) {
      const sample = generateSampleRequests(30);
      sample.forEach(r => upsertEntity(STORAGE_KEY, r as any));
      setRequests(sample);
    } else {
      setRequests(stored);
    }
  };

  const generateSampleRequests = (count: number): ServiceRequest[] => {
    const titles = [
      'Equipment malfunction reported', 'Preventive maintenance needed', 'Safety inspection request',
      'Performance improvement suggestion', 'Spare parts requirement', 'Equipment upgrade request',
      'Training needed on new system', 'Safety hazard identified', 'Quality issue reported',
      'Process optimization opportunity', 'Infrastructure repair needed', 'Software bug report'
    ];

    const types: ServiceRequest['type'][] = ['Maintenance Request', 'Service Request', 'Incident Report', 'Improvement'];
    const priorities: ServiceRequest['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
    const statuses: ServiceRequest['status'][] = ['New', 'In Progress', 'Pending', 'Resolved', 'Closed'];
    const requesters = ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Lisa Brown', 'David Lee', 'Emma Davis', 'Robert Wilson'];
    const assignees = ['Support Team', 'Maintenance Team', 'Engineering Team', 'Quality Team', 'Operations Team'];
    const equipment = ['Production Line A1', 'Packaging Machine B2', 'CNC Machining Center', 'Assembly Line 1', 'Conveyor System C1'];

    const result: ServiceRequest[] = [];
    const baseDate = new Date('2024-12-01');

    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdDate = new Date(baseDate);
      createdDate.setDate(createdDate.getDate() + Math.floor(Math.random() * 60));
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 3);

      let completedDate: string | undefined;
      let resolution: string | undefined;
      if (status === 'Resolved' || status === 'Closed') {
        completedDate = new Date(dueDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        resolution = 'Issue resolved successfully. All required actions completed.';
      }

      result.push({
        id: generateId('sr'),
        requestNumber: `SR-${String(i).padStart(5, '0')}`,
        title: titles[i % titles.length],
        description: `Detailed description for service request ${i}. This requires immediate attention from the ${assignees[i % assignees.length]}.`,
        type: types[Math.floor(Math.random() * types.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        requester: requesters[Math.floor(Math.random() * requesters.length)],
        assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
        equipment: equipment[i % equipment.length],
        plant: `Plant ${1000 + (i % 3) * 1000}`,
        createdDate: createdDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        completedDate,
        resolution,
      });
    }

    return result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  };

  const handleCreate = () => {
    setEditingRequest(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (request: ServiceRequest) => {
    setEditingRequest(request);
    setForm({
      title: request.title,
      description: request.description,
      type: request.type,
      priority: request.priority,
      status: request.status,
      requester: request.requester,
      assignedTo: request.assignedTo,
      equipment: request.equipment,
      plant: request.plant,
      dueDate: request.dueDate,
    });
    setIsDialogOpen(true);
  };

  const handleView = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.requester.trim()) {
      toast({ title: 'Validation Error', description: 'Title and Requester are required.', variant: 'destructive' });
      return;
    }

    if (editingRequest) {
      const updated = { ...editingRequest, ...form, lastModified: new Date().toISOString().split('T')[0] };
      if (form.status === 'Resolved' && !updated.completedDate) {
        updated.completedDate = new Date().toISOString().split('T')[0];
        updated.resolution = 'Issue resolved.';
      }
      upsertEntity(STORAGE_KEY, updated as any);
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? updated : r));
      toast({ title: 'Request Updated', description: `${updated.requestNumber} has been updated.` });
    } else {
      const newRequest: ServiceRequest = {
        id: generateId('sr'),
        requestNumber: `SR-${String(requests.length + 1).padStart(5, '0')}`,
        ...form,
        createdDate: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, newRequest as any);
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: 'Request Created', description: `${newRequest.requestNumber} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (request: ServiceRequest) => {
    removeEntity(STORAGE_KEY, request.id);
    setRequests(prev => prev.filter(r => r.id !== request.id));
    toast({ title: 'Request Deleted', description: `${request.requestNumber} has been removed.` });
  };

  const handleStatusChange = (request: ServiceRequest, status: ServiceRequest['status']) => {
    const updates: Partial<ServiceRequest> = { status };
    if (status === 'Resolved' || status === 'Closed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
      updates.resolution = 'Issue resolved successfully.';
    }
    const updated = { ...request, ...updates };
    upsertEntity(STORAGE_KEY, updated as any);
    setRequests(prev => prev.map(r => r.id === request.id ? updated : r));
    toast({ title: 'Status Updated', description: `${request.requestNumber} status changed to ${status}.` });
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { 'Low': 'bg-gray-100 text-gray-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-orange-100 text-orange-800', 'Critical': 'bg-red-100 text-red-800' };
    return c[p] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { 'New': 'bg-blue-100 text-blue-800', 'In Progress': 'bg-yellow-100 text-yellow-800', 'Pending': 'bg-purple-100 text-purple-800', 'Resolved': 'bg-green-100 text-green-800', 'Closed': 'bg-gray-100 text-gray-800' };
    return c[s] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'requestNumber', header: 'Request #', sortable: true, searchable: true },
    { key: 'title', header: 'Title', searchable: true },
    { key: 'type', header: 'Type', filterable: true },
    { key: 'priority', header: 'Priority', filterable: true, render: (v: string) => <Badge className={getPriorityColor(v)}>{v}</Badge> },
    { key: 'status', header: 'Status', filterable: true, render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'requester', header: 'Requester', searchable: true },
    { key: 'assignedTo', header: 'Assigned To', searchable: true },
    { key: 'createdDate', header: 'Created', sortable: true },
    { key: 'dueDate', header: 'Due Date', sortable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEdit, variant: 'ghost' },
    { label: 'Mark Resolved', icon: <CheckCircle className="h-4 w-4" />, onClick: (row: ServiceRequest) => handleStatusChange(row, 'Resolved'), variant: 'ghost', condition: (row: ServiceRequest) => row.status === 'In Progress' || row.status === 'Pending' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const chartData = [
    { name: 'New', value: requests.filter(r => r.status === 'New').length },
    { name: 'In Progress', value: requests.filter(r => r.status === 'In Progress').length },
    { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length },
    { name: 'Resolved', value: requests.filter(r => r.status === 'Resolved').length },
    { name: 'Closed', value: requests.filter(r => r.status === 'Closed').length },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Service & Asset Management"
          description="Manage maintenance requests, orders, and asset-related activities"
          voiceIntroduction="Welcome to Service and Asset Management. Here you can manage all maintenance and asset-related activities."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Requests</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'New' || r.status === 'In Progress').length}</div>
          <div className="text-sm text-blue-600">Need attention</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Pending').length}</div>
          <div className="text-sm text-yellow-600">Awaiting response</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}</div>
          <div className="text-sm text-green-600">This period</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical</div>
          <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.priority === 'Critical' && r.status !== 'Closed').length}</div>
          <div className="text-sm text-red-500">Immediate action</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Service Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Service Requests
                <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" />New Request</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={requests} actions={actions} searchPlaceholder="Search requests..." exportable refreshable onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader><CardTitle>Request Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRequest ? 'Edit Request' : 'Create Service Request'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Request title" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ServiceRequest['type'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance Request">Maintenance Request</SelectItem>
                  <SelectItem value="Service Request">Service Request</SelectItem>
                  <SelectItem value="Incident Report">Incident Report</SelectItem>
                  <SelectItem value="Improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as ServiceRequest['priority'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ServiceRequest['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Requester *</Label>
              <Input value={form.requester} onChange={e => setForm(f => ({ ...f, requester: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support Team">Support Team</SelectItem>
                  <SelectItem value="Maintenance Team">Maintenance Team</SelectItem>
                  <SelectItem value="Engineering Team">Engineering Team</SelectItem>
                  <SelectItem value="Quality Team">Quality Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipment</Label>
              <Input value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Equipment name" />
            </div>
            <div>
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(f => ({ ...f, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                  <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                  <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingRequest ? 'Update' : 'Create'} Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Request: {selectedRequest?.requestNumber}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Title</Label><div className="font-medium">{selectedRequest.title}</div></div>
                <div><Label>Type</Label><div>{selectedRequest.type}</div></div>
                <div><Label>Priority</Label><Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                <div><Label>Requester</Label><div>{selectedRequest.requester}</div></div>
                <div><Label>Assigned To</Label><div>{selectedRequest.assignedTo}</div></div>
                <div><Label>Equipment</Label><div>{selectedRequest.equipment}</div></div>
                <div><Label>Created</Label><div>{selectedRequest.createdDate}</div></div>
                <div><Label>Due Date</Label><div>{selectedRequest.dueDate}</div></div>
                {selectedRequest.completedDate && <div><Label>Completed</Label><div>{selectedRequest.completedDate}</div></div>}
              </div>
              <div><Label>Description</Label><div className="text-sm bg-muted p-3 rounded">{selectedRequest.description}</div></div>
              {selectedRequest.resolution && <div><Label>Resolution</Label><div className="text-sm bg-green-50 p-3 rounded">{selectedRequest.resolution}</div></div>}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(selectedRequest); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicePage;
