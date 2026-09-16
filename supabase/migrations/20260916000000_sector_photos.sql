-- =============================================================================
-- Photos des secteurs (cartes « Explorer par secteur » de l'accueil)
--
-- Avant de l'appliquer : supabase/preflight/20260916000000_sector_photos.sql
-- Pour l'annuler     : supabase/rollbacks/20260916000000_sector_photos.sql
--
-- Une ligne par section NAF (lettre A à U). Lecture publique, aucune écriture
-- depuis l'app : les photos se changent depuis le SQL Editor ou le Table Editor.
-- Photos initiales : StockSnap, licence CC0 (usage libre, attribution non requise),
-- page d'origine conservée dans source_url.
-- Idempotente : le seed n'écrase jamais une photo modifiée à la main.
-- =============================================================================

create table if not exists public.sector_photos (
  section text primary key check (section ~ '^[A-U]$'),
  image_url text not null check (image_url ~ '^https://'),
  source_url text check (source_url ~ '^https://'),
  updated_at timestamptz not null default now()
);

comment on table public.sector_photos is
  'Photo d''illustration de chaque section NAF. Aucune donnée utilisateur. Écriture réservée au dashboard.';

create or replace trigger sector_photos_set_updated_at
  before update on public.sector_photos
  for each row execute function public.set_updated_at();

alter table public.sector_photos enable row level security;

select public.create_policy_if_missing(
  'sector_photos', 'Photos de secteur visibles par tous',
  'for select to anon, authenticated using (true)'
);
-- Pas de policy insert/update/delete.

grant select on public.sector_photos to anon, authenticated;
grant all on public.sector_photos to service_role;

insert into public.sector_photos (section, image_url, source_url) values
  ('A', 'https://cdn.stocksnap.io/img-thumbs/960w/RQFZWA5OOP.jpg', 'https://stocksnap.io/photo/green-farm-RQFZWA5OOP'),
  ('B', 'https://cdn.stocksnap.io/img-thumbs/960w/R5W06MKL9I.jpg', 'https://stocksnap.io/photo/aerial-view-R5W06MKL9I'),
  ('C', 'https://cdn.stocksnap.io/img-thumbs/960w/B144524308.jpg', 'https://stocksnap.io/photo/industrial-factory-B144524308'),
  ('D', 'https://cdn.stocksnap.io/img-thumbs/960w/JRS7H54AAV.jpg', 'https://stocksnap.io/photo/wind-turbine-JRS7H54AAV'),
  ('E', 'https://cdn.stocksnap.io/img-thumbs/960w/SVHF6MUWVZ.jpg', 'https://stocksnap.io/photo/glass-water-SVHF6MUWVZ'),
  ('F', 'https://cdn.stocksnap.io/img-thumbs/960w/QDDPZH3YSO.jpg', 'https://stocksnap.io/photo/building-construction-QDDPZH3YSO'),
  ('G', 'https://cdn.stocksnap.io/img-thumbs/960w/I93PW8NE0F.jpg', 'https://stocksnap.io/photo/shop-store-I93PW8NE0F'),
  ('H', 'https://cdn.stocksnap.io/img-thumbs/960w/3148453E5E.jpg', 'https://stocksnap.io/photo/truck-orange-3148453E5E'),
  ('I', 'https://cdn.stocksnap.io/img-thumbs/960w/0HCMIT272C.jpg', 'https://stocksnap.io/photo/restaurant-kitchen-0HCMIT272C'),
  ('J', 'https://cdn.stocksnap.io/img-thumbs/960w/UNB7V2H5L4.jpg', 'https://stocksnap.io/photo/macbook-laptop-UNB7V2H5L4'),
  ('K', 'https://cdn.stocksnap.io/img-thumbs/960w/WX191DV28C.jpg', 'https://stocksnap.io/photo/money-euros-WX191DV28C'),
  ('L', 'https://cdn.stocksnap.io/img-thumbs/960w/2T9NFO4RNI.jpg', 'https://stocksnap.io/photo/apartment-building-2T9NFO4RNI'),
  ('M', 'https://cdn.stocksnap.io/img-thumbs/960w/69TMH4ITIE.jpg', 'https://stocksnap.io/photo/team-meeting-69TMH4ITIE'),
  ('N', 'https://cdn.stocksnap.io/img-thumbs/960w/J4C1WJDMMU.jpg', 'https://stocksnap.io/photo/mop-sweeping-J4C1WJDMMU'),
  ('O', 'https://cdn.stocksnap.io/img-thumbs/960w/D2813D328F.jpg', 'https://stocksnap.io/photo/thehague-netherlands-D2813D328F'),
  ('P', 'https://cdn.stocksnap.io/img-thumbs/960w/HECYA5SP1L.jpg', 'https://stocksnap.io/photo/open-books-HECYA5SP1L'),
  ('Q', 'https://cdn.stocksnap.io/img-thumbs/960w/5YUFL6LC0E.jpg', 'https://stocksnap.io/photo/doctors-hospital-5YUFL6LC0E'),
  ('R', 'https://cdn.stocksnap.io/img-thumbs/960w/5FGWJW4Z5D.jpg', 'https://stocksnap.io/photo/concert-show-5FGWJW4Z5D'),
  ('S', 'https://cdn.stocksnap.io/img-thumbs/960w/S7UEWWIRTD.jpg', 'https://stocksnap.io/photo/hairdresser-cut-S7UEWWIRTD'),
  ('T', 'https://cdn.stocksnap.io/img-thumbs/960w/9G5X445AP9.jpg', 'https://stocksnap.io/photo/house-home-9G5X445AP9'),
  ('U', 'https://cdn.stocksnap.io/img-thumbs/960w/HH2ZMUI6PO.jpg', 'https://stocksnap.io/photo/globe-global-HH2ZMUI6PO')
on conflict (section) do nothing;
