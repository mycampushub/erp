
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import ProductionOrders from './components/ProductionOrders';
import ProductionChart from './components/ProductionChart';
import { ArrowLeft } from 'lucide-react';

const ProductionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();

  React.useEffect(() => {
    if (isEnabled) {
      speak('You are now in the Production page. Here you can manage all your production orders and operations.');
    }
  }, [isEnabled, speak]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/manufacturing')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Production Management"
          description="Monitor and manage production orders, materials, and operations"
          voiceIntroduction="Welcome to Production Management. Here you can monitor and manage all your production activities."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductionChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Production Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Orders</span>
              <span className="font-semibold">124</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Planned Orders</span>
              <span className="font-semibold">87</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Today</span>
              <span className="font-semibold">16</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency Rate</span>
              <span className="font-semibold">92.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Production Orders</h2>
        </div>
        <div className="p-6">
          <ProductionOrders />
        </div>
      </div>
    </div>
  );
};

export default ProductionPage;
