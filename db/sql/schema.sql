CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin boolean NOT NULL DEFAULT false
)