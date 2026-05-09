## Visão geral

O documento `HCB_CRM_Lovable_Prompt.md` define um sistema de atendimento WhatsApp + IA + Kanban completo, dividido em ~9 módulos. Tentar entregar tudo num único turno gera código frágil, conflitos e estouro de contexto. Por isso vou executar em fases, validando ao final de cada uma.

A rota será `/atendimento`, tema dark (`#0A0A0F` / `#0F1117` / `#151821`), cor primária cyan `#00CCEE`, separada do site institucional atual (HCB Ar Condicionado) que continua intacto.

## Stack confirmada
- Frontend: React + TypeScript + Tailwind + shadcn/ui + Framer Motion (já no projeto)
- Backend: Supabase (já conectado) — Postgres + RLS + Edge Functions + Realtime
- IA: o prompt pede OpenAI/Anthropic. Vou sugerir trocar para **Lovable AI Gateway** (sem chave externa). Confirme na pergunta abaixo.
- WhatsApp: Evolution API (chave + URL configuradas pelo admin no app)

## Fases de execução

### Fase 1 — Fundação (esta entrega)
1. Migration Supabase com todas as tabelas, índices, RLS e seed do Módulo 1: `app_settings`, `agents`, `whatsapp_instances`, `contacts`, `conversations`, `messages`, `quick_replies`, `conversation_events`.
2. Ajuste de RLS: substituir o `USING (TRUE)` genérico por policies baseadas em role (admin/supervisor/agent) usando tabela `user_roles` + função `has_role` (evita escalonamento de privilégio).
3. Tipos TypeScript em `src/types/crm.ts`.
4. Autenticação (login/signup email+senha) — necessária porque RLS exige usuário autenticado. Página `/atendimento/login`.
5. Layout base de `/atendimento`: rota protegida, sidebar dark, header, área de conteúdo vazia.

### Fase 2 — Inbox + Kanban
- Lista de conversas com filtros (bot / fila / ativo / resolvido).
- Visualização Kanban arrastável por status.
- Painel de chat com mensagens em Realtime (Supabase channel).
- Envio de mensagens, notas internas, respostas rápidas.

### Fase 3 — WhatsApp (Evolution API)
- Tela de instâncias: criar, conectar (QR Code), status.
- Edge Function `whatsapp-webhook` recebe mensagens da Evolution e grava em `messages`.
- Edge Function `whatsapp-send` envia mensagens do agente para a Evolution.

### Fase 4 — Bot de IA
- Edge Function `ai-bot-reply` chamada quando `bot_active=true` numa conversa.
- Prompt do sistema vem de `app_settings.system_prompt`.
- Detecção de intenção, escalonamento por palavras-chave e turnos, resumo automático para o atendente.

### Fase 5 — Configurações + Dashboard
- Página de configurações (provedor IA, prompts, horário comercial, agentes, respostas rápidas).
- Dashboard com métricas básicas (conversas/dia, tempo médio, taxa de resolução).

## Detalhes técnicos relevantes

- **Segurança**: vou criar `app_role` enum + tabela `user_roles` + função `has_role()` SECURITY DEFINER. As policies reais usarão essa função em vez de `USING (TRUE)`. O documento original tem isso como "FUTURO", mas é requisito básico.
- **Secrets**: chaves Evolution/IA NÃO ficam em `app_settings.value_enc` (frágil). Vou usar Supabase Secrets para Edge Functions. O campo `value_enc` da tabela só guardará flags/configurações não-sensíveis, e os secrets reais (`EVOLUTION_API_KEY`, `EVOLUTION_API_URL`, etc.) serão pedidos quando chegarmos na Fase 3.
- **Site atual**: nada do site institucional será alterado. `/` continua igual; o CRM vive em `/atendimento/*`.

## Entrega desta mensagem
Apenas a **Fase 1** (migration + auth + layout base). Após aprovação, seguimos para a Fase 2.