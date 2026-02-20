
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
import { ArrowLeft, Plus, Star, TrendingUp, Target, Users, Grid3X3, BookOpen, Edit, Trash2, Eye } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface TalentProfile {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  performanceRating: number;
  potentialRating: 'High' | 'Medium' | 'Low';
  careerLevel: string;
  skillGaps: number;
  skills: string[];
  missingSkills: string[];
  lastReview: string;
  nextReview: string;
  status: 'Star Performer' | 'High Potential' | 'Core Performer' | 'Development' | 'Underperformer';
  readinessLevel: 'Ready Now' | 'Ready 1 Year' | 'Ready 2+ Years' | 'Not Ready';
}

interface DevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  focusAreas: string[];
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
}

const TalentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('talent-pool');
  const seedData = getSeedData();
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>(() => seedData.talentProfiles);
  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>(() => seedData.developmentPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<TalentProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Talent Management. Develop employee skills, manage career paths, and identify high performers.');
  }, [isEnabled, speak]);

  const saveTalentProfiles = (data: TalentProfile[]) => {
    setTalentProfiles(data);
  };

  const saveDevelopmentPlans = (data: DevelopmentPlan[]) => {
    setDevelopmentPlans(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Star Performer': 'bg-purple-100 text-purple-800',
      'High Potential': 'bg-blue-100 text-blue-800',
      'Core Performer': 'bg-green-100 text-green-800',
      'Development': 'bg-orange-100 text-orange-800',
      'Underperformer': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPotentialColor = (rating: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return colors[rating] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setIsDialogOpen(true);
  };

  const handleEditProfile = (profile: TalentProfile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleSaveProfile = (data: Partial<TalentProfile>) => {
    if (editingProfile) {
      const updated = talentProfiles.map(p => p.id === editingProfile.id ? { ...p, ...data } : p);
      saveTalentProfiles(updated);
      toast({ title: 'Profile Updated' });
    } else {
      const newProfile: TalentProfile = {
        id: generateId('talent'),
        employeeId: data.employeeId || '',
        employeeName: data.employeeName || '',
        position: data.position || '',
        department: data.department || '',
        performanceRating: data.performanceRating || 3,
        potentialRating: data.potentialRating || 'Medium',
        careerLevel: data.careerLevel || 'Mid',
        skillGaps: data.skillGaps || 0,
        skills: data.skills || [],
        missingSkills: data.missingSkills || [],
        lastReview: new Date().toISOString().split('T')[0],
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: data.status || 'Core Performer',
        readinessLevel: data.readinessLevel || 'Not Ready'
      };
      saveTalentProfiles([newProfile, ...talentProfiles]);
      toast({ title: 'Profile Created' });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = talentProfiles.filter(p => p.id !== id);
    saveTalentProfiles(updated);
    toast({ title: 'Profile Deleted' });
  };
  const handleViewProfile = (profile: TalentProfile) => { setSelectedProfile(profile); setIsViewDialogOpen(true); };
  const handleCreatePlan = (profile: TalentProfile) => {
    const newPlan: DevelopmentPlan = {
      id: generateId('dev'),
      employeeId: profile.employeeId,
      employeeName: profile.employeeName,
      title: 'Individual Development Plan',
      focusAreas: profile.missingSkills || [],
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Not Started',
      progress: 0
    };
    saveDevelopmentPlans([...developmentPlans, newPlan]);
    toast({ title: 'Development Plan Created', description: `Plan created for ${profile.employeeName}` });
  };

  const columns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'position', header: 'Position', searchable: true },
    { key: 'department', header: 'Department', filterable: true },
    { 
      key: 'performanceRating', 
      header: 'Performance',
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span>{v.toFixed(1)}</span>
        </div>
      )
    },
    { 
      key: 'potentialRating', 
      header: 'Potential',
      render: (v: string) => <Badge className={getPotentialColor(v)}>{v}</Badge>
    },
    { key: 'careerLevel', header: 'Level' },
    { key: 'skillGaps', header: 'Skill Gaps', render: (v: number) => <Badge variant="outline">{v} skills</Badge> },
    { 
      key: 'status', 
      header: 'Status',
      render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge>
    },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleViewProfile, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditProfile, variant: 'ghost' },
    { label: 'Create Plan', icon: <BookOpen className="h-4 w-4" />, onClick: handleCreatePlan, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: TalentProfile) => handleDeleteProfile(row.id), variant: 'ghost' },
  ];

  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return talentProfiles;
    const term = searchTerm.toLowerCase();
    return talentProfiles.filter(p => 
      p.employeeName.toLowerCase().includes(term) ||
      p.department.toLowerCase().includes(term) ||
      p.position.toLowerCase().includes(term)
    );
  }, [talentProfiles, searchTerm]);

  const stats = useMemo(() => ({
    highPerformers: talentProfiles.filter(p => p.performanceRating >= 4.5).length,
    highPotential: talentProfiles.filter(p => p.potentialRating === 'High').length,
    inDevelopment: talentProfiles.filter(p => p.status === 'Development').length,
    avgRating: talentProfiles.length > 0 ? (talentProfiles.reduce((s, p) => s + p.performanceRating, 0) / talentProfiles.length).toFixed(1) : '0'
  }), [talentProfiles]);

  const nineBoxData = useMemo(() => {
    const box: Record<string, TalentProfile[]> = {
      'high-high': [],
      'high-med': [],
      'high-low': [],
      'med-high': [],
      'med-med': [],
      'med-low': [],
      'low-high': [],
      'low-med': [],
      'low-low': []
    };
    talentProfiles.forEach(p => {
      const perf = p.performanceRating >= 4 ? 'high' : p.performanceRating >= 3 ? 'med' : 'low';
      const pot = p.potentialRating === 'High' ? 'high' : p.potentialRating === 'Medium' ? 'med' : 'low';
      box[`${perf}-${pot}`].push(p);
    });
    return box;
  }, [talentProfiles]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Talent Management" description="Develop employee skills, manage career paths, and identify high performers" voiceIntroduction="Welcome to Talent Management." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.highPerformers}</div>
            <div className="text-sm text-green-600">High Performers</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.highPotential}</div>
            <div className="text-sm text-purple-600">High Potential</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-700">{stats.inDevelopment}</div>
            <div className="text-sm text-orange-600">In Development</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.avgRating}</div>
            <div className="text-sm text-blue-600">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="talent-pool" className="flex items-center gap-2"><Users className="h-4 w-4" />Talent Pool</TabsTrigger>
          <TabsTrigger value="9box" className="flex items-center gap-2"><Grid3X3 className="h-4 w-4" />9-Box Grid</TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Development Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="talent-pool">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Talent Profiles ({filteredProfiles.length})</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
                <Button onClick={handleCreateProfile}><Plus className="h-4 w-4 mr-2" />Add Profile</Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={filteredProfiles} actions={actions} exportable={true} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="9box">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Grid3X3 className="h-5 w-5" />9-Box Performance-Potential Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[['high', 'Performance'], ['med', ''], ['low', '']].map(([rowPerf], rowIdx) => (
                  <div key={rowPerf as string} className="space-y-4">
                    {rowIdx === 0 && <div className="text-center font-semibold text-green-700">High Potential</div>}
                    {rowIdx === 1 && <div className="text-center font-semibold text-yellow-700">Medium Potential</div>}
                    {rowIdx === 2 && <div className="text-center font-semibold text-red-700">Low Potential</div>}
                    {['high', 'med', 'low'].map(colPerf => {
                      const key = `${rowPerf as string}-${colPerf}`;
                      const profiles = nineBoxData[key] || [];
                      return (
                        <div key={key} className={`border rounded-lg p-3 min-h-[120px] ${rowPerf === 'high' && colPerf === 'high' ? 'bg-green-50' : rowPerf === 'low' && colPerf === 'low' ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <div className="text-xs font-medium text-center mb-2">{profiles.length} Employees</div>
                          <div className="space-y-1">
                            {profiles.slice(0, 3).map(p => (
                              <div key={p.id} className="text-xs truncate bg-white rounded px-2 py-1">{p.employeeName}</div>
                            ))}
                            {profiles.length > 3 && <div className="text-xs text-center text-muted-foreground">+{profiles.length - 3} more</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-50 border rounded"></div>High Performance</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-50 border rounded"></div>Medium Performance</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-50 border rounded"></div>Low Performance</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Development Plans ({developmentPlans.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developmentPlans.map(plan => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{plan.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{plan.title}</div>
                      </div>
                      <Badge>{plan.status}</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${plan.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingProfile ? 'Edit Talent Profile' : 'Add Talent Profile'}</DialogTitle></DialogHeader>
          <TalentForm profile={editingProfile} onSave={handleSaveProfile} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Talent Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Employee ID</Label><div className="font-medium">{selectedProfile.employeeId}</div></div>
                <div><Label>Employee Name</Label><div className="font-medium">{selectedProfile.employeeName}</div></div>
                <div><Label>Position</Label><div className="font-medium">{selectedProfile.position}</div></div>
                <div><Label>Department</Label><div className="font-medium">{selectedProfile.department}</div></div>
                <div><Label>Career Level</Label><div className="font-medium">{selectedProfile.careerLevel}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedProfile.status)}>{selectedProfile.status}</Badge></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Performance & Potential</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label>Performance Rating</Label><div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /><span>{selectedProfile.performanceRating.toFixed(1)}</span></div></div>
                  <div><Label>Potential Rating</Label><Badge className={getPotentialColor(selectedProfile.potentialRating)}>{selectedProfile.potentialRating}</Badge></div>
                  <div><Label>Readiness Level</Label><div className="font-medium">{selectedProfile.readinessLevel}</div></div>
                  <div><Label>Skill Gaps</Label><div className="font-medium">{selectedProfile.skillGaps} skills</div></div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.skills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
                {selectedProfile.missingSkills && selectedProfile.missingSkills.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-2 mt-4">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.missingSkills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </div>
                  </>
                )}
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Review Timeline</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label>Last Review</Label><div className="font-medium">{selectedProfile.lastReview}</div></div>
                  <div><Label>Next Review</Label><div className="font-medium">{selectedProfile.nextReview}</div></div>
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

const TalentForm: React.FC<{
  profile: TalentProfile | null;
  onSave: (data: Partial<TalentProfile>) => void;
  onCancel: () => void;
}> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: profile?.employeeId || '',
    employeeName: profile?.employeeName || '',
    position: profile?.position || '',
    department: profile?.department || '',
    performanceRating: profile?.performanceRating || 3,
    potentialRating: profile?.potentialRating || 'Medium',
    careerLevel: profile?.careerLevel || 'Mid',
    skillGaps: profile?.skillGaps || 0,
    status: profile?.status || 'Core Performer',
    readinessLevel: profile?.readinessLevel || 'Not Ready'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Employee ID</Label><Input value={formData.employeeId} onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))} /></div>
        <div><Label>Employee Name</Label><Input value={formData.employeeName} onChange={e => setFormData(p => ({ ...p, employeeName: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Position</Label><Input value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value }))} /></div>
        <div><Label>Department</Label><Input value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Performance Rating</Label><Input type="number" step="0.1" min="1" max="5" value={formData.performanceRating} onChange={e => setFormData(p => ({ ...p, performanceRating: Number(e.target.value) }))} /></div>
        <div>
          <Label>Potential Rating</Label>
          <Select value={formData.potentialRating} onValueChange={v => setFormData(p => ({ ...p, potentialRating: v as 'High' | 'Medium' | 'Low' }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Career Level</Label><Input value={formData.careerLevel} onChange={e => setFormData(p => ({ ...p, careerLevel: e.target.value }))} /></div>
        <div><Label>Skill Gaps</Label><Input type="number" value={formData.skillGaps} onChange={e => setFormData(p => ({ ...p, skillGaps: Number(e.target.value) }))} /></div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{profile ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </form>
  );
};

export default TalentManagement;
