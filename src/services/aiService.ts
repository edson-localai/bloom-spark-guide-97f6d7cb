import { supabase } from '@/integrations/supabase/client';

export async function getAiSuggestion(conversationId: string, messages: any[]) {
  try {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'system_prompt')
      .single();

    const prompt = settings?.value || 'Você é a Clara, assistente da HCB.';
    
    // Formata o histórico para a IA
    const history = messages.map(m => `${m.sender_type === 'contact' ? 'Cliente' : 'Atendente'}: ${m.content}`).join('\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOVABLE_API_KEY}`, // Note: In edge functions we use this, in frontend we might need a different approach or a proxy
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'system', content: `${prompt}\n\nAnalise a conversa acima e sugira a próxima resposta ideal para o atendente. Seja curto e direto.` },
          { role: 'user', content: history }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI:', error);
    return null;
  }
}
