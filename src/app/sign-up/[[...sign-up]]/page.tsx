"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-white text-slate-900">
      {/* Left: Clerk Auth */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-center leading-snug">
            Join VSS for free & <br/>
            start watching live games now.
          </h1>
        </div>

        <div className="w-full max-w-sm">
            <SignUp signInUrl="/sign-in" />
        </div>
      </div>

      {/* Right: Gallery wall */}
      <div className="hidden md:block">
        <GalleryWall />
      </div>
    </div>
  );
}

function GalleryWall() {
  // replace the image in /public/gallery
  const imgs = [
    "/gallery/sports1.png",
    "/gallery/sports2.png",
    "/gallery/sports3.png",
    "/gallery/sports4.png",
    "/gallery/sports5.png",
    "/gallery/sports6.png",
    "/gallery/sports7.png",
    "/gallery/sports8.png",
    "/gallery/sports9.png",
  ];
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2">
        {imgs.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-md">
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
    </div>
  );
}
