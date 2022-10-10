"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _propTypes2 = require("../prop-types");

var _gitShellOutStrategy = require("../git-shell-out-strategy");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BranchMenuView extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      createNew: false,
      checkedOutBranch: null
    });

    _defineProperty(this, "didSelectItem", async event => {
      const branchName = event.target.value;
      await this.checkout(branchName);
    });

    _defineProperty(this, "createBranch", async () => {
      if (this.state.createNew) {
        const branchName = this.editorElement.getModel().getText().trim();
        await this.checkout(branchName, {
          createNew: true
        });
      } else {
        await new Promise(resolve => {
          this.setState({
            createNew: true
          }, () => {
            this.editorElement.focus();
            resolve();
          });
        });
      }
    });

    _defineProperty(this, "checkout", async (branchName, options) => {
      this.editorElement.classList.remove('is-focused');
      await new Promise(resolve => {
        this.setState({
          checkedOutBranch: branchName
        }, resolve);
      });

      try {
        await this.props.checkout(branchName, options);
        await new Promise(resolve => {
          this.setState({
            checkedOutBranch: null,
            createNew: false
          }, resolve);
        });
        this.editorElement.getModel().setText('');
      } catch (error) {
        this.editorElement.classList.add('is-focused');
        await new Promise(resolve => {
          this.setState({
            checkedOutBranch: null
          }, resolve);
        });

        if (!(error instanceof _gitShellOutStrategy.GitError)) {
          throw error;
        }
      }
    });

    _defineProperty(this, "cancelCreateNewBranch", () => {
      this.setState({
        createNew: false
      });
    });
  }

  render() {
    const branchNames = this.props.branches.getNames().filter(Boolean);
    let currentBranchName = this.props.currentBranch.isDetached() ? 'detached' : this.props.currentBranch.getName();

    if (this.state.checkedOutBranch) {
      currentBranchName = this.state.checkedOutBranch;

      if (branchNames.indexOf(this.state.checkedOutBranch) === -1) {
        branchNames.push(this.state.checkedOutBranch);
      }
    }

    const disableControls = !!this.state.checkedOutBranch;
    const branchEditorClasses = (0, _classnames.default)('github-BranchMenuView-item', 'github-BranchMenuView-editor', {
      hidden: !this.state.createNew
    });
    const branchSelectListClasses = (0, _classnames.default)('github-BranchMenuView-item', 'github-BranchMenuView-select', 'input-select', {
      hidden: !!this.state.createNew
    });
    const iconClasses = (0, _classnames.default)('github-BranchMenuView-item', 'icon', {
      'icon-git-branch': !disableControls,
      'icon-sync': disableControls
    });

    const newBranchEditor = _react.default.createElement("div", {
      className: branchEditorClasses
    }, _react.default.createElement("atom-text-editor", {
      ref: e => {
        this.editorElement = e;
      },
      mini: true,
      readonly: disableControls ? true : undefined
    }));

    const selectBranchView =
    /* eslint-disable jsx-a11y/no-onchange */
    _react.default.createElement("select", {
      className: branchSelectListClasses,
      onChange: this.didSelectItem,
      disabled: disableControls,
      value: currentBranchName
    }, this.props.currentBranch.isDetached() && _react.default.createElement("option", {
      key: "detached",
      value: "detached",
      disabled: true
    }, this.props.currentBranch.getName()), branchNames.map(branchName => {
      return _react.default.createElement("option", {
        key: `branch-${branchName}`,
        value: branchName
      }, branchName);
    }));

    return _react.default.createElement("div", {
      className: "github-BranchMenuView"
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-BranchMenuView-editor atom-text-editor[mini]"
    }, _react.default.createElement(_commands.Command, {
      command: "tool-panel:unfocus",
      callback: this.cancelCreateNewBranch
    }), _react.default.createElement(_commands.Command, {
      command: "core:cancel",
      callback: this.cancelCreateNewBranch
    }), _react.default.createElement(_commands.Command, {
      command: "core:confirm",
      callback: this.createBranch
    })), _react.default.createElement("div", {
      className: "github-BranchMenuView-selector"
    }, _react.default.createElement("span", {
      className: iconClasses
    }), newBranchEditor, selectBranchView, _react.default.createElement("button", {
      className: "github-BranchMenuView-item github-BranchMenuView-button btn",
      onClick: this.createBranch,
      disabled: disableControls
    }, " New Branch ")));
  }

}

exports.default = BranchMenuView;

_defineProperty(BranchMenuView, "propTypes", {
  // Atom environment
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  notificationManager: _propTypes.default.object.isRequired,
  // Model
  repository: _propTypes.default.object,
  branches: _propTypes2.BranchSetPropType.isRequired,
  currentBranch: _propTypes2.BranchPropType.isRequired,
  checkout: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9icmFuY2gtbWVudS12aWV3LmpzIl0sIm5hbWVzIjpbIkJyYW5jaE1lbnVWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjcmVhdGVOZXciLCJjaGVja2VkT3V0QnJhbmNoIiwiZXZlbnQiLCJicmFuY2hOYW1lIiwidGFyZ2V0IiwidmFsdWUiLCJjaGVja291dCIsInN0YXRlIiwiZWRpdG9yRWxlbWVudCIsImdldE1vZGVsIiwiZ2V0VGV4dCIsInRyaW0iLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFN0YXRlIiwiZm9jdXMiLCJvcHRpb25zIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwicHJvcHMiLCJzZXRUZXh0IiwiZXJyb3IiLCJhZGQiLCJHaXRFcnJvciIsInJlbmRlciIsImJyYW5jaE5hbWVzIiwiYnJhbmNoZXMiLCJnZXROYW1lcyIsImZpbHRlciIsIkJvb2xlYW4iLCJjdXJyZW50QnJhbmNoTmFtZSIsImN1cnJlbnRCcmFuY2giLCJpc0RldGFjaGVkIiwiZ2V0TmFtZSIsImluZGV4T2YiLCJwdXNoIiwiZGlzYWJsZUNvbnRyb2xzIiwiYnJhbmNoRWRpdG9yQ2xhc3NlcyIsImhpZGRlbiIsImJyYW5jaFNlbGVjdExpc3RDbGFzc2VzIiwiaWNvbkNsYXNzZXMiLCJuZXdCcmFuY2hFZGl0b3IiLCJlIiwidW5kZWZpbmVkIiwic2VsZWN0QnJhbmNoVmlldyIsImRpZFNlbGVjdEl0ZW0iLCJtYXAiLCJjb21tYW5kcyIsImNhbmNlbENyZWF0ZU5ld0JyYW5jaCIsImNyZWF0ZUJyYW5jaCIsIndvcmtzcGFjZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJub3RpZmljYXRpb25NYW5hZ2VyIiwicmVwb3NpdG9yeSIsIkJyYW5jaFNldFByb3BUeXBlIiwiQnJhbmNoUHJvcFR5cGUiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRWUs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O0FBQVEsTUFBQSxTQUFTLEVBQUMsNkRBQWxCO0FBQ0UsTUFBQSxPQUFPLEVBQUUsS0FBS0ssWUFEaEI7QUFDOEIsTUFBQSxRQUFRLEVBQUViO0FBRHhDLHNCQUpGLENBTkYsQ0FERjtBQWdCRDs7QUF0RnlEOzs7O2dCQUF2Q3ZDLGMsZUFDQTtBQUNqQjtBQUNBcUQsRUFBQUEsU0FBUyxFQUFFQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWDtBQUdqQk4sRUFBQUEsUUFBUSxFQUFFSSxtQkFBVUMsTUFBVixDQUFpQkMsVUFIVjtBQUlqQkMsRUFBQUEsbUJBQW1CLEVBQUVILG1CQUFVQyxNQUFWLENBQWlCQyxVQUpyQjtBQU1qQjtBQUNBRSxFQUFBQSxVQUFVLEVBQUVKLG1CQUFVQyxNQVBMO0FBUWpCMUIsRUFBQUEsUUFBUSxFQUFFOEIsOEJBQWtCSCxVQVJYO0FBU2pCdEIsRUFBQUEsYUFBYSxFQUFFMEIsMkJBQWVKLFVBVGI7QUFVakIvQyxFQUFBQSxRQUFRLEVBQUU2QyxtQkFBVU87QUFWSCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY3ggZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBDb21tYW5kcywge0NvbW1hbmR9IGZyb20gJy4uL2F0b20vY29tbWFuZHMnO1xuaW1wb3J0IHtCcmFuY2hQcm9wVHlwZSwgQnJhbmNoU2V0UHJvcFR5cGV9IGZyb20gJy4uL3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtHaXRFcnJvcn0gZnJvbSAnLi4vZ2l0LXNoZWxsLW91dC1zdHJhdGVneSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyYW5jaE1lbnVWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvLyBBdG9tIGVudmlyb25tZW50XG4gICAgd29ya3NwYWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWFuZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBub3RpZmljYXRpb25NYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAvLyBNb2RlbFxuICAgIHJlcG9zaXRvcnk6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgYnJhbmNoZXM6IEJyYW5jaFNldFByb3BUeXBlLmlzUmVxdWlyZWQsXG4gICAgY3VycmVudEJyYW5jaDogQnJhbmNoUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICBjaGVja291dDogUHJvcFR5cGVzLmZ1bmMsXG4gIH1cblxuICBzdGF0ZSA9IHtcbiAgICBjcmVhdGVOZXc6IGZhbHNlLFxuICAgIGNoZWNrZWRPdXRCcmFuY2g6IG51bGwsXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgYnJhbmNoTmFtZXMgPSB0aGlzLnByb3BzLmJyYW5jaGVzLmdldE5hbWVzKCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgIGxldCBjdXJyZW50QnJhbmNoTmFtZSA9IHRoaXMucHJvcHMuY3VycmVudEJyYW5jaC5pc0RldGFjaGVkKCkgPyAnZGV0YWNoZWQnIDogdGhpcy5wcm9wcy5jdXJyZW50QnJhbmNoLmdldE5hbWUoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5jaGVja2VkT3V0QnJhbmNoKSB7XG4gICAgICBjdXJyZW50QnJhbmNoTmFtZSA9IHRoaXMuc3RhdGUuY2hlY2tlZE91dEJyYW5jaDtcbiAgICAgIGlmIChicmFuY2hOYW1lcy5pbmRleE9mKHRoaXMuc3RhdGUuY2hlY2tlZE91dEJyYW5jaCkgPT09IC0xKSB7XG4gICAgICAgIGJyYW5jaE5hbWVzLnB1c2godGhpcy5zdGF0ZS5jaGVja2VkT3V0QnJhbmNoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkaXNhYmxlQ29udHJvbHMgPSAhIXRoaXMuc3RhdGUuY2hlY2tlZE91dEJyYW5jaDtcblxuICAgIGNvbnN0IGJyYW5jaEVkaXRvckNsYXNzZXMgPSBjeCgnZ2l0aHViLUJyYW5jaE1lbnVWaWV3LWl0ZW0nLCAnZ2l0aHViLUJyYW5jaE1lbnVWaWV3LWVkaXRvcicsIHtcbiAgICAgIGhpZGRlbjogIXRoaXMuc3RhdGUuY3JlYXRlTmV3LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYnJhbmNoU2VsZWN0TGlzdENsYXNzZXMgPSBjeCgnZ2l0aHViLUJyYW5jaE1lbnVWaWV3LWl0ZW0nLCAnZ2l0aHViLUJyYW5jaE1lbnVWaWV3LXNlbGVjdCcsICdpbnB1dC1zZWxlY3QnLCB7XG4gICAgICBoaWRkZW46ICEhdGhpcy5zdGF0ZS5jcmVhdGVOZXcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBpY29uQ2xhc3NlcyA9IGN4KCdnaXRodWItQnJhbmNoTWVudVZpZXctaXRlbScsICdpY29uJywge1xuICAgICAgJ2ljb24tZ2l0LWJyYW5jaCc6ICFkaXNhYmxlQ29udHJvbHMsXG4gICAgICAnaWNvbi1zeW5jJzogZGlzYWJsZUNvbnRyb2xzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbmV3QnJhbmNoRWRpdG9yID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2JyYW5jaEVkaXRvckNsYXNzZXN9PlxuICAgICAgICA8YXRvbS10ZXh0LWVkaXRvclxuICAgICAgICAgIHJlZj17ZSA9PiB7IHRoaXMuZWRpdG9yRWxlbWVudCA9IGU7IH19XG4gICAgICAgICAgbWluaT17dHJ1ZX1cbiAgICAgICAgICByZWFkb25seT17ZGlzYWJsZUNvbnRyb2xzID8gdHJ1ZSA6IHVuZGVmaW5lZH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICBjb25zdCBzZWxlY3RCcmFuY2hWaWV3ID0gKFxuICAgICAgLyogZXNsaW50LWRpc2FibGUganN4LWExMXkvbm8tb25jaGFuZ2UgKi9cbiAgICAgIDxzZWxlY3RcbiAgICAgICAgY2xhc3NOYW1lPXticmFuY2hTZWxlY3RMaXN0Q2xhc3Nlc31cbiAgICAgICAgb25DaGFuZ2U9e3RoaXMuZGlkU2VsZWN0SXRlbX1cbiAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVDb250cm9sc31cbiAgICAgICAgdmFsdWU9e2N1cnJlbnRCcmFuY2hOYW1lfT5cbiAgICAgICAge3RoaXMucHJvcHMuY3VycmVudEJyYW5jaC5pc0RldGFjaGVkKCkgJiZcbiAgICAgICAgICA8b3B0aW9uIGtleT1cImRldGFjaGVkXCIgdmFsdWU9XCJkZXRhY2hlZFwiIGRpc2FibGVkPnt0aGlzLnByb3BzLmN1cnJlbnRCcmFuY2guZ2V0TmFtZSgpfTwvb3B0aW9uPlxuICAgICAgICB9XG4gICAgICAgIHticmFuY2hOYW1lcy5tYXAoYnJhbmNoTmFtZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIDxvcHRpb24ga2V5PXtgYnJhbmNoLSR7YnJhbmNoTmFtZX1gfSB2YWx1ZT17YnJhbmNoTmFtZX0+e2JyYW5jaE5hbWV9PC9vcHRpb24+O1xuICAgICAgICB9KX1cbiAgICAgIDwvc2VsZWN0PlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItQnJhbmNoTWVudVZpZXdcIj5cbiAgICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9XCIuZ2l0aHViLUJyYW5jaE1lbnVWaWV3LWVkaXRvciBhdG9tLXRleHQtZWRpdG9yW21pbmldXCI+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cInRvb2wtcGFuZWw6dW5mb2N1c1wiIGNhbGxiYWNrPXt0aGlzLmNhbmNlbENyZWF0ZU5ld0JyYW5jaH0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpjYW5jZWxcIiBjYWxsYmFjaz17dGhpcy5jYW5jZWxDcmVhdGVOZXdCcmFuY2h9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImNvcmU6Y29uZmlybVwiIGNhbGxiYWNrPXt0aGlzLmNyZWF0ZUJyYW5jaH0gLz5cbiAgICAgICAgPC9Db21tYW5kcz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItQnJhbmNoTWVudVZpZXctc2VsZWN0b3JcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2ljb25DbGFzc2VzfSAvPlxuICAgICAgICAgIHtuZXdCcmFuY2hFZGl0b3J9XG4gICAgICAgICAge3NlbGVjdEJyYW5jaFZpZXd9XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJnaXRodWItQnJhbmNoTWVudVZpZXctaXRlbSBnaXRodWItQnJhbmNoTWVudVZpZXctYnV0dG9uIGJ0blwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNyZWF0ZUJyYW5jaH0gZGlzYWJsZWQ9e2Rpc2FibGVDb250cm9sc30+IE5ldyBCcmFuY2ggPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGRpZFNlbGVjdEl0ZW0gPSBhc3luYyBldmVudCA9PiB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0KGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgY3JlYXRlQnJhbmNoID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICh0aGlzLnN0YXRlLmNyZWF0ZU5ldykge1xuICAgICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMuZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldFRleHQoKS50cmltKCk7XG4gICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0KGJyYW5jaE5hbWUsIHtjcmVhdGVOZXc6IHRydWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NyZWF0ZU5ldzogdHJ1ZX0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmVkaXRvckVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tvdXQgPSBhc3luYyAoYnJhbmNoTmFtZSwgb3B0aW9ucykgPT4ge1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1mb2N1c2VkJyk7XG4gICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjaGVja2VkT3V0QnJhbmNoOiBicmFuY2hOYW1lfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMucHJvcHMuY2hlY2tvdXQoYnJhbmNoTmFtZSwgb3B0aW9ucyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2hlY2tlZE91dEJyYW5jaDogbnVsbCwgY3JlYXRlTmV3OiBmYWxzZX0sIHJlc29sdmUpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWZvY3VzZWQnKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjaGVja2VkT3V0QnJhbmNoOiBudWxsfSwgcmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgR2l0RXJyb3IpKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNhbmNlbENyZWF0ZU5ld0JyYW5jaCA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtjcmVhdGVOZXc6IGZhbHNlfSk7XG4gIH1cbn1cbiJdfQ==