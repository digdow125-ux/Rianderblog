# RIANDERBLOG Promotion Hub

A separate marketing workspace hosted in the existing GitHub Pages project at:

https://digdow125-ux.github.io/Rianderblog/promotion-hub/

## Included in this first release
- Supabase email/password sign-in and private per-user content.
- Reads active product listings from the existing `public.products` table.
- AI social caption generation through the private `promo-generate` Edge Function.
- Save drafts and schedule ideas in the new `public.promo_posts` table.
- Copy captions for manual posting.

## Important
This release does **not** publish automatically to Facebook, Instagram, TikTok, YouTube, X, or WhatsApp. Each platform needs its own developer app, OAuth consent, permissions, and access tokens. WhatsApp Business messaging is not the same as publishing WhatsApp Status.

## Required setup
1. In Supabase Dashboard, open Project Settings / API and confirm the project URL and publishable key used in `index.html`.
2. In Supabase Dashboard, open Edge Functions / Secrets and add:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key from Google AI Studio
3. In Supabase Authentication / URL Configuration, add this exact URL to the allowed Redirect URLs:
   `https://digdow125-ux.github.io/Rianderblog/promotion-hub/`
4. Wait for GitHub Pages to publish the new folder, then open the URL above.
5. Create an account or sign in. Use the same email/password account consistently.

## Database
The additive migration created `public.promo_posts`, with Row Level Security enabled. Each signed-in user can only manage their own posts. The existing marketplace tables and payment functions were not changed.

## Next release
Connect social platform APIs one at a time, then add a secure publishing worker and scheduled execution. Do not paste social access tokens or secret API keys into this repository or browser code.
