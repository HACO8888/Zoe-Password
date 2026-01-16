BEGIN;

CREATE TABLE IF NOT EXISTS passwords (
  id SERIAL PRIMARY KEY,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO passwords (id, password)
VALUES (1, '1234')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password;

SELECT setval(
  pg_get_serial_sequence('passwords', 'id'),
  GREATEST((SELECT MAX(id) FROM passwords), 1)
);

COMMIT;
