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
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-4 text-left">Setup</th>
              <th className="border border-gray-300 p-4 text-center">Feedback Loops</th>
              <th className="border border-gray-300 p-4 text-center">Human Feedback Loop</th>
              <th className="border border-gray-300 p-4 text-center">Syntax Feedback Loop</th>
              <th className="border border-gray-300 p-4 text-center">Correct (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-4">Without Feedback Loops</td>
              <td className="border border-gray-300 text-center text-red-500">❌</td>
              <td className="border border-gray-300 text-center text-red-500">❌</td>
              <td className="border border-gray-300 text-center text-red-500">❌</td>
              <td className="border border-gray-300 text-center font-semibold">
                {stats.run2_is_correct_percentage !== undefined ? stats.run2_is_correct_percentage.toFixed(2) + "%" : "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-4">With Human, Without Syntax Feedback Loops</td>
              <td className="border border-gray-300 text-center text-green-500">✅</td>
              <td className="border border-gray-300 text-center text-green-500">✅</td>
              <td className="border border-gray-300 text-center text-red-500">❌</td>
              <td className="border border-gray-300 text-center font-semibold">
                {stats.run3_is_correct_percentage !== undefined ? stats.run3_is_correct_percentage.toFixed(2) + "%" : "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-4">With Feedback Loops</td>
              <td className="border border-gray-300 text-center text-green-500">✅</td>
              <td className="border border-gray-300 text-center text-green-500">✅</td>
              <td className="border border-gray-300 text-center text-green-500">✅</td>
              <td className="border border-gray-300 text-center font-semibold">
                {stats.run1_is_correct_percentage !== undefined ? stats.run1_is_correct_percentage.toFixed(2) + "%" : "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 bg-gray-50 p-4">With Manual Evaluation</td>
              <td className="border border-gray-300 bg-gray-50 text-center text-green-500">✅</td>
              <td className="border border-gray-300 bg-gray-50 text-center text-green-500">✅</td>
              <td className="border border-gray-300 bg-gray-50 text-center text-green-500">✅</td>
              <td className="border border-gray-300 bg-gray-50 text-center font-semibold">
                {stats.run1_human_correction_percentage !== undefined ? stats.run1_human_correction_percentage.toFixed(2) + "%" : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  
}
