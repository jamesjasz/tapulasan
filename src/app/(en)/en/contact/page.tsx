import { ContactView, contactMeta } from "@/views/contact";

export const metadata = contactMeta("en");
export default function Page() {
  return <ContactView lang="en" />;
}
