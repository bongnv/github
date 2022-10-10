"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BareCheckSuitesAccumulator = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _eventKit = require("event-kit");

var _helpers = require("../../helpers");

var _propTypes2 = require("../../prop-types");

var _checkRunsAccumulator = _interopRequireDefault(require("./check-runs-accumulator"));

var _accumulator = _interopRequireDefault(require("./accumulator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BareCheckSuitesAccumulator extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderCheckSuites", (err, suites, loading) => {
      if (err) {
        return this.props.children({
          errors: [err],
          suites,
          runsBySuite: new Map(),
          loading
        });
      }

      return this.renderCheckSuite({
        errors: [],
        suites,
        runsBySuite: new Map(),
        loading
      }, suites);
    });
  }

  render() {
    const resultBatch = this.props.commit.checkSuites.edges.map(edge => edge.node);
    return _react.default.createElement(_accumulator.default, {
      relay: this.props.relay,
      resultBatch: resultBatch,
      onDidRefetch: this.props.onDidRefetch,
      pageSize: _helpers.PAGE_SIZE,
      waitTimeMs: _helpers.PAGINATION_WAIT_TIME_MS
    }, this.renderCheckSuites);
  }

  renderCheckSuite(payload, suites) {
    if (suites.length === 0) {
      return this.props.children(payload);
    }

    const [suite] = suites;
    return _react.default.createElement(_checkRunsAccumulator.default, {
      onDidRefetch: this.props.onDidRefetch,
      checkSuite: suite
    }, ({
      error,
      checkRuns,
      loading: runsLoading
    }) => {
      if (error) {
        payload.errors.push(error);
      }

      payload.runsBySuite.set(suite, checkRuns);
      payload.loading = payload.loading || runsLoading;
      return this.renderCheckSuite(payload, suites.slice(1));
    });
  }

}

exports.BareCheckSuitesAccumulator = BareCheckSuitesAccumulator;

_defineProperty(BareCheckSuitesAccumulator, "propTypes", {
  // Relay
  relay: _propTypes.default.shape({
    hasMore: _propTypes.default.func.isRequired,
    loadMore: _propTypes.default.func.isRequired,
    isLoading: _propTypes.default.func.isRequired
  }).isRequired,
  commit: _propTypes.default.shape({
    checkSuites: (0, _propTypes2.RelayConnectionPropType)(_propTypes.default.object)
  }).isRequired,
  // Render prop. Called with (array of errors, array of check suites, map of runs per suite, loading)
  children: _propTypes.default.func.isRequired,
  // Subscribe to an event that will fire just after a Relay refetch container completes a refetch.
  onDidRefetch: _propTypes.default.func
});

_defineProperty(BareCheckSuitesAccumulator, "defaultProps", {
  onDidRefetch:
  /* istanbul ignore next */
  () => new _eventKit.Disposable()
});

var _default = (0, _reactRelay.createPaginationContainer)(BareCheckSuitesAccumulator, {
  commit: function () {
    const node = require("./__generated__/checkSuitesAccumulator_commit.graphql");

    if (node.hash && node.hash !== "582abc8127f0f2f19fb0a6a531af5e06") {
      console.error("The definition of 'checkSuitesAccumulator_commit' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/checkSuitesAccumulator_commit.graphql");
  }
}, {
  direction: 'forward',

  /* istanbul ignore next */
  getConnectionFromProps(props) {
    return props.commit.checkSuites;
  },

  /* istanbul ignore next */
  getFragmentVariables(prevVars, totalCount) {
    return _objectSpread2({}, prevVars, {
      totalCount
    });
  },

  /* istanbul ignore next */
  getVariables(props, {
    count,
    cursor
  }, fragmentVariables) {
    return {
      id: props.commit.id,
      checkSuiteCount: count,
      checkSuiteCursor: cursor,
      checkRunCount: fragmentVariables.checkRunCount
    };
  },

  query: function () {
    const node = require("./__generated__/checkSuitesAccumulatorQuery.graphql");

    if (node.hash && node.hash !== "b27827b6adb558a64ae6da715a8e438e") {
      console.error("The definition of 'checkSuitesAccumulatorQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/checkSuitesAccumulatorQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250YWluZXJzL2FjY3VtdWxhdG9ycy9jaGVjay1zdWl0ZXMtYWNjdW11bGF0b3IuanMiXSwibmFtZXMiOlsiQmFyZUNoZWNrU3VpdGVzQWNjdW11bGF0b3IiLCJSZWFjdCIsIkNvbXBvbmVudCIsImVyciIsInN1aXRlcyIsImxvYWRpbmciLCJwcm9wcyIsImNoaWxkcmVuIiwiZXJyb3JzIiwicnVuc0J5U3VpdGUiLCJNYXAiLCJyZW5kZXJDaGVja1N1aXRlIiwicmVuZGVyIiwicmVzdWx0QmF0Y2giLCJjb21taXQiLCJjaGVja1N1aXRlcyIsImVkZ2VzIiwibWFwIiwiZWRnZSIsIm5vZGUiLCJyZWxheSIsIm9uRGlkUmVmZXRjaCIsIlBBR0VfU0laRSIsIlBBR0lOQVRJT05fV0FJVF9USU1FX01TIiwicmVuZGVyQ2hlY2tTdWl0ZXMiLCJwYXlsb2FkIiwibGVuZ3RoIiwic3VpdGUiLCJlcnJvciIsImNoZWNrUnVucyIsInJ1bnNMb2FkaW5nIiwicHVzaCIsInNldCIsInNsaWNlIiwiUHJvcFR5cGVzIiwic2hhcGUiLCJoYXNNb3JlIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJsb2FkTW9yZSIsImlzTG9hZGluZyIsIm9iamVjdCIsIkRpc3Bvc2FibGUiLCJkaXJlY3Rpb24iLCJnZXRDb25uZWN0aW9uRnJvbVByb3BzIiwiZ2V0RnJhZ21lbnRWYXJpYWJsZXMiLCJwcmV2VmFycyIsInRvdGFsQ291bnQiLCJnZXRWYXJpYWJsZXMiLCJjb3VudCIsImN1cnNvciIsImZyYWdtZW50VmFyaWFibGVzIiwiaWQiLCJjaGVja1N1aXRlQ291bnQiLCJjaGVja1N1aXRlQ3Vyc29yIiwiY2hlY2tSdW5Db3VudCIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRU8sTUFBTUEsMEJBQU4sU0FBeUNDLGVBQU1DLFNBQS9DLENBQXlEO0FBQUE7QUFB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aW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7Z3JhcGhxbCwgY3JlYXRlUGFnaW5hdGlvbkNvbnRhaW5lcn0gZnJvbSAncmVhY3QtcmVsYXknO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuXG5pbXBvcnQge1BBR0VfU0laRSwgUEFHSU5BVElPTl9XQUlUX1RJTUVfTVN9IGZyb20gJy4uLy4uL2hlbHBlcnMnO1xuaW1wb3J0IHtSZWxheUNvbm5lY3Rpb25Qcm9wVHlwZX0gZnJvbSAnLi4vLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgQ2hlY2tSdW5zQWNjdW11bGF0b3IgZnJvbSAnLi9jaGVjay1ydW5zLWFjY3VtdWxhdG9yJztcbmltcG9ydCBBY2N1bXVsYXRvciBmcm9tICcuL2FjY3VtdWxhdG9yJztcblxuZXhwb3J0IGNsYXNzIEJhcmVDaGVja1N1aXRlc0FjY3VtdWxhdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvLyBSZWxheVxuICAgIHJlbGF5OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgaGFzTW9yZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGxvYWRNb3JlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgaXNMb2FkaW5nOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH0pLmlzUmVxdWlyZWQsXG4gICAgY29tbWl0OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgY2hlY2tTdWl0ZXM6IFJlbGF5Q29ubmVjdGlvblByb3BUeXBlKFxuICAgICAgICBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgKSxcbiAgICB9KS5pc1JlcXVpcmVkLFxuXG4gICAgLy8gUmVuZGVyIHByb3AuIENhbGxlZCB3aXRoIChhcnJheSBvZiBlcnJvcnMsIGFycmF5IG9mIGNoZWNrIHN1aXRlcywgbWFwIG9mIHJ1bnMgcGVyIHN1aXRlLCBsb2FkaW5nKVxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gU3Vic2NyaWJlIHRvIGFuIGV2ZW50IHRoYXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYSBSZWxheSByZWZldGNoIGNvbnRhaW5lciBjb21wbGV0ZXMgYSByZWZldGNoLlxuICAgIG9uRGlkUmVmZXRjaDogUHJvcFR5cGVzLmZ1bmMsXG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIG9uRGlkUmVmZXRjaDogLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gKCkgPT4gbmV3IERpc3Bvc2FibGUoKSxcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCByZXN1bHRCYXRjaCA9IHRoaXMucHJvcHMuY29tbWl0LmNoZWNrU3VpdGVzLmVkZ2VzLm1hcChlZGdlID0+IGVkZ2Uubm9kZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFjY3VtdWxhdG9yXG4gICAgICAgIHJlbGF5PXt0aGlzLnByb3BzLnJlbGF5fVxuICAgICAgICByZXN1bHRCYXRjaD17cmVzdWx0QmF0Y2h9XG4gICAgICAgIG9uRGlkUmVmZXRjaD17dGhpcy5wcm9wcy5vbkRpZFJlZmV0Y2h9XG4gICAgICAgIHBhZ2VTaXplPXtQQUdFX1NJWkV9XG4gICAgICAgIHdhaXRUaW1lTXM9e1BBR0lOQVRJT05fV0FJVF9USU1FX01TfT5cbiAgICAgICAge3RoaXMucmVuZGVyQ2hlY2tTdWl0ZXN9XG4gICAgICA8L0FjY3VtdWxhdG9yPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJDaGVja1N1aXRlcyA9IChlcnIsIHN1aXRlcywgbG9hZGluZykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuKHtcbiAgICAgICAgZXJyb3JzOiBbZXJyXSxcbiAgICAgICAgc3VpdGVzLFxuICAgICAgICBydW5zQnlTdWl0ZTogbmV3IE1hcCgpLFxuICAgICAgICBsb2FkaW5nLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ2hlY2tTdWl0ZSh7ZXJyb3JzOiBbXSwgc3VpdGVzLCBydW5zQnlTdWl0ZTogbmV3IE1hcCgpLCBsb2FkaW5nfSwgc3VpdGVzKTtcbiAgfVxuXG4gIHJlbmRlckNoZWNrU3VpdGUocGF5bG9hZCwgc3VpdGVzKSB7XG4gICAgaWYgKHN1aXRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuKHBheWxvYWQpO1xuICAgIH1cblxuICAgIGNvbnN0IFtzdWl0ZV0gPSBzdWl0ZXM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxDaGVja1J1bnNBY2N1bXVsYXRvclxuICAgICAgICBvbkRpZFJlZmV0Y2g9e3RoaXMucHJvcHMub25EaWRSZWZldGNofVxuICAgICAgICBjaGVja1N1aXRlPXtzdWl0ZX0+XG4gICAgICAgIHsoe2Vycm9yLCBjaGVja1J1bnMsIGxvYWRpbmc6IHJ1bnNMb2FkaW5nfSkgPT4ge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgcGF5bG9hZC5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcGF5bG9hZC5ydW5zQnlTdWl0ZS5zZXQoc3VpdGUsIGNoZWNrUnVucyk7XG4gICAgICAgICAgcGF5bG9hZC5sb2FkaW5nID0gcGF5bG9hZC5sb2FkaW5nIHx8IHJ1bnNMb2FkaW5nO1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlckNoZWNrU3VpdGUocGF5bG9hZCwgc3VpdGVzLnNsaWNlKDEpKTtcbiAgICAgICAgfX1cbiAgICAgIDwvQ2hlY2tSdW5zQWNjdW11bGF0b3I+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVQYWdpbmF0aW9uQ29udGFpbmVyKEJhcmVDaGVja1N1aXRlc0FjY3VtdWxhdG9yLCB7XG4gIGNvbW1pdDogZ3JhcGhxbGBcbiAgICBmcmFnbWVudCBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdCBvbiBDb21taXRcbiAgICBAYXJndW1lbnREZWZpbml0aW9ucyhcbiAgICAgIGNoZWNrU3VpdGVDb3VudDoge3R5cGU6IFwiSW50IVwifVxuICAgICAgY2hlY2tTdWl0ZUN1cnNvcjoge3R5cGU6IFwiU3RyaW5nXCJ9XG4gICAgICBjaGVja1J1bkNvdW50OiB7dHlwZTogXCJJbnQhXCJ9XG4gICAgICBjaGVja1J1bkN1cnNvcjoge3R5cGU6IFwiU3RyaW5nXCJ9XG4gICAgKSB7XG4gICAgICBpZFxuICAgICAgY2hlY2tTdWl0ZXMoXG4gICAgICAgIGZpcnN0OiAkY2hlY2tTdWl0ZUNvdW50XG4gICAgICAgIGFmdGVyOiAkY2hlY2tTdWl0ZUN1cnNvclxuICAgICAgKSBAY29ubmVjdGlvbihrZXk6IFwiQ2hlY2tTdWl0ZUFjY3VtdWxhdG9yX2NoZWNrU3VpdGVzXCIpIHtcbiAgICAgICAgcGFnZUluZm8ge1xuICAgICAgICAgIGhhc05leHRQYWdlXG4gICAgICAgICAgZW5kQ3Vyc29yXG4gICAgICAgIH1cblxuICAgICAgICBlZGdlcyB7XG4gICAgICAgICAgY3Vyc29yXG4gICAgICAgICAgbm9kZSB7XG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICBjb25jbHVzaW9uXG5cbiAgICAgICAgICAgIC4uLmNoZWNrU3VpdGVWaWV3X2NoZWNrU3VpdGVcbiAgICAgICAgICAgIC4uLmNoZWNrUnVuc0FjY3VtdWxhdG9yX2NoZWNrU3VpdGUgQGFyZ3VtZW50cyhcbiAgICAgICAgICAgICAgY2hlY2tSdW5Db3VudDogJGNoZWNrUnVuQ291bnRcbiAgICAgICAgICAgICAgY2hlY2tSdW5DdXJzb3I6ICRjaGVja1J1bkN1cnNvclxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgYCxcbn0sIHtcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCcsXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGdldENvbm5lY3Rpb25Gcm9tUHJvcHMocHJvcHMpIHtcbiAgICByZXR1cm4gcHJvcHMuY29tbWl0LmNoZWNrU3VpdGVzO1xuICB9LFxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXRGcmFnbWVudFZhcmlhYmxlcyhwcmV2VmFycywgdG90YWxDb3VudCkge1xuICAgIHJldHVybiB7Li4ucHJldlZhcnMsIHRvdGFsQ291bnR9O1xuICB9LFxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXRWYXJpYWJsZXMocHJvcHMsIHtjb3VudCwgY3Vyc29yfSwgZnJhZ21lbnRWYXJpYWJsZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHByb3BzLmNvbW1pdC5pZCxcbiAgICAgIGNoZWNrU3VpdGVDb3VudDogY291bnQsXG4gICAgICBjaGVja1N1aXRlQ3Vyc29yOiBjdXJzb3IsXG4gICAgICBjaGVja1J1bkNvdW50OiBmcmFnbWVudFZhcmlhYmxlcy5jaGVja1J1bkNvdW50LFxuICAgIH07XG4gIH0sXG4gIHF1ZXJ5OiBncmFwaHFsYFxuICAgIHF1ZXJ5IGNoZWNrU3VpdGVzQWNjdW11bGF0b3JRdWVyeShcbiAgICAgICRpZDogSUQhXG4gICAgICAkY2hlY2tTdWl0ZUNvdW50OiBJbnQhXG4gICAgICAkY2hlY2tTdWl0ZUN1cnNvcjogU3RyaW5nXG4gICAgICAkY2hlY2tSdW5Db3VudDogSW50IVxuICAgICkge1xuICAgICAgbm9kZShpZDogJGlkKSB7XG4gICAgICAgIC4uLiBvbiBDb21taXQge1xuICAgICAgICAgIC4uLmNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0IEBhcmd1bWVudHMoXG4gICAgICAgICAgICBjaGVja1N1aXRlQ291bnQ6ICRjaGVja1N1aXRlQ291bnRcbiAgICAgICAgICAgIGNoZWNrU3VpdGVDdXJzb3I6ICRjaGVja1N1aXRlQ3Vyc29yXG4gICAgICAgICAgICBjaGVja1J1bkNvdW50OiAkY2hlY2tSdW5Db3VudFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgYCxcbn0pO1xuIl19