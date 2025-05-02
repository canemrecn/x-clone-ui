// 📁 src/app/[username]/[postId]/page.tsx

import TermsOfService from "@/policies/terms-of-service";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) {
  const { username, postId } = await params;

  // İsteğe bağlı: username ya da postId ile bir işlem yapılacaksa burada yapabilirsin.

  return <TermsOfService />;
}
