//src/app/api/posts/media/route.ts
console.log("privateKey =>", process.env.IMAGEKIT_PRIVATE_KEY);
console.log("publicKey =>", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);

import { NextResponse } from "next/server";
import { serverImageKit } from "@/utils/server"; // Yukarıdaki tanım yaptığınız yerden import

export async function GET(req: Request) {
  try {
    // Örnek sabit fileId
    const fileDetails = await serverImageKit.getFileDetails("67cb5124432c4764169ee70c");
    return NextResponse.json(fileDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}


