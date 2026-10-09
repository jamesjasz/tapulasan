import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "TapUlasan", template: "%s · TapUlasan" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="id">{children}</SiteShell>;
}
