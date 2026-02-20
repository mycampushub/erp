
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
import { ArrowLeft, AlertTriangle, Shield, TrendingDown, Target, Plus, Edit, Trash2, Activity, BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog, formatDate
} from '../../lib/projectManagement/CRUDComponents';
import { Risk, MitigationAction, ContingencyPlan, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const RiskManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('risks');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [mitigations, setMitigations] = useState<MitigationAction[]>([]);
  const [contingencies, setContingencies] = useState<ContingencyPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'risk' | 'mitigation' | 'contingency'>('risk');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    setRisks(listEntities<Risk>(PM_STORAGE_KEYS.RISKS));
    setMitigations(listEntities<MitigationAction>(PM_STORAGE_KEYS.MITIGATION_ACTIONS));
    const existingCont = listEntities<ContingencyPlan>(PM_STORAGE_KEYS.CONTINGENCY_PLANS);
    if (existingCont.length === 0) {
      const defaultCont: ContingencyPlan[] = [
        { id: 'cont-001', riskId: 'RISK-001', trigger: 'Data migration exceeds timeline', response: 'Deploy additional resources', responsible: 'Project Manager', resources: '2 Data Engineers' },
        { id: 'cont-002', riskId: 'RISK-002', trigger: 'Key resource unavailable', response: 'Cross-train team members', responsible: 'HR Manager', resources: 'Training budget' },
      ];
      defaultCont.forEach(c => upsertEntity(PM_STORAGE_KEYS.CONTINGENCY_PLANS, c));
      setContingencies(defaultCont);
    } else {
      setContingencies(existingCont);
    }
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Risk Management. Identify, assess, and mitigate project risks effectively.');
    loadData();
  }, [isEnabled, speak, loadData]);

  const handleCRUD = (type: 'risk' | 'mitigation' | 'contingency', item?: any, edit = false) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'risk' | 'mitigation' | 'contingency') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.RISKS;
    let setter: any = setRisks;
    if (dialogType === 'mitigation') { key = PM_STORAGE_KEYS.MITIGATION_ACTIONS; setter = setMitigations; }
    else if (dialogType === 'contingency') { key = PM_STORAGE_KEYS.CONTINGENCY_PLANS; setter = setContingencies; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.RISKS;
    let setter: any = setRisks;
    if (dialogType === 'mitigation') { key = PM_STORAGE_KEYS.MITIGATION_ACTIONS; setter = setMitigations; }
    else if (dialogType === 'contingency') { key = PM_STORAGE_KEYS.CONTINGENCY_PLANS; setter = setContingencies; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'risk' ? 'risk' : dialogType === 'mitigation' ? 'mit' : 'cont') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const riskColumns = [
    { key: 'title', header: 'Risk', sortable: true },
    { key: 'projectId', header: 'Project' },
    { key: 'category', header: 'Category' },
    { key: 'probability', header: 'Probability', render: (v: string) => (
      <Badge variant={v === 'High' ? 'destructive' : v === 'Medium' ? 'default' : 'secondary'}>{v}</Badge>
    )},
    { key: 'impact', header: 'Impact', render: (v: string) => (
      <Badge variant={v === 'High' ? 'destructive' : v === 'Medium' ? 'default' : 'secondary'}>{v}</Badge>
    )},
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Open' ? 'destructive' : v === 'Mitigated' ? 'default' : v === 'Monitoring' ? 'outline' : 'secondary'}>{v}</Badge>
    )},
    { key: 'owner', header: 'Owner' },
    { key: 'dueDate', header: 'Due Date', render: (v: string) => formatDate(v) },
  ];

  const mitigationColumns = [
    { key: 'action', header: 'Action', sortable: true },
    { key: 'riskId', header: 'Risk ID' },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Completed' ? 'default' : v === 'In Progress' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
    { key: 'dueDate', header: 'Due Date', render: (v: string) => formatDate(v) },
    { key: 'completedDate', header: 'Completed', render: (v: string) => v ? formatDate(v) : '-' },
    { key: 'owner', header: 'Owner' },
  ];

  const contingencyColumns = [
    { key: 'riskId', header: 'Risk ID', sortable: true },
    { key: 'trigger', header: 'Trigger Condition' },
    { key: 'response', header: 'Response Plan' },
    { key: 'responsible', header: 'Responsible' },
    { key: 'resources', header: 'Resources Required' },
  ];

  const getFormFields = () => {
    if (dialogType === 'risk') return [
      { name: 'title', label: 'Risk Title', type: 'text' as const, required: true, placeholder: 'Enter risk title' },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
      { name: 'category', label: 'Category', type: 'select' as const, options: [
        { label: 'Technical', value: 'Technical' }, { label: 'Schedule', value: 'Schedule' },
        { label: 'Resource', value: 'Resource' }, { label: 'Financial', value: 'Financial' }, { label: 'External', value: 'External' }
      ]},
      { name: 'probability', label: 'Probability', type: 'select' as const, options: [
        { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }
      ]},
      { name: 'impact', label: 'Impact', type: 'select' as const, options: [
        { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }
      ]},
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Open', value: 'Open' }, { label: 'Monitoring', value: 'Monitoring' }, { label: 'Mitigated', value: 'Mitigated' }, { label: 'Closed', value: 'Closed' }
      ]},
      { name: 'owner', label: 'Owner', type: 'text' as const },
      { name: 'dueDate', label: 'Due Date', type: 'date' as const },
    ];
    if (dialogType === 'mitigation') return [
      { name: 'action', label: 'Action Description', type: 'textarea' as const, rows: 2, required: true },
      { name: 'riskId', label: 'Related Risk ID', type: 'text' as const, required: true },
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Planned', value: 'Planned' }, { label: 'In Progress', value: 'In Progress' }, { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' }
      ]},
      { name: 'dueDate', label: 'Due Date', type: 'date' as const },
      { name: 'completedDate', label: 'Completed Date', type: 'date' as const },
      { name: 'owner', label: 'Owner', type: 'text' as const },
    ];
    return [
      { name: 'riskId', label: 'Risk ID', type: 'text' as const, required: true },
      { name: 'trigger', label: 'Trigger Condition', type: 'textarea' as const, rows: 2, required: true },
      { name: 'response', label: 'Response Plan', type: 'textarea' as const, rows: 2, required: true },
      { name: 'responsible', label: 'Responsible Person', type: 'text' as const, required: true },
      { name: 'resources', label: 'Resources Required', type: 'text' as const },
    ];
  };

  const highRisks = risks.filter(r => r.probability === 'High' && r.impact === 'High').length;
  const openRisks = risks.filter(r => r.status === 'Open').length;
  const mitigated = risks.filter(r => r.status === 'Mitigated').length;
  const activeMitigations = mitigations.filter(m => m.status === 'In Progress').length;

  const getRiskScore = (prob: string, imp: string) => {
    const p = prob === 'High' ? 3 : prob === 'Medium' ? 2 : 1;
    const i = imp === 'High' ? 3 : imp === 'Medium' ? 2 : 1;
    return p * i;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Risk Management" description="Identify, assess, and mitigate project risks" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Critical Risks" value={highRisks} icon={<AlertTriangle className="h-6 w-6 text-red-600" />} subtitle="High prob. & impact" />
        <StatCard title="Open Risks" value={openRisks} icon={<AlertCircle className="h-6 w-6 text-orange-600" />} />
        <StatCard title="Mitigated" value={mitigated} icon={<Shield className="h-6 w-6 text-green-600" />} />
        <StatCard title="Active Actions" value={activeMitigations} icon={<Activity className="h-6 w-6 text-blue-600" />} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Risk Register</h3>
              <Button onClick={() => handleCRUD('risk')}><Plus className="h-4 w-4 mr-2" />Add Risk</Button>
            </div>
            <EnhancedCRUDTable data={risks} columns={riskColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('risk')} onEdit={item => handleCRUD('risk', item, true)} onDelete={item => handleDelete(item, 'risk')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="mitigation" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mitigation Actions</h3>
              <Button onClick={() => handleCRUD('mitigation')}><Plus className="h-4 w-4 mr-2" />Add Action</Button>
            </div>
            <EnhancedCRUDTable data={mitigations} columns={mitigationColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('mitigation')} onEdit={item => handleCRUD('mitigation', item, true)} onDelete={item => handleDelete(item, 'mitigation')} />
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contingency Plans</h3>
              <Button variant="outline" onClick={() => handleCRUD('contingency')}><Plus className="h-4 w-4 mr-2" />Add Plan</Button>
            </div>
            <EnhancedCRUDTable data={contingencies} columns={contingencyColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('contingency')} onEdit={item => handleCRUD('contingency', item, true)} onDelete={item => handleDelete(item, 'contingency')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="assessment" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Assessment Matrix</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold text-red-700 mb-2">High Risk (7-9)</h4>
                <div className="space-y-2">
                  {risks.filter(r => getRiskScore(r.probability, r.impact) >= 7).map(r => (
                    <div key={r.id} className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category}</p>
                    </div>
                  ))}
                  {risks.filter(r => getRiskScore(r.probability, r.impact) >= 7).length === 0 && <p className="text-sm text-gray-500">No high risks</p>}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold text-yellow-700 mb-2">Medium Risk (4-6)</h4>
                <div className="space-y-2">
                  {risks.filter(r => getRiskScore(r.probability, r.impact) >= 4 && getRiskScore(r.probability, r.impact) <= 6).map(r => (
                    <div key={r.id} className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category}</p>
                    </div>
                  ))}
                  {risks.filter(r => getRiskScore(r.probability, r.impact) >= 4 && getRiskScore(r.probability, r.impact) <= 6).length === 0 && <p className="text-sm text-gray-500">No medium risks</p>}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-700 mb-2">Low Risk (1-3)</h4>
                <div className="space-y-2">
                  {risks.filter(r => getRiskScore(r.probability, r.impact) <= 3).map(r => (
                    <div key={r.id} className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category}</p>
                    </div>
                  ))}
                  {risks.filter(r => getRiskScore(r.probability, r.impact) <= 3).length === 0 && <p className="text-sm text-gray-500">No low risks</p>}
                </div>
              </div>
            </div>
            
            <h4 className="font-semibold mb-3">Risk Distribution by Category</h4>
            <div className="space-y-3">
              {['Technical', 'Schedule', 'Resource', 'Financial', 'External'].map(cat => {
                const count = risks.filter(r => r.category === cat).length;
                const pct = risks.length > 0 ? (count / risks.length) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat}</span>
                      <span>{count} ({Math.round(pct)}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Monitoring Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><Activity className="h-4 w-4 mr-2" />Risk Status Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open</span>
                    <Badge variant="destructive">{openRisks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monitoring</span>
                    <Badge variant="outline">{risks.filter(r => r.status === 'Monitoring').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mitigated</span>
                    <Badge variant="default">{mitigated}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Closed</span>
                    <Badge variant="secondary">{risks.filter(r => r.status === 'Closed').length}</Badge>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><BarChart3 className="h-4 w-4 mr-2" />Risk Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Identified this month</span><span className="font-medium">{risks.length}</span></div>
                  <div className="flex justify-between text-sm"><span>Mitigated this month</span><span className="font-medium">{mitigated}</span></div>
                  <div className="flex justify-between text-sm"><span>Mitigation success rate</span><span className="font-medium text-green-600">{risks.length > 0 ? Math.round((mitigated / risks.length) * 100) : 0}%</span></div>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium mb-3">Recent Risk Activity</h4>
            <div className="space-y-2">
              {risks.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category} • {r.owner}</p>
                    </div>
                  </div>
                  <Badge variant={r.status === 'Open' ? 'destructive' : r.status === 'Mitigated' ? 'default' : 'outline'}>{r.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'risk' ? 'Risk' : dialogType === 'mitigation' ? 'Mitigation Action' : 'Contingency Plan'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item? This action cannot be undone." confirmLabel="Delete" />
    </div>
  );
};

export default RiskManagement;
