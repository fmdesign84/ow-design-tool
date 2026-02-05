/**
 * PNG Chunks 라이브러리 타입 선언
 */

declare module 'png-chunks-extract' {
  interface PngChunk {
    name: string;
    data: Uint8Array;
  }

  function extract(buffer: Uint8Array): PngChunk[];
  export = extract;
}

declare module 'png-chunks-encode' {
  interface PngChunk {
    name: string;
    data: Uint8Array;
  }

  function encode(chunks: PngChunk[]): Uint8Array;
  export = encode;
}

declare module 'png-chunk-text' {
  interface TextChunk {
    keyword: string;
    text: string;
  }

  interface ChunkData {
    name: string;
    data: Uint8Array;
  }

  export function encode(chunk: TextChunk): ChunkData;
  export function decode(data: Uint8Array): TextChunk;
}
