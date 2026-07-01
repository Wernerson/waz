"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setError("Unable to sign out right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClick} disabled={isSubmitting}>
        {isSubmitting ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
