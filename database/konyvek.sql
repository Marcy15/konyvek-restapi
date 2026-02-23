CREATE TABLE IF NOT EXISTS authors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS publishers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  isbn VARCHAR(32) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cover_url VARCHAR(1024) NOT NULL,
  summary TEXT NOT NULL,
  author_id INT UNSIGNED NOT NULL,
  publisher_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_books_isbn (isbn),
  KEY ix_books_author (author_id),
  KEY ix_books_publisher (publisher_id),
  KEY ix_books_category (category_id),
  CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_books_publisher FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ratings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id INT UNSIGNED NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_ratings_book (book_id),
  CONSTRAINT fk_ratings_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ck_ratings_score CHECK (score BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO authors (name, bio) VALUES
('George Orwell', 'English novelist and essayist.'),
('Agatha Christie', 'British writer known for detective novels.'),
('Frank Herbert', 'American science-fiction author.');

INSERT INTO publishers (name) VALUES
('Penguin Books'),
('HarperCollins'),
('Gollancz');

INSERT INTO categories (name) VALUES
('Dystopia'),
('Crime'),
('Science Fiction');

INSERT INTO books (title, isbn, price, cover_url, summary, author_id, publisher_id, category_id) VALUES
('1984', '9780451524935', 3990.00, 'https://example.com/1984.jpg', 'A dystopian novel about surveillance and control.', 1, 1, 1),
('Murder on the Orient Express', '9780062693662', 4590.00, 'https://example.com/orient.jpg', 'Detective Hercule Poirot investigates a murder on a train.', 2, 2, 2),
('Dune', '9780441172719', 4990.00, 'https://example.com/dune.jpg', 'Epic science fiction on the desert planet Arrakis.', 3, 3, 3);

INSERT INTO ratings (book_id, score) VALUES
(1, 5),
(1, 4),
(2, 5),
(3, 5),
(3, 4);
