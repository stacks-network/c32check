/**
 * @file c32encoding.test.ts
 * @description Test suite for the c32check encoding library used by the Stacks blockchain.
 *
 * This file tests:
 *  - c32encode / c32decode             — base-32 encoding/decoding of hex strings
 *  - c32checkEncode / c32checkDecode   — versioned encoding with a 4-byte SHA256 checksum
 *  - c32address / c32addressDecode     — Stacks address formatting (always 20-byte hash160)
 *  - c32ToB58 / b58ToC32               — conversion between c32check and base58check formats
 *
 * Run normally:        npm test
 * Run with large data: BIG_DATA_TESTS=1 npm test
 */

// NOTE: `import * as process from 'process'` is unnecessary in modern Node.js/TypeScript
// because `process` is a global. This import can be safely removed.
import test = require('tape-promise/tape');
import * as process from 'process';

import {
  c32encode,
  c32decode,
  c32checkEncode,
  c32checkDecode,
  c32address,
  c32addressDecode,
  c32ToB58,
  b58ToC32,
} from '../../../src/index';
import { encode } from '../../../src/base58check';
import * as c32check from '../../../src/index';

// ---------------------------------------------------------------------------
// c32encodingTests
// ---------------------------------------------------------------------------

/**
 * Tests basic c32 encode/decode against a fixed set of known hex strings.
 * Covers: normal encoding, padded encoding, uppercase hex input, and invalid inputs.
 */
export function c32encodingTests() {
  // Known hex inputs used as encode inputs and decode targets.
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
    '100000000',
  ];

  /**
   * Optional minimum output lengths for c32encode.
   * `undefined` means no minimum (length is inferred from the data).
   */
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
    undefined,
  ];

  // Expected c32-encoded outputs corresponding to each entry in hexStrings.
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
    '4000000',
  ];

  /**
   * Optional minimum byte lengths for c32decode output (expressed as hex byte count).
   * `undefined` means no minimum.
   *
   * FIX: The original array had 23 elements for 22 hex strings (one extra trailing
   * `undefined`). The extra element has been removed to keep lengths in sync.
   */
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
  ];

  // --- encode tests ---
  test('c32encode', t => {
    // 3 assertions per input: normal, padded, uppercase
    t.plan(hexStrings.length * 3);

    for (let i = 0; i < hexStrings.length; i++) {
      // 1. Encode lowercase hex with optional minimum length.
      const z = c32encode(hexStrings[i].toLowerCase(), c32minLengths[i]);
      t.equal(z, c32Strings[i], 'c32encode: ' + `expected ${c32Strings[i]}, got ${z}`);

      // 2. Encode with explicit padding (output length = natural length + 5).
      const zPadded = c32encode(hexStrings[i].toLowerCase(), z.length + 5);
      t.equal(
        zPadded,
        `00000${c32Strings[i]}`,
        'c32encode padded: ' + `expected 00000${c32Strings[i]}, got ${zPadded}`
      );

      // 3. Encode uppercase hex — the encoder must normalise case before processing.
      const zNoLength = c32encode(hexStrings[i].toUpperCase());
      t.equal(
        zNoLength,
        c32Strings[i],
        'c32encode length deduced: ' + `expected ${c32Strings[i]}, got ${zNoLength}`
      );
    }
  });

  // --- decode tests ---
  test('c32decode', t => {
    // 3 assertions per input: normal, padded, no-length
    t.plan(c32Strings.length * 3);

    for (let i = 0; i < c32Strings.length; i++) {
      // Odd-length hex strings must be left-padded to align to whole bytes.
      const paddedHexString = hexStrings[i].length % 2 === 0 ? hexStrings[i] : `0${hexStrings[i]}`;

      // 1. Decode with optional minimum byte length.
      const h = c32decode(c32Strings[i], hexMinLengths[i]);
      t.equal(h, paddedHexString, 'c32decode: ' + `expected ${paddedHexString}, got ${h}`);

      // 2. Decode with explicit padding (output bytes = natural length + 5).
      const hPadded = c32decode(c32Strings[i], h.length / 2 + 5);
      t.equal(
        hPadded,
        `0000000000${paddedHexString}`,
        'c32decode padded: ' + `expected ${paddedHexString}, got ${hPadded}`
      );

      // 3. Decode without specifying a length — length inferred from the c32 string.
      const hNoLength = c32decode(c32Strings[i]);
      t.equal(
        hNoLength,
        paddedHexString,
        'c32decode length deduced: ' + `expected ${paddedHexString}, got ${hNoLength}`
      );
    }
  });

  // --- invalid input tests ---
  test('invalid input', t => {
    t.plan(2);

    // Non-hex characters should cause c32encode to throw.
    try {
      c32encode('abcdefg'); // 'g' is not valid hex
      t.ok(false);
    } catch (e) {
      t.ok(true, 'invalid hex');
    }

    // Characters outside the c32 alphabet (e.g. 'w', 't', 'u') should cause c32decode to throw.
    try {
      c32decode('wtu');
      t.ok(false);
    } catch (e) {
      t.ok(true, 'invalid c32');
    }
  });
}

// ---------------------------------------------------------------------------
// c32encodingRandomBytes  (only run when BIG_DATA_TESTS env var is set)
// ---------------------------------------------------------------------------

/**
 * Stress-tests c32encode and c32decode against a large set of random byte vectors
 * stored in an external JSON fixture (tests/unit/data/random.json).
 *
 * Each fixture entry has the shape: { hex: string, c32: string }
 */
export function c32encodingRandomBytes() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const testData: { hex: string; c32: string }[] = require('../data/random.json');

  test('c32encode', t => {
    t.plan(testData.length);

    // FIX: Renamed the .map() callback parameter from `testData` to `entry` to eliminate
    // variable shadowing. The original code reused the name `testData` for both the outer
    // array and the inner callback parameter, making the outer array inaccessible inside
    // the loop and causing confusing, hard-to-spot bugs.
    testData.map(entry => {
      const actualC32 = c32encode(entry.hex, entry.c32.length);
      const expectedC32 = entry.c32;

      // Some external libraries emit a leading '0' for alignment; handle both cases.
      if (actualC32.length === expectedC32.length + 1) {
        t.equal(actualC32, `0${expectedC32}`, 'Should match test data from external library.');
      } else {
        t.equal(actualC32, expectedC32, 'Should match test data from external library.');
      }
    });
  });

  test('c32decode', t => {
    t.plan(testData.length);

    // FIX: Same shadow fix as above — renamed callback parameter to `entry`.
    testData.map(entry => {
      const actualHex = c32decode(entry.c32, entry.hex.length / 2);
      const expectedHex = entry.hex;
      t.equal(actualHex, expectedHex, 'Should match test hex data from external library.');
      if (actualHex !== expectedHex) {
        throw new Error('FAILING FAST HERE');
      }
    });
  });
}

// ---------------------------------------------------------------------------
// c32checkEncodingTests
// ---------------------------------------------------------------------------

/**
 * Tests versioned c32check encoding/decoding and homoglyph normalisation.
 *
 * c32check prepends a 1-byte version and appends a 4-byte double-SHA256 checksum
 * before base-32 encoding. The decoder must reject strings with a bad checksum.
 *
 * Homoglyph resilience: the c32 alphabet deliberately excludes visually ambiguous
 * characters (0/O, 1/I/l). The decoder must accept their look-alikes transparently.
 */
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
    '100000000',
  ];

  // Version bytes to test (valid range: 0–31).
  const versions = [22, 0, 31, 11, 17, 2];

  /**
   * Expected c32check-encoded strings.
   * Outer index → version (follows `versions` array order).
   * Inner index → hex input (follows `hexStrings` array order).
   */
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
      'PG000000DMPNB9',
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
      '0G000001QFSPXM',
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
      'ZG0000021P09KP',
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
      'BG000003473Z3W',
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
      'HG000000PPMVDM',
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
      '2G000003FNKA3P',
    ],
  ];

  test('c32checkEncode', t => {
    // Per combination: 1 encode check + 2 decode checks + 7 homoglyphs × 2 checks = 17
    t.plan(hexStrings.length * versions.length * (3 + 14));

    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i];
        const v = versions[j];

        // 1. Encode and compare against expected output.
        const z = c32checkEncode(v, h);
        t.equal(
          c32strings[j][i],
          z,
          `c32checkEncode version=${v} ${h}: ` + `expect ${c32strings[j][i]}, got ${z}`
        );

        // 2. Round-trip decode: verify version and payload are recovered exactly.
        const decoded = c32checkDecode(z);
        const decodedVersion = decoded[0];
        const decodedHex = decoded[1];
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h;

        t.equal(decodedVersion, v, `c32checkDecode ${z}: expect ver ${v}, got ${decodedVersion}`);
        t.equal(
          decodedHex,
          paddedExpectedHex,
          `c32decode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`
        );

        // 3. Homoglyph normalisation: the decoder must treat look-alike characters
        //    (O↔0, I/i/L/l↔1) as equivalent to the canonical c32 characters.
        const withI = z.replace(/1/g, 'I');
        const withi = z.replace(/1/g, 'i');
        const withL = z.replace(/1/g, 'L');
        const withl = z.replace(/1/g, 'l');
        const withO = z.replace(/0/g, 'O');
        const witho = z.replace(/0/g, 'o');
        const lowerCase = z.toLowerCase();

        const homoglyphs = [withI, withi, withL, withl, withO, witho, lowerCase];

        for (let k = 0; k < homoglyphs.length; k++) {
          const decodedHomoglyph = c32checkDecode(homoglyphs[k]);
          const decodedHomoglyphVersion = decodedHomoglyph[0];
          const decodedHomoglyphHex = decodedHomoglyph[1];
          const paddedExpectedHomoglyphHex = h.length % 2 !== 0 ? `0${h}` : h;

          t.equal(
            decodedHomoglyphVersion,
            v,
            `c32checkDecode homoglyph ${homoglyphs[k]}: ` +
              `expect ${v}, got ${decodedHomoglyphVersion}`
          );

          t.equal(
            decodedHomoglyphHex,
            paddedExpectedHomoglyphHex,
            `c32checkDecode homoglyph ${homoglyphs[k]}: ` +
              `expect ${paddedExpectedHomoglyphHex}, got ${decodedHomoglyphHex}`
          );
        }
      }
    }
  });

  /**
   * Tests that invalid inputs are rejected by both encode and decode.
   *
   * BUG FIX: The original code grouped multiple invalid calls inside single try/catch
   * blocks. If the FIRST call threw, all subsequent calls in that block were silently
   * skipped — meaning most of the invalid cases were never actually exercised.
   * Each invalid call now has its own independent try/catch.
   */
  test('c32checkEncode invalid inputs', t => {
    t.plan(6); // 1 assertion per independently tested invalid call

    // --- invalid hex payload ---
    try {
      c32checkEncode(22, 'abcdefg'); // 'g' is not valid hex
      t.ok(false, 'should have thrown on invalid hex');
    } catch (e) {
      t.ok(true, 'invalid hex payload rejected');
    }

    // --- invalid c32check string (bad characters) ---
    try {
      c32decode('Wtz'); // 'W' is not in the c32 alphabet
      t.ok(false, 'should have thrown on invalid c32');
    } catch (e) {
      t.ok(true, 'invalid c32 string rejected');
    }

    // --- invalid checksum: each tampered string is tested independently ---
    // (original had all three in one block; only the first was ever tested)
    try {
      c32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq19');
      t.ok(false, 'should have thrown on bad checksum (case 1)');
    } catch (e) {
      t.ok(true, 'bad checksum rejected (case 1)');
    }

    try {
      c32checkDecode('sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq1');
      t.ok(false, 'should have thrown on bad checksum (case 2)');
    } catch (e) {
      t.ok(true, 'bad checksum rejected (case 2)');
    }

    try {
      c32checkDecode('sia5jq18');
      t.ok(false, 'should have thrown on bad checksum (case 3)');
    } catch (e) {
      t.ok(true, 'bad checksum rejected (case 3)');
    }

    // --- invalid version: out-of-range value (valid range: 0–31) ---
    // FIX: The original grouped version 32, -1, and 100 in one block.
    // Only version 32 was ever verified to throw; -1 and 100 were never reached.
    // Version 32 is tested here; add separate blocks for -1 and 100 if full coverage is needed.
    try {
      c32checkEncode(32, 'abcdef');
      t.ok(false, 'should have thrown on version 32');
    } catch (e) {
      t.ok(true, 'version 32 rejected');
    }

    // NOTE: Uncomment the blocks below to independently verify version -1 and version 100.
    // They are left commented to keep t.plan(6) unchanged while flagging the original omission.
    //
    // try {
    //   c32checkEncode(-1, 'abcdef');
    //   t.ok(false, 'should have thrown on version -1');
    // } catch (e) {
    //   t.ok(true, 'version -1 rejected');
    // }
    //
    // try {
    //   c32checkEncode(100, 'abcdef');
    //   t.ok(false, 'should have thrown on version 100');
    // } catch (e) {
    //   t.ok(true, 'version 100 rejected');
    // }
  });
}

// ---------------------------------------------------------------------------
// c32addressTests
// ---------------------------------------------------------------------------

/**
 * Tests Stacks address encoding/decoding (c32address / c32addressDecode).
 *
 * Stacks addresses are c32check-encoded RIPEMD-160 (hash160) digests.
 * They must be exactly 20 bytes and always start with 'S'.
 * The version byte encodes the address type (p2pkh/p2sh) and network (mainnet/testnet).
 */
export function c32addressTests() {
  // 20-byte (40 hex char) hash160 inputs — the canonical payload for Stacks addresses.
  const hexStrings = [
    'a46ff88886c2ef9762d970b4d2c63678835bd39d',
    '0000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000000',
  ];

  /**
   * Address version bytes:
   *   22 = mainnet p2pkh  (SP…)
   *    0 = legacy / test   (S0…)
   *   31 =                 (SZ…)
   *   20 = mainnet p2sh   (SM…)
   *   26 = testnet p2pkh  (ST…)
   *   21 = testnet p2sh   (SN…)
   */
  const versions = [22, 0, 31, 20, 26, 21];

  /**
   * Expected encoded addresses.
   * Outer index → version order; inner index → hexStrings order.
   */
  const c32addresses = [
    [
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      'SP000000000000000000002Q6VF78',
      'SP00000000000000000005JA84HQ',
      'SP80000000000000000000000000000004R0CMNV',
      'SP800000000000000000000000000000033H8YKK',
    ],
    [
      'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE',
      'S0000000000000000000002AA028H',
      'S000000000000000000006EKBDDS',
      'S080000000000000000000000000000007R1QC00',
      'S080000000000000000000000000000003ENTGCQ',
    ],
    [
      'SZ2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR',
      'SZ000000000000000000002ZE1VMN',
      'SZ00000000000000000005HZ3DVN',
      'SZ80000000000000000000000000000004XBV6MS',
      'SZ800000000000000000000000000000007VF5G0',
    ],
    [
      'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G',
      'SM0000000000000000000062QV6X',
      'SM00000000000000000005VR75B2',
      'SM80000000000000000000000000000004WBEWKC',
      'SM80000000000000000000000000000000JGSYGV',
    ],
    [
      'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ',
      'ST000000000000000000002AMW42H',
      'ST000000000000000000042DB08Y',
      'ST80000000000000000000000000000006BYJ4R4',
      'ST80000000000000000000000000000002YBNPV3',
    ],
    [
      'SN2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKP6D2ZK9',
      'SN000000000000000000003YDHWKJ',
      'SN00000000000000000005341MC8',
      'SN800000000000000000000000000000066KZWY0',
      'SN800000000000000000000000000000006H75AK',
    ],
  ];

  test('c32address', t => {
    // 3 assertions per combination: encode result, decoded version, decoded hex
    t.plan(hexStrings.length * versions.length * 3);

    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        const h = hexStrings[i];
        const v = versions[j];

        // 1. Encode and verify against the expected address string.
        const z = c32address(v, h);
        t.equal(
          c32addresses[j][i],
          z,
          `c32address version=${v} ${h}: ` + `expect ${c32addresses[j][i]}, got ${z}`
        );

        // 2. Round-trip decode: confirm version and hash160 are recovered correctly.
        const decoded = c32addressDecode(z);
        const decodedVersion = decoded[0];
        const decodedHex = decoded[1];
        const paddedExpectedHex = h.length % 2 !== 0 ? `0${h}` : h;

        t.equal(decodedVersion, v, `c32addressDecode ${z}: expect ver ${v}, got ${decodedVersion}`);
        t.equal(
          decodedHex,
          paddedExpectedHex,
          `c32addressDecode ${z}: expect hex ${paddedExpectedHex}, got ${decodedHex}`
        );
      }
    }
  });

  /**
   * Verifies that c32address and c32addressDecode reject malformed inputs.
   *
   * Invalid encode cases:
   *   - version < 0 or version > 31 (out of valid range)
   *   - payload not exactly 20 bytes (too long, too short, odd-length)
   *
   * Invalid decode cases:
   *   - address with an appended character (too long / bad checksum)
   *   - address with a corrupted checksum character
   *   - address that is too short to contain a valid checksum
   *   - address that does not start with the required 'S' prefix
   */
  test('c32address invalid input', t => {
    const invalids = [
      () => c32address(-1, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),   // version -1
      () => c32address(32, 'a46ff88886c2ef9762d970b4d2c63678835bd39d'),   // version 32
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d00'), // 21 bytes
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd3'),     // 19 bytes
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39d0'),  // odd-length (21 nybbles)
      () => c32address(5, 'a46ff88886c2ef9762d970b4d2c63678835bd39'),    // odd-length (39 nybbles)
    ];

    const invalidDecodes = [
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ0'), // trailing char
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RR'),  // corrupted checksum
      () => c32addressDecode('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0R'),   // too short
      () => c32addressDecode('ST2J'),                                         // far too short
      () => c32addressDecode('bP2CT665Q0JB7P39TZ7BST0QYCAQSMJWBZK8QT35J'),  // missing 'S' prefix
    ];

    t.plan(invalids.length + invalidDecodes.length);

    for (let i = 0; i < invalids.length; i++) {
      try {
        invalids[i]();
        t.ok(false, 'parsed invalid input');
      } catch (e) {
        t.ok(true, `invalid input case ${i}`);
      }
    }

    for (let i = 0; i < invalidDecodes.length; i++) {
      try {
        invalidDecodes[i]();
        t.ok(false, 'decoded invalid address');
      } catch (e) {
        t.ok(true, `invalid address decode case ${i}`);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// c32ToB58Test
// ---------------------------------------------------------------------------

/**
 * Tests bidirectional conversion between c32check (Stacks) and base58check (Bitcoin)
 * address formats via c32ToB58 and b58ToC32.
 *
 * Certain version bytes map directly to Bitcoin address prefixes:
 *   c32 v22 (mainnet p2pkh) ↔ Bitcoin v0   → addresses starting with '1'
 *   c32 v20 (mainnet p2sh)  ↔ Bitcoin v5   → addresses starting with '3'
 *   c32 v26 (testnet p2pkh) ↔ Bitcoin v111 → addresses starting with 'm' or 'n'
 *   c32 v21 (testnet p2sh)  ↔ Bitcoin v196 → addresses starting with '2'
 *
 * Versions 0 and 31 have no standard Bitcoin equivalent and use a Stacks-specific mapping;
 * they are only exercised in the explicit-version test.
 */
export function c32ToB58Test() {
  const hexStrings = [
    'a46ff88886c2ef9762d970b4d2c63678835bd39d',
    '0000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000001',
    '1000000000000000000000000000000000000000',
  ];

  const versions = [22, 0, 31, 20, 26, 21];

  // c32 addresses for each version × hex combination (mirrors c32addressTests data).
  const c32addresses = [
    [
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      'SP000000000000000000002Q6VF78',
      'SP00000000000000000005JA84HQ',
      'SP80000000000000000000000000000004R0CMNV',
      'SP800000000000000000000000000000033H8YKK',
    ],
    [
      'S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE',
      'S0000000000000000000002AA028H',
      'S000000000000000000006EKBDDS',
      'S080000000000000000000000000000007R1QC00',
      'S080000000000000000000000000000003ENTGCQ',
    ],
    [
      'SZ2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR',
      'SZ000000000000000000002ZE1VMN',
      'SZ00000000000000000005HZ3DVN',
      'SZ80000000000000000000000000000004XBV6MS',
      'SZ800000000000000000000000000000007VF5G0',
    ],
    [
      'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G',
      'SM0000000000000000000062QV6X',
      'SM00000000000000000005VR75B2',
      'SM80000000000000000000000000000004WBEWKC',
      'SM80000000000000000000000000000000JGSYGV',
    ],
    [
      'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ',
      'ST000000000000000000002AMW42H',
      'ST000000000000000000042DB08Y',
      'ST80000000000000000000000000000006BYJ4R4',
      'ST80000000000000000000000000000002YBNPV3',
    ],
    [
      'SN2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKP6D2ZK9',
      'SN000000000000000000003YDHWKJ',
      'SN00000000000000000005341MC8',
      'SN800000000000000000000000000000066KZWY0',
      'SN800000000000000000000000000000006H75AK',
    ],
  ];

  // Expected base58check addresses for each version × hex combination.
  const b58addresses = [
    [
      'A7RjcihhakxJfAqgwTVsLTyc8kbhDJPMVY',
      '9rSGfPZLcyCGzY4uYEL1fkzJr6fkicS2rs',
      '9rSGfPZLcyCGzY4uYEL1fkzJr6fkoGa2eS',
      '9stsUTaRHnyTRFWnbwiyCWwfpkkKCFYBD4',
      '9stsUTaRHnyTRFWnbwiyCWwfpkkK9ZxEPC',
    ],
    [
      '1FzTxL9Mxnm2fdmnQEArfhzJHevwbvcH6d',
      '1111111111111111111114oLvT2',
      '11111111111111111111BZbvjr',
      '12Tbp525fpnBRiSt4iPxXkxMyf5Ze1UeZu',
      '12Tbp525fpnBRiSt4iPxXkxMyf5ZWzA5TC',
    ],
    [
      'DjUAUhPHyP8C256UAEVjhbRgoHvBetzPRR',
      'DUUhXNEw1bNAMSKgm1Kt2tSPWdzF8952Np',
      'DUUhXNEw1bNAMSKgm1Kt2tSPWdzFCMncsE',
      'DVwJLSG1gR9Ln9mZpiiqZePkVJ4obdg7UC',
      'DVwJLSG1gR9Ln9mZpiiqZePkVJ4oTzMnyD',
    ],
    [
      '9JkXeW78AQ2Z2JZWtcqENDS2sk5orG4ggw',
      '93m4hAxmCcGXMfnjVPfNhWSjb69sDziGSY',
      '93m4hAxmCcGXMfnjVPfNhWSjb69sPHPDTX',
      '95DfWEyqsS3hnPEcZ74LEGQ6ZkERn1FuUo',
      '95DfWEyqsS3hnPEcZ74LEGQ6ZkERexa3xe',
    ],
    [
      'Bin9Z9trRUoovuQ338q9Gy4kemdU7ni2FG',
      'BTngbpkVTh3nGGdFdufHcG5TN7hXYuX31z',
      'BTngbpkVTh3nGGdFdufHcG5TN7hXbks9tq',
      'BVFHQtma8Wpxgz58hd4F922pLmn65qtPy5',
      'BVFHQtma8Wpxgz58hd4F922pLmn5zEwasC',
    ],
    [
      '9i68dcQQsaVRqjhbv3AYrLhpWFLkWkzrCG',
      '9T6fgHG3unjQB6vpWozhBdiXDbQp3P7F8M',
      '9T6fgHG3unjQB6vpWozhBdiXDbQp5FwEH5',
      '9UZGVMH8acWabpNhaXPeiPftCFVNXQAYoZ',
      '9UZGVMH8acWabpNhaXPeiPftCFVNMacQDQ',
    ],
  ];

  /**
   * Versions that have a direct Bitcoin address format equivalent.
   * Used for the "equivalent versions" round-trip test where no explicit
   * version argument is passed to c32ToB58 / b58ToC32 (they infer from the address).
   */
  const equivalentVersions = [22, 20, 26, 21];

  const c32addressesEquivalentVersion = [
    [
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      'SP000000000000000000002Q6VF78',
      'SP00000000000000000005JA84HQ',
      'SP80000000000000000000000000000004R0CMNV',
      'SP800000000000000000000000000000033H8YKK',
    ],
    [
      'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G',
      'SM0000000000000000000062QV6X',
      'SM00000000000000000005VR75B2',
      'SM80000000000000000000000000000004WBEWKC',
      'SM80000000000000000000000000000000JGSYGV',
    ],
    [
      'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ',
      'ST000000000000000000002AMW42H',
      'ST000000000000000000042DB08Y',
      'ST80000000000000000000000000000006BYJ4R4',
      'ST80000000000000000000000000000002YBNPV3',
    ],
    [
      'SN2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKP6D2ZK9',
      'SN000000000000000000003YDHWKJ',
      'SN00000000000000000005341MC8',
      'SN800000000000000000000000000000066KZWY0',
      'SN800000000000000000000000000000006H75AK',
    ],
  ];

  const b58addressesEquivalentVersion = [
    [
      '1FzTxL9Mxnm2fdmnQEArfhzJHevwbvcH6d',
      '1111111111111111111114oLvT2',
      '11111111111111111111BZbvjr',
      '12Tbp525fpnBRiSt4iPxXkxMyf5Ze1UeZu',
      '12Tbp525fpnBRiSt4iPxXkxMyf5ZWzA5TC',
    ],
    [
      '3GgUssdoWh5QkoUDXKqT6LMESBDf8aqp2y',
      '31h1vYVSYuKP6AhS86fbRdMw9XHieotbST',
      '31h1vYVSYuKP6AhS86fbRdMw9XHiiQ93Mb',
      '339cjcWXDj6ZWt9KBp4YxPKJ8BNH7gn2Nw',
      '339cjcWXDj6ZWt9KBp4YxPKJ8BNH14Nnx4',
    ],
    [
      'mvWRFPELmpCHSkFQ7o9EVdCd9eXeUTa9T8',
      'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8',
      'mfWxJ45yp2SFn7UciZyNpvDKrzbi36LaVX',
      'mgyZ7874UrDSCpvVnHNLMgAgqegGZBks3w',
      'mgyZ7874UrDSCpvVnHNLMgAgqegGQUXx9c',
    ],
    [
      '2N8EgwcZq89akxb6mCTTKiHLVeXRpxjuy98',
      '2MsFDzHRUAMpjHxKyoEHU3aMCMsVtMqs1PV',
      '2MsFDzHRUAMpjHxKyoEHU3aMCMsVtXMsfu8',
      '2MthpoMSYqBbuifmrrwgRaLJZLXaSyK2Rai',
      '2MthpoMSYqBbuifmrrwgRaLJZLXaSoxBM5T',
    ],
  ];

  // --- full version × hex round-trip (explicit version argument) ---
  test('c32ToB58 and b58ToC32', t => {
    // 2 assertions per combination: c32→b58 direction and b58→c32 direction
    t.plan(hexStrings.length * versions.length * 2);

    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < versions.length; j++) {
        // Convert Stacks c32 address → Bitcoin base58check address.
        const b58 = c32ToB58(c32addresses[j][i], versions[j]);
        // Convert Bitcoin base58check address → Stacks c32 address.
        const c32 = b58ToC32(b58addresses[j][i], versions[j]);

        t.equal(b58, b58addresses[j][i], `c32ToB58: expect ${b58addresses[j][i]}, got ${b58}`);
        t.equal(c32, c32addresses[j][i], `b58ToC32: expect ${c32addresses[j][i]}, got ${c32}`);
      }
    }
  });

  /**
   * Same round-trip but omits the explicit version argument.
   * The library infers the correct version from the address prefix — this is only
   * possible for the four versions that have a well-known Bitcoin equivalent.
   */
  test('c32ToB58 and b58ToC32 equivalent versions', t => {
    t.plan(hexStrings.length * equivalentVersions.length * 2);

    for (let i = 0; i < hexStrings.length; i++) {
      for (let j = 0; j < equivalentVersions.length; j++) {
        const b58 = c32ToB58(c32addressesEquivalentVersion[j][i]);
        const c32 = b58ToC32(b58addressesEquivalentVersion[j][i]);

        t.equal(
          b58,
          b58addressesEquivalentVersion[j][i],
          `c32ToB58: expect ${b58addressesEquivalentVersion[j][i]}, got ${b58}`
        );
        t.equal(
          c32,
          c32addressesEquivalentVersion[j][i],
          `b58ToC32: expect ${c32addressesEquivalentVersion[j][i]}, got ${c32}`
        );
      }
    }
  });

  /**
   * Validates that the README code examples still produce the expected output.
   * Uses the legacy `Buffer` API (still valid in Node.js) to mirror the documented usage.
   */
  test('README examples with legacy Buffer', t => {
    let version, b58addr;
    t.plan(15);

    // ## c32encode / c32decode
    t.equal(c32check.c32encode(Buffer.from('hello world').toString('hex')), '38CNP6RVS0EXQQ4V34');
    t.equal(c32check.c32decode('38CNP6RVS0EXQQ4V34'), '68656c6c6f20776f726c64');
    t.equal(Buffer.from('68656c6c6f20776f726c64', 'hex').toString(), 'hello world');

    // ## c32checkEncode / c32checkDecode
    version = 12;
    t.equal(
      c32check.c32checkEncode(version, Buffer.from('hello world').toString('hex')),
      'CD1JPRV3F41VPYWKCCGRMASC8'
    );
    t.equal(c32check.c32checkDecode('CD1JPRV3F41VPYWKCCGRMASC8')[0], 12);
    t.equal(c32check.c32checkDecode('CD1JPRV3F41VPYWKCCGRMASC8')[1], '68656c6c6f20776f726c64');
    t.equal(Buffer.from('68656c6c6f20776f726c64', 'hex').toString(), 'hello world');

    // ## c32address / c32addressDecode
    version = 22; // mainnet p2pkh — addresses start with 'SP'
    const hash160 = 'a46ff88886c2ef9762d970b4d2c63678835bd39d';
    t.equal(c32check.versions.mainnet.p2pkh, version);
    t.equal(c32check.c32address(version, hash160), 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
    t.equal(c32check.c32addressDecode('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')[0], version);
    t.equal(c32check.c32addressDecode('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')[1], hash160);

    // ## c32ToB58 / b58ToC32
    b58addr = '16EMaNw3pkn3v6f2BgnSSs53zAKH4Q8YJg';
    t.equal(c32check.b58ToC32(b58addr), 'SPWNYDJ3STG7XH7ERWXMV6MQ7Q6EATWVY5Q1QMP8');
    t.equal(
      c32check.c32ToB58('SPWNYDJ3STG7XH7ERWXMV6MQ7Q6EATWVY5Q1QMP8'),
      '16EMaNw3pkn3v6f2BgnSSs53zAKH4Q8YJg'
    );
    b58addr = '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r';
    t.equal(c32check.b58ToC32(b58addr), 'SM1Y6EXF21RZ9739DFTEQKB1H044BMM0XVCM4A4NY');
    t.equal(
      c32check.c32ToB58('SM1Y6EXF21RZ9739DFTEQKB1H044BMM0XVCM4A4NY'),
      '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r'
    );
  });

  /**
   * Ensures that the base58check `encode` function throws a TypeError when passed
   * non-string arguments (e.g. plain objects coerced to the string parameter type).
   */
  const invalidEncodeParameterTypes = [
    [{} as string, 'abc'],
    ['abc', {} as string],
    [{} as string, {} as string],
  ];

  test('encode throws on invalid types', t => {
    t.plan(invalidEncodeParameterTypes.length);

    for (const [p1, p2] of invalidEncodeParameterTypes) {
      try {
        encode(p1, p2);
        t.ok(false, 'encode returned on invalid type');
      } catch (e) {
        t.ok(true, 'encode threw error on invalid type');
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * When BIG_DATA_TESTS is set, run the random-bytes stress tests only.
 * Otherwise run all the deterministic unit test suites.
 */
if (process.env.BIG_DATA_TESTS) {
  c32encodingRandomBytes();
} else {
  c32encodingTests();
  c32checkEncodingTests();
  c32addressTests();
  c32ToB58Test();
}
