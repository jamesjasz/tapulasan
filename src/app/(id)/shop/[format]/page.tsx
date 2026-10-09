import { ProductView, productMeta, productParams } from "@/views/product";

type Props = { params: Promise<{ format: string }> };
export const dynamicParams = false;
export const generateStaticParams = productParams;
export const generateMetadata = async ({ params }: Props) => productMeta("id", (await params).format);
export default async function Page({ params }: Props) {
  return <ProductView lang="id" format={(await params).format} />;
}
