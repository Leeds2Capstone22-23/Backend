CREATE TABLE "public"."users" ("id" bigserial NOT NULL, "username" text NOT NULL, "password" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("username"));
