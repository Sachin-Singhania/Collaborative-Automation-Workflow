'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '../lib/store';
import { Plus } from 'lucide-react';
import { createActionreturnId } from '../lib/actions/api';

interface TriggerNodeProps {
  data: {
    label: string;
  };
  id: string;
  isConnectable: boolean;
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data, id, isConnectable }) => {
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const edges = useWorkflowStore((state) => state.edges);
  const currentWorkflow= useWorkflowStore((state)=> state.workflowId);
  const [isHovering, setIsHovering] = useState(false);
  const addActionAfter = useWorkflowStore((state) => state.addActionAfter);
  const hasOutgoingConnection = edges.some((edge) => edge.source === id);
  const addNode = async ()=>{
    try {
      if(!currentWorkflow || !selectedNodeId){
        return;
      }

      const add = await createActionreturnId(currentWorkflow,selectedNodeId);
      if(add.ok){
            addActionAfter(selectedNodeId,add.value.stepId);
            return;
          }
    } catch (error) {
      console.log(error)      
    }
  }

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative"
    >
      <div className="px-4 py-3 bg-white border-2 border-blue-600 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <p className="font-semibold text-gray-900">{data.label}</p>
            <p className="text-xs text-gray-500">Trigger</p>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="bg-blue-600!"
        />
      </div>

      {/* Plus button below node on hover - only show if no outgoing connection */}
      {!hasOutgoingConnection && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            addNode()
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={`absolute left-1/2 -translate-x-1/2 -bottom-6 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-all shadow-lg pointer-events-auto z-50 ${
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
