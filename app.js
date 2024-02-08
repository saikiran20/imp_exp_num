const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjecttoResObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//API 1 GET

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = 'SELECT movie_name FROM movie;'
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjecttoResObject(eachMovie)),
  )
})

//API 2 POST

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `INSERT INTO 
  movie 
  (director_id,movie_name,lead_actor) 
  VALUES
   (${directorId},'${movieName}','${leadActor}');`
  const oneMovie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//API 3 GET
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`
  const getMovie = await db.get(getMovieQuery)
  response.send(convertDbObjecttoResObject(getMovie))
})

//API 4 PUT

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `UPDATE movie SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}';`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API 5 DELETE
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 6 GET directors

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = 'SELECT * FROM director;'
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDbObjecttoResObject(eachDirector),
    ),
  )
})
//API 7 GET

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id=${directorId};`
  const moviesArray = await db.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
