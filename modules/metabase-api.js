import axios from "axios";

import {
  METABASE_URL,
  METABASE_USER,
  METABASE_PASSWORD,
} from "../config";

const SESSION_API_URL = `${METABASE_URL}/api/session`

export const getSessionToken = async () => {
  const res = await axios.post(SESSION_API_URL, {
    username: METABASE_USER,
    password: METABASE_PASSWORD,
  })

  // console.log(res)

  return res.data.id
}
