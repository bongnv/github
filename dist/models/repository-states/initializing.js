"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _state = _interopRequireDefault(require("./state"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Git is asynchronously initializing a new repository in this working directory.
 */
class Initializing extends _state.default {
  async start() {
    await this.doInit(this.workdir());
    await this.transitionTo('Loading');
  }

  showGitTabLoading() {
    return true;
  }

  directInit(workdir) {
    return this.git().init(workdir);
  }

}

exports.default = Initializing;

_state.default.register(Initializing);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvaW5pdGlhbGl6aW5nLmpzIl0sIm5hbWVzIjpbIkluaXRpYWxpemluZyIsIlN0YXRlIiwic3RhcnQiLCJkb0luaXQiLCJ3b3JrZGlyIiwidHJhbnNpdGlvblRvIiwic2hvd0dpdFRhYkxvYWRpbmciLCJkaXJlY3RJbml0IiwiZ2l0IiwiaW5pdCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFFQTs7O0FBR2UsTUFBTUEsWUFBTixTQUEyQkMsY0FBM0IsQ0FBaUM7QUFDOUMsUUFBTUMsS0FBTixHQUFjO0FBQ1osVUFBTSxLQUFLQyxNQUFMLENBQVksS0FBS0MsT0FBTCxFQUFaLENBQU47QUFFQSxVQUFNLEtBQUtDLFlBQUwsQ0FBa0IsU0FBbEIsQ0FBTjtBQUNEOztBQUVEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixXQUFPLElBQVA7QUFDRDs7QUFFREMsRUFBQUEsVUFBVSxDQUFDSCxPQUFELEVBQVU7QUFDbEIsV0FBTyxLQUFLSSxHQUFMLEdBQVdDLElBQVgsQ0FBZ0JMLE9BQWhCLENBQVA7QUFDRDs7QUFiNkM7Ozs7QUFnQmhESCxlQUFNUyxRQUFOLENBQWVWLFlBQWYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3RhdGUgZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogR2l0IGlzIGFzeW5jaHJvbm91c2x5IGluaXRpYWxpemluZyBhIG5ldyByZXBvc2l0b3J5IGluIHRoaXMgd29ya2luZyBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluaXRpYWxpemluZyBleHRlbmRzIFN0YXRlIHtcbiAgYXN5bmMgc3RhcnQoKSB7XG4gICAgYXdhaXQgdGhpcy5kb0luaXQodGhpcy53b3JrZGlyKCkpO1xuXG4gICAgYXdhaXQgdGhpcy50cmFuc2l0aW9uVG8oJ0xvYWRpbmcnKTtcbiAgfVxuXG4gIHNob3dHaXRUYWJMb2FkaW5nKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGlyZWN0SW5pdCh3b3JrZGlyKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2l0KCkuaW5pdCh3b3JrZGlyKTtcbiAgfVxufVxuXG5TdGF0ZS5yZWdpc3RlcihJbml0aWFsaXppbmcpO1xuIl19