"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

export const landingChat = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        messages: z.array(messageSchema).min(1).max(20),
      })
      .parse(data),
  )
  .handler(async ({ data: { messages } }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        reply: "Estamos com instabilidade no atendimento. Clique em continuar pelo WhatsApp.",
        ready: true,
        summary: "",
        lead: null as null | LeadData,
      };
    }

    const systemPrompt = `Você é Ana, atendente virtual da HCB Automotivo (oficina especializada).
Seu objetivo é coletar de forma rápida, simpática e objetiva:
1. Nome do cliente
2. Veículo (marca, modelo e ano)
3. O que precisa (sintoma, serviço desejado)
4. Cidade ou bairro

Regras:
- Faça UMA pergunta por vez, em português brasileiro, curta e amigável.
- Quando tiver os 4 dados, responda APENAS com um JSON exato no formato:
{"done": true, "name": "<nome>", "vehicle_brand": "<marca>", "vehicle_model": "<modelo>", "vehicle_year": <ano numérico ou null>, "need": "<o que precisa>", "city": "<cidade ou bairro>", "summary": "Olá! Sou <nome>, tenho um <marca> <modelo> <ano>. Preciso de <necessidade>. Estou em <cidade>."}
- Antes de ter os 4 dados, responda em texto natural (sem JSON) com a próxima pergunta.
- Nunca invente dados. Nunca peça CPF, endereço completo ou dados sensíveis.
- Se o cliente pedir para falar com humano, responda APENAS:
{"done": true, "name": null, "vehicle_brand": null, "vehicle_model": null, "vehicle_year": null, "need": "Pediu para falar com humano", "city": null, "summary": "Olá! Gostaria de falar com um atendente."}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("[landing-chat] gateway error", res.status, txt);
        if (res.status === 429) {
          return {
            reply: "Muitas mensagens agora. Vamos continuar pelo WhatsApp?",
            ready: true,
            summary: "",
            lead: null,
          };
        }
        return {
          reply: "Tive um problema aqui. Vamos continuar pelo WhatsApp?",
          ready: true,
          summary: "",
          lead: null,
        };
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

      const jsonMatch = content.match(/\{[\s\S]*"done"\s*:\s*true[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.done && typeof parsed.summary === "string") {
            const lead: LeadData = {
              name: typeof parsed.name === "string" ? parsed.name.slice(0, 120) : null,
              vehicle_brand:
                typeof parsed.vehicle_brand === "string" ? parsed.vehicle_brand.slice(0, 60) : null,
              vehicle_model:
                typeof parsed.vehicle_model === "string" ? parsed.vehicle_model.slice(0, 60) : null,
              vehicle_year:
                typeof parsed.vehicle_year === "number" &&
                parsed.vehicle_year > 1900 &&
                parsed.vehicle_year < 2100
                  ? parsed.vehicle_year
                  : null,
              need: typeof parsed.need === "string" ? parsed.need.slice(0, 500) : null,
              city: typeof parsed.city === "string" ? parsed.city.slice(0, 80) : null,
            };
            return {
              reply:
                "Perfeito! Vou te direcionar para o WhatsApp para continuar com um especialista.",
              ready: true,
              summary: parsed.summary,
              lead,
            };
          }
        } catch {}
      }

      return {
        reply: content || "Pode me contar um pouco mais?",
        ready: false,
        summary: "",
        lead: null,
      };
    } catch (err) {
      console.error("[landing-chat] error", err);
      return {
        reply: "Tive um problema aqui. Vamos continuar pelo WhatsApp?",
        ready: true,
        summary: "",
        lead: null,
      };
    }
  });

export type LeadData = {
  name: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  need: string | null;
  city: string | null;
  chat_transcript?: string | null;
  avatar_url?: string | null;
};

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120).nullable(),
  vehicle_brand: z.string().trim().max(60).nullable(),
  vehicle_model: z.string().trim().max(60).nullable(),
  vehicle_year: z.number().int().min(1900).max(2100).nullable(),
  need: z.string().trim().max(500).nullable(),
  city: z.string().trim().max(80).nullable(),
  chat_transcript: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export const saveLandingLead = createServerFn({ method: "POST" })
  .inputValidator((data) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Deduplicação: busca lead existente com mesmos dados básicos
    let query = supabaseAdmin
      .from("contacts")
      .select("id, phone")
      .eq("name", data.name || "Lead do site");

    if (data.vehicle_brand) query = query.eq("vehicle_brand", data.vehicle_brand);
    else query = query.is("vehicle_brand", null);

    if (data.vehicle_model) query = query.eq("vehicle_model", data.vehicle_model);
    else query = query.is("vehicle_model", null);

    if (data.vehicle_year) query = query.eq("vehicle_year", data.vehicle_year);
    else query = query.is("vehicle_year", null);

    if (data.city) query = query.eq("city", data.city);
    else query = query.is("city", null);

    const { data: existing } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log("[saveLandingLead] lead repetido encontrado:", existing.id);
      return { ok: true, id: existing.id, leadId: existing.phone, reused: true };
    }

    // Phone é NOT NULL na tabela; usamos um placeholder único até o cliente
    // mandar a primeira mensagem real pelo WhatsApp (que cria outro contato
    // com o telefone verdadeiro via webhook).
    const leadId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: row, error } = await supabaseAdmin
      .from("contacts")
      .insert({
        name: data.name || "Lead do site",
        phone: leadId,
        vehicle_brand: data.vehicle_brand,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        city: data.city,
        notes: data.chat_transcript || (data.need ? `Necessidade: ${data.need}` : null),
        source: "landing_chat",
        stage: "novo",
        avatar_url: data.avatar_url,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[saveLandingLead] insert error", error);
      return { ok: false, id: null as string | null, leadId: null as string | null };
    }

    return { ok: true, id: row.id, leadId };
  });
