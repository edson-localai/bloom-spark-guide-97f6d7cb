Fase 7: Experiência Visual Premium e Otimização de Resposta.

## Mudanças Propostas

### 1. Tematização Dark Mode Avançada
- Refinamento das sombras e brilhos neon no estilo Cyberpunk.
- Adição de `framer-motion` para transições suaves entre abas (Inbox -> Kanban -> Dashboard).
- Efeitos de hover "glassmorphism" nos cards do Kanban e listas.

### 2. Melhorias na Inbox (UX)
- **Indicadores de Digitado Real:** Mostrar quando o cliente está digitando (se suportado pela API de integração futuro).
- **Pré-visualização de Mídia:** Melhorar o tratamento de imagens e anexos no histórico de chat.
- **Busca Global:** Filtro rápido na sidebar que busca em contatos e mensagens simultaneamente.

### 3. Engine de Respostas Sugeridas (IA)
- A Clara sugerirá não apenas uma, mas **três opções de resposta** (Simpática, Direta, Técnica).
- Integração com o banco de **Respostas Rápidas** para sugerir atalhos existentes baseados na pergunta do cliente.

### 4. Estrutura de Atendimento por Fila
- Sistema de "Assumir" conversa para evitar que dois agentes respondam a mesma pessoa ao mesmo tempo.
- Contador de tempo de espera na fila de "Aguardando".

### Detalhes Técnicos
- Instalação do `framer-motion`.
- Atualização do `aiService` para suporte a múltiplas sugestões.
- Lógica de bloqueio de escrita (optimistic locking) para agentes concorrentes.

Esta fase foca na sensação de produto "High-end" e na eficiência máxima do operador.