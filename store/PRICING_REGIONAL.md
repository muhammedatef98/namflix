# Regional pricing — approved 19 Oct 2026 (not yet entered)

Approved by the owner on 19 Oct 2026, replacing the 10 Oct sheet ($7.99 / $39.99 /
$49.99). **Nothing below has been saved in either console yet.**
Enter in App Store Connect and Play Console, then tick each row and re-read the
table after saving (Play bulk edits have silently skipped Tunisia and Libya before).

## Global prices

| Product | Global (USD) | Was (live) | Was (10 Oct sheet) |
|---|---|---|---|
| `namflix.premium.monthly` | **$3.99** | $7.99 | $7.99 |
| `namflix.premium.yearly` | **$19.99** | $39.99 | $39.99 |
| `namflix.premium.lifetime` | **$39.99** | $99.99 | $49.99 |

Why these: priced for an independent sleep app rather than Calm/Headspace (~$70/yr).
Yearly is a 58 % saving against 12 × monthly; Lifetime is 2 × yearly, so yearly
still reads as the sensible default. The free tier now unlocks content with
rewarded ads (3 a day), so Premium has to be an easy step up.

Lowering a subscription price: Apple and Google move **existing** subscribers to
the lower price as well. No action needed, and nobody is charged more.

Rule: Gulf ≈ **50 %** of global, other Arab countries ≈ **25 %**, nearest local
price point the console allows. Where a cell shows two values it is
**App Store / Play** (Apple bills those storefronts in USD, Play in local currency).
If a console rejects a value as below its minimum, use the console's minimum
for that country and note it here.

The new regional rows **replace** every existing override on these countries,
including Lifetime's old ones (Play: SAR 429.99, AED 384.99, QAR 365, EGP 1,499.99,
tier B ≈ $49.99, Yemen $37.99; iOS Egypt E£1,299.99) and monthly's / yearly's old
SA / AE / EG prices (SAR 34.99, AED 29.99 / 149.99, E£99.99 / E£499.99).

## Gulf (~50 %: ≈ $1.99 / $9.99 / $19.99)

| Country | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇸🇦 SA | 7.49 SAR | 37.99 SAR | 74.99 SAR |
| 🇦🇪 AE | 7.49 AED | 36.99 AED | 72.99 AED |
| 🇶🇦 QA | 7.49 QAR | 36.99 QAR | 72.99 QAR |
| 🇰🇼 KW | $1.99 / 0.600 KWD | $9.99 / 3.050 KWD | $19.99 / 6.150 KWD |
| 🇧🇭 BH | $1.99 / 0.750 BHD | $9.99 / 3.750 BHD | $19.99 / 7.500 BHD |
| 🇴🇲 OM | $1.99 / 0.770 OMR | $9.99 / 3.850 OMR | $19.99 / 7.700 OMR |

## Other Arab countries (~25 %: ≈ $0.99 / $4.99 / $9.99)

| Country | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇪🇬 EG | 48.99 EGP | 244.99 EGP | 484.99 EGP |
| 🇲🇦 MA | $0.99 / 8.99 MAD | $4.99 / 45.99 MAD | $9.99 / 90.99 MAD |
| 🇩🇿 DZ | $0.99 / 130 DZD | $4.99 / 650 DZD | $9.99 / 1,300 DZD |
| 🇹🇳 TN | $0.99 / 2.950 TND | $4.99 / 14.750 TND | $9.99 / 29.500 TND |
| 🇯🇴 JO | $0.99 / 0.700 JOD | $4.99 / 3.540 JOD | $9.99 / 7.090 JOD |
| 🇮🇶 IQ | $0.99 / 1,300 IQD | $4.99 / 6,550 IQD | $9.99 / 13,000 IQD |
| 🇱🇧 LB | $0.99 | $4.99 | $9.99 |
| 🇱🇾 LY | $0.99 | $4.99 | $9.99 |
| 🇾🇪 YE | $0.99 | $4.99 | $9.99 |
| 🇵🇸 PS | $0.99 (Play only, if offered) | $4.99 | $9.99 |
| 🇲🇷 MR | $0.99 (App Store only — not a Play billing region) | $4.99 | $9.99 |
| 🇸🇩 SD, 🇸🇾 SY | not sold (sanctions) | — | — |

Currencies pegged to the dollar (Gulf, JOD) are exact. EGP, MAD, DZD, TND and IQD were
converted at approximate rates (≈48.5, 9.1, 130, 2.95, 1,310 per USD): pick the nearest
value the console offers and check it against the console's own conversion.

## Also pending with these prices

- RevenueCat: attach the **Play** `namflix.premium.lifetime` to entitlement `premium`
  and to the `$rc_lifetime` package of the `default` offering. Keep it
  **non-consumable** (Play: "Allow users to purchase more than one" stays OFF).
- Update the "Pricing" tables in `HANDOFF.md`, `store/android/PLAY_CONSOLE_SETUP.md`
  and the prices in `store/ios/REVIEW_NOTES.md` once the prices are saved.
- Supabase `app_config.monthly_price` / `yearly_price` (still "$4.99" / "$39.99") are
  not read by the current paywall, which shows store prices only; update them for
  tidiness or leave them.
