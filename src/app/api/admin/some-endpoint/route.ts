// src/app/api/admin/some-endpoint/route.ts
/* Bu endpoint, sadece admin kullanıcıların erişebileceği örnek bir API'dir.
Admin olmayanlar 403 Forbidden hatası alır. */

import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils/getAuthUser";

export const POST = async (req: Request) => {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Admin işlemleri burada yapılır (örnek response)
    return NextResponse.json({ message: "Admin işlemi başarıyla gerçekleştirildi" });
  } catch (error) {
    console.error("Admin endpoint hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
};

export const GET = POST;
export const PUT = POST;
export const DELETE = POST;
