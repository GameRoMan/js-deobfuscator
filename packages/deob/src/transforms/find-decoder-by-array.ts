import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";

import traverse from "@babel/traverse";

import type { ArrayRotator } from "../deobfuscate/array-rotator";

import { generate } from "../ast-utils";
import { Decoder } from "../deobfuscate/decoder";

export function findDecoderByArray(ast: t.Node, count: number = 100) {
  // Large arrays may be wrapped in functions.
  let stringArray:
    | {
        path: NodePath<t.Node>;
        references: NodePath[];
        name: string;
        length: number;
      }
    | undefined;
  const rotators: ArrayRotator[] = [];
  const decoders: Decoder[] = [];

  traverse(ast, {
    ArrayExpression(path) {
      if (path.node.elements.length >= count) {
        const stringArrayDeclaration = path.findParent(
          (p) =>
            p.isVariableDeclarator() ||
            p.isFunctionDeclaration() ||
            p.isExpressionStatement(),
        );

        if (!stringArrayDeclaration) return;

        // if (!stringArrayDeclaration?.parentPath?.isProgram())
        // return

        let stringArrayName = "";
        let stringArrayPath;
        if (stringArrayDeclaration.isVariableDeclarator()) {
          // var a = []
          stringArrayName = (stringArrayDeclaration.node.id as t.Identifier)
            .name;
          stringArrayPath = stringArrayDeclaration.parentPath;

          // It may be wrapped in another layer
          const parent = stringArrayPath.findParent((p) =>
            p.isFunctionDeclaration(),
          );
          if (parent && parent.isFunctionDeclaration()) {
            stringArrayName = parent.node.id!.name;
            stringArrayPath = parent;
          }
        } else if (stringArrayDeclaration.isFunctionDeclaration()) {
          // function a(){ return []}
          stringArrayName = (stringArrayDeclaration.node.id as t.Identifier)
            .name;
          stringArrayPath = stringArrayDeclaration;
        } else if (stringArrayDeclaration.isExpressionStatement()) {
          if (
            stringArrayDeclaration.node.expression.type ===
            "AssignmentExpression"
          ) {
            // a = []
            stringArrayName = (
              stringArrayDeclaration.node.expression.left as t.Identifier
            ).name;
            stringArrayPath = stringArrayDeclaration;
          }
        }

        const binding = path.scope.getBinding(stringArrayName);
        if (!binding) return;

        stringArray = {
          path: stringArrayPath!,
          references: binding.referencePaths,
          name: stringArrayName,
          length: path.node.elements.length,
        };

        // The code for array reordering and the decryption function were found by referencing these methods.
        binding.referencePaths.forEach((r) => {
          if (r.parentKey === "callee") {
            const parent = r.find((p) => p.isFunctionDeclaration());
            if (
              parent?.isFunctionDeclaration() &&
              parent.node.id!.name !== stringArrayName
            ) {
              // function decoder(x){
              //   return array(x)
              // }
              decoders.push(new Decoder(parent.node.id!.name, parent));
            }
          }

          if (r.parentKey === "object") {
            const parent = r.find((p) => p.isFunctionDeclaration());
            if (parent?.isFunctionDeclaration()) {
              // function decoder(x){
              //   return array[x]
              // }
              decoders.push(new Decoder(parent.node.id!.name, parent));
            }
          }

          if (r.parentKey === "arguments") {
            const parent = r.parentPath;
            const parent_expression = parent?.findParent((p) =>
              p.isExpressionStatement(),
            );
            if (parent_expression?.isExpressionStatement()) {
              // (function (h) {
              //     // ...
              // })(array)
              rotators.push(parent_expression);
              return;
            }

            if (parent?.parentPath?.isVariableDeclarator()) {
              // function decoder() {
              //  var a = xxx(array)
              // }
              const funcDeclaration = parent?.parentPath.findParent((p) =>
                p.isFunctionDeclaration(),
              );
              if (funcDeclaration?.isFunctionDeclaration()) {
                decoders.push(
                  new Decoder(funcDeclaration.node.id!.name, funcDeclaration),
                );
              }
            }
          }
        });
      }

      path.skip();
    },
  });

  const generateOptions = {
    compact: true,
    shouldPrintComment: () => false,
  };
  const stringArrayCode = stringArray
    ? generate(stringArray.path.node, generateOptions)
    : "";
  const rotatorCode = rotators
    .map((rotator) => generate(rotator.node, generateOptions))
    .join(";\n");
  const decoderCode = decoders
    .map((decoder) => generate(decoder.path.node, generateOptions))
    .join(";\n");

  const setupCode = [stringArrayCode, rotatorCode, decoderCode].join(";\n");

  return {
    stringArray,
    rotators,
    decoders,
    setupCode,
  };
}
