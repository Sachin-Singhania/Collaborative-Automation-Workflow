"use client";

import { useState } from "react";
import { useWorkflowStore } from "../lib/store";
import { MappingInput } from "./MappingInput";

export const EmailConfig = ({
  nodeId,appId
}: { nodeId: string,appId:string }) => {

  const nodeConfig = useWorkflowStore((state) => state.nodeConfigs[nodeId]);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const isAppConnected = useWorkflowStore((state) => state.isAppConnected);
  const [from, setfrom] = useState(nodeConfig?.fields?.from || "");
  const [to, setto] = useState(nodeConfig?.fields?.to || "");
  const [subject, setsubject] = useState(nodeConfig?.fields?.subject || "");
  const [body, setbody] = useState(nodeConfig?.fields?.body || "");
  const onChange = (field: string, value: string) => {
    updateNodeConfig(nodeId, {
      fields: {
        [field]: value,
      },
    });

  }
  const app= isAppConnected(appId)
  return (
    <div className="space-y-6">
      <div>

      <MappingInput
        nodeId={nodeId}
        label="From"
        type="email"
        value={app?.accountEmail ? app.accountEmail : from}
        placeholder="sender@gmail.com"
        onChange={(value) => {
          setfrom(value)
          onChange("from", value);
        }}
        disabled={app?.accountEmail ? true : false}
        />
        </div>
        <div>


      <MappingInput
        nodeId={nodeId}
        label="To"
        type="email"
        value={to}
        placeholder="recipient@gmail.com"
        onChange={(value) => {
          setto(value);
          onChange("to", value);
        }}
        />
        </div>
        <div>

      <MappingInput
        nodeId={nodeId}
        label="Subject"
        multiline
        rows={1}
        value={subject}
        placeholder="Enter email subject..."
        onChange={(value) => {
          setsubject(value);
          onChange("subject", value);
        }}
        />

        </div>
        <div>

      <MappingInput
        nodeId={nodeId}
        label="Body"
        multiline
        rows={5}
        value={body}
        placeholder="Enter email body..."
        onChange={(value) => {
          setbody(value);
          onChange("body", value);
        }}
        
        />
        </div>

    </div>
  );
}


export const EmailTest = ({
  nodeId,
}: { nodeId: string }) => {
  const nodeConfig = useWorkflowStore((state) => state.nodeConfigs[nodeId]);
  const [body] = useState(nodeConfig?.fields?.body || "");
  const [to] = useState(nodeConfig?.fields?.to || "");
  const [subject] = useState(nodeConfig?.fields?.subject || "");
  const truncate = (value: string, length = 6) =>
    value.length > length ? `${value.slice(0, length)}...` : value;
  const onTest = () => {
    // Implement the test email sending logic here
    console.log("Testing email with config:", { body, to, subject });
  }
  return (
    <div className="space-y-5">

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-500">To</span>
            <span className="font-medium text-slate-800">
              {to || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-500">Subject</span>
            <span className="font-medium text-slate-800">
              {subject || "-"}
            </span>
          </div>


          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-500">Body</span>
            <span className="font-medium text-slate-800">
              {body ? truncate(body) : "-"}
            </span>
          </div>

        </div>
      </div>

      <button onClick={onTest} className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
        Test Trigger
      </button>

    </div>
  );
}