
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
import { ArrowLeft, Plus, UserPlus, Search, FileText, Users, Calendar, Eye, Edit, Trash2, Star, MessageSquare, CheckCircle, XCircle, Send } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface JobOpening {
  id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director';
  experienceRequired: number;
  applications: number;
  interviewed: number;
  offered: number;
  hired: number;
  status: 'Active' | 'Filled' | 'Closed' | 'On Hold' | 'Draft';
  deadline: string;
  salary: { min: number; max: number; currency: string };
}

interface Candidate {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  jobId: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  source: string;
  experience: number;
  location: string;
  appliedDate: string;
  skills: string[];
  rating: number;
}

const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');
  const seedData = getSeedData();
  const [jobs, setJobs] = useState<JobOpening[]>(() => seedData.jobOpenings);
  const [candidates, setCandidates] = useState<Candidate[]>(() => seedData.candidates);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Recruitment. Manage job postings, candidates, and hiring processes.');
  }, [isEnabled, speak]);

  const saveJobs = (data: JobOpening[]) => { setJobs(data); };
  const saveCandidates = (data: Candidate[]) => { setCandidates(data); };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800', 'Filled': 'bg-blue-100 text-blue-800', 'Closed': 'bg-gray-100 text-gray-800',
      'On Hold': 'bg-yellow-100 text-yellow-800', 'Draft': 'bg-purple-100 text-purple-800',
      'Applied': 'bg-blue-100 text-blue-800', 'Screening': 'bg-yellow-100 text-yellow-800', 'Interview': 'bg-orange-100 text-orange-800',
      'Offer': 'bg-green-100 text-green-800', 'Hired': 'bg-emerald-100 text-emerald-800', 'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateJob = () => { setEditingJob(null); setIsJobDialogOpen(true); };
  const handleEditJob = (job: JobOpening) => { setEditingJob(job); setIsJobDialogOpen(true); };
  const handleSaveJob = (data: Partial<JobOpening>) => {
    if (editingJob) {
      const updated = jobs.map(j => j.id === editingJob.id ? { ...j, ...data } : j);
      saveJobs(updated);
    } else {
      const newJob: JobOpening = { id: generateId('job'), applications: 0, interviewed: 0, offered: 0, hired: 0, status: 'Active', ...data } as JobOpening;
      saveJobs([newJob, ...jobs]);
    }
    toast({ title: 'Job Saved' });
    setIsJobDialogOpen(false);
  };
  const handleDeleteJob = (id: string) => { saveJobs(jobs.filter(j => j.id !== id)); toast({ title: 'Job Deleted' }); };

  const handleCreateCandidate = () => { setIsCandidateDialogOpen(true); };
  const handleSaveCandidate = (data: Partial<Candidate>) => {
    const newCandidate: Candidate = { id: generateId('cand'), status: 'Applied', appliedDate: new Date().toISOString().split('T')[0], rating: 3, ...data } as Candidate;
    saveCandidates([newCandidate, ...candidates]);
    toast({ title: 'Candidate Added' });
    setIsCandidateDialogOpen(false);
  };

  const handleUpdateCandidateStatus = (id: string, status: Candidate['status']) => {
    const updated = candidates.map(c => c.id === id ? { ...c, status } : c);
    saveCandidates(updated);
  };

  const jobColumns: EnhancedColumn[] = [
    { key: 'jobId', header: 'ID', width: '80px' },
    { key: 'title', header: 'Position', searchable: true },
    { key: 'department', header: 'Department', filterable: true },
    { key: 'location', header: 'Location' },
    { key: 'applications', header: 'Apps', sortable: true },
    { key: 'interviewed', header: 'Interview', sortable: true },
    { key: 'hired', header: 'Hired', sortable: true },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'deadline', header: 'Deadline' },
  ];

  const candidateColumns: EnhancedColumn[] = [
    { key: 'name', header: 'Candidate', searchable: true, render: (_, row: Candidate) => (
      <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">{row.name.split(' ').map(n => n[0]).join('')}</div><div><div className="font-medium">{row.name}</div><div className="text-xs text-muted-foreground">{row.position}</div></div></div>
    )},
    { key: 'experience', header: 'Exp', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'rating', header: 'Rating', sortable: true, render: (v: number) => <div className="flex items-center"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />{v.toFixed(1)}</div> },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'appliedDate', header: 'Applied' },
  ];

  const jobActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: JobOpening) => { setSelectedJob(row); setActiveTab('pipeline'); }, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditJob, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: JobOpening) => handleDeleteJob(row.id), variant: 'ghost' },
  ];

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    return jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.department?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [jobs, searchTerm]);

  const stats = useMemo(() => ({
    openPositions: jobs.filter(j => j.status === 'Active').length,
    totalApplications: jobs.reduce((s, j) => s + j.applications, 0),
    totalHired: jobs.reduce((s, j) => s + j.hired, 0),
    interviewRate: jobs.length > 0 ? Math.round((jobs.reduce((s, j) => s + j.interviewed, 0) / Math.max(1, jobs.reduce((s, j) => s + j.applications, 0))) * 100) : 0
  }), [jobs]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Recruitment" description="Manage job postings, candidates, and hiring processes" voiceIntroduction="Welcome to Recruitment." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100"><CardContent className="p-4"><div className="text-2xl font-bold text-green-700">{stats.openPositions}</div><div className="text-sm text-green-600">Open Positions</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-700">{stats.totalApplications}</div><div className="text-sm text-blue-600">Applications</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-700">{stats.interviewRate}%</div><div className="text-sm text-purple-600">Interview Rate</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100"><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-700">{stats.totalHired}</div><div className="text-sm text-emerald-600">Hired</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs"><FileText className="h-4 w-4 mr-2" />Jobs</TabsTrigger>
          <TabsTrigger value="candidates"><Users className="h-4 w-4 mr-2" />Candidates</TabsTrigger>
          <TabsTrigger value="pipeline"><Calendar className="h-4 w-4 mr-2" />Pipeline</TabsTrigger>
          <TabsTrigger value="analytics"><Search className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Job Openings ({filteredJobs.length})</CardTitle>
              <div className="flex gap-2"><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" /><Button onClick={handleCreateJob}><Plus className="h-4 w-4 mr-2" />Create Job</Button></div>
            </CardHeader>
            <CardContent><EnhancedDataTable columns={jobColumns} data={filteredJobs} actions={jobActions} exportable={true} pageSize={10} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Candidates ({candidates.length})</CardTitle>
              <Button onClick={handleCreateCandidate}><Plus className="h-4 w-4 mr-2" />Add Candidate</Button>
            </CardHeader>
            <CardContent><EnhancedDataTable columns={candidateColumns} data={candidates} exportable={true} pageSize={10} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Interview Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Applied', 'Screening', 'Interview', 'Offer'].map(stage => (
                  <div key={stage} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-center mb-4">{stage}</h3>
                    <div className="space-y-2">
                      {candidates.filter(c => c.status === stage).map(cand => (
                        <div key={cand.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="font-medium">{cand.name}</div>
                          <div className="text-xs text-muted-foreground">{cand.position}</div>
                          {stage !== 'Offer' && <div className="flex gap-1 mt-2">
                            {stage === 'Applied' && <Button size="sm" variant="outline" onClick={() => handleUpdateCandidateStatus(cand.id, 'Screening')}>Screen</Button>}
                            {stage === 'Screening' && <Button size="sm" variant="outline" onClick={() => handleUpdateCandidateStatus(cand.id, 'Interview')}>Interview</Button>}
                            {stage === 'Interview' && <Button size="sm" variant="outline" onClick={() => handleUpdateCandidateStatus(cand.id, 'Offer')}>Offer</Button>}
                          </div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recruitment Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Total Applications</span><span className="font-medium">{stats.totalApplications}</span></div>
                  <div className="flex justify-between"><span>Interview Rate</span><span className="font-medium">{stats.interviewRate}%</span></div>
                  <div className="flex justify-between"><span>Offer Acceptance</span><span className="font-medium">85%</span></div>
                  <div className="flex justify-between"><span>Avg Time to Hire</span><span className="font-medium">28 days</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Source Effectiveness</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>LinkedIn</span><span className="font-medium">35%</span></div>
                  <div className="flex justify-between"><span>Company Website</span><span className="font-medium">28%</span></div>
                  <div className="flex justify-between"><span>Referrals</span><span className="font-medium">22%</span></div>
                  <div className="flex justify-between"><span>Job Boards</span><span className="font-medium">15%</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingJob ? 'Edit Job' : 'Create Job Opening'}</DialogTitle></DialogHeader><JobForm job={editingJob} onSave={handleSaveJob} onCancel={() => setIsJobDialogOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader><CandidateForm onSave={handleSaveCandidate} onCancel={() => setIsCandidateDialogOpen(false)} jobs={jobs} /></DialogContent>
      </Dialog>
    </div>
  );
};

const JobForm: React.FC<{ job: JobOpening | null; onSave: (data: Partial<JobOpening>) => void; onCancel: () => void; }> = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ title: job?.title || '', department: job?.department || '', location: job?.location || '', type: job?.type || 'Full-time', level: job?.level || 'Mid', experienceRequired: job?.experienceRequired || 1, status: job?.status || 'Draft', deadline: job?.deadline || '', salaryMin: job?.salary?.min || 50000, salaryMax: job?.salary?.max || 80000 });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...formData, salary: { min: formData.salaryMin, max: formData.salaryMax, currency: 'USD' } }); }} className="space-y-4">
      <div><Label>Title</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Department</Label><Input value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} /></div><div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Type</Label><Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as JobOpening['type'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem><SelectItem value="Remote">Remote</SelectItem></SelectContent></Select></div><div><Label>Experience (yrs)</Label><Input type="number" value={formData.experienceRequired} onChange={e => setFormData(p => ({ ...p, experienceRequired: Number(e.target.value) }))} /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Salary Min</Label><Input type="number" value={formData.salaryMin} onChange={e => setFormData(p => ({ ...p, salaryMin: Number(e.target.value) }))} /></div><div><Label>Salary Max</Label><Input type="number" value={formData.salaryMax} onChange={e => setFormData(p => ({ ...p, salaryMax: Number(e.target.value) }))} /></div></div>
      <div><Label>Deadline</Label><Input type="date" value={formData.deadline} onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">{job ? 'Update' : 'Create'}</Button></DialogFooter>
    </form>
  );
};

const CandidateForm: React.FC<{ onSave: (data: Partial<Candidate>) => void; onCancel: () => void; jobs: JobOpening[] }> = ({ onSave, onCancel, jobs }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: jobs[0]?.title || '', jobId: jobs[0]?.jobId || '', experience: 0, location: '', source: 'LinkedIn' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div><div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div><div><Label>Position</Label><Select value={formData.jobId} onValueChange={v => { const job = jobs.find(j => j.jobId === v); setFormData(p => ({ ...p, jobId: v, position: job?.title || '' })); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{jobs.map(j => <SelectItem key={j.jobId} value={j.jobId}>{j.title}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>Experience (yrs)</Label><Input type="number" value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: Number(e.target.value) }))} /></div><div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} /></div></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Add Candidate</Button></DialogFooter>
    </form>
  );
};

export default Recruitment;
