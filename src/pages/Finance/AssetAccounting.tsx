import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { ArrowLeft, Plus, Package, TrendingDown, Calendar, DollarSign, Eye, Edit, Trash2, RefreshCw, Save, X, Check } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export interface FixedAsset {
  id: string;
  assetNumber: string;
  description: string;
  assetClass: string;
  assetType: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  acquisitionDate: string;
  usefulLife: number;
  salvageValue: number;
  acquisitionValue: number;
  depreciationMethod: 'Straight-Line' | 'Declining Balance' | 'Units of Production';
  depreciationRate: number;
  currentDepreciation: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  location: string;
  costCenter: string;
  responsiblePerson: string;
  status: 'Active' | 'Under Maintenance' | 'Fully Depreciated' | 'Retired' | 'Capitalized';
  createdAt: string;
}

export interface DepreciationSchedule {
  id: string;
  assetNumber: string;
  period: string;
  year: number;
  beginningValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingValue: number;
}

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const assetSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  assetClass: z.string().min(1, 'Asset class is required'),
  assetType: z.string().min(1, 'Asset type is required'),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  acquisitionDate: z.string().min(1, 'Acquisition date is required'),
  usefulLife: z.number().min(1, 'Useful life must be at least 1 year'),
  salvageValue: z.number().min(0, 'Salvage value must be non-negative'),
  acquisitionValue: z.number().min(0.01, 'Acquisition value must be positive'),
  depreciationMethod: z.enum(['Straight-Line', 'Declining Balance', 'Units of Production']),
  location: z.string().optional(),
  costCenter: z.string().optional(),
  responsiblePerson: z.string().optional(),
});

const calculateDepreciation = (asset: Partial<FixedAsset>): number => {
  if (!asset.acquisitionValue || !asset.usefulLife) return 0;
  
  switch (asset.depreciationMethod) {
    case 'Straight-Line':
      return (asset.acquisitionValue - (asset.salvageValue || 0)) / asset.usefulLife;
    case 'Declining Balance':
      const rate = (asset.depreciationRate || 100) / 100;
      return asset.acquisitionValue * rate / asset.usefulLife;
    case 'Units of Production':
      return (asset.acquisitionValue - (asset.salvageValue || 0)) * 0.1;
    default:
      return (asset.acquisitionValue - (asset.salvageValue || 0)) / asset.usefulLife;
  }
};

const seedAssets = (): FixedAsset[] => {
  const now = new Date().toISOString();
  const assets: FixedAsset[] = [
    { id: generateId('ast'), assetNumber: 'FA-2025-0001', description: 'Dell PowerEdge R750 Server', assetClass: 'IT Equipment', assetType: 'Server', serialNumber: 'DELL-2024-001', manufacturer: 'Dell Technologies', model: 'R750', acquisitionDate: '2024-01-15', usefulLife: 5, salvageValue: 5000, acquisitionValue: 45000, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 9000, accumulatedDepreciation: 9000, netBookValue: 31500, location: 'Data Center - Floor 1', costCenter: 'CC-3000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0002', description: 'Cisco Catalyst 9300 Switch', assetClass: 'IT Equipment', assetType: 'Network Switch', serialNumber: 'CISCO-2024-001', manufacturer: 'Cisco Systems', model: 'C9300-48P', acquisitionDate: '2024-02-01', usefulLife: 7, salvageValue: 3000, acquisitionValue: 28000, depreciationMethod: 'Straight-Line', depreciationRate: 14.29, currentDepreciation: 4000, accumulatedDepreciation: 4000, netBookValue: 21000, location: 'Network Room', costCenter: 'CC-3000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0003', description: 'HP LaserJet Enterprise Printer', assetClass: 'Office Equipment', assetType: 'Printer', serialNumber: 'HP-2024-001', manufacturer: 'HP Inc', model: 'M611', acquisitionDate: '2024-03-10', usefulLife: 5, salvageValue: 500, acquisitionValue: 5500, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 1100, accumulatedDepreciation: 1100, netBookValue: 3900, location: 'Office Floor 3', costCenter: 'CC-4000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0004', description: 'Toyota Camry 2024', assetClass: 'Vehicles', assetType: 'Automobile', serialNumber: 'TOY-2024-001', manufacturer: 'Toyota', model: 'Camry XSE', acquisitionDate: '2024-01-05', usefulLife: 5, salvageValue: 15000, acquisitionValue: 38000, depreciationMethod: 'Declining Balance', depreciationRate: 20, currentDepreciation: 7600, accumulatedDepreciation: 15200, netBookValue: 7800, location: 'Company Parking', costCenter: 'CC-1000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0005', description: 'Conference Room Audio System', assetClass: 'Office Equipment', assetType: 'Audio Equipment', serialNumber: 'BOS-2024-001', manufacturer: 'Bose', model: 'ProMedia', acquisitionDate: '2024-02-20', usefulLife: 7, salvageValue: 1000, acquisitionValue: 12500, depreciationMethod: 'Straight-Line', depreciationRate: 14.29, currentDepreciation: 1785, accumulatedDepreciation: 1785, netBookValue: 8715, location: 'Conference Room A', costCenter: 'CC-4000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0006', description: 'Herman Miller Aeron Chair', assetClass: 'Furniture', assetType: 'Chair', serialNumber: 'HM-2024-001', manufacturer: 'Herman Miller', model: 'Aeron', acquisitionDate: '2024-03-01', usefulLife: 10, salvageValue: 200, acquisitionValue: 1400, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 140, accumulatedDepreciation: 140, netBookValue: 1060, location: 'Executive Office', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0007', description: 'Manufacturing CNC Machine', assetClass: 'Machinery', assetType: 'CNC Machine', serialNumber: 'CNC-2024-001', manufacturer: 'Haas Automation', model: 'VF-2', acquisitionDate: '2023-06-15', usefulLife: 10, salvageValue: 25000, acquisitionValue: 185000, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 18500, accumulatedDepreciation: 30833, netBookValue: 123167, location: 'Manufacturing Plant', costCenter: 'CC-2000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0008', description: 'Forklift - Electric', assetClass: 'Vehicles', assetType: 'Material Handling', serialNumber: 'TOY-2024-002', manufacturer: 'Toyota', model: '8FGU25', acquisitionDate: '2023-09-01', usefulLife: 7, salvageValue: 8000, acquisitionValue: 32000, depreciationMethod: 'Straight-Line', depreciationRate: 14.29, currentDepreciation: 4571, accumulatedDepreciation: 13714, netBookValue: 8286, location: 'Warehouse', costCenter: 'CC-2000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0009', description: 'HVAC System - Main Building', assetClass: 'Buildings', assetType: 'HVAC', serialNumber: 'CAR-2024-001', manufacturer: 'Carrier', model: 'AQ1000', acquisitionDate: '2023-01-10', usefulLife: 20, salvageValue: 15000, acquisitionValue: 125000, depreciationMethod: 'Straight-Line', depreciationRate: 5, currentDepreciation: 6250, accumulatedDepreciation: 15625, netBookValue: 93375, location: 'Main Building', costCenter: 'CC-4000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0010', description: 'Video Conferencing System', assetClass: 'IT Equipment', assetType: 'Video Equipment', serialNumber: 'POL-2024-001', manufacturer: 'Poly', model: 'Studio X70', acquisitionDate: '2024-04-01', usefulLife: 5, salvageValue: 1500, acquisitionValue: 15000, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 3000, accumulatedDepreciation: 3000, netBookValue: 10500, location: 'Board Room', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0011', description: 'Security Camera System', assetClass: 'IT Equipment', assetType: 'Security', serialNumber: 'AXI-2024-001', manufacturer: 'Axis', model: 'P3245-V', acquisitionDate: '2024-02-15', usefulLife: 5, salvageValue: 800, acquisitionValue: 8500, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 1700, accumulatedDepreciation: 1700, netBookValue: 6000, location: 'Building Perimeter', costCenter: 'CC-4000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0012', description: 'Commercial Refrigerator', assetClass: 'Kitchen Equipment', assetType: 'Refrigeration', serialNumber: 'VIC-2024-001', manufacturer: 'Victory', model: 'VDRT-48-S', acquisitionDate: '2024-01-20', usefulLife: 15, salvageValue: 2000, acquisitionValue: 18000, depreciationMethod: 'Straight-Line', depreciationRate: 6.67, currentDepreciation: 1200, accumulatedDepreciation: 1200, netBookValue: 15800, location: 'Cafeteria Kitchen', costCenter: 'CC-4000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0013', description: 'Loading Dock Platform', assetClass: 'Buildings', assetType: 'Dock Equipment', serialNumber: 'DOC-2024-001', manufacturer: 'Blue Giant', model: 'BG-10', acquisitionDate: '2023-05-01', usefulLife: 15, salvageValue: 3000, acquisitionValue: 45000, depreciationMethod: 'Straight-Line', depreciationRate: 6.67, currentDepreciation: 3000, accumulatedDepreciation: 7500, netBookValue: 34500, location: 'Loading Dock', costCenter: 'CC-2000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0014', description: 'Electric Vehicle Charging Station', assetClass: 'Infrastructure', assetType: 'EV Charger', serialNumber: 'TES-2024-001', manufacturer: 'Tesla', model: 'Wall Connector', acquisitionDate: '2024-03-15', usefulLife: 10, salvageValue: 500, acquisitionValue: 6500, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 650, accumulatedDepreciation: 650, netBookValue: 5350, location: 'Parking Lot A', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0015', description: 'Server Rack Cabinet', assetClass: 'IT Equipment', assetType: 'Data Center', serialNumber: 'APC-2024-001', manufacturer: 'APC', model: 'NetShelter SX', acquisitionDate: '2024-01-10', usefulLife: 10, salvageValue: 800, acquisitionValue: 8500, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 850, accumulatedDepreciation: 850, netBookValue: 6650, location: 'Data Center', costCenter: 'CC-3000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0016', description: 'Fire Suppression System', assetClass: 'Buildings', assetType: 'Safety', serialNumber: 'TYC-2024-001', manufacturer: 'Tyco', model: 'ESFR-25', acquisitionDate: '2023-08-01', usefulLife: 20, salvageValue: 5000, acquisitionValue: 75000, depreciationMethod: 'Straight-Line', depreciationRate: 5, currentDepreciation: 3750, accumulatedDepreciation: 9375, netBookValue: 60625, location: 'Main Building', costCenter: 'CC-4000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0017', description: 'UPS Battery Backup', assetClass: 'IT Equipment', assetType: 'Power', serialNumber: 'EAT-2024-001', manufacturer: 'Eaton', model: '9PX100', acquisitionDate: '2024-02-01', usefulLife: 10, salvageValue: 1500, acquisitionValue: 22000, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 2200, accumulatedDepreciation: 2200, netBookValue: 17800, location: 'Server Room', costCenter: 'CC-3000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0018', description: 'Standing Desk - Executive', assetClass: 'Furniture', assetType: 'Desk', serialNumber: 'UPL-2024-001', manufacturer: 'Uplift', model: 'V2 Commercial', acquisitionDate: '2024-04-10', usefulLife: 10, salvageValue: 150, acquisitionValue: 2200, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 220, accumulatedDepreciation: 220, netBookValue: 1830, location: 'Executive Office', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0019', description: 'Industrial Air Compressor', assetClass: 'Machinery', assetType: 'Compressor', serialNumber: 'ING-2024-001', manufacturer: 'Ingersoll Rand', model: 'R-110', acquisitionDate: '2023-07-15', usefulLife: 15, salvageValue: 8000, acquisitionValue: 65000, depreciationMethod: 'Declining Balance', depreciationRate: 15, currentDepreciation: 9750, accumulatedDepreciation: 22750, netBookValue: 32250, location: 'Utility Room', costCenter: 'CC-2000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0020', description: 'Digital Signage Display', assetClass: 'IT Equipment', assetType: 'Display', serialNumber: 'SAM-2024-001', manufacturer: 'Samsung', model: 'QM98T', acquisitionDate: '2024-03-20', usefulLife: 7, salvageValue: 2500, acquisitionValue: 18000, depreciationMethod: 'Straight-Line', depreciationRate: 14.29, currentDepreciation: 2571, accumulatedDepreciation: 2571, netBookValue: 12929, location: 'Lobby', costCenter: 'CC-6000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0021', description: 'Copier/Scanner - High Volume', assetClass: 'Office Equipment', assetType: 'Copier', serialNumber: 'CAN-2024-001', manufacturer: 'Canon', model: 'imageRUNNER 6275', acquisitionDate: '2024-01-25', usefulLife: 5, salvageValue: 1500, acquisitionValue: 28000, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 5600, accumulatedDepreciation: 5600, netBookValue: 20900, location: 'Copy Room', costCenter: 'CC-4000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0022', description: 'Solar Panel Array - Roof', assetClass: 'Infrastructure', assetType: 'Solar', serialNumber: 'SUN-2024-001', manufacturer: 'SunPower', model: 'SPR-X22-370', acquisitionDate: '2024-02-10', usefulLife: 25, salvageValue: 10000, acquisitionValue: 95000, depreciationMethod: 'Straight-Line', depreciationRate: 4, currentDepreciation: 3800, accumulatedDepreciation: 3800, netBookValue: 87200, location: 'Roof - Building A', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0023', description: 'Warehouse Shelving System', assetClass: 'Furniture', assetType: 'Storage', serialNumber: 'PEN-2024-001', manufacturer: 'Penco', model: 'Velvetek', acquisitionDate: '2023-11-01', usefulLife: 20, salvageValue: 2000, acquisitionValue: 42000, depreciationMethod: 'Straight-Line', depreciationRate: 5, currentDepreciation: 2100, accumulatedDepreciation: 4200, netBookValue: 33800, location: 'Warehouse Section B', costCenter: 'CC-2000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0024', description: 'Network Security Appliance', assetClass: 'IT Equipment', assetType: 'Security Appliance', serialNumber: 'FOR-2024-001', manufacturer: 'Fortinet', model: 'FortiGate 600E', acquisitionDate: '2024-03-01', usefulLife: 5, salvageValue: 3000, acquisitionValue: 35000, depreciationMethod: 'Straight-Line', depreciationRate: 20, currentDepreciation: 7000, accumulatedDepreciation: 7000, netBookValue: 25000, location: 'Server Room', costCenter: 'CC-3000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0025', description: 'Lab Equipment - Spectrometer', assetClass: 'Lab Equipment', assetType: 'Scientific', serialNumber: 'THE-2024-001', manufacturer: 'Thermo Fisher', model: 'Nicolet iS50', acquisitionDate: '2024-01-15', usefulLife: 10, salvageValue: 25000, acquisitionValue: 185000, depreciationMethod: 'Straight-Line', depreciationRate: 10, currentDepreciation: 18500, accumulatedDepreciation: 18500, netBookValue: 141500, location: 'R&D Lab', costCenter: 'CC-5000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0026', description: 'Golf Cart - Electric', assetClass: 'Vehicles', assetType: 'Cart', serialNumber: 'EZO-2024-001', manufacturer: 'E-Z-GO', model: 'RXV', acquisitionDate: '2024-04-01', usefulLife: 7, salvageValue: 2000, acquisitionValue: 12000, depreciationMethod: 'Straight-Line', depreciationRate: 14.29, currentDepreciation: 1714, accumulatedDepreciation: 1714, netBookValue: 8286, location: 'Campus', costCenter: 'CC-4000', responsiblePerson: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0027', description: 'Building Access Control System', assetClass: 'IT Equipment', assetType: 'Security', serialNumber: 'HID-2024-001', manufacturer: 'HID Global', model: 'iCLASS SE R40', acquisitionDate: '2024-02-20', usefulLife: 8, salvageValue: 1500, acquisitionValue: 28000, depreciationMethod: 'Straight-Line', depreciationRate: 12.5, currentDepreciation: 3500, accumulatedDepreciation: 3500, netBookValue: 21000, location: 'All Entrances', costCenter: 'CC-4000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0028', description: 'Emergency Generator', assetClass: 'Buildings', assetType: 'Power Backup', serialNumber: 'CAT-2024-001', manufacturer: 'Caterpillar', model: 'C15-500', acquisitionDate: '2023-04-01', usefulLife: 20, salvageValue: 30000, acquisitionValue: 180000, depreciationMethod: 'Straight-Line', depreciationRate: 5, currentDepreciation: 9000, accumulatedDepreciation: 18000, netBookValue: 142000, location: 'Generator House', costCenter: 'CC-4000', responsiblePerson: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0029', description: 'Office Furniture Set - Executive', assetClass: 'Furniture', assetType: 'Furniture Set', serialNumber: 'KNL-2024-001', manufacturer: 'Knoll', model: 'Milan', acquisitionDate: '2024-03-15', usefulLife: 12, salvageValue: 800, acquisitionValue: 22000, depreciationMethod: 'Straight-Line', depreciationRate: 8.33, currentDepreciation: 1833, accumulatedDepreciation: 1833, netBookValue: 16367, location: 'Executive Suite', costCenter: 'CC-4000', responsiblePerson: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('ast'), assetNumber: 'FA-2025-0030', description: 'Production Robot Arm', assetClass: 'Machinery', assetType: 'Robotics', serialNumber: 'FAN-2024-001', manufacturer: 'FANUC', model: 'M-20iA', acquisitionDate: '2024-01-20', usefulLife: 15, salvageValue: 40000, acquisitionValue: 285000, depreciationMethod: 'Units of Production', depreciationRate: 10, currentDepreciation: 28500, accumulatedDepreciation: 28500, netBookValue: 216500, location: 'Assembly Line', costCenter: 'CC-2000', responsiblePerson: 'Mike Wilson', status: 'Active', createdAt: now },
  ];
  return assets;
};

const AssetAccounting: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState<FixedAsset[]>(() => seedAssets());
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const assetForm = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: { depreciationMethod: 'Straight-Line', usefulLife: 5, salvageValue: 0, acquisitionValue: 0 },
  });

  useEffect(() => {
    if (isEnabled) speak('Welcome to Asset Accounting. Manage fixed assets, depreciation, and asset lifecycle.');
  }, [isEnabled, speak]);

  const loadData = () => {
    setIsLoading(true);
    setAssets(seedAssets());
    setIsLoading(false);
  };

  const saveAssets = (data: FixedAsset[]) => {
    setAssets(data);
  };

  const onSubmitAsset = (data: z.infer<typeof assetSchema>) => {
    const depreciationRate = data.depreciationMethod === 'Straight-Line' ? (1 / data.usefulLife) * 100 : 20;
    const annualDepreciation = calculateDepreciation({ ...data, depreciationRate } as Partial<FixedAsset>);
    
    const newAsset: FixedAsset = {
      id: generateId('ast'),
      assetNumber: `FA-2025-${String(assets.length + 1).padStart(4, '0')}`,
      description: data.description || '',
      assetClass: data.assetClass,
      assetType: data.assetType,
      serialNumber: data.serialNumber || '',
      manufacturer: data.manufacturer || '',
      model: data.model || '',
      acquisitionDate: data.acquisitionDate,
      usefulLife: data.usefulLife,
      salvageValue: data.salvageValue,
      acquisitionValue: data.acquisitionValue,
      depreciationMethod: data.depreciationMethod,
      depreciationRate,
      currentDepreciation: annualDepreciation,
      accumulatedDepreciation: 0,
      netBookValue: data.acquisitionValue,
      location: data.location || '',
      costCenter: data.costCenter || '',
      responsiblePerson: data.responsiblePerson || '',
      status: 'Capitalized',
      createdAt: new Date().toISOString(),
    };
    saveAssets([...assets, newAsset]);
    toast({ title: 'Asset Created', description: `Asset ${newAsset.assetNumber} created successfully.` });
    setIsAssetDialogOpen(false);
    assetForm.reset();
  };

  const retireAsset = (asset: FixedAsset) => {
    saveAssets(assets.map(a => a.id === asset.id ? { ...a, status: 'Retired' as const } : a));
    toast({ title: 'Asset Retired', description: `Asset ${asset.assetNumber} has been retired.` });
  };

  const calculateTotalDepreciation = (asset: FixedAsset): number => {
    const annualDep = calculateDepreciation(asset);
    return annualDep;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800', 'Under Maintenance': 'bg-yellow-100 text-yellow-800',
      'Fully Depreciated': 'bg-gray-100 text-gray-800', 'Retired': 'bg-red-100 text-red-800',
      'Capitalized': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const assetColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'assetNumber', header: 'Asset #', sortable: true, searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'assetClass', header: 'Class', searchable: true },
    { key: 'manufacturer', header: 'Manufacturer', searchable: true },
    { key: 'acquisitionDate', header: 'Acquired', sortable: true },
    { key: 'acquisitionValue', header: 'Cost', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'accumulatedDepreciation', header: 'Accum Depr', render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'netBookValue', header: 'Net Book Value', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
  ];

  const assetActions: TableAction<Record<string, unknown>>[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row) => toast({ title: 'View Asset', description: `Viewing ${row.assetNumber}` }), variant: 'ghost' },
    { label: 'Retire', icon: <X className="h-4 w-4" />, onClick: (row) => { if (confirm('Retire this asset?')) retireAsset(row as unknown as FixedAsset); }, variant: 'ghost', condition: (row) => row.status === 'Active' },
  ];

  const summary = useMemo(() => {
    const totalCost = assets.reduce((sum, a) => sum + a.acquisitionValue, 0);
    const totalAccumDep = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
    const totalNBV = assets.reduce((sum, a) => sum + a.netBookValue, 0);
    const activeCount = assets.filter(a => a.status === 'Active').length;
    return { totalCost, totalAccumDep, totalNBV, activeCount };
  }, [assets]);

  const depreciationSchedule = useMemo(() => {
    const schedule: DepreciationSchedule[] = [];
    assets.forEach(asset => {
      let currentValue = asset.acquisitionValue;
      for (let year = 1; year <= asset.usefulLife; year++) {
        const depreciation = calculateDepreciation(asset);
        schedule.push({
          id: `${asset.assetNumber}-Y${year}`,
          assetNumber: asset.assetNumber,
          period: `Year ${year}`,
          year: 2024 + year,
          beginningValue: currentValue,
          depreciationExpense: depreciation,
          accumulatedDepreciation: asset.accumulatedDepreciation + (depreciation * year),
          endingValue: Math.max(currentValue - depreciation, asset.salvageValue),
        });
      }
    });
    return schedule.slice(0, 50);
  }, [assets]);

  if (isLoading) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-muted-foreground">Loading Asset Accounting data...</p></div></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/finance')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Asset Accounting" description="Manage fixed assets, depreciation methods, and asset lifecycle with comprehensive tracking" voiceIntroduction="Welcome to Asset Accounting module." />
      </div>

      <VoiceTrainingComponent module="finance" topic="Fixed Asset Management" examples={["Managing asset master data with classification, location, and responsible persons", "Calculating depreciation using straight-line, declining balance, and units of production methods", "Tracking asset lifecycle from acquisition to retirement including transfers and maintenance"]} detailLevel="advanced" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{assets.length}</div><div className="text-sm text-muted-foreground">Total Assets</div><div className="text-sm text-blue-600">{summary.activeCount} active</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${summary.totalCost.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Cost</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${summary.totalAccumDep.toLocaleString()}</div><div className="text-sm text-muted-foreground">Accumulated Depr</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${summary.totalNBV.toLocaleString()}</div><div className="text-sm text-muted-foreground">Net Book Value</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="assets">Assets</TabsTrigger><TabsTrigger value="depreciation">Depreciation Schedule</TabsTrigger><TabsTrigger value="reports">Asset Reports</TabsTrigger></TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Fixed Assets ({assets.length})</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Asset</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Create Fixed Asset</DialogTitle></DialogHeader>
                      <Form {...assetForm}>
                        <form onSubmit={assetForm.handleSubmit(onSubmitAsset)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={assetForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="assetClass" render={({ field }) => (<FormItem><FormLabel>Asset Class</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl><SelectContent><SelectItem value="IT Equipment">IT Equipment</SelectItem><SelectItem value="Office Equipment">Office Equipment</SelectItem><SelectItem value="Vehicles">Vehicles</SelectItem><SelectItem value="Furniture">Furniture</SelectItem><SelectItem value="Machinery">Machinery</SelectItem><SelectItem value="Buildings">Buildings</SelectItem><SelectItem value="Infrastructure">Infrastructure</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={assetForm.control} name="assetType" render={({ field }) => (<FormItem><FormLabel>Asset Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField control={assetForm.control} name="manufacturer" render={({ field }) => (<FormItem><FormLabel>Manufacturer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="acquisitionDate" render={({ field }) => (<FormItem><FormLabel>Acquisition Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField control={assetForm.control} name="acquisitionValue" render={({ field }) => (<FormItem><FormLabel>Acquisition Value</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="usefulLife" render={({ field }) => (<FormItem><FormLabel>Useful Life (Years)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="salvageValue" render={({ field }) => (<FormItem><FormLabel>Salvage Value</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={assetForm.control} name="depreciationMethod" render={({ field }) => (<FormItem><FormLabel>Depreciation Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Straight-Line">Straight-Line</SelectItem><SelectItem value="Declining Balance">Declining Balance</SelectItem><SelectItem value="Units of Production">Units of Production</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={assetForm.control} name="costCenter" render={({ field }) => (<FormItem><FormLabel>Cost Center</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select CC" /></SelectTrigger></FormControl><SelectContent><SelectItem value="CC-1000">CC-1000 - Sales</SelectItem><SelectItem value="CC-2000">CC-2000 - Production</SelectItem><SelectItem value="CC-3000">CC-3000 - IT</SelectItem><SelectItem value="CC-4000">CC-4000 - Admin</SelectItem><SelectItem value="CC-5000">CC-5000 - Finance</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={assetForm.control} name="responsiblePerson" render={({ field }) => (<FormItem><FormLabel>Responsible Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsAssetDialogOpen(false)}>Cancel</Button><Button type="submit">Create Asset</Button></div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={assetColumns} data={assets as unknown as Record<string, unknown>[]} actions={assetActions} searchPlaceholder="Search assets..." exportable={true} refreshable={true} onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Depreciation Schedule</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="py-2 text-left">Asset #</th><th className="py-2 text-left">Period</th><th className="py-2 text-right">Beginning Value</th><th className="py-2 text-right">Depreciation</th><th className="py-2 text-right">Accum Depr</th><th className="py-2 text-right">Ending Value</th></tr></thead>
                  <tbody>{depreciationSchedule.map(row => (<tr key={row.id} className="border-b hover:bg-gray-50"><td className="py-2">{row.assetNumber}</td><td className="py-2">{row.period}</td><td className="py-2 text-right">${row.beginningValue.toLocaleString()}</td><td className="py-2 text-right">${row.depreciationExpense.toLocaleString()}</td><td className="py-2 text-right">${row.accumulatedDepreciation.toLocaleString()}</td><td className="py-2 text-right">${row.endingValue.toLocaleString()}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Assets by Class</CardTitle></CardHeader>
              <CardContent>
                {['IT Equipment', 'Office Equipment', 'Vehicles', 'Furniture', 'Machinery', 'Buildings'].map(cls => {
                  const clsAssets = assets.filter(a => a.assetClass === cls);
                  const total = clsAssets.reduce((sum, a) => sum + a.acquisitionValue, 0);
                  return <div key={cls} className="flex justify-between py-2 border-b"><span>{cls} ({clsAssets.length})</span><span className="font-medium">${total.toLocaleString()}</span></div>;
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Assets by Status</CardTitle></CardHeader>
              <CardContent>
                {['Active', 'Under Maintenance', 'Fully Depreciated', 'Retired', 'Capitalized'].map(status => {
                  const count = assets.filter(a => a.status === status).length;
                  const total = assets.filter(a => a.status === status).reduce((sum, a) => sum + a.acquisitionValue, 0);
                  return <div key={status} className="flex justify-between py-2 border-b"><span>{status}</span><span className="font-medium">{count} (${total.toLocaleString()})</span></div>;
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetAccounting;
