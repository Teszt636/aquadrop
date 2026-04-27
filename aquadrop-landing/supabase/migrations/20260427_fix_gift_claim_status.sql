update public.gift_claims
set status = 'Új'
where status = 'uj';

alter table public.gift_claims
alter column status set default 'Új';

alter table public.gift_claims
drop constraint if exists gift_claims_status_check;

alter table public.gift_claims
add constraint gift_claims_status_check
check (status in ('Új', 'Feldolgozás alatt', 'Kész', 'Elutasítva'));
