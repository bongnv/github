"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BareReviewThreadsAccumulator = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _helpers = require("../../helpers");

var _propTypes2 = require("../../prop-types");

var _accumulator = _interopRequireDefault(require("./accumulator"));

var _reviewCommentsAccumulator = _interopRequireDefault(require("./review-comments-accumulator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BareReviewThreadsAccumulator extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderReviewThreads", (err, threads, loading) => {
      if (err) {
        return this.props.children({
          errors: [err],
          commentThreads: [],
          loading
        });
      }

      return this.renderReviewThread({
        errors: [],
        commentsByThread: new Map(),
        loading
      }, threads);
    });

    _defineProperty(this, "renderReviewThread", (payload, threads) => {
      if (threads.length === 0) {
        const commentThreads = [];
        payload.commentsByThread.forEach((comments, thread) => {
          commentThreads.push({
            thread,
            comments
          });
        });
        return this.props.children({
          commentThreads,
          errors: payload.errors,
          loading: payload.loading
        });
      }

      const [thread] = threads;
      return _react.default.createElement(_reviewCommentsAccumulator.default, {
        onDidRefetch: this.props.onDidRefetch,
        reviewThread: thread
      }, ({
        error,
        comments,
        loading: threadLoading
      }) => {
        if (error) {
          payload.errors.push(error);
        }

        payload.commentsByThread.set(thread, comments);
        payload.loading = payload.loading || threadLoading;
        return this.renderReviewThread(payload, threads.slice(1));
      });
    });
  }

  render() {
    const resultBatch = this.props.pullRequest.reviewThreads.edges.map(edge => edge.node);
    return _react.default.createElement(_accumulator.default, {
      relay: this.props.relay,
      resultBatch: resultBatch,
      onDidRefetch: this.props.onDidRefetch,
      pageSize: _helpers.PAGE_SIZE,
      waitTimeMs: _helpers.PAGINATION_WAIT_TIME_MS
    }, this.renderReviewThreads);
  }

}

exports.BareReviewThreadsAccumulator = BareReviewThreadsAccumulator;

_defineProperty(BareReviewThreadsAccumulator, "propTypes", {
  // Relay props
  relay: _propTypes.default.shape({
    hasMore: _propTypes.default.func.isRequired,
    loadMore: _propTypes.default.func.isRequired,
    isLoading: _propTypes.default.func.isRequired
  }).isRequired,
  pullRequest: _propTypes.default.shape({
    reviewThreads: (0, _propTypes2.RelayConnectionPropType)(_propTypes.default.object)
  }),
  // Render prop. Called with (array of errors, array of threads, map of comments per thread, loading)
  children: _propTypes.default.func.isRequired,
  // Called right after refetch happens
  onDidRefetch: _propTypes.default.func.isRequired
});

var _default = (0, _reactRelay.createPaginationContainer)(BareReviewThreadsAccumulator, {
  pullRequest: function () {
    const node = require("./__generated__/reviewThreadsAccumulator_pullRequest.graphql");

    if (node.hash && node.hash !== "15785e7c291c2dc79dbf6e534bcb7e76") {
      console.error("The definition of 'reviewThreadsAccumulator_pullRequest' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/reviewThreadsAccumulator_pullRequest.graphql");
  }
}, {
  direction: 'forward',

  /* istanbul ignore next */
  getConnectionFromProps(props) {
    return props.pullRequest.reviewThreads;
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
      url: props.pullRequest.url,
      threadCount: count,
      threadCursor: cursor,
      commentCount: fragmentVariables.commentCount
    };
  },

  query: function () {
    const node = require("./__generated__/reviewThreadsAccumulatorQuery.graphql");

    if (node.hash && node.hash !== "e79afa42892ad508af3b22ca911cd7c5") {
      console.error("The definition of 'reviewThreadsAccumulatorQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/reviewThreadsAccumulatorQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250YWluZXJzL2FjY3VtdWxhdG9ycy9yZXZpZXctdGhyZWFkcy1hY2N1bXVsYXRvci5qcyJdLCJuYW1lcyI6WyJCYXJlUmV2aWV3VGhyZWFkc0FjY3VtdWxhdG9yIiwiUmVhY3QiLCJDb21wb25lbnQiLCJlcnIiLCJ0aHJlYWRzIiwibG9hZGluZyIsInByb3BzIiwiY2hpbGRyZW4iLCJlcnJvcnMiLCJjb21tZW50VGhyZWFkcyIsInJlbmRlclJldmlld1RocmVhZCIsImNvbW1lbnRzQnlUaHJlYWQiLCJNYXAiLCJwYXlsb2FkIiwibGVuZ3RoIiwiZm9yRWFjaCIsImNvbW1lbnRzIiwidGhyZWFkIiwicHVzaCIsIm9uRGlkUmVmZXRjaCIsImVycm9yIiwidGhyZWFkTG9hZGluZyIsInNldCIsInNsaWNlIiwicmVuZGVyIiwicmVzdWx0QmF0Y2giLCJwdWxsUmVxdWVzdCIsInJldmlld1RocmVhZHMiLCJlZGdlcyIsIm1hcCIsImVkZ2UiLCJub2RlIiwicmVsYXkiLCJQQUdFX1NJWkUiLCJQQUdJTkFUSU9OX1dBSVRfVElNRV9NUyIsInJlbmRlclJldmlld1RocmVhZHMiLCJQcm9wVHlwZXMiLCJzaGFwZSIsImhhc01vcmUiLCJmdW5jIiwiaXNSZXF1aXJlZCIsImxvYWRNb3JlIiwiaXNMb2FkaW5nIiwib2JqZWN0IiwiZGlyZWN0aW9uIiwiZ2V0Q29ubmVjdGlvbkZyb21Qcm9wcyIsImdldEZyYWdtZW50VmFyaWFibGVzIiwicHJldlZhcnMiLCJ0b3RhbENvdW50IiwiZ2V0VmFyaWFibGVzIiwiY291bnQiLCJjdXJzb3IiLCJmcmFnbWVudFZhcmlhYmxlcyIsInVybCIsInRocmVhZENvdW50IiwidGhyZWFkQ3Vyc29yIiwiY29tbWVudENvdW50IiwicXVlcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFTyxNQUFNQSw0QkFBTixTQUEyQ0MsZUFBTUMsU0FBakQsQ0FBMkQ7QUFBQTtBQUFBOztBQUFBLGlEQW1DMUMsQ0FBQ0MsR0FBRCxFQUFNQyxPQUFOLEVBQWVDLE9BQWYsS0FBMkI7QUFDL0MsVUFBSUYsR0FBSixFQUFTO0FBQ1AsZUFBTyxLQUFLRyxLQUFMLENBQVdDLFFBQVgsQ0FBb0I7QUFDekJDLFVBQUFBLE1BQU0sRUFBRSxDQUFDTCxHQUFELENBRGlCO0FBRXpCTSxVQUFBQSxjQUFjLEVBQUUsRUFGUztBQUd6QkosVUFBQUE7QUFIeUIsU0FBcEIsQ0FBUDtBQUtEOztBQUVELGFBQU8sS0FBS0ssa0JBQUwsQ0FBd0I7QUFBQ0YsUUFBQUEsTUFBTSxFQUFFLEVBQVQ7QUFBYUcsUUFBQUEsZ0JBQWdCLEVBQUUsSUFBSUMsR0FBSixFQUEvQjtBQUEwQ1AsUUFBQUE7QUFBMUMsT0FBeEIsRUFBNEVELE9BQTVFLENBQVA7QUFDRCxLQTdDK0Q7O0FBQUEsZ0RBK0MzQyxDQUFDUyxPQUFELEVBQVVULE9BQVYsS0FBc0I7QUFDekMsVUFBSUEsT0FBTyxDQUFDVSxNQUFSLEtBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLGNBQU1MLGNBQWMsR0FBRyxFQUF2QjtBQUNBSSxRQUFBQSxPQUFPLENBQUNGLGdCQUFSLENBQXlCSSxPQUF6QixDQUFpQyxDQUFDQyxRQUFELEVBQVdDLE1BQVgsS0FBc0I7QUFDckRSLFVBQUFBLGNBQWMsQ0FBQ1MsSUFBZixDQUFvQjtBQUFDRCxZQUFBQSxNQUFEO0FBQVNELFlBQUFBO0FBQVQsV0FBcEI7QUFDRCxTQUZEO0FBR0EsZUFBTyxLQUFLVixLQUFMLENBQVdDLFFBQVgsQ0FBb0I7QUFDekJFLFVBQUFBLGNBRHlCO0FBRXpCRCxVQUFBQSxNQUFNLEVBQUVLLE9BQU8sQ0FBQ0wsTUFGUztBQUd6QkgsVUFBQUEsT0FBTyxFQUFFUSxPQUFPLENBQUNSO0FBSFEsU0FBcEIsQ0FBUDtBQUtEOztBQUVELFlBQU0sQ0FBQ1ksTUFBRCxJQUFXYixPQUFqQjtBQUNBLGFBQ0UsNkJBQUMsa0NBQUQ7QUFDRSxRQUFBLFlBQVksRUFBRSxLQUFLRSxLQUFMLENBQVdhLFlBRDNCO0FBRUUsUUFBQSxZQUFZLEVBQUVGO0FBRmhCLFNBR0csQ0FBQztBQUFDRyxRQUFBQSxLQUFEO0FBQVFKLFFBQUFBLFFBQVI7QUFBa0JYLFFBQUFBLE9BQU8sRUFBRWdCO0FBQTNCLE9BQUQsS0FBK0M7QUFDOUMsWUFBSUQsS0FBSixFQUFXO0FBQ1RQLFVBQUFBLE9BQU8sQ0FBQ0wsTUFBUixDQUFlVSxJQUFmLENBQW9CRSxLQUFwQjtBQUNEOztBQUNEUCxRQUFBQSxPQUFPLENBQUNGLGdCQUFSLENBQXlCVyxHQUF6QixDQUE2QkwsTUFBN0IsRUFBcUNELFFBQXJDO0FBQ0FILFFBQUFBLE9BQU8sQ0FBQ1IsT0FBUixHQUFrQlEsT0FBTyxDQUFDUixPQUFSLElBQW1CZ0IsYUFBckM7QUFDQSxlQUFPLEtBQUtYLGtCQUFMLENBQXdCRyxPQUF4QixFQUFpQ1QsT0FBTyxDQUFDbUIsS0FBUixDQUFjLENBQWQsQ0FBakMsQ0FBUDtBQUNELE9BVkgsQ0FERjtBQWNELEtBM0UrRDtBQUFBOztBQXFCaEVDLEVBQUFBLE1BQU0sR0FBRztBQUNQLFVBQU1DLFdBQVcsR0FBRyxLQUFLbkIsS0FBTCxDQUFXb0IsV0FBWCxDQUF1QkMsYUFBdkIsQ0FBcUNDLEtBQXJDLENBQTJDQyxHQUEzQyxDQUErQ0MsSUFBSSxJQUFJQSxJQUFJLENBQUNDLElBQTVELENBQXBCO0FBQ0EsV0FDRSw2QkFBQyxvQkFBRDtBQUNFLE1BQUEsS0FBSyxFQUFFLEtBQUt6QixLQUFMLENBQVcwQixLQURwQjtBQUVFLE1BQUEsV0FBVyxFQUFFUCxXQUZmO0FBR0UsTUFBQSxZQUFZLEVBQUUsS0FBS25CLEtBQUwsQ0FBV2EsWUFIM0I7QUFJRSxNQUFBLFFBQVEsRUFBRWMsa0JBSlo7QUFLRSxNQUFBLFVBQVUsRUFBRUM7QUFMZCxPQU1HLEtBQUtDLG1CQU5SLENBREY7QUFVRDs7QUFqQytEOzs7O2dCQUFyRG5DLDRCLGVBQ1E7QUFDakI7QUFDQWdDLEVBQUFBLEtBQUssRUFBRUksbUJBQVVDLEtBQVYsQ0FBZ0I7QUFDckJDLElBQUFBLE9BQU8sRUFBRUYsbUJBQVVHLElBQVYsQ0FBZUMsVUFESDtBQUVyQkMsSUFBQUEsUUFBUSxFQUFFTCxtQkFBVUcsSUFBVixDQUFlQyxVQUZKO0FBR3JCRSxJQUFBQSxTQUFTLEVBQUVOLG1CQUFVRyxJQUFWLENBQWVDO0FBSEwsR0FBaEIsRUFJSkEsVUFOYztBQU9qQmQsRUFBQUEsV0FBVyxFQUFFVSxtQkFBVUMsS0FBVixDQUFnQjtBQUMzQlYsSUFBQUEsYUFBYSxFQUFFLHlDQUNiUyxtQkFBVU8sTUFERztBQURZLEdBQWhCLENBUEk7QUFhakI7QUFDQXBDLEVBQUFBLFFBQVEsRUFBRTZCLG1CQUFVRyxJQUFWLENBQWVDLFVBZFI7QUFnQmpCO0FBQ0FyQixFQUFBQSxZQUFZLEVBQUVpQixtQkFBVUcsSUFBVixDQUFlQztBQWpCWixDOztlQTZFTiwyQ0FBMEJ4Qyw0QkFBMUIsRUFBd0Q7QUFDckUwQixFQUFBQSxXQUFXO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFEMEQsQ0FBeEQsRUF1Q1o7QUFDRGtCLEVBQUFBLFNBQVMsRUFBRSxTQURWOztBQUVEO0FBQ0FDLEVBQUFBLHNCQUFzQixDQUFDdkMsS0FBRCxFQUFRO0FBQzVCLFdBQU9BLEtBQUssQ0FBQ29CLFdBQU4sQ0FBa0JDLGFBQXpCO0FBQ0QsR0FMQTs7QUFNRDtBQUNBbUIsRUFBQUEsb0JBQW9CLENBQUNDLFFBQUQsRUFBV0MsVUFBWCxFQUF1QjtBQUN6Qyw4QkFBV0QsUUFBWDtBQUFxQkMsTUFBQUE7QUFBckI7QUFDRCxHQVRBOztBQVVEO0FBQ0FDLEVBQUFBLFlBQVksQ0FBQzNDLEtBQUQsRUFBUTtBQUFDNEMsSUFBQUEsS0FBRDtBQUFRQyxJQUFBQTtBQUFSLEdBQVIsRUFBeUJDLGlCQUF6QixFQUE0QztBQUN0RCxXQUFPO0FBQ0xDLE1BQUFBLEdBQUcsRUFBRS9DLEtBQUssQ0FBQ29CLFdBQU4sQ0FBa0IyQixHQURsQjtBQUVMQyxNQUFBQSxXQUFXLEVBQUVKLEtBRlI7QUFHTEssTUFBQUEsWUFBWSxFQUFFSixNQUhUO0FBSUxLLE1BQUFBLFlBQVksRUFBRUosaUJBQWlCLENBQUNJO0FBSjNCLEtBQVA7QUFNRCxHQWxCQTs7QUFtQkRDLEVBQUFBLEtBQUs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQW5CSixDQXZDWSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2dyYXBocWwsIGNyZWF0ZVBhZ2luYXRpb25Db250YWluZXJ9IGZyb20gJ3JlYWN0LXJlbGF5JztcblxuaW1wb3J0IHtQQUdFX1NJWkUsIFBBR0lOQVRJT05fV0FJVF9USU1FX01TfSBmcm9tICcuLi8uLi9oZWxwZXJzJztcbmltcG9ydCB7UmVsYXlDb25uZWN0aW9uUHJvcFR5cGV9IGZyb20gJy4uLy4uL3Byb3AtdHlwZXMnO1xuaW1wb3J0IEFjY3VtdWxhdG9yIGZyb20gJy4vYWNjdW11bGF0b3InO1xuaW1wb3J0IFJldmlld0NvbW1lbnRzQWNjdW11bGF0b3IgZnJvbSAnLi9yZXZpZXctY29tbWVudHMtYWNjdW11bGF0b3InO1xuXG5leHBvcnQgY2xhc3MgQmFyZVJldmlld1RocmVhZHNBY2N1bXVsYXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLy8gUmVsYXkgcHJvcHNcbiAgICByZWxheTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGhhc01vcmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsb2FkTW9yZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGlzTG9hZGluZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICAgIHB1bGxSZXF1ZXN0OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgcmV2aWV3VGhyZWFkczogUmVsYXlDb25uZWN0aW9uUHJvcFR5cGUoXG4gICAgICAgIFByb3BUeXBlcy5vYmplY3QsXG4gICAgICApLFxuICAgIH0pLFxuXG4gICAgLy8gUmVuZGVyIHByb3AuIENhbGxlZCB3aXRoIChhcnJheSBvZiBlcnJvcnMsIGFycmF5IG9mIHRocmVhZHMsIG1hcCBvZiBjb21tZW50cyBwZXIgdGhyZWFkLCBsb2FkaW5nKVxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQ2FsbGVkIHJpZ2h0IGFmdGVyIHJlZmV0Y2ggaGFwcGVuc1xuICAgIG9uRGlkUmVmZXRjaDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCByZXN1bHRCYXRjaCA9IHRoaXMucHJvcHMucHVsbFJlcXVlc3QucmV2aWV3VGhyZWFkcy5lZGdlcy5tYXAoZWRnZSA9PiBlZGdlLm5vZGUpO1xuICAgIHJldHVybiAoXG4gICAgICA8QWNjdW11bGF0b3JcbiAgICAgICAgcmVsYXk9e3RoaXMucHJvcHMucmVsYXl9XG4gICAgICAgIHJlc3VsdEJhdGNoPXtyZXN1bHRCYXRjaH1cbiAgICAgICAgb25EaWRSZWZldGNoPXt0aGlzLnByb3BzLm9uRGlkUmVmZXRjaH1cbiAgICAgICAgcGFnZVNpemU9e1BBR0VfU0laRX1cbiAgICAgICAgd2FpdFRpbWVNcz17UEFHSU5BVElPTl9XQUlUX1RJTUVfTVN9PlxuICAgICAgICB7dGhpcy5yZW5kZXJSZXZpZXdUaHJlYWRzfVxuICAgICAgPC9BY2N1bXVsYXRvcj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyUmV2aWV3VGhyZWFkcyA9IChlcnIsIHRocmVhZHMsIGxvYWRpbmcpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbih7XG4gICAgICAgIGVycm9yczogW2Vycl0sXG4gICAgICAgIGNvbW1lbnRUaHJlYWRzOiBbXSxcbiAgICAgICAgbG9hZGluZyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlbmRlclJldmlld1RocmVhZCh7ZXJyb3JzOiBbXSwgY29tbWVudHNCeVRocmVhZDogbmV3IE1hcCgpLCBsb2FkaW5nfSwgdGhyZWFkcyk7XG4gIH1cblxuICByZW5kZXJSZXZpZXdUaHJlYWQgPSAocGF5bG9hZCwgdGhyZWFkcykgPT4ge1xuICAgIGlmICh0aHJlYWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgY29tbWVudFRocmVhZHMgPSBbXTtcbiAgICAgIHBheWxvYWQuY29tbWVudHNCeVRocmVhZC5mb3JFYWNoKChjb21tZW50cywgdGhyZWFkKSA9PiB7XG4gICAgICAgIGNvbW1lbnRUaHJlYWRzLnB1c2goe3RocmVhZCwgY29tbWVudHN9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW4oe1xuICAgICAgICBjb21tZW50VGhyZWFkcyxcbiAgICAgICAgZXJyb3JzOiBwYXlsb2FkLmVycm9ycyxcbiAgICAgICAgbG9hZGluZzogcGF5bG9hZC5sb2FkaW5nLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgW3RocmVhZF0gPSB0aHJlYWRzO1xuICAgIHJldHVybiAoXG4gICAgICA8UmV2aWV3Q29tbWVudHNBY2N1bXVsYXRvclxuICAgICAgICBvbkRpZFJlZmV0Y2g9e3RoaXMucHJvcHMub25EaWRSZWZldGNofVxuICAgICAgICByZXZpZXdUaHJlYWQ9e3RocmVhZH0+XG4gICAgICAgIHsoe2Vycm9yLCBjb21tZW50cywgbG9hZGluZzogdGhyZWFkTG9hZGluZ30pID0+IHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHBheWxvYWQuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXlsb2FkLmNvbW1lbnRzQnlUaHJlYWQuc2V0KHRocmVhZCwgY29tbWVudHMpO1xuICAgICAgICAgIHBheWxvYWQubG9hZGluZyA9IHBheWxvYWQubG9hZGluZyB8fCB0aHJlYWRMb2FkaW5nO1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclJldmlld1RocmVhZChwYXlsb2FkLCB0aHJlYWRzLnNsaWNlKDEpKTtcbiAgICAgICAgfX1cbiAgICAgIDwvUmV2aWV3Q29tbWVudHNBY2N1bXVsYXRvcj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZVBhZ2luYXRpb25Db250YWluZXIoQmFyZVJldmlld1RocmVhZHNBY2N1bXVsYXRvciwge1xuICBwdWxsUmVxdWVzdDogZ3JhcGhxbGBcbiAgICBmcmFnbWVudCByZXZpZXdUaHJlYWRzQWNjdW11bGF0b3JfcHVsbFJlcXVlc3Qgb24gUHVsbFJlcXVlc3RcbiAgICBAYXJndW1lbnREZWZpbml0aW9ucyhcbiAgICAgIHRocmVhZENvdW50OiB7dHlwZTogXCJJbnQhXCJ9XG4gICAgICB0aHJlYWRDdXJzb3I6IHt0eXBlOiBcIlN0cmluZ1wifVxuICAgICAgY29tbWVudENvdW50OiB7dHlwZTogXCJJbnQhXCJ9XG4gICAgICBjb21tZW50Q3Vyc29yOiB7dHlwZTogXCJTdHJpbmdcIn1cbiAgICApIHtcbiAgICAgIHVybFxuICAgICAgcmV2aWV3VGhyZWFkcyhcbiAgICAgICAgZmlyc3Q6ICR0aHJlYWRDb3VudFxuICAgICAgICBhZnRlcjogJHRocmVhZEN1cnNvclxuICAgICAgKSBAY29ubmVjdGlvbihrZXk6IFwiUmV2aWV3VGhyZWFkc0FjY3VtdWxhdG9yX3Jldmlld1RocmVhZHNcIikge1xuICAgICAgICBwYWdlSW5mbyB7XG4gICAgICAgICAgaGFzTmV4dFBhZ2VcbiAgICAgICAgICBlbmRDdXJzb3JcbiAgICAgICAgfVxuXG4gICAgICAgIGVkZ2VzIHtcbiAgICAgICAgICBjdXJzb3JcbiAgICAgICAgICBub2RlIHtcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBpc1Jlc29sdmVkXG4gICAgICAgICAgICByZXNvbHZlZEJ5IHtcbiAgICAgICAgICAgICAgbG9naW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZXdlckNhblJlc29sdmVcbiAgICAgICAgICAgIHZpZXdlckNhblVucmVzb2x2ZVxuXG4gICAgICAgICAgICAuLi5yZXZpZXdDb21tZW50c0FjY3VtdWxhdG9yX3Jldmlld1RocmVhZCBAYXJndW1lbnRzKFxuICAgICAgICAgICAgICBjb21tZW50Q291bnQ6ICRjb21tZW50Q291bnRcbiAgICAgICAgICAgICAgY29tbWVudEN1cnNvcjogJGNvbW1lbnRDdXJzb3JcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIGAsXG59LCB7XG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnLFxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXRDb25uZWN0aW9uRnJvbVByb3BzKHByb3BzKSB7XG4gICAgcmV0dXJuIHByb3BzLnB1bGxSZXF1ZXN0LnJldmlld1RocmVhZHM7XG4gIH0sXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGdldEZyYWdtZW50VmFyaWFibGVzKHByZXZWYXJzLCB0b3RhbENvdW50KSB7XG4gICAgcmV0dXJuIHsuLi5wcmV2VmFycywgdG90YWxDb3VudH07XG4gIH0sXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGdldFZhcmlhYmxlcyhwcm9wcywge2NvdW50LCBjdXJzb3J9LCBmcmFnbWVudFZhcmlhYmxlcykge1xuICAgIHJldHVybiB7XG4gICAgICB1cmw6IHByb3BzLnB1bGxSZXF1ZXN0LnVybCxcbiAgICAgIHRocmVhZENvdW50OiBjb3VudCxcbiAgICAgIHRocmVhZEN1cnNvcjogY3Vyc29yLFxuICAgICAgY29tbWVudENvdW50OiBmcmFnbWVudFZhcmlhYmxlcy5jb21tZW50Q291bnQsXG4gICAgfTtcbiAgfSxcbiAgcXVlcnk6IGdyYXBocWxgXG4gICAgcXVlcnkgcmV2aWV3VGhyZWFkc0FjY3VtdWxhdG9yUXVlcnkoXG4gICAgICAkdXJsOiBVUkkhXG4gICAgICAkdGhyZWFkQ291bnQ6IEludCFcbiAgICAgICR0aHJlYWRDdXJzb3I6IFN0cmluZ1xuICAgICAgJGNvbW1lbnRDb3VudDogSW50IVxuICAgICkge1xuICAgICAgcmVzb3VyY2UodXJsOiAkdXJsKSB7XG4gICAgICAgIC4uLiBvbiBQdWxsUmVxdWVzdCB7XG4gICAgICAgICAgLi4ucmV2aWV3VGhyZWFkc0FjY3VtdWxhdG9yX3B1bGxSZXF1ZXN0IEBhcmd1bWVudHMoXG4gICAgICAgICAgICB0aHJlYWRDb3VudDogJHRocmVhZENvdW50XG4gICAgICAgICAgICB0aHJlYWRDdXJzb3I6ICR0aHJlYWRDdXJzb3JcbiAgICAgICAgICAgIGNvbW1lbnRDb3VudDogJGNvbW1lbnRDb3VudFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgYCxcbn0pO1xuIl19