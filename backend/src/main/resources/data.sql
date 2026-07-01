INSERT INTO movies (title, genre, release_year, rating, duration_minutes, director) VALUES
('The Matrix', 'Sci-Fi', 1999, 8.7, 136, 'Lana Wachowski'),
('Inception', 'Sci-Fi', 2010, 8.8, 148, 'Christopher Nolan'),
('Parasite', 'Drama', 2019, 8.5, 132, 'Bong Joon-ho'),
('Spirited Away', 'Animation', 2001, 8.6, 125, 'Hayao Miyazaki'),
('The Dark Knight', 'Action', 2008, 9.0, 152, 'Christopher Nolan'),
('Interstellar', 'Sci-Fi', 2014, 8.7, 169, 'Christopher Nolan'),
('Pulp Fiction', 'Crime', 1994, 8.9, 154, 'Quentin Tarantino'),
('The Shawshank Redemption', 'Drama', 1994, 9.3, 142, 'Frank Darabont'),
('Coco', 'Animation', 2017, 8.4, 105, 'Lee Unkrich'),
('Everything Everywhere All at Once', 'Action', 2022, 7.8, 139, 'Daniel Kwan'),
('Oppenheimer', 'Drama', 2023, 8.3, 180, 'Christopher Nolan'),
('Soul', 'Animation', 2020, 8.0, 100, 'Pete Docter');

INSERT INTO users (name, email, age, signup_date, country) VALUES
('Alice Johnson', 'alice@email.com', 28, '2024-01-15', 'USA'),
('Bob Smith', 'bob@email.com', 35, '2024-02-20', 'Canada'),
('Carlos Lopez', 'carlos@email.com', 22, '2024-03-10', 'Mexico'),
('Diana Prince', 'diana@email.com', 30, '2024-04-05', 'USA'),
('Eve Martinez', 'eve@email.com', 45, '2024-05-12', 'Spain'),
('Frank Lee', 'frank@email.com', 19, '2024-06-01', 'USA'),
('Grace Kim', 'grace@email.com', 33, '2024-06-15', 'South Korea'),
('Henry Brown', 'henry@email.com', 27, '2024-07-20', 'UK'),
('Iris Chen', 'iris@email.com', 24, '2024-08-01', 'China'),
('Jack Wilson', 'jack@email.com', 38, '2024-08-25', 'Australia'),
('Karen Davis', 'karen@email.com', 29, '2024-09-10', 'USA'),
('Leo Garcia', 'leo@email.com', 31, '2024-10-05', 'Argentina');

INSERT INTO subscriptions (user_id, plan, price, start_date, end_date, active) VALUES
(1, 'Premium', 15.99, '2024-01-15', NULL, TRUE),
(2, 'Standard', 9.99, '2024-02-20', '2024-08-20', FALSE),
(3, 'Basic', 5.99, '2024-03-10', NULL, TRUE),
(4, 'Premium', 15.99, '2024-04-05', NULL, TRUE),
(5, 'Standard', 9.99, '2024-05-12', NULL, TRUE),
(6, 'Basic', 5.99, '2024-06-01', NULL, TRUE),
(7, 'Premium', 15.99, '2024-06-15', NULL, TRUE),
(8, 'Standard', 9.99, '2024-07-20', '2025-01-20', FALSE),
(9, 'Basic', 5.99, '2024-08-01', NULL, TRUE),
(10, 'Premium', 15.99, '2024-08-25', NULL, TRUE),
(11, 'Standard', 9.99, '2024-09-10', NULL, TRUE),
(12, 'Basic', 5.99, '2024-10-05', NULL, TRUE);

INSERT INTO watch_history (user_id, movie_id, watched_at, progress_seconds, completed) VALUES
(1, 1, '2024-06-01 20:00:00', 8160, TRUE),
(1, 3, '2024-06-05 21:30:00', 7920, TRUE),
(2, 5, '2024-07-10 19:00:00', 9120, TRUE),
(3, 2, '2024-07-15 22:00:00', 4440, FALSE),
(4, 4, '2024-08-01 18:00:00', 7500, TRUE),
(4, 6, '2024-08-10 20:30:00', 6000, FALSE),
(5, 7, '2024-09-05 21:00:00', 9240, TRUE),
(6, 8, '2024-09-20 19:30:00', 8520, TRUE),
(7, 9, '2024-10-01 17:00:00', 6300, TRUE),
(8, 10, '2024-10-15 22:30:00', 4170, FALSE),
(9, 11, '2024-11-01 20:00:00', 10800, TRUE),
(10, 12, '2024-11-10 19:00:00', 6000, TRUE),
(11, 1, '2024-11-20 21:00:00', 4080, FALSE),
(12, 2, '2024-12-01 18:30:00', 8880, TRUE);

INSERT INTO directors (name, birth_date, nationality, awards) VALUES
('Christopher Nolan', '1970-07-30', 'British-American', 5),
('Quentin Tarantino', '1963-03-27', 'American', 4),
('Bong Joon-ho', '1969-09-14', 'South Korean', 3),
('Hayao Miyazaki', '1941-01-05', 'Japanese', 6),
('Frank Darabont', '1959-01-28', 'French-American', 2),
('Lee Unkrich', '1967-08-02', 'American', 3),
('Daniel Kwan', '1988-01-01', 'American', 1),
('Pete Docter', '1968-10-09', 'American', 4),
('Lana Wachowski', '1965-06-21', 'American', 3),
('Martin Scorsese', '1942-11-17', 'American', 8);

INSERT INTO actors (name, birth_date, nationality, active) VALUES
('Keanu Reeves', '1964-09-02', 'Canadian', TRUE),
('Leonardo DiCaprio', '1974-11-11', 'American', TRUE),
('Song Kang-ho', '1967-01-17', 'South Korean', TRUE),
('Christian Bale', '1974-01-30', 'British', TRUE),
('Matthew McConaughey', '1969-11-04', 'American', TRUE),
('John Travolta', '1954-02-18', 'American', TRUE),
('Morgan Freeman', '1937-06-01', 'American', TRUE),
('Edward Norton', '1969-08-18', 'American', TRUE),
('Robert Downey Jr.', '1965-04-04', 'American', TRUE),
('Cillian Murphy', '1976-05-25', 'Irish', TRUE);

INSERT INTO movie_actors (movie_id, actor_id, role) VALUES
(1, 1, 'Neo'),
(2, 2, 'Cobb'),
(3, 3, 'Ki-taek'),
(5, 4, 'Batman'),
(6, 5, 'Cooper'),
(7, 6, 'Vincent Vega'),
(8, 7, 'Red'),
(10, 8, 'Waymond'),
(11, 10, 'Oppenheimer'),
(5, 9, 'Joker');

INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES
(1, 1, 5, 'Obra maestra del cine'),
(1, 3, 4, 'Muy buena, pero algo larga'),
(2, 5, 5, 'La mejor de Batman'),
(3, 2, 4, 'Concepto original e innovador'),
(4, 4, 5, 'Una obra de arte animada'),
(5, 7, 5, 'Tarantino en su mejor momento'),
(6, 8, 5, 'Historia conmovedora'),
(7, 9, 4, 'Bonita historia familiar'),
(8, 10, 3, 'Buena pero confusa'),
(9, 11, 5, 'Impresionante actuación'),
(10, 12, 4, 'Muy emotiva'),
(11, 1, 4, 'Clásico de ciencia ficción');

INSERT INTO playlists (user_id, name, description, is_public) VALUES
(1, 'Favoritas de Alice', 'Mis películas favoritas', TRUE),
(2, 'Acción y Aventura', 'Películas de acción', TRUE),
(3, 'Noche de Cinema', 'Para ver con amigos', FALSE),
(4, 'Dramas Premiados', 'Oscar y premios', TRUE),
(5, 'Animación Perfecta', 'Las mejores animadas', TRUE),
(6, 'Maratón Nolan', 'Todas de Christopher Nolan', TRUE),
(7, 'Clásicos Indispensables', 'Obligatorias de ver', TRUE),
(8, 'Para Relajarse', 'Películas tranquilas', FALSE);

INSERT INTO playlist_items (playlist_id, movie_id, position) VALUES
(1, 1, 1),
(1, 3, 2),
(1, 7, 3),
(2, 5, 1),
(2, 10, 2),
(3, 1, 1),
(3, 2, 2),
(3, 5, 3),
(4, 3, 1),
(4, 8, 2),
(4, 11, 3),
(5, 4, 1),
(5, 9, 2),
(5, 12, 3),
(6, 2, 1),
(6, 5, 2),
(6, 6, 3),
(6, 11, 4),
(7, 1, 1),
(7, 7, 2),
(7, 8, 3),
(8, 4, 1),
(8, 9, 2),
(8, 12, 3);

INSERT INTO genres (name, description) VALUES
('Sci-Fi', 'Ciencia ficción y futurismo'),
('Drama', 'Historias emocionales y profundas'),
('Action', 'Aventuras y secuencias de acción'),
('Animation', 'Películas animadas'),
('Crime', 'Historias criminales y suspense'),
('Comedy', 'Comedias y humor'),
('Horror', 'Terror y suspenso'),
('Romance', 'Historias de amor'),
('Thriller', 'Suspenso y tensión'),
('Fantasy', 'Mundos fantásticos y magia');

INSERT INTO payments (user_id, amount, payment_date, method, status) VALUES
(1, 15.99, '2024-01-15 10:00:00', 'credit_card', 'completed'),
(1, 15.99, '2024-02-15 10:00:00', 'credit_card', 'completed'),
(1, 15.99, '2024-03-15 10:00:00', 'credit_card', 'completed'),
(2, 9.99, '2024-02-20 12:00:00', 'paypal', 'completed'),
(3, 5.99, '2024-03-10 14:00:00', 'credit_card', 'completed'),
(4, 15.99, '2024-04-05 09:00:00', 'credit_card', 'completed'),
(5, 9.99, '2024-05-12 11:00:00', 'paypal', 'completed'),
(6, 5.99, '2024-06-01 15:00:00', 'credit_card', 'completed'),
(7, 15.99, '2024-06-15 13:00:00', 'credit_card', 'completed'),
(8, 9.99, '2024-07-20 16:00:00', 'paypal', 'completed'),
(9, 5.99, '2024-08-01 17:00:00', 'credit_card', 'completed'),
(10, 15.99, '2024-08-25 18:00:00', 'credit_card', 'completed'),
(11, 9.99, '2024-09-10 19:00:00', 'paypal', 'completed'),
(12, 5.99, '2024-10-05 20:00:00', 'credit_card', 'completed');

INSERT INTO notifications (user_id, title, message, is_read, type) VALUES
(1, 'Bienvenido a QueryLab', 'Tu cuenta ha sido creada exitosamente', TRUE, 'info'),
(1, 'Nueva película disponible', 'The Matrix está disponible ahora', FALSE, 'recommendation'),
(2, 'Suscripción expirada', 'Tu suscripción ha terminado', TRUE, 'warning'),
(3, 'Pago recibido', 'Gracias por tu pago de $5.99', TRUE, 'payment'),
(4, 'Recomendación personalizada', 'Basado en tu historial: Inception', FALSE, 'recommendation'),
(5, 'Nuevo contenido', 'Se han agregado 5 nuevas películas', FALSE, 'info'),
(6, 'Actualización de perfil', 'Tu perfil ha sido actualizado', TRUE, 'info'),
(7, 'Oferta especial', '20% de descuento en Premium', FALSE, 'promotion'),
(8, 'Recordatorio', 'Tu suscripción vence pronto', FALSE, 'warning'),
(9, 'Bienvenido', 'Gracias por unirte a QueryLab', TRUE, 'info'),
(10, 'Nueva función', 'Explora las listas de reproducción', FALSE, 'info'),
(11, 'Confirmación de pago', 'Pago de $9.99 procesado', TRUE, 'payment');

INSERT INTO settings (user_id, language, theme, notifications_enabled, autoplay, quality) VALUES
(1, 'es', 'dark', TRUE, TRUE, 'high'),
(2, 'en', 'dark', TRUE, FALSE, 'medium'),
(3, 'es', 'light', FALSE, TRUE, 'high'),
(4, 'en', 'dark', TRUE, TRUE, 'ultra'),
(5, 'es', 'dark', TRUE, TRUE, 'high'),
(6, 'en', 'light', FALSE, FALSE, 'medium'),
(7, 'ko', 'dark', TRUE, TRUE, 'high'),
(8, 'en', 'dark', TRUE, TRUE, 'high'),
(9, 'zh', 'dark', FALSE, TRUE, 'medium'),
(10, 'en', 'dark', TRUE, TRUE, 'ultra'),
(11, 'es', 'dark', TRUE, TRUE, 'high'),
(12, 'es', 'light', TRUE, FALSE, 'medium');

INSERT INTO watchlists (user_id, name) VALUES
(1, 'Por Ver'),
(1, 'Favoritas'),
(2, 'Acción'),
(3, 'Dramas'),
(4, 'Sci-Fi'),
(5, 'Comedia'),
(6, 'Clásicos'),
(7, 'Animación'),
(8, 'Thriller');

INSERT INTO watchlist_items (watchlist_id, movie_id, priority) VALUES
(1, 2, 1),
(1, 5, 2),
(1, 11, 3),
(2, 1, 1),
(2, 3, 2),
(2, 7, 3),
(3, 5, 1),
(3, 10, 2),
(4, 8, 1),
(4, 11, 2),
(5, 1, 1),
(5, 2, 2),
(5, 6, 3),
(6, 7, 1),
(6, 8, 2),
(7, 1, 1),
(7, 7, 2),
(7, 8, 3),
(8, 4, 1),
(8, 9, 2),
(8, 12, 3),
(9, 2, 1),
(9, 6, 2),
(9, 11, 3);
