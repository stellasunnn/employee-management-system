import React, { use, useEffect, useMemo, useState } from 'react';
import ApplicationView from '@/components/shared-components/ApplicationView';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { AppDispatch, RootState } from '@/store/store';
import { fetchApplications, approveApplication, rejectApplication, setCurrentStatus } from '@/store/slices/hrSlice';
import { OnboardingFormData } from '@/components/onboarding/schema';
import { selectOnboardingData } from '@/store/slices/onboardingSlice';

const EmployeeProfiles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading, error, currentStatus } = useSelector((state: RootState) => state.hr);
  // const { onboardingData } = useSelector(selectOnboardingData);

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackMode, setFeedbackMode] = useState(false);
  const onboardingData = useSelector(selectOnboardingData);

  useEffect(() => {
    dispatch(fetchApplications('approved'));
  }, [dispatch]);
  console.log('Applications:', applications);

  useEffect(() => {});
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    console.log('Selected application:', selectedApplication);
    setViewOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredApplications = useMemo(() => {
    const sorted = [...applications].sort((a, b) => a.lastName.localeCompare(b.lastName));
    if (!searchTerm.trim()) return sorted;

    const term = searchTerm.toLowerCase().trim();
    return sorted.filter(
      (app) =>
        app.firstName.toLowerCase().includes(term) ||
        app.lastName.toLowerCase().includes(term) ||
        (app.preferredName && app.preferredName.toLowerCase().includes(term)),
    );
  }, [applications, searchTerm]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Profiles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : sortedAndFilteredApplications.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            {searchTerm.trim() ? 'No employees match your search.' : 'No employees.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full-Name</TableHead>
                <TableHead>SSN</TableHead>
                <TableHead>Work-Authorization-Title</TableHead>
                <TableHead>Phone-Number</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredApplications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    <button
                      className="text-primary bg-primary/10 px-3 py-1 rounded-md hover:bg-primary/20 transition-colors"
                      onClick={() => handleViewApplication(app)}
                    >
                      {app.firstName} {app.lastName}
                    </button>
                  </TableCell>
                  <TableCell>{app.ssn}</TableCell>
                  <TableCell>
                    {app.citizenshipStatus.isPermanentResident
                      ? 'Green Card / Citizen'
                      : app.citizenshipStatus.workAuthorizationType}
                  </TableCell>
                  <TableCell>{app.cellPhone}</TableCell>
                  <TableCell>{app.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Application View Dialog */}
        {selectedApplication && (
          <Dialog
            open={viewOpen}
            onOpenChange={(open) => {
              setViewOpen(open);
              if (!open) {
                setSelectedApplication(null);
                setFeedback('');
                setFeedbackMode(false);
              }
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedApplication.firstName} {selectedApplication.lastName}'s Profile
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <ApplicationView
                  formData={selectedApplication}
                  documents={selectedApplication.documents || []}
                  isHRView={false}
                  isEmployeeProfile={true}
                  rejectionFeedback={selectedApplication.rejectionFeedback}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeProfiles;
