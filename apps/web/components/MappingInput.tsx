"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FieldMappingPopover } from "./Mapping";

interface MappingInputProps {
    nodeId: string;
    label: string;
    value: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
    disabled?:boolean;
    onChange: (value: string) => void;
}

export function MappingInput({
    nodeId,
    label,
    value,
    placeholder,
    multiline = false,
    rows = 1,
    type = "text",
    onChange,
    disabled
}: MappingInputProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                {multiline ? (
                    <textarea
                        rows={rows}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className=" scrollbar-hide flex-1 resize-none bg-transparent px-4 py-3 text-black outline-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="flex-1 bg-transparent px-4 py-3 text-black outline-none"
                    />
                )}

                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex w-12 items-center justify-center border-l border-slate-200 hover:bg-slate-100"
                >
                    <Plus size={18} className="text-slate-600" />
                </button>

            </div>

            {open && (
                <FieldMappingPopover
                    currentNodeId={nodeId}
                    onInsert={(text) => {
                        const separator =
                            value.length > 0 && !value.endsWith(" ") ? " " : "";

                        onChange(value + separator + text);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}