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
