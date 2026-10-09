import { CheckoutView, checkoutMeta } from "@/views/checkout";

export const metadata = checkoutMeta("en");
export default function Page() {
  return <CheckoutView lang="en" />;
}
