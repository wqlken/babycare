import { describe, expect, test } from "vitest";
import manifest from "@/app/manifest";
import { metadata, viewport } from "@/app/layout";

describe("PWA metadata", () => {
  test("defines installable app manifest", () => {
    const value = manifest();

    expect(value).toMatchObject({
      name: "Babycare",
      short_name: "Babycare",
      display: "standalone",
      start_url: "/",
      theme_color: "#0284c7",
      background_color: "#f8fafc",
    });
    expect(value.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icon.svg",
          sizes: "any",
        }),
      ]),
    );
  });

  test("adds mobile shell metadata", () => {
    expect(metadata.applicationName).toBe("Babycare");
    expect(metadata.appleWebApp).toMatchObject({
      capable: true,
      title: "Babycare",
    });
    expect(viewport).toMatchObject({
      themeColor: "#0284c7",
      width: "device-width",
      initialScale: 1,
    });
  });
});
