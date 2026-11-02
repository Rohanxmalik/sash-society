import { z } from "zod";
import { optionalText, requiredText } from "./fields";

const MAX_TITLE_LENGTH = 300;
const MAX_ABSTRACT_LENGTH = 4000;

export const MAX_JOURNAL_FILE_MB = 10;
export const MAX_JOURNAL_FILE_BYTES = MAX_JOURNAL_FILE_MB * 1024 * 1024;
export const JOURNAL_FILE_ACCEPT = ".pdf,.docx";

export const JOURNAL_ARTICLE_TYPES = [
  "Research Article",
  "Interview",
  "Commentary",
  "Debate",
] as const;

const paperDetails = {
  title: requiredText("Title is required", MAX_TITLE_LENGTH),
  authors: requiredText("Authors are required", MAX_TITLE_LENGTH),
  articleType: z.enum(JOURNAL_ARTICLE_TYPES, {
    error: "Choose the type of work",
  }),
};

export const journalSubmissionSchema = z.object({
  ...paperDetails,
  abstract: requiredText("Abstract is required", MAX_ABSTRACT_LENGTH),
  declarationAccepted: z.literal(true, {
    error: "Please confirm that this is your own original work",
  }),
});

export const journalBackIssueSchema = z.object({
  ...paperDetails,
  abstract: optionalText(MAX_ABSTRACT_LENGTH),
  publishedOn: z.iso.date("Enter the date it was published"),
});
