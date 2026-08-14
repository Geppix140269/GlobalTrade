import { describe, expect, it } from "vitest";
import { memberProfileSchema, parseList, passwordSchema } from "@/lib/validation";

describe("parseList", () => {
  it("splits on commas and newlines, trims and de-duplicates", () => {
    expect(parseList("USA, UAE\nAfrica , usa ,,")).toEqual(["USA", "UAE", "Africa"]);
  });

  it("returns an empty list for empty or non-string input", () => {
    expect(parseList("")).toEqual([]);
    expect(parseList(null)).toEqual([]);
    expect(parseList(undefined)).toEqual([]);
  });
});

describe("memberProfileSchema", () => {
  const base = {
    name: "Test Member",
    company: "",
    roleTitle: "",
    baseCountry: "",
    markets: [],
    whatTheyDo: "",
    expertise: [],
    currentFocus: "",
    lookingFor: "",
    canOffer: "",
    website: "",
    linkedin: "",
    email: "",
    phone: "",
  };

  it("requires a name", () => {
    expect(memberProfileSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });

  it("accepts empty optional contact fields", () => {
    expect(memberProfileSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a malformed website but accepts a full URL", () => {
    expect(memberProfileSchema.safeParse({ ...base, website: "example" }).success).toBe(false);
    expect(memberProfileSchema.safeParse({ ...base, website: "https://example.com" }).success).toBe(
      true,
    );
  });

  it("rejects a malformed email", () => {
    expect(memberProfileSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
    expect(memberProfileSchema.safeParse({ ...base, email: "a@b.com" }).success).toBe(true);
  });
});

describe("passwordSchema", () => {
  it("enforces a minimum length", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("a-long-enough-passphrase").success).toBe(true);
  });
});
