import React, { useState, useMemo, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleFlag } from "react-circle-flags"
import {
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  CountryCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js"
import { cn } from "@/lib/utils"

interface CountryPhoneInputProps {
  value: string // Full international phone number (e.g., +201234567890)
  onChange: (value: string, isValid: boolean) => void
  placeholder?: string
  className?: string
  showValidation?: boolean
  disabled?: boolean
}

export function CountryPhoneInput({
  value,
  onChange,
  placeholder,
  className,
  showValidation = true,
  disabled = false,
}: CountryPhoneInputProps) {
  const { t } = useTranslation('chat')
  const [countryCode, setCountryCode] = useState<CountryCode>("US")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  const countrySearchInputRef = useRef<HTMLInputElement>(null)

  // Parse initial value
  const internalUpdateRef = useRef(false)

  useEffect(() => {
    // Skip if this was an internal update (to prevent loops)
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false
      return
    }

    if (value && value.startsWith("+")) {
      // Use libphonenumber-js to parse the phone number and detect country
      const parsed = parsePhoneNumberFromString(value)
      if (parsed && parsed.country) {
        setCountryCode(parsed.country as CountryCode)
        setPhoneNumber(parsed.nationalNumber as string)
      } else {
        // Fallback: try to extract country code from dial code
        const codeMatch = value.match(/^\+(\d{1,3})/)
        if (codeMatch) {
          const dialCode = codeMatch[1]
          const countries = getCountries()
          const foundCountry = countries.find(
            (c) => getCountryCallingCode(c) === dialCode
          )
          if (foundCountry) {
            setCountryCode(foundCountry as CountryCode)
            setPhoneNumber(value.slice(1 + dialCode.length))
          } else {
            setPhoneNumber(value.slice(1))
          }
        }
      }
    } else if (!value) {
      // Reset when value is empty
      setPhoneNumber("")
    }
  }, [value])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (countryDropdownOpen && countrySearchInputRef.current) {
      setTimeout(() => {
        countrySearchInputRef.current?.focus()
      }, 100)
    }
  }, [countryDropdownOpen])

  // Get the full international phone number
  const getFullPhoneNumber = useMemo(() => {
    const callingCode = getCountryCallingCode(countryCode)
    let cleanNumber = phoneNumber.replace(/^\+/, "")
    if (cleanNumber.startsWith(callingCode)) {
      cleanNumber = cleanNumber.slice(callingCode.length)
    }
    cleanNumber = cleanNumber.replace(/\D/g, "")
    return `+${callingCode}${cleanNumber}`
  }, [countryCode, phoneNumber])

  // Validation status
  const validation = useMemo(() => {
    const fullNumber = getFullPhoneNumber
    return {
      isValid: isValidPhoneNumber(fullNumber),
      length: phoneNumber.length,
      maxLength: 15,
      hasLeadingZero: phoneNumber.startsWith("0"),
      isTooLong: phoneNumber.length > 15,
      fullNumber,
    }
  }, [phoneNumber, countryCode, getFullPhoneNumber])

  // Country options
  const countryOptions = useMemo(() => {
    const countries = getCountries()
    return countries
      .map((code: CountryCode) => ({
        code,
        name:
          new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
        callingCode: `+${getCountryCallingCode(code)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Filtered countries
  const filteredCountryOptions = useMemo(() => {
    if (!countrySearchQuery) return countryOptions
    const query = countrySearchQuery.toLowerCase()
    return countryOptions.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.callingCode.includes(query) ||
        c.code.toLowerCase().includes(query)
    )
  }, [countryOptions, countrySearchQuery])

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    let cleaned = value.replace(/\D/g, "")

    // Remove leading zeros
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.replace(/^0+/, "")
    }

    // Limit length
    if (cleaned.length > 15) {
      cleaned = cleaned.slice(0, 15)
    }

    setPhoneNumber(cleaned)

    const fullNumber = `+${getCountryCallingCode(countryCode)}${cleaned}`
    const isValid = isValidPhoneNumber(fullNumber)
    
    // Mark as internal update to prevent useEffect from processing this change
    internalUpdateRef.current = true
    onChange(fullNumber, isValid)
  }

  const handleCountrySelect = (code: CountryCode) => {
    setCountryCode(code)
    setCountrySearchQuery("")
    setCountryDropdownOpen(false)

    // Update full number with new country code
    const fullNumber = `+${getCountryCallingCode(code)}${phoneNumber}`
    const isValid = isValidPhoneNumber(fullNumber)
    
    // Mark as internal update to prevent useEffect from processing this change
    internalUpdateRef.current = true
    onChange(fullNumber, isValid)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <DropdownMenu
          open={countryDropdownOpen}
          onOpenChange={setCountryDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] shrink-0 bg-xon-surface border-xon-surface-outline py-2 px-3"
              disabled={disabled}
            >
              <span className="flex items-center gap-2 w-full">
                <CircleFlag
                  countryCode={countryCode.toLowerCase()}
                  className="w-5 h-5"
                />
                <span className="font-medium">
                  {countryOptions.find((c) => c.code === countryCode)
                    ?.callingCode}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 ml-auto transition-transform duration-200",
                    countryDropdownOpen && "rotate-180"
                  )}
                />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px] p-0" align="start">
            {/* Search input */}
            <div className="sticky top-0 bg-xon-surface p-2 border-b border-xon-surface-outline z-10">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-xon-text-secondary" />
                <Input
                  ref={countrySearchInputRef}
                  placeholder={t('contacts.form.country_search', 'Search country...')}
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm bg-xon-surface-container border-xon-surface-outline"
                />
              </div>
            </div>
            {/* Country list */}
            <ScrollArea className="h-[240px]">
              {filteredCountryOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-xon-text-secondary">
                  No countries found
                </div>
              ) : (
                <div className="p-1">
                  {filteredCountryOptions.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() =>
                        handleCountrySelect(country.code as CountryCode)
                      }
                      className="cursor-pointer py-2 flex items-center gap-3"
                    >
                      <CircleFlag
                        countryCode={country.code.toLowerCase()}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="font-medium min-w-[50px]">
                        {country.callingCode}
                      </span>
                      <span className="text-muted-foreground text-sm truncate flex-1 text-left">
                        {country.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-xon-text-secondary" />
          <Input
            placeholder={placeholder || t('contacts.form.phone_placeholder', 'Enter phone number...')}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="pl-10 bg-xon-surface border-xon-surface-outline focus:ring-xon-primary"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Selected Number Display */}
      <p className="text-xs text-xon-text-secondary">
        {t('whatsapp_modal.selected', { phone: getFullPhoneNumber })}
      </p>

      {/* Validation Status */}
      {showValidation && phoneNumber.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          {validation.isValid ? (
            <span className="text-green-500 flex items-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t('contacts.form.valid_phone', 'Valid phone number')}
            </span>
          ) : (
            <span className="text-amber-500 flex items-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {t('contacts.form.invalid_phone', 'Invalid phone number')}
            </span>
          )}
          <span className="text-xon-text-secondary">
            ({validation.length}/{validation.maxLength} digits)
          </span>
        </div>
      )}
    </div>
  )
}
