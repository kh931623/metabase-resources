import axios from "axios";

import {
  METABASE_URL,
  METABASE_USER,
  METABASE_PASSWORD,
} from "../config";

const METABASE_API_URL = `${METABASE_URL}/api`
const METABASE_SESSION_API_URL = `${METABASE_API_URL}/session`
const METABASE_COLLECTION_API_URL = `${METABASE_API_URL}/collection`

const computeCollectionItemsURL = (collectionId) => `${METABASE_COLLECTION_API_URL}/${collectionId}/items`

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
