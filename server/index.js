const express = require("express");
const fs = require('fs');
const db = require("./db.js")
const cacheService = require("express-api-cache");
const metadata = require("./data/reviewsMetaData.js");
var multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

const app = express();
const cache = cacheService.cache;

app.use(upload.array());
app.use(express.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/reviews:page?:count?:sort?:product_id?', (req, res) => {
  // Can't do anything without a product_id
  if (!req.query.product_id) {
    res.status(422).send('Must pass a product_id into params');
  } else {
    // Set parameters to passed or default values
    const product_id = req.query.product_id;
    const page = req.query.page || 1;
    const count = req.query.count || null;
    const sort = req.query.sort || 'relevant';

    db.getReviews(product_id, page, count, sort)
      .then((result) => {
        var reviews = result.rows;
        if (sort === 'helpfulness') {reviews.sort((a, b) => b.helpfulness - a.helpfulness)}
        if (sort === 'newest') {reviews.sort((a, b) => Number(b.date) - Number(a.date))}
        res.status(200).send({
          product: product_id,
          count: reviews.length,
          results: reviews
        });
      });
  }
});

app.get('/reviews/meta:product_id?', cache('10 minutes'), (req, res) => {
  if (!req.query.product_id) {
    res.status(422).send('Must pass a product_id into params');
  } else {
    const product_id = req.query.product_id;
    db.getReviewsMeta(product_id)
      .then((result) => {
        var data = result.rows;
        var metadata = {
          product_id: data[0].product_id,
          ratings: {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
          },
          recommended: {
            'true': 0,
            'false': 0
          },
          characteristics: {}
        }
        //get data from each characteristic
        data.forEach((characteristic) => {
          //calculate the average rating
          var avgCharacteristicRating = (characteristic['characteristic_data'].reduce((a, b) => {return a + b.value}, 0)) / characteristic['characteristic_data'].length;
          //get total number of recommended and ratings
          characteristic.ratings.forEach((rating) => {
            metadata.recommended[rating.recommended] += 1;
            metadata.ratings[rating['rating']] += 1;
          })
          //set metadata from characteristic
          metadata.characteristics[characteristic.name] = {
            'id': characteristic.id,
            'value': avgCharacteristicRating,
          }
        })
        // console.log(metadata)
        res.status(200).send(metadata)
      })
  }

});

app.put('/reviews/:review_id/helpful', (req, res) => {
  db.updateOne(req.params.review_id)
  .then((result) => {
    res.status(200).send()
  })
});

app.post('/reviews', (req, res) => {
  console.log('===============')
  let data = {};

  Object.keys(req.body).map(key => {
    let val = req.body[key];
    data[key] = val;
  });
  var date = Date.now();
  var characteristics = JSON.parse(data.characteristics);
  var photos = JSON.parse(data.photos);
  data.date = date;
  data.characteristics = characteristics;
  data.photos = photos;

  db.create(data)
    .then((result) => {
      console.log(result)
      res.send(data);
    })

})

// {
//   product_id: 66646,
//   rating: 5,
//   summary: 'test',
//   body: 'test',
//   recommend: true,
//   name: 'mike',
//   email: 'mike@email.com',
//   characteristics: { '223585': 3, '223586': 3, '223587': 3, '223588': 3 },
//   photos: [
//     'http://localhost:3001/uploads/8901ca5c-f6c5-4241-8a69-26a5efddf8f4.png'
//   ]
// }

app.listen(3000);
console.log(`Listening at Port: 3000`);