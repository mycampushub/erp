
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Briefcase, Target, TrendingUp, DollarSign, Plus, Edit, Trash2, TrendingDown, PieChart, BarChart3, Star, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog, formatCurrency, formatDate } from '../../lib/projectManagement/CRUDComponents';
import { PortfolioProject, StrategicObjective, PerformanceMetric, OptimizationRecommendation, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const PortfolioManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [objectives, setObjectives] = useState<StrategicObjective[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'project' | 'objective' | 'metric' | 'recommendation'>('project');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    setProjects(listEntities<PortfolioProject>(PM_STORAGE_KEYS.PORTFOLIO_PROJECTS));
    const objs = listEntities<StrategicObjective>(PM_STORAGE_KEYS.STRATEGIC_OBJECTIVES);
    const mets = listEntities<PerformanceMetric>(PM_STORAGE_KEYS.PERFORMANCE_METRICS);
    const recs = listEntities<OptimizationRecommendation>(PM_STORAGE_KEYS.OPTIMIZATION_RECS);
    
    if (objs.length === 0) {
      const defaults: StrategicObjective[] = [
        { id: 'obj-001', name: 'Increase Revenue', description: 'Grow annual revenue by 20%', projects: ['PRJ-001', 'PRJ-002'], alignmentScore: 85, status: 'On Track' },
        { id: 'obj-002', name: 'Improve Efficiency', description: 'Reduce operational costs by 15%', projects: ['PRJ-003'], alignmentScore: 72, status: 'At Risk' },
        { id: 'obj-003', name: 'Expand Market Share', description: 'Enter 2 new markets', projects: ['PRJ-004', 'PRJ-005'], alignmentScore: 90, status: 'On Track' },
      ];
      defaults.forEach(o => upsertEntity(PM_STORAGE_KEYS.STRATEGIC_OBJECTIVES, o));
      setObjectives(defaults);
    } else setObjectives(objs);

    if (mets.length === 0) {
      const defaults: PerformanceMetric[] = [
        { id: 'met-001', name: 'Project Success Rate', value: 87, target: 90, trend: 'up', period: 'Q1 2025' },
        { id: 'met-002', name: 'Budget Utilization', value: 94, target: 95, trend: 'up', period: 'Q1 2025' },
        { id: 'met-003', name: 'Resource Efficiency', value: 78, target: 85, trend: 'down', period: 'Q1 2025' },
      ];
      defaults.forEach(m => upsertEntity(PM_STORAGE_KEYS.PERFORMANCE_METRICS, m));
      setMetrics(defaults);
    } else setMetrics(mets);

    if (recs.length === 0) {
      const defaults: OptimizationRecommendation[] = [
        { id: 'rec-001', type: 'Resource', title: 'Reallocate Resources', description: 'Shift 2 developers from Project B to Project A', impact: 'High', effort: 'Medium', status: 'Proposed' },
        { id: 'rec-002', type: 'Budget', title: 'Reduce Budget', description: 'Cut non-essential spending in Project C', impact: 'Medium', effort: 'Low', status: 'Approved' },
      ];
      defaults.forEach(r => upsertEntity(PM_STORAGE_KEYS.OPTIMIZATION_RECS, r));
      setRecommendations(defaults);
    } else setRecommendations(recs);
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Portfolio Management. Manage your project portfolio and strategic alignment.');
    loadData();
  }, [isEnabled, speak, loadData]);

  const handleCRUD = (type: 'project' | 'objective' | 'metric' | 'recommendation', item?: any, edit = false) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'project' | 'objective' | 'metric' | 'recommendation') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.PORTFOLIO_PROJECTS;
    let setter: any = setProjects;
    if (dialogType === 'objective') { key = PM_STORAGE_KEYS.STRATEGIC_OBJECTIVES; setter = setObjectives; }
    else if (dialogType === 'metric') { key = PM_STORAGE_KEYS.PERFORMANCE_METRICS; setter = setMetrics; }
    else if (dialogType === 'recommendation') { key = PM_STORAGE_KEYS.OPTIMIZATION_RECS; setter = setRecommendations; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.PORTFOLIO_PROJECTS;
    let setter: any = setProjects;
    if (dialogType === 'objective') { key = PM_STORAGE_KEYS.STRATEGIC_OBJECTIVES; setter = setObjectives; }
    else if (dialogType === 'metric') { key = PM_STORAGE_KEYS.PERFORMANCE_METRICS; setter = setMetrics; }
    else if (dialogType === 'recommendation') { key = PM_STORAGE_KEYS.OPTIMIZATION_RECS; setter = setRecommendations; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'project' ? 'pf' : dialogType === 'objective' ? 'obj' : dialogType === 'metric' ? 'met' : 'rec') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Project Name', sortable: true },
    { key: 'priority', header: 'Priority', render: (v: string) => (
      <Badge variant={v === 'High' ? 'destructive' : v === 'Medium' ? 'default' : 'secondary'}>{v}</Badge>
    )},
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'In Progress' ? 'default' : v === 'Completed' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
    { key: 'progress', header: 'Progress', render: (v: number) => (
      <div className="w-20"><Progress value={v} className="h-2" /><span className="text-xs">{v}%</span></div>
    )},
    { key: 'budget', header: 'Budget', render: (v: number) => formatCurrency(v) },
    { key: 'roi', header: 'ROI' },
    { key: 'strategicValue', header: 'Value', render: (v: string) => (
      <Badge variant={v === 'High' ? 'default' : v === 'Medium' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
  ];

  const objectiveColumns = [
    { key: 'name', header: 'Objective', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'projects', header: 'Linked Projects', render: (v: string[]) => v?.join(', ') || '-' },
    { key: 'alignmentScore', header: 'Alignment', render: (v: number) => (
      <div className="flex items-center gap-2">
        <Progress value={v} className="h-2 w-16" />
        <span className="text-sm">{v}%</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'On Track' ? 'default' : v === 'At Risk' ? 'destructive' : 'secondary'}>{v}</Badge>
    )},
  ];

  const metricColumns = [
    { key: 'name', header: 'Metric', sortable: true },
    { key: 'value', header: 'Current', render: (v: number) => <span className="font-medium">{v}%</span> },
    { key: 'target', header: 'Target', render: (v: number) => <span className="text-gray-500">{v}%</span> },
    { key: 'trend', header: 'Trend', render: (v: string) => (
      v === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />
    )},
    { key: 'period', header: 'Period' },
  ];

  const recommendationColumns = [
    { key: 'type', header: 'Type' },
    { key: 'title', header: 'Recommendation', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'impact', header: 'Impact', render: (v: string) => (
      <Badge variant={v === 'High' ? 'destructive' : v === 'Medium' ? 'default' : 'secondary'}>{v}</Badge>
    )},
    { key: 'effort', header: 'Effort', render: (v: string) => (
      <Badge variant={v === 'High' ? 'destructive' : v === 'Medium' ? 'default' : 'secondary'}>{v}</Badge>
    )},
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Implemented' ? 'default' : v === 'Approved' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
  ];

  const getFormFields = () => {
    if (dialogType === 'project') return [
      { name: 'name', label: 'Project Name', type: 'text' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'priority', label: 'Priority', type: 'select' as const, options: [{ label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }] },
      { name: 'status', label: 'Status', type: 'select' as const, options: [{ label: 'Planning', value: 'Planning' }, { label: 'In Progress', value: 'In Progress' }, { label: 'Completed', value: 'Completed' }, { label: 'On Hold', value: 'On Hold' }] },
      { name: 'budget', label: 'Budget', type: 'currency' as const },
      { name: 'roi', label: 'ROI', type: 'text' as const, placeholder: '25%' },
      { name: 'strategicValue', label: 'Strategic Value', type: 'select' as const, options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
      { name: 'manager', label: 'Manager', type: 'text' as const },
      { name: 'sponsor', label: 'Sponsor', type: 'text' as const },
    ];
    if (dialogType === 'objective') return [
      { name: 'name', label: 'Objective Name', type: 'text' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'projects', label: 'Linked Projects (comma-separated IDs)', type: 'text' as const },
      { name: 'alignmentScore', label: 'Alignment Score %', type: 'number' as const },
      { name: 'status', label: 'Status', type: 'select' as const, options: [{ label: 'On Track', value: 'On Track' }, { label: 'At Risk', value: 'At Risk' }, { label: 'Behind', value: 'Behind' }] },
    ];
    if (dialogType === 'metric') return [
      { name: 'name', label: 'Metric Name', type: 'text' as const, required: true },
      { name: 'value', label: 'Current Value %', type: 'number' as const },
      { name: 'target', label: 'Target Value %', type: 'number' as const },
      { name: 'trend', label: 'Trend', type: 'select' as const, options: [{ label: 'Up', value: 'up' }, { label: 'Down', value: 'down' }] },
      { name: 'period', label: 'Period', type: 'text' as const, placeholder: 'Q1 2025' },
    ];
    return [
      { name: 'type', label: 'Type', type: 'select' as const, options: [{ label: 'Resource', value: 'Resource' }, { label: 'Budget', value: 'Budget' }, { label: 'Schedule', value: 'Schedule' }] },
      { name: 'title', label: 'Title', type: 'text' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'impact', label: 'Impact', type: 'select' as const, options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
      { name: 'effort', label: 'Effort Required', type: 'select' as const, options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
      { name: 'status', label: 'Status', type: 'select' as const, options: [{ label: 'Proposed', value: 'Proposed' }, { label: 'Approved', value: 'Approved' }, { label: 'Implemented', value: 'Implemented' }] },
    ];
  };

  const totalValue = projects.reduce((sum, p) => sum + p.budget, 0);
  const avgRoi = projects.length ? Math.round(projects.reduce((sum, p) => sum + parseInt(p.roi || '0'), 0) / projects.length) : 0;
  const highValueProjects = projects.filter(p => p.strategicValue === 'High').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Portfolio Management" description="Manage project portfolio and strategic alignment" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Portfolio Value" value={formatCurrency(totalValue)} icon={<Briefcase className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Avg ROI" value={`${avgRoi}%`} icon={<TrendingUp className="h-6 w-6 text-green-600" />} />
        <StatCard title="High Value Projects" value={highValueProjects} icon={<Star className="h-6 w-6 text-yellow-600" />} />
        <StatCard title="Budget Adherence" value="94%" icon={<DollarSign className="h-6 w-6 text-orange-600" />} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="strategy">Strategic Alignment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Portfolio Projects</h3>
              <Button onClick={() => handleCRUD('project')}><Plus className="h-4 w-4 mr-2" />Add Project</Button>
            </div>
            <EnhancedCRUDTable data={projects} columns={columns} title="" pageSize={10}
              onCreate={() => handleCRUD('project')} onEdit={item => handleCRUD('project', item, true)} onDelete={item => handleDelete(item, 'project')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="strategy" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Strategic Objectives</h3>
              <Button onClick={() => handleCRUD('objective')}><Plus className="h-4 w-4 mr-2" />Add Objective</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {objectives.map(obj => (
                <Card key={obj.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{obj.name}</h4>
                    <Badge variant={obj.status === 'On Track' ? 'default' : 'destructive'}>{obj.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{obj.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={obj.alignmentScore} className="flex-1" />
                    <span className="text-sm font-medium">{obj.alignmentScore}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{obj.projects?.length || 0} linked projects</p>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={objectives} columns={objectiveColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('objective')} onEdit={item => handleCRUD('objective', item, true)} onDelete={item => handleDelete(item, 'objective')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <Button onClick={() => handleCRUD('metric')}><Plus className="h-4 w-4 mr-2" />Add Metric</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {metrics.map(metric => (
                <Card key={metric.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{metric.name}</h4>
                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="text-2xl font-bold mb-2">{metric.value}%</div>
                  <div className="flex items-center gap-2">
                    <Progress value={(metric.value / metric.target) * 100} className="flex-1" />
                    <span className="text-sm text-gray-500">Target: {metric.target}%</span>
                  </div>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={metrics} columns={metricColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('metric')} onEdit={item => handleCRUD('metric', item, true)} onDelete={item => handleDelete(item, 'metric')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
              <Button onClick={() => handleCRUD('recommendation')}><Plus className="h-4 w-4 mr-2" />Add Recommendation</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {recommendations.map(rec => (
                <Card key={rec.id} className={`p-4 border-l-4 ${rec.impact === 'High' ? 'border-l-red-500' : rec.impact === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{rec.type}</Badge>
                    <Badge variant={rec.status === 'Implemented' ? 'default' : rec.status === 'Approved' ? 'secondary' : 'outline'}>{rec.status}</Badge>
                  </div>
                  <h4 className="font-medium mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{rec.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Impact: {rec.impact}</span>
                    <span>Effort: {rec.effort}</span>
                  </div>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={recommendations} columns={recommendationColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('recommendation')} onEdit={item => handleCRUD('recommendation', item, true)} onDelete={item => handleDelete(item, 'recommendation')} />
          </Card>
        </TabsContent>
      </Tabs>
      
      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'project' ? 'Portfolio Project' : dialogType === 'objective' ? 'Strategic Objective' : dialogType === 'metric' ? 'Performance Metric' : 'Recommendation'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item?" confirmLabel="Delete" />
    </div>
  );
};

export default PortfolioManagement;
