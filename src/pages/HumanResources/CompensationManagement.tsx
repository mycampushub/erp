
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
import { ArrowLeft, Plus, DollarSign, TrendingUp, BarChart, Edit, Trash2, Eye } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface CompensationBand {
  id: string;
  bandId: string;
  level: string;
  department: string;
  jobFamily: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  employees: number;
  avgSalary: number;
  compaRatio: number;
  status: 'Active' | 'Review' | 'Inactive';
  effectiveDate: string;
}

const CompensationManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bands');
  const seedData = getSeedData();
  const [bands, setBands] = useState<CompensationBand[]>(() => seedData.compensationBands);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBand, setSelectedBand] = useState<CompensationBand | null>(null);
  const [editingBand, setEditingBand] = useState<CompensationBand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) speak('Welcome to Compensation Management. Design and manage compensation structures and salary bands.');
  }, [isEnabled, speak]);

  const saveBands = (data: CompensationBand[]) => {
    setBands(data);
  };

  const handleCreateBand = () => { setEditingBand(null); setIsDialogOpen(true); };
  const handleEditBand = (band: CompensationBand) => { setEditingBand(band); setIsDialogOpen(true); };
  const handleSaveBand = (data: Partial<CompensationBand>) => {
    if (editingBand) {
      const updated = bands.map(b => b.id === editingBand.id ? { ...b, ...data } : b);
      saveBands(updated);
    } else {
      const newBand: CompensationBand = { id: generateId('band'), employees: 0, avgSalary: 0, compaRatio: 0, status: 'Active', ...data } as CompensationBand;
      saveBands([newBand, ...bands]);
    }
    toast({ title: 'Band Saved' });
    setIsDialogOpen(false);
  };
  const handleDeleteBand = (id: string) => { saveBands(bands.filter(b => b.id !== id)); toast({ title: 'Band Deleted' }); };
  const handleViewBand = (band: CompensationBand) => { setSelectedBand(band); setIsViewDialogOpen(true); };

  const columns: EnhancedColumn[] = [
    { key: 'bandId', header: 'Band ID', width: '80px' },
    { key: 'level', header: 'Level', searchable: true },
    { key: 'department', header: 'Department', filterable: true },
    { key: 'jobFamily', header: 'Job Family' },
    { key: 'minSalary', header: 'Min', render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'midSalary', header: 'Mid', render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'maxSalary', header: 'Max', render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'compaRatio', header: 'Compa', render: (v: number) => <span className={v >= 0.95 && v <= 1.05 ? 'text-green-600' : 'text-yellow-600'}>{v.toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={v === 'Active' ? 'default' : 'outline'}>{v}</Badge> },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleViewBand, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEditBand, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: CompensationBand) => handleDeleteBand(row.id), variant: 'ghost' },
  ];

  const filteredBands = useMemo(() => {
    if (!searchTerm) return bands;
    return bands.filter(b => b.level.toLowerCase().includes(searchTerm.toLowerCase()) || b.department?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [bands, searchTerm]);

  const stats = useMemo(() => ({
    totalBands: bands.length,
    avgCompa: bands.length > 0 ? (bands.reduce((s, b) => s + b.compaRatio, 0) / bands.length).toFixed(2) : '0',
    totalEmployees: bands.reduce((s, b) => s + b.employees, 0),
    avgSalary: bands.length > 0 ? Math.round(bands.reduce((s, b) => s + b.avgSalary, 0) / bands.length) : 0
  }), [bands]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Compensation Management" description="Design and manage compensation structures and salary bands" voiceIntroduction="Welcome to Compensation Management." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-700">{stats.totalBands}</div><div className="text-sm text-blue-600">Salary Bands</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100"><CardContent className="p-4"><div className="text-2xl font-bold text-green-700">{stats.avgCompa}</div><div className="text-sm text-green-600">Avg Compa Ratio</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-700">{stats.totalEmployees}</div><div className="text-sm text-purple-600">Employees</div></CardContent></Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100"><CardContent className="p-4"><div className="text-2xl font-bold text-orange-700">${stats.avgSalary.toLocaleString()}</div><div className="text-sm text-orange-600">Avg Salary</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bands"><DollarSign className="h-4 w-4 mr-2" />Compensation Bands</TabsTrigger>
          <TabsTrigger value="planning"><TrendingUp className="h-4 w-4 mr-2" />Salary Planning</TabsTrigger>
          <TabsTrigger value="analysis"><BarChart className="h-4 w-4 mr-2" />Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="bands">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Compensation Bands ({filteredBands.length})</CardTitle>
              <div className="flex gap-2"><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" /><Button onClick={handleCreateBand}><Plus className="h-4 w-4 mr-2" />Create Band</Button></div>
            </CardHeader>
            <CardContent><EnhancedDataTable columns={columns} data={filteredBands} actions={actions} exportable={true} pageSize={10} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Merit Increase Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead><tr className="border-b"><th className="p-2 text-left">Performance / Potential</th><th className="p-2 text-center">Low</th><th className="p-2 text-center">Medium</th><th className="p-2 text-center">High</th></tr></thead>
                  <tbody>
                    {[['High', '4-5%', '5-7%', '7-10%'], ['Medium', '3-4%', '4-5%', '5-7%'], ['Low', '0-2%', '2-3%', '3-4%']].map((row, i) => (
                      <tr key={i} className="border-b"><td className="p-2 font-medium">{row[0]}</td><td className="p-2 text-center">{row[1]}</td><td className="p-2 text-center">{row[2]}</td><td className="p-2 text-center">{row[3]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Compa Ratio Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Below Range (&lt;0.90)</span><span className="font-medium">{bands.filter(b => b.compaRatio < 0.9).length} employees</span></div>
                  <div className="flex justify-between text-sm"><span>In Range (0.90-1.10)</span><span className="font-medium">{bands.filter(b => b.compaRatio >= 0.9 && b.compaRatio <= 1.1).length} employees</span></div>
                  <div className="flex justify-between text-sm"><span>Above Range (&gt;1.10)</span><span className="font-medium">{bands.filter(b => b.compaRatio > 1.1).length} employees</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Budget Utilization</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Annual Budget</span><span className="font-medium">$15,000,000</span></div>
                  <div className="flex justify-between text-sm"><span>YTD Spent</span><span className="font-medium">$8,500,000</span></div>
                  <div className="flex justify-between text-sm"><span>Remaining</span><span className="font-medium">$6,500,000</span></div>
                  <div className="h-3 bg-muted rounded-full mt-2"><div className="h-3 bg-blue-500 rounded-full" style={{ width: '57%' }} /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingBand ? 'Edit Band' : 'Create Compensation Band'}</DialogTitle></DialogHeader>
          <BandForm band={editingBand} onSave={handleSaveBand} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compensation Band Details</DialogTitle>
          </DialogHeader>
          {selectedBand && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Band ID</Label><div className="font-medium">{selectedBand.bandId}</div></div>
                <div><Label>Level</Label><div className="font-medium">{selectedBand.level}</div></div>
                <div><Label>Department</Label><div className="font-medium">{selectedBand.department}</div></div>
                <div><Label>Job Family</Label><div className="font-medium">{selectedBand.jobFamily}</div></div>
                <div><Label>Status</Label><Badge>{selectedBand.status}</Badge></div>
                <div><Label>Effective Date</Label><div className="font-medium">{selectedBand.effectiveDate}</div></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Salary Range</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><Label>Minimum</Label><div className="font-medium">${selectedBand.minSalary.toLocaleString()}</div></div>
                  <div><Label>Midpoint</Label><div className="font-medium">${selectedBand.midSalary.toLocaleString()}</div></div>
                  <div><Label>Maximum</Label><div className="font-medium">${selectedBand.maxSalary.toLocaleString()}</div></div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Current Position</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><Label>Employees</Label><div className="font-medium">{selectedBand.employees}</div></div>
                  <div><Label>Avg Salary</Label><div className="font-medium">${selectedBand.avgSalary.toLocaleString()}</div></div>
                  <div><Label>Compa Ratio</Label><div className="font-medium">{selectedBand.compaRatio.toFixed(2)}</div></div>
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

const BandForm: React.FC<{ band: CompensationBand | null; onSave: (data: Partial<CompensationBand>) => void; onCancel: () => void; }> = ({ band, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ level: band?.level || '', department: band?.department || '', jobFamily: band?.jobFamily || '', minSalary: band?.minSalary || 50000, midSalary: band?.midSalary || 65000, maxSalary: band?.maxSalary || 80000, status: band?.status || 'Active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><div><Label>Level</Label><Input value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} /></div><div><Label>Department</Label><Input value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} /></div></div>
      <div><Label>Job Family</Label><Input value={formData.jobFamily} onChange={e => setFormData(p => ({ ...p, jobFamily: e.target.value }))} /></div>
      <div className="grid grid-cols-3 gap-2"><div><Label>Min</Label><Input type="number" value={formData.minSalary} onChange={e => setFormData(p => ({ ...p, minSalary: Number(e.target.value) }))} /></div><div><Label>Mid</Label><Input type="number" value={formData.midSalary} onChange={e => setFormData(p => ({ ...p, midSalary: Number(e.target.value) }))} /></div><div><Label>Max</Label><Input type="number" value={formData.maxSalary} onChange={e => setFormData(p => ({ ...p, maxSalary: Number(e.target.value) }))} /></div></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">{band ? 'Update' : 'Create'}</Button></DialogFooter>
    </form>
  );
};

export default CompensationManagement;
