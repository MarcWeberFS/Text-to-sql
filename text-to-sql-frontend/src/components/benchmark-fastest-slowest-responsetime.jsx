"use client";

import { useEffect, useState } from "react";

export default function BenchmarkFastestSlowest() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch("http://localhost:8080/benchmark/getFastestAndSlowestResponsetime", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch response times");

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching fastest/slowest response times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">LLM</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Response Time (s)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{item.llm}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{(item.response_time_ms / 1000).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
