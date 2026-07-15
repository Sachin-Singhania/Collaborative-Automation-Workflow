'use client';

import { ReactFlowProvider } from 'reactflow';
import { WorkflowPage } from '../../components/WorkflowPage';

export default function WorkflowPageRoute() {
  return (
    <ReactFlowProvider>
      <WorkflowPage />
    </ReactFlowProvider>
  );
}
