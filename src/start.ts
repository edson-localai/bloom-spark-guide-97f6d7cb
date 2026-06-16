import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

async function fetchWithSupabaseAuth(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof window === "undefined") return fetch(input, init);

  const { supabase } = await import("./integrations/supabase/client");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return fetch(input, init);

  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined),
  );
  if (!headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
  serverFns: { fetch: fetchWithSupabaseAuth },
}));
