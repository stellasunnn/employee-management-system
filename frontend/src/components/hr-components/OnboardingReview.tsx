import React, { useState, useEffect } from 'react';
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
import { OnboardingFormData } from '../onboarding/schema';
import ApplicationView from '../shared-components/ApplicationView';

const OnboardingReview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading, error, currentStatus } = useSelector((state: RootState) => state.hr);

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackMode, setFeedbackMode] = useState(false);

  useEffect(() => {
    dispatch(fetchApplications(currentStatus));
  }, [dispatch, currentStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleTabChange = (value: 'pending' | 'approved' | 'rejected') => {
    dispatch(setCurrentStatus(value));
    dispatch(fetchApplications(value));
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    console.log('Selected application:', selectedApplication);
    setViewOpen(true);
  };

  const handleApprove = (applicationId: string) => {
    const id = applicationId || selectedApplication?._id;
    dispatch(approveApplication(id))
      .unwrap()
      .then(() => {
        toast.success('Application approved successfully');
        setViewOpen(false);
        dispatch(fetchApplications(currentStatus));
      })
      .catch((err) => toast.error(err || 'Failed to approve application'));
  };

  const handleReject = (applicationId: string, feedback: string) => {
    const id = applicationId || selectedApplication?._id;
    dispatch(rejectApplication({ id, feedback }))
      .unwrap()
      .then(() => {
        toast.success('Application rejected successfully');
        setViewOpen(false);
        setFeedback('');
        setFeedbackMode(false);
        dispatch(fetchApplications(currentStatus));
      })
      .catch((err) => toast.error(err || 'Failed to reject application'));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Onboarding Application Review</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStatus} onValueChange={(value) => handleTabChange(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={currentStatus} className="mt-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-center py-6 text-gray-500">No {currentStatus} applications found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell className="font-medium">
                        {app.firstName} {app.lastName}
                      </TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewApplication(app)}>
                          View Application
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

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
                  {selectedApplication.firstName} {selectedApplication.lastName}'s Application
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <ApplicationView
                  formData={selectedApplication}
                  documents={selectedApplication.documents || []}
                  isHRView={true}
                  rejectionFeedback={selectedApplication.rejectionFeedback}
                />

                {/* Actions (only for pending applications) */}
                {currentStatus === 'pending' && (
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium mb-4">Application Review</h3>

                    {feedbackMode ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rejection Feedback</label>
                          <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Please explain why this application is being rejected..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setFeedbackMode(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(selectedApplication.id, feedback)}
                            disabled={!feedback.trim()}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setFeedbackMode(true)}>
                          Reject
                        </Button>
                        <Button onClick={() => handleApprove(selectedApplication.id)}>Approve</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

// Simplified ApplicationDisplay component
const ApplicationDisplay = ({ application }: { application: OnboardingFormData }) => {
  return (
    <div className="space-y-6">
      {/* Name & Profile Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Name & Profile</h2>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-700">
            {application.firstName?.[0]}
            {application.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p>
                  {application.firstName} {application.middleName || ''} {application.lastName}
                </p>
              </div>
              {application.preferredName && (
                <div>
                  <p className="text-sm text-gray-500">Preferred Name</p>
                  <p>{application.preferredName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add other sections similar to your Home.tsx here */}
      {/* Personal Info Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{application.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SSN</p>
            <p>{application.ssn?.replace(/\d(?=\d{4})/g, '*')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p>{new Date(application.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p>{application.gender?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Continue with other sections from your Home.tsx */}
    </div>
  );
};

export default OnboardingReview;
