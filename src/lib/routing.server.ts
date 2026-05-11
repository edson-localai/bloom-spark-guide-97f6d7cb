// Chatwoot-style conversation routing.
// Picks the least-loaded online agent within max_chats; otherwise queues it.
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export async function assignConversation(conversationId: string, contactId: string | null) {
  // Read distribution strategy (default round_robin / least-loaded)
  const { data: setting } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'agent_distribution')
    .maybeSingle();
  const strategy = (setting?.value || 'round_robin') as string;

  if (strategy === 'manual') {
    await enqueue(conversationId, contactId);
    return { assigned: false, queued: true };
  }

  // Online agents (status set in DB; presence syncs to it)
  const { data: agents } = await supabaseAdmin
    .from('agents')
    .select('id, max_chats, status')
    .eq('status', 'online');

  if (!agents || agents.length === 0) {
    await enqueue(conversationId, contactId);
    return { assigned: false, queued: true };
  }

  // Count active (assigned, not resolved/archived) conversations per agent
  const ids = agents.map((a) => a.id);
  const { data: active } = await supabaseAdmin
    .from('conversations')
    .select('agent_id')
    .in('agent_id', ids)
    .in('status', ['active', 'bot', 'queue']);

  const load = new Map<string, number>();
  ids.forEach((id) => load.set(id, 0));
  (active || []).forEach((c: any) => {
    if (c.agent_id) load.set(c.agent_id, (load.get(c.agent_id) || 0) + 1);
  });

  // Filter under max_chats and pick least-loaded (tie → oldest by id)
  const eligible = agents
    .filter((a) => (load.get(a.id) || 0) < (a.max_chats ?? 5))
    .sort((a, b) => (load.get(a.id) || 0) - (load.get(b.id) || 0));

  if (eligible.length === 0) {
    await enqueue(conversationId, contactId);
    return { assigned: false, queued: true };
  }

  const target = eligible[0];
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ agent_id: target.id, status: 'active', updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (error) {
    await enqueue(conversationId, contactId);
    return { assigned: false, queued: true, error: error.message };
  }

  // The handle_conversation_assignment trigger removes it from waiting_queue.
  await supabaseAdmin.from('conversation_events').insert({
    conversation_id: conversationId,
    agent_id: target.id,
    event_type: 'auto_assigned',
    meta: { strategy, load: load.get(target.id) || 0 } as any,
  });

  return { assigned: true, agentId: target.id };
}

async function enqueue(conversationId: string, contactId: string | null) {
  await supabaseAdmin
    .from('waiting_queue')
    .upsert(
      { conversation_id: conversationId, contact_id: contactId },
      { onConflict: 'conversation_id' }
    );
  await supabaseAdmin
    .from('conversations')
    .update({ status: 'queue', updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}
