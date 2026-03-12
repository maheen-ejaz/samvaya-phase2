'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FeedbackFormProps {
  presentationId: string;
}

const WHAT_WORKED_TAGS = [
  'Age match',
  'Location',
  'Career alignment',
  'Values',
  'Personality',
  'Family background',
  'Lifestyle',
];

const WHAT_DIDNT_WORK_TAGS = [
  'Age gap',
  'Location mismatch',
  'Career mismatch',
  'Values mismatch',
  'Personality mismatch',
  'Family expectations',
  'Lifestyle differences',
];

export function FeedbackForm({ presentationId }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [whatWorked, setWhatWorked] = useState<string[]>([]);
  const [whatDidntWork, setWhatDidntWork] = useState<string[]>([]);
  const [wouldLikeMore, setWouldLikeMore] = useState<boolean | null>(null);
  const [concern, setConcern] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyNudge, setEmptyNudge] = useState(false);

  const toggleTag = (
    tag: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]
    );
  };

  const isCompletelyEmpty =
    rating === 0 &&
    whatWorked.length === 0 &&
    whatDidntWork.length === 0 &&
    wouldLikeMore === null &&
    !concern.trim();

  const handleSubmit = async () => {
    if (isCompletelyEmpty && !emptyNudge) {
      setEmptyNudge(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/app/matches/${presentationId}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: rating > 0 ? rating : undefined,
            whatWorked,
            whatDidntWork,
            wouldLikeMoreLikeThis: wouldLikeMore,
            specificConcern: concern.trim() || undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm font-medium text-green-800">
          Thank you for your feedback!
        </p>
        <p className="mt-1 text-xs text-green-600">
          This helps us find better matches for you.
        </p>
        <Link
          href="/app/matches"
          className="mt-4 inline-block text-sm text-green-600 hover:text-green-700"
        >
          Back to matches
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          How would you rate this match?
        </label>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-3"
              role="radio"
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              aria-checked={rating === star}
            >
              <svg
                className={`h-8 w-8 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* What worked */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          What worked well?
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {WHAT_WORKED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, whatWorked, setWhatWorked)}
              aria-pressed={whatWorked.includes(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                whatWorked.includes(tag)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* What didn't work */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          What didn&apos;t work?
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {WHAT_DIDNT_WORK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, whatDidntWork, setWhatDidntWork)}
              aria-pressed={whatDidntWork.includes(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                whatDidntWork.includes(tag)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Would like more */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Would you like more matches like this?
        </label>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => setWouldLikeMore(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              wouldLikeMore === true
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setWouldLikeMore(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              wouldLikeMore === false
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Specific concern */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Any specific concerns? (optional)
        </label>
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-samvaya-red focus:outline-none focus:ring-1 focus:ring-samvaya-red"
          placeholder="Tell us more about what you'd prefer..."
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {concern.length}/500
        </p>
      </div>

      {emptyNudge && isCompletelyEmpty && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Your feedback helps us find better matches. Consider rating this match before submitting.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-lg bg-samvaya-red px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-samvaya-red-dark disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}
