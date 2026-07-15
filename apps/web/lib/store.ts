import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { createActionreturnId } from './actions/api';

interface NodeConfig {
  appId?: string;
  eventId?: string;
  fields?: Record<string, any>;
}
interface AppConnected {
  appId?:string;
  accountEmail?:string;
}
interface MappingNode {
  nodeId: string;
  stepNumber: number;
  appName: string;
  outputs: string[];
}


export interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  nodeConfigs: Record<string, NodeConfig>;
  connectedApps : AppConnected[];
  isZapRunsOpen: boolean;
  isConfigPanelOpen: boolean;
  workflowId: string;
    mappingNodes: MappingNode[];

  setMappingNodes: (nodes: MappingNode[]) => void;

  getPreviousNodes: (
    currentNodeId: string
  ) => MappingNode[];
  
  // Actions
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, config: Partial<NodeConfig>) => void;
  getNodeConfig: (nodeId: string) => NodeConfig;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (nodeId: string) => void;
  setIsZapRunsOpen: (isOpen: boolean) => void;
  setIsConfigPanelOpen: (isOpen: boolean) => void;
  addActionAfter: (parentId: string,stepId:string) => void;
  updateNode: (nodeId:string , data:any) => void;
  getPrevNode: (nodeId: string) => Node | null;
  initializeWorkflow: (workflowId: string, triggerId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateWorkflowId: (workflowId: string) => void;
isAppConnected: (appId: any) => AppConnected | undefined
  setConnectedApp: (app: AppConnected) => void;
}

const initialNodes: Node[] = [
];

const initialEdges: Edge[] = [
 
];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  workflowId: "",
  connectedApps : [],
  selectedNodeId: null,
  isZapRunsOpen: true,
  isConfigPanelOpen: true,
  nodeConfigs: {},
mappingNodes: [],

setMappingNodes: (nodes) =>
  set({
    mappingNodes: nodes,
  }),

getPreviousNodes: (currentNodeId) => {
  const nodes = get().mappingNodes;

  const currentIndex = nodes.findIndex(
    (n) => n.nodeId === currentNodeId
  );
  return nodes.slice(0, currentIndex);
},
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setIsZapRunsOpen: (isOpen) => set({ isZapRunsOpen: isOpen }),
  setIsConfigPanelOpen: (isOpen) => set({ isConfigPanelOpen: isOpen }),
  setConnectedApp: (app) =>
    set((state) => {
      const existing = state.connectedApps.find(
        (a) => a.appId === app.appId
      );

      if (existing) {
        return {
          connectedApps: state.connectedApps.map((a) =>
            a.appId === app.appId ? app : a
          ),
        };
      }

      return {
        connectedApps: [...state.connectedApps, app],
      };
    }),
isAppConnected: (appId) =>
  get().connectedApps.find(
    (app) => app.appId === appId
  ),
   updateNodePosition: (nodeId, position) =>
  set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            position,
          }
        : node
    ),
  })),
  updateNodeConfig: (nodeId, config) =>
    set((state) => {
      const {fields}= config;
     return {
      nodeConfigs: {
        ...state.nodeConfigs,
        [nodeId]: {
          ...state.nodeConfigs[nodeId],
          ...config, 
          fields :{
             ...state.nodeConfigs[nodeId]?.fields,
                ...config.fields
          }
        },
      },
    }
    }),

  getNodeConfig: (nodeId) => {
    const state = get();
    return state.nodeConfigs[nodeId] || {};
  },
  updateNode : (nodeId : string,data: any) =>{
    set((state)=>({
      nodes: state.nodes.map((node)=>
        node.id === nodeId ? {
          ...node,
          data:{
            ...node.data,
            ...data

          },
        } : node 
      )
    }))
  },
  updateWorkflowId: (workflowId: string) => set({ workflowId }),
  addNode: (node) =>
    set((state) => (
      {
      nodes: [...state.nodes, node],
      nodeConfigs: {
        ...state.nodeConfigs,
        [node.id]: {fields:{
          label : node.data.label
        }},
      },
    })
  )
    ,

  addEdge: (edge) =>
  set((state) => {
    console.log("adding edge", state);

    return {
      edges: [...state.edges, edge],
    };
  }),
 addActionAfter: (parentId: string,stepId:string) => {
    (() => {
      const state = get();
    
      const newNodeId= stepId;
      // const newNodeId = `action-${Date.now()}`;
      let x = 250;
      let y = 0;

      if (parentId) {
        const parentNode = state.nodes.find((n) => n.id === parentId);

        if (parentNode) {
          x = parentNode.position.x + 250;
          y = parentNode.position.y;
        }
      } else {
        const lastNode = state.nodes[state.nodes.length - 1];
        if (lastNode) {
          x = lastNode.position.x + 250;
          y = lastNode.position.y;
        }
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'action',
        data: { label: 'New Action' },
        position: { x, y },
      };

      set({
        nodes: [...state.nodes, newNode],
        nodeConfigs: {
          ...state.nodeConfigs,
          [newNodeId] : {},
        },
        edges: parentId
          ? [
              ...state.edges,
              {
                id: `${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
                animated: true,
                style: {
                  stroke: '#5B3FFF',
                  strokeWidth: 2,
                },
              },
            ]
          : state.edges,
        selectedNodeId: newNodeId,
      });
    })();
  },
  getPrevNode: (nodeId: string) => {
    const state = get();
    const edge = state.edges.find((e) => e.target === nodeId);
    if (!edge) return null;
    return state.nodes.find((n) => n.id === edge.source) || null;
  },
  initializeWorkflow: (workflowId: string,triggerId: string) => {
    set((state) => {
      const newNodes = [
        {
          id: triggerId,
          data: { label: 'Select App' },
          position: { x: 0, y: 0 },
          type: 'trigger',
        },
      ];
      return {
        nodes: newNodes,
        edges: [],
        workflowId,
        nodeConfigs: {},
      };
    });
  },
  removeNode: (nodeId) =>
    set((state) => {
      const isTriggerNode = state.nodes.find((n) => n.id === nodeId)?.type === 'trigger';
      if (isTriggerNode) return state;
      const hasChildren =  state.edges.some((e) => e.source === nodeId);
      if (hasChildren) return state;
      const newNodes = state.nodes.filter((n) => n.id !== nodeId);
      const newEdges = state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      const newConfigs = { ...state.nodeConfigs };
      delete newConfigs[nodeId];
      return {
        nodes: newNodes,
        edges: newEdges,
        nodeConfigs: newConfigs,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    }),
    
}));
