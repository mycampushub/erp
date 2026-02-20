
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, MessageSquare, Video, Share2, Users, Bell, Calendar, Plus, Edit, Trash2, FileText, Mail, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog, formatDateTime, formatDate, ViewDialog } from '../../lib/projectManagement/CRUDComponents';
import { Communication, Meeting, SharedDocument, NotificationSetting, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const Collaboration: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('communications');
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'communication' | 'meeting' | 'sharedoc' | 'notification'>('communication');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    setCommunications(listEntities<Communication>(PM_STORAGE_KEYS.COMMUNICATIONS));
    setMeetings(listEntities<Meeting>(PM_STORAGE_KEYS.MEETINGS));
    setSharedDocs(listEntities<SharedDocument>(PM_STORAGE_KEYS.SHARED_DOCS));
    setNotifications(listEntities<NotificationSetting>(PM_STORAGE_KEYS.NOTIFICATION_SETTINGS));
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Project Collaboration. Manage communications, meetings, and document sharing.');
    loadData();
  }, [isEnabled, speak, loadData]);

  const handleCRUD = (type: 'communication' | 'meeting' | 'sharedoc' | 'notification', item?: any, edit = false) => {
    setDialogType(type);
    setSelectedItem(item);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleView = (item: any, type: 'communication' | 'meeting' | 'sharedoc' | 'notification') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'communication' | 'meeting' | 'sharedoc' | 'notification') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.COMMUNICATIONS;
    let setter: any = setCommunications;
    if (dialogType === 'meeting') { key = PM_STORAGE_KEYS.MEETINGS; setter = setMeetings; }
    else if (dialogType === 'sharedoc') { key = PM_STORAGE_KEYS.SHARED_DOCS; setter = setSharedDocs; }
    else if (dialogType === 'notification') { key = PM_STORAGE_KEYS.NOTIFICATION_SETTINGS; setter = setNotifications; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.COMMUNICATIONS;
    let setter: any = setCommunications;
    if (dialogType === 'meeting') { key = PM_STORAGE_KEYS.MEETINGS; setter = setMeetings; }
    else if (dialogType === 'sharedoc') { key = PM_STORAGE_KEYS.SHARED_DOCS; setter = setSharedDocs; }
    else if (dialogType === 'notification') { key = PM_STORAGE_KEYS.NOTIFICATION_SETTINGS; setter = setNotifications; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'communication' ? 'comm' : dialogType === 'meeting' ? 'mtg' : dialogType === 'sharedoc' ? 'sd' : 'not') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const commColumns = [
    { key: 'type', header: 'Type', render: (v: string) => <Badge variant={v === 'Message' ? 'default' : v === 'Email' ? 'secondary' : 'outline'}>{v}</Badge> },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'from', header: 'From', sortable: true },
    { key: 'projectId', header: 'Project' },
    { key: 'timestamp', header: 'Time', render: (v: string) => formatDateTime(v) },
    { key: 'readStatus', header: 'Status', render: (v: string) => <Badge variant={v === 'Read' ? 'default' : 'secondary'}>{v}</Badge> },
  ];

  const meetingColumns = [
    { key: 'title', header: 'Meeting', sortable: true },
    { key: 'projectId', header: 'Project' },
    { key: 'scheduledAt', header: 'Scheduled', render: (v: string) => formatDateTime(v) },
    { key: 'duration', header: 'Duration', render: (v: number) => `${v} min` },
    { key: 'host', header: 'Host' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={v === 'Scheduled' ? 'default' : v === 'Completed' ? 'secondary' : 'outline'}>{v}</Badge> },
  ];

  const sharedDocColumns = [
    { key: 'documentId', header: 'Document', sortable: true },
    { key: 'sharedWith', header: 'Shared With', render: (v: string[]) => v?.join(', ') || '-' },
    { key: 'sharedBy', header: 'Shared By', sortable: true },
    { key: 'accessLevel', header: 'Access', render: (v: string) => <Badge variant={v === 'Edit' ? 'default' : 'secondary'}>{v}</Badge> },
    { key: 'sharedAt', header: 'Shared Date', render: (v: string) => formatDate(v) },
  ];

  const notificationColumns = [
    { key: 'type', header: 'Notification Type', sortable: true },
    { key: 'enabled', header: 'Status', render: (v: boolean) => (
      <Badge variant={v ? 'default' : 'secondary'}>{v ? 'Enabled' : 'Disabled'}</Badge>
    )},
    { key: 'channel', header: 'Channel', render: (v: string) => <Badge variant="outline">{v}</Badge> },
    { key: 'userId', header: 'User' },
  ];

  const getFormFields = () => {
    if (dialogType === 'communication') return [
      { name: 'type', label: 'Type', type: 'select' as const, options: [{ label: 'Message', value: 'Message' }, { label: 'Email', value: 'Email' }, { label: 'Comment', value: 'Comment' }] },
      { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
      { name: 'content', label: 'Content', type: 'textarea' as const, rows: 3 },
      { name: 'from', label: 'From', type: 'text' as const, required: true },
      { name: 'projectId', label: 'Project ID', type: 'text' as const },
      { name: 'readStatus', label: 'Status', type: 'select' as const, options: [{ label: 'Read', value: 'Read' }, { label: 'Unread', value: 'Unread' }] },
    ];
    if (dialogType === 'meeting') return [
      { name: 'title', label: 'Meeting Title', type: 'text' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'projectId', label: 'Project ID', type: 'text' as const },
      { name: 'scheduledAt', label: 'Scheduled Time', type: 'datetime-local' as any, required: true },
      { name: 'duration', label: 'Duration (min)', type: 'number' as const },
      { name: 'host', label: 'Host', type: 'text' as const },
      { name: 'status', label: 'Status', type: 'select' as const, options: [{ label: 'Scheduled', value: 'Scheduled' }, { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' }] },
      { name: 'location', label: 'Location', type: 'text' as const },
    ];
    if (dialogType === 'sharedoc') return [
      { name: 'documentId', label: 'Document ID', type: 'text' as const, required: true },
      { name: 'sharedWith', label: 'Shared With (comma-separated)', type: 'text' as const },
      { name: 'accessLevel', label: 'Access Level', type: 'select' as const, options: [{ label: 'View', value: 'View' }, { label: 'Edit', value: 'Edit' }] },
      { name: 'sharedBy', label: 'Shared By', type: 'text' as const },
    ];
    return [
      { name: 'type', label: 'Notification Type', type: 'text' as const, required: true },
      { name: 'enabled', label: 'Enabled', type: 'select' as const, options: [{ label: 'Enabled', value: 'true' }, { label: 'Disabled', value: 'false' }] },
      { name: 'channel', label: 'Channel', type: 'select' as const, options: [{ label: 'In-App', value: 'In-App' }, { label: 'Email', value: 'Email' }, { label: 'Both', value: 'Both' }] },
      { name: 'userId', label: 'User ID', type: 'text' as const },
    ];
  };

  const getViewFields = () => {
    if (dialogType === 'communication') return [
      { key: 'commId', label: 'Communication ID' },
      { key: 'type', label: 'Type' },
      { key: 'subject', label: 'Subject' },
      { key: 'content', label: 'Content' },
      { key: 'from', label: 'From' },
      { key: 'projectId', label: 'Project' },
      { key: 'timestamp', label: 'Time', render: (v: string) => formatDateTime(v) },
      { key: 'readStatus', label: 'Status' },
    ];
    if (dialogType === 'meeting') return [
      { key: 'meetingId', label: 'Meeting ID' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'projectId', label: 'Project' },
      { key: 'scheduledAt', label: 'Scheduled', render: (v: string) => formatDateTime(v) },
      { key: 'duration', label: 'Duration (min)' },
      { key: 'host', label: 'Host' },
      { key: 'status', label: 'Status' },
      { key: 'location', label: 'Location' },
    ];
    if (dialogType === 'sharedoc') return [
      { key: 'documentId', label: 'Document ID' },
      { key: 'sharedWith', label: 'Shared With', render: (v: string[]) => v?.join(', ') || '-' },
      { key: 'sharedBy', label: 'Shared By' },
      { key: 'accessLevel', label: 'Access Level' },
      { key: 'sharedAt', label: 'Shared Date', render: (v: string) => formatDate(v) },
    ];
    return [
      { key: 'type', label: 'Notification Type' },
      { key: 'enabled', label: 'Status', render: (v: boolean) => v ? 'Enabled' : 'Disabled' },
      { key: 'channel', label: 'Channel' },
      { key: 'userId', label: 'User ID' },
    ];
  };

  const unreadMessages = communications.filter(c => c.readStatus === 'Unread').length;
  const todayMeetings = meetings.filter(m => m.status === 'Scheduled').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Project Collaboration" description="Team communication, meetings, and document sharing" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Unread Messages" value={unreadMessages} icon={<MessageSquare className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Meetings Today" value={todayMeetings} icon={<Video className="h-6 w-6 text-green-600" />} />
        <StatCard title="Shared Docs" value={sharedDocs.length} icon={<Share2 className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Active Members" value="16" icon={<Users className="h-6 w-6 text-orange-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="sharing">Document Sharing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Communications</h3>
              <Button onClick={() => handleCRUD('communication')}><Plus className="h-4 w-4 mr-2" />New Message</Button>
            </div>
            <EnhancedCRUDTable data={communications} columns={commColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('communication')} onEdit={item => handleCRUD('communication', item, true)} onDelete={item => handleDelete(item, 'communication')} onView={item => handleView(item, 'communication')} />
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Meetings</h3>
              <Button onClick={() => handleCRUD('meeting')}><Plus className="h-4 w-4 mr-2" />Schedule Meeting</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {meetings.filter(m => m.status === 'Scheduled').slice(0, 6).map(mtg => (
                <Card key={mtg.id} className="p-4 border-l-4 border-blue-500">
                  <h4 className="font-medium">{mtg.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{formatDateTime(mtg.scheduledAt)}</p>
                  <p className="text-sm text-gray-500">{mtg.duration} min • {mtg.host}</p>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={meetings} columns={meetingColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('meeting')} onEdit={item => handleCRUD('meeting', item, true)} onDelete={item => handleDelete(item, 'meeting')} onView={item => handleView(item, 'meeting')} />
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document Sharing</h3>
              <Button onClick={() => handleCRUD('sharedoc')}><Plus className="h-4 w-4 mr-2" />Share Document</Button>
            </div>
            <EnhancedCRUDTable data={sharedDocs} columns={sharedDocColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('sharedoc')} onEdit={item => handleCRUD('sharedoc', item, true)} onDelete={item => handleDelete(item, 'sharedoc')} onView={item => handleView(item, 'sharedoc')} />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <Button onClick={() => handleCRUD('notification')}><Plus className="h-4 w-4 mr-2" />Add Notification</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {notifications.slice(0, 4).map(n => (
                <Card key={n.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{n.type}</p>
                      <p className="text-sm text-gray-500">Via {n.channel}</p>
                    </div>
                  </div>
                  <Badge variant={n.enabled ? 'default' : 'secondary'}>{n.enabled ? 'Enabled' : 'Disabled'}</Badge>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={notifications} columns={notificationColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('notification')} onEdit={item => handleCRUD('notification', item, true)} onDelete={item => handleDelete(item, 'notification')} onView={item => handleView(item, 'notification')} />
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'communication' ? 'Communication' : dialogType === 'meeting' ? 'Meeting' : dialogType === 'sharedoc' ? 'Document Share' : 'Notification'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item?" confirmLabel="Delete" />

      <ViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}
        title={dialogType === 'communication' ? 'Communication' : dialogType === 'meeting' ? 'Meeting' : dialogType === 'sharedoc' ? 'Document Share' : 'Notification'}
        item={selectedItem} fields={getViewFields()} />
    </div>
  );
};

export default Collaboration;
