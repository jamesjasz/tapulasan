import { HowView, howMeta } from "@/views/how";

export const metadata = howMeta("en");
export default function Page() {
  return <HowView lang="en" />;
}
