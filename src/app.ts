import express from 'express'
import 'dotenv/config'
import { router } from './routes'

const app = express()
const port = 3000
const filePath = process.env.FILE_SERVER_PATH

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(filePath))
app.use(router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})