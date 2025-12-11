import { load } from "../loader/load.js"
import { page as parseSearchPage } from "../parser/page.js"
import { single as parseProductPage } from "../parser/single.js"
import { single as scrapeProductPage } from "../scrapper/single.js"

/**
 * @typedef {import('./productWithUrl').ProductWithURL} ProductWithURL
 * @param {string} url Ссылка на страницу поиска
 * @param {Object} [options] Опции сбора
 * @param {RegExp} [options.searchPattern=/(((https?:\/\/)?magbo.ru\/catalog\/)([a-z\d\/-]+)?)(\?(((q=[A-Za-z\dА-Яа-я%_-]+)|(s=((Найти)|(%D0%9D%D0%B0%D0%B9%D1%82%D0%B8))+)|(PAGEN_\d=[\d]+))&?)+)?/]
 * Регулярное выражение для проверки URL поиска
 * @param {RegExp} [options.productPattern=/(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/]
 * Регулярное выражение для проверки URL товара
 * @returns {ProductWithURL} Данные продуктов по запросу
 */
export const page = async (
  url,
  {
    baseUrl = "https://magbo.ru",
    searchPattern = /(((https?:\/\/)?magbo.ru\/catalog\/)([a-z\d\/-]+)?)(\?(((q=[A-Za-z\dА-Яа-я%_-]+)|(s=((Найти)|(%D0%9D%D0%B0%D0%B9%D1%82%D0%B8))+)|(PAGEN_\d=[\d]+))&?)+)?/,
    productPattern = /(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/,
  } = {},
) => {
  /**@type {string | undefined} */
  let nextUrl = url

  /**@type{string[]} */
  let totalRefs = []
  let lostRefs = 0
  while (nextUrl !== undefined) {
    const page = await load(nextUrl, { pattern: searchPattern })
    const { refs, nextPage: next } = parseSearchPage(page, { baseUrl: baseUrl })
    nextUrl = next
    console.debug(`DEBUG: ${nextUrl}`)

    const defined = refs.filter((ref) => ref !== undefined)
    if (defined.length < refs.length) {
      lostRefs += defined.length
      console.warn(`Потеряно ссылок ${defined.length}, всего ${lostRefs}`)
    }
    totalRefs.push(...defined)

    if (nextUrl === undefined) {
      console.log("Достигнута последняя страница")
      break
    }
  }
  if (totalRefs > 0) {
    console.warn(`Потеряно ссылок ${lostRefs}`)
  }

  /**
   * @typedef {import('./productWithUrl').ProductWithURL} ProductWithURL
   * @type {ProductWithURL[]}
   */
  let products = []
  await Promise.all(
    totalRefs.map((ref) => {
      return scrapeProductPage(ref, { pattern: productPattern })
        .then((product) => {
          products.push(product)
        })
        .catch((err) => console.error(err))
    }),
  )

  return products
}
