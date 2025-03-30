'use client';

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Welcome to AI Quiz Platform
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to create and take personalized quizzes
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              width={24}
              height={24}
            />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
} 