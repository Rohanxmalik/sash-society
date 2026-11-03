import Link from "next/link";
import {
  Award,
  BookOpen,
  CalendarPlus,
  Images,
  Landmark,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { Container } from "@/frontend/components/ui/container";
import {
  StaggerContainer,
  StaggerItem,
} from "@/frontend/components/ui/scroll-animate";

const links = [
  { label: "Register for Mauritius 2027", href: "/events/mauritius-2027/register", icon: CalendarPlus },
  { label: "Become a Member", href: "/membership", icon: UserPlus },
  { label: "Members List", href: "/membership/members", icon: Users },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Conferences", href: "/conferences", icon: Landmark },
  { label: "Committees", href: "/about#committees", icon: UsersRound },
  { label: "Photo Gallery", href: "/conferences/gallery", icon: Images },
  { label: "Achievement Awards", href: "/achievement-awards", icon: Award },
];

export function QuickLinks() {
  return (
    <section className="bg-off-white border-t border-ink/10 py-14 lg:py-16">
      <Container>
        <nav aria-label="Quick links">
          <StaggerContainer
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            staggerDelay={0.06}
          >
            {links.map(({ label, href, icon: Icon }) => (
              <StaggerItem key={href} className="h-full">
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center gap-3 rounded-lg border border-ink/8 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 transition-colors duration-300 group-hover:bg-brand-gold/30">
                    <Icon className="h-5 w-5 text-brand-dark-teal" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </nav>
      </Container>
    </section>
  );
}
