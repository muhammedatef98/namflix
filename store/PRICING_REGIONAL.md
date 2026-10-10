# Regional pricing — approved 10 Oct 2026 (not yet entered)

Approved by the owner. **Nothing below has been saved in either console yet.**
Enter in App Store Connect and Play Console, then tick each row and re-read the
table after saving (Play bulk edits have silently skipped Tunisia and Libya before).

## Global prices

| Product | Global (USD) | Change |
|---|---|---|
| `namflix.premium.monthly` | **$7.99** | unchanged |
| `namflix.premium.yearly` | **$39.99** | unchanged |
| `namflix.premium.lifetime` | **$49.99** | **cut from $99.99** — product already exists on both stores |

Rule: Gulf ≈ **50 %** of global, other Arab countries ≈ **25 %**, nearest local
price point the console allows. Where a cell shows two values it is
**App Store / Play** (Apple bills those storefronts in USD, Play in local currency).

The new regional rows **replace** every existing override on these countries,
including Lifetime's old ones (Play: SAR 429.99, AED 384.99, QAR 365, EGP 1,499.99,
tier B ≈ $49.99, Yemen $37.99; iOS Egypt E£1,299.99) and monthly's old SA / AE / EG
prices (SAR 34.99, AED 29.99, E£99.99).

## Gulf (~50 %)

| Country | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇸🇦 SA | 14.99 SAR | 74.99 SAR | 94.99 SAR |
| 🇦🇪 AE | 14.99 AED | 72.99 AED | 91.99 AED |
| 🇶🇦 QA | 14.99 QAR | 72.99 QAR | 90.99 QAR |
| 🇰🇼 KW | $3.99 / 1.250 KWD | $19.99 / 6.150 KWD | $24.99 / 7.650 KWD |
| 🇧🇭 BH | $3.99 / 1.500 BHD | $19.99 / 7.500 BHD | $24.99 / 9.400 BHD |
| 🇴🇲 OM | $3.99 / 1.550 OMR | $19.99 / 7.700 OMR | $24.99 / 9.600 OMR |

## Other Arab countries (~25 %)

| Country | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇪🇬 EG | 96.99 EGP | 484.99 EGP | 604.99 EGP |
| 🇲🇦 MA | $1.99 / 17.99 MAD | $9.99 / 90.99 MAD | $12.49 / 113.99 MAD |
| 🇩🇿 DZ | $1.99 / 260 DZD | $9.99 / 1,300 DZD | $12.49 / 1,600 DZD |
| 🇹🇳 TN | $1.99 / 5.900 TND | $9.99 / 29.500 TND | $12.49 / 36.900 TND |
| 🇯🇴 JO | $1.99 / 1.390 JOD | $9.99 / 7.090 JOD | $12.49 / 8.890 JOD |
| 🇮🇶 IQ | $1.99 / 2,500 IQD | $9.99 / 13,000 IQD | $12.49 / 16,250 IQD |
| 🇱🇧 LB | $1.99 | $9.99 | $12.49 |
| 🇱🇾 LY | $1.99 | $9.99 | $12.49 |
| 🇾🇪 YE | $1.99 | $9.99 | $12.49 |
| 🇵🇸 PS | $1.99 (Play only, if offered) | $9.99 | $12.49 |
| 🇲🇷 MR | $1.99 (App Store only — not a Play billing region) | $9.99 | $12.49 |
| 🇸🇩 SD, 🇸🇾 SY | not sold (sanctions) | — | — |

Currencies pegged to the dollar (Gulf, JOD) are exact. EGP, MAD, DZD, TND and IQD were
converted at approximate rates (≈48.5, 9.1, 130, 2.95, 1,310 per USD): pick the nearest
value the console offers and check it against the console's own conversion.

## Also pending with these prices

- RevenueCat: attach the **Play** `namflix.premium.lifetime` to entitlement `premium`
  and to the `$rc_lifetime` package of the `default` offering. Keep it
  **non-consumable** (Play: "Allow users to purchase more than one" stays OFF).
- Update the "Pricing" tables in `HANDOFF.md` and `store/android/PLAY_CONSOLE_SETUP.md`
  once the prices are saved.
