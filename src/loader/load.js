/**
 *
 * @param {string} url Ссылка на HTML страницу
 * @param {Object} [options] Опции загрузки
 * @param {RegExp} [options.pattern=/(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/]
 * Регулярное выражение для проверки URL
 * @param {number} [options.timeout=10_000] Таймаут запроса
 * @returns {Promise<string>} HTML ответа на запрос
 */
export const load = async (
  url,
  { pattern = /(https?:\/\/)?magbo.ru\/catalog\/[a-z\d\/-]+/, timeout = 10_000 } = {},
) => {
  if (!pattern.test(url)) {
    throw new URIError(`${url} не подходит под ${pattern.source}`)
  }

  console.log(`Загружаем ${url}`)
  const controller = new AbortController()
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort()
      reject(new Error(`Таймаут загрузки ${url}`))
    }, timeout)
  })
  const fetchPromise = fetch(url, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) {
        throw new AggregateError(`Не удалось получить ответ (${res.status})`)
      }
      return res.text()
    })
    .catch((err) => {
      throw err
    })
  const res = await Promise.race([timeoutPromise, fetchPromise])
  if (res === undefined) throw new Error("Не удалось загрузить страницу")
  return res
}
