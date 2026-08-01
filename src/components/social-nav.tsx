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
    <nav aria-label="Social" className="home-social-nav">
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
            className="home-social-link"
          >
            <Icon className="home-social-icon" />
          </a>
        );
      })}
    </nav>
  );
}
