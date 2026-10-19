import { AboutView, aboutMeta } from "@/views/about";

export const metadata = aboutMeta("id");
export default function Page() {
  return <AboutView lang="id" />;
}
