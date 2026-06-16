import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { classifierService, Category, ClassificationResult } from "./ClassifierService";

export interface RoutingResult {
  category: Category;
  agentId?: string;
  agentName?: string;
  queueId?: string;
  confidence: number;
  reasoning: string;
}

export class RouterService {
  private static instance: RouterService;

  private constructor() {}

  public static getInstance(): RouterService {
    if (!RouterService.instance) {
      RouterService.instance = new RouterService();
    }
    return RouterService.instance;
  }

  /**
   * Roteia mensagem para agente correto baseado na classificação
   */
  async routeMessage(
    contactId: string,
    conversationId: string,
    messageText: string,
  ): Promise<RoutingResult> {
    // Classificar mensagem
    const classification = await classifierService.classify(messageText);

    // Se for escalação para humano, adiciona à fila
    if (classification.category === "escalacao_humano") {
      return this.routeToHuman(conversationId, classification);
    }

    // Encontrar agente disponível para a categoria
    const agent = await this.findAgentByCategory(classification.category);

    if (agent) {
      // Log do roteamento
      await this.logRouting(contactId, conversationId, classification.category, agent.id);

      return {
        category: classification.category,
        agentId: agent.id,
        agentName: agent.name,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      };
    }

    // Se não houver agente disponível, escalona para humano
    return this.routeToHuman(conversationId, classification);
  }

  /**
   * Encontra agente disponível para uma categoria
   */
  private async findAgentByCategory(category: Category) {
    // Mapear categoria para role de agente
    const roleMap: Record<Category, string> = {
      atendimento: "attendant",
      vendas: "seller",
      pesquisa_tecnica: "support",
      escalacao_humano: "human",
    };

    const role = roleMap[category];

    // Buscar agente disponível com a role
    const { data: agents, error } = await supabaseAdmin
      .from("agents")
      .select("id, name, role, status")
      .eq("role", role)
      .eq("status", "available")
      .limit(1);

    if (error || !agents || agents.length === 0) {
      return null;
    }

    return agents[0];
  }

  /**
   * Roteia para fila de atendimento humano
   */
  private async routeToHuman(conversationId: string, classification: ClassificationResult) {
    // Adicionar à fila de espera
    await supabaseAdmin.from("waiting_queue").insert({
      conversation_id: conversationId,
      reason: classification.reasoning,
      priority: "normal",
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return {
      category: "escalacao_humano" as Category,
      queueId: conversationId,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
    };
  }

  /**
   * Log de roteamento para auditoria
   */
  private async logRouting(
    contactId: string,
    conversationId: string,
    category: Category,
    agentId: string,
  ) {
    try {
      await supabaseAdmin.from("routing_history").insert({
        contact_id: contactId,
        conversation_id: conversationId,
        category,
        agent_id: agentId,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error logging routing:", err);
    }
  }
}

export const routerService = RouterService.getInstance();
