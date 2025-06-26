"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CodeBlock } from "../components/code-block";
import Navigation from "../components/navigation";

export default function BenchmarkCase() {
  const { id } = useParams();
  const runNumber = new URLSearchParams(window.location.search).get("runNumber");
  const [caseInfo, setCaseInfo] = useState(null);
  const [caseResults, setCaseResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const [caseResponse, resultsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/benchmark/case/${id}`),
          fetch(`${process.env.REACT_APP_API_URL}/benchmark/caseResult/${id}?runNumber=${runNumber}`),
        ]);

        const caseData = await caseResponse.json();
        const resultsData = await resultsResponse.json();

        setCaseInfo(caseData[0]);
        setCaseResults(resultsData);
      } catch (error) {
        console.error("Error loading benchmark case:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }

  if (!caseInfo) {
    return <div className="flex justify-center p-6">Benchmark case not found.</div>;
  }

  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-start min-h-screen px-4 md:px-6 pt-24 bg-white">
        <div className="w-full max-w-4xl space-y-8">

          {/* Prompt Block */}
          <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-300 shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Benchmark Case {caseInfo.id}
            </h1>
            <p className="text-sm md:text-base text-gray-700 mb-6">{caseInfo.prompt}</p>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Example SQL</h2>
            <CodeBlock language="sql" filename="Example.sql" code={caseInfo.expected_sql} />
          </div>

          {/* Results Table */}
          <div className="bg-white p-4 sm:p-6 rounded-md border border-gray-300 shadow-md">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">LLM Responses</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">LLM</th>
                    <th className="px-4 py-2 text-center font-medium uppercase tracking-wide">Correct</th>
                    <th className="px-4 py-2 text-center font-medium uppercase tracking-wide">Human Correction</th>
                    <th className="px-4 py-2 text-center font-medium uppercase tracking-wide">Issue Type</th>
                    <th className="px-4 py-2 text-center font-medium uppercase tracking-wide">Response Time (s)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {caseResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 font-medium">{result.llm}</td>
                      <td className="px-4 py-3 text-center">{result.is_correct ? "✅" : "❌"}</td>
                      <td className="px-4 py-3 text-center">{result.human_correction ? "✅" : "❌"}</td>
                      <td className="px-4 py-3 text-center">{result.issue_type || "-"}</td>
                      <td className="px-4 py-3 text-center">{(result.response_time_ms / 1000).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Responses */}
          {caseResults.map((result, index) => (
            <div key={index} className="bg-white p-4 sm:p-6 rounded-md border border-gray-300 shadow-md">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
                {result.llm} Response {result.human_correction ? "" : "❌"}
              </h3>
              <CodeBlock
                language="sql"
                filename={`${result.llm}_response.sql`}
                code={result.query}
              />
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
