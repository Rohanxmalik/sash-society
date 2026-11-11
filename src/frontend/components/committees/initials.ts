const TITLE = /^(prof|dr|prin|mr|mrs|ms)\.?$/i;

// "Prof. R. N. Tripathi" becomes "RT": the title is dropped, then the first and
// last names give one letter each.
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => word && !TITLE.test(word));
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
