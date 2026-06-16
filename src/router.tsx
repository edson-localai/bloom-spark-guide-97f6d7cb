import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Browser-only: inject the Supabase bearer token into all server function calls
// so that `requireSupabaseAuth` middleware can authenticate the request.
if (typeof window !== "undefined" && !(window as any).__lovableServerFnFetchPatched) {
  (window as any).__lovableServerFnFetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: any, init: any = {}) => {
    try {
      const url =
        typeof input === "string" ? input : input instanceof Request ? input.url : input?.url || "";

      // Only intercept server function calls
      if (url.includes("/_serverFn/")) {
        const { supabase } = await import("./integrations/supabase/client");
        const sessionStr = localStorage.getItem(
          `sb-${new URL(import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || window.location.origin).hostname.split(".")[0]}-auth-token`,
        );
        let token = null;

        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            token = session?.access_token;
          } catch (e) {}
        }

        // If not in localStorage, try getSession (slower fallback)
        if (!token) {
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token;
        }

        if (token) {
          // Clone headers to avoid modifying read-only Request headers
          const headers = new Headers(
            init.headers || (input instanceof Request ? input.headers : undefined),
          );
          if (!headers.has("authorization")) {
            headers.set("authorization", `Bearer ${token}`);
          }

          if (input instanceof Request) {
            // Re-create the request with new headers
            const newRequest = new Request(input, { headers });
            return originalFetch(newRequest, init);
          } else {
            init = { ...init, headers };
          }
        }
      }
    } catch (e) {
      console.warn("[serverFn auth] failed to attach token", e);
    }
    return originalFetch(input, init);
  };
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
