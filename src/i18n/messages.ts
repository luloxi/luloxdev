import type { Locale } from "./types";

export const messages = {
  es: {
    sections: {
      about: "Sobre mí",
      projects: "Proyectos",
      blog: "Blog",
      tastes: "Gustos",
      contact: "Contacto",
    },
    ui: {
      backHome: "Inicio",
      social: "Social",
      experience: "Experiencia",
      notFound: "Nada por acá.",
      themeLight: "Modo claro",
      themeDark: "Modo oscuro",
      langLabel: "Idioma",
    },
    about: {
      title: "Sobre mí",
      headline: "Builder, connector y pensador de largo plazo.",
      paragraphs: [
        "Me dedico a construir con AI y blockchain, no por el hype, sino porque son herramientas reales para coordinar personas y valor de formas nuevas.",
        "He estado en el ecosistema de Cardano y Midnight como ambassador y builder, y sigo cerca de comunidades que priorizan craft, open source y producto útil.",
        "Hoy combino producto, community y advisory: menos ruido, más signal. Me interesa RealFi, privacy tech, y agentes que hagan trabajo de verdad.",
        "Fuera de la pantalla: asados, meetups, cine y conversaciones largas. Creo que la mejor tech se construye con gente y con paciencia.",
      ],
      philosophy: "Build slowly. Ship honestly. Stay curious.",
      timeline: [
        {
          period: "2024 - Presente",
          title: "Midnight Ambassador & Builder",
          org: "IOG / Midnight",
          description:
            "Advocacy, community y exploración de privacy-preserving smart contracts.",
        },
        {
          period: "2023 - Presente",
          title: "Builder",
          org: "BuidlGuidl",
          description:
            "Scaffolding, experiments y learning en el ecosystem Ethereum.",
        },
        {
          period: "2022 - Presente",
          title: "Angel Investor & Strategic Advisor",
          org: "Early-stage",
          description:
            "Apoyo a founders en crypto, AI y community: producto, narrative y red.",
        },
      ],
    },
    projects: {
      title: "Proyectos",
      focusHeading: "Enfocándome en",
      pastHeading: "Proyectos anteriores",
      focus: {
        tokenization: {
          title: "Tokenización",
          summary: "Estándares de tokens con compliance on-chain.",
          body: "Trabajo en tokenización regulada y programmable tokens: CIP-0113 en Cardano (reglas de transferencia, custody compartido y compliance nativo) y ERC-3643 / T-REX en EVM (tokens permissioned para RWA, identidad on-chain y transferencias elegibles). El hilo conductor: assets que se comportan bien en el mundo real, no solo en un whitepaper.",
        },
        midnight: {
          title: "Midnight Network",
          summary: "Privacy chain · Midnight Ambassador.",
          body: "Soy Midnight Ambassador. Midnight es una blockchain enfocada en privacidad selectiva: smart contracts que pueden probar hechos sin revelar datos de más. Mi trabajo pasa por community, contenido y bridges entre builders y el stack de privacy. Menos hype, más craft usable.",
        },
        "ai-agents": {
          title: "AI Agents",
          summary: "LCP · compliance para agentes que transaccionan.",
          body: "Estoy trabajando en particular en el Legal Context Protocol (LCP): un estándar para que los agentes deban firmar / aceptar contexto legal y de compliance antes de ejecutar microtransacciones. Términos descubribles, verificables y con recourse, para que agentic commerce no sea un vacío legal.",
        },
      },
      past: {
        punksociety: {
          title: "PunkSociety",
          body: "Social dApp on-chain: cada post es un NFT y los likes envían USDC al creador. Scaffold-ETH 2 + Foundry; experimentando con incentives reales en redes sociales.",
        },
        sami: {
          title: "SAMI",
          body: "Chatroom-game donde humanos cazan al infiltrado de IA (y la IA se disfraza de humano). Construido con Eliza, Next.js y un stack full on/off-chain.",
        },
        mochi: {
          title: "Mochi",
          body: "Agentes de IA “embodied”: mascotas de escritorio con chat, bodies custom, souls on-chain y marketplace en Avalanche (web, Electron y extensiones). Off-chain AI, ownership on-chain.",
        },
      },
    },
    blog: {
      title: "Blog",
      comingSoon: "Coming soon",
      note: "Todavía no sé si va a vivir acá o en otra plataforma. Cuando esté, va a estar.",
    },
    tastes: {
      title: "Gustos",
      platforms: {
        letterboxd: "Películas que vi con ratings y reviews",
        lastfm: "Música que escuché desde hace años",
        spotify: "Música que escucho, me gusta curar playlists",
      },
    },
    contact: {
      title: "Contacto",
      emailLabel: "Email",
      copy: "Copiar",
      copied: "Copiado",
    },
  },
  en: {
    sections: {
      about: "About",
      projects: "Projects",
      blog: "Blog",
      tastes: "Tastes",
      contact: "Contact",
    },
    ui: {
      backHome: "Home",
      social: "Social",
      experience: "Experience",
      notFound: "Nothing here.",
      themeLight: "Light mode",
      themeDark: "Dark mode",
      langLabel: "Language",
    },
    about: {
      title: "About",
      headline: "Builder, connector, and long-term thinker.",
      paragraphs: [
        "I build with AI and blockchain, not for the hype, but because they're real tools for coordinating people and value in new ways.",
        "I've been in the Cardano and Midnight ecosystems as ambassador and builder, and stay close to communities that prioritize craft, open source, and useful product.",
        "Today I mix product, community, and advisory: less noise, more signal. I'm into RealFi, privacy tech, and agents that do real work.",
        "Off-screen: asados, meetups, film, and long conversations. I believe the best tech is built with people and patience.",
      ],
      philosophy: "Build slowly. Ship honestly. Stay curious.",
      timeline: [
        {
          period: "2024 - Present",
          title: "Midnight Ambassador & Builder",
          org: "IOG / Midnight",
          description:
            "Advocacy, community, and exploration of privacy-preserving smart contracts.",
        },
        {
          period: "2023 - Present",
          title: "Builder",
          org: "BuidlGuidl",
          description:
            "Scaffolding, experiments, and learning in the Ethereum ecosystem.",
        },
        {
          period: "2022 - Present",
          title: "Angel Investor & Strategic Advisor",
          org: "Early-stage",
          description:
            "Supporting founders in crypto, AI, and community: product, narrative, and network.",
        },
      ],
    },
    projects: {
      title: "Projects",
      focusHeading: "Focus areas",
      pastHeading: "Previous projects",
      focus: {
        tokenization: {
          title: "Tokenization",
          summary: "Token standards with on-chain compliance.",
          body: "I work on regulated tokenization and programmable tokens: CIP-0113 on Cardano (transfer rules, shared custody, native compliance) and ERC-3643 / T-REX on EVM (permissioned tokens for RWAs, on-chain identity, eligible transfers). The through-line: assets that behave in the real world, not only in a whitepaper.",
        },
        midnight: {
          title: "Midnight Network",
          summary: "Privacy chain · Midnight Ambassador.",
          body: "I'm a Midnight Ambassador. Midnight is a blockchain focused on selective privacy: smart contracts that can prove facts without leaking more data than needed. My work spans community, content, and bridges between builders and the privacy stack. Less hype, more usable craft.",
        },
        "ai-agents": {
          title: "AI Agents",
          summary: "LCP · compliance for agents that transact.",
          body: "I'm working specifically on the Legal Context Protocol (LCP): a standard so agents must sign / accept legal and compliance context before running microtransactions. Discoverable, verifiable terms with recourse, so agentic commerce isn't a legal void.",
        },
      },
      past: {
        punksociety: {
          title: "PunkSociety",
          body: "On-chain social dApp: every post is an NFT and likes send USDC to the creator. Scaffold-ETH 2 + Foundry; experimenting with real incentives in social networks.",
        },
        sami: {
          title: "SAMI",
          body: "Chatroom game where humans hunt the AI infiltrator (and the AI pretends to be human). Built with Eliza, Next.js, and a full on/off-chain stack.",
        },
        mochi: {
          title: "Mochi",
          body: "Embodied AI agents: desktop pets with chat, custom bodies, on-chain souls, and an Avalanche marketplace (web, Electron, extensions). Off-chain AI, on-chain ownership.",
        },
      },
    },
    blog: {
      title: "Blog",
      comingSoon: "Coming soon",
      note: "Not sure yet if it will live here or on another platform. When it's ready, it'll be ready.",
    },
    tastes: {
      title: "Tastes",
      platforms: {
        letterboxd: "Movies I've watched, with ratings and reviews",
        lastfm: "Music I've been listening to for years",
        spotify: "Music I listen to; I like curating playlists",
      },
    },
    contact: {
      title: "Contact",
      emailLabel: "Email",
      copy: "Copy",
      copied: "Copied",
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
