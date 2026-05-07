Para otimizar o SEO da HCB Ar Condicionado Automotivo, focaremos em visibilidade local (Castanhal e região), autoridade da marca e performance técnica.

### 1. Otimização On-Page (Imediato)
*   **Melhoria de Metadados:** Atualizar títulos e descrições para incluir palavras-chave estratégicas como "Ar Condicionado Automotivo Castanhal", "Peças Denso", "Linha Pesada e Leve".
*   **Hierarquia de Cabeçalhos (H1-H6):** Garantir que apenas um H1 exista (no Hero) e que as seções sigam uma ordem lógica para os rastreadores.
*   **Atributos Alt em Imagens:** Adicionar descrições textuais em todas as imagens (logo e assets) para acessibilidade e indexação.
*   **Dados Estruturados (JSON-LD):** Implementar o schema `LocalBusiness` para ajudar o Google a entender que se trata de uma empresa física em Castanhal com endereço e telefone.

### 2. Conteúdo e Palavras-chave
*   **Foco Regional:** Reforçar termos relacionados a Castanhal, Pará e cidades vizinhas.
*   **Foco em Marcas:** Destacar a parceria "Denso" e a variedade de peças (compressores, condensadores, etc.).
*   **Segmentação:** Otimizar termos para "Linha Pesada" e "Máquinas Agrícolas", que são nichos de alta busca na região.

### 3. SEO Técnico e Performance
*   **Canonical Tags:** Prevenir problemas de conteúdo duplicado.
*   **Sitemap e Robots.txt:** Criar arquivos essenciais para orientar os robôs de busca.
*   **Linguagem do Site:** Corrigir a tag `lang="en"` para `lang="pt-BR"` no arquivo raiz.

### 4. SEO Local (Fora do Código)
*   **Google Meu Negócio:** Otimizar a ficha da empresa com fotos, horários e incentivar avaliações de clientes.

---

### Detalhes Técnicos para Implementação:

1.  **src/routes/__root.tsx:**
    *   Alterar `lang="en"` para `lang="pt-BR"`.
    *   Refinar `title` e `description` no objeto `head`.
    *   Adicionar script JSON-LD de `LocalBusiness`.

2.  **src/components/HeroSection.tsx:**
    *   Garantir que o H1 contenha as palavras-chave principais.
    *   Adicionar `alt` descritivo na imagem da logo.

3.  **src/components/Footer.tsx:**
    *   Verificar se as informações de contato estão em formato de texto (rastreável).

4.  **Criação de Arquivos:**
    *   `public/robots.txt`
    *   `public/sitemap.xml` (ou via script de build).
