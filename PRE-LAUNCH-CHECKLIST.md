# NEXIFI — Pre-Launch Checklist

Things that must be addressed before going live. Items are added as we build sprints.
Check off each item as it's completed.

---

## Critical (Must fix before launch)

### Backend / Data Integrity
- [ ] **Transaction wrapping for orders** — Order insert + items insert + stock decrement are separate DB calls. Wrap in a single Supabase RPC function so partial failures don't create orphan data.
- [ ] **Store settings from DB** — COD charge, GST %, free shipping threshold are currently env vars with hardcoded fallbacks. Move to `store_settings` table so admin can change without redeploy.

### Payments
- [ ] **PhonePe Business integration** — Currently stubbed (501). Need merchant credentials (MERCHANT_ID, SALT_KEY, SALT_INDEX) to wire up online payments.

### Notifications
- [ ] **Order confirmation email** — Use Resend to send email on order placement (order number, items, total, shipping address).
- [ ] **Order status update emails** — Notify customer when order is shipped/delivered.

### Admin Panel
- [ ] **Wire all admin pages to real Supabase data** — Currently all 13 admin pages show hardcoded mock data. Need to replace with real queries.

### Product Images
- [ ] **Replace placeholder images** — All products use placehold.co images. Upload real product photos to Supabase Storage before launch.

---

## Important (Should fix before launch)

### Security
- [ ] **Rate limiting on API routes** — Prevent abuse of order creation, coupon validation endpoints.
- [ ] **CSRF protection** — Verify Next.js default protections are sufficient for API routes.

### SEO & Performance
- [ ] **Open Graph / meta tags** — Verify all pages have proper OG tags for social sharing.
- [ ] **Image optimization** — Configure next/image for production CDN.
- [ ] **Error pages** — Custom 404 and 500 pages with NEXIFI branding.

### User Experience
- [ ] **Order tracking page** — Allow customers to check order status by order number.
- [ ] **Mobile testing** — Full end-to-end testing on real mobile devices.

---

## Nice to Have (Post-launch)

- [ ] Customer login/signup (currently guest-only)
- [ ] Wishlist functionality
- [ ] Product reviews system
- [ ] Analytics dashboard with real metrics
- [ ] Inventory low-stock alerts

---

*Last updated: Sprint 4 completion*
