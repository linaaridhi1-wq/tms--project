--
-- PostgreSQL database dump
--

\restrict BxyIVO4iaf3QbaEdC7FfW6DAcNTZARNxBDyJiEVhmjcLmfifhV0tazIRhTn7fhw

-- Dumped from database version 16.2
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tender_scores DROP CONSTRAINT IF EXISTS tender_scores_tender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tender_ai_analysis DROP CONSTRAINT IF EXISTS tender_ai_analysis_tender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.planning_events DROP CONSTRAINT IF EXISTS planning_events_tender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.planning_events DROP CONSTRAINT IF EXISTS planning_events_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_pkey;
ALTER TABLE IF EXISTS ONLY public.utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_email_key1;
ALTER TABLE IF EXISTS ONLY public.utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_email_key;
ALTER TABLE IF EXISTS ONLY public.tenders DROP CONSTRAINT IF EXISTS tenders_pkey;
ALTER TABLE IF EXISTS ONLY public.tender_scores DROP CONSTRAINT IF EXISTS tender_scores_pkey;
ALTER TABLE IF EXISTS ONLY public.tender_ai_analysis DROP CONSTRAINT IF EXISTS tender_ai_analysis_pkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_token_key1;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_token_key;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_libelle_key1;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_libelle_key;
ALTER TABLE IF EXISTS ONLY public.planning_events DROP CONSTRAINT IF EXISTS planning_events_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_code_key1;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_code_key;
ALTER TABLE IF EXISTS ONLY public.knowledge_items DROP CONSTRAINT IF EXISTS knowledge_items_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS public.utilisateurs ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tenders ALTER COLUMN tender_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tender_scores ALTER COLUMN score_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tender_ai_analysis ALTER COLUMN analysis_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submissions ALTER COLUMN submission_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sessions ALTER COLUMN session_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN role_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.planning_events ALTER COLUMN event_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN permission_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.knowledge_items ALTER COLUMN item_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clients ALTER COLUMN client_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.utilisateurs_user_id_seq;
DROP TABLE IF EXISTS public.utilisateurs;
DROP SEQUENCE IF EXISTS public.tenders_tender_id_seq;
DROP TABLE IF EXISTS public.tenders;
DROP SEQUENCE IF EXISTS public.tender_scores_score_id_seq;
DROP TABLE IF EXISTS public.tender_scores;
DROP SEQUENCE IF EXISTS public.tender_ai_analysis_analysis_id_seq;
DROP TABLE IF EXISTS public.tender_ai_analysis;
DROP SEQUENCE IF EXISTS public.submissions_submission_id_seq;
DROP TABLE IF EXISTS public.submissions;
DROP SEQUENCE IF EXISTS public.sessions_session_id_seq;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.roles_role_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP SEQUENCE IF EXISTS public.planning_events_event_id_seq;
DROP TABLE IF EXISTS public.planning_events;
DROP SEQUENCE IF EXISTS public.permissions_permission_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.knowledge_items_item_id_seq;
DROP TABLE IF EXISTS public.knowledge_items;
DROP SEQUENCE IF EXISTS public.clients_client_id_seq;
DROP TABLE IF EXISTS public.clients;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    client_id integer NOT NULL,
    raison_sociale character varying(255) NOT NULL,
    secteur character varying(100),
    contact character varying(255),
    email character varying(255),
    telephone character varying(20),
    pays character varying(100),
    site_web character varying(255),
    notes text,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone
);


--
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_client_id_seq OWNED BY public.clients.client_id;


--
-- Name: knowledge_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_items (
    item_id integer NOT NULL,
    titre character varying(255) NOT NULL,
    categorie character varying(100) NOT NULL,
    secteur character varying(100),
    contenu text NOT NULL,
    usages integer DEFAULT 0,
    note double precision DEFAULT '5'::double precision,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone
);


--
-- Name: knowledge_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knowledge_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knowledge_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knowledge_items_item_id_seq OWNED BY public.knowledge_items.item_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    code character varying(100) NOT NULL,
    description character varying(255)
);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- Name: planning_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planning_events (
    event_id integer NOT NULL,
    titre character varying(255) NOT NULL,
    type character varying(50) DEFAULT 'autre'::character varying,
    date_debut timestamp with time zone NOT NULL,
    date_fin timestamp with time zone,
    client_id integer,
    tender_id integer,
    note text,
    couleur character varying(20) DEFAULT '#7C3AED'::character varying,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone DEFAULT now()
);


--
-- Name: planning_events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planning_events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: planning_events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planning_events_event_id_seq OWNED BY public.planning_events.event_id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    libelle character varying(50) NOT NULL
);


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    session_id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(512) NOT NULL,
    created_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false
);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_session_id_seq OWNED BY public.sessions.session_id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    submission_id integer NOT NULL,
    titre character varying(255) NOT NULL,
    appel character varying(255) NOT NULL,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    resultat character varying(20) DEFAULT 'pending'::character varying,
    score integer DEFAULT 0,
    date date,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone
);


--
-- Name: submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_submission_id_seq OWNED BY public.submissions.submission_id;


--
-- Name: tender_ai_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tender_ai_analysis (
    analysis_id integer NOT NULL,
    tender_id integer NOT NULL,
    raw_text text,
    filename character varying(255),
    extracted_title character varying(500),
    sector character varying(100),
    tender_type character varying(100),
    client_name character varying(255),
    client_size character varying(50),
    estimated_budget_eur double precision,
    deadline_date date,
    estimated_duration_weeks integer,
    geographic_location character varying(200),
    requirements json DEFAULT '[]'::json,
    key_deliverables json DEFAULT '[]'::json,
    evaluation_criteria json DEFAULT '[]'::json,
    languages_required json DEFAULT '[]'::json,
    summary text,
    status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    created_at timestamp with time zone
);


--
-- Name: tender_ai_analysis_analysis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tender_ai_analysis_analysis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tender_ai_analysis_analysis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tender_ai_analysis_analysis_id_seq OWNED BY public.tender_ai_analysis.analysis_id;


--
-- Name: tender_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tender_scores (
    score_id integer NOT NULL,
    tender_id integer NOT NULL,
    analysis_id integer,
    total_score integer NOT NULL,
    label character varying(20),
    service_match_score integer,
    sector_fit_score integer,
    budget_alignment_score integer,
    timeline_score integer,
    geographic_score integer,
    past_similarity_score integer,
    strengths json DEFAULT '[]'::json,
    risks json DEFAULT '[]'::json,
    recommendation text,
    reasoning text,
    similar_past_tenders json DEFAULT '[]'::json,
    created_at timestamp with time zone
);


--
-- Name: tender_scores_score_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tender_scores_score_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tender_scores_score_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tender_scores_score_id_seq OWNED BY public.tender_scores.score_id;


--
-- Name: tenders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenders (
    tender_id integer NOT NULL,
    titre character varying(255) NOT NULL,
    client character varying(255) NOT NULL,
    statut character varying(20) DEFAULT 'detecte'::character varying,
    date_limite date,
    budget character varying(100),
    responsable character varying(255),
    description text,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone
);


--
-- Name: tenders_tender_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenders_tender_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenders_tender_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenders_tender_id_seq OWNED BY public.tenders.tender_id;


--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateurs (
    user_id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    role_id integer NOT NULL,
    actif boolean DEFAULT true,
    date_creation timestamp with time zone
);


--
-- Name: utilisateurs_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utilisateurs_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utilisateurs_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utilisateurs_user_id_seq OWNED BY public.utilisateurs.user_id;


--
-- Name: clients client_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN client_id SET DEFAULT nextval('public.clients_client_id_seq'::regclass);


--
-- Name: knowledge_items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_items ALTER COLUMN item_id SET DEFAULT nextval('public.knowledge_items_item_id_seq'::regclass);


--
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- Name: planning_events event_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planning_events ALTER COLUMN event_id SET DEFAULT nextval('public.planning_events_event_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN session_id SET DEFAULT nextval('public.sessions_session_id_seq'::regclass);


--
-- Name: submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.submissions_submission_id_seq'::regclass);


--
-- Name: tender_ai_analysis analysis_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_ai_analysis ALTER COLUMN analysis_id SET DEFAULT nextval('public.tender_ai_analysis_analysis_id_seq'::regclass);


--
-- Name: tender_scores score_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_scores ALTER COLUMN score_id SET DEFAULT nextval('public.tender_scores_score_id_seq'::regclass);


--
-- Name: tenders tender_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenders ALTER COLUMN tender_id SET DEFAULT nextval('public.tenders_tender_id_seq'::regclass);


--
-- Name: utilisateurs user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN user_id SET DEFAULT nextval('public.utilisateurs_user_id_seq'::regclass);


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (client_id, raison_sociale, secteur, contact, email, telephone, pays, site_web, notes, actif, date_creation) FROM stdin;
1	Ministère du Travail	Secteur public	\N	contact@mtravail.dz	\N	Algérie	\N	\N	t	\N
2	Banque Nationale d'Algérie	Banque & Finance	\N	dsi@bna.dz	\N	Algérie	\N	\N	f	\N
3	Groupe Cevital 01	Industrie	\N	achats@cevital.dz	\N	Algérie	\N	\N	t	\N
4	souhaib-client	Banque & Finance	Souhaib Ammani	souhaib.ammani225@gmail.com	+21628110202	Tunisia			t	2026-05-05 18:12:01.526+01
5	Entreprise 2	Industrie	Lina	lina@gmail.com	+21628110176	Tunisia			t	2026-05-05 18:46:15.218+01
6	Ministère du Travail	Secteur public	\N	contact@mtravail.dz	\N	Algérie	\N	\N	t	\N
7	Banque Nationale d'Algérie	Banque & Finance	\N	dsi@bna.dz	\N	Algérie	\N	\N	t	\N
8	Groupe Cevital	Industrie	\N	achats@cevital.dz	\N	Algérie	\N	\N	t	\N
9	Sonatrach Digital	Énergie	\N	it@sonatrach.dz	\N	Algérie	\N	\N	t	\N
10	Ooredoo Algérie	Télécommunications	\N	procurement@ooredoo.dz	\N	Algérie	\N	\N	t	\N
11	Client-test	Santé	Souhaib Ammani	souhaib55@gmail.com	+21628110174	Tunisia			t	2026-05-05 23:13:24.233+01
\.


--
-- Data for Name: knowledge_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.knowledge_items (item_id, titre, categorie, secteur, contenu, usages, note, actif, date_creation) FROM stdin;
1	Base-1	Résumé exécutif	IT	contenu -1	1	5	t	2026-05-05 22:30:49.164+01
2	Planning -1	Méthodologie	IT -Dev	Planning pour projet TMS	1	5	t	2026-05-05 22:31:45.11+01
3	PL-2	Références	IT	..	0	5	t	2026-05-05 22:32:26.945+01
4	Résumé exécutif — Projets IT publics	Résumé exécutif	Secteur public	Notre société, forte de 10 ans d'expertise dans les projets informatiques publics, propose une solution éprouvée, livrée dans les délais et certifiée ISO 9001. Nos références incluent 15+ ministères et organismes publics algériens.	12	4.8	t	\N
5	Méthodologie Agile / SCRUM	Méthodologie	IT	Nous adoptons la méthodologie Agile SCRUM avec des sprints de 2 semaines, des revues hebdomadaires avec le client, et une livraison continue. Chaque sprint produit un incrément fonctionnel validé.	8	4.5	t	\N
6	Clause de garantie standard	Offre commerciale	Tous secteurs	Une garantie de 12 mois sur l'ensemble des livrables est incluse. Durant cette période, tout défaut de conformité est corrigé sans frais additionnels dans un délai de 5 jours ouvrés.	20	4.2	t	\N
7	Références — Secteur bancaire	Références	Banque & Finance	BNA (2023) — Audit Sécurité SI, CPA (2022) — Core Banking Migration, Société Générale Algérie (2024) — Portail Client Digital. Contacts disponibles sur demande.	5	4.7	t	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (permission_id, code, description) FROM stdin;
1	appel_offre:read	Voir les appels d offres
2	appel_offre:create	Creer un appel d offres
3	appel_offre:update	Modifier un appel d offres
4	appel_offre:delete	Supprimer un appel d offres
5	utilisateur:read	Voir les utilisateurs
6	utilisateur:create	Creer un utilisateur
7	client:read	Voir les clients
8	client:create	Creer un client
17	planning:read	Voir le planning
18	planning:write	Creer/modifier des evenements planning
\.


--
-- Data for Name: planning_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planning_events (event_id, titre, type, date_debut, date_fin, client_id, tender_id, note, couleur, actif, date_creation) FROM stdin;
1	Réunion kick-off Portail RH	reunion	2026-05-08 09:00:00+01	\N	\N	\N	Présence requise du chef de projet	#7C3AED	t	2026-05-05 23:03:35.526488+01
3	Présentation ERP Cevital	presentation	2026-05-12 14:00:00+01	\N	\N	\N	Salle de conférence — 3ème étage	#F59E0B	t	2026-05-05 23:03:35.53106+01
4	Suivi contrat App Mobile	suivi	2026-05-15 10:00:00+01	\N	\N	\N	Revue mensuelle du contrat	#10B981	t	2026-05-05 23:03:35.531866+01
5	Qualification AO Cloud	qualification	2026-05-06 11:00:00+01	\N	\N	\N	Analyse des exigences techniques	#3B82F6	t	2026-05-05 23:03:35.53261+01
2	Date limite Audit Sécurité SI	echeance	2026-05-10 23:03:35.522+01	\N	\N	\N	Dépôt des offres avant 16h00	#EF4444	f	2026-05-05 23:03:35.530201+01
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
2	1
2	2
2	3
2	7
2	8
3	1
3	7
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	17
1	18
2	1
2	2
2	3
2	4
2	7
2	8
2	17
2	18
3	1
3	17
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (role_id, libelle) FROM stdin;
1	Admin
2	Manager
3	Consultant
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (session_id, user_id, token, created_at, expires_at, revoked) FROM stdin;
17	3	0e80c046-9cf2-416d-8755-bb75e9a5ac19	2026-05-05 23:10:43.534+01	2026-05-12 23:10:43.534+01	f
18	3	003f7f76-ebf4-4c9e-adc2-12e7817388b2	2026-05-05 23:17:10.905+01	2026-05-12 23:17:10.904+01	t
19	2	8af81994-48bb-46ff-b15f-0f3e06f2ffc7	2026-05-05 23:17:35.156+01	2026-05-12 23:17:35.156+01	t
21	2	5f50de92-b02f-4dda-a6c9-d4ed33903545	2026-05-05 23:24:51.662+01	2026-05-12 23:24:51.662+01	f
20	2	39039fc8-5563-4624-8c8a-3de1bac609d5	2026-05-05 23:18:23.162+01	2026-05-12 23:18:23.162+01	t
22	4	28a6734f-ac55-4452-b35d-0c58cfac73a0	2026-05-05 23:32:58.864+01	2026-05-12 23:32:58.863+01	t
23	2	9be09792-1ee1-489b-95e7-2283f864fee6	2026-05-05 23:45:57.258+01	2026-05-12 23:45:57.258+01	t
24	3	83cf6399-e6b4-4410-89fd-c4479f50c2b0	2026-05-05 23:47:04.497+01	2026-05-12 23:47:04.497+01	f
25	3	a6a59045-796e-4c05-a139-a3b935e371ac	2026-05-06 22:13:57.846+01	2026-05-13 22:13:57.845+01	t
26	3	58104ca0-236f-4e1e-af2a-3aacf6a11ecc	2026-05-06 22:19:09.02+01	2026-05-13 22:19:09.02+01	t
27	3	337e9e34-832b-44a2-9fd0-7776be28b96b	2026-05-06 22:27:02.47+01	2026-05-13 22:27:02.47+01	t
28	2	429f5615-16f5-4def-9db6-d3a0c8277284	2026-05-06 22:27:45.689+01	2026-05-13 22:27:45.689+01	t
29	4	4ddcf762-1685-4cdc-b6cf-4432598d443e	2026-05-06 22:31:10.109+01	2026-05-13 22:31:10.109+01	t
30	3	8d8aeaa0-b633-4a53-84b6-80ac386f58cc	2026-05-06 22:32:07.474+01	2026-05-13 22:32:07.474+01	t
31	2	869c0622-7af8-4b22-963a-a74d1fbd9221	2026-05-06 23:44:55.573+01	2026-05-13 23:44:55.573+01	f
32	2	8b447499-b130-4499-94e3-b80edd4ed13c	2026-05-07 00:02:48.175+01	2026-05-14 00:02:48.175+01	t
33	3	cadd6cf7-ae66-45ff-bb09-5fa83df2e1ef	2026-05-07 00:16:14.815+01	2026-05-14 00:16:14.814+01	t
34	2	047cc75c-93ae-46cd-a302-dc811e7adead	2026-05-07 00:16:40.285+01	2026-05-14 00:16:40.285+01	t
35	2	21b0a0f8-c6fd-4527-ab1b-eedade27a6a5	2026-05-07 00:19:17.416+01	2026-05-14 00:19:17.416+01	f
36	3	5230c9bb-892d-49c9-a7be-2743b6405d18	2026-05-07 01:06:13.187+01	2026-05-14 01:06:13.186+01	f
37	3	70f6f61f-91cf-44c1-871f-f16354e8339c	2026-05-07 01:06:33.109+01	2026-05-14 01:06:33.109+01	f
38	3	3d1f47bf-ad40-4f3b-9a40-4269ff78e724	2026-05-07 01:22:14.42+01	2026-05-14 01:22:14.42+01	t
39	3	f02dc0d0-e7cd-4fa9-8c0f-eb7fab0f8383	2026-05-07 01:27:33.308+01	2026-05-14 01:27:33.308+01	t
40	2	52861729-f5cb-4ca2-a039-db9cd747b28d	2026-05-07 01:40:35.3+01	2026-05-14 01:40:35.3+01	f
41	3	9e8c8e3b-67ee-4449-93bc-3ddbf1b13d17	2026-05-07 01:58:18.443+01	2026-05-14 01:58:18.443+01	f
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (submission_id, titre, appel, statut, resultat, score, date, actif, date_creation) FROM stdin;
1	soumission-1	Appel1	en_revision	pending	2	2026-05-05	t	2026-05-05 18:14:21.148+01
5	App Mobile Sonatrach v2	Application Mobile Terrain	soumis	gagne	91	2026-04-20	t	\N
2	Proposition Portail RH v10	Développement Portail RH	soumis	pending	82	2026-05-05	t	\N
4	Soumission ERP Cevital	Plateforme ERP Industriel	en_revision	perdu	55	2026-04-25	t	\N
3	Offre Audit Sécurité-01	Audit Sécurité SI	finalise	pending	67	2026-05-05	t	\N
6	Soumission-test	Offre-01	en_revision	pending	2	2026-05-05	f	2026-05-05 23:14:10.741+01
\.


--
-- Data for Name: tender_ai_analysis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tender_ai_analysis (analysis_id, tender_id, raw_text, filename, extracted_title, sector, tender_type, client_name, client_size, estimated_budget_eur, deadline_date, estimated_duration_weeks, geographic_location, requirements, key_deliverables, evaluation_criteria, languages_required, summary, status, error_message, created_at) FROM stdin;
1	1	\N	cahier_des_charges_exemple.pdf	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	[]	[]	\N	failed	pdfParse is not a function	2026-05-07 01:23:22.251+01
2	1	\N	cahier_des_charges_exemple.pdf	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	[]	[]	\N	failed	pdfParse is not a function	2026-05-07 01:27:10.944+01
3	1	\N	cahier_des_charges_exemple.pdf	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	[]	[]	\N	failed	pdfParse is not a function	2026-05-07 01:27:42.769+01
4	1	\n\nCAHIER DES CHARGES\nMise en place d'un Bureau de Gestion de Projets (PMO)\nMinistere de la Transformation Numerique — Tunisie\nRef : MTN/PMO/2026/007Date limite : 30 Juin 2026Budget : 60 000 EUR\n1. Presentation du Commanditaire\nOrganismeMinistere de la Transformation Numerique (MTN)\nSecteurSecteur Public / Administration\nPaysTunisie\nContactdsi@mtn.gov.tn\nLe  Ministere  de  la  Transformation  Numerique  pilote  la  strategie  nationale  de  digitalisation  de\nl'administration publique tunisienne. Dans ce cadre, il souhaite se doter d'un Bureau de Gestion de\nProjets (PMO) afin de structurer et standardiser la gestion de ses projets strategiques sur les trois\nprochaines annees.\n2. Objet du Marche\nLe present appel d'offres porte sur la mise en place d'un PMO operationnel au sein du Ministere,\nincluant  la  conception  du  cadre  de  gouvernance,  la  definition  des  processus  de  gestion  de\nportefeuille,  la  formation  des  equipes  et  l'accompagnement  au  deploiement  sur  une  duree  de  6\nmois.\n3. Perimetre et Exigences\nIDCategorieDescription\nREQ-0\n1\nTechniqueRealiser un diagnostic de maturite en gestion de projets (modele P3M3\nou equivalent).\nREQ-0\n2\nTechniqueConcevoir la charte du PMO : mission, vision, structure organisationnelle\net roles.\n\nREQ-0\n3\nTechniqueDevelopper le cadre de gouvernance des projets : processus, templates,\noutils de reporting.\nREQ-0\n4\nTechniqueMettre  en  place  un  tableau  de  bord  de  suivi  de  portefeuille  de  projets\n(KPIs, RAG status).\nREQ-0\n5\nFormationFormer  20  chefs  de  projets  et  responsables  aux  methodologies  PMO\n(minimum 3 sessions).\nREQ-0\n6\nFormationOrganiser 2 ateliers de sensibilisation destines au comite de direction.\nREQ-0\n7\nOperationnelAssurer  un  accompagnement  de  3  mois  post-deploiement  (coaching  et\noptimisation).\nREQ-0\n8\nLivrableFournir tous les documents en arabe et en francais.\nREQ-0\n9\nConformiteLe  soumissionnaire  devra  justifier  d'une  experience  en  PMO  dans  le\nsecteur public.\nREQ-1\n0\nConformiteAu moins un consultant senior certifie PMP, PRINCE2 ou equivalent doit\netre designe.\n4. Livrables Attendus\nEcheanceLivrable\nSemaine 4Rapport de diagnostic de maturite PMO (P3M3)\nSemaine 8Charte du PMO + Cadre de gouvernance complet\nSemaine 12Tableau de bord operationnel deploye + Manuel utilisateur\nSemaine 16Rapport de formation (supports + feuilles de presence)\nSemaine 24Rapport final de cloture + Plan de continuite\n5. Criteres d'Evaluation des Offres\nCriterePoids\nExperience en PMO dans le secteur public (references)30 %\nQualite de la methodologie proposee25 %\n\nQualifications et certifications de l'equipe20 %\nPrix et rapport qualite/cout15 %\nDelais et plan de charge10 %\n6. Conditions de Soumission\nDate limite30 Juin 2026 a 17h00 (heure de Tunis)\nFormat offreOffre technique + Offre financiere (envelopes separees)\nValidite90 jours a compter de la date de cloture\nLangueFrancais ou Arabe\nDepotPar  email  :  dsi@mtn.gov.tn  ou  en  main  propre  au  siege  du\nMinistere\nDocument confidentiel — Ministere de la Transformation Numerique, Tunis, Tunisie | Ref: MTN/PMO/2026/007	cahier_des_charges_exemple.pdf	Mise en place d'un Bureau de Gestion de Projets (PMO)	Government	PMO	Ministere de la Transformation Numerique	Government Body	60000	2026-06-30	24	Tunisie	[{"id":1,"category":"Technical","description":"Realiser un diagnostic de maturite en gestion de projets (modele P3M3 ou equivalent)","priority":"Must Have"},{"id":2,"category":"Technical","description":"Concevoir la charte du PMO : mission, vision, structure organisationnelle et roles","priority":"Must Have"},{"id":3,"category":"Technical","description":"Developper le cadre de gouvernance des projets : processus, templates, outils de reporting","priority":"Must Have"},{"id":4,"category":"Technical","description":"Mettre en place un tableau de bord de suivi de portefeuille de projets (KPIs, RAG status)","priority":"Must Have"},{"id":5,"category":"Functional","description":"Former 20 chefs de projets et responsables aux methodologies PMO (minimum 3 sessions)","priority":"Must Have"},{"id":6,"category":"Functional","description":"Organiser 2 ateliers de sensibilisation destines au comite de direction","priority":"Must Have"},{"id":7,"category":"Operational","description":"Assurer un accompagnement de 3 mois post-deploiement (coaching et optimisation)","priority":"Must Have"},{"id":8,"category":"Quality","description":"Fournir tous les documents en arabe et en francais","priority":"Must Have"},{"id":9,"category":"Legal","description":"Justifier d'une experience en PMO dans le secteur public","priority":"Must Have"},{"id":10,"category":"Technical","description":"Au moins un consultant senior certifie PMP, PRINCE2 ou equivalent doit etre designe","priority":"Must Have"}]	["Rapport de diagnostic de maturite PMO (P3M3)","Charte du PMO + Cadre de gouvernance complet","Tableau de bord operationnel deploye + Manuel utilisateur","Rapport de formation (supports + feuilles de presence)","Rapport final de cloture + Plan de continuite"]	["Experience en PMO dans le secteur public (references) (30%)","Qualite de la methodologie proposee (25%)","Qualifications et certifications de l'equipe (20%)","Prix et rapport qualite/cout (15%)","Delais et plan de charge (10%)"]	["Francais","Arabe"]	Le Ministere de la Transformation Numerique tunisien cherche un partenaire pour mettre en place un Bureau de Gestion de Projets (PMO) pour structurer et standardiser la gestion de ses projets strategiques. La mission inclut un diagnostic de maturite, la conception d'une charte PMO, la formation des equipes et un accompagnement post-deploiement. Les offres doivent etre soumises avant le 30 juin 2026.	completed	\N	2026-05-07 01:32:02.428+01
5	2	\n\nAPPEL D'OFFRES — CAHIER DES CHARGES\nMise en conformite ISO/IEC 27001:2022 et ISO 22301:2019\nBanque Maghreb Finance S.A. — Casablanca, Maroc\nRef : BMF/DSI/SEC/2026/014Date limite : 15 Juillet 2026Budget estimatif : 90 000 EUR\n1. Presentation du Commanditaire\nOrganismeBanque Maghreb Finance S.A. (BMF)\nSecteurFinance & Banque\nEffectif1 200 employes — 45 agences au Maroc\nPaysMaroc (Casablanca — siege social)\nContactdsi-securite@bmf.ma\nBanque  Maghreb  Finance  est  un  etablissement  bancaire  de  taille  intermediaire  soumis  aux\nexigences reglementaires de Bank Al-Maghrib (BAM) en matiere de securite de l'information et de\ncontinuite  d'activite.  Suite  a  un  audit  interne  revele  des  vulnerabilites  significatives,  la  direction\ngenerale  a  decide  d'engager  un  prestataire  externe  pour  obtenir  la  double  certification  ISO\n27001:2022 (Securite de l'information) et ISO 22301:2019 (Continuite d'activite) dans un delai de 9\nmois.\n2. Contexte et Enjeux\nLa BMF traite quotidiennement plus de 200 000 transactions et heberge les donnees personnelles\net financieres de 350 000 clients. Un incident de securite ou une interruption prolongee des services\npourrait entrainer des pertes financieres majeures et des sanctions reglementaires. La banque n'est\nactuellement certifiee sur aucun referentiel ISO.\nContrainte reglementaire : Bank Al-Maghrib exige une conformite documentee aux normes de securite\ninternationales avant le 31 Mars 2027.\n3. Exigences Detaillees\nIDCategorieDescription de l'exigence\n\nREQ-0\n1\nISO 27001Realiser  un  audit  de  l'etat  actuel  de  la  securite  de  l'information  (gap\nanalysis ISO 27001:2022).\nREQ-0\n2\nISO 27001Elaborer et implémenter la politique de securite de l'information (PSSI) et\nle SMSI complet.\nREQ-0\n3\nISO 27001Implementer les 93 controles de securite de l'Annexe A de la norme ISO\n27001:2022.\nREQ-0\n4\nISO 27001Mettre  en  place  les  procedures  de  gestion  des  incidents  de  securite  et\nles tester (simulation).\nREQ-0\n5\nISO 27001Accompagner la banque jusqu'a l'audit de certification par un organisme\naccredite.\nREQ-0\n6\nISO 22301Realiser  une  analyse  d'impact  metier  (BIA)  pour  toutes  les  fonctions\ncritiques de la banque.\nREQ-0\n7\nISO 22301Rediger les Plans de Continuite d'Activite (PCA) et les Plans de Reprise\nd'Activite (PRA).\nREQ-0\n8\nISO 22301Organiser 2 exercices de simulation (test grandeur nature) et produire les\nrapports associes.\nREQ-0\n9\nISO 22301Accompagner la banque jusqu'a l'audit de certification ISO 22301.\nREQ-1\n0\nFormationFormer  15  responsables  IT  et  metier  a  la  securite  de  l'information  (ISO\n27001 Awareness).\nREQ-1\n1\nFormationFormer  2  auditeurs  internes  ISO  27001  (formation  Lead  Auditor  ou\nequivalent).\nREQ-1\n2\nConformiteTous  les  livrables  doivent  etre  en  langue  francaise  et  respecter  les\nexigences de BAM.\nREQ-1\n3\nConformiteLe   prestataire   doit   justifier   d'au   moins   3   certifications   ISO   27001\nrealisees dans le secteur bancaire.\nREQ-1\n4\nTechniqueIntegrer  la  solution  de  monitoring  de  securite  existante  (SIEM  Splunk)\ndans le SMSI.\n4. Plan de Travail et Livrables Attendus\nPhase             /\nCalendrier\nActivites PrincipalesLivrables\n\nPhase  1  Sem.\n1-4\nDiagnostic        &        Gap\nAnalysis\nRapport  de  gap  analysis  ISO  27001  +  ISO  22301  /\nBIA preliminaire\nPhase  2  Sem.\n5-16\nImplementation   SMSI   &\nPCA\nPSSI  +  93  controles  documentes  /  PCA  &  PRA\nrediges / Proc. incidents\nPhase  3  Sem.\n17-20\nFormation                       &\nSensibilisation\nSupports   de   formation   /   Attestations   /   Rapport\nformations\nPhase  4  Sem.\n21-28\nTests & Pre-auditRapport simulation continuite / Audit interne / Plan de\nremediation\nPhase  5  Sem.\n29-36\nCertificationAccompagnement   audit   externe   /   Certificats   ISO\n27001 + ISO 22301\n5. Criteres d'Evaluation et Ponderation\nCriterePoidsDetails\nReferences        bancaires\n(ISO 27001)\n30 %Min. 3 projets dans le secteur bancaire ou financier\nQualite     methodologique\nde l'offre\n25 %Approche, planning detaille, gestion des risques projet\nCompetences                 et\ncertifications de l'equipe\n20 %Lead Implementer / Lead Auditor ISO 27001, ISO 22301\nOffre financiere15 %Prix global TTC — decompose par phase\nDelais    et    capacite    de\nmobilisation\n10 %Demarrage sous 2 semaines apres notification\n6. Conditions Administratives de Soumission\nDate limite15 Juillet 2026 a 16h00 (GMT+1 — Casablanca)\nValidite offre120 jours a compter de la date de cloture\nCompositionEnveloppe 1 : Offre technique | Enveloppe 2 : Offre financiere\nLangueFrancais obligatoire\nDepotsecretariat.dsi@bmf.ma  ou  depot  physique  :  45  Bd  Zerktouni,\nCasablanca\nQuestionsappel-offres@bmf.ma — jusqu'au 30 Juin 2026\n\nTout dossier incomplet ou depose hors delai sera automatiquement rejete. La BMF se reserve le droit\nd'annuler le present appel d'offres sans obligation de justification.\nDocument confidentiel — Banque Maghreb Finance S.A. | Ref : BMF/DSI/SEC/2026/014 | Casablanca, Maroc	cahier_des_charges_banque_iso.pdf	Mise en conformite ISO/IEC 27001:2022 et ISO 22301:2019	Finance	ISO Certification	Banque Maghreb Finance S.A.	Large Enterprise	90000	2026-07-15	36	Maroc (Casablanca)	[{"id":1,"category":"Technical","description":"Realiser un audit de l'etat actuel de la securite de l'information (gap analysis ISO 27001:2022)","priority":"Must Have"},{"id":2,"category":"Technical","description":"Elaborer et implémenter la politique de securite de l'information (PSSI) et le SMSI complet","priority":"Must Have"},{"id":3,"category":"Technical","description":"Implementer les 93 controles de securite de l'Annexe A de la norme ISO 27001:2022","priority":"Must Have"},{"id":4,"category":"Technical","description":"Mettre en place les procedures de gestion des incidents de securite et les tester (simulation)","priority":"Must Have"},{"id":5,"category":"Technical","description":"Accompagner la banque jusqu'a l'audit de certification par un organisme accredite (ISO 27001)","priority":"Must Have"},{"id":6,"category":"Technical","description":"Realiser une analyse d'impact metier (BIA) pour toutes les fonctions critiques de la banque (ISO 22301)","priority":"Must Have"},{"id":7,"category":"Technical","description":"Rediger les Plans de Continuite d'Activite (PCA) et les Plans de Reprise d'Activite (PRA) (ISO 22301)","priority":"Must Have"},{"id":8,"category":"Technical","description":"Organiser 2 exercices de simulation (test grandeur nature) et produire les rapports associes (ISO 22301)","priority":"Must Have"},{"id":9,"category":"Technical","description":"Accompagner la banque jusqu'a l'audit de certification ISO 22301","priority":"Must Have"},{"id":10,"category":"Functional","description":"Former 15 responsables IT et metier a la securite de l'information (ISO 27001 Awareness)","priority":"Should Have"},{"id":11,"category":"Functional","description":"Former 2 auditeurs internes ISO 27001 (formation Lead Auditor ou equivalent)","priority":"Should Have"},{"id":12,"category":"Conformite","description":"Tous les livrables doivent etre en langue francaise et respecter les exigences de BAM","priority":"Must Have"},{"id":13,"category":"Conformite","description":"Le prestataire doit justifier d'au moins 3 certifications ISO 27001 realisees dans le secteur bancaire","priority":"Must Have"},{"id":14,"category":"Technical","description":"Integrer la solution de monitoring de securite existante (SIEM Splunk) dans le SMSI","priority":"Should Have"}]	["Rapport de gap analysis ISO 27001 + ISO 22301","PSSI + 93 controles documentes","PCA & PRA rediges","Proc. incidents","Supports de formation","Attestations","Rapport formations","Rapport simulation continuite","Audit interne","Plan de remediation","Certificats ISO 27001 + ISO 22301"]	["References bancaires (ISO 27001) - 30%","Qualite methodologique de l'offre - 25%","Competences et certifications de l'equipe - 20%","Offre financiere - 15%","Delais et capacite de mobilisation - 10%"]	["Francais"]	La Banque Maghreb Finance S.A. lance un appel d'offres pour obtenir la double certification ISO 27001:2022 et ISO 22301:2019. Le prestataire devra realiser un audit de securite, elaborer des politiques de securite, implementer des controles de securite et accompagner la banque jusqu'a l'audit de certification. La duree du projet est estimee a 9 mois pour un budget de 90 000 EUR.	completed	\N	2026-05-07 01:47:56.749+01
6	3	\n\nAPPEL D'OFFRES OUVERT — CAHIER DES\nCHARGES\nConstruction et Mise en Service d'une Centrale Solaire Photovoltaique\nCapacite : 50 MWc — Site de Regueb, Gouvernorat de Sidi Bouzid, Tunisie\nSociete Tunisienne de l'Electricite et du Gaz (STEG) — Direction des Energies Renouvelables\nRef : STEG/DER/PV/2026/031Date limite : 31 Aout 2026Budget : 28 000 000 EUR\n1. Presentation du Maitre d'Ouvrage\nOrganismeSociete Tunisienne de l'Electricite et du Gaz (STEG)\nDirectionDirection des Energies Renouvelables (DER)\nSecteurEnergie / Infrastructure / Genie Civil\nStatutEtablissement public a caractere industriel et commercial\nPaysTunisie — Site : Regueb, Sidi Bouzid (coordonnees GPS : 34.71N /\n9.12E)\nContactder-appelsoffres@steg.com.tn\nLa  STEG  lance  le  present  appel  d'offres  dans  le  cadre  du  Plan  National  de  Transition\nEnergetique 2035 qui prevoit de porter la part des energies renouvelables a 35 % du mix electrique\nnational.  Le  projet  porte  sur  la  conception,  fourniture,  construction,  installation,  mise  en\nservice  et  maintenance  pendant  5  ans  d'une  centrale  solaire  photovoltaique  d'une  puissance\nnominale de 50 MWc sur un terrain de 120 hectares appartenant a l'Etat tunisien.\n2. Description Technique du Projet\nLe  projet  est  realise  en  mode  EPC  (Engineering,  Procurement,  Construction)  cle  en  main.  Le\ntitulaire du marche assume l'integralite de la responsabilite technique, reglementaire et contractuelle\ndepuis la conception jusqu'a la garantie de performance pendant la periode de maintenance.\nPuissance crete totale50 MWc (±5 %)\nTechnologie panneauxModules photovoltaiques monocristallins — rendement min. 21 %\n\nType de structureFixe ou tracker mono-axe (justification obligatoire)\nOnduleursCentraux ou de chaine — puissance unitaire min. 100 kW\nBatterie de stockageSysteme BESS optionnel — mini 10 MWh si propose\nRaccordement reseauPoste de transformation 30 kV / 225 kV — ligne HT 15 km\nProduction annuelle cibleMin. 95 000 MWh/an (PR ≥ 82 %)\nSysteme de supervisionSCADA temps reel avec acces distant STEG\nCloture et securitePerimetre cloture, cameras, eclairage, gardiennage\nVoirie internePistes stabilisees carrossables — largeur min. 4 m\n3. Exigences Techniques et Reglementaires\nIDDomaineExigence\nREQ-0\n1\nGenie CivilRealiser  les  etudes  geotechniques  et  topographiques  du  terrain  (120\nha) avant tout commencement.\nREQ-0\n2\nGenie CivilConcevoir   et   construire   les   fondations   des   structures   porteuses\nconformement aux normes parasismiques EN 1998.\nREQ-0\n3\nGenie CivilConstruire le batiment de controle-commande, local onduleurs, locaux\nde securite (min. 400 m2 total).\nREQ-0\n4\nElectrotechniqu\ne\nRealiser  le  poste  de  livraison  HTA/HTB  30/225  kV  conformement  aux\nnormes IEC 62271 et aux specs STEG.\nREQ-0\n5\nElectrotechniqu\ne\nInstaller  et  tester  l'ensemble  des  cablages  AC/DC  selon  les  normes\nIEC 60364 et IEC 61215.\nREQ-0\n6\nElectrotechniqu\ne\nFournir et installer le systeme de protection contre la foudre et la mise\na la terre (IEC 62305).\nREQ-0\n7\nSCADA / ITDeployer   un   systeme   SCADA   industriel   avec   historisation   des\ndonnees, alarmes et acces VPN securise pour la STEG.\nREQ-0\n8\nEnvironnementRealiser une Etude d'Impact Environnemental et Social (EIES) validee\npar le Ministere de l'Environnement.\nREQ-0\n9\nEnvironnementMettre en oeuvre un plan de gestion des dechets de chantier et un plan\nde restauration du site post-construction.\nREQ-1\n0\nHSEAppliquer  un  Plan  HSE  (Hygiene  Securite  Environnement)  conforme\naux normes ISO 45001 tout au long du chantier.\n\nREQ-1\n1\nPerformanceGarantir  un  ratio  de  performance  (PR)  ≥  82  %  sur  la  duree  de  vie  du\nprojet (25 ans).\nREQ-1\n2\nPerformanceFournir une garantie sur les panneaux : rendement ≥ 90 % a 10 ans, ≥\n80 % a 25 ans (garantie fabricant).\nREQ-1\n3\nMaintenanceAssurer  la  maintenance  preventive  et  corrective  pendant  5  ans  avec\ntemps d'intervention < 48h.\nREQ-1\n4\nAdministrativeObtenir  tous  les  permis  et  autorisations  administratives  aupres  des\nautorites tunisiennes (permis de construire, autorisation de production,\netc.).\nREQ-1\n5\nQualificationLe  soumissionnaire  doit  justifier  d'une  experience  de  min.  3  centrales\nsolaires EPC de capacite ≥ 20 MWc livrees.\nREQ-1\n6\nQualificationL'equipe   projet   doit   inclure   :   1   Ingenieur   en   genie   electrique,   1\nIngenieur genie civil, 1 Specialiste PV certifie NABCEP ou equivalent.\n4. Planning Contractuel\nPeriodeActivite\nM+1 — M+3Etudes d'ingenierie detaillees, etudes geotechniques, obtention permis\nM+3 — M+5Approvisionnement materiels (panneaux, onduleurs, cablage, structures)\nM+4 — M+10Travaux de genie civil : voirie, fondations, batiments, cloture\nM+8 — M+14Installation equipements electriques, cablage DC/AC, poste HTA/HTB\nM+13 — M+15Tests, mise en service, essais de performance (Flash test, PR test)\nM+15Reception provisoire + debut periode de garantie de 5 ans\nM+15 — M+75Maintenance preventive et corrective (contrat 5 ans)\n5. Criteres d'Evaluation des Offres\nCriterePoidsIndicateurs evalues\nExperience   EPC   solaire\n(references)\n30 %Nombre de MW installes, pays, annee de livraison\nQualite     technique     de\nl'offre\n25 %Choix technologique, rendement, garanties de performance\n\nQualifications   equipe   et\nsous-traitants\n20 %Certifications NABCEP, IEC, ISO, experience terrain\nOffre financiere globale15 %Prix EPC + cout O&M; 5 ans — LCOE estime\nContenu      local      (main\nd'oeuvre tunisienne)\n10 %% emplois locaux, formation techniciens tunisiens\n6. Conditions de Soumission\nDate limite31 Aout 2026 a 12h00 (heure de Tunis)\nBudget estimatif28 000 000 EUR TTC — decompose en EPC + O&M;\nCautionnementCaution de soumission : 1 % du montant offre (garantie bancaire)\nGarantie exec.10  %  du  montant  du  marche  —  garantie  bancaire  a  premiere\ndemande\nLangueFrancais (documents techniques acceptes en Anglais)\nValidite offre180 jours a compter de la date limite de depot\nDepotSiege  STEG  —  38  Rue  Kemal  Ataturk,  Tunis  1080  (envelope\nphysique cachetee)\nATTENTION  :  Seules  les  entreprises  disposant  d'une  capacite  financiere  justifiee  (chiffre  d'affaires\nannuel  ≥  15  M  EUR  sur  les  3  derniers  exercices)  et  d'une  experience  EPC  solaire  prouvee  seront\nqualifiees  pour  l'evaluation  technique.  Tout  dossier  ne  respectant  pas  ces  conditions  minimales  sera\nelimine.\nDocument officiel — STEG / Direction des Energies Renouvelables | Ref : STEG/DER/PV/2026/031 | Tunis, Tunisie	cahier_des_charges_construction_solaire.pdf	Construction et Mise en Service d'une Centrale Solaire Photovoltaique - Capacite : 50 MWc - Site de Regueb, Gouvernorat de Sidi Bouzid, Tunisie	Energy	Other	Societe Tunisienne de l'Electricite et du Gaz (STEG) - Direction des Energies Renouvelables	Government Body	28000000	2026-08-31	\N	Tunisie - Regueb, Sidi Bouzid	[{"id":1,"category":"Technical","description":"Realiser les etudes geotechniques et topographiques du terrain (120 ha) avant tout commencement.","priority":"Must Have"},{"id":2,"category":"Technical","description":"Concevoir et construire les fondations des structures porteuses conformement aux normes parasismiques EN 1998.","priority":"Must Have"},{"id":3,"category":"Technical","description":"Construire le batiment de controle-commande, local onduleurs, locaux de securite (min. 400 m2 total).","priority":"Must Have"},{"id":4,"category":"Technical","description":"Realiser le poste de livraison HTA/HTB 30/225 kV conformement aux normes IEC 62271 et aux specs STEG.","priority":"Must Have"},{"id":5,"category":"Technical","description":"Installer et tester l'ensemble des cablages AC/DC selon les normes IEC 60364 et IEC 61215.","priority":"Must Have"},{"id":6,"category":"Technical","description":"Fournir et installer le systeme de protection contre la foudre et la mise a la terre (IEC 62305).","priority":"Must Have"},{"id":7,"category":"Technical","description":"Deployer un systeme SCADA industriel avec historisation des donnees, alarmes et acces VPN securise pour la STEG.","priority":"Must Have"},{"id":8,"category":"Operational","description":"Realiser une Etude d'Impact Environnemental et Social (EIES) validee par le Ministere de l'Environnement.","priority":"Must Have"},{"id":9,"category":"Operational","description":"Mettre en oeuvre un plan de gestion des dechets de chantier et un plan de restauration du site post-construction.","priority":"Must Have"},{"id":10,"category":"Operational","description":"Appliquer un Plan HSE (Hygiene Securite Environnement) conforme aux normes ISO 45001 tout au long du chantier.","priority":"Must Have"},{"id":11,"category":"Quality","description":"Garantir un ratio de performance (PR) ≥ 82 % sur la duree de vie du projet (25 ans).","priority":"Must Have"},{"id":12,"category":"Quality","description":"Fournir une garantie sur les panneaux : rendement ≥ 90 % a 10 ans, ≥ 80 % a 25 ans (garantie fabricant).","priority":"Must Have"},{"id":13,"category":"Operational","description":"Assurer la maintenance preventive et corrective pendant 5 ans avec temps d'intervention < 48h.","priority":"Must Have"},{"id":14,"category":"Legal","description":"Obtenir tous les permis et autorisations administratives aupres des autorites tunisiennes (permis de construire, autorisation de production, etc.).","priority":"Must Have"},{"id":15,"category":"Functional","description":"Justifier d'une experience de min. 3 centrales solaires EPC de capacite ≥ 20 MWc livrees.","priority":"Must Have"},{"id":16,"category":"Functional","description":"L'equipe projet doit inclure : 1 Ingenieur en genie electrique, 1 Ingenieur genie civil, 1 Specialiste PV certifie NABCEP ou equivalent.","priority":"Must Have"}]	["Centrale Solaire Photovoltaique de 50 MWc","Systeme SCADA industriel","Etude d'Impact Environnemental et Social (EIES)"]	["Experience EPC solaire (references)","Qualite technique de l'offre","Qualifications equipe et sous-traitants","Offre financiere globale","Contenu local (main d'oeuvre tunisienne)"]	["Francais","Anglais"]	La STEG lance un appel d'offres pour la construction et la mise en service d'une centrale solaire photovoltaique de 50 MWc a Regueb, en Tunisie. Le projet comprend la conception, la fourniture, la construction, l'installation, la mise en service et la maintenance pendant 5 ans. Les soumissionnaires doivent justifier d'une experience EPC solaire prouvee et d'une capacite financiere suffisante.	completed	\N	2026-05-07 01:58:49.71+01
\.


--
-- Data for Name: tender_scores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tender_scores (score_id, tender_id, analysis_id, total_score, label, service_match_score, sector_fit_score, budget_alignment_score, timeline_score, geographic_score, past_similarity_score, strengths, risks, recommendation, reasoning, similar_past_tenders, created_at) FROM stdin;
1	1	4	83	High Fit	30	20	15	15	3	0	["Score calculé par règles — LLM indisponible"]	["Vérifier manuellement la pertinence"]	Analyser manuellement ce dossier.	Score calculé par règles automatiques (LLM temporairement indisponible).	[]	2026-05-07 01:32:36.795+01
2	2	5	83	High Fit	30	20	15	15	3	0	["Score calculé par règles — LLM indisponible"]	["Vérifier manuellement la pertinence"]	Analyser manuellement ce dossier.	Score calculé par règles automatiques (LLM temporairement indisponible).	[]	2026-05-07 01:48:42.455+01
3	3	6	46	Low Fit	4	20	7	12	3	0	["Score calculé par règles — LLM indisponible"]	["Vérifier manuellement la pertinence"]	Analyser manuellement ce dossier.	Score calculé par règles automatiques (LLM temporairement indisponible).	[]	2026-05-07 01:59:34.524+01
\.


--
-- Data for Name: tenders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenders (tender_id, titre, client, statut, date_limite, budget, responsable, description, actif, date_creation) FROM stdin;
1	Dev web	Nom-1	qualifie	2026-05-07	1500	\N	\N	t	2026-05-05 18:15:25.769+01
2	Dev mobile	Nom-2	en_cours	2026-05-13	12000	\N	\N	t	2026-05-05 18:16:00.892+01
3	Développement Portail RH	Ministère du Travail	en_cours	2026-05-17	1 500 000 DA	Karim Benali	Portail de gestion RH pour 500 agents	t	\N
4	Audit Sécurité SI	Banque Nationale d'Algérie	qualifie	2026-05-10	800 000 DA	Sara Meziane	Audit complet du système d'information	t	\N
5	Plateforme ERP Industriel	Groupe Cevital	soumis	2026-05-03	3 200 000 DA	Karim Benali	Déploiement ERP SAP pour usines	t	\N
7	Infra Cloud Migration	Ooredoo Algérie	detecte	2026-05-25	2 100 000 DA	Karim Benali	Migration vers AWS / Azure	t	\N
8	Dev -mobile-Flutter	Client -110	qualifie	2026-05-06	10000	\N	\N	t	2026-05-06 22:20:49.197+01
6	Application Mobile Terrain	Sonatrach Digital	gagne	2026-05-07	950 000 DA	Sara Meziane	App mobile pour techniciens terrain	t	\N
9	Apple d'offre Test -01	Souhaib	qualifie	2026-05-07	50000			f	2026-05-06 23:58:07.842+01
10	Dev-Test-01	Souhaib	en_cours	2026-05-07	50000			t	2026-05-07 00:03:31.696+01
\.


--
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utilisateurs (user_id, nom, prenom, email, mot_de_passe, role_id, actif, date_creation) FROM stdin;
3	Benali	Karim	manager@yellomind.com	$2a$12$k2uSmHl0v3xHIXwDcFhfd.kiiMWCy1vJnxVTX88LK98o6lDwhDUAy	2	t	\N
2	Admin	Yellomind	admin@yellomind.com	$2a$12$k4wnzlm193YVBE453Sh5Z.QKEdZufs8uKzIpQ95oU7Xg3CSSKeOZ2	1	t	\N
4	Meziane	Sara Lumi	consultant@yellomind.com	$2a$12$qBgUpNpCcTIf.xwMvCDNO.JDbnZVN7oMq4ak5OUGVZbts8z5lNQ1O	3	t	\N
\.


--
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 11, true);


--
-- Name: knowledge_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knowledge_items_item_id_seq', 7, true);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 18, true);


--
-- Name: planning_events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.planning_events_event_id_seq', 5, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 1, false);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 41, true);


--
-- Name: submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submissions_submission_id_seq', 6, true);


--
-- Name: tender_ai_analysis_analysis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tender_ai_analysis_analysis_id_seq', 6, true);


--
-- Name: tender_scores_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tender_scores_score_id_seq', 3, true);


--
-- Name: tenders_tender_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tenders_tender_id_seq', 10, true);


--
-- Name: utilisateurs_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utilisateurs_user_id_seq', 4, true);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);


--
-- Name: knowledge_items knowledge_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_items
    ADD CONSTRAINT knowledge_items_pkey PRIMARY KEY (item_id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_code_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key1 UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: planning_events planning_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planning_events
    ADD CONSTRAINT planning_events_pkey PRIMARY KEY (event_id);


--
-- Name: roles roles_libelle_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_libelle_key UNIQUE (libelle);


--
-- Name: roles roles_libelle_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_libelle_key1 UNIQUE (libelle);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: sessions sessions_token_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key1 UNIQUE (token);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: tender_ai_analysis tender_ai_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_ai_analysis
    ADD CONSTRAINT tender_ai_analysis_pkey PRIMARY KEY (analysis_id);


--
-- Name: tender_scores tender_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_scores
    ADD CONSTRAINT tender_scores_pkey PRIMARY KEY (score_id);


--
-- Name: tenders tenders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenders
    ADD CONSTRAINT tenders_pkey PRIMARY KEY (tender_id);


--
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key1 UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (user_id);


--
-- Name: planning_events planning_events_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planning_events
    ADD CONSTRAINT planning_events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE SET NULL;


--
-- Name: planning_events planning_events_tender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planning_events
    ADD CONSTRAINT planning_events_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES public.tenders(tender_id) ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilisateurs(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tender_ai_analysis tender_ai_analysis_tender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_ai_analysis
    ADD CONSTRAINT tender_ai_analysis_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES public.tenders(tender_id) ON UPDATE CASCADE;


--
-- Name: tender_scores tender_scores_tender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tender_scores
    ADD CONSTRAINT tender_scores_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES public.tenders(tender_id) ON UPDATE CASCADE;


--
-- Name: utilisateurs utilisateurs_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BxyIVO4iaf3QbaEdC7FfW6DAcNTZARNxBDyJiEVhmjcLmfifhV0tazIRhTn7fhw

