"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-lg text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Nallamala Backend & Admin API</h1>
        <p className="text-gray-600 mb-8">
          This service acts as the backend for the frontend website. It also hosts the Admin UI for managing Updates, Queries, and Resources.
        </p>

        {status === "loading" && <p>Loading authentication...</p>}

        {status === "authenticated" && session ? (
          <div>
            <div className="flex flex-col items-center justify-center space-y-4 mb-6">
              <img src={session.user.image || ""} alt={session.user.name || "User"} className="w-20 h-20 rounded-full border border-gray-200" />
              <div>
                <p className="text-lg font-semibold">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Role: {session.user.role}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              {session.user.role === "admin" && (
                <Link href="/admin" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                  Go to Admin Dashboard
                </Link>
              )}
              {session.user.role !== "admin" && (
                <p className="text-red-500 text-sm mb-2">You are registered as a User. You need &apos;admin&apos; role in the DB to access the dashboard!</p>
              )}
              <button onClick={() => signOut()} className="px-6 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition">
                Sign Out
              </button>
            </div>
          </div>
        ) : null}

        {status === "unauthenticated" ? (
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6 mr-3" />
            Sign in with Google
          </button>
        ) : null}
      </div>
    </div>
  );
}
