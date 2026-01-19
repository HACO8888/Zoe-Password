BEGIN;

CREATE TABLE IF NOT EXISTS passwords (
  id SERIAL PRIMARY KEY,
  password TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO passwords (id, password, title)
VALUES (1, '1234', '關卡 1')
ON CONFLICT (id) DO UPDATE
SET password = EXCLUDED.password,
    title = EXCLUDED.title;

SELECT setval(
  pg_get_serial_sequence('passwords', 'id'),
  GREATEST((SELECT MAX(id) FROM passwords), 1)
);

COMMIT;
