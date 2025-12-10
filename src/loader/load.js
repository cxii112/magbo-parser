/**
 *
 * @param {string} url Ссылка на HTML страницу
 * @param {Object} [options] Опции загрузки
 * @param {RegExp} [options.pattern=/(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/]
 * Регулярное выражение для проверки URL
 * @returns {Promise<string>} HTML ответа на запрос
 */
export const load = (url, { pattern = /(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/ } = {}) => {
  if (!pattern.test(url)) {
    throw new URIError(`${url} не подходит под ${pattern.source}`)
  }

  const res = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new AggregateError(`Не удалось получить ответ (${res.status})`)
      }
      return res.text()
    })
    .catch((err) => {
      throw err
    })
  return res
}
