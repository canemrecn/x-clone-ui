//src/app/@modal/default.tsx
//Bu dosya, modal sistemi için varsayılan (boş) içerik bileşenini tanımlar; herhangi bir özel 
//modal aktif değilse devreye girer ve null döndürerek ekranda hiçbir şey render etmez. Böylece 
//modal yapısında gereksiz içerik gösterimi engellenmiş olur.

/**
 * Bu bileşen, varsayılan modal içeriğini temsil eder.
 * Eğer belirli bir modal gösterilmek istenmiyorsa, bu bileşen hiçbir içerik render etmez.
 */
export default function Default() {
    return null;
  }
  