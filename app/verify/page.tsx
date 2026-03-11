// src/app/verify/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema, VerifyFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormValues) => {
    if (!token || !email) return setErrorMsg("Invalid link parameters.");
    try {
      setErrorMsg("");
      await api.post("/verify", { email, token, password: data.password });
      router.push("/login?verified=true"); // Redirect to login on success
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Set Your Password</h1>
      <p className="text-sm text-center text-gray-600">Verifying: {email}</p>
      
      {errorMsg && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{errorMsg}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input type="password" {...register("password")} className="w-full p-2 mt-1 border rounded" />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <input type="password" {...register("confirmPassword")} className="w-full p-2 mt-1 border rounded" />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2 text-white bg-green-600 rounded hover:bg-green-700">
          {isSubmitting ? "Saving..." : "Set Password & Login"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Suspense fallback={<div>Loading verification data...</div>}>
        <VerifyForm />
      </Suspense>
    </main>
  );
}