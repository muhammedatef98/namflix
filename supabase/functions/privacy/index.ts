// Public privacy policy for Namflix (bilingual EN/AR) — the Privacy Policy URL
// that App Store Connect and Google Play require, per locale.
//
// verify_jwt is disabled on purpose: reviewers and users must reach it without
// credentials. It serves static HTML only — no data in, no data out.
//
// ⚠️ Keep in sync with `app/privacy.tsx`, which shows the same policy in-app,
// and with the App Privacy / Data safety declarations in the two store consoles.
// Namflix has no accounts, and shows ads only in the free version: every one
// of those four must say both.
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
<p class="muted">Last updated: 19 October 2026</p>
<p>Namflix is a sleep-support app. We collect as little as possible.</p>

<h2>What we collect</h2>
<p>Nothing that identifies you. Namflix has no accounts, no sign-in, and no email address to give us. Everything you do here — preferences, favourite sounds, your nightly check-ins and their history — is stored only on your device.</p>

<h2>What we do NOT collect</h2>
<p>No analytics trackers (the app keeps its own usage notes on your device and sends them to no server), no precise location, no contacts, no health data, and no selling of data to third parties — ever. Premium members see no ads at all, and no ad requests are made for them.</p>

<h2>Ads in the free version</h2>
<p>The free version can show ads from Google AdMob — for example when you choose to watch a short ad to unlock a sound or method for 24 hours. To serve and measure ads, Google may process your device’s advertising identifier (on iOS only if you allow tracking), IP address and approximate location, device information and ad interactions. Where the law requires it (e.g. EEA/UK) we ask for your consent first; if you decline consent or tracking you still get non-personalised ads, and the app works the same. Google’s policy: <a href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</a></p>

<h2>Your ad choices</h2>
<p>You can change your ad consent at any time: open the app → Privacy policy → <strong>Ad privacy choices</strong> (shown where the law requires a consent choice, e.g. EEA/UK). On iPhone you can also turn tracking off in Settings → Privacy &amp; Security → Tracking; on Android you can reset or delete your advertising ID in Settings → Google → Ads. Going Premium removes ads entirely.</p>

<h2>Where data lives</h2>
<p>On your phone. We hold no account and no personal data on any server. The sound library is streamed from our provider Supabase (EU region, London), which serves audio files — it receives no personal data from you. The exceptions are the purchase record (see Purchases) and, in the free version only, the ads described above.</p>

<h2>Deleting your data</h2>
<p>Because everything lives on your device, deleting the app deletes all of it. There is no account of yours for us to hold, and nothing for you to request back.</p>

<h2>Purchases</h2>
<p>Subscriptions are processed by Apple or Google, never by us. We never see your payment details. Your purchase is tied to your Apple ID or Google account, which is how "Restore purchases" finds it.</p>
<p>To unlock premium we use RevenueCat, which keeps a record of the purchase itself — which plan, and whether it is still active — against a random identifier created on your device. It never receives your name, your email or any way to contact you, because we never ask you for those. Apart from ads in the free version, this purchase record is the only data of yours that exists off your device, and it is what makes "Restore purchases" work.</p>

<h2>Not medical advice</h2>
<p>Namflix offers educational, evidence-informed content. It is not a medical device and not medical advice. Persistent insomnia warrants clinician-guided care.</p>

<h2>Contact / Support</h2>
<p>Questions or help: <a href="mailto:Namflix.sleep@gmail.com">Namflix.sleep@gmail.com</a></p>

<div class="ar">
<h1>نامفلكس — سياسة الخصوصية</h1>
<p class="muted">آخر تحديث: ١٩ أكتوبر ٢٠٢٦</p>
<p>نامفلكس تطبيق للمساعدة على النوم، ونجمع أقلّ قدر ممكن من البيانات.</p>

<h2>ما الذي نجمعه؟</h2>
<p>لا شيء يعرّف بك. نامفلكس بلا حسابات ولا تسجيل دخول ولا بريد إلكتروني تعطينا إياه. كل ما تفعله هنا — التفضيلات، والأصوات المفضّلة، وتسجيلاتك الصباحية وسجلّها — محفوظ على جهازك وحده.</p>

<h2>ما الذي لا نجمعه</h2>
<p>لا أدوات تحليل أو تتبّع (ملاحظات الاستخدام يحفظها التطبيق على جهازك ولا يرسلها لأي خادم)، ولا موقع دقيق، ولا جهات اتصال، ولا بيانات صحية، ولا بيع للبيانات لأطراف ثالثة — أبدًا. ولا يرى مشتركو بريميوم أي إعلانات، ولا تُطلب لهم إعلانات أصلًا.</p>

<h2>الإعلانات في النسخة المجانية</h2>
<p>قد تعرض النسخة المجانية إعلانات من Google AdMob — مثلًا عندما تختار مشاهدة إعلان قصير لفتح صوت أو أسلوب لمدة ٢٤ ساعة. ولعرض الإعلانات وقياسها قد تعالج Google المعرّف الإعلاني لجهازك (على iOS فقط إن سمحتَ بالتتبّع)، وعنوان IP والموقع التقريبي، ومعلومات الجهاز، وتفاعلك مع الإعلانات. وحيث يشترط القانون ذلك (كالاتحاد الأوروبي والمملكة المتحدة) نطلب موافقتك أولًا؛ وإن رفضتَ الموافقة أو التتبّع تصلك إعلانات غير مخصّصة ويعمل التطبيق كما هو. سياسة Google: <a href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</a></p>

<h2>خياراتك في الإعلانات</h2>
<p>يمكنك تغيير موافقتك على الإعلانات في أي وقت: افتح التطبيق ← سياسة الخصوصية ← <strong>خيارات خصوصية الإعلانات</strong> (تظهر حيث يشترط القانون خيار الموافقة، كالاتحاد الأوروبي والمملكة المتحدة). وعلى iPhone يمكنك أيضًا إيقاف التتبّع من الإعدادات ← الخصوصية والأمن ← التتبّع، وعلى Android يمكنك إعادة تعيين المعرّف الإعلاني أو حذفه من الإعدادات ← Google ← الإعلانات. والاشتراك في بريميوم يزيل الإعلانات تمامًا.</p>

<h2>أين تُحفظ البيانات؟</h2>
<p>على هاتفك. لا نحتفظ بحساب لك ولا ببيانات شخصية على أي خادم. مكتبة الأصوات تُبثّ من مزوّدنا Supabase (منطقة الاتحاد الأوروبي — لندن)، وهو يقدّم ملفات صوتية فقط ولا يستقبل منك أي بيانات شخصية. والاستثناءان هما سجلّ الشراء (انظر «المشتريات»)، والإعلانات في النسخة المجانية فقط كما وُضّح أعلاه.</p>

<h2>حذف بياناتك</h2>
<p>بما أنّ كل شيء على جهازك، فحذف التطبيق يحذفه بالكامل. لا يوجد حساب لك لدينا، ولا شيء تحتاج لطلب استرجاعه.</p>

<h2>المشتريات</h2>
<p>الاشتراكات تعالجها Apple أو Google لا نحن، ولا نرى بيانات الدفع إطلاقًا. اشتراكك مرتبط بحساب Apple أو Google، وبه يجد زرّ «استرجاع المشتريات» شراءك.</p>
<p>ولفتح المزايا المدفوعة نستخدم RevenueCat، وهو يحتفظ بسجلّ عملية الشراء نفسها — أي باقة، وهل ما زالت فعّالة — مرتبطًا بمعرّف عشوائي يُنشأ على جهازك. ولا يصله اسمك ولا بريدك الإلكتروني ولا أي وسيلة للتواصل معك، لأننا لا نطلب منك شيئًا من ذلك أصلًا. وباستثناء الإعلانات في النسخة المجانية، فسجلّ الشراء هذا هو البيانات الوحيدة الخاصة بك خارج جهازك، وهو ما يجعل زرّ «استرجاع المشتريات» يعمل.</p>

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
