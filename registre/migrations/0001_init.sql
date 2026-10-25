-- Registre confédéral des citoyens (docs/canon/citoyennete.md)
-- Le registre national (peuple, art. 102) est tenu dans une table distincte du
-- registre des citoyens : il ne sert qu'à l'élection du Narodni Sabor.

CREATE TABLE citizens (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE,                   -- minuscules ; NULL pour un mineur déclaré par un parent
  guardian_id  TEXT REFERENCES citizens(id) ON DELETE CASCADE,  -- parent déclarant (mineurs)
  handover_email TEXT,                        -- adresse du jeune majeur en attente de confirmation
  verified_at  TEXT,                          -- NULL tant que l'adresse n'est pas confirmée
  surname      TEXT NOT NULL,
  given        TEXT NOT NULL,
  sex          TEXT NOT NULL CHECK (sex IN ('F','M')),
  dob          TEXT NOT NULL,                 -- AAAA-MM-JJ
  origin_name  TEXT NOT NULL,                 -- commune (opstine.json)
  origin_iso   TEXT NOT NULL,
  state        TEXT NOT NULL,                 -- code d'État dérivé de la commune, jamais saisi
  basis        TEXT NOT NULL CHECK (basis IN ('own','ancestry','residence','filiation')),
  abroad       INTEGER NOT NULL DEFAULT 0,
  std          TEXT NOT NULL CHECK (std IN ('western','central','eastern')),
  show_nat     INTEGER NOT NULL DEFAULT 0,
  num          TEXT UNIQUE,                   -- BK-XX-NNNNNN, attribué à la confirmation
  card         INTEGER NOT NULL DEFAULT 0,    -- numéro d'émission de la carte
  issued       TEXT,
  expiry       TEXT,
  mail_day     TEXT,                          -- envois de la carte par jour (anti-abus)
  mail_count   INTEGER NOT NULL DEFAULT 0,
  last_mail_at TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  CHECK (email IS NOT NULL OR guardian_id IS NOT NULL)
);
CREATE INDEX citizens_verified ON citizens(verified_at);
CREATE INDEX citizens_guardian ON citizens(guardian_id);
CREATE INDEX citizens_state ON citizens(state);

-- Art. 102 : une ligne par citoyen inscrit au moins une fois. Après un retrait, le registre
-- en clair et le consentement sont effacés ; restent les dates (verrou de quinze ans, période
-- probatoire) et l'empreinte poivrée du dernier registre. Tout disparaît avec le compte.
CREATE TABLE national_register (
  citizen_id  TEXT PRIMARY KEY REFERENCES citizens(id) ON DELETE CASCADE,
  people      TEXT CHECK (people IS NULL OR people IN ('slo','hrv','srb','bos','cng','mkd','bul')),
  consent_at  TEXT,                           -- consentement explicite en cours (RGPD art. 9.2.a)
  since       TEXT NOT NULL,                  -- date d'inscription : départ du verrou de quinze ans
  prob        TEXT,                           -- fin de la période probatoire (NULL : rectifiée ou inscription ultérieure)
  eff         TEXT NOT NULL,                  -- effet pour le Narodni Sabor (demande + un an)
  last_hash   TEXT NOT NULL,                  -- SHA-256(pepper:reg:citoyen:registre) du dernier registre
  CHECK ((people IS NULL) = (consent_at IS NULL))
);
CREATE INDEX national_register_people ON national_register(people);

CREATE TABLE tokens (
  hash        TEXT PRIMARY KEY,               -- SHA-256(pepper:jeton), le jeton n'est jamais stocké
  citizen_id  TEXT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('confirm','access','handover')),
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used_at     TEXT
);
CREATE INDEX tokens_citizen ON tokens(citizen_id);

-- Séquence par État (lettres du code) : les numéros ne sont jamais réattribués.
CREATE TABLE counters (
  letters TEXT PRIMARY KEY,
  n       INTEGER NOT NULL
);

-- Fenêtres anti-abus (empreinte d'IP ou d'adresse, jamais la valeur en clair).
CREATE TABLE ratelimit (
  key    TEXT PRIMARY KEY,
  window TEXT NOT NULL,
  count  INTEGER NOT NULL
);
