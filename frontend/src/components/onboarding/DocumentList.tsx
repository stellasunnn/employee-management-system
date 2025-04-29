import { Documents } from "./schema";

const DocumentList: React.FC<{ documents: Documents }> = ({ documents }) => {
  return (
	<div>
	  {documents?.map((document, index) => (
		<div key={index}>{document.fileName}</div>
	  ))}
	</div>
  );
};
export default DocumentList;