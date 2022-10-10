"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _eventKit = require("event-kit");

var _helpers = require("../helpers");

var _propTypes2 = require("../prop-types");

var _issueishListController = _interopRequireWildcard(require("../controllers/issueish-list-controller"));

var _relayNetworkLayerManager = _interopRequireDefault(require("../relay-network-layer-manager"));

var _graphql;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class IssueishSearchContainer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'renderQueryResult');
    this.sub = new _eventKit.Disposable();
  }

  render() {
    const environment = _relayNetworkLayerManager.default.getEnvironmentForHost(this.props.endpoint, this.props.token);

    if (this.props.search.isNull()) {
      return _react.default.createElement(_issueishListController.BareIssueishListController, _extends({
        isLoading: false
      }, this.controllerProps()));
    }

    const query = _graphql || (_graphql = function () {
      const node = require("./__generated__/issueishSearchContainerQuery.graphql");

      if (node.hash && node.hash !== "9b0a99c35f017d4c3013e5908990a61c") {
        console.error("The definition of 'issueishSearchContainerQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
      }

      return require("./__generated__/issueishSearchContainerQuery.graphql");
    });

    const variables = {
      query: this.props.search.createQuery(),
      first: this.props.limit,
      checkSuiteCount: _helpers.CHECK_SUITE_PAGE_SIZE,
      checkSuiteCursor: null,
      checkRunCount: _helpers.CHECK_RUN_PAGE_SIZE,
      checkRunCursor: null
    };
    return _react.default.createElement(_reactRelay.QueryRenderer, {
      environment: environment,
      variables: variables,
      query: query,
      render: this.renderQueryResult
    });
  }

  renderQueryResult({
    error,
    props
  }) {
    if (error) {
      return _react.default.createElement(_issueishListController.BareIssueishListController, _extends({
        isLoading: false,
        error: error
      }, this.controllerProps()));
    }

    if (props === null) {
      return _react.default.createElement(_issueishListController.BareIssueishListController, _extends({
        isLoading: true
      }, this.controllerProps()));
    }

    return _react.default.createElement(_issueishListController.default, _extends({
      total: props.search.issueCount,
      results: props.search.nodes,
      isLoading: false
    }, this.controllerProps()));
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  controllerProps() {
    return {
      title: this.props.search.getName(),
      onOpenIssueish: this.props.onOpenIssueish,
      onOpenReviews: this.props.onOpenReviews,
      onOpenMore: () => this.props.onOpenSearch(this.props.search)
    };
  }

}

exports.default = IssueishSearchContainer;

_defineProperty(IssueishSearchContainer, "propTypes", {
  // Connection information
  endpoint: _propTypes2.EndpointPropType.isRequired,
  token: _propTypes.default.string.isRequired,
  // Search model
  limit: _propTypes.default.number,
  search: _propTypes2.SearchPropType.isRequired,
  // Action methods
  onOpenIssueish: _propTypes.default.func.isRequired,
  onOpenSearch: _propTypes.default.func.isRequired,
  onOpenReviews: _propTypes.default.func.isRequired
});

_defineProperty(IssueishSearchContainer, "defaultProps", {
  limit: 20
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250YWluZXJzL2lzc3VlaXNoLXNlYXJjaC1jb250YWluZXIuanMiXSwibmFtZXMiOlsiSXNzdWVpc2hTZWFyY2hDb250YWluZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdWIiLCJEaXNwb3NhYmxlIiwicmVuZGVyIiwiZW52aXJvbm1lbnQiLCJSZWxheU5ldHdvcmtMYXllck1hbmFnZXIiLCJnZXRFbnZpcm9ubWVudEZvckhvc3QiLCJlbmRwb2ludCIsInRva2VuIiwic2VhcmNoIiwiaXNOdWxsIiwiY29udHJvbGxlclByb3BzIiwicXVlcnkiLCJ2YXJpYWJsZXMiLCJjcmVhdGVRdWVyeSIsImZpcnN0IiwibGltaXQiLCJjaGVja1N1aXRlQ291bnQiLCJDSEVDS19TVUlURV9QQUdFX1NJWkUiLCJjaGVja1N1aXRlQ3Vyc29yIiwiY2hlY2tSdW5Db3VudCIsIkNIRUNLX1JVTl9QQUdFX1NJWkUiLCJjaGVja1J1bkN1cnNvciIsInJlbmRlclF1ZXJ5UmVzdWx0IiwiZXJyb3IiLCJpc3N1ZUNvdW50Iiwibm9kZXMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImRpc3Bvc2UiLCJ0aXRsZSIsImdldE5hbWUiLCJvbk9wZW5Jc3N1ZWlzaCIsIm9uT3BlblJldmlld3MiLCJvbk9wZW5Nb3JlIiwib25PcGVuU2VhcmNoIiwiRW5kcG9pbnRQcm9wVHlwZSIsImlzUmVxdWlyZWQiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJudW1iZXIiLCJTZWFyY2hQcm9wVHlwZSIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRWUsTUFBTUEsdUJBQU4sU0FBc0NDLGVBQU1DLFNBQTVDLENBQXNEO0FBb0JuRUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FBTjtBQUNBLDJCQUFTLElB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QkFBZUosVUFQTjtBQVNqQjtBQUNBTCxFQUFBQSxjQUFjLEVBQUVNLG1CQUFVSSxJQUFWLENBQWVMLFVBVmQ7QUFXakJGLEVBQUFBLFlBQVksRUFBRUcsbUJBQVVJLElBQVYsQ0FBZUwsVUFYWjtBQVlqQkosRUFBQUEsYUFBYSxFQUFFSyxtQkFBVUksSUFBVixDQUFlTDtBQVpiLEM7O2dCQURBeEMsdUIsa0JBZ0JHO0FBQ3BCb0IsRUFBQUEsS0FBSyxFQUFFO0FBRGEsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtRdWVyeVJlbmRlcmVyLCBncmFwaHFsfSBmcm9tICdyZWFjdC1yZWxheSc7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5cbmltcG9ydCB7YXV0b2JpbmQsIENIRUNLX1NVSVRFX1BBR0VfU0laRSwgQ0hFQ0tfUlVOX1BBR0VfU0laRX0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQge1NlYXJjaFByb3BUeXBlLCBFbmRwb2ludFByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCBJc3N1ZWlzaExpc3RDb250cm9sbGVyLCB7QmFyZUlzc3VlaXNoTGlzdENvbnRyb2xsZXJ9IGZyb20gJy4uL2NvbnRyb2xsZXJzL2lzc3VlaXNoLWxpc3QtY29udHJvbGxlcic7XG5pbXBvcnQgUmVsYXlOZXR3b3JrTGF5ZXJNYW5hZ2VyIGZyb20gJy4uL3JlbGF5LW5ldHdvcmstbGF5ZXItbWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElzc3VlaXNoU2VhcmNoQ29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvLyBDb25uZWN0aW9uIGluZm9ybWF0aW9uXG4gICAgZW5kcG9pbnQ6IEVuZHBvaW50UHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICB0b2tlbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gU2VhcmNoIG1vZGVsXG4gICAgbGltaXQ6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgc2VhcmNoOiBTZWFyY2hQcm9wVHlwZS5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQWN0aW9uIG1ldGhvZHNcbiAgICBvbk9wZW5Jc3N1ZWlzaDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbk9wZW5TZWFyY2g6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25PcGVuUmV2aWV3czogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbGltaXQ6IDIwLFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcywgJ3JlbmRlclF1ZXJ5UmVzdWx0Jyk7XG5cbiAgICB0aGlzLnN1YiA9IG5ldyBEaXNwb3NhYmxlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSBSZWxheU5ldHdvcmtMYXllck1hbmFnZXIuZ2V0RW52aXJvbm1lbnRGb3JIb3N0KHRoaXMucHJvcHMuZW5kcG9pbnQsIHRoaXMucHJvcHMudG9rZW4pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuc2VhcmNoLmlzTnVsbCgpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QmFyZUlzc3VlaXNoTGlzdENvbnRyb2xsZXJcbiAgICAgICAgICBpc0xvYWRpbmc9e2ZhbHNlfVxuICAgICAgICAgIHsuLi50aGlzLmNvbnRyb2xsZXJQcm9wcygpfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBxdWVyeSA9IGdyYXBocWxgXG4gICAgICBxdWVyeSBpc3N1ZWlzaFNlYXJjaENvbnRhaW5lclF1ZXJ5KFxuICAgICAgICAkcXVlcnk6IFN0cmluZyFcbiAgICAgICAgJGZpcnN0OiBJbnQhXG4gICAgICAgICRjaGVja1N1aXRlQ291bnQ6IEludCFcbiAgICAgICAgJGNoZWNrU3VpdGVDdXJzb3I6IFN0cmluZ1xuICAgICAgICAkY2hlY2tSdW5Db3VudDogSW50IVxuICAgICAgICAkY2hlY2tSdW5DdXJzb3I6IFN0cmluZ1xuICAgICAgKSB7XG4gICAgICAgIHNlYXJjaChmaXJzdDogJGZpcnN0LCBxdWVyeTogJHF1ZXJ5LCB0eXBlOiBJU1NVRSkge1xuICAgICAgICAgIGlzc3VlQ291bnRcbiAgICAgICAgICBub2RlcyB7XG4gICAgICAgICAgICAuLi5pc3N1ZWlzaExpc3RDb250cm9sbGVyX3Jlc3VsdHMgQGFyZ3VtZW50cyhcbiAgICAgICAgICAgICAgY2hlY2tTdWl0ZUNvdW50OiAkY2hlY2tTdWl0ZUNvdW50XG4gICAgICAgICAgICAgIGNoZWNrU3VpdGVDdXJzb3I6ICRjaGVja1N1aXRlQ3Vyc29yXG4gICAgICAgICAgICAgIGNoZWNrUnVuQ291bnQ6ICRjaGVja1J1bkNvdW50XG4gICAgICAgICAgICAgIGNoZWNrUnVuQ3Vyc29yOiAkY2hlY2tSdW5DdXJzb3JcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgO1xuICAgIGNvbnN0IHZhcmlhYmxlcyA9IHtcbiAgICAgIHF1ZXJ5OiB0aGlzLnByb3BzLnNlYXJjaC5jcmVhdGVRdWVyeSgpLFxuICAgICAgZmlyc3Q6IHRoaXMucHJvcHMubGltaXQsXG4gICAgICBjaGVja1N1aXRlQ291bnQ6IENIRUNLX1NVSVRFX1BBR0VfU0laRSxcbiAgICAgIGNoZWNrU3VpdGVDdXJzb3I6IG51bGwsXG4gICAgICBjaGVja1J1bkNvdW50OiBDSEVDS19SVU5fUEFHRV9TSVpFLFxuICAgICAgY2hlY2tSdW5DdXJzb3I6IG51bGwsXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICA8UXVlcnlSZW5kZXJlclxuICAgICAgICBlbnZpcm9ubWVudD17ZW52aXJvbm1lbnR9XG4gICAgICAgIHZhcmlhYmxlcz17dmFyaWFibGVzfVxuICAgICAgICBxdWVyeT17cXVlcnl9XG4gICAgICAgIHJlbmRlcj17dGhpcy5yZW5kZXJRdWVyeVJlc3VsdH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclF1ZXJ5UmVzdWx0KHtlcnJvciwgcHJvcHN9KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QmFyZUlzc3VlaXNoTGlzdENvbnRyb2xsZXJcbiAgICAgICAgICBpc0xvYWRpbmc9e2ZhbHNlfVxuICAgICAgICAgIGVycm9yPXtlcnJvcn1cbiAgICAgICAgICB7Li4udGhpcy5jb250cm9sbGVyUHJvcHMoKX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QmFyZUlzc3VlaXNoTGlzdENvbnRyb2xsZXJcbiAgICAgICAgICBpc0xvYWRpbmc9e3RydWV9XG4gICAgICAgICAgey4uLnRoaXMuY29udHJvbGxlclByb3BzKCl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8SXNzdWVpc2hMaXN0Q29udHJvbGxlclxuICAgICAgICB0b3RhbD17cHJvcHMuc2VhcmNoLmlzc3VlQ291bnR9XG4gICAgICAgIHJlc3VsdHM9e3Byb3BzLnNlYXJjaC5ub2Rlc31cbiAgICAgICAgaXNMb2FkaW5nPXtmYWxzZX1cbiAgICAgICAgey4uLnRoaXMuY29udHJvbGxlclByb3BzKCl9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnN1Yi5kaXNwb3NlKCk7XG4gIH1cblxuICBjb250cm9sbGVyUHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiB0aGlzLnByb3BzLnNlYXJjaC5nZXROYW1lKCksXG5cbiAgICAgIG9uT3Blbklzc3VlaXNoOiB0aGlzLnByb3BzLm9uT3Blbklzc3VlaXNoLFxuICAgICAgb25PcGVuUmV2aWV3czogdGhpcy5wcm9wcy5vbk9wZW5SZXZpZXdzLFxuICAgICAgb25PcGVuTW9yZTogKCkgPT4gdGhpcy5wcm9wcy5vbk9wZW5TZWFyY2godGhpcy5wcm9wcy5zZWFyY2gpLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==