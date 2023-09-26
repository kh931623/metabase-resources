import {
  pipe,
  last,
  prop,
} from "ramda";
import {
  detailedDiff,
} from 'deep-object-diff'

import {
  getSessionToken,
  getCollections,
  getCollectionItems,
  getCard,
  getDashboard,
} from "./modules/metabase-api";

import {
  getAutomatedCollectionId,
  initilizeMetabase,
  syncUpMetabase,
} from "./modules/metabase-operations";
import queries from "@resources/queries";

const main = async () => {
  // check if collection `automated` exists
  // if not then run initialization (create collection `automated` and other resources under it)
  // else run sync up resources between repo and metabase
  const automatedCollectionId = await getAutomatedCollectionId()

  if (!automatedCollectionId) await initilizeMetabase()
  else await syncUpMetabase(automatedCollectionId)
}

const test = async () => {
  const items = await getCollectionItems(2)
  // const card = await getCard(1)
  // const c2 = await getCard(3)
  // const d1 = await getDashboard(1)

  // const a1 = [1, 2, 3]
  // const a2 = [2, 3, 4]

  console.log(items)
  // console.log('card:', card)
  // console.log('card:', c2)
  // console.log('q: ', queries)
  // console.log(d1)
  // console.log(detailedDiff(a1, a2))
}

main()
// test()
