import { Product } from "../parser/product.d.ts"

export type ProductWithURL = Expand<
  {
    url: string
  } & Product
>
