
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
import { ArrowLeft, Plus, BookOpen, Award, Clock, Users, Edit, Trash2, Eye, PlayCircle, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface LearningProgram {
  id: string;
  programId: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  duration: string;
  durationHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  format: 'Online' | 'In-Person' | 'Hybrid';
  enrolled: number;
  completed: number;
  completionRate: number;
  status: 'Active' | 'Completed' | 'Draft' | 'Archived';
  startDate: string;
  endDate?: string;
  prerequisites: string[];
  objectives: string[];
  instructor?: string;
}

const LearningManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('programs');
  const seedData = getSeedData();
  const [programs, setPrograms] = useState<LearningProgram[]>(() => seedData.learningPrograms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<LearningProgram | null>(null);
  const [editingProgram, setEditingProgram] = useState<LearningProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Learning Management. Manage training programs, certifications, and employee skill development.');
  }, [isEnabled, speak]);

  const savePrograms = (data: LearningProgram[]) => {
    setPrograms(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateProgram = () => {
    setEditingProgram(null);
    setIsDialogOpen(true);
  };

  const handleEditProgram = (program: LearningProgram) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleSaveProgram = (data: Partial<LearningProgram>) => {
    if (editingProgram) {
      const updated = programs.map(p => p.id === editingProgram.id ? { ...p, ...data } : p);
      savePrograms(updated);
      toast({ title: 'Program Updated' });
    } else {
      const newProgram: LearningProgram = {
        id: generateId('lrn'),
        programId: `LRN-${String(programs.length + 1).padStart(3, '0')}`,
        enrolled: 0,
        completed: 0,
        completionRate: 0,
        ...data
      } as LearningProgram;
      savePrograms([newProgram, ...programs]);
      toast({ title: 'Program Created' });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    savePrograms(updated);
    toast({ title: 'Program Deleted' });
  };
  const handleViewProgram = (program: LearningProgram) => { setSelectedProgram(program); setIsViewDialogOpen(true); };

  const columns: EnhancedColumn[] = [
    { key: 'programId', header: 'ID', width: '80px' },
    { key: 'title', header: 'Program Title', searchable: true },
    { key: 'category', header: 'Category', filterable: true },
    { key: 'provider', header: 'Provider' },
    { key: 'duration', header: 'Duration' },
    { key: 'level', header: 'Level', render: (v: string) => <Badge variant="outline">{v}</Badge> },
    { key: 'enrolled', header: 'Enrolled', sortable: true },
    { key: 'completed', header: 'Completed', sortable: true },
    { key: 'completionRate', header: 'Completion', render: (v: number) => <span className={v >= 80 ? 'text-green-600' : v >= 50 ? 'text-yellow-600' : 'text-red-600'}>{v}%</span> },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'startDate', header: 'Start Date', sortable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleViewProgram, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditProgram, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: LearningProgram) => handleDeleteProgram(row.id), variant: 'ghost' },
  ];

  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    const term = searchTerm.toLowerCase();
    return programs.filter(p => 
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.provider.toLowerCase().includes(term)
    );
  }, [programs, searchTerm]);

  const stats = useMemo(() => ({
    active: programs.filter(p => p.status === 'Active').length,
    totalEnrolled: programs.reduce((s, p) => s + p.enrolled, 0),
    avgCompletion: programs.length > 0 ? Math.round(programs.reduce((s, p) => s + p.completionRate, 0) / programs.length) : 0,
    totalCompleted: programs.reduce((s, p) => s + p.completed, 0)
  }), [programs]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Learning Management" description="Manage training programs, certifications, and employee skill development" voiceIntroduction="Welcome to Learning Management." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <div className="text-sm text-green-600">Active Programs</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.totalEnrolled}</div>
            <div className="text-sm text-blue-600">Total Enrolled</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.avgCompletion}%</div>
            <div className="text-sm text-purple-600">Avg Completion</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-700">{stats.totalCompleted}</div>
            <div className="text-sm text-orange-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="programs" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Programs</TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2"><Award className="h-4 w-4" />Course Catalog</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><Clock className="h-4 w-4" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Learning Programs ({filteredPrograms.length})</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
                <Button onClick={handleCreateProgram}><Plus className="h-4 w-4 mr-2" />Add Program</Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={filteredPrograms} actions={actions} exportable={true} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Course Catalog</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrograms.filter(p => p.status === 'Active').map(program => (
                  <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <Badge>{program.category}</Badge>
                      <Badge variant="outline">{program.level}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.duration}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{program.enrolled}</span>
                    </div>
                    <Button className="w-full mt-3" size="sm"><PlayCircle className="h-4 w-4 mr-2" />Start Learning</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Completion by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Technical', 'Management', 'Soft Skills', 'Finance', 'Compliance'].map(cat => {
                    const catPrograms = programs.filter(p => p.category === cat);
                    const avg = catPrograms.length > 0 ? Math.round(catPrograms.reduce((s, p) => s + p.completionRate, 0) / catPrograms.length) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm"><span>{cat}</span><span>{avg}%</span></div>
                        <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${avg}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Program Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredPrograms.slice(0, 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{p.title}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div className={`h-2 rounded-full ${p.completionRate >= 80 ? 'bg-green-500' : p.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p.completionRate}%` }} />
                        </div>
                        <span className="text-sm w-10 text-right">{p.completionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingProgram ? 'Edit Program' : 'Add Learning Program'}</DialogTitle></DialogHeader>
          <ProgramForm program={editingProgram} onSave={handleSaveProgram} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Learning Program Details</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Program ID</Label><div className="font-medium">{selectedProgram.programId}</div></div>
                <div><Label>Category</Label><Badge>{selectedProgram.category}</Badge></div>
                <div><Label>Provider</Label><div className="font-medium">{selectedProgram.provider}</div></div>
                <div><Label>Level</Label><Badge variant="outline">{selectedProgram.level}</Badge></div>
                <div><Label>Duration</Label><div className="font-medium">{selectedProgram.duration}</div></div>
                <div><Label>Format</Label><div className="font-medium">{selectedProgram.format}</div></div>
              </div>
              <div><Label>Description</Label><div className="text-sm">{selectedProgram.description}</div></div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Enrollment Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><Label>Enrolled</Label><div className="font-medium">{selectedProgram.enrolled}</div></div>
                  <div><Label>Completed</Label><div className="font-medium">{selectedProgram.completed}</div></div>
                  <div><Label>Completion Rate</Label><div className="font-medium">{selectedProgram.completionRate}%</div></div>
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

const ProgramForm: React.FC<{
  program: LearningProgram | null;
  onSave: (data: Partial<LearningProgram>) => void;
  onCancel: () => void;
}> = ({ program, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: program?.title || '',
    description: program?.description || '',
    category: program?.category || 'Technical',
    provider: program?.provider || 'Internal',
    duration: program?.duration || '8 hours',
    durationHours: program?.durationHours || 8,
    level: program?.level || 'Intermediate',
    format: program?.format || 'Online',
    status: program?.status || 'Active',
    startDate: program?.startDate || new Date().toISOString().split('T')[0],
    instructor: program?.instructor || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Title</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
      <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Soft Skills">Soft Skills</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Provider</Label><Input value={formData.provider} onChange={e => setFormData(p => ({ ...p, provider: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Duration</Label><Input value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} /></div>
        <div><Label>Hours</Label><Input type="number" value={formData.durationHours} onChange={e => setFormData(p => ({ ...p, durationHours: Number(e.target.value) }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Level</Label>
          <Select value={formData.level} onValueChange={v => setFormData(p => ({ ...p, level: v as 'Beginner' | 'Intermediate' | 'Advanced' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Format</Label>
          <Select value={formData.format} onValueChange={v => setFormData(p => ({ ...p, format: v as 'Online' | 'In-Person' | 'Hybrid' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="In-Person">In-Person</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Instructor</Label><Input value={formData.instructor} onChange={e => setFormData(p => ({ ...p, instructor: e.target.value }))} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{program ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </form>
  );
};

export default LearningManagement;
