import { Expand } from "../types"
import { Product } from "../parser/product"

export type ProductWithURL = Expand<
  {
    url: string
  } & Product
>
