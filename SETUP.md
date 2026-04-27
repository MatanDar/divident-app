# DIVIDENT App – הוראות הקמה

## שלב 1 – Firebase

1. לך ל-[https://console.firebase.google.com](https://console.firebase.google.com)
2. צור פרויקט חדש: **divident-app**
3. הפעל **Authentication** → Sign-in method → **Email/Password**
4. הוסף משתמש: Authentication → Users → Add user  
   - Email: `dividentmatan@gmail.com`  
   - Password: `AMD15357595`
5. הפעל **Firestore Database** → Create database → Start in **production mode**
6. הוסף Rules ב-Firestore:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /calls/{callId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
7. הורד את config: Project Settings → General → Your apps → Web app  
   עתיק את ה-`firebaseConfig` object

## שלב 2 – משתני סביבה

1. שכפל את `.env.local.example` ל-`.env.local`
2. מלא את הערכים מה-Firebase config שהורדת

## שלב 3 – התקנה מקומית

```bash
npm install
npm run dev
```
פתח: http://localhost:3000

## שלב 4 – העלאה ל-GitHub

```bash
git init
git add .
git commit -m "Initial commit - DIVIDENT app"
git remote add origin https://github.com/YOUR_USERNAME/divident-app.git
git push -u origin main
```

## שלב 5 – Deploy ב-Vercel

1. לך ל-[https://vercel.com](https://vercel.com) → Import Project מ-GitHub
2. בחר את ה-repo שיצרת
3. ב-**Environment Variables** הוסף את כל המשתנים מקובץ `.env.local`
4. לחץ **Deploy** ✓

## מבנה האפליקציה

| עמוד | תיאור |
|------|-------|
| `/` | לוח ראשי – כל הקריאות עם סינון וחיפוש |
| `/new-call` | הוספת קריאה חדשה |
| `/call/[id]` | עריכת קריאה קיימת |
| `/login` | כניסה למערכת |
