
alter table "public"."document_tag" add constraint "document_tag_document_id_tag_id_key" unique ("document_id", "tag_id");

alter table "public"."documents" rename column "time_added" to "date_added";
ALTER TABLE "public"."documents" ALTER COLUMN "date_added" TYPE date;
