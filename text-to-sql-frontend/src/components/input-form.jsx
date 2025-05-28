"use client"

import { useState, useEffect } from "react"
import TypewriterInput from "./typewriter-input"
import { cn } from "../lib/utils"
import { Checkbox } from "./checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"
import SqlBox from "./sql-box"
import ResponseTable from "./response-table"
import ResultMap from "./result-app"

// Used Shadcn UI components for Checkbox and Select

export default function InputForm({ className }) {
    const [checkedUFL, setCheckedUFL] = useState(false)
    const [checkedSFL, setCheckedSFL] = useState(false)
    const [checkedAER, setCheckedAER] = useState(false)
    const [modelName, setModelName] = useState("")
    const [lastPrompt, setLastPrompt] = useState("")
    const [executedQuery, setExecutedQuery] = useState("")
    const [resultData, setResultData] = useState([])
    const [queryLoading, setQueryLoading] = useState(false)

    

  const [queries, setQueries] = useState([
    "Loading suggestions...", 
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getFavorites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch queries")
        }

        const data = await response.json()

        const uniqueQueries = [...new Set(data.map((item) => item.query))]

        if (uniqueQueries.length > 0) {
          setQueries(uniqueQueries)
        } else {
          setQueries(["No saved queries found", "Try searching for something..."])
        }
      } catch (error) {
        console.error("Error fetching queries:", error)
        setQueries(["Couldn't load suggestions", "Try searching for something..."])
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueries()
  }, [])

  const handleSubmit = async (prompt) => {
    const payload = {
      prompt,
      model: modelName,
      userFeedbackLoop: checkedUFL,
      syntaxFeedbackLoop: checkedSFL,
      allowEmptyResponse: checkedAER,
    }
  
    try {
      setQueryLoading(true) 
      const res = await fetch("http://localhost:8080/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      })
  
      const data = await res.json()
  
      setExecutedQuery(data.executedQuery)
      setLastPrompt(prompt)
      setResultData(data.result || [])
    } catch (err) {
      console.error("API call failed:", err)
    } finally {
      setQueryLoading(false) 
    }
  }
  
  
  const handleSaveFavorite = async () => {
    if (!lastPrompt || !executedQuery) return
  
    try {
      const res = await fetch("http://localhost:8080/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: lastPrompt,
          sql: executedQuery,
        }),
      })
  
      if (res.ok) {
        console.log("Favorite saved!")
      } else {
        throw new Error("Failed to save favorite")
      }
    } catch (error) {
      console.error("Save failed:", error)
    }
  }
  

  return (
    <><div className={cn("flex flex-col bg-white p-5 rounded-md border-gray-300 shadow-md border", className)}>
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <div className="flex flex-wrap gap-4">
                  <Checkbox
                      checked={checkedUFL}
                      onChange={() => setCheckedUFL(!checkedUFL)}
                      label="User Feedback Loop" />
                  <Checkbox
                      checked={checkedSFL}
                      onChange={() => setCheckedSFL(!checkedSFL)}
                      label="Syntax Feedback Loop" />
                  <Checkbox
                      checked={checkedAER}
                      onChange={() => setCheckedAER(!checkedAER)}
                      label="Allow Empty Response" />
              </div>

              <div className="w-28">
                  <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger
                          id="model"
                          className="h-8 min-h-8 border-0 bg-gray-100 dark:bg-gray-800"
                      >
                          <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="claude">Claude</SelectItem>
                          <SelectItem value="deepseek">Deepseek</SelectItem>
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="grok">Grok</SelectItem>
                          <SelectItem value="chatgpt">chatgpt</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <TypewriterInput words={queries} className="w-full sm:w-4/5 text-lg text-gray-700 flex justify-center items-center " onSubmit={handleSubmit} />
          {isLoading && <p className="text-sm text-gray-500 mt-2">Loading your favorite searches...</p>}



      </div><div>
      {queryLoading && (
        <div className="flex flex-col justify-center items-center mt-8">
          <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-800">Loading query result...</p>
        </div>
      )}


        {resultData.length > 0 && <SqlBox executedQuery={executedQuery} handleSaveFavorite={handleSaveFavorite} />}
        {resultData.length > 0 && <ResultMap data={resultData} />}
        {resultData.length > 0 && <ResponseTable data={resultData} />}
        


          </div></>
    
  )
}

