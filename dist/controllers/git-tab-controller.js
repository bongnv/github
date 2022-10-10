"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _atom = require("atom");

var _gitTabView = _interopRequireDefault(require("../views/git-tab-view"));

var _userStore = _interopRequireDefault(require("../models/user-store"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _propTypes2 = require("../prop-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class GitTabController extends _react.default.Component {
  constructor(props, context) {
    super(props, context);

    _defineProperty(this, "attemptStageAllOperation", stageStatus => {
      return this.attemptFileStageOperation(['.'], stageStatus);
    });

    _defineProperty(this, "attemptFileStageOperation", (filePaths, stageStatus) => {
      if (this.stagingOperationInProgress) {
        return {
          stageOperationPromise: Promise.resolve(),
          selectionUpdatePromise: Promise.resolve()
        };
      }

      this.stagingOperationInProgress = true;
      const fileListUpdatePromise = this.refStagingView.map(view => {
        return view.getNextListUpdatePromise();
      }).getOr(Promise.resolve());
      let stageOperationPromise;

      if (stageStatus === 'staged') {
        stageOperationPromise = this.unstageFiles(filePaths);
      } else {
        stageOperationPromise = this.stageFiles(filePaths);
      }

      const selectionUpdatePromise = fileListUpdatePromise.then(() => {
        this.stagingOperationInProgress = false;
      });
      return {
        stageOperationPromise,
        selectionUpdatePromise
      };
    });

    _defineProperty(this, "prepareToCommit", async () => {
      return !(await this.props.ensureGitTab());
    });

    _defineProperty(this, "commit", (message, options) => {
      return this.props.repository.commit(message, options);
    });

    _defineProperty(this, "updateSelectedCoAuthors", (selectedCoAuthors, newAuthor) => {
      if (newAuthor) {
        this.userStore.addUsers([newAuthor]);
        selectedCoAuthors = selectedCoAuthors.concat([newAuthor]);
      }

      this.setState({
        selectedCoAuthors
      });
    });

    _defineProperty(this, "undoLastCommit", async () => {
      const repo = this.props.repository;
      const lastCommit = await repo.getLastCommit();

      if (lastCommit.isUnbornRef()) {
        return null;
      }

      await repo.undoLastCommit();
      repo.setCommitMessage(lastCommit.getFullMessage());
      this.updateSelectedCoAuthors(lastCommit.getCoAuthors());
      return null;
    });

    _defineProperty(this, "abortMerge", async () => {
      const choice = this.props.confirm({
        message: 'Abort merge',
        detailedMessage: 'Are you sure?',
        buttons: ['Abort', 'Cancel']
      });

      if (choice !== 0) {
        return;
      }

      try {
        await this.props.repository.abortMerge();
      } catch (e) {
        if (e.code === 'EDIRTYSTAGED') {
          this.props.notificationManager.addError(`Cannot abort because ${e.path} is both dirty and staged.`, {
            dismissable: true
          });
        } else {
          throw e;
        }
      }
    });

    _defineProperty(this, "resolveAsOurs", async paths => {
      if (this.props.fetchInProgress) {
        return;
      }

      const side = this.props.isRebasing ? 'theirs' : 'ours';
      await this.props.repository.checkoutSide(side, paths);
      this.refreshResolutionProgress(false, true);
    });

    _defineProperty(this, "resolveAsTheirs", async paths => {
      if (this.props.fetchInProgress) {
        return;
      }

      const side = this.props.isRebasing ? 'ours' : 'theirs';
      await this.props.repository.checkoutSide(side, paths);
      this.refreshResolutionProgress(false, true);
    });

    _defineProperty(this, "checkout", (branchName, options) => {
      return this.props.repository.checkout(branchName, options);
    });

    _defineProperty(this, "rememberLastFocus", event => {
      this.lastFocus = this.refView.map(view => view.getFocus(event.target)).getOr(null) || _gitTabView.default.focus.STAGING;
    });

    _defineProperty(this, "toggleIdentityEditor", () => this.setState(before => ({
      editingIdentity: !before.editingIdentity
    })));

    _defineProperty(this, "closeIdentityEditor", () => this.setState({
      editingIdentity: false
    }));

    _defineProperty(this, "setLocalIdentity", () => this.setIdentity({}));

    _defineProperty(this, "setGlobalIdentity", () => this.setIdentity({
      global: true
    }));

    this.stagingOperationInProgress = false;
    this.lastFocus = _gitTabView.default.focus.STAGING;
    this.refView = new _refHolder.default();
    this.refRoot = new _refHolder.default();
    this.refStagingView = new _refHolder.default();
    this.state = {
      selectedCoAuthors: [],
      editingIdentity: false
    };
    this.usernameBuffer = new _atom.TextBuffer({
      text: props.username
    });
    this.usernameBuffer.retain();
    this.emailBuffer = new _atom.TextBuffer({
      text: props.email
    });
    this.emailBuffer.retain();
    this.userStore = new _userStore.default({
      repository: this.props.repository,
      login: this.props.loginModel,
      config: this.props.config
    });
  }

  static getDerivedStateFromProps(props, state) {
    return {
      editingIdentity: state.editingIdentity || !props.fetchInProgress && props.repository.isPresent() && !props.repositoryDrift && (props.username === '' || props.email === '')
    };
  }

  render() {
    return _react.default.createElement(_gitTabView.default, {
      ref: this.refView.setter,
      refRoot: this.refRoot,
      refStagingView: this.refStagingView,
      isLoading: this.props.fetchInProgress,
      editingIdentity: this.state.editingIdentity,
      repository: this.props.repository,
      usernameBuffer: this.usernameBuffer,
      emailBuffer: this.emailBuffer,
      lastCommit: this.props.lastCommit,
      recentCommits: this.props.recentCommits,
      isMerging: this.props.isMerging,
      isRebasing: this.props.isRebasing,
      hasUndoHistory: this.props.hasUndoHistory,
      currentBranch: this.props.currentBranch,
      unstagedChanges: this.props.unstagedChanges,
      stagedChanges: this.props.stagedChanges,
      mergeConflicts: this.props.mergeConflicts,
      workingDirectoryPath: this.props.workingDirectoryPath || this.props.currentWorkDir,
      mergeMessage: this.props.mergeMessage,
      userStore: this.userStore,
      selectedCoAuthors: this.state.selectedCoAuthors,
      updateSelectedCoAuthors: this.updateSelectedCoAuthors,
      resolutionProgress: this.props.resolutionProgress,
      workspace: this.props.workspace,
      commands: this.props.commands,
      grammars: this.props.grammars,
      tooltips: this.props.tooltips,
      notificationManager: this.props.notificationManager,
      project: this.props.project,
      confirm: this.props.confirm,
      config: this.props.config,
      toggleIdentityEditor: this.toggleIdentityEditor,
      closeIdentityEditor: this.closeIdentityEditor,
      setLocalIdentity: this.setLocalIdentity,
      setGlobalIdentity: this.setGlobalIdentity,
      openInitializeDialog: this.props.openInitializeDialog,
      openFiles: this.props.openFiles,
      discardWorkDirChangesForPaths: this.props.discardWorkDirChangesForPaths,
      undoLastDiscard: this.props.undoLastDiscard,
      contextLocked: this.props.contextLocked,
      changeWorkingDirectory: this.props.changeWorkingDirectory,
      setContextLock: this.props.setContextLock,
      getCurrentWorkDirs: this.props.getCurrentWorkDirs,
      onDidChangeWorkDirs: this.props.onDidChangeWorkDirs,
      attemptFileStageOperation: this.attemptFileStageOperation,
      attemptStageAllOperation: this.attemptStageAllOperation,
      prepareToCommit: this.prepareToCommit,
      commit: this.commit,
      undoLastCommit: this.undoLastCommit,
      push: this.push,
      pull: this.pull,
      fetch: this.fetch,
      checkout: this.checkout,
      abortMerge: this.abortMerge,
      resolveAsOurs: this.resolveAsOurs,
      resolveAsTheirs: this.resolveAsTheirs
    });
  }

  componentDidMount() {
    this.refreshResolutionProgress(false, false);
    this.refRoot.map(root => root.addEventListener('focusin', this.rememberLastFocus));

    if (this.props.controllerRef) {
      this.props.controllerRef.setter(this);
    }
  }

  componentDidUpdate(prevProps) {
    this.userStore.setRepository(this.props.repository);
    this.userStore.setLoginModel(this.props.loginModel);
    this.refreshResolutionProgress(false, false);

    if (prevProps.username !== this.props.username) {
      this.usernameBuffer.setTextViaDiff(this.props.username);
    }

    if (prevProps.email !== this.props.email) {
      this.emailBuffer.setTextViaDiff(this.props.email);
    }
  }

  componentWillUnmount() {
    this.refRoot.map(root => root.removeEventListener('focusin', this.rememberLastFocus));
  }
  /*
   * Begin (but don't await) an async conflict-counting task for each merge conflict path that has no conflict
   * marker count yet. Omit any path that's already open in a TextEditor or that has already been counted.
   *
   * includeOpen - update marker counts for files that are currently open in TextEditors
   * includeCounted - update marker counts for files that have been counted before
   */


  refreshResolutionProgress(includeOpen, includeCounted) {
    if (this.props.fetchInProgress) {
      return;
    }

    const openPaths = new Set(this.props.workspace.getTextEditors().map(editor => editor.getPath()));

    for (let i = 0; i < this.props.mergeConflicts.length; i++) {
      const conflictPath = _path.default.join(this.props.workingDirectoryPath, this.props.mergeConflicts[i].filePath);

      if (!includeOpen && openPaths.has(conflictPath)) {
        continue;
      }

      if (!includeCounted && this.props.resolutionProgress.getRemaining(conflictPath) !== undefined) {
        continue;
      }

      this.props.refreshResolutionProgress(conflictPath);
    }
  }

  async stageFiles(filePaths) {
    const pathsToStage = new Set(filePaths);
    const mergeMarkers = await Promise.all(filePaths.map(async filePath => {
      return {
        filePath,
        hasMarkers: await this.props.repository.pathHasMergeMarkers(filePath)
      };
    }));

    for (const {
      filePath,
      hasMarkers
    } of mergeMarkers) {
      if (hasMarkers) {
        const choice = this.props.confirm({
          message: 'File contains merge markers: ',
          detailedMessage: `Do you still want to stage this file?\n${filePath}`,
          buttons: ['Stage', 'Cancel']
        });

        if (choice !== 0) {
          pathsToStage.delete(filePath);
        }
      }
    }

    return this.props.repository.stageFiles(Array.from(pathsToStage));
  }

  unstageFiles(filePaths) {
    return this.props.repository.unstageFiles(filePaths);
  }

  async setIdentity(options) {
    const newUsername = this.usernameBuffer.getText();
    const newEmail = this.emailBuffer.getText();

    if (newUsername.length > 0 || options.global) {
      await this.props.repository.setConfig('user.name', newUsername, options);
    } else {
      await this.props.repository.unsetConfig('user.name');
    }

    if (newEmail.length > 0 || options.global) {
      await this.props.repository.setConfig('user.email', newEmail, options);
    } else {
      await this.props.repository.unsetConfig('user.email');
    }

    this.closeIdentityEditor();
  }

  restoreFocus() {
    this.refView.map(view => view.setFocus(this.lastFocus));
  }

  hasFocus() {
    return this.refRoot.map(root => root.contains(document.activeElement)).getOr(false);
  }

  wasActivated(isStillActive) {
    process.nextTick(() => {
      isStillActive() && this.restoreFocus();
    });
  }

  focusAndSelectStagingItem(filePath, stagingStatus) {
    return this.refView.map(view => view.focusAndSelectStagingItem(filePath, stagingStatus)).getOr(null);
  }

  focusAndSelectCommitPreviewButton() {
    return this.refView.map(view => view.focusAndSelectCommitPreviewButton());
  }

  focusAndSelectRecentCommit() {
    return this.refView.map(view => view.focusAndSelectRecentCommit());
  }

  quietlySelectItem(filePath, stagingStatus) {
    return this.refView.map(view => view.quietlySelectItem(filePath, stagingStatus)).getOr(null);
  }

}

exports.default = GitTabController;

_defineProperty(GitTabController, "focus", _objectSpread2({}, _gitTabView.default.focus));

_defineProperty(GitTabController, "propTypes", {
  repository: _propTypes.default.object.isRequired,
  loginModel: _propTypes.default.object.isRequired,
  username: _propTypes.default.string.isRequired,
  email: _propTypes.default.string.isRequired,
  lastCommit: _propTypes2.CommitPropType.isRequired,
  recentCommits: _propTypes.default.arrayOf(_propTypes2.CommitPropType).isRequired,
  isMerging: _propTypes.default.bool.isRequired,
  isRebasing: _propTypes.default.bool.isRequired,
  hasUndoHistory: _propTypes.default.bool.isRequired,
  currentBranch: _propTypes2.BranchPropType.isRequired,
  unstagedChanges: _propTypes.default.arrayOf(_propTypes2.FilePatchItemPropType).isRequired,
  stagedChanges: _propTypes.default.arrayOf(_propTypes2.FilePatchItemPropType).isRequired,
  mergeConflicts: _propTypes.default.arrayOf(_propTypes2.MergeConflictItemPropType).isRequired,
  workingDirectoryPath: _propTypes.default.string,
  mergeMessage: _propTypes.default.string,
  fetchInProgress: _propTypes.default.bool.isRequired,
  currentWorkDir: _propTypes.default.string,
  repositoryDrift: _propTypes.default.bool.isRequired,
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  grammars: _propTypes.default.object.isRequired,
  resolutionProgress: _propTypes.default.object.isRequired,
  notificationManager: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  project: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  confirm: _propTypes.default.func.isRequired,
  ensureGitTab: _propTypes.default.func.isRequired,
  refreshResolutionProgress: _propTypes.default.func.isRequired,
  undoLastDiscard: _propTypes.default.func.isRequired,
  discardWorkDirChangesForPaths: _propTypes.default.func.isRequired,
  openFiles: _propTypes.default.func.isRequired,
  openInitializeDialog: _propTypes.default.func.isRequired,
  controllerRef: _propTypes2.RefHolderPropType,
  contextLocked: _propTypes.default.bool.isRequired,
  changeWorkingDirectory: _propTypes.default.func.isRequired,
  setContextLock: _propTypes.default.func.isRequired,
  onDidChangeWorkDirs: _propTypes.default.func.isRequired,
  getCurrentWorkDirs: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250cm9sbGVycy9naXQtdGFiLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiR2l0VGFiQ29udHJvbGxlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJzdGFnZVN0YXR1cyIsImF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb24iLCJmaWxlUGF0aHMiLCJzdGFnaW5nT3BlcmF0aW9uSW5Qcm9ncmVzcyIsInN0YWdlT3BlcmF0aW9uUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwic2VsZWN0aW9uVXBkYXRlUHJvbWlzZSIsImZpbGVMaXN0VXBkYXRlUHJvbWlzZSIsInJlZlN0YWdpbmdWaWV3IiwibWFwIiwidmlldyIsImdldE5leHRMaXN0VXBkYXRlUHJvbWlzZSIsImdldE9yIiwidW5zdGFnZUZpbGVzIiwic3RhZ2VGaWxlcyIsInRoZW4iLCJlbnN1cmVHaXRUYWIiLCJtZXNzYWdlIiwib3B0aW9ucyIsInJlcG9zaXRvcnkiLCJjb21taXQiLCJzZWxlY3RlZENvQXV0aG9ycyIsIm5ld0F1dGhvciIsInVzZXJTdG9yZSIsImFkZFVzZXJzIiwiY29uY2F0Iiwic2V0U3RhdGUiLCJyZXBvIiwibGFzdENvbW1pdCIsImdldExhc3RDb21taXQiLCJpc1VuYm9yblJlZiIsInVuZG9MYXN0Q29tbWl0Iiwic2V0Q29tbWl0TWVzc2FnZSIsImdldEZ1bGxNZXNzYWdlIiwidXBkYXRlU2VsZWN0ZWRDb0F1dGhvcnMiLCJnZXRDb0F1dGhvcnMiLCJjaG9pY2UiLCJjb25maXJtIiwiZGV0YWlsZWRNZXNzYWdlIiwiYnV0dG9ucyIsImFib3J0TWVyZ2UiLCJlIiwiY29kZSIsIm5vdGlmaWNhdGlvbk1hbmFnZXIiLCJhZGRFcnJvciIsInBhdGgiLCJkaXNtaXNzYWJsZSIsInBhdGhzIiwiZmV0Y2hJblByb2dyZXNzIiwic2lkZSIsImlzUmViYXNpbmciLCJjaGVja291dFNpZGUiLCJyZWZyZXNoUmVzb2x1dGlvblByb2dyZXNzIiwiYnJhbmNoTmFtZSIsImNoZWNrb3V0IiwiZXZlbnQiLCJsYXN0Rm9jdXMiLCJyZWZWaWV3IiwiZ2V0Rm9jdXMiLCJ0YXJnZXQiLCJHaXRUYWJWaWV3IiwiZm9jdXMiLCJTVEFHSU5HIiwiYmVmb3JlIiwiZWRpdGluZ0lkZW50aXR5Iiwic2V0SWRlbnRpdHkiLCJnbG9iYWwiLCJSZWZIb2xkZXIiLCJyZWZSb290Iiwic3RhdGUiLCJ1c2VybmFtZUJ1ZmZlciIsIlRleHRCdWZmZXIiLCJ0ZXh0IiwidXNlcm5hbWUiLCJyZXRhaW4iLCJlbWFpbEJ1ZmZlciIsImVtYWlsIiwiVXNlclN0b3JlIiwibG9naW4iLCJsb2dpbk1vZGVsIiwiY29uZmlnIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzIiwiaXNQcmVzZW50IiwicmVwb3NpdG9yeURyaWZ0IiwicmVuZGVyIiwic2V0dGVyIiwicmVjZW50Q29tbWl0cyIsImlzTWVyZ2luZyIsImhhc1VuZG9IaXN0b3J5IiwiY3VycmVudEJyYW5jaCIsInVuc3RhZ2VkQ2hhbmdlcyIsInN0YWdlZENoYW5nZXMiLCJtZXJnZUNvbmZsaWN0cyIsIndvcmtpbmdEaXJlY3RvcnlQYXRoIiwiY3VycmVudFdvcmtEaXIiLCJtZXJnZU1lc3NhZ2UiLCJyZXNvbHV0aW9uUHJvZ3Jlc3MiLCJ3b3Jrc3BhY2UiLCJjb21tYW5kcyIsImdyYW1tYXJzIiwidG9vbHRpcHMiLCJwcm9qZWN0IiwidG9nZ2xlSWRlbnRpdHlFZGl0b3IiLCJjbG9zZUlkZW50aXR5RWRpdG9yIiwic2V0TG9jYWxJZGVudGl0eSIsInNldEdsb2JhbElkZW50aXR5Iiwib3BlbkluaXRpYWxpemVEaWFsb2ciLCJvcGVuRmlsZXMiLCJkaXNjYXJkV29ya0RpckNoYW5nZXNGb3JQYXRocyIsInVuZG9MYXN0RGlzY2FyZCIsImNvbnRleHRMb2NrZWQiLCJjaGFuZ2VXb3JraW5nRGlyZWN0b3J5Iiwic2V0Q29udGV4dExvY2siLCJnZXRDdXJyZW50V29ya0RpcnMiLCJvbkRpZENoYW5nZVdvcmtEaXJzIiwiYXR0ZW1wdFN0YWdlQWxsT3BlcmF0aW9uIiwicHJlcGFyZVRvQ29tbWl0IiwicHVzaCIsInB1bGwiLCJmZXRjaCIsInJlc29sdmVBc091cnMiLCJyZXNvbHZlQXNUaGVpcnMiLCJjb21wb25lbnREaWRNb3VudCIsInJvb3QiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtZW1iZXJMYXN0Rm9jdXMiLCJjb250cm9sbGVyUmVmIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwic2V0UmVwb3NpdG9yeSIsInNldExvZ2luTW9kZWwiLCJzZXRUZXh0VmlhRGlmZiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluY2x1ZGVPcGVuIiwiaW5jbHVkZUNvdW50ZWQiLCJvcGVuUGF0aHMiLCJTZXQiLCJnZXRUZXh0RWRpdG9ycyIsImVkaXRvciIsImdldFBhdGgiLCJpIiwibGVuZ3RoIiwiY29uZmxpY3RQYXRoIiwiam9pbiIsImZpbGVQYXRoIiwiaGFzIiwiZ2V0UmVtYWluaW5nIiwidW5kZWZpbmVkIiwicGF0aHNUb1N0YWdlIiwibWVyZ2VNYXJrZXJzIiwiYWxsIiwiaGFzTWFya2VycyIsInBhdGhIYXNNZXJnZU1hcmtlcnMiLCJkZWxldGUiLCJBcnJheSIsImZyb20iLCJuZXdVc2VybmFtZSIsImdldFRleHQiLCJuZXdFbWFpbCIsInNldENvbmZpZyIsInVuc2V0Q29uZmlnIiwicmVzdG9yZUZvY3VzIiwic2V0Rm9jdXMiLCJoYXNGb2N1cyIsImNvbnRhaW5zIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50Iiwid2FzQWN0aXZhdGVkIiwiaXNTdGlsbEFjdGl2ZSIsInByb2Nlc3MiLCJuZXh0VGljayIsImZvY3VzQW5kU2VsZWN0U3RhZ2luZ0l0ZW0iLCJzdGFnaW5nU3RhdHVzIiwiZm9jdXNBbmRTZWxlY3RDb21taXRQcmV2aWV3QnV0dG9uIiwiZm9jdXNBbmRTZWxlY3RSZWNlbnRDb21taXQiLCJxdWlldGx5U2VsZWN0SXRlbSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJDb21taXRQcm9wVHlwZSIsImFycmF5T2YiLCJib29sIiwiQnJhbmNoUHJvcFR5cGUiLCJGaWxlUGF0Y2hJdGVtUHJvcFR5cGUiLCJNZXJnZUNvbmZsaWN0SXRlbVByb3BUeXBlIiwiZnVuYyIsIlJlZkhvbGRlclByb3BUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBSWUsTUFBTUEsZ0JBQU4sU0FBK0JDLGVBQU1DLFNBQXJDLENBQStDO0FBa0Q1REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVFDLE9BQVIsRUFBaUI7QUFDMUIsVUFBTUQsS0FBTixFQUFhQyxPQUFiOztBQUQwQixzREFvS0RDLFdBQVcsSUFBSTtBQUN4QyxhQUFPLEtBQUtDLHlCQUFMLENBQStCLENBQUMsR0FBRCxDQUEvQixFQUFzQ0QsV0FBdEMsQ0FBUDtBQUNELEtBdEsyQjs7QUFBQSx1REF3S0EsQ0FBQ0UsU0FBRCxFQUFZRixXQUFaLEtBQTRCO0FBQ3RELFVBQUksS0FBS0csMEJBQVQsRUFBcUM7QUFDbkMsZUFBTztBQUNMQyxVQUFBQSxxQkFBcUIsRUFBRUMsT0FBTyxDQUFDQyxPQUFSLEVBRGxCO0FBRUxDLFVBQUFBLHNCQUFzQixFQUFFRixPQUFPLENBQUNDLE9BQVI7QUFGbkIsU0FBUDtBQUlEOztBQUVELFdBQUtILDBCQUFMLEdBQWtDLElBQWxDO0FBRUEsWUFBTUsscUJBQXFCLEdBQUcsS0FBS0MsY0FBTCxDQUFvQkMsR0FBcEIsQ0FBd0JDLElBQUksSUFBSTtBQUM1RCxlQUFPQSxJQUFJLENBQUNDLHdCQUFMLEVBQVA7QUFDRCxPQUY2QixFQUUzQkMsS0FGMkIsQ0FFckJSLE9BQU8sQ0FBQ0MsT0FBUixFQUZxQixDQUE5QjtBQUdBLFVBQUlGLHFCQUFKOztBQUNBLFVBQUlKLFdBQVcsS0FBSyxRQUFwQixFQUE4QjtBQUM1QkksUUFBQUEscUJBQXFCLEdBQUcsS0FBS1UsWUFBTCxDQUFrQlosU0FBbEIsQ0FBeEI7QUFDRCxPQUZELE1BRU87QUFDTEUsUUFBQUEscUJBQXFCLEdBQUcsS0FBS1csVUFBTCxDQUFnQmIsU0FBaEIsQ0FBeEI7QUFDRDs7QUFDRCxZQUFNSyxzQkFBc0IsR0FBR0MscUJBQXFCLENBQUNRLElBQXRCLENBQTJCLE1BQU07QUFDOUQsYUFBS2IsMEJBQUwsR0FBa0MsS0FBbEM7QUFDRCxPQUY4QixDQUEvQjtBQUlBLGFBQU87QUFBQ0MsUUFBQUEscUJBQUQ7QUFBd0JHLFFBQUFBO0FBQXhCLE9BQVA7QUFDRCxLQWhNMkI7O0FBQUEsNkNBZ09WLFlBQVk7QUFDNUIsYUFBTyxFQUFDLE1BQU0sS0FBS1QsS0FBTCxDQUFXbUIsWUFBWCxFQUFQLENBQVA7QUFDRCxLQWxPMkI7O0FBQUEsb0NBb09uQixDQUFDQyxPQUFELEVBQVVDLE9BQVYsS0FBc0I7QUFDN0IsYUFBTyxLQUFLckIsS0FBTCxDQUFXc0IsVUFBWCxDQUFzQkMsTUFBdEIsQ0FBNkJILE9BQTdCLEVBQXNDQyxPQUF0QyxDQUFQO0FBQ0QsS0F0TzJCOztBQUFBLHFEQXdPRixDQUFDRyxpQkFBRCxFQUFvQkMsU0FBcEIsS0FBa0M7QUFDMUQsVUFBSUEsU0FBSixFQUFlO0FBQ2IsYUFBS0MsU0FBTCxDQUFlQyxRQUFmLENBQXdCLENBQUNGLFNBQUQsQ0FBeEI7QUFDQUQsUUFBQUEsaUJBQWlCLEdBQUdBLGlCQUFpQixDQUFDSSxNQUFsQixDQUF5QixDQUFDSCxTQUFELENBQXpCLENBQXBCO0FBQ0Q7O0FBQ0QsV0FBS0ksUUFBTCxDQUFjO0FBQUNMLFFBQUFBO0FBQUQsT0FBZDtBQUNELEtBOU8yQjs7QUFBQSw0Q0FnUFgsWUFBWTtBQUMzQixZQUFNTSxJQUFJLEdBQUcsS0FBSzlCLEtBQUwsQ0FBV3NCLFVBQXhCO0FBQ0EsWUFBTVMsVUFBVSxHQUFHLE1BQU1ELElBQUksQ0FBQ0UsYUFBTCxFQUF6Qjs7QUFDQSxVQUFJRCxVQUFVLENBQUNFLFdBQVgsRUFBSixFQUE4QjtBQUFFLGVBQU8sSUFBUDtBQUFjOztBQUU5QyxZQUFNSCxJQUFJLENBQUNJLGNBQUwsRUFBTjtBQUNBSixNQUFBQSxJQUFJLENBQUNLLGdCQUFMLENBQXNCSixVQUFVLENBQUNLLGNBQVgsRUFBdEI7QUFDQSxXQUFLQyx1QkFBTCxDQUE2Qk4sVUFBVSxDQUFDTyxZQUFYLEVBQTdCO0FBRUEsYUFBTyxJQUFQO0FBQ0QsS0ExUDJCOztBQUFBLHdDQTRQZixZQUFZO0FBQ3ZCLFlBQU1DLE1BQU0sR0FBRyxLQUFLdkMsS0FBTCxDQUFXd0MsT0FBWCxDQUFtQjtBQUNoQ3BCLFFBQUFBLE9BQU8sRUFBRSxhQUR1QjtBQUVoQ3FCLFFBQUFBLGVBQWUsRUFBRSxlQUZlO0FBR2hDQyxRQUFBQSxPQUFPLEVBQUUsQ0FBQyxPQUFELEVBQVUsUUFBVjtBQUh1QixPQUFuQixDQUFmOztBQUtBLFVBQUlILE1BQU0sS0FBSyxDQUFmLEVBQWtCO0FBQUU7QUFBUzs7QUFFN0IsVUFBSTtBQUNGLGNBQU0sS0FBS3ZDLEtBQUwsQ0FBV3NCLFVBQVgsQ0FBc0JxQixVQUF0QixFQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVTtBQUNWLFlBQUlBLENBQUMsQ0FBQ0MsSUFBRixLQUFXLGNBQWYsRUFBK0I7QUFDN0IsZUFBSzdDLEtBQUwsQ0FBVzhDLG1CQUFYLENBQStCQyxRQUEvQixDQUNHLHdCQUF1QkgsQ0FBQyxDQUFDSSxJQUFLLDRCQURqQyxFQUVFO0FBQUNDLFlBQUFBLFdBQVcsRUFBRTtBQUFkLFdBRkY7QUFJRCxTQUxELE1BS087QUFDTCxnQkFBTUwsQ0FBTjtBQUNEO0FBQ0Y7QUFDRixLQWhSMkI7O0FBQUEsMkNBa1JaLE1BQU1NLEtBQU4sSUFBZTtBQUM3QixVQUFJLEtBQUtsRCxLQUFMLENBQVdtRCxlQUFmLEVBQWdDO0FBQzlCO0FBQ0Q7O0FBRUQsWUFBTUMsSUFBSSxHQUFHLEtBQUtwRCxLQUFMLENBQVdxRCxVQUFYLEdBQXdCLFFBQXhCLEdBQW1DLE1BQWhEO0FBQ0EsWUFBTSxLQUFLckQsS0FBTCxDQUFXc0IsVUFBWCxDQUFzQmdDLFlBQXRCLENBQW1DRixJQUFuQyxFQUF5Q0YsS0FBekMsQ0FBTjtBQUNBLFdBQUtLLHlCQUFMLENBQStCLEtBQS9CLEVBQXNDLElBQXRDO0FBQ0QsS0ExUjJCOztBQUFBLDZDQTRSVixNQUFNTCxLQUFOLElBQWU7QUFDL0IsVUFBSSxLQUFLbEQsS0FBTCxDQUFXbUQsZUFBZixFQUFnQztBQUM5QjtBQUNEOztBQUVELFlBQU1DLElBQUksR0FBRyxLQUFLcEQsS0FBTCxDQUFXcUQsVUFBWCxHQUF3QixNQUF4QixHQUFpQyxRQUE5QztBQUNBLFlBQU0sS0FBS3JELEtBQUwsQ0FBV3NCLFVBQVgsQ0FBc0JnQyxZQUF0QixDQUFtQ0YsSUFBbkMsRUFBeUNGLEtBQXpDLENBQU47QUFDQSxXQUFLSyx5QkFBTCxDQUErQixLQUEvQixFQUFzQyxJQUF0QztBQUNELEtBcFMyQjs7QUFBQSxzQ0FzU2pCLENBQUNDLFVBQUQsRUFBYW5DLE9BQWIsS0FBeUI7QUFDbEMsYUFBTyxLQUFLckIsS0FBTCxDQUFXc0IsVUFBWCxDQUFzQm1DLFFBQXRCLENBQStCRCxVQUEvQixFQUEyQ25DLE9BQTNDLENBQVA7QUFDRCxLQXhTMkI7O0FBQUEsK0NBMFNScUMsS0FBSyxJQUFJO0FBQzNCLFdBQUtDLFNBQUwsR0FBaUIsS0FBS0MsT0FBTCxDQUFhaEQsR0FBYixDQUFpQkMsSUFBSSxJQUFJQSxJQUFJLENBQUNnRCxRQUFMLENBQWNILEtBQUssQ0FBQ0ksTUFBcEIsQ0FBekIsRUFBc0QvQyxLQUF0RCxDQUE0RCxJQUE1RCxLQUFxRWdELG9CQUFXQyxLQUFYLENBQWlCQyxPQUF2RztBQUNELEtBNVMyQjs7QUFBQSxrREE4U0wsTUFBTSxLQUFLcEMsUUFBTCxDQUFjcUMsTUFBTSxLQUFLO0FBQUNDLE1BQUFBLGVBQWUsRUFBRSxDQUFDRCxNQUFNLENBQUNDO0FBQTFCLEtBQUwsQ0FBcEIsQ0E5U0Q7O0FBQUEsaURBZ1ROLE1BQU0sS0FBS3RDLFFBQUwsQ0FBYztBQUFDc0MsTUFBQUEsZUFBZSxFQUFFO0FBQWxCLEtBQWQsQ0FoVEE7O0FBQUEsOENBa1RULE1BQU0sS0FBS0MsV0FBTCxDQUFpQixFQUFqQixDQWxURzs7QUFBQSwrQ0FvVFIsTUFBTSxLQUFLQSxXQUFMLENBQWlCO0FBQUNDLE1BQUFBLE1BQU0sRUFBRTtBQUFULEtBQWpCLENBcFRFOztBQUcxQixTQUFLaEUsMEJBQUwsR0FBa0MsS0FBbEM7QUFDQSxTQUFLc0QsU0FBTCxHQUFpQkksb0JBQVdDLEtBQVgsQ0FBaUJDLE9BQWxDO0FBRUEsU0FBS0wsT0FBTCxHQUFlLElBQUlVLGtCQUFKLEVBQWY7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBSUQsa0JBQUosRUFBZjtBQUNBLFNBQUszRCxjQUFMLEdBQXNCLElBQUkyRCxrQkFBSixFQUF0QjtBQUVBLFNBQUtFLEtBQUwsR0FBYTtBQUNYaEQsTUFBQUEsaUJBQWlCLEVBQUUsRUFEUjtBQUVYMkMsTUFBQUEsZUFBZSxFQUFFO0FBRk4sS0FBYjtBQUtBLFNBQUtNLGNBQUwsR0FBc0IsSUFBSUMsZ0JBQUosQ0FBZTtBQUFDQyxNQUFBQSxJQUFJLEVBQUUzRSxLQUFLLENBQUM0RTtBQUFiLEtBQWYsQ0FBdEI7QUFDQSxTQUFLSCxjQUFMLENBQW9CSSxNQUFwQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsSUFBSUosZ0JBQUosQ0FBZTtBQUFDQyxNQUFBQSxJQUFJLEVBQUUzRSxLQUFLLENBQUMrRTtBQUFiLEtBQWYsQ0FBbkI7QUFDQSxTQUFLRCxXQUFMLENBQWlCRCxNQUFqQjtBQUVBLFNBQUtuRCxTQUFMLEdBQWlCLElBQUlzRCxrQkFBSixDQUFjO0FBQzdCMUQsTUFBQUEsVUFBVSxFQUFFLEtBQUt0QixLQUFMLENBQVdzQixVQURNO0FBRTdCMkQsTUFBQUEsS0FBSyxFQUFFLEtBQUtqRixLQUFMLENBQVdrRixVQUZXO0FBRzdCQyxNQUFBQSxNQUFNLEVBQUUsS0FBS25GLEtBQUwsQ0FBV21GO0FBSFUsS0FBZCxDQUFqQjtBQUtEOztBQUVELFNBQU9DLHdCQUFQLENBQWdDcEYsS0FBaEMsRUFBdUN3RSxLQUF2QyxFQUE4QztBQUM1QyxXQUFPO0FBQ0xMLE1BQUFBLGVBQWUsRUFBRUssS0FBSyxDQUFDTCxlQUFOLElBQ2QsQ0FBQ25FLEtBQUssQ0FBQ21ELGVBQVAsSUFBMEJuRCxLQUFLLENBQUNzQixVQUFOLENBQWlCK0QsU0FBakIsRUFBMUIsSUFBMEQsQ0FBQ3JGLEtBQUssQ0FBQ3NGLGVBQWxFLEtBQ0N0RixLQUFLLENBQUM0RSxRQUFOLEtBQW1CLEVBQW5CLElBQXlCNUUsS0FBSyxDQUFDK0UsS0FBTixLQUFnQixFQUQxQztBQUZHLEtBQVA7QUFLRDs7QUFFRFEsRUFBQUEsTUFBTSxHQUFHO0FBQ1AsV0FDRSw2QkFBQyxtQkFBRDtBQUNFLE1BQUEsR0FBRyxFQUFFLEtBQUszQixPQUFMLENBQWE0QixNQURwQjtBQUVFLE1BQUEsT0FBTyxFQUFFLEtBQUtqQixPQUZoQjtBQUdFLE1BQUEsY0FBYyxFQUFFLEtBQUs1RCxjQUh2QjtBQUtFLE1BQUEsU0FBUyxFQUFFLEtBQUtYLEtBQUwsQ0FBV21ELGVBTHhCO0FBTUUsTUFBQSxlQUFlLEVBQUUsS0FBS3FCLEtBQUwsQ0FBV0wsZUFOOUI7QUFPRSxNQUFBLFVBQVUsRUFBRSxLQUFLbkUsS0FBTCxDQUFXc0IsVUFQekI7QUFTRSxNQUFBLGNBQWMsRUFBRSxLQUFLbUQsY0FUdkI7QUFVRSxNQUFBLFdBQVcsRUFBRSxLQUFLSyxXQVZwQjtBQVdFLE1BQUEsVUFBVSxFQUFFLEtBQUs5RSxLQUFMLENBQVcrQixVQVh6QjtBQVlFLE1BQUEsYUFBYSxFQUFFLEtBQUsvQixLQUFMLENBQVd5RixhQVo1QjtBQWFFLE1BQUEsU0FBUyxFQUFFLEtBQUt6RixLQUFMLENBQVcwRixTQWJ4QjtBQWNFLE1BQUEsVUFBVSxFQUFFLEtBQUsxRixLQUFMLENBQVdxRCxVQWR6QjtBQWVFLE1BQUEsY0FBYyxFQUFFLEtBQUtyRCxLQUFMLENBQVcyRixjQWY3QjtBQWdCRSxNQUFBLGFBQWEsRUFBRSxLQUFLM0YsS0FBTCxDQUFXNEYsYUFoQjVCO0FBaUJFLE1BQUEsZUFBZSxFQUFFLEtBQUs1RixLQUFMLENBQVc2RixlQWpCOUI7QUFrQkUsTUFBQSxhQUFhLEVBQUUsS0FBSzdGLEtBQUwsQ0FBVzhGLGFBbEI1QjtBQW1CRSxNQUFBLGNBQWMsRUFBRSxLQUFLOUYsS0FBTCxDQUFXK0YsY0FuQjdCO0FBb0JFLE1BQUEsb0JBQW9CLEVBQUUsS0FBSy9GLEtBQUwsQ0FBV2dHLG9CQUFYLElBQW1DLEtBQUtoRyxLQUFMLENBQVdpRyxjQXBCdEU7QUFxQkUsTUFBQSxZQUFZLEVBQUUsS0FBS2pHLEtBQUwsQ0FBV2tHLFlBckIzQjtBQXNCRSxNQUFBLFNBQVMsRUFBRSxLQUFLeEUsU0F0QmxCO0FBdUJFLE1BQUEsaUJBQWlCLEVBQUUsS0FBSzhDLEtBQUwsQ0FBV2hELGlCQXZCaEM7QUF3QkUsTUFBQSx1QkFBdUIsRUFBRSxLQUFLYSx1QkF4QmhDO0FBMEJFLE1BQUEsa0JBQWtCLEVBQUUsS0FBS3JDLEtBQUwsQ0FBV21HLGtCQTFCakM7QUEyQkUsTUFBQSxTQUFTLEVBQUUsS0FBS25HLEtBQUwsQ0FBV29HLFNBM0J4QjtBQTRCRSxNQUFBLFFBQVEsRUFBRSxLQUFLcEcsS0FBTCxDQUFXcUcsUUE1QnZCO0FBNkJFLE1BQUEsUUFBUSxFQUFFLEtBQUtyRyxLQUFMLENBQVdzRyxRQTdCdkI7QUE4QkUsTUFBQSxRQUFRLEVBQUUsS0FBS3RHLEtBQUwsQ0FBV3VHLFFBOUJ2QjtBQStCRSxNQUFBLG1CQUFtQixFQUFFLEtBQUt2RyxLQUFMLENBQVc4QyxtQkEvQmxDO0FBZ0NFLE1BQUEsT0FBTyxFQUFFLEtBQUs5QyxLQUFMLENBQVd3RyxPQWhDdEI7QUFpQ0UsTUFBQSxPQUFPLEVBQUUsS0FBS3hHLEtBQUwsQ0FBV3dDLE9BakN0QjtBQWtDRSxNQUFBLE1BQU0sRUFBRSxLQUFLeEMsS0FBTCxDQUFXbUYsTUFsQ3JCO0FBb0NFLE1BQUEsb0JBQW9CLEVBQUUsS0FBS3NCLG9CQXBDN0I7QUFxQ0UsTUFBQSxtQkFBbUIsRUFBRSxLQUFLQyxtQkFyQzVCO0FBc0NFLE1BQUEsZ0JBQWdCLEVBQUUsS0FBS0MsZ0JBdEN6QjtBQXVDRSxNQUFBLGlCQUFpQixFQUFFLEtBQUtDLGlCQXZDMUI7QUF3Q0UsTUFBQSxvQkFBb0IsRUFBRSxLQUFLNUcsS0FBTCxDQUFXNkcsb0JBeENuQztBQXlDRSxNQUFBLFNBQVMsRUFBRSxLQUFLN0csS0FBTCxDQUFXOEcsU0F6Q3hCO0FBMENFLE1BQUEsNkJBQTZCLEVBQUUsS0FBSzlHLEtBQUwsQ0FBVytHLDZCQTFDNUM7QUEyQ0UsTUFBQSxlQUFlLEVBQUUsS0FBSy9HLEtBQUwsQ0FBV2dILGVBM0M5QjtBQTRDRSxNQUFBLGFBQWEsRUFBRSxLQUFLaEgsS0FBTCxDQUFXaUgsYUE1QzVCO0FBNkNFLE1BQUEsc0JBQXNCLEVBQUUsS0FBS2pILEtBQUwsQ0FBV2tILHNCQTdDckM7QUE4Q0UsTUFBQSxjQUFjLEVBQUUsS0FBS2xILEtBQUwsQ0FBV21ILGNBOUM3QjtBQStDRSxNQUFBLGtCQUFrQixFQUFFLEtBQUtuSCxLQUFMLENBQVdvSCxrQkEvQ2pDO0FBZ0RFLE1BQUEsbUJBQW1CLEVBQUUsS0FBS3BILEtBQUwsQ0FBV3FILG1CQWhEbEM7QUFrREUsTUFBQSx5QkFBeUIsRUFBRSxLQUFLbEgseUJBbERsQztBQW1ERSxNQUFBLHdCQUF3QixFQUFFLEtBQUttSCx3QkFuRGpDO0FBb0RFLE1BQUEsZUFBZSxFQUFFLEtBQUtDLGVBcER4QjtBQXFERSxNQUFBLE1BQU0sRUFBRSxLQUFLaEcsTUFyRGY7QUFzREUsTUFBQSxjQUFjLEVBQUUsS0FBS1csY0F0RHZCO0FBdURFLE1BQUEsSUFBSSxFQUFFLEtBQUtzRixJQXZEYjtBQXdERSxNQUFBLElBQUksRUFBRSxLQUFLQyxJQXhEYjtBQXlERSxNQUFBLEtBQUssRUFBRSxLQUFLQyxLQXpEZDtBQTBERSxNQUFBLFFBQVEsRUFBRSxLQUFLakUsUUExRGpCO0FBMkRFLE1BQUEsVUFBVSxFQUFFLEtBQUtkLFVBM0RuQjtBQTRERSxNQUFBLGFBQWEsRUFBRSxLQUFLZ0YsYUE1RHRCO0FBNkRFLE1BQUEsZUFBZSxFQUFFLEtBQUtDO0FBN0R4QixNQURGO0FBaUVEOztBQUVEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixTQUFLdEUseUJBQUwsQ0FBK0IsS0FBL0IsRUFBc0MsS0FBdEM7QUFDQSxTQUFLZ0IsT0FBTCxDQUFhM0QsR0FBYixDQUFpQmtILElBQUksSUFBSUEsSUFBSSxDQUFDQyxnQkFBTCxDQUFzQixTQUF0QixFQUFpQyxLQUFLQyxpQkFBdEMsQ0FBekI7O0FBRUEsUUFBSSxLQUFLaEksS0FBTCxDQUFXaUksYUFBZixFQUE4QjtBQUM1QixXQUFLakksS0FBTCxDQUFXaUksYUFBWCxDQUF5QnpDLE1BQXpCLENBQWdDLElBQWhDO0FBQ0Q7QUFDRjs7QUFFRDBDLEVBQUFBLGtCQUFrQixDQUFDQyxTQUFELEVBQVk7QUFDNUIsU0FBS3pHLFNBQUwsQ0FBZTBHLGFBQWYsQ0FBNkIsS0FBS3BJLEtBQUwsQ0FBV3NCLFVBQXhDO0FBQ0EsU0FBS0ksU0FBTCxDQUFlMkcsYUFBZixDQUE2QixLQUFLckksS0FBTCxDQUFXa0YsVUFBeEM7QUFDQSxTQUFLM0IseUJBQUwsQ0FBK0IsS0FBL0IsRUFBc0MsS0FBdEM7O0FBRUEsUUFBSTRFLFNBQVMsQ0FBQ3ZELFFBQVYsS0FBdUIsS0FBSzVFLEtBQUwsQ0FBVzRFLFFBQXRDLEVBQWdEO0FBQzlDLFdBQUtILGNBQUwsQ0FBb0I2RCxjQUFwQixDQUFtQyxLQUFLdEksS0FBTCxDQUFXNEUsUUFBOUM7QUFDRDs7QUFFRCxRQUFJdUQsU0FBUyxDQUFDcEQsS0FBVixLQUFvQixLQUFLL0UsS0FBTCxDQUFXK0UsS0FBbkMsRUFBMEM7QUFDeEMsV0FBS0QsV0FBTCxDQUFpQndELGNBQWpCLENBQWdDLEtBQUt0SSxLQUFMLENBQVcrRSxLQUEzQztBQUNEO0FBQ0Y7O0FBRUR3RCxFQUFBQSxvQkFBb0IsR0FBRztBQUNyQixTQUFLaEUsT0FBTCxDQUFhM0QsR0FBYixDQUFpQmtILElBQUksSUFBSUEsSUFBSSxDQUFDVSxtQkFBTCxDQUF5QixTQUF6QixFQUFvQyxLQUFLUixpQkFBekMsQ0FBekI7QUFDRDtBQUVEOzs7Ozs7Ozs7QUFPQXpFLEVBQUFBLHlCQUF5QixDQUFDa0YsV0FBRCxFQUFjQyxjQUFkLEVBQThCO0FBQ3JELFFBQUksS0FBSzFJLEtBQUwsQ0FBV21ELGVBQWYsRUFBZ0M7QUFDOUI7QUFDRDs7QUFFRCxVQUFNd0YsU0FBUyxHQUFHLElBQUlDLEdBQUosQ0FDaEIsS0FBSzVJLEtBQUwsQ0FBV29HLFNBQVgsQ0FBcUJ5QyxjQUFyQixHQUFzQ2pJLEdBQXRDLENBQTBDa0ksTUFBTSxJQUFJQSxNQUFNLENBQUNDLE9BQVAsRUFBcEQsQ0FEZ0IsQ0FBbEI7O0FBSUEsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUtoSixLQUFMLENBQVcrRixjQUFYLENBQTBCa0QsTUFBOUMsRUFBc0RELENBQUMsRUFBdkQsRUFBMkQ7QUFDekQsWUFBTUUsWUFBWSxHQUFHbEcsY0FBS21HLElBQUwsQ0FDbkIsS0FBS25KLEtBQUwsQ0FBV2dHLG9CQURRLEVBRW5CLEtBQUtoRyxLQUFMLENBQVcrRixjQUFYLENBQTBCaUQsQ0FBMUIsRUFBNkJJLFFBRlYsQ0FBckI7O0FBS0EsVUFBSSxDQUFDWCxXQUFELElBQWdCRSxTQUFTLENBQUNVLEdBQVYsQ0FBY0gsWUFBZCxDQUFwQixFQUFpRDtBQUMvQztBQUNEOztBQUVELFVBQUksQ0FBQ1IsY0FBRCxJQUFtQixLQUFLMUksS0FBTCxDQUFXbUcsa0JBQVgsQ0FBOEJtRCxZQUE5QixDQUEyQ0osWUFBM0MsTUFBNkRLLFNBQXBGLEVBQStGO0FBQzdGO0FBQ0Q7O0FBRUQsV0FBS3ZKLEtBQUwsQ0FBV3VELHlCQUFYLENBQXFDMkYsWUFBckM7QUFDRDtBQUNGOztBQWdDRCxRQUFNakksVUFBTixDQUFpQmIsU0FBakIsRUFBNEI7QUFDMUIsVUFBTW9KLFlBQVksR0FBRyxJQUFJWixHQUFKLENBQVF4SSxTQUFSLENBQXJCO0FBRUEsVUFBTXFKLFlBQVksR0FBRyxNQUFNbEosT0FBTyxDQUFDbUosR0FBUixDQUN6QnRKLFNBQVMsQ0FBQ1EsR0FBVixDQUFjLE1BQU13SSxRQUFOLElBQWtCO0FBQzlCLGFBQU87QUFDTEEsUUFBQUEsUUFESztBQUVMTyxRQUFBQSxVQUFVLEVBQUUsTUFBTSxLQUFLM0osS0FBTCxDQUFXc0IsVUFBWCxDQUFzQnNJLG1CQUF0QixDQUEwQ1IsUUFBMUM7QUFGYixPQUFQO0FBSUQsS0FMRCxDQUR5QixDQUEzQjs7QUFTQSxTQUFLLE1BQU07QUFBQ0EsTUFBQUEsUUFBRDtBQUFXTyxNQUFBQTtBQUFYLEtBQVgsSUFBcUNGLFlBQXJDLEVBQW1EO0FBQ2pELFVBQUlFLFVBQUosRUFBZ0I7QUFDZCxjQUFNcEgsTUFBTSxHQUFHLEtBQUt2QyxLQUFMLENBQVd3QyxPQUFYLENBQW1CO0FBQ2hDcEIsVUFBQUEsT0FBTyxFQUFFLCtCQUR1QjtBQUVoQ3FCLFVBQUFBLGVBQWUsRUFBRywwQ0FBeUMyRyxRQUFTLEVBRnBDO0FBR2hDMUcsVUFBQUEsT0FBTyxFQUFFLENBQUMsT0FBRCxFQUFVLFFBQVY7QUFIdUIsU0FBbkIsQ0FBZjs7QUFLQSxZQUFJSCxNQUFNLEtBQUssQ0FBZixFQUFrQjtBQUFFaUgsVUFBQUEsWUFBWSxDQUFDSyxNQUFiLENBQW9CVCxRQUFwQjtBQUFnQztBQUNyRDtBQUNGOztBQUVELFdBQU8sS0FBS3BKLEtBQUwsQ0FBV3NCLFVBQVgsQ0FBc0JMLFVBQXRCLENBQWlDNkksS0FBSyxDQUFDQyxJQUFOLENBQVdQLFlBQVgsQ0FBakMsQ0FBUDtBQUNEOztBQUVEeEksRUFBQUEsWUFBWSxDQUFDWixTQUFELEVBQVk7QUFDdEIsV0FBTyxLQUFLSixLQUFMLENBQVdzQixVQUFYLENBQXNCTixZQUF0QixDQUFtQ1osU0FBbkMsQ0FBUDtBQUNEOztBQXdGRCxRQUFNZ0UsV0FBTixDQUFrQi9DLE9BQWxCLEVBQTJCO0FBQ3pCLFVBQU0ySSxXQUFXLEdBQUcsS0FBS3ZGLGNBQUwsQ0FBb0J3RixPQUFwQixFQUFwQjtBQUNBLFVBQU1DLFFBQVEsR0FBRyxLQUFLcEYsV0FBTCxDQUFpQm1GLE9BQWpCLEVBQWpCOztBQUVBLFFBQUlELFdBQVcsQ0FBQ2YsTUFBWixHQUFxQixDQUFyQixJQUEwQjVILE9BQU8sQ0FBQ2dELE1BQXRDLEVBQThDO0FBQzVDLFlBQU0sS0FBS3JFLEtBQUwsQ0FBV3NCLFVBQVgsQ0FBc0I2SSxTQUF0QixDQUFnQyxXQUFoQyxFQUE2Q0gsV0FBN0MsRUFBMEQzSSxPQUExRCxDQUFOO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxLQUFLckIsS0FBTCxDQUFXc0IsVUFBWCxDQUFzQjhJLFdBQXRCLENBQWtDLFdBQWxDLENBQU47QUFDRDs7QUFFRCxRQUFJRixRQUFRLENBQUNqQixNQUFULEdBQWtCLENBQWxCLElBQXVCNUgsT0FBTyxDQUFDZ0QsTUFBbkMsRUFBMkM7QUFDekMsWUFBTSxLQUFLckUsS0FBTCxDQUFXc0IsVUFBWCxDQUFzQjZJLFNBQXRCLENBQWdDLFlBQWhDLEVBQThDRCxRQUE5QyxFQUF3RDdJLE9BQXhELENBQU47QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLEtBQUtyQixLQUFMLENBQVdzQixVQUFYLENBQXNCOEksV0FBdEIsQ0FBa0MsWUFBbEMsQ0FBTjtBQUNEOztBQUNELFNBQUsxRCxtQkFBTDtBQUNEOztBQUVEMkQsRUFBQUEsWUFBWSxHQUFHO0FBQ2IsU0FBS3pHLE9BQUwsQ0FBYWhELEdBQWIsQ0FBaUJDLElBQUksSUFBSUEsSUFBSSxDQUFDeUosUUFBTCxDQUFjLEtBQUszRyxTQUFuQixDQUF6QjtBQUNEOztBQUVENEcsRUFBQUEsUUFBUSxHQUFHO0FBQ1QsV0FBTyxLQUFLaEcsT0FBTCxDQUFhM0QsR0FBYixDQUFpQmtILElBQUksSUFBSUEsSUFBSSxDQUFDMEMsUUFBTCxDQUFjQyxRQUFRLENBQUNDLGFBQXZCLENBQXpCLEVBQWdFM0osS0FBaEUsQ0FBc0UsS0FBdEUsQ0FBUDtBQUNEOztBQUVENEosRUFBQUEsWUFBWSxDQUFDQyxhQUFELEVBQWdCO0FBQzFCQyxJQUFBQSxPQUFPLENBQUNDLFFBQVIsQ0FBaUIsTUFBTTtBQUNyQkYsTUFBQUEsYUFBYSxNQUFNLEtBQUtQLFlBQUwsRUFBbkI7QUFDRCxLQUZEO0FBR0Q7O0FBRURVLEVBQUFBLHlCQUF5QixDQUFDM0IsUUFBRCxFQUFXNEIsYUFBWCxFQUEwQjtBQUNqRCxXQUFPLEtBQUtwSCxPQUFMLENBQWFoRCxHQUFiLENBQWlCQyxJQUFJLElBQUlBLElBQUksQ0FBQ2tLLHlCQUFMLENBQStCM0IsUUFBL0IsRUFBeUM0QixhQUF6QyxDQUF6QixFQUFrRmpLLEtBQWxGLENBQXdGLElBQXhGLENBQVA7QUFDRDs7QUFFRGtLLEVBQUFBLGlDQUFpQyxHQUFHO0FBQ2xDLFdBQU8sS0FBS3JILE9BQUwsQ0FBYWhELEdBQWIsQ0FBaUJDLElBQUksSUFBSUEsSUFBSSxDQUFDb0ssaUNBQUwsRUFBekIsQ0FBUDtBQUNEOztBQUVEQyxFQUFBQSwwQkFBMEIsR0FBRztBQUMzQixXQUFPLEtBQUt0SCxPQUFMLENBQWFoRCxHQUFiLENBQWlCQyxJQUFJLElBQUlBLElBQUksQ0FBQ3FLLDBCQUFMLEVBQXpCLENBQVA7QUFDRDs7QUFFREMsRUFBQUEsaUJBQWlCLENBQUMvQixRQUFELEVBQVc0QixhQUFYLEVBQTBCO0FBQ3pDLFdBQU8sS0FBS3BILE9BQUwsQ0FBYWhELEdBQWIsQ0FBaUJDLElBQUksSUFBSUEsSUFBSSxDQUFDc0ssaUJBQUwsQ0FBdUIvQixRQUF2QixFQUFpQzRCLGFBQWpDLENBQXpCLEVBQTBFakssS0FBMUUsQ0FBZ0YsSUFBaEYsQ0FBUDtBQUNEOztBQXRaMkQ7Ozs7Z0JBQXpDbkIsZ0IsOEJBRWRtRSxvQkFBV0MsSzs7Z0JBRkdwRSxnQixlQUtBO0FBQ2pCMEIsRUFBQUEsVUFBVSxFQUFFOEosbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFo7QUFFakJwRyxFQUFBQSxVQUFVLEVBQUVrRyxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWjtBQUlqQjFHLEVBQUFBLFFBQVEsRUFBRXdHLG1CQUFVRyxNQUFWLENBQWlCRCxVQUpWO0FBS2pCdkcsRUFBQUEsS0FBSyxFQUFFcUcsbUJBQVVHLE1BQVYsQ0FBaUJELFVBTFA7QUFNakJ2SixFQUFBQSxVQUFVLEVBQUV5SiwyQkFBZUYsVUFOVjtBQU9qQjdGLEVBQUFBLGFBQWEsRUFBRTJGLG1CQUFVSyxPQUFWLENBQWtCRCwwQkFBbEIsRUFBa0NGLFVBUGhDO0FBUWpCNUYsRUFBQUEsU0FBUyxFQUFFMEYsbUJBQVVNLElBQVYsQ0FBZUosVUFSVDtBQVNqQmpJLEVBQUFBLFVBQVUsRUFBRStILG1CQUFVTSxJQUFWLENBQWVKLFVBVFY7QUFVakIzRixFQUFBQSxjQUFjLEVBQUV5RixtQkFBVU0sSUFBVixDQUFlSixVQVZkO0FBV2pCMUYsRUFBQUEsYUFBYSxFQUFFK0YsMkJBQWVMLFVBWGI7QUFZakJ6RixFQUFBQSxlQUFlLEVBQUV1RixtQkFBVUssT0FBVixDQUFrQkcsaUNBQWxCLEVBQXlDTixVQVp6QztBQWFqQnhGLEVBQUFBLGFBQWEsRUFBRXNGLG1CQUFVSyxPQUFWLENBQWtCRyxpQ0FBbEIsRUFBeUNOLFVBYnZDO0FBY2pCdkYsRUFBQUEsY0FBYyxFQUFFcUYsbUJBQVVLLE9BQVYsQ0FBa0JJLHFDQUFsQixFQUE2Q1AsVUFkNUM7QUFlakJ0RixFQUFBQSxvQkFBb0IsRUFBRW9GLG1CQUFVRyxNQWZmO0FBZ0JqQnJGLEVBQUFBLFlBQVksRUFBRWtGLG1CQUFVRyxNQWhCUDtBQWlCakJwSSxFQUFBQSxlQUFlLEVBQUVpSSxtQkFBVU0sSUFBVixDQUFlSixVQWpCZjtBQWtCakJyRixFQUFBQSxjQUFjLEVBQUVtRixtQkFBVUcsTUFsQlQ7QUFtQmpCakcsRUFBQUEsZUFBZSxFQUFFOEYsbUJBQVVNLElBQVYsQ0FBZUosVUFuQmY7QUFxQmpCbEYsRUFBQUEsU0FBUyxFQUFFZ0YsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBckJYO0FBc0JqQmpGLEVBQUFBLFFBQVEsRUFBRStFLG1CQUFVQyxNQUFWLENBQWlCQyxVQXRCVjtBQXVCakJoRixFQUFBQSxRQUFRLEVBQUU4RSxtQkFBVUMsTUFBVixDQUFpQkMsVUF2QlY7QUF3QmpCbkYsRUFBQUEsa0JBQWtCLEVBQUVpRixtQkFBVUMsTUFBVixDQUFpQkMsVUF4QnBCO0FBeUJqQnhJLEVBQUFBLG1CQUFtQixFQUFFc0ksbUJBQVVDLE1BQVYsQ0FBaUJDLFVBekJyQjtBQTBCakJuRyxFQUFBQSxNQUFNLEVBQUVpRyxtQkFBVUMsTUFBVixDQUFpQkMsVUExQlI7QUEyQmpCOUUsRUFBQUEsT0FBTyxFQUFFNEUsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBM0JUO0FBNEJqQi9FLEVBQUFBLFFBQVEsRUFBRTZFLG1CQUFVQyxNQUFWLENBQWlCQyxVQTVCVjtBQThCakI5SSxFQUFBQSxPQUFPLEVBQUU0SSxtQkFBVVUsSUFBVixDQUFlUixVQTlCUDtBQStCakJuSyxFQUFBQSxZQUFZLEVBQUVpSyxtQkFBVVUsSUFBVixDQUFlUixVQS9CWjtBQWdDakIvSCxFQUFBQSx5QkFBeUIsRUFBRTZILG1CQUFVVSxJQUFWLENBQWVSLFVBaEN6QjtBQWlDakJ0RSxFQUFBQSxlQUFlLEVBQUVvRSxtQkFBVVUsSUFBVixDQUFlUixVQWpDZjtBQWtDakJ2RSxFQUFBQSw2QkFBNkIsRUFBRXFFLG1CQUFVVSxJQUFWLENBQWVSLFVBbEM3QjtBQW1DakJ4RSxFQUFBQSxTQUFTLEVBQUVzRSxtQkFBVVUsSUFBVixDQUFlUixVQW5DVDtBQW9DakJ6RSxFQUFBQSxvQkFBb0IsRUFBRXVFLG1CQUFVVSxJQUFWLENBQWVSLFVBcENwQjtBQXFDakJyRCxFQUFBQSxhQUFhLEVBQUU4RCw2QkFyQ0U7QUFzQ2pCOUUsRUFBQUEsYUFBYSxFQUFFbUUsbUJBQVVNLElBQVYsQ0FBZUosVUF0Q2I7QUF1Q2pCcEUsRUFBQUEsc0JBQXNCLEVBQUVrRSxtQkFBVVUsSUFBVixDQUFlUixVQXZDdEI7QUF3Q2pCbkUsRUFBQUEsY0FBYyxFQUFFaUUsbUJBQVVVLElBQVYsQ0FBZVIsVUF4Q2Q7QUF5Q2pCakUsRUFBQUEsbUJBQW1CLEVBQUUrRCxtQkFBVVUsSUFBVixDQUFlUixVQXpDbkI7QUEwQ2pCbEUsRUFBQUEsa0JBQWtCLEVBQUVnRSxtQkFBVVUsSUFBVixDQUFlUjtBQTFDbEIsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7VGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBHaXRUYWJWaWV3IGZyb20gJy4uL3ZpZXdzL2dpdC10YWItdmlldyc7XG5pbXBvcnQgVXNlclN0b3JlIGZyb20gJy4uL21vZGVscy91c2VyLXN0b3JlJztcbmltcG9ydCBSZWZIb2xkZXIgZnJvbSAnLi4vbW9kZWxzL3JlZi1ob2xkZXInO1xuaW1wb3J0IHtcbiAgQ29tbWl0UHJvcFR5cGUsIEJyYW5jaFByb3BUeXBlLCBGaWxlUGF0Y2hJdGVtUHJvcFR5cGUsIE1lcmdlQ29uZmxpY3RJdGVtUHJvcFR5cGUsIFJlZkhvbGRlclByb3BUeXBlLFxufSBmcm9tICcuLi9wcm9wLXR5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0VGFiQ29udHJvbGxlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBmb2N1cyA9IHtcbiAgICAuLi5HaXRUYWJWaWV3LmZvY3VzLFxuICB9O1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcmVwb3NpdG9yeTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGxvZ2luTW9kZWw6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgIHVzZXJuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZW1haWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBsYXN0Q29tbWl0OiBDb21taXRQcm9wVHlwZS5pc1JlcXVpcmVkLFxuICAgIHJlY2VudENvbW1pdHM6IFByb3BUeXBlcy5hcnJheU9mKENvbW1pdFByb3BUeXBlKS5pc1JlcXVpcmVkLFxuICAgIGlzTWVyZ2luZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc1JlYmFzaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGhhc1VuZG9IaXN0b3J5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGN1cnJlbnRCcmFuY2g6IEJyYW5jaFByb3BUeXBlLmlzUmVxdWlyZWQsXG4gICAgdW5zdGFnZWRDaGFuZ2VzOiBQcm9wVHlwZXMuYXJyYXlPZihGaWxlUGF0Y2hJdGVtUHJvcFR5cGUpLmlzUmVxdWlyZWQsXG4gICAgc3RhZ2VkQ2hhbmdlczogUHJvcFR5cGVzLmFycmF5T2YoRmlsZVBhdGNoSXRlbVByb3BUeXBlKS5pc1JlcXVpcmVkLFxuICAgIG1lcmdlQ29uZmxpY3RzOiBQcm9wVHlwZXMuYXJyYXlPZihNZXJnZUNvbmZsaWN0SXRlbVByb3BUeXBlKS5pc1JlcXVpcmVkLFxuICAgIHdvcmtpbmdEaXJlY3RvcnlQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1lcmdlTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBmZXRjaEluUHJvZ3Jlc3M6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgY3VycmVudFdvcmtEaXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeURyaWZ0OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgd29ya3NwYWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWFuZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHJlc29sdXRpb25Qcm9ncmVzczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG5vdGlmaWNhdGlvbk1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBwcm9qZWN0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG9vbHRpcHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgIGNvbmZpcm06IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgZW5zdXJlR2l0VGFiOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3M6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdW5kb0xhc3REaXNjYXJkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9wZW5GaWxlczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvcGVuSW5pdGlhbGl6ZURpYWxvZzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjb250cm9sbGVyUmVmOiBSZWZIb2xkZXJQcm9wVHlwZSxcbiAgICBjb250ZXh0TG9ja2VkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2V0Q29udGV4dExvY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25EaWRDaGFuZ2VXb3JrRGlyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBnZXRDdXJyZW50V29ya0RpcnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICB0aGlzLnN0YWdpbmdPcGVyYXRpb25JblByb2dyZXNzID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0Rm9jdXMgPSBHaXRUYWJWaWV3LmZvY3VzLlNUQUdJTkc7XG5cbiAgICB0aGlzLnJlZlZpZXcgPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5yZWZSb290ID0gbmV3IFJlZkhvbGRlcigpO1xuICAgIHRoaXMucmVmU3RhZ2luZ1ZpZXcgPSBuZXcgUmVmSG9sZGVyKCk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0ZWRDb0F1dGhvcnM6IFtdLFxuICAgICAgZWRpdGluZ0lkZW50aXR5OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdGhpcy51c2VybmFtZUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKHt0ZXh0OiBwcm9wcy51c2VybmFtZX0pO1xuICAgIHRoaXMudXNlcm5hbWVCdWZmZXIucmV0YWluKCk7XG4gICAgdGhpcy5lbWFpbEJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKHt0ZXh0OiBwcm9wcy5lbWFpbH0pO1xuICAgIHRoaXMuZW1haWxCdWZmZXIucmV0YWluKCk7XG5cbiAgICB0aGlzLnVzZXJTdG9yZSA9IG5ldyBVc2VyU3RvcmUoe1xuICAgICAgcmVwb3NpdG9yeTogdGhpcy5wcm9wcy5yZXBvc2l0b3J5LFxuICAgICAgbG9naW46IHRoaXMucHJvcHMubG9naW5Nb2RlbCxcbiAgICAgIGNvbmZpZzogdGhpcy5wcm9wcy5jb25maWcsXG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKHByb3BzLCBzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBlZGl0aW5nSWRlbnRpdHk6IHN0YXRlLmVkaXRpbmdJZGVudGl0eSB8fFxuICAgICAgICAoIXByb3BzLmZldGNoSW5Qcm9ncmVzcyAmJiBwcm9wcy5yZXBvc2l0b3J5LmlzUHJlc2VudCgpICYmICFwcm9wcy5yZXBvc2l0b3J5RHJpZnQpICYmXG4gICAgICAgIChwcm9wcy51c2VybmFtZSA9PT0gJycgfHwgcHJvcHMuZW1haWwgPT09ICcnKSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8R2l0VGFiVmlld1xuICAgICAgICByZWY9e3RoaXMucmVmVmlldy5zZXR0ZXJ9XG4gICAgICAgIHJlZlJvb3Q9e3RoaXMucmVmUm9vdH1cbiAgICAgICAgcmVmU3RhZ2luZ1ZpZXc9e3RoaXMucmVmU3RhZ2luZ1ZpZXd9XG5cbiAgICAgICAgaXNMb2FkaW5nPXt0aGlzLnByb3BzLmZldGNoSW5Qcm9ncmVzc31cbiAgICAgICAgZWRpdGluZ0lkZW50aXR5PXt0aGlzLnN0YXRlLmVkaXRpbmdJZGVudGl0eX1cbiAgICAgICAgcmVwb3NpdG9yeT17dGhpcy5wcm9wcy5yZXBvc2l0b3J5fVxuXG4gICAgICAgIHVzZXJuYW1lQnVmZmVyPXt0aGlzLnVzZXJuYW1lQnVmZmVyfVxuICAgICAgICBlbWFpbEJ1ZmZlcj17dGhpcy5lbWFpbEJ1ZmZlcn1cbiAgICAgICAgbGFzdENvbW1pdD17dGhpcy5wcm9wcy5sYXN0Q29tbWl0fVxuICAgICAgICByZWNlbnRDb21taXRzPXt0aGlzLnByb3BzLnJlY2VudENvbW1pdHN9XG4gICAgICAgIGlzTWVyZ2luZz17dGhpcy5wcm9wcy5pc01lcmdpbmd9XG4gICAgICAgIGlzUmViYXNpbmc9e3RoaXMucHJvcHMuaXNSZWJhc2luZ31cbiAgICAgICAgaGFzVW5kb0hpc3Rvcnk9e3RoaXMucHJvcHMuaGFzVW5kb0hpc3Rvcnl9XG4gICAgICAgIGN1cnJlbnRCcmFuY2g9e3RoaXMucHJvcHMuY3VycmVudEJyYW5jaH1cbiAgICAgICAgdW5zdGFnZWRDaGFuZ2VzPXt0aGlzLnByb3BzLnVuc3RhZ2VkQ2hhbmdlc31cbiAgICAgICAgc3RhZ2VkQ2hhbmdlcz17dGhpcy5wcm9wcy5zdGFnZWRDaGFuZ2VzfVxuICAgICAgICBtZXJnZUNvbmZsaWN0cz17dGhpcy5wcm9wcy5tZXJnZUNvbmZsaWN0c31cbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeVBhdGg9e3RoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGggfHwgdGhpcy5wcm9wcy5jdXJyZW50V29ya0Rpcn1cbiAgICAgICAgbWVyZ2VNZXNzYWdlPXt0aGlzLnByb3BzLm1lcmdlTWVzc2FnZX1cbiAgICAgICAgdXNlclN0b3JlPXt0aGlzLnVzZXJTdG9yZX1cbiAgICAgICAgc2VsZWN0ZWRDb0F1dGhvcnM9e3RoaXMuc3RhdGUuc2VsZWN0ZWRDb0F1dGhvcnN9XG4gICAgICAgIHVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzPXt0aGlzLnVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzfVxuXG4gICAgICAgIHJlc29sdXRpb25Qcm9ncmVzcz17dGhpcy5wcm9wcy5yZXNvbHV0aW9uUHJvZ3Jlc3N9XG4gICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICBncmFtbWFycz17dGhpcy5wcm9wcy5ncmFtbWFyc31cbiAgICAgICAgdG9vbHRpcHM9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgIG5vdGlmaWNhdGlvbk1hbmFnZXI9e3RoaXMucHJvcHMubm90aWZpY2F0aW9uTWFuYWdlcn1cbiAgICAgICAgcHJvamVjdD17dGhpcy5wcm9wcy5wcm9qZWN0fVxuICAgICAgICBjb25maXJtPXt0aGlzLnByb3BzLmNvbmZpcm19XG4gICAgICAgIGNvbmZpZz17dGhpcy5wcm9wcy5jb25maWd9XG5cbiAgICAgICAgdG9nZ2xlSWRlbnRpdHlFZGl0b3I9e3RoaXMudG9nZ2xlSWRlbnRpdHlFZGl0b3J9XG4gICAgICAgIGNsb3NlSWRlbnRpdHlFZGl0b3I9e3RoaXMuY2xvc2VJZGVudGl0eUVkaXRvcn1cbiAgICAgICAgc2V0TG9jYWxJZGVudGl0eT17dGhpcy5zZXRMb2NhbElkZW50aXR5fVxuICAgICAgICBzZXRHbG9iYWxJZGVudGl0eT17dGhpcy5zZXRHbG9iYWxJZGVudGl0eX1cbiAgICAgICAgb3BlbkluaXRpYWxpemVEaWFsb2c9e3RoaXMucHJvcHMub3BlbkluaXRpYWxpemVEaWFsb2d9XG4gICAgICAgIG9wZW5GaWxlcz17dGhpcy5wcm9wcy5vcGVuRmlsZXN9XG4gICAgICAgIGRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzPXt0aGlzLnByb3BzLmRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzfVxuICAgICAgICB1bmRvTGFzdERpc2NhcmQ9e3RoaXMucHJvcHMudW5kb0xhc3REaXNjYXJkfVxuICAgICAgICBjb250ZXh0TG9ja2VkPXt0aGlzLnByb3BzLmNvbnRleHRMb2NrZWR9XG4gICAgICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk9e3RoaXMucHJvcHMuY2hhbmdlV29ya2luZ0RpcmVjdG9yeX1cbiAgICAgICAgc2V0Q29udGV4dExvY2s9e3RoaXMucHJvcHMuc2V0Q29udGV4dExvY2t9XG4gICAgICAgIGdldEN1cnJlbnRXb3JrRGlycz17dGhpcy5wcm9wcy5nZXRDdXJyZW50V29ya0RpcnN9XG4gICAgICAgIG9uRGlkQ2hhbmdlV29ya0RpcnM9e3RoaXMucHJvcHMub25EaWRDaGFuZ2VXb3JrRGlyc31cblxuICAgICAgICBhdHRlbXB0RmlsZVN0YWdlT3BlcmF0aW9uPXt0aGlzLmF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb259XG4gICAgICAgIGF0dGVtcHRTdGFnZUFsbE9wZXJhdGlvbj17dGhpcy5hdHRlbXB0U3RhZ2VBbGxPcGVyYXRpb259XG4gICAgICAgIHByZXBhcmVUb0NvbW1pdD17dGhpcy5wcmVwYXJlVG9Db21taXR9XG4gICAgICAgIGNvbW1pdD17dGhpcy5jb21taXR9XG4gICAgICAgIHVuZG9MYXN0Q29tbWl0PXt0aGlzLnVuZG9MYXN0Q29tbWl0fVxuICAgICAgICBwdXNoPXt0aGlzLnB1c2h9XG4gICAgICAgIHB1bGw9e3RoaXMucHVsbH1cbiAgICAgICAgZmV0Y2g9e3RoaXMuZmV0Y2h9XG4gICAgICAgIGNoZWNrb3V0PXt0aGlzLmNoZWNrb3V0fVxuICAgICAgICBhYm9ydE1lcmdlPXt0aGlzLmFib3J0TWVyZ2V9XG4gICAgICAgIHJlc29sdmVBc091cnM9e3RoaXMucmVzb2x2ZUFzT3Vyc31cbiAgICAgICAgcmVzb2x2ZUFzVGhlaXJzPXt0aGlzLnJlc29sdmVBc1RoZWlyc31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucmVmcmVzaFJlc29sdXRpb25Qcm9ncmVzcyhmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMucmVmUm9vdC5tYXAocm9vdCA9PiByb290LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLnJlbWVtYmVyTGFzdEZvY3VzKSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jb250cm9sbGVyUmVmKSB7XG4gICAgICB0aGlzLnByb3BzLmNvbnRyb2xsZXJSZWYuc2V0dGVyKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICB0aGlzLnVzZXJTdG9yZS5zZXRSZXBvc2l0b3J5KHRoaXMucHJvcHMucmVwb3NpdG9yeSk7XG4gICAgdGhpcy51c2VyU3RvcmUuc2V0TG9naW5Nb2RlbCh0aGlzLnByb3BzLmxvZ2luTW9kZWwpO1xuICAgIHRoaXMucmVmcmVzaFJlc29sdXRpb25Qcm9ncmVzcyhmYWxzZSwgZmFsc2UpO1xuXG4gICAgaWYgKHByZXZQcm9wcy51c2VybmFtZSAhPT0gdGhpcy5wcm9wcy51c2VybmFtZSkge1xuICAgICAgdGhpcy51c2VybmFtZUJ1ZmZlci5zZXRUZXh0VmlhRGlmZih0aGlzLnByb3BzLnVzZXJuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAocHJldlByb3BzLmVtYWlsICE9PSB0aGlzLnByb3BzLmVtYWlsKSB7XG4gICAgICB0aGlzLmVtYWlsQnVmZmVyLnNldFRleHRWaWFEaWZmKHRoaXMucHJvcHMuZW1haWwpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucmVmUm9vdC5tYXAocm9vdCA9PiByb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLnJlbWVtYmVyTGFzdEZvY3VzKSk7XG4gIH1cblxuICAvKlxuICAgKiBCZWdpbiAoYnV0IGRvbid0IGF3YWl0KSBhbiBhc3luYyBjb25mbGljdC1jb3VudGluZyB0YXNrIGZvciBlYWNoIG1lcmdlIGNvbmZsaWN0IHBhdGggdGhhdCBoYXMgbm8gY29uZmxpY3RcbiAgICogbWFya2VyIGNvdW50IHlldC4gT21pdCBhbnkgcGF0aCB0aGF0J3MgYWxyZWFkeSBvcGVuIGluIGEgVGV4dEVkaXRvciBvciB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY291bnRlZC5cbiAgICpcbiAgICogaW5jbHVkZU9wZW4gLSB1cGRhdGUgbWFya2VyIGNvdW50cyBmb3IgZmlsZXMgdGhhdCBhcmUgY3VycmVudGx5IG9wZW4gaW4gVGV4dEVkaXRvcnNcbiAgICogaW5jbHVkZUNvdW50ZWQgLSB1cGRhdGUgbWFya2VyIGNvdW50cyBmb3IgZmlsZXMgdGhhdCBoYXZlIGJlZW4gY291bnRlZCBiZWZvcmVcbiAgICovXG4gIHJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3MoaW5jbHVkZU9wZW4sIGluY2x1ZGVDb3VudGVkKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZmV0Y2hJblByb2dyZXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3BlblBhdGhzID0gbmV3IFNldChcbiAgICAgIHRoaXMucHJvcHMud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkubWFwKGVkaXRvciA9PiBlZGl0b3IuZ2V0UGF0aCgpKSxcbiAgICApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnByb3BzLm1lcmdlQ29uZmxpY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjb25mbGljdFBhdGggPSBwYXRoLmpvaW4oXG4gICAgICAgIHRoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGgsXG4gICAgICAgIHRoaXMucHJvcHMubWVyZ2VDb25mbGljdHNbaV0uZmlsZVBhdGgsXG4gICAgICApO1xuXG4gICAgICBpZiAoIWluY2x1ZGVPcGVuICYmIG9wZW5QYXRocy5oYXMoY29uZmxpY3RQYXRoKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpbmNsdWRlQ291bnRlZCAmJiB0aGlzLnByb3BzLnJlc29sdXRpb25Qcm9ncmVzcy5nZXRSZW1haW5pbmcoY29uZmxpY3RQYXRoKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3BzLnJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3MoY29uZmxpY3RQYXRoKTtcbiAgICB9XG4gIH1cblxuICBhdHRlbXB0U3RhZ2VBbGxPcGVyYXRpb24gPSBzdGFnZVN0YXR1cyA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0ZW1wdEZpbGVTdGFnZU9wZXJhdGlvbihbJy4nXSwgc3RhZ2VTdGF0dXMpO1xuICB9XG5cbiAgYXR0ZW1wdEZpbGVTdGFnZU9wZXJhdGlvbiA9IChmaWxlUGF0aHMsIHN0YWdlU3RhdHVzKSA9PiB7XG4gICAgaWYgKHRoaXMuc3RhZ2luZ09wZXJhdGlvbkluUHJvZ3Jlc3MpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlT3BlcmF0aW9uUHJvbWlzZTogUHJvbWlzZS5yZXNvbHZlKCksXG4gICAgICAgIHNlbGVjdGlvblVwZGF0ZVByb21pc2U6IFByb21pc2UucmVzb2x2ZSgpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YWdpbmdPcGVyYXRpb25JblByb2dyZXNzID0gdHJ1ZTtcblxuICAgIGNvbnN0IGZpbGVMaXN0VXBkYXRlUHJvbWlzZSA9IHRoaXMucmVmU3RhZ2luZ1ZpZXcubWFwKHZpZXcgPT4ge1xuICAgICAgcmV0dXJuIHZpZXcuZ2V0TmV4dExpc3RVcGRhdGVQcm9taXNlKCk7XG4gICAgfSkuZ2V0T3IoUHJvbWlzZS5yZXNvbHZlKCkpO1xuICAgIGxldCBzdGFnZU9wZXJhdGlvblByb21pc2U7XG4gICAgaWYgKHN0YWdlU3RhdHVzID09PSAnc3RhZ2VkJykge1xuICAgICAgc3RhZ2VPcGVyYXRpb25Qcm9taXNlID0gdGhpcy51bnN0YWdlRmlsZXMoZmlsZVBhdGhzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhZ2VPcGVyYXRpb25Qcm9taXNlID0gdGhpcy5zdGFnZUZpbGVzKGZpbGVQYXRocyk7XG4gICAgfVxuICAgIGNvbnN0IHNlbGVjdGlvblVwZGF0ZVByb21pc2UgPSBmaWxlTGlzdFVwZGF0ZVByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnN0YWdpbmdPcGVyYXRpb25JblByb2dyZXNzID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge3N0YWdlT3BlcmF0aW9uUHJvbWlzZSwgc2VsZWN0aW9uVXBkYXRlUHJvbWlzZX07XG4gIH1cblxuICBhc3luYyBzdGFnZUZpbGVzKGZpbGVQYXRocykge1xuICAgIGNvbnN0IHBhdGhzVG9TdGFnZSA9IG5ldyBTZXQoZmlsZVBhdGhzKTtcblxuICAgIGNvbnN0IG1lcmdlTWFya2VycyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgZmlsZVBhdGhzLm1hcChhc3luYyBmaWxlUGF0aCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgaGFzTWFya2VyczogYXdhaXQgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LnBhdGhIYXNNZXJnZU1hcmtlcnMoZmlsZVBhdGgpLFxuICAgICAgICB9O1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGZvciAoY29uc3Qge2ZpbGVQYXRoLCBoYXNNYXJrZXJzfSBvZiBtZXJnZU1hcmtlcnMpIHtcbiAgICAgIGlmIChoYXNNYXJrZXJzKSB7XG4gICAgICAgIGNvbnN0IGNob2ljZSA9IHRoaXMucHJvcHMuY29uZmlybSh7XG4gICAgICAgICAgbWVzc2FnZTogJ0ZpbGUgY29udGFpbnMgbWVyZ2UgbWFya2VyczogJyxcbiAgICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBEbyB5b3Ugc3RpbGwgd2FudCB0byBzdGFnZSB0aGlzIGZpbGU/XFxuJHtmaWxlUGF0aH1gLFxuICAgICAgICAgIGJ1dHRvbnM6IFsnU3RhZ2UnLCAnQ2FuY2VsJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY2hvaWNlICE9PSAwKSB7IHBhdGhzVG9TdGFnZS5kZWxldGUoZmlsZVBhdGgpOyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvcHMucmVwb3NpdG9yeS5zdGFnZUZpbGVzKEFycmF5LmZyb20ocGF0aHNUb1N0YWdlKSk7XG4gIH1cblxuICB1bnN0YWdlRmlsZXMoZmlsZVBhdGhzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMucmVwb3NpdG9yeS51bnN0YWdlRmlsZXMoZmlsZVBhdGhzKTtcbiAgfVxuXG4gIHByZXBhcmVUb0NvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gIWF3YWl0IHRoaXMucHJvcHMuZW5zdXJlR2l0VGFiKCk7XG4gIH1cblxuICBjb21taXQgPSAobWVzc2FnZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJlcG9zaXRvcnkuY29tbWl0KG1lc3NhZ2UsIG9wdGlvbnMpO1xuICB9XG5cbiAgdXBkYXRlU2VsZWN0ZWRDb0F1dGhvcnMgPSAoc2VsZWN0ZWRDb0F1dGhvcnMsIG5ld0F1dGhvcikgPT4ge1xuICAgIGlmIChuZXdBdXRob3IpIHtcbiAgICAgIHRoaXMudXNlclN0b3JlLmFkZFVzZXJzKFtuZXdBdXRob3JdKTtcbiAgICAgIHNlbGVjdGVkQ29BdXRob3JzID0gc2VsZWN0ZWRDb0F1dGhvcnMuY29uY2F0KFtuZXdBdXRob3JdKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRDb0F1dGhvcnN9KTtcbiAgfVxuXG4gIHVuZG9MYXN0Q29tbWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlcG8gPSB0aGlzLnByb3BzLnJlcG9zaXRvcnk7XG4gICAgY29uc3QgbGFzdENvbW1pdCA9IGF3YWl0IHJlcG8uZ2V0TGFzdENvbW1pdCgpO1xuICAgIGlmIChsYXN0Q29tbWl0LmlzVW5ib3JuUmVmKCkpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIGF3YWl0IHJlcG8udW5kb0xhc3RDb21taXQoKTtcbiAgICByZXBvLnNldENvbW1pdE1lc3NhZ2UobGFzdENvbW1pdC5nZXRGdWxsTWVzc2FnZSgpKTtcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzKGxhc3RDb21taXQuZ2V0Q29BdXRob3JzKCkpO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhYm9ydE1lcmdlID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNob2ljZSA9IHRoaXMucHJvcHMuY29uZmlybSh7XG4gICAgICBtZXNzYWdlOiAnQWJvcnQgbWVyZ2UnLFxuICAgICAgZGV0YWlsZWRNZXNzYWdlOiAnQXJlIHlvdSBzdXJlPycsXG4gICAgICBidXR0b25zOiBbJ0Fib3J0JywgJ0NhbmNlbCddLFxuICAgIH0pO1xuICAgIGlmIChjaG9pY2UgIT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LmFib3J0TWVyZ2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5jb2RlID09PSAnRURJUlRZU1RBR0VEJykge1xuICAgICAgICB0aGlzLnByb3BzLm5vdGlmaWNhdGlvbk1hbmFnZXIuYWRkRXJyb3IoXG4gICAgICAgICAgYENhbm5vdCBhYm9ydCBiZWNhdXNlICR7ZS5wYXRofSBpcyBib3RoIGRpcnR5IGFuZCBzdGFnZWQuYCxcbiAgICAgICAgICB7ZGlzbWlzc2FibGU6IHRydWV9LFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNvbHZlQXNPdXJzID0gYXN5bmMgcGF0aHMgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLmZldGNoSW5Qcm9ncmVzcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNpZGUgPSB0aGlzLnByb3BzLmlzUmViYXNpbmcgPyAndGhlaXJzJyA6ICdvdXJzJztcbiAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkuY2hlY2tvdXRTaWRlKHNpZGUsIHBhdGhzKTtcbiAgICB0aGlzLnJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3MoZmFsc2UsIHRydWUpO1xuICB9XG5cbiAgcmVzb2x2ZUFzVGhlaXJzID0gYXN5bmMgcGF0aHMgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLmZldGNoSW5Qcm9ncmVzcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNpZGUgPSB0aGlzLnByb3BzLmlzUmViYXNpbmcgPyAnb3VycycgOiAndGhlaXJzJztcbiAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkuY2hlY2tvdXRTaWRlKHNpZGUsIHBhdGhzKTtcbiAgICB0aGlzLnJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3MoZmFsc2UsIHRydWUpO1xuICB9XG5cbiAgY2hlY2tvdXQgPSAoYnJhbmNoTmFtZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJlcG9zaXRvcnkuY2hlY2tvdXQoYnJhbmNoTmFtZSwgb3B0aW9ucyk7XG4gIH1cblxuICByZW1lbWJlckxhc3RGb2N1cyA9IGV2ZW50ID0+IHtcbiAgICB0aGlzLmxhc3RGb2N1cyA9IHRoaXMucmVmVmlldy5tYXAodmlldyA9PiB2aWV3LmdldEZvY3VzKGV2ZW50LnRhcmdldCkpLmdldE9yKG51bGwpIHx8IEdpdFRhYlZpZXcuZm9jdXMuU1RBR0lORztcbiAgfVxuXG4gIHRvZ2dsZUlkZW50aXR5RWRpdG9yID0gKCkgPT4gdGhpcy5zZXRTdGF0ZShiZWZvcmUgPT4gKHtlZGl0aW5nSWRlbnRpdHk6ICFiZWZvcmUuZWRpdGluZ0lkZW50aXR5fSkpXG5cbiAgY2xvc2VJZGVudGl0eUVkaXRvciA9ICgpID0+IHRoaXMuc2V0U3RhdGUoe2VkaXRpbmdJZGVudGl0eTogZmFsc2V9KVxuXG4gIHNldExvY2FsSWRlbnRpdHkgPSAoKSA9PiB0aGlzLnNldElkZW50aXR5KHt9KTtcblxuICBzZXRHbG9iYWxJZGVudGl0eSA9ICgpID0+IHRoaXMuc2V0SWRlbnRpdHkoe2dsb2JhbDogdHJ1ZX0pO1xuXG4gIGFzeW5jIHNldElkZW50aXR5KG9wdGlvbnMpIHtcbiAgICBjb25zdCBuZXdVc2VybmFtZSA9IHRoaXMudXNlcm5hbWVCdWZmZXIuZ2V0VGV4dCgpO1xuICAgIGNvbnN0IG5ld0VtYWlsID0gdGhpcy5lbWFpbEJ1ZmZlci5nZXRUZXh0KCk7XG5cbiAgICBpZiAobmV3VXNlcm5hbWUubGVuZ3RoID4gMCB8fCBvcHRpb25zLmdsb2JhbCkge1xuICAgICAgYXdhaXQgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LnNldENvbmZpZygndXNlci5uYW1lJywgbmV3VXNlcm5hbWUsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkudW5zZXRDb25maWcoJ3VzZXIubmFtZScpO1xuICAgIH1cblxuICAgIGlmIChuZXdFbWFpbC5sZW5ndGggPiAwIHx8IG9wdGlvbnMuZ2xvYmFsKSB7XG4gICAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkuc2V0Q29uZmlnKCd1c2VyLmVtYWlsJywgbmV3RW1haWwsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkudW5zZXRDb25maWcoJ3VzZXIuZW1haWwnKTtcbiAgICB9XG4gICAgdGhpcy5jbG9zZUlkZW50aXR5RWRpdG9yKCk7XG4gIH1cblxuICByZXN0b3JlRm9jdXMoKSB7XG4gICAgdGhpcy5yZWZWaWV3Lm1hcCh2aWV3ID0+IHZpZXcuc2V0Rm9jdXModGhpcy5sYXN0Rm9jdXMpKTtcbiAgfVxuXG4gIGhhc0ZvY3VzKCkge1xuICAgIHJldHVybiB0aGlzLnJlZlJvb3QubWFwKHJvb3QgPT4gcm9vdC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkuZ2V0T3IoZmFsc2UpO1xuICB9XG5cbiAgd2FzQWN0aXZhdGVkKGlzU3RpbGxBY3RpdmUpIHtcbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIGlzU3RpbGxBY3RpdmUoKSAmJiB0aGlzLnJlc3RvcmVGb2N1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgZm9jdXNBbmRTZWxlY3RTdGFnaW5nSXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cykge1xuICAgIHJldHVybiB0aGlzLnJlZlZpZXcubWFwKHZpZXcgPT4gdmlldy5mb2N1c0FuZFNlbGVjdFN0YWdpbmdJdGVtKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSkuZ2V0T3IobnVsbCk7XG4gIH1cblxuICBmb2N1c0FuZFNlbGVjdENvbW1pdFByZXZpZXdCdXR0b24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmVmlldy5tYXAodmlldyA9PiB2aWV3LmZvY3VzQW5kU2VsZWN0Q29tbWl0UHJldmlld0J1dHRvbigpKTtcbiAgfVxuXG4gIGZvY3VzQW5kU2VsZWN0UmVjZW50Q29tbWl0KCkge1xuICAgIHJldHVybiB0aGlzLnJlZlZpZXcubWFwKHZpZXcgPT4gdmlldy5mb2N1c0FuZFNlbGVjdFJlY2VudENvbW1pdCgpKTtcbiAgfVxuXG4gIHF1aWV0bHlTZWxlY3RJdGVtKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmVmlldy5tYXAodmlldyA9PiB2aWV3LnF1aWV0bHlTZWxlY3RJdGVtKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSkuZ2V0T3IobnVsbCk7XG4gIH1cbn1cbiJdfQ==