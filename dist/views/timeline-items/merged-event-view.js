"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BareMergedEventView = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactRelay = require("react-relay");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _octicon = _interopRequireDefault(require("../../atom/octicon"));

var _timeago = _interopRequireDefault(require("../../views/timeago"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BareMergedEventView extends _react.default.Component {
  render() {
    const {
      actor,
      mergeRefName,
      createdAt
    } = this.props.item;
    return _react.default.createElement("div", {
      className: "merged-event"
    }, _react.default.createElement(_octicon.default, {
      className: "pre-timeline-item-icon",
      icon: "git-merge"
    }), actor && _react.default.createElement("img", {
      className: "author-avatar",
      src: actor.avatarUrl,
      alt: actor.login,
      title: actor.login
    }), _react.default.createElement("span", {
      className: "merged-event-header"
    }, _react.default.createElement("span", {
      className: "username"
    }, actor ? actor.login : 'someone'), " merged", ' ', this.renderCommit(), " into", ' ', _react.default.createElement("span", {
      className: "merge-ref"
    }, mergeRefName), " on ", _react.default.createElement(_timeago.default, {
      time: createdAt
    })));
  }

  renderCommit() {
    const {
      commit
    } = this.props.item;

    if (!commit) {
      return 'a commit';
    }

    return _react.default.createElement(_react.Fragment, null, "commit ", _react.default.createElement("span", {
      className: "sha"
    }, commit.oid.slice(0, 8)));
  }

}

exports.BareMergedEventView = BareMergedEventView;

_defineProperty(BareMergedEventView, "propTypes", {
  item: _propTypes.default.shape({
    actor: _propTypes.default.shape({
      avatarUrl: _propTypes.default.string.isRequired,
      login: _propTypes.default.string.isRequired
    }),
    commit: _propTypes.default.shape({
      oid: _propTypes.default.string.isRequired
    }),
    mergeRefName: _propTypes.default.string.isRequired,
    createdAt: _propTypes.default.string.isRequired
  }).isRequired
});

var _default = (0, _reactRelay.createFragmentContainer)(BareMergedEventView, {
  item: function () {
    const node = require("./__generated__/mergedEventView_item.graphql");

    if (node.hash && node.hash !== "d265decf08c14d96c2ec47fd5852a956") {
      console.error("The definition of 'mergedEventView_item' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/mergedEventView_item.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi92aWV3cy90aW1lbGluZS1pdGVtcy9tZXJnZWQtZXZlbnQtdmlldy5qcyJdLCJuYW1lcyI6WyJCYXJlTWVyZ2VkRXZlbnRWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJyZW5kZXIiLCJhY3RvciIsIm1lcmdlUmVmTmFtZSIsImNyZWF0ZWRBdCIsInByb3BzIiwiaXRlbSIsImF2YXRhclVybCIsImxvZ2luIiwicmVuZGVyQ29tbWl0IiwiY29tbWl0Iiwib2lkIiwic2xpY2UiLCJQcm9wVHlwZXMiLCJzaGFwZSIsInN0cmluZyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFFTyxNQUFNQSxtQkFBTixTQUFrQ0MsZUFBTUMsU0FBeEMsQ0FBa0Q7QUFldkRDLEVBQUFBLE1BQU0sR0FBRztBQUNQLFVBQU07QUFBQ0MsTUFBQUEsS0FBRDtBQUFRQyxNQUFBQSxZQUFSO0FBQXNCQyxNQUFBQTtBQUF0QixRQUFtQyxLQUFLQyxLQUFMLENBQVdDLElBQXBEO0FBQ0EsV0FDRTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDRSw2QkFBQyxnQkFBRDtBQUFTLE1BQUEsU0FBUyxFQUFDLHdCQUFuQjtBQUE0QyxNQUFBLElBQUksRUFBQztBQUFqRCxNQURGLEVBRUdKLEtBQUssSUFBSTtBQUFLLE1BQUEsU0FBUyxFQUFDLGVBQWY7QUFBK0IsTUFBQSxHQUFHLEVBQUVBLEtBQUssQ0FBQ0ssU0FBMUM7QUFBcUQsTUFBQSxHQUFHLEVBQUVMLEtBQUssQ0FBQ00sS0FBaEU7QUFBdUUsTUFBQSxLQUFLLEVBQUVOLEtBQUssQ0FBQ007QUFBcEYsTUFGWixFQUdFO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDRTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQTRCTixLQUFLLEdBQUdBLEtBQUssQ0FBQ00sS0FBVCxHQUFpQixTQUFsRCxDQURGLGFBQzZFLEdBRDdFLEVBRUcsS0FBS0MsWUFBTCxFQUZILFdBR0csR0FISCxFQUdPO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FBNkJOLFlBQTdCLENBSFAsVUFHNEQsNkJBQUMsZ0JBQUQ7QUFBUyxNQUFBLElBQUksRUFBRUM7QUFBZixNQUg1RCxDQUhGLENBREY7QUFXRDs7QUFFREssRUFBQUEsWUFBWSxHQUFHO0FBQ2IsVUFBTTtBQUFDQyxNQUFBQTtBQUFELFFBQVcsS0FBS0wsS0FBTCxDQUFXQyxJQUE1Qjs7QUFDQSxRQUFJLENBQUNJLE1BQUwsRUFBYTtBQUNYLGFBQU8sVUFBUDtBQUNEOztBQUVELFdBQ0UsNkJBQUMsZUFBRCxtQkFDUztBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQXVCQSxNQUFNLENBQUNDLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQixDQUFqQixFQUFvQixDQUFwQixDQUF2QixDQURULENBREY7QUFLRDs7QUF6Q3NEOzs7O2dCQUE1Q2QsbUIsZUFDUTtBQUNqQlEsRUFBQUEsSUFBSSxFQUFFTyxtQkFBVUMsS0FBVixDQUFnQjtBQUNwQlosSUFBQUEsS0FBSyxFQUFFVyxtQkFBVUMsS0FBVixDQUFnQjtBQUNyQlAsTUFBQUEsU0FBUyxFQUFFTSxtQkFBVUUsTUFBVixDQUFpQkMsVUFEUDtBQUVyQlIsTUFBQUEsS0FBSyxFQUFFSyxtQkFBVUUsTUFBVixDQUFpQkM7QUFGSCxLQUFoQixDQURhO0FBS3BCTixJQUFBQSxNQUFNLEVBQUVHLG1CQUFVQyxLQUFWLENBQWdCO0FBQ3RCSCxNQUFBQSxHQUFHLEVBQUVFLG1CQUFVRSxNQUFWLENBQWlCQztBQURBLEtBQWhCLENBTFk7QUFRcEJiLElBQUFBLFlBQVksRUFBRVUsbUJBQVVFLE1BQVYsQ0FBaUJDLFVBUlg7QUFTcEJaLElBQUFBLFNBQVMsRUFBRVMsbUJBQVVFLE1BQVYsQ0FBaUJDO0FBVFIsR0FBaEIsRUFVSEE7QUFYYyxDOztlQTJDTix5Q0FBd0JsQixtQkFBeEIsRUFBNkM7QUFDMURRLEVBQUFBLElBQUk7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQURzRCxDQUE3QyxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Z3JhcGhxbCwgY3JlYXRlRnJhZ21lbnRDb250YWluZXJ9IGZyb20gJ3JlYWN0LXJlbGF5JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCBPY3RpY29uIGZyb20gJy4uLy4uL2F0b20vb2N0aWNvbic7XG5pbXBvcnQgVGltZWFnbyBmcm9tICcuLi8uLi92aWV3cy90aW1lYWdvJztcblxuZXhwb3J0IGNsYXNzIEJhcmVNZXJnZWRFdmVudFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGl0ZW06IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBhY3RvcjogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgYXZhdGFyVXJsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGxvZ2luOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB9KSxcbiAgICAgIGNvbW1pdDogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgb2lkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB9KSxcbiAgICAgIG1lcmdlUmVmTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgY3JlYXRlZEF0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfSkuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7YWN0b3IsIG1lcmdlUmVmTmFtZSwgY3JlYXRlZEF0fSA9IHRoaXMucHJvcHMuaXRlbTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXJnZWQtZXZlbnRcIj5cbiAgICAgICAgPE9jdGljb24gY2xhc3NOYW1lPVwicHJlLXRpbWVsaW5lLWl0ZW0taWNvblwiIGljb249XCJnaXQtbWVyZ2VcIiAvPlxuICAgICAgICB7YWN0b3IgJiYgPGltZyBjbGFzc05hbWU9XCJhdXRob3ItYXZhdGFyXCIgc3JjPXthY3Rvci5hdmF0YXJVcmx9IGFsdD17YWN0b3IubG9naW59IHRpdGxlPXthY3Rvci5sb2dpbn0gLz59XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm1lcmdlZC1ldmVudC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ1c2VybmFtZVwiPnthY3RvciA/IGFjdG9yLmxvZ2luIDogJ3NvbWVvbmUnfTwvc3Bhbj4gbWVyZ2VkeycgJ31cbiAgICAgICAgICB7dGhpcy5yZW5kZXJDb21taXQoKX0gaW50b1xuICAgICAgICAgIHsnICd9PHNwYW4gY2xhc3NOYW1lPVwibWVyZ2UtcmVmXCI+e21lcmdlUmVmTmFtZX08L3NwYW4+IG9uIDxUaW1lYWdvIHRpbWU9e2NyZWF0ZWRBdH0gLz5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbW1pdCgpIHtcbiAgICBjb25zdCB7Y29tbWl0fSA9IHRoaXMucHJvcHMuaXRlbTtcbiAgICBpZiAoIWNvbW1pdCkge1xuICAgICAgcmV0dXJuICdhIGNvbW1pdCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgY29tbWl0IDxzcGFuIGNsYXNzTmFtZT1cInNoYVwiPntjb21taXQub2lkLnNsaWNlKDAsIDgpfTwvc3Bhbj5cbiAgICAgIDwvRnJhZ21lbnQ+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVGcmFnbWVudENvbnRhaW5lcihCYXJlTWVyZ2VkRXZlbnRWaWV3LCB7XG4gIGl0ZW06IGdyYXBocWxgXG4gICAgZnJhZ21lbnQgbWVyZ2VkRXZlbnRWaWV3X2l0ZW0gb24gTWVyZ2VkRXZlbnQge1xuICAgICAgYWN0b3Ige1xuICAgICAgICBhdmF0YXJVcmwgbG9naW5cbiAgICAgIH1cbiAgICAgIGNvbW1pdCB7IG9pZCB9XG4gICAgICBtZXJnZVJlZk5hbWVcbiAgICAgIGNyZWF0ZWRBdFxuICAgIH1cbiAgYCxcbn0pO1xuIl19