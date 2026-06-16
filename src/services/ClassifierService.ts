export type Category = "atendimento" | "vendas" | "pesquisa_tecnica" | "escalacao_humano";

export interface ClassificationResult {
  category: Category;
  confidence: number;
  reasoning: string;
}

export class ClassifierService {
  private static instance: ClassifierService;

  private constructor() {}

  public static getInstance(): ClassifierService {
    if (!ClassifierService.instance) {
      ClassifierService.instance = new ClassifierService();
    }
    return ClassifierService.instance;
  }

  /**
   * Classifica mensagem usando heurísticas (regras rápidas)
   * Se confiança < 0.7, retorna undefined para usar LLM como fallback
   */
  private classifyByHeuristics(text: string): ClassificationResult | undefined {
    const lower = text.toLowerCase();

    // Atendimento: saudações, status, informações gerais
    if (
      /^(oi|olá|e aí|bom dia|boa tarde|boa noite|opa|ei)$/i.test(lower) ||
      /qual.*horário|quando.*atend|como.*funciona|qual.*endereço/i.test(lower)
    ) {
      return {
        category: "atendimento",
        confidence: 0.85,
        reasoning: "Saudação ou pergunta geral",
      };
    }

    // Vendas: orçamento, preço, compra, promoção
    if (
      /orçamento|preço|quanto custa|quero comprar|comprar|promo|desconto|vende|vender|oferta/i.test(
        lower,
      )
    ) {
      return {
        category: "vendas",
        confidence: 0.9,
        reasoning: "Menção a preço, compra ou promoção",
      };
    }

    // Pesquisa técnica: defeito, erro, problema, instalação, dúvida técnica
    if (
      /defeito|erro|problema|não funciona|quebrou|instalação|como instalar|dúvida|técnica|especificação|modelo/i.test(
        lower,
      )
    ) {
      return {
        category: "pesquisa_tecnica",
        confidence: 0.88,
        reasoning: "Menção a problema técnico ou instalação",
      };
    }

    return undefined;
  }

  /**
   * Classifica mensagem (heurística + LLM fallback)
   */
  async classify(text: string): Promise<ClassificationResult> {
    // Tenta heurísticas primeiro (rápido)
    const heuristic = this.classifyByHeuristics(text);
    if (heuristic && heuristic.confidence >= 0.7) {
      return heuristic;
    }

    // Fallback: usar LLM se disponível, senão escalona para humano
    try {
      const llmResult = await this.classifyByLLM(text);
      if (llmResult) return llmResult;
    } catch (err) {
      console.warn("LLM classification failed:", err);
    }

    // Se nada funcionou, escalona para humano
    return {
      category: "escalacao_humano",
      confidence: 0.5,
      reasoning: "Classificação incerta, escalando para atendimento humano",
    };
  }

  /**
   * Classifica usando LLM (OpenAI)
   * TODO: Implementar integração com OpenAI API
   */
  private async classifyByLLM(text: string): Promise<ClassificationResult | undefined> {
    // Placeholder: seria integração com OpenAI GPT
    // const response = await openai.chat.completions.create({...})
    // return parseResponse(response)

    console.log("LLM classification not yet implemented for:", text.substring(0, 50));
    return undefined;
  }
}

export const classifierService = ClassifierService.getInstance();
