import { Documents } from "./schema";
import { Button } from '@/components/ui/button';
import { handleFilePreview, handleFileDownload } from '@/utils/fileHandlers';

const DocumentList: React.FC<{ documents: Documents }> = ({ documents = [] }) => {
  // Group documents by type and get the most recent one for each type
  const latestDocuments = documents.reduce((acc, doc) => {
    if (!doc.uploadDate) return acc;
    
    const existingDoc = acc.get(doc.type);
    if (!existingDoc || 
        (existingDoc.uploadDate && new Date(doc.uploadDate) > new Date(existingDoc.uploadDate))) {
      acc.set(doc.type, doc);
    }
    return acc;
  }, new Map());

  return (
	<div className="space-y-3">
	  {Array.from(latestDocuments.values()).map((doc, index) => (
		<div key={index} className="flex items-center justify-between p-3 border rounded">
			<div>
				<p className="font-medium">{doc.type.replace(/_/g, ' ')}</p>
				<p className="text-sm text-gray-500">{doc.fileName}</p>
				{doc.uploadDate && (
					<p className="text-xs text-gray-400">
						Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
					</p>
				)}
			</div>
			<div className="space-x-2">
				<Button 
					variant="outline" 
					size="sm" 
					onClick={() => doc.fileUrl && handleFilePreview(doc.fileUrl)}
					disabled={!doc.fileUrl}
				>
					Preview
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => doc.fileUrl && handleFileDownload(doc.fileUrl, doc.fileName)}
					disabled={!doc.fileUrl}
				>
					Download
				</Button>
			</div>
		</div>
	  ))}
	</div>
  );
};

export default DocumentList;