"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _state = _interopRequireDefault(require("./state"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The repository is too large for Atom to handle
 */
class TooLarge extends _state.default {
  isTooLarge() {
    return true;
  }

}

exports.default = TooLarge;

_state.default.register(TooLarge);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvdG9vLWxhcmdlLmpzIl0sIm5hbWVzIjpbIlRvb0xhcmdlIiwiU3RhdGUiLCJpc1Rvb0xhcmdlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUVBOzs7QUFHZSxNQUFNQSxRQUFOLFNBQXVCQyxjQUF2QixDQUE2QjtBQUMxQ0MsRUFBQUEsVUFBVSxHQUFHO0FBQ1gsV0FBTyxJQUFQO0FBQ0Q7O0FBSHlDOzs7O0FBTTVDRCxlQUFNRSxRQUFOLENBQWVILFFBQWYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3RhdGUgZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogVGhlIHJlcG9zaXRvcnkgaXMgdG9vIGxhcmdlIGZvciBBdG9tIHRvIGhhbmRsZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb29MYXJnZSBleHRlbmRzIFN0YXRlIHtcbiAgaXNUb29MYXJnZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5TdGF0ZS5yZWdpc3RlcihUb29MYXJnZSk7XG4iXX0=