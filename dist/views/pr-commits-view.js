"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PrCommitsView = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _propTypes2 = require("../prop-types");

var _prCommitView = _interopRequireDefault(require("./pr-commit-view"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PrCommitsView extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'loadMore');
  }

  loadMore() {
    this.props.relay.loadMore(_helpers.PAGE_SIZE, () => {
      this.forceUpdate();
    });
    this.forceUpdate();
  }

  render() {
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement("div", {
      className: "github-PrCommitsView-commitWrapper"
    }, this.renderCommits()), this.renderLoadMore());
  }

  renderLoadMore() {
    if (!this.props.relay.hasMore()) {
      return null;
    }

    return _react.default.createElement("button", {
      className: "github-PrCommitsView-load-more-button btn",
      onClick: this.loadMore
    }, "Load more");
  }

  renderCommits() {
    return this.props.pullRequest.commits.edges.map(edge => {
      const commit = edge.node.commit;
      return _react.default.createElement(_prCommitView.default, {
        key: commit.id,
        item: commit,
        onBranch: this.props.onBranch,
        openCommit: this.props.openCommit
      });
    });
  }

}

exports.PrCommitsView = PrCommitsView;

_defineProperty(PrCommitsView, "propTypes", {
  relay: _propTypes.default.shape({
    hasMore: _propTypes.default.func.isRequired,
    loadMore: _propTypes.default.func.isRequired,
    isLoading: _propTypes.default.func.isRequired
  }).isRequired,
  pullRequest: _propTypes.default.shape({
    commits: (0, _propTypes2.RelayConnectionPropType)(_propTypes.default.shape({
      commit: _propTypes.default.shape({
        id: _propTypes.default.string.isRequired
      })
    }))
  }),
  onBranch: _propTypes.default.bool.isRequired,
  openCommit: _propTypes.default.func.isRequired
});

var _default = (0, _reactRelay.createPaginationContainer)(PrCommitsView, {
  pullRequest: function () {
    const node = require("./__generated__/prCommitsView_pullRequest.graphql");

    if (node.hash && node.hash !== "4945c525c20aac5e24befbe8b217c2c9") {
      console.error("The definition of 'prCommitsView_pullRequest' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/prCommitsView_pullRequest.graphql");
  }
}, {
  direction: 'forward',

  getConnectionFromProps(props) {
    return props.pullRequest.commits;
  },

  getFragmentVariables(prevVars, totalCount) {
    return _objectSpread2({}, prevVars, {
      commitCount: totalCount
    });
  },

  getVariables(props, {
    count,
    cursor
  }, fragmentVariables) {
    return {
      commitCount: count,
      commitCursor: cursor,
      url: props.pullRequest.url
    };
  },

  query: function () {
    const node = require("./__generated__/prCommitsViewQuery.graphql");

    if (node.hash && node.hash !== "5fae6bf54831a4d4a70eda4117e56b7f") {
      console.error("The definition of 'prCommitsViewQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/prCommitsViewQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9wci1jb21taXRzLXZpZXcuanMiXSwibmFtZXMiOlsiUHJDb21taXRzVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImxvYWRNb3JlIiwicmVsYXkiLCJQQUdFX1NJWkUiLCJmb3JjZVVwZGF0ZSIsInJlbmRlciIsInJlbmRlckNvbW1pdHMiLCJyZW5kZXJMb2FkTW9yZSIsImhhc01vcmUiLCJwdWxsUmVxdWVzdCIsImNvbW1pdHMiLCJlZGdlcyIsIm1hcCIsImVkZ2UiLCJjb21taXQiLCJub2RlIiwiaWQiLCJvbkJyYW5jaCIsIm9wZW5Db21taXQiLCJQcm9wVHlwZXMiLCJzaGFwZSIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiaXNMb2FkaW5nIiwic3RyaW5nIiwiYm9vbCIsImRpcmVjdGlvbiIsImdldENvbm5lY3Rpb25Gcm9tUHJvcHMiLCJnZXRGcmFnbWVudFZhcmlhYmxlcyIsInByZXZWYXJzIiwidG90YWxDb3VudCIsImNvbW1pdENvdW50IiwiZ2V0VmFyaWFibGVzIiwiY291bnQiLCJjdXJzb3IiLCJmcmFnbWVudFZhcmlhYmxlcyIsImNvbW1pdEN1cnNvciIsInVybCIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUFFTyxNQUFNQSxhQUFOLFNBQTRCQyxlQUFNQyxTQUFsQyxDQUE0QztBQW9CakRDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47QUFDQSwyQkFBUyxJQUFULEVBQWUsVUFBZjtBQUNEOztBQUVEQyxFQUFBQSxRQUFRLEdBQUc7QUFDVCxTQUFLRCxLQUFMLENBQVdFLEtBQVgsQ0FBaUJELFFBQWpCLENBQTBCRSxrQkFBMUIsRUFBcUMsTUFBTTtBQUN6QyxXQUFLQyxXQUFMO0FBQ0QsS0FGRDtBQUdBLFNBQUtBLFdBQUw7QUFDRDs7QUFFREMsRUFBQUEs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OztBQUFBO0FBQUE7QUFsQkosQ0F4QlksQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge0ZyYWdtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtncmFwaHFsLCBjcmVhdGVQYWdpbmF0aW9uQ29udGFpbmVyfSBmcm9tICdyZWFjdC1yZWxheSc7XG5pbXBvcnQge1JlbGF5Q29ubmVjdGlvblByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCBQckNvbW1pdFZpZXcgZnJvbSAnLi9wci1jb21taXQtdmlldyc7XG5cbmltcG9ydCB7YXV0b2JpbmQsIFBBR0VfU0laRX0gZnJvbSAnLi4vaGVscGVycyc7XG5cbmV4cG9ydCBjbGFzcyBQckNvbW1pdHNWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICByZWxheTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGhhc01vcmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsb2FkTW9yZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIGlzTG9hZGluZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICAgIHB1bGxSZXF1ZXN0OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgY29tbWl0czogUmVsYXlDb25uZWN0aW9uUHJvcFR5cGUoXG4gICAgICAgIFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgY29tbWl0OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgaWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgIH0pLFxuICAgIG9uQnJhbmNoOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG9wZW5Db21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBhdXRvYmluZCh0aGlzLCAnbG9hZE1vcmUnKTtcbiAgfVxuXG4gIGxvYWRNb3JlKCkge1xuICAgIHRoaXMucHJvcHMucmVsYXkubG9hZE1vcmUoUEFHRV9TSVpFLCAoKSA9PiB7XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLVByQ29tbWl0c1ZpZXctY29tbWl0V3JhcHBlclwiPlxuICAgICAgICAgIHt0aGlzLnJlbmRlckNvbW1pdHMoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLnJlbmRlckxvYWRNb3JlKCl9XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJMb2FkTW9yZSgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMucmVsYXkuaGFzTW9yZSgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIDxidXR0b24gY2xhc3NOYW1lPVwiZ2l0aHViLVByQ29tbWl0c1ZpZXctbG9hZC1tb3JlLWJ1dHRvbiBidG5cIiBvbkNsaWNrPXt0aGlzLmxvYWRNb3JlfT5Mb2FkIG1vcmU8L2J1dHRvbj47XG4gIH1cblxuICByZW5kZXJDb21taXRzKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnB1bGxSZXF1ZXN0LmNvbW1pdHMuZWRnZXMubWFwKGVkZ2UgPT4ge1xuICAgICAgY29uc3QgY29tbWl0ID0gZWRnZS5ub2RlLmNvbW1pdDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxQckNvbW1pdFZpZXdcbiAgICAgICAgICBrZXk9e2NvbW1pdC5pZH1cbiAgICAgICAgICBpdGVtPXtjb21taXR9XG4gICAgICAgICAgb25CcmFuY2g9e3RoaXMucHJvcHMub25CcmFuY2h9XG4gICAgICAgICAgb3BlbkNvbW1pdD17dGhpcy5wcm9wcy5vcGVuQ29tbWl0fVxuICAgICAgICAvPik7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlUGFnaW5hdGlvbkNvbnRhaW5lcihQckNvbW1pdHNWaWV3LCB7XG4gIHB1bGxSZXF1ZXN0OiBncmFwaHFsYFxuICAgIGZyYWdtZW50IHByQ29tbWl0c1ZpZXdfcHVsbFJlcXVlc3Qgb24gUHVsbFJlcXVlc3RcbiAgICBAYXJndW1lbnREZWZpbml0aW9ucyhcbiAgICAgIGNvbW1pdENvdW50OiB7dHlwZTogXCJJbnQhXCIsIGRlZmF1bHRWYWx1ZTogMTAwfSxcbiAgICAgIGNvbW1pdEN1cnNvcjoge3R5cGU6IFwiU3RyaW5nXCJ9XG4gICAgKSB7XG4gICAgICB1cmxcbiAgICAgIGNvbW1pdHMoXG4gICAgICAgIGZpcnN0OiAkY29tbWl0Q291bnQsIGFmdGVyOiAkY29tbWl0Q3Vyc29yXG4gICAgICApIEBjb25uZWN0aW9uKGtleTogXCJwckNvbW1pdHNWaWV3X2NvbW1pdHNcIikge1xuICAgICAgICBwYWdlSW5mbyB7IGVuZEN1cnNvciBoYXNOZXh0UGFnZSB9XG4gICAgICAgIGVkZ2VzIHtcbiAgICAgICAgICBjdXJzb3JcbiAgICAgICAgICBub2RlIHtcbiAgICAgICAgICAgIGNvbW1pdCB7XG4gICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgIC4uLnByQ29tbWl0Vmlld19pdGVtXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgLFxufSwge1xuICBkaXJlY3Rpb246ICdmb3J3YXJkJyxcbiAgZ2V0Q29ubmVjdGlvbkZyb21Qcm9wcyhwcm9wcykge1xuICAgIHJldHVybiBwcm9wcy5wdWxsUmVxdWVzdC5jb21taXRzO1xuICB9LFxuICBnZXRGcmFnbWVudFZhcmlhYmxlcyhwcmV2VmFycywgdG90YWxDb3VudCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5wcmV2VmFycyxcbiAgICAgIGNvbW1pdENvdW50OiB0b3RhbENvdW50LFxuICAgIH07XG4gIH0sXG4gIGdldFZhcmlhYmxlcyhwcm9wcywge2NvdW50LCBjdXJzb3J9LCBmcmFnbWVudFZhcmlhYmxlcykge1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXRDb3VudDogY291bnQsXG4gICAgICBjb21taXRDdXJzb3I6IGN1cnNvcixcbiAgICAgIHVybDogcHJvcHMucHVsbFJlcXVlc3QudXJsLFxuICAgIH07XG4gIH0sXG4gIHF1ZXJ5OiBncmFwaHFsYFxuICAgIHF1ZXJ5IHByQ29tbWl0c1ZpZXdRdWVyeSgkY29tbWl0Q291bnQ6IEludCEsICRjb21taXRDdXJzb3I6IFN0cmluZywgJHVybDogVVJJISkge1xuICAgICAgICByZXNvdXJjZSh1cmw6ICR1cmwpIHtcbiAgICAgICAgICAuLi4gb24gUHVsbFJlcXVlc3Qge1xuICAgICAgICAgICAgLi4ucHJDb21taXRzVmlld19wdWxsUmVxdWVzdCBAYXJndW1lbnRzKGNvbW1pdENvdW50OiAkY29tbWl0Q291bnQsIGNvbW1pdEN1cnNvcjogJGNvbW1pdEN1cnNvcilcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgLFxufSk7XG4iXX0=