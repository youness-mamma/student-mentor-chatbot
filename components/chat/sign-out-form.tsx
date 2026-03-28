"use client";

import { useClerk } from "@clerk/nextjs";

export const SignOutForm = () => {
  const { signOut } = useClerk();

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        signOut({ redirectUrl: "/" });
      }}
    >
      <button
        className="w-full px-1 py-0.5 text-left text-red-500"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
};
