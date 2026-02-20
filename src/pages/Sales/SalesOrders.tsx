
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Eye, FileText, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerPO: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'Delivered' | 'Invoiced' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  salesRep: string;
  paymentTerms: string;
  shippingMethod: string;
  lineItems: number;
}

interface OrderLine {
  id: string;
  lineNumber: number;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  status: 'Open' | 'Confirmed' | 'Shipped' | 'Delivered';
}

const SalesOrders: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('orders');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Sales Orders Management. Create, track, and manage sales orders from quotation to delivery with comprehensive order fulfillment tracking.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const sampleOrders: SalesOrder[] = [
      {
        id: 'so-001',
        orderNumber: 'SO-2025-001',
        customer: 'Acme Corporation',
        customerPO: 'PO-ACM-2025-001',
        orderDate: '2025-01-25',
        deliveryDate: '2025-02-15',
        totalAmount: 125000.00,
        currency: 'USD',
        status: 'Confirmed',
        priority: 'High',
        salesRep: 'John Smith',
        paymentTerms: 'Net 30',
        shippingMethod: 'Standard Shipping',
        lineItems: 5
      },
      {
        id: 'so-002',
        orderNumber: 'SO-2025-002',
        customer: 'TechSolutions Inc',
        customerPO: 'PO-TS-2025-002',
        orderDate: '2025-01-28',
        deliveryDate: '2025-02-20',
        totalAmount: 85000.00,
        currency: 'USD',
        status: 'In Progress',
        priority: 'Medium',
        salesRep: 'Sarah Johnson',
        paymentTerms: 'Net 15',
        shippingMethod: 'Express Shipping',
        lineItems: 3
      },
      {
        id: 'so-003',
        orderNumber: 'SO-2025-003',
        customer: 'Global Manufacturing',
        customerPO: 'PO-GM-2025-003',
        orderDate: '2025-01-20',
        deliveryDate: '2025-02-10',
        totalAmount: 250000.00,
        currency: 'USD',
        status: 'Delivered',
        priority: 'Urgent',
        salesRep: 'Mike Davis',
        paymentTerms: 'Net 45',
        shippingMethod: 'Freight',
        lineItems: 10
      }
    ];
    setSalesOrders(sampleOrders);

    const sampleLines: OrderLine[] = [
      {
        id: 'line-001',
        lineNumber: 10,
        product: 'PROD-001',
        description: 'Professional Server Rack',
        quantity: 5,
        unitPrice: 2450.00,
        totalPrice: 12250.00,
        deliveryDate: '2025-02-15',
        status: 'Confirmed'
      },
      {
        id: 'line-002',
        lineNumber: 20,
        product: 'PROD-002',
        description: 'Enterprise Database License',
        quantity: 10,
        unitPrice: 1285.00,
        totalPrice: 12850.00,
        deliveryDate: '2025-02-15',
        status: 'Confirmed'
      }
    ];
    setOrderLines(sampleLines);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Invoiced': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <FileText className="h-4 w-4" />;
      case 'Confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Delivered':
        return <Truck className="h-4 w-4" />;
      case 'Urgent':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const columns: EnhancedColumn[] = [
    { key: 'orderNumber', header: 'Order Number', sortable: true, searchable: true },
    { key: 'customer', header: 'Customer', searchable: true },
    { key: 'customerPO', header: 'Customer PO', searchable: true },
    { 
      key: 'totalAmount', 
      header: 'Total Amount',
      sortable: true,
      render: (value: number, row: SalesOrder) => `${row.currency} ${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Invoiced', value: 'Invoiced' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusIcon(value)}
          <span className="ml-1">{value}</span>
        </Badge>
      )
    },
    { 
      key: 'priority', 
      header: 'Priority',
      filterable: true,
      filterOptions: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Urgent', value: 'Urgent' }
      ],
      render: (value: string) => (
        <Badge className={getPriorityColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'orderDate', header: 'Order Date', sortable: true },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true },
    { key: 'salesRep', header: 'Sales Rep', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: SalesOrder) => {
        setSelectedOrder(row);
        setActiveTab('details');
        toast({
          title: 'View Sales Order',
          description: `Opening ${row.orderNumber}`,
        });
      },
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: SalesOrder) => {
        toast({
          title: 'Edit Sales Order',
          description: `Editing ${row.orderNumber}`,
        });
      },
      variant: 'ghost',
      condition: (row: SalesOrder) => row.status === 'Draft'
    },
    {
      label: 'Ship',
      icon: <Truck className="h-4 w-4" />,
      onClick: (row: SalesOrder) => {
        toast({
          title: 'Ship Order',
          description: `Shipping ${row.orderNumber}`,
        });
      },
      variant: 'ghost',
      condition: (row: SalesOrder) => row.status === 'Confirmed'
    }
  ];

  const lineColumns: EnhancedColumn[] = [
    { key: 'lineNumber', header: 'Line', sortable: true },
    { key: 'product', header: 'Product', searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { 
      key: 'unitPrice', 
      header: 'Unit Price',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'totalPrice', 
      header: 'Total Price',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/sales')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Sales Orders"
          description="Create, track, and manage sales orders from quotation to delivery"
          voiceIntroduction="Welcome to Sales Orders Management for comprehensive order fulfillment tracking."
        />
      </div>

      <VoiceTrainingComponent 
        module="sales"
        topic="Sales Order Management"
        examples={[
          "Creating sales orders from approved quotations with customer master data integration and pricing determination",
          "Managing order fulfillment process with inventory allocation, shipping coordination, and delivery tracking",
          "Processing order changes and amendments with proper approval workflows and customer communication"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{salesOrders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-sm text-blue-600">This month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {salesOrders.filter(so => so.status === 'Confirmed').length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed Orders</div>
            <div className="text-sm text-green-600">Ready to ship</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {salesOrders.filter(so => so.priority === 'Urgent').length}
            </div>
            <div className="text-sm text-muted-foreground">Urgent Orders</div>
            <div className="text-sm text-red-600">High priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${salesOrders.reduce((sum, so) => sum + so.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-purple-600">Outstanding</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="create">Create Order</TabsTrigger>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Sales Orders
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={salesOrders}
                actions={actions}
                searchPlaceholder="Search sales orders..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Sales Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acme">Acme Corporation</SelectItem>
                      <SelectItem value="tech">TechSolutions Inc</SelectItem>
                      <SelectItem value="global">Global Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerPO">Customer PO</Label>
                  <Input id="customerPO" placeholder="Enter customer PO number" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input id="orderDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input id="deliveryDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salesRep">Sales Representative</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales rep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net45">Net 45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Create Order</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedOrder ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Order Details: {selectedOrder.orderNumber}
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div><strong>Customer:</strong> {selectedOrder.customer}</div>
                      <div><strong>Customer PO:</strong> {selectedOrder.customerPO}</div>
                      <div><strong>Order Date:</strong> {selectedOrder.orderDate}</div>
                      <div><strong>Delivery Date:</strong> {selectedOrder.deliveryDate}</div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Sales Rep:</strong> {selectedOrder.salesRep}</div>
                      <div><strong>Payment Terms:</strong> {selectedOrder.paymentTerms}</div>
                      <div><strong>Total Amount:</strong> {selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()}</div>
                      <div><strong>Priority:</strong> 
                        <Badge className={`ml-2 ${getPriorityColor(selectedOrder.priority)}`}>
                          {selectedOrder.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Lines</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedDataTable 
                    columns={lineColumns}
                    data={orderLines}
                    searchPlaceholder="Search order lines..."
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Select an order from the Orders tab to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Draft', 'Confirmed', 'In Progress', 'Delivered', 'Invoiced', 'Completed'].map((status) => {
                    const count = salesOrders.filter(order => order.status === status).length;
                    const percentage = (count / salesOrders.length) * 100;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span>{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Urgent', 'High', 'Medium', 'Low'].map((priority) => {
                    const orders = salesOrders.filter(order => order.priority === priority);
                    const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
                    return (
                      <div key={priority} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{priority} Priority</span>
                          <p className="text-sm text-muted-foreground">{orders.length} orders</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${totalValue.toLocaleString()}</div>
                          <Badge className={getPriorityColor(priority)}>
                            {priority}
                          </Badge>
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
    </div>
  );
};

export default SalesOrders;
