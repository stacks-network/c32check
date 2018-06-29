/* @flow */
import { c32checkEncode, c32checkDecode } from './checksum'

export const versions = {
  mainnet: {
    p2pkh: 22,    // 'P'
    p2sh: 20      // 'M'
  },
  testnet: {
    p2pkh: 26,    // 'T'
    p2sh: 21      // 'N'
  }
}

/**
 * Make a c32check address with the given version and hash160
 * The only difference between a c32check string and c32 address
 * is that the letter 'S' is pre-pended.
 * @param {number} version - the address version number
 * @param {string} hash160hex - the hash160 to encode (must be a hash160)
 * @returns {string} the address
 */
export function c32address(version: number, hash160hex: string) : string {
  if (!hash160hex.match(/^[0-9a-fA-F]{40}$/)) {
    throw new Error('Invalid argument: not a hash160 hex string')
  }

  const c32string = c32checkEncode(version, hash160hex)
  return `S${c32string}`
}

/**
 * Decode a c32 address into its version and hash160
 * @param {string} c32addr - the c32check-encoded address
 * @returns {[number, string]} a tuple with the version and hash160
 */
export function c32addressDecode(c32addr: string) : [number, string] {
  if (c32addr.length <= 5) {
    throw new Error('Invalid c32 address: invalid length')
  }
  return c32checkDecode(c32addr.slice(1))
}

