
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { ArrowLeft, Box, Warehouse as WarehouseIcon, ArrowUpDown, ArrowLeftRight } from 'lucide-react';
import InventoryManagement from './components/InventoryManagement';
import { listEntities } from '../../lib/localCrud';

interface InventoryItem {
  id: string;
  materialNumber: string;
  stockQuantity: number;
  averageCost: number;
  [key: string]: any;
}

interface StockMovement {
  id: string;
  movementType: string;
  status: string;
  [key: string]: any;
}

interface Warehouse {
  id: string;
  capacity: number;
  usedCapacity: number;
  [key: string]: any;
}

const WarehousePage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [stats, setStats] = useState({
    totalInventory: 0,
    utilization: 0,
    inbound: 0,
    outbound: 0,
  });

  useEffect(() => {
    if (isEnabled) {
      speak('You are now in the Warehouse Management page. Here you can manage inventory, stock movements, and warehouse operations.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const loadStats = () => {
      const inventory = listEntities<InventoryItem>('warehouse_inventory');
      const movements = listEntities<StockMovement>('warehouse_movements');
      const warehouses = listEntities<Warehouse>('warehouse_warehouses');

      const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.stockQuantity * item.averageCost), 0);
      const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
      const usedCapacity = warehouses.reduce((sum, w) => sum + w.usedCapacity, 0);
      const utilization = totalCapacity > 0 ? ((usedCapacity / totalCapacity) * 100) : 0;
      const inbound = movements.filter(m => m.movementType === 'Goods Receipt' && m.status === 'Pending').length;
      const outbound = movements.filter(m => m.movementType === 'Goods Issue' && m.status === 'Pending').length;

      setStats({
        totalInventory: totalInventoryValue,
        utilization: utilization,
        inbound: inbound,
        outbound: outbound,
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-shrink-0"
          onClick={() => navigate('/manufacturing')}
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" /> Back
        </Button>
        <div className="flex-1 w-full">
          <PageHeader
            title="Warehouse Management"
            description="Manage inventory, stock movements, and warehouse operations"
            voiceIntroduction="Welcome to Warehouse Management. Here you can manage all warehouse operations."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Total Inventory</h3>
          <div className="text-xl sm:text-3xl font-semibold mb-1 sm:mb-2">${stats.totalInventory.toLocaleString()}</div>
          <div className="flex items-center">
            <span className="text-green-500 text-xs sm:text-sm font-medium">↑ 4.2%</span>
            <span className="text-xs text-gray-500 ml-1 sm:ml-2 hidden xs:inline">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Utilization</h3>
          <div className="text-xl sm:text-3xl font-semibold mb-1 sm:mb-2">{stats.utilization.toFixed(1)}%</div>
          <div className="flex items-center">
            <span className="text-red-500 text-xs sm:text-sm font-medium">↓ 2.1%</span>
            <span className="text-xs text-gray-500 ml-1 sm:ml-2 hidden xs:inline">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Inbound</h3>
          <div className="text-xl sm:text-3xl font-semibold mb-1 sm:mb-2">{stats.inbound}</div>
          <div className="flex items-center">
            <span className="text-green-500 text-xs sm:text-sm font-medium">↑ 8</span>
            <span className="text-xs text-gray-500 ml-1 sm:ml-2 hidden xs:inline">vs yesterday</span>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Outbound</h3>
          <div className="text-xl sm:text-3xl font-semibold mb-1 sm:mb-2">{stats.outbound}</div>
          <div className="flex items-center">
            <span className="text-green-500 text-xs sm:text-sm font-medium">↑ 12</span>
            <span className="text-xs text-gray-500 ml-1 sm:ml-2 hidden xs:inline">vs yesterday</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-3 sm:p-4">
          <InventoryManagement />
        </div>
      </div>
    </div>
  );
};

export default WarehousePage;
