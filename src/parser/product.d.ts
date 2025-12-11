import { Expand } from "../types"

export type Product = Expand<
  {
    title: string
    inStock: boolean
  } & Prices &
    Properties
>

export type Prices = {
  price: number | undefined
  discountPrice: number | undefined
}

export type Properties = {
  art: string | undefined
  producer: string | undefined
  id: string | undefined
}
