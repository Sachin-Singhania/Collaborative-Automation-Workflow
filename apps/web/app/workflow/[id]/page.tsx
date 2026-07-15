'use client';

import { ReactFlowProvider } from 'reactflow';
import { useParams } from 'next/navigation';
import { WorkflowPage } from '../../../components/WorkflowPage';

export default function WorkflowDetailPage() {
  const params = useParams();
  const zapId = params.id as string;

  return (
    <ReactFlowProvider>
      <WorkflowPage />
    </ReactFlowProvider>
  );
}
