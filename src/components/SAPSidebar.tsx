
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVoiceAssistantContext } from '../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { Star, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Space {
  name: string;
  path: string;
}

const defaultSpaces: Space[] = [
  { name: 'Trial Center', path: '/trial-center' },
  { name: 'Finance', path: '/finance' },
  { name: 'Sales', path: '/sales' },
  { name: 'Procurement', path: '/procurement' },
  { name: 'Manufacturing', path: '/manufacturing' },
  { name: 'Supply Chain', path: '/supply-chain' },
  { name: 'Master Data', path: '/master-data' },
  { name: 'Project Management', path: '/project-management' },
  { name: 'Human Resources', path: '/human-resources' },
  { name: 'Business Intelligence', path: '/business-intelligence' },
];

let pinnedSpacesCache: Space[] = [...defaultSpaces];

const SAPSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [pinnedSpaces, setPinnedSpaces] = useState<Space[]>(pinnedSpacesCache);

  const savePinnedSpaces = (spaces: Space[]) => {
    pinnedSpacesCache = spaces;
    setPinnedSpaces(spaces);
  };

  const handleUnpinAll = () => {
    savePinnedSpaces([]);
    if (isEnabled) {
      speak('All spaces have been unpinned from your sidebar.');
    }
  };

  const handleUnpin = (path: string) => {
    const updated = pinnedSpaces.filter(s => s.path !== path);
    savePinnedSpaces(updated);
    if (isEnabled) {
      speak('Space has been unpinned from your sidebar.');
    }
  };

  const handlePin = (space: Space) => {
    if (!pinnedSpaces.find(s => s.path === space.path)) {
      savePinnedSpaces([...pinnedSpaces, space]);
      if (isEnabled) {
        speak(`${space.name} has been pinned to your sidebar.`);
      }
    }
  };

  const handleSpaceClick = (name: string) => {
    if (isEnabled) {
      speak(`Navigating to ${name} module.`);
    }
    onClose();
  };

  const unpinnedSpaces = defaultSpaces.filter(
    ds => !pinnedSpaces.find(ps => ps.path === ds.path)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30">
      <div className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-lg overflow-auto animate-slide-in-right">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">All My Apps</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {pinnedSpaces.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium flex justify-between">
                <span>Pinned Spaces ({pinnedSpaces.length})</span>
                <button 
                  onClick={handleUnpinAll}
                  className="text-sm text-blue-500 font-normal hover:text-blue-700"
                >
                  Unpin All
                </button>
              </h3>
              <ul className="mt-2 space-y-1">
                {pinnedSpaces.map((space) => (
                  <li key={space.path} className="group">
                    <Link
                      to={space.path}
                      className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => handleSpaceClick(space.name)}
                    >
                      <span>{space.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleUnpin(space.path);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className="h-4 w-4 text-blue-500" fill="#3b82f6" />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium">All Spaces</h3>
            <ul className="mt-2 space-y-1">
              {unpinnedSpaces.map((space) => (
                <li key={space.path} className="group">
                  <Link
                    to={space.path}
                    className="flex items-center justify-between py-3 px-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => handleSpaceClick(space.name)}
                  >
                    <span>{space.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handlePin(space);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className="h-4 w-4 text-gray-300 hover:text-blue-500" />
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAPSidebar;
