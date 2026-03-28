/** Map Supabase Auth errors to clearer copy for the login form */
export function friendlySignInError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login") ||
    m.includes("invalid credentials") ||
    m.includes("wrong password")
  ) {
    return "Wrong email or password. Use the same email and password you chose at sign up.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (m.includes("too many requests")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  return message;
}
