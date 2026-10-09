import { CheckoutView, checkoutMeta } from "@/views/checkout";

export const metadata = checkoutMeta("id");
export default function Page() {
  return <CheckoutView lang="id" />;
}
