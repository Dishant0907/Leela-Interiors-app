# Leela Interiors — Business Management App

## Overview

A full-stack business management application for Leela Interiors, a kitchen interior company based in Gurgaon, India. The owner uses it to create itemised costings for kitchen projects, convert them to formal invoices, track payment milestones, and manage client records — all stored in Supabase and accessible from any device.

## Goals

1. Replace the manual Excel-based costing workflow with a fast, reliable web app.
2. Generate print-ready costing and invoice documents that match the existing brand format.
3. Persist all records in Supabase so data is never lost and is accessible from any device.
4. Track per-project payment stages (advance, pre-delivery, completion) and outstanding balances.
5. Maintain a master price list so item rates are consistent across all new costings.
6. Give the owner a dashboard overview of monthly activity and outstanding payments.

## Core User Flow

1. Owner signs in with email and password.
2. Owner creates a new costing — fills in client details, adds line items across four sections.
3. App calculates totals live; GST (18%) is applied only on the Kitchen Cabinet Work section.
4. Owner previews the costing and saves it. A costing number (`LI-YYYY-DDMMYYYY`) is assigned.
5. Owner prints or exports the costing as PDF.
6. Owner converts the costing to a formal invoice with one click.
7. Owner records payment milestones against the invoice.
8. Owner searches past costings and invoices from the dashboard.

## Features

### Costing Module

- Multi-section line-item form: Kitchen Cabinet Work, Accessories, Hardware, Civil Work
- Inline add/remove rows per section
- Auto-calculated row amount (qty × rate) and section subtotals
- Freight & Fitting as a fixed charge field
- GST (18%) applied only on Kitchen Cabinet Work section total
- Shutter and cabinet colour fields (Top Shutter, Base Shutter, Cabinet)
- Terms & Conditions block on every printed document
- Live costing preview updates on every keystroke
- Costing number format: `LI-YYYY-DDMMYYYY`

### Invoice Module

- Convert any saved costing to a formal invoice in one click
- Invoice number format: `INV-YYYY-DDMMYYYY`
- Line items locked after invoice creation (snapshot of costing)
- Print / PDF export

### Payment Tracking

- Three payment stages per invoice: Advance (60%), Pre-Delivery (30%), Completion (10%)
- Record date and amount received per stage
- Outstanding balance calculated automatically
- Payment status badge: Pending / Partial / Paid

### Client Management

- Client record: name, phone, address, reference source
- All costings and invoices linked to a client
- Client history view showing all past work

### Item Master (Price List)

- Owner maintains standard items with default rates, grouped by section
- Costing form uses item master for autocomplete suggestions
- Updating master rates does not retroactively change saved costings

### Dashboard

- Summary cards: quotes this month, total invoiced, outstanding payments
- Recent costings list with quick links
- Search by client name or costing number

## Scope

### In Scope

- Costing creation and PDF export
- Invoice generation from costing
- Payment milestone tracking
- Client records
- Item master price list
- Supabase auth and database persistence
- Dashboard with search

### Out of Scope

- Multi-user / team access (single owner login only)
- Inventory or stock management
- Accounting / GST filing integration
- Mobile native app (responsive web only)
- WhatsApp or email sending of documents

## Success Criteria

1. Owner can create a complete costing in under 3 minutes.
2. Generated PDF matches the brand format: LI logo, COSTING heading, itemised table, black totals block.
3. GST is always calculated only on the Kitchen Cabinet Work subtotal.
4. All records persist in Supabase and survive page refresh or device change.
5. Costing number `LI-YYYY-DDMMYYYY` is assigned automatically on save.
6. Payment stages update correctly and outstanding balance is always accurate.
