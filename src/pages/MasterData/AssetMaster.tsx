
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Building2, Wrench } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Asset {
  id: string;
  assetNumber: string;
  description: string;
  assetClass: string;
  acquisitionValue: number;
  acquisitionDate: string;
  location: string;
  status: 'Active' | 'Retired' | 'Under Construction';
  depreciationMethod: string;
  usefulLife?: number;
  salvageValue?: number;
  accumulatedDepreciation?: number;
  netBookValue?: number;
  depreciationRate?: number;
  usefulLifeMonths?: number;
  costCenter?: string;
  plant?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  insurancePolicy?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

const defaultForm: Omit<Asset, 'id' | 'assetNumber'> = {
  description: '',
  assetClass: 'Machinery',
  acquisitionValue: 0,
  acquisitionDate: new Date().toISOString().split('T')[0],
  location: '',
  status: 'Active',
  depreciationMethod: 'Straight Line',
  usefulLife: 10,
};

const STORAGE_KEY = 'sap_assets';

const defaultAssets: Asset[] = [
  { id: '1', assetNumber: 'ASSET-001', description: 'Manufacturing Equipment A', assetClass: 'Machinery', acquisitionValue: 250000, acquisitionDate: '2023-01-15', location: 'Plant 1000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 10, salvageValue: 25000, accumulatedDepreciation: 67500, netBookValue: 182500, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-1000', plant: 'Plant 1000', serialNumber: 'MFG-2023-001', warrantyExpiry: '2028-01-15', insurancePolicy: 'INS-001', lastMaintenanceDate: '2025-02-01', nextMaintenanceDate: '2025-05-01' },
  { id: '2', assetNumber: 'ASSET-002', description: 'Office Building Main', assetClass: 'Building', acquisitionValue: 2500000, acquisitionDate: '2020-06-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 30, salvageValue: 250000, accumulatedDepreciation: 416666, netBookValue: 2083334, depreciationRate: 3.33, usefulLifeMonths: 360, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'BLD-2020-001', warrantyExpiry: '', insurancePolicy: 'INS-002', lastMaintenanceDate: '2025-01-15', nextMaintenanceDate: '2025-07-15' },
  { id: '3', assetNumber: 'ASSET-003', description: 'Delivery Vehicle Fleet', assetClass: 'Vehicle', acquisitionValue: 85000, acquisitionDate: '2024-03-10', location: 'Warehouse', status: 'Retired', depreciationMethod: 'Declining Balance', usefulLife: 5, salvageValue: 8500, accumulatedDepreciation: 76500, netBookValue: 8500, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-5000', plant: 'Plant 3000', serialNumber: 'VEH-2024-003', warrantyExpiry: '2026-03-10', insurancePolicy: 'INS-003', lastMaintenanceDate: '2024-12-01', nextMaintenanceDate: '' },
  { id: '4', assetNumber: 'ASSET-004', description: 'IT Server Cluster', assetClass: 'Equipment', acquisitionValue: 120000, acquisitionDate: '2024-01-20', location: 'Data Center', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 12000, accumulatedDepreciation: 24000, netBookValue: 96000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-3000', plant: 'Plant 1000', serialNumber: 'SRV-2024-001', warrantyExpiry: '2027-01-20', insurancePolicy: 'INS-004', lastMaintenanceDate: '2025-03-01', nextMaintenanceDate: '2025-04-01' },
  { id: '5', assetNumber: 'ASSET-005', description: 'CNC Machine Tool', assetClass: 'Machinery', acquisitionValue: 450000, acquisitionDate: '2022-08-15', location: 'Plant 2000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 15, salvageValue: 45000, accumulatedDepreciation: 75000, netBookValue: 375000, depreciationRate: 6.67, usefulLifeMonths: 180, costCenter: 'CC-1000', plant: 'Plant 2000', serialNumber: 'CNC-2022-005', warrantyExpiry: '2027-08-15', insurancePolicy: 'INS-005', lastMaintenanceDate: '2025-02-15', nextMaintenanceDate: '2025-05-15' },
  { id: '6', assetNumber: 'ASSET-006', description: 'Warehouse Rack System', assetClass: 'Equipment', acquisitionValue: 75000, acquisitionDate: '2023-05-20', location: 'Warehouse', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 10, salvageValue: 7500, accumulatedDepreciation: 15000, netBookValue: 60000, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-5000', plant: 'Plant 3000', serialNumber: 'RACK-2023-006', warrantyExpiry: '2028-05-20', insurancePolicy: 'INS-006', lastMaintenanceDate: '2025-01-10', nextMaintenanceDate: '2025-04-10' },
  { id: '7', assetNumber: 'ASSET-007', description: 'Hydraulic Press 100T', assetClass: 'Machinery', acquisitionValue: 180000, acquisitionDate: '2021-11-01', location: 'Plant 1000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 12, salvageValue: 18000, accumulatedDepreciation: 51000, netBookValue: 129000, depreciationRate: 8.33, usefulLifeMonths: 144, costCenter: 'CC-1000', plant: 'Plant 1000', serialNumber: 'PRESS-2021-007', warrantyExpiry: '2026-11-01', insurancePolicy: 'INS-007', lastMaintenanceDate: '2025-02-20', nextMaintenanceDate: '2025-05-20' },
  { id: '8', assetNumber: 'ASSET-008', description: 'Executive Vehicles', assetClass: 'Vehicle', acquisitionValue: 120000, acquisitionDate: '2024-02-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Declining Balance', usefulLife: 5, salvageValue: 24000, accumulatedDepreciation: 24000, netBookValue: 96000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'VEH-2024-008', warrantyExpiry: '2029-02-01', insurancePolicy: 'INS-008', lastMaintenanceDate: '2025-03-05', nextMaintenanceDate: '2025-04-05' },
  { id: '9', assetNumber: 'ASSET-009', description: 'Network Infrastructure', assetClass: 'IT Equipment', acquisitionValue: 95000, acquisitionDate: '2023-09-15', location: 'Data Center', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 9500, accumulatedDepreciation: 28500, netBookValue: 66500, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-3000', plant: 'Plant 1000', serialNumber: 'NET-2023-009', warrantyExpiry: '2026-09-15', insurancePolicy: 'INS-009', lastMaintenanceDate: '2025-02-10', nextMaintenanceDate: '2025-03-10' },
  { id: '10', assetNumber: 'ASSET-010', description: 'Forklift Fleet', assetClass: 'Vehicle', acquisitionValue: 65000, acquisitionDate: '2023-06-01', location: 'Warehouse', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 7, salvageValue: 6500, accumulatedDepreciation: 18571, netBookValue: 46429, depreciationRate: 14.29, usefulLifeMonths: 84, costCenter: 'CC-5000', plant: 'Plant 3000', serialNumber: 'FORK-2023-010', warrantyExpiry: '2026-06-01', insurancePolicy: 'INS-010', lastMaintenanceDate: '2025-01-25', nextMaintenanceDate: '2025-04-25' },
  { id: '11', assetNumber: 'ASSET-011', description: 'Welding Robot Cell', assetClass: 'Machinery', acquisitionValue: 320000, acquisitionDate: '2022-04-01', location: 'Plant 2000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 10, salvageValue: 32000, accumulatedDepreciation: 96000, netBookValue: 224000, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-2000', plant: 'Plant 2000', serialNumber: 'WELD-2022-011', warrantyExpiry: '2027-04-01', insurancePolicy: 'INS-011', lastMaintenanceDate: '2025-03-01', nextMaintenanceDate: '2025-06-01' },
  { id: '12', assetNumber: 'ASSET-012', description: 'Conference Room AV System', assetClass: 'Equipment', acquisitionValue: 45000, acquisitionDate: '2024-05-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 4500, accumulatedDepreciation: 9000, netBookValue: 36000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'AV-2024-012', warrantyExpiry: '2027-05-01', insurancePolicy: 'INS-012', lastMaintenanceDate: '2025-02-15', nextMaintenanceDate: '2025-05-15' },
  { id: '13', assetNumber: 'ASSET-013', description: 'Storage Tank Farm', assetClass: 'Building', acquisitionValue: 550000, acquisitionDate: '2021-01-01', location: 'Plant 3000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 25, salvageValue: 55000, accumulatedDepreciation: 88000, netBookValue: 462000, depreciationRate: 4, usefulLifeMonths: 300, costCenter: 'CC-1000', plant: 'Plant 3000', serialNumber: 'TANK-2021-013', warrantyExpiry: '', insurancePolicy: 'INS-013', lastMaintenanceDate: '2025-01-20', nextMaintenanceDate: '2025-07-20' },
  { id: '14', assetNumber: 'ASSET-014', description: 'Air Compressor System', assetClass: 'Machinery', acquisitionValue: 85000, acquisitionDate: '2023-08-01', location: 'Plant 1000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 12, salvageValue: 8500, accumulatedDepreciation: 14166, netBookValue: 70834, depreciationRate: 8.33, usefulLifeMonths: 144, costCenter: 'CC-1000', plant: 'Plant 1000', serialNumber: 'COMP-2023-014', warrantyExpiry: '2028-08-01', insurancePolicy: 'INS-014', lastMaintenanceDate: '2025-02-28', nextMaintenanceDate: '2025-05-28' },
  { id: '15', assetNumber: 'ASSET-015', description: 'Laboratory Equipment', assetClass: 'Equipment', acquisitionValue: 125000, acquisitionDate: '2022-07-01', location: 'Plant 1000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 7, salvageValue: 12500, accumulatedDepreciation: 53571, netBookValue: 71429, depreciationRate: 14.29, usefulLifeMonths: 84, costCenter: 'CC-6000', plant: 'Plant 1000', serialNumber: 'LAB-2022-015', warrantyExpiry: '2027-07-01', insurancePolicy: 'INS-015', lastMaintenanceDate: '2025-03-10', nextMaintenanceDate: '2025-06-10' },
  { id: '16', assetNumber: 'ASSET-016', description: 'Security System Upgrade', assetClass: 'IT Equipment', acquisitionValue: 68000, acquisitionDate: '2024-01-15', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 6800, accumulatedDepreciation: 13600, netBookValue: 54400, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-3000', plant: 'Plant 1000', serialNumber: 'SEC-2024-016', warrantyExpiry: '2027-01-15', insurancePolicy: 'INS-016', lastMaintenanceDate: '2025-02-05', nextMaintenanceDate: '2025-05-05' },
  { id: '17', assetNumber: 'ASSET-017', description: 'Production Line B', assetClass: 'Machinery', acquisitionValue: 680000, acquisitionDate: '2021-09-01', location: 'Plant 2000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 15, salvageValue: 68000, accumulatedDepreciation: 181333, netBookValue: 498667, depreciationRate: 6.67, usefulLifeMonths: 180, costCenter: 'CC-2000', plant: 'Plant 2000', serialNumber: 'LINE-2021-017', warrantyExpiry: '2026-09-01', insurancePolicy: 'INS-017', lastMaintenanceDate: '2025-01-30', nextMaintenanceDate: '2025-04-30' },
  { id: '18', assetNumber: 'ASSET-018', description: 'Company Aircraft', assetClass: 'Vehicle', acquisitionValue: 2500000, acquisitionDate: '2020-03-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Declining Balance', usefulLife: 10, salvageValue: 500000, accumulatedDepreciation: 1250000, netBookValue: 1250000, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'ACFT-2020-018', warrantyExpiry: '2025-03-01', insurancePolicy: 'INS-018', lastMaintenanceDate: '2025-02-20', nextMaintenanceDate: '2025-05-20' },
  { id: '19', assetNumber: 'ASSET-019', description: 'ERP System License', assetClass: 'IT Equipment', acquisitionValue: 350000, acquisitionDate: '2023-04-01', location: 'Data Center', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 0, accumulatedDepreciation: 140000, netBookValue: 210000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-3000', plant: 'Plant 1000', serialNumber: 'ERP-2023-019', warrantyExpiry: '2028-04-01', insurancePolicy: '', lastMaintenanceDate: '2025-03-15', nextMaintenanceDate: '' },
  { id: '20', assetNumber: 'ASSET-020', description: 'Ground Maintenance Equipment', assetClass: 'Equipment', acquisitionValue: 28000, acquisitionDate: '2023-10-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 7, salvageValue: 2800, accumulatedDepreciation: 8000, netBookValue: 20000, depreciationRate: 14.29, usefulLifeMonths: 84, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'GRND-2023-020', warrantyExpiry: '2026-10-01', insurancePolicy: 'INS-020', lastMaintenanceDate: '2025-01-15', nextMaintenanceDate: '2025-04-15' },
  { id: '21', assetNumber: 'ASSET-021', description: 'Injection Molding Machine', assetClass: 'Machinery', acquisitionValue: 420000, acquisitionDate: '2022-02-01', location: 'Plant 2000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 12, salvageValue: 42000, accumulatedDepreciation: 105000, netBookValue: 315000, depreciationRate: 8.33, usefulLifeMonths: 144, costCenter: 'CC-2000', plant: 'Plant 2000', serialNumber: 'MOLD-2022-021', warrantyExpiry: '2027-02-01', insurancePolicy: 'INS-021', lastMaintenanceDate: '2025-02-25', nextMaintenanceDate: '2025-05-25' },
  { id: '22', assetNumber: 'ASSET-022', description: 'Training Center Building', assetClass: 'Building', acquisitionValue: 850000, acquisitionDate: '2019-08-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 30, salvageValue: 85000, accumulatedDepreciation: 170000, netBookValue: 680000, depreciationRate: 3.33, usefulLifeMonths: 360, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'TRAIN-2019-022', warrantyExpiry: '', insurancePolicy: 'INS-022', lastMaintenanceDate: '2025-01-10', nextMaintenanceDate: '2025-07-10' },
  { id: '23', assetNumber: 'ASSET-023', description: 'Fleet Trucks', assetClass: 'Vehicle', acquisitionValue: 195000, acquisitionDate: '2023-03-01', location: 'Warehouse', status: 'Active', depreciationMethod: 'Declining Balance', usefulLife: 5, salvageValue: 39000, accumulatedDepreciation: 78000, netBookValue: 117000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-5000', plant: 'Plant 3000', serialNumber: 'TRUCK-2023-023', warrantyExpiry: '2028-03-01', insurancePolicy: 'INS-023', lastMaintenanceDate: '2025-03-01', nextMaintenanceDate: '2025-04-01' },
  { id: '24', assetNumber: 'ASSET-024', description: 'HVAC System', assetClass: 'Building', acquisitionValue: 220000, acquisitionDate: '2022-06-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 20, salvageValue: 22000, accumulatedDepreciation: 33000, netBookValue: 187000, depreciationRate: 5, usefulLifeMonths: 240, costCenter: 'CC-4000', plant: 'Plant 1000', serialNumber: 'HVAC-2022-024', warrantyExpiry: '2027-06-01', insurancePolicy: 'INS-024', lastMaintenanceDate: '2025-02-10', nextMaintenanceDate: '2025-08-10' },
  { id: '25', assetNumber: 'ASSET-025', description: 'Quality Testing Lab', assetClass: 'Equipment', acquisitionValue: 175000, acquisitionDate: '2021-12-01', location: 'Plant 1000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 7, salvageValue: 17500, accumulatedDepreciation: 75000, netBookValue: 100000, depreciationRate: 14.29, usefulLifeMonths: 84, costCenter: 'CC-6000', plant: 'Plant 1000', serialNumber: 'QUAL-2021-025', warrantyExpiry: '2026-12-01', insurancePolicy: 'INS-025', lastMaintenanceDate: '2025-03-05', nextMaintenanceDate: '2025-06-05' },
  { id: '26', assetNumber: 'ASSET-026', description: 'Solar Panel Array', assetClass: 'Equipment', acquisitionValue: 380000, acquisitionDate: '2023-07-01', location: 'Plant 3000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 25, salvageValue: 38000, accumulatedDepreciation: 22800, netBookValue: 357200, depreciationRate: 4, usefulLifeMonths: 300, costCenter: 'CC-1000', plant: 'Plant 3000', serialNumber: 'SOLAR-2023-026', warrantyExpiry: '2048-07-01', insurancePolicy: 'INS-026', lastMaintenanceDate: '2025-01-20', nextMaintenanceDate: '2025-07-20' },
  { id: '27', assetNumber: 'ASSET-027', description: 'Robotic Assembly Cell', assetClass: 'Machinery', acquisitionValue: 520000, acquisitionDate: '2024-01-10', location: 'Plant 2000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 10, salvageValue: 52000, accumulatedDepreciation: 52000, netBookValue: 468000, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-2000', plant: 'Plant 2000', serialNumber: 'ROBOT-2024-027', warrantyExpiry: '2029-01-10', insurancePolicy: 'INS-027', lastMaintenanceDate: '2025-02-15', nextMaintenanceDate: '2025-05-15' },
  { id: '28', assetNumber: 'ASSET-028', description: 'Data Backup System', assetClass: 'IT Equipment', acquisitionValue: 85000, acquisitionDate: '2023-11-01', location: 'Data Center', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 8500, accumulatedDepreciation: 17000, netBookValue: 68000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-3000', plant: 'Plant 1000', serialNumber: 'BACKUP-2023-028', warrantyExpiry: '2028-11-01', insurancePolicy: 'INS-028', lastMaintenanceDate: '2025-03-01', nextMaintenanceDate: '2025-04-01' },
  { id: '29', assetNumber: 'ASSET-029', description: 'Packaging Equipment', assetClass: 'Machinery', acquisitionValue: 145000, acquisitionDate: '2022-09-01', location: 'Plant 3000', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 10, salvageValue: 14500, accumulatedDepreciation: 36250, netBookValue: 108750, depreciationRate: 10, usefulLifeMonths: 120, costCenter: 'CC-5000', plant: 'Plant 3000', serialNumber: 'PACK-2022-029', warrantyExpiry: '2027-09-01', insurancePolicy: 'INS-029', lastMaintenanceDate: '2025-02-20', nextMaintenanceDate: '2025-05-20' },
  { id: '30', assetNumber: 'ASSET-030', description: 'Innovation Lab Setup', assetClass: 'Equipment', acquisitionValue: 290000, acquisitionDate: '2024-02-01', location: 'Head Office', status: 'Active', depreciationMethod: 'Straight Line', usefulLife: 5, salvageValue: 29000, accumulatedDepreciation: 58000, netBookValue: 232000, depreciationRate: 20, usefulLifeMonths: 60, costCenter: 'CC-6000', plant: 'Plant 1000', serialNumber: 'LAB-INV-2024-030', warrantyExpiry: '2029-02-01', insurancePolicy: 'INS-030', lastMaintenanceDate: '2025-03-10', nextMaintenanceDate: '2025-04-10' },
];

const AssetMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [assets, setAssets] = useLocalStorage<Asset[]>(STORAGE_KEY, defaultAssets);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<Omit<Asset, 'id' | 'assetNumber'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Asset Master. Manage fixed assets including equipment, machinery, and property records.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingAsset(null);
    setForm({ ...defaultForm, acquisitionDate: new Date().toISOString().split('T')[0] });
    setIsDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      description: asset.description,
      assetClass: asset.assetClass,
      acquisitionValue: asset.acquisitionValue,
      acquisitionDate: asset.acquisitionDate,
      location: asset.location,
      status: asset.status,
      depreciationMethod: asset.depreciationMethod,
      usefulLife: asset.usefulLife,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Asset description is required.', variant: 'destructive' });
      return;
    }
    if (form.acquisitionValue <= 0) {
      toast({ title: 'Validation Error', description: 'Acquisition value must be greater than 0.', variant: 'destructive' });
      return;
    }
    if (editingAsset) {
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...editingAsset, ...form } : a));
      toast({ title: 'Asset Updated', description: `${form.description} has been updated.` });
    } else {
      const newAsset: Asset = {
        id: String(Date.now()),
        assetNumber: `ASSET-${String(assets.length + 1).padStart(3, '0')}`,
        ...form,
      };
      setAssets(prev => [...prev, newAsset]);
      toast({ title: 'Asset Created', description: `${form.description} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (asset: Asset) => {
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    toast({ title: 'Asset Deleted', description: `${asset.description} has been removed.` });
  };

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Retired': 'bg-gray-100 text-gray-800',
      'Under Construction': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'assetNumber', header: 'Asset Number' },
    { key: 'description', header: 'Description' },
    { key: 'assetClass', header: 'Asset Class' },
    { 
      key: 'acquisitionValue', 
      header: 'Acquisition Value',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'acquisitionDate', header: 'Acquisition Date' },
    { key: 'location', header: 'Location' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { key: 'depreciationMethod', header: 'Depreciation Method' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Asset) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/master-data')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Asset Master"
          description="Create and maintain asset master records"
          voiceIntroduction="Welcome to Asset Master."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Assets</div>
          <div className="text-2xl font-bold">{assets.length}</div>
          <div className="text-sm text-blue-600">All asset records</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Asset Value</div>
          <div className="text-2xl font-bold">${(assets.reduce((sum, a) => sum + a.acquisitionValue, 0) / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-green-600">Total book value</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Assets</div>
          <div className="text-2xl font-bold">{assets.filter(a => a.status === 'Active').length}</div>
          <div className="text-sm text-purple-600">Currently in use</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Asset Classes</div>
          <div className="text-2xl font-bold">{new Set(assets.map(a => a.assetClass)).size}</div>
          <div className="text-sm text-orange-600">Categories defined</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Asset Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Asset
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={assets} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter asset description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assetClass">Asset Class</Label>
                <Select value={form.assetClass} onValueChange={(value) => setForm({ ...form, assetClass: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="acquisitionValue">Acquisition Value *</Label>
                <Input
                  id="acquisitionValue"
                  type="number"
                  value={form.acquisitionValue}
                  onChange={(e) => setForm({ ...form, acquisitionValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={form.acquisitionDate}
                  onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                <Select value={form.depreciationMethod} onValueChange={(value) => setForm({ ...form, depreciationMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Straight Line">Straight Line</SelectItem>
                    <SelectItem value="Declining Balance">Declining Balance</SelectItem>
                    <SelectItem value="Sum of Years">Sum of Years</SelectItem>
                    <SelectItem value="Units of Production">Units of Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  value={form.usefulLife || ''}
                  onChange={(e) => setForm({ ...form, usefulLife: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value: 'Active' | 'Retired' | 'Under Construction') => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingAsset ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Asset Number:</span>
                <span className="font-medium">{selectedAsset.assetNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{selectedAsset.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Asset Class:</span>
                <span className="font-medium">{selectedAsset.assetClass}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Acquisition Value:</span>
                <span className="font-medium">${selectedAsset.acquisitionValue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Acquisition Date:</span>
                <span className="font-medium">{selectedAsset.acquisitionDate}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{selectedAsset.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Useful Life:</span>
                <span className="font-medium">{selectedAsset.usefulLife} years</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Depreciation Method:</span>
                <span className="font-medium">{selectedAsset.depreciationMethod}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedAsset.status)}>{selectedAsset.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetMaster;
