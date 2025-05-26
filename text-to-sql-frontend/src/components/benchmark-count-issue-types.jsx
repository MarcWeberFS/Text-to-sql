"use client";

import { useEffect, useState } from "react";

export default function CountFalseIssueTypes({ correction }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await fetch(
          correction
            ? `${process.env.REACT_APP_API_URL}/benchmark/getCountTrueIssueTypes`
            : `${process.env.REACT_APP_API_URL}/getCountFalseIssueTypes`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch issue types");

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching issue types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueTypes();
  }, [correction]);

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
                  Issue Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap text-center font-semibold">
                    {item.issue_type}
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
