INSERT OR REPLACE INTO users (id, name, email, password, is_admin)
VALUES(
    '88d0cd1e-912c-4d7f-9bc8-f9ef324d3df9',
    'Admin', 
    'admin@gmail.com', 
    '$2a$10$LDNa9quSeOByuArEm68lSuWxju8943cHUOr32CojzlV/4QegIQJIK',
    1
),
(
    'f06d11d2-e147-45b7-aa29-c2aa5d8e9cc0',
    'testuser',
    'testuser@gmail.com',
    '$2a$10$eQ1C8v8PR5ea4cvzGSoTN.RU1ZklB04o8MRIPAls9zdX6Vw3HPjo2',
    0
);

INSERT INTO devices (id, name, address, user_id)
VALUES (
    '1a2b3c4d-5678-90ab-cdef-1234567890ab',
    'Test Device',
    '130.7.184.78',
    '88d0cd1e-912c-4d7f-9bc8-f9ef324d3df9'
);