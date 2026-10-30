-- ════════════════════════════════════════════════════════════════════════
-- PING VIBE — relational schema (PostgreSQL 15+ / Supabase / PGlite)
-- Idempotent: safe to run on every boot.
-- ════════════════════════════════════════════════════════════════════════

-- ── Accounts & identity ────────────────────────────────────────────────

create table if not exists parents (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  password_hash     text not null,
  email_verified_at timestamptz,
  consent_given_at  timestamptz,
  reminders_enabled boolean not null default true,
  reminder_hour     smallint not null default 18 check (reminder_hour between 0 and 23),
  companion_enabled boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create unique index if not exists parents_email_lower_uq on parents (lower(email));

create table if not exists children (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references parents(id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 40),
  username      text not null unique,
  pin_hash      text,
  birth_month   smallint not null check (birth_month between 1 and 12),
  birth_year    smallint not null check (birth_year between 2005 and 2100),
  grade         text not null,
  status        text not null default 'pending_consent' check (status in ('pending_consent','active','suspended')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists children_parent_idx on children (parent_id);

-- Levels are data, not code: admins can append levels indefinitely.
create table if not exists learning_levels (
  id                 integer primary key check (id >= 1),
  name               text not null,
  tier               smallint not null default 1,
  tier_name          text not null default '',
  min_xp             integer not null,
  min_words_mastered integer not null default 0,
  milestone          smallint not null default 0 check (milestone in (0,5,10,25,50)),
  reward_coins       integer not null default 0,
  reward_slugs       text[] not null default '{}',
  special_mission    text,
  description        text not null default ''
);
create index if not exists learning_levels_xp_idx on learning_levels (min_xp);

-- Grade catalogue (admins can add grades without code changes).
create table if not exists grade_config (
  grade             text primary key,
  label             text not null,
  band              smallint not null check (band between 1 and 4),
  new_words_per_day smallint not null default 10 check (new_words_per_day between 0 and 30),
  sort_order        smallint not null default 0,
  active            boolean not null default true
);

create table if not exists child_profiles (
  child_id                uuid primary key references children(id) on delete cascade,
  buddy                   text not null default 'max',
  theme                   text not null default 'theme-midnight',
  accessory               text,
  pet                     text,
  level_id                integer not null default 1 references learning_levels(id),
  journey_day             integer not null default 1 check (journey_day >= 1),
  xp_total                integer not null default 0 check (xp_total >= 0),
  coins                   integer not null default 0 check (coins >= 0),
  crystals                integer not null default 0 check (crystals >= 0),
  active_pet              text,
  vocab_band              smallint not null default 1 check (vocab_band between 1 and 4),
  skill_vocabulary        smallint not null default 50 check (skill_vocabulary between 0 and 100),
  skill_grammar           smallint not null default 50 check (skill_grammar between 0 and 100),
  skill_writing           smallint not null default 50 check (skill_writing between 0 and 100),
  skill_reading           smallint not null default 50 check (skill_reading between 0 and 100),
  skill_speaking          smallint not null default 50 check (skill_speaking between 0 and 100),
  onboarded_at            timestamptz,
  updated_at              timestamptz not null default now()
);

create table if not exists consent_records (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid not null references parents(id) on delete cascade,
  child_id        uuid references children(id) on delete cascade,
  consent_version text not null,
  scopes          text[] not null,
  granted_at      timestamptz not null default now(),
  revoked_at      timestamptz
);

create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text not null default 'Administrator',
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create unique index if not exists admin_users_email_lower_uq on admin_users (lower(email));

-- Server-side sessions (only a SHA-256 of the cookie token is stored).
create table if not exists auth_sessions (
  token_hash   text primary key,
  subject_type text not null check (subject_type in ('parent','child','admin')),
  subject_id   uuid not null,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index if not exists auth_sessions_subject_idx on auth_sessions (subject_type, subject_id);

-- One-time tokens (e-mail verification).
create table if not exists auth_tokens (
  token_hash text primary key,
  parent_id  uuid not null references parents(id) on delete cascade,
  purpose    text not null check (purpose in ('verify_email','reset_password')),
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  bucket       text primary key,
  window_start timestamptz not null,
  hits         integer not null
);

-- Development mailbox (only written when no e-mail provider is configured).
create table if not exists dev_mailbox (
  id         uuid primary key default gen_random_uuid(),
  to_email   text not null,
  subject    text not null,
  html       text not null,
  created_at timestamptz not null default now()
);

-- ── Vocabulary engine ──────────────────────────────────────────────────

create table if not exists vocabulary_master (
  id             uuid primary key default gen_random_uuid(),
  word           text not null,
  band           smallint not null check (band between 1 and 4),
  part_of_speech text not null default 'noun',
  phonetic       text not null,
  meaning        text not null,
  explanation    text not null,
  example        text not null,
  usage          text not null default '',
  synonyms       text[] not null default '{}',
  antonyms       text[] not null default '{}',
  emoji          text not null default '✨',
  category       text not null default 'general',
  source         text not null default 'seed' check (source in ('seed','ai','manual')),
  difficulty     smallint not null default 1 check (difficulty between 1 and 5),
  status         text not null default 'published' check (status in ('draft','published','archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index if not exists vocabulary_word_uq on vocabulary_master (lower(word));
create index if not exists vocabulary_band_idx on vocabulary_master (band, status, difficulty);

-- Status DISCOVERED → PRACTISING → MASTERED. Mastery needs correct answers on
-- several *different days* (Leitner box ≥ 4), never just viewing the card.
create table if not exists child_vocabulary_progress (
  child_id          uuid not null references children(id) on delete cascade,
  word_id           uuid not null references vocabulary_master(id) on delete cascade,
  status            text not null default 'discovered' check (status in ('discovered','practising','mastered')),
  box               smallint not null default 0 check (box between 0 and 6),
  correct_count     integer not null default 0,
  wrong_count       integer not null default 0,
  favourite         boolean not null default false,
  used_in_writing   integer not null default 0,
  used_in_speaking  integer not null default 0,
  first_seen_at     timestamptz not null default now(),
  last_practised_at timestamptz,
  last_correct_on   date,
  mastered_at       timestamptz,
  due_on            date not null default current_date,
  primary key (child_id, word_id)
);
create index if not exists cvp_due_idx on child_vocabulary_progress (child_id, due_on);
create index if not exists cvp_status_idx on child_vocabulary_progress (child_id, status);

create table if not exists daily_learning_sessions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  session_date date not null,
  new_word_ids uuid[] not null,
  review_word_ids uuid[] not null default '{}',
  cards_viewed integer not null default 0,
  correct      integer not null default 0,
  attempted    integer not null default 0,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (child_id, session_date)
);

create table if not exists daily_word_challenges (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references daily_learning_sessions(id) on delete cascade,
  child_id       uuid not null references children(id) on delete cascade,
  word_id        uuid not null references vocabulary_master(id) on delete cascade,
  challenge_type text not null check (challenge_type in ('meaning','picture','spelling','fill_blank','usage','revision')),
  correct        boolean not null,
  answered_at    timestamptz not null default now()
);
create index if not exists dwc_child_idx on daily_word_challenges (child_id, answered_at);
-- Only the FIRST attempt at each question counts (no guess-until-right farming).
create unique index if not exists dwc_once_uq on daily_word_challenges (session_id, word_id, challenge_type);

-- ── Writing ────────────────────────────────────────────────────────────

create table if not exists writing_topics (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  prompt          text not null,
  band            smallint not null check (band between 1 and 4),
  mode            text not null default 'paragraph' check (mode in ('sentence','paragraph','essay')),
  min_words       integer not null default 10,
  suggested_words text[] not null default '{}',
  emoji           text not null default '✏️',
  category        text not null default 'general',
  source          text not null default 'seed' check (source in ('seed','template','ai','manual')),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists writing_topics_band_idx on writing_topics (band, category) where active;

-- Topic history so children don't see the same topics again and again.
create table if not exists writing_topic_history (
  child_id  uuid not null references children(id) on delete cascade,
  topic_id  uuid not null references writing_topics(id) on delete cascade,
  shown_on  date not null default current_date,
  primary key (child_id, topic_id)
);

create table if not exists writing_submissions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  topic_id     uuid references writing_topics(id) on delete set null,
  kind         text not null default 'topic' check (kind in ('topic','story_builder')),
  title        text not null,
  content      text not null default '',
  word_count   integer not null default 0,
  status       text not null default 'draft' check (status in ('draft','submitted','evaluated')),
  prompt_meta  jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists ws_child_idx on writing_submissions (child_id, created_at desc);

create table if not exists writing_evaluations (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references writing_submissions(id) on delete cascade,
  score         smallint not null check (score between 0 and 100),
  breakdown     jsonb not null,
  feedback      jsonb not null,
  evaluator     text not null check (evaluator in ('claude','offline')),
  model         text,
  created_at    timestamptz not null default now()
);

-- ── Grammar ────────────────────────────────────────────────────────────

create table if not exists grammar_topics (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  emoji       text not null,
  band_min    smallint not null default 1,
  sort_order  smallint not null default 0,
  explanation text not null,
  examples    jsonb not null,
  exercises   jsonb not null
);

create table if not exists grammar_progress (
  child_id     uuid not null references children(id) on delete cascade,
  topic_id     uuid not null references grammar_topics(id) on delete cascade,
  best_score   smallint not null default 0,
  attempts     integer not null default 0,
  completed_at timestamptz,
  primary key (child_id, topic_id)
);

-- ── Games ──────────────────────────────────────────────────────────────

create table if not exists games (
  slug        text primary key,
  title       text not null,
  tagline     text not null,
  emoji       text not null,
  min_words   integer not null default 4,
  sort_order  smallint not null default 0,
  active      boolean not null default true
);

create table if not exists game_sessions (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  game_slug  text not null references games(slug) on delete cascade,
  score      integer not null,
  max_score  integer not null,
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists gs_child_idx on game_sessions (child_id, game_slug, created_at desc);

-- ── Reading ────────────────────────────────────────────────────────────

create table if not exists reading_stories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  genre      text not null,
  band       smallint not null,
  emoji      text not null,
  cover      text not null default 'forest',
  pages      jsonb not null,
  glossary   jsonb not null,
  questions  jsonb not null,
  source     text not null default 'seed' check (source in ('seed','ai','manual')),
  reward     text,
  active     boolean not null default true
);

create table if not exists story_progress (
  child_id     uuid not null references children(id) on delete cascade,
  story_id     uuid not null references reading_stories(id) on delete cascade,
  best_score   smallint not null default 0,
  completed_at timestamptz,
  primary key (child_id, story_id)
);

-- ── Speaking (privacy: no audio and no transcript is ever stored) ─────

create table if not exists speaking_sessions (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  scenario   text not null,
  lines      integer not null,
  accuracy   smallint check (accuracy between 0 and 100),
  assessed   boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists speaking_scenarios (
  slug       text primary key,
  title      text not null,
  emoji      text not null,
  band       smallint not null default 2,
  lines      text[] not null,
  source     text not null default 'seed' check (source in ('seed','ai','manual')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Server-scored challenges (answer key never leaves the server).
create table if not exists challenge_attempts (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  kind         text not null check (kind in ('weekly','monthly','boss','special','mystery','family','listening')),
  ref          text,
  difficulty   text not null default 'normal' check (difficulty in ('easy','normal','hard')),
  passed       boolean,
  correct      smallint,
  questions    jsonb not null,
  answer_key   jsonb not null,
  score        smallint,
  created_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists challenge_child_idx on challenge_attempts (child_id, kind, created_at desc);

-- ════════════════ Game layer (all unlocks are evaluated from learning data) ════════════════

-- Key/value platform settings editable by admins (e.g. daily XP ceiling).
create table if not exists app_settings (
  key   text primary key,
  value jsonb not null
);

-- Personal avatar (parts reference rewards.slug items the child owns).
create table if not exists child_avatars (
  child_id   uuid primary key references children(id) on delete cascade,
  skin       text not null default 'tone-3',
  hair       text not null default 'hair-short',
  hair_color text not null default '#2B1B12',
  outfit     text not null default 'outfit-hoodie-purple',
  shoes      text not null default 'shoes-sneakers',
  accessory  text,
  background text not null default 'bg-sky',
  expression text not null default 'expr-smile',
  magic_object text,
  celebration text not null default 'anim-confetti',
  updated_at timestamptz not null default now()
);

create table if not exists pets (
  slug         text primary key,
  name         text not null,
  emoji        text not null,
  personality  text not null,
  hint_style   text not null,
  unlock_metric text not null,
  unlock_target integer not null,
  unlock_label text not null,
  rarity       text not null default 'common' check (rarity in ('common','rare','epic','legendary')),
  sort_order   smallint not null default 0,
  active       boolean not null default true
);

-- Pets grow only from learning (no neglect/decay mechanics).
create table if not exists child_pets (
  child_id     uuid not null references children(id) on delete cascade,
  pet_slug     text not null references pets(slug) on delete cascade,
  nickname     text,
  growth       integer not null default 0,
  unlocked_at  timestamptz not null default now(),
  primary key (child_id, pet_slug)
);

-- Non-derived collectibles (characters, creatures, event cards). Vocabulary,
-- grammar and story cards are derived from mastery / completion records.
create table if not exists collectible_cards (
  slug        text primary key,
  kind        text not null check (kind in ('character','creature','event')),
  title       text not null,
  emoji       text not null,
  rarity      text not null check (rarity in ('common','rare','epic','legendary')),
  fact        text not null,
  lesson      text not null,
  sort_order  smallint not null default 0
);

create table if not exists child_collectibles (
  child_id    uuid not null references children(id) on delete cascade,
  kind        text not null check (kind in ('vocabulary','grammar','story','character','creature','event')),
  ref         text not null,
  earned_at   timestamptz not null default now(),
  primary key (child_id, kind, ref)
);

-- Mission catalogue. Progress is computed from learning metrics in the period.
create table if not exists missions (
  slug        text primary key,
  scope       text not null check (scope in ('daily','weekly','monthly','character','mystery','event')),
  character   text not null default 'max',
  title       text not null,
  description text not null,
  metric      text not null,
  target      integer not null check (target > 0),
  band_min    smallint not null default 1,
  band_max    smallint not null default 4,
  xp          integer not null default 0,
  coins       integer not null default 0,
  crystals    integer not null default 0,
  href        text not null,
  event_slug  text,
  active      boolean not null default true
);

create table if not exists child_missions (
  child_id     uuid not null references children(id) on delete cascade,
  mission_slug text not null references missions(slug) on delete cascade,
  period_key   text not null,
  claimed_at   timestamptz,
  created_at   timestamptz not null default now(),
  primary key (child_id, mission_slug, period_key)
);

create table if not exists kingdom_locations (
  slug          text primary key,
  kingdom       text not null,
  title         text not null,
  emoji         text not null,
  kind          text not null check (kind in ('mission','treasure','boss','special','secret')),
  x             smallint not null,
  y             smallint not null,
  unlock_metric text not null,
  unlock_target integer not null,
  unlock_label  text not null,
  href          text,
  reward_crystals integer not null default 0,
  reward_coins  integer not null default 0,
  sort_order    smallint not null default 0
);

-- Claimed treasures / one-time location rewards.
create table if not exists child_location_claims (
  child_id   uuid not null references children(id) on delete cascade,
  location   text not null references kingdom_locations(slug) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (child_id, location)
);

-- MY PING VIBE WORLD buildings unlocked by learning milestones.
create table if not exists world_buildings (
  slug          text primary key,
  title         text not null,
  emoji         text not null,
  description   text not null,
  unlock_metric text not null,
  unlock_target integer not null,
  unlock_label  text not null,
  href          text not null,
  x             smallint not null,
  y             smallint not null,
  sort_order    smallint not null default 0
);

-- Skill tree. Nodes unlock from assessed evidence (accuracy over attempts), never XP.
create table if not exists skill_nodes (
  slug          text primary key,
  branch        text not null,
  title         text not null,
  description   text not null,
  evidence      text not null,
  min_attempts  integer not null,
  min_accuracy  smallint not null,
  prereq        text,
  band_min      smallint not null default 1,
  sort_order    smallint not null default 0
);

create table if not exists skill_evidence (
  child_id   uuid not null references children(id) on delete cascade,
  skill      text not null,
  correct    integer not null default 0,
  attempts   integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (child_id, skill)
);

create table if not exists boss_battles (
  slug        text primary key,
  kingdom     text not null,
  title       text not null,
  villain     text not null,
  emoji       text not null,
  story       text not null,
  rounds      jsonb not null,
  unlock_level integer not null default 1,
  xp          integer not null default 150,
  coins       integer not null default 40,
  crystals    integer not null default 3,
  card_slug   text,
  sort_order  smallint not null default 0
);

-- Parent-created family challenges (no child-to-child communication anywhere).
create table if not exists family_challenges (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references parents(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  title       text not null,
  message     text not null default '',
  word_ids    uuid[] not null,
  attempt_id  uuid,
  score       smallint,
  created_at  timestamptz not null default now(),
  completed_at timestamptz
);

-- Timeline milestones that can't be derived later (e.g. reaching a level).
create table if not exists child_milestones (
  child_id    uuid not null references children(id) on delete cascade,
  kind        text not null,
  title       text not null,
  emoji       text not null,
  achieved_at timestamptz not null default now(),
  primary key (child_id, kind)
);

-- ── Gamification ───────────────────────────────────────────────────────

create table if not exists xp_config (
  key         text primary key,
  label       text not null,
  xp          integer not null check (xp >= 0),
  coins       integer not null default 0 check (coins >= 0),
  crystals    integer not null default 0 check (crystals >= 0),
  daily_cap   integer not null default 1 check (daily_cap >= 0)
);

-- Ledger. idempotency_key prevents duplicate awards (double clicks, replays).
create table if not exists xp_transactions (
  id              uuid primary key default gen_random_uuid(),
  child_id        uuid not null references children(id) on delete cascade,
  amount          integer not null,
  coins           integer not null default 0,
  crystals        integer not null default 0,
  reason          text not null,
  source          text not null,
  idempotency_key text not null unique,
  created_at      timestamptz not null default now()
);
create index if not exists xp_child_idx on xp_transactions (child_id, created_at desc);

create table if not exists achievements (
  slug        text primary key,
  title       text not null,
  description text not null,
  emoji       text not null,
  sort_order  smallint not null default 0
);

create table if not exists child_achievements (
  child_id    uuid not null references children(id) on delete cascade,
  slug        text not null references achievements(slug) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (child_id, slug)
);

create table if not exists rewards (
  slug        text primary key,
  title       text not null,
  category    text not null check (category in ('buddy','hair','outfit','shoes','accessory','costume','background','expression','theme','stories','decoration','magic_object','animation')),
  rarity      text not null default 'common' check (rarity in ('common','rare','epic','legendary')),
  cost_crystals integer not null default 0 check (cost_crystals >= 0),
  starter     boolean not null default false,
  art         text,
  emoji       text not null,
  cost_coins  integer not null check (cost_coins >= 0),
  description text not null,
  min_level   integer not null default 1,
  level_exclusive boolean not null default false, -- granted by reaching a level, not sold
  active      boolean not null default true
);

create table if not exists child_rewards (
  child_id    uuid not null references children(id) on delete cascade,
  slug        text not null references rewards(slug) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (child_id, slug)
);

create table if not exists learning_streaks (
  child_id         uuid primary key references children(id) on delete cascade,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_on   date
);

-- Every learning activity (feeds parent reports & learning time).
create table if not exists activity_log (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references children(id) on delete cascade,
  module     text not null,
  seconds    integer not null default 0 check (seconds between 0 and 7200),
  detail     jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists activity_child_idx on activity_log (child_id, created_at desc);

create table if not exists personalised_recommendations (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  module      text not null,
  title       text not null,
  reason      text not null,
  priority    smallint not null,
  created_on  date not null default current_date,
  unique (child_id, created_on, module)
);

create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children(id) on delete cascade,
  parent_id  uuid references parents(id) on delete cascade,
  title      text not null,
  body       text not null,
  kind       text not null default 'info',
  read_at    timestamptz,
  created_at timestamptz not null default now(),
  check (child_id is not null or parent_id is not null)
);
create index if not exists notif_child_idx on notifications (child_id, created_at desc);
create index if not exists notif_parent_idx on notifications (parent_id, created_at desc);

-- Admin-reviewed content pipeline (AI drafts land here before publishing).
create table if not exists content_library (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('vocabulary','writing_topic','story','grammar','speaking')),
  title       text not null,
  band        smallint,
  body        jsonb not null,
  validation  jsonb not null default '{}',
  source      text not null check (source in ('ai','manual')),
  status      text not null default 'pending' check (status in ('pending','approved','rejected','published')),
  job_id      uuid,
  reviewed_by uuid references admin_users(id) on delete set null,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists content_library_status_idx on content_library (status, kind);

create table if not exists content_generation_jobs (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,
  band        smallint,
  params      jsonb not null default '{}',
  status      text not null default 'running' check (status in ('running','done','failed')),
  produced    integer not null default 0,
  rejected    integer not null default 0,
  error       text,
  requested_by text not null default 'admin',
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);

-- Curated grade-wise headwords waiting for AI enrichment + review.
create table if not exists vocabulary_candidates (
  word       text primary key,
  band       smallint not null check (band between 1 and 4),
  category   text not null default 'general',
  status     text not null default 'queued' check (status in ('queued','generated','published','rejected')),
  created_at timestamptz not null default now()
);

-- ── 365-day curriculum ─────────────────────────────────────────────────
-- One structured plan per grade per day (10 grades × 365 days = 3,650 rows).
-- Activities reference content POOLS (band, category, topic), so each day is
-- filled with fresh, unseen content for that child at run time.
create table if not exists learning_plans (
  grade        text not null,
  day_number   integer not null check (day_number >= 1),
  week         integer not null,
  month        integer not null,
  theme        text not null,
  difficulty   smallint not null check (difficulty between 1 and 10),
  focus        text not null,
  activities   jsonb not null,
  primary key (grade, day_number)
);

-- A child's journey advances by completed learning days, not calendar days:
-- missing a day never skips content or resets the journey.
create table if not exists child_plan_days (
  child_id      uuid not null references children(id) on delete cascade,
  day_number    integer not null,
  started_on    date not null,
  done          text[] not null default '{}',
  completed_on  date,
  primary key (child_id, day_number)
);

create table if not exists kingdoms (
  slug          text primary key,
  title         text not null,
  emoji         text not null,
  art           text not null,
  description   text not null,
  href          text not null,
  unlock_level  integer not null default 1,
  sort_order    smallint not null default 0,
  active        boolean not null default true
);

-- Seasonal events, festivals, weekly & monthly specials (recurring by month/day).
create table if not exists events (
  slug          text primary key,
  title         text not null,
  emoji         text not null,
  kind          text not null check (kind in ('festival','seasonal','special')),
  month         smallint not null check (month between 1 and 12),
  day           smallint not null check (day between 1 and 31),
  window_days   smallint not null default 3,
  description   text not null,
  words         text[] not null default '{}',
  writing_prompt text not null default '',
  active        boolean not null default true
);

-- ── Forward-compatible column upgrades for existing databases ─────────
alter table child_profiles add column if not exists onboarded_at timestamptz;
alter table auth_tokens drop constraint if exists auth_tokens_purpose_check;
alter table auth_tokens add constraint auth_tokens_purpose_check check (purpose in ('verify_email','reset_password'));
