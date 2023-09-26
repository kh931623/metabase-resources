import {
  zipObj,
  map,
  curry,
  has,
  not,
  pipe,
} from "ramda";

export const listToMap = curry((getKey, getValue, list) => {
  const keys = map(getKey, list)
  const values = map(getValue, list)

  return zipObj(keys, values)
})

export const notIn = curry((obj, key) => {
  return pipe(
    has(key),
    not,
  )(obj)
})
