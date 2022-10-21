
SET check_function_bodies = false;
CREATE TABLE public.document_tag (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    tag_id bigint NOT NULL,
    color integer NOT NULL
);
CREATE SEQUENCE public.document_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.document_tag_id_seq OWNED BY public.document_tag.id;
CREATE TABLE public.documents (
    id bigint NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    date_added date DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;
CREATE TABLE public.snippets (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    tag_id bigint NOT NULL,
    "offset" bigint NOT NULL,
    length bigint NOT NULL
);
CREATE SEQUENCE public.snippets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.snippets_id_seq OWNED BY public.snippets.id;
CREATE TABLE public.tags (
    id bigint NOT NULL,
    name text NOT NULL
);
CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;
ALTER TABLE ONLY public.document_tag ALTER COLUMN id SET DEFAULT nextval('public.document_tag_id_seq'::regclass);
ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);
ALTER TABLE ONLY public.snippets ALTER COLUMN id SET DEFAULT nextval('public.snippets_id_seq'::regclass);
ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);
ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_document_id_tag_id_key UNIQUE (document_id, tag_id);
ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.snippets
    ADD CONSTRAINT snippets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.snippets
    ADD CONSTRAINT snippets_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.snippets
    ADD CONSTRAINT snippets_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE "public"."documents" ALTER COLUMN "date_added" TYPE timestamp;
alter table "public"."documents" rename column "date_added" to "time_added";

alter table "public"."document_tag" drop constraint "document_tag_document_id_tag_id_key";
