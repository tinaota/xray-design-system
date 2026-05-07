"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ghost-white flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-emergency-red/10 flex items-center justify-center mx-auto">
          <span className="text-emergency-red text-2xl font-bold">!</span>
        </div>
        <h2 className="text-headline-md font-bold text-on-surface">Something went wrong</h2>
        <p className="text-sm text-on-surface-variant">{error.message ?? "An unexpected error occurred."}</p>
        {error.digest && (
          <p className="code-mono text-xs text-outline">digest: {error.digest}</p>
        )}
        <Button variant="primary" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
