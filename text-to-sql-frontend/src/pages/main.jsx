import TypewriterInput from "../components/typewriter-input";
import { useState, useEffect } from "react"
import { cn } from "../lib/utils"

export default function MainPage() {
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

        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Main Page</h1>
        <TypewriterInput words={queries} className="text-lg text-gray-700 flex justify-center items-center " />
        {isLoading && <p className="text-sm text-gray-500 mt-2">Loading your favorite searches...</p>}
      </div>
    )
}