var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var InvalidDateError = /** @class */ (function (_super) {
    __extends(InvalidDateError, _super);
    function InvalidDateError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidDateError;
}(RangeError));
var OverTimeDateError = /** @class */ (function (_super) {
    __extends(OverTimeDateError, _super);
    function OverTimeDateError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OverTimeDateError;
}(RangeError));
function getDate(date) {
    var d = new Date(date);
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return [];
    }
    return [d];
}
function test() {
    var date = getDate('hh');
    date.map(function (item) {
        item.toString();
    }).forEach(function (item) {
        console.log('Date is: ', item);
    });
}
test();
