/* @flow */
import { z32 } from './encoding'
import { z32checkEncode, z32checkDecode } from './checksum'

export const versions = {
  mainnet: {
    p2pkh: 22,
    p2sh: 11
  },
  testnet: {
    p2pkh: 17,
    p2sh: 2
  }
}

/**
 * Make a z32check address with the given version and hash160
 * The only difference between a z32check string and z32 address
 * is that the first letter is captialized.
 * @param {number} version - the address version number
 * @param {string} hash160hex - the hash160 to encode (must be a hash160)
 * @returns {string} the address
 */
export function z32address(version: number, hash160hex: string) : string {
  if (!hash160hex.match(/^[0-9a-fA-F]{40}$/)) {
    throw new Error('Invalid argument: not a hash160 hex string')
  }

  const z32string = z32checkEncode(version, hash160hex)
  const prefix = z32string.substring(0, 1).toUpperCase()
  return `${prefix}${z32string.slice(1)}`
}

/**
 * Decode a z32 address into its version and hash160
 * @param {string} z32addr - the z32check-encoded address
 * @returns {[number, string]} a tuple with the version and hash160
 */
export function z32addressDecode(z32addr: string) : [number, string] {
  if (!z32addr.match(`^[${z32.toUpperCase()}][${z32}]+$`)) {
    throw new Error('Invalid argument: not a z32 address')
  }

  const z32string = z32addr.toLowerCase()
  return z32checkDecode(z32string)
}

