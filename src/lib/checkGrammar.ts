export function checkGrammar(selected: string[]): string | null {
    const [subject, verb] = selected;
  
    const thirdPerson = ["He", "She", "It"];
    const others = ["I", "You", "We", "They"];
  
    if (!subject || !verb) return null;
  
    const verbEndsWithS = verb.endsWith("s");
  
    if (thirdPerson.includes(subject) && !verbEndsWithS) {
      return `❌ "${subject} ${verb}" → "${verb}s" olması gerek.`;
    }
  
    if (others.includes(subject) && verbEndsWithS && !["is"].includes(verb)) {
      return `❌ "${subject} ${verb}" → "${verb.replace(/s$/, "")}" olması gerek.`;
    }
  
    return null;
  }
  