do $$
begin
  if exists (
    select 1
    from public.b2b_email_campaign_recipients
    where campaign_id is not null
    group by campaign_id, lower(email)
    having count(*) > 1
  ) then
    raise exception
      'Cannot add b2b_email_campaign_recipients_campaign_email_unique: duplicate campaign_id + email rows exist. Clean up duplicate test recipients manually before rerunning this migration.';
  end if;
end $$;

update public.b2b_email_campaign_recipients
set email = lower(trim(email))
where email <> lower(trim(email));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'b2b_email_campaign_recipients_campaign_email_unique'
      and conrelid = 'public.b2b_email_campaign_recipients'::regclass
  ) then
    alter table public.b2b_email_campaign_recipients
      add constraint b2b_email_campaign_recipients_campaign_email_unique
      unique (campaign_id, email);
  end if;
end $$;
