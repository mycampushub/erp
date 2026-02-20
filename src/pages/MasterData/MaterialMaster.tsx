
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Package, Search, Download, Upload, Filter } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Material {
  id: string;
  materialNumber: string;
  description: string;
  materialType: string;
  baseUnit: string;
  materialGroup: string;
  plant: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  lastChanged: string;
  createdAt: string;
  weight?: number;
  dimensions?: string;
  shelfLife?: number;
  netValue?: number;
  currency?: string;
  taxCode?: string;
  originCountry?: string;
  manufacturer?: string;
  brand?: string;
  serialNumberProfile?: string;
  batchManagement?: string;
  valuationClass?: string;
  movingAveragePrice?: number;
  standardPrice?: number;
  mrpType?: string;
  reorderPoint?: number;
  safetyStock?: number;
  lotSize?: string;
  leadTime?: number;
  plantSpecificStatus?: string;
  storageLocation?: string;
  unrestrictedStock?: number;
  qualityInspectionStock?: number;
  blockedStock?: number;
}

const STORAGE_KEY = 'sap_materials';

const defaultMaterials: Material[] = [
  { id: '1', materialNumber: 'MAT-001', description: 'Steel Rod 10mm', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-01-15', createdAt: '2024-06-01', weight: 10.5, dimensions: '10mm x 3000mm', netValue: 25.50, currency: 'USD', taxCode: 'TX-001', originCountry: 'Germany', manufacturer: 'Steel Corp', brand: 'PremiumSteel', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 25.00, standardPrice: 26.00, mrpType: 'PD', reorderPoint: 500, safetyStock: 100, lotSize: 'EX', leadTime: 14, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 2500, qualityInspectionStock: 150, blockedStock: 0 },
  { id: '2', materialNumber: 'MAT-002', description: 'Finished Product A', materialType: 'Finished Good', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-01-18', createdAt: '2024-03-15', weight: 2.5, dimensions: '200x150x50mm', netValue: 150.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'USA', manufacturer: 'TechMfg Inc', brand: 'TechPro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 145.00, standardPrice: 155.00, mrpType: 'PD', reorderPoint: 100, safetyStock: 20, lotSize: 'PK', leadTime: 7, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 850, qualityInspectionStock: 50, blockedStock: 0 },
  { id: '3', materialNumber: 'MAT-003', description: 'Semi-Finished Part B', materialType: 'Semi-Finished', baseUnit: 'PC', materialGroup: 'Components', plant: 'Plant 1000', status: 'Inactive', lastChanged: '2025-01-10', createdAt: '2024-01-20', weight: 1.2, dimensions: '50x50x30mm', netValue: 45.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'China', manufacturer: 'CompChina', brand: 'Generic', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0015', movingAveragePrice: 42.00, standardPrice: 48.00, mrpType: 'PD', reorderPoint: 200, safetyStock: 50, lotSize: 'EX', leadTime: 21, plantSpecificStatus: 'Blocked', storageLocation: 'SL-003', unrestrictedStock: 0, qualityInspectionStock: 0, blockedStock: 450 },
  { id: '4', materialNumber: 'MAT-004', description: 'Aluminum Sheet 2mm', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-02-01', createdAt: '2024-05-10', weight: 5.4, dimensions: '2mm x 1000x2000mm', netValue: 18.75, currency: 'USD', taxCode: 'TX-001', originCountry: 'Germany', manufacturer: 'AluTech', brand: 'AluPrime', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 18.00, standardPrice: 19.50, mrpType: 'PD', reorderPoint: 1000, safetyStock: 200, lotSize: 'EX', leadTime: 10, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 5200, qualityInspectionStock: 300, blockedStock: 0 },
  { id: '5', materialNumber: 'MAT-005', description: 'Electronic Component X1', materialType: 'Component', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-02-05', createdAt: '2024-07-22', weight: 0.05, dimensions: '10x5x2mm', netValue: 8.50, currency: 'USD', taxCode: 'TX-002', originCountry: 'Japan', manufacturer: 'JpnComponents', brand: 'JVC', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0025', movingAveragePrice: 8.00, standardPrice: 9.00, mrpType: 'PD', reorderPoint: 1000, safetyStock: 250, lotSize: 'EX', leadTime: 28, plantSpecificStatus: 'Released', storageLocation: 'SL-004', unrestrictedStock: 8500, qualityInspectionStock: 420, blockedStock: 0 },
  { id: '6', materialNumber: 'MAT-006', description: 'Copper Wire 5mm', materialType: 'Raw Material', baseUnit: 'M', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-02-08', createdAt: '2024-04-15', weight: 0.8, dimensions: '5mm diameter', netValue: 12.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Chile', manufacturer: 'CopperMined', brand: 'PureCopper', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 11.50, standardPrice: 12.50, mrpType: 'PD', reorderPoint: 2000, safetyStock: 500, lotSize: 'EX', leadTime: 35, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 15000, qualityInspectionStock: 800, blockedStock: 0 },
  { id: '7', materialNumber: 'MAT-007', description: 'Plastic Pellets ABS', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-02-10', createdAt: '2024-08-05', weight: 25.0, dimensions: 'Bulk bag', netValue: 3.25, currency: 'USD', taxCode: 'TX-003', originCountry: 'South Korea', manufacturer: 'ChemCorp', brand: 'ABS-Pro', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 3.10, standardPrice: 3.50, mrpType: 'PD', reorderPoint: 5000, safetyStock: 1000, lotSize: 'EX', leadTime: 20, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 25000, qualityInspectionStock: 1200, blockedStock: 0 },
  { id: '8', materialNumber: 'MAT-008', description: 'Bearing Assembly Kit', materialType: 'Component', baseUnit: 'SET', materialGroup: 'Components', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-02-12', createdAt: '2024-09-18', weight: 5.0, dimensions: '200x150x100mm', netValue: 85.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Sweden', manufacturer: 'BearingsAB', brand: 'SkfPro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 82.00, standardPrice: 88.00, mrpType: 'PD', reorderPoint: 50, safetyStock: 10, lotSize: 'EX', leadTime: 30, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 320, qualityInspectionStock: 25, blockedStock: 0 },
  { id: '9', materialNumber: 'MAT-009', description: 'Industrial Adhesive Grade A', materialType: 'Raw Material', baseUnit: 'L', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-02-14', createdAt: '2024-10-12', weight: 1.2, dimensions: '1L container', netValue: 45.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'Germany', manufacturer: 'Henkel', brand: 'Loctite', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 43.00, standardPrice: 47.00, mrpType: 'PD', reorderPoint: 100, safetyStock: 25, lotSize: 'EX', leadTime: 15, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 580, qualityInspectionStock: 45, blockedStock: 0 },
  { id: '10', materialNumber: 'MAT-010', description: 'Stainless Steel Tube 25mm', materialType: 'Raw Material', baseUnit: 'M', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-02-16', createdAt: '2024-11-01', weight: 3.5, dimensions: '25mm OD x 2mm wall', netValue: 28.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Japan', manufacturer: 'NipponSteel', brand: 'inoxSteel', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 27.00, standardPrice: 29.00, mrpType: 'PD', reorderPoint: 500, safetyStock: 100, lotSize: 'EX', leadTime: 25, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 3200, qualityInspectionStock: 180, blockedStock: 0 },
  { id: '11', materialNumber: 'MAT-011', description: 'Microcontroller IC ATMega', materialType: 'Component', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-02-18', createdAt: '2024-12-05', weight: 0.01, dimensions: '10x10x2mm', netValue: 12.50, currency: 'USD', taxCode: 'TX-002', originCountry: 'USA', manufacturer: 'Microchip', brand: 'Atmel', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0025', movingAveragePrice: 12.00, standardPrice: 13.00, mrpType: 'PD', reorderPoint: 500, safetyStock: 100, lotSize: 'EX', leadTime: 45, plantSpecificStatus: 'Released', storageLocation: 'SL-004', unrestrictedStock: 4500, qualityInspectionStock: 220, blockedStock: 0 },
  { id: '12', materialNumber: 'MAT-012', description: 'Hydraulic Fluid ISO 46', materialType: 'Raw Material', baseUnit: 'L', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-02-20', createdAt: '2024-12-20', weight: 0.95, dimensions: '20L drum', netValue: 38.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'USA', manufacturer: 'Shell', brand: 'Tellus', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 36.00, standardPrice: 40.00, mrpType: 'PD', reorderPoint: 200, safetyStock: 50, lotSize: 'EX', leadTime: 10, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 1200, qualityInspectionStock: 80, blockedStock: 0 },
  { id: '13', materialNumber: 'MAT-013', description: 'Gearbox Assembly 50:1', materialType: 'Finished Good', baseUnit: 'PC', materialGroup: 'Machinery', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-02-22', createdAt: '2025-01-05', weight: 45.0, dimensions: '400x300x300mm', netValue: 1250.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Germany', manufacturer: 'SEW Eurodrive', brand: 'DriveTech', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 1200.00, standardPrice: 1300.00, mrpType: 'PD', reorderPoint: 10, safetyStock: 2, lotSize: 'EX', leadTime: 60, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 85, qualityInspectionStock: 8, blockedStock: 0 },
  { id: '14', materialNumber: 'MAT-014', description: 'Rubber Gasket Set', materialType: 'Component', baseUnit: 'SET', materialGroup: 'Components', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-02-24', createdAt: '2025-01-10', weight: 0.5, dimensions: '100x100x20mm', netValue: 15.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Italy', manufacturer: 'GasketPro', brand: 'Fluoroseal', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0015', movingAveragePrice: 14.00, standardPrice: 16.00, mrpType: 'PD', reorderPoint: 200, safetyStock: 40, lotSize: 'EX', leadTime: 18, plantSpecificStatus: 'Released', storageLocation: 'SL-003', unrestrictedStock: 1800, qualityInspectionStock: 95, blockedStock: 0 },
  { id: '15', materialNumber: 'MAT-015', description: 'Carbon Fiber Sheet 3mm', materialType: 'Raw Material', baseUnit: 'PC', materialGroup: 'Composites', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-02-26', createdAt: '2025-01-15', weight: 2.8, dimensions: '1000x1000x3mm', netValue: 320.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Japan', manufacturer: 'Toray', brand: 'CarbonTex', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 310.00, standardPrice: 335.00, mrpType: 'PD', reorderPoint: 20, safetyStock: 5, lotSize: 'EX', leadTime: 40, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 145, qualityInspectionStock: 12, blockedStock: 0 },
  { id: '16', materialNumber: 'MAT-016', description: 'Pneumatic Cylinder ISO', materialType: 'Finished Good', baseUnit: 'PC', materialGroup: 'Machinery', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-02-28', createdAt: '2025-01-20', weight: 8.5, dimensions: '200x80x80mm', netValue: 485.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Germany', manufacturer: 'Festo', brand: 'AutomationPro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 470.00, standardPrice: 500.00, mrpType: 'PD', reorderPoint: 25, safetyStock: 5, lotSize: 'EX', leadTime: 25, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 180, qualityInspectionStock: 15, blockedStock: 0 },
  { id: '17', materialNumber: 'MAT-017', description: 'Solder Paste Type 4', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Chemicals', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-01', createdAt: '2025-01-25', weight: 0.5, dimensions: '500g jar', netValue: 185.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'USA', manufacturer: 'Indium Corp', brand: 'Indium8.9', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 180.00, standardPrice: 195.00, mrpType: 'PD', reorderPoint: 50, safetyStock: 10, lotSize: 'EX', leadTime: 21, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 380, qualityInspectionStock: 35, blockedStock: 0 },
  { id: '18', materialNumber: 'MAT-018', description: 'Precision Shaft 20mm', materialType: 'Semi-Finished', baseUnit: 'PC', materialGroup: 'Components', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-03-03', createdAt: '2025-01-28', weight: 3.2, dimensions: '20mm x 500mm', netValue: 65.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Switzerland', manufacturer: 'Precisa', brand: 'ShaftMaster', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0015', movingAveragePrice: 62.00, standardPrice: 68.00, mrpType: 'PD', reorderPoint: 100, safetyStock: 20, lotSize: 'EX', leadTime: 35, plantSpecificStatus: 'Released', storageLocation: 'SL-003', unrestrictedStock: 720, qualityInspectionStock: 45, blockedStock: 0 },
  { id: '19', materialNumber: 'MAT-019', description: 'Industrial Cleaner 5L', materialType: 'Raw Material', baseUnit: 'CAN', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-03-05', createdAt: '2025-02-01', weight: 5.5, dimensions: '5L container', netValue: 28.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'USA', manufacturer: '3M', brand: 'Industrial Clean', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 26.00, standardPrice: 30.00, mrpType: 'PD', reorderPoint: 100, safetyStock: 20, lotSize: 'EX', leadTime: 12, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 650, qualityInspectionStock: 40, blockedStock: 0 },
  { id: '20', materialNumber: 'MAT-020', description: 'Servo Motor 1.5kW', materialType: 'Finished Good', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-07', createdAt: '2025-02-05', weight: 15.0, dimensions: '250x150x150mm', netValue: 1850.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Japan', manufacturer: 'Yaskawa', brand: 'Sigma-7', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 1800.00, standardPrice: 1920.00, mrpType: 'PD', reorderPoint: 8, safetyStock: 2, lotSize: 'EX', leadTime: 55, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 52, qualityInspectionStock: 5, blockedStock: 0 },
  { id: '21', materialNumber: 'MAT-021', description: 'Welding Wire 1.2mm', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-03-09', createdAt: '2025-02-08', weight: 15.0, dimensions: '15kg spool', netValue: 22.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Sweden', manufacturer: 'ESAB', brand: 'WeldWire', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 21.00, standardPrice: 23.00, mrpType: 'PD', reorderPoint: 300, safetyStock: 60, lotSize: 'EX', leadTime: 20, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 2400, qualityInspectionStock: 150, blockedStock: 0 },
  { id: '22', materialNumber: 'MAT-022', description: 'Touch Screen Display 7inch', materialType: 'Component', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-11', createdAt: '2025-02-10', weight: 0.35, dimensions: '165x100x10mm', netValue: 95.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Taiwan', manufacturer: 'Innolux', brand: 'DisplayTech', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0025', movingAveragePrice: 92.00, standardPrice: 99.00, mrpType: 'PD', reorderPoint: 100, safetyStock: 20, lotSize: 'EX', leadTime: 38, plantSpecificStatus: 'Released', storageLocation: 'SL-004', unrestrictedStock: 780, qualityInspectionStock: 55, blockedStock: 0 },
  { id: '23', materialNumber: 'MAT-023', description: 'Lubricating Grease NLGI 2', materialType: 'Raw Material', baseUnit: 'KG', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-03-13', createdAt: '2025-02-12', weight: 0.4, dimensions: '400g cartridge', netValue: 32.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'Germany', manufacturer: 'Kluber', brand: 'Isoflex', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 30.00, standardPrice: 34.00, mrpType: 'PD', reorderPoint: 150, safetyStock: 30, lotSize: 'EX', leadTime: 18, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 950, qualityInspectionStock: 65, blockedStock: 0 },
  { id: '24', materialNumber: 'MAT-024', description: 'Linear Guide Rail 500mm', materialType: 'Semi-Finished', baseUnit: 'PC', materialGroup: 'Machinery', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-03-15', createdAt: '2025-02-15', weight: 12.0, dimensions: '30x30x500mm', netValue: 380.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Japan', manufacturer: 'THK', brand: 'GuidePro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0015', movingAveragePrice: 365.00, standardPrice: 395.00, mrpType: 'PD', reorderPoint: 30, safetyStock: 5, lotSize: 'EX', leadTime: 42, plantSpecificStatus: 'Released', storageLocation: 'SL-003', unrestrictedStock: 195, qualityInspectionStock: 18, blockedStock: 0 },
  { id: '25', materialNumber: 'MAT-025', description: 'Circuit Breaker 32A', materialType: 'Component', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-17', createdAt: '2025-02-18', weight: 0.25, dimensions: '80x70x35mm', netValue: 45.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Germany', manufacturer: 'Siemens', brand: 'SENTRON', serialNumberProfile: 'SN-STD', batchManagement: 'No', valuationClass: '0025', movingAveragePrice: 43.00, standardPrice: 47.00, mrpType: 'PD', reorderPoint: 80, safetyStock: 15, lotSize: 'EX', leadTime: 28, plantSpecificStatus: 'Released', storageLocation: 'SL-004', unrestrictedStock: 520, qualityInspectionStock: 35, blockedStock: 0 },
  { id: '26', materialNumber: 'MAT-026', description: 'Aluminum Extrusion Profile', materialType: 'Raw Material', baseUnit: 'M', materialGroup: 'Metals', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-03-19', createdAt: '2025-02-20', weight: 4.2, dimensions: '40x40mm L-Profile', netValue: 35.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'China', manufacturer: 'AlumChina', brand: 'ExtrudePro', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0010', movingAveragePrice: 33.00, standardPrice: 37.00, mrpType: 'PD', reorderPoint: 400, safetyStock: 80, lotSize: 'EX', leadTime: 30, plantSpecificStatus: 'Released', storageLocation: 'SL-001', unrestrictedStock: 2800, qualityInspectionStock: 165, blockedStock: 0 },
  { id: '27', materialNumber: 'MAT-027', description: 'Encoder 1024 PPR', materialType: 'Component', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-21', createdAt: '2025-02-22', weight: 0.15, dimensions: '40x40x30mm', netValue: 220.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Germany', manufacturer: 'Heidenhain', brand: 'EncoderPro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0025', movingAveragePrice: 215.00, standardPrice: 230.00, mrpType: 'PD', reorderPoint: 40, safetyStock: 8, lotSize: 'EX', leadTime: 50, plantSpecificStatus: 'Released', storageLocation: 'SL-004', unrestrictedStock: 285, qualityInspectionStock: 22, blockedStock: 0 },
  { id: '28', materialNumber: 'MAT-028', description: 'Coolant Concentrate', materialType: 'Raw Material', baseUnit: 'L', materialGroup: 'Chemicals', plant: 'Plant 3000', status: 'Active', lastChanged: '2025-03-23', createdAt: '2025-02-25', weight: 1.1, dimensions: '20L container', netValue: 55.00, currency: 'USD', taxCode: 'TX-003', originCountry: 'UK', manufacturer: 'Castrol', brand: 'Hyspin', serialNumberProfile: 'SN-STD', batchManagement: 'Yes', valuationClass: '0030', movingAveragePrice: 52.00, standardPrice: 58.00, mrpType: 'PD', reorderPoint: 80, safetyStock: 15, lotSize: 'EX', leadTime: 14, plantSpecificStatus: 'Released', storageLocation: 'SL-005', unrestrictedStock: 520, qualityInspectionStock: 38, blockedStock: 0 },
  { id: '29', materialNumber: 'MAT-029', description: 'Ball Screw 400mm', materialType: 'Semi-Finished', baseUnit: 'PC', materialGroup: 'Machinery', plant: 'Plant 1000', status: 'Active', lastChanged: '2025-03-25', createdAt: '2025-02-28', weight: 8.5, dimensions: '25mm x 400mm', netValue: 295.00, currency: 'USD', taxCode: 'TX-001', originCountry: 'Japan', manufacturer: 'NSK', brand: 'BallScrew Pro', serialNumberProfile: 'SN-EXT', batchManagement: 'No', valuationClass: '0015', movingAveragePrice: 285.00, standardPrice: 305.00, mrpType: 'PD', reorderPoint: 25, safetyStock: 5, lotSize: 'EX', leadTime: 48, plantSpecificStatus: 'Released', storageLocation: 'SL-003', unrestrictedStock: 165, qualityInspectionStock: 14, blockedStock: 0 },
  { id: '30', materialNumber: 'MAT-030', description: 'Power Supply 24V 10A', materialType: 'Finished Good', baseUnit: 'PC', materialGroup: 'Electronics', plant: 'Plant 2000', status: 'Active', lastChanged: '2025-03-27', createdAt: '2025-03-01', weight: 2.8, dimensions: '200x120x50mm', netValue: 385.00, currency: 'USD', taxCode: 'TX-002', originCountry: 'Germany', manufacturer: 'Siemens', brand: 'Sitop', serialNumberProfile: 'SN-STD', batchManagement: 'No', valuationClass: '0020', movingAveragePrice: 375.00, standardPrice: 400.00, mrpType: 'PD', reorderPoint: 20, safetyStock: 4, lotSize: 'EX', leadTime: 35, plantSpecificStatus: 'Released', storageLocation: 'SL-002', unrestrictedStock: 125, qualityInspectionStock: 10, blockedStock: 0 },
];

const defaultForm: Omit<Material, 'id' | 'materialNumber' | 'lastChanged' | 'createdAt'> = {
  description: '',
  materialType: 'Raw Material',
  baseUnit: 'KG',
  materialGroup: 'Metals',
  plant: 'Plant 1000',
  status: 'Active',
  weight: 0,
  dimensions: '',
  shelfLife: 0,
  netValue: 0,
  currency: 'USD',
  taxCode: 'TX-001',
  originCountry: '',
  manufacturer: '',
  brand: '',
  serialNumberProfile: '',
  batchManagement: 'No',
  valuationClass: '0010',
  movingAveragePrice: 0,
  standardPrice: 0,
  mrpType: 'PD',
  reorderPoint: 0,
  safetyStock: 0,
  lotSize: 'EX',
  leadTime: 0,
  plantSpecificStatus: 'Released',
  storageLocation: '',
  unrestrictedStock: 0,
  qualityInspectionStock: 0,
  blockedStock: 0,
};

const MaterialMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [materials, setMaterials] = useLocalStorage<Material[]>(STORAGE_KEY, defaultMaterials);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<Omit<Material, 'id' | 'materialNumber' | 'lastChanged' | 'createdAt'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Material Master. Manage product and material data including descriptions, units of measure, and classifications.');
    }
  }, [isEnabled, speak]);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.materialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.materialGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesType = filterType === 'all' || m.materialType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openCreate = () => {
    setEditingMaterial(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditingMaterial(material);
    setForm({
      description: material.description,
      materialType: material.materialType,
      baseUnit: material.baseUnit,
      materialGroup: material.materialGroup,
      plant: material.plant,
      status: material.status,
      weight: material.weight,
      dimensions: material.dimensions,
      shelfLife: material.shelfLife,
      netValue: material.netValue,
      currency: material.currency,
      taxCode: material.taxCode,
      originCountry: material.originCountry,
      manufacturer: material.manufacturer,
      brand: material.brand,
      serialNumberProfile: material.serialNumberProfile,
      batchManagement: material.batchManagement,
      valuationClass: material.valuationClass,
      movingAveragePrice: material.movingAveragePrice,
      standardPrice: material.standardPrice,
      mrpType: material.mrpType,
      reorderPoint: material.reorderPoint,
      safetyStock: material.safetyStock,
      lotSize: material.lotSize,
      leadTime: material.leadTime,
      plantSpecificStatus: material.plantSpecificStatus,
      storageLocation: material.storageLocation,
      unrestrictedStock: material.unrestrictedStock,
      qualityInspectionStock: material.qualityInspectionStock,
      blockedStock: material.blockedStock,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Material description is required.', variant: 'destructive' });
      return;
    }
    if (editingMaterial) {
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? { 
        ...editingMaterial, 
        ...form,
        lastChanged: new Date().toISOString().split('T')[0]
      } : m));
      toast({ title: 'Material Updated', description: `${form.description} has been updated.` });
    } else {
      const newMaterial: Material = {
        id: String(Date.now()),
        materialNumber: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
        lastChanged: new Date().toISOString().split('T')[0],
      };
      setMaterials(prev => [...prev, newMaterial]);
      toast({ title: 'Material Created', description: `${form.description} added to material master.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (material: Material) => {
    setMaterials(prev => prev.filter(m => m.id !== material.id));
    toast({ title: 'Material Deleted', description: `${material.description} has been removed.` });
  };

  const handleView = (material: Material) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Material Number', 'Description', 'Material Type', 'Base Unit', 'Material Group', 'Plant', 'Status', 'Net Value', 'Currency'].join(','),
      ...materials.map(m => [m.materialNumber, `"${m.description}"`, m.materialType, m.baseUnit, m.materialGroup, m.plant, m.status, m.netValue, m.currency].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials_export.csv';
    a.click();
    toast({ title: 'Export Complete', description: `${materials.length} materials exported successfully.` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Blocked': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'materialNumber', header: 'Material Number', sortable: true },
    { key: 'description', header: 'Description', sortable: true },
    { key: 'materialType', header: 'Material Type', filterable: true },
    { key: 'baseUnit', header: 'Base Unit' },
    { key: 'materialGroup', header: 'Material Group', sortable: true },
    { key: 'plant', header: 'Plant', filterable: true },
    { key: 'netValue', header: 'Net Value', render: (value: number) => `$${(value || 0).toFixed(2)}`, sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { key: 'lastChanged', header: 'Last Changed' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Material) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} title="Delete">
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
          title="Material Master"
          description="Create and maintain material master records with full lifecycle management"
          voiceIntroduction="Welcome to Material Master."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Materials</div>
          <div className="text-2xl font-bold">{materials.length}</div>
          <div className="text-sm text-blue-600">All material types</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Materials</div>
          <div className="text-2xl font-bold">{materials.filter(m => m.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently in use</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Material Groups</div>
          <div className="text-2xl font-bold">{new Set(materials.map(m => m.materialGroup)).size}</div>
          <div className="text-sm text-purple-600">Categories defined</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold">${(materials.reduce((sum, m) => sum + (m.netValue || 0), 0) / 1000).toFixed(1)}K</div>
          <div className="text-sm text-orange-600">Inventory value</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Material List</TabsTrigger>
          <TabsTrigger value="create">Create Material</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Raw Material">Raw Material</SelectItem>
                  <SelectItem value="Finished Good">Finished Good</SelectItem>
                  <SelectItem value="Semi-Finished">Semi-Finished</SelectItem>
                  <SelectItem value="Component">Component</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />Create Material
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <DataTable columns={columns} data={filteredMaterials} />
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Register New Material</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Description *</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter material description" />
              </div>
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select value={form.materialType} onValueChange={v => setForm(f => ({ ...f, materialType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                    <SelectItem value="Finished Good">Finished Good</SelectItem>
                    <SelectItem value="Semi-Finished">Semi-Finished</SelectItem>
                    <SelectItem value="Component">Component</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Unit</Label>
                <Select value={form.baseUnit} onValueChange={v => setForm(f => ({ ...f, baseUnit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="M">Meter</SelectItem>
                    <SelectItem value="L">Liter</SelectItem>
                    <SelectItem value="SET">Set</SelectItem>
                    <SelectItem value="CAN">Can</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Material Group</Label>
                <Select value={form.materialGroup} onValueChange={v => setForm(f => ({ ...f, materialGroup: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Metals">Metals</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Components">Components</SelectItem>
                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Composites">Composites</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plant</Label>
                <Select value={form.plant} onValueChange={v => setForm(f => ({ ...f, plant: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                    <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                    <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Material['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Net Value</Label>
                <Input type="number" value={form.netValue || ''} onChange={e => setForm(f => ({ ...f, netValue: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input type="number" value={form.weight || ''} onChange={e => setForm(f => ({ ...f, weight: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Dimensions</Label>
                <Input value={form.dimensions || ''} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} placeholder="e.g., 10mm x 3000mm" />
              </div>
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input value={form.manufacturer || ''} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Origin Country</Label>
                <Input value={form.originCountry || ''} onChange={e => setForm(f => ({ ...f, originCountry: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Valuation Class</Label>
                <Input value={form.valuationClass || ''} onChange={e => setForm(f => ({ ...f, valuationClass: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Moving Average Price</Label>
                <Input type="number" value={form.movingAveragePrice || ''} onChange={e => setForm(f => ({ ...f, movingAveragePrice: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>MRP Type</Label>
                <Select value={form.mrpType || 'PD'} onValueChange={v => setForm(f => ({ ...f, mrpType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PD">MRP</SelectItem>
                    <SelectItem value="MPS">MPS</SelectItem>
                    <SelectItem value="P">Pull</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reorder Point</Label>
                <Input type="number" value={form.reorderPoint || ''} onChange={e => setForm(f => ({ ...f, reorderPoint: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Safety Stock</Label>
                <Input type="number" value={form.safetyStock || ''} onChange={e => setForm(f => ({ ...f, safetyStock: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Lead Time (Days)</Label>
                <Input type="number" value={form.leadTime || ''} onChange={e => setForm(f => ({ ...f, leadTime: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave}><Plus className="h-4 w-4 mr-2" />Create Material</Button>
              <Button variant="outline" onClick={() => setForm(defaultForm)}>Reset</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Materials by Type</h3>
              <div className="space-y-3">
                {['Raw Material', 'Finished Good', 'Semi-Finished', 'Component'].map(type => {
                  const count = materials.filter(m => m.materialType === type).length;
                  const pct = (count / materials.length * 100).toFixed(1);
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{type}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Materials by Plant</h3>
              <div className="space-y-3">
                {['Plant 1000', 'Plant 2000', 'Plant 3000'].map(plant => {
                  const count = materials.filter(m => m.plant === plant).length;
                  const pct = (count / materials.length * 100).toFixed(1);
                  return (
                    <div key={plant}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{plant}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
              <div className="space-y-3">
                {['Active', 'Inactive', 'Blocked'].map(status => {
                  const count = materials.filter(m => m.status === status).length;
                  const pct = (count / materials.length * 100).toFixed(1);
                  const colors = { 'Active': 'bg-green-600', 'Inactive': 'bg-red-600', 'Blocked': 'bg-yellow-600' };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{status}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${colors[status as keyof typeof colors]} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Material' : 'Create New Material'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Material Type</Label>
              <Select value={form.materialType} onValueChange={v => setForm(f => ({ ...f, materialType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Raw Material">Raw Material</SelectItem>
                  <SelectItem value="Finished Good">Finished Good</SelectItem>
                  <SelectItem value="Semi-Finished">Semi-Finished</SelectItem>
                  <SelectItem value="Component">Component</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Base Unit</Label>
              <Select value={form.baseUnit} onValueChange={v => setForm(f => ({ ...f, baseUnit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="M">Meter</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Material Group</Label>
              <Select value={form.materialGroup} onValueChange={v => setForm(f => ({ ...f, materialGroup: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Metals">Metals</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Components">Components</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Machinery">Machinery</SelectItem>
                  <SelectItem value="Composites">Composites</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(f => ({ ...f, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                  <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                  <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Material['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Net Value</Label>
              <Input type="number" value={form.netValue || ''} onChange={e => setForm(f => ({ ...f, netValue: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input type="number" value={form.weight || ''} onChange={e => setForm(f => ({ ...f, weight: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <Input value={form.dimensions || ''} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer || ''} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Origin Country</Label>
              <Input value={form.originCountry || ''} onChange={e => setForm(f => ({ ...f, originCountry: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Valuation Class</Label>
              <Input value={form.valuationClass || ''} onChange={e => setForm(f => ({ ...f, valuationClass: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Moving Average Price</Label>
              <Input type="number" value={form.movingAveragePrice || ''} onChange={e => setForm(f => ({ ...f, movingAveragePrice: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>MRP Type</Label>
              <Select value={form.mrpType || 'PD'} onValueChange={v => setForm(f => ({ ...f, mrpType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PD">MRP</SelectItem>
                  <SelectItem value="MPS">MPS</SelectItem>
                  <SelectItem value="P">Pull</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reorder Point</Label>
              <Input type="number" value={form.reorderPoint || ''} onChange={e => setForm(f => ({ ...f, reorderPoint: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingMaterial ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Material Details</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="basic">Basic Data</TabsTrigger>
                <TabsTrigger value="purchasing">Purchasing</TabsTrigger>
                <TabsTrigger value="accounting">Accounting</TabsTrigger>
                <TabsTrigger value="mrp">MRP</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Material Number:</span>
                  <span className="font-medium">{selectedMaterial.materialNumber}</span>
                  <span className="text-gray-500">Description:</span>
                  <span className="font-medium">{selectedMaterial.description}</span>
                  <span className="text-gray-500">Material Type:</span>
                  <span className="font-medium">{selectedMaterial.materialType}</span>
                  <span className="text-gray-500">Base Unit:</span>
                  <span className="font-medium">{selectedMaterial.baseUnit}</span>
                  <span className="text-gray-500">Material Group:</span>
                  <span className="font-medium">{selectedMaterial.materialGroup}</span>
                  <span className="text-gray-500">Plant:</span>
                  <span className="font-medium">{selectedMaterial.plant}</span>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={getStatusColor(selectedMaterial.status)}>{selectedMaterial.status}</Badge>
                  <span className="text-gray-500">Dimensions:</span>
                  <span className="font-medium">{selectedMaterial.dimensions || 'N/A'}</span>
                  <span className="text-gray-500">Weight:</span>
                  <span className="font-medium">{selectedMaterial.weight} {selectedMaterial.baseUnit}</span>
                  <span className="text-gray-500">Manufacturer:</span>
                  <span className="font-medium">{selectedMaterial.manufacturer || 'N/A'}</span>
                  <span className="text-gray-500">Brand:</span>
                  <span className="font-medium">{selectedMaterial.brand || 'N/A'}</span>
                </div>
              </TabsContent>
              <TabsContent value="purchasing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Net Value:</span>
                  <span className="font-medium">${(selectedMaterial.netValue || 0).toFixed(2)}</span>
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium">{selectedMaterial.currency || 'USD'}</span>
                  <span className="text-gray-500">Tax Code:</span>
                  <span className="font-medium">{selectedMaterial.taxCode || 'N/A'}</span>
                  <span className="text-gray-500">Origin Country:</span>
                  <span className="font-medium">{selectedMaterial.originCountry || 'N/A'}</span>
                  <span className="text-gray-500">Lead Time:</span>
                  <span className="font-medium">{selectedMaterial.leadTime || 0} days</span>
                </div>
              </TabsContent>
              <TabsContent value="accounting" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Valuation Class:</span>
                  <span className="font-medium">{selectedMaterial.valuationClass || 'N/A'}</span>
                  <span className="text-gray-500">Moving Average Price:</span>
                  <span className="font-medium">${(selectedMaterial.movingAveragePrice || 0).toFixed(2)}</span>
                  <span className="text-gray-500">Standard Price:</span>
                  <span className="font-medium">${(selectedMaterial.standardPrice || 0).toFixed(2)}</span>
                  <span className="text-gray-500">Unrestricted Stock:</span>
                  <span className="font-medium">{selectedMaterial.unrestrictedStock || 0}</span>
                  <span className="text-gray-500">Quality Inspection:</span>
                  <span className="font-medium">{selectedMaterial.qualityInspectionStock || 0}</span>
                  <span className="text-gray-500">Blocked Stock:</span>
                  <span className="font-medium">{selectedMaterial.blockedStock || 0}</span>
                </div>
              </TabsContent>
              <TabsContent value="mrp" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">MRP Type:</span>
                  <span className="font-medium">{selectedMaterial.mrpType || 'N/A'}</span>
                  <span className="text-gray-500">Reorder Point:</span>
                  <span className="font-medium">{selectedMaterial.reorderPoint || 0}</span>
                  <span className="text-gray-500">Safety Stock:</span>
                  <span className="font-medium">{selectedMaterial.safetyStock || 0}</span>
                  <span className="text-gray-500">Lot Size:</span>
                  <span className="font-medium">{selectedMaterial.lotSize || 'N/A'}</span>
                  <span className="text-gray-500">Storage Location:</span>
                  <span className="font-medium">{selectedMaterial.storageLocation || 'N/A'}</span>
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{selectedMaterial.createdAt}</span>
                  <span className="text-gray-500">Last Changed:</span>
                  <span className="font-medium">{selectedMaterial.lastChanged}</span>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialMaster;
