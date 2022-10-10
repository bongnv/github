"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _state = _interopRequireDefault(require("./state"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * No working directory is available in the workspace.
 */
class Absent extends _state.default {
  isAbsent() {
    return true;
  }

  showGitTabInit() {
    return true;
  }

  hasDirectory() {
    return false;
  }

}

exports.default = Absent;

_state.default.register(Absent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvYWJzZW50LmpzIl0sIm5hbWVzIjpbIkFic2VudCIsIlN0YXRlIiwiaXNBYnNlbnQiLCJzaG93R2l0VGFiSW5pdCIsImhhc0RpcmVjdG9yeSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFFQTs7O0FBR2UsTUFBTUEsTUFBTixTQUFxQkMsY0FBckIsQ0FBMkI7QUFDeENDLEVBQUFBLFFBQVEsR0FBRztBQUNULFdBQU8sSUFBUDtBQUNEOztBQUVEQyxFQUFBQSxjQUFjLEdBQUc7QUFDZixXQUFPLElBQVA7QUFDRDs7QUFFREMsRUFBQUEsWUFBWSxHQUFHO0FBQ2IsV0FBTyxLQUFQO0FBQ0Q7O0FBWHVDOzs7O0FBYzFDSCxlQUFNSSxRQUFOLENBQWVMLE1BQWYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3RhdGUgZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogTm8gd29ya2luZyBkaXJlY3RvcnkgaXMgYXZhaWxhYmxlIGluIHRoZSB3b3Jrc3BhY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic2VudCBleHRlbmRzIFN0YXRlIHtcbiAgaXNBYnNlbnQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzaG93R2l0VGFiSW5pdCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGhhc0RpcmVjdG9yeSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuU3RhdGUucmVnaXN0ZXIoQWJzZW50KTtcbiJdfQ==