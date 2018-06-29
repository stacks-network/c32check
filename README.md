# c32check

[Crockford base-32](https://en.wikipedia.org/wiki/Base32#Crockford's_Base32) encoding library
with 4-byte checksum.

This library is meant for generating and decoding Stacks addresses on the
Blockstack blockchain.

## How it works

Each c32check string encodes a 1-byte version and a 4-byte checksum.  When
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

## c32 Addresses

Specific to Blockstack, the Stacks blockchain uses c32-encoded public key
hashes as addresses.  Specifically, a **c32check address** is a c32check-encoded
ripemd160 hash.

# Examples

```
> c32 = require('c32check')
{ c32encode: [Function: c32encode],
  c32decode: [Function: c32decode],
  c32checkEncode: [Function: c32checkEncode],
  c32checkDecode: [Function: c32checkDecode],
  c32address: [Function: c32address],
  c32addressDecode: [Function: c32addressDecode],
  versions: 
   { mainnet: { p2pkh: 22, p2sh: 11 },
     testnet: { p2pkh: 17, p2sh: 2 } } }
```

## c32encode, c32decode

```
> c32check.c32encode(Buffer.from('hello world').toString('hex'))
'decisga53yq7zzr5dr'
> c32check.c32decode('decisga53yq7zzr5dr')
'68656c6c6f20776f726c64'
> Buffer.from('68656c6c6f20776f726c64', 'hex').toString()
'hello world'
```

## c32checkEncode, c32checkDecode

```
> version = 12
12
> c32check.c32checkEncode(version, Buffer.from('hello world').toString('hex'))
'cpb1sa5dxrb5s6huccoawk3ce'
> c32check.c32checkDecode('cpb1sa5dxrb5s6huccoawk3ce')
[ 12, '68656c6c6f20776f726c64' ] 
> Buffer.from('68656c6c6f20776f726c64', 'hex').toString()
'hello world'
```

# c32address, c32addressDecode

**NOTE**: these methods only work on ripemd160 hashes

```
> hash160 = 'a46ff88886c2ef9762d970b4d2c63678835bd39d'
'a46ff88886c2ef9762d970b4d2c63678835bd39d'
> version = c32check.versions.mainnet.p2pkh
22
> c32check.c32address(version, hash160)
'Sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18'
> c32check.c32addressDecode('Sn1g96reo5bq9f5n5famjwsgg3hegs6uuia5jq18')
[ 22, 'a46ff88886c2ef9762d970b4d2c63678835bd39d' ]
```
