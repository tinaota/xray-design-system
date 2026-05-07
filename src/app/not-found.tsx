import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ghost-white flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-midnight-navy flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-black">404</span>
        </div>
        <h2 className="text-headline-md font-bold text-on-surface">Page not found</h2>
        <p className="text-sm text-on-surface-variant">This route doesn&apos;t exist in the design system.</p>
        <Link href="/">
          <Button variant="primary">Back to Gallery</Button>
        </Link>
      </div>
    </div>
  );
}
