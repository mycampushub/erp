
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Plus, Crown, TrendingUp, Users, Grid3X3, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface SuccessionPlan {
  id: string;
  positionId: string;
  position: string;
  department: string;
  currentHolder: string;
  currentHolderId: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  successors: number;
  readyNow: number;
  ready1Year: number;
  ready2Plus: number;
  status: 'Active' | 'Critical' | 'Complete';
  lastReviewDate: string;
  nextReviewDate: string;
}

const SuccessionPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plans');
  const seedData = getSeedData();
  const [plans, setPlans] = useState<SuccessionPlan[]>(() => seedData.successionPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<SuccessionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Succession Planning. Plan for leadership succession and career development.');
  }, [isEnabled, speak]);

  const savePlans = (data: SuccessionPlan[]) => {
    setPlans(data);
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = { 'Low': 'bg-green-100 text-green-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-orange-100 text-orange-800', 'Critical': 'bg-red-100 text-red-800' };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const handleCreatePlan = () => { setEditingPlan(null); setIsDialogOpen(true); };
  const handleEditPlan = (plan: SuccessionPlan) => { setEditingPlan(plan); setIsDialogOpen(true); };
  const handleSavePlan = (data: Partial<SuccessionPlan>) => {
    if (editingPlan) {
      const updated = plans.map(p => p.id === editingPlan.id ? { ...p, ...data } : p);
      savePlans(updated);
    } else {
      const newPlan: SuccessionPlan = { id: generateId('succ'), successors: 0, readyNow: 0, ready1Year: 0, ready2Plus: 0, ...data } as SuccessionPlan;
      savePlans([newPlan, ...plans]);
    }
    toast({ title: 'Plan Saved' });
    setIsDialogOpen(false);
  };
  const handleDeletePlan = (id: string) => { savePlans(plans.filter(p => p.id !== id)); toast({ title: 'Plan Deleted' }); };
  const handleViewPlan = (plan: SuccessionPlan) => { setSelectedPlan(plan); setIsViewDialogOpen(true); };

  const columns: EnhancedColumn[] = [
    { key: 'positionId', header: 'ID', width: '80px' },
    { key: 'position', header: 'Position', searchable: true },
    { key: 'department', header: 'Department', filterable: true },
    { key: 'currentHolder', header: 'Current Holder' },
    { key: 'riskLevel', header: 'Risk', render: (v: string) => <Badge className={getRiskColor(v)}>{v}</Badge> },
    { key: 'successors', header: 'Total', render: (v: number, row: SuccessionPlan) => <span className="font-medium">{row.readyNow + row.ready1Year + row.ready2Plus}</span> },
    { key: 'readyNow', header: 'Ready Now', render: (v: number) => <Badge variant="outline" className="bg-green-50">{v}</Badge> },
    { key: 'ready1Year', header: '1 Year', render: (v: number) => <Badge variant="outline" className="bg-yellow-50">{v}</Badge> },
    { key: 'ready2Plus', header: '2+ Years', render: (v: number) => <Badge variant="outline" className="bg-blue-50">{v}</Badge> },
    { key: 'status', header: 'Status', render: (v: string) => <Badge>{v}</Badge> },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleViewPlan, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditPlan, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: SuccessionPlan) => handleDeletePlan(row.id), variant: 'ghost' },
  ];

  const filteredPlans = useMemo(() => {
    if (!searchTerm) return plans;
    return plans.filter(p => p.position.toLowerCase().includes(searchTerm.toLowerCase()) || p.department?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [plans, searchTerm]);

  const stats = useMemo(() => ({
    total: plans.length,
    highRisk: plans.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length,
    readyNow: plans.reduce((s, p) => s + p.readyNow, 0),
    coverage: plans.length > 0 ? Math.round((plans.reduce((s, p) => s + p.readyNow, 0) / plans.length) * 100) : 0
  }), [plans]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Succession Planning" description="Plan for leadership succession and career development" voiceIntroduction="Welcome to Succession Planning." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-700">{stats.total}</div><div className="text-sm text-blue-600">Key Positions</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100"><CardContent className="p-4"><div className="text-2xl font-bold text-red-700">{stats.highRisk}</div><div className="text-sm text-red-600">High Risk</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100"><CardContent className="p-4"><div className="text-2xl font-bold text-green-700">{stats.readyNow}</div><div className="text-sm text-green-600">Ready Now</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-700">{stats.coverage}%</div><div className="text-sm text-purple-600">Coverage</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans"><Crown className="h-4 w-4 mr-2" />Plans</TabsTrigger>
          <TabsTrigger value="grid"><Grid3X3 className="h-4 w-4 mr-2" />9-Box</TabsTrigger>
          <TabsTrigger value="risk"><AlertTriangle className="h-4 w-4 mr-2" />Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />Succession Plans ({filteredPlans.length})</CardTitle>
              <div className="flex gap-2"><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" /><Button onClick={handleCreatePlan}><Plus className="h-4 w-4 mr-2" />Add Plan</Button></div>
            </CardHeader>
            <CardContent><EnhancedDataTable columns={columns} data={filteredPlans} actions={actions} exportable={true} pageSize={10} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Grid3X3 className="h-5 w-5" />Readiness Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="h-32 bg-green-50 rounded-lg p-4 flex items-center justify-center">
                    <div><div className="font-bold text-green-700">High Readiness</div><div className="text-sm text-green-600">{plans.filter(p => p.readyNow >= 2).length} positions</div></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-32 bg-yellow-50 rounded-lg p-4 flex items-center justify-center">
                    <div><div className="font-bold text-yellow-700">Medium Readiness</div><div className="text-sm text-yellow-600">{plans.filter(p => p.readyNow === 1 || p.ready1Year >= 1).length} positions</div></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-32 bg-red-50 rounded-lg p-4 flex items-center justify-center">
                    <div><div className="font-bold text-red-700">Low Readiness</div><div className="text-sm text-red-600">{plans.filter(p => p.readyNow === 0 && p.ready1Year === 0).length} positions</div></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Risk Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plans.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').map(plan => (
                  <div key={plan.id} className={`border-l-4 ${plan.riskLevel === 'Critical' ? 'border-red-500' : 'border-orange-500'} rounded p-4 bg-muted/30`}>
                    <div className="flex justify-between items-start">
                      <div><div className="font-semibold">{plan.position}</div><div className="text-sm text-muted-foreground">{plan.department}</div></div>
                      <Badge className={getRiskColor(plan.riskLevel)}>{plan.riskLevel} Risk</Badge>
                    </div>
                    <div className="mt-2 text-sm">Current Holder: {plan.currentHolder}</div>
                  </div>
                ))}
                {plans.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length === 0 && <p className="text-muted-foreground">No high-risk positions found.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingPlan ? 'Edit Plan' : 'Add Succession Plan'}</DialogTitle></DialogHeader>
          <PlanForm plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Succession Plan Details</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Position ID</Label><div className="font-medium">{selectedPlan.positionId}</div></div>
                <div><Label>Position</Label><div className="font-medium">{selectedPlan.position}</div></div>
                <div><Label>Department</Label><div className="font-medium">{selectedPlan.department}</div></div>
                <div><Label>Current Holder</Label><div className="font-medium">{selectedPlan.currentHolder}</div></div>
                <div><Label>Risk Level</Label><Badge>{selectedPlan.riskLevel}</Badge></div>
                <div><Label>Status</Label><Badge>{selectedPlan.status}</Badge></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Successor Readiness</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><Label>Ready Now</Label><div className="font-medium text-green-600">{selectedPlan.readyNow}</div></div>
                  <div><Label>Ready 1 Year</Label><div className="font-medium text-yellow-600">{selectedPlan.ready1Year}</div></div>
                  <div><Label>Ready 2+ Years</Label><div className="font-medium text-blue-600">{selectedPlan.ready2Plus}</div></div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PlanForm: React.FC<{ plan: SuccessionPlan | null; onSave: (data: Partial<SuccessionPlan>) => void; onCancel: () => void; }> = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    position: plan?.position || '', department: plan?.department || '', currentHolder: plan?.currentHolder || '', riskLevel: plan?.riskLevel || 'Medium', status: plan?.status || 'Active'
  });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Position</Label><Input value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value }))} /></div>
      <div><Label>Department</Label><Input value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} /></div>
      <div><Label>Current Holder</Label><Input value={formData.currentHolder} onChange={e => setFormData(p => ({ ...p, currentHolder: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Risk Level</Label><Select value={formData.riskLevel} onValueChange={v => setFormData(p => ({ ...p, riskLevel: v as 'Low' | 'Medium' | 'High' | 'Critical' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select></div>
        <div><Label>Status</Label><Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as 'Active' | 'Critical' | 'Complete' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Critical">Critical</SelectItem><SelectItem value="Complete">Complete</SelectItem></SelectContent></Select></div>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">{plan ? 'Update' : 'Create'}</Button></DialogFooter>
    </form>
  );
};

export default SuccessionPlanning;
