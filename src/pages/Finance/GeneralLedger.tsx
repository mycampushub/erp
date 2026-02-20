import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, BookOpen, Calculator, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

interface JournalEntry {
  id: string;
  documentNumber: string;
  postingDate: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  reference: string;
}

const GeneralLedger: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('entries');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to General Ledger. The central repository for all financial transactions, providing real-time accounting with the Universal Journal.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const sampleEntries: JournalEntry[] = [
      {
        id: 'je-001',
        documentNumber: 'DOC-2025-001',
        postingDate: '2025-01-20',
        account: '100000',
        accountName: 'Cash and Cash Equivalents',
        debit: 15000.00,
        credit: 0,
        description: 'Customer payment received',
        reference: 'CINV-2025-001'
      },
      {
        id: 'je-002',
        documentNumber: 'DOC-2025-001',
        postingDate: '2025-01-20',
        account: '130000',
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: 15000.00,
        description: 'Customer payment received',
        reference: 'CINV-2025-001'
      }
    ];
    setJournalEntries(sampleEntries);
  }, []);

  const columns: EnhancedColumn[] = [
    { key: 'documentNumber', header: 'Document #', sortable: true, searchable: true },
    { key: 'postingDate', header: 'Posting Date', sortable: true },
    { key: 'account', header: 'Account', searchable: true },
    { key: 'accountName', header: 'Account Name', searchable: true },
    { 
      key: 'debit', 
      header: 'Debit',
      sortable: true,
      render: (value: number) => value > 0 ? `$${value.toLocaleString()}` : '-'
    },
    { 
      key: 'credit', 
      header: 'Credit',
      sortable: true,
      render: (value: number) => value > 0 ? `$${value.toLocaleString()}` : '-'
    },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'reference', header: 'Reference', searchable: true }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="General Ledger"
          description="Central repository for all financial transactions with real-time posting"
          voiceIntroduction="Welcome to General Ledger, the heart of SAP S/4HANA financial accounting."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="General Ledger and Universal Journal"
        examples={[
          "Understanding the Universal Journal as the single source of truth for all financial and management accounting data",
          "Real-time posting of transactions with immediate impact on financial statements and reports",
          "Managing account hierarchies, cost center assignments, and profit center allocations"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{journalEntries.length}</div>
            <div className="text-sm text-muted-foreground">Journal Entries</div>
            <div className="text-sm text-blue-600">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${journalEntries.reduce((sum, entry) => sum + entry.debit, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Debits</div>
            <div className="text-sm text-green-600">Balanced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${journalEntries.reduce((sum, entry) => sum + entry.credit, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Credits</div>
            <div className="text-sm text-green-600">Balanced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,245</div>
            <div className="text-sm text-muted-foreground">Chart of Accounts</div>
            <div className="text-sm text-purple-600">Active accounts</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Journal Entries
                </span>
                <Button onClick={() => toast({ title: 'Post Entry', description: 'Opening journal entry form' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Entry
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={journalEntries}
                searchPlaceholder="Search journal entries..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { range: '100000-199999', type: 'Assets', count: 245 },
                  { range: '200000-299999', type: 'Liabilities', count: 156 },
                  { range: '300000-399999', type: 'Equity', count: 45 },
                  { range: '400000-499999', type: 'Revenue', count: 123 },
                  { range: '500000-599999', type: 'Cost of Sales', count: 234 },
                  { range: '600000-699999', type: 'Operating Expenses', count: 442 }
                ].map((category, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{category.type}</h4>
                        <p className="text-sm text-muted-foreground">Account Range: {category.range}</p>
                      </div>
                      <Badge variant="outline">{category.count} accounts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Trial Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
                  <div>Account</div>
                  <div>Account Name</div>
                  <div className="text-right">Debit</div>
                  <div className="text-right">Credit</div>
                </div>
                {[
                  { account: '100000', name: 'Cash and Cash Equivalents', debit: 125000, credit: 0 },
                  { account: '130000', name: 'Accounts Receivable', debit: 85000, credit: 0 },
                  { account: '200000', name: 'Accounts Payable', debit: 0, credit: 45000 },
                  { account: '400000', name: 'Sales Revenue', debit: 0, credit: 165000 }
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 py-2">
                    <div className="font-mono">{item.account}</div>
                    <div>{item.name}</div>
                    <div className="text-right">{item.debit > 0 ? `$${item.debit.toLocaleString()}` : '-'}</div>
                    <div className="text-right">{item.credit > 0 ? `$${item.credit.toLocaleString()}` : '-'}</div>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-4 pt-2 border-t font-semibold">
                  <div className="col-span-2">Total</div>
                  <div className="text-right">$210,000</div>
                  <div className="text-right">$210,000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Assets</span>
                    <span className="font-medium">$2,450,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Liabilities</span>
                    <span className="font-medium">$1,200,000</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Equity</span>
                    <span>$1,250,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Period Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium text-green-600">$565,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-medium text-red-600">$385,000</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Net Income</span>
                    <span className="text-green-600">$180,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralLedger;
