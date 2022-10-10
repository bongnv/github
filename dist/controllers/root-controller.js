"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _electron = require("electron");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _yubikiri = _interopRequireDefault(require("yubikiri"));

var _statusBar = _interopRequireDefault(require("../atom/status-bar"));

var _paneItem = _interopRequireDefault(require("../atom/pane-item"));

var _openIssueishDialog = require("../views/open-issueish-dialog");

var _openCommitDialog = require("../views/open-commit-dialog");

var _createDialog = require("../views/create-dialog");

var _observeModel = _interopRequireDefault(require("../views/observe-model"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _changedFileItem = _interopRequireDefault(require("../items/changed-file-item"));

var _issueishDetailItem = _interopRequireDefault(require("../items/issueish-detail-item"));

var _commitDetailItem = _interopRequireDefault(require("../items/commit-detail-item"));

var _commitPreviewItem = _interopRequireDefault(require("../items/commit-preview-item"));

var _gitTabItem = _interopRequireDefault(require("../items/git-tab-item"));

var _githubTabItem = _interopRequireDefault(require("../items/github-tab-item"));

var _reviewsItem = _interopRequireDefault(require("../items/reviews-item"));

var _commentDecorationsContainer = _interopRequireDefault(require("../containers/comment-decorations-container"));

var _dialogsController = _interopRequireWildcard(require("./dialogs-controller"));

var _statusBarTileController = _interopRequireDefault(require("./status-bar-tile-controller"));

var _repositoryConflictController = _interopRequireDefault(require("./repository-conflict-controller"));

var _relayNetworkLayerManager = _interopRequireDefault(require("../relay-network-layer-manager"));

var _gitCacheView = _interopRequireDefault(require("../views/git-cache-view"));

var _gitTimingsView = _interopRequireDefault(require("../views/git-timings-view"));

var _conflict = _interopRequireDefault(require("../models/conflicts/conflict"));

var _endpoint = require("../models/endpoint");

var _switchboard = _interopRequireDefault(require("../switchboard"));

var _propTypes2 = require("../prop-types");

var _helpers = require("../helpers");

var _gitShellOutStrategy = require("../git-shell-out-strategy");

var _reporterProxy = require("../reporter-proxy");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RootController extends _react.default.Component {
  constructor(props, context) {
    super(props, context);

    _defineProperty(this, "fetchData", repository => (0, _yubikiri.default)({
      isPublishable: repository.isPublishable(),
      remotes: repository.getRemotes()
    }));

    _defineProperty(this, "closeDialog", () => new Promise(resolve => this.setState({
      dialogRequest: _dialogsController.dialogRequests.null
    }, resolve)));

    _defineProperty(this, "openInitializeDialog", async dirPath => {
      if (!dirPath) {
        const activeEditor = this.props.workspace.getActiveTextEditor();

        if (activeEditor) {
          const [projectPath] = this.props.project.relativizePath(activeEditor.getPath());

          if (projectPath) {
            dirPath = projectPath;
          }
        }
      }

      if (!dirPath) {
        const directories = this.props.project.getDirectories();
        const withRepositories = await Promise.all(directories.map(async d => [d, await this.props.project.repositoryForDirectory(d)]));
        const firstUninitialized = withRepositories.find(([d, r]) => !r);

        if (firstUninitialized && firstUninitialized[0]) {
          dirPath = firstUninitialized[0].getPath();
        }
      }

      if (!dirPath) {
        dirPath = this.props.config.get('core.projectHome');
      }

      const dialogRequest = _dialogsController.dialogRequests.init({
        dirPath
      });

      dialogRequest.onProgressingAccept(async chosenPath => {
        await this.props.initialize(chosenPath);
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "openCloneDialog", opts => {
      const dialogRequest = _dialogsController.dialogRequests.clone(opts);

      dialogRequest.onProgressingAccept(async (url, chosenPath) => {
        await this.props.clone(url, chosenPath);
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "openCredentialsDialog", query => {
      return new Promise((resolve, reject) => {
        const dialogRequest = _dialogsController.dialogRequests.credential(query);

        dialogRequest.onProgressingAccept(async result => {
          resolve(result);
          await this.closeDialog();
        });
        dialogRequest.onCancel(async () => {
          reject();
          await this.closeDialog();
        });
        this.setState({
          dialogRequest
        });
      });
    });

    _defineProperty(this, "openIssueishDialog", () => {
      const dialogRequest = _dialogsController.dialogRequests.issueish();

      dialogRequest.onProgressingAccept(async url => {
        await (0, _openIssueishDialog.openIssueishItem)(url, {
          workspace: this.props.workspace,
          workdir: this.props.repository.getWorkingDirectoryPath()
        });
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "openCommitDialog", () => {
      const dialogRequest = _dialogsController.dialogRequests.commit();

      dialogRequest.onProgressingAccept(async ref => {
        await (0, _openCommitDialog.openCommitDetailItem)(ref, {
          workspace: this.props.workspace,
          repository: this.props.repository
        });
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "openCreateDialog", () => {
      const dialogRequest = _dialogsController.dialogRequests.create();

      dialogRequest.onProgressingAccept(async result => {
        const dotcom = (0, _endpoint.getEndpoint)('github.com');

        const relayEnvironment = _relayNetworkLayerManager.default.getEnvironmentForHost(dotcom);

        await (0, _createDialog.createRepository)(result, {
          clone: this.props.clone,
          relayEnvironment
        });
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "openPublishDialog", repository => {
      const dialogRequest = _dialogsController.dialogRequests.publish({
        localDir: repository.getWorkingDirectoryPath()
      });

      dialogRequest.onProgressingAccept(async result => {
        const dotcom = (0, _endpoint.getEndpoint)('github.com');

        const relayEnvironment = _relayNetworkLayerManager.default.getEnvironmentForHost(dotcom);

        await (0, _createDialog.publishRepository)(result, {
          repository,
          relayEnvironment
        });
        await this.closeDialog();
      });
      dialogRequest.onCancel(this.closeDialog);
      return new Promise(resolve => this.setState({
        dialogRequest
      }, resolve));
    });

    _defineProperty(this, "toggleCommitPreviewItem", () => {
      const workdir = this.props.repository.getWorkingDirectoryPath();
      return this.props.workspace.toggle(_commitPreviewItem.default.buildURI(workdir));
    });

    _defineProperty(this, "surfaceFromFileAtPath", (filePath, stagingStatus) => {
      const gitTab = this.gitTabTracker.getComponent();
      return gitTab && gitTab.focusAndSelectStagingItem(filePath, stagingStatus);
    });

    _defineProperty(this, "surfaceToCommitPreviewButton", () => {
      const gitTab = this.gitTabTracker.getComponent();
      return gitTab && gitTab.focusAndSelectCommitPreviewButton();
    });

    _defineProperty(this, "surfaceToRecentCommit", () => {
      const gitTab = this.gitTabTracker.getComponent();
      return gitTab && gitTab.focusAndSelectRecentCommit();
    });

    _defineProperty(this, "reportRelayError", (friendlyMessage, err) => {
      const opts = {
        dismissable: true
      };

      if (err.network) {
        // Offline
        opts.icon = 'alignment-unalign';
        opts.description = "It looks like you're offline right now.";
      } else if (err.responseText) {
        // Transient error like a 500 from the API
        opts.description = 'The GitHub API reported a problem.';
        opts.detail = err.responseText;
      } else if (err.errors) {
        // GraphQL errors
        opts.detail = err.errors.map(e => e.message).join('\n');
      } else {
        opts.detail = err.stack;
      }

      this.props.notificationManager.addError(friendlyMessage, opts);
    });

    (0, _helpers.autobind)(this, 'installReactDevTools', 'clearGithubToken', 'showWaterfallDiagnostics', 'showCacheDiagnostics', 'destroyFilePatchPaneItems', 'destroyEmptyFilePatchPaneItems', 'quietlySelectItem', 'viewUnstagedChangesForCurrentFile', 'viewStagedChangesForCurrentFile', 'openFiles', 'getUnsavedFiles', 'ensureNoUnsavedFiles', 'discardWorkDirChangesForPaths', 'discardLines', 'undoLastDiscard', 'refreshResolutionProgress');
    this.state = {
      dialogRequest: _dialogsController.dialogRequests.null
    };
    this.gitTabTracker = new TabTracker('git', {
      uri: _gitTabItem.default.buildURI(),
      getWorkspace: () => this.props.workspace
    });
    this.githubTabTracker = new TabTracker('github', {
      uri: _githubTabItem.default.buildURI(),
      getWorkspace: () => this.props.workspace
    });
    this.subscription = new _eventKit.CompositeDisposable(this.props.repository.onPullError(this.gitTabTracker.ensureVisible));
    this.props.commands.onDidDispatch(event => {
      if (event.type && event.type.startsWith('github:') && event.detail && event.detail[0] && event.detail[0].contextCommand) {
        (0, _reporterProxy.addEvent)('context-menu-action', {
          package: 'github',
          command: event.type
        });
      }
    });
  }

  componentDidMount() {
    this.openTabs();
  }

  render() {
    return _react.default.createElement(_react.Fragment, null, this.renderCommands(), this.renderStatusBarTile(), this.renderPaneItems(), this.renderDialogs(), this.renderConflictResolver(), this.renderCommentDecorations());
  }

  renderCommands() {
    const devMode = global.atom && global.atom.inDevMode();
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: "atom-workspace"
    }, devMode && _react.default.createElement(_commands.Command, {
      command: "github:install-react-dev-tools",
      callback: this.installReactDevTools
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-commit-preview",
      callback: this.toggleCommitPreviewItem
    }), _react.default.createElement(_commands.Command, {
      command: "github:logout",
      callback: this.clearGithubToken
    }), _react.default.createElement(_commands.Command, {
      command: "github:show-waterfall-diagnostics",
      callback: this.showWaterfallDiagnostics
    }), _react.default.createElement(_commands.Command, {
      command: "github:show-cache-diagnostics",
      callback: this.showCacheDiagnostics
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-git-tab",
      callback: this.gitTabTracker.toggle
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-git-tab-focus",
      callback: this.gitTabTracker.toggleFocus
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-github-tab",
      callback: this.githubTabTracker.toggle
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-github-tab-focus",
      callback: this.githubTabTracker.toggleFocus
    }), _react.default.createElement(_commands.Command, {
      command: "github:initialize",
      callback: () => this.openInitializeDialog()
    }), _react.default.createElement(_commands.Command, {
      command: "github:clone",
      callback: () => this.openCloneDialog()
    }), _react.default.createElement(_commands.Command, {
      command: "github:open-issue-or-pull-request",
      callback: () => this.openIssueishDialog()
    }), _react.default.createElement(_commands.Command, {
      command: "github:open-commit",
      callback: () => this.openCommitDialog()
    }), _react.default.createElement(_commands.Command, {
      command: "github:create-repository",
      callback: () => this.openCreateDialog()
    }), _react.default.createElement(_commands.Command, {
      command: "github:view-unstaged-changes-for-current-file",
      callback: this.viewUnstagedChangesForCurrentFile
    }), _react.default.createElement(_commands.Command, {
      command: "github:view-staged-changes-for-current-file",
      callback: this.viewStagedChangesForCurrentFile
    }), _react.default.createElement(_commands.Command, {
      command: "github:close-all-diff-views",
      callback: this.destroyFilePatchPaneItems
    }), _react.default.createElement(_commands.Command, {
      command: "github:close-empty-diff-views",
      callback: this.destroyEmptyFilePatchPaneItems
    })), _react.default.createElement(_observeModel.default, {
      model: this.props.repository,
      fetchData: this.fetchData
    }, data => {
      if (!data || !data.isPublishable || !data.remotes.filter(r => r.isGithubRepo()).isEmpty()) {
        return null;
      }

      return _react.default.createElement(_commands.default, {
        registry: this.props.commands,
        target: "atom-workspace"
      }, _react.default.createElement(_commands.Command, {
        command: "github:publish-repository",
        callback: () => this.openPublishDialog(this.props.repository)
      }));
    }));
  }

  renderStatusBarTile() {
    return _react.default.createElement(_statusBar.default, {
      statusBar: this.props.statusBar,
      onConsumeStatusBar: sb => this.onConsumeStatusBar(sb),
      className: "github-StatusBarTileController"
    }, _react.default.createElement(_statusBarTileController.default, {
      pipelineManager: this.props.pipelineManager,
      workspace: this.props.workspace,
      repository: this.props.repository,
      commands: this.props.commands,
      notificationManager: this.props.notificationManager,
      tooltips: this.props.tooltips,
      confirm: this.props.confirm,
      toggleGitTab: this.gitTabTracker.toggle,
      toggleGithubTab: this.githubTabTracker.toggle
    }));
  }

  renderDialogs() {
    return _react.default.createElement(_dialogsController.default, {
      loginModel: this.props.loginModel,
      request: this.state.dialogRequest,
      currentWindow: this.props.currentWindow,
      workspace: this.props.workspace,
      commands: this.props.commands,
      config: this.props.config
    });
  }

  renderCommentDecorations() {
    if (!this.props.repository) {
      return null;
    }

    return _react.default.createElement(_commentDecorationsContainer.default, {
      workspace: this.props.workspace,
      commands: this.props.commands,
      localRepository: this.props.repository,
      loginModel: this.props.loginModel,
      reportRelayError: this.reportRelayError
    });
  }

  renderConflictResolver() {
    if (!this.props.repository) {
      return null;
    }

    return _react.default.createElement(_repositoryConflictController.default, {
      workspace: this.props.workspace,
      config: this.props.config,
      repository: this.props.repository,
      resolutionProgress: this.props.resolutionProgress,
      refreshResolutionProgress: this.refreshResolutionProgress,
      commands: this.props.commands
    });
  }

  renderPaneItems() {
    const {
      workdirContextPool
    } = this.props;
    const getCurrentWorkDirs = workdirContextPool.getCurrentWorkDirs.bind(workdirContextPool);
    const onDidChangeWorkDirs = workdirContextPool.onDidChangePoolContexts.bind(workdirContextPool);
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _gitTabItem.default.uriPattern,
      className: "github-Git-root"
    }, ({
      itemHolder
    }) => _react.default.createElement(_gitTabItem.default, {
      ref: itemHolder.setter,
      workspace: this.props.workspace,
      commands: this.props.commands,
      notificationManager: this.props.notificationManager,
      tooltips: this.props.tooltips,
      grammars: this.props.grammars,
      project: this.props.project,
      confirm: this.props.confirm,
      config: this.props.config,
      repository: this.props.repository,
      loginModel: this.props.loginModel,
      openInitializeDialog: this.openInitializeDialog,
      resolutionProgress: this.props.resolutionProgress,
      ensureGitTab: this.gitTabTracker.ensureVisible,
      openFiles: this.openFiles,
      discardWorkDirChangesForPaths: this.discardWorkDirChangesForPaths,
      undoLastDiscard: this.undoLastDiscard,
      refreshResolutionProgress: this.refreshResolutionProgress,
      currentWorkDir: this.props.currentWorkDir,
      getCurrentWorkDirs: getCurrentWorkDirs,
      onDidChangeWorkDirs: onDidChangeWorkDirs,
      contextLocked: this.props.contextLocked,
      changeWorkingDirectory: this.props.changeWorkingDirectory,
      setContextLock: this.props.setContextLock
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _githubTabItem.default.uriPattern,
      className: "github-GitHub-root"
    }, ({
      itemHolder
    }) => _react.default.createElement(_githubTabItem.default, {
      ref: itemHolder.setter,
      repository: this.props.repository,
      loginModel: this.props.loginModel,
      workspace: this.props.workspace,
      currentWorkDir: this.props.currentWorkDir,
      getCurrentWorkDirs: getCurrentWorkDirs,
      onDidChangeWorkDirs: onDidChangeWorkDirs,
      contextLocked: this.props.contextLocked,
      changeWorkingDirectory: this.props.changeWorkingDirectory,
      setContextLock: this.props.setContextLock,
      openCreateDialog: this.openCreateDialog,
      openPublishDialog: this.openPublishDialog,
      openCloneDialog: this.openCloneDialog,
      openGitTab: this.gitTabTracker.toggleFocus
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _changedFileItem.default.uriPattern
    }, ({
      itemHolder,
      params
    }) => _react.default.createElement(_changedFileItem.default, {
      ref: itemHolder.setter,
      workdirContextPool: this.props.workdirContextPool,
      relPath: _path.default.join(...params.relPath),
      workingDirectory: params.workingDirectory,
      stagingStatus: params.stagingStatus,
      tooltips: this.props.tooltips,
      commands: this.props.commands,
      keymaps: this.props.keymaps,
      workspace: this.props.workspace,
      config: this.props.config,
      discardLines: this.discardLines,
      undoLastDiscard: this.undoLastDiscard,
      surfaceFileAtPath: this.surfaceFromFileAtPath
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _commitPreviewItem.default.uriPattern,
      className: "github-CommitPreview-root"
    }, ({
      itemHolder,
      params
    }) => _react.default.createElement(_commitPreviewItem.default, {
      ref: itemHolder.setter,
      workdirContextPool: this.props.workdirContextPool,
      workingDirectory: params.workingDirectory,
      workspace: this.props.workspace,
      commands: this.props.commands,
      keymaps: this.props.keymaps,
      tooltips: this.props.tooltips,
      config: this.props.config,
      discardLines: this.discardLines,
      undoLastDiscard: this.undoLastDiscard,
      surfaceToCommitPreviewButton: this.surfaceToCommitPreviewButton
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _commitDetailItem.default.uriPattern,
      className: "github-CommitDetail-root"
    }, ({
      itemHolder,
      params
    }) => _react.default.createElement(_commitDetailItem.default, {
      ref: itemHolder.setter,
      workdirContextPool: this.props.workdirContextPool,
      workingDirectory: params.workingDirectory,
      workspace: this.props.workspace,
      commands: this.props.commands,
      keymaps: this.props.keymaps,
      tooltips: this.props.tooltips,
      config: this.props.config,
      sha: params.sha,
      surfaceCommit: this.surfaceToRecentCommit
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _issueishDetailItem.default.uriPattern
    }, ({
      itemHolder,
      params,
      deserialized
    }) => _react.default.createElement(_issueishDetailItem.default, {
      ref: itemHolder.setter,
      host: params.host,
      owner: params.owner,
      repo: params.repo,
      issueishNumber: parseInt(params.issueishNumber, 10),
      workingDirectory: params.workingDirectory,
      workdirContextPool: this.props.workdirContextPool,
      loginModel: this.props.loginModel,
      initSelectedTab: deserialized.initSelectedTab,
      workspace: this.props.workspace,
      commands: this.props.commands,
      keymaps: this.props.keymaps,
      tooltips: this.props.tooltips,
      config: this.props.config,
      reportRelayError: this.reportRelayError
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _reviewsItem.default.uriPattern
    }, ({
      itemHolder,
      params
    }) => _react.default.createElement(_reviewsItem.default, {
      ref: itemHolder.setter,
      host: params.host,
      owner: params.owner,
      repo: params.repo,
      number: parseInt(params.number, 10),
      workdir: params.workdir,
      workdirContextPool: this.props.workdirContextPool,
      loginModel: this.props.loginModel,
      workspace: this.props.workspace,
      tooltips: this.props.tooltips,
      config: this.props.config,
      commands: this.props.commands,
      confirm: this.props.confirm,
      reportRelayError: this.reportRelayError
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _gitTimingsView.default.uriPattern
    }, ({
      itemHolder
    }) => _react.default.createElement(_gitTimingsView.default, {
      ref: itemHolder.setter
    })), _react.default.createElement(_paneItem.default, {
      workspace: this.props.workspace,
      uriPattern: _gitCacheView.default.uriPattern
    }, ({
      itemHolder
    }) => _react.default.createElement(_gitCacheView.default, {
      ref: itemHolder.setter,
      repository: this.props.repository
    })));
  }

  async openTabs() {
    if (this.props.startOpen) {
      await Promise.all([this.gitTabTracker.ensureRendered(false), this.githubTabTracker.ensureRendered(false)]);
    }

    if (this.props.startRevealed) {
      const docks = new Set([_gitTabItem.default.buildURI(), _githubTabItem.default.buildURI()].map(uri => this.props.workspace.paneContainerForURI(uri)).filter(container => container && typeof container.show === 'function'));

      for (const dock of docks) {
        dock.show();
      }
    }
  }

  async installReactDevTools() {
    // Prevent electron-link from attempting to descend into electron-devtools-installer, which is not available
    // when we're bundled in Atom.
    const devToolsName = 'electron-devtools-installer';

    const devTools = require(devToolsName);

    await Promise.all([this.installExtension(devTools.REACT_DEVELOPER_TOOLS.id), // relay developer tools extension id
    this.installExtension('ncedobpgnmkhcmnnkcimnobpfepidadl')]);
    this.props.notificationManager.addSuccess('🌈 Reload your window to start using the React/Relay dev tools!');
  }

  async installExtension(id) {
    const devToolsName = 'electron-devtools-installer';

    const devTools = require(devToolsName);

    const crossUnzipName = 'cross-unzip';

    const unzip = require(crossUnzipName);

    const url = 'https://clients2.google.com/service/update2/crx?' + `response=redirect&x=id%3D${id}%26uc&prodversion=32`;

    const extensionFolder = _path.default.resolve(_electron.remote.app.getPath('userData'), `extensions/${id}`);

    const extensionFile = `${extensionFolder}.crx`;
    await _fsExtra.default.ensureDir(_path.default.dirname(extensionFile));
    const response = await fetch(url, {
      method: 'GET'
    });
    const body = Buffer.from((await response.arrayBuffer()));
    await _fsExtra.default.writeFile(extensionFile, body);
    await new Promise((resolve, reject) => {
      unzip(extensionFile, extensionFolder, async err => {
        if (err && !(await _fsExtra.default.exists(_path.default.join(extensionFolder, 'manifest.json')))) {
          reject(err);
        }

        resolve();
      });
    });
    await _fsExtra.default.ensureDir(extensionFolder, 0o755);
    await devTools.default(id);
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  componentDidUpdate() {
    this.subscription.dispose();
    this.subscription = new _eventKit.CompositeDisposable(this.props.repository.onPullError(() => this.gitTabTracker.ensureVisible()));
  }

  onConsumeStatusBar(statusBar) {
    if (statusBar.disableGitInfoTile) {
      statusBar.disableGitInfoTile();
    }
  }

  clearGithubToken() {
    return this.props.loginModel.removeToken('https://api.github.com');
  }

  showWaterfallDiagnostics() {
    this.props.workspace.open(_gitTimingsView.default.buildURI());
  }

  showCacheDiagnostics() {
    this.props.workspace.open(_gitCacheView.default.buildURI());
  }

  destroyFilePatchPaneItems() {
    (0, _helpers.destroyFilePatchPaneItems)({
      onlyStaged: false
    }, this.props.workspace);
  }

  destroyEmptyFilePatchPaneItems() {
    (0, _helpers.destroyEmptyFilePatchPaneItems)(this.props.workspace);
  }

  quietlySelectItem(filePath, stagingStatus) {
    const gitTab = this.gitTabTracker.getComponent();
    return gitTab && gitTab.quietlySelectItem(filePath, stagingStatus);
  }

  async viewChangesForCurrentFile(stagingStatus) {
    const editor = this.props.workspace.getActiveTextEditor();

    if (!editor.getPath()) {
      return;
    }

    const absFilePath = await _fsExtra.default.realpath(editor.getPath());
    const repoPath = this.props.repository.getWorkingDirectoryPath();

    if (repoPath === null) {
      const [projectPath] = this.props.project.relativizePath(editor.getPath());
      const notification = this.props.notificationManager.addInfo("Hmm, there's nothing to compare this file to", {
        description: 'You can create a Git repository to track changes to the files in your project.',
        dismissable: true,
        buttons: [{
          className: 'btn btn-primary',
          text: 'Create a repository now',
          onDidClick: async () => {
            notification.dismiss();
            const createdPath = await this.initializeRepo(projectPath); // If the user confirmed repository creation for this project path,
            // retry the operation that got them here in the first place

            if (createdPath === projectPath) {
              this.viewChangesForCurrentFile(stagingStatus);
            }
          }
        }]
      });
      return;
    }

    if (absFilePath.startsWith(repoPath)) {
      const filePath = absFilePath.slice(repoPath.length + 1);
      this.quietlySelectItem(filePath, stagingStatus);
      const splitDirection = this.props.config.get('github.viewChangesForCurrentFileDiffPaneSplitDirection');
      const pane = this.props.workspace.getActivePane();

      if (splitDirection === 'right') {
        pane.splitRight();
      } else if (splitDirection === 'down') {
        pane.splitDown();
      }

      const lineNum = editor.getCursorBufferPosition().row + 1;
      const item = await this.props.workspace.open(_changedFileItem.default.buildURI(filePath, repoPath, stagingStatus), {
        pending: true,
        activatePane: true,
        activateItem: true
      });
      await item.getRealItemPromise();
      await item.getFilePatchLoadedPromise();
      item.goToDiffLine(lineNum);
      item.focus();
    } else {
      throw new Error(`${absFilePath} does not belong to repo ${repoPath}`);
    }
  }

  viewUnstagedChangesForCurrentFile() {
    return this.viewChangesForCurrentFile('unstaged');
  }

  viewStagedChangesForCurrentFile() {
    return this.viewChangesForCurrentFile('staged');
  }

  openFiles(filePaths, repository = this.props.repository) {
    return Promise.all(filePaths.map(filePath => {
      const absolutePath = _path.default.join(repository.getWorkingDirectoryPath(), filePath);

      return this.props.workspace.open(absolutePath, {
        pending: filePaths.length === 1
      });
    }));
  }

  getUnsavedFiles(filePaths, workdirPath) {
    const isModifiedByPath = new Map();
    this.props.workspace.getTextEditors().forEach(editor => {
      isModifiedByPath.set(editor.getPath(), editor.isModified());
    });
    return filePaths.filter(filePath => {
      const absFilePath = _path.default.join(workdirPath, filePath);

      return isModifiedByPath.get(absFilePath);
    });
  }

  ensureNoUnsavedFiles(filePaths, message, workdirPath = this.props.repository.getWorkingDirectoryPath()) {
    const unsavedFiles = this.getUnsavedFiles(filePaths, workdirPath).map(filePath => `\`${filePath}\``).join('<br>');

    if (unsavedFiles.length) {
      this.props.notificationManager.addError(message, {
        description: `You have unsaved changes in:<br>${unsavedFiles}.`,
        dismissable: true
      });
      return false;
    } else {
      return true;
    }
  }

  async discardWorkDirChangesForPaths(filePaths) {
    const destructiveAction = () => {
      return this.props.repository.discardWorkDirChangesForPaths(filePaths);
    };

    return await this.props.repository.storeBeforeAndAfterBlobs(filePaths, () => this.ensureNoUnsavedFiles(filePaths, 'Cannot discard changes in selected files.'), destructiveAction);
  }

  async discardLines(multiFilePatch, lines, repository = this.props.repository) {
    // (kuychaco) For now we only support discarding rows for MultiFilePatches that contain a single file patch
    // The only way to access this method from the UI is to be in a ChangedFileItem, which only has a single file patch
    if (multiFilePatch.getFilePatches().length !== 1) {
      return Promise.resolve(null);
    }

    const filePath = multiFilePatch.getFilePatches()[0].getPath();

    const destructiveAction = async () => {
      const discardFilePatch = multiFilePatch.getUnstagePatchForLines(lines);
      await repository.applyPatchToWorkdir(discardFilePatch);
    };

    return await repository.storeBeforeAndAfterBlobs([filePath], () => this.ensureNoUnsavedFiles([filePath], 'Cannot discard lines.', repository.getWorkingDirectoryPath()), destructiveAction, filePath);
  }

  getFilePathsForLastDiscard(partialDiscardFilePath = null) {
    let lastSnapshots = this.props.repository.getLastHistorySnapshots(partialDiscardFilePath);

    if (partialDiscardFilePath) {
      lastSnapshots = lastSnapshots ? [lastSnapshots] : [];
    }

    return lastSnapshots.map(snapshot => snapshot.filePath);
  }

  async undoLastDiscard(partialDiscardFilePath = null, repository = this.props.repository) {
    const filePaths = this.getFilePathsForLastDiscard(partialDiscardFilePath);

    try {
      const results = await repository.restoreLastDiscardInTempFiles(() => this.ensureNoUnsavedFiles(filePaths, 'Cannot undo last discard.'), partialDiscardFilePath);

      if (results.length === 0) {
        return;
      }

      await this.proceedOrPromptBasedOnResults(results, partialDiscardFilePath);
    } catch (e) {
      if (e instanceof _gitShellOutStrategy.GitError && e.stdErr.match(/fatal: Not a valid object name/)) {
        this.cleanUpHistoryForFilePaths(filePaths, partialDiscardFilePath);
      } else {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }

  async proceedOrPromptBasedOnResults(results, partialDiscardFilePath = null) {
    const conflicts = results.filter(({
      conflict
    }) => conflict);

    if (conflicts.length === 0) {
      await this.proceedWithLastDiscardUndo(results, partialDiscardFilePath);
    } else {
      await this.promptAboutConflicts(results, conflicts, partialDiscardFilePath);
    }
  }

  async promptAboutConflicts(results, conflicts, partialDiscardFilePath = null) {
    const conflictedFiles = conflicts.map(({
      filePath
    }) => `\t${filePath}`).join('\n');
    const choice = this.props.confirm({
      message: 'Undoing will result in conflicts...',
      detailedMessage: `for the following files:\n${conflictedFiles}\n` + 'Would you like to apply the changes with merge conflict markers, ' + 'or open the text with merge conflict markers in a new file?',
      buttons: ['Merge with conflict markers', 'Open in new file', 'Cancel']
    });

    if (choice === 0) {
      await this.proceedWithLastDiscardUndo(results, partialDiscardFilePath);
    } else if (choice === 1) {
      await this.openConflictsInNewEditors(conflicts.map(({
        resultPath
      }) => resultPath));
    }
  }

  cleanUpHistoryForFilePaths(filePaths, partialDiscardFilePath = null) {
    this.props.repository.clearDiscardHistory(partialDiscardFilePath);
    const filePathsStr = filePaths.map(filePath => `\`${filePath}\``).join('<br>');
    this.props.notificationManager.addError('Discard history has expired.', {
      description: `Cannot undo discard for<br>${filePathsStr}<br>Stale discard history has been deleted.`,
      dismissable: true
    });
  }

  async proceedWithLastDiscardUndo(results, partialDiscardFilePath = null) {
    const promises = results.map(async result => {
      const {
        filePath,
        resultPath,
        deleted,
        conflict,
        theirsSha,
        commonBaseSha,
        currentSha
      } = result;

      const absFilePath = _path.default.join(this.props.repository.getWorkingDirectoryPath(), filePath);

      if (deleted && resultPath === null) {
        await _fsExtra.default.remove(absFilePath);
      } else {
        await _fsExtra.default.copy(resultPath, absFilePath);
      }

      if (conflict) {
        await this.props.repository.writeMergeConflictToIndex(filePath, commonBaseSha, currentSha, theirsSha);
      }
    });
    await Promise.all(promises);
    await this.props.repository.popDiscardHistory(partialDiscardFilePath);
  }

  async openConflictsInNewEditors(resultPaths) {
    const editorPromises = resultPaths.map(resultPath => {
      return this.props.workspace.open(resultPath);
    });
    return await Promise.all(editorPromises);
  }

  /*
   * Asynchronously count the conflict markers present in a file specified by full path.
   */
  refreshResolutionProgress(fullPath) {
    const readStream = _fsExtra.default.createReadStream(fullPath, {
      encoding: 'utf8'
    });

    return new Promise(resolve => {
      _conflict.default.countFromStream(readStream).then(count => {
        this.props.resolutionProgress.reportMarkerCount(fullPath, count);
      });
    });
  }

}

exports.default = RootController;

_defineProperty(RootController, "propTypes", {
  // Atom enviornment
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  deserializers: _propTypes.default.object.isRequired,
  notificationManager: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  keymaps: _propTypes.default.object.isRequired,
  grammars: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  project: _propTypes.default.object.isRequired,
  confirm: _propTypes.default.func.isRequired,
  currentWindow: _propTypes.default.object.isRequired,
  // Models
  loginModel: _propTypes.default.object.isRequired,
  workdirContextPool: _propTypes2.WorkdirContextPoolPropType.isRequired,
  repository: _propTypes.default.object.isRequired,
  resolutionProgress: _propTypes.default.object.isRequired,
  statusBar: _propTypes.default.object,
  switchboard: _propTypes.default.instanceOf(_switchboard.default),
  pipelineManager: _propTypes.default.object,
  currentWorkDir: _propTypes.default.string,
  // Git actions
  initialize: _propTypes.default.func.isRequired,
  clone: _propTypes.default.func.isRequired,
  // Control
  contextLocked: _propTypes.default.bool.isRequired,
  changeWorkingDirectory: _propTypes.default.func.isRequired,
  setContextLock: _propTypes.default.func.isRequired,
  startOpen: _propTypes.default.bool,
  startRevealed: _propTypes.default.bool
});

_defineProperty(RootController, "defaultProps", {
  switchboard: new _switchboard.default(),
  startOpen: false,
  startRevealed: false
});

class TabTracker {
  constructor(name, {
    getWorkspace,
    uri
  }) {
    (0, _helpers.autobind)(this, 'toggle', 'toggleFocus', 'ensureVisible');
    this.name = name;
    this.getWorkspace = getWorkspace;
    this.uri = uri;
  }

  async toggle() {
    const focusToRestore = document.activeElement;
    let shouldRestoreFocus = false; // Rendered => the dock item is being rendered, whether or not the dock is visible or the item
    //   is visible within its dock.
    // Visible => the item is active and the dock item is active within its dock.

    const wasRendered = this.isRendered();
    const wasVisible = this.isVisible();

    if (!wasRendered || !wasVisible) {
      // Not rendered, or rendered but not an active item in a visible dock.
      await this.reveal();
      shouldRestoreFocus = true;
    } else {
      // Rendered and an active item within a visible dock.
      await this.hide();
      shouldRestoreFocus = false;
    }

    if (shouldRestoreFocus) {
      process.nextTick(() => focusToRestore.focus());
    }
  }

  async toggleFocus() {
    const hadFocus = this.hasFocus();
    await this.ensureVisible();

    if (hadFocus) {
      let workspace = this.getWorkspace();

      if (workspace.getCenter) {
        workspace = workspace.getCenter();
      }

      workspace.getActivePane().activate();
    } else {
      this.focus();
    }
  }

  async ensureVisible() {
    if (!this.isVisible()) {
      await this.reveal();
      return true;
    }

    return false;
  }

  ensureRendered() {
    return this.getWorkspace().open(this.uri, {
      searchAllPanes: true,
      activateItem: false,
      activatePane: false
    });
  }

  reveal() {
    (0, _reporterProxy.incrementCounter)(`${this.name}-tab-open`);
    return this.getWorkspace().open(this.uri, {
      searchAllPanes: true,
      activateItem: true,
      activatePane: true
    });
  }

  hide() {
    (0, _reporterProxy.incrementCounter)(`${this.name}-tab-close`);
    return this.getWorkspace().hide(this.uri);
  }

  focus() {
    this.getComponent().restoreFocus();
  }

  getItem() {
    const pane = this.getWorkspace().paneForURI(this.uri);

    if (!pane) {
      return null;
    }

    const paneItem = pane.itemForURI(this.uri);

    if (!paneItem) {
      return null;
    }

    return paneItem;
  }

  getComponent() {
    const paneItem = this.getItem();

    if (!paneItem) {
      return null;
    }

    if (typeof paneItem.getRealItem !== 'function') {
      return null;
    }

    return paneItem.getRealItem();
  }

  getDOMElement() {
    const paneItem = this.getItem();

    if (!paneItem) {
      return null;
    }

    if (typeof paneItem.getElement !== 'function') {
      return null;
    }

    return paneItem.getElement();
  }

  isRendered() {
    return !!this.getWorkspace().paneForURI(this.uri);
  }

  isVisible() {
    const workspace = this.getWorkspace();
    return workspace.getPaneContainers().filter(container => container === workspace.getCenter() || container.isVisible()).some(container => container.getPanes().some(pane => {
      const item = pane.getActiveItem();
      return item && item.getURI && item.getURI() === this.uri;
    }));
  }

  hasFocus() {
    const root = this.getDOMElement();
    return root && root.contains(document.activeElement);
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250cm9sbGVycy9yb290LWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiUm9vdENvbnRyb2xsZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwicmVwb3NpdG9yeSIsImlzUHVibGlzaGFibGUiLCJyZW1vdGVzIiwiZ2V0UmVtb3RlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0U3RhdGUiLCJkaWFsb2dSZXF1ZXN0IiwiZGlhbG9nUmVxdWVzdHMiLCJudWxsIiwiZGlyUGF0aCIsImFjdGl2ZUVkaXRvciIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVRleHRFZGl0b3IiLCJwcm9qZWN0UGF0aCIsInByb2plY3QiLCJyZWxhdGl2aXplUGF0aCIsImdldFBhdGgiLCJkaXJlY3RvcmllcyIsImdldERpcmVjdG9yaWVzIiwid2l0aFJlcG9zaXRvcmllcyIsImFsbCIsIm1hcCIsImQiLCJyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5IiwiZmlyc3RVbmluaXRpYWxpemVkIiwiZmluZCIsInIiLCJjb25maWciLCJnZXQiLCJpbml0Iiwib25Qcm9ncmVzc2luZ0FjY2VwdCIsImNob3NlblBhdGgiLCJpbml0aWFsaXplIiwiY2xvc2VEaWFsb2ciLCJvbkNhbmNlbCIsIm9wdHMiLCJjbG9uZSIsInVybCIsInF1ZXJ5IiwicmVqZWN0IiwiY3JlZGVudGlhbCIsInJlc3VsdCIsImlzc3VlaXNoIiwid29ya2RpciIsImdldFdvcmtpbmdEaXJlY3RvcnlQYXRoIiwiY29tbWl0IiwicmVmIiwiY3JlYXRlIiwiZG90Y29tIiwicmVsYXlFbnZpcm9ubWVudCIsIlJlbGF5TmV0d29ya0xheWVyTWFuYWdlciIsImdldEVudmlyb25tZW50Rm9ySG9zdCIsInB1Ymxpc2giLCJsb2NhbERpciIsInRvZ2dsZSIsIkNvbW1pdFByZXZpZXdJdGVtIiwiYnVpbGRVUkkiLCJmaWxlUGF0aCIsInN0YWdpbmdTdGF0dXMiLCJnaXRUYWIiLCJnaXRUYWJUcmFja2VyIiwiZ2V0Q29tcG9uZW50IiwiZm9jdXNBbmRTZWxlY3RTdGFnaW5nSXRlbSIsImZvY3VzQW5kU2VsZWN0Q29tbWl0UHJldmlld0J1dHRvbiIsImZvY3VzQW5kU2VsZWN0UmVjZW50Q29tbWl0IiwiZnJpZW5kbHlNZXNzYWdlIiwiZXJyIiwiZGlzbWlzc2FibGUiLCJuZXR3b3JrIiwiaWNvbiIsImRlc2NyaXB0aW9uIiwicmVzcG9uc2VUZXh0IiwiZGV0YWlsIiwiZXJyb3JzIiwiZSIsIm1lc3NhZ2UiLCJqb2luIiwic3RhY2siLCJub3RpZmljYXRpb25NYW5hZ2VyIiwiYWRkRXJyb3IiLCJzdGF0ZSIsIlRhYlRyYWNrZXIiLCJ1cmkiLCJHaXRUYWJJdGVtIiwiZ2V0V29ya3NwYWNlIiwiZ2l0aHViVGFiVHJhY2tlciIsIkdpdEh1YlRhYkl0ZW0iLCJzdWJzY3JpcHRpb24iLCJDb21wb3NpdGVEaXNwb3NhYmxlIiwib25QdWxsRXJyb3IiLCJlbnN1cmVWaXNpYmxlIiwiY29tbWFuZHMiLCJvbkRpZERpc3BhdGNoIiwiZXZlbnQiLCJ0eXBlIiwic3RhcnRzV2l0aCIsImNvbnRleHRDb21tYW5kIiwicGFja2FnZSIsImNvbW1hbmQiLCJjb21wb25lbnREaWRNb3VudCIsIm9wZW5UYWJzIiwicmVuZGVyIiwicmVuZGVyQ29tbWFuZHMiLCJyZW5kZXJTdGF0dXNCYXJUaWxlIiwicmVuZGVyUGFuZUl0ZW1zIiwicmVuZGVyRGlhbG9ncyIsInJlbmRlckNvbmZsaWN0UmVzb2x2ZXIiLCJyZW5kZXJDb21tZW50RGVjb3JhdGlvbnMiLCJkZXZNb2RlIiwiZ2xvYmFsIiwiYXRvbSIsImluRGV2TW9kZSIsImluc3RhbGxSZWFjdERldlRvb2xzIiwidG9nZ2xlQ29tbWl0UHJldmlld0l0ZW0iLCJjbGVhckdpdGh1YlRva2VuIiwic2hvd1dhdGVyZmFsbERpYWdub3N0aWNzIiwic2hvd0NhY2hlRGlhZ25vc3RpY3MiLCJ0b2dnbGVGb2N1cyIsIm9wZW5Jbml0aWFsaXplRGlhbG9nIiwib3BlbkNsb25lRGlhbG9nIiwib3Blbklzc3VlaXNoRGlhbG9nIiwib3BlbkNvbW1pdERpYWxvZyIsIm9wZW5DcmVhdGVEaWFsb2ciLCJ2aWV3VW5zdGFnZWRDaGFuZ2VzRm9yQ3VycmVudEZpbGUiLCJ2aWV3U3RhZ2VkQ2hhbmdlc0ZvckN1cnJlbnRGaWxlIiwiZGVzdHJveUZpbGVQYXRjaFBhbmVJdGVtcyIsImRlc3Ryb3lFbXB0eUZpbGVQYXRjaFBhbmVJdGVtcyIsImZldGNoRGF0YSIsImRhdGEiLCJmaWx0ZXIiLCJpc0dpdGh1YlJlcG8iLCJpc0VtcHR5Iiwib3BlblB1Ymxpc2hEaWFsb2ciLCJzdGF0dXNCYXIiLCJzYiIsIm9uQ29uc3VtZVN0YXR1c0JhciIsInBpcGVsaW5lTWFuYWdlciIsInRvb2x0aXBzIiwiY29uZmlybSIsImxvZ2luTW9kZWwiLCJjdXJyZW50V2luZG93IiwicmVwb3J0UmVsYXlFcnJvciIsInJlc29sdXRpb25Qcm9ncmVzcyIsInJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3MiLCJ3b3JrZGlyQ29udGV4dFBvb2wiLCJnZXRDdXJyZW50V29ya0RpcnMiLCJiaW5kIiwib25EaWRDaGFuZ2VXb3JrRGlycyIsIm9uRGlkQ2hhbmdlUG9vbENvbnRleHRzIiwidXJpUGF0dGVybiIsIml0ZW1Ib2xkZXIiLCJzZXR0ZXIiLCJncmFtbWFycyIsIm9wZW5GaWxlcyIsImRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzIiwidW5kb0xhc3REaXNjYXJkIiwiY3VycmVudFdvcmtEaXIiLCJjb250ZXh0TG9ja2VkIiwiY2hhbmdlV29ya2luZ0RpcmVjdG9yeSIsInNldENvbnRleHRMb2NrIiwiQ2hhbmdlZEZpbGVJdGVtIiwicGFyYW1zIiwicGF0aCIsInJlbFBhdGgiLCJ3b3JraW5nRGlyZWN0b3J5Iiwia2V5bWFwcyIsImRpc2NhcmRMaW5lcyIsInN1cmZhY2VGcm9tRmlsZUF0UGF0aCIsInN1cmZhY2VUb0NvbW1pdFByZXZpZXdCdXR0b24iLCJDb21taXREZXRhaWxJdGVtIiwic2hhIiwic3VyZmFjZVRvUmVjZW50Q29tbWl0IiwiSXNzdWVpc2hEZXRhaWxJdGVtIiwiZGVzZXJpYWxpemVkIiwiaG9zdCIsIm93bmVyIiwicmVwbyIsInBhcnNlSW50IiwiaXNzdWVpc2hOdW1iZXIiLCJpbml0U2VsZWN0ZWRUYWIiLCJSZXZpZXdzSXRlbSIsIm51bWJlciIsIkdpdFRpbWluZ3NWaWV3IiwiR2l0Q2FjaGVWaWV3Iiwic3RhcnRPcGVuIiwiZW5zdXJlUmVuZGVyZWQiLCJzdGFydFJldmVhbGVkIiwiZG9ja3MiLCJTZXQiLCJwYW5lQ29udGFpbmVyRm9yVVJJIiwiY29udGFpbmVyIiwic2hvdyIsImRvY2siLCJkZXZUb29sc05hbWUiLCJkZXZUb29scyIsInJlcXVpcmUiLCJpbnN0YWxsRXh0ZW5zaW9uIiwiUkVBQ1RfREVWRUxPUEVSX1RPT0xTIiwiaWQiLCJhZGRTdWNjZXNzIiwiY3Jvc3NVbnppcE5hbWUiLCJ1bnppcCIsImV4dGVuc2lvbkZvbGRlciIsInJlbW90ZSIsImFwcCIsImV4dGVuc2lvbkZpbGUiLCJmcyIsImVuc3VyZURpciIsImRpcm5hbWUiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiYm9keSIsIkJ1ZmZlciIsImZyb20iLCJhcnJheUJ1ZmZlciIsIndyaXRlRmlsZSIsImV4aXN0cyIsImRlZmF1bHQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImRpc3Bvc2UiLCJjb21wb25lbnREaWRVcGRhdGUiLCJkaXNhYmxlR2l0SW5mb1RpbGUiLCJyZW1vdmVUb2tlbiIsIm9wZW4iLCJvbmx5U3RhZ2VkIiwicXVpZXRseVNlbGVjdEl0ZW0iLCJ2aWV3Q2hhbmdlc0ZvckN1cnJlbnRGaWxlIiwiZWRpdG9yIiwiYWJzRmlsZVBhdGgiLCJyZWFscGF0aCIsInJlcG9QYXRoIiwibm90aWZpY2F0aW9uIiwiYWRkSW5mbyIsImJ1dHRvbnMiLCJjbGFzc05hbWUiLCJ0ZXh0Iiwib25EaWRDbGljayIsImRpc21pc3MiLCJjcmVhdGVkUGF0aCIsImluaXRpYWxpemVSZXBvIiwic2xpY2UiLCJsZW5ndGgiLCJzcGxpdERpcmVjdGlvbiIsInBhbmUiLCJnZXRBY3RpdmVQYW5lIiwic3BsaXRSaWdodCIsInNwbGl0RG93biIsImxpbmVOdW0iLCJnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiIsInJvdyIsIml0ZW0iLCJwZW5kaW5nIiwiYWN0aXZhdGVQYW5lIiwiYWN0aXZhdGVJdGVtIiwiZ2V0UmVhbEl0ZW1Qcm9taXNlIiwiZ2V0RmlsZVBhdGNoTG9hZGVkUHJvbWlzZSIsImdvVG9EaWZmTGluZSIsImZvY3VzIiwiRXJyb3IiLCJmaWxlUGF0aHMiLCJhYnNvbHV0ZVBhdGgiLCJnZXRVbnNhdmVkRmlsZXMiLCJ3b3JrZGlyUGF0aCIsImlzTW9kaWZpZWRCeVBhdGgiLCJNYXAiLCJnZXRUZXh0RWRpdG9ycyIsImZvckVhY2giLCJzZXQiLCJpc01vZGlmaWVkIiwiZW5zdXJlTm9VbnNhdmVkRmlsZXMiLCJ1bnNhdmVkRmlsZXMiLCJkZXN0cnVjdGl2ZUFjdGlvbiIsInN0b3JlQmVmb3JlQW5kQWZ0ZXJCbG9icyIsIm11bHRpRmlsZVBhdGNoIiwibGluZXMiLCJnZXRGaWxlUGF0Y2hlcyIsImRpc2NhcmRGaWxlUGF0Y2giLCJnZXRVbnN0YWdlUGF0Y2hGb3JMaW5lcyIsImFwcGx5UGF0Y2hUb1dvcmtkaXIiLCJnZXRGaWxlUGF0aHNGb3JMYXN0RGlzY2FyZCIsInBhcnRpYWxEaXNjYXJkRmlsZVBhdGgiLCJsYXN0U25hcHNob3RzIiwiZ2V0TGFzdEhpc3RvcnlTbmFwc2hvdHMiLCJzbmFwc2hvdCIsInJlc3VsdHMiLCJyZXN0b3JlTGFzdERpc2NhcmRJblRlbXBGaWxlcyIsInByb2NlZWRPclByb21wdEJhc2VkT25SZXN1bHRzIiwiR2l0RXJyb3IiLCJzdGRFcnIiLCJtYXRjaCIsImNsZWFuVXBIaXN0b3J5Rm9yRmlsZVBhdGhzIiwiY29uc29sZSIsImVycm9yIiwiY29uZmxpY3RzIiwiY29uZmxpY3QiLCJwcm9jZWVkV2l0aExhc3REaXNjYXJkVW5kbyIsInByb21wdEFib3V0Q29uZmxpY3RzIiwiY29uZmxpY3RlZEZpbGVzIiwiY2hvaWNlIiwiZGV0YWlsZWRNZXNzYWdlIiwib3BlbkNvbmZsaWN0c0luTmV3RWRpdG9ycyIsInJlc3VsdFBhdGgiLCJjbGVhckRpc2NhcmRIaXN0b3J5IiwiZmlsZVBhdGhzU3RyIiwicHJvbWlzZXMiLCJkZWxldGVkIiwidGhlaXJzU2hhIiwiY29tbW9uQmFzZVNoYSIsImN1cnJlbnRTaGEiLCJyZW1vdmUiLCJjb3B5Iiwid3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleCIsInBvcERpc2NhcmRIaXN0b3J5IiwicmVzdWx0UGF0aHMiLCJlZGl0b3JQcm9taXNlcyIsImZ1bGxQYXRoIiwicmVhZFN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJlbmNvZGluZyIsIkNvbmZsaWN0IiwiY291bnRGcm9tU3RyZWFtIiwidGhlbiIsImNvdW50IiwicmVwb3J0TWFya2VyQ291bnQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZGVzZXJpYWxpemVycyIsImZ1bmMiLCJXb3JrZGlyQ29udGV4dFBvb2xQcm9wVHlwZSIsInN3aXRjaGJvYXJkIiwiaW5zdGFuY2VPZiIsIlN3aXRjaGJvYXJkIiwic3RyaW5nIiwiYm9vbCIsIm5hbWUiLCJmb2N1c1RvUmVzdG9yZSIsImRvY3VtZW50IiwiYWN0aXZlRWxlbWVudCIsInNob3VsZFJlc3RvcmVGb2N1cyIsIndhc1JlbmRlcmVkIiwiaXNSZW5kZXJlZCIsIndhc1Zpc2libGUiLCJpc1Zpc2libGUiLCJyZXZlYWwiLCJoaWRlIiwicHJvY2VzcyIsIm5leHRUaWNrIiwiaGFkRm9jdXMiLCJoYXNGb2N1cyIsImdldENlbnRlciIsImFjdGl2YXRlIiwic2VhcmNoQWxsUGFuZXMiLCJyZXN0b3JlRm9jdXMiLCJnZXRJdGVtIiwicGFuZUZvclVSSSIsInBhbmVJdGVtIiwiaXRlbUZvclVSSSIsImdldFJlYWxJdGVtIiwiZ2V0RE9NRWxlbWVudCIsImdldEVsZW1lbnQiLCJnZXRQYW5lQ29udGFpbmVycyIsInNvbWUiLCJn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VUFBTWlCLElBQUksR0FBRyxLQUFLUCxhQUFMLEVBQWI7QUFDQSxXQUFPTyxJQUFJLElBQUlBLElBQUksQ0FBQ0MsUUFBTCxDQUFjOUIsUUFBUSxDQUFDQyxhQUF2QixDQUFmO0FBQ0Q7O0FBbEljIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtyZW1vdGV9IGZyb20gJ2VsZWN0cm9uJztcblxuaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgeXViaWtpcmkgZnJvbSAneXViaWtpcmknO1xuXG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4uL2F0b20vc3RhdHVzLWJhcic7XG5pbXBvcnQgUGFuZUl0ZW0gZnJvbSAnLi4vYXRvbS9wYW5lLWl0ZW0nO1xuaW1wb3J0IHtvcGVuSXNzdWVpc2hJdGVtfSBmcm9tICcuLi92aWV3cy9vcGVuLWlzc3VlaXNoLWRpYWxvZyc7XG5pbXBvcnQge29wZW5Db21taXREZXRhaWxJdGVtfSBmcm9tICcuLi92aWV3cy9vcGVuLWNvbW1pdC1kaWFsb2cnO1xuaW1wb3J0IHtjcmVhdGVSZXBvc2l0b3J5LCBwdWJsaXNoUmVwb3NpdG9yeX0gZnJvbSAnLi4vdmlld3MvY3JlYXRlLWRpYWxvZyc7XG5pbXBvcnQgT2JzZXJ2ZU1vZGVsIGZyb20gJy4uL3ZpZXdzL29ic2VydmUtbW9kZWwnO1xuaW1wb3J0IENvbW1hbmRzLCB7Q29tbWFuZH0gZnJvbSAnLi4vYXRvbS9jb21tYW5kcyc7XG5pbXBvcnQgQ2hhbmdlZEZpbGVJdGVtIGZyb20gJy4uL2l0ZW1zL2NoYW5nZWQtZmlsZS1pdGVtJztcbmltcG9ydCBJc3N1ZWlzaERldGFpbEl0ZW0gZnJvbSAnLi4vaXRlbXMvaXNzdWVpc2gtZGV0YWlsLWl0ZW0nO1xuaW1wb3J0IENvbW1pdERldGFpbEl0ZW0gZnJvbSAnLi4vaXRlbXMvY29tbWl0LWRldGFpbC1pdGVtJztcbmltcG9ydCBDb21taXRQcmV2aWV3SXRlbSBmcm9tICcuLi9pdGVtcy9jb21taXQtcHJldmlldy1pdGVtJztcbmltcG9ydCBHaXRUYWJJdGVtIGZyb20gJy4uL2l0ZW1zL2dpdC10YWItaXRlbSc7XG5pbXBvcnQgR2l0SHViVGFiSXRlbSBmcm9tICcuLi9pdGVtcy9naXRodWItdGFiLWl0ZW0nO1xuaW1wb3J0IFJldmlld3NJdGVtIGZyb20gJy4uL2l0ZW1zL3Jldmlld3MtaXRlbSc7XG5pbXBvcnQgQ29tbWVudERlY29yYXRpb25zQ29udGFpbmVyIGZyb20gJy4uL2NvbnRhaW5lcnMvY29tbWVudC1kZWNvcmF0aW9ucy1jb250YWluZXInO1xuaW1wb3J0IERpYWxvZ3NDb250cm9sbGVyLCB7ZGlhbG9nUmVxdWVzdHN9IGZyb20gJy4vZGlhbG9ncy1jb250cm9sbGVyJztcbmltcG9ydCBTdGF0dXNCYXJUaWxlQ29udHJvbGxlciBmcm9tICcuL3N0YXR1cy1iYXItdGlsZS1jb250cm9sbGVyJztcbmltcG9ydCBSZXBvc2l0b3J5Q29uZmxpY3RDb250cm9sbGVyIGZyb20gJy4vcmVwb3NpdG9yeS1jb25mbGljdC1jb250cm9sbGVyJztcbmltcG9ydCBSZWxheU5ldHdvcmtMYXllck1hbmFnZXIgZnJvbSAnLi4vcmVsYXktbmV0d29yay1sYXllci1tYW5hZ2VyJztcbmltcG9ydCBHaXRDYWNoZVZpZXcgZnJvbSAnLi4vdmlld3MvZ2l0LWNhY2hlLXZpZXcnO1xuaW1wb3J0IEdpdFRpbWluZ3NWaWV3IGZyb20gJy4uL3ZpZXdzL2dpdC10aW1pbmdzLXZpZXcnO1xuaW1wb3J0IENvbmZsaWN0IGZyb20gJy4uL21vZGVscy9jb25mbGljdHMvY29uZmxpY3QnO1xuaW1wb3J0IHtnZXRFbmRwb2ludH0gZnJvbSAnLi4vbW9kZWxzL2VuZHBvaW50JztcbmltcG9ydCBTd2l0Y2hib2FyZCBmcm9tICcuLi9zd2l0Y2hib2FyZCc7XG5pbXBvcnQge1dvcmtkaXJDb250ZXh0UG9vbFByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCB7ZGVzdHJveUZpbGVQYXRjaFBhbmVJdGVtcywgZGVzdHJveUVtcHR5RmlsZVBhdGNoUGFuZUl0ZW1zLCBhdXRvYmluZH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQge0dpdEVycm9yfSBmcm9tICcuLi9naXQtc2hlbGwtb3V0LXN0cmF0ZWd5JztcbmltcG9ydCB7aW5jcmVtZW50Q291bnRlciwgYWRkRXZlbnR9IGZyb20gJy4uL3JlcG9ydGVyLXByb3h5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vdENvbnRyb2xsZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8vIEF0b20gZW52aW9ybm1lbnRcbiAgICB3b3Jrc3BhY2U6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb21tYW5kczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGRlc2VyaWFsaXplcnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBub3RpZmljYXRpb25NYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG9vbHRpcHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBrZXltYXBzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgZ3JhbW1hcnM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBwcm9qZWN0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29uZmlybTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjdXJyZW50V2luZG93OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAvLyBNb2RlbHNcbiAgICBsb2dpbk1vZGVsOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgd29ya2RpckNvbnRleHRQb29sOiBXb3JrZGlyQ29udGV4dFBvb2xQcm9wVHlwZS5pc1JlcXVpcmVkLFxuICAgIHJlcG9zaXRvcnk6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICByZXNvbHV0aW9uUHJvZ3Jlc3M6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBzdGF0dXNCYXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgc3dpdGNoYm9hcmQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFN3aXRjaGJvYXJkKSxcbiAgICBwaXBlbGluZU1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICBjdXJyZW50V29ya0RpcjogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgIC8vIEdpdCBhY3Rpb25zXG4gICAgaW5pdGlhbGl6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjbG9uZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBjb250ZXh0TG9ja2VkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2V0Q29udGV4dExvY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc3RhcnRPcGVuOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzdGFydFJldmVhbGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgfVxuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgc3dpdGNoYm9hcmQ6IG5ldyBTd2l0Y2hib2FyZCgpLFxuICAgIHN0YXJ0T3BlbjogZmFsc2UsXG4gICAgc3RhcnRSZXZlYWxlZDogZmFsc2UsXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICBhdXRvYmluZChcbiAgICAgIHRoaXMsXG4gICAgICAnaW5zdGFsbFJlYWN0RGV2VG9vbHMnLCAnY2xlYXJHaXRodWJUb2tlbicsXG4gICAgICAnc2hvd1dhdGVyZmFsbERpYWdub3N0aWNzJywgJ3Nob3dDYWNoZURpYWdub3N0aWNzJyxcbiAgICAgICdkZXN0cm95RmlsZVBhdGNoUGFuZUl0ZW1zJywgJ2Rlc3Ryb3lFbXB0eUZpbGVQYXRjaFBhbmVJdGVtcycsXG4gICAgICAncXVpZXRseVNlbGVjdEl0ZW0nLCAndmlld1Vuc3RhZ2VkQ2hhbmdlc0ZvckN1cnJlbnRGaWxlJyxcbiAgICAgICd2aWV3U3RhZ2VkQ2hhbmdlc0ZvckN1cnJlbnRGaWxlJywgJ29wZW5GaWxlcycsICdnZXRVbnNhdmVkRmlsZXMnLCAnZW5zdXJlTm9VbnNhdmVkRmlsZXMnLFxuICAgICAgJ2Rpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzJywgJ2Rpc2NhcmRMaW5lcycsICd1bmRvTGFzdERpc2NhcmQnLCAncmVmcmVzaFJlc29sdXRpb25Qcm9ncmVzcycsXG4gICAgKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBkaWFsb2dSZXF1ZXN0OiBkaWFsb2dSZXF1ZXN0cy5udWxsLFxuICAgIH07XG5cbiAgICB0aGlzLmdpdFRhYlRyYWNrZXIgPSBuZXcgVGFiVHJhY2tlcignZ2l0Jywge1xuICAgICAgdXJpOiBHaXRUYWJJdGVtLmJ1aWxkVVJJKCksXG4gICAgICBnZXRXb3Jrc3BhY2U6ICgpID0+IHRoaXMucHJvcHMud29ya3NwYWNlLFxuICAgIH0pO1xuXG4gICAgdGhpcy5naXRodWJUYWJUcmFja2VyID0gbmV3IFRhYlRyYWNrZXIoJ2dpdGh1YicsIHtcbiAgICAgIHVyaTogR2l0SHViVGFiSXRlbS5idWlsZFVSSSgpLFxuICAgICAgZ2V0V29ya3NwYWNlOiAoKSA9PiB0aGlzLnByb3BzLndvcmtzcGFjZSxcbiAgICB9KTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLnByb3BzLnJlcG9zaXRvcnkub25QdWxsRXJyb3IodGhpcy5naXRUYWJUcmFja2VyLmVuc3VyZVZpc2libGUpLFxuICAgICk7XG5cbiAgICB0aGlzLnByb3BzLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgJiYgZXZlbnQudHlwZS5zdGFydHNXaXRoKCdnaXRodWI6JylcbiAgICAgICAgJiYgZXZlbnQuZGV0YWlsICYmIGV2ZW50LmRldGFpbFswXSAmJiBldmVudC5kZXRhaWxbMF0uY29udGV4dENvbW1hbmQpIHtcbiAgICAgICAgYWRkRXZlbnQoJ2NvbnRleHQtbWVudS1hY3Rpb24nLCB7XG4gICAgICAgICAgcGFja2FnZTogJ2dpdGh1YicsXG4gICAgICAgICAgY29tbWFuZDogZXZlbnQudHlwZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLm9wZW5UYWJzKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAge3RoaXMucmVuZGVyQ29tbWFuZHMoKX1cbiAgICAgICAge3RoaXMucmVuZGVyU3RhdHVzQmFyVGlsZSgpfVxuICAgICAgICB7dGhpcy5yZW5kZXJQYW5lSXRlbXMoKX1cbiAgICAgICAge3RoaXMucmVuZGVyRGlhbG9ncygpfVxuICAgICAgICB7dGhpcy5yZW5kZXJDb25mbGljdFJlc29sdmVyKCl9XG4gICAgICAgIHt0aGlzLnJlbmRlckNvbW1lbnREZWNvcmF0aW9ucygpfVxuICAgICAgPC9GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQ29tbWFuZHMoKSB7XG4gICAgY29uc3QgZGV2TW9kZSA9IGdsb2JhbC5hdG9tICYmIGdsb2JhbC5hdG9tLmluRGV2TW9kZSgpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9XCJhdG9tLXdvcmtzcGFjZVwiPlxuICAgICAgICAgIHtkZXZNb2RlICYmIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6aW5zdGFsbC1yZWFjdC1kZXYtdG9vbHNcIiBjYWxsYmFjaz17dGhpcy5pbnN0YWxsUmVhY3REZXZUb29sc30gLz59XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp0b2dnbGUtY29tbWl0LXByZXZpZXdcIiBjYWxsYmFjaz17dGhpcy50b2dnbGVDb21taXRQcmV2aWV3SXRlbX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmxvZ291dFwiIGNhbGxiYWNrPXt0aGlzLmNsZWFyR2l0aHViVG9rZW59IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpzaG93LXdhdGVyZmFsbC1kaWFnbm9zdGljc1wiIGNhbGxiYWNrPXt0aGlzLnNob3dXYXRlcmZhbGxEaWFnbm9zdGljc30gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNob3ctY2FjaGUtZGlhZ25vc3RpY3NcIiBjYWxsYmFjaz17dGhpcy5zaG93Q2FjaGVEaWFnbm9zdGljc30gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnRvZ2dsZS1naXQtdGFiXCIgY2FsbGJhY2s9e3RoaXMuZ2l0VGFiVHJhY2tlci50b2dnbGV9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp0b2dnbGUtZ2l0LXRhYi1mb2N1c1wiIGNhbGxiYWNrPXt0aGlzLmdpdFRhYlRyYWNrZXIudG9nZ2xlRm9jdXN9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp0b2dnbGUtZ2l0aHViLXRhYlwiIGNhbGxiYWNrPXt0aGlzLmdpdGh1YlRhYlRyYWNrZXIudG9nZ2xlfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6dG9nZ2xlLWdpdGh1Yi10YWItZm9jdXNcIiBjYWxsYmFjaz17dGhpcy5naXRodWJUYWJUcmFja2VyLnRvZ2dsZUZvY3VzfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6aW5pdGlhbGl6ZVwiIGNhbGxiYWNrPXsoKSA9PiB0aGlzLm9wZW5Jbml0aWFsaXplRGlhbG9nKCl9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpjbG9uZVwiIGNhbGxiYWNrPXsoKSA9PiB0aGlzLm9wZW5DbG9uZURpYWxvZygpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6b3Blbi1pc3N1ZS1vci1wdWxsLXJlcXVlc3RcIiBjYWxsYmFjaz17KCkgPT4gdGhpcy5vcGVuSXNzdWVpc2hEaWFsb2coKX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOm9wZW4tY29tbWl0XCIgY2FsbGJhY2s9eygpID0+IHRoaXMub3BlbkNvbW1pdERpYWxvZygpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6Y3JlYXRlLXJlcG9zaXRvcnlcIiBjYWxsYmFjaz17KCkgPT4gdGhpcy5vcGVuQ3JlYXRlRGlhbG9nKCl9IC8+XG4gICAgICAgICAgPENvbW1hbmRcbiAgICAgICAgICAgIGNvbW1hbmQ9XCJnaXRodWI6dmlldy11bnN0YWdlZC1jaGFuZ2VzLWZvci1jdXJyZW50LWZpbGVcIlxuICAgICAgICAgICAgY2FsbGJhY2s9e3RoaXMudmlld1Vuc3RhZ2VkQ2hhbmdlc0ZvckN1cnJlbnRGaWxlfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPENvbW1hbmRcbiAgICAgICAgICAgIGNvbW1hbmQ9XCJnaXRodWI6dmlldy1zdGFnZWQtY2hhbmdlcy1mb3ItY3VycmVudC1maWxlXCJcbiAgICAgICAgICAgIGNhbGxiYWNrPXt0aGlzLnZpZXdTdGFnZWRDaGFuZ2VzRm9yQ3VycmVudEZpbGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Q29tbWFuZFxuICAgICAgICAgICAgY29tbWFuZD1cImdpdGh1YjpjbG9zZS1hbGwtZGlmZi12aWV3c1wiXG4gICAgICAgICAgICBjYWxsYmFjaz17dGhpcy5kZXN0cm95RmlsZVBhdGNoUGFuZUl0ZW1zfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPENvbW1hbmRcbiAgICAgICAgICAgIGNvbW1hbmQ9XCJnaXRodWI6Y2xvc2UtZW1wdHktZGlmZi12aWV3c1wiXG4gICAgICAgICAgICBjYWxsYmFjaz17dGhpcy5kZXN0cm95RW1wdHlGaWxlUGF0Y2hQYW5lSXRlbXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Db21tYW5kcz5cbiAgICAgICAgPE9ic2VydmVNb2RlbCBtb2RlbD17dGhpcy5wcm9wcy5yZXBvc2l0b3J5fSBmZXRjaERhdGE9e3RoaXMuZmV0Y2hEYXRhfT5cbiAgICAgICAgICB7ZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoIWRhdGEgfHwgIWRhdGEuaXNQdWJsaXNoYWJsZSB8fCAhZGF0YS5yZW1vdGVzLmZpbHRlcihyID0+IHIuaXNHaXRodWJSZXBvKCkpLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9XCJhdG9tLXdvcmtzcGFjZVwiPlxuICAgICAgICAgICAgICAgIDxDb21tYW5kXG4gICAgICAgICAgICAgICAgICBjb21tYW5kPVwiZ2l0aHViOnB1Ymxpc2gtcmVwb3NpdG9yeVwiXG4gICAgICAgICAgICAgICAgICBjYWxsYmFjaz17KCkgPT4gdGhpcy5vcGVuUHVibGlzaERpYWxvZyh0aGlzLnByb3BzLnJlcG9zaXRvcnkpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvQ29tbWFuZHM+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH19XG4gICAgICAgIDwvT2JzZXJ2ZU1vZGVsPlxuICAgICAgPC9GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyU3RhdHVzQmFyVGlsZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFN0YXR1c0JhclxuICAgICAgICBzdGF0dXNCYXI9e3RoaXMucHJvcHMuc3RhdHVzQmFyfVxuICAgICAgICBvbkNvbnN1bWVTdGF0dXNCYXI9e3NiID0+IHRoaXMub25Db25zdW1lU3RhdHVzQmFyKHNiKX1cbiAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLVN0YXR1c0JhclRpbGVDb250cm9sbGVyXCI+XG4gICAgICAgIDxTdGF0dXNCYXJUaWxlQ29udHJvbGxlclxuICAgICAgICAgIHBpcGVsaW5lTWFuYWdlcj17dGhpcy5wcm9wcy5waXBlbGluZU1hbmFnZXJ9XG4gICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICByZXBvc2l0b3J5PXt0aGlzLnByb3BzLnJlcG9zaXRvcnl9XG4gICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgbm90aWZpY2F0aW9uTWFuYWdlcj17dGhpcy5wcm9wcy5ub3RpZmljYXRpb25NYW5hZ2VyfVxuICAgICAgICAgIHRvb2x0aXBzPXt0aGlzLnByb3BzLnRvb2x0aXBzfVxuICAgICAgICAgIGNvbmZpcm09e3RoaXMucHJvcHMuY29uZmlybX1cbiAgICAgICAgICB0b2dnbGVHaXRUYWI9e3RoaXMuZ2l0VGFiVHJhY2tlci50b2dnbGV9XG4gICAgICAgICAgdG9nZ2xlR2l0aHViVGFiPXt0aGlzLmdpdGh1YlRhYlRyYWNrZXIudG9nZ2xlfVxuICAgICAgICAvPlxuICAgICAgPC9TdGF0dXNCYXI+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckRpYWxvZ3MoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxEaWFsb2dzQ29udHJvbGxlclxuICAgICAgICBsb2dpbk1vZGVsPXt0aGlzLnByb3BzLmxvZ2luTW9kZWx9XG4gICAgICAgIHJlcXVlc3Q9e3RoaXMuc3RhdGUuZGlhbG9nUmVxdWVzdH1cblxuICAgICAgICBjdXJyZW50V2luZG93PXt0aGlzLnByb3BzLmN1cnJlbnRXaW5kb3d9XG4gICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICBjb25maWc9e3RoaXMucHJvcHMuY29uZmlnfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyQ29tbWVudERlY29yYXRpb25zKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5yZXBvc2l0b3J5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxDb21tZW50RGVjb3JhdGlvbnNDb250YWluZXJcbiAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgIGxvY2FsUmVwb3NpdG9yeT17dGhpcy5wcm9wcy5yZXBvc2l0b3J5fVxuICAgICAgICBsb2dpbk1vZGVsPXt0aGlzLnByb3BzLmxvZ2luTW9kZWx9XG4gICAgICAgIHJlcG9ydFJlbGF5RXJyb3I9e3RoaXMucmVwb3J0UmVsYXlFcnJvcn1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbmZsaWN0UmVzb2x2ZXIoKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnJlcG9zaXRvcnkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8UmVwb3NpdG9yeUNvbmZsaWN0Q29udHJvbGxlclxuICAgICAgICB3b3Jrc3BhY2U9e3RoaXMucHJvcHMud29ya3NwYWNlfVxuICAgICAgICBjb25maWc9e3RoaXMucHJvcHMuY29uZmlnfVxuICAgICAgICByZXBvc2l0b3J5PXt0aGlzLnByb3BzLnJlcG9zaXRvcnl9XG4gICAgICAgIHJlc29sdXRpb25Qcm9ncmVzcz17dGhpcy5wcm9wcy5yZXNvbHV0aW9uUHJvZ3Jlc3N9XG4gICAgICAgIHJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3M9e3RoaXMucmVmcmVzaFJlc29sdXRpb25Qcm9ncmVzc31cbiAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJQYW5lSXRlbXMoKSB7XG4gICAgY29uc3Qge3dvcmtkaXJDb250ZXh0UG9vbH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGdldEN1cnJlbnRXb3JrRGlycyA9IHdvcmtkaXJDb250ZXh0UG9vbC5nZXRDdXJyZW50V29ya0RpcnMuYmluZCh3b3JrZGlyQ29udGV4dFBvb2wpO1xuICAgIGNvbnN0IG9uRGlkQ2hhbmdlV29ya0RpcnMgPSB3b3JrZGlyQ29udGV4dFBvb2wub25EaWRDaGFuZ2VQb29sQ29udGV4dHMuYmluZCh3b3JrZGlyQ29udGV4dFBvb2wpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgPFBhbmVJdGVtXG4gICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICB1cmlQYXR0ZXJuPXtHaXRUYWJJdGVtLnVyaVBhdHRlcm59XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLUdpdC1yb290XCI+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlcn0pID0+IChcbiAgICAgICAgICAgIDxHaXRUYWJJdGVtXG4gICAgICAgICAgICAgIHJlZj17aXRlbUhvbGRlci5zZXR0ZXJ9XG4gICAgICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICAgICAgICBub3RpZmljYXRpb25NYW5hZ2VyPXt0aGlzLnByb3BzLm5vdGlmaWNhdGlvbk1hbmFnZXJ9XG4gICAgICAgICAgICAgIHRvb2x0aXBzPXt0aGlzLnByb3BzLnRvb2x0aXBzfVxuICAgICAgICAgICAgICBncmFtbWFycz17dGhpcy5wcm9wcy5ncmFtbWFyc31cbiAgICAgICAgICAgICAgcHJvamVjdD17dGhpcy5wcm9wcy5wcm9qZWN0fVxuICAgICAgICAgICAgICBjb25maXJtPXt0aGlzLnByb3BzLmNvbmZpcm19XG4gICAgICAgICAgICAgIGNvbmZpZz17dGhpcy5wcm9wcy5jb25maWd9XG4gICAgICAgICAgICAgIHJlcG9zaXRvcnk9e3RoaXMucHJvcHMucmVwb3NpdG9yeX1cbiAgICAgICAgICAgICAgbG9naW5Nb2RlbD17dGhpcy5wcm9wcy5sb2dpbk1vZGVsfVxuICAgICAgICAgICAgICBvcGVuSW5pdGlhbGl6ZURpYWxvZz17dGhpcy5vcGVuSW5pdGlhbGl6ZURpYWxvZ31cbiAgICAgICAgICAgICAgcmVzb2x1dGlvblByb2dyZXNzPXt0aGlzLnByb3BzLnJlc29sdXRpb25Qcm9ncmVzc31cbiAgICAgICAgICAgICAgZW5zdXJlR2l0VGFiPXt0aGlzLmdpdFRhYlRyYWNrZXIuZW5zdXJlVmlzaWJsZX1cbiAgICAgICAgICAgICAgb3BlbkZpbGVzPXt0aGlzLm9wZW5GaWxlc31cbiAgICAgICAgICAgICAgZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHM9e3RoaXMuZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHN9XG4gICAgICAgICAgICAgIHVuZG9MYXN0RGlzY2FyZD17dGhpcy51bmRvTGFzdERpc2NhcmR9XG4gICAgICAgICAgICAgIHJlZnJlc2hSZXNvbHV0aW9uUHJvZ3Jlc3M9e3RoaXMucmVmcmVzaFJlc29sdXRpb25Qcm9ncmVzc31cbiAgICAgICAgICAgICAgY3VycmVudFdvcmtEaXI9e3RoaXMucHJvcHMuY3VycmVudFdvcmtEaXJ9XG4gICAgICAgICAgICAgIGdldEN1cnJlbnRXb3JrRGlycz17Z2V0Q3VycmVudFdvcmtEaXJzfVxuICAgICAgICAgICAgICBvbkRpZENoYW5nZVdvcmtEaXJzPXtvbkRpZENoYW5nZVdvcmtEaXJzfVxuICAgICAgICAgICAgICBjb250ZXh0TG9ja2VkPXt0aGlzLnByb3BzLmNvbnRleHRMb2NrZWR9XG4gICAgICAgICAgICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk9e3RoaXMucHJvcHMuY2hhbmdlV29ya2luZ0RpcmVjdG9yeX1cbiAgICAgICAgICAgICAgc2V0Q29udGV4dExvY2s9e3RoaXMucHJvcHMuc2V0Q29udGV4dExvY2t9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvUGFuZUl0ZW0+XG4gICAgICAgIDxQYW5lSXRlbVxuICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgdXJpUGF0dGVybj17R2l0SHViVGFiSXRlbS51cmlQYXR0ZXJufVxuICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1HaXRIdWItcm9vdFwiPlxuICAgICAgICAgIHsoe2l0ZW1Ib2xkZXJ9KSA9PiAoXG4gICAgICAgICAgICA8R2l0SHViVGFiSXRlbVxuICAgICAgICAgICAgICByZWY9e2l0ZW1Ib2xkZXIuc2V0dGVyfVxuICAgICAgICAgICAgICByZXBvc2l0b3J5PXt0aGlzLnByb3BzLnJlcG9zaXRvcnl9XG4gICAgICAgICAgICAgIGxvZ2luTW9kZWw9e3RoaXMucHJvcHMubG9naW5Nb2RlbH1cbiAgICAgICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICAgICAgY3VycmVudFdvcmtEaXI9e3RoaXMucHJvcHMuY3VycmVudFdvcmtEaXJ9XG4gICAgICAgICAgICAgIGdldEN1cnJlbnRXb3JrRGlycz17Z2V0Q3VycmVudFdvcmtEaXJzfVxuICAgICAgICAgICAgICBvbkRpZENoYW5nZVdvcmtEaXJzPXtvbkRpZENoYW5nZVdvcmtEaXJzfVxuICAgICAgICAgICAgICBjb250ZXh0TG9ja2VkPXt0aGlzLnByb3BzLmNvbnRleHRMb2NrZWR9XG4gICAgICAgICAgICAgIGNoYW5nZVdvcmtpbmdEaXJlY3Rvcnk9e3RoaXMucHJvcHMuY2hhbmdlV29ya2luZ0RpcmVjdG9yeX1cbiAgICAgICAgICAgICAgc2V0Q29udGV4dExvY2s9e3RoaXMucHJvcHMuc2V0Q29udGV4dExvY2t9XG4gICAgICAgICAgICAgIG9wZW5DcmVhdGVEaWFsb2c9e3RoaXMub3BlbkNyZWF0ZURpYWxvZ31cbiAgICAgICAgICAgICAgb3BlblB1Ymxpc2hEaWFsb2c9e3RoaXMub3BlblB1Ymxpc2hEaWFsb2d9XG4gICAgICAgICAgICAgIG9wZW5DbG9uZURpYWxvZz17dGhpcy5vcGVuQ2xvbmVEaWFsb2d9XG4gICAgICAgICAgICAgIG9wZW5HaXRUYWI9e3RoaXMuZ2l0VGFiVHJhY2tlci50b2dnbGVGb2N1c31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYW5lSXRlbT5cbiAgICAgICAgPFBhbmVJdGVtXG4gICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICB1cmlQYXR0ZXJuPXtDaGFuZ2VkRmlsZUl0ZW0udXJpUGF0dGVybn0+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlciwgcGFyYW1zfSkgPT4gKFxuICAgICAgICAgICAgPENoYW5nZWRGaWxlSXRlbVxuICAgICAgICAgICAgICByZWY9e2l0ZW1Ib2xkZXIuc2V0dGVyfVxuXG4gICAgICAgICAgICAgIHdvcmtkaXJDb250ZXh0UG9vbD17dGhpcy5wcm9wcy53b3JrZGlyQ29udGV4dFBvb2x9XG4gICAgICAgICAgICAgIHJlbFBhdGg9e3BhdGguam9pbiguLi5wYXJhbXMucmVsUGF0aCl9XG4gICAgICAgICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk9e3BhcmFtcy53b3JraW5nRGlyZWN0b3J5fVxuICAgICAgICAgICAgICBzdGFnaW5nU3RhdHVzPXtwYXJhbXMuc3RhZ2luZ1N0YXR1c31cblxuICAgICAgICAgICAgICB0b29sdGlwcz17dGhpcy5wcm9wcy50b29sdGlwc31cbiAgICAgICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgICAgIGtleW1hcHM9e3RoaXMucHJvcHMua2V5bWFwc31cbiAgICAgICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICAgICAgY29uZmlnPXt0aGlzLnByb3BzLmNvbmZpZ31cblxuICAgICAgICAgICAgICBkaXNjYXJkTGluZXM9e3RoaXMuZGlzY2FyZExpbmVzfVxuICAgICAgICAgICAgICB1bmRvTGFzdERpc2NhcmQ9e3RoaXMudW5kb0xhc3REaXNjYXJkfVxuICAgICAgICAgICAgICBzdXJmYWNlRmlsZUF0UGF0aD17dGhpcy5zdXJmYWNlRnJvbUZpbGVBdFBhdGh9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvUGFuZUl0ZW0+XG4gICAgICAgIDxQYW5lSXRlbVxuICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgdXJpUGF0dGVybj17Q29tbWl0UHJldmlld0l0ZW0udXJpUGF0dGVybn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0UHJldmlldy1yb290XCI+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlciwgcGFyYW1zfSkgPT4gKFxuICAgICAgICAgICAgPENvbW1pdFByZXZpZXdJdGVtXG4gICAgICAgICAgICAgIHJlZj17aXRlbUhvbGRlci5zZXR0ZXJ9XG5cbiAgICAgICAgICAgICAgd29ya2RpckNvbnRleHRQb29sPXt0aGlzLnByb3BzLndvcmtkaXJDb250ZXh0UG9vbH1cbiAgICAgICAgICAgICAgd29ya2luZ0RpcmVjdG9yeT17cGFyYW1zLndvcmtpbmdEaXJlY3Rvcnl9XG4gICAgICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICAgICAgICBrZXltYXBzPXt0aGlzLnByb3BzLmtleW1hcHN9XG4gICAgICAgICAgICAgIHRvb2x0aXBzPXt0aGlzLnByb3BzLnRvb2x0aXBzfVxuICAgICAgICAgICAgICBjb25maWc9e3RoaXMucHJvcHMuY29uZmlnfVxuXG4gICAgICAgICAgICAgIGRpc2NhcmRMaW5lcz17dGhpcy5kaXNjYXJkTGluZXN9XG4gICAgICAgICAgICAgIHVuZG9MYXN0RGlzY2FyZD17dGhpcy51bmRvTGFzdERpc2NhcmR9XG4gICAgICAgICAgICAgIHN1cmZhY2VUb0NvbW1pdFByZXZpZXdCdXR0b249e3RoaXMuc3VyZmFjZVRvQ29tbWl0UHJldmlld0J1dHRvbn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYW5lSXRlbT5cbiAgICAgICAgPFBhbmVJdGVtXG4gICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICB1cmlQYXR0ZXJuPXtDb21taXREZXRhaWxJdGVtLnVyaVBhdHRlcm59XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdERldGFpbC1yb290XCI+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlciwgcGFyYW1zfSkgPT4gKFxuICAgICAgICAgICAgPENvbW1pdERldGFpbEl0ZW1cbiAgICAgICAgICAgICAgcmVmPXtpdGVtSG9sZGVyLnNldHRlcn1cblxuICAgICAgICAgICAgICB3b3JrZGlyQ29udGV4dFBvb2w9e3RoaXMucHJvcHMud29ya2RpckNvbnRleHRQb29sfVxuICAgICAgICAgICAgICB3b3JraW5nRGlyZWN0b3J5PXtwYXJhbXMud29ya2luZ0RpcmVjdG9yeX1cbiAgICAgICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgICAgIGtleW1hcHM9e3RoaXMucHJvcHMua2V5bWFwc31cbiAgICAgICAgICAgICAgdG9vbHRpcHM9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICAgIGNvbmZpZz17dGhpcy5wcm9wcy5jb25maWd9XG5cbiAgICAgICAgICAgICAgc2hhPXtwYXJhbXMuc2hhfVxuICAgICAgICAgICAgICBzdXJmYWNlQ29tbWl0PXt0aGlzLnN1cmZhY2VUb1JlY2VudENvbW1pdH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYW5lSXRlbT5cbiAgICAgICAgPFBhbmVJdGVtIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9IHVyaVBhdHRlcm49e0lzc3VlaXNoRGV0YWlsSXRlbS51cmlQYXR0ZXJufT5cbiAgICAgICAgICB7KHtpdGVtSG9sZGVyLCBwYXJhbXMsIGRlc2VyaWFsaXplZH0pID0+IChcbiAgICAgICAgICAgIDxJc3N1ZWlzaERldGFpbEl0ZW1cbiAgICAgICAgICAgICAgcmVmPXtpdGVtSG9sZGVyLnNldHRlcn1cblxuICAgICAgICAgICAgICBob3N0PXtwYXJhbXMuaG9zdH1cbiAgICAgICAgICAgICAgb3duZXI9e3BhcmFtcy5vd25lcn1cbiAgICAgICAgICAgICAgcmVwbz17cGFyYW1zLnJlcG99XG4gICAgICAgICAgICAgIGlzc3VlaXNoTnVtYmVyPXtwYXJzZUludChwYXJhbXMuaXNzdWVpc2hOdW1iZXIsIDEwKX1cblxuICAgICAgICAgICAgICB3b3JraW5nRGlyZWN0b3J5PXtwYXJhbXMud29ya2luZ0RpcmVjdG9yeX1cbiAgICAgICAgICAgICAgd29ya2RpckNvbnRleHRQb29sPXt0aGlzLnByb3BzLndvcmtkaXJDb250ZXh0UG9vbH1cbiAgICAgICAgICAgICAgbG9naW5Nb2RlbD17dGhpcy5wcm9wcy5sb2dpbk1vZGVsfVxuICAgICAgICAgICAgICBpbml0U2VsZWN0ZWRUYWI9e2Rlc2VyaWFsaXplZC5pbml0U2VsZWN0ZWRUYWJ9XG5cbiAgICAgICAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cbiAgICAgICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgICAgIGtleW1hcHM9e3RoaXMucHJvcHMua2V5bWFwc31cbiAgICAgICAgICAgICAgdG9vbHRpcHM9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICAgIGNvbmZpZz17dGhpcy5wcm9wcy5jb25maWd9XG5cbiAgICAgICAgICAgICAgcmVwb3J0UmVsYXlFcnJvcj17dGhpcy5yZXBvcnRSZWxheUVycm9yfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L1BhbmVJdGVtPlxuICAgICAgICA8UGFuZUl0ZW0gd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX0gdXJpUGF0dGVybj17UmV2aWV3c0l0ZW0udXJpUGF0dGVybn0+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlciwgcGFyYW1zfSkgPT4gKFxuICAgICAgICAgICAgPFJldmlld3NJdGVtXG4gICAgICAgICAgICAgIHJlZj17aXRlbUhvbGRlci5zZXR0ZXJ9XG5cbiAgICAgICAgICAgICAgaG9zdD17cGFyYW1zLmhvc3R9XG4gICAgICAgICAgICAgIG93bmVyPXtwYXJhbXMub3duZXJ9XG4gICAgICAgICAgICAgIHJlcG89e3BhcmFtcy5yZXBvfVxuICAgICAgICAgICAgICBudW1iZXI9e3BhcnNlSW50KHBhcmFtcy5udW1iZXIsIDEwKX1cblxuICAgICAgICAgICAgICB3b3JrZGlyPXtwYXJhbXMud29ya2Rpcn1cbiAgICAgICAgICAgICAgd29ya2RpckNvbnRleHRQb29sPXt0aGlzLnByb3BzLndvcmtkaXJDb250ZXh0UG9vbH1cbiAgICAgICAgICAgICAgbG9naW5Nb2RlbD17dGhpcy5wcm9wcy5sb2dpbk1vZGVsfVxuICAgICAgICAgICAgICB3b3Jrc3BhY2U9e3RoaXMucHJvcHMud29ya3NwYWNlfVxuICAgICAgICAgICAgICB0b29sdGlwcz17dGhpcy5wcm9wcy50b29sdGlwc31cbiAgICAgICAgICAgICAgY29uZmlnPXt0aGlzLnByb3BzLmNvbmZpZ31cbiAgICAgICAgICAgICAgY29tbWFuZHM9e3RoaXMucHJvcHMuY29tbWFuZHN9XG4gICAgICAgICAgICAgIGNvbmZpcm09e3RoaXMucHJvcHMuY29uZmlybX1cbiAgICAgICAgICAgICAgcmVwb3J0UmVsYXlFcnJvcj17dGhpcy5yZXBvcnRSZWxheUVycm9yfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L1BhbmVJdGVtPlxuICAgICAgICA8UGFuZUl0ZW0gd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX0gdXJpUGF0dGVybj17R2l0VGltaW5nc1ZpZXcudXJpUGF0dGVybn0+XG4gICAgICAgICAgeyh7aXRlbUhvbGRlcn0pID0+IDxHaXRUaW1pbmdzVmlldyByZWY9e2l0ZW1Ib2xkZXIuc2V0dGVyfSAvPn1cbiAgICAgICAgPC9QYW5lSXRlbT5cbiAgICAgICAgPFBhbmVJdGVtIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9IHVyaVBhdHRlcm49e0dpdENhY2hlVmlldy51cmlQYXR0ZXJufT5cbiAgICAgICAgICB7KHtpdGVtSG9sZGVyfSkgPT4gPEdpdENhY2hlVmlldyByZWY9e2l0ZW1Ib2xkZXIuc2V0dGVyfSByZXBvc2l0b3J5PXt0aGlzLnByb3BzLnJlcG9zaXRvcnl9IC8+fVxuICAgICAgICA8L1BhbmVJdGVtPlxuICAgICAgPC9GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgZmV0Y2hEYXRhID0gcmVwb3NpdG9yeSA9PiB5dWJpa2lyaSh7XG4gICAgaXNQdWJsaXNoYWJsZTogcmVwb3NpdG9yeS5pc1B1Ymxpc2hhYmxlKCksXG4gICAgcmVtb3RlczogcmVwb3NpdG9yeS5nZXRSZW1vdGVzKCksXG4gIH0pO1xuXG4gIGFzeW5jIG9wZW5UYWJzKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnN0YXJ0T3Blbikge1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmdpdFRhYlRyYWNrZXIuZW5zdXJlUmVuZGVyZWQoZmFsc2UpLFxuICAgICAgICB0aGlzLmdpdGh1YlRhYlRyYWNrZXIuZW5zdXJlUmVuZGVyZWQoZmFsc2UpLFxuICAgICAgXSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuc3RhcnRSZXZlYWxlZCkge1xuICAgICAgY29uc3QgZG9ja3MgPSBuZXcgU2V0KFxuICAgICAgICBbR2l0VGFiSXRlbS5idWlsZFVSSSgpLCBHaXRIdWJUYWJJdGVtLmJ1aWxkVVJJKCldXG4gICAgICAgICAgLm1hcCh1cmkgPT4gdGhpcy5wcm9wcy53b3Jrc3BhY2UucGFuZUNvbnRhaW5lckZvclVSSSh1cmkpKVxuICAgICAgICAgIC5maWx0ZXIoY29udGFpbmVyID0+IGNvbnRhaW5lciAmJiAodHlwZW9mIGNvbnRhaW5lci5zaG93KSA9PT0gJ2Z1bmN0aW9uJyksXG4gICAgICApO1xuXG4gICAgICBmb3IgKGNvbnN0IGRvY2sgb2YgZG9ja3MpIHtcbiAgICAgICAgZG9jay5zaG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaW5zdGFsbFJlYWN0RGV2VG9vbHMoKSB7XG4gICAgLy8gUHJldmVudCBlbGVjdHJvbi1saW5rIGZyb20gYXR0ZW1wdGluZyB0byBkZXNjZW5kIGludG8gZWxlY3Ryb24tZGV2dG9vbHMtaW5zdGFsbGVyLCB3aGljaCBpcyBub3QgYXZhaWxhYmxlXG4gICAgLy8gd2hlbiB3ZSdyZSBidW5kbGVkIGluIEF0b20uXG4gICAgY29uc3QgZGV2VG9vbHNOYW1lID0gJ2VsZWN0cm9uLWRldnRvb2xzLWluc3RhbGxlcic7XG4gICAgY29uc3QgZGV2VG9vbHMgPSByZXF1aXJlKGRldlRvb2xzTmFtZSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmluc3RhbGxFeHRlbnNpb24oZGV2VG9vbHMuUkVBQ1RfREVWRUxPUEVSX1RPT0xTLmlkKSxcbiAgICAgIC8vIHJlbGF5IGRldmVsb3BlciB0b29scyBleHRlbnNpb24gaWRcbiAgICAgIHRoaXMuaW5zdGFsbEV4dGVuc2lvbignbmNlZG9icGdubWtoY21ubmtjaW1ub2JwZmVwaWRhZGwnKSxcbiAgICBdKTtcblxuICAgIHRoaXMucHJvcHMubm90aWZpY2F0aW9uTWFuYWdlci5hZGRTdWNjZXNzKCfwn4yIIFJlbG9hZCB5b3VyIHdpbmRvdyB0byBzdGFydCB1c2luZyB0aGUgUmVhY3QvUmVsYXkgZGV2IHRvb2xzIScpO1xuICB9XG5cbiAgYXN5bmMgaW5zdGFsbEV4dGVuc2lvbihpZCkge1xuICAgIGNvbnN0IGRldlRvb2xzTmFtZSA9ICdlbGVjdHJvbi1kZXZ0b29scy1pbnN0YWxsZXInO1xuICAgIGNvbnN0IGRldlRvb2xzID0gcmVxdWlyZShkZXZUb29sc05hbWUpO1xuXG4gICAgY29uc3QgY3Jvc3NVbnppcE5hbWUgPSAnY3Jvc3MtdW56aXAnO1xuICAgIGNvbnN0IHVuemlwID0gcmVxdWlyZShjcm9zc1VuemlwTmFtZSk7XG5cbiAgICBjb25zdCB1cmwgPVxuICAgICAgJ2h0dHBzOi8vY2xpZW50czIuZ29vZ2xlLmNvbS9zZXJ2aWNlL3VwZGF0ZTIvY3J4PycgK1xuICAgICAgYHJlc3BvbnNlPXJlZGlyZWN0Jng9aWQlM0Qke2lkfSUyNnVjJnByb2R2ZXJzaW9uPTMyYDtcbiAgICBjb25zdCBleHRlbnNpb25Gb2xkZXIgPSBwYXRoLnJlc29sdmUocmVtb3RlLmFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCBgZXh0ZW5zaW9ucy8ke2lkfWApO1xuICAgIGNvbnN0IGV4dGVuc2lvbkZpbGUgPSBgJHtleHRlbnNpb25Gb2xkZXJ9LmNyeGA7XG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyKHBhdGguZGlybmFtZShleHRlbnNpb25GaWxlKSk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttZXRob2Q6ICdHRVQnfSk7XG4gICAgY29uc3QgYm9keSA9IEJ1ZmZlci5mcm9tKGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShleHRlbnNpb25GaWxlLCBib2R5KTtcblxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHVuemlwKGV4dGVuc2lvbkZpbGUsIGV4dGVuc2lvbkZvbGRlciwgYXN5bmMgZXJyID0+IHtcbiAgICAgICAgaWYgKGVyciAmJiAhYXdhaXQgZnMuZXhpc3RzKHBhdGguam9pbihleHRlbnNpb25Gb2xkZXIsICdtYW5pZmVzdC5qc29uJykpKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGF3YWl0IGZzLmVuc3VyZURpcihleHRlbnNpb25Gb2xkZXIsIDBvNzU1KTtcbiAgICBhd2FpdCBkZXZUb29scy5kZWZhdWx0KGlkKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMucHJvcHMucmVwb3NpdG9yeS5vblB1bGxFcnJvcigoKSA9PiB0aGlzLmdpdFRhYlRyYWNrZXIuZW5zdXJlVmlzaWJsZSgpKSxcbiAgICApO1xuICB9XG5cbiAgb25Db25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcikge1xuICAgIGlmIChzdGF0dXNCYXIuZGlzYWJsZUdpdEluZm9UaWxlKSB7XG4gICAgICBzdGF0dXNCYXIuZGlzYWJsZUdpdEluZm9UaWxlKCk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXJHaXRodWJUb2tlbigpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5sb2dpbk1vZGVsLnJlbW92ZVRva2VuKCdodHRwczovL2FwaS5naXRodWIuY29tJyk7XG4gIH1cblxuICBjbG9zZURpYWxvZyA9ICgpID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7ZGlhbG9nUmVxdWVzdDogZGlhbG9nUmVxdWVzdHMubnVsbH0sIHJlc29sdmUpKTtcblxuICBvcGVuSW5pdGlhbGl6ZURpYWxvZyA9IGFzeW5jIGRpclBhdGggPT4ge1xuICAgIGlmICghZGlyUGF0aCkge1xuICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gdGhpcy5wcm9wcy53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKGFjdGl2ZUVkaXRvcikge1xuICAgICAgICBjb25zdCBbcHJvamVjdFBhdGhdID0gdGhpcy5wcm9wcy5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGFjdGl2ZUVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICBkaXJQYXRoID0gcHJvamVjdFBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWRpclBhdGgpIHtcbiAgICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gdGhpcy5wcm9wcy5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk7XG4gICAgICBjb25zdCB3aXRoUmVwb3NpdG9yaWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIGRpcmVjdG9yaWVzLm1hcChhc3luYyBkID0+IFtkLCBhd2FpdCB0aGlzLnByb3BzLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShkKV0pLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGZpcnN0VW5pbml0aWFsaXplZCA9IHdpdGhSZXBvc2l0b3JpZXMuZmluZCgoW2QsIHJdKSA9PiAhcik7XG4gICAgICBpZiAoZmlyc3RVbmluaXRpYWxpemVkICYmIGZpcnN0VW5pbml0aWFsaXplZFswXSkge1xuICAgICAgICBkaXJQYXRoID0gZmlyc3RVbmluaXRpYWxpemVkWzBdLmdldFBhdGgoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWRpclBhdGgpIHtcbiAgICAgIGRpclBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ2NvcmUucHJvamVjdEhvbWUnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsb2dSZXF1ZXN0ID0gZGlhbG9nUmVxdWVzdHMuaW5pdCh7ZGlyUGF0aH0pO1xuICAgIGRpYWxvZ1JlcXVlc3Qub25Qcm9ncmVzc2luZ0FjY2VwdChhc3luYyBjaG9zZW5QYXRoID0+IHtcbiAgICAgIGF3YWl0IHRoaXMucHJvcHMuaW5pdGlhbGl6ZShjaG9zZW5QYXRoKTtcbiAgICAgIGF3YWl0IHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICB9KTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uQ2FuY2VsKHRoaXMuY2xvc2VEaWFsb2cpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7ZGlhbG9nUmVxdWVzdH0sIHJlc29sdmUpKTtcbiAgfVxuXG4gIG9wZW5DbG9uZURpYWxvZyA9IG9wdHMgPT4ge1xuICAgIGNvbnN0IGRpYWxvZ1JlcXVlc3QgPSBkaWFsb2dSZXF1ZXN0cy5jbG9uZShvcHRzKTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uUHJvZ3Jlc3NpbmdBY2NlcHQoYXN5bmMgKHVybCwgY2hvc2VuUGF0aCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5wcm9wcy5jbG9uZSh1cmwsIGNob3NlblBhdGgpO1xuICAgICAgYXdhaXQgdGhpcy5jbG9zZURpYWxvZygpO1xuICAgIH0pO1xuICAgIGRpYWxvZ1JlcXVlc3Qub25DYW5jZWwodGhpcy5jbG9zZURpYWxvZyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHtkaWFsb2dSZXF1ZXN0fSwgcmVzb2x2ZSkpO1xuICB9XG5cbiAgb3BlbkNyZWRlbnRpYWxzRGlhbG9nID0gcXVlcnkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBkaWFsb2dSZXF1ZXN0ID0gZGlhbG9nUmVxdWVzdHMuY3JlZGVudGlhbChxdWVyeSk7XG4gICAgICBkaWFsb2dSZXF1ZXN0Lm9uUHJvZ3Jlc3NpbmdBY2NlcHQoYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICBhd2FpdCB0aGlzLmNsb3NlRGlhbG9nKCk7XG4gICAgICB9KTtcbiAgICAgIGRpYWxvZ1JlcXVlc3Qub25DYW5jZWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5jbG9zZURpYWxvZygpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe2RpYWxvZ1JlcXVlc3R9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG9wZW5Jc3N1ZWlzaERpYWxvZyA9ICgpID0+IHtcbiAgICBjb25zdCBkaWFsb2dSZXF1ZXN0ID0gZGlhbG9nUmVxdWVzdHMuaXNzdWVpc2goKTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uUHJvZ3Jlc3NpbmdBY2NlcHQoYXN5bmMgdXJsID0+IHtcbiAgICAgIGF3YWl0IG9wZW5Jc3N1ZWlzaEl0ZW0odXJsLCB7XG4gICAgICAgIHdvcmtzcGFjZTogdGhpcy5wcm9wcy53b3Jrc3BhY2UsXG4gICAgICAgIHdvcmtkaXI6IHRoaXMucHJvcHMucmVwb3NpdG9yeS5nZXRXb3JraW5nRGlyZWN0b3J5UGF0aCgpLFxuICAgICAgfSk7XG4gICAgICBhd2FpdCB0aGlzLmNsb3NlRGlhbG9nKCk7XG4gICAgfSk7XG4gICAgZGlhbG9nUmVxdWVzdC5vbkNhbmNlbCh0aGlzLmNsb3NlRGlhbG9nKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHRoaXMuc2V0U3RhdGUoe2RpYWxvZ1JlcXVlc3R9LCByZXNvbHZlKSk7XG4gIH1cblxuICBvcGVuQ29tbWl0RGlhbG9nID0gKCkgPT4ge1xuICAgIGNvbnN0IGRpYWxvZ1JlcXVlc3QgPSBkaWFsb2dSZXF1ZXN0cy5jb21taXQoKTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uUHJvZ3Jlc3NpbmdBY2NlcHQoYXN5bmMgcmVmID0+IHtcbiAgICAgIGF3YWl0IG9wZW5Db21taXREZXRhaWxJdGVtKHJlZiwge1xuICAgICAgICB3b3Jrc3BhY2U6IHRoaXMucHJvcHMud29ya3NwYWNlLFxuICAgICAgICByZXBvc2l0b3J5OiB0aGlzLnByb3BzLnJlcG9zaXRvcnksXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICB9KTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uQ2FuY2VsKHRoaXMuY2xvc2VEaWFsb2cpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7ZGlhbG9nUmVxdWVzdH0sIHJlc29sdmUpKTtcbiAgfVxuXG4gIG9wZW5DcmVhdGVEaWFsb2cgPSAoKSA9PiB7XG4gICAgY29uc3QgZGlhbG9nUmVxdWVzdCA9IGRpYWxvZ1JlcXVlc3RzLmNyZWF0ZSgpO1xuICAgIGRpYWxvZ1JlcXVlc3Qub25Qcm9ncmVzc2luZ0FjY2VwdChhc3luYyByZXN1bHQgPT4ge1xuICAgICAgY29uc3QgZG90Y29tID0gZ2V0RW5kcG9pbnQoJ2dpdGh1Yi5jb20nKTtcbiAgICAgIGNvbnN0IHJlbGF5RW52aXJvbm1lbnQgPSBSZWxheU5ldHdvcmtMYXllck1hbmFnZXIuZ2V0RW52aXJvbm1lbnRGb3JIb3N0KGRvdGNvbSk7XG5cbiAgICAgIGF3YWl0IGNyZWF0ZVJlcG9zaXRvcnkocmVzdWx0LCB7Y2xvbmU6IHRoaXMucHJvcHMuY2xvbmUsIHJlbGF5RW52aXJvbm1lbnR9KTtcbiAgICAgIGF3YWl0IHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICB9KTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uQ2FuY2VsKHRoaXMuY2xvc2VEaWFsb2cpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7ZGlhbG9nUmVxdWVzdH0sIHJlc29sdmUpKTtcbiAgfVxuXG4gIG9wZW5QdWJsaXNoRGlhbG9nID0gcmVwb3NpdG9yeSA9PiB7XG4gICAgY29uc3QgZGlhbG9nUmVxdWVzdCA9IGRpYWxvZ1JlcXVlc3RzLnB1Ymxpc2goe2xvY2FsRGlyOiByZXBvc2l0b3J5LmdldFdvcmtpbmdEaXJlY3RvcnlQYXRoKCl9KTtcbiAgICBkaWFsb2dSZXF1ZXN0Lm9uUHJvZ3Jlc3NpbmdBY2NlcHQoYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IGRvdGNvbSA9IGdldEVuZHBvaW50KCdnaXRodWIuY29tJyk7XG4gICAgICBjb25zdCByZWxheUVudmlyb25tZW50ID0gUmVsYXlOZXR3b3JrTGF5ZXJNYW5hZ2VyLmdldEVudmlyb25tZW50Rm9ySG9zdChkb3Rjb20pO1xuXG4gICAgICBhd2FpdCBwdWJsaXNoUmVwb3NpdG9yeShyZXN1bHQsIHtyZXBvc2l0b3J5LCByZWxheUVudmlyb25tZW50fSk7XG4gICAgICBhd2FpdCB0aGlzLmNsb3NlRGlhbG9nKCk7XG4gICAgfSk7XG4gICAgZGlhbG9nUmVxdWVzdC5vbkNhbmNlbCh0aGlzLmNsb3NlRGlhbG9nKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHRoaXMuc2V0U3RhdGUoe2RpYWxvZ1JlcXVlc3R9LCByZXNvbHZlKSk7XG4gIH1cblxuICB0b2dnbGVDb21taXRQcmV2aWV3SXRlbSA9ICgpID0+IHtcbiAgICBjb25zdCB3b3JrZGlyID0gdGhpcy5wcm9wcy5yZXBvc2l0b3J5LmdldFdvcmtpbmdEaXJlY3RvcnlQYXRoKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMud29ya3NwYWNlLnRvZ2dsZShDb21taXRQcmV2aWV3SXRlbS5idWlsZFVSSSh3b3JrZGlyKSk7XG4gIH1cblxuICBzaG93V2F0ZXJmYWxsRGlhZ25vc3RpY3MoKSB7XG4gICAgdGhpcy5wcm9wcy53b3Jrc3BhY2Uub3BlbihHaXRUaW1pbmdzVmlldy5idWlsZFVSSSgpKTtcbiAgfVxuXG4gIHNob3dDYWNoZURpYWdub3N0aWNzKCkge1xuICAgIHRoaXMucHJvcHMud29ya3NwYWNlLm9wZW4oR2l0Q2FjaGVWaWV3LmJ1aWxkVVJJKCkpO1xuICB9XG5cbiAgc3VyZmFjZUZyb21GaWxlQXRQYXRoID0gKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSA9PiB7XG4gICAgY29uc3QgZ2l0VGFiID0gdGhpcy5naXRUYWJUcmFja2VyLmdldENvbXBvbmVudCgpO1xuICAgIHJldHVybiBnaXRUYWIgJiYgZ2l0VGFiLmZvY3VzQW5kU2VsZWN0U3RhZ2luZ0l0ZW0oZmlsZVBhdGgsIHN0YWdpbmdTdGF0dXMpO1xuICB9XG5cbiAgc3VyZmFjZVRvQ29tbWl0UHJldmlld0J1dHRvbiA9ICgpID0+IHtcbiAgICBjb25zdCBnaXRUYWIgPSB0aGlzLmdpdFRhYlRyYWNrZXIuZ2V0Q29tcG9uZW50KCk7XG4gICAgcmV0dXJuIGdpdFRhYiAmJiBnaXRUYWIuZm9jdXNBbmRTZWxlY3RDb21taXRQcmV2aWV3QnV0dG9uKCk7XG4gIH1cblxuICBzdXJmYWNlVG9SZWNlbnRDb21taXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZ2l0VGFiID0gdGhpcy5naXRUYWJUcmFja2VyLmdldENvbXBvbmVudCgpO1xuICAgIHJldHVybiBnaXRUYWIgJiYgZ2l0VGFiLmZvY3VzQW5kU2VsZWN0UmVjZW50Q29tbWl0KCk7XG4gIH1cblxuICBkZXN0cm95RmlsZVBhdGNoUGFuZUl0ZW1zKCkge1xuICAgIGRlc3Ryb3lGaWxlUGF0Y2hQYW5lSXRlbXMoe29ubHlTdGFnZWQ6IGZhbHNlfSwgdGhpcy5wcm9wcy53b3Jrc3BhY2UpO1xuICB9XG5cbiAgZGVzdHJveUVtcHR5RmlsZVBhdGNoUGFuZUl0ZW1zKCkge1xuICAgIGRlc3Ryb3lFbXB0eUZpbGVQYXRjaFBhbmVJdGVtcyh0aGlzLnByb3BzLndvcmtzcGFjZSk7XG4gIH1cblxuICBxdWlldGx5U2VsZWN0SXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cykge1xuICAgIGNvbnN0IGdpdFRhYiA9IHRoaXMuZ2l0VGFiVHJhY2tlci5nZXRDb21wb25lbnQoKTtcbiAgICByZXR1cm4gZ2l0VGFiICYmIGdpdFRhYi5xdWlldGx5U2VsZWN0SXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cyk7XG4gIH1cblxuICBhc3luYyB2aWV3Q2hhbmdlc0ZvckN1cnJlbnRGaWxlKHN0YWdpbmdTdGF0dXMpIHtcbiAgICBjb25zdCBlZGl0b3IgPSB0aGlzLnByb3BzLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCFlZGl0b3IuZ2V0UGF0aCgpKSB7IHJldHVybjsgfVxuXG4gICAgY29uc3QgYWJzRmlsZVBhdGggPSBhd2FpdCBmcy5yZWFscGF0aChlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICBjb25zdCByZXBvUGF0aCA9IHRoaXMucHJvcHMucmVwb3NpdG9yeS5nZXRXb3JraW5nRGlyZWN0b3J5UGF0aCgpO1xuICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgW3Byb2plY3RQYXRoXSA9IHRoaXMucHJvcHMucHJvamVjdC5yZWxhdGl2aXplUGF0aChlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHRoaXMucHJvcHMubm90aWZpY2F0aW9uTWFuYWdlci5hZGRJbmZvKFxuICAgICAgICBcIkhtbSwgdGhlcmUncyBub3RoaW5nIHRvIGNvbXBhcmUgdGhpcyBmaWxlIHRvXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gY3JlYXRlIGEgR2l0IHJlcG9zaXRvcnkgdG8gdHJhY2sgY2hhbmdlcyB0byB0aGUgZmlsZXMgaW4geW91ciBwcm9qZWN0LicsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2J0biBidG4tcHJpbWFyeScsXG4gICAgICAgICAgICB0ZXh0OiAnQ3JlYXRlIGEgcmVwb3NpdG9yeSBub3cnLFxuICAgICAgICAgICAgb25EaWRDbGljazogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkUGF0aCA9IGF3YWl0IHRoaXMuaW5pdGlhbGl6ZVJlcG8ocHJvamVjdFBhdGgpO1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgdXNlciBjb25maXJtZWQgcmVwb3NpdG9yeSBjcmVhdGlvbiBmb3IgdGhpcyBwcm9qZWN0IHBhdGgsXG4gICAgICAgICAgICAgIC8vIHJldHJ5IHRoZSBvcGVyYXRpb24gdGhhdCBnb3QgdGhlbSBoZXJlIGluIHRoZSBmaXJzdCBwbGFjZVxuICAgICAgICAgICAgICBpZiAoY3JlYXRlZFBhdGggPT09IHByb2plY3RQYXRoKSB7IHRoaXMudmlld0NoYW5nZXNGb3JDdXJyZW50RmlsZShzdGFnaW5nU3RhdHVzKTsgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XSxcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhYnNGaWxlUGF0aC5zdGFydHNXaXRoKHJlcG9QYXRoKSkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBhYnNGaWxlUGF0aC5zbGljZShyZXBvUGF0aC5sZW5ndGggKyAxKTtcbiAgICAgIHRoaXMucXVpZXRseVNlbGVjdEl0ZW0oZmlsZVBhdGgsIHN0YWdpbmdTdGF0dXMpO1xuICAgICAgY29uc3Qgc3BsaXREaXJlY3Rpb24gPSB0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ2dpdGh1Yi52aWV3Q2hhbmdlc0ZvckN1cnJlbnRGaWxlRGlmZlBhbmVTcGxpdERpcmVjdGlvbicpO1xuICAgICAgY29uc3QgcGFuZSA9IHRoaXMucHJvcHMud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgICAgIGlmIChzcGxpdERpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBwYW5lLnNwbGl0UmlnaHQoKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BsaXREaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBwYW5lLnNwbGl0RG93bigpO1xuICAgICAgfVxuICAgICAgY29uc3QgbGluZU51bSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDE7XG4gICAgICBjb25zdCBpdGVtID0gYXdhaXQgdGhpcy5wcm9wcy53b3Jrc3BhY2Uub3BlbihcbiAgICAgICAgQ2hhbmdlZEZpbGVJdGVtLmJ1aWxkVVJJKGZpbGVQYXRoLCByZXBvUGF0aCwgc3RhZ2luZ1N0YXR1cyksXG4gICAgICAgIHtwZW5kaW5nOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IHRydWUsIGFjdGl2YXRlSXRlbTogdHJ1ZX0sXG4gICAgICApO1xuICAgICAgYXdhaXQgaXRlbS5nZXRSZWFsSXRlbVByb21pc2UoKTtcbiAgICAgIGF3YWl0IGl0ZW0uZ2V0RmlsZVBhdGNoTG9hZGVkUHJvbWlzZSgpO1xuICAgICAgaXRlbS5nb1RvRGlmZkxpbmUobGluZU51bSk7XG4gICAgICBpdGVtLmZvY3VzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHthYnNGaWxlUGF0aH0gZG9lcyBub3QgYmVsb25nIHRvIHJlcG8gJHtyZXBvUGF0aH1gKTtcbiAgICB9XG4gIH1cblxuICB2aWV3VW5zdGFnZWRDaGFuZ2VzRm9yQ3VycmVudEZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld0NoYW5nZXNGb3JDdXJyZW50RmlsZSgndW5zdGFnZWQnKTtcbiAgfVxuXG4gIHZpZXdTdGFnZWRDaGFuZ2VzRm9yQ3VycmVudEZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld0NoYW5nZXNGb3JDdXJyZW50RmlsZSgnc3RhZ2VkJyk7XG4gIH1cblxuICBvcGVuRmlsZXMoZmlsZVBhdGhzLCByZXBvc2l0b3J5ID0gdGhpcy5wcm9wcy5yZXBvc2l0b3J5KSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGZpbGVQYXRocy5tYXAoZmlsZVBhdGggPT4ge1xuICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5qb2luKHJlcG9zaXRvcnkuZ2V0V29ya2luZ0RpcmVjdG9yeVBhdGgoKSwgZmlsZVBhdGgpO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMud29ya3NwYWNlLm9wZW4oYWJzb2x1dGVQYXRoLCB7cGVuZGluZzogZmlsZVBhdGhzLmxlbmd0aCA9PT0gMX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGdldFVuc2F2ZWRGaWxlcyhmaWxlUGF0aHMsIHdvcmtkaXJQYXRoKSB7XG4gICAgY29uc3QgaXNNb2RpZmllZEJ5UGF0aCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnByb3BzLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZvckVhY2goZWRpdG9yID0+IHtcbiAgICAgIGlzTW9kaWZpZWRCeVBhdGguc2V0KGVkaXRvci5nZXRQYXRoKCksIGVkaXRvci5pc01vZGlmaWVkKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IHtcbiAgICAgIGNvbnN0IGFic0ZpbGVQYXRoID0gcGF0aC5qb2luKHdvcmtkaXJQYXRoLCBmaWxlUGF0aCk7XG4gICAgICByZXR1cm4gaXNNb2RpZmllZEJ5UGF0aC5nZXQoYWJzRmlsZVBhdGgpO1xuICAgIH0pO1xuICB9XG5cbiAgZW5zdXJlTm9VbnNhdmVkRmlsZXMoZmlsZVBhdGhzLCBtZXNzYWdlLCB3b3JrZGlyUGF0aCA9IHRoaXMucHJvcHMucmVwb3NpdG9yeS5nZXRXb3JraW5nRGlyZWN0b3J5UGF0aCgpKSB7XG4gICAgY29uc3QgdW5zYXZlZEZpbGVzID0gdGhpcy5nZXRVbnNhdmVkRmlsZXMoZmlsZVBhdGhzLCB3b3JrZGlyUGF0aCkubWFwKGZpbGVQYXRoID0+IGBcXGAke2ZpbGVQYXRofVxcYGApLmpvaW4oJzxicj4nKTtcbiAgICBpZiAodW5zYXZlZEZpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5wcm9wcy5ub3RpZmljYXRpb25NYW5hZ2VyLmFkZEVycm9yKFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IGBZb3UgaGF2ZSB1bnNhdmVkIGNoYW5nZXMgaW46PGJyPiR7dW5zYXZlZEZpbGVzfS5gLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHMoZmlsZVBhdGhzKSB7XG4gICAgY29uc3QgZGVzdHJ1Y3RpdmVBY3Rpb24gPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5yZXBvc2l0b3J5LmRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzKGZpbGVQYXRocyk7XG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LnN0b3JlQmVmb3JlQW5kQWZ0ZXJCbG9icyhcbiAgICAgIGZpbGVQYXRocyxcbiAgICAgICgpID0+IHRoaXMuZW5zdXJlTm9VbnNhdmVkRmlsZXMoZmlsZVBhdGhzLCAnQ2Fubm90IGRpc2NhcmQgY2hhbmdlcyBpbiBzZWxlY3RlZCBmaWxlcy4nKSxcbiAgICAgIGRlc3RydWN0aXZlQWN0aW9uLFxuICAgICk7XG4gIH1cblxuICBhc3luYyBkaXNjYXJkTGluZXMobXVsdGlGaWxlUGF0Y2gsIGxpbmVzLCByZXBvc2l0b3J5ID0gdGhpcy5wcm9wcy5yZXBvc2l0b3J5KSB7XG4gICAgLy8gKGt1eWNoYWNvKSBGb3Igbm93IHdlIG9ubHkgc3VwcG9ydCBkaXNjYXJkaW5nIHJvd3MgZm9yIE11bHRpRmlsZVBhdGNoZXMgdGhhdCBjb250YWluIGEgc2luZ2xlIGZpbGUgcGF0Y2hcbiAgICAvLyBUaGUgb25seSB3YXkgdG8gYWNjZXNzIHRoaXMgbWV0aG9kIGZyb20gdGhlIFVJIGlzIHRvIGJlIGluIGEgQ2hhbmdlZEZpbGVJdGVtLCB3aGljaCBvbmx5IGhhcyBhIHNpbmdsZSBmaWxlIHBhdGNoXG4gICAgaWYgKG11bHRpRmlsZVBhdGNoLmdldEZpbGVQYXRjaGVzKCkubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gbXVsdGlGaWxlUGF0Y2guZ2V0RmlsZVBhdGNoZXMoKVswXS5nZXRQYXRoKCk7XG4gICAgY29uc3QgZGVzdHJ1Y3RpdmVBY3Rpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBkaXNjYXJkRmlsZVBhdGNoID0gbXVsdGlGaWxlUGF0Y2guZ2V0VW5zdGFnZVBhdGNoRm9yTGluZXMobGluZXMpO1xuICAgICAgYXdhaXQgcmVwb3NpdG9yeS5hcHBseVBhdGNoVG9Xb3JrZGlyKGRpc2NhcmRGaWxlUGF0Y2gpO1xuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHJlcG9zaXRvcnkuc3RvcmVCZWZvcmVBbmRBZnRlckJsb2JzKFxuICAgICAgW2ZpbGVQYXRoXSxcbiAgICAgICgpID0+IHRoaXMuZW5zdXJlTm9VbnNhdmVkRmlsZXMoW2ZpbGVQYXRoXSwgJ0Nhbm5vdCBkaXNjYXJkIGxpbmVzLicsIHJlcG9zaXRvcnkuZ2V0V29ya2luZ0RpcmVjdG9yeVBhdGgoKSksXG4gICAgICBkZXN0cnVjdGl2ZUFjdGlvbixcbiAgICAgIGZpbGVQYXRoLFxuICAgICk7XG4gIH1cblxuICBnZXRGaWxlUGF0aHNGb3JMYXN0RGlzY2FyZChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGxldCBsYXN0U25hcHNob3RzID0gdGhpcy5wcm9wcy5yZXBvc2l0b3J5LmdldExhc3RIaXN0b3J5U25hcHNob3RzKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICBsYXN0U25hcHNob3RzID0gbGFzdFNuYXBzaG90cyA/IFtsYXN0U25hcHNob3RzXSA6IFtdO1xuICAgIH1cbiAgICByZXR1cm4gbGFzdFNuYXBzaG90cy5tYXAoc25hcHNob3QgPT4gc25hcHNob3QuZmlsZVBhdGgpO1xuICB9XG5cbiAgYXN5bmMgdW5kb0xhc3REaXNjYXJkKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsLCByZXBvc2l0b3J5ID0gdGhpcy5wcm9wcy5yZXBvc2l0b3J5KSB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5nZXRGaWxlUGF0aHNGb3JMYXN0RGlzY2FyZChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJlcG9zaXRvcnkucmVzdG9yZUxhc3REaXNjYXJkSW5UZW1wRmlsZXMoXG4gICAgICAgICgpID0+IHRoaXMuZW5zdXJlTm9VbnNhdmVkRmlsZXMoZmlsZVBhdGhzLCAnQ2Fubm90IHVuZG8gbGFzdCBkaXNjYXJkLicpLFxuICAgICAgICBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoLFxuICAgICAgKTtcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cbiAgICAgIGF3YWl0IHRoaXMucHJvY2VlZE9yUHJvbXB0QmFzZWRPblJlc3VsdHMocmVzdWx0cywgcGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRFcnJvciAmJiBlLnN0ZEVyci5tYXRjaCgvZmF0YWw6IE5vdCBhIHZhbGlkIG9iamVjdCBuYW1lLykpIHtcbiAgICAgICAgdGhpcy5jbGVhblVwSGlzdG9yeUZvckZpbGVQYXRocyhmaWxlUGF0aHMsIHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBwcm9jZWVkT3JQcm9tcHRCYXNlZE9uUmVzdWx0cyhyZXN1bHRzLCBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGNvbnN0IGNvbmZsaWN0cyA9IHJlc3VsdHMuZmlsdGVyKCh7Y29uZmxpY3R9KSA9PiBjb25mbGljdCk7XG4gICAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2VlZFdpdGhMYXN0RGlzY2FyZFVuZG8ocmVzdWx0cywgcGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMucHJvbXB0QWJvdXRDb25mbGljdHMocmVzdWx0cywgY29uZmxpY3RzLCBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwcm9tcHRBYm91dENvbmZsaWN0cyhyZXN1bHRzLCBjb25mbGljdHMsIHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgY29uc3QgY29uZmxpY3RlZEZpbGVzID0gY29uZmxpY3RzLm1hcCgoe2ZpbGVQYXRofSkgPT4gYFxcdCR7ZmlsZVBhdGh9YCkuam9pbignXFxuJyk7XG4gICAgY29uc3QgY2hvaWNlID0gdGhpcy5wcm9wcy5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6ICdVbmRvaW5nIHdpbGwgcmVzdWx0IGluIGNvbmZsaWN0cy4uLicsXG4gICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBmb3IgdGhlIGZvbGxvd2luZyBmaWxlczpcXG4ke2NvbmZsaWN0ZWRGaWxlc31cXG5gICtcbiAgICAgICAgJ1dvdWxkIHlvdSBsaWtlIHRvIGFwcGx5IHRoZSBjaGFuZ2VzIHdpdGggbWVyZ2UgY29uZmxpY3QgbWFya2VycywgJyArXG4gICAgICAgICdvciBvcGVuIHRoZSB0ZXh0IHdpdGggbWVyZ2UgY29uZmxpY3QgbWFya2VycyBpbiBhIG5ldyBmaWxlPycsXG4gICAgICBidXR0b25zOiBbJ01lcmdlIHdpdGggY29uZmxpY3QgbWFya2VycycsICdPcGVuIGluIG5ldyBmaWxlJywgJ0NhbmNlbCddLFxuICAgIH0pO1xuICAgIGlmIChjaG9pY2UgPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2VlZFdpdGhMYXN0RGlzY2FyZFVuZG8ocmVzdWx0cywgcGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgfSBlbHNlIGlmIChjaG9pY2UgPT09IDEpIHtcbiAgICAgIGF3YWl0IHRoaXMub3BlbkNvbmZsaWN0c0luTmV3RWRpdG9ycyhjb25mbGljdHMubWFwKCh7cmVzdWx0UGF0aH0pID0+IHJlc3VsdFBhdGgpKTtcbiAgICB9XG4gIH1cblxuICBjbGVhblVwSGlzdG9yeUZvckZpbGVQYXRocyhmaWxlUGF0aHMsIHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LmNsZWFyRGlzY2FyZEhpc3RvcnkocGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgY29uc3QgZmlsZVBhdGhzU3RyID0gZmlsZVBhdGhzLm1hcChmaWxlUGF0aCA9PiBgXFxgJHtmaWxlUGF0aH1cXGBgKS5qb2luKCc8YnI+Jyk7XG4gICAgdGhpcy5wcm9wcy5ub3RpZmljYXRpb25NYW5hZ2VyLmFkZEVycm9yKFxuICAgICAgJ0Rpc2NhcmQgaGlzdG9yeSBoYXMgZXhwaXJlZC4nLFxuICAgICAge1xuICAgICAgICBkZXNjcmlwdGlvbjogYENhbm5vdCB1bmRvIGRpc2NhcmQgZm9yPGJyPiR7ZmlsZVBhdGhzU3RyfTxicj5TdGFsZSBkaXNjYXJkIGhpc3RvcnkgaGFzIGJlZW4gZGVsZXRlZC5gLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIHByb2NlZWRXaXRoTGFzdERpc2NhcmRVbmRvKHJlc3VsdHMsIHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSByZXN1bHRzLm1hcChhc3luYyByZXN1bHQgPT4ge1xuICAgICAgY29uc3Qge2ZpbGVQYXRoLCByZXN1bHRQYXRoLCBkZWxldGVkLCBjb25mbGljdCwgdGhlaXJzU2hhLCBjb21tb25CYXNlU2hhLCBjdXJyZW50U2hhfSA9IHJlc3VsdDtcbiAgICAgIGNvbnN0IGFic0ZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMucHJvcHMucmVwb3NpdG9yeS5nZXRXb3JraW5nRGlyZWN0b3J5UGF0aCgpLCBmaWxlUGF0aCk7XG4gICAgICBpZiAoZGVsZXRlZCAmJiByZXN1bHRQYXRoID09PSBudWxsKSB7XG4gICAgICAgIGF3YWl0IGZzLnJlbW92ZShhYnNGaWxlUGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBmcy5jb3B5KHJlc3VsdFBhdGgsIGFic0ZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25mbGljdCkge1xuICAgICAgICBhd2FpdCB0aGlzLnByb3BzLnJlcG9zaXRvcnkud3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleChmaWxlUGF0aCwgY29tbW9uQmFzZVNoYSwgY3VycmVudFNoYSwgdGhlaXJzU2hhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgYXdhaXQgdGhpcy5wcm9wcy5yZXBvc2l0b3J5LnBvcERpc2NhcmRIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICB9XG5cbiAgYXN5bmMgb3BlbkNvbmZsaWN0c0luTmV3RWRpdG9ycyhyZXN1bHRQYXRocykge1xuICAgIGNvbnN0IGVkaXRvclByb21pc2VzID0gcmVzdWx0UGF0aHMubWFwKHJlc3VsdFBhdGggPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMud29ya3NwYWNlLm9wZW4ocmVzdWx0UGF0aCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGVkaXRvclByb21pc2VzKTtcbiAgfVxuXG4gIHJlcG9ydFJlbGF5RXJyb3IgPSAoZnJpZW5kbHlNZXNzYWdlLCBlcnIpID0+IHtcbiAgICBjb25zdCBvcHRzID0ge2Rpc21pc3NhYmxlOiB0cnVlfTtcblxuICAgIGlmIChlcnIubmV0d29yaykge1xuICAgICAgLy8gT2ZmbGluZVxuICAgICAgb3B0cy5pY29uID0gJ2FsaWdubWVudC11bmFsaWduJztcbiAgICAgIG9wdHMuZGVzY3JpcHRpb24gPSBcIkl0IGxvb2tzIGxpa2UgeW91J3JlIG9mZmxpbmUgcmlnaHQgbm93LlwiO1xuICAgIH0gZWxzZSBpZiAoZXJyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgLy8gVHJhbnNpZW50IGVycm9yIGxpa2UgYSA1MDAgZnJvbSB0aGUgQVBJXG4gICAgICBvcHRzLmRlc2NyaXB0aW9uID0gJ1RoZSBHaXRIdWIgQVBJIHJlcG9ydGVkIGEgcHJvYmxlbS4nO1xuICAgICAgb3B0cy5kZXRhaWwgPSBlcnIucmVzcG9uc2VUZXh0O1xuICAgIH0gZWxzZSBpZiAoZXJyLmVycm9ycykge1xuICAgICAgLy8gR3JhcGhRTCBlcnJvcnNcbiAgICAgIG9wdHMuZGV0YWlsID0gZXJyLmVycm9ycy5tYXAoZSA9PiBlLm1lc3NhZ2UpLmpvaW4oJ1xcbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzLmRldGFpbCA9IGVyci5zdGFjaztcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzLm5vdGlmaWNhdGlvbk1hbmFnZXIuYWRkRXJyb3IoZnJpZW5kbHlNZXNzYWdlLCBvcHRzKTtcbiAgfVxuXG4gIC8qXG4gICAqIEFzeW5jaHJvbm91c2x5IGNvdW50IHRoZSBjb25mbGljdCBtYXJrZXJzIHByZXNlbnQgaW4gYSBmaWxlIHNwZWNpZmllZCBieSBmdWxsIHBhdGguXG4gICAqL1xuICByZWZyZXNoUmVzb2x1dGlvblByb2dyZXNzKGZ1bGxQYXRoKSB7XG4gICAgY29uc3QgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZnVsbFBhdGgsIHtlbmNvZGluZzogJ3V0ZjgnfSk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgQ29uZmxpY3QuY291bnRGcm9tU3RyZWFtKHJlYWRTdHJlYW0pLnRoZW4oY291bnQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnJlc29sdXRpb25Qcm9ncmVzcy5yZXBvcnRNYXJrZXJDb3VudChmdWxsUGF0aCwgY291bnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgVGFiVHJhY2tlciB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHtnZXRXb3Jrc3BhY2UsIHVyaX0pIHtcbiAgICBhdXRvYmluZCh0aGlzLCAndG9nZ2xlJywgJ3RvZ2dsZUZvY3VzJywgJ2Vuc3VyZVZpc2libGUnKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgdGhpcy5nZXRXb3Jrc3BhY2UgPSBnZXRXb3Jrc3BhY2U7XG4gICAgdGhpcy51cmkgPSB1cmk7XG4gIH1cblxuICBhc3luYyB0b2dnbGUoKSB7XG4gICAgY29uc3QgZm9jdXNUb1Jlc3RvcmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGxldCBzaG91bGRSZXN0b3JlRm9jdXMgPSBmYWxzZTtcblxuICAgIC8vIFJlbmRlcmVkID0+IHRoZSBkb2NrIGl0ZW0gaXMgYmVpbmcgcmVuZGVyZWQsIHdoZXRoZXIgb3Igbm90IHRoZSBkb2NrIGlzIHZpc2libGUgb3IgdGhlIGl0ZW1cbiAgICAvLyAgIGlzIHZpc2libGUgd2l0aGluIGl0cyBkb2NrLlxuICAgIC8vIFZpc2libGUgPT4gdGhlIGl0ZW0gaXMgYWN0aXZlIGFuZCB0aGUgZG9jayBpdGVtIGlzIGFjdGl2ZSB3aXRoaW4gaXRzIGRvY2suXG4gICAgY29uc3Qgd2FzUmVuZGVyZWQgPSB0aGlzLmlzUmVuZGVyZWQoKTtcbiAgICBjb25zdCB3YXNWaXNpYmxlID0gdGhpcy5pc1Zpc2libGUoKTtcblxuICAgIGlmICghd2FzUmVuZGVyZWQgfHwgIXdhc1Zpc2libGUpIHtcbiAgICAgIC8vIE5vdCByZW5kZXJlZCwgb3IgcmVuZGVyZWQgYnV0IG5vdCBhbiBhY3RpdmUgaXRlbSBpbiBhIHZpc2libGUgZG9jay5cbiAgICAgIGF3YWl0IHRoaXMucmV2ZWFsKCk7XG4gICAgICBzaG91bGRSZXN0b3JlRm9jdXMgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW5kZXJlZCBhbmQgYW4gYWN0aXZlIGl0ZW0gd2l0aGluIGEgdmlzaWJsZSBkb2NrLlxuICAgICAgYXdhaXQgdGhpcy5oaWRlKCk7XG4gICAgICBzaG91bGRSZXN0b3JlRm9jdXMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkUmVzdG9yZUZvY3VzKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IGZvY3VzVG9SZXN0b3JlLmZvY3VzKCkpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZUZvY3VzKCkge1xuICAgIGNvbnN0IGhhZEZvY3VzID0gdGhpcy5oYXNGb2N1cygpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlVmlzaWJsZSgpO1xuXG4gICAgaWYgKGhhZEZvY3VzKSB7XG4gICAgICBsZXQgd29ya3NwYWNlID0gdGhpcy5nZXRXb3Jrc3BhY2UoKTtcbiAgICAgIGlmICh3b3Jrc3BhY2UuZ2V0Q2VudGVyKSB7XG4gICAgICAgIHdvcmtzcGFjZSA9IHdvcmtzcGFjZS5nZXRDZW50ZXIoKTtcbiAgICAgIH1cbiAgICAgIHdvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVuc3VyZVZpc2libGUoKSB7XG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBhd2FpdCB0aGlzLnJldmVhbCgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVuc3VyZVJlbmRlcmVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldFdvcmtzcGFjZSgpLm9wZW4odGhpcy51cmksIHtzZWFyY2hBbGxQYW5lczogdHJ1ZSwgYWN0aXZhdGVJdGVtOiBmYWxzZSwgYWN0aXZhdGVQYW5lOiBmYWxzZX0pO1xuICB9XG5cbiAgcmV2ZWFsKCkge1xuICAgIGluY3JlbWVudENvdW50ZXIoYCR7dGhpcy5uYW1lfS10YWItb3BlbmApO1xuICAgIHJldHVybiB0aGlzLmdldFdvcmtzcGFjZSgpLm9wZW4odGhpcy51cmksIHtzZWFyY2hBbGxQYW5lczogdHJ1ZSwgYWN0aXZhdGVJdGVtOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IHRydWV9KTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgaW5jcmVtZW50Q291bnRlcihgJHt0aGlzLm5hbWV9LXRhYi1jbG9zZWApO1xuICAgIHJldHVybiB0aGlzLmdldFdvcmtzcGFjZSgpLmhpZGUodGhpcy51cmkpO1xuICB9XG5cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5nZXRDb21wb25lbnQoKS5yZXN0b3JlRm9jdXMoKTtcbiAgfVxuXG4gIGdldEl0ZW0oKSB7XG4gICAgY29uc3QgcGFuZSA9IHRoaXMuZ2V0V29ya3NwYWNlKCkucGFuZUZvclVSSSh0aGlzLnVyaSk7XG4gICAgaWYgKCFwYW5lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBwYW5lSXRlbSA9IHBhbmUuaXRlbUZvclVSSSh0aGlzLnVyaSk7XG4gICAgaWYgKCFwYW5lSXRlbSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhbmVJdGVtO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCkge1xuICAgIGNvbnN0IHBhbmVJdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgaWYgKCFwYW5lSXRlbSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICgoKHR5cGVvZiBwYW5lSXRlbS5nZXRSZWFsSXRlbSkgIT09ICdmdW5jdGlvbicpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFuZUl0ZW0uZ2V0UmVhbEl0ZW0oKTtcbiAgfVxuXG4gIGdldERPTUVsZW1lbnQoKSB7XG4gICAgY29uc3QgcGFuZUl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcbiAgICBpZiAoIXBhbmVJdGVtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCgodHlwZW9mIHBhbmVJdGVtLmdldEVsZW1lbnQpICE9PSAnZnVuY3Rpb24nKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhbmVJdGVtLmdldEVsZW1lbnQoKTtcbiAgfVxuXG4gIGlzUmVuZGVyZWQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXRXb3Jrc3BhY2UoKS5wYW5lRm9yVVJJKHRoaXMudXJpKTtcbiAgfVxuXG4gIGlzVmlzaWJsZSgpIHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSB0aGlzLmdldFdvcmtzcGFjZSgpO1xuICAgIHJldHVybiB3b3Jrc3BhY2UuZ2V0UGFuZUNvbnRhaW5lcnMoKVxuICAgICAgLmZpbHRlcihjb250YWluZXIgPT4gY29udGFpbmVyID09PSB3b3Jrc3BhY2UuZ2V0Q2VudGVyKCkgfHwgY29udGFpbmVyLmlzVmlzaWJsZSgpKVxuICAgICAgLnNvbWUoY29udGFpbmVyID0+IGNvbnRhaW5lci5nZXRQYW5lcygpLnNvbWUocGFuZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0gJiYgaXRlbS5nZXRVUkkgJiYgaXRlbS5nZXRVUkkoKSA9PT0gdGhpcy51cmk7XG4gICAgICB9KSk7XG4gIH1cblxuICBoYXNGb2N1cygpIHtcbiAgICBjb25zdCByb290ID0gdGhpcy5nZXRET01FbGVtZW50KCk7XG4gICAgcmV0dXJuIHJvb3QgJiYgcm9vdC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgfVxufVxuIl19