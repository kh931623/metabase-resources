import {
  find,
  propEq,
  map,
  partition,
  pipe,
  prop,
  identity,
  curry,
  pick,
  toPairs,
  filter,
  path,
  mergeDeepRight,
  has,
  keys,
} from "ramda";
import {
  updatedDiff,
  detailedDiff,
  diff,
} from "deep-object-diff";

import {
  getCollections,
  createCollection,
  getDatabases,
  createCard,
  createDashboard,
  linkCardsToDashboard,
  getCollectionItems,
  getCard,
  getDashboard,
  deleteCard,
  updateCard,
  deleteDashboard,
} from "./metabase-api";
import queries from "@resources/queries";
import dashboards from '@resources/dashboards'
import {
  listToMap,
  notIn,
} from "@utils";
import {
  formatCard,
  formatDashboard,
} from "@utils/metabase-resources-formatter.js";
import logger from '@logger'

const findAutomatedCollection = find(propEq('automated', 'name'))
const toNameAndIdMap = listToMap(prop('name'), prop('id'))
const toNameAndIdentityMap = listToMap(prop('name'), identity)

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

  return toNameAndIdMap(databases.data)
}

export const getAutomatedCollectionId = async () => {
  const collections = await getCollections()
  const automatedCollection = findAutomatedCollection(collections)

  if (automatedCollection) return automatedCollection.id
  return null
}

const insertDashboardAndRelatedCards = async (formattedDashboard) => {
  const {
    name,
    collection_id,
    ordered_cards,
  } = formattedDashboard

  const createdDashboard = await createDashboard({ name, collection_id })

  await linkCardsToDashboard(createdDashboard.id, ordered_cards)
}

const isCard = propEq('card', 'model')

const fetchCard = pipe(
  prop('id'),
  getCard,
)

const fetchDashboard = pipe(
  prop('id'),
  getDashboard,
)

const getCardsAndDashboardsByCollection = async (collection_id) => {
  const items = await getCollectionItems(collection_id)

  // find card items and dashboard items
  const [
    cardItems,
    dashboardItems,
  ] = partition(isCard, items.data)

  // get cards (by using get single card api)
  const metabaseCards = await Promise.all(map(fetchCard, cardItems))

  // get dashboards (by using get single dashboard api)
  const metabaseDashboards = await Promise.all(map(fetchDashboard, dashboardItems))

  console.log('cards: ', metabaseCards)
  console.log('dashboards: ', metabaseDashboards)

  return {
    metabaseCards,
    metabaseDashboards,
  }
}

const computeRepoCardMap = curry((collection_id, databaseMap, cardsInRepo) => {
  return pipe(
    map(formatCard(collection_id, databaseMap)),
    toNameAndIdentityMap
  )(cardsInRepo)
})

const computeRepoDashboardMap = curry((collection_id, cardMap, repoDashboards) => {
  return pipe(
    map(formatDashboard(collection_id, cardMap)),
    toNameAndIdentityMap,
  )(repoDashboards)
})

const pickMetabaseCardAttrs = pick([
  'name',
  'display',
  'collection_id',
  'dataset_query',
  'visualization_settings',
  'id',
])

const pickOrderedCardsAttrs = pick([
  'card_id',
  'size_x',
  'size_y',
  'row',
  'col',
])

const pickMetabaseDashboardAttrs = (metabaseDashboard) => {
  const {
    id,
    name,
    collection_id,
    ordered_cards = [],
  } = metabaseDashboard

  return {
    id,
    name,
    collection_id,
    ordered_cards: map(pickOrderedCardsAttrs, ordered_cards)
  }
}

const computeMetabaseDashboardMap = pipe(
  map(pickMetabaseDashboardAttrs),
  toNameAndIdentityMap,
)


const computeMetabaseCardMap = pipe(
  map(pickMetabaseCardAttrs),
  toNameAndIdentityMap,
)

const isKeyNotInMap = curry((obj, pair) => {
  return pipe(
    prop(0),
    notIn(obj)
  )(pair)
})

const getIdFromPair = path([
  1,
  'id'
])

const deleteUnusedCard = async (repoCardMap, metabaseCardMap) => {
  const idsToDelete = pipe(
    toPairs,
    filter(isKeyNotInMap(repoCardMap)),
    map(getIdFromPair),
  )(metabaseCardMap)

  console.log('d id: ', idsToDelete)
  await Promise.all(map(deleteCard, idsToDelete))
}

const createMissingCard = async (repoCardMap, metabaseCardMap) => {
  const cardsToCreate = pipe(
    toPairs,
    filter(isKeyNotInMap(metabaseCardMap)),
    map(prop(1)),
  )(repoCardMap)

  console.log('cards to create: ', cardsToCreate)
  await Promise.all(map(createCard, cardsToCreate))
}

const createMissingResources = async (createResourceFunc, repoResourceMap, metabaseResourceMap) => {
  const resourcesToCreate = pipe(
    toPairs,
    filter(isKeyNotInMap(metabaseResourceMap)),
    map(prop(1)),
  )(repoResourceMap)

  console.log('to create: ', resourcesToCreate)
  await Promise.all(map(createResourceFunc, resourcesToCreate))
}

const deleteUnusedResources = async (deleteResourceFunc, repoResourceMap, metabaseResourceMap) => {
  const idsToDelete = pipe(
    toPairs,
    filter(isKeyNotInMap(repoResourceMap)),
    map(getIdFromPair),
  )(metabaseResourceMap)

  console.log('id to delete: ', idsToDelete)
  await Promise.all(map(deleteResourceFunc, idsToDelete))
}

const updateSingleCard = ({ id, payload }) => updateCard(id, payload)
const updateLinkedCards = ({ id, ordered_cards }) => linkCardsToDashboard(id, ordered_cards)

const updateChangedCards = async (repoCardMap, metabaseCardMap) => {
  const updated = updatedDiff(metabaseCardMap, repoCardMap)

  console.log('updated: ', updated)

  const updatePayloads = pipe(
    toPairs,
    map(([key, newValues]) => {
      const original = metabaseCardMap[key]

      return {
        id: original.id,
        payload: mergeDeepRight(original, newValues)
      }
    })
  )(updated)

  await Promise.all(map(updateSingleCard, updatePayloads))
}

const updateChangedDashboards = async (repoDashboardMap, metabaseDashboardMap) => {
  const updated = diff(metabaseDashboardMap, repoDashboardMap)
  console.log('diff: ', updated)

  const updatePayloads = pipe(
    filter(has('ordered_cards')),
    keys,
    map((key) => {
      const original = metabaseDashboardMap[key]
      const newOne = repoDashboardMap[key]

      return {
        id: original.id,
        ordered_cards: newOne.ordered_cards
      }
    })
  )(updated)

  await Promise.all(map(updateLinkedCards, updatePayloads))
}

const syncUpCards = async (collection_id, cardsInRepo, metabaseCards) => {
  const databaseMap = await getDatabaseMap()
  const repoCardMap = computeRepoCardMap(collection_id, databaseMap, cardsInRepo)
  const metabaseCardMap = computeMetabaseCardMap(metabaseCards)

  console.log('repo card map: ', repoCardMap)
  console.log('metabase card map: ', metabaseCardMap)

  // find diff between cards in repo and metabase cards
  const diff = detailedDiff(metabaseCardMap, repoCardMap)

  console.log('diff: ', diff)

  await deleteUnusedCard(repoCardMap, metabaseCardMap)
  await createMissingCard(repoCardMap, metabaseCardMap)
  await updateChangedCards(repoCardMap, metabaseCardMap)
}

const syncUpDashboards = async (collection_id, cardMap, dashboardsInRepo, metabaseDashboards) => {
  const repoDashboardMap = computeRepoDashboardMap(collection_id, cardMap, dashboardsInRepo)
  const metabaseDashboardMap = computeMetabaseDashboardMap(metabaseDashboards)

  console.log('r d m: ', repoDashboardMap)
  console.log('m d m: ', metabaseDashboardMap)

  await createMissingResources(insertDashboardAndRelatedCards, repoDashboardMap, metabaseDashboardMap)
  await deleteUnusedResources(deleteDashboard, repoDashboardMap, metabaseDashboardMap)
  await updateChangedDashboards(repoDashboardMap, metabaseDashboardMap)
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
  const formattedCards = map(formatCard(collection.id, databaseMap), queries)

  logger.debug(formattedCards)

  // create cards
  const createdCards = await Promise.all(map(createCard, formattedCards))

  // create dashboard and associate cards with them
  const cardMap = toNameAndIdMap(createdCards)
  const formattedDashboards = map(formatDashboard(collection.id, cardMap), dashboards)
  await Promise.all(map(insertDashboardAndRelatedCards, formattedDashboards))
}

export const syncUpMetabase = async (collection_id) => {
  logger.info('Syncing up Metabase ...')

  // get cards & dashboards in collection `automated`
  const {
    metabaseCards,
    metabaseDashboards,
  } = await getCardsAndDashboardsByCollection(collection_id)

  await syncUpCards(collection_id, queries, metabaseCards)

  // get updated metabase cards
  const {
    metabaseCards: updatedMetabaseCards
  } = await getCardsAndDashboardsByCollection(collection_id)
  const cardMap = toNameAndIdMap(updatedMetabaseCards)

  await syncUpDashboards(collection_id, cardMap, dashboards, metabaseDashboards)
}

