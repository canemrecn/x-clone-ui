// src/lib/db.ts
/*Bu dosya, MySQL veritabanına bağlanmak için mysql2/promise kütüphanesini kullanarak bir bağlantı havuzu 
(connection pool) oluşturur. Ortam değişkenlerinden (DB_HOST, DB_USER, DB_PASS, DB_NAME) aldığı bilgilerle 
veritabanı yapılandırmasını sağlar ve aynı anda birden fazla bağlantıyı yönetebilmek için waitForConnections, 
connectionLimit ve queueLimit gibi ayarları içerir. Bu yapı, uygulamanın her yerinden veritabanı sorguları 
çalıştırmak için yeniden kullanılabilir bir db nesnesi sunar.*/
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,       
  password: process.env.DB_PASS,   
  database: process.env.DB_NAME,   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
