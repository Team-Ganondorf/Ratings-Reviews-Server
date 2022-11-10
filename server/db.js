const { Pool } = require("pg");

const pool = new Pool({
  user: "ubuntu",
  host: "localhost",
  database: "review_database",
  password: "",
  port: 5432,
});

module.exports = { pool };

module.exports = {
  getReviews: (productId, page, count, sort) => {
    return pool.connect()
      .then((client) => {
        return client.query(
          `SELECT *,
              (SELECT JSON_AGG(REVIEWS_PHOTOS)
                FROM
                  (SELECT REVIEWS_PHOTOS.ID,
                      URL
                    FROM REVIEWS_PHOTOS
                    WHERE REVIEW_ID = REVIEW_DETAILS.ID ) REVIEWS_PHOTOS) AS PHOTOS
            FROM REVIEW_DETAILS
            WHERE PRODUCT_ID = $1
            LIMIT $2;`
          , [productId, count])
        // return client.query('SELECT * FROM review_details WHERE product_id = $1', [productId])
          .then((res) => {
            // console.log(res.rows);
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err);
          });
      });
  },

  getReviewsMeta: (productId) => {
    console.log('getting meta')
    return pool.connect()
      .then((client) => {
        return client.query(
          `SELECT *,

            (SELECT JSON_AGG(REVIEW_CHARACTERISTICS)
              FROM
                (SELECT REVIEW_CHARACTERISTICS.ID,
                    REVIEW_CHARACTERISTICS.VALUE
                  FROM REVIEW_CHARACTERISTICS
                  WHERE CHARACTERISTIC_ID = CHARACTERISTICS.ID) REVIEW_CHARACTERISTICS) AS CHARACTERISTIC_DATA,

            (SELECT JSON_AGG(REVIEW_DETAILS)
              FROM
                (SELECT REVIEW_DETAILS.RATING,
                    REVIEW_DETAILS.RECOMMENDED
                  FROM REVIEW_DETAILS
                  WHERE REVIEW_DETAILS.PRODUCT_ID = $1) REVIEW_DETAILS) AS RATINGS

          FROM CHARACTERISTICS
          WHERE PRODUCT_ID = $1`,
          [productId])
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err);
          })
      })
  },

  updateOne: (reviewId) => {
    console.log('updating...');
    return pool.connect()
      .then((client) => {
        return client.query(
          `UPDATE REVIEW_DETAILS
          SET HELPFULNESS = HELPFULNESS + 1
          WHERE REVIEW_DETAILS.ID = $1`,
          [reviewId])
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err);
          })
      })
  },

  create: (body) => {
    console.log('creating...')
    return pool.connect()
      .then((client) => {
        return client.query(
          `SELECT MAX(ID) + 1 FROM REVIEW_DETAILS`
        )
        .then((res) => {
          const id = res.rows[0]['?column?'];
            return client.query(
              `INSERT INTO REVIEW_DETAILS (
                ID,
                PRODUCT_ID,
                RATING,
                DATE,
                SUMMARY,
                BODY,
                RECOMMENDED,
                REPORTED,
                REVIEWER_NAME,
                REVIEWER_EMAIL,
                RESPONSE,
                HELPFULNESS)
              VALUES (${id}, ${Number(body.product_id)}, ${Number(body.rating)}, ${body.date}, ${"'" + body.summary + "'"}, ${"'" + body.body + "'"}, ${body.recommended}, FALSE, ${"'" + body.name + "'"}, ${"'" + body.email + "'"}, NULL, 0)`
            )
            .then(() => {
              for (keys in body.characteristics) {
                client.query(
                  `INSERT INTO REVIEW_CHARACTERISTICS (
                    ID,
                    CHARACTERISTIC_ID,
                    REVIEW_ID,
                    VALUE)
                    VALUES (
                      (SELECT MAX(ID) + 1 FROM REVIEW_CHARACTERISTICS),
                      ${keys},
                      ${id},
                      ${body.characteristics[keys]})`
                )
              }
              if (body.photos.length > 0) {
                body.photos.forEach((photoURL) => {
                  client.query(
                    `INSERT INTO REVIEWS_PHOTOS (
                      ID,
                      REVIEW_ID,
                      URL)
                      VALUES (
                        (SELECT MAX(ID) + 1 FROM REVIEWS_PHOTOS),
                        ${id},
                        ${"'" + photoURL + "'"}
                      )`
                  )
                })
              }
            })
        })
        .then((res) => {
          console.log('created')
          client.release();
        })
        .catch((err) => {
          client.release();
          console.log(err)
        })
      })
  }
};