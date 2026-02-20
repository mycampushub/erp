import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Trophy, RefreshCw, Save, X, Clock, Gavel, Users, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, Auction as AuctionType } from '../../lib/procurementData';
import { generateId } from '../../lib/localCrud';

const BiddingAuctionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('auctions');
  const initialData = getProcurementData();
  const [auctions, setAuctions] = useState<AuctionType[]>(() => initialData?.auctions || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AuctionType | null>(null);
  const [viewingItem, setViewingItem] = useState<AuctionType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AuctionType | null>(null);

  const [formData, setFormData] = useState({
    auctionNumber: '',
    title: '',
    category: '',
    type: 'Reverse Auction' as 'Reverse Auction' | 'Forward Auction' | 'Dutch Auction' | 'Sealed Bid',
    status: 'Draft' as 'Draft' | 'Published' | 'Live' | 'Closed' | 'Awarded' | 'Cancelled',
    startTime: '',
    endTime: '',
    estimatedValue: 0,
    currency: 'USD',
    participantsInvited: 0,
    description: '',
    requirements: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = ['IT Equipment', 'Office Supplies', 'Furniture', 'Services', 'Manufacturing', 'Maintenance', 'Raw Materials', 'Industrial Equipment'];
  const auctionTypes = ['Reverse Auction', 'Forward Auction', 'Dutch Auction', 'Sealed Bid'];
  const statuses = ['Draft', 'Published', 'Live', 'Closed', 'Awarded', 'Cancelled'];

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Bidding and Auctions. Manage competitive bidding processes and reverse auctions for optimal pricing.');
    }
  }, [isEnabled, speak]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.auctionNumber.trim()) errors.auctionNumber = 'Auction number is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    if (formData.estimatedValue <= 0) errors.estimatedValue = 'Estimated value must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    
    setEditingItem(null);
    setFormData({
      auctionNumber: `AUC-${Date.now().toString(36).toUpperCase()}`,
      title: '',
      category: '',
      type: 'Reverse Auction',
      status: 'Draft',
      startTime: now.toISOString().slice(0, 16),
      endTime: endDate.toISOString().slice(0, 16),
      estimatedValue: 0,
      currency: 'USD',
      participantsInvited: 0,
      description: '',
      requirements: '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (item: AuctionType) => {
    setEditingItem(item);
    setFormData({
      auctionNumber: item.auctionNumber,
      title: item.title,
      category: item.category,
      type: item.type,
      status: item.status,
      startTime: item.startTime.slice(0, 16),
      endTime: item.endTime.slice(0, 16),
      estimatedValue: item.estimatedValue,
      currency: item.currency,
      participantsInvited: item.participantsInvited,
      description: item.description || '',
      requirements: item.requirements || '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (item: AuctionType) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: AuctionType) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    if (editingItem) {
      const updatedItems = auctions.map(item =>
        item.id === editingItem.id
          ? { 
              ...item, 
              ...formData,
              activeBidders: item.activeBidders,
              totalBids: item.totalBids,
              currentLeader: item.currentLeader,
              currentBestBid: item.currentBestBid,
              savingsRealized: item.savingsRealized,
            }
          : item
      );
      setAuctions(updatedItems);
      toast({ title: 'Success', description: 'Auction updated successfully' });
    } else {
      const newItem: AuctionType = {
        id: generateId('auc'),
        ...formData,
        activeBidders: 0,
        totalBids: 0,
        currentLeader: '',
        currentBestBid: 0,
        savingsRealized: 0,
      };
      const updatedItems = [newItem, ...auctions];
      setAuctions(updatedItems);
      toast({ title: 'Success', description: 'Auction created successfully' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete) {
    const updatedItems = auctions.filter(item => item.id !== itemToDelete.id);
    setAuctions(updatedItems);
    toast({ title: 'Success', description: 'Auction deleted successfully' });
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleMonitor = (item: AuctionType) => {
    toast({ title: 'Monitor Auction', description: `Opening live monitor for ${item.auctionNumber}` });
  };

  const handleAward = (item: AuctionType) => {
    const updatedItems = auctions.map(a => {
      if (a.id === item.id) {
        return { ...a, status: 'Awarded' as const };
      }
      return a;
    });
    setAuctions(updatedItems);
    toast({ title: 'Award Auction', description: `Awarding auction ${item.auctionNumber} to ${item.currentLeader || 'winning bidder'}` });
  };

  const handleRefresh = () => {
    const data = getProcurementData();
    if (data && data.auctions) {
      setAuctions(data.auctions);
    }
    toast({ title: 'Refreshed', description: 'Auction data refreshed successfully' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Published': 'bg-blue-100 text-blue-800',
      'Live': 'bg-green-100 text-green-800',
      'Closed': 'bg-orange-100 text-orange-800',
      'Awarded': 'bg-purple-100 text-purple-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'auctionNumber', header: 'Auction #', sortable: true, searchable: true },
    { key: 'title', header: 'Title', searchable: true },
    { key: 'type', header: 'Type', filterable: true, filterOptions: auctionTypes.map(t => ({ label: t, value: t })) },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: statuses.map(s => ({ label: s, value: s })),
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { 
      key: 'activeBidders', 
      header: 'Bidders',
      render: (value: number, row: AuctionType) => `${value}/${row.participantsInvited}`
    },
    { 
      key: 'currentBestBid', 
      header: 'Best Bid',
      sortable: true,
      render: (value: number, row: AuctionType) => value > 0 ? `${row.currency} ${value.toLocaleString()}` : '-'
    },
    { 
      key: 'savingsRealized', 
      header: 'Savings',
      sortable: true,
      render: (value: number, row: AuctionType) => value > 0 ? `${row.currency} ${value.toLocaleString()}` : '-'
    },
    { key: 'endTime', header: 'End Time', sortable: true, render: (value: string) => new Date(value).toLocaleString() }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: AuctionType) => handleOpenViewDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Monitor',
      icon: <Clock className="h-4 w-4" />,
      onClick: (row: AuctionType) => handleMonitor(row),
      variant: 'ghost'
    },
    {
      label: 'Award',
      icon: <Trophy className="h-4 w-4" />,
      onClick: (row: AuctionType) => handleAward(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: AuctionType) => handleOpenEditDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: AuctionType) => handleOpenDeleteDialog(row),
      variant: 'ghost'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/procurement')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Bidding & Auctions"
          description="Manage competitive bidding and reverse auction processes"
          voiceIntroduction="Welcome to Bidding and Auctions for competitive sourcing."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{auctions.length}</div>
            <div className="text-sm text-muted-foreground">Total Auctions</div>
            <div className="text-sm text-blue-600">This quarter</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{auctions.filter(a => a.status === 'Live').length}</div>
            <div className="text-sm text-muted-foreground">Live Auctions</div>
            <div className="text-sm text-green-600">Active now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{auctions.reduce((sum, a) => sum + a.activeBidders, 0)}</div>
            <div className="text-sm text-muted-foreground">Active Bidders</div>
            <div className="text-sm text-purple-600">Participating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${auctions.reduce((sum, a) => sum + a.savingsRealized, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Savings</div>
            <div className="text-sm text-green-600">Realized</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="live">Live Events</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="auctions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Auction Management
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Auction
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={auctions}
                actions={actions}
                searchPlaceholder="Search auctions..."
                exportable={true}
                refreshable={true}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Live Auctions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auctions.filter(a => a.status === 'Live').map((auction) => (
                  <div key={auction.id} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center text-green-800">
                          <Gavel className="h-4 w-4 mr-2" />
                          {auction.title} - LIVE
                        </h4>
                        <p className="text-sm text-green-700">
                          {auction.auctionNumber} | Type: {auction.type}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-600">Current Leader:</span>
                            <div className="font-medium">{auction.currentLeader || '-'}</div>
                          </div>
                          <div>
                            <span className="text-green-600">Best Bid:</span>
                            <div className="font-medium">{auction.currency} {auction.currentBestBid.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-green-600">Active Bidders:</span>
                            <div className="font-medium">{auction.activeBidders}/{auction.participantsInvited}</div>
                          </div>
                          <div>
                            <span className="text-green-600">Total Bids:</span>
                            <div className="font-medium">{auction.totalBids}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleMonitor(auction)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Monitor
                        </Button>
                        <Button size="sm" onClick={() => handleAward(auction)}>
                          <Trophy className="h-4 w-4 mr-2" />
                          Award
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Auction Results</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auctions.filter(a => a.status === 'Closed' || a.status === 'Awarded').map((auction) => (
                  <div key={auction.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{auction.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {auction.auctionNumber} | Winner: {auction.currentLeader || '-'}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Winning Bid:</span>
                            <div className="font-medium">{auction.currency} {auction.currentBestBid.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estimated Value:</span>
                            <div className="font-medium">{auction.currency} {auction.estimatedValue.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Savings:</span>
                            <div className="font-medium text-green-600">
                              {auction.currency} {auction.savingsRealized.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(auction.status)}>
                          {auction.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleOpenViewDialog(auction)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Auction Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Average Savings Rate</span>
                      <span className="font-bold text-green-600">
                        {auctions.length > 0 ? Math.round((auctions.reduce((sum, a) => sum + (a.savingsRealized / a.estimatedValue), 0) / auctions.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Average Participation Rate</span>
                      <span className="font-bold">
                        {auctions.length > 0 ? Math.round((auctions.reduce((sum, a) => sum + (a.activeBidders / a.participantsInvited), 0) / auctions.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Total Bids Received</span>
                      <span className="font-bold">{auctions.reduce((sum, a) => sum + a.totalBids, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Auction Types Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auctionTypes.map((type) => {
                    const count = auctions.filter(a => a.type === type).length;
                    const percentage = auctions.length > 0 ? Math.round((count / auctions.length) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Auction' : 'Create Auction'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the auction details below.' : 'Fill in the details to create a new auction.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="auctionNumber">Auction Number *</Label>
              <Input
                id="auctionNumber"
                value={formData.auctionNumber}
                onChange={(e) => setFormData({ ...formData, auctionNumber: e.target.value })}
                placeholder="e.g., AUC-2025-001"
              />
              {formErrors.auctionNumber && <p className="text-red-500 text-xs">{formErrors.auctionNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Auction title"
              />
              {formErrors.title && <p className="text-red-500 text-xs">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Auction Type</Label>
              <Select value={formData.type} onValueChange={(value: AuctionType['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {auctionTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: AuctionType['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              {formErrors.startTime && <p className="text-red-500 text-xs">{formErrors.startTime}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
              {formErrors.endTime && <p className="text-red-500 text-xs">{formErrors.endTime}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value *</Label>
              <Input
                id="estimatedValue"
                type="number"
                min="0"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
              />
              {formErrors.estimatedValue && <p className="text-red-500 text-xs">{formErrors.estimatedValue}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="participantsInvited">Participants Invited</Label>
              <Input
                id="participantsInvited"
                type="number"
                min="0"
                value={formData.participantsInvited}
                onChange={(e) => setFormData({ ...formData, participantsInvited: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Auction description"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Input
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Auction requirements"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auction Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Auction Number:</span><p className="font-medium">{viewingItem.auctionNumber}</p></div>
                <div><span className="text-muted-foreground">Status:</span><Badge className={getStatusColor(viewingItem.status)}>{viewingItem.status}</Badge></div>
                <div><span className="text-muted-foreground">Title:</span><p className="font-medium">{viewingItem.title}</p></div>
                <div><span className="text-muted-foreground">Type:</span><p className="font-medium">{viewingItem.type}</p></div>
                <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{viewingItem.category}</p></div>
                <div><span className="text-muted-foreground">Estimated Value:</span><p className="font-medium">{viewingItem.currency} {viewingItem.estimatedValue.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Participants:</span><p className="font-medium">{viewingItem.activeBidders}/{viewingItem.participantsInvited}</p></div>
                <div><span className="text-muted-foreground">Total Bids:</span><p className="font-medium">{viewingItem.totalBids}</p></div>
                <div><span className="text-muted-foreground">Current Leader:</span><p className="font-medium">{viewingItem.currentLeader || '-'}</p></div>
                <div><span className="text-muted-foreground">Best Bid:</span><p className="font-medium">{viewingItem.currentBestBid > 0 ? `${viewingItem.currency} ${viewingItem.currentBestBid.toLocaleString()}` : '-'}</p></div>
                <div><span className="text-muted-foreground">Savings:</span><p className="font-medium text-green-600">{viewingItem.savingsRealized > 0 ? `${viewingItem.currency} ${viewingItem.savingsRealized.toLocaleString()}` : '-'}</p></div>
                <div><span className="text-muted-foreground">Start Time:</span><p className="font-medium">{new Date(viewingItem.startTime).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">End Time:</span><p className="font-medium">{new Date(viewingItem.endTime).toLocaleString()}</p></div>
                {viewingItem.description && <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p className="font-medium">{viewingItem.description}</p></div>}
                {viewingItem.requirements && <div className="col-span-2"><span className="text-muted-foreground">Requirements:</span><p className="font-medium">{viewingItem.requirements}</p></div>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the auction "{itemToDelete?.auctionNumber}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiddingAuctionsPage;
