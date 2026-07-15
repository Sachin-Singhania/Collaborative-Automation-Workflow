'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Plus, Search, Settings, Workflow, X } from 'lucide-react';
import { createWorkflow } from '../lib/actions/api';
import { useWorkflowStore } from '../lib/store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Workflow = {
  id: string;
  name: string;
  createdAt: Date;
  enabled: boolean;
  description?: string;
}

// const mockWorkflows: Workflow[] = [
//   {
//     id: '1',
//     name: 'Email to discord Notifications',
//     createdAt: '2024-01-15',
//     enabled: true,
//   },
//   {
//     id: '2',
//     name: 'Twitter to Discord',
//     createdAt: '2024-01-10',
//     enabled: true,
//   },
//   {
//     id: '3',
//     name: 'Form Responses to Spreadsheet',
//     createdAt: '2024-01-08',
//     enabled: false,
//   },
//   {
//     id: '4',
//     name: 'GitHub Issues to Email',
//     createdAt: '2024-01-05',
//     enabled: true,
//   },
//   {
//     id: '5',
//     name: 'Webhook to Database',
//     createdAt: '2024-01-01',
//     enabled: true,
//   },
//   {
//     id: '6',
//     name: 'Auto-responder Bot',
//     createdAt: '2023-12-28',
//     enabled: false,
//   },
// ];

export const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const [mockWorkflows, setmockWorkflows] = useState<Workflow[]>()
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredWorkflows = mockWorkflows?.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const workflowinitstate = useWorkflowStore((state) => state.initializeWorkflow);
  const [toggle, settoggle] = useState(false);
  const [name, setname] = useState('');
  const [description, setdescription] = useState('');
  const nav = useRouter();
  useEffect(() => {
    if (!session?.user?.workflows) return;
    setmockWorkflows(session.user.workflows);
    return () => {
    }
  }, [session?.user])


  const initializeWorkflow = async () => {
    try {
      if (!name.trim()) {
        // await sendToZapier()
        alert("Workflow name is required");
        return;
      }
      const res = await createWorkflow({ description, name });
      if (!res.ok) {
        console.log(res.error)
        return;
      }
      const workflowId = res?.value.data.id;
      let url = `/workflow/${workflowId}`;
      let firstStepId = res.value.data.steps[0].id;
      workflowinitstate(workflowId, firstStepId);
      nav.push(url);
    } catch (error) {
      console.error('Error initializing workflow:', error);
    }
  }
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (

    <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-[#f8fbff] via-[#eef6ff] to-[#dbeeff]">

      {/* Background Glow */}
      <div className="absolute -top-48 left-1/2 h-162.5 w-162.5 -translate-x-1/2 rounded-full bg-blue-400/20 blur-[140px]" />
      <div className="absolute -bottom-40 -left-20 h-112.5 w-112.5 rounded-full bg-sky-300/20 blur-[120px]" />
      <div className="absolute -right-24 top-32 h-87.5 w-87.5 rounded-full bg-cyan-300/20 blur-[120px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-4 z-50 px-6">
          <div className="mx-auto flex max-w-375 items-center justify-between rounded-full border border-white/60 bg-white/55 px-6 py-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(37,99,235,0.12)]">

            {/* Left */}
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
                <Workflow className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-600">
                  Workflow AI
                </h1>

                <p className="text-sm text-slate-500">
                  Build • Automate • Execute
                </p>
              </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

              <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white/70 hover:shadow-sm">
                <Search className="h-5 w-5 text-slate-600" />
              </button>

              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white/70 hover:shadow-sm">
                <Bell className="h-5 w-5 text-slate-600" />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white/70 hover:shadow-sm">
                <Settings className="h-5 w-5 text-slate-600" />
              </button>

              <div className="mx-2 h-7 w-px bg-slate-200" />

              <button className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-sm transition hover:shadow-md">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 font-semibold text-white">
                  U
                </div>

                <ChevronDown className="mr-1 h-4 w-4 text-slate-500" />

              </button>

            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-375 px-8 py-10">

            {/* Hero */}

            {/* Search Card */}
            <div className="mb-10 rounded-3xl border border-white/60 bg-white/55 p-5 backdrop-blur-2xl shadow-lg shadow-blue-100/40">
              <div className="flex flex-col gap-4 lg:flex-row">

                {/* Search Bar - 75% */}
                <div className="relative flex-6">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />

                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-14 py-4 text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/40"
                  />
                </div>

                {/* Button - 25% */}
                <button
                  onClick={() => settoggle(true)}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 px-6 py-4 font-semibold text-white shadow-xl shadow-blue-400/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <Plus className="h-5 w-5 transition group-hover:rotate-90" />
                  New Workflow
                </button>

              </div>
            </div>
            {toggle && (
              <div className="fixed inset-0 z-100 flex items-center justify-center">
                {/* Backdrop */}
                <div
                  onClick={() => settoggle(false)}
                  className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
                />

                {/* Modal */}
                <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 backdrop-blur-3xl shadow-[0_30px_80px_rgba(59,130,246,0.18)]">

                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-200/70 p-7">

                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
                        <Workflow className="h-7 w-7 text-white" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          Create Workflow
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Give your workflow a meaningful name and description.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => settoggle(false)}
                      className="rounded-xl p-2 transition hover:bg-slate-100"
                    >
                      <X className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="space-y-6 p-7">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Workflow Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Email Notifications"
                        onChange={(e) => {
                          setname(e.target.value)
                        }}
                        value={name}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        This will be shown on your dashboard.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Description
                        <span className="ml-1 font-normal text-slate-400">
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        rows={5}
                        onChange={(e) => {
                          setdescription(e.target.value)
                        }}
                        value={description}
                        placeholder="Describe what this workflow does..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Helps you identify the workflow later.
                      </p>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 border-t border-slate-200/70 bg-white/40 px-7 py-5">

                    <button
                      onClick={() => settoggle(false)}
                      className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={initializeWorkflow}
                      className="rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-6 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02]"
                    >
                      Create Workflow
                    </button>

                  </div>
                </div>
              </div>
            )}

            {/* Cards */}
            <div className=" z-0 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">

              {filteredWorkflows?.map((workflow) => (

                <Link
                  key={workflow.id}
                  href={`/workflow/${workflow.id}`}
                  className="group"
                >

                  <div className="rounded-3xl border border-white/60 bg-white/60 p-7 backdrop-blur-xl shadow-lg shadow-blue-100/40 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:bg-white/75 hover:shadow-xl">

                    {/* Header */}

                    <div className="mb-6 flex items-center justify-between">

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold border ${workflow.enabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                      >
                        {workflow.enabled ? "Active" : "Inactive"}
                      </div>

                      <div className="rounded-xl bg-blue-50 p-2 text-blue-600 transition group-hover:bg-blue-100">
                        →
                      </div>

                    </div>

                    {/* Name */}

                    <h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 transition group-hover:text-blue-600">
                      {workflow.name}
                    </h3>

                    <p className="mb-8 text-sm leading-6 text-slate-500">
                      Workflow automation ready for execution.
                    </p>

                    {/* Footer */}

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-5">

                      <span className="text-sm text-slate-500">
                        {
                          new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(workflow.createdAt))
                        }
                      </span>

                      <span className="text-sm font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                        Open →
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

            {/* Empty State */}

            {filteredWorkflows?.length === 0 && (

              <div className="mt-16 rounded-[32px] border border-white/60 bg-white/55 p-20 text-center backdrop-blur-xl shadow-lg">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100">
                  <Search className="h-10 w-10 text-blue-500" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  No workflows found
                </h3>

                <p className="mt-3 text-slate-500">
                  Try another search or create your first workflow.
                </p>

              </div>

            )}

          </div>
        </div>
      </div>
    </main>
  );
};
