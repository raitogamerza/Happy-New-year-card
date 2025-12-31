# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Happy-New-year-card

## การเล่นเพลงใน IG/LINE/แชท
- In-app browser ส่วนใหญ่จะบล็อกการเล่นอัตโนมัติ ต้องมีการแตะจากผู้ใช้ก่อน เพลงถึงจะเริ่มเล่น
- ในแอปนี้ให้แตะซองจดหมายเพื่อเปิด แล้วกดปุ่ม "เล่นเพลง" ด้านล่างซ้ายเพื่อเริ่มเพลง
- ถ้าใช้ลิงก์ YouTube บางแอปอาจบล็อกการเล่นในพื้นหลัง แนะนำใช้ลิงก์ไฟล์ MP3 (https) โดยตรงเพื่อความเสถียรที่สุด
- ค่ามาตรฐานไม่มีไฟล์เพลงบันเดิลมาในโปรเจกต์ ให้ตั้งเพลงผ่านปุ่ม "ตั้งเพลง" หรือเพิ่มพารามิเตอร์ `?track=<mp3-url>` ในลิงก์ที่แชร์
- บน iPhone/ iOS ตรวจสอบว่าไม่ได้เปิดโหมดเงียบ (mute switch) และเปิดเสียงสื่อในตัวเครื่อง

ตัวอย่างลิงก์แชร์พร้อมเพลง:
`https://your-domain.example/?msg=สวัสดีปีใหม่&track=https://.../your-song.mp3`

## ใช้ไฟล์ MP3 ในเครื่อง (เหมาะกับ LINE/IG)
- กดปุ่ม "ใช้ไฟล์ MP3 ในเครื่อง" ในตัวเล่นเพลง เพื่อเลือกไฟล์จากเครื่องของคุณ
- แอปจะสร้าง `blob:` URL ชั่วคราวและเล่นเพลงทันที (ไม่แก้ไขลิงก์ที่แชร์)
- หมายเหตุ: ไฟล์ที่เลือกจากเครื่องไม่สามารถแชร์เป็นลิงก์ให้คนอื่นเปิดได้ ต้องอัปโหลดไฟล์ไปยังที่ที่เข้าถึงผ่าน `https` แล้วใช้ URL นั้น
- ถ้าเจอข้อความ "แตะปุ่มเล่นเพลง" ใน IG/LINE ให้กดปุ่ม "เล่นเพลง" หนึ่งครั้งเพื่อปลดล็อกการเล่น