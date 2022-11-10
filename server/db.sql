DROP TABLE IF EXISTS reviews_meta;
DROP TABLE IF EXISTS characteristics;
DROP TABLE IF EXISTS review_details;
DROP TABLE IF EXISTS review_photos;

CREATE TABLE reviews_meta(
  id SERIAL UNIQUE,
  product_id INT UNIQUE,
  ratings json,
  recommended json,
  PRIMARY KEY(id)
);

CREATE TABLE characteristics(
  id SERIAL UNIQUE,
  name TEXT,
  avg_rating INT,
  product_id INT UNIQUE,
  total_ratings INT,
  PRIMARY KEY(id)
);

CREATE TABLE review_details(
  id INT UNIQUE,
  product_id INT UNIQUE,
  rating INT,
  date DATE,
  summary TEXT,
  body TEXT,
  recommended BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  helpfullness INT,
  PRIMARY KEY(id)
);

CREATE TABLE review_photos (
  id SERIAL UNIQUE,
  review_id INT,
  url TEXT,
  PRIMARY KEY(id),
  CONSTRAINT fk_review
    FOREIGN KEY(review_id)
      REFERENCES review_details(id)
      ON DELETE SET NULL
);