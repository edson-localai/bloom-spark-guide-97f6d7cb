# Story 3.1 — Agentes Diferenciados com Workflows

## Title
Criar agentes especializados com workflows e permissões

## Description
Implementar 3 agentes especializados (Atendimento, Venda, Suporte) com workflows distintos, permissões e responsabilidades. Cada agente terá funções e escalas específicas.

**Agentes:**
```
1. Agente de Atendimento (attendant)
   └─ Funções: Saudação, qualificação, informações gerais
   └─ Escalação: Se vendas ou técnica, passa para agente correto

2. Agente de Venda (seller)
   └─ Funções: Orçamento, fechamento, proposta
   └─ Escalação: Se técnica, passa para suporte; se humano, escalona

3. Agente de Suporte (support)
   └─ Funções: Problemas técnicos, instalação, troubleshooting
   └─ Escalação: Se vendas, passa para seller; se humano, escalona
```

## Acceptance Criteria
- [ ] 3 agentes criados no banco (attendant, seller, support)
- [ ] Tabela agent_workflows criada com fluxos
- [ ] Cada agente tem permissões distintas
- [ ] RouterService encontra agentes por role
- [ ] Historico de workflows salvo
- [ ] Sem erros de console

## Tasks
- [ ] Criar tabela `agent_workflows` (fluxos e permissões)
- [ ] Criar tabela `agent_permissions` (o que cada agente pode fazer)
- [ ] Inserir 3 agentes no banco (atendimento, venda, suporte)
- [ ] Definir workflows por agente
- [ ] Atualizar RouterService para usar workflows
- [ ] Testar roteamento com agentes reais
- [ ] Commit atomático: `feat: create specialized agents with workflows`

## Tech Details
- Tabelas novas: `agent_workflows`, `agent_permissions`
- Arquivo modificado: `src/services/RouterService.ts` (integração)
- Estrutura: agents já existe, basta popular com dados

## Notes
- Agentes começam com status "available"
- Workflows são JSON armazenados em `agent_workflows.config`
- Permissões usam matriz de roles (read, write, escalate)
