"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: session, status } = useSession();
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gray-100 border-b mb-6">
      <div className="font-bold text-lg">goGrocery</div>
      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <span>Loading...</span>
        ) : session?.user ? (
          <>
            <Link 
              href="/shopping-lists"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Shopping Lists
            </Link>
            <span className="text-gray-700">{session.user.email}</span>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={() => signIn()}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
} 