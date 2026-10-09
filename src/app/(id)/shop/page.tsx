import { ShopView, shopMeta } from "@/views/shop";

export const metadata = shopMeta("id");
export default function Page() {
  return <ShopView lang="id" />;
}
