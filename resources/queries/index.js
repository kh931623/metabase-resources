import {
  resolve,
} from 'node:path'

import { getResources } from "../common";

const dirPath = resolve(import.meta.dir, './modules/')
const resources = await getResources(dirPath)

export default resources
