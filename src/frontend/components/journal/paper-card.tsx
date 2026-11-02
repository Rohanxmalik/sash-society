import { FileText } from "lucide-react";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { formatDateIndia } from "@/shared/dates";

const PDF_TYPE = "application/pdf";

export type PublishedPaper = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  articleType: string;
  contentType: string;
  publishedAt: Date | null;
};

export function PaperCard({ paper }: { paper: PublishedPaper }) {
  const { id, title, authors, abstract, articleType, contentType, publishedAt } =
    paper;

  return (
    <article>
      <Card hover={false} className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{articleType}</Badge>
          {publishedAt && (
            <span className="text-xs text-ink-muted">
              {formatDateIndia(publishedAt)}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-lg font-bold text-ink font-heading">{title}</h3>
        <p className="mt-1 text-sm text-ink-light">{authors}</p>
        {abstract && (
          <p className="mt-3 text-sm text-ink-light leading-relaxed line-clamp-3">
            {abstract}
          </p>
        )}

        <Button
          href={`/api/journal/${id}/file`}
          variant="outline"
          size="sm"
          fileLink
          className="mt-4"
        >
          <FileText className="w-4 h-4" />
          {contentType === PDF_TYPE ? "Read PDF" : "Download Word File"}
        </Button>
      </Card>
    </article>
  );
}
