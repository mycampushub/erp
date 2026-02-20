
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, FileText, Folder, Upload, Plus, Edit, Trash2, Eye, Download, Share2, Users, Lock, Clock, History, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog, formatDate } from '../../lib/projectManagement/CRUDComponents';
import { ProjectDocument, DocumentFolder, DocumentVersion, DocumentPermission, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const DocumentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'document' | 'folder' | 'version' | 'permission'>('document');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    setDocuments(listEntities<ProjectDocument>(PM_STORAGE_KEYS.DOCUMENTS));
    setFolders(listEntities<DocumentFolder>(PM_STORAGE_KEYS.DOCUMENT_FOLDERS));
    setVersions(listEntities<DocumentVersion>(PM_STORAGE_KEYS.DOCUMENT_VERSIONS));
    setPermissions(listEntities<DocumentPermission>(PM_STORAGE_KEYS.DOCUMENT_PERMISSIONS));
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Document Management. Manage your documents, versions, and access permissions.');
    loadData();
  }, [isEnabled, speak, loadData]);

  const handleCRUD = (type: 'document' | 'folder' | 'version' | 'permission', item?: any, edit = false) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'document' | 'folder' | 'version' | 'permission') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.DOCUMENTS;
    let setter: any = setDocuments;
    if (dialogType === 'folder') { key = PM_STORAGE_KEYS.DOCUMENT_FOLDERS; setter = setFolders; }
    else if (dialogType === 'version') { key = PM_STORAGE_KEYS.DOCUMENT_VERSIONS; setter = setVersions; }
    else if (dialogType === 'permission') { key = PM_STORAGE_KEYS.DOCUMENT_PERMISSIONS; setter = setPermissions; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.DOCUMENTS;
    let setter: any = setDocuments;
    if (dialogType === 'folder') { key = PM_STORAGE_KEYS.DOCUMENT_FOLDERS; setter = setFolders; }
    else if (dialogType === 'version') { key = PM_STORAGE_KEYS.DOCUMENT_VERSIONS; setter = setVersions; }
    else if (dialogType === 'permission') { key = PM_STORAGE_KEYS.DOCUMENT_PERMISSIONS; setter = setPermissions; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { 
        ...data, 
        id: generateId(dialogType === 'document' ? 'doc' : dialogType === 'folder' ? 'fold' : dialogType === 'version' ? 'ver' : 'perm'),
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const docColumns = [
    { key: 'name', header: 'Document Name', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'sizeFormatted', header: 'Size' },
    { key: 'projectId', header: 'Project' },
    { key: 'version', header: 'Version' },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Approved' ? 'default' : v === 'Review' ? 'secondary' : v === 'Archived' ? 'outline' : 'destructive'}>{v}</Badge>
    )},
    { key: 'lastModified', header: 'Last Modified', render: (v: string) => formatDate(v) },
  ];

  const folderColumns = [
    { key: 'name', header: 'Folder Name', sortable: true },
    { key: 'documentCount', header: 'Documents', render: (v: number) => v || 0 },
    { key: 'totalSize', header: 'Total Size', render: (v: number) => `${(v || 0 / 1024).toFixed(1)} KB` },
    { key: 'createdBy', header: 'Created By' },
    { key: 'lastAccess', header: 'Last Access', render: (v: string) => formatDate(v) },
  ];

  const versionColumns = [
    { key: 'documentId', header: 'Document', sortable: true },
    { key: 'version', header: 'Version' },
    { key: 'changes', header: 'Changes' },
    { key: 'createdBy', header: 'Modified By' },
    { key: 'createdAt', header: 'Modified Date', render: (v: string) => formatDate(v) },
  ];

  const permissionColumns = [
    { key: 'documentId', header: 'Document', sortable: true },
    { key: 'userId', header: 'User/Group', sortable: true },
    { key: 'permission', header: 'Access Level', render: (v: string) => (
      <Badge variant={v === 'Full Access' ? 'default' : v === 'Write' ? 'secondary' : 'outline'}>
        {v === 'Full Access' ? <Lock className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
        {v}
      </Badge>
    )},
    { key: 'grantedBy', header: 'Granted By' },
    { key: 'grantedAt', header: 'Granted Date', render: (v: string) => formatDate(v) },
  ];

  const getFormFields = () => {
    if (dialogType === 'document') return [
      { name: 'name', label: 'Document Name', type: 'text' as const, required: true, placeholder: 'Enter document name' },
      { name: 'type', label: 'Type', type: 'select' as const, options: [
        { label: 'PDF', value: 'PDF' }, { label: 'DOCX', value: 'DOCX' }, { label: 'XLSX', value: 'XLSX' }, { label: 'PPTX', value: 'PPTX' }, { label: 'Image', value: 'Image' }
      ]},
      { name: 'projectId', label: 'Project ID', type: 'text' as const, placeholder: 'PRJ-XXX' },
      { name: 'folderId', label: 'Folder ID', type: 'text' as const },
      { name: 'version', label: 'Version', type: 'text' as const, placeholder: '1.0' },
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Draft', value: 'Draft' }, { label: 'Review', value: 'Review' }, { label: 'Approved', value: 'Approved' }, { label: 'Archived', value: 'Archived' }
      ]},
      { name: 'createdBy', label: 'Created By', type: 'text' as const },
      { name: 'modifiedBy', label: 'Modified By', type: 'text' as const },
    ];
    if (dialogType === 'folder') return [
      { name: 'name', label: 'Folder Name', type: 'text' as const, required: true, placeholder: 'Enter folder name' },
      { name: 'parentId', label: 'Parent Folder ID', type: 'text' as const, placeholder: 'Leave empty for root' },
      { name: 'createdBy', label: 'Created By', type: 'text' as const },
    ];
    if (dialogType === 'version') return [
      { name: 'documentId', label: 'Document ID', type: 'text' as const, required: true },
      { name: 'version', label: 'Version', type: 'text' as const, required: true, placeholder: '1.1' },
      { name: 'changes', label: 'Changes Description', type: 'textarea' as const, rows: 3, placeholder: 'Describe changes in this version' },
      { name: 'createdBy', label: 'Modified By', type: 'text' as const },
    ];
    return [
      { name: 'documentId', label: 'Document ID', type: 'text' as const, required: true },
      { name: 'userId', label: 'User ID/Group', type: 'text' as const, required: true, placeholder: 'Enter user or group ID' },
      { name: 'permission', label: 'Access Level', type: 'select' as const, options: [
        { label: 'Read', value: 'Read' }, { label: 'Write', value: 'Write' }, { label: 'Full Access', value: 'Full Access' }
      ]},
      { name: 'grantedBy', label: 'Granted By', type: 'text' as const },
    ];
  };

  const approvedDocs = documents.filter(d => d.status === 'Approved').length;
  const pendingDocs = documents.filter(d => d.status === 'Review').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Document Management" description="Organize, version control, and manage project documents" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={documents.length} icon={<FileText className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Folders" value={folders.length} icon={<Folder className="h-6 w-6 text-yellow-600" />} />
        <StatCard title="Approved" value={approvedDocs} icon={<CheckCircle className="h-6 w-6 text-green-600" />} />
        <StatCard title="Pending Review" value={pendingDocs} icon={<Clock className="h-6 w-6 text-orange-600" />} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="versions">Version Control</TabsTrigger>
          <TabsTrigger value="sharing">Sharing & Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Documents</h3>
              <div className="flex gap-2">
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                <Button onClick={() => handleCRUD('document')}><Plus className="h-4 w-4 mr-2" />Add Document</Button>
              </div>
            </div>
            <EnhancedCRUDTable data={documents} columns={docColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('document')} onEdit={item => handleCRUD('document', item, true)} onDelete={item => handleDelete(item, 'document')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="folders" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document Folders</h3>
              <Button onClick={() => handleCRUD('folder')}><Plus className="h-4 w-4 mr-2" />New Folder</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <Card key={folder.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded"><Folder className="h-5 w-5 text-yellow-600" /></div>
                    <div className="flex-1">
                      <h4 className="font-medium">{folder.name}</h4>
                      <p className="text-sm text-gray-500">{folder.documentCount || 0} documents</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleCRUD('folder', folder, true)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(folder, 'folder')}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="versions" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Version Control</h3>
              <Button onClick={() => handleCRUD('version')}><Plus className="h-4 w-4 mr-2" />Add Version</Button>
            </div>
            <EnhancedCRUDTable data={versions} columns={versionColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('version')} onDelete={item => handleDelete(item, 'version')} />
          </Card>
        </TabsContent>
        
        <TabsContent value="sharing" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sharing & Access Permissions</h3>
              <Button onClick={() => handleCRUD('permission')}><Plus className="h-4 w-4 mr-2" />Add Permission</Button>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-3">Quick Share</h4>
              <div className="flex gap-2">
                <Input placeholder="Document ID" className="max-w-xs" />
                <Input placeholder="User/Group email" className="max-w-xs" />
                <select className="h-10 px-3 border rounded-md">
                  <option>Read</option>
                  <option>Write</option>
                  <option>Full Access</option>
                </select>
                <Button><Share2 className="h-4 w-4 mr-2" />Share</Button>
              </div>
            </div>
            <EnhancedCRUDTable data={permissions} columns={permissionColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('permission')} onDelete={item => handleDelete(item, 'permission')} />
          </Card>
        </TabsContent>
      </Tabs>
      
      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'document' ? 'Document' : dialogType === 'folder' ? 'Folder' : dialogType === 'version' ? 'Version' : 'Permission'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item? This action cannot be undone." confirmLabel="Delete" />
    </div>
  );
};

export default DocumentManagement;
