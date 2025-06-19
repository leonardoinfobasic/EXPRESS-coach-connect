-- Inserimento di dati di esempio
USE coachconnect;

-- Inserimento utenti (password: password123)
INSERT INTO users (name, email, password, role) VALUES
('Mario Rossi', 'mario@example.com', '$2a$10$XFxUHVu.lJMUZ3G6jqwNzOvYwBNTY5xIUNW1Rj.12BLNqQQ6zqJHe', 'trainer'),
('Giulia Bianchi', 'giulia@example.com', '$2a$10$XFxUHVu.lJMUZ3G6jqwNzOvYwBNTY5xIUNW1Rj.12BLNqQQ6zqJHe', 'client'),
('Luca Verdi', 'luca@example.com', '$2a$10$XFxUHVu.lJMUZ3G6jqwNzOvYwBNTY5xIUNW1Rj.12BLNqQQ6zqJHe', 'client'),
('Anna Neri', 'anna@example.com', '$2a$10$XFxUHVu.lJMUZ3G6jqwNzOvYwBNTY5xIUNW1Rj.12BLNqQQ6zqJHe', 'client');

-- Inserimento clienti
INSERT INTO clients (user_id, trainer_id, height, weight, fitness_goal, health_issues, notes) VALUES
(2, 1, 165.5, 60.2, 'Perdere peso e tonificare', 'Nessuno', 'Cliente motivato'),
(3, 1, 180.0, 85.5, 'Aumentare massa muscolare', 'Problemi alla schiena', 'Necessita di esercizi specifici per la schiena'),
(4, 1, 170.0, 65.0, 'Migliorare resistenza', 'Nessuno', 'Prepararsi per una maratona');

-- Inserimento piani di allenamento
INSERT INTO workout_plans (client_id, title, description, start_date, end_date, status) VALUES
(1, 'Piano di tonificazione', 'Piano di allenamento per tonificare tutto il corpo', '2023-06-01', '2023-07-31', 'active'),
(2, 'Piano di ipertrofia', 'Piano di allenamento per aumentare la massa muscolare', '2023-06-15', '2023-08-15', 'active'),
(3, 'Piano di resistenza', 'Piano di allenamento per migliorare la resistenza', '2023-06-10', '2023-08-10', 'active');

-- Inserimento esercizi per il piano di tonificazione
INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, sets, reps, weight, rest_time, notes, exercise_order) VALUES
(1, 1, 'Squat', 3, '12-15', 'Corpo libero', '60s', 'Mantieni la schiena dritta', 1),
(1, 1, 'Push-up', 3, '10-12', 'Corpo libero', '60s', 'Mantieni il core contratto', 2),
(1, 1, 'Plank', 3, '30s', 'Corpo libero', '45s', 'Mantieni la posizione corretta', 3),
(1, 2, 'Affondi', 3, '12 per gamba', 'Corpo libero', '60s', 'Mantieni il ginocchio allineato con il piede', 1),
(1, 2, 'Dips', 3, '10-12', 'Corpo libero', '60s', 'Usa una sedia o un banco', 2),
(1, 2, 'Russian twist', 3, '20 totali', 'Corpo libero', '45s', 'Ruota lentamente', 3);

-- Inserimento esercizi per il piano di ipertrofia
INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, sets, reps, weight, rest_time, notes, exercise_order) VALUES
(2, 1, 'Panca piana', 4, '8-10', '60kg', '90s', 'Aumenta il peso gradualmente', 1),
(2, 1, 'Trazioni', 4, '8-10', 'Corpo libero', '90s', 'Usa l\'assistenza se necessario', 2),
(2, 1, 'Curl con bilanciere', 3, '10-12', '20kg', '60s', 'Mantieni i gomiti fermi', 3),
(2, 2, 'Squat con bilanciere', 4, '8-10', '80kg', '90s', 'Scendi fino a parallelo', 1),
(2, 2, 'Stacchi da terra', 4, '8-10', '100kg', '120s', 'Mantieni la schiena dritta', 2),
(2, 2, 'Polpacci in piedi', 3, '15-20', '40kg', '60s', 'Estendi completamente', 3);

-- Inserimento esercizi per il piano di resistenza
INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, sets, reps, weight, rest_time, notes, exercise_order) VALUES
(3, 1, 'Corsa', 1, '30 minuti', 'N/A', 'N/A', 'Mantieni un ritmo costante', 1),
(3, 1, 'Burpees', 3, '15', 'Corpo libero', '45s', 'Esegui il movimento completo', 2),
(3, 1, 'Mountain climbers', 3, '30s', 'Corpo libero', '30s', 'Mantieni un ritmo veloce', 3),
(3, 2, 'Interval training', 1, '20 minuti (30s on, 30s off)', 'N/A', '30s', 'Alterna sprint e recupero attivo', 1),
(3, 2, 'Jumping jacks', 3, '45s', 'Corpo libero', '30s', 'Mantieni un ritmo costante', 2),
(3, 2, 'Skipping', 3, '45s', 'Corpo libero', '30s', 'Solleva bene le ginocchia', 3);

-- Inserimento messaggi
INSERT INTO messages (sender_id, receiver_id, content) VALUES
(1, 2, 'Ciao Giulia, come sta andando con il nuovo piano di allenamento?'),
(2, 1, 'Ciao Mario, sta andando molto bene! Sento già dei miglioramenti.'),
(1, 3, 'Ciao Luca, ricordati di fare gli esercizi per la schiena che ti ho consigliato.'),
(3, 1, 'Grazie per il promemoria, li sto facendo regolarmente.'),
(1, 4, 'Ciao Anna, come procede la preparazione per la maratona?'),
(4, 1, 'Bene! Sto seguendo il piano alla lettera e mi sento più resistente.');

-- Inserimento notifiche
INSERT INTO notifications (user_id, title, message, type) VALUES
(2, 'Nuovo piano di allenamento', 'Il tuo trainer ha creato un nuovo piano di allenamento per te', 'WORKOUT_PLAN'),
(3, 'Nuovo piano di allenamento', 'Il tuo trainer ha creato un nuovo piano di allenamento per te', 'WORKOUT_PLAN'),
(4, 'Nuovo piano di allenamento', 'Il tuo trainer ha creato un nuovo piano di allenamento per te', 'WORKOUT_PLAN'),
(1, 'Nuovo messaggio', 'Hai ricevuto un nuovo messaggio da Giulia Bianchi', 'MESSAGE'),
(1, 'Nuovo messaggio', 'Hai ricevuto un nuovo messaggio da Luca Verdi', 'MESSAGE'),
(1, 'Nuovo messaggio', 'Hai ricevuto un nuovo messaggio da Anna Neri', 'MESSAGE');
