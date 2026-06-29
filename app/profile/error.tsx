"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <main className="shell"><section className="panel spacious"><p className="eyebrow">Error</p><h1>Identity workspace unavailable</h1><p>{error.message}</p><button className="button primary" onClick={reset}>Try again</button></section></main>;
}
