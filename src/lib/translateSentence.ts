export function translateSentence(words: string[]): string {
    if (words.length < 2) return "Eksik cümle";
  
    const [subject, verb, object, manner, place, time] = words;
  
    const subjectMap: Record<string, string> = {
      I: "Ben", You: "Sen", He: "O", She: "O", It: "O", We: "Biz", They: "Onlar",
    };
  
    const verbMap: Record<string, string> = {
      eat: "yedi", eats: "yedi", play: "oynadı", plays: "oynadı",
      write: "yazdı", writes: "yazdı", read: "okudu", reads: "okudu"
    };
  
    const objectMap: Record<string, string> = {
      "a sandwich": "bir sandviç", "a book": "bir kitap", "music": "müzik",
      "a ball": "bir top", "the piano": "piyano", "soup": "çorba", "a letter": "bir mektup"
    };
  
    const mannerMap: Record<string, string> = {
      quickly: "hızlıca", slowly: "yavaşça", silently: "sessizce", gracefully: "zarifçe"
    };
  
    const placeMap: Record<string, string> = {
      "at home": "evde", "in the park": "parkta", "at school": "okulda"
    };
  
    const timeMap: Record<string, string> = {
      "this morning": "bu sabah", "every day": "her gün", "at night": "gece", "yesterday": "dün"
    };
  
    const trSubject = subjectMap[subject] || subject;
    const trVerb = verbMap[verb] || verb;
    const trObject = objectMap[object] || object;
    const trManner = mannerMap[manner] || "";
    const trPlace = placeMap[place] || "";
    const trTime = timeMap[time] || "";
  
    return `${trSubject} ${trTime} ${trPlace} ${trObject} ${trManner} ${trVerb}`
      .replace(/\s+/g, " ")
      .trim();
  }
  