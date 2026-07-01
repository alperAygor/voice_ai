export function parseAdminEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSupportAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}
