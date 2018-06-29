/* @flow */

const bigi = require('bigi')

export const z32 = 'ybndrfg8ejkmcpqxot1uwisza345h769'

/**
 * Encode a hex string as a z32 string.  Note that the hex string is assumed
 * to be big-endian (and the resulting z32 string will be as well).
 * @param {string} inputHex - the input to encode
 * @param {number} minLength - the minimum length of the z32 string
 * @returns {string} the z32check-encoded representation of the data, as a string
 */
export function z32encode(inputHex : string, minLength?: number) : string {
  // must be hex
  if (!inputHex.match(/^[0-9a-fA-F]*$/)) {
    throw new Error('Not a hex-encoded string')
  }

  if ((inputHex.length) % 2 !== 0) {
    inputHex = `0${inputHex}`
  }
  
  inputHex = inputHex.toLowerCase()

  const res = []
  const zero = bigi.fromByteArrayUnsigned('0')
  const base = bigi.fromByteArrayUnsigned(`${z32.length}`)
  const zeroPrefix = Buffer.from(inputHex, 'hex').toString().match(/^\u0000*/)
  const numLeadingZeroBytes = zeroPrefix ? zeroPrefix[0].length : 0

  let val = bigi.fromHex(inputHex)
  while (val.compareTo(zero) > 0) {
    const divRem = val.divideAndRemainder(base)
    const rem = divRem[1].toByteArray()[0]    // between 0 and z32.length - 1

    res.unshift(z32[rem])
    val = divRem[0]
  }

  for (let i = 0; i < numLeadingZeroBytes; i++) {
    res.unshift(z32[0])
  }

  if (minLength) {
    const count = minLength - res.length
    for (let i = 0; i < count; i++) {
      res.unshift(z32[0])
    }
  }

  return res.join('')
}

/*
 * Decode a z32 string back into a hex string.  Note that the z32 input
 * string is assumed to be big-endian (and the resulting hex string will
 * be as well).
 * @param {string} z32input - the z32-encoded input to decode
 * @param {number} minLength - the minimum length of the output hex string (in bytes)
 * @returns {string} the hex-encoded representation of the data, as a string
 */
export function z32decode(z32input: string, minLength?: number) : string {
  // must be z32 
  if (!z32input.match(`^[${z32}]*$`)) {
    throw new Error('Not a z32-encoded string')
  }

  const base = bigi.fromByteArrayUnsigned(`${z32.length}`)

  const zeroPrefix = z32input.match(/^y*/)
  const numLeadingZeroBytes = zeroPrefix ? zeroPrefix[0].length : 0

  let res = bigi.fromByteArrayUnsigned('0')
  for (let i = 0; i < z32input.length; i++) {
    res = res.multiply(base)
    res = res.add(bigi.fromByteArrayUnsigned(`${z32.indexOf(z32input[i])}`))
  }

  let hexStr = res.toHex()

  for (let i = 0; i < numLeadingZeroBytes; i++) {
    hexStr = `00${hexStr}`
  }

  if (minLength) {
    const count = minLength * 2 - hexStr.length
    for (let i = 0; i < count; i += 2) {
      hexStr = `00${hexStr}`
    }
  }

  return hexStr
}
