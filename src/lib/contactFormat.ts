// Formatting & validation helpers for service contact fields.

export type FormattedContact = {
  href: string | null;
  display: string;
  valid: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatUkPhone(raw: string): { display: string; href: string; valid: boolean } {
  const cleaned = raw.replace(/[^\d+]/g, "");
  // Convert leading 0 to +44 for tel: link
  let intl = cleaned;
  if (intl.startsWith("00")) intl = "+" + intl.slice(2);
  if (intl.startsWith("0")) intl = "+44" + intl.slice(1);

  const valid = /^\+?\d{7,15}$/.test(intl);

  // Pretty display: keep original-ish but normalise spacing for common UK formats
  let display = raw.trim();
  const digits = cleaned.replace(/^\+44/, "0").replace(/^\+/, "");
  if (/^0\d{10}$/.test(digits)) {
    // e.g. 01454 868000 / 020 7946 0000
    if (digits.startsWith("020") || digits.startsWith("011") || digits.startsWith("016")) {
      display = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    } else if (digits.startsWith("07")) {
      display = `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    } else {
      display = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
  }

  return { display, href: `tel:${intl}`, valid };
}

function formatEmail(raw: string): FormattedContact {
  const value = raw.trim();
  const valid = EMAIL_RE.test(value);
  return {
    display: value.toLowerCase(),
    href: valid ? `mailto:${value}` : null,
    valid,
  };
}

function formatWebsite(raw: string): FormattedContact {
  const value = raw.trim();
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let valid = false;
  let display = value;
  try {
    const url = new URL(withProtocol);
    valid = /\./.test(url.hostname);
    display = url.hostname.replace(/^www\./, "") + (url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : "");
  } catch {
    valid = false;
  }
  return { display, href: valid ? withProtocol : null, valid };
}

export function formatContact(type: string, value: string): FormattedContact {
  const t = (type || "").toLowerCase();
  if (!value?.trim()) return { display: "", href: null, valid: false };

  if (t.includes("phone") || t.includes("tel") || t.includes("mobile")) {
    return formatUkPhone(value);
  }
  if (t.includes("email") || t.includes("mail")) {
    return formatEmail(value);
  }
  if (t.includes("web") || t.includes("site") || t.includes("url") || t.includes("link")) {
    return formatWebsite(value);
  }
  return { display: value.trim(), href: null, valid: true };
}
