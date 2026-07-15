'use client';

import { ChevronRight, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { saveworkflowstep } from '../lib/actions/api';
import { actionapps, actions, Triggerapps, triggers } from '../lib/mockData';
import { useWorkflowStore } from '../lib/store';
import { EmailConfig, EmailTest } from './Email';
import { WebhookConfigure, WebhookTest } from './Webhook';
import ConnectCard, { apps } from './ConnectApp';
import { $Enums, Prisma } from '@repo/database';
import { useRouter } from "next/navigation";

type TabType = 'setup' | 'configure' | 'test';

interface SidebarProps {
  nodeId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ nodeId }) => {
  const tabs: TabType[] = ["setup", "configure", "test"];
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('setup');
  const nodeConfigs = useWorkflowStore((state) => state.nodeConfigs);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const nodes = useWorkflowStore((state) => state.nodes);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const isConfigPanelOpen = useWorkflowStore((state) => state.isConfigPanelOpen);
  const setIsConfigPanelOpen = useWorkflowStore((state) => state.setIsConfigPanelOpen);
  const updateNodeLabel = useWorkflowStore((state) => state.updateNode);
  const getPrevNode = useWorkflowStore((state) => state.getPrevNode);
  const isAppConnected = useWorkflowStore((state) => state.isAppConnected);
  const nodeConfig = nodeConfigs[nodeId] || {};
  const currentNode = nodes.find((n) => n.id === nodeId);
  const isActionNode = currentNode?.type === 'action';
  const selectedApp = isActionNode == true ? actionapps.find((a) => a.appId === nodeConfig.appId) : Triggerapps.find((a) => a.appId === nodeConfig.appId);
  const triggerOptions = nodeConfig.appId ? triggers[nodeConfig.appId as keyof typeof triggers] || [] : [];
  const selectedTrigger = triggerOptions.find((t) => t.id === nodeConfig.eventId);
  const actionOptions = nodeConfig.appId ? actions[nodeConfig.appId as keyof typeof actions] || [] : [];
  const goToNextTab = async () => {
    if (!currentNode) return;
    const currentIndex = tabs.indexOf(activeTab);
    const onconnect = async () => {

    }
    // const gmail = await getAppConnection("Gmail");

    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (currentIndex === tabs.length - 1) {
      type NewWorkflowStep = {
        workflowId: string,
        appId: string,
        type: $Enums.StepType,
        settings: Prisma.InputJsonValue,
        webhookslug?: string
        previousStep?: string
        exsistingStepId?: string
        eventId?: string
      }
      // console.log(nodeId);
      let type = currentNode?.type === "trigger" ? "TRIGGER" : "ACTION";
      let data: NewWorkflowStep = {
        appId: nodeConfig.appId as string,
        workflowId: workflowId,
        type: type as $Enums.StepType,
        settings: nodeConfig.fields as Prisma.InputJsonValue,
        previousStep: getPrevNode(nodeId)?.id,
        webhookslug: nodeConfig.fields?.webhookUrl as string,
        exsistingStepId: nodeId,
        eventId: nodeConfig?.eventId
      }
      const res = await saveworkflowstep(data);
    }
  };
  useEffect(() => {
    if (selectedApp?.appId) {

      updateNodeLabel(nodeId, {
        label: selectedApp?.name
      })
      updateNodeConfig(nodeId, {
        fields: {
          label: selectedApp?.name,
        },
      });
    }
  }, [selectedApp?.appId])
  if (!isConfigPanelOpen) {
    return null;
  }


  const handleClose = () => {
    setSelectedNodeId(null);
  };

  const handleAppChange = (appId: string) => {
    updateNodeConfig(nodeId, {
      appId,
      eventId: undefined,
    });

  };
  // console.log("selectedApp", selectedApp)
  // console.log(nodeConfig)

  if (!nodeId) {
    return null;
  }
  const handleTriggerChange = (triggerId: string) => {
    updateNodeConfig(nodeId, {
      eventId: triggerId,
    });
  };
  const app = selectedApp
    ? apps[selectedApp.appId as keyof typeof apps]
    : undefined;

  const connectedApp = nodeConfig.appId ? isAppConnected(nodeConfig.appId) : undefined;
  // console.log(connectedApp)
  return (
    <div className=" scrollbar-hide fixed top-0 right-0 bottom-0 w-[390px] flex flex-col rounded-l-[28px] border-l border-white/70 bg-white/75 backdrop-blur-2xl overflow-hidden shadow-2xl z-50">      {/* Header */}

      <div className=" scrollbar-hide shrink-0 border-b border-slate-200/70 px-6 py-6">     
         <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${currentNode?.type === "trigger"
              ? "bg-blue-100"
              : "bg-violet-100"
              }`}
          >
            <span className="text-xl">
              {currentNode?.type === "trigger" ? "🎯" : "⚡"}
            </span>
          </div>

          <div>

            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              {currentNode?.data.label || "Untitled Node"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 capitalize">
              {currentNode?.type}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setIsConfigPanelOpen(false)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

      </div>

        {/* Tabs */}

        <div className="mt-6 rounded-2xl bg-slate-100 p-1">

          <div className="grid grid-cols-3 gap-1">

            <button
              onClick={() => setActiveTab("setup")}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all ${activeTab === "setup"
                ? "bg-white shadow text-blue-600"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Setup
              {nodeConfig.appId && (
                <span className="ml-1 text-emerald-500">✓</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("configure")}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all ${activeTab === "configure"
                ? "bg-white shadow text-blue-600"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Configure
              {nodeConfig.eventId && (
                <span className="ml-1 text-emerald-500">✓</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("test")}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all ${activeTab === "test"
                ? "bg-white shadow text-blue-600"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Test
              {nodeConfig.fields?.webhookUrl && (
                <span className="ml-1 text-blue-500">•</span>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Content */}
      <div className= "  min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "setup" && (
          <div className="space-y-7">

            {/* App */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Application
              </label>

              <select
                value={nodeConfig.appId || ""}
                onChange={(e) => handleAppChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Choose an application...
                </option>

                {isActionNode ? (
                  actionapps.map((app) => (
                    <option key={app.appId} value={app.appId}>
                      {app.name}
                    </option>
                  ))
                ) : (
                  Triggerapps.map((app) => (
                    <option key={app.appId} value={app.appId}>
                      {app.name}
                    </option>
                  ))
                )}

              </select>


            </div>

            {/* Trigger */}

            {!isActionNode ? (
              <div>

                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Trigger Event
                </label>

                <select
                  value={nodeConfig.eventId || ""}
                  onChange={(e) => handleTriggerChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Choose trigger...
                  </option>

                  {triggerOptions.map((trigger) => (
                    <option key={trigger.id} value={trigger.id}>
                      {trigger.name}
                    </option>
                  ))}

                </select>

              </div>
            ) : (
              <div>

                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Action Event
                </label>

                <select
                  value={nodeConfig.eventId || ""}
                  onChange={(e) => handleTriggerChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Choose action...
                  </option>

                  {actionOptions.map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.name}
                    </option>
                  ))}

                </select>

              </div>
            )}


            {/* Status Card */}

            {nodeConfig.appId && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <p className="font-medium text-emerald-700">
                  ✓ Setup Complete
                </p>

                <p className="mt-1 text-sm text-emerald-600">
                  Continue to configure your node.
                </p>

              </div>
            )}
            {app && (
              <ConnectCard
                app={app}
                connected={connectedApp?.accountEmail ? true : false} accountName={connectedApp?.accountEmail}
                onConnect={() => {
                  if (app.name == "Gmail") {
                    if (!connectedApp) {
                      router.push("/api/integrations/google");
                    }
                  }
                }}
              />
            )}
          </div>
        )}

        {activeTab === "configure" && (() => {
          switch (selectedApp?.name) {
            case "Email":
              return <EmailConfig nodeId={nodeId} appId={selectedApp.appId}/>;
            case "Webhooks":
              return <WebhookConfigure nodeId={nodeId} />;
            default:
              return <div className="text-slate-500">Select an app.</div>;
          }
        })()}
        {/* TEST TAB */}
        {activeTab === "test" && (() => {
          switch (selectedApp?.name) {
            case "Email":
              return <EmailTest nodeId={nodeId} />;
            case "Webhooks":
              return <WebhookTest nodeId={nodeId} workflowId={workflowId} />;
            default:
              return <div className="text-slate-500">Select an app.</div>;
          }
        })()}

      </div>

      <div className="shrink-0 mt-auto border-t border-slate-200 bg-white/80 px-6 py-5">        <div className="flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button onClick={() => goToNextTab()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
          Continue →
        </button>

      </div>

      </div>
    </div>
  );
};

