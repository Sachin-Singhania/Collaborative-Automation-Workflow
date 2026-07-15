'use client';

import React, { useEffect } from 'react';
import { useWorkflowStore } from '../lib/store';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ChevronLeft, ChevronRight, Clock3, Save, Send, Workflow } from 'lucide-react';
import { getAppConnections } from '../lib/actions/api';
const runs = [
  {
    id: "1",
    name: "Run #24",
    status: "COMPLETED",
    time: "2 min ago",
  },
  {
    id: "2",
    name: "Run #23",
    status: "RUNNING",
    time: "5 min ago",
  },
  {
    id: "3",
    name: "Run #22",
    status: "FAILED",
    time: "12 min ago",
  },
  {
    id: "4",
    name: "Run #21",
    status: "COMPLETED",
    time: "28 min ago",
  },
  {
    id: "5",
    name: "Run #20",
    status: "COMPLETED",
    time: "1 hour ago",
  },
  {
    id: "6",
    name: "Run #19",
    status: "FAILED",
    time: "Yesterday",
  },
];
export const WorkflowPage: React.FC = () => {
  const isZapRunsOpen = useWorkflowStore((state) => state.isZapRunsOpen);
  const setIsZapRunsOpen = useWorkflowStore((state) => state.setIsZapRunsOpen);
  const setConnectedApps = useWorkflowStore(
  (state) => state.setConnectedApp
);
useEffect(() => {
  async function loadConnections() {
    const res = await getAppConnections();
    console.log(res)
    if (res.ok) {
      res.value.credentials.forEach((e)=>{
        setConnectedApps(e);
      })
    }
  }
  loadConnections();
}, []);
  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-[#f8fbff] via-[#eef6ff] to-[#dbeeff]">      {/* Top Bar */}
      <div className="px-3 pt-2">

        <header className="sticky top-4 z-50 px-6">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between rounded-full border border-white/60 bg-white/55 px-6 py-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(37,99,235,0.12)]">

            {/* Left */}
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
                <Workflow className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  Untitled Workflow
                </h1>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  <span>Saved just now</span>

                  <span className="text-slate-300">•</span>

                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Draft
                  </span>
                </div>
              </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50">
                <Save className="h-4 w-4" />
                Save
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <Send className="h-4 w-4" />
                Publish
              </button>

            </div>

          </div>
        </header>
      </div>

      {/* Main Content Area */}
   {/* Main Content Area */}
<div className="mt-4 flex h-[calc(100vh-120px)] gap-5 px-6 pb-6">

  {/* Executions Panel */}
  <aside
    className={`relative transition-all duration-300 ${
      isZapRunsOpen ? "w-72" : "w-16"
    }`}
  >
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/65 backdrop-blur-xl shadow-[0_15px_45px_rgba(37,99,235,0.08)]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-5">

        {isZapRunsOpen ? (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Executions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recent workflow runs
              </p>
            </div>

            <button
              onClick={() => setIsZapRunsOpen(false)}
              className="rounded-xl p-2 transition hover:bg-slate-100"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsZapRunsOpen(true)}
            className="mx-auto rounded-xl p-2 transition hover:bg-slate-100"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        )}

      </div>

      {isZapRunsOpen && (
        <div className="flex-1 overflow-y-auto">

          {runs.map((run, index) => (
            <button
              key={run.id}
              className={`group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-blue-50/40 ${
                index !== runs.length - 1
                  ? "border-b border-slate-200/60"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">

                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    run.status === "COMPLETED"
                      ? "bg-emerald-500"
                      : run.status === "FAILED"
                      ? "bg-red-500"
                      : "bg-blue-500 animate-pulse"
                  }`}
                />

                <div>
                  <p className="font-medium text-slate-800">
                    {run.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {run.time}
                  </p>
                </div>

              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                  run.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700"
                    : run.status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {run.status}
              </span>
            </button>
          ))}

        </div>
      )}

    </div>

  </aside>

  {/* React Flow */}
  <section className="flex-1 overflow-hidden rounded-[28px] border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_15px_45px_rgba(37,99,235,0.08)]">
    <WorkflowBuilder />
  </section>

</div>
    </div>
  );
};
