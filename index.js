import { getSessionToken, getCollections } from "./modules/metabase-api";
// console.log("Hello via Bun!");
// console.log("env:", process.env)

const token = await getSessionToken()
const collections = await getCollections()

console.log('token:', token)
console.log('collections:', collections)

