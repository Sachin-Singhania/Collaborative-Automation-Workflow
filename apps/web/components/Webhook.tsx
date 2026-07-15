import { CheckCircle2, ChevronRight, Copy, Info } from "lucide-react";
import { useWorkflowStore } from "../lib/store";
import { childKeyFields, generateWebhookUrl } from "../lib/mockData";
import { useState } from "react";
import { getExecutionPayloads } from "../lib/actions/api";

export const WebhookConfigure = ({
    nodeId,
}: { nodeId: string }) => {
    const nodeConfigs = useWorkflowStore((state) => state.nodeConfigs);
    const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
    const handleChildKeyChange = (field: string) => {
        updateNodeConfig(nodeId, {
            fields: {
                childKeyField: field,
            },
        });
    };
    const nodeConfig = nodeConfigs[nodeId] || {};
    return (
        <>
            <div className="space-y-6">

                <div>

                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">

                        Pick Child Key

                        <Info size={15} className="text-slate-400" />

                    </label>

                    <input
                        value={nodeConfig.fields?.childKeyField || ""}
                        onChange={(e) => handleChildKeyChange(e.target.value)}
                        placeholder="email, name, phone..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                </div>

                {childKeyFields.length > 0 && (
                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-600">
                            Suggestions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {childKeyFields.map((field) => (
                                <button
                                    key={field}
                                    onClick={() => handleChildKeyChange(field)}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                                >
                                    {field}
                                </button>
                            ))}

                        </div>

                    </div>

                )}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                    <p className="font-medium text-blue-700">
                        💡 Tip
                    </p>

                    <p className="mt-2 text-sm text-blue-600">
                        Choose the value that should be forwarded to the next workflow step. Blank to forward the entire payload.
                    </p>

                </div>

            </div>
        </>
    )
}
export const WebhookTest = ({
    nodeId, workflowId
}: { nodeId: string, workflowId: string }) => {
    const [copied, setCopied] = useState(false);
    const nodeConfig = useWorkflowStore((state) => state.nodeConfigs[nodeId]);
    const [payloads, setPayloads] = useState<any[]>([]);
    const [selectedPayload, setSelectedPayload] = useState<any>(null);
    const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
    const handleWebhookCopy = () => {
        const webhookUrl = nodeConfig.fields?.webhookUrl || generateWebhookUrl();
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const fetchPayloads = async () => {
        const res = await getExecutionPayloads(workflowId);
        if (res.success) {
            setPayloads(res.data);
        }
    };
    const handleaddplayload = () => {
        updateNodeConfig(nodeId, {
            fields: {
                payload: selectedPayload.triggerData,
            },
        });
    };
    const turntest = async () => {
        //  const res= await sendEmail()
        updateNodeConfig(nodeId, {
            fields: {
                islistening: true
            },
        });
    };
    const handleGenerateWebhook = () => {
        const webhookUrl = generateWebhookUrl();
        updateNodeConfig(nodeId, {
            fields: {
                webhookUrl,
            },
        });
    };
    return (
        <>
            <div className="space-y-6">

                {!nodeConfig.fields?.webhookUrl ? (
                    <>
                        <div className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50 p-6">
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                Generate a webhook URL to receive events from your application.
                                Once created, you'll be able to send test events and verify your
                                workflow.
                            </p>
                            <button
                                onClick={handleGenerateWebhook}
                                className="mt-6 w-full rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
                            >
                                🔗 Generate Webhook URL
                            </button>

                        </div>
                    </>
                ) : (
                    <>
                        {/* Webhook Card */}

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                                    🔗
                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-800">
                                        Webhook URL
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Copy this URL into your application.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                                <p className="break-all font-mono text-xs text-slate-600">
                                    {nodeConfig.fields?.webhookUrl}
                                </p>

                            </div>

                            <button
                                onClick={handleWebhookCopy}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copy Webhook URL
                                    </>
                                )}
                            </button>

                        </div>

                        {/* Listening */}
                        {nodeConfig.fields?.islistening == true ? (
                            <div className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-green-50 p-5">

                                <div className="flex items-center gap-3">

                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />

                                    <h3 className="font-semibold text-emerald-700">
                                        Listening for Requests
                                    </h3>

                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-emerald-700/80">
                                    Send a request from your application and we'll automatically capture
                                    the latest payload for testing.
                                </p>

                            </div>) : (
                            <button onClick={turntest} className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-sky-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
                                Test Trigger
                            </button>
                        )
                        }
                        {/* Test Records */}
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        Test Records
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Select a webhook payload to use for field mapping.
                                    </p>
                                </div>

                                <button
                                    onClick={fetchPayloads}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Refresh
                                </button>
                            </div>

                            <button
                                onClick={fetchPayloads}
                                className="mt-5 w-full rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Find New Records
                            </button>

                            <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">

                                {payloads.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                                        No webhook payloads received yet.
                                    </div>
                                ) : (
                                    payloads.map((payload) => (
                                        <button
                                            key={payload.id}
                                            onClick={() => setSelectedPayload(payload)}
                                            className={`w-full rounded-2xl border p-4 text-left transition ${selectedPayload?.id === payload.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        Request {payload.id.slice(0, 6)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {new Date(payload.startedAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </button>
                                    ))

                                )}
                                {selectedPayload && (
                                    <div className="fixed inset-0 z-9999 flex items-center justify-center">

                                        {/* Backdrop */}
                                        <div
                                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                            onClick={() => setSelectedPayload(null)}
                                        />

                                        {/* Dialog */}
                                        <div className="relative w-full max-w-xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl">

                                            {/* Header */}
                                            <div className="mb-6 flex items-center justify-between">

                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-800">
                                                        Test Payload
                                                    </h2>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Select this payload to map your fields.
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedPayload(null)}
                                                    className="rounded-xl p-2 transition hover:bg-slate-100"
                                                >
                                                    ✕
                                                </button>

                                            </div>

                                            {/* Payload */}
                                            <div className="space-y-3">

                                                {Object.entries(selectedPayload.triggerData).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                                    >
                                                        <span className="min-w-28 rounded-lg bg-slate-800 px-3 py-1 text-sm font-medium text-white">
                                                            {key}
                                                        </span>

                                                        <span className="break-all rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700">
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                ))}

                                            </div>

                                            {/* Footer */}
                                            <div className="mt-8 flex justify-end gap-3">

                                                <button
                                                    onClick={() => setSelectedPayload(null)}
                                                    className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium hover:bg-slate-100 text-black"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        // Save this payload for field mapping
                                                        console.log(selectedPayload.triggerData);
                                                        handleaddplayload()
                                                        setSelectedPayload(null);
                                                    }}
                                                    className="rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25"
                                                >
                                                    Use this Payload
                                                </button>

                                            </div>

                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>

                    </>
                )}

            </div>
        </>
    )
}