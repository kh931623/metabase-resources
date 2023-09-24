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
  createDashboard,
  linkCardsToDashboard,
} from "./metabase-api";
import queries from "@resources/queries";
import dashboards from '@resources/dashboards'
import {
  listToMap,
} from "@utils";
import {
  formatCard,
  formatDashboard,
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

const insertDashboards = async (collection, dashboards) => {
  const formattedDashboards = map(formatDashboard(collection), dashboards)

  await Promise.all(map(createDashboard, formattedDashboards))
}

const insertDashboardAndRelatedCards = async (formattedDashboard) => {
  console.log('formatted dashboard: ', formattedDashboard)
  const {
    name,
    collection_id,
    cards
  } = formattedDashboard

  const createdDashboard = await createDashboard({ name, collection_id })

  await linkCardsToDashboard(createdDashboard.id, cards)
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

  // create cards
  const createdCards = await Promise.all(map(createCard, formattedCards))

  // create dashboard and associate cards with them
  const cardMap = listToMap('name', 'id', createdCards)
  const formattedDashboards = map(formatDashboard(collection, cardMap), dashboards)
  await Promise.all(map(insertDashboardAndRelatedCards, formattedDashboards))
}

