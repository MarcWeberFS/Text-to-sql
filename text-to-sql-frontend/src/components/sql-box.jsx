"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { CodeBlock } from "./code-block"

export default function SqlBox({ executedQuery, handleSaveFavorite }) {
  const [isSaved, setIsSaved] = useState(false)

  const handleClick = () => {
    handleSaveFavorite()
    setIsSaved(true)
  }

  return (
    <div className="p-5 border border-gray-300 rounded-md bg-white shadow-sm mt-10">
      {executedQuery && (
        <div className="relative sm:w-4/5 md:w-3xl">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Executed SQL Query:
          </label>

          <button
            onClick={handleClick}
            className={`absolute top-1 right-2 transition z-10 ${
                isSaved ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
            type="button"
            aria-label="Save as Favorite"
            >
            <Heart
                className="w-5 h-5"
                fill={isSaved ? "currentColor" : "none"}
            />
            </button>


          <div className="rounded bg-gray-100 text-sm pr-10">
            <CodeBlock
              language="sql"
              filename="SQL"
              code={executedQuery}
            />
          </div>
        </div>
      )}
    </div>
  )
}
