// src/types/json2csv.d.ts
declare module 'json2csv' {
    export class Parser<T = any> {
      constructor(opts?: any);
      parse(input: T[]): string;
    }
  }
  