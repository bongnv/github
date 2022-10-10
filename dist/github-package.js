"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventKit = require("event-kit");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _helpers = require("./helpers");

var _workdirCache = _interopRequireDefault(require("./models/workdir-cache"));

var _workdirContext = _interopRequireDefault(require("./models/workdir-context"));

var _workdirContextPool = _interopRequireDefault(require("./models/workdir-context-pool"));

var _repository = _interopRequireDefault(require("./models/repository"));

var _styleCalculator = _interopRequireDefault(require("./models/style-calculator"));

var _githubLoginModel = _interopRequireDefault(require("./models/github-login-model"));

var _rootController = _interopRequireDefault(require("./controllers/root-controller"));

var _stubItem = _interopRequireDefault(require("./items/stub-item"));

var _switchboard = _interopRequireDefault(require("./switchboard"));

var _yardstick = _interopRequireDefault(require("./yardstick"));

var _gitTimingsView = _interopRequireDefault(require("./views/git-timings-view"));

var _contextMenuInterceptor = _interopRequireDefault(require("./context-menu-interceptor"));

var _asyncQueue = _interopRequireDefault(require("./async-queue"));

var _workerManager = _interopRequireDefault(require("./worker-manager"));

var _getRepoPipelineManager = _interopRequireDefault(require("./get-repo-pipeline-manager"));

var _reporterProxy = require("./reporter-proxy");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const defaultState = {
  newProject: true,
  activeRepositoryPath: null,
  contextLocked: false
};

class GithubPackage {
  constructor({
    workspace,
    project,
    commands,
    notificationManager,
    tooltips,
    styles,
    grammars,
    keymaps,
    config,
    deserializers,
    confirm,
    getLoadSettings,
    currentWindow,
    configDirPath,
    renderFn,
    loginModel
  }) {
    _defineProperty(this, "handleActivePaneItemChange", () => {
      if (this.lockedContext) {
        return;
      }

      const itemPath = pathForPaneItem(this.workspace.getCenter().getActivePaneItem());
      this.scheduleActiveContextUpdate({
        usePath: itemPath,
        lock: false
      });
    });

    _defineProperty(this, "handleProjectPathsChange", () => {
      this.scheduleActiveContextUpdate();
    });

    _defineProperty(this, "initialize", async projectPath => {
      await _fsExtra.default.mkdirs(projectPath);
      const repository = this.contextPool.add(projectPath).getRepository();
      await repository.init();
      this.workdirCache.invalidate();

      if (!this.project.contains(projectPath)) {
        this.project.addPath(projectPath);
      }

      await this.refreshAtomGitRepository(projectPath);
      await this.scheduleActiveContextUpdate();
    });

    _defineProperty(this, "clone", async (remoteUrl, projectPath, sourceRemoteName = 'origin') => {
      const context = this.contextPool.getContext(projectPath);
      let repository;

      if (context.isPresent()) {
        repository = context.getRepository();
        await repository.clone(remoteUrl, sourceRemoteName);
        repository.destroy();
      } else {
        repository = new _repository.default(projectPath, null, {
          pipelineManager: this.pipelineManager
        });
        await repository.clone(remoteUrl, sourceRemoteName);
      }

      this.workdirCache.invalidate();
      this.project.addPath(projectPath);
      await this.scheduleActiveContextUpdate();

      _reporterProxy.reporterProxy.addEvent('clone-repository', {
        project: 'github'
      });
    });

    (0, _helpers.autobind)(this, 'consumeStatusBar', 'createGitTimingsView', 'createIssueishPaneItemStub', 'createDockItemStub', 'createFilePatchControllerStub', 'destroyGitTabItem', 'destroyGithubTabItem', 'getRepositoryForWorkdir', 'scheduleActiveContextUpdate');
    this.workspace = workspace;
    this.project = project;
    this.commands = commands;
    this.deserializers = deserializers;
    this.notificationManager = notificationManager;
    this.tooltips = tooltips;
    this.config = config;
    this.styles = styles;
    this.grammars = grammars;
    this.keymaps = keymaps;
    this.configPath = _path.default.join(configDirPath, 'github.cson');
    this.currentWindow = currentWindow;
    this.styleCalculator = new _styleCalculator.default(this.styles, this.config);
    this.confirm = confirm;
    this.startOpen = false;
    this.activated = false;
    const criteria = {
      projectPathCount: this.project.getPaths().length,
      initPathCount: (getLoadSettings().initialPaths || []).length
    };
    this.pipelineManager = (0, _getRepoPipelineManager.default)({
      confirm,
      notificationManager,
      workspace
    });
    this.activeContextQueue = new _asyncQueue.default();
    this.guessedContext = _workdirContext.default.guess(criteria, this.pipelineManager);
    this.activeContext = this.guessedContext;
    this.lockedContext = null;
    this.workdirCache = new _workdirCache.default();
    this.contextPool = new _workdirContextPool.default({
      window,
      workspace,
      promptCallback: query => this.controller.openCredentialsDialog(query),
      pipelineManager: this.pipelineManager
    });
    this.switchboard = new _switchboard.default();
    this.loginModel = loginModel || new _githubLoginModel.default();

    this.renderFn = renderFn || ((component, node, callback) => {
      return _reactDom.default.render(component, node, callback);
    }); // Handle events from all resident contexts.


    this.subscriptions = new _eventKit.CompositeDisposable(this.contextPool.onDidChangeWorkdirOrHead(context => {
      this.refreshAtomGitRepository(context.getWorkingDirectory());
    }), this.contextPool.onDidUpdateRepository(context => {
      this.switchboard.didUpdateRepository(context.getRepository());
    }), this.contextPool.onDidDestroyRepository(context => {
      if (context === this.activeContext) {
        this.setActiveContext(_workdirContext.default.absent({
          pipelineManager: this.pipelineManager
        }));
      }
    }), _contextMenuInterceptor.default);
    this.setupYardstick();
  }

  setupYardstick() {
    const stagingSeries = ['stageLine', 'stageHunk', 'unstageLine', 'unstageHunk'];
    this.subscriptions.add( // Staging and unstaging operations
    this.switchboard.onDidBeginStageOperation(payload => {
      if (payload.stage && payload.line) {
        _yardstick.default.begin('stageLine');
      } else if (payload.stage && payload.hunk) {
        _yardstick.default.begin('stageHunk');
      } else if (payload.stage && payload.file) {
        _yardstick.default.begin('stageFile');
      } else if (payload.stage && payload.mode) {
        _yardstick.default.begin('stageMode');
      } else if (payload.stage && payload.symlink) {
        _yardstick.default.begin('stageSymlink');
      } else if (payload.unstage && payload.line) {
        _yardstick.default.begin('unstageLine');
      } else if (payload.unstage && payload.hunk) {
        _yardstick.default.begin('unstageHunk');
      } else if (payload.unstage && payload.file) {
        _yardstick.default.begin('unstageFile');
      } else if (payload.unstage && payload.mode) {
        _yardstick.default.begin('unstageMode');
      } else if (payload.unstage && payload.symlink) {
        _yardstick.default.begin('unstageSymlink');
      }
    }), this.switchboard.onDidUpdateRepository(() => {
      _yardstick.default.mark(stagingSeries, 'update-repository');
    }), this.switchboard.onDidFinishRender(context => {
      if (context === 'RootController.showFilePatchForPath') {
        _yardstick.default.finish(stagingSeries);
      }
    }), // Active context changes
    this.switchboard.onDidScheduleActiveContextUpdate(() => {
      _yardstick.default.begin('activeContextChange');
    }), this.switchboard.onDidBeginActiveContextUpdate(() => {
      _yardstick.default.mark('activeContextChange', 'queue-wait');
    }), this.switchboard.onDidFinishContextChangeRender(() => {
      _yardstick.default.mark('activeContextChange', 'render');
    }), this.switchboard.onDidFinishActiveContextUpdate(() => {
      _yardstick.default.finish('activeContextChange');
    }));
  }

  async activate(state = {}) {
    const savedState = _objectSpread2({}, defaultState, {}, state);

    const firstRun = !(await (0, _helpers.fileExists)(this.configPath));
    const newProject = savedState.firstRun !== undefined ? savedState.firstRun : savedState.newProject;
    this.startOpen = firstRun || newProject;
    this.startRevealed = firstRun && !this.config.get('welcome.showOnStartup');

    if (firstRun) {
      await _fsExtra.default.writeFile(this.configPath, '# Store non-visible GitHub package state.\n', {
        encoding: 'utf8'
      });
    }

    const hasSelectedFiles = event => {
      return !!event.target.closest('.github-FilePatchListView').querySelector('.is-selected');
    };

    this.subscriptions.add(this.workspace.getCenter().onDidChangeActivePaneItem(this.handleActivePaneItemChange), this.project.onDidChangePaths(this.handleProjectPathsChange), this.styleCalculator.startWatching('github-package-styles', ['editor.fontSize', 'editor.fontFamily', 'editor.lineHeight', 'editor.tabLength'], config => `
          .github-HunkView-line {
            font-family: ${config.get('editor.fontFamily')};
            line-height: ${config.get('editor.lineHeight')};
            tab-size: ${config.get('editor.tabLength')}
          }
        `), atom.contextMenu.add({
      '.github-UnstagedChanges .github-FilePatchListView': [{
        label: 'Stage',
        command: 'core:confirm',
        shouldDisplay: hasSelectedFiles
      }, {
        type: 'separator',
        shouldDisplay: hasSelectedFiles
      }, {
        label: 'Discard Changes',
        command: 'github:discard-changes-in-selected-files',
        shouldDisplay: hasSelectedFiles
      }],
      '.github-StagedChanges .github-FilePatchListView': [{
        label: 'Unstage',
        command: 'core:confirm',
        shouldDisplay: hasSelectedFiles
      }],
      '.github-MergeConflictPaths .github-FilePatchListView': [{
        label: 'Stage',
        command: 'core:confirm',
        shouldDisplay: hasSelectedFiles
      }, {
        type: 'separator',
        shouldDisplay: hasSelectedFiles
      }, {
        label: 'Resolve File As Ours',
        command: 'github:resolve-file-as-ours',
        shouldDisplay: hasSelectedFiles
      }, {
        label: 'Resolve File As Theirs',
        command: 'github:resolve-file-as-theirs',
        shouldDisplay: hasSelectedFiles
      }]
    }));
    this.activated = true;
    this.scheduleActiveContextUpdate({
      usePath: savedState.activeRepositoryPath,
      lock: savedState.contextLocked
    });
    this.rerender();
  }

  serialize() {
    return {
      activeRepositoryPath: this.getActiveWorkdir(),
      contextLocked: Boolean(this.lockedContext),
      newProject: false
    };
  }

  rerender(callback) {
    if (this.workspace.isDestroyed()) {
      return;
    }

    if (!this.activated) {
      return;
    }

    if (!this.element) {
      this.element = document.createElement('div');
      this.subscriptions.add(new _eventKit.Disposable(() => {
        _reactDom.default.unmountComponentAtNode(this.element);

        delete this.element;
      }));
    }

    const changeWorkingDirectory = workingDirectory => {
      return this.scheduleActiveContextUpdate({
        usePath: workingDirectory
      });
    };

    const setContextLock = (workingDirectory, lock) => {
      return this.scheduleActiveContextUpdate({
        usePath: workingDirectory,
        lock
      });
    };

    this.renderFn(_react.default.createElement(_rootController.default, {
      ref: c => {
        this.controller = c;
      },
      workspace: this.workspace,
      deserializers: this.deserializers,
      commands: this.commands,
      notificationManager: this.notificationManager,
      tooltips: this.tooltips,
      grammars: this.grammars,
      keymaps: this.keymaps,
      config: this.config,
      project: this.project,
      confirm: this.confirm,
      currentWindow: this.currentWindow,
      workdirContextPool: this.contextPool,
      loginModel: this.loginModel,
      repository: this.getActiveRepository(),
      resolutionProgress: this.getActiveResolutionProgress(),
      statusBar: this.statusBar,
      initialize: this.initialize,
      clone: this.clone,
      switchboard: this.switchboard,
      startOpen: this.startOpen,
      startRevealed: this.startRevealed,
      removeFilePatchItem: this.removeFilePatchItem,
      currentWorkDir: this.getActiveWorkdir(),
      contextLocked: this.lockedContext !== null,
      changeWorkingDirectory: changeWorkingDirectory,
      setContextLock: setContextLock
    }), this.element, callback);
  }

  async deactivate() {
    this.subscriptions.dispose();
    this.contextPool.clear();

    _workerManager.default.reset(false);

    if (this.guessedContext) {
      this.guessedContext.destroy();
      this.guessedContext = null;
    }

    await _yardstick.default.flush();
  }

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;
    this.rerender();
  }

  consumeReporter(reporter) {
    _reporterProxy.reporterProxy.setReporter(reporter);
  }

  createGitTimingsView() {
    return _stubItem.default.create('git-timings-view', {
      title: 'GitHub Package Timings View'
    }, _gitTimingsView.default.buildURI());
  }

  createIssueishPaneItemStub({
    uri,
    selectedTab
  }) {
    return _stubItem.default.create('issueish-detail-item', {
      title: 'Issueish',
      initSelectedTab: selectedTab
    }, uri);
  }

  createDockItemStub({
    uri
  }) {
    let item;

    switch (uri) {
      // always return an empty stub
      // but only set it as the active item for a tab type
      // if it doesn't already exist
      case 'atom-github://dock-item/git':
        item = this.createGitStub(uri);
        this.gitTabStubItem = this.gitTabStubItem || item;
        break;

      case 'atom-github://dock-item/github':
        item = this.createGitHubStub(uri);
        this.githubTabStubItem = this.githubTabStubItem || item;
        break;

      default:
        throw new Error(`Invalid DockItem stub URI: ${uri}`);
    }

    if (this.controller) {
      this.rerender();
    }

    return item;
  }

  createGitStub(uri) {
    return _stubItem.default.create('git', {
      title: 'Git'
    }, uri);
  }

  createGitHubStub(uri) {
    return _stubItem.default.create('github', {
      title: 'GitHub'
    }, uri);
  }

  createFilePatchControllerStub({
    uri
  } = {}) {
    const item = _stubItem.default.create('git-file-patch-controller', {
      title: 'Diff'
    }, uri);

    if (this.controller) {
      this.rerender();
    }

    return item;
  }

  createCommitPreviewStub({
    uri
  }) {
    const item = _stubItem.default.create('git-commit-preview', {
      title: 'Commit preview'
    }, uri);

    if (this.controller) {
      this.rerender();
    }

    return item;
  }

  createCommitDetailStub({
    uri
  }) {
    const item = _stubItem.default.create('git-commit-detail', {
      title: 'Commit'
    }, uri);

    if (this.controller) {
      this.rerender();
    }

    return item;
  }

  createReviewsStub({
    uri
  }) {
    const item = _stubItem.default.create('github-reviews', {
      title: 'Reviews'
    }, uri);

    if (this.controller) {
      this.rerender();
    }

    return item;
  }

  destroyGitTabItem() {
    if (this.gitTabStubItem) {
      this.gitTabStubItem.destroy();
      this.gitTabStubItem = null;

      if (this.controller) {
        this.rerender();
      }
    }
  }

  destroyGithubTabItem() {
    if (this.githubTabStubItem) {
      this.githubTabStubItem.destroy();
      this.githubTabStubItem = null;

      if (this.controller) {
        this.rerender();
      }
    }
  }

  getRepositoryForWorkdir(projectPath) {
    const loadingGuessRepo = _repository.default.loadingGuess({
      pipelineManager: this.pipelineManager
    });

    return this.guessedContext ? loadingGuessRepo : this.contextPool.getContext(projectPath).getRepository();
  }

  getActiveWorkdir() {
    return this.activeContext.getWorkingDirectory();
  }

  getActiveRepository() {
    return this.activeContext.getRepository();
  }

  getActiveResolutionProgress() {
    return this.activeContext.getResolutionProgress();
  }

  getContextPool() {
    return this.contextPool;
  }

  getSwitchboard() {
    return this.switchboard;
  }
  /**
   * Enqueue a request to modify the active context.
   *
   * options:
   *   usePath - Path of the context to use as the next context, if it is present in the pool.
   *   lock - True or false to lock the ultimately chosen context. Omit to preserve the current lock state.
   *
   * This method returns a Promise that resolves when the requested context update has completed. Note that it's
   * *possible* for the active context after resolution to differ from a requested `usePath`, if the workdir
   * containing `usePath` is no longer a viable option, such as if it belongs to a project that is no longer present.
   */


  async scheduleActiveContextUpdate(options = {}) {
    this.switchboard.didScheduleActiveContextUpdate();
    await this.activeContextQueue.push(this.updateActiveContext.bind(this, options), {
      parallel: false
    });
  }
  /**
   * Derive the git working directory context that should be used for the package's git operations based on the current
   * state of the Atom workspace. In priority, this prefers:
   *
   * - When activating: the working directory that was active when the package was last serialized, if it still a viable
   *   option. (usePath)
   * - The working directory chosen by the user from the context tile on the git or GitHub tabs. (usePath)
   * - The working directory containing the path of the active pane item.
   * - A git working directory corresponding to "first" project, if any projects are open.
   * - The current context, unchanged, which may be a `NullWorkdirContext`.
   *
   * First updates the pool of resident contexts to match all git working directories that correspond to open
   * projects and pane items.
   */


  async getNextContext(usePath = null) {
    // Internal utility function to normalize paths not contained within a git
    // working tree.
    const workdirForNonGitPath = async sourcePath => {
      const containingRoot = this.project.getDirectories().find(root => root.contains(sourcePath));

      if (containingRoot) {
        return containingRoot.getPath();
        /* istanbul ignore else */
      } else if (!(await _fsExtra.default.stat(sourcePath)).isDirectory()) {
        return _path.default.dirname(sourcePath);
      } else {
        return sourcePath;
      }
    }; // Internal utility function to identify the working directory to use for
    // an arbitrary (file or directory) path.


    const workdirForPath = async sourcePath => {
      return (await Promise.all([this.workdirCache.find(sourcePath), workdirForNonGitPath(sourcePath)])).find(Boolean);
    }; // Identify paths that *could* contribute a git working directory to the pool. This is drawn from
    // the roots of open projects, the currently locked context if one is present, and the path of the
    // open workspace item.


    const candidatePaths = new Set(this.project.getPaths());

    if (this.lockedContext) {
      const lockedRepo = this.lockedContext.getRepository();
      /* istanbul ignore else */

      if (lockedRepo) {
        candidatePaths.add(lockedRepo.getWorkingDirectoryPath());
      }
    }

    const activeItemPath = pathForPaneItem(this.workspace.getCenter().getActivePaneItem());

    if (activeItemPath) {
      candidatePaths.add(activeItemPath);
    }

    let activeItemWorkdir = null;
    let firstProjectWorkdir = null; // Convert the candidate paths into the set of viable git working directories, by means of a cached
    // `git rev-parse` call. Candidate paths that are not contained within a git working directory will
    // be preserved as-is within the pool, to allow users to initialize them.

    const workdirs = new Set((await Promise.all(Array.from(candidatePaths, async candidatePath => {
      const workdir = await workdirForPath(candidatePath); // Note the workdirs associated with the active pane item and the first open project so we can
      // prefer them later.

      if (candidatePath === activeItemPath) {
        activeItemWorkdir = workdir;
      } else if (candidatePath === this.project.getPaths()[0]) {
        firstProjectWorkdir = workdir;
      }

      return workdir;
    })))); // Update pool with the identified projects.

    this.contextPool.set(workdirs); // 1 - Explicitly requested workdir. This is either selected by the user from a context tile or
    //     deserialized from package state. Choose this context only if it still exists in the pool.

    if (usePath) {
      // Normalize usePath in a similar fashion to the way we do activeItemPath.
      let useWorkdir = usePath;

      if (usePath === activeItemPath) {
        useWorkdir = activeItemWorkdir;
      } else if (usePath === this.project.getPaths()[0]) {
        useWorkdir = firstProjectWorkdir;
      } else {
        useWorkdir = await workdirForPath(usePath);
      }

      const stateContext = this.contextPool.getContext(useWorkdir);

      if (stateContext.isPresent()) {
        return stateContext;
      }
    } // 2 - Use the currently locked context, if one is present.


    if (this.lockedContext) {
      return this.lockedContext;
    } // 3 - Follow the active workspace pane item.


    if (activeItemWorkdir) {
      return this.contextPool.getContext(activeItemWorkdir);
    } // 4 - The first open project.


    if (firstProjectWorkdir) {
      return this.contextPool.getContext(firstProjectWorkdir);
    } // No projects. Revert to the absent context unless we've guessed that more projects are on the way.


    if (this.project.getPaths().length === 0 && !this.activeContext.getRepository().isUndetermined()) {
      return _workdirContext.default.absent({
        pipelineManager: this.pipelineManager
      });
    } // It is only possible to reach here if there there was no preferred directory, there are no project paths, and the
    // the active context's repository is not undetermined. Preserve the existing active context.


    return this.activeContext;
  }
  /**
   * Modify the active context and re-render the React tree. This should only be done as part of the
   * context update queue; use scheduleActiveContextUpdate() to do this.
   *
   * nextActiveContext - The WorkdirContext to make active next, as derived from the current workspace
   *   state by getNextContext(). This may be absent or undetermined.
   * lock - If true, also set this context as the "locked" one and engage the context lock if it isn't
   *   already. If false, clear any existing context lock. If null or undefined, leave the lock in its
   *   existing state.
   */


  setActiveContext(nextActiveContext, lock) {
    if (nextActiveContext !== this.activeContext) {
      if (this.activeContext === this.guessedContext) {
        this.guessedContext.destroy();
        this.guessedContext = null;
      }

      this.activeContext = nextActiveContext;

      if (lock === true) {
        this.lockedContext = this.activeContext;
      } else if (lock === false) {
        this.lockedContext = null;
      }

      this.rerender(() => {
        this.switchboard.didFinishContextChangeRender();
        this.switchboard.didFinishActiveContextUpdate();
      });
    } else if ((lock === true || lock === false) && lock !== (this.lockedContext !== null)) {
      if (lock) {
        this.lockedContext = this.activeContext;
      } else {
        this.lockedContext = null;
      }

      this.rerender(() => {
        this.switchboard.didFinishContextChangeRender();
        this.switchboard.didFinishActiveContextUpdate();
      });
    } else {
      this.switchboard.didFinishActiveContextUpdate();
    }
  }
  /**
   * Derive the next active context with getNextContext(), then enact the context change with setActiveContext().
   *
   * options:
   *   usePath - Path of the context to use as the next context, if it is present in the pool.
   *   lock - True or false to lock the ultimately chosen context. Omit to preserve the current lock state.
   */


  async updateActiveContext(options) {
    if (this.workspace.isDestroyed()) {
      return;
    }

    this.switchboard.didBeginActiveContextUpdate();
    const nextActiveContext = await this.getNextContext(options.usePath);
    this.setActiveContext(nextActiveContext, options.lock);
  }

  async refreshAtomGitRepository(workdir) {
    const directory = this.project.getDirectoryForProjectPath(workdir);

    if (!directory) {
      return;
    }

    const atomGitRepo = await this.project.repositoryForDirectory(directory);

    if (atomGitRepo) {
      await atomGitRepo.refreshStatus();
    }
  }

}

exports.default = GithubPackage;

function pathForPaneItem(paneItem) {
  if (!paneItem) {
    return null;
  } // Likely GitHub package provided pane item


  if (typeof paneItem.getWorkingDirectory === 'function') {
    return paneItem.getWorkingDirectory();
  } // TextEditor-like


  if (typeof paneItem.getPath === 'function') {
    return paneItem.getPath();
  } // Oh well


  return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9naXRodWItcGFja2FnZS5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0U3RhdGUiLCJuZXdQcm9qZWN0IiwiYWN0aXZlUmVwb3NpdG9yeVBhdGgiLCJjb250ZXh0TG9ja2VkIiwiR2l0aHViUGFja2FnZSIsImNvbnN0cnVjdG9yIiwid29ya3NwYWNlIiwicHJvamVjdCIsImNvbW1hbmRzIiwibm90aWZpY2F0aW9uTWFuYWdlciIsInRvb2x0aXBzIiwic3R5bGVzIiwiZ3JhbW1hcnMiLCJrZXltYXBzIiwiY29uZmlnIiwiZGVzZXJpYWxpemVycyIsImNvbmZpcm0iLCJnZXRMb2FkU2V0dGluZ3MiLCJjdXJyZW50V2luZG93IiwiY29uZmlnRGlyUGF0aCIsInJlbmRlckZuIiwibG9naW5Nb2RlbCIsImxvY2tlZENvbnRleHQiLCJpdGVtUGF0aCIsInBhdGhGb3JQYW5lSXRlbSIsImdldENlbnRlciIsImdldEFjdGl2ZVBhbmVJdGVtIiwic2NoZWR1bGVBY3RpdmVDb250ZXh0VXBkYXRlIiwidXNlUGF0aCIsImxvY2siLCJwcm9qZWN0UGF0aCIsImZzIiwibWtkaXJzIiwicmVwb3NpdG9yeSIsImNvbnRleHRQb29sIiwiYWRkIiwiZ2V0UmVwb3NpdG9yeSIsImluaXQiLCJ3b3JrZGlyQ2FjaGUiLCJpbnZhbGlkYXRlIiwiY29udGFpbnMiLCJhZGRQYXRoIiwicmVmcmVzaEF0b21HaXRSZXBvc2l0b3J5IiwicmVtb3RlVXJsIiwic291cmNlUmVtb3RlTmFtZSIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwiaXNQcmVzZW50IiwiY2xvbmUiLCJkZXN0cm95IiwiUmVwb3NpdG9yeSIsInBpcGVsaW5lTWFuYWdlciIsInJlcG9ydGVyUHJveHkiLCJhZGRFdmVudCIsImNvbmZpZ1BhdGgiLCJwYXRoIiwiam9pbiIsInN0eWxlQ2FsY3VsYXRvciIsIlN0eWxlQ2FsY3VsYXRvciIsInN0YXJ0T3BlbiIsImFjdGl2YXRlZCIsImNyaXRlcmlhIiwicHJvamVjdFBhdGhDb3VudCIsImdldFBhdGhzIiwibGVuZ3RoIiwiaW5pdFBhdGhDb3VudCIsImluaXRpYWxQYXRocyIsImFjdGl2ZUNvbnRleHRRdWV1ZSIsIkFzeW5jUXVldWUiLCJndWVzc2VkQ29udGV4dCIsIldvcmtkaXJDb250ZXh0IiwiZ3Vlc3MiLCJhY3RpdmVDb250ZXh0IiwiV29ya2RpckNhY2hlIiwiV29ya2RpckNvbnRleHRQb29sIiwid2luZG93IiwicHJvbXB0Q2FsbGJhY2siLCJxdWVyeSIsImNvbnRyb2xsZXIiLCJvcGVuQ3JlZGVudGlhbHNEaWFsb2ciLCJzd2l0Y2hib2FyZCIsIlN3aXRjaGJvYXJkIiwiR2l0aHViTG9naW5Nb2RlbCIsImNvbXBvbmVudCIsIm5vZGUiLCJjYWxsYmFjayIsIlJlYWN0RG9tIiwicmVuZGVyIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJvbkRpZENoYW5nZVdvcmtkaXJPckhlYWQiLCJnZXRXb3JraW5nRGlyZWN0b3J5Iiwib25EaWRVcGRhdGVSZXBvc2l0b3J5IiwiZGlkVXBkYXRlUmVwb3NpdG9yeSIsIm9uRGlkRGVzdHJveVJlcG9zaXRvcnkiLCJzZXRBY3RpdmVDb250ZXh0IiwiYWJzZW50IiwiQ29udGV4dE1lbnVJbnRlcmNlcHRvciIsInNldHVwWWFyZHN0aWNrIiwic3RhZ2luZ1NlcmllcyIsIm9uRGlkQmVnaW5TdGFnZU9wZXJhdGlvbiIsInBheWxvYWQiLCJzdGFnZSIsImxpbmUiLCJ5YXJkc3RpY2siLCJiZWdpbiIsImh1bmsiLCJmaWxlIiwibW9kZSIsInN5bWxpbmsiLCJ1bnN0YWdlIiwibWFyayIsIm9uRGlkRmluaXNoUmVuZGVyIiwiZmluaXNoIiwib25EaWRTY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUiLCJvbkRpZEJlZ2luQWN0aXZlQ29udGV4dFVwZGF0ZSIsIm9uRGlkRmluaXNoQ29udGV4dENoYW5nZVJlbmRlciIsIm9uRGlkRmluaXNoQWN0aXZlQ29udGV4dFVwZGF0ZSIsImFjdGl2YXRlIiwic3RhdGUiLCJzYXZlZFN0YXRlIiwiZmlyc3RSdW4iLCJ1bmRlZmluZWQiLCJzdGFydFJldmVhbGVkIiwiZ2V0Iiwid3JpdGVGaWxlIiwiZW5jb2RpbmciLCJoYXNTZWxlY3RlZEZpbGVzIiwiZXZlbnQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwicXVlcnlTZWxlY3RvciIsIm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0iLCJoYW5kbGVBY3RpdmVQYW5lSXRlbUNoYW5nZSIsIm9uRGlkQ2hhbmdlUGF0aHMiLCJoYW5kbGVQcm9qZWN0UGF0aHNDaGFuZ2UiLCJzdGFydFdhdGNoaW5nIiwiYXRvbSIsImNvbnRleHRNZW51IiwibGFiZWwiLCJjb21tYW5kIiwic2hvdWxkRGlzcGxheSIsInR5cGUiLCJyZXJlbmRlciIsInNlcmlhbGl6ZSIsImdldEFjdGl2ZVdvcmtkaXIiLCJCb29sZWFuIiwiaXNEZXN0cm95ZWQiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiRGlzcG9zYWJsZSIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJjaGFuZ2VXb3JraW5nRGlyZWN0b3J5Iiwid29ya2luZ0RpcmVjdG9yeSIsInNldENvbnRleHRMb2NrIiwiYyIsImdldEFjdGl2ZVJlcG9zaXRvcnkiLCJnZXRBY3RpdmVSZXNvbHV0aW9uUHJvZ3Jlc3MiLCJzdGF0dXNCYXIiLCJpbml0aWFsaXplIiwicmVtb3ZlRmlsZVBhdGNoSXRlbSIsImRlYWN0aXZhdGUiLCJkaXNwb3NlIiwiY2xlYXIiLCJXb3JrZXJNYW5hZ2VyIiwicmVzZXQiLCJmbHVzaCIsImNvbnN1bWVTdGF0dXNCYXIiLCJjb25zdW1lUmVwb3J0ZXIiLCJyZXBvcnRlciIsInNldFJlcG9ydGVyIiwiY3JlYXRlR2l0VGltaW5nc1ZpZXciLCJTdHViSXRlbSIsImNyZWF0ZSIsInRpdGxlIiwiR2l0VGltaW5nc1ZpZXciLCJidWlsZFVSSSIsImNyZWF0ZUlzc3VlaXNoUGFuZUl0ZW1TdHViIiwidXJpIiwic2VsZWN0ZWRUYWIiLCJpbml0U2VsZWN0ZWRUYWIiLCJjcmVhdGVEb2NrSXRlbVN0dWIiLCJpdGVtIiwiY3JlYXRlR2l0U3R1YiIsImdpdFRhYlN0dWJJdGVtIiwiY3JlYXRlR2l0SHViU3R1YiIsImdpdGh1YlRhYlN0dWJJdGVtIiwiRXJyb3IiLCJjcmVhdGVGaWxlUGF0Y2hDb250cm9sbGVyU3R1YiIsImNyZWF0ZUNvbW1pdFByZXZpZXdTdHViIiwiY3JlYXRlQ29tbWl0RGV0YWlsU3R1YiIsImNyZWF0ZVJldmlld3NTdHViIiwiZGVzdHJveUdpdFRhYkl0ZW0iLCJkZXN0cm95R2l0aHViVGFiSXRlbSIsImdldFJlcG9zaXRvcnlGb3JXb3JrZGlyIiwibG9hZGluZ0d1ZXNzUmVwbyIsImxvYWRpbmdHdWVzcyIsImdldFJlc29sdXRpb25Qcm9ncmVzcyIsImdldENvbnRleHRQb29sIiwiZ2V0U3dpdGNoYm9hcmQiLCJvcHRpb25zIiwiZGlkU2NoZWR1bGVBY3RpdmVDb250ZXh0VXBkYXRlIiwicHVzaCIsInVwZGF0ZUFjdGl2ZUNvbnRleHQiLCJiaW5kIiwicGFyYWxsZWwiLCJnZXROZXh0Q29udGV4dCIsIndvcmtkaXJGb3JOb25HaXRQYXRoIiwic291cmNlUGF0aCIsImNvbnRhaW5pbmdSb290IiwiZ2V0RGlyZWN0b3JpZXMiLCJmaW5kIiwicm9vdCIsImdldFBhdGgiLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJkaXJuYW1lIiwid29ya2RpckZvclBhdGgiLCJQcm9taXNlIiwiYWxsIiwiY2FuZGlkYXRlUGF0aHMiLCJTZXQiLCJsb2NrZWRSZXBvIiwiZ2V0V29ya2luZ0RpcmVjdG9yeVBhdGgiLCJhY3RpdmVJdGVtUGF0aCIsImFjdGl2ZUl0ZW1Xb3JrZGlyIiwiZmlyc3RQcm9qZWN0V29ya2RpciIsIndvcmtkaXJzIiwiQXJyYXkiLCJmcm9tIiwiY2FuZGlkYXRlUGF0aCIsIndvcmtkaXIiLCJzZXQiLCJ1c2VXb3JrZGlyIiwic3RhdGVDb250ZXh0IiwiaXNVbmRldGVybWluZWQiLCJuZXh0QWN0aXZlQ29udGV4dCIsImRpZEZpbmlzaENvbnRleHRDaGFuZ2VSZW5kZXIiLCJkaWRGaW5pc2hBY3RpdmVDb250ZXh0VXBkYXRlIiwiZGlkQmVnaW5BY3RpdmVDb250ZXh0VXBkYXRlIiwiZGlyZWN0b3J5IiwiZ2V0RGlyZWN0b3J5Rm9yUHJvamVjdFBhdGgiLCJhdG9tR2l0UmVwbyIsInJlcG9zaXRvcnlGb3JEaXJlY3RvcnkiLCJyZWZyZXNoU3RhdHVzIiwicGFuZUl0ZW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxZQUFZLEdBQUc7QUFDbkJDLEVBQUFBLFVBQVUsRUFBRSxJQURPO0FBRW5CQyxFQUFBQSxvQkFBb0IsRUFBRSxJQUZIO0FBR25CQyxFQUFBQSxhQUFhLEVBQUU7QUFISSxDQUFyQjs7QUFNZSxNQUFNQyxhQUFOLENBQW9CO0FBQ2pDQyxFQUFBQSxXQUFXLENBQUM7QUFDVkMsSUFBQUEsU0FEVTtBQUNDQyxJQUFBQSxPQUREO0FBQ1VDLElBQUFBLFFBRFY7QUFDb0JDLElBQUFBLG1CQURwQjtBQUN5Q0MsSUFBQUEsUUFEekM7QUFDbURDLElBQUFBLE1BRG5EO0FBQzJEQyxJQUFBQSxRQUQzRDtBQUVWQyxJQUFBQSxPQUZVO0FBRURDLElBQUFBLE1BRkM7QUFFT0MsSUFBQUEsYUFGUDtBQUdWQyxJQUFBQSxPQUhVO0FBR0RDLElBQUFBLGVBSEM7QUFHZ0JDLElBQUFBLGFBSGhCO0FBSVZDLElBQUFBLGFBSlU7QUFLVkMsSUFBQUEsUUFMVTtBQUtBQyxJQUFBQTtBQUxBLEdBQUQsRUFNUjtBQUFBLHdEQW1OMEIsTUFBTTtBQUNqQyxVQUFJLEtBQUtDLGFBQVQsRUFBd0I7QUFDdEI7QUFDRDs7QUFFRCxZQUFNQyxRQUFRLEdBQUdDLGVBQWUsQ0FBQyxLQUFLbEIsU0FBTCxDQUFlbUIsU0FB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LE9BQU8ySixRQUFRLENBQUNoQyxPQUFoQixLQUE0QixVQUFoQyxFQUE0QztBQUMxQyxXQUFPZ0MsUUFBUSxDQUFDaEMsT0FBVCxFQUFQO0FBQ0QsR0FiZ0MsQ0FlakM7OztBQUNBLFNBQU8sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3REb20gZnJvbSAncmVhY3QtZG9tJztcblxuaW1wb3J0IHtmaWxlRXhpc3RzLCBhdXRvYmluZH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCBXb3JrZGlyQ2FjaGUgZnJvbSAnLi9tb2RlbHMvd29ya2Rpci1jYWNoZSc7XG5pbXBvcnQgV29ya2RpckNvbnRleHQgZnJvbSAnLi9tb2RlbHMvd29ya2Rpci1jb250ZXh0JztcbmltcG9ydCBXb3JrZGlyQ29udGV4dFBvb2wgZnJvbSAnLi9tb2RlbHMvd29ya2Rpci1jb250ZXh0LXBvb2wnO1xuaW1wb3J0IFJlcG9zaXRvcnkgZnJvbSAnLi9tb2RlbHMvcmVwb3NpdG9yeSc7XG5pbXBvcnQgU3R5bGVDYWxjdWxhdG9yIGZyb20gJy4vbW9kZWxzL3N0eWxlLWNhbGN1bGF0b3InO1xuaW1wb3J0IEdpdGh1YkxvZ2luTW9kZWwgZnJvbSAnLi9tb2RlbHMvZ2l0aHViLWxvZ2luLW1vZGVsJztcbmltcG9ydCBSb290Q29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL3Jvb3QtY29udHJvbGxlcic7XG5pbXBvcnQgU3R1Ykl0ZW0gZnJvbSAnLi9pdGVtcy9zdHViLWl0ZW0nO1xuaW1wb3J0IFN3aXRjaGJvYXJkIGZyb20gJy4vc3dpdGNoYm9hcmQnO1xuaW1wb3J0IHlhcmRzdGljayBmcm9tICcuL3lhcmRzdGljayc7XG5pbXBvcnQgR2l0VGltaW5nc1ZpZXcgZnJvbSAnLi92aWV3cy9naXQtdGltaW5ncy12aWV3JztcbmltcG9ydCBDb250ZXh0TWVudUludGVyY2VwdG9yIGZyb20gJy4vY29udGV4dC1tZW51LWludGVyY2VwdG9yJztcbmltcG9ydCBBc3luY1F1ZXVlIGZyb20gJy4vYXN5bmMtcXVldWUnO1xuaW1wb3J0IFdvcmtlck1hbmFnZXIgZnJvbSAnLi93b3JrZXItbWFuYWdlcic7XG5pbXBvcnQgZ2V0UmVwb1BpcGVsaW5lTWFuYWdlciBmcm9tICcuL2dldC1yZXBvLXBpcGVsaW5lLW1hbmFnZXInO1xuaW1wb3J0IHtyZXBvcnRlclByb3h5fSBmcm9tICcuL3JlcG9ydGVyLXByb3h5JztcblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBuZXdQcm9qZWN0OiB0cnVlLFxuICBhY3RpdmVSZXBvc2l0b3J5UGF0aDogbnVsbCxcbiAgY29udGV4dExvY2tlZDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJQYWNrYWdlIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHdvcmtzcGFjZSwgcHJvamVjdCwgY29tbWFuZHMsIG5vdGlmaWNhdGlvbk1hbmFnZXIsIHRvb2x0aXBzLCBzdHlsZXMsIGdyYW1tYXJzLFxuICAgIGtleW1hcHMsIGNvbmZpZywgZGVzZXJpYWxpemVycyxcbiAgICBjb25maXJtLCBnZXRMb2FkU2V0dGluZ3MsIGN1cnJlbnRXaW5kb3csXG4gICAgY29uZmlnRGlyUGF0aCxcbiAgICByZW5kZXJGbiwgbG9naW5Nb2RlbCxcbiAgfSkge1xuICAgIGF1dG9iaW5kKFxuICAgICAgdGhpcyxcbiAgICAgICdjb25zdW1lU3RhdHVzQmFyJywgJ2NyZWF0ZUdpdFRpbWluZ3NWaWV3JywgJ2NyZWF0ZUlzc3VlaXNoUGFuZUl0ZW1TdHViJywgJ2NyZWF0ZURvY2tJdGVtU3R1YicsXG4gICAgICAnY3JlYXRlRmlsZVBhdGNoQ29udHJvbGxlclN0dWInLCAnZGVzdHJveUdpdFRhYkl0ZW0nLCAnZGVzdHJveUdpdGh1YlRhYkl0ZW0nLFxuICAgICAgJ2dldFJlcG9zaXRvcnlGb3JXb3JrZGlyJywgJ3NjaGVkdWxlQWN0aXZlQ29udGV4dFVwZGF0ZScsXG4gICAgKTtcblxuICAgIHRoaXMud29ya3NwYWNlID0gd29ya3NwYWNlO1xuICAgIHRoaXMucHJvamVjdCA9IHByb2plY3Q7XG4gICAgdGhpcy5jb21tYW5kcyA9IGNvbW1hbmRzO1xuICAgIHRoaXMuZGVzZXJpYWxpemVycyA9IGRlc2VyaWFsaXplcnM7XG4gICAgdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyID0gbm90aWZpY2F0aW9uTWFuYWdlcjtcbiAgICB0aGlzLnRvb2x0aXBzID0gdG9vbHRpcHM7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG4gICAgdGhpcy5ncmFtbWFycyA9IGdyYW1tYXJzO1xuICAgIHRoaXMua2V5bWFwcyA9IGtleW1hcHM7XG4gICAgdGhpcy5jb25maWdQYXRoID0gcGF0aC5qb2luKGNvbmZpZ0RpclBhdGgsICdnaXRodWIuY3NvbicpO1xuICAgIHRoaXMuY3VycmVudFdpbmRvdyA9IGN1cnJlbnRXaW5kb3c7XG5cbiAgICB0aGlzLnN0eWxlQ2FsY3VsYXRvciA9IG5ldyBTdHlsZUNhbGN1bGF0b3IodGhpcy5zdHlsZXMsIHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLmNvbmZpcm0gPSBjb25maXJtO1xuICAgIHRoaXMuc3RhcnRPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0IGNyaXRlcmlhID0ge1xuICAgICAgcHJvamVjdFBhdGhDb3VudDogdGhpcy5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoLFxuICAgICAgaW5pdFBhdGhDb3VudDogKGdldExvYWRTZXR0aW5ncygpLmluaXRpYWxQYXRocyB8fCBbXSkubGVuZ3RoLFxuICAgIH07XG5cbiAgICB0aGlzLnBpcGVsaW5lTWFuYWdlciA9IGdldFJlcG9QaXBlbGluZU1hbmFnZXIoe2NvbmZpcm0sIG5vdGlmaWNhdGlvbk1hbmFnZXIsIHdvcmtzcGFjZX0pO1xuXG4gICAgdGhpcy5hY3RpdmVDb250ZXh0UXVldWUgPSBuZXcgQXN5bmNRdWV1ZSgpO1xuICAgIHRoaXMuZ3Vlc3NlZENvbnRleHQgPSBXb3JrZGlyQ29udGV4dC5ndWVzcyhjcml0ZXJpYSwgdGhpcy5waXBlbGluZU1hbmFnZXIpO1xuICAgIHRoaXMuYWN0aXZlQ29udGV4dCA9IHRoaXMuZ3Vlc3NlZENvbnRleHQ7XG4gICAgdGhpcy5sb2NrZWRDb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLndvcmtkaXJDYWNoZSA9IG5ldyBXb3JrZGlyQ2FjaGUoKTtcbiAgICB0aGlzLmNvbnRleHRQb29sID0gbmV3IFdvcmtkaXJDb250ZXh0UG9vbCh7XG4gICAgICB3aW5kb3csXG4gICAgICB3b3Jrc3BhY2UsXG4gICAgICBwcm9tcHRDYWxsYmFjazogcXVlcnkgPT4gdGhpcy5jb250cm9sbGVyLm9wZW5DcmVkZW50aWFsc0RpYWxvZyhxdWVyeSksXG4gICAgICBwaXBlbGluZU1hbmFnZXI6IHRoaXMucGlwZWxpbmVNYW5hZ2VyLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zd2l0Y2hib2FyZCA9IG5ldyBTd2l0Y2hib2FyZCgpO1xuXG4gICAgdGhpcy5sb2dpbk1vZGVsID0gbG9naW5Nb2RlbCB8fCBuZXcgR2l0aHViTG9naW5Nb2RlbCgpO1xuICAgIHRoaXMucmVuZGVyRm4gPSByZW5kZXJGbiB8fCAoKGNvbXBvbmVudCwgbm9kZSwgY2FsbGJhY2spID0+IHtcbiAgICAgIHJldHVybiBSZWFjdERvbS5yZW5kZXIoY29tcG9uZW50LCBub2RlLCBjYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnRzIGZyb20gYWxsIHJlc2lkZW50IGNvbnRleHRzLlxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgdGhpcy5jb250ZXh0UG9vbC5vbkRpZENoYW5nZVdvcmtkaXJPckhlYWQoY29udGV4dCA9PiB7XG4gICAgICAgIHRoaXMucmVmcmVzaEF0b21HaXRSZXBvc2l0b3J5KGNvbnRleHQuZ2V0V29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5jb250ZXh0UG9vbC5vbkRpZFVwZGF0ZVJlcG9zaXRvcnkoY29udGV4dCA9PiB7XG4gICAgICAgIHRoaXMuc3dpdGNoYm9hcmQuZGlkVXBkYXRlUmVwb3NpdG9yeShjb250ZXh0LmdldFJlcG9zaXRvcnkoKSk7XG4gICAgICB9KSxcbiAgICAgIHRoaXMuY29udGV4dFBvb2wub25EaWREZXN0cm95UmVwb3NpdG9yeShjb250ZXh0ID0+IHtcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IHRoaXMuYWN0aXZlQ29udGV4dCkge1xuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlQ29udGV4dChXb3JrZGlyQ29udGV4dC5hYnNlbnQoe3BpcGVsaW5lTWFuYWdlcjogdGhpcy5waXBlbGluZU1hbmFnZXJ9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgQ29udGV4dE1lbnVJbnRlcmNlcHRvcixcbiAgICApO1xuXG4gICAgdGhpcy5zZXR1cFlhcmRzdGljaygpO1xuICB9XG5cbiAgc2V0dXBZYXJkc3RpY2soKSB7XG4gICAgY29uc3Qgc3RhZ2luZ1NlcmllcyA9IFsnc3RhZ2VMaW5lJywgJ3N0YWdlSHVuaycsICd1bnN0YWdlTGluZScsICd1bnN0YWdlSHVuayddO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIC8vIFN0YWdpbmcgYW5kIHVuc3RhZ2luZyBvcGVyYXRpb25zXG4gICAgICB0aGlzLnN3aXRjaGJvYXJkLm9uRGlkQmVnaW5TdGFnZU9wZXJhdGlvbihwYXlsb2FkID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuc3RhZ2UgJiYgcGF5bG9hZC5saW5lKSB7XG4gICAgICAgICAgeWFyZHN0aWNrLmJlZ2luKCdzdGFnZUxpbmUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnN0YWdlICYmIHBheWxvYWQuaHVuaykge1xuICAgICAgICAgIHlhcmRzdGljay5iZWdpbignc3RhZ2VIdW5rJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5zdGFnZSAmJiBwYXlsb2FkLmZpbGUpIHtcbiAgICAgICAgICB5YXJkc3RpY2suYmVnaW4oJ3N0YWdlRmlsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQuc3RhZ2UgJiYgcGF5bG9hZC5tb2RlKSB7XG4gICAgICAgICAgeWFyZHN0aWNrLmJlZ2luKCdzdGFnZU1vZGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnN0YWdlICYmIHBheWxvYWQuc3ltbGluaykge1xuICAgICAgICAgIHlhcmRzdGljay5iZWdpbignc3RhZ2VTeW1saW5rJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC51bnN0YWdlICYmIHBheWxvYWQubGluZSkge1xuICAgICAgICAgIHlhcmRzdGljay5iZWdpbigndW5zdGFnZUxpbmUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnVuc3RhZ2UgJiYgcGF5bG9hZC5odW5rKSB7XG4gICAgICAgICAgeWFyZHN0aWNrLmJlZ2luKCd1bnN0YWdlSHVuaycpO1xuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQudW5zdGFnZSAmJiBwYXlsb2FkLmZpbGUpIHtcbiAgICAgICAgICB5YXJkc3RpY2suYmVnaW4oJ3Vuc3RhZ2VGaWxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC51bnN0YWdlICYmIHBheWxvYWQubW9kZSkge1xuICAgICAgICAgIHlhcmRzdGljay5iZWdpbigndW5zdGFnZU1vZGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnVuc3RhZ2UgJiYgcGF5bG9hZC5zeW1saW5rKSB7XG4gICAgICAgICAgeWFyZHN0aWNrLmJlZ2luKCd1bnN0YWdlU3ltbGluaycpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHRoaXMuc3dpdGNoYm9hcmQub25EaWRVcGRhdGVSZXBvc2l0b3J5KCgpID0+IHtcbiAgICAgICAgeWFyZHN0aWNrLm1hcmsoc3RhZ2luZ1NlcmllcywgJ3VwZGF0ZS1yZXBvc2l0b3J5Jyk7XG4gICAgICB9KSxcbiAgICAgIHRoaXMuc3dpdGNoYm9hcmQub25EaWRGaW5pc2hSZW5kZXIoY29udGV4dCA9PiB7XG4gICAgICAgIGlmIChjb250ZXh0ID09PSAnUm9vdENvbnRyb2xsZXIuc2hvd0ZpbGVQYXRjaEZvclBhdGgnKSB7XG4gICAgICAgICAgeWFyZHN0aWNrLmZpbmlzaChzdGFnaW5nU2VyaWVzKTtcbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIC8vIEFjdGl2ZSBjb250ZXh0IGNoYW5nZXNcbiAgICAgIHRoaXMuc3dpdGNoYm9hcmQub25EaWRTY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUoKCkgPT4ge1xuICAgICAgICB5YXJkc3RpY2suYmVnaW4oJ2FjdGl2ZUNvbnRleHRDaGFuZ2UnKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5zd2l0Y2hib2FyZC5vbkRpZEJlZ2luQWN0aXZlQ29udGV4dFVwZGF0ZSgoKSA9PiB7XG4gICAgICAgIHlhcmRzdGljay5tYXJrKCdhY3RpdmVDb250ZXh0Q2hhbmdlJywgJ3F1ZXVlLXdhaXQnKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5zd2l0Y2hib2FyZC5vbkRpZEZpbmlzaENvbnRleHRDaGFuZ2VSZW5kZXIoKCkgPT4ge1xuICAgICAgICB5YXJkc3RpY2subWFyaygnYWN0aXZlQ29udGV4dENoYW5nZScsICdyZW5kZXInKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5zd2l0Y2hib2FyZC5vbkRpZEZpbmlzaEFjdGl2ZUNvbnRleHRVcGRhdGUoKCkgPT4ge1xuICAgICAgICB5YXJkc3RpY2suZmluaXNoKCdhY3RpdmVDb250ZXh0Q2hhbmdlJyk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgYWN0aXZhdGUoc3RhdGUgPSB7fSkge1xuICAgIGNvbnN0IHNhdmVkU3RhdGUgPSB7Li4uZGVmYXVsdFN0YXRlLCAuLi5zdGF0ZX07XG5cbiAgICBjb25zdCBmaXJzdFJ1biA9ICFhd2FpdCBmaWxlRXhpc3RzKHRoaXMuY29uZmlnUGF0aCk7XG4gICAgY29uc3QgbmV3UHJvamVjdCA9IHNhdmVkU3RhdGUuZmlyc3RSdW4gIT09IHVuZGVmaW5lZCA/IHNhdmVkU3RhdGUuZmlyc3RSdW4gOiBzYXZlZFN0YXRlLm5ld1Byb2plY3Q7XG5cbiAgICB0aGlzLnN0YXJ0T3BlbiA9IGZpcnN0UnVuIHx8IG5ld1Byb2plY3Q7XG4gICAgdGhpcy5zdGFydFJldmVhbGVkID0gZmlyc3RSdW4gJiYgIXRoaXMuY29uZmlnLmdldCgnd2VsY29tZS5zaG93T25TdGFydHVwJyk7XG5cbiAgICBpZiAoZmlyc3RSdW4pIHtcbiAgICAgIGF3YWl0IGZzLndyaXRlRmlsZSh0aGlzLmNvbmZpZ1BhdGgsICcjIFN0b3JlIG5vbi12aXNpYmxlIEdpdEh1YiBwYWNrYWdlIHN0YXRlLlxcbicsIHtlbmNvZGluZzogJ3V0ZjgnfSk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzU2VsZWN0ZWRGaWxlcyA9IGV2ZW50ID0+IHtcbiAgICAgIHJldHVybiAhIWV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZ2l0aHViLUZpbGVQYXRjaExpc3RWaWV3JykucXVlcnlTZWxlY3RvcignLmlzLXNlbGVjdGVkJyk7XG4gICAgfTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHRoaXMuaGFuZGxlQWN0aXZlUGFuZUl0ZW1DaGFuZ2UpLFxuICAgICAgdGhpcy5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5oYW5kbGVQcm9qZWN0UGF0aHNDaGFuZ2UpLFxuICAgICAgdGhpcy5zdHlsZUNhbGN1bGF0b3Iuc3RhcnRXYXRjaGluZyhcbiAgICAgICAgJ2dpdGh1Yi1wYWNrYWdlLXN0eWxlcycsXG4gICAgICAgIFsnZWRpdG9yLmZvbnRTaXplJywgJ2VkaXRvci5mb250RmFtaWx5JywgJ2VkaXRvci5saW5lSGVpZ2h0JywgJ2VkaXRvci50YWJMZW5ndGgnXSxcbiAgICAgICAgY29uZmlnID0+IGBcbiAgICAgICAgICAuZ2l0aHViLUh1bmtWaWV3LWxpbmUge1xuICAgICAgICAgICAgZm9udC1mYW1pbHk6ICR7Y29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKX07XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogJHtjb25maWcuZ2V0KCdlZGl0b3IubGluZUhlaWdodCcpfTtcbiAgICAgICAgICAgIHRhYi1zaXplOiAke2NvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnKX1cbiAgICAgICAgICB9XG4gICAgICAgIGAsXG4gICAgICApLFxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnLmdpdGh1Yi1VbnN0YWdlZENoYW5nZXMgLmdpdGh1Yi1GaWxlUGF0Y2hMaXN0Vmlldyc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ1N0YWdlJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdjb3JlOmNvbmZpcm0nLFxuICAgICAgICAgICAgc2hvdWxkRGlzcGxheTogaGFzU2VsZWN0ZWRGaWxlcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdzZXBhcmF0b3InLFxuICAgICAgICAgICAgc2hvdWxkRGlzcGxheTogaGFzU2VsZWN0ZWRGaWxlcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGlzY2FyZCBDaGFuZ2VzJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdnaXRodWI6ZGlzY2FyZC1jaGFuZ2VzLWluLXNlbGVjdGVkLWZpbGVzJyxcbiAgICAgICAgICAgIHNob3VsZERpc3BsYXk6IGhhc1NlbGVjdGVkRmlsZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgJy5naXRodWItU3RhZ2VkQ2hhbmdlcyAuZ2l0aHViLUZpbGVQYXRjaExpc3RWaWV3JzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnVW5zdGFnZScsXG4gICAgICAgICAgICBjb21tYW5kOiAnY29yZTpjb25maXJtJyxcbiAgICAgICAgICAgIHNob3VsZERpc3BsYXk6IGhhc1NlbGVjdGVkRmlsZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgJy5naXRodWItTWVyZ2VDb25mbGljdFBhdGhzIC5naXRodWItRmlsZVBhdGNoTGlzdFZpZXcnOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdTdGFnZScsXG4gICAgICAgICAgICBjb21tYW5kOiAnY29yZTpjb25maXJtJyxcbiAgICAgICAgICAgIHNob3VsZERpc3BsYXk6IGhhc1NlbGVjdGVkRmlsZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJyxcbiAgICAgICAgICAgIHNob3VsZERpc3BsYXk6IGhhc1NlbGVjdGVkRmlsZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ1Jlc29sdmUgRmlsZSBBcyBPdXJzJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdnaXRodWI6cmVzb2x2ZS1maWxlLWFzLW91cnMnLFxuICAgICAgICAgICAgc2hvdWxkRGlzcGxheTogaGFzU2VsZWN0ZWRGaWxlcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnUmVzb2x2ZSBGaWxlIEFzIFRoZWlycycsXG4gICAgICAgICAgICBjb21tYW5kOiAnZ2l0aHViOnJlc29sdmUtZmlsZS1hcy10aGVpcnMnLFxuICAgICAgICAgICAgc2hvdWxkRGlzcGxheTogaGFzU2VsZWN0ZWRGaWxlcyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgKTtcblxuICAgIHRoaXMuYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLnNjaGVkdWxlQWN0aXZlQ29udGV4dFVwZGF0ZSh7XG4gICAgICB1c2VQYXRoOiBzYXZlZFN0YXRlLmFjdGl2ZVJlcG9zaXRvcnlQYXRoLFxuICAgICAgbG9jazogc2F2ZWRTdGF0ZS5jb250ZXh0TG9ja2VkLFxuICAgIH0pO1xuICAgIHRoaXMucmVyZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZUFjdGl2ZVBhbmVJdGVtQ2hhbmdlID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLmxvY2tlZENvbnRleHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtUGF0aCA9IHBhdGhGb3JQYW5lSXRlbSh0aGlzLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpKTtcbiAgICB0aGlzLnNjaGVkdWxlQWN0aXZlQ29udGV4dFVwZGF0ZSh7XG4gICAgICB1c2VQYXRoOiBpdGVtUGF0aCxcbiAgICAgIGxvY2s6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlUHJvamVjdFBhdGhzQ2hhbmdlID0gKCkgPT4ge1xuICAgIHRoaXMuc2NoZWR1bGVBY3RpdmVDb250ZXh0VXBkYXRlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdGl2ZVJlcG9zaXRvcnlQYXRoOiB0aGlzLmdldEFjdGl2ZVdvcmtkaXIoKSxcbiAgICAgIGNvbnRleHRMb2NrZWQ6IEJvb2xlYW4odGhpcy5sb2NrZWRDb250ZXh0KSxcbiAgICAgIG5ld1Byb2plY3Q6IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICByZXJlbmRlcihjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLndvcmtzcGFjZS5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBSZWFjdERvbS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmVsZW1lbnQ7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbmdlV29ya2luZ0RpcmVjdG9yeSA9IHdvcmtpbmdEaXJlY3RvcnkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVBY3RpdmVDb250ZXh0VXBkYXRlKHt1c2VQYXRoOiB3b3JraW5nRGlyZWN0b3J5fSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHNldENvbnRleHRMb2NrID0gKHdvcmtpbmdEaXJlY3RvcnksIGxvY2spID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlQWN0aXZlQ29udGV4dFVwZGF0ZSh7dXNlUGF0aDogd29ya2luZ0RpcmVjdG9yeSwgbG9ja30pO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlckZuKFxuICAgICAgPFJvb3RDb250cm9sbGVyXG4gICAgICAgIHJlZj17YyA9PiB7IHRoaXMuY29udHJvbGxlciA9IGM7IH19XG4gICAgICAgIHdvcmtzcGFjZT17dGhpcy53b3Jrc3BhY2V9XG4gICAgICAgIGRlc2VyaWFsaXplcnM9e3RoaXMuZGVzZXJpYWxpemVyc31cbiAgICAgICAgY29tbWFuZHM9e3RoaXMuY29tbWFuZHN9XG4gICAgICAgIG5vdGlmaWNhdGlvbk1hbmFnZXI9e3RoaXMubm90aWZpY2F0aW9uTWFuYWdlcn1cbiAgICAgICAgdG9vbHRpcHM9e3RoaXMudG9vbHRpcHN9XG4gICAgICAgIGdyYW1tYXJzPXt0aGlzLmdyYW1tYXJzfVxuICAgICAgICBrZXltYXBzPXt0aGlzLmtleW1hcHN9XG4gICAgICAgIGNvbmZpZz17dGhpcy5jb25maWd9XG4gICAgICAgIHByb2plY3Q9e3RoaXMucHJvamVjdH1cbiAgICAgICAgY29uZmlybT17dGhpcy5jb25maXJtfVxuICAgICAgICBjdXJyZW50V2luZG93PXt0aGlzLmN1cnJlbnRXaW5kb3d9XG4gICAgICAgIHdvcmtkaXJDb250ZXh0UG9vbD17dGhpcy5jb250ZXh0UG9vbH1cbiAgICAgICAgbG9naW5Nb2RlbD17dGhpcy5sb2dpbk1vZGVsfVxuICAgICAgICByZXBvc2l0b3J5PXt0aGlzLmdldEFjdGl2ZVJlcG9zaXRvcnkoKX1cbiAgICAgICAgcmVzb2x1dGlvblByb2dyZXNzPXt0aGlzLmdldEFjdGl2ZVJlc29sdXRpb25Qcm9ncmVzcygpfVxuICAgICAgICBzdGF0dXNCYXI9e3RoaXMuc3RhdHVzQmFyfVxuICAgICAgICBpbml0aWFsaXplPXt0aGlzLmluaXRpYWxpemV9XG4gICAgICAgIGNsb25lPXt0aGlzLmNsb25lfVxuICAgICAgICBzd2l0Y2hib2FyZD17dGhpcy5zd2l0Y2hib2FyZH1cbiAgICAgICAgc3RhcnRPcGVuPXt0aGlzLnN0YXJ0T3Blbn1cbiAgICAgICAgc3RhcnRSZXZlYWxlZD17dGhpcy5zdGFydFJldmVhbGVkfVxuICAgICAgICByZW1vdmVGaWxlUGF0Y2hJdGVtPXt0aGlzLnJlbW92ZUZpbGVQYXRjaEl0ZW19XG4gICAgICAgIGN1cnJlbnRXb3JrRGlyPXt0aGlzLmdldEFjdGl2ZVdvcmtkaXIoKX1cbiAgICAgICAgY29udGV4dExvY2tlZD17dGhpcy5sb2NrZWRDb250ZXh0ICE9PSBudWxsfVxuICAgICAgICBjaGFuZ2VXb3JraW5nRGlyZWN0b3J5PXtjaGFuZ2VXb3JraW5nRGlyZWN0b3J5fVxuICAgICAgICBzZXRDb250ZXh0TG9jaz17c2V0Q29udGV4dExvY2t9XG4gICAgICAvPiwgdGhpcy5lbGVtZW50LCBjYWxsYmFjayxcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuY29udGV4dFBvb2wuY2xlYXIoKTtcbiAgICBXb3JrZXJNYW5hZ2VyLnJlc2V0KGZhbHNlKTtcbiAgICBpZiAodGhpcy5ndWVzc2VkQ29udGV4dCkge1xuICAgICAgdGhpcy5ndWVzc2VkQ29udGV4dC5kZXN0cm95KCk7XG4gICAgICB0aGlzLmd1ZXNzZWRDb250ZXh0ID0gbnVsbDtcbiAgICB9XG4gICAgYXdhaXQgeWFyZHN0aWNrLmZsdXNoKCk7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyO1xuICAgIHRoaXMucmVyZW5kZXIoKTtcbiAgfVxuXG4gIGNvbnN1bWVSZXBvcnRlcihyZXBvcnRlcikge1xuICAgIHJlcG9ydGVyUHJveHkuc2V0UmVwb3J0ZXIocmVwb3J0ZXIpO1xuICB9XG5cbiAgY3JlYXRlR2l0VGltaW5nc1ZpZXcoKSB7XG4gICAgcmV0dXJuIFN0dWJJdGVtLmNyZWF0ZSgnZ2l0LXRpbWluZ3MtdmlldycsIHtcbiAgICAgIHRpdGxlOiAnR2l0SHViIFBhY2thZ2UgVGltaW5ncyBWaWV3JyxcbiAgICB9LCBHaXRUaW1pbmdzVmlldy5idWlsZFVSSSgpKTtcbiAgfVxuXG4gIGNyZWF0ZUlzc3VlaXNoUGFuZUl0ZW1TdHViKHt1cmksIHNlbGVjdGVkVGFifSkge1xuICAgIHJldHVybiBTdHViSXRlbS5jcmVhdGUoJ2lzc3VlaXNoLWRldGFpbC1pdGVtJywge1xuICAgICAgdGl0bGU6ICdJc3N1ZWlzaCcsXG4gICAgICBpbml0U2VsZWN0ZWRUYWI6IHNlbGVjdGVkVGFiLFxuICAgIH0sIHVyaSk7XG4gIH1cblxuICBjcmVhdGVEb2NrSXRlbVN0dWIoe3VyaX0pIHtcbiAgICBsZXQgaXRlbTtcbiAgICBzd2l0Y2ggKHVyaSkge1xuICAgIC8vIGFsd2F5cyByZXR1cm4gYW4gZW1wdHkgc3R1YlxuICAgIC8vIGJ1dCBvbmx5IHNldCBpdCBhcyB0aGUgYWN0aXZlIGl0ZW0gZm9yIGEgdGFiIHR5cGVcbiAgICAvLyBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3RcbiAgICBjYXNlICdhdG9tLWdpdGh1YjovL2RvY2staXRlbS9naXQnOlxuICAgICAgaXRlbSA9IHRoaXMuY3JlYXRlR2l0U3R1Yih1cmkpO1xuICAgICAgdGhpcy5naXRUYWJTdHViSXRlbSA9IHRoaXMuZ2l0VGFiU3R1Ykl0ZW0gfHwgaXRlbTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2F0b20tZ2l0aHViOi8vZG9jay1pdGVtL2dpdGh1Yic6XG4gICAgICBpdGVtID0gdGhpcy5jcmVhdGVHaXRIdWJTdHViKHVyaSk7XG4gICAgICB0aGlzLmdpdGh1YlRhYlN0dWJJdGVtID0gdGhpcy5naXRodWJUYWJTdHViSXRlbSB8fCBpdGVtO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBEb2NrSXRlbSBzdHViIFVSSTogJHt1cml9YCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgdGhpcy5yZXJlbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGNyZWF0ZUdpdFN0dWIodXJpKSB7XG4gICAgcmV0dXJuIFN0dWJJdGVtLmNyZWF0ZSgnZ2l0Jywge1xuICAgICAgdGl0bGU6ICdHaXQnLFxuICAgIH0sIHVyaSk7XG4gIH1cblxuICBjcmVhdGVHaXRIdWJTdHViKHVyaSkge1xuICAgIHJldHVybiBTdHViSXRlbS5jcmVhdGUoJ2dpdGh1YicsIHtcbiAgICAgIHRpdGxlOiAnR2l0SHViJyxcbiAgICB9LCB1cmkpO1xuICB9XG5cbiAgY3JlYXRlRmlsZVBhdGNoQ29udHJvbGxlclN0dWIoe3VyaX0gPSB7fSkge1xuICAgIGNvbnN0IGl0ZW0gPSBTdHViSXRlbS5jcmVhdGUoJ2dpdC1maWxlLXBhdGNoLWNvbnRyb2xsZXInLCB7XG4gICAgICB0aXRsZTogJ0RpZmYnLFxuICAgIH0sIHVyaSk7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgdGhpcy5yZXJlbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGNyZWF0ZUNvbW1pdFByZXZpZXdTdHViKHt1cml9KSB7XG4gICAgY29uc3QgaXRlbSA9IFN0dWJJdGVtLmNyZWF0ZSgnZ2l0LWNvbW1pdC1wcmV2aWV3Jywge1xuICAgICAgdGl0bGU6ICdDb21taXQgcHJldmlldycsXG4gICAgfSwgdXJpKTtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICB0aGlzLnJlcmVuZGVyKCk7XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgY3JlYXRlQ29tbWl0RGV0YWlsU3R1Yih7dXJpfSkge1xuICAgIGNvbnN0IGl0ZW0gPSBTdHViSXRlbS5jcmVhdGUoJ2dpdC1jb21taXQtZGV0YWlsJywge1xuICAgICAgdGl0bGU6ICdDb21taXQnLFxuICAgIH0sIHVyaSk7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgdGhpcy5yZXJlbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGNyZWF0ZVJldmlld3NTdHViKHt1cml9KSB7XG4gICAgY29uc3QgaXRlbSA9IFN0dWJJdGVtLmNyZWF0ZSgnZ2l0aHViLXJldmlld3MnLCB7XG4gICAgICB0aXRsZTogJ1Jldmlld3MnLFxuICAgIH0sIHVyaSk7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgdGhpcy5yZXJlbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGRlc3Ryb3lHaXRUYWJJdGVtKCkge1xuICAgIGlmICh0aGlzLmdpdFRhYlN0dWJJdGVtKSB7XG4gICAgICB0aGlzLmdpdFRhYlN0dWJJdGVtLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZ2l0VGFiU3R1Ykl0ZW0gPSBudWxsO1xuICAgICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgICB0aGlzLnJlcmVuZGVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveUdpdGh1YlRhYkl0ZW0oKSB7XG4gICAgaWYgKHRoaXMuZ2l0aHViVGFiU3R1Ykl0ZW0pIHtcbiAgICAgIHRoaXMuZ2l0aHViVGFiU3R1Ykl0ZW0uZGVzdHJveSgpO1xuICAgICAgdGhpcy5naXRodWJUYWJTdHViSXRlbSA9IG51bGw7XG4gICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgIHRoaXMucmVyZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplID0gYXN5bmMgcHJvamVjdFBhdGggPT4ge1xuICAgIGF3YWl0IGZzLm1rZGlycyhwcm9qZWN0UGF0aCk7XG5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gdGhpcy5jb250ZXh0UG9vbC5hZGQocHJvamVjdFBhdGgpLmdldFJlcG9zaXRvcnkoKTtcbiAgICBhd2FpdCByZXBvc2l0b3J5LmluaXQoKTtcbiAgICB0aGlzLndvcmtkaXJDYWNoZS5pbnZhbGlkYXRlKCk7XG5cbiAgICBpZiAoIXRoaXMucHJvamVjdC5jb250YWlucyhwcm9qZWN0UGF0aCkpIHtcbiAgICAgIHRoaXMucHJvamVjdC5hZGRQYXRoKHByb2plY3RQYXRoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnJlZnJlc2hBdG9tR2l0UmVwb3NpdG9yeShwcm9qZWN0UGF0aCk7XG4gICAgYXdhaXQgdGhpcy5zY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUoKTtcbiAgfVxuXG4gIGNsb25lID0gYXN5bmMgKHJlbW90ZVVybCwgcHJvamVjdFBhdGgsIHNvdXJjZVJlbW90ZU5hbWUgPSAnb3JpZ2luJykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNvbnRleHRQb29sLmdldENvbnRleHQocHJvamVjdFBhdGgpO1xuICAgIGxldCByZXBvc2l0b3J5O1xuICAgIGlmIChjb250ZXh0LmlzUHJlc2VudCgpKSB7XG4gICAgICByZXBvc2l0b3J5ID0gY29udGV4dC5nZXRSZXBvc2l0b3J5KCk7XG4gICAgICBhd2FpdCByZXBvc2l0b3J5LmNsb25lKHJlbW90ZVVybCwgc291cmNlUmVtb3RlTmFtZSk7XG4gICAgICByZXBvc2l0b3J5LmRlc3Ryb3koKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVwb3NpdG9yeSA9IG5ldyBSZXBvc2l0b3J5KHByb2plY3RQYXRoLCBudWxsLCB7cGlwZWxpbmVNYW5hZ2VyOiB0aGlzLnBpcGVsaW5lTWFuYWdlcn0pO1xuICAgICAgYXdhaXQgcmVwb3NpdG9yeS5jbG9uZShyZW1vdGVVcmwsIHNvdXJjZVJlbW90ZU5hbWUpO1xuICAgIH1cblxuICAgIHRoaXMud29ya2RpckNhY2hlLmludmFsaWRhdGUoKTtcbiAgICB0aGlzLnByb2plY3QuYWRkUGF0aChwcm9qZWN0UGF0aCk7XG4gICAgYXdhaXQgdGhpcy5zY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUoKTtcblxuICAgIHJlcG9ydGVyUHJveHkuYWRkRXZlbnQoJ2Nsb25lLXJlcG9zaXRvcnknLCB7cHJvamVjdDogJ2dpdGh1Yid9KTtcbiAgfVxuXG4gIGdldFJlcG9zaXRvcnlGb3JXb3JrZGlyKHByb2plY3RQYXRoKSB7XG4gICAgY29uc3QgbG9hZGluZ0d1ZXNzUmVwbyA9IFJlcG9zaXRvcnkubG9hZGluZ0d1ZXNzKHtwaXBlbGluZU1hbmFnZXI6IHRoaXMucGlwZWxpbmVNYW5hZ2VyfSk7XG4gICAgcmV0dXJuIHRoaXMuZ3Vlc3NlZENvbnRleHQgPyBsb2FkaW5nR3Vlc3NSZXBvIDogdGhpcy5jb250ZXh0UG9vbC5nZXRDb250ZXh0KHByb2plY3RQYXRoKS5nZXRSZXBvc2l0b3J5KCk7XG4gIH1cblxuICBnZXRBY3RpdmVXb3JrZGlyKCkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZUNvbnRleHQuZ2V0V29ya2luZ0RpcmVjdG9yeSgpO1xuICB9XG5cbiAgZ2V0QWN0aXZlUmVwb3NpdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVDb250ZXh0LmdldFJlcG9zaXRvcnkoKTtcbiAgfVxuXG4gIGdldEFjdGl2ZVJlc29sdXRpb25Qcm9ncmVzcygpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVDb250ZXh0LmdldFJlc29sdXRpb25Qcm9ncmVzcygpO1xuICB9XG5cbiAgZ2V0Q29udGV4dFBvb2woKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dFBvb2w7XG4gIH1cblxuICBnZXRTd2l0Y2hib2FyZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zd2l0Y2hib2FyZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnF1ZXVlIGEgcmVxdWVzdCB0byBtb2RpZnkgdGhlIGFjdGl2ZSBjb250ZXh0LlxuICAgKlxuICAgKiBvcHRpb25zOlxuICAgKiAgIHVzZVBhdGggLSBQYXRoIG9mIHRoZSBjb250ZXh0IHRvIHVzZSBhcyB0aGUgbmV4dCBjb250ZXh0LCBpZiBpdCBpcyBwcmVzZW50IGluIHRoZSBwb29sLlxuICAgKiAgIGxvY2sgLSBUcnVlIG9yIGZhbHNlIHRvIGxvY2sgdGhlIHVsdGltYXRlbHkgY2hvc2VuIGNvbnRleHQuIE9taXQgdG8gcHJlc2VydmUgdGhlIGN1cnJlbnQgbG9jayBzdGF0ZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSByZXF1ZXN0ZWQgY29udGV4dCB1cGRhdGUgaGFzIGNvbXBsZXRlZC4gTm90ZSB0aGF0IGl0J3NcbiAgICogKnBvc3NpYmxlKiBmb3IgdGhlIGFjdGl2ZSBjb250ZXh0IGFmdGVyIHJlc29sdXRpb24gdG8gZGlmZmVyIGZyb20gYSByZXF1ZXN0ZWQgYHVzZVBhdGhgLCBpZiB0aGUgd29ya2RpclxuICAgKiBjb250YWluaW5nIGB1c2VQYXRoYCBpcyBubyBsb25nZXIgYSB2aWFibGUgb3B0aW9uLCBzdWNoIGFzIGlmIGl0IGJlbG9uZ3MgdG8gYSBwcm9qZWN0IHRoYXQgaXMgbm8gbG9uZ2VyIHByZXNlbnQuXG4gICAqL1xuICBhc3luYyBzY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zd2l0Y2hib2FyZC5kaWRTY2hlZHVsZUFjdGl2ZUNvbnRleHRVcGRhdGUoKTtcbiAgICBhd2FpdCB0aGlzLmFjdGl2ZUNvbnRleHRRdWV1ZS5wdXNoKHRoaXMudXBkYXRlQWN0aXZlQ29udGV4dC5iaW5kKHRoaXMsIG9wdGlvbnMpLCB7cGFyYWxsZWw6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVyaXZlIHRoZSBnaXQgd29ya2luZyBkaXJlY3RvcnkgY29udGV4dCB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgcGFja2FnZSdzIGdpdCBvcGVyYXRpb25zIGJhc2VkIG9uIHRoZSBjdXJyZW50XG4gICAqIHN0YXRlIG9mIHRoZSBBdG9tIHdvcmtzcGFjZS4gSW4gcHJpb3JpdHksIHRoaXMgcHJlZmVyczpcbiAgICpcbiAgICogLSBXaGVuIGFjdGl2YXRpbmc6IHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0aGF0IHdhcyBhY3RpdmUgd2hlbiB0aGUgcGFja2FnZSB3YXMgbGFzdCBzZXJpYWxpemVkLCBpZiBpdCBzdGlsbCBhIHZpYWJsZVxuICAgKiAgIG9wdGlvbi4gKHVzZVBhdGgpXG4gICAqIC0gVGhlIHdvcmtpbmcgZGlyZWN0b3J5IGNob3NlbiBieSB0aGUgdXNlciBmcm9tIHRoZSBjb250ZXh0IHRpbGUgb24gdGhlIGdpdCBvciBHaXRIdWIgdGFicy4gKHVzZVBhdGgpXG4gICAqIC0gVGhlIHdvcmtpbmcgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIHBhdGggb2YgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gICAqIC0gQSBnaXQgd29ya2luZyBkaXJlY3RvcnkgY29ycmVzcG9uZGluZyB0byBcImZpcnN0XCIgcHJvamVjdCwgaWYgYW55IHByb2plY3RzIGFyZSBvcGVuLlxuICAgKiAtIFRoZSBjdXJyZW50IGNvbnRleHQsIHVuY2hhbmdlZCwgd2hpY2ggbWF5IGJlIGEgYE51bGxXb3JrZGlyQ29udGV4dGAuXG4gICAqXG4gICAqIEZpcnN0IHVwZGF0ZXMgdGhlIHBvb2wgb2YgcmVzaWRlbnQgY29udGV4dHMgdG8gbWF0Y2ggYWxsIGdpdCB3b3JraW5nIGRpcmVjdG9yaWVzIHRoYXQgY29ycmVzcG9uZCB0byBvcGVuXG4gICAqIHByb2plY3RzIGFuZCBwYW5lIGl0ZW1zLlxuICAgKi9cbiAgYXN5bmMgZ2V0TmV4dENvbnRleHQodXNlUGF0aCA9IG51bGwpIHtcbiAgICAvLyBJbnRlcm5hbCB1dGlsaXR5IGZ1bmN0aW9uIHRvIG5vcm1hbGl6ZSBwYXRocyBub3QgY29udGFpbmVkIHdpdGhpbiBhIGdpdFxuICAgIC8vIHdvcmtpbmcgdHJlZS5cbiAgICBjb25zdCB3b3JrZGlyRm9yTm9uR2l0UGF0aCA9IGFzeW5jIHNvdXJjZVBhdGggPT4ge1xuICAgICAgY29uc3QgY29udGFpbmluZ1Jvb3QgPSB0aGlzLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maW5kKHJvb3QgPT4gcm9vdC5jb250YWlucyhzb3VyY2VQYXRoKSk7XG4gICAgICBpZiAoY29udGFpbmluZ1Jvb3QpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5pbmdSb290LmdldFBhdGgoKTtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICB9IGVsc2UgaWYgKCEoYXdhaXQgZnMuc3RhdChzb3VyY2VQYXRoKSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICByZXR1cm4gcGF0aC5kaXJuYW1lKHNvdXJjZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEludGVybmFsIHV0aWxpdHkgZnVuY3Rpb24gdG8gaWRlbnRpZnkgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IHRvIHVzZSBmb3JcbiAgICAvLyBhbiBhcmJpdHJhcnkgKGZpbGUgb3IgZGlyZWN0b3J5KSBwYXRoLlxuICAgIGNvbnN0IHdvcmtkaXJGb3JQYXRoID0gYXN5bmMgc291cmNlUGF0aCA9PiB7XG4gICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy53b3JrZGlyQ2FjaGUuZmluZChzb3VyY2VQYXRoKSxcbiAgICAgICAgd29ya2RpckZvck5vbkdpdFBhdGgoc291cmNlUGF0aCksXG4gICAgICBdKSkuZmluZChCb29sZWFuKTtcbiAgICB9O1xuXG4gICAgLy8gSWRlbnRpZnkgcGF0aHMgdGhhdCAqY291bGQqIGNvbnRyaWJ1dGUgYSBnaXQgd29ya2luZyBkaXJlY3RvcnkgdG8gdGhlIHBvb2wuIFRoaXMgaXMgZHJhd24gZnJvbVxuICAgIC8vIHRoZSByb290cyBvZiBvcGVuIHByb2plY3RzLCB0aGUgY3VycmVudGx5IGxvY2tlZCBjb250ZXh0IGlmIG9uZSBpcyBwcmVzZW50LCBhbmQgdGhlIHBhdGggb2YgdGhlXG4gICAgLy8gb3BlbiB3b3Jrc3BhY2UgaXRlbS5cbiAgICBjb25zdCBjYW5kaWRhdGVQYXRocyA9IG5ldyBTZXQodGhpcy5wcm9qZWN0LmdldFBhdGhzKCkpO1xuICAgIGlmICh0aGlzLmxvY2tlZENvbnRleHQpIHtcbiAgICAgIGNvbnN0IGxvY2tlZFJlcG8gPSB0aGlzLmxvY2tlZENvbnRleHQuZ2V0UmVwb3NpdG9yeSgpO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChsb2NrZWRSZXBvKSB7XG4gICAgICAgIGNhbmRpZGF0ZVBhdGhzLmFkZChsb2NrZWRSZXBvLmdldFdvcmtpbmdEaXJlY3RvcnlQYXRoKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhY3RpdmVJdGVtUGF0aCA9IHBhdGhGb3JQYW5lSXRlbSh0aGlzLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpKTtcbiAgICBpZiAoYWN0aXZlSXRlbVBhdGgpIHtcbiAgICAgIGNhbmRpZGF0ZVBhdGhzLmFkZChhY3RpdmVJdGVtUGF0aCk7XG4gICAgfVxuXG4gICAgbGV0IGFjdGl2ZUl0ZW1Xb3JrZGlyID0gbnVsbDtcbiAgICBsZXQgZmlyc3RQcm9qZWN0V29ya2RpciA9IG51bGw7XG5cbiAgICAvLyBDb252ZXJ0IHRoZSBjYW5kaWRhdGUgcGF0aHMgaW50byB0aGUgc2V0IG9mIHZpYWJsZSBnaXQgd29ya2luZyBkaXJlY3RvcmllcywgYnkgbWVhbnMgb2YgYSBjYWNoZWRcbiAgICAvLyBgZ2l0IHJldi1wYXJzZWAgY2FsbC4gQ2FuZGlkYXRlIHBhdGhzIHRoYXQgYXJlIG5vdCBjb250YWluZWQgd2l0aGluIGEgZ2l0IHdvcmtpbmcgZGlyZWN0b3J5IHdpbGxcbiAgICAvLyBiZSBwcmVzZXJ2ZWQgYXMtaXMgd2l0aGluIHRoZSBwb29sLCB0byBhbGxvdyB1c2VycyB0byBpbml0aWFsaXplIHRoZW0uXG4gICAgY29uc3Qgd29ya2RpcnMgPSBuZXcgU2V0KFxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEFycmF5LmZyb20oY2FuZGlkYXRlUGF0aHMsIGFzeW5jIGNhbmRpZGF0ZVBhdGggPT4ge1xuICAgICAgICAgIGNvbnN0IHdvcmtkaXIgPSBhd2FpdCB3b3JrZGlyRm9yUGF0aChjYW5kaWRhdGVQYXRoKTtcblxuICAgICAgICAgIC8vIE5vdGUgdGhlIHdvcmtkaXJzIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWN0aXZlIHBhbmUgaXRlbSBhbmQgdGhlIGZpcnN0IG9wZW4gcHJvamVjdCBzbyB3ZSBjYW5cbiAgICAgICAgICAvLyBwcmVmZXIgdGhlbSBsYXRlci5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlUGF0aCA9PT0gYWN0aXZlSXRlbVBhdGgpIHtcbiAgICAgICAgICAgIGFjdGl2ZUl0ZW1Xb3JrZGlyID0gd29ya2RpcjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNhbmRpZGF0ZVBhdGggPT09IHRoaXMucHJvamVjdC5nZXRQYXRocygpWzBdKSB7XG4gICAgICAgICAgICBmaXJzdFByb2plY3RXb3JrZGlyID0gd29ya2RpcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gd29ya2RpcjtcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICk7XG5cbiAgICAvLyBVcGRhdGUgcG9vbCB3aXRoIHRoZSBpZGVudGlmaWVkIHByb2plY3RzLlxuICAgIHRoaXMuY29udGV4dFBvb2wuc2V0KHdvcmtkaXJzKTtcblxuICAgIC8vIDEgLSBFeHBsaWNpdGx5IHJlcXVlc3RlZCB3b3JrZGlyLiBUaGlzIGlzIGVpdGhlciBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIGEgY29udGV4dCB0aWxlIG9yXG4gICAgLy8gICAgIGRlc2VyaWFsaXplZCBmcm9tIHBhY2thZ2Ugc3RhdGUuIENob29zZSB0aGlzIGNvbnRleHQgb25seSBpZiBpdCBzdGlsbCBleGlzdHMgaW4gdGhlIHBvb2wuXG4gICAgaWYgKHVzZVBhdGgpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB1c2VQYXRoIGluIGEgc2ltaWxhciBmYXNoaW9uIHRvIHRoZSB3YXkgd2UgZG8gYWN0aXZlSXRlbVBhdGguXG4gICAgICBsZXQgdXNlV29ya2RpciA9IHVzZVBhdGg7XG4gICAgICBpZiAodXNlUGF0aCA9PT0gYWN0aXZlSXRlbVBhdGgpIHtcbiAgICAgICAgdXNlV29ya2RpciA9IGFjdGl2ZUl0ZW1Xb3JrZGlyO1xuICAgICAgfSBlbHNlIGlmICh1c2VQYXRoID09PSB0aGlzLnByb2plY3QuZ2V0UGF0aHMoKVswXSkge1xuICAgICAgICB1c2VXb3JrZGlyID0gZmlyc3RQcm9qZWN0V29ya2RpcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVzZVdvcmtkaXIgPSBhd2FpdCB3b3JrZGlyRm9yUGF0aCh1c2VQYXRoKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RhdGVDb250ZXh0ID0gdGhpcy5jb250ZXh0UG9vbC5nZXRDb250ZXh0KHVzZVdvcmtkaXIpO1xuICAgICAgaWYgKHN0YXRlQ29udGV4dC5pc1ByZXNlbnQoKSkge1xuICAgICAgICByZXR1cm4gc3RhdGVDb250ZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIgLSBVc2UgdGhlIGN1cnJlbnRseSBsb2NrZWQgY29udGV4dCwgaWYgb25lIGlzIHByZXNlbnQuXG4gICAgaWYgKHRoaXMubG9ja2VkQ29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9ja2VkQ29udGV4dDtcbiAgICB9XG5cbiAgICAvLyAzIC0gRm9sbG93IHRoZSBhY3RpdmUgd29ya3NwYWNlIHBhbmUgaXRlbS5cbiAgICBpZiAoYWN0aXZlSXRlbVdvcmtkaXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHRQb29sLmdldENvbnRleHQoYWN0aXZlSXRlbVdvcmtkaXIpO1xuICAgIH1cblxuICAgIC8vIDQgLSBUaGUgZmlyc3Qgb3BlbiBwcm9qZWN0LlxuICAgIGlmIChmaXJzdFByb2plY3RXb3JrZGlyKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0UG9vbC5nZXRDb250ZXh0KGZpcnN0UHJvamVjdFdvcmtkaXIpO1xuICAgIH1cblxuICAgIC8vIE5vIHByb2plY3RzLiBSZXZlcnQgdG8gdGhlIGFic2VudCBjb250ZXh0IHVubGVzcyB3ZSd2ZSBndWVzc2VkIHRoYXQgbW9yZSBwcm9qZWN0cyBhcmUgb24gdGhlIHdheS5cbiAgICBpZiAodGhpcy5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID09PSAwICYmICF0aGlzLmFjdGl2ZUNvbnRleHQuZ2V0UmVwb3NpdG9yeSgpLmlzVW5kZXRlcm1pbmVkKCkpIHtcbiAgICAgIHJldHVybiBXb3JrZGlyQ29udGV4dC5hYnNlbnQoe3BpcGVsaW5lTWFuYWdlcjogdGhpcy5waXBlbGluZU1hbmFnZXJ9KTtcbiAgICB9XG5cbiAgICAvLyBJdCBpcyBvbmx5IHBvc3NpYmxlIHRvIHJlYWNoIGhlcmUgaWYgdGhlcmUgdGhlcmUgd2FzIG5vIHByZWZlcnJlZCBkaXJlY3RvcnksIHRoZXJlIGFyZSBubyBwcm9qZWN0IHBhdGhzLCBhbmQgdGhlXG4gICAgLy8gdGhlIGFjdGl2ZSBjb250ZXh0J3MgcmVwb3NpdG9yeSBpcyBub3QgdW5kZXRlcm1pbmVkLiBQcmVzZXJ2ZSB0aGUgZXhpc3RpbmcgYWN0aXZlIGNvbnRleHQuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlQ29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZnkgdGhlIGFjdGl2ZSBjb250ZXh0IGFuZCByZS1yZW5kZXIgdGhlIFJlYWN0IHRyZWUuIFRoaXMgc2hvdWxkIG9ubHkgYmUgZG9uZSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBjb250ZXh0IHVwZGF0ZSBxdWV1ZTsgdXNlIHNjaGVkdWxlQWN0aXZlQ29udGV4dFVwZGF0ZSgpIHRvIGRvIHRoaXMuXG4gICAqXG4gICAqIG5leHRBY3RpdmVDb250ZXh0IC0gVGhlIFdvcmtkaXJDb250ZXh0IHRvIG1ha2UgYWN0aXZlIG5leHQsIGFzIGRlcml2ZWQgZnJvbSB0aGUgY3VycmVudCB3b3Jrc3BhY2VcbiAgICogICBzdGF0ZSBieSBnZXROZXh0Q29udGV4dCgpLiBUaGlzIG1heSBiZSBhYnNlbnQgb3IgdW5kZXRlcm1pbmVkLlxuICAgKiBsb2NrIC0gSWYgdHJ1ZSwgYWxzbyBzZXQgdGhpcyBjb250ZXh0IGFzIHRoZSBcImxvY2tlZFwiIG9uZSBhbmQgZW5nYWdlIHRoZSBjb250ZXh0IGxvY2sgaWYgaXQgaXNuJ3RcbiAgICogICBhbHJlYWR5LiBJZiBmYWxzZSwgY2xlYXIgYW55IGV4aXN0aW5nIGNvbnRleHQgbG9jay4gSWYgbnVsbCBvciB1bmRlZmluZWQsIGxlYXZlIHRoZSBsb2NrIGluIGl0c1xuICAgKiAgIGV4aXN0aW5nIHN0YXRlLlxuICAgKi9cbiAgc2V0QWN0aXZlQ29udGV4dChuZXh0QWN0aXZlQ29udGV4dCwgbG9jaykge1xuICAgIGlmIChuZXh0QWN0aXZlQ29udGV4dCAhPT0gdGhpcy5hY3RpdmVDb250ZXh0KSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmVDb250ZXh0ID09PSB0aGlzLmd1ZXNzZWRDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZ3Vlc3NlZENvbnRleHQuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmd1ZXNzZWRDb250ZXh0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZlQ29udGV4dCA9IG5leHRBY3RpdmVDb250ZXh0O1xuICAgICAgaWYgKGxvY2sgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5sb2NrZWRDb250ZXh0ID0gdGhpcy5hY3RpdmVDb250ZXh0O1xuICAgICAgfSBlbHNlIGlmIChsb2NrID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmxvY2tlZENvbnRleHQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlcmVuZGVyKCgpID0+IHtcbiAgICAgICAgdGhpcy5zd2l0Y2hib2FyZC5kaWRGaW5pc2hDb250ZXh0Q2hhbmdlUmVuZGVyKCk7XG4gICAgICAgIHRoaXMuc3dpdGNoYm9hcmQuZGlkRmluaXNoQWN0aXZlQ29udGV4dFVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICgobG9jayA9PT0gdHJ1ZSB8fCBsb2NrID09PSBmYWxzZSkgJiYgbG9jayAhPT0gKHRoaXMubG9ja2VkQ29udGV4dCAhPT0gbnVsbCkpIHtcbiAgICAgIGlmIChsb2NrKSB7XG4gICAgICAgIHRoaXMubG9ja2VkQ29udGV4dCA9IHRoaXMuYWN0aXZlQ29udGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9ja2VkQ29udGV4dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVyZW5kZXIoKCkgPT4ge1xuICAgICAgICB0aGlzLnN3aXRjaGJvYXJkLmRpZEZpbmlzaENvbnRleHRDaGFuZ2VSZW5kZXIoKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hib2FyZC5kaWRGaW5pc2hBY3RpdmVDb250ZXh0VXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zd2l0Y2hib2FyZC5kaWRGaW5pc2hBY3RpdmVDb250ZXh0VXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlcml2ZSB0aGUgbmV4dCBhY3RpdmUgY29udGV4dCB3aXRoIGdldE5leHRDb250ZXh0KCksIHRoZW4gZW5hY3QgdGhlIGNvbnRleHQgY2hhbmdlIHdpdGggc2V0QWN0aXZlQ29udGV4dCgpLlxuICAgKlxuICAgKiBvcHRpb25zOlxuICAgKiAgIHVzZVBhdGggLSBQYXRoIG9mIHRoZSBjb250ZXh0IHRvIHVzZSBhcyB0aGUgbmV4dCBjb250ZXh0LCBpZiBpdCBpcyBwcmVzZW50IGluIHRoZSBwb29sLlxuICAgKiAgIGxvY2sgLSBUcnVlIG9yIGZhbHNlIHRvIGxvY2sgdGhlIHVsdGltYXRlbHkgY2hvc2VuIGNvbnRleHQuIE9taXQgdG8gcHJlc2VydmUgdGhlIGN1cnJlbnQgbG9jayBzdGF0ZS5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZUFjdGl2ZUNvbnRleHQob3B0aW9ucykge1xuICAgIGlmICh0aGlzLndvcmtzcGFjZS5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zd2l0Y2hib2FyZC5kaWRCZWdpbkFjdGl2ZUNvbnRleHRVcGRhdGUoKTtcblxuICAgIGNvbnN0IG5leHRBY3RpdmVDb250ZXh0ID0gYXdhaXQgdGhpcy5nZXROZXh0Q29udGV4dChvcHRpb25zLnVzZVBhdGgpO1xuICAgIHRoaXMuc2V0QWN0aXZlQ29udGV4dChuZXh0QWN0aXZlQ29udGV4dCwgb3B0aW9ucy5sb2NrKTtcbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2hBdG9tR2l0UmVwb3NpdG9yeSh3b3JrZGlyKSB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gdGhpcy5wcm9qZWN0LmdldERpcmVjdG9yeUZvclByb2plY3RQYXRoKHdvcmtkaXIpO1xuICAgIGlmICghZGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYXRvbUdpdFJlcG8gPSBhd2FpdCB0aGlzLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShkaXJlY3RvcnkpO1xuICAgIGlmIChhdG9tR2l0UmVwbykge1xuICAgICAgYXdhaXQgYXRvbUdpdFJlcG8ucmVmcmVzaFN0YXR1cygpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXRoRm9yUGFuZUl0ZW0ocGFuZUl0ZW0pIHtcbiAgaWYgKCFwYW5lSXRlbSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gTGlrZWx5IEdpdEh1YiBwYWNrYWdlIHByb3ZpZGVkIHBhbmUgaXRlbVxuICBpZiAodHlwZW9mIHBhbmVJdGVtLmdldFdvcmtpbmdEaXJlY3RvcnkgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gcGFuZUl0ZW0uZ2V0V29ya2luZ0RpcmVjdG9yeSgpO1xuICB9XG5cbiAgLy8gVGV4dEVkaXRvci1saWtlXG4gIGlmICh0eXBlb2YgcGFuZUl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBwYW5lSXRlbS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBPaCB3ZWxsXG4gIHJldHVybiBudWxsO1xufVxuIl19