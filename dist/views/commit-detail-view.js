"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _nodeEmoji = require("node-emoji");

var _moment = _interopRequireDefault(require("moment"));

var _multiFilePatchController = _interopRequireDefault(require("../controllers/multi-file-patch-controller"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommitDetailView extends _react.default.Component {
  constructor(props) {
    super(props);
    this.refRoot = new _refHolder.default();
  }

  render() {
    const commit = this.props.commit;
    return _react.default.createElement("div", {
      className: "github-CommitDetailView",
      ref: this.refRoot.setter
    }, this.renderCommands(), _react.default.createElement("div", {
      className: "github-CommitDetailView-header native-key-bindings",
      tabIndex: "-1"
    }, _react.default.createElement("div", {
      className: "github-CommitDetailView-commit"
    }, _react.default.createElement("h3", {
      className: "github-CommitDetailView-title"
    }, (0, _nodeEmoji.emojify)(commit.getMessageSubject())), _react.default.createElement("div", {
      className: "github-CommitDetailView-meta"
    }, this.renderAuthors(), _react.default.createElement("span", {
      className: "github-CommitDetailView-metaText"
    }, this.getAuthorInfo(), " committed ", this.humanizeTimeSince(commit.getAuthorDate())), _react.default.createElement("div", {
      className: "github-CommitDetailView-sha"
    }, this.renderDotComLink())), this.renderShowMoreButton(), this.renderCommitMessageBody())), _react.default.createElement(_multiFilePatchController.default, _extends({
      multiFilePatch: commit.getMultiFileDiff(),
      surface: this.props.surfaceCommit
    }, this.props)));
  }

  renderCommands() {
    return _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: this.refRoot
    }, _react.default.createElement(_commands.Command, {
      command: "github:surface",
      callback: this.props.surfaceCommit
    }));
  }

  renderCommitMessageBody() {
    const collapsed = this.props.messageCollapsible && !this.props.messageOpen;
    return _react.default.createElement("pre", {
      className: "github-CommitDetailView-moreText"
    }, collapsed ? this.props.commit.abbreviatedBody() : this.props.commit.getMessageBody());
  }

  renderShowMoreButton() {
    if (!this.props.messageCollapsible) {
      return null;
    }

    const buttonText = this.props.messageOpen ? 'Show Less' : 'Show More';
    return _react.default.createElement("button", {
      className: "github-CommitDetailView-moreButton",
      onClick: this.props.toggleMessage
    }, buttonText);
  }

  humanizeTimeSince(date) {
    return (0, _moment.default)(date * 1000).fromNow();
  }

  renderDotComLink() {
    const remote = this.props.currentRemote;
    const sha = this.props.commit.getSha();

    if (remote.isGithubRepo() && this.props.isCommitPushed) {
      const repoUrl = `https://github.com/${remote.getOwner()}/${remote.getRepo()}`;
      return _react.default.createElement("a", {
        href: `${repoUrl}/commit/${sha}`,
        title: `open commit ${sha} on GitHub.com`
      }, sha);
    } else {
      return _react.default.createElement("span", null, sha);
    }
  }

  getAuthorInfo() {
    const commit = this.props.commit;
    const coAuthorCount = commit.getCoAuthors().length;

    if (coAuthorCount === 0) {
      return commit.getAuthorName();
    } else if (coAuthorCount === 1) {
      return `${commit.getAuthorName()} and ${commit.getCoAuthors()[0].getFullName()}`;
    } else {
      return `${commit.getAuthorName()} and ${coAuthorCount} others`;
    }
  }

  renderAuthor(author) {
    const email = author.getEmail();
    const avatarUrl = author.getAvatarUrl();
    return _react.default.createElement("img", {
      className: "github-CommitDetailView-avatar github-RecentCommit-avatar",
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
      className: "github-CommitDetailView-authors github-RecentCommit-authors"
    }, authors.map(this.renderAuthor));
  }

}

exports.default = CommitDetailView;

_defineProperty(CommitDetailView, "drilledPropTypes", {
  // Model properties
  repository: _propTypes.default.object.isRequired,
  commit: _propTypes.default.object.isRequired,
  currentRemote: _propTypes.default.object.isRequired,
  isCommitPushed: _propTypes.default.bool.isRequired,
  itemType: _propTypes.default.func.isRequired,
  // Atom environment
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  keymaps: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  // Action functions
  destroy: _propTypes.default.func.isRequired,
  surfaceCommit: _propTypes.default.func.isRequired
});

_defineProperty(CommitDetailView, "propTypes", _objectSpread2({}, CommitDetailView.drilledPropTypes, {
  // Controller state
  messageCollapsible: _propTypes.default.bool.isRequired,
  messageOpen: _propTypes.default.bool.isRequired,
  // Action functions
  toggleMessage: _propTypes.default.func.isRequired
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9jb21taXQtZGV0YWlsLXZpZXcuanMiXSwibmFtZXMiOlsiQ29tbWl0RGV0YWlsVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInJlZlJvb3QiLCJSZWZIb2xkZXIiLCJyZW5kZXIiLCJjb21taXQiLCJzZXR0ZXIiLCJyZW5kZXJDb21tYW5kcyIsImdldE1lc3NhZ2VTdWJqZWN0IiwicmVuZGVyQXV0aG9ycyIsImdldEF1dGhvckluZm8iLCJodW1hbml6ZVRpbWVTaW5jZSIsImdldEF1dGhvckRhdGUiLCJyZW5kZXJEb3RDb21MaW5rIiwicmVuZGVyU2hvd01vcmVCdXR0b24iLCJyZW5kZXJDb21taXRNZXNzYWdlQm9keSIsImdldE11bHRpRmlsZURpZmYiLCJzdXJmYWNlQ29tbWl0IiwiY29tbWFuZHMiLCJjb2xsYXBzZWQiLCJtZXNzYWdlQ29sbGFwc2libGUiLCJtZXNzYWdlT3BlbiIsImFiYnJldmlhdGVkQm9keSIsImdldE1lc3NhZ2VCb2R5IiwiYnV0dG9uVGV4dCIsInRvZ2dsZU1lc3NhZ2UiLCJkYXRlIiwiZnJvbU5vdyIsInJlbW90ZSIsImN1cnJlbnRSZW1vdGUiLCJzaGEiLCJnZXRTaGEiLCJpc0dpdGh1YlJlcG8iLCJpc0NvbW1pdFB1c2hlZCIsInJlcG9VcmwiLCJnZXRPd25lciIsImdldFJlcG8iLCJjb0F1dGhvckNvdW50IiwiZ2V0Q29BdXRob3JzIiwibGVuZ3RoIiwiZ2V0QXV0aG9yTmFtZSIsImdldEZ1bGxOYW1lIiwicmVuZGVyQXV0aG9yIiwiYXV0aG9yIiwiZW1haWwiLCJnZXRFbWFpbCIsImF2YXRhclVybCIsImdldEF2YXRhclVybCIsImNvQXV0aG9ycyIsImF1dGhvcnMiLCJnZXRBdXRob3IiLCJtYXAiLCJyZXBvc2l0b3J5IiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImJvb2wiLCJpdGVtVHlwZSIsImZ1bmMiLCJ3b3Jrc3BhY2UiLCJr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QVYsQ0FBaUJDLFVBVEo7QUFVeEJyQyxFQUFBQSxRQUFRLEVBQUVtQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFWSDtBQVd4QkssRUFBQUEsT0FBTyxFQUFFUCxtQkFBVUMsTUFBVixDQUFpQkMsVUFYRjtBQVl4Qk0sRUFBQUEsUUFBUSxFQUFFUixtQkFBVUMsTUFBVixDQUFpQkMsVUFaSDtBQWF4Qk8sRUFBQUEsTUFBTSxFQUFFVCxtQkFBVUMsTUFBVixDQUFpQkMsVUFiRDtBQWV4QjtBQUNBUSxFQUFBQSxPQUFPLEVBQUVWLG1CQUFVSyxJQUFWLENBQWVILFVBaEJBO0FBaUJ4QnRDLEVBQUFBLGFBQWEsRUFBRW9DLG1CQUFVSyxJQUFWLENBQWVIO0FBakJOLEM7O2dCQURQMUQsZ0Isa0NBc0JkQSxnQkFBZ0IsQ0FBQ21FLGdCO0FBRXBCO0FBQ0E1QyxFQUFBQSxrQkFBa0IsRUFBRWlDLG1CQUFVRyxJQUFWLENBQWVELFU7QUFDbkNsQyxFQUFBQSxXQUFXLEVBQUVnQyxtQkFBVUcsSUFBVixDQUFlRCxVO0FBRTVCO0FBQ0E5QixFQUFBQSxhQUFhLEVBQUU0QixtQkFBVUssSUFBVixDQUFlSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtlbW9qaWZ5fSBmcm9tICdub2RlLWVtb2ppJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuaW1wb3J0IE11bHRpRmlsZVBhdGNoQ29udHJvbGxlciBmcm9tICcuLi9jb250cm9sbGVycy9tdWx0aS1maWxlLXBhdGNoLWNvbnRyb2xsZXInO1xuaW1wb3J0IENvbW1hbmRzLCB7Q29tbWFuZH0gZnJvbSAnLi4vYXRvbS9jb21tYW5kcyc7XG5pbXBvcnQgUmVmSG9sZGVyIGZyb20gJy4uL21vZGVscy9yZWYtaG9sZGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWl0RGV0YWlsVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBkcmlsbGVkUHJvcFR5cGVzID0ge1xuICAgIC8vIE1vZGVsIHByb3BlcnRpZXNcbiAgICByZXBvc2l0b3J5OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWl0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY3VycmVudFJlbW90ZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGlzQ29tbWl0UHVzaGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGl0ZW1UeXBlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQXRvbSBlbnZpcm9ubWVudFxuICAgIHdvcmtzcGFjZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGNvbW1hbmRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAga2V5bWFwczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHRvb2x0aXBzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29uZmlnOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAvLyBBY3Rpb24gZnVuY3Rpb25zXG4gICAgZGVzdHJveTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzdXJmYWNlQ29tbWl0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAuLi5Db21taXREZXRhaWxWaWV3LmRyaWxsZWRQcm9wVHlwZXMsXG5cbiAgICAvLyBDb250cm9sbGVyIHN0YXRlXG4gICAgbWVzc2FnZUNvbGxhcHNpYmxlOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG1lc3NhZ2VPcGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQWN0aW9uIGZ1bmN0aW9uc1xuICAgIHRvZ2dsZU1lc3NhZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMucmVmUm9vdCA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb21taXQgPSB0aGlzLnByb3BzLmNvbW1pdDtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXREZXRhaWxWaWV3XCIgcmVmPXt0aGlzLnJlZlJvb3Quc2V0dGVyfT5cbiAgICAgICAge3RoaXMucmVuZGVyQ29tbWFuZHMoKX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0RGV0YWlsVmlldy1oZWFkZXIgbmF0aXZlLWtleS1iaW5kaW5nc1wiIHRhYkluZGV4PVwiLTFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXREZXRhaWxWaWV3LWNvbW1pdFwiPlxuICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXREZXRhaWxWaWV3LXRpdGxlXCI+XG4gICAgICAgICAgICAgIHtlbW9qaWZ5KGNvbW1pdC5nZXRNZXNzYWdlU3ViamVjdCgpKX1cbiAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXREZXRhaWxWaWV3LW1ldGFcIj5cbiAgICAgICAgICAgICAge3RoaXMucmVuZGVyQXV0aG9ycygpfVxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0RGV0YWlsVmlldy1tZXRhVGV4dFwiPlxuICAgICAgICAgICAgICAgIHt0aGlzLmdldEF1dGhvckluZm8oKX0gY29tbWl0dGVkIHt0aGlzLmh1bWFuaXplVGltZVNpbmNlKGNvbW1pdC5nZXRBdXRob3JEYXRlKCkpfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdERldGFpbFZpZXctc2hhXCI+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyRG90Q29tTGluaygpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge3RoaXMucmVuZGVyU2hvd01vcmVCdXR0b24oKX1cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlckNvbW1pdE1lc3NhZ2VCb2R5KCl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8TXVsdGlGaWxlUGF0Y2hDb250cm9sbGVyXG4gICAgICAgICAgbXVsdGlGaWxlUGF0Y2g9e2NvbW1pdC5nZXRNdWx0aUZpbGVEaWZmKCl9XG4gICAgICAgICAgc3VyZmFjZT17dGhpcy5wcm9wcy5zdXJmYWNlQ29tbWl0fVxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbW1hbmRzKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29tbWFuZHMgcmVnaXN0cnk9e3RoaXMucHJvcHMuY29tbWFuZHN9IHRhcmdldD17dGhpcy5yZWZSb290fT5cbiAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpzdXJmYWNlXCIgY2FsbGJhY2s9e3RoaXMucHJvcHMuc3VyZmFjZUNvbW1pdH0gLz5cbiAgICAgIDwvQ29tbWFuZHM+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbW1pdE1lc3NhZ2VCb2R5KCkge1xuICAgIGNvbnN0IGNvbGxhcHNlZCA9IHRoaXMucHJvcHMubWVzc2FnZUNvbGxhcHNpYmxlICYmICF0aGlzLnByb3BzLm1lc3NhZ2VPcGVuO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdERldGFpbFZpZXctbW9yZVRleHRcIj5cbiAgICAgICAge2NvbGxhcHNlZCA/IHRoaXMucHJvcHMuY29tbWl0LmFiYnJldmlhdGVkQm9keSgpIDogdGhpcy5wcm9wcy5jb21taXQuZ2V0TWVzc2FnZUJvZHkoKX1cbiAgICAgIDwvcHJlPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJTaG93TW9yZUJ1dHRvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMubWVzc2FnZUNvbGxhcHNpYmxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBidXR0b25UZXh0ID0gdGhpcy5wcm9wcy5tZXNzYWdlT3BlbiA/ICdTaG93IExlc3MnIDogJ1Nob3cgTW9yZSc7XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdERldGFpbFZpZXctbW9yZUJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMudG9nZ2xlTWVzc2FnZX0+e2J1dHRvblRleHR9PC9idXR0b24+XG4gICAgKTtcbiAgfVxuXG4gIGh1bWFuaXplVGltZVNpbmNlKGRhdGUpIHtcbiAgICByZXR1cm4gbW9tZW50KGRhdGUgKiAxMDAwKS5mcm9tTm93KCk7XG4gIH1cblxuICByZW5kZXJEb3RDb21MaW5rKCkge1xuICAgIGNvbnN0IHJlbW90ZSA9IHRoaXMucHJvcHMuY3VycmVudFJlbW90ZTtcbiAgICBjb25zdCBzaGEgPSB0aGlzLnByb3BzLmNvbW1pdC5nZXRTaGEoKTtcbiAgICBpZiAocmVtb3RlLmlzR2l0aHViUmVwbygpICYmIHRoaXMucHJvcHMuaXNDb21taXRQdXNoZWQpIHtcbiAgICAgIGNvbnN0IHJlcG9VcmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7cmVtb3RlLmdldE93bmVyKCl9LyR7cmVtb3RlLmdldFJlcG8oKX1gO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGEgaHJlZj17YCR7cmVwb1VybH0vY29tbWl0LyR7c2hhfWB9XG4gICAgICAgICAgdGl0bGU9e2BvcGVuIGNvbW1pdCAke3NoYX0gb24gR2l0SHViLmNvbWB9PlxuICAgICAgICAgIHtzaGF9XG4gICAgICAgIDwvYT5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoPHNwYW4+e3NoYX08L3NwYW4+KTtcbiAgICB9XG4gIH1cblxuICBnZXRBdXRob3JJbmZvKCkge1xuICAgIGNvbnN0IGNvbW1pdCA9IHRoaXMucHJvcHMuY29tbWl0O1xuICAgIGNvbnN0IGNvQXV0aG9yQ291bnQgPSBjb21taXQuZ2V0Q29BdXRob3JzKCkubGVuZ3RoO1xuICAgIGlmIChjb0F1dGhvckNvdW50ID09PSAwKSB7XG4gICAgICByZXR1cm4gY29tbWl0LmdldEF1dGhvck5hbWUoKTtcbiAgICB9IGVsc2UgaWYgKGNvQXV0aG9yQ291bnQgPT09IDEpIHtcbiAgICAgIHJldHVybiBgJHtjb21taXQuZ2V0QXV0aG9yTmFtZSgpfSBhbmQgJHtjb21taXQuZ2V0Q29BdXRob3JzKClbMF0uZ2V0RnVsbE5hbWUoKX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7Y29tbWl0LmdldEF1dGhvck5hbWUoKX0gYW5kICR7Y29BdXRob3JDb3VudH0gb3RoZXJzYDtcbiAgICB9XG4gIH1cblxuICByZW5kZXJBdXRob3IoYXV0aG9yKSB7XG4gICAgY29uc3QgZW1haWwgPSBhdXRob3IuZ2V0RW1haWwoKTtcbiAgICBjb25zdCBhdmF0YXJVcmwgPSBhdXRob3IuZ2V0QXZhdGFyVXJsKCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGltZyBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0RGV0YWlsVmlldy1hdmF0YXIgZ2l0aHViLVJlY2VudENvbW1pdC1hdmF0YXJcIlxuICAgICAgICBrZXk9e2VtYWlsfVxuICAgICAgICBzcmM9e2F2YXRhclVybH1cbiAgICAgICAgdGl0bGU9e2VtYWlsfVxuICAgICAgICBhbHQ9e2Ake2VtYWlsfSdzIGF2YXRhcidgfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQXV0aG9ycygpIHtcbiAgICBjb25zdCBjb0F1dGhvcnMgPSB0aGlzLnByb3BzLmNvbW1pdC5nZXRDb0F1dGhvcnMoKTtcbiAgICBjb25zdCBhdXRob3JzID0gW3RoaXMucHJvcHMuY29tbWl0LmdldEF1dGhvcigpLCAuLi5jb0F1dGhvcnNdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXREZXRhaWxWaWV3LWF1dGhvcnMgZ2l0aHViLVJlY2VudENvbW1pdC1hdXRob3JzXCI+XG4gICAgICAgIHthdXRob3JzLm1hcCh0aGlzLnJlbmRlckF1dGhvcil9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxufVxuIl19