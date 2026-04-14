'use client';

import { useState, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Countries most relevant to Indian medical professionals
const COUNTRY_CODES = [
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'India' },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'US / Canada' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK' },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', name: 'UAE' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia' },
  { code: '+65', flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany' },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', name: 'Saudi Arabia' },
  { code: '+968', flag: '\u{1F1F4}\u{1F1F2}', name: 'Oman' },
  { code: '+974', flag: '\u{1F1F6}\u{1F1E6}', name: 'Qatar' },
  { code: '+973', flag: '\u{1F1E7}\u{1F1ED}', name: 'Bahrain' },
  { code: '+965', flag: '\u{1F1F0}\u{1F1FC}', name: 'Kuwait' },
  { code: '+64', flag: '\u{1F1F3}\u{1F1FF}', name: 'New Zealand' },
  { code: '+353', flag: '\u{1F1EE}\u{1F1EA}', name: 'Ireland' },
  { code: '+60', flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia' },
] as const;

const DEFAULT_CODE = '+91';

/** Parse a stored value like "+91 9876543210" into { code, number } */
function parsePhoneValue(value: string): { code: string; number: string } {
  if (!value) return { code: DEFAULT_CODE, number: '' };

  const trimmed = value.trim();
  for (const cc of COUNTRY_CODES) {
    if (trimmed.startsWith(cc.code)) {
      const rest = trimmed.slice(cc.code.length).trim();
      return { code: cc.code, number: rest };
    }
  }

  if (trimmed.startsWith('+')) {
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)/);
    if (match) return { code: match[1], number: match[2] };
  }

  return { code: DEFAULT_CODE, number: trimmed };
}

interface PhoneInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function PhoneInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: PhoneInputProps) {
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

  const phoneDigits = localNumber.replace(/\D/g, '');
  const showPhoneHint = touched && phoneDigits.length > 0 && phoneDigits.length < 10;

  return (
    <div>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={handleCodeChange}>
          <SelectTrigger className="h-11 w-[7.5rem] shrink-0 rounded-xl" aria-label="Country code">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map((cc) => (
              <SelectItem key={cc.code} value={cc.code}>
                {cc.flag} {cc.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          id={inputId}
          type="tel"
          inputMode="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={question.placeholder || '98765 43210'}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || undefined}
          className={cn(
            'h-11 min-w-0 flex-1 rounded-xl border-input bg-transparent px-4 text-[15px]',
            'focus-visible:ring-primary/30',
          )}
        />
      </div>

      {showPhoneHint && (
        <p className="mt-2 text-sm text-destructive">
          Please enter a valid phone number (at least 10 digits).
        </p>
      )}
    </div>
  );
}
