import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/components/crm/ProfilePanel";
import { User } from "lucide-react";

export const Route = createFileRoute("/atendimento/perfil")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div
      className="h-full flex flex-col overflow-auto custom-scrollbar"
      style={{ background: "#0A0A0F" }}
    >
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
            <User className="h-6 w-6" />
          </div>
          Meu Perfil
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Gerencie suas informações pessoais e configurações de segurança.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ProfilePanel />
      </div>
    </div>
  );
}
