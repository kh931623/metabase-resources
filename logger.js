import winston from "winston";

import { LOG_LEVEL } from "@config";

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json({
    space: 2
  }),
  transports: [
    new winston.transports.Console(),
  ]
})

export default logger
