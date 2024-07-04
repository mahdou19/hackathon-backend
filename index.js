const express = require('express')
const app = express()
const cors = require('cors')

const bodyParser = require("body-parser");

require("dotenv").config()


const port = process.env.PORT || 80;

require("./Database");

const userRoute = require("./routes/users")

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


app.use("/api", userRoute)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`)
})