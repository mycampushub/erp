
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Activity, Zap, Clock, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface StreamMetric {
  id: string;
  name: string;
  source: string;
  value: number;
  unit: string;
  updateFrequency: string;
  latency: number;
  lastUpdated: string;
  status: 'Active' | 'Paused' | 'Error' | 'Warning';
}

const defaultForm: Omit<StreamMetric, 'id'> = {
  name: '',
  source: 'API',
  value: 0,
  unit: 'requests/sec',
  updateFrequency: '1 second',
  latency: 0,
  lastUpdated: new Date().toISOString(),
  status: 'Active',
};

const STORAGE_KEY = 'sap_realtimeanalytics';

const defaultStreams: StreamMetric[] = [
  { id: '1', name: 'API Request Rate', source: 'API Gateway', value: 12500, unit: 'req/sec', updateFrequency: '1 second', latency: 45, lastUpdated: '2024-01-15T10:00:00Z', status: 'Active' },
  { id: '2', name: 'Database Queries', source: 'PostgreSQL', value: 3200, unit: 'queries/sec', updateFrequency: '1 second', latency: 12, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '3', name: 'Active Users', source: 'Auth Service', value: 8540, unit: 'users', updateFrequency: '30 seconds', latency: 25, lastUpdated: '2024-01-15T10:00:30Z', status: 'Active' },
  { id: '4', name: 'Error Rate', source: 'Error Tracker', value: 0.12, unit: '%', updateFrequency: '1 second', latency: 15, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '5', name: 'CPU Usage', source: 'Infrastructure', value: 68, unit: '%', updateFrequency: '5 seconds', latency: 8, lastUpdated: '2024-01-15T10:00:05Z', status: 'Active' },
  { id: '6', name: 'Memory Usage', source: 'Infrastructure', value: 72, unit: '%', updateFrequency: '5 seconds', latency: 8, lastUpdated: '2024-01-15T10:00:05Z', status: 'Warning' },
  { id: '7', name: 'Network In', source: 'Infrastructure', value: 450, unit: 'Mbps', updateFrequency: '1 second', latency: 5, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '8', name: 'Network Out', source: 'Infrastructure', value: 280, unit: 'Mbps', updateFrequency: '1 second', latency: 5, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '9', name: 'Disk I/O', source: 'Storage', value: 850, unit: 'IOPS', updateFrequency: '5 seconds', latency: 10, lastUpdated: '2024-01-15T10:00:05Z', status: 'Active' },
  { id: '10', name: 'Queue Depth', source: 'Message Queue', value: 1250, unit: 'messages', updateFrequency: '1 second', latency: 20, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '11', name: 'Cache Hit Rate', source: 'Redis', value: 94.5, unit: '%', updateFrequency: '10 seconds', latency: 2, lastUpdated: '2024-01-15T10:00:10Z', status: 'Active' },
  { id: '12', name: 'Response Time P95', source: 'API Gateway', value: 185, unit: 'ms', updateFrequency: '1 second', latency: 45, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '13', name: 'Response Time P99', source: 'API Gateway', value: 420, unit: 'ms', updateFrequency: '1 second', latency: 45, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '14', name: 'WebSocket Connections', source: 'WebSocket Server', value: 3250, unit: 'connections', updateFrequency: '1 second', latency: 15, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '15', name: 'Message Throughput', source: 'Kafka', value: 45000, unit: 'msg/sec', updateFrequency: '1 second', latency: 30, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '16', name: 'Failed Transactions', source: 'Payment Service', value: 3, unit: 'transactions', updateFrequency: '1 second', latency: 50, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '17', name: 'Container Count', source: 'Kubernetes', value: 156, unit: 'containers', updateFrequency: '30 seconds', latency: 60, lastUpdated: '2024-01-15T10:00:30Z', status: 'Active' },
  { id: '18', name: 'Pod Health', source: 'Kubernetes', value: 98.5, unit: '%', updateFrequency: '30 seconds', latency: 60, lastUpdated: '2024-01-15T10:00:30Z', status: 'Active' },
  { id: '19', name: 'SSL Certificate Expiry', source: 'Certificate Manager', value: 85, unit: 'days', updateFrequency: '1 hour', latency: 120, lastUpdated: '2024-01-15T09:00:00Z', status: 'Active' },
  { id: '20', name: 'Backup Status', source: 'Backup Service', value: 100, unit: '%', updateFrequency: '1 hour', latency: 180, lastUpdated: '2024-01-15T08:00:00Z', status: 'Active' },
  { id: '21', name: 'Email Queue', source: 'Email Service', value: 45, unit: 'emails', updateFrequency: '1 minute', latency: 25, lastUpdated: '2024-01-15T10:01:00Z', status: 'Active' },
  { id: '22', name: 'CDN Requests', source: 'CDN', value: 85000, unit: 'req/min', updateFrequency: '1 minute', latency: 40, lastUpdated: '2024-01-15T10:01:00Z', status: 'Active' },
  { id: '23', name: 'CDN Bandwidth', source: 'CDN', value: 12.5, unit: 'Gbps', updateFrequency: '1 minute', latency: 40, lastUpdated: '2024-01-15T10:01:00Z', status: 'Active' },
  { id: '24', name: 'DNS Queries', source: 'DNS', value: 25000, unit: 'queries/min', updateFrequency: '1 minute', latency: 5, lastUpdated: '2024-01-15T10:01:00Z', status: 'Active' },
  { id: '25', name: 'Bot Traffic', source: 'WAF', value: 15.2, unit: '%', updateFrequency: '1 minute', latency: 35, lastUpdated: '2024-01-15T10:01:00Z', status: 'Active' },
  { id: '26', name: 'Database Connections', source: 'Connection Pool', value: 245, unit: 'connections', updateFrequency: '10 seconds', latency: 10, lastUpdated: '2024-01-15T10:00:10Z', status: 'Active' },
  { id: '27', name: 'Search Queries', source: 'Elasticsearch', value: 850, unit: 'queries/sec', updateFrequency: '5 seconds', latency: 18, lastUpdated: '2024-01-15T10:00:05Z', status: 'Active' },
  { id: '28', name: 'ML Inference Time', source: 'ML Service', value: 45, unit: 'ms', updateFrequency: '1 second', latency: 60, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '29', name: 'File Upload Rate', source: 'Storage Service', value: 25, unit: 'files/sec', updateFrequency: '1 second', latency: 22, lastUpdated: '2024-01-15T10:00:01Z', status: 'Active' },
  { id: '30', name: 'Webhook Deliveries', source: 'Webhook Service', value: 520, unit: 'webhooks/min', updateFrequency: '1 minute', latency: 28, lastUpdated: '2024-01-15T10:01:00Z', status: 'Error' },
];

const RealtimeAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [streams, setStreams] = useLocalStorage<StreamMetric[]>(STORAGE_KEY, defaultStreams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<StreamMetric | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamMetric | null>(null);
  const [form, setForm] = useState<Omit<StreamMetric, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Real-time Analytics. Monitor live data streams and get instant business insights.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingStream(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (stream: StreamMetric) => {
    setEditingStream(stream);
    setForm({
      name: stream.name,
      source: stream.source,
      value: stream.value,
      unit: stream.unit,
      updateFrequency: stream.updateFrequency,
      latency: stream.latency,
      lastUpdated: stream.lastUpdated,
      status: stream.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Metric name is required.', variant: 'destructive' });
      return;
    }

    if (editingStream) {
      setStreams(prev => prev.map(s => s.id === editingStream.id ? { ...editingStream, ...form } : s));
      toast({ title: 'Stream Updated', description: `${form.name} has been updated.` });
    } else {
      const newStream: StreamMetric = {
        id: String(Date.now()),
        ...form,
      };
      setStreams(prev => [...prev, newStream]);
      toast({ title: 'Stream Created', description: `${form.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (stream: StreamMetric) => {
    setStreams(prev => prev.filter(s => s.id !== stream.id));
    toast({ title: 'Stream Deleted', description: `${stream.name} has been removed.` });
  };

  const handleView = (stream: StreamMetric) => {
    setSelectedStream(stream);
    setIsViewDialogOpen(true);
  };

  const activeStreams = streams.filter(s => s.status === 'Active').length;
  const avgLatency = streams.reduce((sum, s) => sum + s.latency, 0) / streams.length;
  const errorStreams = streams.filter(s => s.status === 'Error').length;
  const warningStreams = streams.filter(s => s.status === 'Warning').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Paused': 'bg-gray-100 text-gray-800',
      'Error': 'bg-red-100 text-red-800',
      'Warning': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'name', header: 'Metric Name' },
    { key: 'source', header: 'Source' },
    { key: 'value', header: 'Value', render: (value: number) => typeof value === 'number' && value < 100 ? value.toFixed(2) : value.toLocaleString() },
    { key: 'unit', header: 'Unit' },
    { key: 'updateFrequency', header: 'Update Frequency' },
    { key: 'latency', header: 'Latency (ms)' },
    { key: 'lastUpdated', header: 'Last Updated' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: StreamMetric) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/business-intelligence')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Real-time Analytics"
          description="Live data processing and instant insights"
          voiceIntroduction="Welcome to Real-time Analytics."
        />
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList>
          <TabsTrigger value="live">Live Dashboard</TabsTrigger>
          <TabsTrigger value="streams">Stream Records</TabsTrigger>
          <TabsTrigger value="streaming">Data Streaming</TabsTrigger>
          <TabsTrigger value="alerts">Real-time Alerts</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Active Streams"
                value={String(activeStreams)}
                trend={{ value: "30", direction: "up", label: "total" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Latency"
                value={`${avgLatency.toFixed(0)}ms`}
                trend={{ value: "5ms", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Error Streams"
                value={String(errorStreams)}
                trend={{ value: "Needs attention", direction: "down", label: "" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Warning Streams"
                value={String(warningStreams)}
                trend={{ value: "Monitor", direction: "up", label: "" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="streams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stream Metrics</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Stream
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={streams} />
          </Card>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Events/sec"
                value="125,000"
                trend={{ value: "15K", direction: "up", label: "vs 1hr ago" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Processing Time"
                value="12ms"
                trend={{ value: "3ms", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Data Points Today"
                value="8.5B"
                trend={{ value: "1.2B", direction: "up", label: "today" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Active Alerts"
                value={String(errorStreams + warningStreams)}
                trend={{ value: "2", direction: "down", label: "vs 1hr ago" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Alerts Resolved"
                value="145"
                trend={{ value: "12%", direction: "up", label: "vs yesterday" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Response Time"
                value="8 min"
                trend={{ value: "2 min", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="System Uptime"
                value="99.98%"
                trend={{ value: "0.02%", direction: "up", label: "this month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Incidents"
                value="2"
                trend={{ value: "1", direction: "down", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="MTTR"
                value="25 min"
                trend={{ value: "5 min", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStream ? 'Edit Stream' : 'Create Stream Metric'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Metric Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter metric name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Select value={form.source} onValueChange={(value) => setForm({ ...form, source: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="API Gateway">API Gateway</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="Message Queue">Message Queue</SelectItem>
                  <SelectItem value="Cache">Cache</SelectItem>
                  <SelectItem value="CDN">CDN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="updateFrequency">Update Frequency</Label>
                <Select value={form.updateFrequency} onValueChange={(value) => setForm({ ...form, updateFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 second">1 second</SelectItem>
                    <SelectItem value="5 seconds">5 seconds</SelectItem>
                    <SelectItem value="10 seconds">10 seconds</SelectItem>
                    <SelectItem value="30 seconds">30 seconds</SelectItem>
                    <SelectItem value="1 minute">1 minute</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Active' | 'Paused' | 'Error' | 'Warning') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Error">Error</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="latency">Latency (ms)</Label>
              <Input
                id="latency"
                type="number"
                value={form.latency}
                onChange={(e) => setForm({ ...form, latency: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingStream ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stream Details</DialogTitle>
          </DialogHeader>
          {selectedStream && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedStream.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Source:</span>
                <span className="font-medium">{selectedStream.source}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Value:</span>
                <span className="font-medium">{typeof selectedStream.value === 'number' && selectedStream.value < 100 ? selectedStream.value.toFixed(2) : selectedStream.value.toLocaleString()} {selectedStream.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Update Frequency:</span>
                <span className="font-medium">{selectedStream.updateFrequency}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Latency:</span>
                <span className="font-medium">{selectedStream.latency}ms</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium">{selectedStream.lastUpdated}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedStream.status)}>{selectedStream.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RealtimeAnalytics;
