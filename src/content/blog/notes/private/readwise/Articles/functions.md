---
title: "Functions"
author: eloquentjavascript.net
url: https://eloquentjavascript.net/03_functions.html
---

> A function definition is a regular binding where the value of the binding is a function.


> A function binding usually simply acts as a name for a specific piece of the program. Such a binding is defined once and never changed. This makes it easy to confuse the function and its name.
>  [](https://eloquentjavascript.net/03_functions.html#p-GmVFAjNN+C)But the two are different. A function value can do all the things that other values can do—you can use it in arbitrary expressions, not just call it. It is possible to store a function value in a new binding, pass it as an argument to a function, and so on. Similarly, a binding that holds a function is still just a regular binding and can, if not constant, be assigned a new value, like so:
>  [](https://eloquentjavascript.net/03_functions.html#c-SZ7MmN0oGC)let launchMissiles = function() {
>  missileSystem.launch("now");
>  };
>  if (safeMode) {
>  launchMissiles = function() {/* do nothing */};
>  }


> a function has to jump back to the place that called it when it returns,


> Worrying about efficiency can be a distraction. It’s yet another factor that complicates program design, and when you’re doing something that’s already difficult, that extra thing to worry about can be paralyzing.
>  Therefore, you should generally start by writing something that’s correct and easy to understand. If you’re worried that it’s too slow—which it usually isn’t, since most code simply isn’t executed often enough to take any significant amount of time—you can measure afterward and improve it if necessary.


> A useful principle is to refrain from adding cleverness unless you are absolutely sure you’re going to need it. It can be tempting to write general “frameworks” for every bit of functionality you come across. Resist that urge. You won’t get any real work done—you’ll be too busy writing code that you never use.


> A `return` statement determines the value the function returns. When control comes across such a statement, it immediately jumps out of the current function and gives the returned value to the code that called the function.


> Each scope can “look out” into the scope around it, so `x` is visible inside the block in the example. The exception is when multiple bindings have the same name—in that case, code can see only the innermost one. For example, when the code inside the `halve` function refers to `n`, it is seeing its *own* `n`, not the global `n`.


> The preceding code works, even though the function is defined *below* the code that uses it. Function declarations are not part of the regular top-to-bottom flow of control. They are conceptually moved to the top of their scope and can be used by all the code in that scope. This is sometimes useful because it offers the freedom to order code in a way that seems the clearest, without worrying about having to define all functions before they are used.



