// src/index.ts
export default {
    async fetch(request: Request): Promise<Response> {
      if (request.method === "POST" && new URL(request.url).pathname === "/check-image") {
        try {
          const { imageUrl } = await request.json();
  
          if (!imageUrl) {
            return new Response(JSON.stringify({ error: "imageUrl is required" }), { status: 400 });
          }
  
          // Sightengine bilgilerin, .env dosyasından alınıyor
          const apiUser = process.env.S_API_USER; // ✅ .env dosyasındaki user ID'yi kullan
          const apiSecret = process.env.S_API_SECRET; // ✅ .env dosyasındaki secret'ı kullan
  
          if (!apiUser || !apiSecret) {
            return new Response(JSON.stringify({ error: "API credentials missing" }), { status: 500 });
          }
  
          const moderationRes = await fetch(
            `https://api.sightengine.com/1.0/check.json?models=nudity-2.1,weapon,recreational_drug,offensive-2.0,gore-2.0,violence&url=${encodeURIComponent(
              imageUrl
            )}&api_user=${apiUser}&api_secret=${apiSecret}`
          );
  
          const result = await moderationRes.json();
  
          // Uygunsuzluk kontrolü
          const isUnsafe =
            result.nudity?.raw > 0.7 ||
            result.weapon?.prob > 0.7 ||
            result.recreational_drug?.prob > 0.7 ||
            result.gore?.prob > 0.7 ||
            result.violence?.prob > 0.7 ||
            result.offensive?.prob > 0.7;
  
          return new Response(
            JSON.stringify({
              safe: !isUnsafe,
              reason: isUnsafe ? "Inappropriate content detected" : null,
              details: result,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (err: any) {
          return new Response(JSON.stringify({ error: "Server error", detail: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
  
      return new Response("OK - Use POST /check-image", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    },
  };
  