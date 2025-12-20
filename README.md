# 360 Logistics – E-commerce Web Application

## Project Overview

This project is a modern e-commerce web application for product ordering **without online payment**.

The system allows users to browse products, add them to a cart, and submit orders.  
Orders are saved to the database and automatically sent via email.

The application is bilingual (Serbian / English) and SEO optimized.

✅ **Admin panel IS included in scope.**  
Products, categories and variations are managed via the admin area.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: styled-components
- **Backend / DB / Auth**: Supabase
- **Hosting**: Vercel + Supabase
- **Emails**: SMTP / transactional email service

---

## Core Features

### Product Catalog

- Products displayed by **categories and subcategories**
- Around **350 products**
- Each product represents a **single base item** (e.g. Chips)
- Product fields:
  - Name (SR / EN)
  - Default image (optional fallback only)
  - Active / inactive status

### Product Variations (Types) – Price & Image per Variation

Each product can have **multiple variations (types)**.

Variations represent the **same product** with different attributes, such as:

- Flavor
- Size
- Type

Example:

- Product: Chips
  - Type: Paprika
  - Type: Cheese
  - Type: Sour Cream

Rules:

- Variations belong to **one product**
- Variations are **not separate products**
- Cart and orders operate on **variation level** (`variation_id`)

✅ **Important rule (source of truth):**

- **Each variation has its own `price` and its own `image_url`.**
- UI shows the selected variation’s price and image.

Each variation contains:

- Name (SR / EN)
- Price (required)
- Image (required)
- Active / inactive status

---

### Product Listing Behavior

- Products are listed **once** in the shop (no duplication for variations)
- Variations are selectable **on product details page**
- If a product has only one active variation:
  - Variation is auto-selected
  - No selection UI is required

Image & price behavior:

- Product details show:
  - `selectedVariation.image_url` (fallback to product image only if needed)
  - `selectedVariation.price`

---

### Cart

- Cart items are based on **product variations**
- User must select a variation before adding to cart
- Cart functionality:
  - Add items
  - Update quantity
  - Remove items
- Cart displays:
  - Product name
  - Selected variation (type)
  - Image (variation image)
  - Unit price (variation price)
  - Quantity
  - Subtotal

---

### Checkout (Authenticated Only)

- Only logged-in users can place orders
- Required fields:
  - Phone number
  - Optional note
- Checkout flow:
  1. Validate cart
  2. Save order and items to database (variation-level)
  3. Send order via email
  4. Show confirmation message

---

### Authentication

- User registration
- Login
- Logout
- Implemented using **Supabase Auth**

---

## Admin Panel

Admin panel is included to manage catalog and orders.

### Admin Features

- Categories CRUD (supports parent/child categories)
- Products CRUD (base product entity)
- Product Variations CRUD:
  - create/update variation name (SR/EN)
  - **set variation price (required)**
  - **set variation image (required)**
  - activate/deactivate variation
- Orders:
  - list orders
  - order details view
  - optional status update (if needed)

### Admin Access Control

- Admin routes must be protected
- Only authorized admin users can access admin pages
- Non-admin users must not be able to write to catalog tables

---

## Static Pages

- Home
- About Us
- Contact
- Delivery Information

All pages support **Serbian and English** languages.

---

## Internationalization (i18n)

- Default language: Serbian
- Secondary language: English
- SEO-friendly structure
- `hreflang` tags implemented

---

## SEO Features

- Meta tags (title, description)
- Open Graph tags
- `sitemap.xml`
- `robots.txt`
- `schema.org/Product` structured data
- Clean URLs
- SEO-optimized static content

---

## Database Structure (Supabase)

### categories

- `id`
- `name_sr`
- `name_en`
- `parent_id`

### products

- `id`
- `category_id`
- `name_sr`
- `name_en`
- `image_url` (optional fallback)
- `active`

### product_variations

- `id`
- `product_id`
- `name_sr`
- `name_en`
- `price` (required)
- `image_url` (required)
- `active`

### orders

- `id`
- `user_id`
- `phone`
- `note`
- `total`
- `status`
- `created_at`

### order_items

- `id`
- `order_id`
- `product_id`
- `variation_id`
- `qty`
- `price` (unit price snapshot)

### users

- Supabase Auth
- Optional additional table:
  - user_profiles (full_name, phone, admin flag/role if used)

---

## Email Order System

- On successful checkout:
  - Order is saved in Supabase
  - Order details are sent via email
- Email includes:
  - Customer info
  - Products
  - Selected variations (types)
  - Quantities
  - Prices
  - Total amount
  - User note

---

## Out of Scope ❌

- Online payments
- Analytics dashboard
- Multi-warehouse logistics logic (if not specified)
- Anything not listed under Core Features / Admin Panel

---

## Development Notes for Cursor

- Supabase is the **single source of truth**
- Catalog writes happen only via **Admin Panel** (authorized admins)
- Public shop is read-only for catalog data
- Cart and orders operate strictly on **variation level**
- Clean, reusable component structure
- All secrets stored in environment variables

---

## Delivery Timeline

Estimated duration: **20 working days** (adjust if admin scope expands)

Phases:

1. Project setup & database
2. Shop, cart & product details
3. Variation selection logic
4. Checkout & email system
5. Admin panel (catalog + orders)
6. Static pages, translations, SEO, testing & deployment

---

## Deployment

- Frontend: **Vercel**
- Database & Auth: **Supabase**
- Email service: SMTP provider

---

## Notes

This document represents the **final agreed project scope**.

Any feature not explicitly listed (payments, dashboards, extra modules)  
is considered **out of scope** and requires a separate agreement.
