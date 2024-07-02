const express = require('express')
const app = express()

const bodyParser = require("body-parser");

require("dotenv").config()


const port = process.env.PORT

require("./Database");

const userRoute = require("./routes/users")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/api", userRoute)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})