"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _state = _interopRequireDefault(require("./state"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The working directory exists, but contains no git repository yet.
 */
class Empty extends _state.default {
  isEmpty() {
    return true;
  }

  init() {
    return this.transitionTo('Initializing');
  }

  clone(remoteUrl, sourceRemoteName) {
    return this.transitionTo('Cloning', remoteUrl, sourceRemoteName);
  }

  showGitTabInit() {
    return true;
  }

}

exports.default = Empty;

_state.default.register(Empty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvZW1wdHkuanMiXSwibmFtZXMiOlsiRW1wdHkiLCJTdGF0ZSIsImlzRW1wdHkiLCJpbml0IiwidHJhbnNpdGlvblRvIiwiY2xvbmUiLCJyZW1vdGVVcmwiLCJzb3VyY2VSZW1vdGVOYW1lIiwic2hvd0dpdFRhYkluaXQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBRUE7OztBQUdlLE1BQU1BLEtBQU4sU0FBb0JDLGNBQXBCLENBQTBCO0FBQ3ZDQyxFQUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLElBQVA7QUFDRDs7QUFFREMsRUFBQUEsSUFBSSxHQUFHO0FBQ0wsV0FBTyxLQUFLQyxZQUFMLENBQWtCLGNBQWxCLENBQVA7QUFDRDs7QUFFREMsRUFBQUEsS0FBSyxDQUFDQyxTQUFELEVBQVlDLGdCQUFaLEVBQThCO0FBQ2pDLFdBQU8sS0FBS0gsWUFBTCxDQUFrQixTQUFsQixFQUE2QkUsU0FBN0IsRUFBd0NDLGdCQUF4QyxDQUFQO0FBQ0Q7O0FBRURDLEVBQUFBLGNBQWMsR0FBRztBQUNmLFdBQU8sSUFBUDtBQUNEOztBQWZzQzs7OztBQWtCekNQLGVBQU1RLFFBQU4sQ0FBZVQsS0FBZiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdGF0ZSBmcm9tICcuL3N0YXRlJztcblxuLyoqXG4gKiBUaGUgd29ya2luZyBkaXJlY3RvcnkgZXhpc3RzLCBidXQgY29udGFpbnMgbm8gZ2l0IHJlcG9zaXRvcnkgeWV0LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbXB0eSBleHRlbmRzIFN0YXRlIHtcbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvblRvKCdJbml0aWFsaXppbmcnKTtcbiAgfVxuXG4gIGNsb25lKHJlbW90ZVVybCwgc291cmNlUmVtb3RlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25UbygnQ2xvbmluZycsIHJlbW90ZVVybCwgc291cmNlUmVtb3RlTmFtZSk7XG4gIH1cblxuICBzaG93R2l0VGFiSW5pdCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5TdGF0ZS5yZWdpc3RlcihFbXB0eSk7XG4iXX0=