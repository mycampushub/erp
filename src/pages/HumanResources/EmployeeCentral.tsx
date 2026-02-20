
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Plus, Edit, Eye, User, Phone, Mail, MapPin, Trash2, Building, Briefcase, Calendar, Award, FileText, Clock, Users, Search } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  managerId: string;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  location: string;
  salary: number;
  employeeType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  workSchedule: string;
  skills: string[];
  certifications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hireDate: string;
  performanceRating: number;
}

const departments = ['Information Technology', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Engineering', 'Customer Service', 'Legal', 'Research & Development'];
const locations = ['New York Office', 'Los Angeles Office', 'Chicago Office', 'Houston Office', 'Phoenix Office', 'San Francisco Office', 'Seattle Office', 'Boston Office', 'Denver Office', 'Austin Office', 'Remote'];
const statuses: Employee['status'][] = ['Active', 'On Leave', 'Inactive', 'Terminated'];
const employeeTypes: Employee['employeeType'][] = ['Full-time', 'Part-time', 'Contract', 'Intern'];

const EmployeeCentral: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('employees');
  const seedData = getSeedData();
  const [employees, setEmployees] = useState<Employee[]>(() => seedData.employees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Employee Central. Comprehensive employee lifecycle management with self-service capabilities and organizational structure management.');
    }
  }, [isEnabled, speak]);

  const saveEmployees = (data: Employee[]) => {
    setEmployees(data);
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = (empId: string) => {
    const updated = employees.filter(e => e.id !== empId);
    saveEmployees(updated);
    toast({
      title: 'Employee Deleted',
      description: 'Employee record has been successfully removed.',
    });
  };

  const handleSaveEmployee = (empData: Partial<Employee>) => {
    if (isEditing && selectedEmployee) {
      const updatedEmp = { ...selectedEmployee, ...empData };
      const updated = employees.map(e => e.id === selectedEmployee.id ? updatedEmp : e);
      saveEmployees(updated);
      toast({
        title: 'Employee Updated',
        description: 'Employee information has been successfully updated.',
      });
    } else {
      const newEmployee: Employee = {
        id: generateId('emp'),
        employeeId: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
        managerId: '',
        workSchedule: 'Standard 40hrs/week',
        skills: [],
        certifications: [],
        emergencyContact: { name: '', phone: '', relationship: '' },
        dateOfBirth: '',
        address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
        hireDate: new Date().toISOString().split('T')[0],
        performanceRating: 0,
        ...empData
      } as Employee;
      const updated = [newEmployee, ...employees];
      saveEmployees(updated);
      toast({
        title: 'Employee Created',
        description: 'New employee has been successfully added.',
      });
    }
    setIsDialogOpen(false);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('profile');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Terminated': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      emp.firstName.toLowerCase().includes(term) ||
      emp.lastName.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const columns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', sortable: true, searchable: true, width: '80px' },
    { 
      key: 'name', 
      header: 'Employee',
      searchable: true,
      render: (_, row: Employee) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <div className="font-medium">{row.firstName} {row.lastName}</div>
            <div className="text-xs text-muted-foreground">{row.position}</div>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', searchable: true },
    { key: 'department', header: 'Department', filterable: true, filterOptions: departments.map(d => ({ label: d, value: d })), searchable: true },
    { key: 'location', header: 'Location', searchable: true },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: statuses.map(s => ({ label: s, value: s })),
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'startDate', header: 'Start Date', sortable: true },
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewEmployee,
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditEmployee,
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Employee) => handleDeleteEmployee(row.id),
      variant: 'ghost'
    }
  ];

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'Active').length,
    onLeave: employees.filter(e => e.status === 'On Leave').length,
    inactive: employees.filter(e => e.status === 'Inactive' || e.status === 'Terminated').length,
    departments: new Set(employees.map(e => e.department)).size
  }), [employees]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/human-resources')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Employee Central"
          description="Comprehensive employee lifecycle management with self-service capabilities"
          voiceIntroduction="Welcome to Employee Central with comprehensive workforce management."
        />
      </div>

      <VoiceTrainingComponent 
        module="hr"
        topic="Employee Central Management"
        examples={[
          "Managing employee master data with organizational assignments, personal information, and employment history tracking",
          "Processing employee lifecycle events including onboarding, transfers, promotions, and termination workflows",
          "Enabling employee self-service functionality for time recording, leave requests, and personal data maintenance"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Employees</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <div className="text-sm text-green-600">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.onLeave}</div>
            <div className="text-sm text-yellow-600">On Leave</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-700">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.departments}</div>
            <div className="text-sm text-purple-600">Departments</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Directory ({filteredEmployees.length})
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Button onClick={handleCreateEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={filteredEmployees}
                actions={actions}
                searchPlaceholder="Search employees..."
                exportable={true}
                refreshable={true}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {selectedEmployee ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedEmployee.firstName} {selectedEmployee.lastName}</CardTitle>
                    <p className="text-muted-foreground">{selectedEmployee.position} - {selectedEmployee.department}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getStatusColor(selectedEmployee.status)}>{selectedEmployee.status}</Badge>
                      <Badge variant="outline">{selectedEmployee.employeeType}</Badge>
                      <Badge variant="outline">{selectedEmployee.location}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => handleEditEmployee(selectedEmployee)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-muted-foreground">Employee ID</Label><div className="font-medium">{selectedEmployee.employeeId}</div></div>
                      <div><Label className="text-muted-foreground">Date of Birth</Label><div className="font-medium">{selectedEmployee.dateOfBirth || 'N/A'}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-muted-foreground">Email</Label><div className="font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{selectedEmployee.email}</div></div>
                      <div><Label className="text-muted-foreground">Phone</Label><div className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{selectedEmployee.phone}</div></div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <div className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />
                        {selectedEmployee.address?.street ? `${selectedEmployee.address.street}, ${selectedEmployee.address.city}, ${selectedEmployee.address.state} ${selectedEmployee.address.zipCode}` : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Employment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-muted-foreground">Department</Label><div className="font-medium">{selectedEmployee.department}</div></div>
                      <div><Label className="text-muted-foreground">Position</Label><div className="font-medium">{selectedEmployee.position}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-muted-foreground">Manager</Label><div className="font-medium">{selectedEmployee.manager || 'N/A'}</div></div>
                      <div><Label className="text-muted-foreground">Work Schedule</Label><div className="font-medium">{selectedEmployee.workSchedule}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-muted-foreground">Hire Date</Label><div className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{selectedEmployee.hireDate}</div></div>
                      <div><Label className="text-muted-foreground">Salary</Label><div className="font-medium">${selectedEmployee.salary?.toLocaleString()}</div></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Skills</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEmployee.skills?.length > 0 ? (
                          selectedEmployee.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50">{skill}</Badge>
                          ))
                        ) : <span className="text-muted-foreground">No skills listed</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Certifications</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEmployee.certifications?.length > 0 ? (
                          selectedEmployee.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50">{cert}</Badge>
                          ))
                        ) : <span className="text-muted-foreground">No certifications</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label className="text-muted-foreground">Name</Label><div className="font-medium">{selectedEmployee.emergencyContact?.name || 'N/A'}</div></div>
                    <div><Label className="text-muted-foreground">Phone</Label><div className="font-medium">{selectedEmployee.emergencyContact?.phone || 'N/A'}</div></div>
                    <div><Label className="text-muted-foreground">Relationship</Label><div className="font-medium">{selectedEmployee.emergencyContact?.relationship || 'N/A'}</div></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Select an employee to view their profile</p>
                <Button className="mt-4" onClick={() => setActiveTab('employees')}>Go to Employee List</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => {
                  const deptEmployees = employees.filter(e => e.department === dept);
                  if (deptEmployees.length === 0) return null;
                  return (
                    <div key={dept} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <h4 className="font-semibold">{dept}</h4>
                        </div>
                        <Badge variant="outline">{deptEmployees.length} employees</Badge>
                      </div>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {deptEmployees.slice(0, 6).map((emp) => (
                          <div key={emp.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer" onClick={() => handleViewEmployee(emp)}>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                              <div className="text-muted-foreground text-xs">{emp.position}</div>
                            </div>
                          </div>
                        ))}
                        {deptEmployees.length > 6 && (
                          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                            +{deptEmployees.length - 6} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept) => {
                    const count = employees.filter(e => e.department === dept).length;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    if (count === 0) return null;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{dept}</span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeeTypes.map((type) => {
                    const count = employees.filter(e => e.employeeType === type).length;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(employees.map(e => e.location))).slice(0, 8).map((loc) => {
                    const count = employees.filter(e => e.location === loc).length;
                    return (
                      <div key={loc} className="flex justify-between text-sm">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{loc}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statuses.map((status) => {
                    const count = employees.filter(e => e.status === status).length;
                    return (
                      <div key={status} className="flex justify-between text-sm items-center">
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                        <span className="font-medium">{count}</span>
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
            <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm 
            employee={selectedEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmployeeForm: React.FC<{
  employee: Employee | null;
  onSave: (data: Partial<Employee>) => void;
  onCancel: () => void;
}> = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    department: employee?.department || '',
    manager: employee?.manager || '',
    location: employee?.location || '',
    status: employee?.status || 'Active',
    employeeType: employee?.employeeType || 'Full-time',
    startDate: employee?.startDate || new Date().toISOString().split('T')[0],
    salary: employee?.salary || 50000,
    dateOfBirth: employee?.dateOfBirth || '',
    skills: employee?.skills?.join(', ') || '',
    certifications: employee?.certifications?.join(', ') || '',
    emergencyName: employee?.emergencyContact?.name || '',
    emergencyPhone: employee?.emergencyContact?.phone || '',
    emergencyRelation: employee?.emergencyContact?.relationship || '',
    street: employee?.address?.street || '',
    city: employee?.address?.city || '',
    state: employee?.address?.state || '',
    zipCode: employee?.address?.zipCode || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      manager: formData.manager,
      location: formData.location,
      status: formData.status as Employee['status'],
      employeeType: formData.employeeType as Employee['employeeType'],
      startDate: formData.startDate,
      salary: Number(formData.salary),
      dateOfBirth: formData.dateOfBirth,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelation
      },
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'USA'
      }
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Position *</Label>
          <Input id="position" value={formData.position} onChange={e => updateField('position', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={v => updateField('department', v)}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manager">Manager</Label>
          <Input id="manager" value={formData.manager} onChange={e => updateField('manager', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Select value={formData.location} onValueChange={v => updateField('location', v)}>
            <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
            <SelectContent>
              {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={v => updateField('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="employeeType">Employment Type</Label>
          <Select value={formData.employeeType} onValueChange={v => updateField('employeeType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {employeeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={formData.startDate} onChange={e => updateField('startDate', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="salary">Annual Salary</Label>
          <Input id="salary" type="number" value={formData.salary} onChange={e => updateField('salary', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" value={formData.skills} onChange={e => updateField('skills', e.target.value)} placeholder="JavaScript, React, Node.js" />
      </div>

      <div>
        <Label htmlFor="certifications">Certifications (comma-separated)</Label>
        <Input id="certifications" value={formData.certifications} onChange={e => updateField('certifications', e.target.value)} placeholder="AWS Certified, PMP" />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Emergency Contact</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyName">Name</Label>
            <Input id="emergencyName" value={formData.emergencyName} onChange={e => updateField('emergencyName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Phone</Label>
            <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={e => updateField('emergencyPhone', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="emergencyRelation">Relationship</Label>
            <Input id="emergencyRelation" value={formData.emergencyRelation} onChange={e => updateField('emergencyRelation', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Address</h4>
        <div className="space-y-2">
          <Input placeholder="Street Address" value={formData.street} onChange={e => updateField('street', e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="City" value={formData.city} onChange={e => updateField('city', e.target.value)} />
            <Input placeholder="State" value={formData.state} onChange={e => updateField('state', e.target.value)} />
            <Input placeholder="ZIP Code" value={formData.zipCode} onChange={e => updateField('zipCode', e.target.value)} />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{employee ? 'Update' : 'Create'} Employee</Button>
      </DialogFooter>
    </form>
  );
};

export default EmployeeCentral;
