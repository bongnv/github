"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = _interopRequireDefault(require("os"));

var _helpers = require("./helpers");

var _asyncQueue = _interopRequireDefault(require("./async-queue"));

var _gitShellOutStrategy = _interopRequireDefault(require("./git-shell-out-strategy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  create(workingDir, options = {}) {
    return this.withStrategies([_gitShellOutStrategy.default])(workingDir, options);
  },

  withStrategies(strategies) {
    return function createForStrategies(workingDir, options = {}) {
      const parallelism = options.parallelism || Math.max(3, _os.default.cpus().length);
      const commandQueue = new _asyncQueue.default({
        parallelism
      });

      const strategyOptions = _objectSpread2({}, options, {
        queue: commandQueue
      });

      const strategyInstances = strategies.map(Strategy => new Strategy(workingDir, strategyOptions));
      return (0, _helpers.firstImplementer)(...strategyInstances);
    };
  }

};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9jb21wb3NpdGUtZ2l0LXN0cmF0ZWd5LmpzIl0sIm5hbWVzIjpbImNyZWF0ZSIsIndvcmtpbmdEaXIiLCJvcHRpb25zIiwid2l0aFN0cmF0ZWdpZXMiLCJHaXRTaGVsbE91dFN0cmF0ZWd5Iiwic3RyYXRlZ2llcyIsImNyZWF0ZUZvclN0cmF0ZWdpZXMiLCJwYXJhbGxlbGlzbSIsIk1hdGgiLCJtYXgiLCJvcyIsImNwdXMiLCJsZW5ndGgiLCJjb21tYW5kUXVldWUiLCJBc3luY1F1ZXVlIiwic3RyYXRlZ3lPcHRpb25zIiwicXVldWUiLCJzdHJhdGVneUluc3RhbmNlcyIsIm1hcCIsIlN0cmF0ZWd5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O2VBRWU7QUFDYkEsRUFBQUEsTUFBTSxDQUFDQyxVQUFELEVBQWFDLE9BQU8sR0FBRyxFQUF2QixFQUEyQjtBQUMvQixXQUFPLEtBQUtDLGNBQUwsQ0FBb0IsQ0FBQ0MsNEJBQUQsQ0FBcEIsRUFBMkNILFVBQTNDLEVBQXVEQyxPQUF2RCxDQUFQO0FBQ0QsR0FIWTs7QUFLYkMsRUFBQUEsY0FBYyxDQUFDRSxVQUFELEVBQWE7QUFDekIsV0FBTyxTQUFTQyxtQkFBVCxDQUE2QkwsVUFBN0IsRUFBeUNDLE9BQU8sR0FBRyxFQUFuRCxFQUF1RDtBQUM1RCxZQUFNSyxXQUFXLEdBQUdMLE9BQU8sQ0FBQ0ssV0FBUixJQUF1QkMsSUFBSSxDQUFDQyxHQUFMLENBQVMsQ0FBVCxFQUFZQyxZQUFHQyxJQUFILEdBQVVDLE1BQXRCLENBQTNDO0FBQ0EsWUFBTUMsWUFBWSxHQUFHLElBQUlDLG1CQUFKLENBQWU7QUFBQ1AsUUFBQUE7QUFBRCxPQUFmLENBQXJCOztBQUNBLFlBQU1RLGVBQWUsc0JBQU9iLE9BQVA7QUFBZ0JjLFFBQUFBLEtBQUssRUFBRUg7QUFBdkIsUUFBckI7O0FBRUEsWUFBTUksaUJBQWlCLEdBQUdaLFVBQVUsQ0FBQ2EsR0FBWCxDQUFlQyxRQUFRLElBQUksSUFBSUEsUUFBSixDQUFhbEIsVUFBYixFQUF5QmMsZUFBekIsQ0FBM0IsQ0FBMUI7QUFDQSxhQUFPLCtCQUFpQixHQUFHRSxpQkFBcEIsQ0FBUDtBQUNELEtBUEQ7QUFRRDs7QUFkWSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG9zIGZyb20gJ29zJztcblxuaW1wb3J0IHtmaXJzdEltcGxlbWVudGVyfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IEFzeW5jUXVldWUgZnJvbSAnLi9hc3luYy1xdWV1ZSc7XG5pbXBvcnQgR2l0U2hlbGxPdXRTdHJhdGVneSBmcm9tICcuL2dpdC1zaGVsbC1vdXQtc3RyYXRlZ3knO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNyZWF0ZSh3b3JraW5nRGlyLCBvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gdGhpcy53aXRoU3RyYXRlZ2llcyhbR2l0U2hlbGxPdXRTdHJhdGVneV0pKHdvcmtpbmdEaXIsIG9wdGlvbnMpO1xuICB9LFxuXG4gIHdpdGhTdHJhdGVnaWVzKHN0cmF0ZWdpZXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlRm9yU3RyYXRlZ2llcyh3b3JraW5nRGlyLCBvcHRpb25zID0ge30pIHtcbiAgICAgIGNvbnN0IHBhcmFsbGVsaXNtID0gb3B0aW9ucy5wYXJhbGxlbGlzbSB8fCBNYXRoLm1heCgzLCBvcy5jcHVzKCkubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGNvbW1hbmRRdWV1ZSA9IG5ldyBBc3luY1F1ZXVlKHtwYXJhbGxlbGlzbX0pO1xuICAgICAgY29uc3Qgc3RyYXRlZ3lPcHRpb25zID0gey4uLm9wdGlvbnMsIHF1ZXVlOiBjb21tYW5kUXVldWV9O1xuXG4gICAgICBjb25zdCBzdHJhdGVneUluc3RhbmNlcyA9IHN0cmF0ZWdpZXMubWFwKFN0cmF0ZWd5ID0+IG5ldyBTdHJhdGVneSh3b3JraW5nRGlyLCBzdHJhdGVneU9wdGlvbnMpKTtcbiAgICAgIHJldHVybiBmaXJzdEltcGxlbWVudGVyKC4uLnN0cmF0ZWd5SW5zdGFuY2VzKTtcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==