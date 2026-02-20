
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
import { ArrowLeft, Plus, Heart, Shield, Umbrella, Car, Users, Edit, Trash2, Eye, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface BenefitPlan {
  id: string;
  planId: string;
  planName: string;
  category: 'Health' | 'Dental' | 'Vision' | 'Life' | 'Disability' | 'Retirement' | 'FSA' | 'HSA' | 'Other';
  provider: string;
  planType: string;
  enrolled: number;
  eligible: number;
  enrollmentRate: number;
  monthlyCost: number;
  employerContribution: number;
  employeeCost: number;
  status: 'Active' | 'Open Enrollment' | 'Inactive';
  effectiveDate: string;
}

const BenefitsAdministration: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plans');
  const seedData = getSeedData();
  const [plans, setPlans] = useState<BenefitPlan[]>(() => seedData.benefitPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<BenefitPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Benefits Administration. Manage employee benefits, insurance programs, and enrollment.');
  }, [isEnabled, speak]);

  const savePlans = (data: BenefitPlan[]) => {
    setPlans(data);
  };

  const handleCreatePlan = () => { setEditingPlan(null); setIsDialogOpen(true); };
  const handleEditPlan = (plan: BenefitPlan) => { setEditingPlan(plan); setIsDialogOpen(true); };
  const handleSavePlan = (data: Partial<BenefitPlan>) => {
    if (editingPlan) {
      const updated = plans.map(p => p.id === editingPlan.id ? { ...p, ...data } : p);
      savePlans(updated);
    } else {
      const newPlan: BenefitPlan = { id: generateId('ben'), enrolled: 0, eligible: 0, enrollmentRate: 0, status: 'Active', ...data } as BenefitPlan;
      savePlans([newPlan, ...plans]);
    }
    toast({ title: 'Plan Saved' });
    setIsDialogOpen(false);
  };
  const handleDeletePlan = (id: string) => { savePlans(plans.filter(p => p.id !== id)); toast({ title: 'Plan Deleted' }); };
  const handleViewPlan = (plan: BenefitPlan) => { setSelectedPlan(plan); setIsViewDialogOpen(true); };

  const columns: EnhancedColumn[] = [
    { key: 'planId', header: 'Plan ID', width: '80px' },
    { key: 'planName', header: 'Plan Name', searchable: true },
    { key: 'category', header: 'Category', filterable: true },
    { key: 'provider', header: 'Provider' },
    { key: 'enrolled', header: 'Enrolled', sortable: true },
    { key: 'eligible', header: 'Eligible', sortable: true },
    { key: 'enrollmentRate', header: 'Rate', render: (v: number) => <span className={v >= 80 ? 'text-green-600' : v >= 50 ? 'text-yellow-600' : 'text-red-600'}>{v}%</span> },
    { key: 'monthlyCost', header: 'Cost', render: (v: number) => `$${v}` },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={v === 'Active' ? 'default' : 'outline'}>{v}</Badge> },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleViewPlan, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditPlan, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: BenefitPlan) => handleDeletePlan(row.id), variant: 'ghost' },
  ];

  const filteredPlans = useMemo(() => {
    if (!searchTerm) return plans;
    return plans.filter(p => p.planName.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()) || p.provider?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [plans, searchTerm]);

  const stats = useMemo(() => ({
    totalPlans: plans.length,
    totalEnrolled: plans.reduce((s, p) => s + p.enrolled, 0),
    avgEnrollment: plans.length > 0 ? Math.round(plans.reduce((s, p) => s + p.enrollmentRate, 0) / plans.length) : 0,
    totalCost: plans.reduce((s, p) => s + (p.employerContribution * p.enrolled), 0)
  }), [plans]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = { 'Health': <Heart className="h-4 w-4 text-red-500" />, 'Dental': <Shield className="h-4 w-4 text-blue-500" />, 'Vision': <Eye className="h-4 w-4 text-purple-500" />, 'Life': <Heart className="h-4 w-4 text-pink-500" />, 'Retirement': <Umbrella className="h-4 w-4 text-green-500" /> };
    return icons[category] || <Shield className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Benefits Administration" description="Manage employee benefits, insurance programs, and enrollment" voiceIntroduction="Welcome to Benefits Administration." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-700">{stats.totalPlans}</div><div className="text-sm text-blue-600">Total Plans</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100"><CardContent className="p-4"><div className="text-2xl font-bold text-green-700">{stats.totalEnrolled}</div><div className="text-sm text-green-600">Enrolled</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-700">{stats.avgEnrollment}%</div><div className="text-sm text-purple-600">Avg Enrollment</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100"><CardContent className="p-4"><div className="text-2xl font-bold text-orange-700">${(stats.totalCost / 1000).toFixed(0)}K</div><div className="text-sm text-orange-600">Monthly Cost</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans"><Shield className="h-4 w-4 mr-2" />Benefit Plans</TabsTrigger>
          <TabsTrigger value="enrollment"><Users className="h-4 w-4 mr-2" />Enrollment</TabsTrigger>
          <TabsTrigger value="carriers"><Heart className="h-4 w-4 mr-2" />Carriers</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Benefit Plans ({filteredPlans.length})</CardTitle>
              <div className="flex gap-2"><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" /><Button onClick={handleCreatePlan}><Plus className="h-4 w-4 mr-2" />Add Plan</Button></div>
            </CardHeader>
            <CardContent><EnhancedDataTable columns={columns} data={filteredPlans} actions={actions} exportable={true} pageSize={10} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Enrollment Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Health', 'Dental', 'Vision', 'Life', 'Retirement', 'Disability'].map(cat => {
                  const catPlans = plans.filter(p => p.category === cat);
                  const enrolled = catPlans.reduce((s, p) => s + p.enrolled, 0);
                  const eligible = catPlans.reduce((s, p) => s + p.eligible, 0);
                  const rate = eligible > 0 ? Math.round((enrolled / eligible) * 100) : 0;
                  return (
                    <div key={cat} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">{getCategoryIcon(cat)}<h3 className="font-semibold">{cat}</h3></div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Enrolled</span><span className="font-medium">{enrolled}</span></div>
                        <div className="flex justify-between text-sm"><span>Eligible</span><span className="font-medium">{eligible}</span></div>
                        <div className="flex justify-between text-sm"><span>Participation</span><span className="font-medium">{rate}%</span></div>
                        <div className="h-2 bg-muted rounded-full"><div className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carriers">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />Insurance Carriers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(plans.map(p => p.provider))).map(provider => {
                  const providerPlans = plans.filter(p => p.provider === provider);
                  return (
                    <div key={provider} className="border rounded-lg p-4 flex justify-between items-center">
                      <div><div className="font-semibold">{provider}</div><div className="text-sm text-muted-foreground">{providerPlans.length} plans</div></div>
                      <Badge variant="outline">{providerPlans.reduce((s, p) => s + p.enrolled, 0)} enrolled</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingPlan ? 'Edit Plan' : 'Add Benefit Plan'}</DialogTitle></DialogHeader>
          <PlanForm plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Benefit Plan Details</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Plan ID</Label><div className="font-medium">{selectedPlan.planId}</div></div>
                <div><Label>Category</Label><div className="font-medium">{selectedPlan.category}</div></div>
                <div><Label>Provider</Label><div className="font-medium">{selectedPlan.provider}</div></div>
                <div><Label>Plan Type</Label><div className="font-medium">{selectedPlan.planType}</div></div>
                <div><Label>Status</Label><Badge>{selectedPlan.status}</Badge></div>
                <div><Label>Effective Date</Label><div className="font-medium">{selectedPlan.effectiveDate}</div></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Enrollment</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><Label>Enrolled</Label><div className="font-medium">{selectedPlan.enrolled}</div></div>
                  <div><Label>Eligible</Label><div className="font-medium">{selectedPlan.eligible}</div></div>
                  <div><Label>Rate</Label><div className="font-medium">{selectedPlan.enrollmentRate}%</div></div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Costs</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label>Monthly Cost</Label><div className="font-medium">${selectedPlan.monthlyCost}</div></div>
                  <div><Label>Employer Contribution</Label><div className="font-medium">${selectedPlan.employerContribution}</div></div>
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

const PlanForm: React.FC<{ plan: BenefitPlan | null; onSave: (data: Partial<BenefitPlan>) => void; onCancel: () => void; }> = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ planName: plan?.planName || '', category: plan?.category || 'Health', provider: plan?.provider || '', planType: plan?.planType || 'PPO', monthlyCost: plan?.monthlyCost || 0, employerContribution: plan?.employerContribution || 0, status: plan?.status || 'Active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Plan Name</Label><Input value={formData.planName} onChange={e => setFormData(p => ({ ...p, planName: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Category</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v as BenefitPlan['category'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Health">Health</SelectItem><SelectItem value="Dental">Dental</SelectItem><SelectItem value="Vision">Vision</SelectItem><SelectItem value="Life">Life</SelectItem><SelectItem value="Disability">Disability</SelectItem><SelectItem value="Retirement">Retirement</SelectItem><SelectItem value="FSA">FSA</SelectItem><SelectItem value="HSA">HSA</SelectItem></SelectContent></Select></div>
        <div><Label>Provider</Label><Input value={formData.provider} onChange={e => setFormData(p => ({ ...p, provider: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Plan Type</Label><Input value={formData.planType} onChange={e => setFormData(p => ({ ...p, planType: e.target.value }))} /></div>
        <div><Label>Monthly Cost</Label><Input type="number" value={formData.monthlyCost} onChange={e => setFormData(p => ({ ...p, monthlyCost: Number(e.target.value) }))} /></div>
      </div>
      <div><Label>Employer Contribution</Label><Input type="number" value={formData.employerContribution} onChange={e => setFormData(p => ({ ...p, employerContribution: Number(e.target.value) }))} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">{plan ? 'Update' : 'Create'}</Button></DialogFooter>
    </form>
  );
};

export default BenefitsAdministration;
