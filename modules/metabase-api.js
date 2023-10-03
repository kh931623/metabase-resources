import axios from "axios";

import {
  METABASE_URL,
  METABASE_USER,
  METABASE_PASSWORD,
} from "../config";
import logger from '@logger'

const METABASE_API_URL = `${METABASE_URL}/api`
const METABASE_SESSION_API_URL = `${METABASE_API_URL}/session`
const METABASE_COLLECTION_API_URL = `${METABASE_API_URL}/collection`
const METABASE_CARD_API_URL = `${METABASE_API_URL}/card`
const METABASE_DATABASE_API_URL = `${METABASE_API_URL}/database`
const METABASE_DASHBOARD_API_URL = `${METABASE_API_URL}/dashboard`

const computeCollectionItemsURL = (collectionId) => `${METABASE_COLLECTION_API_URL}/${collectionId}/items`
const computeCardIdURL = (cardId) => `${METABASE_CARD_API_URL}/${cardId}`

export const getSessionToken = async () => {
  const res = await axios.post(METABASE_SESSION_API_URL, {
    username: METABASE_USER,
    password: METABASE_PASSWORD,
  })

  // console.log(res)

  return res.data.id
}

export const getCollections = async () => {
  const res = await axios.get(METABASE_COLLECTION_API_URL, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  return res.data
}

export const getCollectionItems = async (collectionId) => {
  const url = computeCollectionItemsURL(collectionId)
  console.log(url)

  const res = await axios.get(url, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  return res.data
}

export const getDatabases = async () => {
  const res = await axios.get(METABASE_DATABASE_API_URL, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  return res.data
}

export const getDashboard = async (id) => {
  const url = `${METABASE_DASHBOARD_API_URL}/${id}`

  const res = await axios.get(url, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  return res.data
}

/** 
 * @typedef {Object} CollectionData
 * @property {string} name
 * @property {string} color - must be a string that matches the regex ^#[0-9A-Fa-f]{6}$ 
 * @property {string} [description] - value may be nil, or if non-nil, value must be a non-blank string
 * @property {number} [parent_id] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {string} [namespace] - value may be nil, or if non-nil, value must be a non-blank string
 */

/**
 * @param {CollectionData} payload
 */
export const createCollection = async (payload) => {
  const res = await axios.post(METABASE_COLLECTION_API_URL, payload, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  console.log('create collection res: ', res.data)

  return res.data
}

/** 
 * @typedef {Object} CardData
 * @property {string} name
 * @property {object} dataset_query - value must be a map
 * @property {string} display - value must be a non-blank string
 * @property {object} visualization_settings - value must be a map (empty map is fine)
 * @property {object[]} [parameters] - value may be nil, or if non-nil, value must be an array. Each parameter must be a map with :id and :type keys
 * @property {string} [description] - value may be nil, or if non-nil, value must be a non-blank string
 * @property {number} [collection_position] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {object} [result_metadata] - value may be nil, or if non-nil, value must be an array of valid results column metadata maps
 * @property {number} [collection_id] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {number} [cache_ttl] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {object[]} [parameter_mapping] - value may be nil, or if non-nil, value must be an array. Each parameter_mapping must be a map with :parameter_id and :target keys
 */

/**
 * @param {CardData} payload
 */
export const createCard = async (payload) => {
  try {
    const res = await axios.post(METABASE_CARD_API_URL, payload, {
      headers: {
        'X-Metabase-Session': await getSessionToken()
      }
    })

    console.log('create card res: ', res.data)

    return res.data
  } catch (error) {
    logger.error(error)
    return {}
  }
}

export const getCard = async (cardId) => {
  const url = computeCardIdURL(cardId)
  console.log('card url:', url)
  const res = await axios.get(url, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  console.log('create card res: ', res.data)

  return res.data
}

export const deleteCard = async (cardId) => {
  const url = computeCardIdURL(cardId)
  const res = await axios.delete(url, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  console.log('delete card res: ', res.data)

  return res.data
}

/**
 * @param {number} cardId
 * @param {CardData} payload
 */
export const updateCard = async (cardId, payload) => {
  const url = computeCardIdURL(cardId)

  try {
    const res = await axios.put(url, payload, {
      headers: {
        'X-Metabase-Session': await getSessionToken()
      }
    })

    console.log('update card res: ', res.data)

    return res.data
  } catch (error) {
    console.error(error.response.data)
    console.error(error.toJSON())
    return null
  }
}

/**
 * @typedef DashbaordPayload
 * @property {string} name - value must be a non-blank string
 * @property {string} description - value may be nil, or if non-nil, value must be a string
 * @property {object[]} parameters - value may be nil, or if non-nil, value must be an array. Each parameter must be a map with :id and :type keys
 * @property {number} [cache_ttl] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {number} [collection_id] - value may be nil, or if non-nil, value must be an integer greater than zero
 * @property {number} [collection_position] - value may be nil, or if non-nil, value must be an integer greater than zero
 */

/**
 * @param {DashbaordPayload} payload
 */
export const createDashboard = async (payload) => {
  console.log('create dashboard payload: ', payload)

  const res = await axios.post(METABASE_DASHBOARD_API_URL, payload, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  console.log('created dashboard', res.data)

  return res.data
}

export const linkCardsToDashboard = async (dashboardId, cards) => {
  const url = `${METABASE_DASHBOARD_API_URL}/${dashboardId}/cards`

  try {
    const res = await axios.put(url, { cards }, {
      headers: {
        'X-Metabase-Session': await getSessionToken()
      }
    })

    console.log('link cards res: ', res.data)

    return res.data
  } catch (error) {
    console.error(error.response.data)
    console.error(error.toJSON())
    return null
  }
}

export const deleteDashboard = async (dashboardId) => {
  const url = `${METABASE_DASHBOARD_API_URL}/${dashboardId}`

  const res = await axios.delete(url, {
    headers: {
      'X-Metabase-Session': await getSessionToken()
    }
  })

  console.log('delete dashboard res: ', res.data)

  return res.data
}
