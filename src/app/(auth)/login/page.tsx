"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0070D2] rounded-xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-white">Bright CRM</h1>
          <p className="text-white/60 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="bc-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bc-input"
                required
              />
            </div>

            <div>
              <label className="bc-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bc-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bc-btn bc-btn-primary w-full justify-center py-2.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#DDDBDA]">
            <p className="text-xs text-[#706E6B] text-center">
              Demo credentials:
              <br />
              <span className="font-mono">admin@bright-crm.com / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
