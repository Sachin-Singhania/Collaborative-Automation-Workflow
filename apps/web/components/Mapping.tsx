import { ChevronDown, ChevronRight } from "lucide-react";
import { useWorkflowStore } from "../lib/store";
import { useMemo, useState } from "react";

export function FieldMappingPopover({
    currentNodeId,
    onInsert,
}:{
    currentNodeId:string;
    onInsert:(value:string)=>void;
}){
  const getPreviousNodes = useWorkflowStore(
  state => state.getPreviousNodes
);
  const mappingNodes = useWorkflowStore(
  state => state.mappingNodes
);
console.log(mappingNodes)
console.log(currentNodeId)
const previousNodes = useMemo(
  () => getPreviousNodes(currentNodeId),
  [getPreviousNodes, currentNodeId]
);
    console.log(previousNodes)

    const [expanded,setExpanded] = useState<string>();

    return(
    <div className="absolute z-50   mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className=" text-black border-b px-4 py-3 font-semibold">
                Insert Data
            </div>

            <div className="max-h-80 overflow-y-auto">

                {previousNodes?.map(node=>(

                    <div key={node.nodeId}>

                        <button
                            onClick={()=>
                                setExpanded(
                                    expanded===node.nodeId
                                    ?undefined
                                    :node.nodeId
                                )
                            }
                            className="text-black flex w-full items-center gap-2 px-4 py-3 hover:bg-slate-50"
                        >

                            {expanded===node.nodeId
                                ?<ChevronDown size={16}/>
                                :<ChevronRight size={16}/>
                            }

                            <span className="text-black ">
                                {node.stepNumber}. {node.appName}
                            </span>

                        </button>

                        {expanded===node.nodeId && (

                            <div className="pb-2">

                                {node.outputs.map(field=>(

                                    <button
                                        key={field}
                                        onClick={()=>
                                            onInsert(
                                                `{{${node.nodeId}.${field}}}`
                                            )
                                        }
                                        className="text-black ml-8 block w-[calc(100%-2rem)] rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        {field}
                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>
    );
}