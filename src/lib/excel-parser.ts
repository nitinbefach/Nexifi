// Excel/CSV parser for bulk product upload — implemented in Sprint 5
// Uses SheetJS (xlsx) for parsing

import * as XLSX from "xlsx";

export interface ParsedRow {
  [key: string]: string | number | undefined;
}

export function parseExcelFile(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
}

export function getColumnHeaders(buffer: ArrayBuffer): string[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  const headers: string[] = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
    headers.push(cell ? String(cell.v) : `Column ${col + 1}`);
  }

  return headers;
}
