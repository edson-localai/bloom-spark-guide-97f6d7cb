Fase 4: Inteligência Artificial (Clara) e Dashboard de Métricas.

## Mudanças Propostas

### 1. Integração com IA (Clara)
- Implementação do motor de IA utilizando o **Lovable AI Gateway**.
- **Resumo Automático:** A Clara gerará resumos das conversas ao serem arquivadas/resolvidas.
- **Detecção de Intenção:** Identificação automática se o cliente quer comprar, agendar ou tirar dúvidas.
- **Sugestão de Respostas:** Sugestões baseadas no contexto da conversa para o atendente.

### 2. Dashboard de Performance (`/atendimento/dashboard`)
- Gráficos de volume de mensagens por período.
- Métricas chave: Tempo médio de resposta, conversas iniciadas vs. resolvidas.
- Status dos agentes (Online/Ocupado).

### 3. Configurações Avançadas (`/atendimento/config`)
- Editor de Prompt do Sistema (ajuste da personalidade da Clara).
- Configurações de horários de funcionamento.
- Gerenciamento de chaves de API e provedores de IA.

### 4. Interatividade no Kanban
- Implementação de Drag & Drop para mover cards entre colunas.
- Atualização automática do status da conversa/lead ao mover o card.

### Detalhes Técnicos
- Utilização de `ai_gateway` para chamadas de LLM.
- Persistência de `ai_summary` e `ai_intent` na tabela `conversations`.
- Criação de uma Edge Function `process-message` para lidar com a lógica da Clara em background.

Esta fase transformará o CRM em um sistema "Smart", reduzindo a carga de trabalho manual dos atendentes.