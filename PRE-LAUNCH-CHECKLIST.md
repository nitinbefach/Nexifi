# NEXIFI — Pre-Launch Checklist

Things that must be addressed before going live. Items are added as we build sprints.
Check off each item as it's completed.

---

## Critical (Must fix before launch)

### Backend / Data Integrity
- [x] **Transaction wrapping for orders** — Wrapped in single `create_order_transaction()` RPC function. All writes (order + items + stock + coupon) are atomic.
- [x] **Store settings from DB** — Admin Settings page reads/writes `store_settings` table. Order API uses DB values instead of env vars.

### Payments
- [ ] **PhonePe Business integration** — Currently stubbed (501). Need merchant credentials (MERCHANT_ID, SALT_KEY, SALT_INDEX) to wire up online payments.

### Notifications
- [ ] **Order confirmation email** — Use Resend to send email on order placement. Deferred until Resend API key + domain configured.
- [ ] **Order status update emails** — Notify customer when order is shipped/delivered. Deferred until Resend configured.

### Admin Panel
- [x] **Wire all admin pages to real Supabase data** — All admin pages (Dashboard, Products, Categories, Orders, Customers, Settings) use real Supabase queries.

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
- [x] **Error pages** — Custom 404 and 500 pages with NEXIFI branding.
- [x] **Sitemap** — Dynamic sitemap includes all products, categories, and static pages.

### User Experience
- [x] **Order tracking page** — Customers can check order status at `/track-order` by entering order number.
- [ ] **Mobile testing** — Full end-to-end testing on real mobile devices.

---

## Nice to Have (Post-launch)

- [ ] Customer login/signup (currently guest-only)
- [ ] Wishlist functionality
- [ ] Product reviews system
- [ ] Analytics dashboard with real metrics
- [ ] Inventory low-stock alerts

---

*Last updated: Pre-launch fixes sprint*
