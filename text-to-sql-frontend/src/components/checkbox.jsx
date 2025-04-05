"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "../lib/utils"

const Checkbox = React.forwardRef(
  (
    { className, checked, defaultChecked, onChange, disabled, label, id, labelClassName, containerClassName, ...props },
    ref,
  ) => {
    // Generate a unique ID if none is provided
    const uniqueId = React.useId()
    const checkboxId = id || `checkbox-${uniqueId}`

    const [isChecked, setIsChecked] = React.useState(defaultChecked || false)

    // Handle controlled vs uncontrolled component
    const checkedState = checked !== undefined ? checked : isChecked

    const handleChange = (event) => {
      if (checked === undefined) {
        setIsChecked(!isChecked)
      }

      if (onChange) {
        onChange(event)
      }
    }

    return (
      <div className={cn("flex items-center gap-2", containerClassName)}>
        <div
          ref={ref}
          id={checkboxId}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            checkedState ? "bg-black text-white" : "bg-white",
            className,
          )}
          data-state={checkedState ? "checked" : "unchecked"}
          onClick={disabled ? undefined : handleChange}
          role="checkbox"
          aria-checked={checkedState}
          tabIndex={disabled ? undefined : 0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault()
              handleChange(e)
            }
          }}
          {...props}
        >
          {checkedState && (
            <div className={cn("flex items-center justify-center text-current")}>
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  },
)

Checkbox.displayName = "Checkbox"

export { Checkbox }

