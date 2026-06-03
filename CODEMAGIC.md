# Codemagic CI/CD Build Guide for APK Generation

Aapki application ko **Codemagic** platform ke zariye seamlessly compile karke APK me badalne ke liye humne automation files and workflows configure kar diye hain.

Is directory me ek modern, robust aur fully automatic `codemagic.yaml` file create kar di gayi hai jo automatic pipelines follow karegi.

---

## 🚀 APK Kaise Compile Karein? (Step-by-Step Guide)

### Step 1: Code ko Repository (GitHub/GitLab/Bitbucket) me Push Karein
Agar aapne is framework code me change kiya hai, toh ise apne GitHub, GitLab ya Bitbucket account par push karein.

### Step 2: Codemagic me Signup aur Dashboard access karein
1. [Codemagic Dashboard](https://codemagic.io/) par humesha ki tarah login karein.
2. **Add Application** button par click karein.
3. Apne connected provider (jaise GitHub) ko select karein aur apne is repository ko connect karein.

### Step 3: Integration Setup (YAML configured)
1. Codemagic automatic tarike se aapki root directory me `codemagic.yaml` file ko auto-detect karega.
2. Select **"Use codemagic.yaml"** (agar dynamic workflow setup karne ke liye pucha jaye).
3. **Save** par click karein.

### Step 4: Build Start karein
1. **Start new build** par click karein.
2. Branch me `main` ya jis branch par aapka updated code hai use select karein.
3. Workflow me select karein: **Android Capacitor APK Build** (jo humne set karke diya hai).
4. **Start building** par click karein!

---

## 🛠️ Ye Workflow Kya Karta Hai? (Automated Steps)
Codemagic building container automatically ye tasks run karega:
1. **Dependency Sync**: `npm install` standard and fast packages cache storage ke sath clean download karta hai.
2. **Next.js Static Export**: Next.js 15 app ko compile karke offline web bundle formats me convert karega aur output folder `www` me save karega. It clears server loads since client runs inside a local WebView.
3. **Capacitor Sync**: `npx cap sync android` auto-command execute karke web assets copy karega aur latest configurations push karega.
4. **SDK Local Target**: Codemagic standard Android SDK variables ko match karne ke liye local configs mapping set karega.
5. **Gradle Build compilation**: 
   - Compile karega `app-debug.apk` (Instantly installable for WhatsApp transfers, direct sharing and testing).
   - Compile karega `app-release-unsigned.apk` (Optimized build ready for signing).

---

## 📦 Output Artifacts (Kahan Milenge?)
Build success hone par:
1. Aapko aapke registered email (`jaatcj4@gmail.com`) par direct **success download link** mil jayegi.
2. Codemagic build screen par right side panel me **Artifacts** module me link visible hogi jahan se direct `.apk` files download kar sakte hain.

---

## 🖋️ Release APK (Play Store) Signing (Optional)
Agar aapko public production deployment ke liye fully signed key lagana hai toh:
1. **Codemagic UI** -> **Environment variables** me apne app signing configurations enter karein.
2. App Signing variables in Group name `android-signing`:
   - `CM_KEYSTORE` (keystore file encrypted as base64)
   - `CM_KEYSTORE_PASSWORD`
   - `CM_KEY_ALIAS`
   - `CM_KEY_PASSWORD`
3. Codemagic automatically compile hone wali release APK ko verify aur lock status me push kar dega.
