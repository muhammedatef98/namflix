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

The image has been replaced with original artwork created for this purpose. It
is not a screenshot of the app, and it carries no price and no plan name — only
the app mark and what the tier grants. (App Store Connect offers no way to
delete a subscription image once set, only to replace it, which is why it was
replaced rather than removed.)

Subscriptions are unaffected: they remain tied to the user's Apple ID and are
recoverable via "Restore purchases" on the plans screen.

Thank you for your time.
