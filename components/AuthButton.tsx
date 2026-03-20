"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full border border-white/10"
          />
        )}
        <span className="text-xs text-[#e8e4df]/60 hidden sm:inline">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/50 hover:text-[#e8e4df] hover:border-white/20 transition-all cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/60 hover:text-[#d4a574] hover:border-[#d4a574]/30 transition-all cursor-pointer"
    >
      Sign in
    </button>
  );
}
