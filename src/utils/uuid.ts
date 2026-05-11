export function fallbackUUID(): string {
  return (1e7 + -1e3 + -4e3 + -8e3 + -1e11)
    .toString()
    .replace(/[018]/g, (c: any) =>
      (
        Number(c) ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & 15) >>
        (Number(c) / 4)
      ).toString(16)
    );
}

export function generateUUID(): string {
  return typeof window !== "undefined" &&
    window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : fallbackUUID();
}
