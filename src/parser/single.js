import { load } from "cheerio"

/**
 * Парист информацию о товаре
 * @typedef {import('./product.d.ts').Product} Product
 * @param {string} html Страница товара
 * @returns {Product} Объект с информацией о товаре
 */
export const single = (html) => {
  if (typeof html !== "string")
    throw new TypeError(`html должен быть типа string, передан ${typeof html}`)

  let $ = load(html)

  const title = $("h1#pagetitle").html()
  const { price, discountPrice } = parsePrices($(".prices-wrapper"))
  const inStock = $(".item-stock > span.icon.stock").length > 0

  const { art, id, producer } = parseProps(
    $(".wrapper_inner #props table.props_list > tbody > tr.js-prop-replace"),
  )

  return {
    title: title,
    price: price,
    discountPrice: discountPrice,
    inStock: inStock,
    art: art,
    producer,
    producer,
    id: id,
  }
}

/**
 * Парист информацию о ценах
 * @typedef {import('./product.d.ts').Prices} Prices
 * @param {string | Cheerio<Element>} html Верстка обертки цен
 * @returns {Prices} Информация о ценах
 */
const parsePrices = (html) => {
  let $prices = undefined

  switch (typeof html) {
    case "string":
      $prices = load(html)
      break
    case "Cheerio<Element>":
      $prices = html
      break
    default:
      return { price: undefined, discountPrice: undefined }
  }

  let discountPrice = undefined
  try {
    discountPrice = parseInt(
      ($(".price.font-bold > .price_value_block > .price_value").html() || undefined).replaceAll(
        " ",
        "",
      ),
    )
  } catch {
    discountPrice = undefined
  }

  let price = undefined
  try {
    price = parseInt(
      (
        $(".price.discount > .discount.values_wrapper > .price_value").html() || undefined
      ).replaceAll(" ", ""),
    )
  } catch {
    price = discountPrice
  }

  return { price: price, discountPrice: discountPrice }
}

/**
 * Парист информацию о товаре
 * @typedef {import('./product.d.ts').Properties} Properties
 * @param {string | Cheerio<Element>} html Верстка обертки характеристик
 * @returns {Properties} Доп. информация о товаре
 */
const parseProps = (html) => {
  let $table = undefined

  switch (typeof html) {
    case "string":
      $table = load(html)
      break
    case "Cheerio<Element>":
      $table = html
      break
    default:
      return {
        art: undefined,
        id: undefined,
        producer: undefined,
      }
  }

  let id = undefined
  let art = undefined
  let producer = undefined

  for (let tr of $table) {
    const $row = load(tr, null, false)
    const head = $row('td.char_name span.js-prop-title[itemprop="name"]')
    const value = $row('td.char_value span.js-prop-value[itemprop="value"]')

    switch (head.html()) {
      case "ID":
        id = value.html().replaceAll("\n", "").replaceAll("\t", "")
        break
      case "Артикул":
        art = value.html().replaceAll("\n", "").replaceAll("\t", "")
        break
      case "Производитель":
        const $aWrap = load(value.html())
        producer = $aWrap("a").html().replaceAll("\n", "").replaceAll("\t", "")
        break
    }
  }

  return {
    art: art,
    id: id,
    producer: producer,
  }
}
