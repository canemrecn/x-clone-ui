export async function evaluateSentence(sentence: string): Promise<string> {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });
  
    const data = await res.json();
    return data.result;
  }
  