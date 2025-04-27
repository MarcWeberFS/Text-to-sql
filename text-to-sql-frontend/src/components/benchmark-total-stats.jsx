"use client";

import { useEffect, useState } from "react";

export default function TotalBenchmarkStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8080/benchmark/getTotalStats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching total stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animate numbers once stats are fetched
  useEffect(() => {
    if (!stats) return;

    const fields = [
      { key: "total_cases", isPercentage: false },
      { key: "correct_cases", isPercentage: false },
      { key: "incorrect_cases", isPercentage: false },
      { key: "correctness_percentage", isPercentage: true },
      { key: "avg_response_time_seconds", isPercentage: false },
    ];

    const newAnimatedValues = {};
    fields.forEach(({ key, isPercentage }) => {
      const targetValue = stats[key];
      let current = 0;
      const steps = 60;
      const increment = targetValue / steps;

      const interval = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          clearInterval(interval);
          current = targetValue;
        }
        newAnimatedValues[key] = isPercentage ? current.toFixed(1) : Math.floor(current);
        setAnimatedValues({ ...newAnimatedValues });
      }, 15); // total animation time ~900ms
    });

  }, [stats]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!stats) {
    return <div className="p-6">No stats found.</div>;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-6">
        
        {[ 
          { title: "Total Cases", key: "total_cases" },
          { title: "✅ Answers", key: "correct_cases" },
          { title: "❌ Answers", key: "incorrect_cases" },
          { title: "Correctness %", key: "correctness_percentage", suffix: "%" },
          { title: "Avg Response Time", key: "avg_response_time_seconds", suffix: "s" },
          ...(stats.total_cost_chf ? [{ title: "Total Cost CHF", value: `CHF ${stats.total_cost_chf}` }] : []),
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-md border border-gray-300 shadow-md flex flex-col justify-center items-center aspect-square"
          >
            <h2 className="text-sm font-semibold text-gray-700 text-center whitespace-nowrap">{item.title}</h2>
            <p className="text-xl font-bold mt-2 text-center">
              {item.value 
                ? item.value 
                : animatedValues[item.key] !== undefined 
                  ? `${animatedValues[item.key]}${item.suffix || ""}` 
                  : "-"}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
