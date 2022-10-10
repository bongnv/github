"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _atom = require("atom");

var _stagingView = _interopRequireDefault(require("./staging-view"));

var _gitIdentityView = _interopRequireDefault(require("./git-identity-view"));

var _gitTabHeaderController = _interopRequireDefault(require("../controllers/git-tab-header-controller"));

var _commitController = _interopRequireDefault(require("../controllers/commit-controller"));

var _recentCommitsController = _interopRequireDefault(require("../controllers/recent-commits-controller"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _helpers = require("../helpers");

var _propTypes2 = require("../prop-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class GitTabView extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _helpers.autobind)(this, 'initializeRepo', 'blur', 'advanceFocus', 'retreatFocus', 'quietlySelectItem');
    this.subscriptions = new _atom.CompositeDisposable();
    this.refCommitController = new _refHolder.default();
    this.refRecentCommitsController = new _refHolder.default();
  }

  componentDidMount() {
    this.props.refRoot.map(root => {
      return this.subscriptions.add(this.props.commands.add(root, {
        'tool-panel:unfocus': this.blur,
        'core:focus-next': this.advanceFocus,
        'core:focus-previous': this.retreatFocus
      }));
    });
  }

  render() {
    let renderMethod = 'renderNormal';
    let isEmpty = false;
    let isLoading = false;

    if (this.props.editingIdentity) {
      renderMethod = 'renderIdentityView';
    } else if (this.props.repository.isTooLarge()) {
      renderMethod = 'renderTooLarge';
      isEmpty = true;
    } else if (this.props.repository.hasDirectory() && !(0, _helpers.isValidWorkdir)(this.props.repository.getWorkingDirectoryPath())) {
      renderMethod = 'renderUnsupportedDir';
      isEmpty = true;
    } else if (this.props.repository.showGitTabInit()) {
      renderMethod = 'renderNoRepo';
      isEmpty = true;
    } else if (this.props.isLoading || this.props.repository.showGitTabLoading()) {
      isLoading = true;
    }

    return _react.default.createElement("div", {
      className: (0, _classnames.default)('github-Git', {
        'is-empty': isEmpty,
        'is-loading': !isEmpty && isLoading
      }),
      tabIndex: "-1",
      ref: this.props.refRoot.setter
    }, this.renderHeader(), this[renderMethod]());
  }

  renderHeader() {
    const {
      repository
    } = this.props;
    return _react.default.createElement(_gitTabHeaderController.default, {
      getCommitter: repository.getCommitter.bind(repository) // Workspace
      ,
      currentWorkDir: this.props.workingDirectoryPath,
      getCurrentWorkDirs: this.props.getCurrentWorkDirs,
      contextLocked: this.props.contextLocked,
      changeWorkingDirectory: this.props.changeWorkingDirectory,
      setContextLock: this.props.setContextLock // Event Handlers
      ,
      onDidClickAvatar: this.props.toggleIdentityEditor,
      onDidChangeWorkDirs: this.props.onDidChangeWorkDirs,
      onDidUpdateRepo: repository.onDidUpdate.bind(repository)
    });
  }

  renderNormal() {
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement(_stagingView.default, {
      ref: this.props.refStagingView.setter,
      commands: this.props.commands,
      notificationManager: this.props.notificationManager,
      workspace: this.props.workspace,
      stagedChanges: this.props.stagedChanges,
      unstagedChanges: this.props.unstagedChanges,
      mergeConflicts: this.props.mergeConflicts,
      workingDirectoryPath: this.props.workingDirectoryPath,
      resolutionProgress: this.props.resolutionProgress,
      openFiles: this.props.openFiles,
      discardWorkDirChangesForPaths: this.props.discardWorkDirChangesForPaths,
      attemptFileStageOperation: this.props.attemptFileStageOperation,
      attemptStageAllOperation: this.props.attemptStageAllOperation,
      undoLastDiscard: this.props.undoLastDiscard,
      abortMerge: this.props.abortMerge,
      resolveAsOurs: this.props.resolveAsOurs,
      resolveAsTheirs: this.props.resolveAsTheirs,
      lastCommit: this.props.lastCommit,
      isLoading: this.props.isLoading,
      hasUndoHistory: this.props.hasUndoHistory,
      isMerging: this.props.isMerging
    }), _react.default.createElement(_commitController.default, {
      ref: this.refCommitController.setter,
      tooltips: this.props.tooltips,
      config: this.props.config,
      stagedChangesExist: this.props.stagedChanges.length > 0,
      mergeConflictsExist: this.props.mergeConflicts.length > 0,
      prepareToCommit: this.props.prepareToCommit,
      commit: this.props.commit,
      abortMerge: this.props.abortMerge,
      currentBranch: this.props.currentBranch,
      workspace: this.props.workspace,
      commands: this.props.commands,
      notificationManager: this.props.notificationManager,
      grammars: this.props.grammars,
      mergeMessage: this.props.mergeMessage,
      isMerging: this.props.isMerging,
      isLoading: this.props.isLoading,
      lastCommit: this.props.lastCommit,
      repository: this.props.repository,
      userStore: this.props.userStore,
      selectedCoAuthors: this.props.selectedCoAuthors,
      updateSelectedCoAuthors: this.props.updateSelectedCoAuthors
    }), _react.default.createElement(_recentCommitsController.default, {
      ref: this.refRecentCommitsController.setter,
      commands: this.props.commands,
      commits: this.props.recentCommits,
      isLoading: this.props.isLoading,
      undoLastCommit: this.props.undoLastCommit,
      workspace: this.props.workspace,
      repository: this.props.repository
    }));
  }

  renderTooLarge() {
    return _react.default.createElement("div", {
      className: "github-Git too-many-changes"
    }, _react.default.createElement("div", {
      className: "github-Git-LargeIcon icon icon-diff"
    }), _react.default.createElement("h1", null, "Too many changes"), _react.default.createElement("div", {
      className: "initialize-repo-description"
    }, "The repository at ", _react.default.createElement("strong", null, this.props.workingDirectoryPath), " has too many changed files to display in Atom. Ensure that you have set up an appropriate ", _react.default.createElement("code", null, ".gitignore"), " file."));
  }

  renderUnsupportedDir() {
    return _react.default.createElement("div", {
      className: "github-Git unsupported-directory"
    }, _react.default.createElement("div", {
      className: "github-Git-LargeIcon icon icon-alert"
    }), _react.default.createElement("h1", null, "Unsupported directory"), _react.default.createElement("div", {
      className: "initialize-repo-description"
    }, "Atom does not support managing Git repositories in your home or root directories."));
  }

  renderNoRepo() {
    return _react.default.createElement("div", {
      className: "github-Git no-repository"
    }, _react.default.createElement("div", {
      className: "github-Git-LargeIcon icon icon-repo"
    }), _react.default.createElement("h1", null, "Create Repository"), _react.default.createElement("div", {
      className: "initialize-repo-description"
    }, this.props.repository.hasDirectory() ? _react.default.createElement("span", null, "Initialize ", _react.default.createElement("strong", null, this.props.workingDirectoryPath), " with a Git repository") : _react.default.createElement("span", null, "Initialize a new project directory with a Git repository")), _react.default.createElement("button", {
      onClick: this.initializeRepo,
      disabled: this.props.repository.showGitTabInitInProgress(),
      className: "btn btn-primary"
    }, this.props.repository.showGitTabInitInProgress() ? 'Creating repository...' : 'Create repository'));
  }

  renderIdentityView() {
    return _react.default.createElement(_gitIdentityView.default, {
      usernameBuffer: this.props.usernameBuffer,
      emailBuffer: this.props.emailBuffer,
      canWriteLocal: this.props.repository.isPresent(),
      setLocal: this.props.setLocalIdentity,
      setGlobal: this.props.setGlobalIdentity,
      close: this.props.closeIdentityEditor
    });
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  initializeRepo(event) {
    event.preventDefault();
    const workdir = this.props.repository.isAbsent() ? null : this.props.repository.getWorkingDirectoryPath();
    return this.props.openInitializeDialog(workdir);
  }

  getFocus(element) {
    for (const ref of [this.props.refStagingView, this.refCommitController, this.refRecentCommitsController]) {
      const focus = ref.map(sub => sub.getFocus(element)).getOr(null);

      if (focus !== null) {
        return focus;
      }
    }

    return null;
  }

  setFocus(focus) {
    for (const ref of [this.props.refStagingView, this.refCommitController, this.refRecentCommitsController]) {
      if (ref.map(sub => sub.setFocus(focus)).getOr(false)) {
        return true;
      }
    }

    return false;
  }

  blur() {
    this.props.workspace.getCenter().activate();
  }

  async advanceFocus(evt) {
    const currentFocus = this.getFocus(document.activeElement);
    let nextSeen = false;

    for (const subHolder of [this.props.refStagingView, this.refCommitController, this.refRecentCommitsController]) {
      const next = await subHolder.map(sub => sub.advanceFocusFrom(currentFocus)).getOr(null);

      if (next !== null && !nextSeen) {
        nextSeen = true;
        evt.stopPropagation();

        if (next !== currentFocus) {
          this.setFocus(next);
        }
      }
    }
  }

  async retreatFocus(evt) {
    const currentFocus = this.getFocus(document.activeElement);
    let previousSeen = false;

    for (const subHolder of [this.refRecentCommitsController, this.refCommitController, this.props.refStagingView]) {
      const previous = await subHolder.map(sub => sub.retreatFocusFrom(currentFocus)).getOr(null);

      if (previous !== null && !previousSeen) {
        previousSeen = true;
        evt.stopPropagation();

        if (previous !== currentFocus) {
          this.setFocus(previous);
        }
      }
    }
  }

  async focusAndSelectStagingItem(filePath, stagingStatus) {
    await this.quietlySelectItem(filePath, stagingStatus);
    this.setFocus(GitTabView.focus.STAGING);
  }

  focusAndSelectRecentCommit() {
    this.setFocus(_recentCommitsController.default.focus.RECENT_COMMIT);
  }

  focusAndSelectCommitPreviewButton() {
    this.setFocus(GitTabView.focus.COMMIT_PREVIEW_BUTTON);
  }

  quietlySelectItem(filePath, stagingStatus) {
    return this.props.refStagingView.map(view => view.quietlySelectItem(filePath, stagingStatus)).getOr(false);
  }

  hasFocus() {
    return this.props.refRoot.map(root => root.contains(document.activeElement)).getOr(false);
  }

}

exports.default = GitTabView;

_defineProperty(GitTabView, "focus", _objectSpread2({}, _stagingView.default.focus, {}, _commitController.default.focus, {}, _recentCommitsController.default.focus));

_defineProperty(GitTabView, "propTypes", {
  refRoot: _propTypes2.RefHolderPropType,
  refStagingView: _propTypes2.RefHolderPropType,
  repository: _propTypes.default.object.isRequired,
  isLoading: _propTypes.default.bool.isRequired,
  editingIdentity: _propTypes.default.bool.isRequired,
  usernameBuffer: _propTypes.default.object.isRequired,
  emailBuffer: _propTypes.default.object.isRequired,
  lastCommit: _propTypes.default.object.isRequired,
  currentBranch: _propTypes.default.object,
  recentCommits: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  isMerging: _propTypes.default.bool,
  isRebasing: _propTypes.default.bool,
  hasUndoHistory: _propTypes.default.bool,
  unstagedChanges: _propTypes.default.arrayOf(_propTypes.default.object),
  stagedChanges: _propTypes.default.arrayOf(_propTypes.default.object),
  mergeConflicts: _propTypes.default.arrayOf(_propTypes.default.object),
  workingDirectoryPath: _propTypes.default.string,
  mergeMessage: _propTypes.default.string,
  userStore: _propTypes2.UserStorePropType.isRequired,
  selectedCoAuthors: _propTypes.default.arrayOf(_propTypes2.AuthorPropType),
  updateSelectedCoAuthors: _propTypes.default.func.isRequired,
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  grammars: _propTypes.default.object.isRequired,
  resolutionProgress: _propTypes.default.object.isRequired,
  notificationManager: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  project: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  toggleIdentityEditor: _propTypes.default.func.isRequired,
  setLocalIdentity: _propTypes.default.func.isRequired,
  setGlobalIdentity: _propTypes.default.func.isRequired,
  closeIdentityEditor: _propTypes.default.func.isRequired,
  openInitializeDialog: _propTypes.default.func.isRequired,
  abortMerge: _propTypes.default.func.isRequired,
  commit: _propTypes.default.func.isRequired,
  undoLastCommit: _propTypes.default.func.isRequired,
  prepareToCommit: _propTypes.default.func.isRequired,
  resolveAsOurs: _propTypes.default.func.isRequired,
  resolveAsTheirs: _propTypes.default.func.isRequired,
  undoLastDiscard: _propTypes.default.func.isRequired,
  attemptStageAllOperation: _propTypes.default.func.isRequired,
  attemptFileStageOperation: _propTypes.default.func.isRequired,
  discardWorkDirChangesForPaths: _propTypes.default.func.isRequired,
  openFiles: _propTypes.default.func.isRequired,
  contextLocked: _propTypes.default.bool.isRequired,
  changeWorkingDirectory: _propTypes.default.func.isRequired,
  setContextLock: _propTypes.default.func.isRequired,
  onDidChangeWorkDirs: _propTypes.default.func.isRequired,
  getCurrentWorkDirs: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9naXQtdGFiLXZpZXcuanMiXSwibmFtZXMiOlsiR2l0VGFiVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJzdWJzY3JpcHRpb25zIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsInJlZkNvbW1pdENvbnRyb2xsZXIiLCJSZWZIb2xkZXIiLCJyZWZSZWNlbnRDb21taXRzQ29udHJvbGxlciIsImNvbXBvbmVudERpZE1vdW50IiwicmVmUm9vdCIsIm1hcCIsInJvb3QiLCJhZGQiLCJjb21tYW5kcyIsImJsdXIiLCJhZHZhbmNlRm9jdXMiLCJyZXRyZWF0Rm9jdXMiLCJyZW5kZXIiLCJyZW5kZXJNZXRob2QiLCJpc0VtcHR5IiwiaXNMb2FkaW5nIiwiZWRpdGluZ0lkZW50aXR5IiwicmVwb3NpdG9yeSIsImlzVG9vTGFyZ2UiLCJoYXNEaXJlY3RvcnkiLCJnZXRXb3JraW5nRGlyZWN0b3J5UGF0aCIsInNob3dHaXRUYWJJbml0Iiwic2hvd0dpdFRhYkxvYWRpbmciLCJzZXR0ZXIiLCJyZW5kZXJIZWFkZXIiLCJnZXRDb21taXR0ZXIiLCJiaW5kIiwid29ya2luZ0RpcmVjdG9yeVBhdGgiLCJnZXRDdXJyZW50V29ya0RpcnMiLCJjb250ZXh0TG9ja2VkIiwiY2hhbmdlV29ya2luZ0RpcmVjdG9yeSIsInNldENvbnRleHRMb2NrIiwidG9nZ2xlSWRlbnRpdHlFZGl0b3IiLCJvbkRpZENoYW5nZVdvcmtEaXJzIiwib25EaWRVcGRhdGUiLCJyZW5kZXJOb3JtYWwiLCJyZWZTdGFnaW5nVmlldyIsIm5vdGlmaWNhdGlvbk1hbmFnZXIiLCJ3b3Jrc3BhY2UiLCJzdGFnZWRDaGFuZ2VzIiwidW5zdGFnZWRDaGFuZ2VzIiwibWVyZ2VDb25mbGljdHMiLCJyZXNvbHV0aW9uUHJvZ3Jlc3MiLCJvcGVuRmlsZXMiLCJkaXNjYXJkV29ya0RpckNoYW5nZXNGb3JQYXRocyIsImF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb24iLCJhdHRlbXB0U3RhZ2VBbGxPcGVyYXRpb24iLCJ1bmRvTGFzdERpc2NhcmQiLCJhYm9ydE1lcmdlIiwicmVzb2x2ZUFzT3VycyIsInJlc29sdmVBc1RoZWlycyIsImxhc3RDb21taXQiLCJoYXNVbmRvSGlzdG9yeSIsImlzTWVyZ2luZyIsInRvb2x0aXBzIiwiY29uZmlnIiwibGVuZ3RoIiwicHJlcGFyZVRvQ29tbWl0IiwiY29tbWl0IiwiY3VycmVudEJyYW5jaCIsImdyYW1tYXJzIiwibWVyZ2VNZXNzYWdlIiwidXNlclN0b3JlIiwic2VsZWN0ZWRDb0F1dGhvcnMiLCJ1cGRhdGVTZWxlY3RlZENvQXV0aG9ycyIsInJlY2VudENvbW1pdHMiLCJ1bmRvTGFzdENvbW1pdCIsInJlbmRlclRvb0xhcmdlIiwicmVuZGVyVW5zdXBwb3J0ZWREaXIiLCJyZW5kZXJOb1JlcG8iLCJpbml0aWFsaXplUmVwbyIsInNob3dHaXRUYWJJbml0SW5Qcm9ncmVzcyIsInJlbmRlcklkZW50aXR5VmlldyIsInVzZXJuYW1lQnVmZmVyIiwiZW1haWxCdWZmZXIiLCJpc1ByZXNlbnQiLCJzZXRMb2NhbElkZW50aXR5Iiwic2V0R2xvYmFsSWRlbnRpdHkiLCJjbG9zZUlkZW50aXR5RWRpdG9yIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJkaXNwb3NlIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsIndvcmtkaXIiLCJpc0Fic2VudCIsIm9wZW5Jbml0aWFsaXplRGlhbG9nIiwiZ2V0Rm9jdXMiLCJlbGVtZW50IiwicmVmIiwiZm9jdXMiLCJzdWIiLCJnZXRPciIsInNldEZvY3VzIiwiZ2V0Q2VudGVyIiwiYWN0aXZhdGUiLCJldnQiLCJjdXJyZW50Rm9jdXMiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJuZXh0U2VlbiIsInN1YkhvbGRlciIsIm5leHQiLCJhZHZhbmNlRm9jdXNGcm9tIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmlvdXNTZWVuIiwicHJldmlvdXMiLCJyZXRyZWF0Rm9jdXNGcm9tIiwiZm9jdXNBbmRTZWxlY3RTdGFnaW5nSXRlbSIsImZpbGVQYXRoIiwic3RhZ2luZ1N0YXR1cyIsInF1aWV0bHlTZWxlY3RJdGVtIiwiU1RBR0lORyIsImZvY3VzQW5kU2VsZWN0UmVjZW50Q29tbWl0IiwiUmVjZW50Q29tbWl0c0NvbnRyb2xsZXIiLCJSRUNFTlRfQ09NTUlUIiwiZm9jdXNBbmRTZWxlY3RDb21taXRQcmV2aWV3QnV0dG9uIiwiQ09NTUlUX1BSRVZJRVdfQlVUVE9OIiwidmlldyIsImhhc0ZvY3VzIiwiY29udGFpbnMiLCJTdGFnaW5nVmlldyIsIkNvbW1pdENvbnRyb2xsZXIiLCJSZWZIb2xkZXJQcm9wVHlwZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJib29sIiwiYXJyYXlPZiIsImlzUmViYXNpbmciLCJzdHJpbmciLCJVc2VyU3RvcmVQcm9wVHlwZSIsIkF1dGhvclByb3BUeXBlIiwiZnVuYyIsInByb2plY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVlLE1BQU1BLFVBQU4sU0FBeUJDLGVBQU1DLFNBQS9CLENBQXlDO0FBZ0V0REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVFDLE9BQVIsRUFBaUI7QUFDMUIsVUFBTUQsS0FBTixFQUFhQyxPQUFiO0FBQ0EsMkJBQVMsSUFBVCxFQUFlLGdCQUFmLEVBQWlDLE1BQWpDLEVBQXlDLGNBQXpDLEVBQXlELGNBQXpELEVBQXlFLG1CQUF6RTtBQUVBLFNBQUtDLGFBQUwsR0FBcUIsSUFBSUMseUJBQUosRUFBckI7QUFFQSxTQUFLQyxtQkFBTCxHQUEyQixJQUFJQyxrQkFBSixFQUEzQjtBQUNBLFNBQUtDLDBCQUFMLEdBQWtDLElBQUlELGtCQUFKLEVBQWxDO0FBQ0Q7O0FBRURFLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2xCLFNBQUtQLEtBQUwsQ0FBV1Es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QjVGLEVBQUFBLG1CQUFtQixFQUFFMEYsbUJBQVVTLElBQVYsQ0FBZVAsVUFyRG5CO0FBc0RqQmpHLEVBQUFBLGtCQUFrQixFQUFFK0YsbUJBQVVTLElBQVYsQ0FBZVA7QUF0RGxCLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHtGcmFnbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjeCBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBTdGFnaW5nVmlldyBmcm9tICcuL3N0YWdpbmctdmlldyc7XG5pbXBvcnQgR2l0SWRlbnRpdHlWaWV3IGZyb20gJy4vZ2l0LWlkZW50aXR5LXZpZXcnO1xuaW1wb3J0IEdpdFRhYkhlYWRlckNvbnRyb2xsZXIgZnJvbSAnLi4vY29udHJvbGxlcnMvZ2l0LXRhYi1oZWFkZXItY29udHJvbGxlcic7XG5pbXBvcnQgQ29tbWl0Q29udHJvbGxlciBmcm9tICcuLi9jb250cm9sbGVycy9jb21taXQtY29udHJvbGxlcic7XG5pbXBvcnQgUmVjZW50Q29tbWl0c0NvbnRyb2xsZXIgZnJvbSAnLi4vY29udHJvbGxlcnMvcmVjZW50LWNvbW1pdHMtY29udHJvbGxlcic7XG5pbXBvcnQgUmVmSG9sZGVyIGZyb20gJy4uL21vZGVscy9yZWYtaG9sZGVyJztcbmltcG9ydCB7aXNWYWxpZFdvcmtkaXIsIGF1dG9iaW5kfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7QXV0aG9yUHJvcFR5cGUsIFVzZXJTdG9yZVByb3BUeXBlLCBSZWZIb2xkZXJQcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdpdFRhYlZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgZm9jdXMgPSB7XG4gICAgLi4uU3RhZ2luZ1ZpZXcuZm9jdXMsXG4gICAgLi4uQ29tbWl0Q29udHJvbGxlci5mb2N1cyxcbiAgICAuLi5SZWNlbnRDb21taXRzQ29udHJvbGxlci5mb2N1cyxcbiAgfTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHJlZlJvb3Q6IFJlZkhvbGRlclByb3BUeXBlLFxuICAgIHJlZlN0YWdpbmdWaWV3OiBSZWZIb2xkZXJQcm9wVHlwZSxcblxuICAgIHJlcG9zaXRvcnk6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgZWRpdGluZ0lkZW50aXR5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgdXNlcm5hbWVCdWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBlbWFpbEJ1ZmZlcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGxhc3RDb21taXQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjdXJyZW50QnJhbmNoOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHJlY2VudENvbW1pdHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLmlzUmVxdWlyZWQsXG4gICAgaXNNZXJnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpc1JlYmFzaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBoYXNVbmRvSGlzdG9yeTogUHJvcFR5cGVzLmJvb2wsXG4gICAgdW5zdGFnZWRDaGFuZ2VzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICBzdGFnZWRDaGFuZ2VzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICBtZXJnZUNvbmZsaWN0czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG4gICAgd29ya2luZ0RpcmVjdG9yeVBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWVyZ2VNZXNzYWdlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHVzZXJTdG9yZTogVXNlclN0b3JlUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICBzZWxlY3RlZENvQXV0aG9yczogUHJvcFR5cGVzLmFycmF5T2YoQXV0aG9yUHJvcFR5cGUpLFxuICAgIHVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgd29ya3NwYWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWFuZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHJlc29sdXRpb25Qcm9ncmVzczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG5vdGlmaWNhdGlvbk1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBwcm9qZWN0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG9vbHRpcHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgIHRvZ2dsZUlkZW50aXR5RWRpdG9yOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNldExvY2FsSWRlbnRpdHk6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2V0R2xvYmFsSWRlbnRpdHk6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY2xvc2VJZGVudGl0eUVkaXRvcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvcGVuSW5pdGlhbGl6ZURpYWxvZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBhYm9ydE1lcmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbW1pdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB1bmRvTGFzdENvbW1pdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBwcmVwYXJlVG9Db21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcmVzb2x2ZUFzT3VyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByZXNvbHZlQXNUaGVpcnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdW5kb0xhc3REaXNjYXJkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGF0dGVtcHRTdGFnZUFsbE9wZXJhdGlvbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBhdHRlbXB0RmlsZVN0YWdlT3BlcmF0aW9uOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9wZW5GaWxlczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjb250ZXh0TG9ja2VkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2V0Q29udGV4dExvY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25EaWRDaGFuZ2VXb3JrRGlyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBnZXRDdXJyZW50V29ya0RpcnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgYXV0b2JpbmQodGhpcywgJ2luaXRpYWxpemVSZXBvJywgJ2JsdXInLCAnYWR2YW5jZUZvY3VzJywgJ3JldHJlYXRGb2N1cycsICdxdWlldGx5U2VsZWN0SXRlbScpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMucmVmQ29tbWl0Q29udHJvbGxlciA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZlJlY2VudENvbW1pdHNDb250cm9sbGVyID0gbmV3IFJlZkhvbGRlcigpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5wcm9wcy5yZWZSb290Lm1hcChyb290ID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICB0aGlzLnByb3BzLmNvbW1hbmRzLmFkZChyb290LCB7XG4gICAgICAgICAgJ3Rvb2wtcGFuZWw6dW5mb2N1cyc6IHRoaXMuYmx1cixcbiAgICAgICAgICAnY29yZTpmb2N1cy1uZXh0JzogdGhpcy5hZHZhbmNlRm9jdXMsXG4gICAgICAgICAgJ2NvcmU6Zm9jdXMtcHJldmlvdXMnOiB0aGlzLnJldHJlYXRGb2N1cyxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCByZW5kZXJNZXRob2QgPSAncmVuZGVyTm9ybWFsJztcbiAgICBsZXQgaXNFbXB0eSA9IGZhbHNlO1xuICAgIGxldCBpc0xvYWRpbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5wcm9wcy5lZGl0aW5nSWRlbnRpdHkpIHtcbiAgICAgIHJlbmRlck1ldGhvZCA9ICdyZW5kZXJJZGVudGl0eVZpZXcnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5yZXBvc2l0b3J5LmlzVG9vTGFyZ2UoKSkge1xuICAgICAgcmVuZGVyTWV0aG9kID0gJ3JlbmRlclRvb0xhcmdlJztcbiAgICAgIGlzRW1wdHkgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5yZXBvc2l0b3J5Lmhhc0RpcmVjdG9yeSgpICYmXG4gICAgICAhaXNWYWxpZFdvcmtkaXIodGhpcy5wcm9wcy5yZXBvc2l0b3J5LmdldFdvcmtpbmdEaXJlY3RvcnlQYXRoKCkpKSB7XG4gICAgICByZW5kZXJNZXRob2QgPSAncmVuZGVyVW5zdXBwb3J0ZWREaXInO1xuICAgICAgaXNFbXB0eSA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJlcG9zaXRvcnkuc2hvd0dpdFRhYkluaXQoKSkge1xuICAgICAgcmVuZGVyTWV0aG9kID0gJ3JlbmRlck5vUmVwbyc7XG4gICAgICBpc0VtcHR5ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuaXNMb2FkaW5nIHx8IHRoaXMucHJvcHMucmVwb3NpdG9yeS5zaG93R2l0VGFiTG9hZGluZygpKSB7XG4gICAgICBpc0xvYWRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17Y3goJ2dpdGh1Yi1HaXQnLCB7J2lzLWVtcHR5JzogaXNFbXB0eSwgJ2lzLWxvYWRpbmcnOiAhaXNFbXB0eSAmJiBpc0xvYWRpbmd9KX1cbiAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgIHJlZj17dGhpcy5wcm9wcy5yZWZSb290LnNldHRlcn0+XG4gICAgICAgIHt0aGlzLnJlbmRlckhlYWRlcigpfVxuICAgICAgICB7dGhpc1tyZW5kZXJNZXRob2RdKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVySGVhZGVyKCkge1xuICAgIGNvbnN0IHtyZXBvc2l0b3J5fSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxHaXRUYWJIZWFkZXJDb250cm9sbGVyXG4gICAgICAgIGdldENvbW1pdHRlcj17cmVwb3NpdG9yeS5nZXRDb21taXR0ZXIuYmluZChyZXBvc2l0b3J5KX1cblxuICAgICAgICAvLyBXb3Jrc3BhY2VcbiAgICAgICAgY3VycmVudFdvcmtEaXI9e3RoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGh9XG4gICAgICAgIGdldEN1cnJlbnRXb3JrRGlycz17dGhpcy5wcm9wcy5nZXRDdXJyZW50V29ya0RpcnN9XG4gICAgICAgIGNvbnRleHRMb2NrZWQ9e3RoaXMucHJvcHMuY29udGV4dExvY2tlZH1cbiAgICAgICAgY2hhbmdlV29ya2luZ0RpcmVjdG9yeT17dGhpcy5wcm9wcy5jaGFuZ2VXb3JraW5nRGlyZWN0b3J5fVxuICAgICAgICBzZXRDb250ZXh0TG9jaz17dGhpcy5wcm9wcy5zZXRDb250ZXh0TG9ja31cblxuICAgICAgICAvLyBFdmVudCBIYW5kbGVyc1xuICAgICAgICBvbkRpZENsaWNrQXZhdGFyPXt0aGlzLnByb3BzLnRvZ2dsZUlkZW50aXR5RWRpdG9yfVxuICAgICAgICBvbkRpZENoYW5nZVdvcmtEaXJzPXt0aGlzLnByb3BzLm9uRGlkQ2hhbmdlV29ya0RpcnN9XG4gICAgICAgIG9uRGlkVXBkYXRlUmVwbz17cmVwb3NpdG9yeS5vbkRpZFVwZGF0ZS5iaW5kKHJlcG9zaXRvcnkpfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyTm9ybWFsKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxTdGFnaW5nVmlld1xuICAgICAgICAgIHJlZj17dGhpcy5wcm9wcy5yZWZTdGFnaW5nVmlldy5zZXR0ZXJ9XG4gICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgbm90aWZpY2F0aW9uTWFuYWdlcj17dGhpcy5wcm9wcy5ub3RpZmljYXRpb25NYW5hZ2VyfVxuICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgc3RhZ2VkQ2hhbmdlcz17dGhpcy5wcm9wcy5zdGFnZWRDaGFuZ2VzfVxuICAgICAgICAgIHVuc3RhZ2VkQ2hhbmdlcz17dGhpcy5wcm9wcy51bnN0YWdlZENoYW5nZXN9XG4gICAgICAgICAgbWVyZ2VDb25mbGljdHM9e3RoaXMucHJvcHMubWVyZ2VDb25mbGljdHN9XG4gICAgICAgICAgd29ya2luZ0RpcmVjdG9yeVBhdGg9e3RoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGh9XG4gICAgICAgICAgcmVzb2x1dGlvblByb2dyZXNzPXt0aGlzLnByb3BzLnJlc29sdXRpb25Qcm9ncmVzc31cbiAgICAgICAgICBvcGVuRmlsZXM9e3RoaXMucHJvcHMub3BlbkZpbGVzfVxuICAgICAgICAgIGRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzPXt0aGlzLnByb3BzLmRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzfVxuICAgICAgICAgIGF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb249e3RoaXMucHJvcHMuYXR0ZW1wdEZpbGVTdGFnZU9wZXJhdGlvbn1cbiAgICAgICAgICBhdHRlbXB0U3RhZ2VBbGxPcGVyYXRpb249e3RoaXMucHJvcHMuYXR0ZW1wdFN0YWdlQWxsT3BlcmF0aW9ufVxuICAgICAgICAgIHVuZG9MYXN0RGlzY2FyZD17dGhpcy5wcm9wcy51bmRvTGFzdERpc2NhcmR9XG4gICAgICAgICAgYWJvcnRNZXJnZT17dGhpcy5wcm9wcy5hYm9ydE1lcmdlfVxuICAgICAgICAgIHJlc29sdmVBc091cnM9e3RoaXMucHJvcHMucmVzb2x2ZUFzT3Vyc31cbiAgICAgICAgICByZXNvbHZlQXNUaGVpcnM9e3RoaXMucHJvcHMucmVzb2x2ZUFzVGhlaXJzfVxuICAgICAgICAgIGxhc3RDb21taXQ9e3RoaXMucHJvcHMubGFzdENvbW1pdH1cbiAgICAgICAgICBpc0xvYWRpbmc9e3RoaXMucHJvcHMuaXNMb2FkaW5nfVxuICAgICAgICAgIGhhc1VuZG9IaXN0b3J5PXt0aGlzLnByb3BzLmhhc1VuZG9IaXN0b3J5fVxuICAgICAgICAgIGlzTWVyZ2luZz17dGhpcy5wcm9wcy5pc01lcmdpbmd9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb21taXRDb250cm9sbGVyXG4gICAgICAgICAgcmVmPXt0aGlzLnJlZkNvbW1pdENvbnRyb2xsZXIuc2V0dGVyfVxuICAgICAgICAgIHRvb2x0aXBzPXt0aGlzLnByb3BzLnRvb2x0aXBzfVxuICAgICAgICAgIGNvbmZpZz17dGhpcy5wcm9wcy5jb25maWd9XG4gICAgICAgICAgc3RhZ2VkQ2hhbmdlc0V4aXN0PXt0aGlzLnByb3BzLnN0YWdlZENoYW5nZXMubGVuZ3RoID4gMH1cbiAgICAgICAgICBtZXJnZUNvbmZsaWN0c0V4aXN0PXt0aGlzLnByb3BzLm1lcmdlQ29uZmxpY3RzLmxlbmd0aCA+IDB9XG4gICAgICAgICAgcHJlcGFyZVRvQ29tbWl0PXt0aGlzLnByb3BzLnByZXBhcmVUb0NvbW1pdH1cbiAgICAgICAgICBjb21taXQ9e3RoaXMucHJvcHMuY29tbWl0fVxuICAgICAgICAgIGFib3J0TWVyZ2U9e3RoaXMucHJvcHMuYWJvcnRNZXJnZX1cbiAgICAgICAgICBjdXJyZW50QnJhbmNoPXt0aGlzLnByb3BzLmN1cnJlbnRCcmFuY2h9XG4gICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICBjb21tYW5kcz17dGhpcy5wcm9wcy5jb21tYW5kc31cbiAgICAgICAgICBub3RpZmljYXRpb25NYW5hZ2VyPXt0aGlzLnByb3BzLm5vdGlmaWNhdGlvbk1hbmFnZXJ9XG4gICAgICAgICAgZ3JhbW1hcnM9e3RoaXMucHJvcHMuZ3JhbW1hcnN9XG4gICAgICAgICAgbWVyZ2VNZXNzYWdlPXt0aGlzLnByb3BzLm1lcmdlTWVzc2FnZX1cbiAgICAgICAgICBpc01lcmdpbmc9e3RoaXMucHJvcHMuaXNNZXJnaW5nfVxuICAgICAgICAgIGlzTG9hZGluZz17dGhpcy5wcm9wcy5pc0xvYWRpbmd9XG4gICAgICAgICAgbGFzdENvbW1pdD17dGhpcy5wcm9wcy5sYXN0Q29tbWl0fVxuICAgICAgICAgIHJlcG9zaXRvcnk9e3RoaXMucHJvcHMucmVwb3NpdG9yeX1cbiAgICAgICAgICB1c2VyU3RvcmU9e3RoaXMucHJvcHMudXNlclN0b3JlfVxuICAgICAgICAgIHNlbGVjdGVkQ29BdXRob3JzPXt0aGlzLnByb3BzLnNlbGVjdGVkQ29BdXRob3JzfVxuICAgICAgICAgIHVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzPXt0aGlzLnByb3BzLnVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzfVxuICAgICAgICAvPlxuICAgICAgICA8UmVjZW50Q29tbWl0c0NvbnRyb2xsZXJcbiAgICAgICAgICByZWY9e3RoaXMucmVmUmVjZW50Q29tbWl0c0NvbnRyb2xsZXIuc2V0dGVyfVxuICAgICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICAgIGNvbW1pdHM9e3RoaXMucHJvcHMucmVjZW50Q29tbWl0c31cbiAgICAgICAgICBpc0xvYWRpbmc9e3RoaXMucHJvcHMuaXNMb2FkaW5nfVxuICAgICAgICAgIHVuZG9MYXN0Q29tbWl0PXt0aGlzLnByb3BzLnVuZG9MYXN0Q29tbWl0fVxuICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgcmVwb3NpdG9yeT17dGhpcy5wcm9wcy5yZXBvc2l0b3J5fVxuICAgICAgICAvPlxuICAgICAgPC9GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyVG9vTGFyZ2UoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLUdpdCB0b28tbWFueS1jaGFuZ2VzXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLUdpdC1MYXJnZUljb24gaWNvbiBpY29uLWRpZmZcIiAvPlxuICAgICAgICA8aDE+VG9vIG1hbnkgY2hhbmdlczwvaDE+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5pdGlhbGl6ZS1yZXBvLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgVGhlIHJlcG9zaXRvcnkgYXQgPHN0cm9uZz57dGhpcy5wcm9wcy53b3JraW5nRGlyZWN0b3J5UGF0aH08L3N0cm9uZz4gaGFzIHRvbyBtYW55IGNoYW5nZWQgZmlsZXNcbiAgICAgICAgICB0byBkaXNwbGF5IGluIEF0b20uIEVuc3VyZSB0aGF0IHlvdSBoYXZlIHNldCB1cCBhbiBhcHByb3ByaWF0ZSA8Y29kZT4uZ2l0aWdub3JlPC9jb2RlPiBmaWxlLlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJVbnN1cHBvcnRlZERpcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItR2l0IHVuc3VwcG9ydGVkLWRpcmVjdG9yeVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1HaXQtTGFyZ2VJY29uIGljb24gaWNvbi1hbGVydFwiIC8+XG4gICAgICAgIDxoMT5VbnN1cHBvcnRlZCBkaXJlY3Rvcnk8L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImluaXRpYWxpemUtcmVwby1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgIEF0b20gZG9lcyBub3Qgc3VwcG9ydCBtYW5hZ2luZyBHaXQgcmVwb3NpdG9yaWVzIGluIHlvdXIgaG9tZSBvciByb290IGRpcmVjdG9yaWVzLlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJOb1JlcG8oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLUdpdCBuby1yZXBvc2l0b3J5XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLUdpdC1MYXJnZUljb24gaWNvbiBpY29uLXJlcG9cIiAvPlxuICAgICAgICA8aDE+Q3JlYXRlIFJlcG9zaXRvcnk8L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImluaXRpYWxpemUtcmVwby1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVwb3NpdG9yeS5oYXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICA8c3Bhbj5Jbml0aWFsaXplIDxzdHJvbmc+e3RoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGh9PC9zdHJvbmc+IHdpdGggYVxuICAgICAgICAgICAgICAgIEdpdCByZXBvc2l0b3J5PC9zcGFuPlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIDogPHNwYW4+SW5pdGlhbGl6ZSBhIG5ldyBwcm9qZWN0IGRpcmVjdG9yeSB3aXRoIGEgR2l0IHJlcG9zaXRvcnk8L3NwYW4+XG4gICAgICAgICAgfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaW5pdGlhbGl6ZVJlcG99XG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMucmVwb3NpdG9yeS5zaG93R2l0VGFiSW5pdEluUHJvZ3Jlc3MoKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5yZXBvc2l0b3J5LnNob3dHaXRUYWJJbml0SW5Qcm9ncmVzcygpXG4gICAgICAgICAgICA/ICdDcmVhdGluZyByZXBvc2l0b3J5Li4uJyA6ICdDcmVhdGUgcmVwb3NpdG9yeSd9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcklkZW50aXR5VmlldygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEdpdElkZW50aXR5Vmlld1xuICAgICAgICB1c2VybmFtZUJ1ZmZlcj17dGhpcy5wcm9wcy51c2VybmFtZUJ1ZmZlcn1cbiAgICAgICAgZW1haWxCdWZmZXI9e3RoaXMucHJvcHMuZW1haWxCdWZmZXJ9XG4gICAgICAgIGNhbldyaXRlTG9jYWw9e3RoaXMucHJvcHMucmVwb3NpdG9yeS5pc1ByZXNlbnQoKX1cbiAgICAgICAgc2V0TG9jYWw9e3RoaXMucHJvcHMuc2V0TG9jYWxJZGVudGl0eX1cbiAgICAgICAgc2V0R2xvYmFsPXt0aGlzLnByb3BzLnNldEdsb2JhbElkZW50aXR5fVxuICAgICAgICBjbG9zZT17dGhpcy5wcm9wcy5jbG9zZUlkZW50aXR5RWRpdG9yfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGluaXRpYWxpemVSZXBvKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IHdvcmtkaXIgPSB0aGlzLnByb3BzLnJlcG9zaXRvcnkuaXNBYnNlbnQoKSA/IG51bGwgOiB0aGlzLnByb3BzLnJlcG9zaXRvcnkuZ2V0V29ya2luZ0RpcmVjdG9yeVBhdGgoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vcGVuSW5pdGlhbGl6ZURpYWxvZyh3b3JrZGlyKTtcbiAgfVxuXG4gIGdldEZvY3VzKGVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IHJlZiBvZiBbdGhpcy5wcm9wcy5yZWZTdGFnaW5nVmlldywgdGhpcy5yZWZDb21taXRDb250cm9sbGVyLCB0aGlzLnJlZlJlY2VudENvbW1pdHNDb250cm9sbGVyXSkge1xuICAgICAgY29uc3QgZm9jdXMgPSByZWYubWFwKHN1YiA9PiBzdWIuZ2V0Rm9jdXMoZWxlbWVudCkpLmdldE9yKG51bGwpO1xuICAgICAgaWYgKGZvY3VzICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmb2N1cztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBzZXRGb2N1cyhmb2N1cykge1xuICAgIGZvciAoY29uc3QgcmVmIG9mIFt0aGlzLnByb3BzLnJlZlN0YWdpbmdWaWV3LCB0aGlzLnJlZkNvbW1pdENvbnRyb2xsZXIsIHRoaXMucmVmUmVjZW50Q29tbWl0c0NvbnRyb2xsZXJdKSB7XG4gICAgICBpZiAocmVmLm1hcChzdWIgPT4gc3ViLnNldEZvY3VzKGZvY3VzKSkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBibHVyKCkge1xuICAgIHRoaXMucHJvcHMud29ya3NwYWNlLmdldENlbnRlcigpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBhc3luYyBhZHZhbmNlRm9jdXMoZXZ0KSB7XG4gICAgY29uc3QgY3VycmVudEZvY3VzID0gdGhpcy5nZXRGb2N1cyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICBsZXQgbmV4dFNlZW4gPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3Qgc3ViSG9sZGVyIG9mIFt0aGlzLnByb3BzLnJlZlN0YWdpbmdWaWV3LCB0aGlzLnJlZkNvbW1pdENvbnRyb2xsZXIsIHRoaXMucmVmUmVjZW50Q29tbWl0c0NvbnRyb2xsZXJdKSB7XG4gICAgICBjb25zdCBuZXh0ID0gYXdhaXQgc3ViSG9sZGVyLm1hcChzdWIgPT4gc3ViLmFkdmFuY2VGb2N1c0Zyb20oY3VycmVudEZvY3VzKSkuZ2V0T3IobnVsbCk7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCAmJiAhbmV4dFNlZW4pIHtcbiAgICAgICAgbmV4dFNlZW4gPSB0cnVlO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChuZXh0ICE9PSBjdXJyZW50Rm9jdXMpIHtcbiAgICAgICAgICB0aGlzLnNldEZvY3VzKG5leHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmV0cmVhdEZvY3VzKGV2dCkge1xuICAgIGNvbnN0IGN1cnJlbnRGb2N1cyA9IHRoaXMuZ2V0Rm9jdXMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgbGV0IHByZXZpb3VzU2VlbiA9IGZhbHNlO1xuXG4gICAgZm9yIChjb25zdCBzdWJIb2xkZXIgb2YgW3RoaXMucmVmUmVjZW50Q29tbWl0c0NvbnRyb2xsZXIsIHRoaXMucmVmQ29tbWl0Q29udHJvbGxlciwgdGhpcy5wcm9wcy5yZWZTdGFnaW5nVmlld10pIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gYXdhaXQgc3ViSG9sZGVyLm1hcChzdWIgPT4gc3ViLnJldHJlYXRGb2N1c0Zyb20oY3VycmVudEZvY3VzKSkuZ2V0T3IobnVsbCk7XG4gICAgICBpZiAocHJldmlvdXMgIT09IG51bGwgJiYgIXByZXZpb3VzU2Vlbikge1xuICAgICAgICBwcmV2aW91c1NlZW4gPSB0cnVlO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChwcmV2aW91cyAhPT0gY3VycmVudEZvY3VzKSB7XG4gICAgICAgICAgdGhpcy5zZXRGb2N1cyhwcmV2aW91cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBmb2N1c0FuZFNlbGVjdFN0YWdpbmdJdGVtKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSB7XG4gICAgYXdhaXQgdGhpcy5xdWlldGx5U2VsZWN0SXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cyk7XG4gICAgdGhpcy5zZXRGb2N1cyhHaXRUYWJWaWV3LmZvY3VzLlNUQUdJTkcpO1xuICB9XG5cbiAgZm9jdXNBbmRTZWxlY3RSZWNlbnRDb21taXQoKSB7XG4gICAgdGhpcy5zZXRGb2N1cyhSZWNlbnRDb21taXRzQ29udHJvbGxlci5mb2N1cy5SRUNFTlRfQ09NTUlUKTtcbiAgfVxuXG4gIGZvY3VzQW5kU2VsZWN0Q29tbWl0UHJldmlld0J1dHRvbigpIHtcbiAgICB0aGlzLnNldEZvY3VzKEdpdFRhYlZpZXcuZm9jdXMuQ09NTUlUX1BSRVZJRVdfQlVUVE9OKTtcbiAgfVxuXG4gIHF1aWV0bHlTZWxlY3RJdGVtKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMucmVmU3RhZ2luZ1ZpZXcubWFwKHZpZXcgPT4gdmlldy5xdWlldGx5U2VsZWN0SXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cykpLmdldE9yKGZhbHNlKTtcbiAgfVxuXG4gIGhhc0ZvY3VzKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJlZlJvb3QubWFwKHJvb3QgPT4gcm9vdC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkuZ2V0T3IoZmFsc2UpO1xuICB9XG59XG4iXX0=