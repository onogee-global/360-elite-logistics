# 360 Logistic – E-commerce Web Application

## Project Overview

Modern e-commerce web application for ordering products **without online payment**.

Users browse products, select an option (base product or variation), add to cart, and submit orders.  
Orders are saved in Supabase and sent via email.

The application is bilingual (SR/EN), SEO optimized, and includes an **admin panel**.

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- styled-components
- Supabase (DB + Auth)
- Vercel hosting
- SMTP / transactional email

---

## Core Concept (IMPORTANT)

### One product = selectable options

On product detail page, the user always selects from **options**:

- **Base option** (the main product itself) — always shown
- **Variation options** — shown only if variations exist

Rules:

- If product has **no variations** → show only the base option (auto-selected).
- If product has **variations** → show base option + variations, with base option selected by default.
- Base option and variations are treated the same in the UI (select one option to add to cart).

---

## Pricing & Images (Source of Truth)

Each selectable option has its own price and image:

- Base option uses `products.price` and `products.image_url`
- Variation option uses `product_variations.price` and `product_variations.image_url`

UI always displays:

- `selectedOption.price`
- `selectedOption.image_url`

---

## Product Detail Selection UI

Options list example:

- ✅ Base product option (default selected)
- Variation: Paprika
- Variation: Cheese
- Variation: Sour Cream

Behavior:

- Default selected option is the base product option.
- User can switch selection to a variation.
- Add to cart uses the currently selected option.

---

## Cart Rules

Cart items are based on a unified “option” model:

Each cart item contains:

- `product_id` (always)
- `variation_id` (nullable: null = base option)
- localized option name
- unit price snapshot
- option image
- qty

Cart groups items by:

- `variation_id` if present
- otherwise by `product_id` for base option

---

## Checkout

- Only authenticated users can checkout (Supabase Auth)
- Required fields: phone, optional note
- Creates:
  - `orders`
  - `order_items` per cart line:
    - base option → `variation_id = null`
    - variation option → `variation_id = <id>`
- Sends order confirmation email

---

## Admin Panel (IN SCOPE)

Admin panel manages catalog and orders.

### Categories

- CRUD
- parent/child categories

### Products

- CRUD
- Must include price + image (for base option)
- activate/deactivate

### Variations (optional)

- CRUD per product
- Each variation must include price + image
- activate/deactivate

### Orders

- orders list + details
- optional status updates

---

## Database Structure (Supabase)

### categories

- id, name_sr, name_en, parent_id

### products

- id
- category_id
- name_sr
- name_en
- price
- image_url
- active

### product_variations

- id
- product_id
- name_sr
- name_en
- price
- image_url
- active

### orders

- id, user_id, phone, note, total, status, created_at

### order_items

- id
- order_id
- product_id
- variation_id (nullable)
- qty
- price (unit price snapshot)

### user_profiles (optional)

- user_id, full_name, phone, is_admin

---

## i18n & SEO

- SR/EN translations
- hreflang tags
- meta tags + OG
- sitemap.xml + robots.txt
- schema.org/Product

---

## Out of Scope ❌

- Online payments
- Subscription plans
- Advanced analytics dashboards

---

## Deployment

- Vercel (frontend)
- Supabase (DB/Auth)
- SMTP provider for emails

---

## Final Note

This document is the single source of truth for scope and behavior.
