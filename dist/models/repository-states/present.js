"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _eventKit = require("event-kit");

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _state = _interopRequireDefault(require("./state"));

var _keys = require("./cache/keys");

var _gitShellOutStrategy = require("../../git-shell-out-strategy");

var _workspaceChangeObserver = require("../workspace-change-observer");

var _patch = require("../patch");

var _discardHistory = _interopRequireDefault(require("../discard-history"));

var _branch = _interopRequireWildcard(require("../branch"));

var _author = _interopRequireDefault(require("../author"));

var _branchSet = _interopRequireDefault(require("../branch-set"));

var _remote = _interopRequireDefault(require("../remote"));

var _remoteSet = _interopRequireDefault(require("../remote-set"));

var _commit = _interopRequireDefault(require("../commit"));

var _operationStates = _interopRequireDefault(require("../operation-states"));

var _reporterProxy = require("../../reporter-proxy");

var _helpers = require("../../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * State used when the working directory contains a valid git repository and can be interacted with. Performs
 * actual git operations, caching the results, and broadcasts `onDidUpdate` events when write actions are
 * performed.
 */
class Present extends _state.default {
  constructor(repository, history) {
    super(repository);
    this.cache = new Cache();
    this.discardHistory = new _discardHistory.default(this.createBlob.bind(this), this.expandBlobToFile.bind(this), this.mergeFile.bind(this), this.workdir(), {
      maxHistoryLength: 60
    });
    this.operationStates = new _operationStates.default({
      didUpdate: this.didUpdate.bind(this)
    });
    this.commitMessage = '';
    this.commitMessageTemplate = null;
    this.fetchInitialMessage();
    /* istanbul ignore else */

    if (history) {
      this.discardHistory.updateHistory(history);
    }
  }

  setCommitMessage(message, {
    suppressUpdate
  } = {
    suppressUpdate: false
  }) {
    this.commitMessage = message;

    if (!suppressUpdate) {
      this.didUpdate();
    }
  }

  setCommitMessageTemplate(template) {
    this.commitMessageTemplate = template;
  }

  async fetchInitialMessage() {
    const mergeMessage = await this.repository.getMergeMessage();
    const template = await this.fetchCommitMessageTemplate();

    if (template) {
      this.commitMessageTemplate = template;
    }

    if (mergeMessage) {
      this.setCommitMessage(mergeMessage);
    } else if (template) {
      this.setCommitMessage(template);
    }
  }

  getCommitMessage() {
    return this.commitMessage;
  }

  fetchCommitMessageTemplate() {
    return this.git().fetchCommitMessageTemplate();
  }

  getOperationStates() {
    return this.operationStates;
  }

  isPresent() {
    return true;
  }

  destroy() {
    this.cache.destroy();
    super.destroy();
  }

  showStatusBarTiles() {
    return true;
  }

  isPublishable() {
    return true;
  }

  acceptInvalidation(spec, {
    globally
  } = {}) {
    this.cache.invalidate(spec());
    this.didUpdate();

    if (globally) {
      this.didGloballyInvalidate(spec);
    }
  }

  invalidateCacheAfterFilesystemChange(events) {
    const paths = events.map(e => e.special || e.path);
    const keys = new Set();

    for (let i = 0; i < paths.length; i++) {
      const fullPath = paths[i];

      if (fullPath === _workspaceChangeObserver.FOCUS) {
        keys.add(_keys.Keys.statusBundle);

        for (const k of _keys.Keys.filePatch.eachWithOpts({
          staged: false
        })) {
          keys.add(k);
        }

        continue;
      }

      const includes = (...segments) => fullPath.includes(_path.default.join(...segments));

      if ((0, _helpers.filePathEndsWith)(fullPath, '.git', 'index')) {
        keys.add(_keys.Keys.stagedChanges);
        keys.add(_keys.Keys.filePatch.all);
        keys.add(_keys.Keys.index.all);
        keys.add(_keys.Keys.statusBundle);
        continue;
      }

      if ((0, _helpers.filePathEndsWith)(fullPath, '.git', 'HEAD')) {
        keys.add(_keys.Keys.branches);
        keys.add(_keys.Keys.lastCommit);
        keys.add(_keys.Keys.recentCommits);
        keys.add(_keys.Keys.statusBundle);
        keys.add(_keys.Keys.headDescription);
        keys.add(_keys.Keys.authors);
        continue;
      }

      if (includes('.git', 'refs', 'heads')) {
        keys.add(_keys.Keys.branches);
        keys.add(_keys.Keys.lastCommit);
        keys.add(_keys.Keys.recentCommits);
        keys.add(_keys.Keys.headDescription);
        keys.add(_keys.Keys.authors);
        continue;
      }

      if (includes('.git', 'refs', 'remotes')) {
        keys.add(_keys.Keys.remotes);
        keys.add(_keys.Keys.statusBundle);
        keys.add(_keys.Keys.headDescription);
        continue;
      }

      if ((0, _helpers.filePathEndsWith)(fullPath, '.git', 'config')) {
        keys.add(_keys.Keys.remotes);
        keys.add(_keys.Keys.config.all);
        keys.add(_keys.Keys.statusBundle);
        continue;
      } // File change within the working directory


      const relativePath = _path.default.relative(this.workdir(), fullPath);

      for (const key of _keys.Keys.filePatch.eachWithFileOpts([relativePath], [{
        staged: false
      }])) {
        keys.add(key);
      }

      keys.add(_keys.Keys.statusBundle);
    }
    /* istanbul ignore else */


    if (keys.size > 0) {
      this.cache.invalidate(Array.from(keys));
      this.didUpdate();
    }
  }

  isCommitMessageClean() {
    if (this.commitMessage.trim() === '') {
      return true;
    } else if (this.commitMessageTemplate) {
      return this.commitMessage === this.commitMessageTemplate;
    }

    return false;
  }

  async updateCommitMessageAfterFileSystemChange(events) {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (!event.path) {
        continue;
      }

      if ((0, _helpers.filePathEndsWith)(event.path, '.git', 'MERGE_HEAD')) {
        if (event.action === 'created') {
          if (this.isCommitMessageClean()) {
            this.setCommitMessage((await this.repository.getMergeMessage()));
          }
        } else if (event.action === 'deleted') {
          this.setCommitMessage(this.commitMessageTemplate || '');
        }
      }

      if ((0, _helpers.filePathEndsWith)(event.path, '.git', 'config')) {
        // this won't catch changes made to the template file itself...
        const template = await this.fetchCommitMessageTemplate();

        if (template === null) {
          this.setCommitMessage('');
        } else if (this.commitMessageTemplate !== template) {
          this.setCommitMessage(template);
        }

        this.setCommitMessageTemplate(template);
      }
    }
  }

  observeFilesystemChange(events) {
    this.invalidateCacheAfterFilesystemChange(events);
    this.updateCommitMessageAfterFileSystemChange(events);
  }

  refresh() {
    this.cache.clear();
    this.didUpdate();
  }

  init() {
    return super.init().catch(e => {
      e.stdErr = 'This directory already contains a git repository';
      return Promise.reject(e);
    });
  }

  clone() {
    return super.clone().catch(e => {
      e.stdErr = 'This directory already contains a git repository';
      return Promise.reject(e);
    });
  } // Git operations ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Staging and unstaging


  stageFiles(paths) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys(paths), () => this.git().stageFiles(paths));
  }

  unstageFiles(paths) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys(paths), () => this.git().unstageFiles(paths));
  }

  stageFilesFromParentCommit(paths) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys(paths), () => this.git().unstageFiles(paths, 'HEAD~'));
  }

  stageFileModeChange(filePath, fileMode) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys([filePath]), () => this.git().stageFileModeChange(filePath, fileMode));
  }

  stageFileSymlinkChange(filePath) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys([filePath]), () => this.git().stageFileSymlinkChange(filePath));
  }

  applyPatchToIndex(multiFilePatch) {
    return this.invalidate(() => _keys.Keys.cacheOperationKeys(Array.from(multiFilePatch.getPathSet())), () => {
      const patchStr = multiFilePatch.toString();
      return this.git().applyPatch(patchStr, {
        index: true
      });
    });
  }

  applyPatchToWorkdir(multiFilePatch) {
    return this.invalidate(() => _keys.Keys.workdirOperationKeys(Array.from(multiFilePatch.getPathSet())), () => {
      const patchStr = multiFilePatch.toString();
      return this.git().applyPatch(patchStr);
    });
  } // Committing


  commit(message, options) {
    return this.invalidate(_keys.Keys.headOperationKeys, // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('COMMIT', async (message, options = {}) => {
      const coAuthors = options.coAuthors;
      const opts = !coAuthors ? options : _objectSpread2({}, options, {
        coAuthors: coAuthors.map(author => {
          return {
            email: author.getEmail(),
            name: author.getFullName()
          };
        })
      });
      await this.git().commit(message, opts); // Collect commit metadata metrics
      // note: in GitShellOutStrategy we have counters for all git commands, including `commit`, but here we have
      //       access to additional metadata (unstaged file count) so it makes sense to collect commit events here

      const {
        unstagedFiles,
        mergeConflictFiles
      } = await this.getStatusesForChangedFiles();
      const unstagedCount = Object.keys(_objectSpread2({}, unstagedFiles, {}, mergeConflictFiles)).length;
      (0, _reporterProxy.addEvent)('commit', {
        package: 'github',
        partial: unstagedCount > 0,
        amend: !!options.amend,
        coAuthorCount: coAuthors ? coAuthors.length : 0
      });
    }, message, options));
  } // Merging


  merge(branchName) {
    return this.invalidate(() => [..._keys.Keys.headOperationKeys(), _keys.Keys.index.all, _keys.Keys.headDescription], () => this.git().merge(branchName));
  }

  abortMerge() {
    return this.invalidate(() => [_keys.Keys.statusBundle, _keys.Keys.stagedChanges, _keys.Keys.filePatch.all, _keys.Keys.index.all], async () => {
      await this.git().abortMerge();
      this.setCommitMessage(this.commitMessageTemplate || '');
    });
  }

  checkoutSide(side, paths) {
    return this.git().checkoutSide(side, paths);
  }

  mergeFile(oursPath, commonBasePath, theirsPath, resultPath) {
    return this.git().mergeFile(oursPath, commonBasePath, theirsPath, resultPath);
  }

  writeMergeConflictToIndex(filePath, commonBaseSha, oursSha, theirsSha) {
    return this.invalidate(() => [_keys.Keys.statusBundle, _keys.Keys.stagedChanges, ..._keys.Keys.filePatch.eachWithFileOpts([filePath], [{
      staged: false
    }, {
      staged: true
    }]), _keys.Keys.index.oneWith(filePath)], () => this.git().writeMergeConflictToIndex(filePath, commonBaseSha, oursSha, theirsSha));
  } // Checkout


  checkout(revision, options = {}) {
    return this.invalidate(() => [_keys.Keys.stagedChanges, _keys.Keys.lastCommit, _keys.Keys.recentCommits, _keys.Keys.authors, _keys.Keys.statusBundle, _keys.Keys.index.all, ..._keys.Keys.filePatch.eachWithOpts({
      staged: true
    }), _keys.Keys.filePatch.allAgainstNonHead, _keys.Keys.headDescription, _keys.Keys.branches], // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('CHECKOUT', (revision, options) => {
      return this.git().checkout(revision, options);
    }, revision, options));
  }

  checkoutPathsAtRevision(paths, revision = 'HEAD') {
    return this.invalidate(() => [_keys.Keys.statusBundle, _keys.Keys.stagedChanges, ...paths.map(fileName => _keys.Keys.index.oneWith(fileName)), ..._keys.Keys.filePatch.eachWithFileOpts(paths, [{
      staged: true
    }]), ..._keys.Keys.filePatch.eachNonHeadWithFiles(paths)], () => this.git().checkoutFiles(paths, revision));
  } // Reset


  undoLastCommit() {
    return this.invalidate(() => [_keys.Keys.stagedChanges, _keys.Keys.lastCommit, _keys.Keys.recentCommits, _keys.Keys.authors, _keys.Keys.statusBundle, _keys.Keys.index.all, ..._keys.Keys.filePatch.eachWithOpts({
      staged: true
    }), _keys.Keys.headDescription], async () => {
      try {
        await this.git().reset('soft', 'HEAD~');
        (0, _reporterProxy.addEvent)('undo-last-commit', {
          package: 'github'
        });
      } catch (e) {
        if (/unknown revision/.test(e.stdErr)) {
          // Initial commit
          await this.git().deleteRef('HEAD');
        } else {
          throw e;
        }
      }
    });
  } // Remote interactions


  fetch(branchName, options = {}) {
    return this.invalidate(() => [_keys.Keys.statusBundle, _keys.Keys.headDescription], // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('FETCH', async branchName => {
      let finalRemoteName = options.remoteName;

      if (!finalRemoteName) {
        const remote = await this.getRemoteForBranch(branchName);

        if (!remote.isPresent()) {
          return null;
        }

        finalRemoteName = remote.getName();
      }

      return this.git().fetch(finalRemoteName, branchName);
    }, branchName));
  }

  pull(branchName, options = {}) {
    return this.invalidate(() => [..._keys.Keys.headOperationKeys(), _keys.Keys.index.all, _keys.Keys.headDescription, _keys.Keys.branches], // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('PULL', async branchName => {
      let finalRemoteName = options.remoteName;

      if (!finalRemoteName) {
        const remote = await this.getRemoteForBranch(branchName);

        if (!remote.isPresent()) {
          return null;
        }

        finalRemoteName = remote.getName();
      }

      return this.git().pull(finalRemoteName, branchName, options);
    }, branchName));
  }

  push(branchName, options = {}) {
    return this.invalidate(() => {
      const keys = [_keys.Keys.statusBundle, _keys.Keys.headDescription];

      if (options.setUpstream) {
        keys.push(_keys.Keys.branches);
        keys.push(..._keys.Keys.config.eachWithSetting(`branch.${branchName}.remote`));
      }

      return keys;
    }, // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('PUSH', async (branchName, options) => {
      const remote = options.remote || (await this.getRemoteForBranch(branchName));
      return this.git().push(remote.getNameOr('origin'), branchName, options);
    }, branchName, options));
  } // Configuration


  setConfig(setting, value, options = {}) {
    return this.invalidate(() => _keys.Keys.config.eachWithSetting(setting), () => this.git().setConfig(setting, value, options), {
      globally: options.global
    });
  }

  unsetConfig(setting) {
    return this.invalidate(() => _keys.Keys.config.eachWithSetting(setting), () => this.git().unsetConfig(setting));
  } // Direct blob interactions


  createBlob(options) {
    return this.git().createBlob(options);
  }

  expandBlobToFile(absFilePath, sha) {
    return this.git().expandBlobToFile(absFilePath, sha);
  } // Discard history


  createDiscardHistoryBlob() {
    return this.discardHistory.createHistoryBlob();
  }

  async updateDiscardHistory() {
    const history = await this.loadHistoryPayload();
    this.discardHistory.updateHistory(history);
  }

  async storeBeforeAndAfterBlobs(filePaths, isSafe, destructiveAction, partialDiscardFilePath = null) {
    const snapshots = await this.discardHistory.storeBeforeAndAfterBlobs(filePaths, isSafe, destructiveAction, partialDiscardFilePath);
    /* istanbul ignore else */

    if (snapshots) {
      await this.saveDiscardHistory();
    }

    return snapshots;
  }

  restoreLastDiscardInTempFiles(isSafe, partialDiscardFilePath = null) {
    return this.discardHistory.restoreLastDiscardInTempFiles(isSafe, partialDiscardFilePath);
  }

  async popDiscardHistory(partialDiscardFilePath = null) {
    const removed = await this.discardHistory.popHistory(partialDiscardFilePath);

    if (removed) {
      await this.saveDiscardHistory();
    }
  }

  clearDiscardHistory(partialDiscardFilePath = null) {
    this.discardHistory.clearHistory(partialDiscardFilePath);
    return this.saveDiscardHistory();
  }

  discardWorkDirChangesForPaths(paths) {
    return this.invalidate(() => [_keys.Keys.statusBundle, ...paths.map(filePath => _keys.Keys.filePatch.oneWith(filePath, {
      staged: false
    })), ..._keys.Keys.filePatch.eachNonHeadWithFiles(paths)], async () => {
      const untrackedFiles = await this.git().getUntrackedFiles();
      const [filesToRemove, filesToCheckout] = partition(paths, f => untrackedFiles.includes(f));
      await this.git().checkoutFiles(filesToCheckout);
      await Promise.all(filesToRemove.map(filePath => {
        const absPath = _path.default.join(this.workdir(), filePath);

        return _fsExtra.default.remove(absPath);
      }));
    });
  } // Accessors /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Index queries


  getStatusBundle() {
    return this.cache.getOrSet(_keys.Keys.statusBundle, async () => {
      try {
        const bundle = await this.git().getStatusBundle();
        const results = await this.formatChangedFiles(bundle);
        results.branch = bundle.branch;
        return results;
      } catch (err) {
        if (err instanceof _gitShellOutStrategy.LargeRepoError) {
          this.transitionTo('TooLarge');
          return {
            branch: {},
            stagedFiles: {},
            unstagedFiles: {},
            mergeConflictFiles: {}
          };
        } else {
          throw err;
        }
      }
    });
  }

  async formatChangedFiles({
    changedEntries,
    untrackedEntries,
    renamedEntries,
    unmergedEntries
  }) {
    const statusMap = {
      A: 'added',
      M: 'modified',
      D: 'deleted',
      U: 'modified',
      T: 'typechange'
    };
    const stagedFiles = {};
    const unstagedFiles = {};
    const mergeConflictFiles = {};
    changedEntries.forEach(entry => {
      if (entry.stagedStatus) {
        stagedFiles[entry.filePath] = statusMap[entry.stagedStatus];
      }

      if (entry.unstagedStatus) {
        unstagedFiles[entry.filePath] = statusMap[entry.unstagedStatus];
      }
    });
    untrackedEntries.forEach(entry => {
      unstagedFiles[entry.filePath] = statusMap.A;
    });
    renamedEntries.forEach(entry => {
      if (entry.stagedStatus === 'R') {
        stagedFiles[entry.filePath] = statusMap.A;
        stagedFiles[entry.origFilePath] = statusMap.D;
      }

      if (entry.unstagedStatus === 'R') {
        unstagedFiles[entry.filePath] = statusMap.A;
        unstagedFiles[entry.origFilePath] = statusMap.D;
      }

      if (entry.stagedStatus === 'C') {
        stagedFiles[entry.filePath] = statusMap.A;
      }

      if (entry.unstagedStatus === 'C') {
        unstagedFiles[entry.filePath] = statusMap.A;
      }
    });
    let statusToHead;

    for (let i = 0; i < unmergedEntries.length; i++) {
      const {
        stagedStatus,
        unstagedStatus,
        filePath
      } = unmergedEntries[i];

      if (stagedStatus === 'U' || unstagedStatus === 'U' || stagedStatus === 'A' && unstagedStatus === 'A') {
        // Skipping this check here because we only run a single `await`
        // and we only run it in the main, synchronous body of the for loop.
        // eslint-disable-next-line no-await-in-loop
        if (!statusToHead) {
          statusToHead = await this.git().diffFileStatus({
            target: 'HEAD'
          });
        }

        mergeConflictFiles[filePath] = {
          ours: statusMap[stagedStatus],
          theirs: statusMap[unstagedStatus],
          file: statusToHead[filePath] || 'equivalent'
        };
      }
    }

    return {
      stagedFiles,
      unstagedFiles,
      mergeConflictFiles
    };
  }

  async getStatusesForChangedFiles() {
    const {
      stagedFiles,
      unstagedFiles,
      mergeConflictFiles
    } = await this.getStatusBundle();
    return {
      stagedFiles,
      unstagedFiles,
      mergeConflictFiles
    };
  }

  getFilePatchForPath(filePath, options) {
    const opts = _objectSpread2({
      staged: false,
      patchBuffer: null,
      builder: {},
      before: () => {},
      after: () => {}
    }, options);

    return this.cache.getOrSet(_keys.Keys.filePatch.oneWith(filePath, {
      staged: opts.staged
    }), async () => {
      const diffs = await this.git().getDiffsForFilePath(filePath, {
        staged: opts.staged
      });
      const payload = opts.before();
      const patch = (0, _patch.buildFilePatch)(diffs, opts.builder);

      if (opts.patchBuffer !== null) {
        patch.adoptBuffer(opts.patchBuffer);
      }

      opts.after(patch, payload);
      return patch;
    });
  }

  getDiffsForFilePath(filePath, baseCommit) {
    return this.cache.getOrSet(_keys.Keys.filePatch.oneWith(filePath, {
      baseCommit
    }), () => {
      return this.git().getDiffsForFilePath(filePath, {
        baseCommit
      });
    });
  }

  getStagedChangesPatch(options) {
    const opts = _objectSpread2({
      builder: {},
      patchBuffer: null,
      before: () => {},
      after: () => {}
    }, options);

    return this.cache.getOrSet(_keys.Keys.stagedChanges, async () => {
      const diffs = await this.git().getStagedChangesPatch();
      const payload = opts.before();
      const patch = (0, _patch.buildMultiFilePatch)(diffs, opts.builder);

      if (opts.patchBuffer !== null) {
        patch.adoptBuffer(opts.patchBuffer);
      }

      opts.after(patch, payload);
      return patch;
    });
  }

  readFileFromIndex(filePath) {
    return this.cache.getOrSet(_keys.Keys.index.oneWith(filePath), () => {
      return this.git().readFileFromIndex(filePath);
    });
  } // Commit access


  getLastCommit() {
    return this.cache.getOrSet(_keys.Keys.lastCommit, async () => {
      const headCommit = await this.git().getHeadCommit();
      return headCommit.unbornRef ? _commit.default.createUnborn() : new _commit.default(headCommit);
    });
  }

  getCommit(sha) {
    return this.cache.getOrSet(_keys.Keys.blob.oneWith(sha), async () => {
      const [rawCommit] = await this.git().getCommits({
        max: 1,
        ref: sha,
        includePatch: true
      });
      const commit = new _commit.default(rawCommit);
      return commit;
    });
  }

  getRecentCommits(options) {
    return this.cache.getOrSet(_keys.Keys.recentCommits, async () => {
      const commits = await this.git().getCommits(_objectSpread2({
        ref: 'HEAD'
      }, options));
      return commits.map(commit => new _commit.default(commit));
    });
  }

  async isCommitPushed(sha) {
    const currentBranch = await this.repository.getCurrentBranch();
    const upstream = currentBranch.getPush();

    if (!upstream.isPresent()) {
      return false;
    }

    const contained = await this.git().getBranchesWithCommit(sha, {
      showLocal: false,
      showRemote: true,
      pattern: upstream.getShortRef()
    });
    return contained.some(ref => ref.length > 0);
  } // Author information


  getAuthors(options) {
    // For now we'll do the naive thing and invalidate anytime HEAD moves. This ensures that we get new authors
    // introduced by newly created commits or pulled commits.
    // This means that we are constantly re-fetching data. If performance becomes a concern we can optimize
    return this.cache.getOrSet(_keys.Keys.authors, async () => {
      const authorMap = await this.git().getAuthors(options);
      return Object.keys(authorMap).map(email => new _author.default(email, authorMap[email]));
    });
  } // Branches


  getBranches() {
    return this.cache.getOrSet(_keys.Keys.branches, async () => {
      const payloads = await this.git().getBranches();
      const branches = new _branchSet.default();

      for (const payload of payloads) {
        let upstream = _branch.nullBranch;

        if (payload.upstream) {
          upstream = payload.upstream.remoteName ? _branch.default.createRemoteTracking(payload.upstream.trackingRef, payload.upstream.remoteName, payload.upstream.remoteRef) : new _branch.default(payload.upstream.trackingRef);
        }

        let push = upstream;

        if (payload.push) {
          push = payload.push.remoteName ? _branch.default.createRemoteTracking(payload.push.trackingRef, payload.push.remoteName, payload.push.remoteRef) : new _branch.default(payload.push.trackingRef);
        }

        branches.add(new _branch.default(payload.name, upstream, push, payload.head, {
          sha: payload.sha
        }));
      }

      return branches;
    });
  }

  getHeadDescription() {
    return this.cache.getOrSet(_keys.Keys.headDescription, () => {
      return this.git().describeHead();
    });
  } // Merging and rebasing status


  isMerging() {
    return this.git().isMerging(this.repository.getGitDirectoryPath());
  }

  isRebasing() {
    return this.git().isRebasing(this.repository.getGitDirectoryPath());
  } // Remotes


  getRemotes() {
    return this.cache.getOrSet(_keys.Keys.remotes, async () => {
      const remotesInfo = await this.git().getRemotes();
      return new _remoteSet.default(remotesInfo.map(({
        name,
        url
      }) => new _remote.default(name, url)));
    });
  }

  addRemote(name, url) {
    return this.invalidate(() => [..._keys.Keys.config.eachWithSetting(`remote.${name}.url`), ..._keys.Keys.config.eachWithSetting(`remote.${name}.fetch`), _keys.Keys.remotes], // eslint-disable-next-line no-shadow
    () => this.executePipelineAction('ADDREMOTE', async (name, url) => {
      await this.git().addRemote(name, url);
      return new _remote.default(name, url);
    }, name, url));
  }

  async getAheadCount(branchName) {
    const bundle = await this.getStatusBundle();
    return bundle.branch.aheadBehind.ahead;
  }

  async getBehindCount(branchName) {
    const bundle = await this.getStatusBundle();
    return bundle.branch.aheadBehind.behind;
  }

  getConfig(option, {
    local
  } = {
    local: false
  }) {
    return this.cache.getOrSet(_keys.Keys.config.oneWith(option, {
      local
    }), () => {
      return this.git().getConfig(option, {
        local
      });
    });
  }

  directGetConfig(key, options) {
    return this.getConfig(key, options);
  } // Direct blob access


  getBlobContents(sha) {
    return this.cache.getOrSet(_keys.Keys.blob.oneWith(sha), () => {
      return this.git().getBlobContents(sha);
    });
  }

  directGetBlobContents(sha) {
    return this.getBlobContents(sha);
  } // Discard history


  hasDiscardHistory(partialDiscardFilePath = null) {
    return this.discardHistory.hasHistory(partialDiscardFilePath);
  }

  getDiscardHistory(partialDiscardFilePath = null) {
    return this.discardHistory.getHistory(partialDiscardFilePath);
  }

  getLastHistorySnapshots(partialDiscardFilePath = null) {
    return this.discardHistory.getLastSnapshots(partialDiscardFilePath);
  } // Cache

  /* istanbul ignore next */


  getCache() {
    return this.cache;
  }

  invalidate(spec, body, options = {}) {
    return body().then(result => {
      this.acceptInvalidation(spec, options);
      return result;
    }, err => {
      this.acceptInvalidation(spec, options);
      return Promise.reject(err);
    });
  }

}

exports.default = Present;

_state.default.register(Present);

function partition(array, predicate) {
  const matches = [];
  const nonmatches = [];
  array.forEach(item => {
    if (predicate(item)) {
      matches.push(item);
    } else {
      nonmatches.push(item);
    }
  });
  return [matches, nonmatches];
}

class Cache {
  constructor() {
    this.storage = new Map();
    this.byGroup = new Map();
    this.emitter = new _eventKit.Emitter();
  }

  getOrSet(key, operation) {
    const primary = key.getPrimary();
    const existing = this.storage.get(primary);

    if (existing !== undefined) {
      existing.hits++;
      return existing.promise;
    }

    const created = operation();
    this.storage.set(primary, {
      createdAt: performance.now(),
      hits: 0,
      promise: created
    });
    const groups = key.getGroups();

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      let groupSet = this.byGroup.get(group);

      if (groupSet === undefined) {
        groupSet = new Set();
        this.byGroup.set(group, groupSet);
      }

      groupSet.add(key);
    }

    this.didUpdate();
    return created;
  }

  invalidate(keys) {
    for (let i = 0; i < keys.length; i++) {
      keys[i].removeFromCache(this);
    }

    if (keys.length > 0) {
      this.didUpdate();
    }
  }

  keysInGroup(group) {
    return this.byGroup.get(group) || [];
  }

  removePrimary(primary) {
    this.storage.delete(primary);
    this.didUpdate();
  }

  removeFromGroup(group, key) {
    const groupSet = this.byGroup.get(group);
    groupSet && groupSet.delete(key);
    this.didUpdate();
  }
  /* istanbul ignore next */


  [Symbol.iterator]() {
    return this.storage[Symbol.iterator]();
  }

  clear() {
    this.storage.clear();
    this.byGroup.clear();
    this.didUpdate();
  }

  didUpdate() {
    this.emitter.emit('did-update');
  }
  /* istanbul ignore next */


  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback);
  }

  destroy() {
    this.emitter.dispose();
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcmVwb3NpdG9yeS1zdGF0ZXMvcHJlc2VudC5qcyJdLCJuYW1lcyI6WyJQcmVzZW50IiwiU3RhdGUiLCJjb25zdHJ1Y3RvciIsInJlcG9zaXRvcnkiLCJoaXN0b3J5IiwiY2FjaGUiLCJDYWNoZSIsImRpc2NhcmRIaXN0b3J5IiwiRGlzY2FyZEhpc3RvcnkiLCJjcmVhdGVCbG9iIiwiYmluZCIsImV4cGFuZEJsb2JUb0ZpbGUiLCJtZXJnZUZpbGUiLCJ3b3JrZGlyIiwibWF4SGlzdG9yeUxlbmd0aCIsIm9wZXJhdGlvblN0YXRlcyIsIk9wZXJhdGlvblN0YXRlcyIsImRpZFVwZGF0ZSIsImNvbW1pdE1lc3NhZ2UiLCJjb21taXRNZXNzYWdlVGVtcGxhdGUiLCJmZXRjaEluaXRpYWxNZXNzYWdlIiwidXBkYXRlSGlzdG9yeSIsInNldENvbW1pdE1lc3NhZ2UiLCJtZXNzYWdlIiwic3VwcHJlc3NVcGRhdGUiLCJzZXRDb21taXRNZXNzYWdlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsIm1lcmdlTWVzc2FnZSIsImdldE1lcmdlTWVzc2FnZSIsImZldGNoQ29tbWl0TWVzc2FnZVRlbXBsYXRlIiwiZ2V0Q29tbWl0TWVzc2FnZSIsImdpdCIsImdldE9wZXJhdGlvblN0YXRlcyIsImlzUHJlc2VudCIsImRlc3Ryb3kiLCJzaG93U3RhdHVzQmFyVGlsZXMiLCJpc1B1Ymxpc2hhYmxlIiwiYWNjZXB0SW52YWxpZGF0aW9uIiwic3BlYyIsImdsb2JhbGx5IiwiaW52YWxpZGF0ZSIsImRpZEdsb2JhbGx5SW52YWxpZGF0ZSIsImludmFsaWRhdGVDYWNoZUFmdGVyRmlsZXN5c3RlbUNoYW5nZSIsImV2ZW50cyIsInBhdGhzIiwibWFwIiwiZSIsInNwZWNpYWwiLCJwYXRoIiwia2V5cyIsIlNldCIsImkiLCJsZW5ndGgiLCJmdWxsUGF0aCIsIkZPQ1VTIiwiYWRkIiwiS2V5cyIsInN0YXR1c0J1bmRsZSIsImsiLCJmaWxlUGF0Y2giLCJlYWNoV2l0aE9wdHMiLCJzdGFnZWQiLCJpbmNsdWRlcyIsInNlZ21lbnRzIiwiam9pbiIsInN0YWdlZENoYW5nZXMiLCJhbGwiLCJpbmRleCIsImJyYW5jaGVzIiwibGFzdENvbW1pdCIsInJlY2VudENvbW1pdHMiLCJoZWFkRGVzY3JpcHRpb24iLCJhdXRob3JzIiwicmVtb3RlcyIsImNvbmZpZyIsInJlbGF0aXZlUGF0aCIsInJlbGF0aXZlIiwia2V5IiwiZWFjaFdpdGhGaWxlT3B0cyIsInNpemUiLCJBcnJheSIsImZyb20iLCJpc0NvbW1pdE1lc3NhZ2VDbGVhbiIsInRyaW0iLCJ1cGRhdGVDb21taXRNZXNzYWdlQWZ0ZXJGaWxlU3lzdGVtQ2hhbmdlIiwiZXZlbnQiLCJhY3Rpb24iLCJvYnNlcnZlRmlsZXN5c3RlbUNoYW5nZSIsInJlZnJlc2giLCJjbGVhciIsImluaXQiLCJjYXRjaCIsInN0ZEVyciIsIlByb21pc2UiLCJyZWplY3QiLCJjbG9uZSIsInN0YWdlRmlsZXMiLCJjYWNoZU9wZXJhdGlvbktleXMiLCJ1bnN0YWdlRmlsZXMiLCJzdGFnZUZpbGVzRnJvbVBhcmVudENvbW1pdCIsInN0YWdlRmlsZU1vZGVDaGFuZ2UiLCJmaWxlUGF0aCIsImZpbGVNb2RlIiwic3RhZ2VGaWxlU3ltbGlua0NoYW5nZSIsImFwcGx5UGF0Y2hUb0luZGV4IiwibXVsdGlGaWxlUGF0Y2giLCJnZXRQYXRoU2V0IiwicGF0Y2hTdHIiLCJ0b1N0cmluZyIsImFwcGx5UGF0Y2giLCJhcHBseVBhdGNoVG9Xb3JrZGlyIiwid29ya2Rpck9wZXJhdGlvbktleXMiLCJjb21taXQiLCJvcHRpb25zIiwiaGVhZE9wZXJhdGlvbktleXMiLCJleGVjdXRlUGlwZWxpbmVBY3Rpb24iLCJjb0F1dGhvcnMiLCJvcHRzIiwiYXV0aG9yIiwiZW1haWwiLCJnZXRFbWFpbCIsIm5hbWUiLCJnZXRGdWxsTmFtZSIsInVuc3RhZ2VkRmlsZXMiLCJtZXJnZUNvbmZsaWN0RmlsZXMiLCJnZXRTdGF0dXNlc0ZvckNoYW5nZWRGaWxlcyIsInVuc3RhZ2VkQ291bnQiLCJPYmplY3QiLCJwYWNrYWdlIiwicGFydGlhbCIsImFtZW5kIiwiY29BdXRob3JDb3VudCIsIm1lcmdlIiwiYnJhbmNoTmFtZSIsImFib3J0TWVyZ2UiLCJjaGVja291dFNpZGUiLCJzaWRlIiwib3Vyc1BhdGgiLCJjb21tb25CYXNlUGF0aCIsInRoZWlyc1BhdGgiLCJyZXN1bHRQYXRoIiwid3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleCIsImNvbW1vbkJhc2VTaGEiLCJvdXJzU2hhIiwidGhlaXJzU2hhIiwib25lV2l0aCIsImNoZWNrb3V0IiwicmV2aXNpb24iLCJhbGxBZ2FpbnN0Tm9uSGVhZCIsImNoZWNrb3V0UGF0aHNBdFJldmlzaW9uIiwiZmlsZU5hbWUiLCJlYWNoTm9uSGVhZFdpdGhGaWxlcyIsImNoZWNrb3V0RmlsZXMiLCJ1bmRvTGFzdENvbW1pdCIsInJlc2V0IiwidGVzdCIsImRlbGV0ZVJlZiIsImZldGNoIiwiZmluYWxSZW1vdGVOYW1lIiwicmVtb3RlTmFtZSIsInJlbW90ZSIsImdldFJlbW90ZUZvckJyYW5jaCIsImdldE5hbWUiLCJwdWxsIiwicHVzaCIsInNldFVwc3RyZWFtIiwiZWFjaFdpdGhTZXR0aW5nIiwiZ2V0TmFtZU9yIiwic2V0Q29uZmlnIiwic2V0dGluZyIsInZhbHVlIiwiZ2xvYmFsIiwidW5zZXRDb25maWciLCJhYnNGaWxlUGF0aCIsInNoYSIsImNyZWF0ZURpc2NhcmRIaXN0b3J5QmxvYiIsImNyZWF0ZUhpc3RvcnlCbG9iIiwidXBkYXRlRGlzY2FyZEhpc3RvcnkiLCJsb2FkSGlzdG9yeVBheWxvYWQiLCJzdG9yZUJlZm9yZUFuZEFmdGVyQmxvYnMiLCJmaWxlUGF0aHMiLCJpc1NhZmUiLCJkZXN0cnVjdGl2ZUFjdGlvbiIsInBhcnRpYWxEaXNjYXJkRmlsZVBhdGgiLCJzbmFwc2hvdHMiLCJzYXZlRGlzY2FyZEhpc3RvcnkiLCJyZXN0b3JlTGFzdERpc2NhcmRJblRlbXBGaWxlcyIsInBvcERpc2NhcmRIaXN0b3J5IiwicmVtb3ZlZCIsInBvcEhpc3RvcnkiLCJjbGVhckRpc2NhcmRIaXN0b3J5IiwiY2xlYXJIaXN0b3J5IiwiZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHMiLCJ1bnRyYWNrZWRGaWxlcyIsImdldFVudHJhY2tlZEZpbGVzIiwiZmlsZXNUb1JlbW92ZSIsImZpbGVzVG9DaGVja291dCIsInBhcnRpdGlvbiIsImYiLCJhYnNQYXRoIiwiZnMiLCJyZW1vdmUiLCJnZXRTdGF0dXNCdW5kbGUiLCJnZXRPclNldCIsImJ1bmRsZSIsInJlc3VsdHMiLCJmb3JtYXRDaGFuZ2VkRmlsZXMiLCJicmFuY2giLCJlcnIiLCJMYXJnZVJlcG9FcnJvciIsInRyYW5zaXRpb25UbyIsInN0YWdlZEZpbGVzIiwiY2hhbmdlZEVudHJpZXMiLCJ1bnRyYWNrZWRFbnRyaWVzIiwicmVuYW1lZEVudHJpZXMiLCJ1bm1lcmdlZEVudHJpZXMiLCJzdGF0dXNNYXAiLCJBIiwiTSIsIkQiLCJVIiwiVCIsImZvckVhY2giLCJlbnRyeSIsInN0YWdlZFN0YXR1cyIsInVuc3RhZ2VkU3RhdHVzIiwib3JpZ0ZpbGVQYXRoIiwic3RhdHVzVG9IZWFkIiwiZGlmZkZpbGVTdGF0dXMiLCJ0YXJnZXQiLCJvdXJzIiwidGhlaXJzIiwiZmlsZSIsImdldEZpbGVQYXRjaEZvclBhdGgiLCJwYXRjaEJ1ZmZlciIsImJ1aWxkZXIiLCJiZWZvcmUiLCJhZnRlciIsImRpZmZzIiwiZ2V0RGlmZnNGb3JGaWxlUGF0aCIsInBheWxvYWQiLCJwYXRjaCIsImFkb3B0QnVmZmVyIiwiYmFzZUNvbW1pdCIsImdldFN0YWdlZENoYW5nZXNQYXRjaCIsInJlYWRGaWxlRnJvbUluZGV4IiwiZ2V0TGFzdENvbW1pdCIsImhlYWRDb21taXQiLCJnZXRIZWFkQ29tbWl0IiwidW5ib3JuUmVmIiwiQ29tbWl0IiwiY3JlYXRlVW5ib3JuIiwiZ2V0Q29tbWl0IiwiYmxvYiIsInJhd0NvbW1pdCIsImdldENvbW1pdHMiLCJtYXgiLCJyZWYiLCJpbmNsdWRlUGF0Y2giLCJnZXRSZWNlbnRDb21taXRzIiwiY29tbWl0cyIsImlzQ29tbWl0UHVzaGVkIiwiY3VycmVudEJyYW5jaCIsImdldEN1cnJlbnRCcmFuY2giLCJ1cHN0cmVhbSIsImdldFB1c2giLCJjb250YWluZWQiLCJnZXRCcmFuY2hlc1dpdGhDb21taXQiLCJzaG93TG9jYWwiLCJzaG93UmVtb3RlIiwicGF0dGVybiIsImdldFNob3J0UmVmIiwic29tZSIsImdldEF1dGhvcnMiLCJhdXRob3JNYXAiLCJBdXRob3IiLCJnZXRCcmFuY2hlcyIsInBheWxvYWRzIiwiQnJhbmNoU2V0IiwibnVsbEJyYW5jaCIsIkJyYW5jaCIsImNyZWF0ZVJlbW90ZVRyYWNraW5nIiwidHJhY2tpbmdSZWYiLCJyZW1vdGVSZWYiLCJoZWFkIiwiZ2V0SGVhZERlc2NyaXB0aW9uIiwiZGVzY3JpYmVIZWFkIiwiaXNNZXJnaW5nIiwiZ2V0R2l0RGlyZWN0b3J5UGF0aCIsImlzUmViYXNpbmciLCJnZXRSZW1vdGVzIiwicmVtb3Rlc0luZm8iLCJSZW1vdGVTZXQiLCJ1cmwiLCJSZW1vdGUiLCJhZGRSZW1vdGUiLCJnZXRBaGVhZENvdW50IiwiYWhlYWRCZWhpbmQiLCJhaGVhZCIsImdldEJlaGluZENvdW50IiwiYmVoaW5kIiwiZ2V0Q29uZmlnIiwib3B0aW9uIiwibG9jYWwiLCJkaXJlY3RHZXRDb25maWciLCJnZXRCbG9iQ29udGVudHMiLCJkaXJlY3RHZXRCbG9iQ29udGVudHMiLCJoYXNEaXNjYXJkSGlzdG9yeSIsImhhc0hpc3RvcnkiLCJnZXREaXNjYXJkSGlzdG9yeSIsImdldEhpc3RvcnkiLCJnZXRMYXN0SGlzdG9yeVNuYXBzaG90cyIsImdldExhc3RTbmFwc2hvdHMiLCJnZXRDYWNoZSIsImJvZHkiLCJ0aGVuIiwicmVzdWx0IiwicmVnaXN0ZXIiLCJhcnJheSIsInByZWRpY2F0ZSIsIm1hdGNoZXMiLCJub25tYXRjaGVzIiwiaXRlbSIsInN0b3JhZ2UiLCJNYXAiLCJieUdyb3VwIiwiZW1pdHRlciIsIkVtaXR0ZXIiLCJvcGVyYXRpb24iLCJwcmltYXJ5IiwiZ2V0UHJpbWFyeSIsImV4aXN0aW5nIiwiZ2V0IiwidW5kZWZpbmVkIiwiaGl0cyIsInByb21pc2UiLCJjcmVhdGVkIiwic2V0IiwiY3JlYXRlZEF0IiwicGVyZm9ybWFuY2UiLCJub3ciLCJncm91cHMiLCJnZXRHcm91cHMiLCJncm91cCIsImdyb3VwU2V0IiwicmVtb3ZlRnJvbUNhY2hlIiwia2V5c0luR3JvdXAiLCJyZW1vdmVQcmltYXJ5IiwiZGVsZXRlIiwicmVtb3ZlRnJvbUdyb3VwIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJlbWl0Iiwib25EaWRVcGRhdGUiLCJjYWxsYmFjayIsIm9uIiwiZGlzcG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7Ozs7O0FBS2UsTUFBTUEsT0FBTixTQUFzQkMsY0FBdEIsQ0FBNEI7QUFDekNDLEVBQUFBLFdBQVcsQ0FBQ0MsVUFBRCxFQUFhQyxPQUFiLEVBQXNCO0FBQy9CLFVBQU1ELFVBQU47QUFFQSxTQUFLRSxLQUFMLEdBQWEsSUFBSUMsS0FBSixFQUFiO0FBRUEsU0FBS0MsY0FBTCxHQUFzQixJQUFJQyx1QkFBSixDQUNwQixLQUFLQyxVQUFMLENBQWdCQyxJQUFoQixDQUFxQixJQUFyQixDQURvQixFQUVwQixLQUFLQyxnQkFBTCxDQUFzQkQsSUFBdEIsQ0FBMkIsSUFBM0IsQ0FGb0IsRUFHcEIsS0FBS0UsU0FBTCxDQUFlRixJQUFmLENBQW9CLElBQXBCLENBSG9CLEVBSXBCLEtBQUtHLE9BQUwsRUFKb0IsRUFLcEI7QUFBQ0MsTUFBQUEsZ0JBQWdCLEVBQUU7QUFBbkIsS0FMb0IsQ0FBdEI7QUFRQSxTQUFLQyxlQUFMLEdBQXVCLElBQUlDLHdCQUFKLENBQW9CO0FBQUNDLE1BQUFBLFNBQVMsRUFBRSxLQUFLQSxTQUFM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QjtBQUNBLFNBQUt4VCxTQUFMO0FBQ0Q7O0FBRUQ0VSxFQUFBQSxlQUFlLENBQUNOLEtBQUQsRUFBUTFRLEdBQVIsRUFBYTtBQUMxQixVQUFNMlEsUUFBUSxHQUFHLEtBQUtuQixPQUFMLENBQWFPLEdBQWIsQ0FBaUJXLEtBQWpCLENBQWpCO0FBQ0FDLElBQUFBLFFBQVEsSUFBSUEsUUFBUSxDQUFDSSxNQUFULENBQWdCL1EsR0FBaEIsQ0FBWjtBQUNBLFNBQUs1RCxTQUFMO0FBQ0Q7QUFFRDs7O0FBQ0EsR0FBQzZVLE1BQU0sQ0FBQ0MsUUFBUixJQUFvQjtBQUNsQixXQUFPLEtBQUs1QixPQUFMLENBQWEyQixNQUFNLENBQUNDLFFBQXBCLEdBQVA7QUFDRDs7QUFFRHRRLEVBQUFBLEtBQUssR0FBRztBQUNOLFNBQUswTyxPQUFMLENBQWExTyxLQUFiO0FBQ0EsU0FBSzRPLE9BQUwsQ0FBYTVPLEtBQWI7QUFDQSxTQUFLeEUsU0FBTDtBQUNEOztBQUVEQSxFQUFBQSxTQUFTLEdBQUc7QUFDVixTQUFLcVQsT0FBTCxDQUFhMEIsSUFBYixDQUFrQixZQUFsQjtBQUNEO0FBRUQ7OztBQUNBQyxFQUFBQSxXQUFXLENBQUNDLFFBQUQsRUFBVztBQUNwQixXQUFPLEtBQUs1QixPQUFMLENBQWE2QixFQUFiLENBQWdCLFlBQWhCLEVBQThCRCxRQUE5QixDQUFQO0FBQ0Q7O0FBRURoVSxFQUFBQSxPQUFPLEdBQUc7QUFDUixTQUFLb1MsT0FBTCxDQUFhOEIsT0FBYjtBQUNEOztBQXZGUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IFN0YXRlIGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHtLZXlzfSBmcm9tICcuL2NhY2hlL2tleXMnO1xuXG5pbXBvcnQge0xhcmdlUmVwb0Vycm9yfSBmcm9tICcuLi8uLi9naXQtc2hlbGwtb3V0LXN0cmF0ZWd5JztcbmltcG9ydCB7Rk9DVVN9IGZyb20gJy4uL3dvcmtzcGFjZS1jaGFuZ2Utb2JzZXJ2ZXInO1xuaW1wb3J0IHtidWlsZEZpbGVQYXRjaCwgYnVpbGRNdWx0aUZpbGVQYXRjaH0gZnJvbSAnLi4vcGF0Y2gnO1xuaW1wb3J0IERpc2NhcmRIaXN0b3J5IGZyb20gJy4uL2Rpc2NhcmQtaGlzdG9yeSc7XG5pbXBvcnQgQnJhbmNoLCB7bnVsbEJyYW5jaH0gZnJvbSAnLi4vYnJhbmNoJztcbmltcG9ydCBBdXRob3IgZnJvbSAnLi4vYXV0aG9yJztcbmltcG9ydCBCcmFuY2hTZXQgZnJvbSAnLi4vYnJhbmNoLXNldCc7XG5pbXBvcnQgUmVtb3RlIGZyb20gJy4uL3JlbW90ZSc7XG5pbXBvcnQgUmVtb3RlU2V0IGZyb20gJy4uL3JlbW90ZS1zZXQnO1xuaW1wb3J0IENvbW1pdCBmcm9tICcuLi9jb21taXQnO1xuaW1wb3J0IE9wZXJhdGlvblN0YXRlcyBmcm9tICcuLi9vcGVyYXRpb24tc3RhdGVzJztcbmltcG9ydCB7YWRkRXZlbnR9IGZyb20gJy4uLy4uL3JlcG9ydGVyLXByb3h5JztcbmltcG9ydCB7ZmlsZVBhdGhFbmRzV2l0aH0gZnJvbSAnLi4vLi4vaGVscGVycyc7XG5cbi8qKlxuICogU3RhdGUgdXNlZCB3aGVuIHRoZSB3b3JraW5nIGRpcmVjdG9yeSBjb250YWlucyBhIHZhbGlkIGdpdCByZXBvc2l0b3J5IGFuZCBjYW4gYmUgaW50ZXJhY3RlZCB3aXRoLiBQZXJmb3Jtc1xuICogYWN0dWFsIGdpdCBvcGVyYXRpb25zLCBjYWNoaW5nIHRoZSByZXN1bHRzLCBhbmQgYnJvYWRjYXN0cyBgb25EaWRVcGRhdGVgIGV2ZW50cyB3aGVuIHdyaXRlIGFjdGlvbnMgYXJlXG4gKiBwZXJmb3JtZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZXNlbnQgZXh0ZW5kcyBTdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHJlcG9zaXRvcnksIGhpc3RvcnkpIHtcbiAgICBzdXBlcihyZXBvc2l0b3J5KTtcblxuICAgIHRoaXMuY2FjaGUgPSBuZXcgQ2FjaGUoKTtcblxuICAgIHRoaXMuZGlzY2FyZEhpc3RvcnkgPSBuZXcgRGlzY2FyZEhpc3RvcnkoXG4gICAgICB0aGlzLmNyZWF0ZUJsb2IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuZXhwYW5kQmxvYlRvRmlsZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5tZXJnZUZpbGUuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMud29ya2RpcigpLFxuICAgICAge21heEhpc3RvcnlMZW5ndGg6IDYwfSxcbiAgICApO1xuXG4gICAgdGhpcy5vcGVyYXRpb25TdGF0ZXMgPSBuZXcgT3BlcmF0aW9uU3RhdGVzKHtkaWRVcGRhdGU6IHRoaXMuZGlkVXBkYXRlLmJpbmQodGhpcyl9KTtcblxuICAgIHRoaXMuY29tbWl0TWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuY29tbWl0TWVzc2FnZVRlbXBsYXRlID0gbnVsbDtcbiAgICB0aGlzLmZldGNoSW5pdGlhbE1lc3NhZ2UoKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKGhpc3RvcnkpIHtcbiAgICAgIHRoaXMuZGlzY2FyZEhpc3RvcnkudXBkYXRlSGlzdG9yeShoaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICBzZXRDb21taXRNZXNzYWdlKG1lc3NhZ2UsIHtzdXBwcmVzc1VwZGF0ZX0gPSB7c3VwcHJlc3NVcGRhdGU6IGZhbHNlfSkge1xuICAgIHRoaXMuY29tbWl0TWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgaWYgKCFzdXBwcmVzc1VwZGF0ZSkge1xuICAgICAgdGhpcy5kaWRVcGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBzZXRDb21taXRNZXNzYWdlVGVtcGxhdGUodGVtcGxhdGUpIHtcbiAgICB0aGlzLmNvbW1pdE1lc3NhZ2VUZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hJbml0aWFsTWVzc2FnZSgpIHtcbiAgICBjb25zdCBtZXJnZU1lc3NhZ2UgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuZ2V0TWVyZ2VNZXNzYWdlKCk7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBhd2FpdCB0aGlzLmZldGNoQ29tbWl0TWVzc2FnZVRlbXBsYXRlKCk7XG4gICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICB0aGlzLmNvbW1pdE1lc3NhZ2VUZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIH1cbiAgICBpZiAobWVyZ2VNZXNzYWdlKSB7XG4gICAgICB0aGlzLnNldENvbW1pdE1lc3NhZ2UobWVyZ2VNZXNzYWdlKTtcbiAgICB9IGVsc2UgaWYgKHRlbXBsYXRlKSB7XG4gICAgICB0aGlzLnNldENvbW1pdE1lc3NhZ2UodGVtcGxhdGUpO1xuICAgIH1cbiAgfVxuXG4gIGdldENvbW1pdE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWl0TWVzc2FnZTtcbiAgfVxuXG4gIGZldGNoQ29tbWl0TWVzc2FnZVRlbXBsYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdpdCgpLmZldGNoQ29tbWl0TWVzc2FnZVRlbXBsYXRlKCk7XG4gIH1cblxuICBnZXRPcGVyYXRpb25TdGF0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uU3RhdGVzO1xuICB9XG5cbiAgaXNQcmVzZW50KCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhY2hlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cblxuICBzaG93U3RhdHVzQmFyVGlsZXMoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc1B1Ymxpc2hhYmxlKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWNjZXB0SW52YWxpZGF0aW9uKHNwZWMsIHtnbG9iYWxseX0gPSB7fSkge1xuICAgIHRoaXMuY2FjaGUuaW52YWxpZGF0ZShzcGVjKCkpO1xuICAgIHRoaXMuZGlkVXBkYXRlKCk7XG4gICAgaWYgKGdsb2JhbGx5KSB7XG4gICAgICB0aGlzLmRpZEdsb2JhbGx5SW52YWxpZGF0ZShzcGVjKTtcbiAgICB9XG4gIH1cblxuICBpbnZhbGlkYXRlQ2FjaGVBZnRlckZpbGVzeXN0ZW1DaGFuZ2UoZXZlbnRzKSB7XG4gICAgY29uc3QgcGF0aHMgPSBldmVudHMubWFwKGUgPT4gZS5zcGVjaWFsIHx8IGUucGF0aCk7XG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGhzW2ldO1xuXG4gICAgICBpZiAoZnVsbFBhdGggPT09IEZPQ1VTKSB7XG4gICAgICAgIGtleXMuYWRkKEtleXMuc3RhdHVzQnVuZGxlKTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIEtleXMuZmlsZVBhdGNoLmVhY2hXaXRoT3B0cyh7c3RhZ2VkOiBmYWxzZX0pKSB7XG4gICAgICAgICAga2V5cy5hZGQoayk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluY2x1ZGVzID0gKC4uLnNlZ21lbnRzKSA9PiBmdWxsUGF0aC5pbmNsdWRlcyhwYXRoLmpvaW4oLi4uc2VnbWVudHMpKTtcblxuICAgICAgaWYgKGZpbGVQYXRoRW5kc1dpdGgoZnVsbFBhdGgsICcuZ2l0JywgJ2luZGV4JykpIHtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5zdGFnZWRDaGFuZ2VzKTtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5maWxlUGF0Y2guYWxsKTtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5pbmRleC5hbGwpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLnN0YXR1c0J1bmRsZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZVBhdGhFbmRzV2l0aChmdWxsUGF0aCwgJy5naXQnLCAnSEVBRCcpKSB7XG4gICAgICAgIGtleXMuYWRkKEtleXMuYnJhbmNoZXMpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLmxhc3RDb21taXQpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLnJlY2VudENvbW1pdHMpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLnN0YXR1c0J1bmRsZSk7XG4gICAgICAgIGtleXMuYWRkKEtleXMuaGVhZERlc2NyaXB0aW9uKTtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5hdXRob3JzKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbmNsdWRlcygnLmdpdCcsICdyZWZzJywgJ2hlYWRzJykpIHtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5icmFuY2hlcyk7XG4gICAgICAgIGtleXMuYWRkKEtleXMubGFzdENvbW1pdCk7XG4gICAgICAgIGtleXMuYWRkKEtleXMucmVjZW50Q29tbWl0cyk7XG4gICAgICAgIGtleXMuYWRkKEtleXMuaGVhZERlc2NyaXB0aW9uKTtcbiAgICAgICAga2V5cy5hZGQoS2V5cy5hdXRob3JzKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbmNsdWRlcygnLmdpdCcsICdyZWZzJywgJ3JlbW90ZXMnKSkge1xuICAgICAgICBrZXlzLmFkZChLZXlzLnJlbW90ZXMpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLnN0YXR1c0J1bmRsZSk7XG4gICAgICAgIGtleXMuYWRkKEtleXMuaGVhZERlc2NyaXB0aW9uKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aEVuZHNXaXRoKGZ1bGxQYXRoLCAnLmdpdCcsICdjb25maWcnKSkge1xuICAgICAgICBrZXlzLmFkZChLZXlzLnJlbW90ZXMpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLmNvbmZpZy5hbGwpO1xuICAgICAgICBrZXlzLmFkZChLZXlzLnN0YXR1c0J1bmRsZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBGaWxlIGNoYW5nZSB3aXRoaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKHRoaXMud29ya2RpcigpLCBmdWxsUGF0aCk7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBLZXlzLmZpbGVQYXRjaC5lYWNoV2l0aEZpbGVPcHRzKFtyZWxhdGl2ZVBhdGhdLCBbe3N0YWdlZDogZmFsc2V9XSkpIHtcbiAgICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICAgIH1cbiAgICAgIGtleXMuYWRkKEtleXMuc3RhdHVzQnVuZGxlKTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChrZXlzLnNpemUgPiAwKSB7XG4gICAgICB0aGlzLmNhY2hlLmludmFsaWRhdGUoQXJyYXkuZnJvbShrZXlzKSk7XG4gICAgICB0aGlzLmRpZFVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ29tbWl0TWVzc2FnZUNsZWFuKCkge1xuICAgIGlmICh0aGlzLmNvbW1pdE1lc3NhZ2UudHJpbSgpID09PSAnJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbW1pdE1lc3NhZ2VUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tbWl0TWVzc2FnZSA9PT0gdGhpcy5jb21taXRNZXNzYWdlVGVtcGxhdGU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUNvbW1pdE1lc3NhZ2VBZnRlckZpbGVTeXN0ZW1DaGFuZ2UoZXZlbnRzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgICBpZiAoIWV2ZW50LnBhdGgpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aEVuZHNXaXRoKGV2ZW50LnBhdGgsICcuZ2l0JywgJ01FUkdFX0hFQUQnKSkge1xuICAgICAgICBpZiAoZXZlbnQuYWN0aW9uID09PSAnY3JlYXRlZCcpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0NvbW1pdE1lc3NhZ2VDbGVhbigpKSB7XG4gICAgICAgICAgICB0aGlzLnNldENvbW1pdE1lc3NhZ2UoYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmdldE1lcmdlTWVzc2FnZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYWN0aW9uID09PSAnZGVsZXRlZCcpIHtcbiAgICAgICAgICB0aGlzLnNldENvbW1pdE1lc3NhZ2UodGhpcy5jb21taXRNZXNzYWdlVGVtcGxhdGUgfHwgJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aEVuZHNXaXRoKGV2ZW50LnBhdGgsICcuZ2l0JywgJ2NvbmZpZycpKSB7XG4gICAgICAgIC8vIHRoaXMgd29uJ3QgY2F0Y2ggY2hhbmdlcyBtYWRlIHRvIHRoZSB0ZW1wbGF0ZSBmaWxlIGl0c2VsZi4uLlxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGF3YWl0IHRoaXMuZmV0Y2hDb21taXRNZXNzYWdlVGVtcGxhdGUoKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5zZXRDb21taXRNZXNzYWdlKCcnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbW1pdE1lc3NhZ2VUZW1wbGF0ZSAhPT0gdGVtcGxhdGUpIHtcbiAgICAgICAgICB0aGlzLnNldENvbW1pdE1lc3NhZ2UodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0Q29tbWl0TWVzc2FnZVRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvYnNlcnZlRmlsZXN5c3RlbUNoYW5nZShldmVudHMpIHtcbiAgICB0aGlzLmludmFsaWRhdGVDYWNoZUFmdGVyRmlsZXN5c3RlbUNoYW5nZShldmVudHMpO1xuICAgIHRoaXMudXBkYXRlQ29tbWl0TWVzc2FnZUFmdGVyRmlsZVN5c3RlbUNoYW5nZShldmVudHMpO1xuICB9XG5cbiAgcmVmcmVzaCgpIHtcbiAgICB0aGlzLmNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5kaWRVcGRhdGUoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmluaXQoKS5jYXRjaChlID0+IHtcbiAgICAgIGUuc3RkRXJyID0gJ1RoaXMgZGlyZWN0b3J5IGFscmVhZHkgY29udGFpbnMgYSBnaXQgcmVwb3NpdG9yeSc7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9uZSgpIHtcbiAgICByZXR1cm4gc3VwZXIuY2xvbmUoKS5jYXRjaChlID0+IHtcbiAgICAgIGUuc3RkRXJyID0gJ1RoaXMgZGlyZWN0b3J5IGFscmVhZHkgY29udGFpbnMgYSBnaXQgcmVwb3NpdG9yeSc7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBHaXQgb3BlcmF0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gU3RhZ2luZyBhbmQgdW5zdGFnaW5nXG5cbiAgc3RhZ2VGaWxlcyhwYXRocykge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBLZXlzLmNhY2hlT3BlcmF0aW9uS2V5cyhwYXRocyksXG4gICAgICAoKSA9PiB0aGlzLmdpdCgpLnN0YWdlRmlsZXMocGF0aHMpLFxuICAgICk7XG4gIH1cblxuICB1bnN0YWdlRmlsZXMocGF0aHMpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgKCkgPT4gS2V5cy5jYWNoZU9wZXJhdGlvbktleXMocGF0aHMpLFxuICAgICAgKCkgPT4gdGhpcy5naXQoKS51bnN0YWdlRmlsZXMocGF0aHMpLFxuICAgICk7XG4gIH1cblxuICBzdGFnZUZpbGVzRnJvbVBhcmVudENvbW1pdChwYXRocykge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBLZXlzLmNhY2hlT3BlcmF0aW9uS2V5cyhwYXRocyksXG4gICAgICAoKSA9PiB0aGlzLmdpdCgpLnVuc3RhZ2VGaWxlcyhwYXRocywgJ0hFQUR+JyksXG4gICAgKTtcbiAgfVxuXG4gIHN0YWdlRmlsZU1vZGVDaGFuZ2UoZmlsZVBhdGgsIGZpbGVNb2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IEtleXMuY2FjaGVPcGVyYXRpb25LZXlzKFtmaWxlUGF0aF0pLFxuICAgICAgKCkgPT4gdGhpcy5naXQoKS5zdGFnZUZpbGVNb2RlQ2hhbmdlKGZpbGVQYXRoLCBmaWxlTW9kZSksXG4gICAgKTtcbiAgfVxuXG4gIHN0YWdlRmlsZVN5bWxpbmtDaGFuZ2UoZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgKCkgPT4gS2V5cy5jYWNoZU9wZXJhdGlvbktleXMoW2ZpbGVQYXRoXSksXG4gICAgICAoKSA9PiB0aGlzLmdpdCgpLnN0YWdlRmlsZVN5bWxpbmtDaGFuZ2UoZmlsZVBhdGgpLFxuICAgICk7XG4gIH1cblxuICBhcHBseVBhdGNoVG9JbmRleChtdWx0aUZpbGVQYXRjaCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBLZXlzLmNhY2hlT3BlcmF0aW9uS2V5cyhBcnJheS5mcm9tKG11bHRpRmlsZVBhdGNoLmdldFBhdGhTZXQoKSkpLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXRjaFN0ciA9IG11bHRpRmlsZVBhdGNoLnRvU3RyaW5nKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmdpdCgpLmFwcGx5UGF0Y2gocGF0Y2hTdHIsIHtpbmRleDogdHJ1ZX0pO1xuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgYXBwbHlQYXRjaFRvV29ya2RpcihtdWx0aUZpbGVQYXRjaCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBLZXlzLndvcmtkaXJPcGVyYXRpb25LZXlzKEFycmF5LmZyb20obXVsdGlGaWxlUGF0Y2guZ2V0UGF0aFNldCgpKSksXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGNoU3RyID0gbXVsdGlGaWxlUGF0Y2gudG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2l0KCkuYXBwbHlQYXRjaChwYXRjaFN0cik7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvLyBDb21taXR0aW5nXG5cbiAgY29tbWl0KG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgS2V5cy5oZWFkT3BlcmF0aW9uS2V5cyxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgICAgICgpID0+IHRoaXMuZXhlY3V0ZVBpcGVsaW5lQWN0aW9uKCdDT01NSVQnLCBhc3luYyAobWVzc2FnZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvQXV0aG9ycyA9IG9wdGlvbnMuY29BdXRob3JzO1xuICAgICAgICBjb25zdCBvcHRzID0gIWNvQXV0aG9ycyA/IG9wdGlvbnMgOiB7XG4gICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICBjb0F1dGhvcnM6IGNvQXV0aG9ycy5tYXAoYXV0aG9yID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7ZW1haWw6IGF1dGhvci5nZXRFbWFpbCgpLCBuYW1lOiBhdXRob3IuZ2V0RnVsbE5hbWUoKX07XG4gICAgICAgICAgfSksXG4gICAgICAgIH07XG5cbiAgICAgICAgYXdhaXQgdGhpcy5naXQoKS5jb21taXQobWVzc2FnZSwgb3B0cyk7XG5cbiAgICAgICAgLy8gQ29sbGVjdCBjb21taXQgbWV0YWRhdGEgbWV0cmljc1xuICAgICAgICAvLyBub3RlOiBpbiBHaXRTaGVsbE91dFN0cmF0ZWd5IHdlIGhhdmUgY291bnRlcnMgZm9yIGFsbCBnaXQgY29tbWFuZHMsIGluY2x1ZGluZyBgY29tbWl0YCwgYnV0IGhlcmUgd2UgaGF2ZVxuICAgICAgICAvLyAgICAgICBhY2Nlc3MgdG8gYWRkaXRpb25hbCBtZXRhZGF0YSAodW5zdGFnZWQgZmlsZSBjb3VudCkgc28gaXQgbWFrZXMgc2Vuc2UgdG8gY29sbGVjdCBjb21taXQgZXZlbnRzIGhlcmVcbiAgICAgICAgY29uc3Qge3Vuc3RhZ2VkRmlsZXMsIG1lcmdlQ29uZmxpY3RGaWxlc30gPSBhd2FpdCB0aGlzLmdldFN0YXR1c2VzRm9yQ2hhbmdlZEZpbGVzKCk7XG4gICAgICAgIGNvbnN0IHVuc3RhZ2VkQ291bnQgPSBPYmplY3Qua2V5cyh7Li4udW5zdGFnZWRGaWxlcywgLi4ubWVyZ2VDb25mbGljdEZpbGVzfSkubGVuZ3RoO1xuICAgICAgICBhZGRFdmVudCgnY29tbWl0Jywge1xuICAgICAgICAgIHBhY2thZ2U6ICdnaXRodWInLFxuICAgICAgICAgIHBhcnRpYWw6IHVuc3RhZ2VkQ291bnQgPiAwLFxuICAgICAgICAgIGFtZW5kOiAhIW9wdGlvbnMuYW1lbmQsXG4gICAgICAgICAgY29BdXRob3JDb3VudDogY29BdXRob3JzID8gY29BdXRob3JzLmxlbmd0aCA6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfSwgbWVzc2FnZSwgb3B0aW9ucyksXG4gICAgKTtcbiAgfVxuXG4gIC8vIE1lcmdpbmdcblxuICBtZXJnZShicmFuY2hOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IFtcbiAgICAgICAgLi4uS2V5cy5oZWFkT3BlcmF0aW9uS2V5cygpLFxuICAgICAgICBLZXlzLmluZGV4LmFsbCxcbiAgICAgICAgS2V5cy5oZWFkRGVzY3JpcHRpb24sXG4gICAgICBdLFxuICAgICAgKCkgPT4gdGhpcy5naXQoKS5tZXJnZShicmFuY2hOYW1lKSxcbiAgICApO1xuICB9XG5cbiAgYWJvcnRNZXJnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgKCkgPT4gW1xuICAgICAgICBLZXlzLnN0YXR1c0J1bmRsZSxcbiAgICAgICAgS2V5cy5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICBLZXlzLmZpbGVQYXRjaC5hbGwsXG4gICAgICAgIEtleXMuaW5kZXguYWxsLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5naXQoKS5hYm9ydE1lcmdlKCk7XG4gICAgICAgIHRoaXMuc2V0Q29tbWl0TWVzc2FnZSh0aGlzLmNvbW1pdE1lc3NhZ2VUZW1wbGF0ZSB8fCAnJyk7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBjaGVja291dFNpZGUoc2lkZSwgcGF0aHMpIHtcbiAgICByZXR1cm4gdGhpcy5naXQoKS5jaGVja291dFNpZGUoc2lkZSwgcGF0aHMpO1xuICB9XG5cbiAgbWVyZ2VGaWxlKG91cnNQYXRoLCBjb21tb25CYXNlUGF0aCwgdGhlaXJzUGF0aCwgcmVzdWx0UGF0aCkge1xuICAgIHJldHVybiB0aGlzLmdpdCgpLm1lcmdlRmlsZShvdXJzUGF0aCwgY29tbW9uQmFzZVBhdGgsIHRoZWlyc1BhdGgsIHJlc3VsdFBhdGgpO1xuICB9XG5cbiAgd3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleChmaWxlUGF0aCwgY29tbW9uQmFzZVNoYSwgb3Vyc1NoYSwgdGhlaXJzU2hhKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IFtcbiAgICAgICAgS2V5cy5zdGF0dXNCdW5kbGUsXG4gICAgICAgIEtleXMuc3RhZ2VkQ2hhbmdlcyxcbiAgICAgICAgLi4uS2V5cy5maWxlUGF0Y2guZWFjaFdpdGhGaWxlT3B0cyhbZmlsZVBhdGhdLCBbe3N0YWdlZDogZmFsc2V9LCB7c3RhZ2VkOiB0cnVlfV0pLFxuICAgICAgICBLZXlzLmluZGV4Lm9uZVdpdGgoZmlsZVBhdGgpLFxuICAgICAgXSxcbiAgICAgICgpID0+IHRoaXMuZ2l0KCkud3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleChmaWxlUGF0aCwgY29tbW9uQmFzZVNoYSwgb3Vyc1NoYSwgdGhlaXJzU2hhKSxcbiAgICApO1xuICB9XG5cbiAgLy8gQ2hlY2tvdXRcblxuICBjaGVja291dChyZXZpc2lvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IFtcbiAgICAgICAgS2V5cy5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICBLZXlzLmxhc3RDb21taXQsXG4gICAgICAgIEtleXMucmVjZW50Q29tbWl0cyxcbiAgICAgICAgS2V5cy5hdXRob3JzLFxuICAgICAgICBLZXlzLnN0YXR1c0J1bmRsZSxcbiAgICAgICAgS2V5cy5pbmRleC5hbGwsXG4gICAgICAgIC4uLktleXMuZmlsZVBhdGNoLmVhY2hXaXRoT3B0cyh7c3RhZ2VkOiB0cnVlfSksXG4gICAgICAgIEtleXMuZmlsZVBhdGNoLmFsbEFnYWluc3ROb25IZWFkLFxuICAgICAgICBLZXlzLmhlYWREZXNjcmlwdGlvbixcbiAgICAgICAgS2V5cy5icmFuY2hlcyxcbiAgICAgIF0sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2hhZG93XG4gICAgICAoKSA9PiB0aGlzLmV4ZWN1dGVQaXBlbGluZUFjdGlvbignQ0hFQ0tPVVQnLCAocmV2aXNpb24sIG9wdGlvbnMpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2l0KCkuY2hlY2tvdXQocmV2aXNpb24sIG9wdGlvbnMpO1xuICAgICAgfSwgcmV2aXNpb24sIG9wdGlvbnMpLFxuICAgICk7XG4gIH1cblxuICBjaGVja291dFBhdGhzQXRSZXZpc2lvbihwYXRocywgcmV2aXNpb24gPSAnSEVBRCcpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgKCkgPT4gW1xuICAgICAgICBLZXlzLnN0YXR1c0J1bmRsZSxcbiAgICAgICAgS2V5cy5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICAuLi5wYXRocy5tYXAoZmlsZU5hbWUgPT4gS2V5cy5pbmRleC5vbmVXaXRoKGZpbGVOYW1lKSksXG4gICAgICAgIC4uLktleXMuZmlsZVBhdGNoLmVhY2hXaXRoRmlsZU9wdHMocGF0aHMsIFt7c3RhZ2VkOiB0cnVlfV0pLFxuICAgICAgICAuLi5LZXlzLmZpbGVQYXRjaC5lYWNoTm9uSGVhZFdpdGhGaWxlcyhwYXRocyksXG4gICAgICBdLFxuICAgICAgKCkgPT4gdGhpcy5naXQoKS5jaGVja291dEZpbGVzKHBhdGhzLCByZXZpc2lvbiksXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJlc2V0XG5cbiAgdW5kb0xhc3RDb21taXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IFtcbiAgICAgICAgS2V5cy5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICBLZXlzLmxhc3RDb21taXQsXG4gICAgICAgIEtleXMucmVjZW50Q29tbWl0cyxcbiAgICAgICAgS2V5cy5hdXRob3JzLFxuICAgICAgICBLZXlzLnN0YXR1c0J1bmRsZSxcbiAgICAgICAgS2V5cy5pbmRleC5hbGwsXG4gICAgICAgIC4uLktleXMuZmlsZVBhdGNoLmVhY2hXaXRoT3B0cyh7c3RhZ2VkOiB0cnVlfSksXG4gICAgICAgIEtleXMuaGVhZERlc2NyaXB0aW9uLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmdpdCgpLnJlc2V0KCdzb2Z0JywgJ0hFQUR+Jyk7XG4gICAgICAgICAgYWRkRXZlbnQoJ3VuZG8tbGFzdC1jb21taXQnLCB7cGFja2FnZTogJ2dpdGh1Yid9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmICgvdW5rbm93biByZXZpc2lvbi8udGVzdChlLnN0ZEVycikpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWwgY29tbWl0XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdpdCgpLmRlbGV0ZVJlZignSEVBRCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgLy8gUmVtb3RlIGludGVyYWN0aW9uc1xuXG4gIGZldGNoKGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBbXG4gICAgICAgIEtleXMuc3RhdHVzQnVuZGxlLFxuICAgICAgICBLZXlzLmhlYWREZXNjcmlwdGlvbixcbiAgICAgIF0sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2hhZG93XG4gICAgICAoKSA9PiB0aGlzLmV4ZWN1dGVQaXBlbGluZUFjdGlvbignRkVUQ0gnLCBhc3luYyBicmFuY2hOYW1lID0+IHtcbiAgICAgICAgbGV0IGZpbmFsUmVtb3RlTmFtZSA9IG9wdGlvbnMucmVtb3RlTmFtZTtcbiAgICAgICAgaWYgKCFmaW5hbFJlbW90ZU5hbWUpIHtcbiAgICAgICAgICBjb25zdCByZW1vdGUgPSBhd2FpdCB0aGlzLmdldFJlbW90ZUZvckJyYW5jaChicmFuY2hOYW1lKTtcbiAgICAgICAgICBpZiAoIXJlbW90ZS5pc1ByZXNlbnQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbmFsUmVtb3RlTmFtZSA9IHJlbW90ZS5nZXROYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2l0KCkuZmV0Y2goZmluYWxSZW1vdGVOYW1lLCBicmFuY2hOYW1lKTtcbiAgICAgIH0sIGJyYW5jaE5hbWUpLFxuICAgICk7XG4gIH1cblxuICBwdWxsKGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBbXG4gICAgICAgIC4uLktleXMuaGVhZE9wZXJhdGlvbktleXMoKSxcbiAgICAgICAgS2V5cy5pbmRleC5hbGwsXG4gICAgICAgIEtleXMuaGVhZERlc2NyaXB0aW9uLFxuICAgICAgICBLZXlzLmJyYW5jaGVzLFxuICAgICAgXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgICAgICgpID0+IHRoaXMuZXhlY3V0ZVBpcGVsaW5lQWN0aW9uKCdQVUxMJywgYXN5bmMgYnJhbmNoTmFtZSA9PiB7XG4gICAgICAgIGxldCBmaW5hbFJlbW90ZU5hbWUgPSBvcHRpb25zLnJlbW90ZU5hbWU7XG4gICAgICAgIGlmICghZmluYWxSZW1vdGVOYW1lKSB7XG4gICAgICAgICAgY29uc3QgcmVtb3RlID0gYXdhaXQgdGhpcy5nZXRSZW1vdGVGb3JCcmFuY2goYnJhbmNoTmFtZSk7XG4gICAgICAgICAgaWYgKCFyZW1vdGUuaXNQcmVzZW50KCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaW5hbFJlbW90ZU5hbWUgPSByZW1vdGUuZ2V0TmFtZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdpdCgpLnB1bGwoZmluYWxSZW1vdGVOYW1lLCBicmFuY2hOYW1lLCBvcHRpb25zKTtcbiAgICAgIH0sIGJyYW5jaE5hbWUpLFxuICAgICk7XG4gIH1cblxuICBwdXNoKGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBbXG4gICAgICAgICAgS2V5cy5zdGF0dXNCdW5kbGUsXG4gICAgICAgICAgS2V5cy5oZWFkRGVzY3JpcHRpb24sXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc2V0VXBzdHJlYW0pIHtcbiAgICAgICAgICBrZXlzLnB1c2goS2V5cy5icmFuY2hlcyk7XG4gICAgICAgICAga2V5cy5wdXNoKC4uLktleXMuY29uZmlnLmVhY2hXaXRoU2V0dGluZyhgYnJhbmNoLiR7YnJhbmNoTmFtZX0ucmVtb3RlYCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICB9LFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNoYWRvd1xuICAgICAgKCkgPT4gdGhpcy5leGVjdXRlUGlwZWxpbmVBY3Rpb24oJ1BVU0gnLCBhc3luYyAoYnJhbmNoTmFtZSwgb3B0aW9ucykgPT4ge1xuICAgICAgICBjb25zdCByZW1vdGUgPSBvcHRpb25zLnJlbW90ZSB8fCBhd2FpdCB0aGlzLmdldFJlbW90ZUZvckJyYW5jaChicmFuY2hOYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2l0KCkucHVzaChyZW1vdGUuZ2V0TmFtZU9yKCdvcmlnaW4nKSwgYnJhbmNoTmFtZSwgb3B0aW9ucyk7XG4gICAgICB9LCBicmFuY2hOYW1lLCBvcHRpb25zKSxcbiAgICApO1xuICB9XG5cbiAgLy8gQ29uZmlndXJhdGlvblxuXG4gIHNldENvbmZpZyhzZXR0aW5nLCB2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IEtleXMuY29uZmlnLmVhY2hXaXRoU2V0dGluZyhzZXR0aW5nKSxcbiAgICAgICgpID0+IHRoaXMuZ2l0KCkuc2V0Q29uZmlnKHNldHRpbmcsIHZhbHVlLCBvcHRpb25zKSxcbiAgICAgIHtnbG9iYWxseTogb3B0aW9ucy5nbG9iYWx9LFxuICAgICk7XG4gIH1cblxuICB1bnNldENvbmZpZyhzZXR0aW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShcbiAgICAgICgpID0+IEtleXMuY29uZmlnLmVhY2hXaXRoU2V0dGluZyhzZXR0aW5nKSxcbiAgICAgICgpID0+IHRoaXMuZ2l0KCkudW5zZXRDb25maWcoc2V0dGluZyksXG4gICAgKTtcbiAgfVxuXG4gIC8vIERpcmVjdCBibG9iIGludGVyYWN0aW9uc1xuXG4gIGNyZWF0ZUJsb2Iob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmdpdCgpLmNyZWF0ZUJsb2Iob3B0aW9ucyk7XG4gIH1cblxuICBleHBhbmRCbG9iVG9GaWxlKGFic0ZpbGVQYXRoLCBzaGEpIHtcbiAgICByZXR1cm4gdGhpcy5naXQoKS5leHBhbmRCbG9iVG9GaWxlKGFic0ZpbGVQYXRoLCBzaGEpO1xuICB9XG5cbiAgLy8gRGlzY2FyZCBoaXN0b3J5XG5cbiAgY3JlYXRlRGlzY2FyZEhpc3RvcnlCbG9iKCkge1xuICAgIHJldHVybiB0aGlzLmRpc2NhcmRIaXN0b3J5LmNyZWF0ZUhpc3RvcnlCbG9iKCk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVEaXNjYXJkSGlzdG9yeSgpIHtcbiAgICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5sb2FkSGlzdG9yeVBheWxvYWQoKTtcbiAgICB0aGlzLmRpc2NhcmRIaXN0b3J5LnVwZGF0ZUhpc3RvcnkoaGlzdG9yeSk7XG4gIH1cblxuICBhc3luYyBzdG9yZUJlZm9yZUFuZEFmdGVyQmxvYnMoZmlsZVBhdGhzLCBpc1NhZmUsIGRlc3RydWN0aXZlQWN0aW9uLCBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGNvbnN0IHNuYXBzaG90cyA9IGF3YWl0IHRoaXMuZGlzY2FyZEhpc3Rvcnkuc3RvcmVCZWZvcmVBbmRBZnRlckJsb2JzKFxuICAgICAgZmlsZVBhdGhzLFxuICAgICAgaXNTYWZlLFxuICAgICAgZGVzdHJ1Y3RpdmVBY3Rpb24sXG4gICAgICBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoLFxuICAgICk7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoc25hcHNob3RzKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEaXNjYXJkSGlzdG9yeSgpO1xuICAgIH1cbiAgICByZXR1cm4gc25hcHNob3RzO1xuICB9XG5cbiAgcmVzdG9yZUxhc3REaXNjYXJkSW5UZW1wRmlsZXMoaXNTYWZlLCBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLmRpc2NhcmRIaXN0b3J5LnJlc3RvcmVMYXN0RGlzY2FyZEluVGVtcEZpbGVzKGlzU2FmZSwgcGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gIH1cblxuICBhc3luYyBwb3BEaXNjYXJkSGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGNvbnN0IHJlbW92ZWQgPSBhd2FpdCB0aGlzLmRpc2NhcmRIaXN0b3J5LnBvcEhpc3RvcnkocGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZURpc2NhcmRIaXN0b3J5KCk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXJEaXNjYXJkSGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIHRoaXMuZGlzY2FyZEhpc3RvcnkuY2xlYXJIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgIHJldHVybiB0aGlzLnNhdmVEaXNjYXJkSGlzdG9yeSgpO1xuICB9XG5cbiAgZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHMocGF0aHMpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKFxuICAgICAgKCkgPT4gW1xuICAgICAgICBLZXlzLnN0YXR1c0J1bmRsZSxcbiAgICAgICAgLi4ucGF0aHMubWFwKGZpbGVQYXRoID0+IEtleXMuZmlsZVBhdGNoLm9uZVdpdGgoZmlsZVBhdGgsIHtzdGFnZWQ6IGZhbHNlfSkpLFxuICAgICAgICAuLi5LZXlzLmZpbGVQYXRjaC5lYWNoTm9uSGVhZFdpdGhGaWxlcyhwYXRocyksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnRyYWNrZWRGaWxlcyA9IGF3YWl0IHRoaXMuZ2l0KCkuZ2V0VW50cmFja2VkRmlsZXMoKTtcbiAgICAgICAgY29uc3QgW2ZpbGVzVG9SZW1vdmUsIGZpbGVzVG9DaGVja291dF0gPSBwYXJ0aXRpb24ocGF0aHMsIGYgPT4gdW50cmFja2VkRmlsZXMuaW5jbHVkZXMoZikpO1xuICAgICAgICBhd2FpdCB0aGlzLmdpdCgpLmNoZWNrb3V0RmlsZXMoZmlsZXNUb0NoZWNrb3V0KTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXNUb1JlbW92ZS5tYXAoZmlsZVBhdGggPT4ge1xuICAgICAgICAgIGNvbnN0IGFic1BhdGggPSBwYXRoLmpvaW4odGhpcy53b3JrZGlyKCksIGZpbGVQYXRoKTtcbiAgICAgICAgICByZXR1cm4gZnMucmVtb3ZlKGFic1BhdGgpO1xuICAgICAgICB9KSk7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvLyBBY2Nlc3NvcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gSW5kZXggcXVlcmllc1xuXG4gIGdldFN0YXR1c0J1bmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRPclNldChLZXlzLnN0YXR1c0J1bmRsZSwgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYnVuZGxlID0gYXdhaXQgdGhpcy5naXQoKS5nZXRTdGF0dXNCdW5kbGUoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuZm9ybWF0Q2hhbmdlZEZpbGVzKGJ1bmRsZSk7XG4gICAgICAgIHJlc3VsdHMuYnJhbmNoID0gYnVuZGxlLmJyYW5jaDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIExhcmdlUmVwb0Vycm9yKSB7XG4gICAgICAgICAgdGhpcy50cmFuc2l0aW9uVG8oJ1Rvb0xhcmdlJyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJyYW5jaDoge30sXG4gICAgICAgICAgICBzdGFnZWRGaWxlczoge30sXG4gICAgICAgICAgICB1bnN0YWdlZEZpbGVzOiB7fSxcbiAgICAgICAgICAgIG1lcmdlQ29uZmxpY3RGaWxlczoge30sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGZvcm1hdENoYW5nZWRGaWxlcyh7Y2hhbmdlZEVudHJpZXMsIHVudHJhY2tlZEVudHJpZXMsIHJlbmFtZWRFbnRyaWVzLCB1bm1lcmdlZEVudHJpZXN9KSB7XG4gICAgY29uc3Qgc3RhdHVzTWFwID0ge1xuICAgICAgQTogJ2FkZGVkJyxcbiAgICAgIE06ICdtb2RpZmllZCcsXG4gICAgICBEOiAnZGVsZXRlZCcsXG4gICAgICBVOiAnbW9kaWZpZWQnLFxuICAgICAgVDogJ3R5cGVjaGFuZ2UnLFxuICAgIH07XG5cbiAgICBjb25zdCBzdGFnZWRGaWxlcyA9IHt9O1xuICAgIGNvbnN0IHVuc3RhZ2VkRmlsZXMgPSB7fTtcbiAgICBjb25zdCBtZXJnZUNvbmZsaWN0RmlsZXMgPSB7fTtcblxuICAgIGNoYW5nZWRFbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgaWYgKGVudHJ5LnN0YWdlZFN0YXR1cykge1xuICAgICAgICBzdGFnZWRGaWxlc1tlbnRyeS5maWxlUGF0aF0gPSBzdGF0dXNNYXBbZW50cnkuc3RhZ2VkU3RhdHVzXTtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS51bnN0YWdlZFN0YXR1cykge1xuICAgICAgICB1bnN0YWdlZEZpbGVzW2VudHJ5LmZpbGVQYXRoXSA9IHN0YXR1c01hcFtlbnRyeS51bnN0YWdlZFN0YXR1c107XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB1bnRyYWNrZWRFbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgdW5zdGFnZWRGaWxlc1tlbnRyeS5maWxlUGF0aF0gPSBzdGF0dXNNYXAuQTtcbiAgICB9KTtcblxuICAgIHJlbmFtZWRFbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgaWYgKGVudHJ5LnN0YWdlZFN0YXR1cyA9PT0gJ1InKSB7XG4gICAgICAgIHN0YWdlZEZpbGVzW2VudHJ5LmZpbGVQYXRoXSA9IHN0YXR1c01hcC5BO1xuICAgICAgICBzdGFnZWRGaWxlc1tlbnRyeS5vcmlnRmlsZVBhdGhdID0gc3RhdHVzTWFwLkQ7XG4gICAgICB9XG4gICAgICBpZiAoZW50cnkudW5zdGFnZWRTdGF0dXMgPT09ICdSJykge1xuICAgICAgICB1bnN0YWdlZEZpbGVzW2VudHJ5LmZpbGVQYXRoXSA9IHN0YXR1c01hcC5BO1xuICAgICAgICB1bnN0YWdlZEZpbGVzW2VudHJ5Lm9yaWdGaWxlUGF0aF0gPSBzdGF0dXNNYXAuRDtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS5zdGFnZWRTdGF0dXMgPT09ICdDJykge1xuICAgICAgICBzdGFnZWRGaWxlc1tlbnRyeS5maWxlUGF0aF0gPSBzdGF0dXNNYXAuQTtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS51bnN0YWdlZFN0YXR1cyA9PT0gJ0MnKSB7XG4gICAgICAgIHVuc3RhZ2VkRmlsZXNbZW50cnkuZmlsZVBhdGhdID0gc3RhdHVzTWFwLkE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgc3RhdHVzVG9IZWFkO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bm1lcmdlZEVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHtzdGFnZWRTdGF0dXMsIHVuc3RhZ2VkU3RhdHVzLCBmaWxlUGF0aH0gPSB1bm1lcmdlZEVudHJpZXNbaV07XG4gICAgICBpZiAoc3RhZ2VkU3RhdHVzID09PSAnVScgfHwgdW5zdGFnZWRTdGF0dXMgPT09ICdVJyB8fCAoc3RhZ2VkU3RhdHVzID09PSAnQScgJiYgdW5zdGFnZWRTdGF0dXMgPT09ICdBJykpIHtcbiAgICAgICAgLy8gU2tpcHBpbmcgdGhpcyBjaGVjayBoZXJlIGJlY2F1c2Ugd2Ugb25seSBydW4gYSBzaW5nbGUgYGF3YWl0YFxuICAgICAgICAvLyBhbmQgd2Ugb25seSBydW4gaXQgaW4gdGhlIG1haW4sIHN5bmNocm9ub3VzIGJvZHkgb2YgdGhlIGZvciBsb29wLlxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICBpZiAoIXN0YXR1c1RvSGVhZCkgeyBzdGF0dXNUb0hlYWQgPSBhd2FpdCB0aGlzLmdpdCgpLmRpZmZGaWxlU3RhdHVzKHt0YXJnZXQ6ICdIRUFEJ30pOyB9XG4gICAgICAgIG1lcmdlQ29uZmxpY3RGaWxlc1tmaWxlUGF0aF0gPSB7XG4gICAgICAgICAgb3Vyczogc3RhdHVzTWFwW3N0YWdlZFN0YXR1c10sXG4gICAgICAgICAgdGhlaXJzOiBzdGF0dXNNYXBbdW5zdGFnZWRTdGF0dXNdLFxuICAgICAgICAgIGZpbGU6IHN0YXR1c1RvSGVhZFtmaWxlUGF0aF0gfHwgJ2VxdWl2YWxlbnQnLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7c3RhZ2VkRmlsZXMsIHVuc3RhZ2VkRmlsZXMsIG1lcmdlQ29uZmxpY3RGaWxlc307XG4gIH1cblxuICBhc3luYyBnZXRTdGF0dXNlc0ZvckNoYW5nZWRGaWxlcygpIHtcbiAgICBjb25zdCB7c3RhZ2VkRmlsZXMsIHVuc3RhZ2VkRmlsZXMsIG1lcmdlQ29uZmxpY3RGaWxlc30gPSBhd2FpdCB0aGlzLmdldFN0YXR1c0J1bmRsZSgpO1xuICAgIHJldHVybiB7c3RhZ2VkRmlsZXMsIHVuc3RhZ2VkRmlsZXMsIG1lcmdlQ29uZmxpY3RGaWxlc307XG4gIH1cblxuICBnZXRGaWxlUGF0Y2hGb3JQYXRoKGZpbGVQYXRoLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgIHN0YWdlZDogZmFsc2UsXG4gICAgICBwYXRjaEJ1ZmZlcjogbnVsbCxcbiAgICAgIGJ1aWxkZXI6IHt9LFxuICAgICAgYmVmb3JlOiAoKSA9PiB7fSxcbiAgICAgIGFmdGVyOiAoKSA9PiB7fSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMuZmlsZVBhdGNoLm9uZVdpdGgoZmlsZVBhdGgsIHtzdGFnZWQ6IG9wdHMuc3RhZ2VkfSksIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGRpZmZzID0gYXdhaXQgdGhpcy5naXQoKS5nZXREaWZmc0ZvckZpbGVQYXRoKGZpbGVQYXRoLCB7c3RhZ2VkOiBvcHRzLnN0YWdlZH0pO1xuICAgICAgY29uc3QgcGF5bG9hZCA9IG9wdHMuYmVmb3JlKCk7XG4gICAgICBjb25zdCBwYXRjaCA9IGJ1aWxkRmlsZVBhdGNoKGRpZmZzLCBvcHRzLmJ1aWxkZXIpO1xuICAgICAgaWYgKG9wdHMucGF0Y2hCdWZmZXIgIT09IG51bGwpIHsgcGF0Y2guYWRvcHRCdWZmZXIob3B0cy5wYXRjaEJ1ZmZlcik7IH1cbiAgICAgIG9wdHMuYWZ0ZXIocGF0Y2gsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuIHBhdGNoO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RGlmZnNGb3JGaWxlUGF0aChmaWxlUGF0aCwgYmFzZUNvbW1pdCkge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMuZmlsZVBhdGNoLm9uZVdpdGgoZmlsZVBhdGgsIHtiYXNlQ29tbWl0fSksICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdpdCgpLmdldERpZmZzRm9yRmlsZVBhdGgoZmlsZVBhdGgsIHtiYXNlQ29tbWl0fSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRTdGFnZWRDaGFuZ2VzUGF0Y2gob3B0aW9ucykge1xuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICBidWlsZGVyOiB7fSxcbiAgICAgIHBhdGNoQnVmZmVyOiBudWxsLFxuICAgICAgYmVmb3JlOiAoKSA9PiB7fSxcbiAgICAgIGFmdGVyOiAoKSA9PiB7fSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMuc3RhZ2VkQ2hhbmdlcywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZGlmZnMgPSBhd2FpdCB0aGlzLmdpdCgpLmdldFN0YWdlZENoYW5nZXNQYXRjaCgpO1xuICAgICAgY29uc3QgcGF5bG9hZCA9IG9wdHMuYmVmb3JlKCk7XG4gICAgICBjb25zdCBwYXRjaCA9IGJ1aWxkTXVsdGlGaWxlUGF0Y2goZGlmZnMsIG9wdHMuYnVpbGRlcik7XG4gICAgICBpZiAob3B0cy5wYXRjaEJ1ZmZlciAhPT0gbnVsbCkgeyBwYXRjaC5hZG9wdEJ1ZmZlcihvcHRzLnBhdGNoQnVmZmVyKTsgfVxuICAgICAgb3B0cy5hZnRlcihwYXRjaCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm4gcGF0Y2g7XG4gICAgfSk7XG4gIH1cblxuICByZWFkRmlsZUZyb21JbmRleChmaWxlUGF0aCkge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMuaW5kZXgub25lV2l0aChmaWxlUGF0aCksICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdpdCgpLnJlYWRGaWxlRnJvbUluZGV4KGZpbGVQYXRoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIENvbW1pdCBhY2Nlc3NcblxuICBnZXRMYXN0Q29tbWl0KCkge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMubGFzdENvbW1pdCwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgaGVhZENvbW1pdCA9IGF3YWl0IHRoaXMuZ2l0KCkuZ2V0SGVhZENvbW1pdCgpO1xuICAgICAgcmV0dXJuIGhlYWRDb21taXQudW5ib3JuUmVmID8gQ29tbWl0LmNyZWF0ZVVuYm9ybigpIDogbmV3IENvbW1pdChoZWFkQ29tbWl0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbW1pdChzaGEpIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRPclNldChLZXlzLmJsb2Iub25lV2l0aChzaGEpLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBbcmF3Q29tbWl0XSA9IGF3YWl0IHRoaXMuZ2l0KCkuZ2V0Q29tbWl0cyh7bWF4OiAxLCByZWY6IHNoYSwgaW5jbHVkZVBhdGNoOiB0cnVlfSk7XG4gICAgICBjb25zdCBjb21taXQgPSBuZXcgQ29tbWl0KHJhd0NvbW1pdCk7XG4gICAgICByZXR1cm4gY29tbWl0O1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UmVjZW50Q29tbWl0cyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0T3JTZXQoS2V5cy5yZWNlbnRDb21taXRzLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb21taXRzID0gYXdhaXQgdGhpcy5naXQoKS5nZXRDb21taXRzKHtyZWY6ICdIRUFEJywgLi4ub3B0aW9uc30pO1xuICAgICAgcmV0dXJuIGNvbW1pdHMubWFwKGNvbW1pdCA9PiBuZXcgQ29tbWl0KGNvbW1pdCkpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgaXNDb21taXRQdXNoZWQoc2hhKSB7XG4gICAgY29uc3QgY3VycmVudEJyYW5jaCA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5nZXRDdXJyZW50QnJhbmNoKCk7XG4gICAgY29uc3QgdXBzdHJlYW0gPSBjdXJyZW50QnJhbmNoLmdldFB1c2goKTtcbiAgICBpZiAoIXVwc3RyZWFtLmlzUHJlc2VudCgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbmVkID0gYXdhaXQgdGhpcy5naXQoKS5nZXRCcmFuY2hlc1dpdGhDb21taXQoc2hhLCB7XG4gICAgICBzaG93TG9jYWw6IGZhbHNlLFxuICAgICAgc2hvd1JlbW90ZTogdHJ1ZSxcbiAgICAgIHBhdHRlcm46IHVwc3RyZWFtLmdldFNob3J0UmVmKCksXG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbnRhaW5lZC5zb21lKHJlZiA9PiByZWYubGVuZ3RoID4gMCk7XG4gIH1cblxuICAvLyBBdXRob3IgaW5mb3JtYXRpb25cblxuICBnZXRBdXRob3JzKG9wdGlvbnMpIHtcbiAgICAvLyBGb3Igbm93IHdlJ2xsIGRvIHRoZSBuYWl2ZSB0aGluZyBhbmQgaW52YWxpZGF0ZSBhbnl0aW1lIEhFQUQgbW92ZXMuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGdldCBuZXcgYXV0aG9yc1xuICAgIC8vIGludHJvZHVjZWQgYnkgbmV3bHkgY3JlYXRlZCBjb21taXRzIG9yIHB1bGxlZCBjb21taXRzLlxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3ZSBhcmUgY29uc3RhbnRseSByZS1mZXRjaGluZyBkYXRhLiBJZiBwZXJmb3JtYW5jZSBiZWNvbWVzIGEgY29uY2VybiB3ZSBjYW4gb3B0aW1pemVcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRPclNldChLZXlzLmF1dGhvcnMsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGF1dGhvck1hcCA9IGF3YWl0IHRoaXMuZ2l0KCkuZ2V0QXV0aG9ycyhvcHRpb25zKTtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhdXRob3JNYXApLm1hcChlbWFpbCA9PiBuZXcgQXV0aG9yKGVtYWlsLCBhdXRob3JNYXBbZW1haWxdKSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBCcmFuY2hlc1xuXG4gIGdldEJyYW5jaGVzKCkge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE9yU2V0KEtleXMuYnJhbmNoZXMsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHBheWxvYWRzID0gYXdhaXQgdGhpcy5naXQoKS5nZXRCcmFuY2hlcygpO1xuICAgICAgY29uc3QgYnJhbmNoZXMgPSBuZXcgQnJhbmNoU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IHBheWxvYWQgb2YgcGF5bG9hZHMpIHtcbiAgICAgICAgbGV0IHVwc3RyZWFtID0gbnVsbEJyYW5jaDtcbiAgICAgICAgaWYgKHBheWxvYWQudXBzdHJlYW0pIHtcbiAgICAgICAgICB1cHN0cmVhbSA9IHBheWxvYWQudXBzdHJlYW0ucmVtb3RlTmFtZVxuICAgICAgICAgICAgPyBCcmFuY2guY3JlYXRlUmVtb3RlVHJhY2tpbmcoXG4gICAgICAgICAgICAgIHBheWxvYWQudXBzdHJlYW0udHJhY2tpbmdSZWYsXG4gICAgICAgICAgICAgIHBheWxvYWQudXBzdHJlYW0ucmVtb3RlTmFtZSxcbiAgICAgICAgICAgICAgcGF5bG9hZC51cHN0cmVhbS5yZW1vdGVSZWYsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICA6IG5ldyBCcmFuY2gocGF5bG9hZC51cHN0cmVhbS50cmFja2luZ1JlZik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHVzaCA9IHVwc3RyZWFtO1xuICAgICAgICBpZiAocGF5bG9hZC5wdXNoKSB7XG4gICAgICAgICAgcHVzaCA9IHBheWxvYWQucHVzaC5yZW1vdGVOYW1lXG4gICAgICAgICAgICA/IEJyYW5jaC5jcmVhdGVSZW1vdGVUcmFja2luZyhcbiAgICAgICAgICAgICAgcGF5bG9hZC5wdXNoLnRyYWNraW5nUmVmLFxuICAgICAgICAgICAgICBwYXlsb2FkLnB1c2gucmVtb3RlTmFtZSxcbiAgICAgICAgICAgICAgcGF5bG9hZC5wdXNoLnJlbW90ZVJlZixcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIDogbmV3IEJyYW5jaChwYXlsb2FkLnB1c2gudHJhY2tpbmdSZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJhbmNoZXMuYWRkKG5ldyBCcmFuY2gocGF5bG9hZC5uYW1lLCB1cHN0cmVhbSwgcHVzaCwgcGF5bG9hZC5oZWFkLCB7c2hhOiBwYXlsb2FkLnNoYX0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBicmFuY2hlcztcbiAgICB9KTtcbiAgfVxuXG4gIGdldEhlYWREZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRPclNldChLZXlzLmhlYWREZXNjcmlwdGlvbiwgKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2l0KCkuZGVzY3JpYmVIZWFkKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBNZXJnaW5nIGFuZCByZWJhc2luZyBzdGF0dXNcblxuICBpc01lcmdpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2l0KCkuaXNNZXJnaW5nKHRoaXMucmVwb3NpdG9yeS5nZXRHaXREaXJlY3RvcnlQYXRoKCkpO1xuICB9XG5cbiAgaXNSZWJhc2luZygpIHtcbiAgICByZXR1cm4gdGhpcy5naXQoKS5pc1JlYmFzaW5nKHRoaXMucmVwb3NpdG9yeS5nZXRHaXREaXJlY3RvcnlQYXRoKCkpO1xuICB9XG5cbiAgLy8gUmVtb3Rlc1xuXG4gIGdldFJlbW90ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0T3JTZXQoS2V5cy5yZW1vdGVzLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByZW1vdGVzSW5mbyA9IGF3YWl0IHRoaXMuZ2l0KCkuZ2V0UmVtb3RlcygpO1xuICAgICAgcmV0dXJuIG5ldyBSZW1vdGVTZXQoXG4gICAgICAgIHJlbW90ZXNJbmZvLm1hcCgoe25hbWUsIHVybH0pID0+IG5ldyBSZW1vdGUobmFtZSwgdXJsKSksXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUmVtb3RlKG5hbWUsIHVybCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoXG4gICAgICAoKSA9PiBbXG4gICAgICAgIC4uLktleXMuY29uZmlnLmVhY2hXaXRoU2V0dGluZyhgcmVtb3RlLiR7bmFtZX0udXJsYCksXG4gICAgICAgIC4uLktleXMuY29uZmlnLmVhY2hXaXRoU2V0dGluZyhgcmVtb3RlLiR7bmFtZX0uZmV0Y2hgKSxcbiAgICAgICAgS2V5cy5yZW1vdGVzLFxuICAgICAgXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgICAgICgpID0+IHRoaXMuZXhlY3V0ZVBpcGVsaW5lQWN0aW9uKCdBRERSRU1PVEUnLCBhc3luYyAobmFtZSwgdXJsKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0KCkuYWRkUmVtb3RlKG5hbWUsIHVybCk7XG4gICAgICAgIHJldHVybiBuZXcgUmVtb3RlKG5hbWUsIHVybCk7XG4gICAgICB9LCBuYW1lLCB1cmwpLFxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXRBaGVhZENvdW50KGJyYW5jaE5hbWUpIHtcbiAgICBjb25zdCBidW5kbGUgPSBhd2FpdCB0aGlzLmdldFN0YXR1c0J1bmRsZSgpO1xuICAgIHJldHVybiBidW5kbGUuYnJhbmNoLmFoZWFkQmVoaW5kLmFoZWFkO1xuICB9XG5cbiAgYXN5bmMgZ2V0QmVoaW5kQ291bnQoYnJhbmNoTmFtZSkge1xuICAgIGNvbnN0IGJ1bmRsZSA9IGF3YWl0IHRoaXMuZ2V0U3RhdHVzQnVuZGxlKCk7XG4gICAgcmV0dXJuIGJ1bmRsZS5icmFuY2guYWhlYWRCZWhpbmQuYmVoaW5kO1xuICB9XG5cbiAgZ2V0Q29uZmlnKG9wdGlvbiwge2xvY2FsfSA9IHtsb2NhbDogZmFsc2V9KSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0T3JTZXQoS2V5cy5jb25maWcub25lV2l0aChvcHRpb24sIHtsb2NhbH0pLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5naXQoKS5nZXRDb25maWcob3B0aW9uLCB7bG9jYWx9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpcmVjdEdldENvbmZpZyhrZXksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoa2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIERpcmVjdCBibG9iIGFjY2Vzc1xuXG4gIGdldEJsb2JDb250ZW50cyhzaGEpIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRPclNldChLZXlzLmJsb2Iub25lV2l0aChzaGEpLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5naXQoKS5nZXRCbG9iQ29udGVudHMoc2hhKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpcmVjdEdldEJsb2JDb250ZW50cyhzaGEpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCbG9iQ29udGVudHMoc2hhKTtcbiAgfVxuXG4gIC8vIERpc2NhcmQgaGlzdG9yeVxuXG4gIGhhc0Rpc2NhcmRIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzY2FyZEhpc3RvcnkuaGFzSGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgfVxuXG4gIGdldERpc2NhcmRIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzY2FyZEhpc3RvcnkuZ2V0SGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgfVxuXG4gIGdldExhc3RIaXN0b3J5U25hcHNob3RzKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzY2FyZEhpc3RvcnkuZ2V0TGFzdFNuYXBzaG90cyhwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIENhY2hlXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgZ2V0Q2FjaGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGU7XG4gIH1cblxuICBpbnZhbGlkYXRlKHNwZWMsIGJvZHksIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBib2R5KCkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMuYWNjZXB0SW52YWxpZGF0aW9uKHNwZWMsIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICAgIGVyciA9PiB7XG4gICAgICAgIHRoaXMuYWNjZXB0SW52YWxpZGF0aW9uKHNwZWMsIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuXG5TdGF0ZS5yZWdpc3RlcihQcmVzZW50KTtcblxuZnVuY3Rpb24gcGFydGl0aW9uKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgY29uc3QgbWF0Y2hlcyA9IFtdO1xuICBjb25zdCBub25tYXRjaGVzID0gW107XG4gIGFycmF5LmZvckVhY2goaXRlbSA9PiB7XG4gICAgaWYgKHByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgbWF0Y2hlcy5wdXNoKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBub25tYXRjaGVzLnB1c2goaXRlbSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFttYXRjaGVzLCBub25tYXRjaGVzXTtcbn1cblxuY2xhc3MgQ2FjaGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5ieUdyb3VwID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgfVxuXG4gIGdldE9yU2V0KGtleSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgcHJpbWFyeSA9IGtleS5nZXRQcmltYXJ5KCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnN0b3JhZ2UuZ2V0KHByaW1hcnkpO1xuICAgIGlmIChleGlzdGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBleGlzdGluZy5oaXRzKys7XG4gICAgICByZXR1cm4gZXhpc3RpbmcucHJvbWlzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVkID0gb3BlcmF0aW9uKCk7XG5cbiAgICB0aGlzLnN0b3JhZ2Uuc2V0KHByaW1hcnksIHtcbiAgICAgIGNyZWF0ZWRBdDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBoaXRzOiAwLFxuICAgICAgcHJvbWlzZTogY3JlYXRlZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGdyb3VwcyA9IGtleS5nZXRHcm91cHMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZ3JvdXAgPSBncm91cHNbaV07XG4gICAgICBsZXQgZ3JvdXBTZXQgPSB0aGlzLmJ5R3JvdXAuZ2V0KGdyb3VwKTtcbiAgICAgIGlmIChncm91cFNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGdyb3VwU2V0ID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLmJ5R3JvdXAuc2V0KGdyb3VwLCBncm91cFNldCk7XG4gICAgICB9XG4gICAgICBncm91cFNldC5hZGQoa2V5KTtcbiAgICB9XG5cbiAgICB0aGlzLmRpZFVwZGF0ZSgpO1xuXG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG4gIH1cblxuICBpbnZhbGlkYXRlKGtleXMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleXNbaV0ucmVtb3ZlRnJvbUNhY2hlKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZGlkVXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAga2V5c0luR3JvdXAoZ3JvdXApIHtcbiAgICByZXR1cm4gdGhpcy5ieUdyb3VwLmdldChncm91cCkgfHwgW107XG4gIH1cblxuICByZW1vdmVQcmltYXJ5KHByaW1hcnkpIHtcbiAgICB0aGlzLnN0b3JhZ2UuZGVsZXRlKHByaW1hcnkpO1xuICAgIHRoaXMuZGlkVXBkYXRlKCk7XG4gIH1cblxuICByZW1vdmVGcm9tR3JvdXAoZ3JvdXAsIGtleSkge1xuICAgIGNvbnN0IGdyb3VwU2V0ID0gdGhpcy5ieUdyb3VwLmdldChncm91cCk7XG4gICAgZ3JvdXBTZXQgJiYgZ3JvdXBTZXQuZGVsZXRlKGtleSk7XG4gICAgdGhpcy5kaWRVcGRhdGUoKTtcbiAgfVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zdG9yYWdlLmNsZWFyKCk7XG4gICAgdGhpcy5ieUdyb3VwLmNsZWFyKCk7XG4gICAgdGhpcy5kaWRVcGRhdGUoKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScpO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgb25EaWRVcGRhdGUoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=