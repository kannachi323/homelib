INSERT INTO users (id, name, email, password, is_admin)
VALUES(
    '88d0cd1e-912c-4d7f-9bc8-f9ef324d3df9',
    'Admin', 
    'admin@gmail.com', 
    crypt('poptropica911', gen_salt('bf')),
    true
),
(
    'f06d11d2-e147-45b7-aa29-c2aa5d8e9cc0',
    'testuser',
    'testuser@gmail.com',
    crypt('test1234', gen_salt('bf')),
    true
);