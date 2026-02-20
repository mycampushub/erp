
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistantContext } from '../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import PageHeader from '../components/page/PageHeader';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Briefcase, Calendar, Users, Clock, DollarSign, AlertTriangle, FileText, 
  BarChart3, ChevronRight, Layers, MessageSquare, Target, ClipboardList
} from 'lucide-react';
import { toast } from '../components/ui/use-toast';

interface PMCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const PMCard: React.FC<PMCardProps> = ({ title, subtitle, icon, onClick }) => (
  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
    <div className="flex items-start space-x-3">
      <div className="bg-blue-100 p-2 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </Card>
);

const ProjectManagement: React.FC = () => {
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Project Management. Plan, execute, and monitor your projects effectively.');
    }
  }, [isEnabled, speak]);

  const handleNavigate = (path: string) => {
    navigate(`/project-management/${path}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Project Management"
        description="Plan, execute, and monitor your projects effectively"
        voiceIntroduction="Welcome to Project Management. Here you can manage projects, resources, tasks, and track project performance."
      />

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-1 p-5">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Projects</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('')}>
                  <span>Overview</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('planning')}>
                  <span>Project Planning</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('execution')}>
                  <span>Project Execution</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('portfolio')}>
                  <span>Portfolio Management</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PMCard 
                title="Project Planning" 
                subtitle="Create and manage project plans"
                icon={<Target className="h-5 w-5 text-blue-600" />}
                onClick={() => handleNavigate('planning')}
              />
              <PMCard 
                title="Project Execution" 
                subtitle="Track and execute projects"
                icon={<ClipboardList className="h-5 w-5 text-green-600" />}
                onClick={() => handleNavigate('execution')}
              />
              <PMCard 
                title="Project Detail" 
                subtitle="View project details"
                icon={<FileText className="h-5 w-5 text-purple-600" />}
                onClick={() => handleNavigate('project/PRJ-001')}
              />
              <PMCard 
                title="Cost Management" 
                subtitle="Track project costs"
                icon={<DollarSign className="h-5 w-5 text-yellow-600" />}
                onClick={() => handleNavigate('cost-management')}
              />
              <PMCard 
                title="Risk Management" 
                subtitle="Identify and manage risks"
                icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                onClick={() => handleNavigate('risk-management')}
              />
              <PMCard 
                title="Documents" 
                subtitle="Manage project documents"
                icon={<Layers className="h-5 w-5 text-indigo-600" />}
                onClick={() => handleNavigate('documents')}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-1 p-5">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold">Resources</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('resources')}>
                  <span>Resource Management</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('time-recording')}>
                  <span>Time Recording</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PMCard 
                title="Resource Management" 
                subtitle="Manage team resources"
                icon={<Users className="h-5 w-5 text-green-600" />}
                onClick={() => handleNavigate('resources')}
              />
              <PMCard 
                title="Time Recording" 
                subtitle="Track time spent"
                icon={<Clock className="h-5 w-5 text-orange-600" />}
                onClick={() => handleNavigate('time-recording')}
              />
              <PMCard 
                title="Collaboration" 
                subtitle="Team collaboration"
                icon={<MessageSquare className="h-5 w-5 text-pink-600" />}
                onClick={() => handleNavigate('collaboration')}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-1 p-5">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold">Planning</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('planning')}>
                  <span>Project Planning</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('execution')}>
                  <span>Execution</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PMCard 
                title="Project Planning" 
                subtitle="Create project plans"
                icon={<Target className="h-5 w-5 text-blue-600" />}
                onClick={() => handleNavigate('planning')}
              />
              <PMCard 
                title="Project Execution" 
                subtitle="Execute and monitor"
                icon={<ClipboardList className="h-5 w-5 text-green-600" />}
                onClick={() => handleNavigate('execution')}
              />
              <PMCard 
                title="Milestones" 
                subtitle="Track milestones"
                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                onClick={() => handleNavigate('planning')}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-1 p-5">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold">Analytics</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('analytics')}>
                  <span>Project Analytics</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-between" onClick={() => handleNavigate('cost-management')}>
                  <span>Cost Reports</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PMCard 
                title="Project Analytics" 
                subtitle="Performance insights"
                icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
                onClick={() => handleNavigate('analytics')}
              />
              <PMCard 
                title="Cost Analysis" 
                subtitle="Cost tracking & analysis"
                icon={<DollarSign className="h-5 w-5 text-yellow-600" />}
                onClick={() => handleNavigate('cost-management')}
              />
              <PMCard 
                title="Risk Reports" 
                subtitle="Risk analysis"
                icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                onClick={() => handleNavigate('risk-management')}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
