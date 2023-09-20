import {
  pipe,
  last,
  prop,
} from "ramda";

import {
  getSessionToken,
  getCollections,
  getCollectionItems
} from "./modules/metabase-api";

const getLastItemId = pipe(
  last,
  prop('id')
)

// const token = await getSessionToken()
const collections = await getCollections()
const cid = getLastItemId(collections)
const items = await getCollectionItems(2)

// console.log('token:', token)
console.log('collections:', collections)
console.log('items:', items)


