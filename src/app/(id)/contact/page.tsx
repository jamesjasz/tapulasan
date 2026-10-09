import { ContactView, contactMeta } from "@/views/contact";

export const metadata = contactMeta("id");
export default function Page() {
  return <ContactView lang="id" />;
}
