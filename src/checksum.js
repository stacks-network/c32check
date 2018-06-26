/* @flow */

import { z32encode, z32decode, z32 } from './encoding'
import crypto from 'crypto'

/**
 * Get the z32check checksum of a hex-encoded string
 * @param {string} dataHex - the hex string
 * @returns {string} the z32 checksum, as a bin-encoded string
 */
function z32checksum(dataHex: string) : string {
  const tmpHash = crypto.createHash('sha256').update(Buffer.from(dataHex, 'hex')).digest()
  const dataHash = crypto.createHash('sha256').update(tmpHash).digest()
  const checksum = dataHash.slice(0, 4).toString('hex')
  return checksum
}

/**
 * Encode a hex string as a z32check string.  This is a lot like how
 * base58check works in Bitcoin-land, but this algorithm uses the 
 * z-base-32 alphabet instead of the base58 alphabet.  The algorithm
 * is as follows:
 * * calculate the z32checksum of version + data
 * * z32encode version + data + z32checksum
 * @param {number} version - the version string (between 0 and 31)
 * @param {string} data - the data to encode
 * @returns {string} the z32check representation
 */
export function z32checkEncode(version: number, data: string) : string {
  if (version < 0 || version >= 32) {
    throw new Error('Invalid version (must be between 0 and 31)')
  }
  if (!data.match(/^[0-9a-fA-F]*$/)) {
    throw new Error('Invalid data (not a hex string)')
  }

  data = data.toLowerCase()
  if (data.length % 2 !== 0) {
    data = `0${data}`
  }

  let versionHex = version.toString(16)
  if (versionHex.length === 1) {
    versionHex = `0${versionHex}`
  }

  const checksumHex = z32checksum(`${versionHex}${data}`)
  const z32str = z32encode(`${data}${checksumHex}`)
  return `${z32[version]}${z32str}`
}

/*
 * Decode a z32check string back into its version and data payload.  This is
 * a lot like how base58check works in Bitcoin-land, but this algorithm uses
 * the z-base-32 alphabet instead of the base58 alphabet.  The algorithm
 * is as follows:
 * * extract the version, data, and checksum
 * * verify the checksum matches z32checksum(version + data)
 * * return data
 * @param {string} z32data - the z32check-encoded string
 * @returns {array} [version (number), data (string)].  The returned data 
 * will be a hex string.  Throws an exception if the checksum does not match.
 */
export function z32checkDecode(z32data: string) : [number, string] {
  if (!z32data.match(`^[${z32}]*$`)) {
    throw new Error('Invalid z32check string: invalid characters')
  }

  const dataHex = z32decode(z32data.slice(1))
  const versionChar = z32data[0]
  const version = z32.indexOf(versionChar)
  const checksum = dataHex.slice(-8)

  let versionHex = version.toString(16)
  if (versionHex.length === 1) {
    versionHex = `0${versionHex}`
  }

  if (z32checksum(`${versionHex}${dataHex.substring(0, dataHex.length - 8)}`) !== checksum) {
    throw new Error('Invalid z32check string: checksum mismatch')
  }

  return [version, dataHex.substring(0, dataHex.length - 8)]
}

