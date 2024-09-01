"use client";

import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import dayjs from "dayjs";
import ActivityCalendar from "react-activity-calendar";
import { Oval } from "react-loader-spinner";

interface ContributionData {
  date: string;
  count: number;
  level: number;
}

export default function Home() {
  const usernames = ["gdcho", "gdavidcho"];
  const [mergedData, setMergedData] = useState<ContributionData[] | null>(null);

  const tippyBlock = (
    b: React.ReactElement,
    a: { count: number; date: string }
  ) => {
    const content =
      a.count === 0
        ? ""
        : `${a.count} contributions on ${dayjs(a.date).format("MMMM DD YYYY")}`;

    const c = React.cloneElement(b);
    return (
      <Tippy
        content={content}
        placement="top"
        theme="translucent"
        animation="fade"
        duration={[0, 10]}
        inertia={false}
        arrow={true}
      >
        {c}
      </Tippy>
    );
  };

  useEffect(() => {
    async function fetchData() {
      const contributions: { [key: string]: number } = {};
      let maxCount = 0;

      for (const username of usernames) {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        const data = await response.json();

        data.contributions.forEach(
          (day: { date: string | number; count: number }) => {
            if (!contributions[day.date]) {
              contributions[day.date] = 0;
            }
            contributions[day.date] += day.count;
            if (contributions[day.date] > maxCount) {
              maxCount = contributions[day.date];
            }
          }
        );
      }

      const mergedData = Object.keys(contributions).map((date) => ({
        date,
        count: contributions[date],
        level:
          contributions[date] === 0
            ? 0
            : Math.min(Math.floor((contributions[date] / maxCount) * 6) + 1, 6),
      }));

      setMergedData(mergedData);
    }

    fetchData();
  }, []);

  if (!mergedData) {
    return (
      <div className="flex justify-center bg-gray-500 min-h-screen pt-10">
        <Oval
          visible={true}
          height="30"
          width="30"
          color="#4fa94d"
          strokeWidth={5}
        />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-gray-500 flex-col items-center justify-between p-24">
      <ActivityCalendar
        data={mergedData}
        renderBlock={tippyBlock}
        theme={{
          light: ["hsl(0, 0%, 92%)", "#3ad353"],
          dark: ["#333", "#3ad353"],
        }}
        maxLevel={6}
        style={{
          cursor: "pointer",
        }}
      />
    </main>
  );
}
