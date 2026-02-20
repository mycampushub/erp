
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SAPSection from '../components/SAPSection';
import SAPTile from '../components/SAPTile';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useVoiceAssistantContext } from '../context/VoiceAssistantContext';

const BusinessIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled: isVoiceAssistantEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  
  useEffect(() => {
    if (isVoiceAssistantEnabled) {
      speak("Welcome to the Business Intelligence module. Here you can access analytics, reporting, and data visualization tools for informed decision making.");
    }
  }, [isVoiceAssistantEnabled, speak]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Business Intelligence & Analytics</h1>

      <SAPSection 
        title="Executive Analytics" 
        isVoiceAssistantEnabled={isVoiceAssistantEnabled}
        description="High-level dashboards and KPIs for executive decision making."
      >
        <SAPTile 
          title="Executive Dashboard"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Comprehensive overview of business performance."
          icon={<span className="text-xl">📈</span>}
          onClick={() => navigate('/business-intelligence/executive')}
        />
        <SAPTile 
          title="KPI Monitoring"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Track key performance indicators across the organization."
          icon={<span className="text-xl">🎯</span>}
          onClick={() => navigate('/business-intelligence/executive')}
        />
        <SAPTile 
          title="Balanced Scorecard"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Strategic performance management framework."
          icon={<span className="text-xl">⚖️</span>}
          onClick={() => navigate('/business-intelligence/executive')}
        />
      </SAPSection>

      <SAPSection 
        title="Operational Analytics" 
        isVoiceAssistantEnabled={isVoiceAssistantEnabled}
        description="Detailed analytics for specific business functions."
      >
        <SAPTile 
          title="Financial Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Comprehensive financial performance analysis."
          icon={<span className="text-xl">💰</span>}
          onClick={() => navigate('/business-intelligence/financial')}
        />
        <SAPTile 
          title="Sales Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Sales performance and customer analytics."
          icon={<span className="text-xl">📊</span>}
          onClick={() => navigate('/business-intelligence/sales')}
        />
        <SAPTile 
          title="Manufacturing Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Production efficiency and quality analytics."
          icon={<span className="text-xl">🏭</span>}
          onClick={() => navigate('/business-intelligence/manufacturing')}
        />
      </SAPSection>

      <SAPSection 
        title="Advanced Analytics" 
        isVoiceAssistantEnabled={isVoiceAssistantEnabled}
        description="Predictive and real-time analytics capabilities."
      >
        <SAPTile 
          title="Predictive Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Machine learning and predictive modeling."
          icon={<span className="text-xl">🔮</span>}
          onClick={() => navigate('/business-intelligence/predictive')}
        />
        <SAPTile 
          title="Real-time Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Live data processing and instant insights."
          icon={<span className="text-xl">⚡</span>}
          onClick={() => navigate('/business-intelligence/realtime')}
        />
        <SAPTile 
          title="Data Mining"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Discover patterns and insights in large datasets."
          icon={<span className="text-xl">⛏️</span>}
          onClick={() => navigate('/business-intelligence/predictive')}
        />
      </SAPSection>

      <SAPSection 
        title="Reporting & Visualization" 
        isVoiceAssistantEnabled={isVoiceAssistantEnabled}
        description="Create and manage reports and data visualizations."
      >
        <SAPTile 
          title="Report Builder"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Create custom reports and analytics."
          icon={<span className="text-xl">📋</span>}
          onClick={() => navigate('/business-intelligence/report-builder')}
        />
        <SAPTile 
          title="Data Visualization"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Interactive charts and visual analytics."
          icon={<span className="text-xl">📊</span>}
          onClick={() => navigate('/business-intelligence/visualization')}
        />
        <SAPTile 
          title="Mobile Analytics"
          isVoiceAssistantEnabled={isVoiceAssistantEnabled}
          description="Access analytics on mobile devices."
          icon={<span className="text-xl">📱</span>}
          onClick={() => navigate('/business-intelligence/realtime')}
        />
      </SAPSection>
    </div>
  );
};

export default BusinessIntelligence;
