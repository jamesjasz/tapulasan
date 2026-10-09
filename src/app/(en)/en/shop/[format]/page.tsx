import { ProductView, productMeta, productParams } from "@/views/product";

type Props = { params: Promise<{ format: string }> };
export const dynamicParams = false;
export const generateStaticParams = productParams;
export const generateMetadata = async ({ params }: Props) => productMeta("en", (await params).format);
export default async function Page({ params }: Props) {
  return <ProductView lang="en" format={(await params).format} />;
}
