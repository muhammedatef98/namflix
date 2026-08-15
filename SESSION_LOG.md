# Namflix — Session Log (2026-07-31)

الطبقة المجانية + دعم Ko-fi + فحص ما قبل الرفع للـApp Store.

## القرارات

| القرار | الحالة |
|---|---|
| إعلانات داخل التطبيق | ❌ مرفوضة — سياسة الخصوصية تقول "لا إعلانات"، والإعلان يخرّب تجربة الـ٣ فجرًا، والعائد ضعيف |
| لينك دعم/تبرّع | ✅ Ko-fi، للمستخدمين المجانيين فقط، ولا يفتح أي ميزة |
| اسم التطبيق | ✅ يفضل **Namflix** زي ما هو (خطر التشابه مع Netflix اتشرح واتقبل) |
| طبقة مجانية دائمة | ✅ اتنفّذت |

## الدعم (Ko-fi)

- `lib/support.ts` — `SUPPORT_URL` + `SUPPORT_EMAIL` + `openSupportPage()` (متصفّح خارجي، مش WebView).
- `app/support.tsx` — شاشة الدعم، وبتقول صراحةً إن التبرّع لا يفتح أي ميزة.
- الرئيسية: قسم "الدعم" يظهر فقط لو `!isPremium || plan === 'lifetime-free'`.
- **مش موجود على شاشة الباقات** عمدًا — لينك دفع خارجي جنب اشتراكات Apple = رفض.

## الطبقة المجانية

- `lib/freeTier.ts` — المصدر الوحيد للحقيقة:
  - مجاني للأبد: `/breathe` · `/shuffle` · `/rescue` · `/boring`
  - ٦ أصوات: rain-soft · waves-real · fire-camp · brown-deep · crickets-night · fan-turn
- `useFeatureGate()` بقى يرجّع `isLocked(route)`، وكل الشاشات بتقرأ منه: الرئيسية · Tools · Methods · DullCard · TrackRow · شاشة المشغّل (حماية الروابط العميقة).
- **تسريب اتقفل**: تبويب Methods وهَب Boring كانوا بيعملوا `router.push` مباشر، يعني كل الأدوات كانت متاحة مجانًا من غير المرور على الـpaywall.
- "شغّل لي شيئًا" يختار من الأصوات المجانية للمستخدم المجاني بدل ما يرميه على الـpaywall.

## التجربة المجانية (Free trial)

- `lib/purchases.ts` — `readFreeTrial()` يقرأ العرض التمهيدي من StoreKit → `PurchasablePlan.trial`.
- `app/premium.tsx` — سطر "٧ أيام مجانًا، ثم $39.99/سنة" يظهر **فقط لو المتجر فعلًا فيه تجربة**، ومعاه نص الإفصاح الإلزامي.
- يعني تقدر تضيف التجربة من App Store Connect **من غير بيلد جديد**.

## فحص ما قبل الرفع (App Store)

- `app.json` → `ios.privacyManifests` (إيميل + معرّف مستخدم، بلا تتبّع؛ اتأكدنا إن دمج Expo بيحافظ على الـ4 required-reason APIs).
- `app/premium.tsx` → قائمة "كل باقة تشمل" (3.1.2(c)).
- الرئيسية → تنبيه طبي ظاهر (1.4.1) + زر "تواصل مع الدعم" (1.5).
- `store/ios/REVIEW_NOTES.md` → نص جاهز لخانة App Review Notes + تشيك ليست.
- `supabase/functions/support/index.ts` → **منشورة**: `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/support`
- `tsconfig.json` → استثناء `supabase/functions/**` (بيئة Deno).

### الباقي عليك في App Store Connect

1. Support URL = رابط صفحة الدعم فوق.
2. اربط الاشتراكين بنسخة التطبيق ثم Submit for Review (لو مش مربوطين = رفض 2.1(b)).
3. إجابات App Privacy: Email Address + User ID، مرتبطين بالهوية، App Functionality، بلا تتبّع.
4. (اختياري، أقوى رافعة دخل) تجربة مجانية ٧ أيام على الباقة السنوية.
5. **بيلد جديد إجباري** — تعديل Privacy Manifest نيتف ومش بيتبعت OTA.

---

# Namflix — Session Log (2026-07-27)

سجل كامل لجلسة العمل: تفعيل الدفع (IAP) + تحسينات المنتج + إعداد RevenueCat.

---

## 1. تحسينات المنتج (OTA — منشورة للتستر)

| التعديل | التفاصيل |
|---|---|
| **الشهب عشوائية** | `components/StarField.tsx` — ٤ شهب تطلع من مكان + زاوية + توقيت عشوائي كل مرة، على كل الصفحات |
| **مازج الأصوات يفضل شغّال** | نُقل الصوت لـ`contexts/MixerContext.tsx` فيفضل شغّال أثناء التصفح وبعد الخروج + شريط تحكّم في `MiniPlayer` |
| **إصلاح اسكرول اختيار الأصوات** | القائمة بقت `ScrollView` بدل `View` مقصوص |
| **"ملل عن قصد" موسّع ومقسّم** | `lib/dullContent.ts` — ٩ عناصر مقسّمة لـ"تهدئة العقل" / "تهدئة الجسد" (+ PMR، مسح الجسد، التدريب الذاتي — كلها بأدلة سريرية) |
| **أنميشنز الأصوات أبطأ** | `components/SoundArt.tsx` — كل الحركات أبطأ ~١.٥× |
| **المطر أدق** | خيوط أكثف وأنحف بميل خفيف وطبقتين (أمامية/خلفية) |
| **شاشة الـsplash** | اتشالت الصورة الثابتة (تحتاج بيلد جديد) |

---

## 2. التحكم الإداري (Supabase)

جدول `app_config` (صف واحد، id=1) — تعدّله من Supabase Dashboard بدون بيلد:

| العمود | القيم | التأثير |
|---|---|---|
| `lifetime_mode` | `free` | Lifetime مجاني (الوضع الحالي) |
| | `paid` | يقول "قريبًا" |
| | `off` | زرار Lifetime يختفي (لدفع الناس للاشتراكات المدفوعة) |
| `monthly_price` / `yearly_price` | نص | أسعار العرض |

RLS: قراءة عامة فقط، الكتابة من الداشبورد فقط = تحكّم أدمن.

---

## 3. الدفع (In-App Purchase) — الحالة

### ✅ App Store Connect
- Paid Apps Agreement + Bank + Tax + DSA (Trader) → **Active**
- Subscription Group "Namflix paid" + اشتراكين:
  - `namflix.premium.monthly` — $4.99 (سعر + لغة + توفّر 175 دولة)
  - `namflix.premium.yearly` — $39.99 (سعر + لغة + توفّر)
  - App ID: `6794132000`

### ✅ RevenueCat (project `5da21fd9`)
- App Store app: `appf72cb78315`, Bundle ID `com.namflix.app`
- In-App Purchase Key: `SubscriptionKey_5N8VB9LVLJ.p8`
  - Key ID `5N8VB9LVLJ` — Issuer ID `0e9df5ea-edec-4de2-afb5-2c391f398aad`
- Products: `namflix.premium.monthly` + `namflix.premium.yearly`
- Entitlement: `premium` (مربوط بالمنتجين)
- Offering: `default` (packages مربوطة بمنتجات App Store)
- Public iOS API key في `.env`: `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_EtorXUCGaHoqIFPDciatsnChSOj`

### ✅ الكود (متوافق مع Apple Guideline 3.1.2)
- `lib/purchases.ts` — RevenueCat wrapper آمن (lazy require + guarded)
- `contexts/PremiumContext.tsx` — الاشتراك مصدره RevenueCat entitlement
- `app/premium.tsx` — الباقات المدفوعة تظهر فقط لو ليها منتج StoreKit حقيقي + زر Restore + نص التجديد التلقائي + روابط Terms & Privacy

### ✅ البيلد والنشر
- OTA للنسخة المجانية → منشور (production channel)
- بيلد iOS production الجديد (دفع شغّال + المفتاح + splash) → **finished**

---

## 4. الباقي (خطوات المستخدم — محتاجة Apple auth/2FA)

1. **رفع البيلد**: `eas submit --platform ios --profile production --latest`
   - اختار **[Choose an existing key]** → المفتاح **[Expo] EAS Submit** (`468PRNL4U2`)
   - (تجنّب [Add a new key] — بيضرب خطأ Apple olympus)
2. **تجربة Sandbox**: Users and Access → Sandbox → Testers
3. **App Store Connect** → نسخة التطبيق → In-App Purchases → أضف الاشتراكين → **Submit for Review**

---

## 5. ملاحظات

- ملف `.env` فيه المفتاح لكنه **مُتجاهَل في git** (لا يُرفع) — أضِفه يدويًا على أي جهاز تاني.
- منتجات RevenueCat ظهرت "Could not check" بسبب عطل Apple API مؤقت (Bundle IDs المسجّلة حديثًا) — بيتصلّح لوحده، والشراء يشتغل على الجهاز.
- `git push` عبر GitHub CLI (`gh auth login`) — الباسورد المباشر لم يعد مدعومًا.
- كل التعديلات متعمَلها commit + push لـ`main` على GitHub.

راجع `IAP_SETUP.md` للدليل الكامل خطوة بخطوة.
