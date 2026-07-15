'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '../lib/store';
import { Plus, X } from 'lucide-react';
import { createActionreturnId, deleteWorkflowStep } from '../lib/actions/api';

interface ActionNodeProps {
  data: {
    label: string;
  };
  id: string;
  isConnectable: boolean;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data, id, isConnectable }) => {
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const edges = useWorkflowStore((state) => state.edges);
  const [isHovering, setIsHovering] = useState(false);
  const addActionAfter = useWorkflowStore((state) => state.addActionAfter);
  const hasOutgoingConnection = edges.some((edge) => edge.source === id);

  const handleRemove = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      const res = await deleteWorkflowStep(id);
      if (!res.ok) {
        console.error("Failed to delete workflow step", res.error);
        return;
      }
      removeNode(id);
      console.log("Delete response:", res.value.deletedStepId);
    } catch (error) {
      console.error("Error deleting workflow step", error);
    }
  };

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative"
    >
      <div className="px-4 py-3 bg-white border-2 border-purple-600 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-semibold text-gray-900">{data.label}</p>
              <p className="text-xs text-gray-500">Action</p>
            </div>
          </div>
          {isHovering && !hasOutgoingConnection && (
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
              title="Remove action"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="bg-purple-600!"
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="bg-purple-600!"
        />
      </div>

      {!hasOutgoingConnection && (
        <button
          onClick={async (e) => {
            if(!selectedNodeId) return;
            e.stopPropagation();
            e.preventDefault();
            const res= await createActionreturnId(workflowId,selectedNodeId)
            if(res.ok){
              addActionAfter(selectedNodeId,res.value.stepId);
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={`absolute left-1/2 -translate-x-1/2 -bottom-6 bg-purple-600 text-white rounded-full p-2 hover:bg-purple-700 transition-all shadow-lg pointer-events-auto z-50 ${
            isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Add action"
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );
};
