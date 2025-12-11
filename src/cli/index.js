import { csv } from "../export/csv.js"
import { page } from "../scrapper/page.js"
import fs from "node:fs"
import { makeSearchURL } from "../scrapper/url.js"

const baseUrl = process.env.BASE_URL || "https://magbo.ru"
const maxRetries = parseInt(process.env.MAX_RETRIES) || 0
const args = process.argv.slice(2)
const filepath = args[0]
if (!filepath.endsWith(".csv")) {
  throw new Error(`${filepath} должен быть .csv файлом`)
}
let stream = undefined
try {
  stream = fs.createWriteStream(filepath)
} catch (err) {
  throw err
}

const requests = args.slice(1).map((arg) => {
  return makeSearchURL(arg, baseUrl)
})

let products = []

await Promise.all(
  requests.map((req) => {
    return page(req, { baseUrl: baseUrl, maxRetries: maxRetries })
      .then((prods) => {
        products.push(...prods)
      })
      .catch((err) => {
        console.error(err)
      })
  }),
)
csv(products, stream, {
  sep: ";",
})
