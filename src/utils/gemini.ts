// src/utils/gemini.ts
export const chatWithGemini = async (message: string) => {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data?.text || "No response from Gemini.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "An error occurred.";
    }
  };
  
