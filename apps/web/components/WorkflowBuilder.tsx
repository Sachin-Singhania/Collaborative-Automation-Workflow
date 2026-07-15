'use client';

import { WorkflowStep } from '@repo/database';
import { ChevronLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getWorkflow } from '../lib/actions/api';
import { useWorkflowStore } from '../lib/store';
import { ActionNode } from './ActionNode';
import { Sidebar } from './Sidebar';
import { TriggerNode } from './TriggerNode';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

export function convertToReactFlowNodes(steps: WorkflowStep[]): Node[] {
  return steps.map((step, index) => ({
    id: step.id,
    type: step.type === "TRIGGER" ? "trigger" : "action",
    position: {
      x: 300,
      y: index * 180,
    },
    data: {
      label: step.settings?.label ?? (step.type === "TRIGGER" ? "Select App" : "Action"),
    },
  }));
}
export function convertToReactFlowEdges(steps: WorkflowStep[]): Edge[] {
  return steps
    .filter((step) => step.nextStepId)
    .map((step) => ({
      id: `${step.id}-${step.nextStepId}`,
      source: step.id,
      target: step.nextStepId!,
    }));
}
export const WorkflowBuilder: React.FC = () => {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig)
  const updateNodePosition = useWorkflowStore((state) => state.updateNodePosition);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const setMappingNodes = useWorkflowStore((state) => state.setMappingNodes);
  const isConfigPanelOpen = useWorkflowStore((state) => state.isConfigPanelOpen);
  const setIsConfigPanelOpen = useWorkflowStore((state) => state.setIsConfigPanelOpen);
  const updateWorkflowId = useWorkflowStore((state) => state.updateWorkflowId);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const zapId = params.id as string;

  useEffect(() => {
    async function load() {
      const workflow = await getWorkflow(zapId);
      if (!workflow.ok) {
        console.error("Failed to load workflow", workflow.error);
        return;
      }
      const steps = workflow.value.data.steps;
      console.log("Loaded workflow steps:", steps);
      setNodes(convertToReactFlowNodes(steps));
      setEdges(convertToReactFlowEdges(steps));
      updateWorkflowId(workflow.value.data.id);
     steps.forEach((step) => {
        updateNodeConfig(step.id, {
          appId: step.appId,
          eventId: step.eventId,
          fields: step.settings
        });
      });

      updateWorkflowId(workflow.value.data.id);
      interface MappingNode {
  nodeId: string;
  stepNumber: number;
  appName: string;
  outputs: string[];
}
      const mappingNodes: MappingNode[] = steps.map((step, index) => ({
  nodeId: step.id,
  stepNumber: index + 1,
  appName: step?.settings?.label,
  outputs:
    step.type === "TRIGGER"
      ? Object.keys(step?.settings?.payload ?? {})
      : Object.keys(step.settings ?? {}),
}));
  console.log(mappingNodes)
setMappingNodes(mappingNodes);
      setLoading(false);
    }

    load();
  }, []);
  const flowNodes = useWorkflowStore((state) => {
    return state.nodes;
  });
  const flowEdges = useWorkflowStore((state) => state.edges);

  const setNodes = useWorkflowStore((state) => state.setNodes);
  const setEdges = useWorkflowStore((state) => state.setEdges);
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, flowNodes));
    },
    [flowNodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, flowEdges));
    },
    [flowEdges, setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(
        addEdge(
          {
            ...connection,
            animated: true,
            style: {
              stroke: '#5B3FFF',
              strokeWidth: 2,
            },
          },
          flowEdges
        )
      );
    },
    [flowEdges, setEdges]
  );
  const handlePaneClick = () => {
    setSelectedNodeId(null);
  };


  return (
    <div className="flex w-full h-screen bg-gray-50 bg-linear-to-br from-[#f8fbff] via-[#eef6ff] to-[#dbeeff]">
      {/* React Flow Canvas */}
      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneClick={handlePaneClick}
          fitView
          onNodeDragStop={(event, node) => {
            updateNodePosition(node.id, node.position);
          }}
        >
          {!isConfigPanelOpen && (
            <button
              onClick={() => setIsConfigPanelOpen(true)}
              className="absolute top-4 right-4 z-10 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-lg"
              title="Open config panel"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          )}
          <Background gap={12} size={2} />

        </ReactFlow>
      </div>
      {selectedNodeId &&
        <Sidebar nodeId={selectedNodeId} />
      }
    </div>
  );
};
