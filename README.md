# برنامه هفتگی (PWA)

اپ مدیریت کارهای روزانه با تاریخ جلالی، فونت وزیرمتن و قابل نصب روی آیفون. بدون بیلد؛ فقط فایل‌های ثابت.

## ساختار
- `index.html`، `style.css`، `app.js` — خود اپ
- `manifest.webmanifest`، `sw.js` — نصب‌پذیری و کار آفلاین
- `icons/` — آیکون‌ها (با `python3 make_icons.py` دوباره ساخته می‌شوند)
- `vercel.json` — تنظیمات Vercel

## اجرا محلی
```bash
npx serve .
```

## گیت‌هاب و Vercel
```bash
git init && git add . && git commit -m "task manager pwa"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```
در Vercel: **Add New → Project** → ریپو را انتخاب کن → Framework Preset: **Other** → Deploy.

## نصب روی آیفون
آدرس Vercel را در **Safari** باز کن ← دکمه اشتراک‌گذاری ← **Add to Home Screen**.

## نکته فونت
فونت وزیرمتن از CDN (jsdelivr) لود می‌شود و بعد از اولین بار توسط سرویس‌ورکر کش می‌شود. اگر خواستی کاملاً خودمیزبان باشد:
`npm i vazirmatn` و فایل `Vazirmatn[wght].woff2` را در `fonts/` بگذار و در `style.css` یک `@font-face` اضافه کن.

## داده‌ها
تسک‌ها در `localStorage` همان دستگاه ذخیره می‌شوند (بدون سرور).
