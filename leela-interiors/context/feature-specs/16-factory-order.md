# Feature 16 — Factory Order

Production order sent to the factory after the final drawing is approved. Replaces the manual Excel form.

## Rules
- Never contains rates, amounts, GST, margin or any client pricing — not in the DB, API payloads, or exports.
- Tables: `factory_orders` (header + status timestamps) and `factory_order_items` (separate table, not JSONB — items are edited row by row). Both RLS `auth.uid() = user_id`.
- Number format `FO-YYYY-NNN`, generated server-side like costings/invoices.
- Items: section (cabinet/shutter/accessories/hardware/other), description, width/height/depth (mm), qty, material, finish, hardware, remarks, sort_order, `meta` jsonb (exposed_sides, grain H/V, side L/R/B, shelf_type GL/BRD, shelf_qty, shutter_type).
- Header also holds order_date, required_date, site_address, contact_person/phone, drawing_ref/revision and one drawing file (private storage bucket `factory-drawings`, path `<user_id>/<order_id>/...`, served via signed URL from `GET /api/factory-orders/[id]/drawing`). Costing prefill sets site_address from client address and contact_phone from client phone.
- Status: draft → sent → in_production → ready → delivered; forward-only, one step at a time (`lib/factory-order.ts`).

## Flow
- "Factory Order" button on costing detail → `POST /api/factory-orders {costingId}`. Prefills client name, box/shutter colour and items (description + qty only; kitchen→cabinet, accessories, hardware; civil skipped) via `mapCostingToFactoryItems`. One order per costing.
- Editor at `/factory-orders/[id]`; save replaces items via `PUT`.
- Export (Excel + PDF share one readable layout, not the old Excel form): company-name banner (business profile), order details grid, one table per section with clear headers (W/H/D mm, Qty, Material, Finish, Hardware, Details, Remarks), qty totals, notes. Excel is one "Factory Order" sheet. Filename `FO2026001-ClientName-DDMMYYYY`.
