"use client";

import { SignIn } from "@clerk/nextjs";
import { Stethoscope } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Medical Visitor</h1>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <SignIn
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/post-login"
            afterSignUpUrl="/post-login"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

