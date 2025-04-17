// 📁 src/app/daily/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import Link from "next/link";
import { analyzeTextErrors } from "@/lib/analyzeTextErrors";

export async function generateStaticParams() {
  const [rows] = await db.query<RowDataPacket[]>("SELECT id FROM daily_notes");
  return (rows as { id: number }[]).map((row) => ({ id: row.id.toString() }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  if (!id) return notFound();

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT content, created_at, error_rate, lang FROM daily_notes WHERE id = ?",
    [id]
  );

  const note = rows[0] as {
    content: string;
    created_at: string;
    error_rate: number;
    lang: string;
  } | undefined;

  if (!note) return notFound();

  const result = await analyzeTextErrors(note.content, note.lang);

  async function handleDelete() {
    "use server";
    await db.query("DELETE FROM daily_notes WHERE id = ?", [id]);
    redirect("/daily");
  }

  return (
    <div className="bg-gray-800 max-w-2xl mx-auto py-10 px-4 text-white">
            <form action={handleDelete}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-4"
        >
          Günlüğü Sil
        </button>
        <Link
          href="/daily"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Geri Dön
        </Link>
      </form>
      <h1 className="text-2xl font-bold mb-4">Günlük</h1>
      <p className="text-sm text-gray-400 mb-2">
        {new Date(note.created_at).toLocaleString("tr-TR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <p className="text-sm text-yellow-300 mb-4">
        Dil: <strong>{note.lang.toUpperCase()}</strong> | Hata Oranı:{" "}
        <strong>%{(note.error_rate * 100).toFixed(1)}</strong>
      </p>
      <div className="bg-gray-700 p-4 rounded whitespace-pre-line mb-6 break-words overflow-x-hidden">
        {result.details.map((sentence, i) => (
          <div
            key={i}
            className={
              sentence.sentenceErrors > 0
                ? "bg-yellow-800/50 px-2 py-1 rounded mb-2"
                : ""
            }
          >
            {sentence.analyzedWords.map((word, j) => (
              <span
                key={j}
                className={`inline-block px-1 rounded mr-1 relative group cursor-help ${
                  word.isWrong ? "bg-red-500 text-white" : "text-white"
                }`}
              >
                {word.original}
                {word.isWrong && word.suggestion && (
                  <div className="absolute z-10 top-full left-0 bg-black text-white text-xs px-2 py-1 rounded shadow-md mt-1 hidden group-hover:block">
                    Doğrusu: {word.suggestion}
                  </div>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
