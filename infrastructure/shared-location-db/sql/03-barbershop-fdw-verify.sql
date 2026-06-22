-- Run on Barbershop DB after importing foreign tables.

select count(*) as active_province_count
from reference_data.provinces
where is_active = true;

select count(*) as active_ward_count
from reference_data.wards
where is_active = true;

select code, full_name, province_code
from reference_data.wards
where province_code = '<province-code>'
  and is_active = true
order by name
limit 10;
