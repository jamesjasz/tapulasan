import { ShopView, shopMeta } from "@/views/shop";

export const metadata = shopMeta("en");
export default function Page() {
  return <ShopView lang="en" />;
}
