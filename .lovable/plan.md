Fase 6: Automação Avançada de Dados e Experiência do Usuário (UX).

## Mudanças Propostas

### 1. Extração Inteligente de Dados (IA)
- Implementação de um observador que, ao detectar informações de veículo (marca, modelo, ano) nas mensagens do cliente, atualiza automaticamente o cadastro do contato.
- A Clara passará a atuar como uma "Data Entry" silenciosa, mantendo a base de dados sempre limpa e atualizada.

### 2. Linha do Tempo de Interações (Timeline)
- Substituição da visualização estática por uma **Timeline Interativa** no painel lateral do contato.
- Exibição cronológica de: Entrada no funil, mudanças de status, atribuição de agente e notas de auditoria.

### 3. Exportação de Inteligência (Dashboard)
- Botão para **Exportar Relatórios** em CSV no Dashboard.
- Filtros avançados por data e por agente para análise offline.

### 4. Refinamento de UI/UX
- Adição de animações de transição suave entre rotas.
- Indicador de "Digitando..." real (simulado via Realtime).
- Melhoria na responsividade dos painéis laterais.

### Detalhes Técnicos
- Utilização de `createServerFn` para processamento pesado de IA em background.
- Implementação de um `AuditTimeline` componente.
- Lógica de extração baseada no histórico recente da conversa.

Esta fase consolida o CRM como uma ferramenta de alta performance, focada em produtividade extrema e dados acionáveis.