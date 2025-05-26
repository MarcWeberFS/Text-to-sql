"use client";

import { useEffect, useState } from "react";

export default function BenchmarkCorrections() {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCorrections = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/benchmark/getCorrectionCount`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch correction data");

        const data = await response.json();
        setCorrections(data);
      } catch (error) {
        console.error("Error fetching corrections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrections();
  }, []);

  const getLabel = (isCorrect, humanCorrection) => {
    if (humanCorrection && isCorrect) return "Remained Correct";
    if (humanCorrection && !isCorrect) return "Corrected by Human";
    if (!humanCorrection && !isCorrect) return "Remained Incorrect";
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
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {corrections.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap text-center font-semibold">
                    {getLabel(item.is_correct, item.human_correction)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-center">
                    {item.count}
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
