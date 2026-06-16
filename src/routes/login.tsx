import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { Loader2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login — HCB CRM" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useCrmAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate({ to: "/atendimento" });
  }, [authLoading, isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(translateAuthError(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0A0A0F" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: "#151821", border: "1px solid #1F232E" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,204,238,0.15)", color: "#00CCEE" }}
          >
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">HCB CRM</h1>
            <p className="text-xs text-zinc-400">Atendimento WhatsApp + IA</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <Field
            label="Senha"
            type="password"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="current-password"
          />

          {error && (
            <p
              className="text-sm rounded-md px-3 py-2"
              style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ background: "#00CCEE", color: "#0A0A0F" }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-500 text-center">
          Acesso restrito. Novos usuários devem ser criados por um administrador.
        </p>

        <p className="mt-2 text-xs text-zinc-600 text-center">
          <Link to="/" className="hover:text-zinc-400">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-400 mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 rounded-md text-sm text-white outline-none transition-colors focus:border-cyan-400"
        style={{ background: "#0F1117", border: "1px solid #1F232E" }}
      />
    </label>
  );
}

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered") || msg.includes("User already"))
    return "E-mail já cadastrado.";
  if (msg.includes("Password should be")) return "A senha deve ter no mínimo 6 caracteres.";
  return msg;
}
