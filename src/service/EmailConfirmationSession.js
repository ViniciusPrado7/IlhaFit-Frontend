const PENDING_EMAILS_KEY = "ilhaFitPendingEmailConfirmations";

const normalizeEmail = (email) => email?.trim().toLowerCase() || "";

const getPendingEmails = () => {
  const rawEmails = localStorage.getItem(PENDING_EMAILS_KEY);
  if (!rawEmails) return [];

  try {
    const emails = JSON.parse(rawEmails);
    return Array.isArray(emails) ? emails : [];
  } catch {
    localStorage.removeItem(PENDING_EMAILS_KEY);
    return [];
  }
};

const savePendingEmails = (emails) => {
  localStorage.setItem(PENDING_EMAILS_KEY, JSON.stringify([...new Set(emails)]));
};

export const emailConfirmationSession = {
  markPending(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return;

    savePendingEmails([...getPendingEmails(), normalizedEmail]);
  },

  isPending(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return false;

    return getPendingEmails().includes(normalizedEmail);
  },

  clear(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return;

    savePendingEmails(getPendingEmails().filter((pendingEmail) => pendingEmail !== normalizedEmail));
  },
};
