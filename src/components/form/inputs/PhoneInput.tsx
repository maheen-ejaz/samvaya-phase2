'use client';

import { useState, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';

// Countries most relevant to Indian medical professionals
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'US / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
] as const;

const DEFAULT_CODE = '+91';

/** Parse a stored value like "+91 9876543210" into { code, number } */
function parsePhoneValue(value: string): { code: string; number: string } {
  if (!value) return { code: DEFAULT_CODE, number: '' };

  // Try to match a known country code at the start
  const trimmed = value.trim();
  for (const cc of COUNTRY_CODES) {
    if (trimmed.startsWith(cc.code)) {
      const rest = trimmed.slice(cc.code.length).trim();
      return { code: cc.code, number: rest };
    }
  }

  // Fallback: if starts with + but no known code, try extracting digits after +
  if (trimmed.startsWith('+')) {
    // Try 1-4 digit codes
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)/);
    if (match) return { code: match[1], number: match[2] };
  }

  // No code found — treat entire value as the number
  return { code: DEFAULT_CODE, number: trimmed };
}

interface PhoneInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ question, value, onChange }: PhoneInputProps) {
  const parsed = useMemo(() => parsePhoneValue(value), [value]);
  const [countryCode, setCountryCode] = useState(parsed.code);
  const [localNumber, setLocalNumber] = useState(parsed.number);
  const [touched, setTouched] = useState(false);

  const emitChange = (code: string, num: string) => {
    const combined = num ? `${code} ${num}` : '';
    onChange(combined);
  };

  const handleCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    emitChange(newCode, localNumber);
  };

  const handleNumberChange = (num: string) => {
    setLocalNumber(num);
    emitChange(countryCode, num);
  };

  // Validation hint: strip non-digits for length check
  const phoneDigits = localNumber.replace(/\D/g, '');
  const showPhoneHint = touched && phoneDigits.length > 0 && phoneDigits.length < 10;

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div>
      <div className="flex gap-2">
        {/* Country code selector */}
        <div className="relative shrink-0">
          <select
            value={countryCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="h-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-3 pr-8 text-base text-gray-900 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((cc) => (
              <option key={cc.code} value={cc.code}>
                {cc.flag} {cc.code}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={question.placeholder || '98765 43210'}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
        />
      </div>

      {showPhoneHint && (
        <p className="mt-1.5 text-sm text-amber-600">
          Please enter a valid phone number (at least 10 digits).
        </p>
      )}
    </div>
  );
}
