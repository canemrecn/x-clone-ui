import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import Link from "next/link";
import { analyzeTextErrors } from "@/lib/analyzeTextErrors";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 max-w-3xl mx-auto py-10 px-6 text-white rounded-xl shadow-lg pt-24 pb-20">
      <form action={handleDelete} className="flex items-center gap-4 mb-6">
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Günlüğü Sil
        </button>
        <Link
          href="/daily"
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Geri Dön
        </Link>
      </form>

      <h1 className="text-3xl font-bold mb-2">Günlük</h1>

      <p className="text-sm text-gray-400 mb-1">
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

      <div className="bg-gray-800 p-5 rounded-xl whitespace-pre-line mb-6 break-words overflow-x-auto border border-gray-700">
        {result.details.map((sentence, i) => (
          <div
            key={i}
            className={sentence.sentenceErrors > 0 ? "bg-yellow-800/40 px-2 py-1 rounded mb-2" : ""}
          >
            {sentence.analyzedWords.map((word, j) => (
              <span
                key={j}
                className={`inline-block px-3 py-0.5 rounded mr-1 mb-1 relative group cursor-help transition ${
                  word.isWrong ? "bg-red-600 text-white" : "text-white"
                }`}
              >
                {word.original}
                {word.isWrong && word.suggestion && (
                  <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg mt-1 min-w-max whitespace-nowrap">
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
