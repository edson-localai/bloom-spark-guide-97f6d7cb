Fase 5: Automação de Fluxo e Notificações (Pós-Venda e Lembretes).

## Mudanças Propostas

### 1. Automações de Pós-Venda
- **Trigger de Finalização:** Quando um card é movido para "Finalizado" no Kanban, a Clara agenda uma mensagem de agradecimento automática para 24h depois.
- **NPS/Satisfação:** Envio automático de pesquisa de satisfação após 7 dias da conclusão do serviço.

### 2. Sistema de Notificações
- **Alertas de Ociosidade:** Notificar agentes se uma conversa na "Fila" estiver sem resposta por mais de 5 minutos.
- **Notificações no Navegador:** Alertas visuais e sonoros para novas mensagens quando a aba não estiver em foco.

### 3. Histórico de Auditoria
- **Log de Eventos:** Registro de quem moveu cada card, quem alterou configurações e logs de acesso.
- **Visualização de Timeline:** Exibir no painel lateral do contato uma linha do tempo de todas as interações e mudanças de status.

### 4. Melhorias na Clara (IA)
- **Extração Automática de Dados:** Se o cliente mencionar marca/modelo no chat, a Clara atualiza automaticamente o cadastro do contato sem intervenção humana.
- **Tradutor Integrado:** Opção de tradução em tempo real para atendimentos internacionais (se necessário).

### Detalhes Técnicos
- Criação da tabela `audit_logs` para rastreabilidade.
- Utilização de `window.Notification` API para alertas locais.
- Implementação de um `useNotifications` hook.
- Lógica de agendamento via Edge Functions (Cron jobs ou triggers retardados).

Esta fase finaliza a jornada de excelência, garantindo que nenhum cliente seja esquecido e que o processo seja 100% rastreável.