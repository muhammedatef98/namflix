// Public support page for Namflix (bilingual EN/AR) — the Support URL that
// App Store Connect (Guideline 1.5) and Google Play require. An e-mail address
// alone is not accepted there; this is a reachable page that carries one.
//
// verify_jwt is disabled on purpose: reviewers and users must reach it without
// credentials. It serves static HTML only — no data in, no data out.
const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Namflix — Support</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Tahoma, sans-serif; background:#140803; color:#F2C9A6; margin:0; padding:32px 20px; line-height:1.7; }
  main { max-width: 720px; margin: 0 auto; }
  h1 { font-size: 28px; color:#E08A4A; }
  h2 { font-size: 20px; color:#E08A4A; margin-top: 36px; }
  a { color:#E08A4A; }
  .ar { direction: rtl; text-align: right; border-top: 1px solid #4A1A0A; margin-top: 48px; padding-top: 24px; }
  .muted { opacity:.7; font-size: 14px; }
</style>
</head>
<body><main>
<h1>Namflix — Support</h1>
<p>Namflix is an evidence-based sleep-support app: ambient sound, CBT-I style techniques, and guided wind-down journeys, in English and Arabic.</p>

<h2>Get help</h2>
<p>Write to <a href="mailto:Namflix.sleep@gmail.com">Namflix.sleep@gmail.com</a> — one person answers, usually within two days. Please include your device model and iOS/Android version.</p>

<h2>Common questions</h2>
<p><b>Do I need an account?</b> No. Namflix has no sign-in at all — open it and it works. Nothing you do is stored on our servers.</p>
<p><b>How do I cancel a subscription?</b> Subscriptions are managed by the store, not by us: on iPhone open Settings → your name → Subscriptions; on Android open Play Store → Payments and subscriptions.</p>
<p><b>How do I restore a purchase?</b> Open the plans screen and tap “Restore purchases”. Your purchase is tied to your Apple ID or Google account, so it follows you to a new phone.</p>
<p><b>How do I delete my data?</b> Everything is stored on your device only, so deleting the app removes all of it. We hold nothing.</p>
<p><b>Sound stops when the screen turns off.</b> Playback is meant to continue; if it stops, make sure the app is allowed to play in the background and that a sleep timer is not set.</p>

<h2>Health note</h2>
<p>Namflix offers education and self-help, not medical care. It does not diagnose or treat. If sleep problems persist, or you take sleep medication, speak to a clinician.</p>

<h2>Privacy</h2>
<p>No ads, no trackers. Full policy: <a href="/functions/v1/privacy">Privacy Policy</a></p>

<div class="ar">
<h1>نامفلكس — الدعم</h1>
<p>نامفلكس تطبيق للمساعدة على النوم قائم على الأدلة: أصوات محيطية، وأساليب من العلاج المعرفي السلوكي للأرق، ورحلات هدوء موجَّهة، بالعربية والإنجليزية.</p>

<h2>احصل على مساعدة</h2>
<p>راسلنا على <a href="mailto:Namflix.sleep@gmail.com">Namflix.sleep@gmail.com</a> — يردّ عليك شخص واحد، عادةً خلال يومين. من فضلك اذكر طراز جهازك وإصدار النظام.</p>

<h2>أسئلة شائعة</h2>
<p><b>هل أحتاج حسابًا؟</b> لا. نامفلكس بلا تسجيل دخول إطلاقًا — افتحه فيعمل. ولا شيء ممّا تفعله يُحفظ على خوادمنا.</p>
<p><b>كيف ألغي الاشتراك؟</b> الاشتراكات يديرها المتجر لا نحن: على الآيفون افتح الإعدادات ← اسمك ← الاشتراكات، وعلى أندرويد افتح Play Store ← المدفوعات والاشتراكات.</p>
<p><b>كيف أستعيد عملية شراء؟</b> افتح شاشة الباقات واضغط «استرجاع المشتريات». اشتراكك مرتبط بحساب Apple أو Google، فينتقل معك إلى أي هاتف جديد.</p>
<p><b>كيف أحذف بياناتي؟</b> كل شيء محفوظ على جهازك وحده، فحذف التطبيق يزيله بالكامل. نحن لا نحتفظ بشيء.</p>
<p><b>الصوت يتوقّف عند إطفاء الشاشة.</b> المفترض أن يستمرّ؛ إن توقّف فتأكّد من سماح النظام بالتشغيل في الخلفية ومن عدم ضبط مؤقّت النوم.</p>

<h2>ملاحظة صحية</h2>
<p>يقدّم نامفلكس تعليمًا ومساعدة ذاتية، لا رعاية طبية، ولا يُشخّص ولا يعالج. إن استمرّت مشكلات النوم أو كنت تتناول أدوية للنوم فاستشر مختصًّا.</p>

<h2>الخصوصية</h2>
<p>بلا إعلانات ولا تتبّع. السياسة كاملة: <a href="/functions/v1/privacy">سياسة الخصوصية</a></p>
</div>
</main></body></html>`;

Deno.serve(() =>
  new Response(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  }),
);
