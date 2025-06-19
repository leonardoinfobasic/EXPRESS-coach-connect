-- Verifica gli utenti esistenti nel database
SELECT id, name, email, role FROM User ORDER BY id;

-- Se non hai abbastanza utenti, puoi crearne alcuni di test
-- INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES
-- ('Cliente Test', 'cliente@test.com', '$2b$10$hashedpassword', 'CLIENT', NOW(), NOW()),
-- ('Trainer Test', 'trainer@test.com', '$2b$10$hashedpassword', 'TRAINER', NOW(), NOW());
