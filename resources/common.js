import {
  readdir,
} from 'node:fs/promises'
import {
  resolve,
} from 'node:path'

import yaml from 'js-yaml'
import {
  endsWith,
  propEq,
  curry,
} from 'ramda'

export const getYamlList = async (dirPath) => {
  const files = await readdir(dirPath)
  return files.filter(endsWith('yaml'))
}

export const yamlFileToObj = async (filePath) => {
  const file = Bun.file(filePath)
  const yamlText = await file.text()
  return yaml.load(yamlText)
}

export const isEnable = propEq(true, 'enabled')

const appendDirPath = curry((dirPath, fileName) => {
  return resolve(dirPath, fileName)
})

export const getResources = async (dirPath) => {
  const fileNames = await getYamlList(dirPath)
  const absoluteFilePath = fileNames.map(appendDirPath(dirPath))
  const resources = await Promise.all(absoluteFilePath.map(yamlFileToObj))

  return resources.filter(isEnable)
}
