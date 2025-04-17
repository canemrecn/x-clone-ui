export async function getWords({ step, prev }: { step: string; prev: string }) {
    const endpoint = "https://api.datamuse.com/words";
    let url = "";
  
    // 1. Subject → Verb (elle tanımlanır)
    if (step === "Verb") {
      const verbMap: Record<string, string[]> = {
        I: ["eat", "play", "write", "read", "watch"],
        You: ["eat", "play", "write", "read", "watch"],
        He: ["eats", "plays", "writes", "reads", "watches"],
        She: ["eats", "plays", "writes", "reads", "watches"],
        It: ["eats", "writes", "runs"],
        We: ["eat", "play", "write"],
        They: ["eat", "play", "read"],
      };
  
      return verbMap[prev] || ["eat", "play", "read"];
    }
  
    // 2. Verb → Object (Datamuse + noun filtreleme)
    if (step === "Object") {
      url = `${endpoint}?rel_trg=${prev}&topics=object&md=p&max=20`;
  
      const res = await fetch(url);
      const data = await res.json();
  
      const filtered = data.filter((item: any) => item.tags?.includes("n")); // noun
  
      // Eğer hiç noun bulunamazsa fallback
      if (filtered.length === 0) {
        return ["a book", "music", "a ball", "the piano"];
      }
  
      return filtered.map((item: any) => item.word);
    }
  
    // 3. Object → Manner (adverb filtreleme)
    if (step === "Manner") {
      url = `${endpoint}?rel_adv=${prev}&md=p&max=15`;
  
      const res = await fetch(url);
      const data = await res.json();
  
      const filtered = data.filter((item: any) => item.tags?.includes("adv")); // adverb
  
      if (filtered.length === 0) {
        return ["quickly", "slowly", "silently", "gracefully"];
      }
  
      return filtered.map((item: any) => item.word);
    }
  
    // 4. Place & Time sabit kalabilir (ya da geliştirilebilir)
    return [];
  }
  