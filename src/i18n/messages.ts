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
      backHomeCta: "Volver al inicio",
      social: "Social",
      experience: "Experiencia",
      notFound: "Nada por acá.",
      themeLight: "Modo claro",
      themeDark: "Modo oscuro",
      langLabel: "Idioma",
    },
    about: {
      title: "Sobre mí",
      headline: "Builder e investigador",
      paragraphs: [
        "Soy Luciano Oliva Bianco (Lulox). Vivo en Buenos Aires, Argentina.",
        "Uso la IA para hacer mi vida y la de los demás más eficiente. Con Grok vibecodeo y armo automatizaciones sencillas, como correo y calendario. Para automatizaciones más específicas uso n8n.",
        "Me interesa la adopción cripto a nivel mundial desde que conocí Bitcoin en 2010. Creo que lo que más uso traerá a blockchain es la tokenización, las stablecoins y el comercio agéntico.",
        "Soy embajador de Midnight, la blockchain de privacidad de IOG: privacidad selectiva, identidad y smart contracts que pueden probar hechos sin revelar datos de más. La privacidad es lo que permitirá que la tecnología blockchain sea adoptada por personas e instituciones que hoy prefieren no usarla por su transparencia.",
      ],
      timeline: [
        {
          period: "Jul 2025 - Presente",
          title: "Research & Development",
          org: "Input Output Global",
          description:
            "Oficinas de IOG en Buenos Aires. Investigación económica y técnica en blockchain, finanzas y AI. Automatizaciones, agentes y webapps.",
        },
        {
          period: "Abr 2023 - May 2024",
          title: "Fullstack Web3 developer",
          org: "BuidlGuidl",
          description:
            "Desarrollo de aplicaciones web3 con Scaffold-ETH 2 y Solidity para el ecosistema Ethereum como bien público.",
        },
      ],
      linkedInCta: "Ver mi LinkedIn",
    },
    projects: {
      title: "Proyectos",
      focusHeading: "Investigando sobre",
      pastHeading: "Proyectos anteriores",
      githubHeading: "Código",
      githubTitle: "GitHub",
      githubBlurb: "Repos, experimentos y builds open source.",

      focus: {
        tokenization: {
          title: "Tokenización",
          summary: "Estándares de tokens y marco legal.",
          body: "Investigo CIP-0113 en Cardano y ERC-3643 / T-REX en EVM: programmable tokens con reglas de transferencia, custody e identidad on-chain. También el status legal de la tokenización en distintos países.",
        },
        midnight: {
          title: "Midnight Network",
          summary: "Privacy chain · Midnight Ambassador.",
          body: "Soy Midnight Ambassador. Midnight es una blockchain enfocada en privacidad selectiva: smart contracts que pueden probar hechos sin revelar datos de más.",
        },
        hermes: {
          title: "Hermes Agent",
          summary: "Agente autónomo · tools, memoria y workflows.",
          body: "Ya usé Hermes Agent durante algunos meses y ahora lo estoy estudiando más a fondo para sacarle jugo. Quiero automatizar procesos más complejos y manejar un equipo de agentes: tools, memoria, límites claros y workflows que hagan trabajo real.",
        },
        lcp: {
          title: "LCP",
          summary: "Legal Context Protocol · compliance para agentic commerce.",
          body: "Estoy investigando el Legal Context Protocol (LCP): un estándar para que los agentes firmen / acepten contexto legal y de compliance antes de ejecutar microtransacciones. Términos descubribles, verificables y con recourse, para que el agentic commerce no sea un vacío legal.",
        },
      },
      past: {
        punksociety: {
          title: "PunkSociety",
          body: "Red social on-chain: cada post es un NFT y los likes envían valor al creador.",
        },
        sami: {
          title: "SAMI",
          body: "Juego de chat donde humanos cazan al infiltrado de IA (y la IA se hace pasar por humano).",
        },
        mochi: {
          title: "Mochi",
          body: "Mascotas de IA de escritorio con chat, cuerpos custom y un marketplace propio.",
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
      backHomeCta: "Back to home",
      social: "Social",
      experience: "Experience",
      notFound: "Nothing here.",
      themeLight: "Light mode",
      themeDark: "Dark mode",
      langLabel: "Language",
    },
    about: {
      title: "About",
      headline: "Builder and researcher",
      paragraphs: [
        "I'm Luciano Oliva Bianco (Lulox). I live in Buenos Aires, Argentina.",
        "I use AI to make my life and others' more efficient. With Grok I vibecode and set up simple automations, like email and calendar. For more specific automations I use n8n.",
        "I've cared about global crypto adoption since I first learned about Bitcoin in 2010. I think what will drive the most real usage for blockchain is tokenization, stablecoins, and agentic commerce.",
        "I'm a Midnight Ambassador for IOG's privacy blockchain: selective privacy, identity, and smart contracts that can prove facts without oversharing data. Privacy is what will let blockchain be adopted by people and institutions that today prefer not to use it because of how transparent it is.",
      ],
      timeline: [
        {
          period: "Jul 2025 - Present",
          title: "Research & Development",
          org: "Input Output Global",
          description:
            "IOG Buenos Aires office. Economic and technical research on blockchain, finance, and AI. Automations, agents, and webapps.",
        },
        {
          period: "Apr 2023 - May 2024",
          title: "Fullstack Web3 developer",
          org: "BuidlGuidl",
          description:
            "Development of web3 applications with Scaffold-ETH 2 and Solidity for the Ethereum ecosystem as a public good.",
        },
      ],
      linkedInCta: "View my LinkedIn",
    },
    projects: {
      title: "Projects",
      focusHeading: "Focus areas",
      pastHeading: "Previous projects",
      githubHeading: "Code",
      githubTitle: "GitHub",
      githubBlurb: "Repos, experiments, and open-source builds.",

      focus: {
        tokenization: {
          title: "Tokenization",
          summary: "Token standards and legal framework.",
          body: "I research both CIP-0113 on Cardano and ERC-3643 / T-REX on EVM: programmable tokens with transfer rules, custody, and on-chain identity. Also the legal status of tokenization across different countries.",
        },
        midnight: {
          title: "Midnight Network",
          summary: "Privacy chain · Midnight Ambassador.",
          body: "I'm a Midnight Ambassador. Midnight is a blockchain focused on selective privacy: smart contracts that can prove facts without leaking more data than needed.",
        },
        hermes: {
          title: "Hermes Agent",
          summary: "Autonomous agent · tools, memory, and workflows.",
          body: "I've already used Hermes Agent for a few months and I'm now studying it more deeply to get more out of it. I want to automate more complex processes and run a team of agents: tools, memory, clear limits, and workflows that do real work.",
        },
        lcp: {
          title: "LCP",
          summary: "Legal Context Protocol · compliance for agentic commerce.",
          body: "I'm researching the Legal Context Protocol (LCP): a standard so agents must sign / accept legal and compliance context before running microtransactions. Discoverable, verifiable terms with recourse, so agentic commerce isn't a legal void.",
        },
      },
      past: {
        punksociety: {
          title: "PunkSociety",
          body: "On-chain social network: every post is an NFT and likes send value to the creator.",
        },
        sami: {
          title: "SAMI",
          body: "Chatroom game where humans hunt the AI infiltrator (and the AI pretends to be human).",
        },
        mochi: {
          title: "Mochi",
          body: "Desktop AI pets with chat, custom bodies, and their own marketplace.",
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
