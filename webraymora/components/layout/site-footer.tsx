import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="border-t border-base-700 bg-base-900">
      <div className="container-px py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Raymora logo" className="h-12 w-12 object-contain" />
              <span className="font-semibold tracking-tight text-base-100">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-base-400">{siteConfig.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-base-100">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-base-400">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-base-100">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-base-100">Get in touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-base-400">
              <li>
                <a href={siteConfig.phoneHref} className="hover:text-base-100">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-base-100">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-base-100">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-base-800 pt-6 text-xs text-base-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Existing client? Visit the Contact page for the dedicated support path.</p>
        </div>
      </div>
    </footer>
  );
}
