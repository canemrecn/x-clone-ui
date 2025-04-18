import PrivacyPolicy from "@/policies/privacy-policy";

export default async function Page({ params }: { params: { username: string; postId: string } }) {
  return <PrivacyPolicy />;
}
