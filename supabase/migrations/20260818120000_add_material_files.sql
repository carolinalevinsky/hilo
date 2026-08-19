-- Uploading a material you already have: a scan, or a photo of a worksheet.
--
-- v1 had no such thing — everything was typed. But a practitioner arrives with
-- years of material already made, in a folder and a filing cabinet, and asking
-- them to retype it is asking them not to bother.

alter table materials
  -- `<practitioner_id>/<material_id>` inside the bucket below. A path, never the
  -- bytes: v1 put a base64 image inside the patient row and that is how a record
  -- came to weigh 200 KB.
  add column file_path text,
  -- Kept so the page knows whether to draw a picture or a PDF frame without
  -- fetching the object first.
  add column file_type text;

-- ─── The bucket ───────────────────────────────────────────────────────────
--
-- Private, like `patient-photos`, and for a reason that is worth stating even
-- though a worksheet is not a clinical record: **a photo taken in a consulting
-- room can have a child's name written on the page**. The upload form says so
-- before you choose a file. Private means the URL alone grants nothing, and the
-- app hands out short-lived signed URLs.
--
-- HEIC is in the list because that is what an iPhone produces by default, and a
-- practitioner photographing a worksheet on the way out of a session is the
-- whole use case.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'material-files',
  'material-files',
  false,
  10 * 1024 * 1024,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
);

-- ─── Reading ──────────────────────────────────────────────────────────────
--
-- Two ways in, and the second is the one that needs care: a material published
-- to the community is readable by every practitioner, so its file has to be too
-- — otherwise the library shows a title with a broken attachment under it.
--
-- The check reads `materials` rather than trusting the path, so unpublishing a
-- material takes its file out of everyone else's reach in the same instant. It
-- is a subquery on one row per signed URL, which is the right place to spend it.

create policy "material_files_read" on storage.objects
  for select
  using (
    bucket_id = 'material-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.materials
        where materials.id::text = storage.filename(name)
          and materials.visibility = 'public'
      )
    )
  );

-- ─── Writing ──────────────────────────────────────────────────────────────
--
-- Own folder only, and deliberately *not* widened by `visibility`. Publishing
-- makes a file readable; it does not make it replaceable. Same rule as the
-- `materials` row itself — see `src/server/rls.test.ts`.

create policy "material_files_write" on storage.objects
  for insert
  with check (
    bucket_id = 'material-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "material_files_update" on storage.objects
  for update
  using (
    bucket_id = 'material-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "material_files_delete" on storage.objects
  for delete
  using (
    bucket_id = 'material-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
