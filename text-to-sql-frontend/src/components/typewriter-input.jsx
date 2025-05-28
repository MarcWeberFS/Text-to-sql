"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "../lib/utils"

// inspired by https://ui.aceternity.com/components/typewriter-effect

export default function TypewriterInput({
  words = [
    "example"
  ],
  className,
  onSubmit,
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const typingSpeed = 100 // Speed in milliseconds
  const deletingSpeed = 50 // Speed for deleting characters
  const pauseBeforeDelete = 2000 // Pause before starting to delete
  const pauseBeforeNextWord = 500 // Pause before typing the next word

  const inputRef = useRef(null)

  useEffect(() => {
    if (isFocused) return // Don't run the effect when input is focused

    let timeout

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        timeout = setTimeout(() => { }, pauseBeforeNextWord)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, deletingSpeed)
      }
    } else {
      const word = words[currentWordIndex]
      if (currentText === word) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, pauseBeforeDelete)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(word.slice(0, currentText.length + 1))
        }, typingSpeed)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, isFocused, words])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    if (!inputValue) {
      setIsFocused(false)
      // Reset to start typing the current word from the beginning
      setCurrentText("")
      setIsDeleting(false)
    }
  }

  const handleChange = (e) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "sm:w-4/5 md:w-3xl px-4 py-2 text-base border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 mx-auto",
          className,
        )}

        placeholder={isFocused ? "" : currentText}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (onSubmit) {
              onSubmit(inputValue)
            }
          }
        }}
      />
    </div>
  )
}

