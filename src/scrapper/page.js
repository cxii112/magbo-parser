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
 * @param {number} [options.maxRetries=0] Количество повторов запросов
 * @returns {ProductWithURL[]} Данные продуктов по запросу
 */
export const page = async (
  url,
  {
    baseUrl = "https://magbo.ru",
    searchPattern = /(((https?:\/\/)?magbo.ru\/catalog\/)([a-z\d\/-]+)?)(\?(((q=[A-Za-z\dА-Яа-я%_-]+)|(s=((Найти)|(%D0%9D%D0%B0%D0%B9%D1%82%D0%B8))+)|(PAGEN_\d=[\d]+))&?)+)?/,
    productPattern = /(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/,
    maxRetries = 0,
  } = {},
) => {
  /**@type {string | undefined} */
  let nextUrl = url
  let pageNumber = 1

  /**@type{string[]} */
  let totalRefs = []
  let lostRefs = 0
  while (nextUrl !== undefined) {
    const page = await load(nextUrl, { pattern: searchPattern })
    const { refs, nextPage: next } = parseSearchPage(page, {
      baseUrl: baseUrl,
      currentPage: pageNumber,
    })
    nextUrl = next

    const defined = refs.filter((ref) => ref !== undefined)
    if (defined.length < refs.length) {
      lostRefs += defined.length
      console.warn(`Потеряно ссылок ${defined.length}, всего ${lostRefs}`)
    }
    totalRefs.push(...defined)

    pageNumber += 1
    if (nextUrl === undefined) {
      console.log("Достигнута последняя страница")
      break
    }
  }
  if (totalRefs.length > 0) {
    console.warn(`Потеряно ссылок ${lostRefs}`)
  }
  if (totalRefs.length === 0) {
    console.warn(`Не удалось собрать ссылки`)
    return []
  }
  console.log(`Найдено ссылок ${totalRefs.length}`)

  /**
   * @typedef {import('./productWithUrl').ProductWithURL} ProductWithURL
   * @type {ProductWithURL[]}
   */
  let products = []

  let rest = [...totalRefs]
  let waitTime = 0

  while (maxRetries > 0 || rest.length > 0) {
    let failed = []

    await Promise.all(
      rest.map((ref) => {
        return scrapeProductPage(ref, { pattern: productPattern })
          .then((product) => {
            products.push(product)
          })
          .catch((err) => {
            errors.push(err)
            failed.push(ref)
          })
      }),
    )
    rest = failed

    if (rest.length > 0) {
      maxRetries -= 1
      console.warn(
        `Не удалось загрузить ${rest.length}, повтор через ${waitTime}мс, осталось ${maxRetries} попыток`,
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      waitTime += 1000
    }
  }

  if (rest.length > 0) {
    console.warn(`Не удалось загрузить ${rest.length}`)
    console.warn(rest)
    console.error(errors)
  }

  return products
}
