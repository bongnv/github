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
  issue: function () {
    const node = require("./__generated__/issueTimelineController_issue.graphql");

    if (node.hash && node.hash !== "d8cfa7a752ac7094c36e60da5e1ff895") {
      console.error("The definition of 'issueTimelineController_issue' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/issueTimelineController_issue.graphql");
  }
}, {
  direction: 'forward',

  getConnectionFromProps(props) {
    return props.issue.timeline;
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
      url: props.issue.url,
      timelineCount: count,
      timelineCursor: cursor
    };
  },

  query: function () {
    const node = require("./__generated__/issueTimelineControllerQuery.graphql");

    if (node.hash && node.hash !== "5a04d82da4187ed75fb5e133f79b4ab4") {
      console.error("The definition of 'issueTimelineControllerQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/issueTimelineControllerQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250cm9sbGVycy9pc3N1ZS10aW1lbGluZS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIklzc3VlaXNoVGltZWxpbmVWaWV3IiwiaXNzdWUiLCJkaXJlY3Rpb24iLCJnZXRDb25uZWN0aW9uRnJvbVByb3BzIiwicHJvcHMiLCJ0aW1lbGluZSIsImdldEZyYWdtZW50VmFyaWFibGVzIiwicHJldlZhcnMiLCJ0b3RhbENvdW50IiwidGltZWxpbmVDb3VudCIsImdldFZhcmlhYmxlcyIsImNvdW50IiwiY3Vyc29yIiwiZnJhZ21lbnRWYXJpYWJsZXMiLCJ1cmwiLCJ0aW1lbGluZUN1cnNvciIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7Ozs7Ozs7O2VBRWUsMkNBQTBCQSw2QkFBMUIsRUFBZ0Q7QUFDN0RDLEVBQUFBLEtBQUs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUR3RCxDQUFoRCxFQXVCWjtBQUNEQyxFQUFBQSxTQUFTLEVBQUUsU0FEVjs7QUFFREMsRUFBQUEsc0JBQXNCLENBQUNDLEtBQUQsRUFBUTtBQUM1QixXQUFPQSxLQUFLLENBQUNILEtBQU4sQ0FBWUksUUFBbkI7QUFDRCxHQUpBOztBQUtEQyxFQUFBQSxvQkFBb0IsQ0FBQ0MsUUFBRCxFQUFXQyxVQUFYLEVBQXVCO0FBQ3pDLDhCQUNLRCxRQURMO0FBRUVFLE1BQUFBLGFBQWEsRUFBRUQ7QUFGakI7QUFJRCxHQVZBOztBQVdERSxFQUFBQSxZQUFZLENBQUNOLEtBQUQsRUFBUTtBQUFDTyxJQUFBQSxLQUFEO0FBQVFDLElBQUFBO0FBQVIsR0FBUixFQUF5QkMsaUJBQXpCLEVBQTRDO0FBQ3RELFdBQU87QUFDTEMsTUFBQUEsR0FBRyxFQUFFVixLQUFLLENBQUNILEtBQU4sQ0FBWWEsR0FEWjtBQUVMTCxNQUFBQSxhQUFhLEVBQUVFLEtBRlY7QUFHTEksTUFBQUEsY0FBYyxFQUFFSDtBQUhYLEtBQVA7QUFLRCxHQWpCQTs7QUFrQkRJLEVBQUFBLEtBQUs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQWxCSixDQXZCWSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtncmFwaHFsLCBjcmVhdGVQYWdpbmF0aW9uQ29udGFpbmVyfSBmcm9tICdyZWFjdC1yZWxheSc7XG5cbmltcG9ydCBJc3N1ZWlzaFRpbWVsaW5lVmlldyBmcm9tICcuLi92aWV3cy9pc3N1ZWlzaC10aW1lbGluZS12aWV3JztcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlUGFnaW5hdGlvbkNvbnRhaW5lcihJc3N1ZWlzaFRpbWVsaW5lVmlldywge1xuICBpc3N1ZTogZ3JhcGhxbGBcbiAgICBmcmFnbWVudCBpc3N1ZVRpbWVsaW5lQ29udHJvbGxlcl9pc3N1ZSBvbiBJc3N1ZVxuICAgIEBhcmd1bWVudERlZmluaXRpb25zKFxuICAgICAgdGltZWxpbmVDb3VudDoge3R5cGU6IFwiSW50IVwifSxcbiAgICAgIHRpbWVsaW5lQ3Vyc29yOiB7dHlwZTogXCJTdHJpbmdcIn1cbiAgICApIHtcbiAgICAgIHVybFxuICAgICAgdGltZWxpbmVJdGVtcyhcbiAgICAgICAgZmlyc3Q6ICR0aW1lbGluZUNvdW50LCBhZnRlcjogJHRpbWVsaW5lQ3Vyc29yXG4gICAgICApIEBjb25uZWN0aW9uKGtleTogXCJJc3N1ZVRpbWVsaW5lQ29udHJvbGxlcl90aW1lbGluZUl0ZW1zXCIpIHtcbiAgICAgICAgcGFnZUluZm8geyBlbmRDdXJzb3IgaGFzTmV4dFBhZ2UgfVxuICAgICAgICBlZGdlcyB7XG4gICAgICAgICAgY3Vyc29yXG4gICAgICAgICAgbm9kZSB7XG4gICAgICAgICAgICBfX3R5cGVuYW1lXG4gICAgICAgICAgICAuLi5pc3N1ZUNvbW1lbnRWaWV3X2l0ZW1cbiAgICAgICAgICAgIC4uLmNyb3NzUmVmZXJlbmNlZEV2ZW50c1ZpZXdfbm9kZXNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIGAsXG59LCB7XG4gIGRpcmVjdGlvbjogJ2ZvcndhcmQnLFxuICBnZXRDb25uZWN0aW9uRnJvbVByb3BzKHByb3BzKSB7XG4gICAgcmV0dXJuIHByb3BzLmlzc3VlLnRpbWVsaW5lO1xuICB9LFxuICBnZXRGcmFnbWVudFZhcmlhYmxlcyhwcmV2VmFycywgdG90YWxDb3VudCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5wcmV2VmFycyxcbiAgICAgIHRpbWVsaW5lQ291bnQ6IHRvdGFsQ291bnQsXG4gICAgfTtcbiAgfSxcbiAgZ2V0VmFyaWFibGVzKHByb3BzLCB7Y291bnQsIGN1cnNvcn0sIGZyYWdtZW50VmFyaWFibGVzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVybDogcHJvcHMuaXNzdWUudXJsLFxuICAgICAgdGltZWxpbmVDb3VudDogY291bnQsXG4gICAgICB0aW1lbGluZUN1cnNvcjogY3Vyc29yLFxuICAgIH07XG4gIH0sXG4gIHF1ZXJ5OiBncmFwaHFsYFxuICAgIHF1ZXJ5IGlzc3VlVGltZWxpbmVDb250cm9sbGVyUXVlcnkoJHRpbWVsaW5lQ291bnQ6IEludCEsICR0aW1lbGluZUN1cnNvcjogU3RyaW5nLCAkdXJsOiBVUkkhKSB7XG4gICAgICByZXNvdXJjZSh1cmw6ICR1cmwpIHtcbiAgICAgICAgLi4uIG9uIElzc3VlIHtcbiAgICAgICAgICAuLi5pc3N1ZVRpbWVsaW5lQ29udHJvbGxlcl9pc3N1ZSBAYXJndW1lbnRzKHRpbWVsaW5lQ291bnQ6ICR0aW1lbGluZUNvdW50LCB0aW1lbGluZUN1cnNvcjogJHRpbWVsaW5lQ3Vyc29yKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgLFxufSk7XG4iXX0=