"use client"

import { useState, useEffect } from "react"
import TypewriterInput from "./typewriter-input"
import { cn } from "../lib/utils"
import { Checkbox } from "./checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"

export default function InputForm({ className }) {
    const [checkedUFL, setCheckedUFL] = useState(false)
    const [checkedSFL, setCheckedSFL] = useState(false)
    const [checkedAER, setCheckedAER] = useState(false)
    const [modelName, setModelName] = useState("")


  const [queries, setQueries] = useState([
    "Loading suggestions...", // Default placeholder while loading
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch queries when component mounts
    const fetchQueries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:8080/getFavorites", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch queries")
        }

        const data = await response.json()

        // Extract just the query field from each object
        // And filter out duplicates to make the typewriter effect more interesting
        const uniqueQueries = [...new Set(data.map((item) => item.query))]

        // Only update state if we got some queries
        if (uniqueQueries.length > 0) {
          setQueries(uniqueQueries)
        } else {
          // Fallback if no queries were returned
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

  return (
    <div className={cn("flex flex-col bg-white p-5 rounded-md border-gray-400  border", className)}>
   <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
  <div className="flex flex-wrap gap-4">
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

  {/* Model Selector */}
  <div className="w-28">
    <Select value={modelName} onValueChange={setModelName}>
      <SelectTrigger
        id="model"
        className="h-8 min-h-8 border-0 bg-gray-100 dark:bg-gray-800"
      >
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="grok">Grok</SelectItem>
        <SelectItem value="gpt-4">GPT-4</SelectItem>
        <SelectItem value="claude">Claude</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

      <TypewriterInput words={queries} className="w-full sm:w-4/5 text-lg text-gray-700 flex justify-center items-center" />
      {isLoading && <p className="text-sm text-gray-500 mt-2">Loading your favorite searches...</p>}
    </div>
  )
}

