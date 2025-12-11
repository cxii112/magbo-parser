// Утилита для разворачивания типов
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
