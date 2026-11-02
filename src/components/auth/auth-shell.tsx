import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-md">
            <Card hover={false} className="p-8">
              {children}
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
