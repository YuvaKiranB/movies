const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const startDB = async () => {
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

startDB()

function getCamelCase(movie) {
  return {
    movieName: movie.movie_name,
  }
}

function getCamelCase1(movie) {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  }
}

function getCamelCase2(director) {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getMovies = `
  SELECT movie_name
  FROM movie
  ORDER BY movie_id`
  const movies = await db.all(getMovies)
  response.send(
    movies.map(movie => {
      return getCamelCase(movie)
    }),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const writeMovie = `
  INSERT INTO
  movie(director_id, movie_name, lead_actor)
  VALUES(
    ${directorId},
    "${movieName}",
    "${leadActor}"
  )`
  await db.run(writeMovie)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId}`
  const movie = await db.get(getMovie)
  response.send(getCamelCase1(movie))
})

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putMovie = `
  UPDATE movie
  SET
  director_id = "${directorId}",
  movie_name = "${movieName}",
  lead_actor = "${leadActor}";
  WHERE movie_id = ${movieId}`
  await db.run(putMovie)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
  DELETE FROM movie
  WHERE movie_id = ${movieId}`
  await db.run(deleteMovie)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectors = `
  SELECT *
  FROM director
  ORDER BY director_id`
  const directors = await db.all(getDirectors)
  response.send(
    directors.map(director => {
      return getCamelCase2(director)
    }),
  )
})

app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getMovies = `
  SELECT movie_name
  FROM movie
  WHERE director_id = ${directorId}
  ORDER BY movie_id`
  const movies = await db.all(getMovies)
  response.send(
    movies.map(movie => {
      return getCamelCase(movie)
    }),
  )
})

module.exports = app
