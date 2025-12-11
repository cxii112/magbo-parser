import { stringify } from "csv-stringify"
import { finished } from "node:stream/promises"

/**
 * @typedef {import('../scrapper/productWithUrl.d.ts').ProductWithURL} ProductWithURL
 * @typedef {import('node:fs').WriteStream} WriteStream
 * @param {ProductWithURL[]} data Продукты
 * @param {WriteStream} outStream Поток для записи
 * @param {object} [options] Опции записи
 * @param {string} [options.sep=","] Разделитель колонок
 * @param {object} [options.keysToHeaders={title: "name",discountPrice: "discountPrice",price: "price",art: "art",producer: "producer",inStock: "inStock",url: "url"}]
 * Мапинг ключей к заголовкам
 */
export const csv = (
  data,
  outStream,
  {
    sep = ",",
    keysToHeaders = {
      title: "name",
      discountPrice: "discountPrice",
      price: "price",
      art: "art",
      producer: "producer",
      inStock: "inStock",
      url: "url",
    },
  },
) => {
  if (data.length === 0) return

  const keys = Object.keys(data[0])
  const columns = keys.map((k) => {
    return {
      key: k,
      header: keysToHeaders[k],
    }
  })
  const out = stringify(data, {
    delimiter: sep,
    header: true,
    columns: columns,
  })
  out.on("error", (err) => {
    console.error(err.message)
  })
  out.pipe(outStream)
  data.forEach((rec) => {
    out.write(
      keys.map((k) => {
        return rec[k]
      }),
    )
  })
  out.end()
}
