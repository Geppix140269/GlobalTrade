"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export interface LoginState {
  error: string | null;
}

export async function loginAction(_prev: LoginState | null, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/members",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      // Deliberately generic: do not reveal whether the email exists or whether
      // the account has been disabled.
      return { error: "Incorrect email or password, or this account is not active." };
    }
    // next/navigation redirects are thrown — let them through.
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
