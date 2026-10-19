import { AboutView, aboutMeta } from "@/views/about";

export const metadata = aboutMeta("en");
export default function Page() {
  return <AboutView lang="en" />;
}
