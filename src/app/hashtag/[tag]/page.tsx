// app/hashtag/[tag]/page.tsx
import Feed from "@/components/Feed";

async function getPostsByTag(tag: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hashtag/${tag}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.posts;
}

export default async function HashtagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">#{tag} etiketiyle paylaşılanlar</h1>
      <Feed posts={posts} />
    </div>
  );
}
