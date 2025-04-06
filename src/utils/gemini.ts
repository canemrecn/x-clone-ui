// src/utils/gemini.ts
/*Bu dosya, verilen bir mesajı /api/gemini endpoint'ine POST isteğiyle göndererek Gemini yapay zeka modelinden 
yanıt almak için kullanılan chatWithGemini adlı asenkron bir fonksiyon tanımlar; API'den gelen cevabı JSON 
formatında işleyip metin (text) olarak döndürür, hata durumlarında ise kullanıcıya varsayılan bir hata mesajı verir.*/
// src/utils/gemini.ts
export const chatWithGemini = async (message: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data?.text || "No response from Gemini.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "An error occurred.";
  }
};
