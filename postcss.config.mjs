// /postcss.config.mjs
/*Bu dosya, PostCSS yapılandırmasını tanımlar ve Tailwind CSS'in PostCSS eklentisi olarak kullanılmasını 
sağlar; böylece projede Tailwind sınıflarının derlenmesi ve stillerin işlenmesi mümkün olur.*/
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
