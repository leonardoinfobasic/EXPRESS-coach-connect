-- Inserisci alcuni messaggi di test tra utenti esistenti
-- Assicurati che gli ID degli utenti esistano nel tuo database

-- Messaggi tra trainer (ID 1) e cliente (ID 2)
INSERT INTO Message (senderId, receiverId, content, createdAt, updatedAt) VALUES
(1, 2, 'Ciao! Come va il tuo allenamento?', NOW(), NOW()),
(2, 1, 'Ciao! Va tutto bene, grazie per aver chiesto!', NOW(), NOW()),
(1, 2, 'Perfetto! Ricordati di fare stretching dopo ogni sessione.', NOW(), NOW()),
(2, 1, 'Certamente! Ho una domanda sulla scheda di allenamento...', NOW(), NOW());

-- Messaggi tra trainer (ID 1) e un altro cliente (ID 3, se esiste)
INSERT INTO Message (senderId, receiverId, content, createdAt, updatedAt) VALUES
(1, 3, 'Benvenuto! Sono il tuo nuovo trainer.', NOW(), NOW()),
(3, 1, 'Grazie! Non vedo l''ora di iniziare!', NOW(), NOW());

-- Verifica che i messaggi siano stati inseriti
SELECT 
  m.id,
  s.name as sender_name,
  r.name as receiver_name,
  m.content,
  m.createdAt
FROM Message m
JOIN User s ON m.senderId = s.id
JOIN User r ON m.receiverId = r.id
ORDER BY m.createdAt DESC;
