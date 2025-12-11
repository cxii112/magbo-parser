import { load } from "../loader/load.js"
import { single as parseProductPage } from "../parser/single.js"

/**
 * @typedef {import('./product.d.ts').ProductWithURL} ProductWithURL
 * @param {string} url Ссылка на страницу товара
 * @param {Object} [options] Опции сбора
 * @param {RegExp} [options.pattern=/(((https?:\/\/)?magbo.ru\/catalog\/)([a-z\d\/-]+)?)(\?(((q=[A-Za-z\dА-Яа-я%_-]+)|(s=((Найти)|(%D0%9D%D0%B0%D0%B9%D1%82%D0%B8))+)|(PAGEN_\d=[\d]+))&?)+)/]
 * Регулярное выражение для проверки URL
 * @returns {ProductWithURL} Данные о продукте со ссылкой
 */
export const single = async (
  url,
  {
    pattern = /(((https?:\/\/)?magbo.ru\/catalog\/)([a-z\d\/-]+)?)(\?(((q=[A-Za-z\dА-Яа-я%_-]+)|(s=((Найти)|(%D0%9D%D0%B0%D0%B9%D1%82%D0%B8))+)|(PAGEN_\d=[\d]+))&?)+)/,
  } = {},
) => {
  const page = await load(url, { pattern: pattern })
  const product = parseProductPage(page)
  return {
    url: url,
    ...product,
  }
}
