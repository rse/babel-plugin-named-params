
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

const f3 = (arg1, arg2, options) => {
    let { opt1, opt2 } = { opt1: "def1", opt2: "def2", ...options }
    console.log(arg1, arg2, opt1, opt2)
}
f3("val1", "val2", { opt1: "val3", opt2: "val4" })
f3("val1", "val2", opt1 = "val3", opt2 = "val4")

const f4 = (arg1, arg2, opt1 = "def1", opt2 = "def2") => {
    console.log(arg1, arg2, opt1, opt2)
}
f4("val1", "val2", opt1 = "val3", opt2 = "val4")

