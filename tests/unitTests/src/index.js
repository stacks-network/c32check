import test from 'tape-promise/tape'

import {
  z32encode,
  z32decode,
  z32checkEncode,
  z32checkDecode,
  z32address,
  z32addressDecode
} from '../../../lib/index.js'

export function z32encodingTests() {
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

  const z32minLengths = [
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

  const z32Strings = [
    'wtz9tnrgamz3qas3qn4pfttsxnbizwh7',
    '',
    'yyyyyyyyyyyyyyyyyyyy',
    'yyyyyyyyyyyyyyyyyyyb',
    'nyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyb',
    'nyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    'b',
    'bn',
    'yb',
    'yb',
    'yyb',
    'yyb',
    'yyyb',
    'yyyb',
    'o',
    'ey',
    'ryy',
    'nyyy',
    'byyyy',
    'oyyyy',
    'eyyyyy',
    'ryyyyyy'
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

  test('z32encode', (t) => {
    t.plan(hexStrings.length * 3)
    for (let i = 0; i < hexStrings.length; i++) {
      const z = z32encode(hexStrings[i].toLowerCase(), z32minLengths[i])
      t.equal(z, z32Strings[i], 'z32encode: ' +
        `expected ${z32Strings[i]}, got ${z}`)

      const zPadded = z32encode(hexStrings[i].toLowerCase(), z.length + 5)
      t.equal(zPadded, `yyyyy${z32Strings[i]}`, 'z32encode padded: ' +
        `expected yyyyy${z32Strings[i]}, got ${zPadded}`)

      const zNoLength = z32encode(hexStrings[i].toUpperCase())
      t.equal(zNoLength, z32Strings[i], 'z32encode length deduced: ' +
        `expected ${z32Strings[i]}, got ${zNoLength}`)
    }
  })
    
  test('z32decode', (t) => {
    t.plan(z32Strings.length * 3)
    for (let i = 0; i < z32Strings.length; i++) {
      const h = z32decode(z32Strings[i], hexMinLengths[i])
      const paddedHexString = hexStrings[i].length % 2 === 0 ? hexStrings[i] : `0${hexStrings[i]}`
      t.equal(h, paddedHexString, 'z32decode: ' +
        `expected ${paddedHexString}, got ${h}`)

      const hPadded = z32decode(z32Strings[i], h.length / 2 + 5)
      t.equal(hPadded, `0000000000${paddedHexString}`, 'z32decode padded: ' +
        `expected ${paddedHexString}, got ${hPadded}`)

      const hNoLength = z32decode(z32Strings[i])
      t.equal(hNoLength, paddedHexString, 'z32decode length deduced: ' + 
        `expected ${paddedHexString}, got ${hNoLength}`)
    }
  })

  test('invalid input', (t) => {
    t.plan(2)
    try {
      z32encode('abcdefg')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid hex')
    }
    try {
      z32decode('Wtz')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid z32')
    }
  })
}

export function z32checkEncodingTests() {
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
  
  const z32strings = [
    [
      'sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18', 
      'sd8117dp', 
      'syyyyyyyyyyyyyyyyyyyynzg5x8e',
      'syyyyyyyyyyyyyyyyyyyf1kertz', 
      'seyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyraycwi5', 
      'seyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyddte6uu', 
      'sr5uqxo6', 
      'srkmk4rj4', 
      'syry3wk48', 
      'syry3wk48', 
      'syy83dm9hp', 
      'syy83dm9hp', 
      'syyyfwptykn', 
      'syyyfwptykn', 
      'snn183rc3', 
      'sbyb34f1uh', 
      'soynipixs8', 
      'seyynna4sj1', 
      'sryyyntz8mfn', 
      'snyyyydkhiooa', 
      'sbyyyyydmc1bye', 
      'soyyyyyypwsimj'
    ],
    [
      'yn1g96reo5bq9f5n5famjwsgg3hegs6uus5uoncq', 
      'ykypana',
      'yyyyyyyyyyyyyyyyyyyyynkkynet',
      'yyyyyyyyyyyyyyyyyyyygqumpp3',
      'yeyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy8abzcyy', 
      'yeyyyyyyyyyyyyyyyyyyyyyyyyyyyyyydqi4ocz', 
      'yrcry8ug', 
      'yrjzbhgks', 
      'yygi9snnr', 
      'yygi9snnr', 
      'yyy86mtbnt', 
      'yyy86mtbnt', 
      'yyyyfdto3gu', 
      'yyyyfdto3gu', 
      'ynb8dnhi5', 
      'ybydtj5mdh', 
      'yoynmpzp49', 
      'yeyync4g3mk', 
      'yryyybnsjzzj', 
      'ynyyyyyemhrk5', 
      'ybyyyyybdgnfax', 
      'yoyyyyybzx3s7w'
    ],
    [
      '9n1g96reo5bq9f5n5famjwsgg3hegs6uuzjtgpsa', 
      '9rriezr', 
      '9yyyyyyyyyyyyyyyyyyyyn9qb5wi',
      '9yyyyyyyyyyyyyyyyyyyft9dp5i',
      '9eyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyr7m5gw3', 
      '9eyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy85xfoy', 
      '9gatx1k1', 
      '9rmwet61k', 
      '9yfiuxfyp', 
      '9yfiuxfyp', 
      '9yyr8nyrrn', 
      '9yyr8nyrrn', 
      '9yyy8dcnka8', 
      '9yyy8dcnka8', 
      '9ndwbdh4j', 
      '9bydxein3q', 
      '9oynofrc84', 
      '9eyyywupdrb', 
      '9ryyydtomm55', 
      '9nyyyydjmppgx', 
      '9byyyyyyeno4rz', 
      '9oyyyyynbsyjus'
    ],
    [
      'mn1g96reo5bq9f5n5famjwsgg3hegs6uuio4zf75',
      'mnjkuuze',
      'myyyyyyyyyyyyyyyyyyyybkguxfa',
      'myyyyyyyyyyyyyyyyyyyr4itqdg',
      'meyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy8ib6y1d',
      'meyyyyyyyyyyyyyyyyyyyyyyyyyyyyyybsytyqc',
      'mryanun5',
      'mrmcp6rgy',
      'myrsmfyba',
      'myrsmfyba',
      'myyf8iuebd',
      'myyf8iuebd',
      'myyyre3e6i6',
      'myyyre3e6i6',
      'mnyz7rxhy',
      'mbynscgacc',
      'moynobz7cz',
      'meyyyxh3yra',
      'mryyybukwsj6',
      'mnyyyynpi666c',
      'mbyyyyydsjcshg',
      'moyyyyydr8d9dh'
    ],
    [
      'tn1g96reo5bq9f5n5famjwsgg3hegs6uus91uoto', 
      't7zc7dg', 
      'tyyyyyyyyyyyyyyyyyyyy9u5fuy',
      'tyyyyyyyyyyyyyyyyyyyrjxzriy',
      'teyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyrd7j3da', 
      'teyyyyyyyyyyyyyyyyyyyyyyyyyyyyyynayr6ju', 
      'trip7yh6', 
      'tre59c9zb', 
      'tyf1xfoyk', 
      'tyf1xfoyk', 
      'tyy8ukiyis', 
      'tyy8ukiyis', 
      'tyyyggdmy9z', 
      'tyyyggdmy9z', 
      'tnd3qnrbs', 
      'tbyn7n6zxg', 
      'toydnnsiu5', 
      'teyyy1pa1sr', 
      'tryyyd61ke1p', 
      'tnyyyyb94a66t', 
      'tbyyyyynzx78qg', 
      'toyyyyyyssw5pw'
    ],
    [
      'nn1g96reo5bq9f5n5famjwsgg3hegs6uuwzwmn4j', 
      'nqc8mxk', 
      'nyyyyyyyyyyyyyyyyyyyydmw91yk',
      'nyyyyyyyyyyyyyyyyyyyrcxncji',
      'neyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyf98e55f', 
      'neyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy31ydsj', 
      'nrij64ty', 
      'nrk4sntns', 
      'nygc73srd', 
      'nygc73srd', 
      'nyygchxzfe', 
      'nyygchxzfe', 
      'nyyy84ounkf', 
      'nyyy84ounkf', 
      'nnnzdwxbz', 
      'nbyyq9jga6', 
      'noyb6iii4q', 
      'neyybtzrdzo', 
      'nryyynsr8nnx', 
      'nnyyyybk3qf58', 
      'nbyyyyyde78rqa', 
      'noyyyyydxiukds'
    ]
  ]

  test('z32checkEncode', (t) => {
    t.plan(hexStrings.length * versions.length * 3)
    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i]
        const v = versions[j]
        const z = z32checkEncode(v, h)
        t.equal(z32strings[j][i], z, `z32encode version=${v} ${h}: ` +
          `expect ${z32strings[j][i]}, got ${z}`)

        const decoded = z32checkDecode(z)
        const decodedVersion = decoded[0]
        const decodedHex = decoded[1]
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h

        t.equal(decodedVersion, v, `z32decode ${z}: expect version ${v}, got ${decodedVersion}`)
        t.equal(decodedHex, paddedExpectedHex, 
          `z32decode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`)
      }
    }
  })

  test('z32checkEncode invalid inputs', (t) => {
    t.plan(4)
    try {
      z32checkEncode(22, 'abcdefg')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid hex')
    }
    try {
      z32checkDecode('Wtz')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid z32')
    }
    try {
      z32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq19')
      z32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq1')
      z32checkDecode('sia5jq18')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid checksum')
    }
    try {
      z32checkEncode(32, 'abcdef')
      z32checkEncode(-1, 'abcdef')
      z32checkEncode(100, 'abcdef')
      t.ok(false)
    } catch (e) {
      t.ok(true, 'invalid version')
    }
  })
}

export function z32addressTests() {
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
    11,
    17,
    2
  ]
  
  const z32addresses = [
    [
      'Sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18', 
      'Syyyyyyyyyyyyyyyyyyyynzg5x8e',
      'Syyyyyyyyyyyyyyyyyyyf1kertz', 
      'Seyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyraycwi5', 
      'Seyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyddte6uu'
    ],
    [
      'Yn1g96reo5bq9f5n5famjwsgg3hegs6uus5uoncq', 
      'Yyyyyyyyyyyyyyyyyyyyynkkynet',
      'Yyyyyyyyyyyyyyyyyyyygqumpp3',
      'Yeyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy8abzcyy', 
      'Yeyyyyyyyyyyyyyyyyyyyyyyyyyyyyyydqi4ocz'
    ],
    [
      '9n1g96reo5bq9f5n5famjwsgg3hegs6uuzjtgpsa', 
      '9yyyyyyyyyyyyyyyyyyyyn9qb5wi',
      '9yyyyyyyyyyyyyyyyyyyft9dp5i',
      '9eyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyr7m5gw3', 
      '9eyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy85xfoy'
    ],
    [
      'Mn1g96reo5bq9f5n5famjwsgg3hegs6uuio4zf75',
      'Myyyyyyyyyyyyyyyyyyyybkguxfa',
      'Myyyyyyyyyyyyyyyyyyyr4itqdg',
      'Meyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy8ib6y1d',
      'Meyyyyyyyyyyyyyyyyyyyyyyyyyyyyyybsytyqc'
    ],
    [
      'Tn1g96reo5bq9f5n5famjwsgg3hegs6uus91uoto', 
      'Tyyyyyyyyyyyyyyyyyyyy9u5fuy',
      'Tyyyyyyyyyyyyyyyyyyyrjxzriy',
      'Teyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyrd7j3da', 
      'Teyyyyyyyyyyyyyyyyyyyyyyyyyyyyyynayr6ju'
    ],
    [
      'Nn1g96reo5bq9f5n5famjwsgg3hegs6uuwzwmn4j', 
      'Nyyyyyyyyyyyyyyyyyyyydmw91yk',
      'Nyyyyyyyyyyyyyyyyyyyrcxncji',
      'Neyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyf98e55f', 
      'Neyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy31ydsj'
    ]
  ]

  test('z32address', (t) => {
    t.plan(hexStrings.length * versions.length * 3)
    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i]
        const v = versions[j]
        const z = z32address(v, h)
        t.equal(z32addresses[j][i], z, `z32encode version=${v} ${h}: ` +
          `expect ${z32addresses[j][i]}, got ${z}`)

        const decoded = z32addressDecode(z)
        const decodedVersion = decoded[0]
        const decodedHex = decoded[1]
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h

        t.equal(decodedVersion, v, `z32decode ${z}: expect version ${v}, got ${decodedVersion}`)
        t.equal(decodedHex, paddedExpectedHex, 
          `z32decode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`)
      }
    }
  })

  test('z32address invalid input', (t) => {
    const invalids = [
      () => z32address(-1, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),
      () => z32address(32, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),
      () => z32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d00'),
      () => z32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd3'),
      () => z32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d0'),
      () => z32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39')
    ]

    const invalidDecodes = [
      () => z32addressDecode('Mn1g96reo5bq9f5n5famjwsgg3hegs6uuio4zf7'),
      () => z32addressDecode('Mn1g96reo5bq9f5n5famjwsgg3hegs6uuio4zf75y'),
      () => z32addressDecode('mn1g96reo5bq9f5n5famjwsgg3hegs6uuio4zf75')
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

z32encodingTests()
z32checkEncodingTests()
z32addressTests()
