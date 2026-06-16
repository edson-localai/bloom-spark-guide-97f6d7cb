import { toast } from "sonner";

/**
 * Maps an unknown error to a user-safe message in PT-BR.
 * Never exposes raw stack traces, SQL errors, or internal codes.
 */
export function toUserMessage(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (!err) return fallback;

  // Standard Error / AppError
  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (!msg) return fallback;

    // Block leaky technical messages
    const lower = msg.toLowerCase();
    const technicalSignals = [
      "fetch failed",
      "network request failed",
      "load failed",
      "failed to fetch",
      "typeerror",
      "syntaxerror",
      "referenceerror",
      "unexpected token",
      "is not a function",
      "cannot read prop",
      "permission denied for",
      "duplicate key",
      "violates foreign key",
      "relation \"",
      "column \"",
      "jwt",
    ];
    if (technicalSignals.some((s) => lower.includes(s))) {
      return "Não foi possível concluir a operação. Verifique sua conexão e tente novamente.";
    }
    return msg;
  }

  if (typeof err === "string" && err.trim()) return err;

  if (typeof err === "object" && err !== null) {
    const anyErr = err as { message?: unknown; error?: unknown };
    if (typeof anyErr.message === "string") return toUserMessage(new Error(anyErr.message), fallback);
    if (typeof anyErr.error === "string") return toUserMessage(new Error(anyErr.error), fallback);
  }

  return fallback;
}

/**
 * Logs the raw error and shows a friendly toast.
 * Use in mutation `onError`, event handlers, and React Query global handlers.
 */
export function toastError(err: unknown, fallback?: string) {
  console.error(err);
  toast.error(toUserMessage(err, fallback));
}

/**
 * Wraps an async action in try/catch with a toast on failure and optional success message.
 * Returns the result on success, or `undefined` on failure.
 */
export async function runWithToast<T>(
  action: () => Promise<T>,
  opts: { success?: string; errorFallback?: string } = {},
): Promise<T | undefined> {
  try {
    const result = await action();
    if (opts.success) toast.success(opts.success);
    return result;
  } catch (err) {
    toastError(err, opts.errorFallback);
    return undefined;
  }
}
