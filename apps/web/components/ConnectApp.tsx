"use client"
import { Link2, Mail, MessageCircle, MoreVertical } from "lucide-react";

type ConnectCardProps = {
  app: {
    name: string;
    icon: React.ReactNode;
    description: string;
  };
  connected: boolean;
  accountName?: string;
  usedIn?: number;
    onConnect: () => void;
};
export const apps = {
  "4eb59280-6077-43b2-85db-0f37896f521e": {
    name: "Gmail",
    description: "Connect your Gmail account",
    icon: <Mail className="h-7 w-7 text-red-500" />,
  },

//   "d7731f34-d89c-439e-8932-bbfb8350368f": {
//     name: "Discord",
//     description: "Connect your Discord account",
//     icon: <MessageCircle className="h-7 w-7 text-indigo-500" />,
//   },
} ;
export default function ConnectCard({
  app,
  connected,
  accountName,
  usedIn,
  onConnect,
}: ConnectCardProps) {
  return (
   <div className="flex items-center justify-between p-4">
  <div className="flex min-w-0 flex-1 items-center gap-4">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100">
      {app.icon}
    </div>

    <div className="min-w-0">
      <h3 className="truncate font-semibold text-slate-800">
        {connected ? accountName : app.name}
      </h3>
    </div>
  </div>

  <div className="ml-4 flex shrink-0 items-center gap-2">
    <button
      onClick={onConnect}
      className="flex text-black items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
    >
      <Link2 className="h-4 w-4" />
      {connected ? "Change" : "Connect"}
    </button>

    <button className="text-black rounded-lg border border-slate-300 p-2 hover:bg-slate-100">
      <MoreVertical className="h-4 w-4" />
    </button>
  </div>
</div>
  );
}