
import React, { useState } from 'react';

interface InsightSectionProps {
  title: string;
  count?: number;
}

const InsightSection: React.FC<InsightSectionProps> = ({ title, count = 2 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddTiles, setShowAddTiles] = useState(false);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="sap-section-title flex items-center">
          {`${title} (${count})`}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-blue-600"
          >
            <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </h2>
        
        <div>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => setShowAddTiles(!showAddTiles)}
          >
            Add Tiles
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded bg-white p-6 h-64 flex flex-col items-center justify-center">
          <p className="text-gray-500">No items available</p>
        </div>
        
        <div className="border rounded bg-white p-6 h-64 flex flex-col items-center justify-center">
          <p className="text-gray-500">No items available</p>
        </div>
      </div>
    </div>
  );
};

export default InsightSection;
