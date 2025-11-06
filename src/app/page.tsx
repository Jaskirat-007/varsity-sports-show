import Image from "next/image";
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  // Use `auth()` to access `isAuthenticated` - if false, the user is not signed in
  const { isAuthenticated } = await auth()

  // Get the Backend API User object when you need access to the user's information
  const user = isAuthenticated ? await currentUser() : null

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 space-y-10">

      { /* Put your banner in -> /public , Update the banner -> src*/}
      <div className="w-full max-w-4xl">
        <Image
          src="/banner.png"
          alt="Varsity Sports Show Banner"
          width={1920}
          height={1080}
          className="w-full h-auto rounded-2xl shadow-lg"
          priority
        />
      </div>

      <p className="text-xl font-bold tracking-wide text-center text-gray-800 dark:text-gray-500">
        EMPOWERING EDUCATION + ENABLING DREAMS
      </p>

      {isAuthenticated && (
        <div className="text-lg">
          Welcome, {user?.fullName ?? user?.username ?? "Viewer"}!
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-base text-gray-800 dark:text-gray-500">
          Sign in to access live streaming service.
        </div>
      )}
    </div>
  )
}