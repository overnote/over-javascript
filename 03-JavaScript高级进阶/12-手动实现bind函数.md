
## 手动实现bind函数

```js
//实现一个bind函数
Function.prototype.bind = Function.prototype.bind || function(context){
  var me = this;
  var args = Array.prototype.slice.call(arguments,1);
  return function bound(){
    var innerArgs = Array.prototype.slice.call(arguments);
    var finalArgs = args.concat(innerArgs);
    return me.apply(context,finalArgs);
  }
}
```
