import { Documents } from "./schema";
import { Button } from '@/components/ui/button';
import { handleFilePreview, handleFileDownload } from '@/utils/fileHandlers';

const DocumentList: React.FC<{ documents: Documents }> = ({ documents }) => {
  return (
	<div className="space-y-3">
	  {documents?.map((doc, index) => (
		<div key={index} className="flex items-center justify-between p-3 border rounded">
			<div>
				<p className="font-medium">{doc.type.replace(/_/g, ' ')}</p>
				<p className="text-sm text-gray-500">{doc.fileName}</p>
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