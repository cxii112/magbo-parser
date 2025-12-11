import { load } from "cheerio"

/**
 * Парcит список товаров из каталога
 * @typedef {import('./refs.d.ts').Chunk} Chunk
 * @param {string} html Страница товара
 * @param {Object} [options] Опции парсинга
 * @param {RegExp} [options.currentPage=1] Начальная страница
 * @param {RegExp} [options.baseUrl="https://magbo.ru"] Основной адрес
 * @returns {Chunk} Список ссылок
 */
export const page = (html, { currentPage = 1, baseUrl = "https://magbo.ru" } = {}) => {
  if (typeof html !== "string")
    throw new TypeError(`html должен быть типа string, передан ${typeof html}`)

  let $ = load(html)

  const wraps = $(".catalog_item.item_wrap")

  /**
   * @typedef {import('./page.d.ts').Refs} Refs
   * @type {Refs}
   */
  const refs = []

  wraps.each((_, wrap) => {
    const $wrap = load(wrap, null, false)
    const ref =
      $wrap(".image_wrapper_block a.thumb").attr("href") ||
      $wrap(".item_info .item-title a").attr("href")
    refs.push(`${baseUrl}${ref}`)
  })

  let nextPage = currentPage
  const $a = $(".nums > a").last()
  try {
    nextPage = parseInt($a.text())
  } catch {
    nextPage = currentPage
  }

  if (nextPage <= currentPage) {
    return { refs: refs, nextPage: undefined }
  }

  const lastRef = $a.attr("href")
  if (lastRef === undefined) {
    return { refs: refs, nextPage: undefined }
  }

  const idx = lastRef.lastIndexOf("=")

  const nextRef = `${baseUrl}${lastRef.slice(0, idx + 1)}${currentPage + 1}`

  return { refs: refs, nextPage: nextRef }
}
