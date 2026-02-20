
import React from 'react';
import SAPTile from '../../../components/SAPTile';
import { useVoiceAssistantContext } from '../../../context/VoiceAssistantContext';
import { useToast } from '../../../hooks/use-toast';

const LearningResources: React.FC = () => {
  const { isEnabled } = useVoiceAssistantContext();
  const { toast } = useToast();
  
  const handleTileClick = (title: string) => {
    toast({
      title: `Opening ${title}`,
      description: `Navigating to ${title}...`,
    });
  };
  
  return (
    <>
      <SAPTile 
        title="Tutorials"
        isVoiceAssistantEnabled={isEnabled}
        description="Step-by-step guides for learning SAP S/4HANA."
        icon={<span className="text-xl">📚</span>}
        examples="These tutorials cover various system functions with detailed instructions. For example, the 'Create a Sales Order' tutorial walks you through the complete process from selecting a customer to confirming the order."
        onClick={() => handleTileClick('Tutorials')}
      />
      <SAPTile 
        title="Documentation"
        isVoiceAssistantEnabled={isEnabled}
        description="Access comprehensive system documentation."
        icon={<span className="text-xl">📖</span>}
        examples="The documentation provides detailed reference material for all SAP S/4HANA modules and functions, including technical specifications and process descriptions."
        onClick={() => handleTileClick('Documentation')}
      />
      <SAPTile 
        title="Video Training"
        isVoiceAssistantEnabled={isEnabled}
        description="Watch video tutorials and demonstrations."
        icon={<span className="text-xl">🎥</span>}
        examples="These video tutorials demonstrate key processes and features with visual guides. For example, the 'Financial Closing Process' video shows the complete workflow with expert commentary."
        onClick={() => handleTileClick('Video Training')}
      />
      <SAPTile 
        title="Learning Paths"
        isVoiceAssistantEnabled={isEnabled}
        description="Follow structured learning sequences."
        icon={<span className="text-xl">🛤️</span>}
        examples="Learning paths provide a curated sequence of materials for specific roles or objectives. For example, the 'Financial Accounting Specialist' path covers all relevant modules and processes for that role."
        onClick={() => handleTileClick('Learning Paths')}
      />
    </>
  );
};

export default LearningResources;
