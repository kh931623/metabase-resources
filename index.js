import {
  pipe,
  last,
  prop,
} from "ramda";

import {
  getSessionToken,
  getCollections,
  getCollectionItems,
  getCard,
} from "./modules/metabase-api";

import {
  getAutomatedCollectionId,
  initilizeMetabase,
} from "./modules/metabase-operations";
import queries from "@resources/queries";

const main = async () => {
  // check if collection `automated` exists
  // if not then run initialization (create collection `automated` and other resources under it)
  // else run sync up resources between repo and metabase
  const automatedCollectionId = await getAutomatedCollectionId()

  if (!automatedCollectionId) await initilizeMetabase()
  else console.log('sync up!')
}

const test = async () => {
  const items = await getCollectionItems(2)
  const card = await getCard(1)
  const c2 = await getCard(3)

  // console.log(items)
  console.log('card:', card)
  // console.log('card:', c2)
  // console.log('q: ', queries)
}

main()
// test()
