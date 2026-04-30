import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-light tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
