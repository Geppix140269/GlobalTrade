import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("makes a readable identifier from a name", () => {
    expect(slugify("Elmarie van Noorden")).toBe("elmarie-van-noorden");
    expect(slugify("Lord JD Waverley")).toBe("lord-jd-waverley");
  });

  it("keeps letters that carry diacritics rather than dropping them", () => {
    expect(slugify("José Ceylán")).toBe("jose-ceylan");
    expect(slugify("Łukasz Śmigiel")).toBe("ukasz-smigiel");
  });

  it("spells out an ampersand instead of swallowing it", () => {
    expect(slugify("Import & Export Co")).toBe("import-and-export-co");
  });

  it("never leaves a leading or trailing separator", () => {
    expect(slugify("  —  Futuretend  —  ")).toBe("futuretend");
    expect(slugify("!!!")).toBe("");
  });

  it("bounds the length without ending on a separator", () => {
    const slug = slugify("A".repeat(40) + " " + "B".repeat(40));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("returns the plain slug when it is free", () => {
    expect(uniqueSlug("James Baker", new Set())).toBe("james-baker");
  });

  it("suffixes rather than colliding when the name repeats", () => {
    const taken = new Set(["james-baker"]);
    expect(uniqueSlug("James Baker", taken)).toBe("james-baker-2");
    expect(uniqueSlug("James Baker", new Set([...taken, "james-baker-2"]))).toBe("james-baker-3");
  });

  it("falls back to a usable slug when the name has no usable characters", () => {
    expect(uniqueSlug("!!!", new Set())).toBe("member");
    expect(uniqueSlug("!!!", new Set(["member"]))).toBe("member-2");
  });
});
