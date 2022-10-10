"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _author = _interopRequireDefault(require("../models/author"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _helpers = require("../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CoAuthorForm extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _helpers.autobind)(this, 'confirm', 'cancel', 'onNameChange', 'onEmailChange', 'validate', 'focusFirstInput');
    this.state = {
      name: this.props.name,
      email: '',
      submitDisabled: true
    };
  }

  componentDidMount() {
    setTimeout(this.focusFirstInput);
  }

  render() {
    return _react.default.createElement("div", {
      className: "github-CoAuthorForm native-key-bindings"
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-CoAuthorForm"
    }, _react.default.createElement(_commands.Command, {
      command: "core:cancel",
      callback: this.cancel
    }), _react.default.createElement(_commands.Command, {
      command: "core:confirm",
      callback: this.confirm
    })), _react.default.createElement("label", {
      className: "github-CoAuthorForm-row"
    }, _react.default.createElement("span", {
      className: "github-CoAuthorForm-label"
    }, "Name:"), _react.default.createElement("input", {
      type: "text",
      placeholder: "Co-author name",
      ref: e => this.nameInput = e,
      className: "input-text github-CoAuthorForm-name",
      value: this.state.name,
      onChange: this.onNameChange,
      tabIndex: "1"
    })), _react.default.createElement("label", {
      className: "github-CoAuthorForm-row"
    }, _react.default.createElement("span", {
      className: "github-CoAuthorForm-label"
    }, "Email:"), _react.default.createElement("input", {
      type: "email",
      placeholder: "foo@bar.com",
      ref: e => this.emailInput = e,
      className: "input-text github-CoAuthorForm-email",
      value: this.state.email,
      onChange: this.onEmailChange,
      tabIndex: "2"
    })), _react.default.createElement("footer", {
      className: "github-CoAuthorForm-row has-buttons"
    }, _react.default.createElement("button", {
      className: "btn github-CancelButton",
      tabIndex: "3",
      onClick: this.cancel
    }, "Cancel"), _react.default.createElement("button", {
      className: "btn btn-primary",
      disabled: this.state.submitDisabled,
      tabIndex: "4",
      onClick: this.confirm
    }, "Add Co-Author")));
  }

  confirm() {
    if (this.isInputValid()) {
      this.props.onSubmit(new _author.default(this.state.email, this.state.name));
    }
  }

  cancel() {
    this.props.onCancel();
  }

  onNameChange(e) {
    this.setState({
      name: e.target.value
    }, this.validate);
  }

  onEmailChange(e) {
    this.setState({
      email: e.target.value
    }, this.validate);
  }

  validate() {
    if (this.isInputValid()) {
      this.setState({
        submitDisabled: false
      });
    }
  }

  isInputValid() {
    // email validation with regex has a LOT of corner cases, dawg.
    // https://stackoverflow.com/questions/48055431/can-it-cause-harm-to-validate-email-addresses-with-a-regex
    // to avoid bugs for users with nonstandard email addresses,
    // just check to make sure email address contains `@` and move on with our lives.
    return this.state.name && this.state.email.includes('@');
  }

  focusFirstInput() {
    this.nameInput.focus();
  }

}

exports.default = CoAuthorForm;

_defineProperty(CoAuthorForm, "propTypes", {
  commands: _propTypes.default.object.isRequired,
  onSubmit: _propTypes.default.func,
  onCancel: _propTypes.default.func,
  name: _propTypes.default.string
});

_defineProperty(CoAuthorForm, "defaultProps", {
  onSubmit: () => {},
  onCancel: () => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9jby1hdXRob3ItZm9ybS5qcyJdLCJuYW1lcyI6WyJDb0F1dGhvckZvcm0iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0Iiwic3RhdGUiLCJuYW1lIiwiZW1haWwiLCJzdWJtaXREaXNhYmxlZCIsImNvbXBvbmVudERpZE1vdW50Iiwic2V0VGltZW91dCIsImZvY3VzRmlyc3RJbnB1dCIsInJlbmRlciIsImNvbW1hbmRzIiwiY2FuY2VsIiwiY29uZmlybSIsImUiLCJuYW1lSW5wdXQiLCJvbk5hbWVDaGFuZ2UiLCJlbWFpbElucHV0Iiwib25FbWFpbENoYW5nZSIsImlzSW5wdXRWYWxpZCIsIm9uU3VibWl0IiwiQXV0aG9yIiwib25DYW5jZWwiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwidmFsaWRhdGUiLCJpbmNsdWRlcyIsImZvY3VzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFZSxNQUFNQSxZQUFOLFNBQTJCQyxlQUFNQyxTQUFqQyxDQUEyQztBQWF4REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVFDLE9BQVIsRUFBaUI7QUFDMUIsVUFBTUQsS0FBTixFQUFhQyxPQUFiO0FBQ0EsMkJBQVMsSUFBVCxFQUFlLFNBQWYsRUFBMEIsUUFBMUIsRUFBb0MsY0FBcEMsRUFBb0QsZUFBcEQsRUFBcUUsVUFBckUsRUFBaUYsaUJBQWpGO0FBRUEsU0FBS0MsS0FBTCxHQUFhO0FBQ1hDLE1BQUFBLElBQUksRUFBRSxLQUFLSCxLQUFMLENBQVdHLElBRE47QUFFWEMsTUFBQUEsS0FBSyxFQUFFLEVBRkk7QUFHWEMsTUFBQUEsY0FBYyxFQUFFO0FBSEwsS0FBYjtBQUtEOztBQUVEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQkMs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QUksS0FBS1AsWUFBTCxFQUFKLEVBQXlCO0FBQ3ZCLFdBQUtJLFFBQUwsQ0FBYztBQUFDakIsUUFBQUEsY0FBYyxFQUFFO0FBQWpCLE9BQWQ7QUFDRDtBQUNGOztBQUVEYSxFQUFBQSxZQUFZLEdBQUc7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQU8sS0FBS2hCLEtBQUwsQ0FBV0MsSUFBWCxJQUFtQixLQUFLRCxLQUFMLENBQVdFLEtBQVgsQ0FBaUJzQixRQUFqQixDQUEwQixHQUExQixDQUExQjtBQUNEOztBQUVEbEIsRUFBQUEsZUFBZSxHQUFHO0FBQ2hCLFNBQUtNLFNBQUwsQ0FBZWEsS0FBZjtBQUNEOztBQXZHdUQ7Ozs7Z0JBQXJDL0IsWSxlQUNBO0FBQ2pCYyxFQUFBQSxRQUFRLEVBQUVrQixtQkFBVUMsTUFBVixDQUFpQkMsVUFEVjtBQUVqQlgsRUFBQUEsUUFBUSxFQUFFUyxtQkFBVUcsSUFGSDtBQUdqQlYsRUFBQUEsUUFBUSxFQUFFTyxtQkFBVUcsSUFISDtBQUlqQjVCLEVBQUFBLElBQUksRUFBRXlCLG1CQUFVSTtBQUpDLEM7O2dCQURBcEMsWSxrQkFRRztBQUNwQnVCLEVBQUFBLFFBQVEsRUFBRSxNQUFNLENBQUUsQ0FERTtBQUVwQkUsRUFBQUEsUUFBUSxFQUFFLE1BQU0sQ0FBRTtBQUZFLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IEF1dGhvciBmcm9tICcuLi9tb2RlbHMvYXV0aG9yJztcbmltcG9ydCBDb21tYW5kcywge0NvbW1hbmR9IGZyb20gJy4uL2F0b20vY29tbWFuZHMnO1xuaW1wb3J0IHthdXRvYmluZH0gZnJvbSAnLi4vaGVscGVycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvQXV0aG9yRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY29tbWFuZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBvblN1Ym1pdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DYW5jZWw6IFByb3BUeXBlcy5mdW5jLFxuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIG9uU3VibWl0OiAoKSA9PiB7fSxcbiAgICBvbkNhbmNlbDogKCkgPT4ge30sXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICBhdXRvYmluZCh0aGlzLCAnY29uZmlybScsICdjYW5jZWwnLCAnb25OYW1lQ2hhbmdlJywgJ29uRW1haWxDaGFuZ2UnLCAndmFsaWRhdGUnLCAnZm9jdXNGaXJzdElucHV0Jyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbmFtZTogdGhpcy5wcm9wcy5uYW1lLFxuICAgICAgZW1haWw6ICcnLFxuICAgICAgc3VibWl0RGlzYWJsZWQ6IHRydWUsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHNldFRpbWVvdXQodGhpcy5mb2N1c0ZpcnN0SW5wdXQpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db0F1dGhvckZvcm0gbmF0aXZlLWtleS1iaW5kaW5nc1wiPlxuICAgICAgICA8Q29tbWFuZHMgcmVnaXN0cnk9e3RoaXMucHJvcHMuY29tbWFuZHN9IHRhcmdldD1cIi5naXRodWItQ29BdXRob3JGb3JtXCI+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImNvcmU6Y2FuY2VsXCIgY2FsbGJhY2s9e3RoaXMuY2FuY2VsfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOmNvbmZpcm1cIiBjYWxsYmFjaz17dGhpcy5jb25maXJtfSAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZ2l0aHViLUNvQXV0aG9yRm9ybS1yb3dcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItQ29BdXRob3JGb3JtLWxhYmVsXCI+TmFtZTo8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNvLWF1dGhvciBuYW1lXCJcbiAgICAgICAgICAgIHJlZj17ZSA9PiAodGhpcy5uYW1lSW5wdXQgPSBlKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlucHV0LXRleHQgZ2l0aHViLUNvQXV0aG9yRm9ybS1uYW1lXCJcbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5hbWVDaGFuZ2V9XG4gICAgICAgICAgICB0YWJJbmRleD1cIjFcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJnaXRodWItQ29BdXRob3JGb3JtLXJvd1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1Db0F1dGhvckZvcm0tbGFiZWxcIj5FbWFpbDo8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJmb29AYmFyLmNvbVwiXG4gICAgICAgICAgICByZWY9e2UgPT4gKHRoaXMuZW1haWxJbnB1dCA9IGUpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5wdXQtdGV4dCBnaXRodWItQ29BdXRob3JGb3JtLWVtYWlsXCJcbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmVtYWlsfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbWFpbENoYW5nZX1cbiAgICAgICAgICAgIHRhYkluZGV4PVwiMlwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGZvb3RlciBjbGFzc05hbWU9XCJnaXRodWItQ29BdXRob3JGb3JtLXJvdyBoYXMtYnV0dG9uc1wiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGdpdGh1Yi1DYW5jZWxCdXR0b25cIiB0YWJJbmRleD1cIjNcIiBvbkNsaWNrPXt0aGlzLmNhbmNlbH0+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17dGhpcy5zdGF0ZS5zdWJtaXREaXNhYmxlZH0gdGFiSW5kZXg9XCI0XCIgb25DbGljaz17dGhpcy5jb25maXJtfT5cbiAgICAgICAgICAgIEFkZCBDby1BdXRob3JcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9mb290ZXI+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29uZmlybSgpIHtcbiAgICBpZiAodGhpcy5pc0lucHV0VmFsaWQoKSkge1xuICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdChuZXcgQXV0aG9yKHRoaXMuc3RhdGUuZW1haWwsIHRoaXMuc3RhdGUubmFtZSkpO1xuICAgIH1cbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gIH1cblxuICBvbk5hbWVDaGFuZ2UoZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe25hbWU6IGUudGFyZ2V0LnZhbHVlfSwgdGhpcy52YWxpZGF0ZSk7XG4gIH1cblxuICBvbkVtYWlsQ2hhbmdlKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtlbWFpbDogZS50YXJnZXQudmFsdWV9LCB0aGlzLnZhbGlkYXRlKTtcbiAgfVxuXG4gIHZhbGlkYXRlKCkge1xuICAgIGlmICh0aGlzLmlzSW5wdXRWYWxpZCgpKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzdWJtaXREaXNhYmxlZDogZmFsc2V9KTtcbiAgICB9XG4gIH1cblxuICBpc0lucHV0VmFsaWQoKSB7XG4gICAgLy8gZW1haWwgdmFsaWRhdGlvbiB3aXRoIHJlZ2V4IGhhcyBhIExPVCBvZiBjb3JuZXIgY2FzZXMsIGRhd2cuXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDgwNTU0MzEvY2FuLWl0LWNhdXNlLWhhcm0tdG8tdmFsaWRhdGUtZW1haWwtYWRkcmVzc2VzLXdpdGgtYS1yZWdleFxuICAgIC8vIHRvIGF2b2lkIGJ1Z3MgZm9yIHVzZXJzIHdpdGggbm9uc3RhbmRhcmQgZW1haWwgYWRkcmVzc2VzLFxuICAgIC8vIGp1c3QgY2hlY2sgdG8gbWFrZSBzdXJlIGVtYWlsIGFkZHJlc3MgY29udGFpbnMgYEBgIGFuZCBtb3ZlIG9uIHdpdGggb3VyIGxpdmVzLlxuICAgIHJldHVybiB0aGlzLnN0YXRlLm5hbWUgJiYgdGhpcy5zdGF0ZS5lbWFpbC5pbmNsdWRlcygnQCcpO1xuICB9XG5cbiAgZm9jdXNGaXJzdElucHV0KCkge1xuICAgIHRoaXMubmFtZUlucHV0LmZvY3VzKCk7XG4gIH1cbn1cbiJdfQ==