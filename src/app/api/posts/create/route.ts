//src/app/api/posts/create/route.ts
/*Bu dosya, kullanıcıların yeni bir gönderi (metin, medya veya her ikisi) oluşturmasını
sağlayan bir API endpoint’idir. JWT token ile kullanıcının kimliği doğrulandıktan sonra,
gelen içerik, medya bilgileri, dil ve kategori bilgileriyle birlikte posts tablosuna güvenli 
bir şekilde kaydedilir. İçerik metni yoksa varsayılan olarak “[Medya gönderisi]” atanır. 
Gönderi başarıyla oluşturulursa 201 yanıtı döner, aksi halde hata mesajı ile 500 döner.*/
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

// Uygunsuz içerik kontrol listesi
const forbiddenWords = [
  // Küfür - ağır argolar
  "orospu", "orospu çocuğu", "piç", "şerefsiz", "kahpe", "pezevenk", "yarrak", "am", "amcık",
  "göt", "ananı", "sikeyim", "siktir", "kaltak", "ibne", "top", "kaşar", "dingil",

  // Küfür sayılabilecek aşağılayıcı kelimeler
  "aptal", "salak", "gerizekalı", "geri zekalı", "mal", "beyinsiz", "dangalak", "embesil",
  "iğrençsin", "moron", "ezik", "şapşal", "aptalsın", "hayvan", "öküz", "ahmak", "deli", "enayi",

  // Tehdit ve tehdit çağrışımı yapan ifadeler
  "öldür", "öldüreceğim", "seni öldürürüm", "gebertirim", "seni geberteceğim", "vururum",
  "sana zarar vereceğim", "keserim", "boğarım", "yakarım", "kan kustururum", "intikam alacağım",
  "kan akacak", "yok edeceğim", "öldürmeye geldim", "ezip geçerim", "nefesini keseceğim", "kanını akıtacağım",

  // Fiziksel şiddet içeren veya çağrıştıran kelimeler
  "şiddet", "darp", "dayak", "sopa", "tokat", "yumruk", "tekme", "bıçak", "bıçaklarım",
  "vur", "vururum", "sopa çekerim", "kafa atarım", "tekme atarım", "öldürme", "vuracağım",
  "boğazlarım", "süründürürüm", "intikam", "savaş açarım", "işkence", "acı çektiririm", "kan",

  // Silah, ölüm ve çatışma çağrışımlı kelimeler
  "silah", "kurşun", "tüfek", "tabanca", "pompalı", "infaz", "katliam", "cinayet", "cellat", "kurşunlar",
  "öldürül", "katlederim", "vururum", "öldürürüm", "sıkarım", "kanlı", "kurşun yağdırırım", "vururum kafana",

  // Terör ve organize şiddet çağrışımlı kelimeler
  "terör", "terörist", "bombacı", "bombala", "patlat", "el bombası", "örgüt", "militan", "isyan",
  "sabotaj", "silahlı saldırı", "çatışma", "pusu", "intihar saldırısı", "kanlı eylem", "saldır", "ajan",
  "suikast", "isyancı", "örgütçü", "kanlı baskın", "kelle kesmek", "devrimci saldırı", "molotof", "baskın",

    // Strong profanity & vulgarities
    "fuck", "fucking", "motherfucker", "bastard", "bitch", "asshole", "shit", "bullshit", "dick", "pussy",
    "cunt", "cock", "slut", "whore", "fag", "faggot", "jerk", "retard", "twat", "douche", "prick", "screw you",
  
    // Insults & degrading language
    "idiot", "moron", "stupid", "dumb", "loser", "worthless", "ugly", "freak", "fatass", "retarded", "scumbag",
    "brain-dead", "psycho", "crazy", "nutjob", "degenerate", "sicko", "pathetic", "coward", "piece of shit",
  
    // Threats & violent intent
    "kill you", "i will kill you", "die", "i’ll hurt you", "i will hurt you", "i’ll beat you", "beat you up",
    "break your neck", "smash your face", "i’ll cut you", "stab you", "shoot you", "i will shoot", "blow your head",
    "choke you", "strangle you", "punch you", "kick your ass", "hurt you", "rip you apart", "i’ll find you",
  
    // Violence, murder, torture, brutality
    "murder", "assault", "rape", "execution", "blood", "torture", "slaughter", "butcher", "lynch", "massacre",
    "abuse", "molest", "knife attack", "bloody", "killshot", "kill", "gun", "knife", "beatdown", "headshot",
  
    // Terrorism, weapons, organized violence
    "terrorist", "terrorism", "suicide bomber", "jihad", "isis", "al-qaeda", "explosion", "bomb", "detonate",
    "mass shooting", "hostage", "sniper", "mass attack", "militant", "extremist", "radicalize", "execute bomb",
    "shootout", "gunfire", "machine gun", "assault rifle", "militia", "attack the government", "armed attack",
    "execute", "behead", "riot", "uprising", "kill civilians",

      // Injures et grossièretés fortes
  "putain", "salope", "connard", "connasse", "enculé", "merde", "bordel", "nique", "ta mère", 
  "fils de pute", "enculeur", "bite", "couilles", "chatte", "branleur", "enfoiré", "chiant", 
  "trou du cul", "salaud", "gros con", "va te faire foutre", "débile", "imbécile", "taré",

  // Menaces et expressions agressives
  "je vais te tuer", "je vais te buter", "tu vas mourir", "je vais t’éclater", "je vais t’écraser",
  "je vais te frapper", "je vais te casser la gueule", "je vais te baiser", "je vais t’exploser",
  "je vais t’étrangler", "je vais te découper", "je vais te trouer", "tu es mort", "je vais te flinguer",

  // Violence et agressions
  "meurtre", "tuer", "violence", "massacre", "assassinat", "coups", "bagarre", "baston", 
  "coup de couteau", "coup de feu", "sang", "déchiqueter", "écrabouiller", "égorger", "démolir",
  "frapper", "buter", "lyncher", "empoisonner", "torturer", "étrangler", "exécuter", "abattre",

  // Terrorisme, armes, guerre
  "terroriste", "terrorisme", "djihad", "bombe", "exploser", "fusil", "kalachnikov", "prise d’otage",
  "attentat", "attentat suicide", "mitraillette", "arme", "guerre", "milice", "attaque armée",
  "insurrection", "émeute", "tuerie", "radical", "exécuter", "islamiste", "cellule terroriste", 
  "tuer des civils",

  // Volgarità e insulti gravi
  "vaffanculo", "cazzo", "stronzo", "stronza", "bastardo", "bastarda", "figlio di puttana", "puttana",
  "merda", "culo", "troia", "minchia", "zoccola", "rompicoglioni", "pezzo di merda", "coglione",
  "deficiente", "cretino", "imbecille", "idiota", "testa di cazzo", "fottiti", "maledetto",

  // Minacce e frasi aggressive
  "ti ammazzo", "ti uccido", "ti faccio fuori", "ti spacco la faccia", "ti rompo il collo",
  "ti distruggo", "ti taglio", "ti sparo", "muori", "sei morto", "ti strozzo", "ti faccio del male",
  "ti faccio a pezzi", "ti faccio sanguinare", "faccio una strage", "faccio un massacro",

  // Violenza fisica / aggressioni
  "uccidere", "assassinio", "omicidio", "massacro", "violenza", "pugni", "calci", "sparare", 
  "sparo", "tagliare", "colpire", "bruciare", "bastonare", "arma", "sangue", "coltellata", 
  "tortura", "decapitare", "soffocare", "stupro", "distruggere", "ferire", "attacco", "bombardare",

  // Terrorismo e conflitti armati
  "terrorista", "terrorismo", "attentato", "attacco armato", "attentatore", "bomba", "esplodere",
  "mitragliatrice", "kalashnikov", "cellula terroristica", "giustiziare", "jihad", "radicalizzato",
  "militante", "attacco suicida", "uccidere civili", "guerriglia", "ribellione", "sparatoria",
  "colpo di stato", "rapimento",
  
   // Insultos y vulgaridades graves
   "puta", "puto", "gilipollas", "cabron", "cabrona", "coño", "mierda", "joder", "pendejo", "pendeja",
   "hijo de puta", "chingada", "chingar", "pelotudo", "boludo", "imbécil", "idiota", "estúpido",
   "malparido", "carajo", "culero", "zorra", "maricón", "mamón", "pajero", "tonto", "lameculos",
 
   // Amenazas verbales directas o agresivas
   "te voy a matar", "te mataré", "te voy a romper la cara", "te voy a golpear", 
   "te voy a hacer daño", "te voy a joder", "te voy a partir en dos", "vas a morir",
   "te destrozo", "te reviento", "te rajo", "te clavo", "te quemo", "te ahorco", "te disparo",
 
   // Violencia y agresiones físicas
   "matar", "asesinar", "violencia", "golpear", "pegar", "puñetazo", "patada", "navajazo",
   "apuñalar", "disparar", "tiroteo", "sangre", "degollar", "ahorcar", "linchar", "torturar",
   "agredir", "atacar", "romper huesos", "desmembrar", "estrangular", "ejecutar",
 
   // Terrorismo y violencia organizada
   "terrorismo", "terrorista", "bomba", "explosivo", "atentado", "bomba suicida", "jihadista",
   "radical", "militante", "grupo armado", "celula terrorista", "ataque armado", "tiroteo masivo",
   "secuestro", "rehenes", "guerrilla", "asesinato masivo", "coche bomba", "rebelión", "masacre",
   "extremista", "ametralladora", "kalashnikov", "ejecución pública"
];


function detectInappropriate(text: string): string | null {
  const lower = text.toLowerCase();
  return forbiddenWords.find((w) => lower.includes(w)) || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, media_url, media_type, isReel, lang, category_id } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || (!content && !media_url)) {
      return NextResponse.json({ message: "Text or media required" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret) as { id: number };
    const user_id = decoded.id;
    const postLang = lang?.toString().trim() || "en";
    const categoryId = Number(category_id) || 1;
    const title = "Gönderiyi Göster";

    // AI filtresi ile içerik kontrolü
    const matched = detectInappropriate(content || "") || detectInappropriate(media_url || "");
    if (matched) {
      // Uygunsuz içerik bulunduran gönderi admin onayı bekleyecek şekilde kaydedilir
      const [result] = await db.query(
        `INSERT INTO pending_posts (user_id, content, media_url, media_type, is_reel, lang, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user_id,
          content || "[Medya gönderisi]",
          media_url,
          media_type,
          isReel,
          postLang,
        ]
      );

      // Kullanıcıya uyarı verilir
      await db.query(
        `INSERT INTO user_warnings (user_id, reason, triggered_by, severity)
         VALUES (?, ?, 'ai', 'high')`,
        [user_id, `Uygunsuz içerik algılandı: ${matched}`]
      );

      return NextResponse.json(
        { message: "Gönderi AI filtresine takıldı, admin onayı bekliyor." },
        { status: 202 }
      );
    }

    // Uygun içerikse doğrudan gönderi olarak eklenir
    const [result] = await db.query(
      `INSERT INTO posts (user_id, category_id, title, content, media_url, media_type, is_reel, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        categoryId,
        title,
        content || "[Medya gönderisi]",
        media_url,
        media_type,
        isReel,
        postLang,
      ]
    );

    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        "post_created",
        `Post ID: ${(result as any).insertId}`,
        request.headers.get("x-forwarded-for") || "localhost",
        request.headers.get("user-agent") || "unknown",
      ]
    );

    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("🚨 Database error:", error);
    return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
  }
}
