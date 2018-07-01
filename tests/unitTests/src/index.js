import test from 'tape-promise/tape'
import process from 'process'
import {
  c32encode,
  c32decode,
  c32checkEncode,
  c32checkDecode,
  c32address,
  c32addressDecode
} from '../../../lib/index.js'

export function c32encodingTests() {
  const hexStrings = [
    'a46ff88886c2ef9762d970b4d2c63678835bd39d',
    '',
    '0000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000000',
    '1',
    '22',
    '001',
    '0001',
    '00001',
    '000001',
    '0000001',
    '00000001',
    '10',
    '100',
    '1000',
    '10000',
    '100000',
    '1000000',
    '10000000',
    '100000000'
  ]

  const c32minLengths = [
    undefined,
    undefined,
    20,
    20,
    32,
    32,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  ]

  const c32Strings = [
    'MHQZH246RBQSERPSE2TD5HHPF21NQMWX',
    '',
    '00000000000000000000',
    '00000000000000000001',
    '20000000000000000000000000000001',
    '20000000000000000000000000000000',
    '1',
    '12',
    '01',
    '01',
    '001',
    '001',
    '0001',
    '0001',
    'G',
    '80',
    '400',
    '2000',
    '10000',
    'G0000',
    '800000',
    '4000000'
  ]

  const hexMinLengths = [
    undefined,
    undefined,
    20,
    20,
    20,
    20,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  ]

  test('c32encode', (t) => {
    t.plan(hexStrings.length * 3)
    for (let i = 0; i < hexStrings.length; i++) {
      const z = c32encode(hexStrings[i].toLowerCase(), c32minLengths[i])
      t.equal(z, c32Strings[i], 'c32encode: ' +
        `expected ${c32Strings[i]}, got ${z}`)

      const zPadded = c32encode(hexStrings[i].toLowerCase(), z.length + 5)
      t.equal(zPadded, `00000${c32Strings[i]}`, 'c32encode padded: ' +
        `expected 00000${c32Strings[i]}, got ${zPadded}`)

      const zNoLength = c32encode(hexStrings[i].toUpperCase())
      t.equal(zNoLength, c32Strings[i], 'c32encode length deduced: ' +
        `expected ${c32Strings[i]}, got ${zNoLength}`)
    }
  })
    
  test('c32decode', (t) => {
    t.plan(c32Strings.length * 3)
    for (let i = 0; i < c32Strings.length; i++) {
      const h = c32decode(c32Strings[i], hexMinLengths[i])
      const paddedHexString = hexStrings[i].length % 2 === 0 ? hexStrings[i] : `0${hexStrings[i]}`
      t.equal(h, paddedHexString, 'c32decode: ' +
        `expected ${paddedHexString}, got ${h}`)

      const hPadded = c32decode(c32Strings[i], h.length / 2 + 5)
      t.equal(hPadded, `0000000000${paddedHexString}`, 'c32decode padded: ' +
        `expected ${paddedHexString}, got ${hPadded}`)

      const hNoLength = c32decode(c32Strings[i])
      t.equal(hNoLength, paddedHexString, 'c32decode length deduced: ' + 
        `expected ${paddedHexString}, got ${hNoLength}`)
    }
  })

  test('invalid input', (t) => {
    t.plan(2)
    try {
      c32encode('abcdefg')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid hex')
    }
    try {
      c32decode('wtu')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid c32')
    }
  })
}

export function c32encodingRandomBytes() {
  const testData = require('../data/random.json')

  test('c32encode', (t) => {
    t.plan(testData.length)
    testData.map((testData) => {
      const actualC32 = c32encode(testData.hex, testData.c32.length)
      const expectedC32 = testData.c32
      if (actualC32.length === expectedC32.length + 1) {
        t.equal(actualC32, `0${expectedC32}`, 'Should match test data from external library.')
      } else {
        t.equal(actualC32, expectedC32, 'Should match test data from external library.')
      }
    })
  })

  test('c32decode', (t) => {
    t.plan(testData.length)
    testData.map((testData) => {
      const actualHex = c32decode(testData.c32, testData.hex.length / 2)
      const expectedHex = testData.hex
      t.equal(actualHex, expectedHex, 'Should match test hex data from external library.')
      if (actualHex !== expectedHex) {
        throw new Error('FAILING FAST HERE')
      }
    })
  })

}

export function c32checkEncodingTests() {
  const hexStrings = [
    'a46ff88886c2ef9762d970b4d2c63678835bd39d',
    '',
    '0000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000000',
    '1',
    '22',
    '001',
    '0001',
    '00001',
    '000001',
    '0000001',
    '00000001',
    '10',
    '100',
    '1000',
    '10000',
    '100000',
    '1000000',
    '10000000',
    '100000000'
  ]

  const versions = [
    22,
    0,
    31,
    11,
    17,
    2
  ]
  
  const c32strings = [
    [
      'P2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', 
      'P37JJX3D', 
      'P000000000000000000002Q6VF78',
      'P00000000000000000005JA84HQ',
      'P80000000000000000000000000000004R0CMNV', 
      'P800000000000000000000000000000033H8YKK', 
      'P4VKEFGY', 
      'P4ABAT49T', 
      'P040SMAT7', 
      'P040SMAT7', 
      'P007S3BZWD', 
      'P007S3BZWD', 
      'P0005MDH0A2', 
      'P0005MDH0A2', 
      'P22J7S4CS', 
      'P101ST5JKW', 
      'PG02NDNFP7', 
      'P80022RTP9J', 
      'P40002HQ7B52', 
      'P200003AWNGGR', 
      'P1000003BCJ108', 
      'PG000000DMPNB9'
    ],
    [
      '02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE', 
      '0A0DR2R', 
      '0000000000000000000002AA028H', 
      '000000000000000000006EKBDDS', 
      '080000000000000000000000000000007R1QC00', 
      '080000000000000000000000000000003ENTGCQ', 
      '04C407K6', 
      '049Q1W6AP', 
      '006NZP224', 
      '006NZP224', 
      '0007YBH12H', 
      '0007YBH12H', 
      '000053HGS6K', 
      '000053HGS6K', 
      '021732WNV', 
      '0103H9VB3W', 
      '0G02BDQDTZ', 
      '08002CT6SBA', 
      '0400012P9QQ9', 
      '02000008BW4AV', 
      '010000013625RF', 
      '0G000001QFSPXM'
    ],
    [
      'Z2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR', 
      'Z44N8Q4', 
      'Z000000000000000000002ZE1VMN', 
      'Z00000000000000000005HZ3DVN', 
      'Z80000000000000000000000000000004XBV6MS', 
      'Z800000000000000000000000000000007VF5G0', 
      'Z6RHFJAJ', 
      'Z4BM8HYJA', 
      'Z05NKF50D', 
      'Z05NKF50D', 
      'Z004720442', 
      'Z004720442', 
      'Z00073C2AR7', 
      'Z00073C2AR7', 
      'Z23M13WT9', 
      'Z103F8N2SE', 
      'ZG02G54C7T', 
      'Z8000MKD341', 
      'Z40003HGBBVV', 
      'Z2000039BDD6F', 
      'Z100000082GT4Q', 
      'ZG0000021P09KP'
    ],
    [
      'B2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNGTQ5XV', 
      'B29AKKQ8', 
      'B000000000000000000001A6KF5R', 
      'B00000000000000000004TNHE36', 
      'B80000000000000000000000000000007N1Y0J3', 
      'B80000000000000000000000000000001P0H0EC', 
      'B40R2K2V', 
      'B4BCDY460', 
      'B04PB501R', 
      'B04PB501R', 
      'B0057NK813', 
      'B0057NK813', 
      'B00048S8YNY', 
      'B00048S8YNY', 
      'B20QX4FW0', 
      'B102PC6RCC', 
      'BG02G1QXCQ', 
      'B8000FWS04R', 
      'B40001KAMP9Y', 
      'B200002DNYYYC', 
      'B1000003P9CPW6', 
      'BG000003473Z3W'
    ],
    [
      'H2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPZJKGHG', 
      'HXQCX36', 
      'H00000000000000000000ZKV5K0', 
      'H000000000000000000049FQ4N0', 
      'H800000000000000000000000000000043X9S3R', 
      'H80000000000000000000000000000002R04Y9K', 
      'H4NDX0WY', 
      'H48VZCZQ1', 
      'H05JF5G0A', 
      'H05JF5G0A', 
      'H007KAN0NP', 
      'H007KAN0NP', 
      'H000663B0ZQ', 
      'H000663B0ZQ', 
      'H23SE241P', 
      'H102X2YQF6', 
      'HG0322PNKV', 
      'H8000JDRJP4', 
      'H40003YJA8JD', 
      'H200001ZTRYYH', 
      'H1000002QFX7E6', 
      'HG000000PPMVDM'
    ],
    [
      '22J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKMQMB2T9', 
      '2EC7BFA', 
      '2000000000000000000003BMZJ0A', 
      '200000000000000000004CF2C9N', 
      '280000000000000000000000000000005Z78VV5', 
      '280000000000000000000000000000000SJ03P9', 
      '24N9YTH0', 
      '24ATP2H2P', 
      '206CXSP43', 
      '206CXSP43', 
      '2006CWFQ58', 
      '2006CWFQ58', 
      '20007TGK2A5', 
      '20007TGK2A5', 
      '222Q3MF1Q', 
      '2100EZ96RY', 
      '2G01YNNNTE', 
      '28001HQ43QG', 
      '240002P4722F', 
      '2200001ASE5V7', 
      '210000038X74ER', 
      '2G000003FNKA3P'
    ]
  ]

  test('c32checkEncode', (t) => {
    t.plan(hexStrings.length * versions.length * (3 + 14))
    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i]
        const v = versions[j]
        const z = c32checkEncode(v, h)
        t.equal(c32strings[j][i], z, `c32checkEncode version=${v} ${h}: ` +
          `expect ${c32strings[j][i]}, got ${z}`)

        const decoded = c32checkDecode(z)
        const decodedVersion = decoded[0]
        const decodedHex = decoded[1]
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h

        t.equal(decodedVersion, v, `c32checkDecode ${z}: expect ver ${v}, got ${decodedVersion}`)
        t.equal(decodedHex, paddedExpectedHex, 
          `c32decode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`)

        const withI = z.replace(/1/g, 'I')
        const withi = z.replace(/1/g, 'i')
        const withL = z.replace(/1/g, 'L')
        const withl = z.replace(/1/g, 'l')
        const withO = z.replace(/0/g, 'O')
        const witho = z.replace(/0/g, 'o')
        const lowerCase = z.toLowerCase()

        const homoglyphs = [withI, withi, withL, withl, withO, witho, lowerCase]

        for (let k = 0; k < homoglyphs.length; k++) {
          const decodedHomoglyph = c32checkDecode(homoglyphs[k])
          const decodedHomoglyphVersion = decodedHomoglyph[0]
          const decodedHomoglyphHex = decodedHomoglyph[1]
          const paddedExpectedHomoglyphHex = h.length % 2 !== 0 ? `0${h}` : h
         
          t.equal(decodedHomoglyphVersion, v, `c32checkDecode homoglyph ${homoglyphs[k]}: ` +
            `expect ${v}, got ${decodedHomoglyphVersion}`)

          t.equal(decodedHomoglyphHex, paddedExpectedHomoglyphHex,
            `c32checkDecode homoglyph ${homoglyphs[k]}: ` +
            `expect ${paddedExpectedHomoglyphHex}, got ${decodedHomoglyphHex}`)
        }
      }
    }
  })

  test('c32checkEncode invalid inputs', (t) => {
    t.plan(4)
    try {
      c32checkEncode(22, 'abcdefg')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid hex')
    }
    try {
      c32checkDecode('Wtz')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid c32')
    }
    try {
      c32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq19')
      c32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq1')
      c32checkDecode('sia5jq18')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid checksum')
    }
    try {
      c32checkEncode(32, 'abcdef')
      c32checkEncode(-1, 'abcdef')
      c32checkEncode(100, 'abcdef')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid version')
    }
  })
}

export function c32addressTests() {
  const hexStrings = [
    'a46ff88886c2ef9762d970b4d2c63678835bd39d',
    '0000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000000'
  ]

  const versions = [
    22,
    0,
    31,
    20,
    26,
    21
  ]
  
  const c32addresses = [
    [
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', 
      'SP000000000000000000002Q6VF78',
      'SP00000000000000000005JA84HQ',
      'SP80000000000000000000000000000004R0CMNV', 
      'SP800000000000000000000000000000033H8YKK'
    ],
    [
      'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE', 
      'S0000000000000000000002AA028H', 
      'S000000000000000000006EKBDDS', 
      'S080000000000000000000000000000007R1QC00', 
      'S080000000000000000000000000000003ENTGCQ'
    ],
    [
      'SZ2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR', 
      'SZ000000000000000000002ZE1VMN', 
      'SZ00000000000000000005HZ3DVN', 
      'SZ80000000000000000000000000000004XBV6MS', 
      'SZ800000000000000000000000000000007VF5G0'
    ],
    [
      'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G', 
      'SM0000000000000000000062QV6X', 
      'SM00000000000000000005VR75B2', 
      'SM80000000000000000000000000000004WBEWKC', 
      'SM80000000000000000000000000000000JGSYGV'
    ],
    [
      'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ', 
      'ST000000000000000000002AMW42H', 
      'ST000000000000000000042DB08Y', 
      'ST80000000000000000000000000000006BYJ4R4', 
      'ST80000000000000000000000000000002YBNPV3'
    ],
    [
      'SN2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKP6D2ZK9', 
      'SN000000000000000000003YDHWKJ', 
      'SN00000000000000000005341MC8', 
      'SN800000000000000000000000000000066KZWY0', 
      'SN800000000000000000000000000000006H75AK'
    ]
  ]

  test('c32address', (t) => {
    t.plan(hexStrings.length * versions.length * 3)
    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i]
        const v = versions[j]
        const z = c32address(v, h)
        t.equal(c32addresses[j][i], z, `c32address version=${v} ${h}: ` +
          `expect ${c32addresses[j][i]}, got ${z}`)

        const decoded = c32addressDecode(z)
        const decodedVersion = decoded[0]
        const decodedHex = decoded[1]
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h

        t.equal(decodedVersion, v, `c32addressDecode ${z}: expect ver ${v}, got ${decodedVersion}`)
        t.equal(decodedHex, paddedExpectedHex, 
          `c32addressDecode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`)
      }
    }
  })

  test('c32address invalid input', (t) => {
    const invalids = [
      () => c32address(-1, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),
      () => c32address(32, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d00'),
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd3'),
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d0'),
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39')
    ]

    const invalidDecodes = [
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ0'),
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RR'),
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0R'),
      () => c32addressDecode('ST2J')
    ]

    t.plan(invalids.length + invalidDecodes.length)
    for (let i = 0; i < invalids.length; i++) {
      try {
        invalids[i]()
        t.ok(false, 'parsed invalid input')
      } catch (e) {
        t.ok(true, `invalid input case ${i}`)
      }
    }

    for (let i = 0; i < invalidDecodes.length; i++) {
      try {
        invalidDecodes[i]()
        t.ok(false, 'decoded invalid address')
      } catch (e) {
        t.ok(true, `invalid address decode case ${i}`)
      }
    }
  })
}

if (process.env.BIG_DATA_TESTS) {
  c32encodingRandomBytes()
} else {
  c32encodingTests()
  c32checkEncodingTests()
  c32addressTests()
}
