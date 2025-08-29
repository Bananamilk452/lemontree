"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { getSentimentByDate } from "~/app/actions/diary";
import { Spinner } from "~/components/Spinner";

echarts.use([LineChart, GridComponent, TitleComponent, CanvasRenderer]);

export function SentimentChart() {
  const limit = 7;
  const [page, setPage] = useState(1);

  const { data, status } = useQuery({
    queryKey: ["sentiment", page, limit],
    queryFn: () => getSentimentByDate({ page, limit }),
    select: (res) => res.sort((a, b) => a.date.getTime() - b.date.getTime()),
  });

  const options = useMemo(
    () => ({
      title: {
        text: "최근 7일의 감정 점수",
        textStyle: {
          fontSize: 16,
          fontFamily: "gyonggiBatangFont",
        },
      },
      xAxis: {
        type: "category",
        data: data?.map((d) => format(d.date, "M.d")) || [],
      },
      yAxis: {
        type: "value",
        min: 1,
        max: 5,
      },
      series: [
        {
          data: data?.map((d) => d.sentiment) || [],
          type: "line",
        },
      ],
      color: ["#ffcc00"],
    }),
    [data],
  );

  return (
    <div className="flex">
      <button onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
        <ChevronLeft />
      </button>
      {status === "pending" ? (
        <div className="flex h-[300px] w-full items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : (
        <ReactEChartsCore
          className="w-full"
          echarts={echarts}
          option={options}
        />
      )}
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="cursor-pointer disabled:cursor-auto disabled:text-gray-400"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
