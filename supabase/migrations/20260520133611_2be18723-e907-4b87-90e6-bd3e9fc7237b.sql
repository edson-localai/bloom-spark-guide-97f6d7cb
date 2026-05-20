-- Disable triggers temporarily to avoid issues during bulk delete if necessary
-- Actually, simple DELETE with proper order should work fine due to foreign keys

-- 1. Delete dependent data first
DELETE FROM public.contact_followups;
DELETE FROM public.conversation_labels;
DELETE FROM public.quiz_results;
DELETE FROM public.proposals;
DELETE FROM public.messages;
DELETE FROM public.conversations;

-- 2. Finally delete contacts
DELETE FROM public.contacts;

-- Note: We are NOT deleting 'agents', 'user_roles', 'teams', or 'whatsapp_instances' 
-- as those are system/infrastructure configuration, not customer data.