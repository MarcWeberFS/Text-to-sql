"use client";

import { useEffect, useState } from "react";

export default function BenchmarkResponseTime() {
  const [responseTimes, setResponseTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const llms = ["chatgpt", "claude", "deepseek", "gemini", "grok"];

  useEffect(() => {
    const fetchResponseTimes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/benchmark/getResponsetime`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch response times");

        const data = await response.json();

        // Map and sort alphabetically based on predefined order
        const sorted = llms.map((llm) => {
          const match = data.find((item) => item.llm === llm);
          return {
            llm,
            avgTimeSec: match ? (match.avg_response_time_ms / 1000).toFixed(2) : "-",
          };
        });

        setResponseTimes(sorted);
      } catch (error) {
        console.error("Error fetching response times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseTimes();
  }, []);

  return (
    <div className="p-6">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  LLM
                </th>
                {llms.map((llm) => (
                  <th key={llm} className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {llm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-2 text-center font-semibold">Avg Time (s)</td>
                {responseTimes.map((item, index) => (
                  <td key={index} className="px-6 py-2 text-center">
                    {item.avgTimeSec}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
