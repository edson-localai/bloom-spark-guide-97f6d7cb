import { supabase } from "@/integrations/supabase/client";

export interface AiSuggestions {
  friendly: string;
  direct: string;
  technical: string;
}

export async function getAiSuggestions(
  conversationId: string,
  messages: any[],
): Promise<AiSuggestions | null> {
  try {
    const { data: settings } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "system_prompt")
      .single();

    const prompt = settings?.value || "Você é a Ana, assistente da HCB.";

    const history = messages
      .map((m) => `${m.sender_type === "contact" ? "Cliente" : "Atendente"}: ${m.content}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp",
        messages: [
          {
            role: "system",
            content: `${prompt}\n\nAnalise a conversa e sugira TRÊS opções de resposta em formato JSON com as chaves: "friendly" (simpática com emojis), "direct" (curta e prática) e "technical" (focada em peças/detalhes mecânicos).`,
          },
          { role: "user", content: history },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error calling AI:", error);
    return null;
  }
}
