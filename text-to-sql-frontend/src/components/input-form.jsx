import { useState, useEffect } from "react";
import TypewriterInput from "./typewriter-input";
import { cn } from "../lib/utils";
import { Checkbox } from "./checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import SqlBox from "./sql-box";
import ResponseTable from "./response-table";
import ResultMap from "./result-app";

export default function InputForm({ className }) {
  const [checkedUFL, setCheckedUFL] = useState(false);
  const [checkedSFL, setCheckedSFL] = useState(false);
  const [checkedAER, setCheckedAER] = useState(false);
  const [modelName, setModelName] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [resultData, setResultData] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queries, setQueries] = useState(["Loading suggestions..."]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getFavorites`);
        if (!response.ok) throw new Error("Failed to fetch queries");
        const data = await response.json();
        const uniqueQueries = [...new Set(data.map((item) => item.query))];
        setQueries(
          uniqueQueries.length > 0
            ? uniqueQueries
            : ["No saved queries found", "Try searching for something..."]
        );
      } catch (error) {
        console.error("Error fetching queries:", error);
        setQueries(["Couldn't load suggestions", "Try searching for something..."]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const handleSubmit = async (prompt) => {
    const payload = {
      prompt,
      model: modelName,
      userFeedbackLoop: checkedUFL,
      syntaxFeedbackLoop: checkedSFL,
      allowEmptyResponse: checkedAER,
    };

    try {
      setQueryLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setExecutedQuery(data.executedQuery);
      setLastPrompt(prompt);
      setResultData(data.result || []);
    } catch (err) {
      console.error("API call failed:", err);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!lastPrompt || !executedQuery) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: lastPrompt, sql: executedQuery }),
      });

      if (!res.ok) throw new Error("Failed to save favorite");
      console.log("Favorite saved!");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col bg-white p-4 sm:p-6 rounded-md border border-gray-300 shadow-md w-full",
          className
        )}
      >
        {/* Checkboxes and Model Select */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <Checkbox
              checked={checkedUFL}
              onChange={() => setCheckedUFL(!checkedUFL)}
              label="User Feedback Loop"
            />
            <Checkbox
              checked={checkedSFL}
              onChange={() => setCheckedSFL(!checkedSFL)}
              label="Syntax Feedback Loop"
            />
            <Checkbox
              checked={checkedAER}
              onChange={() => setCheckedAER(!checkedAER)}
              label="Allow Empty Response"
            />
          </div>

          <div className="sm:w-32 w-full">
            <Select value={modelName} onValueChange={setModelName}>
              <SelectTrigger className="h-9 bg-gray-100 dark:bg-gray-800 w-full">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="deepseek">Deepseek</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="grok">Grok</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Typewriter input */}
        <TypewriterInput
          words={queries}
          className="w-full text-base text-gray-700"
          onSubmit={handleSubmit}
        />
        {isLoading && (
          <p className="text-sm text-gray-500 mt-2">
            Loading your favorite searches...
          </p>
        )}
      </div>

      {/* Query Results Section */}
      <div className="w-full mt-6 space-y-6">
        {queryLoading && (
          <div className="flex flex-col justify-center items-center">
            <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-800">Loading query result...</p>
          </div>
        )}
        {resultData.length > 0 && (
          <>
            <SqlBox executedQuery={executedQuery} handleSaveFavorite={handleSaveFavorite} />
            <ResultMap data={resultData} />
            <ResponseTable data={resultData} />
          </>
        )}
      </div>
    </>
  );
}
