"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _moment = _interopRequireDefault(require("moment"));

var _classnames = _interopRequireDefault(require("classnames"));

var _nodeEmoji = require("node-emoji");

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _commitView = _interopRequireDefault(require("./commit-view"));

var _timeago = _interopRequireDefault(require("./timeago"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RecentCommitView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "copyCommitSha", event => {
      event.stopPropagation();
      const {
        commit,
        clipboard
      } = this.props;
      clipboard.write(commit.sha);
    });

    _defineProperty(this, "copyCommitSubject", event => {
      event.stopPropagation();
      const {
        commit,
        clipboard
      } = this.props;
      clipboard.write(commit.messageSubject);
    });

    _defineProperty(this, "undoLastCommit", event => {
      event.stopPropagation();
      this.props.undoLastCommit();
    });

    this.refRoot = new _refHolder.default();
  }

  componentDidMount() {
    if (this.props.isSelected) {
      this.refRoot.map(root => root.scrollIntoViewIfNeeded(false));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isSelected && !prevProps.isSelected) {
      this.refRoot.map(root => root.scrollIntoViewIfNeeded(false));
    }
  }

  render() {
    const authorMoment = (0, _moment.default)(this.props.commit.getAuthorDate() * 1000);
    const fullMessage = this.props.commit.getFullMessage();
    return _react.default.createElement("li", {
      ref: this.refRoot.setter,
      className: (0, _classnames.default)('github-RecentCommit', {
        'most-recent': this.props.isMostRecent,
        'is-selected': this.props.isSelected
      }),
      onClick: this.props.openCommit
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: this.refRoot
    }, _react.default.createElement(_commands.Command, {
      command: "github:copy-commit-sha",
      callback: this.copyCommitSha
    }), _react.default.createElement(_commands.Command, {
      command: "github:copy-commit-subject",
      callback: this.copyCommitSubject
    })), this.renderAuthors(), _react.default.createElement("span", {
      className: "github-RecentCommit-message",
      title: (0, _nodeEmoji.emojify)(fullMessage)
    }, (0, _nodeEmoji.emojify)(this.props.commit.getMessageSubject())), this.props.isMostRecent && _react.default.createElement("button", {
      className: "btn github-RecentCommit-undoButton",
      onClick: this.undoLastCommit
    }, "Undo"), _react.default.createElement(_timeago.default, {
      className: "github-RecentCommit-time",
      type: "time",
      displayStyle: "short",
      time: authorMoment,
      title: authorMoment.format('MMM Do, YYYY')
    }));
  }

  renderAuthor(author) {
    const email = author.getEmail();
    const avatarUrl = author.getAvatarUrl();
    return _react.default.createElement("img", {
      className: "github-RecentCommit-avatar",
      key: email,
      src: avatarUrl,
      title: email,
      alt: `${email}'s avatar'`
    });
  }

  renderAuthors() {
    const coAuthors = this.props.commit.getCoAuthors();
    const authors = [this.props.commit.getAuthor(), ...coAuthors];
    return _react.default.createElement("span", {
      className: "github-RecentCommit-authors"
    }, authors.map(this.renderAuthor));
  }

}

_defineProperty(RecentCommitView, "propTypes", {
  commands: _propTypes.default.object.isRequired,
  clipboard: _propTypes.default.object.isRequired,
  commit: _propTypes.default.object.isRequired,
  undoLastCommit: _propTypes.default.func.isRequired,
  isMostRecent: _propTypes.default.bool.isRequired,
  openCommit: _propTypes.default.func.isRequired,
  isSelected: _propTypes.default.bool.isRequired
});

class RecentCommitsView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "openSelectedCommit", () => this.props.openCommit({
      sha: this.props.selectedCommitSha,
      preserveFocus: false
    }));

    this.refRoot = new _refHolder.default();
  }

  setFocus(focus) {
    if (focus === this.constructor.focus.RECENT_COMMIT) {
      return this.refRoot.map(element => {
        element.focus();
        return true;
      }).getOr(false);
    }

    return false;
  }

  getFocus(element) {
    return this.refRoot.map(e => e.contains(element)).getOr(false) ? this.constructor.focus.RECENT_COMMIT : null;
  }

  render() {
    return _react.default.createElement("div", {
      className: "github-RecentCommits",
      tabIndex: "-1",
      ref: this.refRoot.setter
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: this.refRoot
    }, _react.default.createElement(_commands.Command, {
      command: "core:move-down",
      callback: this.props.selectNextCommit
    }), _react.default.createElement(_commands.Command, {
      command: "core:move-up",
      callback: this.props.selectPreviousCommit
    }), _react.default.createElement(_commands.Command, {
      command: "github:dive",
      callback: this.openSelectedCommit
    })), this.renderCommits());
  }

  renderCommits() {
    if (this.props.commits.length === 0) {
      if (this.props.isLoading) {
        return _react.default.createElement("div", {
          className: "github-RecentCommits-message"
        }, "Recent commits");
      } else {
        return _react.default.createElement("div", {
          className: "github-RecentCommits-message"
        }, "Make your first commit");
      }
    } else {
      return _react.default.createElement("ul", {
        className: "github-RecentCommits-list"
      }, this.props.commits.map((commit, i) => {
        return _react.default.createElement(RecentCommitView, {
          key: commit.getSha(),
          commands: this.props.commands,
          clipboard: this.props.clipboard,
          isMostRecent: i === 0,
          commit: commit,
          undoLastCommit: this.props.undoLastCommit,
          openCommit: () => this.props.openCommit({
            sha: commit.getSha(),
            preserveFocus: true
          }),
          isSelected: this.props.selectedCommitSha === commit.getSha()
        });
      }));
    }
  }

  advanceFocusFrom(focus) {
    if (focus === this.constructor.focus.RECENT_COMMIT) {
      return Promise.resolve(this.constructor.focus.RECENT_COMMIT);
    }

    return Promise.resolve(null);
  }

  retreatFocusFrom(focus) {
    if (focus === this.constructor.focus.RECENT_COMMIT) {
      return Promise.resolve(_commitView.default.lastFocus);
    }

    return Promise.resolve(null);
  }

}

exports.default = RecentCommitsView;

_defineProperty(RecentCommitsView, "propTypes", {
  // Model state
  commits: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  isLoading: _propTypes.default.bool.isRequired,
  selectedCommitSha: _propTypes.default.string.isRequired,
  // Atom environment
  clipboard: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  // Action methods
  undoLastCommit: _propTypes.default.func.isRequired,
  openCommit: _propTypes.default.func.isRequired,
  selectNextCommit: _propTypes.default.func.isRequired,
  selectPreviousCommit: _propTypes.default.func.isRequired
});

_defineProperty(RecentCommitsView, "focus", {
  RECENT_COMMIT: Symbol('recent_commit')
});

_defineProperty(RecentCommitsView, "firstFocus", RecentCommitsView.focus.RECENT_COMMIT);

_defineProperty(RecentCommitsView, "lastFocus", RecentCommitsView.focus.RECENT_COMMIT);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9yZWNlbnQtY29tbWl0cy12aWV3LmpzIl0sIm5hbWVzIjpbIlJlY2VudENvbW1pdFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsImNvbW1pdCIsImNsaXBib2FyZCIsIndyaXRlIiwic2hhIiwibWVzc2FnZVN1YmplY3QiLCJ1bmRvTGFzdENvbW1pdCIsInJlZlJvb3QiLCJSZWZIb2xkZXIiLCJjb21wb25lbnREaWRNb3VudCIsImlzU2VsZWN0ZWQiLCJtYXAiLCJyb290Iiwic2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInJlbmRlciIsImF1dGhvck1vbWVudCIsImdldEF1dGhvckRhdGUiLCJmdWxsTWVzc2FnZSIsImdldEZ1bGxNZXNzYWdlIiwic2V0dGVyIiwiaXNNb3N0UmVjZW50Iiwib3BlbkNvbW1pdCIsImNvbW1hbmRzIiwiY29weUNvbW1pdFNoYSIsImNvcHlDb21taXRTdWJqZWN0IiwicmVuZGVyQXV0aG9ycyIsImdldE1lc3NhZ2VTdWJqZWN0IiwiZm9ybWF0IiwicmVuZGVyQXV0aG9yIiwiYXV0aG9yIiwiZW1haWwiLCJnZXRFbWFpbCIsImF2YXRhclVybCIsImdldEF2YXRhclVybCIsImNvQXV0aG9ycyIsImdldENvQXV0aG9ycyIsImF1dGhvcnMiLCJnZXRBdXRob3IiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZnVuYyIsImJvb2wiLCJSZWNlbnRDb21taXRzVmlldyIsInNlbGVjdGVkQ29tbWl0U2hhIiwicHJlc2VydmVGb2N1cyIsInNldEZvY3VzIiwiZm9jdXMiLCJSRUNFTlRfQ09NTUlUIiwiZWxlbWVudCIsImdldE9yIiwiZ2V0Rm9jdXMiLCJlIiwiY29udGFpbnMiLCJzZWxlY3ROZXh0Q29tbWl0Iiwic2VsZWN0UHJldmlvdXNDb21taXQiLCJvcGVuU2VsZWN0ZWRDb21taXQiLCJyZW5kZXJDb21taXRzIiwiY29tbWl0cyIsImxlbmd0aCIsImlzTG9hZGluZyIsImkiLCJnZXRTaGEiLCJhZHZhbmNlRm9jdXNGcm9tIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZXRyZWF0Rm9jdXNGcm9tIiwiQ29tbWl0VmlldyIsImxhc3RGb2N1cyIsImFycmF5T2YiLCJzdHJpbmciLCJTeW1ib2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxnQkFBTixTQUErQkMsZUFBTUMsU0FBckMsQ0FBK0M7QUFXN0NDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47O0FBRGlCLDJDQW1GSEMsS0FBSyxJQUFJO0FBQ3ZCQSxNQUFBQSxLQUFLLENBQUNDLGVBQU47QUFDQSxZQUFNO0FBQUNDLFFBQUFBLE1BQUQ7QUFBU0MsUUFBQUE7QUFBVCxVQUFzQixLQUFLSixLQUFqQztBQUNBSSxNQUFBQSxTQUFTLENBQUNDLEtBQVYsQ0FBZ0JGLE1BQU0sQ0FBQ0csR0FBdkI7QUFDRCxLQXZGa0I7O0FBQUEsK0NBeUZDTCxLQUFLLElBQUk7QUFDM0JBLE1BQUFBLEtBQUssQ0FBQ0MsZUFBTjtBQUNBLFlBQU07QUFBQ0MsUUFBQUEsTUFBRDtBQUFTQyxRQUFBQTtBQUFULFVBQXNCLEtBQUtKLEtBQWpDO0FBQ0FJLE1BQUFBLFNBQVMsQ0FBQ0MsS0FBVixDQUFnQkYsTUFBTSxDQUFDSSxjQUF2QjtBQUNELEtBN0ZrQjs7QUFBQSw0Q0ErRkZOLEtBQUssSUFBSTtBQUN4QkEsTUFBQUEsS0FBSyxDQUFDQyxlQUFOO0FBQ0EsV0FBS0YsS0FBTCxDQUFXUSxjQUFYO0FBQ0QsS0FsR2tCOztBQUdqQixTQUFLQyxPQUFMLEdBQWUsSUFBSUMsa0JBQUosRUFBZjtBQUNEOztBQUVEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixRQUFJLEtB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LFVBYmhCO0FBY2pCZSxFQUFBQSxvQkFBb0IsRUFBRWpCLG1CQUFVRyxJQUFWLENBQWVEO0FBZHBCLEM7O2dCQURBRyxpQixXQWtCSjtBQUNiSyxFQUFBQSxhQUFhLEVBQUV1QixNQUFNLENBQUMsZUFBRDtBQURSLEM7O2dCQWxCSTVCLGlCLGdCQXNCQ0EsaUJBQWlCLENBQUNJLEtBQWxCLENBQXdCQyxhOztnQkF0QnpCTCxpQixlQXdCQUEsaUJBQWlCLENBQUNJLEtBQWxCLENBQXdCQyxhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgY3ggZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge2Vtb2ppZnl9IGZyb20gJ25vZGUtZW1vamknO1xuXG5pbXBvcnQgQ29tbWFuZHMsIHtDb21tYW5kfSBmcm9tICcuLi9hdG9tL2NvbW1hbmRzJztcbmltcG9ydCBSZWZIb2xkZXIgZnJvbSAnLi4vbW9kZWxzL3JlZi1ob2xkZXInO1xuXG5pbXBvcnQgQ29tbWl0VmlldyBmcm9tICcuL2NvbW1pdC12aWV3JztcbmltcG9ydCBUaW1lYWdvIGZyb20gJy4vdGltZWFnbyc7XG5cbmNsYXNzIFJlY2VudENvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNvbW1hbmRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY2xpcGJvYXJkOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWl0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdW5kb0xhc3RDb21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgaXNNb3N0UmVjZW50OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG9wZW5Db21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMucmVmUm9vdCA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGlmICh0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMucmVmUm9vdC5tYXAocm9vdCA9PiByb290LnNjcm9sbEludG9WaWV3SWZOZWVkZWQoZmFsc2UpKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNTZWxlY3RlZCAmJiAhcHJldlByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMucmVmUm9vdC5tYXAocm9vdCA9PiByb290LnNjcm9sbEludG9WaWV3SWZOZWVkZWQoZmFsc2UpKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgYXV0aG9yTW9tZW50ID0gbW9tZW50KHRoaXMucHJvcHMuY29tbWl0LmdldEF1dGhvckRhdGUoKSAqIDEwMDApO1xuICAgIGNvbnN0IGZ1bGxNZXNzYWdlID0gdGhpcy5wcm9wcy5jb21taXQuZ2V0RnVsbE1lc3NhZ2UoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8bGlcbiAgICAgICAgcmVmPXt0aGlzLnJlZlJvb3Quc2V0dGVyfVxuICAgICAgICBjbGFzc05hbWU9e2N4KCdnaXRodWItUmVjZW50Q29tbWl0Jywge1xuICAgICAgICAgICdtb3N0LXJlY2VudCc6IHRoaXMucHJvcHMuaXNNb3N0UmVjZW50LFxuICAgICAgICAgICdpcy1zZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICAgICAgfSl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub3BlbkNvbW1pdH0+XG4gICAgICAgIDxDb21tYW5kcyByZWdpc3RyeT17dGhpcy5wcm9wcy5jb21tYW5kc30gdGFyZ2V0PXt0aGlzLnJlZlJvb3R9PlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6Y29weS1jb21taXQtc2hhXCIgY2FsbGJhY2s9e3RoaXMuY29weUNvbW1pdFNoYX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmNvcHktY29tbWl0LXN1YmplY3RcIiBjYWxsYmFjaz17dGhpcy5jb3B5Q29tbWl0U3ViamVjdH0gLz5cbiAgICAgICAgPC9Db21tYW5kcz5cbiAgICAgICAge3RoaXMucmVuZGVyQXV0aG9ycygpfVxuICAgICAgICA8c3BhblxuICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1SZWNlbnRDb21taXQtbWVzc2FnZVwiXG4gICAgICAgICAgdGl0bGU9e2Vtb2ppZnkoZnVsbE1lc3NhZ2UpfT5cbiAgICAgICAgICB7ZW1vamlmeSh0aGlzLnByb3BzLmNvbW1pdC5nZXRNZXNzYWdlU3ViamVjdCgpKX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICB7dGhpcy5wcm9wcy5pc01vc3RSZWNlbnQgJiYgKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBnaXRodWItUmVjZW50Q29tbWl0LXVuZG9CdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy51bmRvTGFzdENvbW1pdH0+XG4gICAgICAgICAgICBVbmRvXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICl9XG4gICAgICAgIDxUaW1lYWdvXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLVJlY2VudENvbW1pdC10aW1lXCJcbiAgICAgICAgICB0eXBlPVwidGltZVwiXG4gICAgICAgICAgZGlzcGxheVN0eWxlPVwic2hvcnRcIlxuICAgICAgICAgIHRpbWU9e2F1dGhvck1vbWVudH1cbiAgICAgICAgICB0aXRsZT17YXV0aG9yTW9tZW50LmZvcm1hdCgnTU1NIERvLCBZWVlZJyl9XG4gICAgICAgIC8+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJBdXRob3IoYXV0aG9yKSB7XG4gICAgY29uc3QgZW1haWwgPSBhdXRob3IuZ2V0RW1haWwoKTtcbiAgICBjb25zdCBhdmF0YXJVcmwgPSBhdXRob3IuZ2V0QXZhdGFyVXJsKCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGltZyBjbGFzc05hbWU9XCJnaXRodWItUmVjZW50Q29tbWl0LWF2YXRhclwiXG4gICAgICAgIGtleT17ZW1haWx9XG4gICAgICAgIHNyYz17YXZhdGFyVXJsfVxuICAgICAgICB0aXRsZT17ZW1haWx9XG4gICAgICAgIGFsdD17YCR7ZW1haWx9J3MgYXZhdGFyJ2B9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJBdXRob3JzKCkge1xuICAgIGNvbnN0IGNvQXV0aG9ycyA9IHRoaXMucHJvcHMuY29tbWl0LmdldENvQXV0aG9ycygpO1xuICAgIGNvbnN0IGF1dGhvcnMgPSBbdGhpcy5wcm9wcy5jb21taXQuZ2V0QXV0aG9yKCksIC4uLmNvQXV0aG9yc107XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ2l0aHViLVJlY2VudENvbW1pdC1hdXRob3JzXCI+XG4gICAgICAgIHthdXRob3JzLm1hcCh0aGlzLnJlbmRlckF1dGhvcil9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIGNvcHlDb21taXRTaGEgPSBldmVudCA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29uc3Qge2NvbW1pdCwgY2xpcGJvYXJkfSA9IHRoaXMucHJvcHM7XG4gICAgY2xpcGJvYXJkLndyaXRlKGNvbW1pdC5zaGEpO1xuICB9XG5cbiAgY29weUNvbW1pdFN1YmplY3QgPSBldmVudCA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29uc3Qge2NvbW1pdCwgY2xpcGJvYXJkfSA9IHRoaXMucHJvcHM7XG4gICAgY2xpcGJvYXJkLndyaXRlKGNvbW1pdC5tZXNzYWdlU3ViamVjdCk7XG4gIH1cblxuICB1bmRvTGFzdENvbW1pdCA9IGV2ZW50ID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnByb3BzLnVuZG9MYXN0Q29tbWl0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjZW50Q29tbWl0c1ZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8vIE1vZGVsIHN0YXRlXG4gICAgY29tbWl0czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCkuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0ZWRDb21taXRTaGE6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgIC8vIEF0b20gZW52aXJvbm1lbnRcbiAgICBjbGlwYm9hcmQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb21tYW5kczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQWN0aW9uIG1ldGhvZHNcbiAgICB1bmRvTGFzdENvbW1pdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvcGVuQ29tbWl0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdE5leHRDb21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0UHJldmlvdXNDb21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGZvY3VzID0ge1xuICAgIFJFQ0VOVF9DT01NSVQ6IFN5bWJvbCgncmVjZW50X2NvbW1pdCcpLFxuICB9O1xuXG4gIHN0YXRpYyBmaXJzdEZvY3VzID0gUmVjZW50Q29tbWl0c1ZpZXcuZm9jdXMuUkVDRU5UX0NPTU1JVDtcblxuICBzdGF0aWMgbGFzdEZvY3VzID0gUmVjZW50Q29tbWl0c1ZpZXcuZm9jdXMuUkVDRU5UX0NPTU1JVDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnJlZlJvb3QgPSBuZXcgUmVmSG9sZGVyKCk7XG4gIH1cblxuICBzZXRGb2N1cyhmb2N1cykge1xuICAgIGlmIChmb2N1cyA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5mb2N1cy5SRUNFTlRfQ09NTUlUKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWZSb290Lm1hcChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pLmdldE9yKGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRGb2N1cyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMucmVmUm9vdC5tYXAoZSA9PiBlLmNvbnRhaW5zKGVsZW1lbnQpKS5nZXRPcihmYWxzZSlcbiAgICAgID8gdGhpcy5jb25zdHJ1Y3Rvci5mb2N1cy5SRUNFTlRfQ09NTUlUXG4gICAgICA6IG51bGw7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLVJlY2VudENvbW1pdHNcIiB0YWJJbmRleD1cIi0xXCIgcmVmPXt0aGlzLnJlZlJvb3Quc2V0dGVyfT5cbiAgICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9e3RoaXMucmVmUm9vdH0+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImNvcmU6bW92ZS1kb3duXCIgY2FsbGJhY2s9e3RoaXMucHJvcHMuc2VsZWN0TmV4dENvbW1pdH0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTptb3ZlLXVwXCIgY2FsbGJhY2s9e3RoaXMucHJvcHMuc2VsZWN0UHJldmlvdXNDb21taXR9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpkaXZlXCIgY2FsbGJhY2s9e3RoaXMub3BlblNlbGVjdGVkQ29tbWl0fSAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgICB7dGhpcy5yZW5kZXJDb21taXRzKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQ29tbWl0cygpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb21taXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaXNMb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItUmVjZW50Q29tbWl0cy1tZXNzYWdlXCI+XG4gICAgICAgICAgICBSZWNlbnQgY29tbWl0c1xuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1SZWNlbnRDb21taXRzLW1lc3NhZ2VcIj5cbiAgICAgICAgICAgIE1ha2UgeW91ciBmaXJzdCBjb21taXRcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImdpdGh1Yi1SZWNlbnRDb21taXRzLWxpc3RcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5jb21taXRzLm1hcCgoY29tbWl0LCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8UmVjZW50Q29tbWl0Vmlld1xuICAgICAgICAgICAgICAgIGtleT17Y29tbWl0LmdldFNoYSgpfVxuICAgICAgICAgICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICAgICAgICAgIGNsaXBib2FyZD17dGhpcy5wcm9wcy5jbGlwYm9hcmR9XG4gICAgICAgICAgICAgICAgaXNNb3N0UmVjZW50PXtpID09PSAwfVxuICAgICAgICAgICAgICAgIGNvbW1pdD17Y29tbWl0fVxuICAgICAgICAgICAgICAgIHVuZG9MYXN0Q29tbWl0PXt0aGlzLnByb3BzLnVuZG9MYXN0Q29tbWl0fVxuICAgICAgICAgICAgICAgIG9wZW5Db21taXQ9eygpID0+IHRoaXMucHJvcHMub3BlbkNvbW1pdCh7c2hhOiBjb21taXQuZ2V0U2hhKCksIHByZXNlcnZlRm9jdXM6IHRydWV9KX1cbiAgICAgICAgICAgICAgICBpc1NlbGVjdGVkPXt0aGlzLnByb3BzLnNlbGVjdGVkQ29tbWl0U2hhID09PSBjb21taXQuZ2V0U2hhKCl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L3VsPlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBvcGVuU2VsZWN0ZWRDb21taXQgPSAoKSA9PiB0aGlzLnByb3BzLm9wZW5Db21taXQoe3NoYTogdGhpcy5wcm9wcy5zZWxlY3RlZENvbW1pdFNoYSwgcHJlc2VydmVGb2N1czogZmFsc2V9KVxuXG4gIGFkdmFuY2VGb2N1c0Zyb20oZm9jdXMpIHtcbiAgICBpZiAoZm9jdXMgPT09IHRoaXMuY29uc3RydWN0b3IuZm9jdXMuUkVDRU5UX0NPTU1JVCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmNvbnN0cnVjdG9yLmZvY3VzLlJFQ0VOVF9DT01NSVQpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cblxuICByZXRyZWF0Rm9jdXNGcm9tKGZvY3VzKSB7XG4gICAgaWYgKGZvY3VzID09PSB0aGlzLmNvbnN0cnVjdG9yLmZvY3VzLlJFQ0VOVF9DT01NSVQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoQ29tbWl0Vmlldy5sYXN0Rm9jdXMpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cbn1cbiJdfQ==