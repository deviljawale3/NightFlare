# 🚑 V7.1 HOTFIX: ZOOM UNLOCKED

**Diagnosis:**
- The Camera Menu (UI) allowed Zoom between **15 and 40**.
- The Game Engine (App.tsx) had a "Safety Lock" that forced **ALL** distances to be **7 or less**.
- **Result:** Changing the Zoom slider did absolutely nothing because 15, 20, 30 were all clamped to 7.

**Fix Applied:**
- 🔓 **Removed the Safety Lock.**
- The Zoom Slider now works fully for the entire range (15 to 40).
- Rotating should also be more visible at larger distances.

**Instructions:**
1. **Refresh.**
2. Open Camera Menu.
3. Click "Zoom -" or "Zoom +". The camera **WILL** move in and out now.
