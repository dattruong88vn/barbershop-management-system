-- Run on Shared Data DB.
-- Replace placeholders before running.

create role "<shared-location-readonly-user>" with
  login
  password '<shared-location-readonly-password>';

grant connect on database postgres to "<shared-location-readonly-user>";
grant usage on schema public to "<shared-location-readonly-user>";
grant select on table public.provinces to "<shared-location-readonly-user>";
grant select on table public.wards to "<shared-location-readonly-user>";

alter default privileges in schema public
  grant select on tables to "<shared-location-readonly-user>";
