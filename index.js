import { getSessionToken } from "./modules/metabase-api";
// console.log("Hello via Bun!");
// console.log("env:", process.env)

const token = await getSessionToken()

console.log('token:', token)
