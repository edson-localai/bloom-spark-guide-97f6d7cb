Fase 3: Implementação dos módulos complementares (Gestão de Contatos, Respostas Rápidas e Integração WhatsApp).

## Mudanças Propostas

### 1. Gestão de Contatos (`/atendimento/contatos`)
- Tabela de contatos com filtros por veículo (marca/modelo) e tags.
- Modal para edição de detalhes do contato.
- Histórico resumido de atendimentos por contato.

### 2. Respostas Rápidas (`/atendimento/respostas`)
- Listagem de templates de resposta com atalhos.
- CRUD de respostas (Título, Conteúdo, Atalho).
- Integração: As respostas serão utilizáveis via atalho `/` no chat.

### 3. Gerenciamento de WhatsApp (`/atendimento/whatsapp`)
- Listagem das instâncias configuradas no banco.
- Exibição de status (Conectado/Desconectado).
- Mock do QR Code para simular conexão (a conexão real depende de uma API externa como Evolution API).

### 4. Kanban de Negociações (Fase 4 - Visualização Inicial)
- Estruturação das colunas: Novo, Orçamento, Aguardando Peça, Finalizado.
- Cards integrados aos contatos.

### Detalhes Técnicos
- Persistência direta no Supabase para Contatos e Respostas Rápidas.
- Reutilização dos componentes de estilo (Cyberpunk Dark).
- Implementação de um `useContacts` hook.

A Fase 3 tornará o sistema uma ferramenta completa de CRM, não apenas um chat.