import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/crm";

export function useWhatsApp() {
  const [instances, setInstances] = useState<(WhatsAppInstance & { qr_code?: string | null })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchInstances = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setInstances((data as any) || []);
    } catch (err) {
      console.error("Error fetching WhatsApp instances:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();

    // Realtime updates so QR / status changes are live (webhook driven)
    const channel = supabase
      .channel("public:whatsapp_instances")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_instances" }, () =>
        fetchInstances(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInstances]);

  return { instances, loading, fetchInstances };
}
