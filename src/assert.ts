import { ENV_VARS } from './models/EnvVars'

const errorMessagePrefix = 'Assertion failed'
class AssertionError extends Error {}

// node_modules/@types/node/assert.d.ts の型をそのまま使用
export function assert(value: unknown, message?: string | Error): asserts value {
  if (ENV_VARS.env === 'production' || Boolean(value)) {
    return
  }

  /**
   * x
   */
  const errorMessage = (() => {
    if (message == null) {
      return errorMessagePrefix
    } else if (typeof message === 'string') {
      return `${errorMessagePrefix}: ${message}`
    } else if (message instanceof Error) {
      return `${errorMessagePrefix}: ${message.message}`
    }
  })()

  throw new AssertionError(errorMessage)
}
