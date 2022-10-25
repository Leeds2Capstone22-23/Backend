
alter table "public"."snippets" drop constraint "snippets_label_id_fkey";

alter table "public"."snippets"
  add constraint "snippets_tag_id_fkey"
  foreign key ("label_id")
  references "public"."labels"
  ("id") on update restrict on delete restrict;

alter table "public"."document_label" drop constraint "document_label_label_id_fkey";

alter table "public"."document_label" drop constraint "document_label_document_id_fkey";

alter table "public"."document_label"
  add constraint "document_tag_tag_id_fkey"
  foreign key ("label_id")
  references "public"."labels"
  ("id") on update restrict on delete restrict;

alter table "public"."document_label"
  add constraint "document_tag_document_id_fkey"
  foreign key ("document_id")
  references "public"."documents"
  ("id") on update restrict on delete restrict;


alter table "public"."snippets" rename column "char_offset" to "offset";

alter table "public"."snippets" rename column "label_id" to "tag_id";

alter table "public"."document_label" alter column "color" drop not null;
alter table "public"."document_label" add column "color" int4;

alter table "public"."document_label" rename to "document_tag";

alter table "public"."document_tag" rename column "label_id" to "tag_id";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."labels" add column "color" integer
--  null;

alter table "public"."labels" rename to "tags";


alter table "public"."document_tag" add constraint "document_tag_document_id_tag_id_key" unique ("document_id", "tag_id");

alter table "public"."documents" rename column "time_added" to "date_added";
ALTER TABLE "public"."documents" ALTER COLUMN "date_added" TYPE date;
