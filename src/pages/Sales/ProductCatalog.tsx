
import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/page/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Search, Filter, Plus, Edit, Trash2, Archive, Download, Upload, RefreshCw } from 'lucide-react';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';

interface Product {
  id: string;
  productCode: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  unit: string;
  taxCategory: string;
  supplier?: string;
  created?: string;
}

const STORAGE_KEY = 'sales_products';

const sampleProducts: Product[] = [
  { id: generateId('prod'), productCode: 'LAPTOP-001', name: 'Laptop Pro 15"', category: 'Hardware', description: 'High-performance laptop', price: 1500, currency: 'USD', stock: 50, status: 'Active', unit: 'Each', taxCategory: 'Standard', supplier: 'TechSupply Co', created: '2024-01-10' },
  { id: generateId('prod'), productCode: 'MON-001', name: 'Monitor 27" 4K', category: 'Hardware', description: '4K UHD monitor', price: 450, currency: 'USD', stock: 120, status: 'Active', unit: 'Each', taxCategory: 'Standard', supplier: 'TechSupply Co', created: '2024-02-15' },
  { id: generateId('prod'), productCode: 'MOUSE-001', name: 'Wireless Mouse', category: 'Accessories', description: 'Ergonomic wireless mouse', price: 25, currency: 'USD', stock: 500, status: 'Active', unit: 'Each', taxCategory: 'Reduced', supplier: 'Peripheral Plus', created: '2024-03-01' },
  { id: generateId('prod'), productCode: 'KEYB-001', name: 'Mechanical Keyboard', category: 'Accessories', description: 'RGB mechanical keyboard', price: 120, currency: 'USD', stock: 200, status: 'Active', unit: 'Each', taxCategory: 'Standard', supplier: 'Peripheral Plus', created: '2024-03-10' },
  { id: generateId('prod'), productCode: 'HEAD-001', name: 'Noise-Cancelling Headphones', category: 'Audio', description: 'Premium wireless headphones', price: 299, currency: 'USD', stock: 75, status: 'Active', unit: 'Each', taxCategory: 'Standard', supplier: 'AudioTech', created: '2024-04-05' },
];
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const ProductCatalog: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>(() => sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const loadData = () => {
    setIsLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Delete product ${product.name}?`)) {
      removeEntity(STORAGE_KEY, product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast({ title: 'Product Deleted', description: `${product.name} has been deleted.` });
    }
  };

  const handleSaveProduct = (data: Partial<Product>) => {
    if (isEditing && selectedProduct) {
      const updated = { ...selectedProduct, ...data };
      upsertEntity(STORAGE_KEY, updated as any);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
      toast({ title: 'Product Updated', description: 'Product has been updated.' });
    } else {
      const newProduct: Product = {
        id: generateId('prod'),
        productCode: data.productCode || `SKU-${String(products.length + 1).padStart(5, '0')}`,
        name: data.name || '',
        category: data.category || 'Hardware',
        description: data.description || '',
        price: data.price || 0,
        currency: 'USD',
        stock: data.stock || 0,
        status: data.status || 'Active',
        unit: data.unit || 'Each',
        taxCategory: data.taxCategory || 'Standard',
        supplier: data.supplier || '',
        created: new Date().toISOString().split('T')[0]
      };
      upsertEntity(STORAGE_KEY, newProduct as any);
      setProducts(prev => [...prev, newProduct]);
      toast({ title: 'Product Created', description: 'New product has been created.' });
    }
    setIsDialogOpen(false);
  };

  const handleImport = () => {
    toast({ title: 'Import Started', description: 'Product import wizard opened.' });
  };

  const handleExport = () => {
    const headers = ['Product Code', 'Name', 'Category', 'Price', 'Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p => [p.productCode, `"${p.name}"`, p.category, p.price, p.stock, p.status].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: `Exported ${filteredProducts.length} products.` });
  };

  const productColumns: EnhancedColumn[] = [
    { key: 'productCode', header: 'SKU', sortable: true },
    { key: 'name', header: 'Product Name', sortable: true, searchable: true },
    { key: 'category', header: 'Category', sortable: true },
    { 
      key: 'price', 
      header: 'Price',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'stock', 
      header: 'Stock',
      sortable: true,
      render: (value: number) => (
        <span className={value === 0 ? 'text-red-500 font-medium' : value < 10 ? 'text-amber-500 font-medium' : ''}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'Active' ? 'outline' : 
          value === 'Low Stock' ? 'secondary' : 
          'destructive'
        }>
          {value}
        </Badge>
      )
    }
  ];

  const productActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Product) => handleEditProduct(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Product) => handleDeleteProduct(row),
      variant: 'ghost'
    }
  ];

  const categories = [...new Set(products.map(p => p.category))];

  const productMetrics = [
    { title: 'Total Products', value: products.length },
    { title: 'In Stock', value: products.filter(p => p.stock > 0).length },
    { title: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock < 10).length },
    { title: 'Out of Stock', value: products.filter(p => p.stock === 0).length }
  ];

  return (
    <div className="container mx-auto p-6">
      <PageHeader 
        title="Product Catalog" 
        description="Manage your products and services catalog"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <Button onClick={handleCreateProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {productMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center w-full max-w-md relative">
                <Search className="h-4 w-4 absolute left-3 text-gray-400" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <EnhancedDataTable 
                columns={productColumns}
                data={filteredProducts}
                actions={productActions}
                className="border rounded-md"
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            )}

            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-muted-foreground">
                    {products.filter(p => p.category === category).length} items
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pricing Management</h3>
            <p className="text-muted-foreground mb-4">
              Manage pricing through Price Lists and Conditions in Pricing Management module.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/sales/pricing'}>
              Go to Pricing Management
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={selectedProduct}
            onSave={handleSaveProduct}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductForm: React.FC<{
  product: Product | null;
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
}> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    productCode: product?.productCode || '',
    name: product?.name || '',
    category: product?.category || 'Hardware',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    status: product?.status || 'Active' as const,
    unit: product?.unit || 'Each',
    taxCategory: product?.taxCategory || 'Standard',
    supplier: product?.supplier || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product Code (SKU)</Label>
          <Input 
            value={formData.productCode}
            onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Product Name</Label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Price</Label>
          <Input 
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input 
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Each">Each</SelectItem>
              <SelectItem value="Pack">Pack</SelectItem>
              <SelectItem value="Box">Box</SelectItem>
              <SelectItem value="License">License</SelectItem>
              <SelectItem value="Hour">Hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Supplier</Label>
          <Input 
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{product ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default ProductCatalog;
