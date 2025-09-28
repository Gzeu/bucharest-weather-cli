import { describe, it, expect } from "vitest";

// Simple weather code mapping for testing
const map = { 0: "Senin", 95: "Furtună" };
function label(code) {
  return map[code] || "WMO";
}

describe("WMO map", () => {
  it("returns known labels", () => {
    expect(label(0)).toMatch("Senin");
    expect(label(95)).toMatch("Furtună");
  });
  
  it("falls back", () => {
    expect(label(123)).toBe("WMO");
  });
});