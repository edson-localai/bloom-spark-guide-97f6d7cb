'use server';

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export const landingChat = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      messages: z.array(messageSchema).min(1).max(20),
    }).parse(data)
  )
  .handler(async ({ data: { messages } }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        reply: "Estamos com instabilidade no atendimento. Clique em continuar pelo WhatsApp.",
        ready: true,
        summary: "",
      };
    }

    const systemPrompt = `Você é Clara, atendente virtual da HCB Automotivo (oficina especializada).
Seu objetivo é coletar de forma rápida, simpática e objetiva:
1. Nome do cliente
2. Veículo (marca, modelo e ano)
3. O que precisa (sintoma, serviço desejado)
4. Cidade ou bairro

Regras:
- Faça UMA pergunta por vez, em português brasileiro, curta e amigável.
- Quando tiver os 4 dados, responda APENAS com um JSON exato no formato:
{"done": true, "summary": "Olá! Sou <nome>, tenho um <marca> <modelo> <ano>. Preciso de <necessidade>. Estou em <cidade>."}
- Antes de ter os 4 dados, responda em texto natural (sem JSON) com a próxima pergunta.
- Nunca invente dados. Nunca peça CPF, endereço completo ou dados sensíveis.
- Se o cliente pedir para falar com humano, responda APENAS:
{"done": true, "summary": "Olá! Gostaria de falar com um atendente."}`;

    try {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('[landing-chat] gateway error', res.status, txt);
        if (res.status === 429) {
          return { reply: "Muitas mensagens agora. Vamos continuar pelo WhatsApp?", ready: true, summary: "" };
        }
        return { reply: "Tive um problema aqui. Vamos continuar pelo WhatsApp?", ready: true, summary: "" };
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

      // Try parse JSON done payload
      const jsonMatch = content.match(/\{[\s\S]*"done"\s*:\s*true[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.done && typeof parsed.summary === 'string') {
            return {
              reply: "Perfeito! Vou te direcionar para o WhatsApp para continuar com um especialista.",
              ready: true,
              summary: parsed.summary,
            };
          }
        } catch {}
      }

      return { reply: content || "Pode me contar um pouco mais?", ready: false, summary: "" };
    } catch (err) {
      console.error('[landing-chat] error', err);
      return { reply: "Tive um problema aqui. Vamos continuar pelo WhatsApp?", ready: true, summary: "" };
    }
  });
