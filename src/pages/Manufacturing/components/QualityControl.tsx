
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import DataTable from '../../../components/data/DataTable';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../../components/data/EnhancedDataTable';
import { useToast } from '../../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../../lib/localCrud';
import { ClipboardCheck, AlertTriangle, TrendingUp, FileText, Plus, Edit, Eye, Trash2, Download, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface QualityInspection {
  id: string;
  lotNumber: string;
  material: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  inspector: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  criticalChecks: number;
  passedChecks: number;
  failedChecks: number;
  inspectionType: 'Incoming' | 'In-Process' | 'Final' | 'Outgoing';
  workCenter: string;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface QualityIssue {
  id: string;
  issueId: string;
  material: string;
  materialDescription: string;
  defectType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  quantity: number;
  unit: string;
  reportDate: string;
  resolvedDate: string;
  status: 'Open' | 'In Review' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  rootCause: string;
  correctiveAction: string;
  costImpact: number;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface QualityCertificate {
  id: string;
  certificateNumber: string;
  certificateType: string;
  standard: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Pending Renewal';
  issuedBy: string;
  lastAuditDate: string;
  nextAuditDate: string;
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_INSPECTIONS = 'quality_inspections';
const STORAGE_KEY_ISSUES = 'quality_issues';
const STORAGE_KEY_CERTIFICATES = 'quality_certificates';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const QualityControl: React.FC = () => {
  const { toast } = useToast();
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [certificates, setCertificates] = useState<QualityCertificate[]>([]);
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<QualityInspection | null>(null);
  const [editingIssue, setEditingIssue] = useState<QualityIssue | null>(null);
  const [viewingItem, setViewingItem] = useState<QualityInspection | QualityIssue | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [inspectionForm, setInspectionForm] = useState<Partial<QualityInspection>>({
    lotNumber: '',
    material: '',
    materialDescription: '',
    quantity: 0,
    unit: 'pcs',
    inspector: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    priority: 'Medium',
    criticalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    inspectionType: 'Incoming',
    workCenter: '',
    notes: '',
  });

  const [issueForm, setIssueForm] = useState<Partial<QualityIssue>>({
    issueId: '',
    material: '',
    materialDescription: '',
    defectType: '',
    severity: 'Medium',
    quantity: 0,
    unit: 'pcs',
    reportDate: '',
    resolvedDate: '',
    status: 'Open',
    assignedTo: '',
    rootCause: '',
    correctiveAction: '',
    costImpact: 0,
    notes: '',
  });

  const loadData = () => {
    const storedInspections = listEntities<QualityInspection>(STORAGE_KEY_INSPECTIONS);
    if (storedInspections.length === 0) {
      const materials = [
        { code: 'MAT-001', name: 'Steel Alloy Sheet 4mm' },
        { code: 'MAT-002', name: 'Aluminum Extrusion Profile' },
        { code: 'MAT-003', name: 'Copper Wire 2.5mm' },
        { code: 'MAT-004', name: 'Plastic Injection Mold Component' },
        { code: 'MAT-005', name: 'Electronic Control Unit PCB' },
        { code: 'MAT-006', name: 'Rubber Gasket Set' },
        { code: 'MAT-007', name: 'Stainless Steel Fastener Kit' },
        { code: 'MAT-008', name: 'Ceramic Insulator Ring' },
        { code: 'MAT-009', name: 'Carbon Fiber Sheet 2mm' },
        { code: 'MAT-010', name: 'Precision Bearing Assembly' },
      ];
      const inspectors = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson', 'Lisa Anderson', 'David Martinez', 'Jennifer Brown'];
      const workCenters = ['QC-Lab-01', 'QC-Lab-02', 'Assembly-Line-01', 'Assembly-Line-02', 'Packaging-01'];
      const statuses: QualityInspection['status'][] = ['Pending', 'In Progress', 'Completed', 'Failed', 'On Hold'];
      const priorities: QualityInspection['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
      const types: QualityInspection['inspectionType'][] = ['Incoming', 'In-Process', 'Final', 'Outgoing'];

      const sample: QualityInspection[] = Array.from({ length: 30 }, (_, i) => {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const criticalChecks = Math.floor(Math.random() * 8) + 4;
        const passedChecks = Math.floor(Math.random() * (criticalChecks + 1));
        const failedChecks = criticalChecks - passedChecks;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const startDate = new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);

        return {
          id: generateId('QL'),
          lotNumber: `QL-2025-${String(i + 1).padStart(3, '0')}`,
          material: material.code,
          materialDescription: material.name,
          quantity: Math.floor(Math.random() * 500) + 100,
          unit: 'pcs',
          inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          criticalChecks,
          passedChecks,
          failedChecks,
          inspectionType: types[Math.floor(Math.random() * types.length)],
          workCenter: workCenters[Math.floor(Math.random() * workCenters.length)],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_INSPECTIONS, o as any));
    }
    setInspections(listEntities<QualityInspection>(STORAGE_KEY_INSPECTIONS));

    const storedIssues = listEntities<QualityIssue>(STORAGE_KEY_ISSUES);
    if (storedIssues.length === 0) {
      const materials = [
        { code: 'MAT-001', name: 'Steel Alloy Sheet 4mm' },
        { code: 'MAT-002', name: 'Aluminum Extrusion Profile' },
        { code: 'MAT-003', name: 'Copper Wire 2.5mm' },
        { code: 'MAT-004', name: 'Plastic Injection Mold Component' },
        { code: 'MAT-005', name: 'Electronic Control Unit PCB' },
        { code: 'MAT-006', name: 'Rubber Gasket Set' },
        { code: 'MAT-007', name: 'Stainless Steel Fastener Kit' },
        { code: 'MAT-008', name: 'Ceramic Insulator Ring' },
        { code: 'MAT-009', name: 'Carbon Fiber Sheet 2mm' },
        { code: 'MAT-010', name: 'Precision Bearing Assembly' },
      ];
      const defectTypes = ['Dimensional', 'Surface Finish', 'Material Composition', 'Assembly', 'Functional', 'Packaging', 'Contamination', 'Color Match'];
      const assignees = ['Engineering Team', 'Quality Team', 'Production Team', 'Supplier Quality', 'R&D Department'];
      const rootCauses = ['Equipment Malfunction', 'Material Defect', 'Human Error', 'Process Variation', 'Environmental Condition', 'Supplier Issue', 'Design Flaw', 'Training Gap'];
      const statuses: QualityIssue['status'][] = ['Open', 'In Review', 'In Progress', 'Resolved', 'Closed'];
      const severities: QualityIssue['severity'][] = ['Low', 'Medium', 'High', 'Critical'];

      const sample: QualityIssue[] = Array.from({ length: 30 }, (_, i) => {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const reportDate = new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
        const resolvedDate = status === 'Resolved' || status === 'Closed' 
          ? new Date(reportDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : '';

        return {
          id: generateId('QI'),
          issueId: `QI-2025-${String(i + 1).padStart(3, '0')}`,
          material: material.code,
          materialDescription: material.name,
          defectType: defectTypes[Math.floor(Math.random() * defectTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          quantity: Math.floor(Math.random() * 50) + 1,
          unit: 'pcs',
          reportDate: reportDate.toISOString().split('T')[0],
          resolvedDate,
          status,
          assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
          rootCause: rootCauses[Math.floor(Math.random() * rootCauses.length)],
          correctiveAction: `Action taken to address defect`,
          costImpact: Math.floor(Math.random() * 5000) + 100,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_ISSUES, o as any));
    }
    setIssues(listEntities<QualityIssue>(STORAGE_KEY_ISSUES));

    const storedCerts = listEntities<QualityCertificate>(STORAGE_KEY_CERTIFICATES);
    if (storedCerts.length === 0) {
      const certTypes = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'IATF 16949', 'AS9100', 'CE Marking', 'UL Listing', 'RoHS Compliance'];
      const issuers = ['SGS', 'BV', 'TUV', 'DNV', 'Intertek', 'BSI', 'UL'];
      const descriptions = [
        'Quality Management System',
        'Environmental Management System',
        'Occupational Health and Safety',
        'Automotive Quality Management',
        'Aerospace Quality Management',
        'Product Safety Certification',
        'Product Testing Certification',
        'Hazardous Substances Compliance'
      ];

      const sample: QualityCertificate[] = Array.from({ length: 30 }, (_, i) => {
        const certType = certTypes[Math.floor(Math.random() * certTypes.length)];
        const issueDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 3);
        const lastAudit = new Date(issueDate);
        lastAudit.setFullYear(lastAudit.getFullYear() + 2);
        const nextAudit = new Date(lastAudit);
        nextAudit.setFullYear(nextAudit.getFullYear() + 1);

        return {
          id: generateId('CERT'),
          certificateNumber: `CERT-${String(i + 1).padStart(5, '0')}`,
          certificateType: certType,
          standard: certType,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          issueDate: issueDate.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0],
          status: expiryDate > new Date() ? 'Active' : 'Expired',
          issuedBy: issuers[Math.floor(Math.random() * issuers.length)],
          lastAuditDate: lastAudit.toISOString().split('T')[0],
          nextAuditDate: nextAudit.toISOString().split('T')[0],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_CERTIFICATES, o as any));
    }
    setCertificates(listEntities<QualityCertificate>(STORAGE_KEY_CERTIFICATES));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveInspection = () => {
    const now = new Date().toISOString();
    const newInspection: QualityInspection = {
      id: editingInspection?.id || generateId('QL'),
      lotNumber: inspectionForm.lotNumber || `QL-2025-${String(Date.now()).slice(-3)}`,
      material: inspectionForm.material || '',
      materialDescription: inspectionForm.materialDescription || '',
      quantity: inspectionForm.quantity || 0,
      unit: inspectionForm.unit || 'pcs',
      inspector: inspectionForm.inspector || '',
      startDate: inspectionForm.startDate || now.split('T')[0],
      endDate: inspectionForm.endDate || now.split('T')[0],
      status: inspectionForm.status || 'Pending',
      priority: inspectionForm.priority || 'Medium',
      criticalChecks: inspectionForm.criticalChecks || 0,
      passedChecks: inspectionForm.passedChecks || 0,
      failedChecks: inspectionForm.failedChecks || 0,
      inspectionType: inspectionForm.inspectionType || 'Incoming',
      workCenter: inspectionForm.workCenter || '',
      notes: inspectionForm.notes,
      createdDate: editingInspection?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_INSPECTIONS, newInspection as any);
    setInspections(listEntities<QualityInspection>(STORAGE_KEY_INSPECTIONS));
    setInspectionDialogOpen(false);
    setEditingInspection(null);
    setInspectionForm({
      lotNumber: '', material: '', materialDescription: '', quantity: 0, unit: 'pcs',
      inspector: '', startDate: '', endDate: '', status: 'Pending', priority: 'Medium',
      criticalChecks: 0, passedChecks: 0, failedChecks: 0, inspectionType: 'Incoming',
      workCenter: '', notes: '',
    });
    toast({ title: 'Success', description: `Inspection ${editingInspection ? 'updated' : 'created'} successfully` });
  };

  const handleSaveIssue = () => {
    const now = new Date().toISOString();
    const newIssue: QualityIssue = {
      id: editingIssue?.id || generateId('QI'),
      issueId: editingIssue?.issueId || `QI-2025-${String(Date.now()).slice(-3)}`,
      material: issueForm.material || '',
      materialDescription: issueForm.materialDescription || '',
      defectType: issueForm.defectType || '',
      severity: issueForm.severity || 'Medium',
      quantity: issueForm.quantity || 0,
      unit: issueForm.unit || 'pcs',
      reportDate: issueForm.reportDate || now.split('T')[0],
      resolvedDate: issueForm.resolvedDate || '',
      status: issueForm.status || 'Open',
      assignedTo: issueForm.assignedTo || '',
      rootCause: issueForm.rootCause || '',
      correctiveAction: issueForm.correctiveAction || '',
      costImpact: issueForm.costImpact || 0,
      notes: issueForm.notes,
      createdDate: editingIssue?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_ISSUES, newIssue as any);
    setIssues(listEntities<QualityIssue>(STORAGE_KEY_ISSUES));
    setIssueDialogOpen(false);
    setEditingIssue(null);
    setIssueForm({
      issueId: '', material: '', materialDescription: '', defectType: '', severity: 'Medium',
      quantity: 0, unit: 'pcs', reportDate: '', resolvedDate: '', status: 'Open', assignedTo: '',
      rootCause: '', correctiveAction: '', costImpact: 0, notes: '',
    });
    toast({ title: 'Success', description: `Issue ${editingIssue ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteInspection = (id: string) => {
    removeEntity(STORAGE_KEY_INSPECTIONS, id);
    setInspections(listEntities<QualityInspection>(STORAGE_KEY_INSPECTIONS));
    toast({ title: 'Deleted', description: 'Inspection deleted successfully' });
  };

  const handleDeleteIssue = (id: string) => {
    removeEntity(STORAGE_KEY_ISSUES, id);
    setIssues(listEntities<QualityIssue>(STORAGE_KEY_ISSUES));
    toast({ title: 'Deleted', description: 'Issue deleted successfully' });
  };

  const openEditInspection = (inspection: QualityInspection) => {
    setEditingInspection(inspection);
    setInspectionForm(inspection);
    setInspectionDialogOpen(true);
  };

  const openEditIssue = (issue: QualityIssue) => {
    setEditingIssue(issue);
    setIssueForm(issue);
    setIssueDialogOpen(true);
  };

  const openView = (item: QualityInspection | QualityIssue) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const inspectionColumns: EnhancedColumn<QualityInspection>[] = [
    { key: 'lotNumber', header: 'Lot Number', sortable: true },
    { key: 'material', header: 'Material', sortable: true },
    { key: 'materialDescription', header: 'Description', sortable: true },
    { key: 'quantity', header: 'Qty', sortable: true },
    { key: 'inspector', header: 'Inspector', sortable: true },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Pending': 'bg-blue-100 text-blue-800',
          'In Progress': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-green-100 text-green-800',
          'Failed': 'bg-red-100 text-red-800',
          'On Hold': 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
    { 
      key: 'priority', 
      header: 'Priority',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Low': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'High': 'bg-orange-100 text-orange-800',
          'Critical': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (_, row) => (
        <div className="flex items-center w-24">
          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(row.passedChecks / row.criticalChecks) * 100}%` }}></div>
          </div>
          <span className="text-xs">{row.passedChecks}/{row.criticalChecks}</span>
        </div>
      )
    },
  ];

  const issueColumns: EnhancedColumn<QualityIssue>[] = [
    { key: 'issueId', header: 'Issue ID', sortable: true },
    { key: 'material', header: 'Material', sortable: true },
    { key: 'materialDescription', header: 'Description', sortable: true },
    { key: 'defectType', header: 'Defect Type', sortable: true },
    { 
      key: 'severity', 
      header: 'Severity',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Low': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'High': 'bg-orange-100 text-orange-800',
          'Critical': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
    { key: 'quantity', header: 'Qty', sortable: true },
    { key: 'reportDate', header: 'Report Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Open': 'bg-red-100 text-red-800',
          'In Review': 'bg-yellow-100 text-yellow-800',
          'In Progress': 'bg-blue-100 text-blue-800',
          'Resolved': 'bg-green-100 text-green-800',
          'Closed': 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
    { key: 'assignedTo', header: 'Assigned To', sortable: true },
  ];

  const certificateColumns: EnhancedColumn<QualityCertificate>[] = [
    { key: 'certificateNumber', header: 'Certificate #', sortable: true },
    { key: 'certificateType', header: 'Type', sortable: true },
    { key: 'description', header: 'Description', sortable: true },
    { key: 'issuedBy', header: 'Issued By', sortable: true },
    { key: 'issueDate', header: 'Issue Date', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Active': 'bg-green-100 text-green-800',
          'Expired': 'bg-red-100 text-red-800',
          'Pending Renewal': 'bg-yellow-100 text-yellow-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const inspectionActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditInspection(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteInspection(row.id), variant: 'ghost' },
  ];

  const issueActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditIssue(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteIssue(row.id), variant: 'ghost' },
  ];

  const activeInspections = inspections.filter(i => i.status === 'In Progress' || i.status === 'Pending').length;
  const completedInspections = inspections.filter(i => i.status === 'Completed').length;
  const failedInspections = inspections.filter(i => i.status === 'Failed').length;
  const qualityRate = inspections.length > 0 ? ((completedInspections / inspections.length) * 100).toFixed(1) : '0';
  const openIssues = issues.filter(i => i.status === 'Open' || i.status === 'In Review').length;
  const defectRate = inspections.length > 0 ? ((failedInspections / inspections.length) * 100).toFixed(1) : '0';

  const statusData = [
    { name: 'Pending', value: inspections.filter(i => i.status === 'Pending').length },
    { name: 'In Progress', value: inspections.filter(i => i.status === 'In Progress').length },
    { name: 'Completed', value: inspections.filter(i => i.status === 'Completed').length },
    { name: 'Failed', value: inspections.filter(i => i.status === 'Failed').length },
    { name: 'On Hold', value: inspections.filter(i => i.status === 'On Hold').length },
  ];

  const defectTypeData = [
    { name: 'Dimensional', value: issues.filter(i => i.defectType === 'Dimensional').length },
    { name: 'Surface Finish', value: issues.filter(i => i.defectType === 'Surface Finish').length },
    { name: 'Material', value: issues.filter(i => i.defectType === 'Material Composition').length },
    { name: 'Assembly', value: issues.filter(i => i.defectType === 'Assembly').length },
    { name: 'Functional', value: issues.filter(i => i.defectType === 'Functional').length },
    { name: 'Other', value: issues.filter(i => !['Dimensional', 'Surface Finish', 'Material Composition', 'Assembly', 'Functional'].includes(i.defectType)).length },
  ];

  const trendData = [
    { month: 'Jan', rate: 94 }, { month: 'Feb', rate: 95 }, { month: 'Mar', rate: 93 },
    { month: 'Apr', rate: 96 }, { month: 'May', rate: 95 }, { month: 'Jun', rate: 97 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quality Control Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button size="sm" onClick={() => { setEditingInspection(null); setInspectionForm({ lotNumber: '', material: '', materialDescription: '', quantity: 0, unit: 'pcs', inspector: '', startDate: '', endDate: '', status: 'Pending', priority: 'Medium', criticalChecks: 0, passedChecks: 0, failedChecks: 0, inspectionType: 'Incoming', workCenter: '', notes: '' }); setInspectionDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Inspection</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Active Inspections</div>
              <div className="text-2xl font-bold">{activeInspections}</div>
            </div>
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Quality Rate</div>
              <div className="text-2xl font-bold">{qualityRate}%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Open Issues</div>
              <div className="text-2xl font-bold">{openIssues}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Defect Rate</div>
              <div className="text-2xl font-bold">{defectRate}%</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="inspections" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inspections">Inspections ({inspections.length})</TabsTrigger>
          <TabsTrigger value="issues">Quality Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="certificates">Certificates ({certificates.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Inspection Lots</h3>
              <Button size="sm" onClick={() => { setEditingInspection(null); setInspectionForm({ lotNumber: '', material: '', materialDescription: '', quantity: 0, unit: 'pcs', inspector: '', startDate: '', endDate: '', status: 'Pending', priority: 'Medium', criticalChecks: 0, passedChecks: 0, failedChecks: 0, inspectionType: 'Incoming', workCenter: '', notes: '' }); setInspectionDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Inspection Lot</Button>
            </div>
            <EnhancedDataTable columns={inspectionColumns} data={inspections} actions={inspectionActions} searchPlaceholder="Search inspections..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quality Issues</h3>
              <Button size="sm" onClick={() => { setEditingIssue(null); setIssueForm({ issueId: '', material: '', materialDescription: '', defectType: '', severity: 'Medium', quantity: 0, unit: 'pcs', reportDate: '', resolvedDate: '', status: 'Open', assignedTo: '', rootCause: '', correctiveAction: '', costImpact: 0, notes: '' }); setIssueDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Report Issue</Button>
            </div>
            <EnhancedDataTable columns={issueColumns} data={issues} actions={issueActions} searchPlaceholder="Search issues..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quality Certificates</h3>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Certificate</Button>
            </div>
            <EnhancedDataTable columns={certificateColumns} data={certificates} searchPlaceholder="Search certificates..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quality Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Inspection Status Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Defect Categories</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={defectTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded md:col-span-2">
                <h4 className="font-medium mb-3">Quality Trend (Last 6 Months)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={inspectionDialogOpen} onOpenChange={setInspectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingInspection ? 'Edit Inspection' : 'New Inspection'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Lot Number</Label>
              <Input value={inspectionForm.lotNumber || ''} onChange={e => setInspectionForm({ ...inspectionForm, lotNumber: e.target.value })} placeholder="QL-2025-001" />
            </div>
            <div>
              <Label>Inspection Type</Label>
              <Select value={inspectionForm.inspectionType} onValueChange={value => setInspectionForm({ ...inspectionForm, inspectionType: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="In-Process">In-Process</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material Code</Label>
              <Input value={inspectionForm.material || ''} onChange={e => setInspectionForm({ ...inspectionForm, material: e.target.value })} placeholder="MAT-001" />
            </div>
            <div>
              <Label>Material Description</Label>
              <Input value={inspectionForm.materialDescription || ''} onChange={e => setInspectionForm({ ...inspectionForm, materialDescription: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={inspectionForm.quantity || ''} onChange={e => setInspectionForm({ ...inspectionForm, quantity: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={inspectionForm.unit} onValueChange={value => setInspectionForm({ ...inspectionForm, unit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Inspector</Label>
              <Input value={inspectionForm.inspector || ''} onChange={e => setInspectionForm({ ...inspectionForm, inspector: e.target.value })} />
            </div>
            <div>
              <Label>Work Center</Label>
              <Input value={inspectionForm.workCenter || ''} onChange={e => setInspectionForm({ ...inspectionForm, workCenter: e.target.value })} />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={inspectionForm.startDate || ''} onChange={e => setInspectionForm({ ...inspectionForm, startDate: e.target.value })} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={inspectionForm.endDate || ''} onChange={e => setInspectionForm({ ...inspectionForm, endDate: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={inspectionForm.status} onValueChange={value => setInspectionForm({ ...inspectionForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={inspectionForm.priority} onValueChange={value => setInspectionForm({ ...inspectionForm, priority: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Critical Checks</Label>
              <Input type="number" value={inspectionForm.criticalChecks || ''} onChange={e => setInspectionForm({ ...inspectionForm, criticalChecks: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Passed Checks</Label>
              <Input type="number" value={inspectionForm.passedChecks || ''} onChange={e => setInspectionForm({ ...inspectionForm, passedChecks: parseInt(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={inspectionForm.notes || ''} onChange={e => setInspectionForm({ ...inspectionForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInspection}>{editingInspection ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Edit Issue' : 'Report Issue'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Issue ID</Label>
              <Input value={issueForm.issueId || ''} onChange={e => setIssueForm({ ...issueForm, issueId: e.target.value })} placeholder="QI-2025-001" />
            </div>
            <div>
              <Label>Defect Type</Label>
              <Select value={issueForm.defectType} onValueChange={value => setIssueForm({ ...issueForm, defectType: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dimensional">Dimensional</SelectItem>
                  <SelectItem value="Surface Finish">Surface Finish</SelectItem>
                  <SelectItem value="Material Composition">Material Composition</SelectItem>
                  <SelectItem value="Assembly">Assembly</SelectItem>
                  <SelectItem value="Functional">Functional</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material Code</Label>
              <Input value={issueForm.material || ''} onChange={e => setIssueForm({ ...issueForm, material: e.target.value })} />
            </div>
            <div>
              <Label>Material Description</Label>
              <Input value={issueForm.materialDescription || ''} onChange={e => setIssueForm({ ...issueForm, materialDescription: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={issueForm.quantity || ''} onChange={e => setIssueForm({ ...issueForm, quantity: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={issueForm.unit} onValueChange={value => setIssueForm({ ...issueForm, unit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={issueForm.severity} onValueChange={value => setIssueForm({ ...issueForm, severity: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={issueForm.status} onValueChange={value => setIssueForm({ ...issueForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report Date</Label>
              <Input type="date" value={issueForm.reportDate || ''} onChange={e => setIssueForm({ ...issueForm, reportDate: e.target.value })} />
            </div>
            <div>
              <Label>Resolved Date</Label>
              <Input type="date" value={issueForm.resolvedDate || ''} onChange={e => setIssueForm({ ...issueForm, resolvedDate: e.target.value })} />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input value={issueForm.assignedTo || ''} onChange={e => setIssueForm({ ...issueForm, assignedTo: e.target.value })} />
            </div>
            <div>
              <Label>Cost Impact</Label>
              <Input type="number" value={issueForm.costImpact || ''} onChange={e => setIssueForm({ ...issueForm, costImpact: parseInt(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Root Cause</Label>
              <Input value={issueForm.rootCause || ''} onChange={e => setIssueForm({ ...issueForm, rootCause: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Corrective Action</Label>
              <Textarea value={issueForm.correctiveAction || ''} onChange={e => setIssueForm({ ...issueForm, correctiveAction: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={issueForm.notes || ''} onChange={e => setIssueForm({ ...issueForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveIssue}>{editingIssue ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(viewingItem).filter(([key]) => !['id', 'createdDate', 'lastModified'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <div className="text-sm">{String(value) || '-'}</div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualityControl;
