import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { ActiveSleepNotice } from "@/components/forms/sleep-form";

describe("ActiveSleepNotice", () => {
  test("shows who started the active sleep", () => {
    const html = renderToStaticMarkup(
      <ActiveSleepNotice
        childId="child-1"
        childName="宝宝"
        creatorDisplayName="Owner"
        startTime={new Date("2026-06-25T01:00:00.000Z")}
      />,
    );

    expect(html).toContain("由 Owner 开始");
  });
});
