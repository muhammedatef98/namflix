// Public privacy policy for Namflix (bilingual EN/AR) — the Privacy Policy URL
// that App Store Connect and Google Play require, per locale.
//
// verify_jwt is disabled on purpose: reviewers and users must reach it without
// credentials. It serves static HTML only — no data in, no data out.
//
// ⚠️ Keep in sync with `app/privacy.tsx`, which shows the same policy in-app,
// and with the App Privacy / Data safety declarations in the two store consoles.
// Namflix has no accounts: every one of those four must say so.
const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Namflix — Privacy Policy</title>
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
<h1>Namflix — Privacy Policy</h1>
<p class="muted">Last updated: 9 August 2026</p>
<p>Namflix is a sleep-support app. We collect nothing about you.</p>

<h2>What we collect</h2>
<p>Nothing that identifies you. Namflix has no accounts, no sign-in, and no email address to give us. Everything you do here — preferences, favourite sounds, your nightly check-ins and their history, subscription state — is stored only on your device.</p>

<h2>What we do NOT collect</h2>
<p>No ads, no ad identifiers, no analytics trackers, no location, no contacts, no health data, no third-party data sale — ever.</p>

<h2>Where data lives</h2>
<p>On your phone. We hold no user data on any server. The sound library is streamed from our provider Supabase (EU region, London), which serves audio files — it receives no personal data from you.</p>

<h2>Deleting your data</h2>
<p>Because everything lives on your device, deleting the app deletes all of it. There is no account of yours for us to hold, and nothing for you to request back.</p>

<h2>Purchases</h2>
<p>Subscriptions are processed by Apple or Google, never by us. We never see your payment details. Your purchase is tied to your Apple ID or Google account, which is how "Restore purchases" finds it.</p>

<h2>Not medical advice</h2>
<p>Namflix offers educational, evidence-informed content. It is not a medical device and not medical advice. Persistent insomnia warrants clinician-guided care.</p>

<h2>Contact / Support</h2>
<p>Questions or help: <a href="mailto:Namflix.sleep@gmail.com">Namflix.sleep@gmail.com</a></p>

<div class="ar">
<h1>نامفلكس — سياسة الخصوصية</h1>
<p class="muted">آخر تحديث: ٩ أغسطس ٢٠٢٦</p>
<p>نامفلكس تطبيق للمساعدة على النوم، ولا نجمع عنك شيئًا.</p>

<h2>ما الذي نجمعه؟</h2>
<p>لا شيء يعرّف بك. نامفلكس بلا حسابات ولا تسجيل دخول ولا بريد إلكتروني تعطينا إياه. كل ما تفعله هنا — التفضيلات، والأصوات المفضّلة، وتسجيلاتك الصباحية وسجلّها، وحالة الاشتراك — محفوظ على جهازك وحده.</p>

<h2>ما الذي لا نجمعه</h2>
<p>لا إعلانات، ولا معرّفات إعلانية، ولا أدوات تتبّع، ولا موقع، ولا جهات اتصال، ولا بيانات صحية، ولا بيع للبيانات لأطراف ثالثة — أبدًا.</p>

<h2>أين تُحفظ البيانات؟</h2>
<p>على هاتفك. لا نحتفظ بأي بيانات مستخدم على أي خادم. مكتبة الأصوات تُبثّ من مزوّدنا Supabase (منطقة الاتحاد الأوروبي — لندن)، وهو يقدّم ملفات صوتية فقط ولا يستقبل منك أي بيانات شخصية.</p>

<h2>حذف بياناتك</h2>
<p>بما أنّ كل شيء على جهازك، فحذف التطبيق يحذفه بالكامل. لا يوجد حساب لك لدينا، ولا شيء تحتاج لطلب استرجاعه.</p>

<h2>المشتريات</h2>
<p>الاشتراكات تعالجها Apple أو Google لا نحن، ولا نرى بيانات الدفع إطلاقًا. اشتراكك مرتبط بحساب Apple أو Google، وبه يجد زرّ «استرجاع المشتريات» شراءك.</p>

<h2>ليس نصيحة طبية</h2>
<p>يقدّم نامفلكس محتوى تعليميًّا قائمًا على الأدلة، وليس جهازًا طبيًّا أو نصيحة طبية. الأرق المستمر يستدعي رعاية مختصّة.</p>

<h2>التواصل والدعم</h2>
<p>للأسئلة أو المساعدة: <a href="mailto:Namflix.sleep@gmail.com">Namflix.sleep@gmail.com</a></p>
</div>
</main></body></html>`;

Deno.serve(() =>
  new Response(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  }),
);
