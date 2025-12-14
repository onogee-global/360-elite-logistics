# 360 Logistics – E-commerce Web Application

## Project Overview

This project is a modern e-commerce web application for product ordering **without online payment**.

The system allows users to browse products, add them to a cart, and submit orders.  
Orders are saved to the database and automatically sent via email.

The application is bilingual (Serbian / English) and SEO optimized.

❗ **Admin panel is NOT included in this scope.**  
Products, categories, and variations are managed directly in the database.

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
  - Default image (optional, used as fallback)
  - Active / inactive status

### Product Variations (Types)

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
- A product may have:
  - Multiple variations, or
  - A single default variation

Each variation contains:

- Name (SR / EN)
- Price (can differ per variation)
- Image (optional; overrides product image when selected)
- Active / inactive status

---

### Product Listing Behavior

- Products are listed **once** in the shop
- Variations are selectable **on product details page**
- If a product has only one variation:
  - Variation is auto-selected
  - No selection UI is required
- Product image behavior:
  - Listing uses product image
  - Product details uses:
    - selected variation image (if present), else
    - product image (fallback)

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
  - Image (variation image if present, else product image)
  - Unit price
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
  2. Save order and items to database
  3. Send order via email
  4. Show confirmation message

---

### Authentication

- User registration
- Login
- Logout
- Implemented using **Supabase Auth**

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
- `image_url`
- `active`

### product_variations

- `id`
- `product_id`
- `name_sr`
- `name_en`
- `price`
- `image_url`
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
- `price`

### users

- Supabase Auth
- Optional additional table:
  - user_profiles (full_name, phone)

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

- Admin panel
- Online payments
- Product management UI
- Order management UI
- Analytics dashboard

---

## Development Notes for Cursor

- Supabase is the **single source of truth**
- Products and variations are **seeded manually**
- Cart and orders operate on **variation level**
- Clean, reusable component structure
- No admin-related logic
- All secrets stored in environment variables

---

## Delivery Timeline

Estimated duration: **20 working days**

Phases:

1. Project setup & database
2. Shop, cart & product details
3. Variation selection logic
4. Checkout & email system
5. Static pages & translations
6. SEO optimization & deployment

---

## Deployment

- Frontend: **Vercel**
- Database & Auth: **Supabase**
- Email service: SMTP provider

---

## Notes

This document represents the **final agreed project scope**.

Any feature not explicitly listed (admin panel, payments, dashboards)  
is considered **out of scope** and requires a separate agreement.
