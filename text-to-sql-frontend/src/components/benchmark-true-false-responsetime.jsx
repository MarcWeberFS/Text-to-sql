"use client";

import { useEffect, useState } from "react";

export default function BenchmarkResponseTimeTrueFalse() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const response = await fetch("http://localhost:8080/benchmark/getResponseTimeTrueFalse", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch correctness time");

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching correctness time:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, []);

  const getLabel = (isCorrect) => {
    return isCorrect ? "Correct Responses" : "Incorrect Responses";
  };

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
                  Response Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Average Response Time (s)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap text-center font-semibold">
                    {getLabel(item.is_correct)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-center">
                    {(item.avg_response_time_ms / 1000).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
