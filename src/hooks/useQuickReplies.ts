import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuickReply } from "@/types/crm";

export function useQuickReplies() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReplies();
    const ch = supabase
      .channel("public:quick_replies")
      .on("postgres_changes", { event: "*", schema: "public", table: "quick_replies" }, () =>
        fetchReplies(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function fetchReplies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quick_replies")
        .select("*")
        .order("title", { ascending: true });
      if (error) throw error;
      setReplies(data as QuickReply[]);
    } catch (err) {
      console.error("Error fetching quick replies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createReply(title: string, content: string, shortcut: string) {
    const { data, error } = await supabase
      .from("quick_replies")
      .insert({ title, content, shortcut })
      .select()
      .single();
    if (error) throw error;
    setReplies((prev) => [...prev, data as QuickReply]);
    return data;
  }

  async function updateReply(id: string, updates: Partial<QuickReply>) {
    const { error } = await supabase.from("quick_replies").update(updates).eq("id", id);
    if (error) throw error;
    setReplies((prev) => prev.map((r) => (r.id === id ? ({ ...r, ...updates } as QuickReply) : r)));
  }

  async function deleteReply(id: string) {
    const { error } = await supabase.from("quick_replies").delete().eq("id", id);
    if (error) throw error;
    setReplies((prev) => prev.filter((r) => r.id !== id));
  }

  return { replies, loading, fetchReplies, createReply, updateReply, deleteReply };
}
