import { generateId } from './localCrud';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Blocked';
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  currency: string;
  totalOrders: number;
  totalValue: number;
  onTimeDelivery: number;
  qualityRating: number;
  certifications: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  establishedDate: string;
  website: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierId: string;
  supplierContact: string;
  description: string;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Approved' | 'Sent' | 'Partially Received' | 'Delivered' | 'Invoiced' | 'Paid' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  orderDate: string;
  deliveryDate: string;
  requestedBy: string;
  approvedBy?: string;
  items: number;
  department: string;
  paymentTerms: string;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POLine {
  id: string;
  poId: string;
  lineNumber: number;
  material: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  status: 'Open' | 'Confirmed' | 'Delivered' | 'Invoiced';
  receivedQuantity: number;
  unit: string;
  uom: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  description: string;
  requestor: string;
  department: string;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Converted';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  requestDate: string;
  requiredDate: string;
  approver: string;
  items: number;
  notes?: string;
  createdAt: string;
}

export interface RequisitionLine {
  id: string;
  prId: string;
  lineNumber: number;
  material: string;
  description: string;
  quantity: number;
  estimatedPrice: number;
  totalPrice: number;
  deliveryDate: string;
  unit: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  supplier: string;
  supplierId: string;
  title: string;
  type: 'Service' | 'Supply' | 'Framework' | 'Maintenance';
  status: 'Active' | 'Expired' | 'Pending' | 'Draft';
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  renewalOption: boolean;
  renewalDate?: string;
  owner: string;
  terms: string;
  createdAt: string;
}

export interface ContractLine {
  id: string;
  contractId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliverySchedule: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  category: string;
  status: 'Draft' | 'Published' | 'Response Period' | 'Evaluation' | 'Awarded' | 'Cancelled';
  publishDate: string;
  responseDeadline: string;
  totalValue: number;
  currency: string;
  suppliersInvited: number;
  responsesReceived: number;
  creator: string;
  evaluationCriteria: string;
  createdAt: string;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  supplierName: string;
  supplierId: string;
  submittedDate: string;
  totalPrice: number;
  deliveryTime: number;
  paymentTerms: string;
  remarks: string;
  status: 'Submitted' | 'Under Evaluation' | 'Accepted' | 'Rejected';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  supplierId: string;
  poNumber: string;
  poId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  status: 'Pending' | 'Matched' | 'Blocked' | 'Approved' | 'Paid' | 'Rejected';
  matchingStatus: 'Not Matched' | 'Partially Matched' | 'Fully Matched' | 'Variances Found';
  paymentTerms: string;
  processor: string;
  discrepancies: string[];
  lineItems: InvoiceLine[];
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  poLineId?: string;
}

export interface CatalogItem {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  supplier: string;
  supplierId: string;
  unitPrice: number;
  currency: string;
  uom: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  lastUpdated: string;
  specifications: string;
  minOrderQty: number;
  leadTime: number;
}

export interface SourceList {
  id: string;
  materialCode: string;
  materialDescription: string;
  category: string;
  preferredSuppliers: string[];
  alternativeSuppliers: string[];
  lastUpdated: string;
  status: 'Active' | 'Inactive' | 'Under Review';
  leadTime: number;
  minOrderQty: number;
  priceValidity: string;
  evaluationCriteria: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poNumber: string;
  poId: string;
  supplier: string;
  supplierId: string;
  materialCode: string;
  materialDescription: string;
  orderedQty: number;
  receivedQty: number;
  uom: string;
  status: 'Pending' | 'Partial' | 'Complete' | 'Over-received' | 'Damaged';
  receivedDate: string;
  receiver: string;
  storageLocation: string;
  qualityStatus: 'Passed' | 'Failed' | 'Pending' | 'Not Required';
  notes?: string;
}

export interface Auction {
  id: string;
  auctionNumber: string;
  title: string;
  category: string;
  type: 'Reverse Auction' | 'Forward Auction' | 'Dutch Auction' | 'Sealed Bid';
  status: 'Draft' | 'Published' | 'Live' | 'Closed' | 'Awarded' | 'Cancelled';
  startTime: string;
  endTime: string;
  estimatedValue: number;
  currency: string;
  participantsInvited: number;
  activeBidders: number;
  totalBids: number;
  currentLeader: string;
  currentBestBid: number;
  savingsRealized: number;
  description: string;
  requirements: string;
}

const supplierNames = [
  'Dell Technologies', 'HP Inc.', 'Lenovo Group', 'ASUSTek', 'Acer Inc.',
  'Office Depot', 'Staples Inc.', 'Amazon Business', 'Grainger', 'Uline',
  'Siemens AG', 'GE Healthcare', '3M Company', 'Honeywell', 'ABB Ltd',
  'Caterpillar Inc.', 'John Deere', 'Bosch Rexroth', 'Schneider Electric', 'Emerson',
  'SAP SE', 'Oracle Corp', 'Microsoft Corp', 'Salesforce', 'ServiceNow',
  'FedEx', 'UPS', 'DHL', 'Kuehne+Nagel', 'DB Schenker'
];

const categories = [
  'IT Equipment', 'Office Supplies', 'Industrial Equipment', 'Medical Supplies',
  'Raw Materials', 'Services', 'Logistics', 'Software', 'Hardware', 'Maintenance'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'San Francisco', 'Seattle', 'Boston', 'Atlanta', 'Denver',
  'London', 'Paris', 'Berlin', 'Tokyo', 'Singapore'
];

const departments = ['IT', 'Administration', 'Manufacturing', 'Finance', 'Sales', 'Marketing', 'Operations', 'HR'];

const materials = [
  { code: 'LAP-001', name: 'Business Laptop 15"', category: 'IT Equipment' },
  { code: 'LAP-002', name: 'Ultrabook 13"', category: 'IT Equipment' },
  { code: 'DES-001', name: 'Desktop Computer', category: 'IT Equipment' },
  { code: 'MON-001', name: '24" LED Monitor', category: 'IT Equipment' },
  { code: 'PRN-001', name: 'Laser Printer', category: 'IT Equipment' },
  { code: 'NET-001', name: 'Network Switch 24-Port', category: 'IT Equipment' },
  { code: 'SRV-001', name: 'Server Rack Mount', category: 'IT Equipment' },
  { code: 'OFF-001', name: 'Office Desk', category: 'Furniture' },
  { code: 'OFF-002', name: 'Ergonomic Chair', category: 'Furniture' },
  { code: 'OFF-003', name: 'Filing Cabinet', category: 'Furniture' },
  { code: 'SUP-001', name: 'Printer Paper (Box)', category: 'Office Supplies' },
  { code: 'SUP-002', name: 'Ink Cartridge', category: 'Office Supplies' },
  { code: 'SUP-003', name: 'Ballpoint Pens (Box)', category: 'Office Supplies' },
  { code: 'IND-001', name: 'Industrial Pump', category: 'Industrial Equipment' },
  { code: 'IND-002', name: 'Conveyor Belt', category: 'Industrial Equipment' },
  { code: 'MRO-001', name: 'Safety Gloves (Box)', category: 'Maintenance' },
  { code: 'MRO-002', name: 'Lubricant Oil', category: 'Maintenance' },
  { code: 'RAW-001', name: 'Steel Sheets', category: 'Raw Materials' },
  { code: 'RAW-002', name: 'Aluminum Rods', category: 'Raw Materials' },
  { code: 'SFT-001', name: 'Enterprise License', category: 'Software' }
];

const contractTitles = [
  'IT Equipment Supply Agreement', 'Office Supplies Framework', 'Maintenance Services Contract',
  'Software Licensing Agreement', 'Logistics Services Framework', 'Industrial Parts Supply',
  'Medical Supplies Contract', 'Consulting Services Agreement', 'Facilities Management',
  'Security Services Contract', 'Catering Services Agreement', 'Equipment Leasing',
  'Data Center Services', 'Cloud Infrastructure', 'Professional Services'
];

const certifications = ['ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'CE Mark', 'UL Listed', 'Green Certified', 'Fair Trade'];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSuppliers(): Supplier[] {
  const suppliers: Supplier[] = [];
  
  for (let i = 0; i < 30; i++) {
    const name = supplierNames[i % supplierNames.length];
    const status: Supplier['status'] = i < 22 ? 'Active' : i < 26 ? 'Pending' : 'Inactive';
    const riskLevel: Supplier['riskLevel'] = i < 20 ? 'Low' : i < 26 ? 'Medium' : 'High';
    
    suppliers.push({
      id: generateId('sup'),
      name: i >= supplierNames.length ? `${name} Branch ${Math.floor(i / supplierNames.length) + 1}` : name,
      category: randomElement(categories),
      status,
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      contactPerson: `Contact Person ${i + 1}`,
      email: `contact${i + 1}@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+1-555-${String(randomInt(1000, 9999))}`,
      address: `${randomInt(100, 9999)} ${randomElement(['Main', 'Oak', 'Elm', 'Park', 'Market'])} Street`,
      city: randomElement(cities),
      country: 'USA',
      taxId: `${randomInt(10, 99)}-${randomInt(100000000, 999999999)}`,
      paymentTerms: randomElement(['Net 15', 'Net 30', 'Net 45', 'Net 60']),
      currency: 'USD',
      totalOrders: randomInt(10, 500),
      totalValue: randomInt(50000, 2500000),
      onTimeDelivery: randomInt(80, 100),
      qualityRating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      certifications: randomElements(certifications, randomInt(1, 4)),
      riskLevel,
      establishedDate: randomDate(new Date(1990, 0, 1), new Date(2015, 11, 31)),
      website: `https://www.${name.toLowerCase().replace(/[^a-z]/g, '')}.com`
    });
  }
  
  return suppliers;
}

function generatePurchaseOrders(suppliers: Supplier[]): PurchaseOrder[] {
  const orders: PurchaseOrder[] = [];
  const statuses: PurchaseOrder['status'][] = ['Draft', 'Approved', 'Sent', 'Partially Received', 'Delivered', 'Invoiced', 'Paid'];
  const priorities: PurchaseOrder['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
  
  for (let i = 0; i < 30; i++) {
    const supplier = randomElement(suppliers);
    const status = statuses[i % statuses.length];
    const orderDate = randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30));
    const totalAmount = randomInt(1000, 250000);
    
    orders.push({
      id: generateId('po'),
      poNumber: `PO-2025-${String(i + 1).padStart(3, '0')}`,
      supplier: supplier.name,
      supplierId: supplier.id,
      supplierContact: supplier.email,
      description: `Purchase order for ${randomElement(materials).name}`,
      totalAmount,
      currency: 'USD',
      status,
      priority: randomElement(priorities),
      orderDate,
      deliveryDate: randomDate(new Date(orderDate), new Date(2025, 11, 31)),
      requestedBy: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown', 'Emily Davis', 'Robert Chen']),
      approvedBy: status !== 'Draft' ? randomElement(['Manager', 'Director', 'VP']) : undefined,
      items: randomInt(1, 20),
      department: randomElement(departments),
      paymentTerms: supplier.paymentTerms,
      deliveryAddress: `${randomInt(100, 9999)} Business Ave, ${randomElement(cities)}, USA`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return orders;
}

function generatePOLines(orders: PurchaseOrder[]): POLine[] {
  const lines: POLine[] = [];
  
  orders.forEach(order => {
    const lineCount = Math.min(order.items, randomInt(1, 5));
    for (let i = 0; i < lineCount; i++) {
      const material = randomElement(materials);
      const quantity = randomInt(1, 100);
      const unitPrice = randomInt(10, 5000);
      
      lines.push({
        id: generateId('line'),
        poId: order.id,
        lineNumber: (i + 1) * 10,
        material: material.code,
        description: material.name,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        deliveryDate: order.deliveryDate,
        status: order.status === 'Delivered' ? 'Delivered' : order.status === 'Invoiced' ? 'Invoiced' : 'Open',
        receivedQuantity: order.status === 'Delivered' || order.status === 'Invoiced' || order.status === 'Paid' ? quantity : 0,
        unit: 'EA',
        uom: 'Each'
      });
    }
  });
  
  return lines;
}

function generatePurchaseRequisitions(): PurchaseRequisition[] {
  const requisitions: PurchaseRequisition[] = [];
  const statuses: PurchaseRequisition['status'][] = ['Draft', 'Pending', 'Approved', 'Rejected', 'Converted'];
  const priorities: PurchaseRequisition['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
  
  for (let i = 0; i < 30; i++) {
    const status = statuses[i % statuses.length];
    
    requisitions.push({
      id: generateId('pr'),
      prNumber: `PR-2025-${String(i + 1).padStart(3, '0')}`,
      description: `Requisition for ${randomElement(materials).name}`,
      requestor: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown', 'Emily Davis', 'Robert Chen']),
      department: randomElement(departments),
      totalAmount: randomInt(500, 100000),
      currency: 'USD',
      status,
      priority: randomElement(priorities),
      requestDate: randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30)),
      requiredDate: randomDate(new Date(2025, 6, 1), new Date(2025, 11, 31)),
      approver: randomElement(['Manager', 'Director', 'VP']),
      items: randomInt(1, 15),
      createdAt: new Date().toISOString()
    });
  }
  
  return requisitions;
}

function generateContracts(suppliers: Supplier[]): Contract[] {
  const contracts: Contract[] = [];
  const types: Contract['type'][] = ['Service', 'Supply', 'Framework', 'Maintenance'];
  const statuses: Contract['status'][] = ['Active', 'Expired', 'Pending', 'Draft'];
  
  for (let i = 0; i < 30; i++) {
    const supplier = randomElement(suppliers);
    const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
    const status = statuses[i % statuses.length];
    
    contracts.push({
      id: generateId('ct'),
      contractNumber: `CT-2025-${String(i + 1).padStart(3, '0')}`,
      supplier: supplier.name,
      supplierId: supplier.id,
      title: randomElement(contractTitles),
      type: types[i % types.length],
      status,
      startDate,
      endDate: randomDate(new Date(startDate), new Date(2026, 11, 31)),
      value: randomInt(10000, 1000000),
      currency: 'USD',
      renewalOption: Math.random() > 0.3,
      owner: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown']),
      terms: 'Standard terms and conditions apply',
      createdAt: new Date().toISOString()
    });
  }
  
  return contracts;
}

function generateRFQs(): RFQ[] {
  const rfqs: RFQ[] = [];
  const statuses: RFQ['status'][] = ['Draft', 'Published', 'Response Period', 'Evaluation', 'Awarded', 'Cancelled'];
  
  for (let i = 0; i < 30; i++) {
    const status = statuses[i % statuses.length];
    
    rfqs.push({
      id: generateId('rfq'),
      rfqNumber: `RFQ-2025-${String(i + 1).padStart(3, '0')}`,
      title: `Request for Quotation - ${randomElement(materials).name}`,
      description: `Competitive bidding for procurement of ${randomElement(materials).name}`,
      category: randomElement(categories),
      status,
      publishDate: randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30)),
      responseDeadline: randomDate(new Date(2025, 6, 1), new Date(2025, 11, 31)),
      totalValue: randomInt(10000, 500000),
      currency: 'USD',
      suppliersInvited: randomInt(3, 15),
      responsesReceived: randomInt(0, 10),
      creator: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown']),
      evaluationCriteria: 'Price, Quality, Delivery, Service',
      createdAt: new Date().toISOString()
    });
  }
  
  return rfqs;
}

function generateInvoices(orders: PurchaseOrder[]): Invoice[] {
  const invoices: Invoice[] = [];
  const statuses: Invoice['status'][] = ['Pending', 'Matched', 'Blocked', 'Approved', 'Paid', 'Rejected'];
  const matchingStatuses: Invoice['matchingStatus'][] = ['Not Matched', 'Partially Matched', 'Fully Matched', 'Variances Found'];
  
  for (let i = 0; i < 30; i++) {
    const order = randomElement(orders.filter(o => o.status === 'Delivered' || o.status === 'Invoiced'));
    const status = statuses[i % statuses.length];
    const matchingStatus = status === 'Matched' || status === 'Approved' || status === 'Paid' ? 'Fully Matched' : randomElement(matchingStatuses);
    const invoiceDate = randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30));
    
    invoices.push({
      id: generateId('inv'),
      invoiceNumber: `INV-2025-${String(i + 1).padStart(4, '0')}`,
      supplier: order.supplier,
      supplierId: order.supplierId,
      poNumber: order.poNumber,
      poId: order.id,
      invoiceDate,
      dueDate: randomDate(new Date(invoiceDate), new Date(2025, 11, 31)),
      totalAmount: order.totalAmount * (0.9 + Math.random() * 0.2),
      currency: 'USD',
      status,
      matchingStatus,
      paymentTerms: order.paymentTerms,
      processor: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown']),
      discrepancies: matchingStatus === 'Variances Found' ? ['Price variance detected', 'Quantity discrepancy'] : [],
      lineItems: [],
      createdAt: new Date().toISOString()
    });
  }
  
  return invoices;
}

function generateCatalogItems(suppliers: Supplier[]): CatalogItem[] {
  const items: CatalogItem[] = [];
  const statuses: CatalogItem['status'][] = ['Active', 'Inactive', 'Discontinued'];
  
  for (let i = 0; i < 30; i++) {
    const supplier = randomElement(suppliers);
    const material = materials[i % materials.length];
    
    items.push({
      id: generateId('cat'),
      itemCode: `${material.code}-${String(i + 1).padStart(3, '0')}`,
      description: material.name,
      category: material.category,
      supplier: supplier.name,
      supplierId: supplier.id,
      unitPrice: randomInt(10, 10000),
      currency: 'USD',
      uom: 'Each',
      status: statuses[i % statuses.length],
      lastUpdated: randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30)),
      specifications: `Standard specifications for ${material.name}`,
      minOrderQty: randomInt(1, 100),
      leadTime: randomInt(1, 30)
    });
  }
  
  return items;
}

function generateSourceLists(): SourceList[] {
  const lists: SourceList[] = [];
  const statuses: SourceList['status'][] = ['Active', 'Inactive', 'Under Review'];
  
  for (let i = 0; i < 30; i++) {
    const material = materials[i % materials.length];
    
    lists.push({
      id: generateId('sl'),
      materialCode: material.code,
      materialDescription: material.name,
      category: material.category,
      preferredSuppliers: randomElements(supplierNames, randomInt(2, 5)),
      alternativeSuppliers: randomElements(supplierNames, randomInt(1, 3)),
      lastUpdated: randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30)),
      status: statuses[i % statuses.length],
      leadTime: randomInt(3, 45),
      minOrderQty: randomInt(1, 50),
      priceValidity: '2025-12-31',
      evaluationCriteria: 'Price, Quality, Delivery, Service'
    });
  }
  
  return lists;
}

function generateGoodsReceipts(orders: PurchaseOrder[]): GoodsReceipt[] {
  const receipts: GoodsReceipt[] = [];
  const statuses: GoodsReceipt['status'][] = ['Pending', 'Partial', 'Complete', 'Over-received', 'Damaged'];
  const qualityStatuses: GoodsReceipt['qualityStatus'][] = ['Passed', 'Failed', 'Pending', 'Not Required'];
  
  for (let i = 0; i < 30; i++) {
    const order = randomElement(orders.filter(o => o.status !== 'Draft'));
    const status = statuses[i % statuses.length];
    const orderedQty = randomInt(10, 200);
    const receivedQty = status === 'Complete' ? orderedQty : status === 'Partial' ? randomInt(1, orderedQty - 1) : 0;
    const material = randomElement(materials);
    
    receipts.push({
      id: generateId('gr'),
      receiptNumber: `GR-2025-${String(i + 1).padStart(4, '0')}`,
      poNumber: order.poNumber,
      poId: order.id,
      supplier: order.supplier,
      supplierId: order.supplierId,
      materialCode: material.code,
      materialDescription: material.name,
      orderedQty,
      receivedQty,
      uom: 'Each',
      status,
      receivedDate: randomDate(new Date(2025, 0, 1), new Date(2025, 5, 30)),
      receiver: randomElement(['John Smith', 'Sarah Wilson', 'Mike Brown']),
      storageLocation: `WH-${String.fromCharCode(65 + randomInt(0, 5))}-${String(randomInt(100, 999))}`,
      qualityStatus: status === 'Pending' ? 'Pending' : randomElement(qualityStatuses)
    });
  }
  
  return receipts;
}

function generateAuctions(): Auction[] {
  const auctions: Auction[] = [];
  const types: Auction['type'][] = ['Reverse Auction', 'Forward Auction', 'Dutch Auction', 'Sealed Bid'];
  const statuses: Auction['status'][] = ['Draft', 'Published', 'Live', 'Closed', 'Awarded', 'Cancelled'];
  
  for (let i = 0; i < 30; i++) {
    const status = statuses[i % statuses.length];
    const estimatedValue = randomInt(10000, 500000);
    
    auctions.push({
      id: generateId('auc'),
      auctionNumber: `AUC-2025-${String(i + 1).padStart(3, '0')}`,
      title: `${randomElement(types)} - ${randomElement(materials).name}`,
      category: randomElement(categories),
      type: types[i % types.length],
      status,
      startTime: new Date(randomInt(2025, 2025), randomInt(0, 11), randomInt(1, 28)).toISOString(),
      endTime: new Date(randomInt(2025, 2025), randomInt(0, 11), randomInt(1, 28)).toISOString(),
      estimatedValue,
      currency: 'USD',
      participantsInvited: randomInt(5, 20),
      activeBidders: status === 'Live' ? randomInt(3, 10) : 0,
      totalBids: randomInt(5, 50),
      currentLeader: randomElement(supplierNames),
      currentBestBid: estimatedValue * (0.8 + Math.random() * 0.2),
      savingsRealized: status === 'Closed' || status === 'Awarded' ? estimatedValue * 0.1 : 0,
      description: `Auction for procurement of ${randomElement(materials).name}`,
      requirements: 'Standard terms and conditions apply'
    });
  }
  
  return auctions;
}

export function seedProcurementData() {
  const suppliers = generateSuppliers();
  const purchaseOrders = generatePurchaseOrders(suppliers);
  const poLines = generatePOLines(purchaseOrders);
  const requisitions = generatePurchaseRequisitions();
  const contracts = generateContracts(suppliers);
  const rfqs = generateRFQs();
  const invoices = generateInvoices(purchaseOrders);
  const catalogItems = generateCatalogItems(suppliers);
  const sourceLists = generateSourceLists();
  const goodsReceipts = generateGoodsReceipts(purchaseOrders);
  const auctions = generateAuctions();

  return {
    suppliers,
    purchaseOrders,
    poLines,
    requisitions,
    contracts,
    rfqs,
    invoices,
    catalogItems,
    sourceLists,
    goodsReceipts,
    auctions
  };
}

let procurementCache: Awaited<ReturnType<typeof seedProcurementData>> | null = null;

export function getProcurementData() {
  if (!procurementCache) {
    procurementCache = seedProcurementData();
  }
  return procurementCache;
}

export function clearProcurementData() {
  procurementCache = null;
}
