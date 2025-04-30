import { toast } from 'react-hot-toast';

/**
 * Handle file preview in a new tab
 * @param url - The URL of the file to preview
 */
export const handleFilePreview = (url: string) => {
  window.open(url, '_blank');
};

/**
 * Handle file download with progress feedback
 * @param fileUrl - The URL of the file to download
 * @param fileName - The name to save the file as
 */
export const handleFileDownload = async (fileUrl: string, fileName: string) => {
  try {
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      throw new Error('Invalid file URL');
    }

    const response = await fetch(`/api/files/download/${filename}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    toast.success('File downloaded successfully');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download file');
  }
}; 