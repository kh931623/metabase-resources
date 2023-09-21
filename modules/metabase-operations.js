import {
  find,
  propEq,
  map,
} from "ramda";

import {
  getCollections,
  createCollection,
  getDatabases,
  createCard,
} from "./metabase-api";
import queries from "@resources/queries";
import {
  listToMap,
} from "@utils";
import {
  formatCard,
} from "@utils/metabase-resources-formatter.js";
import logger from '@logger'

const findAutomatedCollection = find(propEq('automated', 'name'))

const createAutomatedCollection = async () => {
  return createCollection({
    name: 'automated',
    color: '#0388fc'
  })
}

const getDatabaseMap = async () => {
  const databases = await getDatabases()

  logger.debug('database:')
  logger.debug(databases)

  return listToMap('name', 'id', databases.data)
}

export const getAutomatedCollectionId = async () => {
  const collections = await getCollections()
  const automatedCollection = findAutomatedCollection(collections)

  if (automatedCollection) return automatedCollection.id
  return null
}

export const initilizeMetabase = async () => {
  logger.info('Initializing Metabase ...')

  // create colleciton `automated`
  const collection = await createAutomatedCollection()
  logger.info('collection `automated` created!')

  // get all databases in metabase
  const databaseMap = await getDatabaseMap()
  logger.debug('database map: ')
  logger.debug(databaseMap)

  // get resources in this repo
  logger.debug('defined queries:')
  logger.debug(queries)
  const formattedCards = map(formatCard(collection, databaseMap), queries)

  logger.debug(formattedCards)

  // write resources to metabase
  await Promise.all(map(createCard, formattedCards))
}

