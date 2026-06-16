import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "hcb_install_dismissed";

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      // @ts-expect-error - non-standard
      window.navigator.standalone === true;
    if (standalone) return;

    let dismissed: string | null = null;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY);
    } catch {
      // localStorage may throw in private browsing / iOS Safari — fail open.
    }
    // On /atendimento we ignore the dismissal logic to always show for new/active sessions as requested
    const isAtendimentoPage = window.location.pathname.startsWith("/atendimento");

    if (!isAtendimentoPage && dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000)
      return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Always show prompt initially if not standalone
    setShow(true);

    if (ios) setIsIOS(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore localStorage failures (private mode etc.)
    }
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-2xl border border-cyan-500/30 dark:border-cyan-500/30 p-4 flex items-start gap-3 bg-white dark:bg-[#151821] transition-colors duration-500">
      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/30">
        <Download className="h-5 w-5 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Instalar app HCB</p>
        {isIOS ? (
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-snug">
            Toque em <Share className="inline h-3 w-3 mx-0.5" /> Compartilhar e depois em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
        ) : (
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
            Atenda direto pelo app, sem precisar abrir o navegador.
          </p>
        )}
        {!isIOS && (
          <button
            onClick={install}
            className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Instalar agora
          </button>
        )}
      </div>
      <button
        onClick={dismiss}
        className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white p-1"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
