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
      themeLabel: "tema",
      themeLight: "Modo claro",
      themeDark: "Modo oscuro",
      langLabel: "Idioma",
    },
    about: {
      title: "Sobre mí",
      headline: "Builder e investigador",
      paragraphs: [
        "Soy Luciano Oliva Bianco (Lulox). Vivo en Buenos Aires, Argentina.",
        "Con Grok armo dapps y webapps, y automatizaciones sencillas como correo y calendario. Para automatizaciones más específicas uso n8n.",
        "Me interesa la adopción cripto a nivel mundial desde que conocí Bitcoin en 2010. Creo que lo que más uso traerá a blockchain es la tokenización, las stablecoins y el comercio agéntico.",
        "Soy embajador de Midnight, la blockchain de privacidad de IOG: privacidad selectiva, identidad y smart contracts que pueden probar hechos sin revelar datos de más. La privacidad es lo que permitirá que la tecnología blockchain sea adoptada por personas e instituciones que hoy prefieren no usarla por su transparencia.",
      ],
      timeline: [
        {
          period: "Jul 2025 - Presente",
          title: "Research & Development",
          org: "Input Output Global",
          description:
            "Investigación económica y técnica en blockchain, finanzas y AI. Desarrollo de automatizaciones, agentes y webapps.",
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
      focusHeading: "Investigación",
      focusBlogCta: "Leer en el blog",
      pastHeading: "Proyectos anteriores",
      githubHeading: "Desarrollo",
      backToProjects: "Proyectos",
      backToProjectsCta: "Volver a proyectos",
      metaTeam: "Equipo",
      metaAwards: "Premios",
      metaStatus: "Estado",
      statusLive: "En vivo",
      statusDisabled: "Deshabilitado",
      statusArchive: "Archivado",
      openGithub: "Ver en GitHub",
      openLive: "Abrir proyecto",
      noAwards: "Sin premios formales.",

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
          body: "Usé Hermes Agent varios meses. Para el día a día pasé a Grok (correo, calendario, builds y MCPs). Sigo explorando Hermes para proyectos futuros: aprende bien y es fuerte para automatizaciones complejas en lenguaje natural.",
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
          paragraphs: [
            "PunkSociety es una red social on-chain: cada post es un NFT y los likes envían valor (USDC) al creador. La idea es alinear atención con ownership y pagos directos.",
            "Lo construí con Scaffold-ETH 2, Foundry y Next.js.",
          ],
          awards: "3er lugar · Avalanche Summit Hackathon 2024.",
        },
        sami: {
          title: "SAMI",
          body: "Juego de chat donde humanos cazan al infiltrado de IA (y la IA se hace pasar por humano).",
          paragraphs: [
            "SAMI es un juego de chat en el que humanos tienen que encontrar al infiltrado de IA. El agente se camufla entre jugadores y con el tiempo busca ser cada vez más difícil de detectar.",
            "Está construido con TypeScript, Eliza, Next.js, Express, Supabase y un stack web3 (RainbowKit, Foundry, Wagmi, Viem).",
          ],
          awards: "Sin premios formales.",
        },
        mochi: {
          title: "Mochi",
          body: "Mascotas de IA de escritorio con chat, cuerpos custom y un marketplace propio.",
          paragraphs: [
            "Mochi son mascotas de IA de escritorio (y browser) con chat, cuerpos custom y un marketplace propio en Avalanche: ownership on-chain, AI off-chain.",
            "Incluye web app, app Electron y extensiones de Chrome/Firefox, con runtime compartido, contratos en Foundry y metadata en IPFS.",
          ],
          awards: "Sin premios formales.",
        },
      },
    },
    blog: {
      title: "Blog",
      loading: "Cargando…",
      loadError: "No pude cargar los artículos.",
      empty: "Todavía no hay artículos publicados.",
      notFound: "No encontré ese artículo.",
      backToBlog: "Volver al blog",
      signInTitle: "Admin",
      signInNote:
        "Solo el administrador puede editar el blog. Entrá con Google usando la cuenta autorizada.",
      signInProviders:
        "Login con Google (lucianoolivabianco@gmail.com). Neon Auth todavía no soporta X; cuando lo haga, se puede sumar LuloxDev.",
      signInGoogle: "Continuar con Google",
      authNotConfigured: "Auth no está configurado en este entorno.",
      oauthError: "Falló el login. Probá de nuevo.",
      oauthDomainError:
        "Neon Auth no confía este dominio. En Neon Console → Auth → Configuration → Domains agregá https://www.lulox.dev y https://lulox.dev.",
      forbidden: "Tu cuenta no tiene permiso de admin.",
      adminTitle: "Editar blog",
      adminAs: "Sesión",
      adminLoadError: "No pude cargar el panel de admin.",
      newPost: "Nuevo artículo",
      edit: "Editar",
      view: "Ver",
      delete: "Borrar",
      confirmDelete: "¿Borrar este artículo?",
      signOut: "Salir",
      save: "Guardar",
      saving: "Guardando…",
      saveError: "No se pudo guardar.",
      cancel: "Cancelar",
      fieldDate: "Fecha",
      fieldCover: "Imagen (path o URL)",
      fieldTags: "Tags (separados por coma)",
      fieldTitle: "Título",
      fieldSummary: "Resumen",
      fieldBody: "Cuerpo",
      fieldPublished: "Visibilidad",
      statusPublished: "Publicado",
      statusDraft: "Borrador",
      editorHint:
        "Markdown: headings, listas, tablas, imágenes ![alt](/path), y links de YouTube se embeben solos.",
      authorHeading: "Sobre el autor",
      authorBio:
        "Soy Luciano Oliva Bianco (Lulox). Hago research y builds en AI, blockchain, tokenización y comercio agéntico.",
      authorContact: "Contactame",
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
      themeLabel: "theme",
      themeLight: "Light mode",
      themeDark: "Dark mode",
      langLabel: "Language",
    },
    about: {
      title: "About",
      headline: "Builder and researcher",
      paragraphs: [
        "I'm Luciano Oliva Bianco (Lulox). I live in Buenos Aires, Argentina.",
        "With Grok I build dapps and webapps, and simple automations like email and calendar. For more specific automations I use n8n.",
        "I've cared about global crypto adoption since I first learned about Bitcoin in 2010. I think what will drive the most real usage for blockchain is tokenization, stablecoins, and agentic commerce.",
        "I'm a Midnight Ambassador for IOG's privacy blockchain: selective privacy, identity, and smart contracts that can prove facts without oversharing data. Privacy is what will let blockchain be adopted by people and institutions that today prefer not to use it because of how transparent it is.",
      ],
      timeline: [
        {
          period: "Jul 2025 - Present",
          title: "Research & Development",
          org: "Input Output Global",
          description:
            "Economic and technical research on blockchain, finance, and AI. Development of automations, agents, and webapps.",
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
      focusHeading: "Research",
      focusBlogCta: "Read on the blog",
      pastHeading: "Previous projects",
      githubHeading: "Development",
      backToProjects: "Projects",
      backToProjectsCta: "Back to projects",
      metaTeam: "Team",
      metaAwards: "Awards",
      metaStatus: "Status",
      statusLive: "Live",
      statusDisabled: "Disabled",
      statusArchive: "Archived",
      openGithub: "View on GitHub",
      openLive: "Open project",
      noAwards: "No formal awards.",

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
          body: "I used Hermes Agent for several months. For day-to-day work I moved to Grok (email, calendar, builds, and MCPs). I still explore Hermes for future projects: it learns well and is strong for complex natural-language automations.",
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
          paragraphs: [
            "PunkSociety is an on-chain social network: every post is an NFT and likes send value (USDC) to the creator. The point is aligning attention with ownership and direct payments.",
            "I built it with Scaffold-ETH 2, Foundry, and Next.js.",
          ],
          awards: "3rd place · Avalanche Summit Hackathon 2024.",
        },
        sami: {
          title: "SAMI",
          body: "Chatroom game where humans hunt the AI infiltrator (and the AI pretends to be human).",
          paragraphs: [
            "SAMI is a chat game where humans have to find the AI infiltrator. The agent blends into the room and aims to get harder to spot over time.",
            "Built with TypeScript, Eliza, Next.js, Express, Supabase, and a web3 stack (RainbowKit, Foundry, Wagmi, Viem).",
          ],
          awards: "No formal awards.",
        },
        mochi: {
          title: "Mochi",
          body: "Desktop AI pets with chat, custom bodies, and their own marketplace.",
          paragraphs: [
            "Mochi is desktop (and browser) AI pets with chat, custom bodies, and an Avalanche marketplace: on-chain ownership, off-chain AI.",
            "It includes a web app, Electron desktop, Chrome/Firefox extensions, a shared runtime, Foundry contracts, and IPFS metadata.",
          ],
          awards: "No formal awards.",
        },
      },
    },
    blog: {
      title: "Blog",
      loading: "Loading…",
      loadError: "Could not load posts.",
      empty: "No published posts yet.",
      notFound: "Post not found.",
      backToBlog: "Back to blog",
      signInTitle: "Admin",
      signInNote:
        "Only the admin can edit the blog. Sign in with Google using the authorized account.",
      signInProviders:
        "Google login (lucianoolivabianco@gmail.com). Neon Auth does not support X yet; LuloxDev can be added when it does.",
      signInGoogle: "Continue with Google",
      authNotConfigured: "Auth is not configured in this environment.",
      oauthError: "Sign-in failed. Try again.",
      oauthDomainError:
        "Neon Auth does not trust this domain. In Neon Console → Auth → Configuration → Domains add https://www.lulox.dev and https://lulox.dev.",
      forbidden: "Your account is not an admin.",
      adminTitle: "Edit blog",
      adminAs: "Session",
      adminLoadError: "Could not load the admin panel.",
      newPost: "New post",
      edit: "Edit",
      view: "View",
      delete: "Delete",
      confirmDelete: "Delete this post?",
      signOut: "Sign out",
      save: "Save",
      saving: "Saving…",
      saveError: "Could not save.",
      cancel: "Cancel",
      fieldDate: "Date",
      fieldCover: "Image (path or URL)",
      fieldTags: "Tags (comma-separated)",
      fieldTitle: "Title",
      fieldSummary: "Summary",
      fieldBody: "Body",
      fieldPublished: "Visibility",
      statusPublished: "Published",
      statusDraft: "Draft",
      editorHint:
        "Markdown: headings, lists, tables, images ![alt](/path), and YouTube links embed automatically.",
      authorHeading: "About the author",
      authorBio:
        "I'm Luciano Oliva Bianco (Lulox). I do research and builds in AI, blockchain, tokenization, and agentic commerce.",
      authorContact: "Contact me",
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
