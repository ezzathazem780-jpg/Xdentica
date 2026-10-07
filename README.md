# DENTICA V15 — TRUE FULL CONTROL

نسخة DENTICA محدثة مرتبطة مباشرة بقاعدة Cloudflare D1 الموجودة لدى العميل.

## ما تم إصلاحه
- D1 database_id مضبوط على قاعدة DENTICA الحالية.
- API Worker كامل مع حماية Bearer Token للجلسات.
- دخول الأدمن عبر Cloudflare Secrets بدل تخزين كلمة المرور في D1.
- إدارة المرضى: إضافة/تعديل/حذف.
- إدارة الأطباء: إضافة/تعديل/حذف.
- إدارة الخدمات: إضافة/تعديل/حذف.
- إدارة المواعيد: إضافة/تعديل/حذف.
- إعدادات العيادة: تعديل.
- Dashboard.
- حجز المريض ينشئ المريض تلقائياً إذا كان رقم الهاتف غير موجود.
- زر الرجوع في Android.
- Android Admin CRUD UI حقيقي، وليس أزراراً تجريبية.

## Cloudflare D1
قاعدة D1 المربوطة في `worker/wrangler.toml`:
`e059623a-4834-41e8-86c8-4a6a653d03ba`

نفذ schema مرة واحدة:
```bash
cd worker
npx wrangler d1 execute dentica-db --remote --file=schema.sql
```

## Cloudflare Secrets
قبل النشر اضبط بيانات الأدمن:
```bash
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
```
ثم:
```bash
npx wrangler deploy
```

لا تضع كلمة مرور الأدمن داخل GitHub أو الكود.

## Android API URL
بعد نشر Worker، غيّر `API_BASE_URL` في:
`android/app/build.gradle`
إلى رابط Worker الحقيقي، ثم ارفع المشروع إلى GitHub لتشغيل GitHub Actions.

## ملاحظة البناء
الملفات تم فحصها نحويًا وملف ZIP تم التحقق من سلامته. بناء Android الكامل يحتاج Android SDK/Gradle في بيئة البناء، ويمكن لـ GitHub Actions تنفيذ ذلك تلقائياً.
