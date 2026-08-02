/**
 * Auto-link known product / protocol names in blog markdown.
 * Longer phrases first so "Hermes Agent" wins over partial matches.
 * Skips fenced code, inline code, images, and existing links.
 */

const BLOG_LINK_TERMS: [string, string][] = [
  ["Legal Context Protocol", "https://legalcontextprotocol.org/"],
  ["Input Output Global", "https://www.iog.io"],
  ["Cardano Foundation", "https://cardanofoundation.org/"],
  ["Midnight Foundation", "https://midnight.foundation/"],
  ["Hermes Agent", "https://hermes-agent.nousresearch.com/"],
  ["Nous Research", "https://nousresearch.com/"],
  ["Grok Build", "https://grok.com/build"],
  ["American Arbitration Association", "https://www.adr.org/"],
  ["Integra Ledger", "https://www.integraledger.com/"],
  ["ERC-3643", "https://www.erc3643.org/"],
  ["EIP-3643", "https://eips.ethereum.org/EIPS/eip-3643"],
  ["CIP-113", "https://github.com/cardano-foundation/cip113-programmable-tokens"],
  ["CIP-143", "https://cips.cardano.org/cip/CIP-0143"],
  ["Ethereum", "https://ethereum.org/"],
  ["Cardano", "https://cardano.org/"],
  ["Bitcoin", "https://bitcoin.org/"],
  ["Midnight", "https://midnight.network/"],
  ["Hermes", "https://hermes-agent.nousresearch.com/"],
  ["Grok", "https://grok.com"],
  ["IOG", "https://www.iog.io"],
  ["LCP", "https://legalcontextprotocol.org/"],
  ["n8n", "https://n8n.io"],
  ["GitHub", "https://github.com"],
  ["CNV", "https://www.argentina.gob.ar/cnv"],
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TERM_PATTERN = new RegExp(
  `(?<![\\w/#-])(${BLOG_LINK_TERMS.map(([t]) => escapeRegExp(t)).join("|")})(?![\\w(]|\\.\\w)`,
  "g",
);

const TERM_HREF = new Map(BLOG_LINK_TERMS);

export function linkifyBlogTerms(markdown: string): string {
  const saved: string[] = [];
  const stash = (full: string) => {
    saved.push(full);
    return `\u0000${saved.length - 1}\u0000`;
  };

  let out = markdown
    .replace(/```[\s\S]*?```/g, stash)
    .replace(/`[^`\n]+`/g, stash)
    .replace(/!\[[^\]]*]\([^)]+\)/g, stash)
    .replace(/\[[^\]]+]\([^)]+\)/g, stash);

  out = out.replace(TERM_PATTERN, (term) => {
    const href = TERM_HREF.get(term);
    return href ? `[${term}](${href})` : term;
  });

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[Number(i)] ?? "");
}
