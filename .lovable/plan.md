# Plano de Refatoração e Otimização do Sistema

Este plano visa transformar a arquitetura atual em uma solução mais robusta, escalável e de fácil manutenção, focando na estabilidade das conexões de WhatsApp e na performance geral do CRM.

## Etapa 1: Arquitetura e Estabilidade do Servidor
*   **Centralização da Lógica de Negócio:** Migrar lógicas complexas espalhadas por `serverFn` para uma camada de serviços dedicada (`src/services/whatsapp/`), separando a infraestrutura da regra de negócio.
*   **Padronização de Erros:** Implementar um middleware global de tratamento de erros no servidor para garantir respostas consistentes (JSON) e logs detalhados via `audit_logs`.
*   **Isolamento de Credenciais:** Refatorar o `whatsapp.server.ts` para usar cache em memória (Short-term TTL) ao ler as `app_settings`, reduzindo a carga no banco de dados em cada chamada de API.

## Etapa 2: Otimização de Banco de Dados e Webhooks
*   **Normalização de Tabelas:**
    *   Criar índices GIN em campos JSONB para buscas rápidas.
    *   Adicionar chaves estrangeiras com `ON DELETE SET NULL` ou `CASCADE` para evitar erros manuais de deleção.
*   **Processamento Assíncrono:** Implementar uma fila de processamento para webhooks (MESSAGES_UPSERT) para evitar timeouts quando houver um volume alto de mensagens simultâneas.
*   **Idempotência:** Refinar o controle de mensagens duplicadas utilizando uma chave única composta no PostgreSQL (`wa_message_id` + `instance_id`).

## Etapa 3: Performance e UX no Frontend
*   **Otimização de Querys:** Substituir seleções `select('*')` por campos específicos em todos os hooks, diminuindo o tráfego de dados.
*   **Estado Global e Cache:** Implementar políticas de cache mais agressivas no `TanStack Query` para evitar re-renders desnecessários e loadings constantes.
*   **Feedback em Tempo Real:** Melhorar o uso do Supabase Realtime para atualizar status de conexão e novas mensagens sem exigir "Sincronizar" manual com tanta frequência.

## Etapa 4: Segurança e Monitoramento
*   **Revisão de Políticas de RLS:** Auditar todas as tabelas para garantir que agentes só vejam o que lhes é permitido, protegendo dados sensíveis de instâncias admin.
*   **Dashboard de Saúde:** Criar uma rota de monitoramento para administradores visualizarem o status de todas as instâncias e latência da Evolution API em um único lugar.

---

### Detalhes Técnicos (Para Desenvolvedores)
*   **Service Pattern:** Criar `src/services/WhatsAppService.ts` como uma classe Singleton.
*   **Middleware:** Refatorar `auth-middleware.ts` para incluir verificação de permissões (RBAC) granular.
*   **Schema:** Migração SQL para adicionar `index` em `messages(wa_message_id)` e `conversations(whatsapp_chat_id)`.
*   **Webhooks:** Mover lógica de processamento do webhook para uma Edge Function dedicada caso o volume cresça além dos limites do TanStack Start.
