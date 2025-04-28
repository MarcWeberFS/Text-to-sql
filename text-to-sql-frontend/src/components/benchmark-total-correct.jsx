"use client";

import { useEffect, useState } from "react";

export default function BenchmarkCorrectnessOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8080/benchmark/totalCorrect", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch correctness stats");

        const data = await response.json();
        setStats(data[0]);
      } catch (error) {
        console.error("Error fetching correctness stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!stats) {
    return <div className="p-6">No stats found.</div>;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-md flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Without Feedback Loops</h2>
          <p className="text-2xl font-bold">{stats.run2_is_correct_percentage !== undefined ? stats.run2_is_correct_percentage.toFixed(2) + "%" : "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-md flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">With Feedback Loops</h2>
          <p className="text-2xl font-bold">{stats.run1_is_correct_percentage !== undefined ? stats.run1_is_correct_percentage.toFixed(2) + "%" : "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-md flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">With Manual Evaluation</h2>
          <p className="text-2xl font-bold">{stats.run1_human_correction_percentage !== undefined ? stats.run1_human_correction_percentage.toFixed(2) + "%" : "N/A"}</p>
        </div>

      </div>
    </div>
  );
}
