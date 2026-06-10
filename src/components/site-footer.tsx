import Link from "next/link";

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-indigo-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <p>
          Designed by{" "}
          <a
            href="https://dreams4u.in"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-indigo-700 transition hover:text-indigo-900"
          >
            Dreams4u
          </a>
        </p>
      </div>
    </footer>
  );
}
