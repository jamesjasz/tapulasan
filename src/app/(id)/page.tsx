import { HomeView, homeMeta } from "@/views/home";

export const metadata = homeMeta("id");
export default function Page() {
  return <HomeView lang="id" />;
}
