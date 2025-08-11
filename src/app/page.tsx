"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
    }
  }, [session, isPending]);

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div className="bg-primary text-primary-foreground">
      Simple Sass Starter
    </div>
  );
}
