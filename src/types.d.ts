// Утилита для разворачивания типов
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
