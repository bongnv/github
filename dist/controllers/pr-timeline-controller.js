"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactRelay = require("react-relay");

var _issueishTimelineView = _interopRequireDefault(require("../views/issueish-timeline-view"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _reactRelay.createPaginationContainer)(_issueishTimelineView.default, {
  pullRequest: function () {
    const node = require("./__generated__/prTimelineController_pullRequest.graphql");

    if (node.hash && node.hash !== "048c72a9c157a3d7c9fdc301905a1eeb") {
      console.error("The definition of 'prTimelineController_pullRequest' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/prTimelineController_pullRequest.graphql");
  }
}, {
  direction: 'forward',

  getConnectionFromProps(props) {
    return props.pullRequest.timeline;
  },

  getFragmentVariables(prevVars, totalCount) {
    return _objectSpread2({}, prevVars, {
      timelineCount: totalCount
    });
  },

  getVariables(props, {
    count,
    cursor
  }, fragmentVariables) {
    return {
      url: props.pullRequest.url,
      timelineCount: count,
      timelineCursor: cursor
    };
  },

  query: function () {
    const node = require("./__generated__/prTimelineControllerQuery.graphql");

    if (node.hash && node.hash !== "9666ee294586973cd7b27193e460c2e1") {
      console.error("The definition of 'prTimelineControllerQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/prTimelineControllerQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250cm9sbGVycy9wci10aW1lbGluZS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIklzc3VlaXNoVGltZWxpbmVWaWV3IiwicHVsbFJlcXVlc3QiLCJkaXJlY3Rpb24iLCJnZXRDb25uZWN0aW9uRnJvbVByb3BzIiwicHJvcHMiLCJ0aW1lbGluZSIsImdldEZyYWdtZW50VmFyaWFibGVzIiwicHJldlZhcnMiLCJ0b3RhbENvdW50IiwidGltZWxpbmVDb3VudCIsImdldFZhcmlhYmxlcyIsImNvdW50IiwiY3Vyc29yIiwiZnJhZ21lbnRWYXJpYWJsZXMiLCJ1cmwiLCJ0aW1lbGluZUN1cnNvciIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7Ozs7Ozs7O2VBRWUsMkNBQTBCQSw2QkFBMUIsRUFBZ0Q7QUFDN0RDLEVBQUFBLFdBQVc7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQURrRCxDQUFoRCxFQTJCWjtBQUNEQyxFQUFBQSxTQUFTLEVBQUUsU0FEVjs7QUFFREMsRUFBQUEsc0JBQXNCLENBQUNDLEtBQUQsRUFBUTtBQUM1QixXQUFPQSxLQUFLLENBQUNILFdBQU4sQ0FBa0JJLFFBQXpCO0FBQ0QsR0FKQTs7QUFLREMsRUFBQUEsb0JBQW9CLENBQUNDLFFBQUQsRUFBV0MsVUFBWCxFQUF1QjtBQUN6Qyw4QkFDS0QsUUFETDtBQUVFRSxNQUFBQSxhQUFhLEVBQUVEO0FBRmpCO0FBSUQsR0FWQTs7QUFXREUsRUFBQUEsWUFBWSxDQUFDTixLQUFELEVBQVE7QUFBQ08sSUFBQUEsS0FBRDtBQUFRQyxJQUFBQTtBQUFSLEdBQVIsRUFBeUJDLGlCQUF6QixFQUE0QztBQUN0RCxXQUFPO0FBQ0xDLE1BQUFBLEdBQUcsRUFBRVYsS0FBSyxDQUFDSCxXQUFOLENBQWtCYSxHQURsQjtBQUVMTCxNQUFBQSxhQUFhLEVBQUVFLEtBRlY7QUFHTEksTUFBQUEsY0FBYyxFQUFFSDtBQUhYLEtBQVA7QUFLRCxHQWpCQTs7QUFrQkRJLEVBQUFBLEtBQUs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQWxCSixDQTNCWSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtncmFwaHFsLCBjcmVhdGVQYWdpbmF0aW9uQ29udGFpbmVyfSBmcm9tICdyZWFjdC1yZWxheSc7XG5cbmltcG9ydCBJc3N1ZWlzaFRpbWVsaW5lVmlldyBmcm9tICcuLi92aWV3cy9pc3N1ZWlzaC10aW1lbGluZS12aWV3JztcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlUGFnaW5hdGlvbkNvbnRhaW5lcihJc3N1ZWlzaFRpbWVsaW5lVmlldywge1xuICBwdWxsUmVxdWVzdDogZ3JhcGhxbGBcbiAgICBmcmFnbWVudCBwclRpbWVsaW5lQ29udHJvbGxlcl9wdWxsUmVxdWVzdCBvbiBQdWxsUmVxdWVzdFxuICAgIEBhcmd1bWVudERlZmluaXRpb25zKFxuICAgICAgdGltZWxpbmVDb3VudDoge3R5cGU6IFwiSW50IVwifSxcbiAgICAgIHRpbWVsaW5lQ3Vyc29yOiB7dHlwZTogXCJTdHJpbmdcIn1cbiAgICApIHtcbiAgICAgIHVybFxuICAgICAgLi4uaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2lzc3VlaXNoXG4gICAgICB0aW1lbGluZUl0ZW1zKGZpcnN0OiAkdGltZWxpbmVDb3VudCwgYWZ0ZXI6ICR0aW1lbGluZUN1cnNvcilcbiAgICAgIEBjb25uZWN0aW9uKGtleTogXCJwclRpbWVsaW5lQ29udGFpbmVyX3RpbWVsaW5lSXRlbXNcIikge1xuICAgICAgICBwYWdlSW5mbyB7IGVuZEN1cnNvciBoYXNOZXh0UGFnZSB9XG4gICAgICAgIGVkZ2VzIHtcbiAgICAgICAgICBjdXJzb3JcbiAgICAgICAgICBub2RlIHtcbiAgICAgICAgICAgIF9fdHlwZW5hbWVcbiAgICAgICAgICAgIC4uLmNvbW1pdHNWaWV3X25vZGVzXG4gICAgICAgICAgICAuLi5pc3N1ZUNvbW1lbnRWaWV3X2l0ZW1cbiAgICAgICAgICAgIC4uLm1lcmdlZEV2ZW50Vmlld19pdGVtXG4gICAgICAgICAgICAuLi5oZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXRlbVxuICAgICAgICAgICAgLi4uY29tbWl0Q29tbWVudFRocmVhZFZpZXdfaXRlbVxuICAgICAgICAgICAgLi4uY3Jvc3NSZWZlcmVuY2VkRXZlbnRzVmlld19ub2Rlc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgYCxcbn0sIHtcbiAgZGlyZWN0aW9uOiAnZm9yd2FyZCcsXG4gIGdldENvbm5lY3Rpb25Gcm9tUHJvcHMocHJvcHMpIHtcbiAgICByZXR1cm4gcHJvcHMucHVsbFJlcXVlc3QudGltZWxpbmU7XG4gIH0sXG4gIGdldEZyYWdtZW50VmFyaWFibGVzKHByZXZWYXJzLCB0b3RhbENvdW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnByZXZWYXJzLFxuICAgICAgdGltZWxpbmVDb3VudDogdG90YWxDb3VudCxcbiAgICB9O1xuICB9LFxuICBnZXRWYXJpYWJsZXMocHJvcHMsIHtjb3VudCwgY3Vyc29yfSwgZnJhZ21lbnRWYXJpYWJsZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXJsOiBwcm9wcy5wdWxsUmVxdWVzdC51cmwsXG4gICAgICB0aW1lbGluZUNvdW50OiBjb3VudCxcbiAgICAgIHRpbWVsaW5lQ3Vyc29yOiBjdXJzb3IsXG4gICAgfTtcbiAgfSxcbiAgcXVlcnk6IGdyYXBocWxgXG4gICAgcXVlcnkgcHJUaW1lbGluZUNvbnRyb2xsZXJRdWVyeSgkdGltZWxpbmVDb3VudDogSW50ISwgJHRpbWVsaW5lQ3Vyc29yOiBTdHJpbmcsICR1cmw6IFVSSSEpIHtcbiAgICAgIHJlc291cmNlKHVybDogJHVybCkge1xuICAgICAgICAuLi4gb24gUHVsbFJlcXVlc3Qge1xuICAgICAgICAgIC4uLnByVGltZWxpbmVDb250cm9sbGVyX3B1bGxSZXF1ZXN0IEBhcmd1bWVudHMoXG4gICAgICAgICAgICB0aW1lbGluZUNvdW50OiAkdGltZWxpbmVDb3VudCxcbiAgICAgICAgICAgIHRpbWVsaW5lQ3Vyc29yOiAkdGltZWxpbmVDdXJzb3JcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIGAsXG59KTtcbiJdfQ==