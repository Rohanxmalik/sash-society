"use client";

import { PageHero } from "@/frontend/components/ui/page-hero";
import { Container } from "@/frontend/components/ui/container";
import { StaggerContainer, StaggerItem } from "@/frontend/components/ui/scroll-animate";
import { TeamCard } from "./team-card";
import type { CommitteeMember } from "@/shared/types";

export function CommitteePage({
  title,
  subtitle,
  members,
}: {
  title: string;
  subtitle: string;
  members: CommitteeMember[];
}) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} />
      <section className="py-24 lg:py-32">
        <Container>
          <StaggerContainer
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            staggerDelay={0.08}
          >
            {members.map((member) => (
              <StaggerItem key={member.name}>
                <TeamCard member={member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>
    </>
  );
}
