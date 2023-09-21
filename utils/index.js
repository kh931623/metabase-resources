import {
  zipObj,
  map,
  prop,
  curry,
} from "ramda";

export const listToMap = curry((keyPropName, valuePropName, list) => {
  const keys = map(prop(keyPropName), list)
  const values = map(prop(valuePropName), list)

  return zipObj(keys, values)
})
