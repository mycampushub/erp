
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Plus, Edit, Eye, Send, Clock, Users, Award, Save, X, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, RFQ, Supplier } from '../../lib/procurementData';

interface RFQFormData {
  title: string;
  description: string;
  category: string;
  status: 'Draft' | 'Published' | 'Response Period' | 'Evaluation' | 'Awarded' | 'Cancelled';
  publishDate: string;
  responseDeadline: string;
  totalValue: string;
  currency: string;
  suppliersInvited: string;
  creator: string;
  evaluationCriteria: string;
}

const categories = ['Technology', 'Furniture', 'Services', 'Manufacturing', 'Office Supplies', 'Raw Materials'];

const RFQManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('rfqs');
  const initialData = getProcurementData();
  const [rfqs, setRfqs] = useState<RFQ[]>(() => initialData?.rfqs || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => initialData?.suppliers || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState<RFQ | null>(null);
  const [deletingRFQ, setDeletingRFQ] = useState<RFQ | null>(null);
  const [formData, setFormData] = useState<RFQFormData>({
    title: '',
    description: '',
    category: '',
    status: 'Draft',
    publishDate: '',
    responseDeadline: '',
    totalValue: '',
    currency: 'USD',
    suppliersInvited: '',
    creator: '',
    evaluationCriteria: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to RFQ Management. Request quotes from suppliers and manage competitive bidding processes.');
    }
  }, [isEnabled, speak]);

  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreate = () => {
    setEditingRFQ(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      status: 'Draft',
      publishDate: '',
      responseDeadline: '',
      totalValue: '',
      currency: 'USD',
      suppliersInvited: '',
      creator: '',
      evaluationCriteria: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (rfq: RFQ) => {
    setEditingRFQ(rfq);
    setFormData({
      title: rfq.title,
      description: rfq.description,
      category: rfq.category,
      status: rfq.status,
      publishDate: rfq.publishDate,
      responseDeadline: rfq.responseDeadline,
      totalValue: rfq.totalValue.toString(),
      currency: rfq.currency,
      suppliersInvited: rfq.suppliersInvited.toString(),
      creator: rfq.creator,
      evaluationCriteria: rfq.evaluationCriteria
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (rfq: RFQ) => {
    setDeletingRFQ(rfq);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingRFQ) {
      const updatedRfqs = rfqs.filter(r => r.id !== deletingRFQ.id);
      setRfqs(updatedRfqs);
      toast({
        title: 'RFQ Deleted',
        description: `RFQ ${deletingRFQ.rfqNumber} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingRFQ(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.publishDate || !formData.responseDeadline || !formData.totalValue) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const rfqData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      publishDate: formData.publishDate,
      responseDeadline: formData.responseDeadline,
      totalValue: parseFloat(formData.totalValue),
      currency: formData.currency,
      suppliersInvited: parseInt(formData.suppliersInvited) || 0,
      responsesReceived: 0,
      creator: formData.creator,
      evaluationCriteria: formData.evaluationCriteria
    };

    if (editingRFQ) {
      const updatedRFQ: RFQ = { ...editingRFQ, ...rfqData };
      const updatedRfqs = rfqs.map(r => r.id === editingRFQ.id ? updatedRFQ : r);
      setRfqs(updatedRfqs);
      toast({
        title: 'RFQ Updated',
        description: `${formData.title} has been updated.`,
      });
    } else {
      const newRFQ: RFQ = {
        id: generateId('rfq'),
        rfqNumber: `RFQ-2025-${String(rfqs.length + 1).padStart(3, '0')}`,
        ...rfqData,
        createdAt: new Date().toISOString()
      };
      const updatedRfqs = [...rfqs, newRFQ];
      setRfqs(updatedRfqs);
      toast({
        title: 'RFQ Created',
        description: `${formData.title} has been created.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleViewResponses = (rfq: RFQ) => {
    toast({ title: 'View Responses', description: `Opening responses for ${rfq.rfqNumber}` });
  };

  const handleEvaluate = (rfq: RFQ) => {
    toast({ title: 'Evaluate RFQ', description: `Opening evaluation for ${rfq.rfqNumber}` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Published': 'bg-blue-100 text-blue-800',
      'Response Period': 'bg-yellow-100 text-yellow-800',
      'Evaluation': 'bg-orange-100 text-orange-800',
      'Awarded': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'rfqNumber', header: 'RFQ Number', sortable: true, searchable: true },
    { key: 'title', header: 'Title', searchable: true },
    { key: 'category', header: 'Category', filterable: true, filterOptions: categories.map(c => ({ label: c, value: c }))},
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Published', value: 'Published' },
        { label: 'Response Period', value: 'Response Period' },
        { label: 'Evaluation', value: 'Evaluation' },
        { label: 'Awarded', value: 'Awarded' },
        { label: 'Cancelled', value: 'Cancelled' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'totalValue', 
      header: 'Est. Value',
      sortable: true,
      render: (value: number, row: RFQ) => `${row.currency} ${value.toLocaleString()}`
    },
    { 
      key: 'responsesReceived', 
      header: 'Responses',
      render: (value: number, row: RFQ) => `${value}/${row.suppliersInvited}`
    },
    { key: 'responseDeadline', header: 'Deadline', sortable: true },
    { key: 'creator', header: 'Creator', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: RFQ) => handleEdit(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: RFQ) => handleEdit(row),
      variant: 'ghost',
      condition: (row: RFQ) => row.status === 'Draft'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: RFQ) => handleDelete(row),
      variant: 'ghost',
      condition: (row: RFQ) => row.status === 'Draft'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/procurement')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="RFQ Management"
          description="Request quotes from suppliers and manage competitive bidding processes"
          voiceIntroduction="Welcome to RFQ Management for competitive sourcing."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rfqs.length}</div>
            <div className="text-sm text-muted-foreground">Active RFQs</div>
            <div className="text-sm text-blue-600">In progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {rfqs.filter(r => r.status === 'Response Period').length}
            </div>
            <div className="text-sm text-muted-foreground">Awaiting Responses</div>
            <div className="text-sm text-yellow-600">Open for bids</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {rfqs.reduce((sum, r) => sum + r.responsesReceived, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Responses</div>
            <div className="text-sm text-green-600">Received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${rfqs.reduce((sum, r) => sum + r.totalValue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-purple-600">Estimated</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rfqs">RFQs</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Request for Quotes
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create RFQ
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={rfqs}
                actions={actions}
                searchPlaceholder="Search RFQs..."
                exportable={true}
                refreshable={true}
                onRefresh={() => {
                  const data = getProcurementData();
                  if (data) {
                    setRfqs(data.rfqs);
                    setSuppliers(data.suppliers);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rfqs.filter(r => r.responsesReceived > 0).map((rfq) => (
                  <div key={rfq.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{rfq.title}</h4>
                        <p className="text-sm text-muted-foreground">{rfq.rfqNumber}</p>
                        <p className="text-sm">Responses: {rfq.responsesReceived}/{rfq.suppliersInvited}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewResponses(rfq)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Responses
                        </Button>
                        <Button size="sm" onClick={() => handleEvaluate(rfq)}>
                          <Award className="h-4 w-4 mr-2" />
                          Evaluate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {rfqs.filter(r => r.responsesReceived > 0).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No responses received yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Draft', 'Published', 'Response Period', 'Evaluation', 'Awarded', 'Cancelled'].map((status) => {
                    const count = rfqs.filter(r => r.status === status).length;
                    return (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rfqs.slice(0, 5).map((rfq) => {
                    const responseRate = rfq.suppliersInvited > 0 ? 
                      Math.round((rfq.responsesReceived / rfq.suppliersInvited) * 100) : 0;
                    return (
                      <div key={rfq.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{rfq.rfqNumber}</span>
                          <span>{responseRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${responseRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRFQ ? 'Edit RFQ' : 'Create New RFQ'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter RFQ title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter RFQ description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Response Period">Response Period</SelectItem>
                    <SelectItem value="Evaluation">Evaluation</SelectItem>
                    <SelectItem value="Awarded">Awarded</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="publishDate">Publish Date *</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responseDeadline">Response Deadline *</Label>
                <Input
                  id="responseDeadline"
                  type="date"
                  value={formData.responseDeadline}
                  onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalValue">Estimated Value *</Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="suppliersInvited">Suppliers to Invite</Label>
                <Input
                  id="suppliersInvited"
                  type="number"
                  value={formData.suppliersInvited}
                  onChange={(e) => setFormData({ ...formData, suppliersInvited: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="creator">Created By</Label>
                <Input
                  id="creator"
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evaluationCriteria">Evaluation Criteria</Label>
                <Input
                  id="evaluationCriteria"
                  value={formData.evaluationCriteria}
                  onChange={(e) => setFormData({ ...formData, evaluationCriteria: e.target.value })}
                  placeholder="Price, Quality, Delivery"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {editingRFQ ? 'Update' : 'Create'} RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete RFQ "{deletingRFQ?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RFQManagement;
