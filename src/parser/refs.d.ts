export type Chunk = {
  refs: Refs
  nextPage: string | undefined
}

export type Refs = (string | undefined)[]
