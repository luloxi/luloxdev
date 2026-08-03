import type { BlogPost } from "./types";

/**
 * Initial blog posts. Seeded into Neon on first request if the table is empty.
 * Edit from /rothko when logged in as admin (Google: lucianoolivabianco@gmail.com).
 * Drafts and live edits live in Neon only (not in this seed).
 */
export const seedPosts: BlogPost[] = [
  {
    slug: "por-que-deje-hermes-agent",
    publishedAt: "2026-08-02",
    coverImage: "/projects/focus/nous.png",
    published: true,
    tags: ["Hermes", "Grok", "automatización", "agentes"],
    title: {
      es: "Por qué dejé de usar Hermes Agent (y por qué sigo mirándolo)",
      en: "Why I stopped using Hermes Agent (and why I still keep an eye on it)",
    },
    summary: {
      es: "Para el día a día me alcanza Grok: correo, calendario, webs y MCPs. Hermes lo dejo para cuando quiera automatizaciones complejas que aprendan con el uso.",
      en: "For day-to-day work Grok is enough: email, calendar, web apps, and MCPs. I keep Hermes for when I want complex automations that learn with use.",
    },
    body: {
      es: `Durante unos meses usé **Hermes Agent** (Nous Research) como agente autónomo: tools, memoria y workflows. Sirvió. Aprendí mucho. Y después lo saqué del camino crítico de mi setup diario.

No es un "Hermes es malo". Es un "hoy mi stack se simplificó alrededor de Grok".

## Qué me resolvió Grok en el día a día

Con **Grok** puedo:

- **Organizar correo y calendario** sin armar un agente aparte solo para eso.
- **Construir webs y dapps** con Grok Build: iterar UI, wiring y deploy sin saltar de tool en tool.
- **Integraciones y MCP**: GitHub, y lo que vaya sumando, a gusto, desde el mismo flujo de trabajo.

En la práctica eso cubre el 80% de lo que antes buscaba en un agente "todo terreno": inbox en orden, agenda razonable, código que sale, y acciones en servicios reales.

Menos piezas móviles. Menos context switching. Un solo lugar donde pido y veo el resultado.

## Por qué no es un adiós a Hermes

Sigo **explorando Hermes** para proyectos futuros. Dos cosas me siguen interesando:

1. **Aprende muy bien** con el uso: memoria, hábitos, límites, y un estilo de trabajo que se va afinando.
2. **Automatizaciones complejas con palabras**: describir un workflow largo (tools, pasos, guards) en lenguaje natural y que el sistema lo sostenga en el tiempo.

Ahí Grok no me saca del todo de encima. Cuando el problema es un **equipo de agentes**, un proceso multi-paso con memoria pesada, o un pipeline que tiene que vivir solo durante semanas, Hermes (y el stack de agentes autónomos en general) sigue siendo territorio que quiero mapear.

## Cómo lo pienso ahora

| Uso | Stack |
| --- | --- |
| Correo, calendario, builds, MCPs del día a día | Grok + Grok Build |
| Experimentos de agent teams y workflows profundos | Hermes (y afines) |
| Automatizaciones muy específicas / integraciones raras | n8n cuando hace falta |

No busco un ganador eterno. Busco **la herramienta que menos fricción tiene para el trabajo de esta semana**, y un banco de pruebas para lo que viene después.

## Resumen

Dejé de **depender** de Hermes Agent para el setup diario porque Grok ya me automatiza lo operativo y me deja construir e integrar sin otro runtime en el medio.

Sigo **mirando y experimentando** con Hermes porque la curva de aprendizaje del agente y las automatizaciones complejas en lenguaje natural son, para mí, el siguiente nivel de productividad: no solo "hacé este PR", sino "mantené este proceso vivo".

Si estás eligiendo entre un chat con tools y un agente autónomo, mi regla simple: **empezá por el que ya está en tu flujo**. Escalás a Hermes (o similar) cuando el cuello de botella sea memoria, multi-agente o workflows que no caben en una sesión de chat.

![Hermes / Nous](/projects/focus/nous.png)
`,
      en: `For a few months I used **Hermes Agent** (Nous Research) as an autonomous agent: tools, memory, and workflows. It worked. I learned a lot. Then I took it out of the critical path of my daily setup.

This is not "Hermes is bad". It is "my stack simplified around Grok".

## What Grok covers day to day

With **Grok** I can:

- **Organize email and calendar** without running a separate agent just for that.
- **Build webs and dapps** with Grok Build: iterate UI, wiring, and deploy without jumping between tools.
- **Integrations and MCP**: GitHub, and whatever else I plug in, from the same workflow.

In practice that covers about 80% of what I used to want from an all-purpose agent: inbox in order, a sane calendar, code that ships, and actions on real services.

Fewer moving parts. Less context switching. One place to ask and see the result.

## Why this is not goodbye to Hermes

I still **explore Hermes** for future projects. Two things still interest me:

1. **It learns well** with use: memory, habits, limits, and a work style that gets sharper over time.
2. **Complex automations in words**: describe a long workflow (tools, steps, guards) in natural language and have the system hold it over time.

There Grok does not fully replace it. When the problem is a **team of agents**, a multi-step process with heavy memory, or a pipeline that has to live on its own for weeks, Hermes (and autonomous agent stacks in general) is still ground I want to map.

## How I think about it now

| Use | Stack |
| --- | --- |
| Email, calendar, builds, day-to-day MCPs | Grok + Grok Build |
| Experiments with agent teams and deep workflows | Hermes (and similar) |
| Very specific automations / odd integrations | n8n when needed |

I am not hunting for a forever winner. I want **the tool with the least friction for this week's work**, and a sandbox for what comes next.

## Summary

I stopped **depending** on Hermes Agent for the daily setup because Grok already automates the operational layer and lets me build and integrate without another runtime in the middle.

I still **watch and experiment** with Hermes because the agent's learning curve and complex natural-language automations are, for me, the next productivity layer: not only "do this PR", but "keep this process alive".

If you are choosing between a chat with tools and an autonomous agent, my simple rule: **start with what is already in your flow**. Scale to Hermes (or similar) when the bottleneck is memory, multi-agent, or workflows that do not fit in one chat session.

![Hermes / Nous](/projects/focus/nous.png)
`,
    },
  },
  {
    slug: "comercio-agentico-y-lcp",
    publishedAt: "2026-08-01",
    coverImage: "/projects/focus/lcp.svg",
    published: false,
    tags: ["LCP", "agentic commerce", "AI"],
    title: {
      es: "Qué es el comercio agéntico y por qué es necesario el LCP",
      en: "What is agentic commerce and why LCP is needed",
    },
    summary: {
      es: "Los agentes ya pueden pagar. Lo que falta es un contexto legal descubrible, firmable y verificable. Ahí entra el Legal Context Protocol.",
      en: "Agents can already pay. What is missing is discoverable, signable, verifiable legal context. That is where the Legal Context Protocol comes in.",
    },
    body: {
      es: `El comercio agéntico es simple de enunciar y difícil de cerrar bien: **software actúa en tu nombre** (o en el de una empresa) para comprar, vender, contratar o ejecutar microtransacciones, a menudo sin un humano mirando cada clic.

Hoy hay mucho ruido sobre pagos para agentes (stablecoins, micropagos, checkout delegado). El stack de *value transfer* avanza. Lo que casi nadie resolvió es la capa legal: **qué términos gobiernan la operación, si se aceptaron, y cómo se resuelve un conflicto**.

## El hueco que dejan los protocolos de pago

Protocolos de pago y de commerce se ocupan de mover valor, carrito y autorización de gasto. En general **delegan** lo que pasa cuando algo sale mal:

- términos del merchant
- registro de acuerdo
- resolución de disputas
- enforceabilidad en el mundo real

Sin eso, un agente que cierra miles de microdeals es un riesgo operativo y legal, no solo un producto cool.

## Qué es el LCP

El **Legal Context Protocol (LCP)** es un estándar abierto para el contexto legal del comercio agéntico. La idea central es aburrida a propósito y por eso funciona: **un lugar predecible** donde cualquier agente (cualquier framework) puede obtener el contexto legal de un dominio.

\`\`\`
https://{cualquier-dominio}/.well-known/legal-context.json
\`\`\`

Ese archivo apunta a los términos, puede incluir un hash (ATR) de la versión exacta al momento de la transacción, y puede exigir aceptación explícita. Como \`.well-known/openid-configuration\` hizo descubrible la identidad, LCP apunta a hacer descubrible el contexto legal.

No te dice *qué* términos poner. Estandariza **cómo** se localizan, se atan al pago y se pueden verificar después.

## Niveles de confianza

LCP no es todo-o-nada. Hay niveles proporcionales al riesgo:

1. **Informacional**: el agente encuentra los términos; seguir implica consentimiento implícito.
2. **Provable**: un hash prueba qué términos regían en el momento del deal.
3. **Firmado**: firma digital que ata a una parte a un documento concreto.
4. **Integrado**: hooks a disputas, escrow, compliance e infraestructura legal.

Para un micro-pago de centavos puede bastar el nivel 1 o 2. Para algo de más valor, querés firma y recourse.

## Por qué me importa

En el trabajo de research me interesa el comercio agéntico como capa de adopción real: no solo demos de agentes que "compran", sino **flujos que un abogado, un compliance officer o un regulador puedan leer sin inventar el stack**.

LCP es co-stewarded por la American Arbitration Association (AAA-ICDR) e Integra Ledger. Eso no lo hace magia, pero sí lo ancla en instituciones que entienden disputas de verdad, no solo whitepapers.

Si estás armando agentes que tocan dinero, el LCP no es "nice to have". Es la diferencia entre un experimento y un sistema que puede vivir en producción.

![Legal Context Protocol](/projects/focus/lcp.svg)
`,
      en: `Agentic commerce is easy to say and hard to do right: **software acts on your behalf** (or a company's) to buy, sell, contract, or run microtransactions, often without a human watching every click.

There is a lot of noise about agent payments (stablecoins, micropayments, delegated checkout). The *value transfer* stack is moving. What almost nobody solved is the legal layer: **which terms govern the deal, whether they were accepted, and how a dispute is resolved**.

## The gap payment protocols leave open

Payment and commerce protocols move value, carts, and spend authorization. They usually **defer** what happens when things go wrong:

- merchant terms
- agreement records
- dispute resolution
- real-world enforceability

Without that, an agent closing thousands of micro-deals is an operational and legal risk, not just a cool demo.

## What LCP is

The **Legal Context Protocol (LCP)** is an open standard for the legal context of agentic commerce. The core idea is boring on purpose, and that is why it works: **one predictable place** where any agent (any framework) can fetch a domain's legal context.

\`\`\`
https://{any-domain}/.well-known/legal-context.json
\`\`\`

That file points at the terms, can include a hash (ATR) of the exact version at transaction time, and can require explicit acceptance. Like \`.well-known/openid-configuration\` made identity discoverable, LCP aims to make legal context discoverable.

It does not tell you *what* terms to use. It standardizes **how** terms are found, bound to payment, and verified later.

## Levels of trust

LCP is not all-or-nothing. Levels scale with risk:

1. **Informational**: the agent finds the terms; proceeding implies consent.
2. **Provable**: a hash proves which terms governed at deal time.
3. **Signed**: a digital signature binds a party to a specific document.
4. **Integrated**: hooks into disputes, escrow, compliance, and legal infrastructure.

A sub-cent micropayment may only need level 1 or 2. Higher value wants signature and recourse.

## Why I care

In research work I care about agentic commerce as a real adoption layer: not only demos of agents that "buy things", but **flows a lawyer, compliance officer, or regulator can read without inventing the stack**.

LCP is co-stewarded by the American Arbitration Association (AAA-ICDR) and Integra Ledger. That is not magic, but it anchors the standard in institutions that understand real disputes, not only whitepapers.

If you are building agents that touch money, LCP is not a nice-to-have. It is the difference between an experiment and a system that can live in production.

![Legal Context Protocol](/projects/focus/lcp.svg)
`,
    },
  },
  {
    slug: "que-es-tokenizacion",
    publishedAt: "2026-07-28",
    coverImage: "/projects/focus/tokenization.svg",
    published: false,
    tags: ["tokenización", "RWA", "blockchain"],
    title: {
      es: "Qué es la tokenización y las diferentes formas de beneficiarte",
      en: "What tokenization is and the different ways to benefit from it",
    },
    summary: {
      es: "Tokenizar no es solo poner un activo en la blockchain. Es representación programable de derechos, con reglas de transferencia, custody e identidad.",
      en: "Tokenization is not just putting an asset on a blockchain. It is a programmable representation of rights, with transfer rules, custody, and identity.",
    },
    body: {
      es: `La **tokenización** es representar un activo, un derecho o un flujo de valor como un **token** en una blockchain (o en un ledger programable). El token no "es" el edificio o la factura por magia: es un **título digital** ligado a un marco legal y a procesos off-chain que le dan fuerza.

Cuando se hace bien, ganás tres cosas:

1. **Transferencia más barata y más rápida** entre participantes del mercado.
2. **Reglas on-chain** (quién puede recibir, horarios, límites, freeze).
3. **Composabilidad**: el token puede entrar en DeFi, colateral, settlement atomic, etc., *si* la regulación y el diseño lo permiten.

## Qué se puede tokenizar

- **Activos del mundo real (RWA)**: inmuebles fraccionados, facturas, commodities, deuda.
- **Valores negociables**: acciones, ONs, CEDEARs, cuotapartes (donde el regulador lo habilite).
- **Derechos de uso / licencias**: acceso, royalties, membresías.
- **Dinero y cuasi-dinero**: stablecoins, depósitos tokenizados, fondos de money market.

No todo conviene. Si el activo no tiene un mercado, un custodio claro o un claim legal limpio, tokenizar solo agrega fricción técnica.

## Formas de beneficiarte (sin humo)

### 1. Como emisor o empresa
- **Capital más granular**: levantar fracciones sin armar un proceso de listing tradicional completo (cuando el régimen lo permite).
- **Automatizar compliance**: allowlists, KYC atado a identidad on-chain, límites por jurisdicción.
- **Settlement más corto**: menos intermediarios en la cadena de post-trade.

### 2. Como inversor o holder
- **Acceso a tramos más chicos** de activos que antes pedían tickets altos.
- **Liquidez secundaria** (si hay mercado y permisos de transferencia).
- **Transparencia de ownership** on-chain, con la salvedad de que la privacidad y el off-chain siguen importando.

### 3. Como builder / protocolo
- **Programmable tokens** con estándares (ERC-3643 en EVM, CIP-113 en Cardano) en vez de reinventar transfer restrictions en cada contrato.
- **Puentes entre TradFi y cripto** con custody e identidad serias.

### 4. Como jurisdicción / mercado
Países que arman un régimen claro de tokenización (Argentina con la CNV es un ejemplo en movimiento) capturan emisión, custody y talentos. Eso es política industrial, no solo "innovación".

## Lo que la gente confunde

| Mito | Realidad |
| --- | --- |
| "El token *es* el activo" | El token representa un derecho; el activo vive en un marco legal y operativo |
| "Si está on-chain, es líquido" | Liquidez = compradores + permisos de transferencia + market structure |
| "Sin intermediarios" | Custody, transfer agents, oráculos y compliance siguen existiendo, a veces on-chain |

![Tokenización](/projects/focus/tokenization.svg)
`,
      en: `**Tokenization** means representing an asset, a right, or a value stream as a **token** on a blockchain (or programmable ledger). The token is not "the building" or "the invoice" by magic: it is a **digital claim** tied to a legal frame and off-chain processes that give it force.

When done well, you get three things:

1. **Cheaper, faster transfer** among market participants.
2. **On-chain rules** (who can receive, time windows, limits, freezes).
3. **Composability**: the token can enter DeFi, collateral, atomic settlement, and so on, *if* regulation and design allow it.

## What can be tokenized

- **Real-world assets (RWA)**: fractional real estate, invoices, commodities, debt.
- **Securities**: equities, bonds, depositary receipts, fund units (where the regulator allows it).
- **Usage rights / licenses**: access, royalties, memberships.
- **Money and near-money**: stablecoins, tokenized deposits, money-market funds.

Not everything is worth it. If the asset has no market, no clear custodian, or a messy legal claim, tokenization only adds technical friction.

## Ways to benefit (no hype)

### 1. As an issuer or company
- **More granular capital**: raise fractions without a full traditional listing process (when the regime allows).
- **Automate compliance**: allowlists, KYC tied to on-chain identity, jurisdictional limits.
- **Shorter settlement**: fewer intermediaries in the post-trade chain.

### 2. As an investor or holder
- **Access to smaller tickets** on assets that used to require large minimums.
- **Secondary liquidity** (if there is a market and transfer permissions).
- **Ownership transparency** on-chain, with the caveat that privacy and off-chain facts still matter.

### 3. As a builder / protocol
- **Programmable tokens** with standards (ERC-3643 on EVM, CIP-113 on Cardano) instead of reinventing transfer restrictions in every contract.
- **Bridges between TradFi and crypto** with serious custody and identity.

### 4. As a jurisdiction / market
Countries that build a clear tokenization regime (Argentina's CNV is one moving example) capture issuance, custody, and talent. That is industrial policy, not only "innovation".

## Common confusions

| Myth | Reality |
| --- | --- |
| "The token *is* the asset" | The token represents a right; the asset lives in a legal and operational frame |
| "If it is on-chain, it is liquid" | Liquidity = buyers + transfer permissions + market structure |
| "No intermediaries" | Custody, transfer agents, oracles, and compliance still exist, sometimes on-chain |

![Tokenization](/projects/focus/tokenization.svg)
`,
    },
  },
  {
    slug: "tokenizacion-legal-argentina",
    publishedAt: "2026-07-25",
    coverImage: "/projects/focus/tokenization.svg",
    published: false,
    tags: ["Argentina", "CNV", "regulación", "RWA"],
    title: {
      es: "Estado legal actual de la tokenización en Argentina y otras regiones",
      en: "Current legal status of tokenization in Argentina and other regions",
    },
    summary: {
      es: "La CNV abrió un régimen escalonado de tokenización de valores. Un mapa de etapas en Argentina y cómo se compara con otros mercados.",
      en: "Argentina's CNV opened a staged regime for tokenizing securities. A map of stages in Argentina and how it compares with other markets.",
    },
    body: {
      es: `Hablar de "tokenización legal" sin país es marketing. Las reglas cambian por jurisdicción, por tipo de activo y por si hay **oferta pública** o no. Acá un mapa práctico, con foco en Argentina (donde vivo y donde la CNV se movió fuerte en 2025-2026).

## Argentina: CNV y régimen de tokenización

La Comisión Nacional de Valores (CNV) fue armando un **régimen escalonado** vía Resoluciones Generales. La lectura gruesa (siempre verificá el texto oficial antes de emitir):

### Etapa I · RG 1069/2025 (jun 2025)
Incorpora un Título de tokenización orientado a **valores representativos de deuda y certificados de participación de fideicomisos financieros** con oferta pública, y **cuotapartes de FCI cerrados**, con patrimonios ligados a activos del mundo real u otros bienes admisibles (no cotizados en mercados locales en el sentido clásico del régimen).

### Etapa II · RG 1081/2025 (ago 2025)
Amplía el universo tokenizable hacia **acciones, obligaciones negociables y CEDEARs**. Suma a los PSAV (Proveedores de Servicios de Activos Virtuales) como depositarios elegibles en categorías del registro CNV.

### Etapa III · RG 1087/2025 (oct 2025)
Habilita tokenizaciones bajo regímenes de **oferta pública automática** de mediano impacto, emisores y emisiones frecuentes de fideicomisos financieros. Extiende el sandbox regulatorio (hasta ago 2026 en el diseño publicado).

### Etapa IV · RG 1137/2026 (abr 2026)
Abre elaboración participativa de normas para tokenizar valores bajo distintos regímenes de autorización automática (con excepciones, p. ej. FCI abiertos en el planteo).

**Señal política:** Argentina está intentando ser **early mover** en tokenización de valores con oferta pública, no solo en cripto retail. Eso importa para builders y para custody local.

> Esto no es asesoramiento legal ni de inversión. Es un resumen de investigación. Para emitir o invertir, leé la norma y hablá con un abogado de mercado de capitales.

## Otras regiones (vista rápida)

### Unión Europea
- **MiCA** cubre cripto-activos en general; los **security tokens** siguen más del lado de directivas de mercados (MiFID, etc.).
- Tokenización de valores avanza con CSDs y bancos experimentando DLT settlement (piloto DLT / regimes nacionales).

### Estados Unidos
- La línea roja sigue siendo **security vs non-security**. La SEC y la jurisprudencia Howey siguen dominando el análisis.
- Hay emisión y secondary de tokenized treasuries y fondos, pero con actores regulados y mucha ingeniería legal.

### LATAM (además de AR)
- **Brasil** (CVM) y **México** (CNBV) tienen caminos distintos para valores digitales y sandboxes.
- El patrón común: primero custody y oferta pública controlada, después liquidez secundaria más amplia.

### Asia
- **Singapur**, **Hong Kong** y **Japón** concentran emisión institucional de tokenized funds y bonos, con licencias de custody fuertes.

## Qué mirar si vas a construir o emitir en AR

1. **¿Es valor negociable?** Si sí, CNV. Si no, puede caer en otros regímenes (BCRA, UIF, derecho civil).
2. **¿Quién es el depositario / custodio del token y del subyacente?**
3. **¿Transfer restrictions?** Programmable tokens (ERC-3643, CIP-113) importan cuando el régimen exige control de tenedores.
4. **¿Oferta pública o privada?** Cambia el compliance de punta a punta.
5. **Sandbox vs régimen general:** el sandbox acelera, pero no es un blank check eterno.

El marco se mueve rápido. Cuando actualice este post, voy a dejar la fecha de revisión arriba del todo.
`,
      en: `Talking about "legal tokenization" without a country is marketing. Rules change by jurisdiction, asset type, and whether there is a **public offering**. Here is a practical map, with focus on Argentina (where I live and where the CNV moved hard in 2025-2026).

## Argentina: CNV and the tokenization regime

The Comisión Nacional de Valores (CNV) built a **staged regime** through General Resolutions. High-level reading (always verify the official text before issuing):

### Stage I · RG 1069/2025 (Jun 2025)
Adds a tokenization title aimed at **debt securities and participation certificates of financial trusts** with public offering, and **closed-end fund units**, with portfolios tied to real-world assets or other admissible goods.

### Stage II · RG 1081/2025 (Aug 2025)
Widens the tokenizable universe toward **equities, corporate bonds, and CEDEARs**. Brings PSAVs (virtual asset service providers) in as eligible depositaries under CNV registry categories.

### Stage III · RG 1087/2025 (Oct 2025)
Enables tokenizations under **automatic public offering** regimes for mid-impact issuers and frequent financial-trust issuances. Extends the regulatory sandbox (through Aug 2026 in the published design).

### Stage IV · RG 1137/2026 (Apr 2026)
Opens participatory rulemaking to tokenize securities under automatic authorization regimes (with exceptions, e.g. open-end funds in the draft framing).

**Policy signal:** Argentina is trying to be an **early mover** on public-offering tokenization of securities, not only retail crypto. That matters for builders and local custody.

> This is not legal or investment advice. It is research summary. For issuance or investment, read the rule and talk to capital-markets counsel.

## Other regions (quick view)

### European Union
- **MiCA** covers crypto-assets broadly; **security tokens** still sit closer to markets directives (MiFID, etc.).
- Securities tokenization advances with CSDs and banks experimenting on DLT settlement (DLT pilot / national regimes).

### United States
- The bright line is still **security vs non-security**. The SEC and Howey-style analysis still dominate.
- Tokenized treasuries and funds exist, with regulated actors and heavy legal engineering.

### LATAM (beyond AR)
- **Brazil** (CVM) and **Mexico** (CNBV) take different paths for digital securities and sandboxes.
- Common pattern: custody and controlled public offering first, broader secondary liquidity later.

### Asia
- **Singapore**, **Hong Kong**, and **Japan** host institutional issuance of tokenized funds and bonds, with strong custody licenses.

## What to watch if you build or issue in AR

1. **Is it a negotiable security?** If yes, CNV. If not, other regimes may apply (central bank, AML, civil law).
2. **Who is the depositary / custodian of the token and the underlying?**
3. **Transfer restrictions?** Programmable tokens (ERC-3643, CIP-113) matter when the regime requires holder control.
4. **Public vs private offering?** Changes compliance end to end.
5. **Sandbox vs general regime:** sandbox speeds you up; it is not a forever blank check.

The frame moves fast. When I update this post, I will leave the review date at the top.
`,
    },
  },
  {
    slug: "midnight-privacidad-blockchain",
    publishedAt: "2026-07-20",
    coverImage: "/projects/focus/midnight.svg",
    published: false,
    tags: ["Midnight", "privacidad", "IOG", "ZK"],
    title: {
      es: "Qué es Midnight y por qué es importante la privacidad en blockchain",
      en: "What Midnight is and why privacy matters on blockchain",
    },
    summary: {
      es: "Las blockchains públicas son transparentes por defecto. Eso frena adopción institucional. Midnight apunta a privacidad selectiva con smart contracts.",
      en: "Public blockchains are transparent by default. That blocks institutional adoption. Midnight aims at selective privacy with smart contracts.",
    },
    body: {
      es: `Las blockchains públicas son transparentes por defecto. Eso es una feature para auditar dinero sin pedir permiso. También es un freno fuerte para personas, empresas e instituciones que no pueden (o no quieren) publicar su vida operativa en un explorador.

## El problema: transparencia total no escala a la vida real

Bitcoin y muchas L1 públicas exponen **el grafo de pagos y estados** a cualquiera con un explorador.

Eso choca con:

- **Empresas** que no quieren revelar proveedores, márgenes o nómina on-chain.
- **Personas** que no quieren que un salary stream o un medical payment sea panóptico.
- **Reguladores** que a la vez piden AML/KYC *y* protección de datos (GDPR y amigos).
- **Instituciones** que no van a poner procesos sensibles en un ledger legible por competidores.

La privacidad no es "para criminales". Es el default de la economía analógica: no publicás tu extracto bancario en la vereda.

## Privacidad selectiva (no oscuridad total)

El diseño interesante no es "todo oculto para siempre". Es **selective disclosure**:

- Probar un hecho ("soy mayor de 18", "pasé KYC con X", "el balance alcanza") **sin** revelar el resto.
- Permitir que un auditor o un regulador autorizado vea lo que la ley exige.
- Mantener composabilidad de smart contracts donde tenga sentido.

Ahí entran ZK (zero-knowledge proofs) y modelos de datos que separan lo público de lo protegido.

## Qué es Midnight

**Midnight** es la **blockchain de privacidad del ecosistema Cardano**, impulsada por **Input Output Global (IOG)** y con el respaldo de la **Midnight Foundation** en el lado de ecosistema y comunidad.

La apuesta de producto es clara:

- **Smart contracts con datos protegidos**
- **Pruebas** en lugar de datos crudos en cada paso
- Un camino para que apps y empresas usen blockchain **sin** volcar su vida operativa a un explorador público
- Encaje con el stack y la cultura de **Cardano** (research, formal methods, adopción real), no un "privacy coin" aislado

No es un monero-clone de "solo privacidad de transferencias". Es infraestructura para **aplicaciones** (identidad, compliance, commerce, RWA con datos sensibles) donde la privacidad es un feature de producto.

Más contexto: [Midnight Network](https://midnight.network/), [docs](https://docs.midnight.network/), [IOG](https://www.iog.io), [Midnight Foundation](https://midnight.foundation/).

## Por qué importa para adopción

| Sin privacidad usable | Con privacidad selectiva |
| --- | --- |
| Solo casos "ok si todo se ve" | Casos enterprise y personales reales |
| Compliance forzado off-chain feo | Compliance + proof on-chain |
| Doxxing por grafo de txs | Menos metadata accidental |

Stablecoins, tokenización y comercio agéntico **no terminan de despegar a escala institucional** si cada movimiento es un dump de inteligencia competitiva. La privacidad es una pieza central de adopción: sin ella, solo entran los casos donde publicar todo es aceptable.

Si estás diseñando un producto on-chain, preguntate: *¿qué datos NO deberían ser públicos?* Si la respuesta es "casi todos los interesantes", necesitás un modelo de privacidad desde el día uno.

![Midnight](/projects/focus/midnight.svg)
`,
      en: `Public blockchains are transparent by default. That is a feature if you want to audit money without asking permission. It is also a hard stop for people, companies, and institutions that cannot (or will not) publish their operations on an explorer.

## The problem: full transparency does not scale to real life

Bitcoin and many public L1s expose **the full payment and state graph** to anyone with an explorer.

That collides with:

- **Companies** that will not reveal suppliers, margins, or payroll on-chain.
- **People** who do not want a salary stream or medical payment to be panoptic.
- **Regulators** who want AML/KYC *and* data protection (GDPR and friends).
- **Institutions** that will not put sensitive processes on a competitor-readable ledger.

Privacy is not "for criminals". It is the default of the analog economy: you do not paste your bank statement on the sidewalk.

## Selective privacy (not total darkness)

The interesting design is not "everything hidden forever". It is **selective disclosure**:

- Prove a fact ("I am over 18", "I passed KYC with X", "balance is enough") **without** revealing the rest.
- Let an auditor or authorized regulator see what the law requires.
- Keep smart-contract composability where it makes sense.

That is where ZK (zero-knowledge proofs) and data models that separate public from protected state come in.

## What Midnight is

**Midnight** is the **privacy blockchain of the Cardano ecosystem**, driven by **Input Output Global (IOG)** and supported by the **Midnight Foundation** on the ecosystem and community side.

The product bet is clear:

- **Smart contracts with protected data**
- **Proofs** instead of raw data at every step
- A path for apps and enterprises to use blockchain **without** dumping operations into a public explorer
- Fit with the **Cardano** stack and culture (research, formal methods, real adoption), not a standalone "privacy coin"

It is not a Monero-clone story of "transfer privacy only". It is infrastructure for **applications** (identity, compliance, commerce, RWA with sensitive data) where privacy is a product feature.

More context: [Midnight Network](https://midnight.network/), [docs](https://docs.midnight.network/), [IOG](https://www.iog.io), [Midnight Foundation](https://midnight.foundation/).

## Why it matters for adoption

| Without usable privacy | With selective privacy |
| --- | --- |
| Only "ok if everything is public" cases | Real enterprise and personal cases |
| Ugly forced off-chain compliance | Compliance + on-chain proof |
| Doxxing via tx graph | Less accidental metadata |

Stablecoins, tokenization, and agentic commerce **do not fully scale institutionally** if every move is a competitive-intelligence dump. Privacy is a core adoption piece: without it, only the cases where publishing everything is acceptable move forward.

If you are designing an on-chain product, ask: *which data should NOT be public?* If the answer is "almost all the interesting bits", you need a privacy model from day one.

![Midnight](/projects/focus/midnight.svg)
`,
    },
  },
  {
    slug: "cip-113-vs-erc-3643",
    publishedAt: "2026-07-15",
    coverImage: "/projects/focus/tokenization.svg",
    published: false,
    tags: ["CIP-113", "ERC-3643", "Cardano", "EVM", "RWA"],
    title: {
      es: "Comparando el estándar CIP-113 con el ERC-3643",
      en: "Comparing the CIP-113 standard with ERC-3643",
    },
    summary: {
      es: "Dos caminos hacia programmable tokens con compliance: T-REX / ERC-3643 en EVM y CIP-113 en Cardano. Parecidos en objetivo, distintos en arquitectura.",
      en: "Two paths to programmable compliance tokens: T-REX / ERC-3643 on EVM and CIP-113 on Cardano. Similar goals, different architecture.",
    },
    body: {
      es: `Si tokenizás un valor o un RWA regulado, casi seguro necesitás **reglas en cada transferencia**: solo inversores elegibles, freeze, límites por país, reclaim en casos extremos. Un ERC-20 "pelado" no alcanza.

Dos estándares importan en mi research:

- **ERC-3643** (T-REX) en el mundo EVM
- **CIP-113** (programmable tokens) en Cardano

Mismo problema de producto. Arquitecturas distintas.

## ERC-3643 en una frase

**ERC-3643** es un estándar de security token en Ethereum-compatible chains. Encima del token viven módulos de:

- **Identity** (claims ON-chain o referenciados)
- **Compliance** (reglas que validan transfers)
- **Roles** de agente / emisor (force transfer, pause, etc. según implementación)

El ecosistema T-REX popularizó el patrón: el transfer llama a un *compliance contract* y solo pasa si las reglas dicen ok. Hay sitio oficial, EIP y tooling maduro en EVM.

Enlaces:

- [erc3643.org](https://www.erc3643.org/)
- [EIP-3643](https://eips.ethereum.org/EIPS/eip-3643)

## CIP-113 en una frase

**CIP-113** define programmable tokens en Cardano: assets nativos con una **capa de validación** en mint/burn/transfer, sin hard fork del ledger. Ideas clave (según la implementación de referencia de Cardano Foundation / evolución desde CIP-143):

- Tokens programables custodiados en una **dirección de script compartida**
- **Ownership** resuelto vía stake credentials
- **Registry on-chain** de tokens registrados y de la lógica (substandards) que aplica
- **Substandards** enchufables: denylist, freeze & seize, allowlists, etc.

No es "un contrato ERC-20 con hooks". Es un **framework de L1 Cardano** sobre native assets + scripts.

Enlaces:

- [CIP-113 implementation (Aiken)](https://github.com/cardano-foundation/cip113-programmable-tokens)
- [CIP-143 (origen conceptual)](https://cips.cardano.org/cip/CIP-0143)

## Comparación directa

| | **ERC-3643** | **CIP-113** |
| --- | --- | --- |
| Ecosistema | EVM (Ethereum, L2s, sidechains) | Cardano |
| Base asset | Contract token (ERC-20-like) | Native assets + shared script custody |
| Reglas | Contratos de compliance / modules | Substandards + registry + validators |
| Identidad | Claims / ONCHAINID-style patterns | Depende del substandard y del diseño off/on-chain |
| Madurez de mercado | Más emisión y tooling EVM hoy | Estándar en evolución (Last Check / audit path) |
| Integración wallets/DEX | Amplia en EVM, con matices de permissioned | Requiere trabajo de wallets/DEX para ownership por stake cred |
| Freeze / seize | Común en implementaciones T-REX | Substandards (p. ej. freeze-and-seize) |

## Cuándo me inclino a uno u otro

- **ERC-3643** si tu liquidez, custody y counsel ya viven en EVM, o necesitás interoperar con DeFi EVM permissioned.
- **CIP-113** si el diseño de producto es Cardano-native, te importa el modelo de native assets, y querés el framework de registry + substandards.

En ambos casos el 80% del trabajo **no** es el estándar: es legal, custody, oráculos de identidad y distribución. El estándar solo evita reinventar el *transfer hook* mal.

## Cómo lo estoy investigando

En proyectos de focus del sitio dejo ambos:

- Tokenización como tema (CIP-113 + ERC-3643 + legal)
- Links a repos y specs oficiales

Si estás eligiendo stack para un security token en 2026, mirá primero **qué chain usa tu custodio y tu mercado secundario**. El estándar correcto es el que ese mercado ya puede liquidar.

![Token standards](/projects/focus/tokenization.svg)
`,
      en: `If you tokenize a security or a regulated RWA, you almost certainly need **rules on every transfer**: eligible investors only, freezes, country limits, reclaim in edge cases. A plain ERC-20 is not enough.

Two standards matter in my research:

- **ERC-3643** (T-REX) in the EVM world
- **CIP-113** (programmable tokens) on Cardano

Same product problem. Different architectures.

## ERC-3643 in one line

**ERC-3643** is a security-token standard on Ethereum-compatible chains. On top of the token live modules for:

- **Identity** (on-chain or referenced claims)
- **Compliance** (rules that validate transfers)
- **Issuer / agent roles** (force transfer, pause, etc. depending on implementation)

The T-REX ecosystem popularized the pattern: transfer calls a *compliance contract* and only succeeds if rules say ok. There is an official site, an EIP, and mature EVM tooling.

Links:

- [erc3643.org](https://www.erc3643.org/)
- [EIP-3643](https://eips.ethereum.org/EIPS/eip-3643)

## CIP-113 in one line

**CIP-113** defines programmable tokens on Cardano: native assets with a **validation layer** on mint/burn/transfer, without a ledger hard fork. Key ideas (from the Cardano Foundation reference implementation / evolution from CIP-143):

- Programmable tokens held at a **shared script address**
- **Ownership** resolved via stake credentials
- **On-chain registry** of registered tokens and the logic (substandards) that applies
- Pluggable **substandards**: denylist, freeze & seize, allowlists, and more

It is not "an ERC-20 with hooks". It is a **Cardano L1 framework** on native assets + scripts.

Links:

- [CIP-113 implementation (Aiken)](https://github.com/cardano-foundation/cip113-programmable-tokens)
- [CIP-143 (conceptual origin)](https://cips.cardano.org/cip/CIP-0143)

## Side-by-side

| | **ERC-3643** | **CIP-113** |
| --- | --- | --- |
| Ecosystem | EVM (Ethereum, L2s, sidechains) | Cardano |
| Base asset | Contract token (ERC-20-like) | Native assets + shared script custody |
| Rules | Compliance contracts / modules | Substandards + registry + validators |
| Identity | Claims / ONCHAINID-style patterns | Depends on substandard and off/on-chain design |
| Market maturity | More issuance and EVM tooling today | Standard still evolving (Last Check / audit path) |
| Wallet / DEX integration | Broad on EVM, with permissioned nuances | Needs wallet/DEX work for stake-credential ownership |
| Freeze / seize | Common in T-REX implementations | Substandards (e.g. freeze-and-seize) |

## When I lean one way or the other

- **ERC-3643** if your liquidity, custody, and counsel already live on EVM, or you need permissioned EVM DeFi interop.
- **CIP-113** if the product is Cardano-native, you care about the native-asset model, and you want the registry + substandards framework.

In both cases 80% of the work is **not** the standard: it is legal, custody, identity oracles, and distribution. The standard only keeps you from reinventing the transfer hook badly.

## How I am researching this

On the site focus areas I keep both:

- Tokenization as a topic (CIP-113 + ERC-3643 + legal)
- Links to official repos and specs

If you are picking a stack for a security token in 2026, first check **which chain your custodian and secondary market already settle on**. The right standard is the one that market can already clear.

![Token standards](/projects/focus/tokenization.svg)
`,
    },
  },
];
