import { parse } from "@babel/parser";
import type { Assertion } from "vitest";
import { expect } from "vitest";
import type { Transform } from "../src/ast-utils";
import { applyTransform } from "../src/ast-utils";

export function testTransform<Options>(
  transform: Transform<Options>,
): (input: string, options?: Options) => Assertion<ReturnType<typeof expect>> {
  return (input, options) => {
    const ast = parse(input, {
      sourceType: "unambiguous",
      allowReturnOutsideFunction: true,
    });
    applyTransform(ast, transform, options);
    return expect(ast);
  };
}
