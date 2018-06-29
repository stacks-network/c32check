# z32check

[z-base-32](https://en.wikipedia.org/wiki/Base32#z-base-32) encoding library
with 4-byte checksum.

This library is meant for generating and decoding Stacks addresses on the
Blockstack blockchain.

## How it works

Each z32check string encodes a 1-byte version and a 4-byte checksum.  When
decoded as a hex string, the wire format looks like this:

```
0      1                             n+1             n+5
|------|-----------------------------|---------------|
version     n-byte hex payload          4-byte hash
```

If `version` is the version byte (a 1-byte `number`) and `payload` is the raw 
bytes (e.g. as a `string`), then the `checksum` is calculated as follows:

```
checksum = sha256(sha256(version + payload)).substring(0,4)
```

In other words, the checksum is the first four bytes of the
double-sha256 of the bytestring concatenation of the `version` and `payload`.
This is similar to base58check encoding, for example.

## z32 Addresses

Specific to Blockstack, the Stacks blockchain uses z32-encoded public key
hashes as addresses.  Specifically, a **z32 address** is a z32-encoded
ripemd160 hash, where the first character is capitalized (note that the 
z-base-32 alphabet does _not_ have capital letters).

# Examples

```
> z32 = require('z32check')
{ z32encode: [Function: z32encode],
  z32decode: [Function: z32decode],
  z32checkEncode: [Function: z32checkEncode],
  z32checkDecode: [Function: z32checkDecode],
  z32address: [Function: z32address],
  z32addressDecode: [Function: z32addressDecode],
  versions: 
   { mainnet: { p2pkh: 22, p2sh: 11 },
     testnet: { p2pkh: 17, p2sh: 2 } } }
```

## z32encode, z32decode

```
> z32check.z32encode(Buffer.from('hello world').toString('hex'))
'decisga53yq7zzr5dr'
> z32check.z32decode('decisga53yq7zzr5dr')
'68656c6c6f20776f726c64'
> Buffer.from('68656c6c6f20776f726c64', 'hex').toString()
'hello world'
```

## z32checkEncode, z32checkDecode

```
> version = 12
12
> z32check.z32checkEncode(version, Buffer.from('hello world').toString('hex'))
'cpb1sa5dxrb5s6huccoawk3ce'
> z32check.z32checkDecode('cpb1sa5dxrb5s6huccoawk3ce')
[ 12, '68656c6c6f20776f726c64' ] 
> Buffer.from('68656c6c6f20776f726c64', 'hex').toString()
'hello world'
```

# z32address, z32addressDecode

**NOTE**: these methods only work on ripemd160 hashes

```
> hash160 = 'a46ff88886c2ef9762d970b4d2c63678835bd39d'
'a46ff88886c2ef9762d970b4d2c63678835bd39d'
> version = z32check.versions.mainnet.p2pkh
22
> z32check.z32address(version, hash160)
'Sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18'
> z32check.z32addressDecode('Sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18')
[ 22, 'a46ff88886c2ef9762d970b4d2c63678835bd39d' ]
```
