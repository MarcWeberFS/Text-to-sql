"use client";

import { useEffect, useState } from "react";

export default function BenchmarkResults({ correction, run_number }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/benchmark/getResults/${run_number}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch results");

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching benchmark results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const llms = ["chatgpt", "claude", "deepseek", "gemini", "grok"];

  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.benchmark_case_id]) {
      acc[curr.benchmark_case_id] = {};
    }
    if (correction === "is_correct") {
      acc[curr.benchmark_case_id][curr.llm] = curr.is_correct;
    } else {
      acc[curr.benchmark_case_id][curr.llm] = curr.human_correction;
    }
    return acc;
  }, {});

  const stats = results.reduce((acc, curr) => {
    const value = correction === "is_correct" ? curr.is_correct : curr.human_correction;
    if (!acc[curr.llm]) {
      acc[curr.llm] = { correct: 0, total: 0 };
    }
    if (value) {
      acc[curr.llm].correct += 1;
    }
    acc[curr.llm].total += 1;
    return acc;
  }, {});

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
                  Benchmark ID
                </th>
                {llms.map((llm) => (
                  <th key={llm} className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {llm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedResults).map(([benchmarkId, llmResults]) => (
                <tr
                    key={benchmarkId}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => window.location.href = `/case/${benchmarkId}?runNumber=${run_number}`}
                >
                    <td className="px-6 py-2 whitespace-nowrap text-center font-semibold">{benchmarkId}</td>
                    {llms.map((llm) => (
                    <td key={llm} className="px-6 py-2 whitespace-nowrap text-center">
                        {llmResults[llm] === undefined ? (
                        "-"
                        ) : llmResults[llm] ? (
                        <span className="text-green-500 font-bold text-lg">✅</span>
                        ) : (
                        <span className="text-red-500 font-bold text-lg">❌</span>
                        )}
                    </td>
                    ))}
                </tr>
            ))}


              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-2 text-center">Total Correct</td>
                {llms.map((llm) => (
                  <td key={llm} className="px-6 py-2 text-center">
                    {stats[llm]?.correct || 0}
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-2 text-center">Correctness %</td>
                {llms.map((llm) => {
                  const correct = stats[llm]?.correct || 0;
                  const total = stats[llm]?.total || 0;
                  const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";
                  return (
                    <td key={llm} className="px-6 py-2 text-center">
                      {percentage}%
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
