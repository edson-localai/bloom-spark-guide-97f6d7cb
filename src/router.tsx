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
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("/_serverFn/")) {
        const { supabase } = await import("./integrations/supabase/client");
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
          if (!headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
          init = { ...init, headers };
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
