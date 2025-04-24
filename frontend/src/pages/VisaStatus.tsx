import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';
import {
  uploadDocument,
  loadVisaDocuments,
  selectVisaDocuments,
  selectVisaLoading,
  selectVisaError,
} from '../store/slices/visaSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Upload } from 'lucide-react';

const VisaStatus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const documents = useSelector(selectVisaDocuments);
  const loading = useSelector(selectVisaLoading);
  const error = useSelector(selectVisaError);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(loadVisaDocuments());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (type: 'opt_receipt' | 'opt_ead' | 'i983' | 'i20') => {
    if (selectedFile) {
      await dispatch(uploadDocument({ type, file: selectedFile }));
      setSelectedFile(null);
    }
  };

  const getNextDocumentType = () => {
    if (!documents.length) return 'opt_receipt';
    const lastDoc = documents[documents.length - 1];
    if (lastDoc.status === 'approved') {
      switch (lastDoc.type) {
        case 'opt_receipt':
          return 'opt_ead';
        case 'opt_ead':
          return 'i983';
        case 'i983':
          return 'i20';
        default:
          return null;
      }
    }
    return null;
  };

  const getStatusMessage = (document: any) => {
    switch (document.status) {
      case 'pending':
        return 'Waiting for HR to approve your document.';
      case 'approved':
        const nextDoc = getNextDocumentType();
        if (nextDoc) {
          return `Please upload your ${nextDoc.toUpperCase()} document.`;
        }
        return 'All documents have been approved.';
      case 'rejected':
        return document.feedback || 'Document was rejected. Please check with HR.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {documents.map((doc) => (
                  <div key={doc.type} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">{doc.type.toUpperCase().replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Status: {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{getStatusMessage(doc)}</p>
                    {doc.status === 'rejected' && doc.feedback && (
                      <p className="text-sm text-red-600 mb-4">Feedback: {doc.feedback}</p>
                    )}
                  </div>
                ))}

                {getNextDocumentType() && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Upload Next Document</h3>
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
                      />
                      <Button onClick={() => handleUpload(getNextDocumentType()!)} disabled={!selectedFile}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
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

export default VisaStatus;
