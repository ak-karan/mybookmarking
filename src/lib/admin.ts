export function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isConfiguredAdmin(email: string) {
  return configuredAdminEmails().has(email.toLowerCase());
}
