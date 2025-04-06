// /eslint.config.mjs
/*Bu dosya, Next.js ve TypeScript projelerinde kullanılan ESLint yapılandırmasını eslint.config.mjs üzerinden tanımlar; 
@eslint/eslintrc kütüphanesinin FlatCompat özelliğini kullanarak klasik ESLint yapılandırmasını Flat config sistemine 
dönüştürür, next/core-web-vitals ve next/typescript kurallarını uygular, ayrıca kullanılmayan değişkenler için 
uyarı (warn) verir ve _ ile başlayan parametrelerin ve değişkenlerin uyarıdan muaf tutulmasını sağlar.*/
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
