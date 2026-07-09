-- business_profile: bank details + terms & conditions (shown on invoices, editable in Settings)
alter table business_profile
  add column bank_account_no text,
  add column bank_ifsc      text,
  add column bank_name      text,
  add column terms_conditions text not null default
    'E.& O.E.
1. Goods once sold will not be taken back.
2. Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.
3. Subject to ''Haryana'' Jurisdiction only.';
