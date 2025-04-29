import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Document } from '../../types';
import onboardingApi from '../../api/onboarding';

const DocumentList: React.FC<{ documents: Document[] }> = ({ documents }) => {
  return (
	<div>
	  {documents.map((document, index) => (
		<div key={index}>{document.fileName}</div>
	  ))}
	</div>
  );
};
export default DocumentList;