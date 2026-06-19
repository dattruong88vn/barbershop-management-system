-- Run on Barbershop DB.
-- Replace placeholders with Shared Location DB direct/session endpoint and read-only credentials.

create extension if not exists postgres_fdw with schema extensions;

create schema if not exists reference_data;

drop server if exists shared_location_server cascade;

create server shared_location_server
  foreign data wrapper postgres_fdw
  options (
    host '<shared-db-host>',
    port '5432',
    dbname 'postgres',
    sslmode 'require'
  );

create user mapping for postgres
  server shared_location_server
  options (
    user '<shared-location-readonly-user>',
    password '<shared-location-readonly-password>'
  );

import foreign schema public
  limit to (provinces, wards)
  from server shared_location_server
  into reference_data;
