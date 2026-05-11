## Objetivo

Transformar `/atendimento` em uma experiência totalmente responsiva (estilo Chatwoot), instalável como app (PWA leve, sem service worker para evitar problemas no preview do Lovable) e com sessão persistente para que o atendente use o app HCB no celular em vez do WhatsApp.

## 1. Responsividade do Inbox (mobile-first, padrão Chatwoot)

**`src/routes/atendimento.tsx`** — Sidebar lateral vira:
- **Desktop (≥1024px)**: sidebar fixa de 240px (atual).
- **Tablet (768–1023px)**: sidebar colapsada só com ícones (64px).
- **Mobile (<768px)**: sidebar vira **bottom nav bar** fixa com 5 ícones principais (Inbox, Kanban, Contatos, Respostas, Config) + menu "mais" para o resto. Header mobile com logo + botão de logout.

**`src/routes/atendimento.index.tsx`** — Layout de 3 colunas vira navegação por etapas no mobile:
- **Mobile**: mostra **apenas uma coluna por vez** (lista → chat → detalhes). Botão "voltar" no header do chat e do painel de contato.
- **Tablet**: lista + chat (sem coluna de detalhes; abre como drawer).
- **Desktop**: 3 colunas (atual).

**`src/components/crm/ChatWindow.tsx`, `ConversationList.tsx`, `ContactSidebar.tsx`** — ajustar paddings, font-sizes, larguras de input/botões e área de mensagens para tocar em telas pequenas (touch targets ≥44px, textarea adaptativa, anexos em bottom sheet).

**Outras rotas** (`kanban`, `contatos`, `propostas`, `respostas`, `whatsapp`, `dashboard`, `config`, `usuarios`, `treinamento`) — adicionar overflow-x-auto e quebra de grid para mobile (cards empilhados).

## 2. Instalação como App (Manifest-only, sem service worker)

Conforme as regras do Lovable, **não vamos usar `vite-plugin-pwa` nem service worker** — eles quebram o preview do editor. Em vez disso:

- **`public/manifest.webmanifest`** — manifest com `name: "HCB Atendimento"`, `short_name: "HCB"`, `start_url: "/atendimento"`, `display: "standalone"`, `theme_color: "#00CCEE"`, `background_color: "#0A0A0F"`, ícones 192/512 (gerar com imagegen, fundo escuro com logo).
- **`src/routes/__root.tsx`** — adicionar `<link rel="manifest">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, `<link rel="apple-touch-icon">`.
- **`src/components/InstallAppPrompt.tsx`** (novo) — banner discreto no `/atendimento` que:
  - **Android/Chrome**: escuta `beforeinstallprompt`, mostra botão "Instalar app HCB" → chama `prompt()`.
  - **iOS Safari**: detecta iOS e mostra instruções "Toque em Compartilhar → Adicionar à Tela de Início".
  - Persiste dispensa em `localStorage` (`hcb_install_dismissed`).
  - Esconde se já estiver rodando standalone (`window.matchMedia('(display-mode: standalone)')`).

**Limitação avisada**: a instalação só funciona no domínio publicado (não no preview do Lovable). Sem service worker = sem offline, mas funciona como app instalável.

## 3. Sessão Persistente

A sessão Supabase **já é persistente por padrão** (`persistSession: true` salva em localStorage). Vamos só garantir:
- O token sobrevive ao fechamento do app (já funciona).
- `useCrmAuth` reage a `onAuthStateChange` (já implementado).
- **`src/routes/login.tsx`** — adicionar checkbox "Manter conectado" (já é o comportamento padrão; só explicitar). Após login bem-sucedido em mobile standalone, redirecionar direto para `/atendimento`.

Nada novo no banco — Supabase Auth já cuida disso.

## Arquivos a editar/criar

**Criar:**
- `public/manifest.webmanifest`
- `public/icon-192.png`, `public/icon-512.png` (gerar via imagegen)
- `src/components/InstallAppPrompt.tsx`
- `src/components/crm/MobileBottomNav.tsx`

**Editar:**
- `src/routes/__root.tsx` — manifest links + meta tags
- `src/routes/atendimento.tsx` — sidebar responsiva + bottom nav mobile + montar `<InstallAppPrompt />`
- `src/routes/atendimento.index.tsx` — navegação por etapas no mobile
- `src/components/crm/ChatWindow.tsx` — header com botão "voltar" no mobile, inputs touch-friendly
- `src/components/crm/ConversationList.tsx` — touch targets, paddings mobile
- `src/components/crm/ContactSidebar.tsx` — drawer no tablet/mobile
- `src/routes/login.tsx` — pequenos ajustes mobile

## Notas

- **Sem PWA com service worker** — apenas manifest + meta tags para "Add to Home Screen". Confirmado pela documentação interna do Lovable.
- A instalação só funciona em **HTTPS no domínio publicado** (`hcbautomotivo.com.br` ou `bloom-spark-guide.lovable.app`), nunca no preview do editor.
- Em iOS, não há prompt automático — o usuário precisa adicionar manualmente via Safari.
- Mantemos o WhatsApp funcionando no backend (W-API + webhook). O atendente apenas usa o app HCB como front; as mensagens continuam indo/vindo via WhatsApp do cliente.
