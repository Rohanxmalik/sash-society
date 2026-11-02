const BYTE_ORDER_MARK = "\uFEFF";
const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?[\d\s().-]+$/;

type Cell = string | number | null | undefined;

// Excel runs cells starting with these characters as formulas, and members can
// type anything into their profile.
function guardFormula(value: string) {
  return FORMULA_START.test(value) && !PLAIN_NUMBER.test(value)
    ? `'${value}`
    : value;
}

function toCell(value: Cell) {
  const text = guardFormula(String(value ?? ""));
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(toCell).join(","));
  return `${BYTE_ORDER_MARK}${lines.join("\r\n")}\r\n`;
}

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const endCell = () => {
    row = [...row, cell];
    cell = "";
  };
  const endRow = () => {
    endCell();
    if (row.some((value) => value !== "")) rows.push(row);
    row = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      endCell();
    } else if (char === "\n") {
      endRow();
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) endRow();
  return rows;
}
