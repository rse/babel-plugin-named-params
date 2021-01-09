/*
**  babel-plugin-named-params -- Babel Plugin for Named Function Parameters
**  Copyright (c) 2018-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  the export Babel plugin  */
const plugin = (babel, options) => {
    /*  determine plugin options  */
    options = Object.assign({
        moduleName:   "babel-runtime-named-params",
        functionName: "__babelRuntimeNamedParams",
        options:      true,
        caching:      true
    }, options)

    /*  return the plugin configuration  */
    return {
        /*  the AST visitors  */
        visitor: {
            /*  visit the Program node (the top-level scope)  */
            Program: {
                enter (path, { file }) {
                    file.set("namedParamsNeedTransformFunction", false)
                },
                exit (path, { file }) {
                    /*  act only if we have to provide the transform function  */
                    if (!(file.get("namedParamsNeedTransformFunction")))
                        return

                    /*  insert a require() statement for providing the transform function  */
                    path.node.body.unshift(
                        babel.types.variableDeclaration(
                            "var",
                            [
                                babel.types.variableDeclarator(
                                    babel.types.identifier(options.functionName),
                                    babel.types.callExpression(
                                        babel.types.identifier("require"),
                                        [
                                            babel.types.stringLiteral(options.moduleName)
                                        ]
                                    )
                                )
                            ]
                        )
                    )
                }
            },

            /*  visit the CallExpression nodes (all function calls)  */
            CallExpression (path, { file }) {
                /*  determine types of parameters  */
                const pp = []
                const np = []
                path.get("arguments").forEach((path) => {
                    if (path.isAssignmentExpression() && path.get("left").isIdentifier()) {
                        /*  assignment expression with an identifier (treated as a named parameter)  */
                        const name = path.get("left").node.name
                        if (np.findIndex((p) => p.get("left").isIdentifier({ name: name })) >= 0)
                            throw path.buildCodeFrameError(`named parameter "${name}" occurs multiple times`)
                        np.push(path)
                    }
                    else {
                        /*  other expression  */
                        pp.push(path)
                    }
                })

                /*  short-circuit processing if there are no named parameters  */
                if (np.length === 0)
                    return

                /*  replace the CallExpression with a new one  */
                let opts = []
                if (!options.options || !options.caching) {
                    if (!options.options)
                        opts.push(babel.types.objectProperty(
                            babel.types.identifier("options"),
                            babel.types.booleanLiteral(false)))
                    if (!options.caching)
                        opts.push(babel.types.objectProperty(
                            babel.types.identifier("caching"),
                            babel.types.booleanLiteral(false)))
                    opts = [babel.types.objectExpression(opts)]
                }
                path.replaceWith(
                    babel.types.callExpression(
                        /*  the transform function name  */
                        babel.types.identifier(options.functionName),
                        [
                            /*  the previous context or undefined  */
                            path.get("callee").isMemberExpression() ?
                                path.node.callee.object :
                                babel.types.identifier("undefined"),

                            /*  the previous callee  */
                            path.node.callee,

                            /*  the positional parameters  */
                            babel.types.arrayExpression(
                                pp.map((path) => {
                                    return path.node
                                })
                            ),

                            /*  the named parameters  */
                            babel.types.objectExpression(
                                np.map((path) => {
                                    return babel.types.objectProperty(
                                        path.get("left").node,
                                        path.get("right").node
                                    )
                                })
                            )
                        ].concat(opts)
                    )
                )

                /*  remember that we need the transform function  */
                file.set("namedParamsNeedTransformFunction", true)
            }
        }
    }
}

/*  export the Babel plugin  */
module.exports = plugin

