// src/app/admin/archive/page.tsx
"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ArchivePage() {
  const [archivedPosts, setArchivedPosts] = useState<any[]>([]);
  const [archivedComments, setArchivedComments] = useState<any[]>([]);
  const [archivedUsers, setArchivedUsers] = useState<any[]>([]);

  const [postSearchId, setPostSearchId] = useState("");
  const [foundPost, setFoundPost] = useState<any | null>(null);

  const [commentSearchId, setCommentSearchId] = useState("");
  const [foundComment, setFoundComment] = useState<any | null>(null);

  const [userSearchId, setUserSearchId] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchArchivedData() {
      try {
        const resPosts = await fetch("/api/admin/archived-posts");
        const dataPosts = await resPosts.json();
        setArchivedPosts(dataPosts || []);

        const resComments = await fetch("/api/admin/archived-comments");
        const dataComments = await resComments.json();
        setArchivedComments(dataComments || []);

        const resUsers = await fetch("/api/admin/archived-users");
        const dataUsers = await resUsers.json();
        setArchivedUsers(dataUsers || []);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    }

    fetchArchivedData();
  }, []);

  const handlePostSearch = () => {
    const found = archivedPosts.find((post) => post.id.toString() === postSearchId.trim());
    setFoundPost(found || null);
  };

  const handleCommentSearch = () => {
    const found = archivedComments.find((comment) => comment.id.toString() === commentSearchId.trim());
    setFoundComment(found || null);
  };

  const handleUserSearch = () => {
    const found = archivedUsers.find((user) => user.id.toString() === userSearchId.trim());
    setFoundUser(found || null);
  };

  const getUserById = (id: number) => archivedUsers.find((u) => u.id === id);

  const downloadPDF = (type: "post" | "comment" | "user") => {
    const doc = new jsPDF();
    let title = "";
    let body: any[][] = [];

    if (type === "post" && foundPost) {
      title = "UNDERGO Silinen Gönderi";
      const user = getUserById(foundPost.user_id);
      body = [
        ["KULLANICI ID", foundPost.user_id],
        ["GONDERI ID", foundPost.id],
        ["BASLIK", foundPost.title],
        ["ICERIK", foundPost.content],
        ["SILINME TARIHI", foundPost.deleted_at],
      ];
    }

    if (type === "comment" && foundComment) {
      title = "UNDERGO Silinen Yorum";
      const user = getUserById(foundComment.user_id);
      body = [
        ["KULLANICI ID", foundComment.user_id],
        ["YORUM ID", foundComment.id],
        ["YORUM", foundComment.text],
        ["SILINME TARIHI", foundComment.deleted_at],
      ];
    }

    if (type === "user" && foundUser) {
      title = "UNDERGO Silinen Kullanıcı";
      body = [
        ["ID", foundUser.id],
        ["E-MAIL", foundUser.email],
        ["SILINME TARIHI", foundUser.deleted_at]
      ];
    }

    doc.text(title, 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["ALAN", "DEGER"]],
      body: body,
    });
    doc.save(`${title}.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Arşiv Verileri</h1>

      {/* Gönderi Arama */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Silinen Gönderiler</h2>
        <input
          value={postSearchId}
          onChange={(e) => setPostSearchId(e.target.value)}
          placeholder="Gönderi ID gir"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handlePostSearch} className="bg-blue-600 text-white px-3 py-2 rounded mr-2">
          Göster
        </button>
        {foundPost && (
          <>
            <div className="mt-4 p-4 bg-gray-100 rounded text-black">
            <p><strong>Kullanıcı ID:</strong> {foundPost.user_id}</p>
              <p><strong>Gönderi ID:</strong> {foundPost.id}</p>
              <p><strong>Başlık:</strong> {foundPost.title}</p>
              <p><strong>İçerik:</strong> {foundPost.content}</p>
              <p><strong>Silinme Tarihi:</strong> {foundPost.deleted_at}</p>
            </div>
            <button onClick={() => downloadPDF("post")} className="mt-2 bg-green-600 text-white px-3 py-2 rounded">
              PDF İndir
            </button>
          </>
        )}
      </div>

      {/* Yorum Arama */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Silinen Yorumlar</h2>
        <input
          value={commentSearchId}
          onChange={(e) => setCommentSearchId(e.target.value)}
          placeholder="Yorum ID gir"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleCommentSearch} className="bg-blue-600 text-white px-3 py-2 rounded mr-2">
          Göster
        </button>
        {foundComment && (
          <>
            <div className="mt-4 p-4 bg-gray-100 rounded text-black">
            <p><strong>Kullanıcı ID:</strong> {foundComment.user_id}</p>
              <p><strong>ID:</strong> {foundComment.id}</p>
              <p><strong>Yorum:</strong> {foundComment.text}</p>
              <p><strong>Silinme Tarihi:</strong> {foundComment.deleted_at}</p>           
            </div>
            <button onClick={() => downloadPDF("comment")} className="mt-2 bg-green-600 text-white px-3 py-2 rounded">
              PDF İndir
            </button>
          </>
        )}
      </div>

      {/* Kullanıcı Arama */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Silinen Kullanıcılar</h2>
        <input
          value={userSearchId}
          onChange={(e) => setUserSearchId(e.target.value)}
          placeholder="Kullanıcı ID gir"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleUserSearch} className="bg-blue-600 text-white px-3 py-2 rounded mr-2">
          Göster
        </button>
        {foundUser && (
          <>
            <div className="mt-4 p-4 bg-gray-100 rounded text-black">
              <p><strong>ID:</strong> {foundUser.id}</p>
              <p><strong>Email:</strong> {foundUser.email}</p>
              <p><strong>Silinme Tarihi:</strong> {foundUser.deleted_at}</p>
            </div>
            <button onClick={() => downloadPDF("user")} className="mt-2 bg-green-600 text-white px-3 py-2 rounded">
              PDF İndir
            </button>
          </>
        )}
      </div>
    </div>
  );
}
