import {
  curry,
} from "ramda";

export const formatCard = curry((collection, databaseMap, card) => {
  const {
    name,
    database,
    query,
  } = card

  const collection_id = collection.id
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
