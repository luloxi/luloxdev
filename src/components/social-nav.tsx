import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons/social";
import { socials } from "@/content/site";

const iconMap = {
  x: XIcon,
  instagram: InstagramIcon,
  telegram: TelegramIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
} as const;

export function SocialNav() {
  return (
    <nav
      aria-label="Social"
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {socials.map((s) => {
        const Icon = iconMap[s.id as keyof typeof iconMap];
        return (
          <a
            key={s.id}
            href={s.href}
            title={s.label}
            aria-label={s.label}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-transparent text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_18px_var(--glow-violet)] sm:h-14 sm:w-14"
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </a>
        );
      })}
    </nav>
  );
}
