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
            className="inline-flex h-[4.125rem] w-[4.125rem] items-center justify-center rounded-full border border-transparent text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_18px_var(--glow-violet)] sm:h-[4.5rem] sm:w-[4.5rem]"
          >
            <Icon className="h-[1.875rem] w-[1.875rem] sm:h-9 sm:w-9" />
          </a>
        );
      })}
    </nav>
  );
}
