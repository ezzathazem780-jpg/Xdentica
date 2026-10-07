CREATE TABLE IF NOT EXISTS patients(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,phone TEXT UNIQUE NOT NULL,email TEXT DEFAULT '',notes TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS doctors(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,specialty TEXT DEFAULT '',phone TEXT DEFAULT '',active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,description TEXT DEFAULT '',price REAL DEFAULT 0,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS appointments(id INTEGER PRIMARY KEY AUTOINCREMENT,patient_id INTEGER NOT NULL,doctor_id INTEGER,service_id INTEGER,appointment_date TEXT NOT NULL,notes TEXT DEFAULT '',status TEXT DEFAULT 'pending',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,admin_email TEXT NOT NULL,expires_at INTEGER NOT NULL);
INSERT OR IGNORE INTO services(id,name,description,price) VALUES(1,'فحص وتشخيص','فحص شامل',0),(2,'تبييض الأسنان','تبييض احترافي',0),(3,'تنظيف وعلاج اللثة','تنظيف وعناية',0),(4,'تقويم الأسنان','استشارة تقويم',0),(5,'زراعة الأسنان','استشارة زراعة',0);
INSERT OR IGNORE INTO settings(key,value) VALUES('clinic_name','DENTICA'),('phone',''),('whatsapp',''),('address',''),('about','عيادة طب وتجميل الأسنان');
