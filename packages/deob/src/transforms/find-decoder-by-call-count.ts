import type * as t from "@babel/types";

import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

import { generate } from "../ast-utils";
import { Decoder } from "../deobfuscate/decoder";

/**
 * Find the decoder by the number of times it was called.
 * @param {number} count Decoder function call count
 * @returns {string} decoder code
 */
export function findDecoderByCallCount(ast: t.File, count = 100) {
  let index = 0; // The index of the last decryption function statement

  const decoders: Decoder[] = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.parentPath.isProgram()) {
        const fnName = path.node.id!.name;

        const binding = path.scope.getBinding(fnName);

        if (!binding) return;

        // Citation count
        if (binding.referencePaths.length >= count) {
          decoders.push(new Decoder(fnName, path));

          const body = (path.parentPath!.scope.block as t.Program).body;

          // TODO: Find the disorder function and string array using the decoder.
          for (let i = 0; i < body.length; i++) {
            const statement = body[i];
            if (statement.start === path.node.start) {
              index = i + 1;
            }
          }
        }
      }
    },
    // If var-functions have already been executed, there is no need to iterate over FunctionExpression.
    // FunctionExpression(path) {
    //   if (path.parentKey === 'init' && path.parentPath.type === 'VariableDeclarator') {
    //     const variableDeclarationPath = path.findParent(p => p.isVariableDeclaration())
    //     if (variableDeclarationPath && variableDeclarationPath.parentPath?.isProgram())
    //       processFunction(path)
    //   }
    // },
  });

  const generateOptions = {
    compact: true,
    shouldPrintComment: () => false,
  };

  const newAst = parser.parse("");
  newAst.program.body = ast.program.body.slice(0, index);
  const setupCode = generate(newAst, generateOptions);

  // TODO:
  // stringArray rotators

  return {
    setupCode,
    decoders,
  };
}
