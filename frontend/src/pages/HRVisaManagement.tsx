import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store/store';
import {
  DocumentType,
  DocumentStatus,
  Document,
  selectVisaDocuments,
  selectVisaError,
  selectVisaMessage,
  selectVisaLoading,
  sendReminder,
  approveDocument,
  rejectDocument,
  loadEmployeeVisaData,
  selectEmployees,
  selectSearchTerm,
  selectSelectedStatus,
  selectActiveTab,
  selectSearchResults,
  setSearchTerm,
  setSelectedStatus,
  setActiveTab,
  setSearchResults,
} from '../store/slices/visaSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Check, X, Download, Eye } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import visaApi from '../api/visa';

interface EmployeeVisaData {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  documents: Document[];
  currentStep: DocumentType | null;
  workAuthorization: {
    title: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  nextStep: string;
  requiresHRApproval: boolean;
  pendingDocument?: Document;
}

const HRVisaManagementContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectEmployees);
  const searchTerm = useSelector(selectSearchTerm);
  const selectedStatus = useSelector(selectSelectedStatus);
  const activeTab = useSelector(selectActiveTab);
  const searchResults = useSelector(selectSearchResults);
  const visaMessage = useSelector(selectVisaMessage);
  const visaError = useSelector(selectVisaError);
  const loading = useSelector(selectVisaLoading);

  useEffect(() => {
    dispatch(loadEmployeeVisaData(activeTab));
    console.log('employees', employees);
  }, [dispatch, activeTab]);

  const handleApprove = async (visaId: string) => {
    try {
      await dispatch(approveDocument(visaId)).unwrap();
      await dispatch(loadEmployeeVisaData(activeTab));
      alert(visaMessage || 'Document approved successfully');
    } catch (err) {
      alert(visaError || 'Failed to approve document');
    }
  };

  const handleReject = async (visaId: string, feedback: string) => {
    try {
      await dispatch(rejectDocument({ visaId, feedback })).unwrap();
      await dispatch(loadEmployeeVisaData(activeTab));
      alert(visaMessage || 'Document rejected successfully');
    } catch (err) {
      alert(visaError || 'Failed to reject document');
    }
  };

  const handleSendReminder = async (visaId: string) => {
    try {
      console.log('visaId', visaId);
      await dispatch(sendReminder(visaId)).unwrap();
      alert(visaMessage || 'Reminder sent successfully');
    } catch (err) {
      alert(visaError || 'Failed to send reminder');
    }
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchTerm(value));
    if (!value.trim()) {
      dispatch(setSearchResults([]));
      return;
    }

    const searchLower = value.toLowerCase();
    const results = employees.filter((employee) => {
      const name = employee.user.username.toLowerCase();
      return name.includes(searchLower);
    });
    dispatch(setSearchResults(results));
  };

  const filteredEmployees = employees.filter((employee) => {
    if (!employee || !employee.user.username) return false;

    const matchesSearch = employee.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedStatus === 'ALL') return matchesSearch;

    return matchesSearch && employee.documents?.some((doc) => doc.status === selectedStatus);
  });

  const InProgressView = () => (
    <div className="space-y-6">
      {visaError && (
        <Alert variant="destructive">
          <AlertDescription>{visaError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by employee name..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          className="max-w-sm"
        />
        <Select
          value={selectedStatus}
          onValueChange={(value) => dispatch(setSelectedStatus(value as DocumentStatus | 'ALL'))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value={DocumentStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={DocumentStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={DocumentStatus.REJECTED}>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No visa documents found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Work Authorization</TableHead>
              <TableHead>Next Steps</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.user._id}>
                <TableCell>{employee.user.username}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      <strong>Title:</strong> {employee.workAuthorization.title}
                    </div>
                    <div>
                      <strong>Start Date:</strong> {new Date(employee.workAuthorization.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>End Date:</strong> {new Date(employee.workAuthorization.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Days Remaining:</strong> {employee.workAuthorization.daysRemaining}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.nextStep}</TableCell>
                <TableCell>
                  {employee.requiresHRApproval && employee.pendingDocument ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(employee.pendingDocument?.fileUrl, '_blank')}
                        >
                          View Document
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(employee._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const feedback = prompt('Please provide feedback for rejection:');
                            if (feedback) {
                              handleReject(employee._id, feedback);
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSendReminder(employee._id)}>
                      Send Notification
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const AllView = () => (
    <div className="space-y-6">
      {visaError && (
        <Alert variant="destructive">
          <AlertDescription>{visaError}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search by employee name..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {searchResults.length === 0
              ? 'No matching employees found'
              : searchResults.length === 1
              ? '1 matching employee found'
              : `${searchResults.length} matching employees found`}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (searchTerm ? searchResults : employees).length === 0 ? (
        <div className="text-center text-gray-500 py-4">No employees found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Work Authorization</TableHead>
              <TableHead>Documents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(searchTerm ? searchResults : employees).map((employee, index) => (
              <TableRow key={index}>
                <TableCell>{employee.user.username}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      <strong>Title:</strong> {employee.workAuthorization.title}
                    </div>
                    <div>
                      <strong>Start Date:</strong> {new Date(employee.workAuthorization.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>End Date:</strong> {new Date(employee.workAuthorization.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Days Remaining:</strong> {employee.workAuthorization.daysRemaining}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {employee.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="font-medium">{doc.type.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-500">({doc.status})</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => window.open(doc.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.fileUrl;
                              link.download = `${employee.user.username}_${doc.type}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>HR Visa Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveTab(value as 'in-progress' | 'all'))}>
                <TabsList className="mb-4">
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="in-progress">
                  <InProgressView />
                </TabsContent>
                <TabsContent value="all">
                  <AllView />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const HRVisaManagement = () => {
  return (
    <ErrorBoundary>
      <HRVisaManagementContent />
    </ErrorBoundary>
  );
};

export default HRVisaManagement;
