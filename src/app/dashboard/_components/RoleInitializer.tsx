// /src/app/dashboard/_components/RoleInitializer.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function RoleInitializer() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user) return;

        if (!user.unsafeMetadata?.role) {
            user.update({
                unsafeMetadata: {
                ...user.unsafeMetadata,
                role: "viewer",
          },
        })
        .catch((err) => {
            console.error("Failed to set default role", err);
        });
    }
  }, [isLoaded, user]);

  return null; // This component only runs logic and doesn't need to render anything.
}
