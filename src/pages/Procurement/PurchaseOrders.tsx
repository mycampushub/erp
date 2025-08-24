
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Edit, Eye, FileText, Truck, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  description: string;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Approved' | 'Sent' | 'Delivered' | 'Invoiced' | 'Paid';
  orderDate: string;
  deliveryDate: string;
  items: number;
  department: string;
}

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Purchase Orders Management. Create, track, and manage purchase orders throughout their lifecycle from creation to payment.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const sampleOrders: PurchaseOrder[] = [
      {
        id: 'po-001',
        poNumber: 'PO-2025-001',
        supplier: 'Dell Technologies',
        description: 'Laptop computers for IT department',
        totalAmount: 15000.00,
        currency: 'USD',
        status: 'Approved',
        orderDate: '2025-01-20',
        deliveryDate: '2025-02-15',
        items: 10,
        department: 'IT'
      },
      {
        id: 'po-002',
        poNumber: 'PO-2025-002',
        supplier: 'Office Depot',
        description: 'Office supplies and stationery',
        totalAmount: 850.00,
        currency: 'USD',
        status: 'Delivered',
        orderDate: '2025-01-15',
        deliveryDate: '2025-01-25',
        items: 25,
        department: 'Administration'
      }
    ];
    setPurchaseOrders(sampleOrders);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Sent': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Invoiced': 'bg-purple-100 text-purple-800',
      'Paid': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'poNumber', header: 'PO Number', sortable: true, searchable: true },
    { key: 'supplier', header: 'Supplier', searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      sortable: true,
      render: (value: number, row: PurchaseOrder) => `${row.currency} ${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Sent', value: 'Sent' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Invoiced', value: 'Invoiced' },
        { label: 'Paid', value: 'Paid' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'orderDate', header: 'Order Date', sortable: true },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: PurchaseOrder) => {
        toast({
          title: 'View Purchase Order',
          description: `Opening ${row.poNumber}`,
        });
      },
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: PurchaseOrder) => {
        toast({
          title: 'Edit Purchase Order',
          description: `Editing ${row.poNumber}`,
        });
      },
      variant: 'ghost'
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
          title="Purchase Orders"
          description="Create, track, and manage purchase orders throughout their lifecycle"
          voiceIntroduction="Welcome to Purchase Orders Management for comprehensive order lifecycle management."
        />
      </div>

      <VoiceTrainingComponent 
        module="Purchase Orders"
        topic="Purchase Order Management"
        examples={[
          "Creating purchase orders from approved requisitions with supplier selection and delivery scheduling",
          "Tracking order status from creation through delivery with automated notifications and approvals",
          "Managing three-way matching between purchase orders, goods receipts, and invoices for accurate payments"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-sm text-blue-600">This month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'Approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Delivery</div>
            <div className="text-sm text-orange-600">In progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'Delivered').length}
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-sm text-green-600">Ready for invoicing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-purple-600">Outstanding</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Purchase Orders
                <Button onClick={() => toast({ title: 'Create PO', description: 'Opening purchase order creation form' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create PO
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={purchaseOrders}
                actions={actions}
                searchPlaceholder="Search purchase orders..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrders.filter(po => ['Approved', 'Sent'].includes(po.status)).map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{order.poNumber}</h4>
                        <p className="text-sm text-muted-foreground">{order.supplier}</p>
                        <p className="text-sm">Expected: {order.deliveryDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Truck className="h-4 w-4 mr-2" />
                          Track Delivery
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Receipt
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
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Draft', 'Approved', 'Sent', 'Delivered', 'Invoiced', 'Paid'].map((status) => {
                    const count = purchaseOrders.filter(po => po.status === status).length;
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
                <CardTitle>Department Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['IT', 'Administration', 'Marketing', 'Operations'].map((dept) => {
                    const total = purchaseOrders
                      .filter(po => po.department === dept)
                      .reduce((sum, po) => sum + po.totalAmount, 0);
                    return (
                      <div key={dept} className="flex justify-between">
                        <span>{dept}</span>
                        <span className="font-medium">${total.toLocaleString()}</span>
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

export default PurchaseOrders;
