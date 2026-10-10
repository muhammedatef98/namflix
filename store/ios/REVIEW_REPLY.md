# Reply to App Review — Submission 0fd107a5-e484-4f4b-850a-9ffda086ac1a

Paste into "Reply to App Review" in App Store Connect after the new build is uploaded.

---

Hello, and thank you for the detailed review.

We have removed accounts from Namflix entirely. There is no sign-in, no email
address collected, and no user data held on any server. The app opens straight
into its content. This addresses two of your findings at their source:

**Guideline 2.1(a) — OTP could not be verified**

Our authentication logs confirmed the cause: the email was delivering a sign-in
link rather than the numeric code the app asked for, so there was no code to
enter. Rather than repair that flow, we removed it. Nothing to sign in to means
nothing that can fail to sign in.

**Guideline 5.1.1(v) — Account deletion**

The app no longer supports account creation, so there is no account to delete.
All data — preferences, favourites, nightly check-ins — is stored solely on the
device and is removed with the app. The privacy policy has been updated to state
this.

**Guideline 2.3.2 — Promotional image for the "Monthly" subscription**

**Build 14 (18 Aug 2026): duplicate promotional images.** "Monthly" and
"Lifetime" carried the same image file. Because we do not promote any in-app
purchase on the App Store, the "Monthly" image has been **deleted outright**
rather than replaced.

Exactly one promotional image now exists across all three products — a single
image on "Lifetime", kept only so that offer-code redemptions have artwork.
"Monthly" and "Yearly" have none. No duplicates remain.

The earlier build-13 issue stands resolved too: the remaining Lifetime image is
original artwork made for this purpose — not a screenshot, no price, no plan
name.

*(Correction to the previous reply: deleting a subscription image **is**
possible. The Delete control is simply hidden while a submission is open — the
file inputs are disabled until the submission is cancelled.)*

Subscriptions are unaffected: they remain tied to the user's Apple ID and are
recoverable via "Restore purchases" on the plans screen.

Thank you for your time.
