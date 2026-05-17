"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <span className="text-5xl">🏋️‍♂️</span>
          <h1 className="text-2xl font-bold mt-4 text-white">Join Us</h1>
          <p className="text-gray-400">Create an account to save your progress</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98]"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
