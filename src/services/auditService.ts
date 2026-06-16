import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_data: params.oldData,
      new_data: params.newData,
    });
  } catch (err) {
    console.warn("Audit log failed (non-blocking):", err);
  }
}
