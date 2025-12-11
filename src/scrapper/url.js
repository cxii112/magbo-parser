/**
 *
 * @param {string} request Запрос
 * @param {string} baseUrl Основной URL сайта
 * @returns
 */
export const makeSearchURL = (request, baseUrl = "https://magbo.ru") => {
  baseUrl = baseUrl.replace(/\/$/, "")
  return `${baseUrl}/catalog/?q=${request}&s=Найти`
}
