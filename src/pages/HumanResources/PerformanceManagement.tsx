
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
import { ArrowLeft, Plus, Target, TrendingUp, Award, Edit, Trash2, Eye, Star, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  reviewPeriod: string;
  reviewType: 'Annual' | 'Mid-Year' | 'Quarterly' | 'Probation';
  overallRating: number;
  goalAchievement: number;
  competencyScore: number;
  selfAssessmentRating: number;
  managerRating: number;
  peerRating?: number;
  reviewer: string;
  reviewerId: string;
  status: 'Draft' | 'Pending Self-Assessment' | 'Pending Manager' | 'Completed';
  dueDate: string;
  completedDate?: string;
  strengths: string[];
  areasForImprovement: string[];
  comments: string;
}

interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  startDate: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
  progress: number;
}

const PerformanceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reviews');
  const seedData = getSeedData();
  const [reviews, setReviews] = useState<PerformanceReview[]>(() => seedData.performanceReviews);
  const [goals, setGoals] = useState<Goal[]>(() => seedData.goals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'review' | 'goal'>('review');
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Performance Management. Conduct reviews, set goals, and track employee performance.');
  }, [isEnabled, speak]);

  const saveReviews = (data: PerformanceReview[]) => {
    setReviews(data);
  };

  const saveGoals = (data: Goal[]) => {
    setGoals(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending Self-Assessment': 'bg-yellow-100 text-yellow-800',
      'Pending Manager': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateReview = () => {
    setDialogType('review');
    setEditingReview(null);
    setIsDialogOpen(true);
  };

  const handleSaveReview = (data: Partial<PerformanceReview>) => {
    if (editingReview) {
      const updated = reviews.map(r => r.id === editingReview.id ? { ...r, ...data } : r);
      saveReviews(updated);
    } else {
      const newReview: PerformanceReview = {
        id: generateId('rev'),
        ...data
      } as PerformanceReview;
      saveReviews([newReview, ...reviews]);
    }
    toast({ title: 'Review Saved' });
    setIsDialogOpen(false);
  };

  const handleCreateGoal = () => {
    setDialogType('goal');
    setIsDialogOpen(true);
  };

  const handleSaveGoal = (data: Partial<Goal>) => {
    const newGoal: Goal = {
      id: generateId('goal'),
      ...data
    } as Goal;
    saveGoals([...goals, newGoal]);
    toast({ title: 'Goal Created' });
    setIsDialogOpen(false);
  };

  const reviewColumns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'reviewPeriod', header: 'Period' },
    { key: 'reviewType', header: 'Type' },
    { key: 'overallRating', header: 'Rating', sortable: true, render: (v: number) => v > 0 ? <div className="flex items-center"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />{v.toFixed(1)}</div> : '-' },
    { key: 'goalAchievement', header: 'Goals', render: (v: number) => v > 0 ? `${v}%` : '-' },
    { key: 'reviewer', header: 'Reviewer' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'dueDate', header: 'Due Date' },
  ];

  const goalColumns: EnhancedColumn[] = [
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'title', header: 'Goal', searchable: true },
    { key: 'category', header: 'Category' },
    { key: 'targetDate', header: 'Due Date' },
    { key: 'progress', header: 'Progress', render: (v: number) => <div className="w-24"><div className="h-2 bg-muted rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${v}%` }} /></div></div> },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
  ];

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return reviews;
    const term = searchTerm.toLowerCase();
    return reviews.filter(r => r.employeeName.toLowerCase().includes(term) || r.department?.toLowerCase().includes(term));
  }, [reviews, searchTerm]);

  const stats = useMemo(() => ({
    completed: reviews.filter(r => r.status === 'Completed').length,
    pending: reviews.filter(r => r.status !== 'Completed').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1) : '0',
    goalsCompleted: goals.filter(g => g.status === 'Completed').length
  }), [reviews, goals]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Performance Management" description="Conduct reviews, set goals, and track employee performance" voiceIntroduction="Welcome to Performance Management." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.avgRating}</div>
            <div className="text-sm text-blue-600">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.goalsCompleted}</div>
            <div className="text-sm text-purple-600">Goals Completed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews" className="flex items-center gap-2"><Award className="h-4 w-4" />Reviews</TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2"><Target className="h-4 w-4" />Goals</TabsTrigger>
          <TabsTrigger value="cycles" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Cycles</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Performance Reviews ({filteredReviews.length})</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
                <Button onClick={handleCreateReview}><Plus className="h-4 w-4 mr-2" />Start Review</Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={reviewColumns} data={filteredReviews} exportable={true} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Goals ({goals.length})</CardTitle>
              <Button onClick={handleCreateGoal}><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={goalColumns} data={goals} exportable={true} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycles">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Review Cycles</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Q4 2024', 'Q3 2024', 'Q2 2024'].map(period => {
                  const cycleReviews = reviews.filter(r => r.reviewPeriod === period);
                  const completed = cycleReviews.filter(r => r.status === 'Completed').length;
                  return (
                    <div key={period} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{period}</h3>
                        <Badge>{completed}/{cycleReviews.length} Completed</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: `${cycleReviews.length ? (completed/cycleReviews.length)*100 : 0}%` }} /></div>
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
          <DialogHeader><DialogTitle>{dialogType === 'review' ? 'Performance Review' : 'Add Goal'}</DialogTitle></DialogHeader>
          {dialogType === 'review' ? (
            <ReviewForm review={editingReview} onSave={handleSaveReview} onCancel={() => setIsDialogOpen(false)} />
          ) : (
            <GoalForm onSave={handleSaveGoal} onCancel={() => setIsDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ReviewForm: React.FC<{
  review: PerformanceReview | null;
  onSave: (data: Partial<PerformanceReview>) => void;
  onCancel: () => void;
}> = ({ review, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: review?.employeeId || '',
    employeeName: review?.employeeName || '',
    position: review?.position || '',
    department: review?.department || '',
    reviewPeriod: review?.reviewPeriod || 'Q1 2025',
    reviewType: review?.reviewType || 'Quarterly',
    overallRating: review?.overallRating || 0,
    goalAchievement: review?.goalAchievement || 0,
    competencyScore: review?.competencyScore || 0,
    reviewer: review?.reviewer || '',
    status: review?.status || 'Draft',
    dueDate: review?.dueDate || ''
  });

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Employee</Label><Input value={formData.employeeName} onChange={e => setFormData(p => ({ ...p, employeeName: e.target.value }))} /></div>
        <div><Label>Review Period</Label><Input value={formData.reviewPeriod} onChange={e => setFormData(p => ({ ...p, reviewPeriod: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Overall Rating</Label><Input type="number" step="0.1" min="1" max="5" value={formData.overallRating} onChange={e => setFormData(p => ({ ...p, overallRating: Number(e.target.value) }))} /></div>
        <div><Label>Goal Achievement %</Label><Input type="number" value={formData.goalAchievement} onChange={e => setFormData(p => ({ ...p, goalAchievement: Number(e.target.value) }))} /></div>
      </div>
      <div><Label>Reviewer</Label><Input value={formData.reviewer} onChange={e => setFormData(p => ({ ...p, reviewer: e.target.value }))} /></div>
      <div><Label>Due Date</Label><Input type="date" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{review ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </form>
  );
};

const GoalForm: React.FC<{
  onSave: (data: Partial<Goal>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    title: '',
    description: '',
    category: 'Performance',
    weight: 10,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    status: 'Not Started' as const,
    progress: 0
  });

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div><Label>Employee</Label><Input value={formData.employeeName} onChange={e => setFormData(p => ({ ...p, employeeName: e.target.value }))} /></div>
      <div><Label>Goal Title</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
      <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Category</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
        <div><Label>Target Date</Label><Input type="date" value={formData.targetDate} onChange={e => setFormData(p => ({ ...p, targetDate: e.target.value }))} /></div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create</Button>
      </DialogFooter>
    </form>
  );
};

export default PerformanceManagement;
