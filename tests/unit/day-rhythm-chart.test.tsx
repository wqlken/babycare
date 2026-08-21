import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { DayRhythmChart } from "@/components/dashboard/day-rhythm-chart";

describe("DayRhythmChart", () => {
  test("renders every rhythm detail instead of truncating the list", () => {
    const html = renderToStaticMarkup(
      <DayRhythmChart
        rhythm={{
          date: "2026-06-25",
          sleepSegments: [
            { id: "sleep-1", startPercent: 0, widthPercent: 5, label: "睡眠 00:00-01:12" },
            { id: "sleep-2", startPercent: 10, widthPercent: 5, label: "睡眠 02:24-03:36" },
            { id: "sleep-3", startPercent: 20, widthPercent: 5, label: "睡眠 04:48-06:00" },
            { id: "sleep-4", startPercent: 30, widthPercent: 5, label: "睡眠 07:12-08:24" },
          ],
          markers: Array.from({ length: 6 }, (_, index) => ({
            id: `marker-${index + 1}`,
            percent: 40 + index * 5,
            label: `${String(10 + index).padStart(2, "0")}:00 喂养`,
            kind: "feeding" as const,
            value: `${90 + index * 10} ml`,
          })),
        }}
      />,
    );

    expect(html.match(/<li/g)?.length).toBe(10);
  });
});
