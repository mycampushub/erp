
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
import { ArrowLeft, Brain, TrendingUp, Target, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface PredictionModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: string;
  predictions: number;
  confidence: number;
  status: 'Active' | 'Training' | 'Inactive' | 'Failed';
  useCase: string;
}

const defaultForm: Omit<PredictionModel, 'id'> = {
  name: '',
  type: 'Regression',
  accuracy: 0,
  lastTrained: new Date().toISOString().split('T')[0],
  predictions: 0,
  confidence: 0,
  status: 'Training',
  useCase: 'Sales Forecasting',
};

const STORAGE_KEY = 'sap_predictiveanalytics';

const defaultModels: PredictionModel[] = [
  { id: '1', name: 'Sales Forecast Model', type: 'Time Series', accuracy: 94.5, lastTrained: '2024-01-15', predictions: 1250, confidence: 92, status: 'Active', useCase: 'Sales Forecasting' },
  { id: '2', name: 'Demand Prediction', type: 'Regression', accuracy: 91.2, lastTrained: '2024-01-20', predictions: 3200, confidence: 88, status: 'Active', useCase: 'Demand Planning' },
  { id: '3', name: 'Customer Churn Model', type: 'Classification', accuracy: 89.8, lastTrained: '2024-01-25', predictions: 850, confidence: 85, status: 'Active', useCase: 'Customer Retention' },
  { id: '4', name: 'Price Optimization', type: 'Reinforcement', accuracy: 87.5, lastTrained: '2024-02-01', predictions: 2100, confidence: 82, status: 'Active', useCase: 'Pricing Strategy' },
  { id: '5', name: 'Inventory Forecaster', type: 'LSTM', accuracy: 93.2, lastTrained: '2024-02-10', predictions: 4500, confidence: 90, status: 'Active', useCase: 'Inventory Management' },
  { id: '6', name: 'Risk Assessment Model', type: 'Random Forest', accuracy: 88.6, lastTrained: '2024-02-15', predictions: 680, confidence: 84, status: 'Active', useCase: 'Credit Risk' },
  { id: '7', name: 'Employee Attrition', type: 'Classification', accuracy: 86.4, lastTrained: '2024-02-20', predictions: 420, confidence: 81, status: 'Training', useCase: 'HR Planning' },
  { id: '8', name: 'Equipment Failure Pred', type: 'Anomaly Detection', accuracy: 95.1, lastTrained: '2024-02-25', predictions: 180, confidence: 93, status: 'Active', useCase: 'Predictive Maintenance' },
  { id: '9', name: 'Market Trend Analysis', type: 'Time Series', accuracy: 84.2, lastTrained: '2024-03-01', predictions: 520, confidence: 78, status: 'Active', useCase: 'Market Intelligence' },
  { id: '10', name: 'Supply Chain Optimizer', type: 'Optimization', accuracy: 90.8, lastTrained: '2024-03-05', predictions: 2800, confidence: 87, status: 'Active', useCase: 'Supply Chain' },
  { id: '11', name: 'Fraud Detection', type: 'Classification', accuracy: 97.3, lastTrained: '2024-03-10', predictions: 15000, confidence: 95, status: 'Active', useCase: 'Security' },
  { id: '12', name: 'Quality Prediction', type: 'Regression', accuracy: 92.1, lastTrained: '2024-03-15', predictions: 3200, confidence: 89, status: 'Active', useCase: 'Manufacturing Quality' },
  { id: '13', name: 'Lead Scoring Model', type: 'Classification', accuracy: 88.9, lastTrained: '2024-03-20', predictions: 1800, confidence: 84, status: 'Training', useCase: 'Sales Prioritization' },
  { id: '14', name: 'Delivery Time Predictor', type: 'Regression', accuracy: 91.5, lastTrained: '2024-03-25', predictions: 4200, confidence: 88, status: 'Active', useCase: 'Logistics' },
  { id: '15', name: 'Product Recommendation', type: 'Collaborative', accuracy: 89.3, lastTrained: '2024-03-28', predictions: 8500, confidence: 86, status: 'Active', useCase: 'E-commerce' },
  { id: '16', name: 'Cash Flow Forecaster', type: 'Time Series', accuracy: 93.8, lastTrained: '2024-04-01', predictions: 650, confidence: 91, status: 'Active', useCase: 'Financial Planning' },
  { id: '17', name: 'Sentiment Analysis', type: 'NLP', accuracy: 85.6, lastTrained: '2024-04-05', predictions: 12000, confidence: 82, status: 'Active', useCase: 'Brand Monitoring' },
  { id: '18', name: 'Defect Detection', type: 'Computer Vision', accuracy: 96.2, lastTrained: '2024-04-10', predictions: 25000, confidence: 94, status: 'Active', useCase: 'Quality Control' },
  { id: '19', name: 'Customer Lifetime Value', type: 'Regression', accuracy: 87.4, lastTrained: '2024-04-15', predictions: 950, confidence: 83, status: 'Active', useCase: 'Customer Analytics' },
  { id: '20', name: 'Supplier Risk Score', type: 'Classification', accuracy: 90.1, lastTrained: '2024-04-20', predictions: 320, confidence: 87, status: 'Training', useCase: 'Procurement' },
  { id: '21', name: 'Energy Consumption', type: 'Time Series', accuracy: 94.7, lastTrained: '2024-04-22', predictions: 1800, confidence: 92, status: 'Active', useCase: 'Energy Management' },
  { id: '22', name: 'Call Volume Forecast', type: 'Regression', accuracy: 88.3, lastTrained: '2024-04-25', predictions: 2400, confidence: 85, status: 'Active', useCase: 'Workforce Planning' },
  { id: '23', name: 'Campaign Response', type: 'Classification', accuracy: 86.8, lastTrained: '2024-04-28', predictions: 650, confidence: 82, status: 'Active', useCase: 'Marketing' },
  { id: '24', name: 'Maintenance Scheduler', type: 'Optimization', accuracy: 91.9, lastTrained: '2024-05-01', predictions: 420, confidence: 89, status: 'Active', useCase: 'Asset Management' },
  { id: '25', name: 'Credit Scoring', type: 'Random Forest', accuracy: 92.5, lastTrained: '2024-05-05', predictions: 1800, confidence: 90, status: 'Active', useCase: 'Finance' },
  { id: '26', name: 'Product Demand Volatility', type: 'Time Series', accuracy: 89.7, lastTrained: '2024-05-08', predictions: 950, confidence: 86, status: 'Active', useCase: 'Supply Chain' },
  { id: '27', name: 'Web Traffic Predictor', type: 'LSTM', accuracy: 93.4, lastTrained: '2024-05-10', predictions: 15000, confidence: 91, status: 'Active', useCase: 'Digital Marketing' },
  { id: '28', name: 'Network Intrusion Det', type: 'Anomaly Detection', accuracy: 98.1, lastTrained: '2024-05-12', predictions: 50000, confidence: 97, status: 'Active', useCase: 'Cybersecurity' },
  { id: '29', name: 'Employee Performance', type: 'Regression', accuracy: 84.5, lastTrained: '2024-05-15', predictions: 280, confidence: 80, status: 'Failed', useCase: 'HR Analytics' },
  { id: '30', name: 'Social Media Growth', type: 'Time Series', accuracy: 90.3, lastTrained: '2024-05-18', predictions: 420, confidence: 87, status: 'Active', useCase: 'Social Media' },
];

const PredictiveAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [models, setModels] = useLocalStorage<PredictionModel[]>(STORAGE_KEY, defaultModels);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<PredictionModel | null>(null);
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null);
  const [form, setForm] = useState<Omit<PredictionModel, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Predictive Analytics. Leverage machine learning and AI models for forecasting and predictive insights.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingModel(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (model: PredictionModel) => {
    setEditingModel(model);
    setForm({
      name: model.name,
      type: model.type,
      accuracy: model.accuracy,
      lastTrained: model.lastTrained,
      predictions: model.predictions,
      confidence: model.confidence,
      status: model.status,
      useCase: model.useCase,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Model name is required.', variant: 'destructive' });
      return;
    }

    if (editingModel) {
      setModels(prev => prev.map(m => m.id === editingModel.id ? { ...editingModel, ...form } : m));
      toast({ title: 'Model Updated', description: `${form.name} has been updated.` });
    } else {
      const newModel: PredictionModel = {
        id: String(Date.now()),
        ...form,
      };
      setModels(prev => [...prev, newModel]);
      toast({ title: 'Model Created', description: `${form.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (model: PredictionModel) => {
    setModels(prev => prev.filter(m => m.id !== model.id));
    toast({ title: 'Model Deleted', description: `${model.name} has been removed.` });
  };

  const handleView = (model: PredictionModel) => {
    setSelectedModel(model);
    setIsViewDialogOpen(true);
  };

  const activeModels = models.filter(m => m.status === 'Active').length;
  const avgAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0) / models.length;
  const totalPredictions = models.reduce((sum, m) => sum + m.predictions, 0);
  const avgConfidence = models.reduce((sum, m) => sum + m.confidence, 0) / models.length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Training': 'bg-blue-100 text-blue-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'name', header: 'Model Name' },
    { key: 'type', header: 'Type' },
    { key: 'useCase', header: 'Use Case' },
    { key: 'accuracy', header: 'Accuracy %', render: (value: number) => `${value.toFixed(1)}%` },
    { key: 'confidence', header: 'Confidence %', render: (value: number) => `${value.toFixed(0)}%` },
    { key: 'predictions', header: 'Predictions', render: (value: number) => value.toLocaleString() },
    { key: 'lastTrained', header: 'Last Trained' },
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
      render: (_: any, row: PredictionModel) => (
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
          title="Predictive Analytics"
          description="Machine learning and predictive modeling"
          voiceIntroduction="Welcome to Predictive Analytics."
        />
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="records">Model Records</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Active Models"
                value={String(activeModels)}
                trend={{ value: "5", direction: "up", label: "new models" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Accuracy"
                value={`${avgAccuracy.toFixed(1)}%`}
                trend={{ value: "2.3%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Predictions"
                value={totalPredictions.toLocaleString()}
                trend={{ value: "15K", direction: "up", label: "this month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Confidence"
                value={`${avgConfidence.toFixed(0)}%`}
                trend={{ value: "3%", direction: "up", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">ML Model Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Model
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={models} />
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Forecast Accuracy"
                value="92.3%"
                trend={{ value: "1.5%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Models Deployed"
                value={String(activeModels)}
                trend={{ value: "3", direction: "up", label: "new" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Forecast Horizon"
                value="90 days"
                trend={{ value: "15 days", direction: "up", label: "extended" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Risk Detection Rate"
                value="96.8%"
                trend={{ value: "2.1%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="False Positive Rate"
                value="2.3%"
                trend={{ value: "0.8%", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Risk Cases Analyzed"
                value="15,420"
                trend={{ value: "2.5K", direction: "up", label: "this month" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Cost Savings"
                value="$2.4M"
                trend={{ value: "15%", direction: "up", label: "vs baseline" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Efficiency Gain"
                value="28%"
                trend={{ value: "5%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Optimization Cycles"
                value="1,250"
                trend={{ value: "180", direction: "up", label: "this week" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Create Prediction Model'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter model name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regression">Regression</SelectItem>
                    <SelectItem value="Classification">Classification</SelectItem>
                    <SelectItem value="Time Series">Time Series</SelectItem>
                    <SelectItem value="LSTM">LSTM</SelectItem>
                    <SelectItem value="Random Forest">Random Forest</SelectItem>
                    <SelectItem value="NLP">NLP</SelectItem>
                    <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                    <SelectItem value="Anomaly Detection">Anomaly Detection</SelectItem>
                    <SelectItem value="Optimization">Optimization</SelectItem>
                    <SelectItem value="Reinforcement">Reinforcement</SelectItem>
                    <SelectItem value="Collaborative">Collaborative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="useCase">Use Case</Label>
                <Select value={form.useCase} onValueChange={(value) => setForm({ ...form, useCase: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Forecasting">Sales Forecasting</SelectItem>
                    <SelectItem value="Demand Planning">Demand Planning</SelectItem>
                    <SelectItem value="Customer Retention">Customer Retention</SelectItem>
                    <SelectItem value="Pricing Strategy">Pricing Strategy</SelectItem>
                    <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                    <SelectItem value="Risk Management">Risk Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="accuracy">Accuracy %</Label>
                <Input
                  id="accuracy"
                  type="number"
                  value={form.accuracy}
                  onChange={(e) => setForm({ ...form, accuracy: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confidence">Confidence %</Label>
                <Input
                  id="confidence"
                  type="number"
                  value={form.confidence}
                  onChange={(e) => setForm({ ...form, confidence: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="predictions">Predictions</Label>
                <Input
                  id="predictions"
                  type="number"
                  value={form.predictions}
                  onChange={(e) => setForm({ ...form, predictions: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Active' | 'Training' | 'Inactive' | 'Failed') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastTrained">Last Trained</Label>
              <Input
                id="lastTrained"
                type="date"
                value={form.lastTrained}
                onChange={(e) => setForm({ ...form, lastTrained: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingModel ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedModel.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{selectedModel.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Use Case:</span>
                <span className="font-medium">{selectedModel.useCase}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Accuracy:</span>
                <span className="font-medium">{selectedModel.accuracy.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Confidence:</span>
                <span className="font-medium">{selectedModel.confidence.toFixed(0)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Predictions:</span>
                <span className="font-medium">{selectedModel.predictions.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Last Trained:</span>
                <span className="font-medium">{selectedModel.lastTrained}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedModel.status)}>{selectedModel.status}</Badge>
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

export default PredictiveAnalytics;
