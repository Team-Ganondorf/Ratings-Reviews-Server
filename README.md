# Ratings-Reviews-Server
Our team was tasked with reimplementing the Atelier API, a retail API, to scale for higher web traffic. We split the API into four services, and I worked on the Ratings & Reviews service. Ratings & Reviews allows users to get and post reviews on a certain product. It handles multiple inputs such as the different characteristics of each product, review photos, review summary & body, ratings, and whether or not a review is helpfull.

## Tech Stack
![Postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/-Express-DCDCDC?logo=express&logoColor=black&style=for-the-badge)
![Node](https://img.shields.io/badge/-Node-9ACD32?logo=node.js&logoColor=white&style=for-the-badge)
![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white)

## Database Schema
<img width="700" alt="SDC Reviews & Ratings DB Model" src="https://user-images.githubusercontent.com/102435134/217055392-5f2a75e8-e7c7-4b28-bf8b-941785c28f51.png">

## Technical Challenges
  - Assembling complex queries using JSON Aggregate fuctions slowed down my response times intially but was able to incorporate indexing to speed up times by 100x.
  - Importing legacy data from old csv files was a challenge because I had to make sure the data was correctly seeded into new tables.
  - Caching results from queries allowed me to get my response times under 10ms.
