
const f1 = (a, b, c = "foo", d = "bar") => {
    console.log(`a=<${a}> b=<${b}> c=<${c}> d=<${d}>`)
}
f1(1, 2, 3, 4)
f1(1, 2, d = "4", 3)
f1(1, 2, d = "4", c = "3")
f1(a = "1", 2, c = "3", d = "4")

const f2 = (a, b, options = {}) => {
    console.log(`a=<${a}> b=<${b}> options=<${JSON.stringify(options)}>`)
}
f2(1, 2)
f2(1, 2, { foo: "bar", baz: "quux" })
f2(1, 2, options = { foo: "bar", baz: "quux" })
f2(1, 2, foo = "bar", baz = "quux")
f2(1, 2, baz = "quux", options = { foo: "bar" })

