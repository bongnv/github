"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _state = _interopRequireDefault(require("./state"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The package is being cleaned up or the context is being disposed some other way.
 */
class Destroyed extends _state.default {
  start() {
    this.didDestroy();
    this.repository.git.destroy && this.repository.git.destroy();
    this.repository.emitter.dispose();
  }

  isDestroyed() {
    return true;
  }

  destroy() {// No-op to destroy twice
  }

}

exports.default = Destroyed;

_state.default.register(Destroyed);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvZGVzdHJveWVkLmpzIl0sIm5hbWVzIjpbIkRlc3Ryb3llZCIsIlN0YXRlIiwic3RhcnQiLCJkaWREZXN0cm95IiwicmVwb3NpdG9yeSIsImdpdCIsImRlc3Ryb3kiLCJlbWl0dGVyIiwiZGlzcG9zZSIsImlzRGVzdHJveWVkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUVBOzs7QUFHZSxNQUFNQSxTQUFOLFNBQXdCQyxjQUF4QixDQUE4QjtBQUMzQ0MsRUFBQUEsS0FBSyxHQUFHO0FBQ04sU0FBS0MsVUFBTDtBQUNBLFNBQUtDLFVBQUwsQ0FBZ0JDLEdBQWhCLENBQW9CQyxPQUFwQixJQUErQixLQUFLRixVQUFMLENBQWdCQyxHQUFoQixDQUFvQkMsT0FBcEIsRUFBL0I7QUFDQSxTQUFLRixVQUFMLENBQWdCRyxPQUFoQixDQUF3QkMsT0FBeEI7QUFDRDs7QUFFREMsRUFBQUEsV0FBVyxHQUFHO0FBQ1osV0FBTyxJQUFQO0FBQ0Q7O0FBRURILEVBQUFBLE9BQU8sR0FBRyxDQUNSO0FBQ0Q7O0FBYjBDOzs7O0FBZ0I3Q0wsZUFBTVMsUUFBTixDQUFlVixTQUFmIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFN0YXRlIGZyb20gJy4vc3RhdGUnO1xuXG4vKipcbiAqIFRoZSBwYWNrYWdlIGlzIGJlaW5nIGNsZWFuZWQgdXAgb3IgdGhlIGNvbnRleHQgaXMgYmVpbmcgZGlzcG9zZWQgc29tZSBvdGhlciB3YXkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc3Ryb3llZCBleHRlbmRzIFN0YXRlIHtcbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5kaWREZXN0cm95KCk7XG4gICAgdGhpcy5yZXBvc2l0b3J5LmdpdC5kZXN0cm95ICYmIHRoaXMucmVwb3NpdG9yeS5naXQuZGVzdHJveSgpO1xuICAgIHRoaXMucmVwb3NpdG9yeS5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGlzRGVzdHJveWVkKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICAvLyBOby1vcCB0byBkZXN0cm95IHR3aWNlXG4gIH1cbn1cblxuU3RhdGUucmVnaXN0ZXIoRGVzdHJveWVkKTtcbiJdfQ==