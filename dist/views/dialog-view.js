"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _panel = _interopRequireDefault(require("../atom/panel"));

var _tabbable = require("./tabbable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DialogView extends _react.default.Component {
  render() {
    return _react.default.createElement(_panel.default, {
      workspace: this.props.workspace,
      location: "modal"
    }, _react.default.createElement("div", {
      className: "github-Dialog"
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-Dialog"
    }, _react.default.createElement(_commands.Command, {
      command: "core:confirm",
      callback: this.props.accept
    }), _react.default.createElement(_commands.Command, {
      command: "core:cancel",
      callback: this.props.cancel
    })), this.props.prompt && _react.default.createElement("header", {
      className: "github-DialogPrompt"
    }, this.props.prompt), _react.default.createElement("main", {
      className: "github-DialogForm"
    }, this.props.children), _react.default.createElement("footer", {
      className: "github-DialogFooter"
    }, _react.default.createElement("div", {
      className: "github-DialogInfo"
    }, this.props.progressMessage && this.props.inProgress && _react.default.createElement(_react.Fragment, null, _react.default.createElement("span", {
      className: "inline-block loading loading-spinner-small"
    }), _react.default.createElement("span", {
      className: "github-DialogProgress-message"
    }, this.props.progressMessage)), this.props.error && _react.default.createElement("ul", {
      className: "error-messages"
    }, _react.default.createElement("li", null, this.props.error.userMessage || this.props.error.message))), _react.default.createElement("div", {
      className: "github-DialogButtons"
    }, _react.default.createElement(_tabbable.TabbableButton, {
      tabGroup: this.props.tabGroup,
      commands: this.props.commands,
      className: "btn github-Dialog-cancelButton",
      onClick: this.props.cancel
    }, "Cancel"), _react.default.createElement(_tabbable.TabbableButton, {
      tabGroup: this.props.tabGroup,
      commands: this.props.commands,
      className: (0, _classnames.default)('btn btn-primary github-Dialog-acceptButton', this.props.acceptClassName),
      onClick: this.props.accept,
      disabled: this.props.inProgress || !this.props.acceptEnabled
    }, this.props.acceptText)))));
  }

}

exports.default = DialogView;

_defineProperty(DialogView, "propTypes", {
  // Customization
  prompt: _propTypes.default.string,
  progressMessage: _propTypes.default.string,
  acceptEnabled: _propTypes.default.bool,
  acceptClassName: _propTypes.default.string,
  acceptText: _propTypes.default.string,
  // Callbacks
  accept: _propTypes.default.func.isRequired,
  cancel: _propTypes.default.func.isRequired,
  // State
  tabGroup: _propTypes.default.object.isRequired,
  inProgress: _propTypes.default.bool.isRequired,
  error: _propTypes.default.instanceOf(Error),
  // Atom environment
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  // Form content
  children: _propTypes.default.node.isRequired
});

_defineProperty(DialogView, "defaultProps", {
  acceptEnabled: true,
  acceptText: 'Accept'
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9kaWFsb2ctdmlldy5qcyJdLCJuYW1lcyI6WyJEaWFsb2dWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJyZW5kZXIiLCJwcm9wcyIsIndvcmtzcGFjZSIsImNvbW1hbmRzIiwiYWNjZXB0IiwiY2FuY2VsIiwicHJvbXB0IiwiY2hpbGRyZW4iLCJwcm9ncmVzc01lc3NhZ2UiLCJpblByb2dyZXNzIiwiZXJyb3IiLCJ1c2VyTWVzc2FnZSIsIm1lc3NhZ2UiLCJ0YWJHcm91cCIsImFjY2VwdENsYXNzTmFtZSIsImFjY2VwdEVuYWJsZWQiLCJhY2NlcHRUZXh0IiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiYm9vbCIsImZ1bmMiLCJpc1JlcXVpcmVkIiwib2JqZWN0IiwiaW5zdGFuY2VPZiIsIkVycm9yIiwibm9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVlLE1BQU1BLFVBQU4sU0FBeUJDLGVBQU1DLFNBQS9CLENBQXlDO0FBK0J0REMsRUFBQUEsTUFBTSxHQUFHO0FBQ1AsV0FDRSw2QkFBQyxjQUFEO0FBQU8sTUFBQSxTQUFTLEVBQUUsS0FBS0MsS0FBTCxDQUFXQyxTQUE3QjtBQUF3QyxNQUFBLFFBQVEsRUFBQztBQUFqRCxPQUNFO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNFLDZCQUFDLGlCQUFEO0FBQVUsTUFBQSxRQUFRLEVBQUUsS0FBS0QsS0FBTCxDQUFXRSxRQUEvQjtBQUF5QyxNQUFBLE1BQU0sRUFBQztBQUFoRCxPQUNFLDZCQUFDLGlCQUFEO0FBQVMsTUFBQSxPQUFPLEVBQUMsY0FBakI7QUFBZ0MsTUFBQSxRQUFRLEVBQUUsS0FBS0YsS0FBTCxDQUFXRztBQUFyRCxNQURGLEVBRUUsNkJBQUMsaUJBQUQ7QUFBUyxNQUFBLE9BQU8sRUFBQyxhQUFqQjtBQUErQixNQUFBLFFBQVEsRUFBRSxLQUFLSCxLQUFMLENBQVdJO0FBQXBELE1B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QUFBLFVBQVUsRUFBRTtBQUZRLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHtGcmFnbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjeCBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IENvbW1hbmRzLCB7Q29tbWFuZH0gZnJvbSAnLi4vYXRvbS9jb21tYW5kcyc7XG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vYXRvbS9wYW5lbCc7XG5pbXBvcnQge1RhYmJhYmxlQnV0dG9ufSBmcm9tICcuL3RhYmJhYmxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbG9nVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLy8gQ3VzdG9taXphdGlvblxuICAgIHByb21wdDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwcm9ncmVzc01lc3NhZ2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgYWNjZXB0RW5hYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgYWNjZXB0Q2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGFjY2VwdFRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAvLyBDYWxsYmFja3NcbiAgICBhY2NlcHQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY2FuY2VsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gU3RhdGVcbiAgICB0YWJHcm91cDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGluUHJvZ3Jlc3M6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgZXJyb3I6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEVycm9yKSxcblxuICAgIC8vIEF0b20gZW52aXJvbm1lbnRcbiAgICB3b3Jrc3BhY2U6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb21tYW5kczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXG4gICAgLy8gRm9ybSBjb250ZW50XG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGFjY2VwdEVuYWJsZWQ6IHRydWUsXG4gICAgYWNjZXB0VGV4dDogJ0FjY2VwdCcsXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbCB3b3Jrc3BhY2U9e3RoaXMucHJvcHMud29ya3NwYWNlfSBsb2NhdGlvbj1cIm1vZGFsXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLURpYWxvZ1wiPlxuICAgICAgICAgIDxDb21tYW5kcyByZWdpc3RyeT17dGhpcy5wcm9wcy5jb21tYW5kc30gdGFyZ2V0PVwiLmdpdGh1Yi1EaWFsb2dcIj5cbiAgICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOmNvbmZpcm1cIiBjYWxsYmFjaz17dGhpcy5wcm9wcy5hY2NlcHR9IC8+XG4gICAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpjYW5jZWxcIiBjYWxsYmFjaz17dGhpcy5wcm9wcy5jYW5jZWx9IC8+XG4gICAgICAgICAgPC9Db21tYW5kcz5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5wcm9tcHQgJiYgKFxuICAgICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJnaXRodWItRGlhbG9nUHJvbXB0XCI+e3RoaXMucHJvcHMucHJvbXB0fTwvaGVhZGVyPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPG1haW4gY2xhc3NOYW1lPVwiZ2l0aHViLURpYWxvZ0Zvcm1cIj5cbiAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgICA8Zm9vdGVyIGNsYXNzTmFtZT1cImdpdGh1Yi1EaWFsb2dGb290ZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLURpYWxvZ0luZm9cIj5cbiAgICAgICAgICAgICAge3RoaXMucHJvcHMucHJvZ3Jlc3NNZXNzYWdlICYmIHRoaXMucHJvcHMuaW5Qcm9ncmVzcyAmJiAoXG4gICAgICAgICAgICAgICAgPEZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1EaWFsb2dQcm9ncmVzcy1tZXNzYWdlXCI+e3RoaXMucHJvcHMucHJvZ3Jlc3NNZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5lcnJvciAmJiAoXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImVycm9yLW1lc3NhZ2VzXCI+XG4gICAgICAgICAgICAgICAgICA8bGk+e3RoaXMucHJvcHMuZXJyb3IudXNlck1lc3NhZ2UgfHwgdGhpcy5wcm9wcy5lcnJvci5tZXNzYWdlfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItRGlhbG9nQnV0dG9uc1wiPlxuICAgICAgICAgICAgICA8VGFiYmFibGVCdXR0b25cbiAgICAgICAgICAgICAgICB0YWJHcm91cD17dGhpcy5wcm9wcy50YWJHcm91cH1cbiAgICAgICAgICAgICAgICBjb21tYW5kcz17dGhpcy5wcm9wcy5jb21tYW5kc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gZ2l0aHViLURpYWxvZy1jYW5jZWxCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2FuY2VsfT5cbiAgICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgICAgPC9UYWJiYWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgPFRhYmJhYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgdGFiR3JvdXA9e3RoaXMucHJvcHMudGFiR3JvdXB9XG4gICAgICAgICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjeCgnYnRuIGJ0bi1wcmltYXJ5IGdpdGh1Yi1EaWFsb2ctYWNjZXB0QnV0dG9uJywgdGhpcy5wcm9wcy5hY2NlcHRDbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuYWNjZXB0fVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmluUHJvZ3Jlc3MgfHwgIXRoaXMucHJvcHMuYWNjZXB0RW5hYmxlZH0+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuYWNjZXB0VGV4dH1cbiAgICAgICAgICAgICAgPC9UYWJiYWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZm9vdGVyPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWw+XG4gICAgKTtcbiAgfVxufVxuIl19