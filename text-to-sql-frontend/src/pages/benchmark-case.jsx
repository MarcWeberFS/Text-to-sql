"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CodeBlock } from "../components/code-block";
import Navigation from "../components/navigation";

// Template page for Benchmark Case

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
          fetch(`http://localhost:8080/benchmark/case/${id}`),
          fetch(`http://localhost:8080/benchmark/caseResult/${id}?runNumber=${runNumber}`),
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

    <div className="flex flex-col items-center p-6 pt-24">
      <Navigation />
      <div className="flex flex-col gap-8">

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-md">
          <h1 className="max-w-3xl text-3xl font-bold mb-4 text-center">Benchmark Case {caseInfo.id}</h1>
          <p className="max-w-3xl text-base mb-6 text-gray-700">{caseInfo.prompt}</p>
          <h2 className="max-w-3xl text-2xl font-semibold mb-3">Example SQL</h2>
          <CodeBlock
            language="sql"
            filename="Example.sql"
            code={caseInfo.expected_sql}
          />
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-md">
          <h2 className="max-w-3xl text-2xl font-semibold mb-4">LLM Responses</h2>
          <div className="max-w-3xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">LLM</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Correct</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Human Correction</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Issue Type</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Response Time (s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
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

        {caseResults.map((result, index) => (
          <div key={index} className="bg-white p-6 rounded-md border border-gray-300 shadow-md">
            <h3 className="max-w-3xl text-2xl font-semibold mb-4 text-gray-700">{result.llm} Response {result.human_correction ? " " : "❌"} </h3>
            <CodeBlock
              language="sql"
              filename={`${result.llm}_response.sql`}
              code={result.query}
            />
          </div>
        ))}

      </div>
    </div>
  );
}
