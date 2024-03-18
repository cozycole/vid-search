import express from 'express'
import path from 'path'
import { SendFileOptions } from 'express-serve-static-core'
import 'dotenv/config'
import { router } from './routes'

const app = express()
const port = 3000
const filePath = '/home/colet/programming/learning/img-search/public'

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(filePath))
app.use(router)

app.get('/', function (req, res, next) {
  const options: SendFileOptions = {
    root: path.join(filePath, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  const fileName = "index.html"
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})

app.post('/search', function (req, res) {
  res.send(req.body.search)
  console.log(req.body)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})