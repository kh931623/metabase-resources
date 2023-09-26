import {
  curry,
  map,
  addIndex,
} from "ramda";

const SIZE_X = 12
const SIZE_Y = 9

export const formatCard = curry((collection_id, databaseMap, card) => {
  const {
    name,
    database,
    query,
  } = card

  const database_id = databaseMap[database]

  return {
    name,
    display: 'table',
    collection_id,
    dataset_query: {
      type: 'native',
      native: {
        query
      },
      database: database_id
    },
    visualization_settings: {}
  }
})

const createCardObject = curry((cardMap, cardName, index) => {
  const card_id = cardMap[cardName]
  const col = (index % 2) * SIZE_X
  const row = Math.floor(index / 2);

  return {
    card_id,
    id: -index,
    size_x: SIZE_X,
    size_y: SIZE_Y,
    row,
    col,
  }
})

export const formatDashboard = curry((collection_id, cardMap, dashboard) => {
  const {
    name,
    cards = []
  } = dashboard

  const cardObjects = addIndex(map)(createCardObject(cardMap), cards)

  return {
    name,
    collection_id,
    cards: cardObjects,
  }
})
