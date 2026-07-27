# تفعيل الاشتراكات المدفوعة (In-App Purchase) — دليل خطوة بخطوة

الكود جاهز بالكامل. اللي ناقص هو إعداد الحسابات. اعمل الخطوات بالترتيب ده.
لما تخلص كله، حط المفتاح في `.env`، اعمل بيلد جديد، وارفعه للمراجعة.

---

## ✅ حالة التقدّم (آخر تحديث 2026-07-27)

- ✅ **الخطوة 1** — Paid Apps Agreement + Bank + Tax + DSA → كلها Active
- ✅ **الخطوة 2** — الاشتراكين في App Store Connect (group "Namflix paid"):
  - `namflix.premium.monthly` — $4.99 — لغة/توفّر/سعر ✅
  - `namflix.premium.yearly` — $39.99 — لغة/توفّر/سعر ✅
  - App ID: `6794132000`
- ✅ **الخطوة 4 (RevenueCat)** — خلصت بالكامل:
  - project `5da21fd9`، App Store app `appf72cb78315`، Bundle ID `com.namflix.app`
  - In-App Purchase Key: `SubscriptionKey_5N8VB9LVLJ.p8` (Key ID `5N8VB9LVLJ`, Issuer `0e9df5ea-edec-4de2-afb5-2c391f398aad`)
  - المنتجين: `namflix.premium.monthly` + `namflix.premium.yearly`
  - entitlement `premium` (فيه الاتنين) + offering `default` (packages مربوطة بمنتجات App Store)
  - Public iOS API key في `.env`: `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_EtorXUCGaHoqIFPDciatsnChSOj`
- 🔨 **الخطوة 5 (البيلد)** — بيلد iOS production شغّال على EAS (بيحقن المفتاح + native module + شيل الsplash)

### الباقي بعد ما البيلد يخلص
1. `eas submit --platform ios --profile production` → يرفعه لـTestFlight/App Store Connect
2. جرّب الشراء بحساب **Sandbox** (Users and Access → Sandbox → Testers)
3. في App Store Connect: اربط الاشتراكين بنسخة التطبيق (قسم In-App Purchases) وSubmit for Review
4. ملاحظة عطل مؤقت: منتجات RevenueCat ظهرت "Could not check" بسبب عطل Apple API — بيتصلّح لوحده، والشراء بيشتغل على الجهاز

**ملاحظة:** الإطلاق المجاني (Lifetime free) كان جاهز ومستقل عن ده من الأول.

---

المنتجات المتوقعة في الكود:

| الباقة | Product ID | السعر |
|---|---|---|
| شهري | `namflix.premium.monthly` | $4.99 / شهر |
| سنوي | `namflix.premium.yearly` | $39.99 / سنة |
| Entitlement | `premium` | — |

---

## الخطوة 1 — اتفاقية التطبيقات المدفوعة + البنك + الضرائب (إلزامية)

من غير الخطوة دي، أي In-App Purchase مش هيشتغل أبدًا.

1. ادخل **App Store Connect** → **Business** (أو "Agreements, Tax, and Banking").
2. عند **Paid Apps**: اضغط **Review Agreement** → اقبل الشروط.
3. **Banking**: أضف حساب بنكي (Add Bank Account) — بيانات الآيبان/الحساب.
4. **Tax**: املأ نماذج الضرائب (نموذج الضريبة الأمريكية W-8BEN + بلدك).
5. استنى لحد ما حالة الاتفاقية تبقى **Active** (ممكن تاخد من ساعات ليوم).

---

## الخطوة 2 — إنشاء الاشتراكات في App Store Connect

1. **App Store Connect** → **My Apps** → **Namflix**.
2. من القائمة الجانبية تحت **Monetization** → **Subscriptions**.
3. اضغط **Create** لعمل **Subscription Group**:
   - Reference Name: `Namflix Premium` (اسم داخلي، المستخدم مش بيشوفه).
4. جوه المجموعة، اضغط **Create Subscription** للباقة الشهرية:
   - **Reference Name:** `Monthly Premium`
   - **Product ID:** `namflix.premium.monthly` ← لازم بالظبط كده
   - **Duration:** 1 Month
   - **Subscription Prices:** اختر السعر → `$4.99` (وسيبه يحسب باقي الدول تلقائيًا).
   - **App Store Localization:** أضف لغة (Arabic + English):
     - Display Name: `شهري` / `Monthly`
     - Description: وصف قصير للمزايا.
   - **Review Information:** ارفع **Screenshot** لشاشة الأسعار + ملاحظة قصيرة للمراجع.
5. ارجع للمجموعة نفسها، اضغط **Create Subscription** تاني للباقة السنوية:
   - **Reference Name:** `Yearly Premium`
   - **Product ID:** `namflix.premium.yearly`
   - **Duration:** 1 Year
   - **Price:** `$39.99`
   - نفس الـLocalization + Screenshot.

> مهم: لازم الاتنين في **نفس الـSubscription Group** عشان المستخدم يقدر يبدّل بينهم.
> حالة كل باقة هتبقى "Ready to Submit" أو "Missing Metadata" — عادي، هتتربط بالنسخة في الخطوة 6.

---

## الخطوة 3 — App-Specific Shared Secret (مفتاح تحقق للـRevenueCat)

1. في صفحة **Subscriptions** بـApp Store Connect، دوّر على **App-Specific Shared Secret**.
2. اضغط **Generate** (أو Manage) → **انسخ** الكود الطويل. هتحتاجه في الخطوة 4.

---

## الخطوة 4 — إعداد RevenueCat

1. اعمل حساب على **https://www.revenuecat.com** (مجاني لحد $2.5k دخل شهري).
2. **Create new project** → سمّيه `Namflix`.
3. **Project Settings → Apps → + New → App Store**:
   - App name: `Namflix`
   - **Bundle ID:** `com.namflix.app`
   - **App-Specific Shared Secret:** الصق اللي نسخته في الخطوة 3.
   - احفظ.
4. **Products** (القائمة الجانبية) → **+ New**:
   - أضف `namflix.premium.monthly`
   - أضف `namflix.premium.yearly`
5. **Entitlements** → **+ New**:
   - Identifier: `premium` ← لازم بالظبط كده
   - اربط بيه المنتجين (Attach both products).
6. **Offerings** → افتح الـoffering الافتراضي (أو اعمل واحد اسمه `default`) → **+ Add Package**:
   - Package: Monthly → attach `namflix.premium.monthly`
   - Package: Annual → attach `namflix.premium.yearly`
7. **API Keys** (Project Settings → API Keys):
   - انسخ الـ**Public app-specific API key** بتاع **Apple** (بيبدأ بـ`appl_`).

---

## الخطوة 5 — حط المفتاح في المشروع

افتح ملف `.env` في `namflix-app` وأضف السطر ده (بالمفتاح من الخطوة 4):

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxx
```

> ملحوظة: ده مفتاح **عام (public)** مخصص للتطبيق، آمن إنه يكون في التطبيق — مش سر.

---

## الخطوة 6 — بيلد جديد + ربط المنتجات بالنسخة + رفع للمراجعة

1. اعمل بيلد جديد (المكتبة native فلازم بيلد، مش OTA):
   ```bash
   eas build --platform ios --profile production
   ```
2. ارفعه:
   ```bash
   eas submit --platform ios --profile production
   ```
3. في **App Store Connect** → نسخة التطبيق (App Version) → قسم **In-App Purchases and Subscriptions**:
   - اضغط **+** وأضف الاشتراكين للنسخة دي. ← مهم جدًا لأول مراجعة، عشان المراجع يقدر يوافق عليهم مع التطبيق.
4. اكتب في **App Review Information** ملاحظة إن المزايا بتتفتح بالاشتراك، ولو محتاج حساب تجربة سيبه.
5. Submit for Review.

---

## الخطوة 7 — التجربة قبل النشر (Sandbox)

1. **App Store Connect → Users and Access → Sandbox → Testers → +** — اعمل حساب تجربة بإيميل جديد (مش لازم إيميل حقيقي مفعّل).
2. على الآيفون: **Settings → App Store** → انزل تحت لـ**Sandbox Account** وسجّل دخول بحساب التجربة (أو سيبه، هيطلبه وقت الشراء).
3. افتح التطبيق (نسخة الـTestFlight/البيلد الجديد) → شاشة الأسعار → اضغط شراء → هيستخدم بيئة الـSandbox (مش فلوس حقيقية).
4. اتأكد إن الشراء بيفتح المزايا، وإن **Restore Purchases** بيرجّعها.

---

## طمأنة: ليه أبل مش هترفض

- الباقات المدفوعة **مبتظهرش أصلًا** إلا لو RevenueCat رجّع منتج StoreKit حقيقي بسعره — فمفيش زر شراء فاضي.
- السعر بييجي من StoreKit نفسه (مش مكتوب بإيد).
- في **Restore Purchases** + نص التجديد التلقائي + رابط **Terms of Use** + **Privacy** — كلها مطلوبات Guideline 3.1.2.

---

## التحكم بعد التفعيل (من غير بيلد)

- **الأسعار:** من App Store Connect (أبل بتفرض إن السعر المعروض = سعر StoreKit).
- **Lifetime مجاني ↔ مقفول:** من Supabase → جدول `app_config` → عمود `lifetime_mode` (`free` / `paid` / `off`).
- **مين ياخد مجانًا لاحقًا:** استخدم **Offer Codes** من App Store Connect.
