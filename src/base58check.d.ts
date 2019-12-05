declare module 'base58check' {
    export function encode(data: string | Buffer, prefix?: string, encoding?: string): string;
    export function decode(string: string): { prefix: Buffer; data: Buffer; };
    export function decode(string: string, encoding: string): { prefix: string; data: string; };
}