# Story 2.1 — Sistema de Roteamento Inteligente

## Title

Implementar classificador de necessidades e router para agentes

## Description

Criar um sistema que classifica mensagens recebidas por WhatsApp e roteia automaticamente para o agente correto (Atendimento, Venda, Suporte) ou escalona para atendimento humano se necessário.

**Fluxo:**

```
Mensagem recebida → Classificador (LLM/regras)
  ├─ "Atendimento" → Agente Atendimento
  ├─ "Vendas" → Agente Venda
  ├─ "Pesquisa Técnica" → Agente Suporte
  └─ "Complexo/Humano" → Fila de atendimento
```

## Acceptance Criteria

- [ ] Classificador identifica corretamente as 4 categorias
- [ ] Router roteia mensagens para agente correto
- [ ] Fallback para humano implementado
- [ ] Histórico de roteamento salvo no banco
- [ ] Testes de classificação passam
- [ ] Sem erros de console

## Tasks

- [ ] Criar interface `RouterConfig` e `ClassificationResult`
- [ ] Implementar `MessageClassifier` (usar LLM ou regras heurísticas)
- [ ] Implementar `MessageRouter` (rotear para agente correto)
- [ ] Criar `RouteHistory` table no Supabase (opcional, para logs)
- [ ] Integrar router no webhook de mensagens WhatsApp
- [ ] Testar fluxo end-to-end
- [ ] Commit atomático: `feat: implement intelligent message routing`

## Tech Details

- Arquivo novo: `src/services/RouterService.ts`
- Arquivo novo: `src/services/ClassifierService.ts`
- Integrações: Supabase (para histórico), OpenAI (para LLM, opcional)
- Endpoints: `/routes/api/public/whatsapp.webhook.ts` (atualizar)

## Notes

- Clasificador pode usar LLM (GPT) ou regras heurísticas (keywords)
- Recomendo hybrid: regras rápidas + LLM como fallback
- Escalação para humano: salvar na fila de atendimento (waiting_queue)
