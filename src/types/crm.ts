// HCB CRM — tipos compartilhados
export type AppRole = 'admin' | 'supervisor' | 'agent';
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: AppRole;
  status: AgentStatus;
  avatar_url: string | null;
  max_chats: number;
  created_at: string;
  updated_at: string;
}

export type InstanceStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface WhatsAppInstance {
  id: string;
  name: string;
  display_name: string;
  provider: 'wapi';
  phone_number: string | null;
  status: InstanceStatus;
  qr_code: string | null;
  webhook_url: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
  instance_key?: string | null;
}

export type LeadStage = 'novo' | 'qualificado' | 'proposta' | 'fechado' | 'perdido';

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  birthdate: string | null;
  cep: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  stage: LeadStage | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  notes: string | null;
  tags: string[];
  total_conversations: number;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 'bot' | 'queue' | 'active' | 'resolved' | 'archived';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Conversation {
  id: string;
  contact_id: string | null;
  agent_id: string | null;
  team_id: string | null;
  instance_id: string | null;
  whatsapp_chat_id: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  channel: string;
  subject: string | null;
  ai_summary: string | null;
  ai_intent: string | null;
  bot_active: boolean;
  auto_reply_enabled: boolean;
  unread_count: number;
  last_message: string | null;
  last_message_at: string;
  resolved_at: string | null;
  last_automated_msg_at: string | null;
  created_at: string;
  updated_at: string;
  labels?: Label[];
}

export type SenderType = 'contact' | 'agent' | 'bot' | 'system';
export type MessageContentType =
  | 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'system' | 'event';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversation_id: string;
  wa_message_id: string | null;
  sender_type: SenderType;
  sender_id: string | null;
  content: string | null;
  content_type: MessageContentType;
  media_url: string | null;
  media_mime: string | null;
  is_internal: boolean;
  status: MessageStatus;
  created_at: string;
  meta?: any;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  shortcut: string | null;
  agent_id: string | null;
  use_count: number;
  created_at: string;
}

export interface ScheduledMessage {
  id: string;
  conversation_id: string;
  agent_id: string | null;
  content: string;
  scheduled_for: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'cancelled';
  created_at: string;
}

export interface Proposal {
  id: string;
  conversation_id: string | null;
  contact_id: string;
  agent_id: string | null;
  proposal_number: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}
