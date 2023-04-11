alter table "public"."user_nlp_job" add constraint "user_nlp_job_user_id_job_id_key" unique ("user_id", "job_id");
