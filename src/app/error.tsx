"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="container empty-page"><h1>Something did not load.</h1><p>Please try loading this page again.</p><button className="button primary" onClick={reset}>Try again</button></section>;
}
