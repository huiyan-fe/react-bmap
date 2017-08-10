
/**
 * 判断是否为字符串
 * @param {String} 判断对象
 * @return {Boolean}
 */
export const isString = function (str) {
    return Object.prototype.toString.call(str) === "[object String]";
};
