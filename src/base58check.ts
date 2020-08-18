/*
 * From https://github.com/wzbg/base58check
 * @Author: zyc 
 * @Date:   2016-09-11 23:36:05
 */
'use strict'
import { Buffer } from 'buffer/'
import { hashSha256 } from 'cross-sha256'
import * as basex from 'base-x'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function encode(data: string | Buffer, prefix: string | Buffer = '00', encoding: string = 'hex') {
  if (typeof data === 'string') {
    data = new Buffer(data, encoding)
  }
  if (!(data instanceof Buffer)) {
    throw new TypeError('"data" argument must be an Array of Buffers')
  }
  if (!(prefix instanceof Buffer)) {
    prefix = new Buffer(prefix, encoding)
  }
  let hash = Buffer.concat([prefix, data])
  hash = hashSha256(hash) as Buffer
  hash = hashSha256(hash) as Buffer
  hash = Buffer.concat([prefix, data,  hash.slice(0, 4)])
  return basex(ALPHABET).encode(hash)
}

export function decode(string: string, encoding?: BufferEncoding) {
  const buffer = new Buffer(basex(ALPHABET).decode(string))
  let prefix: Buffer | string = buffer.slice(0, 1)
  let data: Buffer | string = buffer.slice(1, -4)
  let hash = Buffer.concat([prefix, data])
  hash = hashSha256(hash) as Buffer
  hash = hashSha256(hash) as Buffer
  buffer.slice(-4).forEach((check, index) => {
    if (check !== hash[index]) {
      throw new Error('Invalid checksum')
    }
  })
  if (encoding) {
    prefix = prefix.toString(encoding)
    data = data.toString(encoding)
  }
  return { prefix, data }
}
