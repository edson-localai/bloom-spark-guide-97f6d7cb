'use server';

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const handleAutoReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    conversationId: z.string().uuid(),
    content: z.string().min(1).max(10000)
  }).parse(data))
  .handler(async ({ data: { conversationId, content } }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Verifica se auto-reply está ativo
      const { data: settings } = await supabaseAdmin
        .from('app_settings')
        .select('value')
        .eq('key', 'auto_reply_active')
        .single();

      if (settings?.value !== 'true') return { handled: false };

      // 2. Verifica status da conversa e se auto-reply individual está ativo
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('status, bot_active, auto_reply_enabled, contact_id, bot_disabled_at')
        .eq('id', conversationId)
        .single();

      if (!conv) return { handled: false };

      // Reativa automaticamente se passou de 24 horas
      const isExpired = conv.bot_disabled_at && 
        (new Date().getTime() - new Date(conv.bot_disabled_at).getTime()) > 24 * 60 * 60 * 1000;
      
      let botActive = conv.bot_active;
      let currentStatus = conv.status;

      if (!botActive && isExpired) {
        await supabaseAdmin
          .from('conversations')
          .update({ 
            bot_active: true, 
            bot_disabled_at: null,
            status: 'bot' 
          })
          .eq('id', conversationId);
        botActive = true;
        currentStatus = 'bot';
      }

      if (currentStatus !== 'bot' || !botActive || !conv.auto_reply_enabled) return { handled: false };

      // 3. Busca histórico e prompt
      const { data: promptSetting } = await supabaseAdmin
        .from('app_settings')
        .select('value')
        .eq('key', 'system_prompt')
        .single();

      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('content, sender_type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      const history = (messages || [])
        .reverse()
        .map(m => `${m.sender_type}: ${m.content}`)
        .join('\n');

      // 4. Chama IA
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp',
          messages: [
            { 
              role: 'system', 
              content: `${promptSetting?.value || 'Você é a Ana.'}\n\nSe o cliente solicitar falar com um humano, ou se você não souber responder, ou se o assunto for complexo, você deve obrigatoriamente incluir a tag [HANDOVER] na sua resposta. Isso desativará o atendimento automático.` 
            },
            { role: 'user', content: `Histórico:\n${history}\n\nResponda ao cliente:` }
          ]
        })
      });

      const aiData = await aiResponse.json();
      let replyContent = aiData.choices[0].message.content;
      const isHandover = replyContent.includes('[HANDOVER]');

      if (isHandover) {
        replyContent = replyContent.replace('[HANDOVER]', '').trim();
        
        // Desativa o bot e marca o tempo
        await supabaseAdmin
          .from('conversations')
          .update({ 
            bot_active: false, 
            bot_disabled_at: new Date().toISOString(),
            status: 'open' // Transfere para humano
          })
          .eq('id', conversationId);

        // Insere mensagem de sistema para notificação
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          content: 'Transbordamento para atendimento humano solicitado pela IA.',
          sender_type: 'system',
          content_type: 'event'
        });
      }

      // 5. Insere resposta
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        content: replyContent,
        sender_type: 'bot',
      });

      // 6. Tenta extrair dados simultaneamente (reutilizando lógica)
      // (Poderia chamar extractContactData aqui se fosse exportável sem createServerFn wrapper)

      return { handled: true, reply: replyContent };
    } catch (error) {
      console.error('Auto reply failed:', error);
      return { handled: false };
    }
  });

export const extractContactData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    conversationId: z.string().uuid(),
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data: { conversationId, contactId } }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Busca as últimas 10 mensagens
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('content, sender_type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!messages || messages.length === 0) return { updated: false };

      const chatHistory = messages
        .reverse()
        .map(m => `${m.sender_type}: ${m.content}`)
        .join('\n');

      // 2. Chama a IA via Lovable AI Gateway (usando fetch no server)
      const prompt = `Analise a conversa abaixo e extraia dados do VEÍCULO do cliente se houver. 
      Responda APENAS em JSON válido com as chaves: brand, model, year (number), name. 
      Se não encontrar algum campo, deixe null. Se não encontrar NADA, responda {"empty": true}.
      
      Conversa:
      ${chatHistory}`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const aiData = await aiResponse.json();
      const extracted = JSON.parse(aiData.choices[0].message.content);

      if (extracted.empty) return { updated: false };

      // 3. Atualiza o contato se houver novos dados
      const updates: any = {};
      if (extracted.brand) updates.vehicle_brand = extracted.brand;
      if (extracted.model) updates.vehicle_model = extracted.model;
      if (extracted.year) updates.vehicle_year = extracted.year;
      if (extracted.name) updates.name = extracted.name;

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('contacts')
          .update(updates)
          .eq('id', contactId);
        
        return { updated: true, data: updates };
      }

      return { updated: false };
    } catch (error) {
      console.error('Extraction failed:', error);
      return { error: true };
    }
  });
