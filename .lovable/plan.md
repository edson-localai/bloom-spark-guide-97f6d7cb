Fase 2 focada na interface de Atendimento (Inbox) com suporte a tempo real, listagem de conversas e chat ativo.

## Mudanças Propostas

### 1. Componentes de UI (Novos)
- `src/components/crm/ConversationList.tsx`: Lista de conversas com busca, filtros (Minhas, Fila, Resolvidas) e indicadores de status.
- `src/components/crm/ChatWindow.tsx`: Janela de chat com histórico de mensagens, campo de entrada e alternância entre Chat e Notas Internas.
- `src/components/crm/ContactSidebar.tsx`: Painel lateral direito com detalhes do contato (veículo, tags, histórico).

### 2. Hooks e Estado (Novos)
- `src/hooks/useConversations.ts`: Gerenciamento da lista de conversas com filtros e Realtime.
- `src/hooks/useMessages.ts`: Gerenciamento das mensagens de uma conversa específica com Realtime e envio.

### 3. Rotas (Novas/Editadas)
- `src/routes/atendimento.index.tsx`: Transformada na Inbox principal combinando os novos componentes.
- `src/routes/atendimento.tsx`: Atualização da sidebar para habilitar os links da Fase 2.

### Detalhes Técnicos
- Utilização de `supabase-js` Realtime para atualizações instantâneas de novas mensagens e mudança de status de conversas.
- Estilização seguindo o padrão Dark/Cyberpunk já estabelecido (Cores: `#0A0A0F`, `#00CCEE`, `#1F232E`).
- Filtros de atendimento: "Minhas" (atribuídas ao agente logado), "Aguardando" (fila), "Todas".

O objetivo é entregar um terminal de atendimento funcional onde o agente pode ver quem está chamando, assumir o chat e responder.