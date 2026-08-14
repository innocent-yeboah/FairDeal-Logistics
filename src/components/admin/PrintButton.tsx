"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 print:hidden rounded-lg bg-brand-600 px-4 py-2 text-sm text-white"
    >
      Print / Save PDF
    </button>
  );
}
