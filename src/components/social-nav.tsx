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
      className="flex items-center justify-center gap-1.5 sm:gap-2"
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_18px_var(--glow-violet)] sm:h-12 sm:w-12"
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </a>
        );
      })}
    </nav>
  );
}
