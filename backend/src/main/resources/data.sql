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
