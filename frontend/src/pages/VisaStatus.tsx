import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store/store';
import {
  uploadDocument,
  loadVisaDocuments,
  selectVisaDocuments,
  selectVisaError,
  selectVisaCurrentStep,
  selectVisaMessage,
  DocumentType,
  DocumentStatus,
  Document,
} from '../store/slices/visaSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Upload } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

const VisaStatusContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector(selectVisaDocuments);
  const currentStep = useSelector(selectVisaCurrentStep);
  const error = useSelector(selectVisaError);
  const alert = useSelector(selectVisaMessage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  useEffect(() => {
    dispatch(loadVisaDocuments());
  }, [dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && currentStep) {
      setUploadingType(currentStep);
      console.log('currentStep', currentStep);
      try {
        const response = await dispatch(uploadDocument({ type: currentStep, file: selectedFile }));
        console.log('response', response);
        setSelectedFile(null);
        await dispatch(loadVisaDocuments());
      } finally {
        setUploadingType(null);
        console.log('finished uploading');
      }
    }
  };

  const getStatusMessage = (document: Document) => {
    switch (document.status) {
      case DocumentStatus.PENDING:
        return 'Waiting for HR to review your document.';
      case DocumentStatus.APPROVED:
        return 'Document has been approved.';
      case DocumentStatus.REJECTED:
        return document.feedback || 'Document was rejected. Please check with HR.';
      default:
        return '';
    }
  };

  // Add helper function to check if upload section should be shown
  const shouldShowUploadSection = () => {
    if (!currentStep) return false;
    if (alert === 'All documents have been approved.') return false;

    const currentDoc = documents[documents.length - 1];
    // Show upload section if:
    // 1. No document exists for current step
    // 2. Current document is REJECTED (to allow new upload)
    // 3. Current document is APPROVED (to allow next step upload)
    return (
      !currentDoc || currentDoc.status === DocumentStatus.REJECTED || currentDoc.status === DocumentStatus.APPROVED
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Visa Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {alert && (
                  <Alert variant="default">
                    <AlertDescription>{alert}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {documents.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    <h3 className="text-lg font-medium mb-2">
                      {doc.type ? doc.type.replace('_', ' ') : 'Unknown Document Type'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Status: {doc.status}</p>
                    {doc.status !== DocumentStatus.REJECTED && (
                      <p className="text-sm text-gray-600 mb-4">{getStatusMessage(doc)}</p>
                    )}
                    {doc.status === DocumentStatus.REJECTED && doc.feedback && (
                      <p className="text-sm text-red-600 mb-4">Feedback: {doc.feedback}</p>
                    )}
                  </div>
                ))}

                {currentStep && shouldShowUploadSection() && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">
                      {documents.length > 0 && documents[documents.length - 1].status === DocumentStatus.REJECTED
                        ? 'Upload New File (Previous file was rejected)'
                        : `Upload ${currentStep ? currentStep.replace('_', ' ') : 'Document'}`}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                        disabled={uploadingType === currentStep}
                      />
                      <Button onClick={handleUpload} disabled={!selectedFile || uploadingType === currentStep}>
                        {uploadingType === currentStep ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const VisaStatus = () => {
  return (
    <ErrorBoundary>
      <VisaStatusContent />
    </ErrorBoundary>
  );
};

export default VisaStatus;
