"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LargeRepoError = exports.GitError = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _child_process = _interopRequireDefault(require("child_process"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _util = _interopRequireDefault(require("util"));

var _electron = require("electron");

var _eventKit = require("event-kit");

var _dugite = require("dugite");

var _whatTheDiff = require("what-the-diff");

var _whatTheStatus = require("what-the-status");

var _gitPromptServer = _interopRequireDefault(require("./git-prompt-server"));

var _gitTempDir = _interopRequireDefault(require("./git-temp-dir"));

var _asyncQueue = _interopRequireDefault(require("./async-queue"));

var _reporterProxy = require("./reporter-proxy");

var _helpers = require("./helpers");

var _gitTimingsView = _interopRequireDefault(require("./views/git-timings-view"));

var _file = _interopRequireDefault(require("./models/patch/file"));

var _workerManager = _interopRequireDefault(require("./worker-manager"));

var _author = _interopRequireDefault(require("./models/author"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const MAX_STATUS_OUTPUT_LENGTH = 1024 * 1024 * 10;
let headless = null;
let execPathPromise = null;

class GitError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.stack = new Error().stack;
  }

}

exports.GitError = GitError;

class LargeRepoError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.stack = new Error().stack;
  }

} // ignored for the purposes of usage metrics tracking because they're noisy


exports.LargeRepoError = LargeRepoError;
const IGNORED_GIT_COMMANDS = ['cat-file', 'config', 'diff', 'for-each-ref', 'log', 'rev-parse', 'status'];
const DISABLE_COLOR_FLAGS = ['branch', 'diff', 'showBranch', 'status', 'ui'].reduce((acc, type) => {
  acc.unshift('-c', `color.${type}=false`);
  return acc;
}, []);
/**
 * Expand config path name per
 * https://git-scm.com/docs/git-config#git-config-pathname
 * this regex attempts to get the specified user's home directory
 * Ex: on Mac ~kuychaco/ is expanded to the specified user’s home directory (/Users/kuychaco)
 * Regex translation:
 * ^~ line starts with tilde
 * ([^\\\\/]*)[\\\\/] captures non-slash characters before first slash
 */

const EXPAND_TILDE_REGEX = new RegExp('^~([^\\\\/]*)[\\\\/]');

class GitShellOutStrategy {
  constructor(workingDir, options = {}) {
    this.workingDir = workingDir;

    if (options.queue) {
      this.commandQueue = options.queue;
    } else {
      const parallelism = options.parallelism || Math.max(3, _os.default.cpus().length);
      this.commandQueue = new _asyncQueue.default({
        parallelism
      });
    }

    this.prompt = options.prompt || (query => Promise.reject());

    this.workerManager = options.workerManager;

    if (headless === null) {
      headless = !_electron.remote.getCurrentWindow().isVisible();
    }
  }
  /*
   * Provide an asynchronous callback to be used to request input from the user for git operations.
   *
   * `prompt` must be a callable that accepts a query object `{prompt, includeUsername}` and returns a Promise
   * that either resolves with a result object `{[username], password}` or rejects on cancellation.
   */


  setPromptCallback(prompt) {
    this.prompt = prompt;
  } // Execute a command and read the output using the embedded Git environment


  async exec(args, options = GitShellOutStrategy.defaultExecArgs) {
    /* eslint-disable no-console,no-control-regex */
    const {
      stdin,
      useGitPromptServer,
      useGpgWrapper,
      useGpgAtomPrompt,
      writeOperation
    } = options;
    const commandName = args[0];
    const subscriptions = new _eventKit.CompositeDisposable();
    const diagnosticsEnabled = process.env.ATOM_GITHUB_GIT_DIAGNOSTICS || atom.config.get('github.gitDiagnostics');
    const formattedArgs = `git ${args.join(' ')} in ${this.workingDir}`;

    const timingMarker = _gitTimingsView.default.generateMarker(`git ${args.join(' ')}`);

    timingMarker.mark('queued');
    args.unshift(...DISABLE_COLOR_FLAGS);

    if (execPathPromise === null) {
      // Attempt to collect the --exec-path from a native git installation.
      execPathPromise = new Promise(resolve => {
        _child_process.default.exec('git --exec-path', (error, stdout) => {
          /* istanbul ignore if */
          if (error) {
            // Oh well
            resolve(null);
            return;
          }

          resolve(stdout.trim());
        });
      });
    }

    const execPath = await execPathPromise;
    return this.commandQueue.push(async () => {
      timingMarker.mark('prepare');
      let gitPromptServer;
      const pathParts = [];

      if (process.env.PATH) {
        pathParts.push(process.env.PATH);
      }

      if (execPath) {
        pathParts.push(execPath);
      }

      const env = _objectSpread2({}, process.env, {
        GIT_TERMINAL_PROMPT: '0',
        GIT_OPTIONAL_LOCKS: '0',
        PATH: pathParts.join(_path.default.delimiter)
      });

      const gitTempDir = new _gitTempDir.default();

      if (useGpgWrapper) {
        await gitTempDir.ensure();
        args.unshift('-c', `gpg.program=${gitTempDir.getGpgWrapperSh()}`);
      }

      if (useGitPromptServer) {
        gitPromptServer = new _gitPromptServer.default(gitTempDir);
        await gitPromptServer.start(this.prompt);
        env.ATOM_GITHUB_TMP = gitTempDir.getRootPath();
        env.ATOM_GITHUB_ASKPASS_PATH = (0, _helpers.normalizeGitHelperPath)(gitTempDir.getAskPassJs());
        env.ATOM_GITHUB_CREDENTIAL_PATH = (0, _helpers.normalizeGitHelperPath)(gitTempDir.getCredentialHelperJs());
        env.ATOM_GITHUB_ELECTRON_PATH = (0, _helpers.normalizeGitHelperPath)((0, _helpers.getAtomHelperPath)());
        env.ATOM_GITHUB_SOCK_ADDR = gitPromptServer.getAddress();
        env.ATOM_GITHUB_WORKDIR_PATH = this.workingDir;
        env.ATOM_GITHUB_DUGITE_PATH = (0, _helpers.getDugitePath)();
        env.ATOM_GITHUB_KEYTAR_STRATEGY_PATH = (0, _helpers.getSharedModulePath)('keytar-strategy'); // "ssh" won't respect SSH_ASKPASS unless:
        // (a) it's running without a tty
        // (b) DISPLAY is set to something nonempty
        // But, on a Mac, DISPLAY is unset. Ensure that it is so our SSH_ASKPASS is respected.

        if (!process.env.DISPLAY || process.env.DISPLAY.length === 0) {
          env.DISPLAY = 'atom-github-placeholder';
        }

        env.ATOM_GITHUB_ORIGINAL_PATH = process.env.PATH || '';
        env.ATOM_GITHUB_ORIGINAL_GIT_ASKPASS = process.env.GIT_ASKPASS || '';
        env.ATOM_GITHUB_ORIGINAL_SSH_ASKPASS = process.env.SSH_ASKPASS || '';
        env.ATOM_GITHUB_ORIGINAL_GIT_SSH_COMMAND = process.env.GIT_SSH_COMMAND || '';
        env.ATOM_GITHUB_SPEC_MODE = atom.inSpecMode() ? 'true' : 'false';
        env.SSH_ASKPASS = (0, _helpers.normalizeGitHelperPath)(gitTempDir.getAskPassSh());
        env.GIT_ASKPASS = (0, _helpers.normalizeGitHelperPath)(gitTempDir.getAskPassSh());

        if (process.platform === 'linux') {
          env.GIT_SSH_COMMAND = gitTempDir.getSshWrapperSh();
        } else if (process.env.GIT_SSH_COMMAND) {
          env.GIT_SSH_COMMAND = process.env.GIT_SSH_COMMAND;
        } else {
          env.GIT_SSH = process.env.GIT_SSH;
        }

        const credentialHelperSh = (0, _helpers.normalizeGitHelperPath)(gitTempDir.getCredentialHelperSh());
        args.unshift('-c', `credential.helper=${credentialHelperSh}`);
      }

      if (useGpgWrapper && useGitPromptServer && useGpgAtomPrompt) {
        env.ATOM_GITHUB_GPG_PROMPT = 'true';
      }
      /* istanbul ignore if */


      if (diagnosticsEnabled) {
        env.GIT_TRACE = 'true';
        env.GIT_TRACE_CURL = 'true';
      }

      let opts = {
        env
      };

      if (stdin) {
        opts.stdin = stdin;
        opts.stdinEncoding = 'utf8';
      }
      /* istanbul ignore if */


      if (process.env.PRINT_GIT_TIMES) {
        console.time(`git:${formattedArgs}`);
      }

      return new Promise(async (resolve, reject) => {
        if (options.beforeRun) {
          const newArgsOpts = await options.beforeRun({
            args,
            opts
          });
          args = newArgsOpts.args;
          opts = newArgsOpts.opts;
        }

        const {
          promise,
          cancel
        } = this.executeGitCommand(args, opts, timingMarker);
        let expectCancel = false;

        if (gitPromptServer) {
          subscriptions.add(gitPromptServer.onDidCancel(async ({
            handlerPid
          }) => {
            expectCancel = true;
            await cancel(); // On Windows, the SSH_ASKPASS handler is executed as a non-child process, so the bin\git-askpass-atom.sh
            // process does not terminate when the git process is killed.
            // Kill the handler process *after* the git process has been killed to ensure that git doesn't have a
            // chance to fall back to GIT_ASKPASS from the credential handler.

            await new Promise((resolveKill, rejectKill) => {
              require('tree-kill')(handlerPid, 'SIGTERM', err => {
                /* istanbul ignore if */
                if (err) {
                  rejectKill(err);
                } else {
                  resolveKill();
                }
              });
            });
          }));
        }

        const {
          stdout,
          stderr,
          exitCode,
          signal,
          timing
        } = await promise.catch(err => {
          if (err.signal) {
            return {
              signal: err.signal
            };
          }

          reject(err);
          return {};
        });

        if (timing) {
          const {
            execTime,
            spawnTime,
            ipcTime
          } = timing;
          const now = performance.now();
          timingMarker.mark('nexttick', now - execTime - spawnTime - ipcTime);
          timingMarker.mark('execute', now - execTime - ipcTime);
          timingMarker.mark('ipc', now - ipcTime);
        }

        timingMarker.finalize();
        /* istanbul ignore if */

        if (process.env.PRINT_GIT_TIMES) {
          console.timeEnd(`git:${formattedArgs}`);
        }

        if (gitPromptServer) {
          gitPromptServer.terminate();
        }

        subscriptions.dispose();
        /* istanbul ignore if */

        if (diagnosticsEnabled) {
          const exposeControlCharacters = raw => {
            if (!raw) {
              return '';
            }

            return raw.replace(/\u0000/ug, '<NUL>\n').replace(/\u001F/ug, '<SEP>');
          };

          if (headless) {
            let summary = `git:${formattedArgs}\n`;

            if (exitCode !== undefined) {
              summary += `exit status: ${exitCode}\n`;
            } else if (signal) {
              summary += `exit signal: ${signal}\n`;
            }

            if (stdin && stdin.length !== 0) {
              summary += `stdin:\n${exposeControlCharacters(stdin)}\n`;
            }

            summary += 'stdout:';

            if (stdout.length === 0) {
              summary += ' <empty>\n';
            } else {
              summary += `\n${exposeControlCharacters(stdout)}\n`;
            }

            summary += 'stderr:';

            if (stderr.length === 0) {
              summary += ' <empty>\n';
            } else {
              summary += `\n${exposeControlCharacters(stderr)}\n`;
            }

            console.log(summary);
          } else {
            const headerStyle = 'font-weight: bold; color: blue;';
            console.groupCollapsed(`git:${formattedArgs}`);

            if (exitCode !== undefined) {
              console.log('%cexit status%c %d', headerStyle, 'font-weight: normal; color: black;', exitCode);
            } else if (signal) {
              console.log('%cexit signal%c %s', headerStyle, 'font-weight: normal; color: black;', signal);
            }

            console.log('%cfull arguments%c %s', headerStyle, 'font-weight: normal; color: black;', _util.default.inspect(args, {
              breakLength: Infinity
            }));

            if (stdin && stdin.length !== 0) {
              console.log('%cstdin', headerStyle);
              console.log(exposeControlCharacters(stdin));
            }

            console.log('%cstdout', headerStyle);
            console.log(exposeControlCharacters(stdout));
            console.log('%cstderr', headerStyle);
            console.log(exposeControlCharacters(stderr));
            console.groupEnd();
          }
        }

        if (exitCode !== 0 && !expectCancel) {
          const err = new GitError(`${formattedArgs} exited with code ${exitCode}\nstdout: ${stdout}\nstderr: ${stderr}`);
          err.code = exitCode;
          err.stdErr = stderr;
          err.stdOut = stdout;
          err.command = formattedArgs;
          reject(err);
        }

        if (!IGNORED_GIT_COMMANDS.includes(commandName)) {
          (0, _reporterProxy.incrementCounter)(commandName);
        }

        resolve(stdout);
      });
    }, {
      parallel: !writeOperation
    });
    /* eslint-enable no-console,no-control-regex */
  }

  async gpgExec(args, options) {
    try {
      return await this.exec(args.slice(), _objectSpread2({
        useGpgWrapper: true,
        useGpgAtomPrompt: false
      }, options));
    } catch (e) {
      if (/gpg failed/.test(e.stdErr)) {
        return await this.exec(args, _objectSpread2({
          useGitPromptServer: true,
          useGpgWrapper: true,
          useGpgAtomPrompt: true
        }, options));
      } else {
        throw e;
      }
    }
  }

  executeGitCommand(args, options, marker = null) {
    if (process.env.ATOM_GITHUB_INLINE_GIT_EXEC || !_workerManager.default.getInstance().isReady()) {
      marker && marker.mark('nexttick');
      let childPid;

      options.processCallback = child => {
        childPid = child.pid;
        /* istanbul ignore next */

        child.stdin.on('error', err => {
          throw new Error(`Error writing to stdin: git ${args.join(' ')} in ${this.workingDir}\n${options.stdin}\n${err}`);
        });
      };

      const promise = _dugite.GitProcess.exec(args, this.workingDir, options);

      marker && marker.mark('execute');
      return {
        promise,
        cancel: () => {
          /* istanbul ignore if */
          if (!childPid) {
            return Promise.resolve();
          }

          return new Promise((resolve, reject) => {
            require('tree-kill')(childPid, 'SIGTERM', err => {
              /* istanbul ignore if */
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
      };
    } else {
      const workerManager = this.workerManager || _workerManager.default.getInstance();

      return workerManager.request({
        args,
        workingDir: this.workingDir,
        options
      });
    }
  }

  async resolveDotGitDir() {
    try {
      await _fsExtra.default.stat(this.workingDir); // fails if folder doesn't exist

      const output = await this.exec(['rev-parse', '--resolve-git-dir', _path.default.join(this.workingDir, '.git')]);
      const dotGitDir = output.trim();
      return (0, _helpers.toNativePathSep)(dotGitDir);
    } catch (e) {
      return null;
    }
  }

  init() {
    return this.exec(['init', this.workingDir]);
  }
  /**
   * Staging/Unstaging files and patches and committing
   */


  stageFiles(paths) {
    if (paths.length === 0) {
      return Promise.resolve(null);
    }

    const args = ['add'].concat(paths.map(_helpers.toGitPathSep));
    return this.exec(args, {
      writeOperation: true
    });
  }

  async fetchCommitMessageTemplate() {
    let templatePath = await this.getConfig('commit.template');

    if (!templatePath) {
      return null;
    }

    const homeDir = _os.default.homedir();

    templatePath = templatePath.trim().replace(EXPAND_TILDE_REGEX, (_, user) => {
      // if no user is specified, fall back to using the home directory.
      return `${user ? _path.default.join(_path.default.dirname(homeDir), user) : homeDir}/`;
    });
    templatePath = (0, _helpers.toNativePathSep)(templatePath);

    if (!_path.default.isAbsolute(templatePath)) {
      templatePath = _path.default.join(this.workingDir, templatePath);
    }

    if (!(await (0, _helpers.fileExists)(templatePath))) {
      throw new Error(`Invalid commit template path set in Git config: ${templatePath}`);
    }

    return await _fsExtra.default.readFile(templatePath, {
      encoding: 'utf8'
    });
  }

  unstageFiles(paths, commit = 'HEAD') {
    if (paths.length === 0) {
      return Promise.resolve(null);
    }

    const args = ['reset', commit, '--'].concat(paths.map(_helpers.toGitPathSep));
    return this.exec(args, {
      writeOperation: true
    });
  }

  stageFileModeChange(filename, newMode) {
    const indexReadPromise = this.exec(['ls-files', '-s', '--', filename]);
    return this.exec(['update-index', '--cacheinfo', `${newMode},<OID_TBD>,${filename}`], {
      writeOperation: true,
      beforeRun: async function determineArgs({
        args,
        opts
      }) {
        const index = await indexReadPromise;
        const oid = index.substr(7, 40);
        return {
          opts,
          args: ['update-index', '--cacheinfo', `${newMode},${oid},${filename}`]
        };
      }
    });
  }

  stageFileSymlinkChange(filename) {
    return this.exec(['rm', '--cached', filename], {
      writeOperation: true
    });
  }

  applyPatch(patch, {
    index
  } = {}) {
    const args = ['apply', '-'];

    if (index) {
      args.splice(1, 0, '--cached');
    }

    return this.exec(args, {
      stdin: patch,
      writeOperation: true
    });
  }

  async commit(rawMessage, {
    allowEmpty,
    amend,
    coAuthors,
    verbatim
  } = {}) {
    const args = ['commit'];
    let msg; // if amending and no new message is passed, use last commit's message. Ensure that we don't
    // mangle it in the process.

    if (amend && rawMessage.length === 0) {
      const {
        unbornRef,
        messageBody,
        messageSubject
      } = await this.getHeadCommit();

      if (unbornRef) {
        msg = rawMessage;
      } else {
        msg = `${messageSubject}\n\n${messageBody}`.trim();
        verbatim = true;
      }
    } else {
      msg = rawMessage;
    } // if commit template is used, strip commented lines from commit
    // to be consistent with command line git.


    const template = await this.fetchCommitMessageTemplate();

    if (template) {
      // respecting the comment character from user settings or fall back to # as default.
      // https://git-scm.com/docs/git-config#git-config-corecommentChar
      let commentChar = await this.getConfig('core.commentChar');

      if (!commentChar) {
        commentChar = '#';
      }

      msg = msg.split('\n').filter(line => !line.startsWith(commentChar)).join('\n');
    } // Determine the cleanup mode.


    if (verbatim) {
      args.push('--cleanup=verbatim');
    } else {
      const configured = await this.getConfig('commit.cleanup');
      const mode = configured && configured !== 'default' ? configured : 'strip';
      args.push(`--cleanup=${mode}`);
    } // add co-author commit trailers if necessary


    if (coAuthors && coAuthors.length > 0) {
      msg = await this.addCoAuthorsToMessage(msg, coAuthors);
    }

    args.push('-m', msg.trim());

    if (amend) {
      args.push('--amend');
    }

    if (allowEmpty) {
      args.push('--allow-empty');
    }

    return this.gpgExec(args, {
      writeOperation: true
    });
  }

  addCoAuthorsToMessage(message, coAuthors = []) {
    const trailers = coAuthors.map(author => {
      return {
        token: 'Co-Authored-By',
        value: `${author.name} <${author.email}>`
      };
    }); // Ensure that message ends with newline for git-interpret trailers to work

    const msg = `${message.trim()}\n`;
    return trailers.length ? this.mergeTrailers(msg, trailers) : msg;
  }
  /**
   * File Status and Diffs
   */


  async getStatusBundle() {
    const args = ['status', '--porcelain=v2', '--branch', '--untracked-files=all', '--ignore-submodules=dirty', '-z'];
    const output = await this.exec(args);

    if (output.length > MAX_STATUS_OUTPUT_LENGTH) {
      throw new LargeRepoError();
    }

    const results = await (0, _whatTheStatus.parse)(output);

    for (const entryType in results) {
      if (Array.isArray(results[entryType])) {
        this.updateNativePathSepForEntries(results[entryType]);
      }
    }

    return results;
  }

  updateNativePathSepForEntries(entries) {
    entries.forEach(entry => {
      // Normally we would avoid mutating responses from other package's APIs, but we control
      // the `what-the-status` module and know there are no side effects.
      // This is a hot code path and by mutating we avoid creating new objects that will just be GC'ed
      if (entry.filePath) {
        entry.filePath = (0, _helpers.toNativePathSep)(entry.filePath);
      }

      if (entry.origFilePath) {
        entry.origFilePath = (0, _helpers.toNativePathSep)(entry.origFilePath);
      }
    });
  }

  async diffFileStatus(options = {}) {
    const args = ['diff', '--name-status', '--no-renames'];

    if (options.staged) {
      args.push('--staged');
    }

    if (options.target) {
      args.push(options.target);
    }

    const output = await this.exec(args);
    const statusMap = {
      A: 'added',
      M: 'modified',
      D: 'deleted',
      U: 'unmerged'
    };
    const fileStatuses = {};
    output && output.trim().split(_helpers.LINE_ENDING_REGEX).forEach(line => {
      const [status, rawFilePath] = line.split('\t');
      const filePath = (0, _helpers.toNativePathSep)(rawFilePath);
      fileStatuses[filePath] = statusMap[status];
    });

    if (!options.staged) {
      const untracked = await this.getUntrackedFiles();
      untracked.forEach(filePath => {
        fileStatuses[filePath] = 'added';
      });
    }

    return fileStatuses;
  }

  async getUntrackedFiles() {
    const output = await this.exec(['ls-files', '--others', '--exclude-standard']);

    if (output.trim() === '') {
      return [];
    }

    return output.trim().split(_helpers.LINE_ENDING_REGEX).map(_helpers.toNativePathSep);
  }

  async getDiffsForFilePath(filePath, {
    staged,
    baseCommit
  } = {}) {
    let args = ['diff', '--no-prefix', '--no-ext-diff', '--no-renames', '--diff-filter=u'];

    if (staged) {
      args.push('--staged');
    }

    if (baseCommit) {
      args.push(baseCommit);
    }

    args = args.concat(['--', (0, _helpers.toGitPathSep)(filePath)]);
    const output = await this.exec(args);
    let rawDiffs = [];

    if (output) {
      rawDiffs = (0, _whatTheDiff.parse)(output).filter(rawDiff => rawDiff.status !== 'unmerged');

      for (let i = 0; i < rawDiffs.length; i++) {
        const rawDiff = rawDiffs[i];

        if (rawDiff.oldPath) {
          rawDiff.oldPath = (0, _helpers.toNativePathSep)(rawDiff.oldPath);
        }

        if (rawDiff.newPath) {
          rawDiff.newPath = (0, _helpers.toNativePathSep)(rawDiff.newPath);
        }
      }
    }

    if (!staged && (await this.getUntrackedFiles()).includes(filePath)) {
      // add untracked file
      const absPath = _path.default.join(this.workingDir, filePath);

      const executable = await (0, _helpers.isFileExecutable)(absPath);
      const symlink = await (0, _helpers.isFileSymlink)(absPath);
      const contents = await _fsExtra.default.readFile(absPath, {
        encoding: 'utf8'
      });
      const binary = (0, _helpers.isBinary)(contents);
      let mode;
      let realpath;

      if (executable) {
        mode = _file.default.modes.EXECUTABLE;
      } else if (symlink) {
        mode = _file.default.modes.SYMLINK;
        realpath = await _fsExtra.default.realpath(absPath);
      } else {
        mode = _file.default.modes.NORMAL;
      }

      rawDiffs.push(buildAddedFilePatch(filePath, binary ? null : contents, mode, realpath));
    }

    if (rawDiffs.length > 2) {
      throw new Error(`Expected between 0 and 2 diffs for ${filePath} but got ${rawDiffs.length}`);
    }

    return rawDiffs;
  }

  async getStagedChangesPatch() {
    const output = await this.exec(['diff', '--staged', '--no-prefix', '--no-ext-diff', '--no-renames', '--diff-filter=u']);

    if (!output) {
      return [];
    }

    const diffs = (0, _whatTheDiff.parse)(output);

    for (const diff of diffs) {
      if (diff.oldPath) {
        diff.oldPath = (0, _helpers.toNativePathSep)(diff.oldPath);
      }

      if (diff.newPath) {
        diff.newPath = (0, _helpers.toNativePathSep)(diff.newPath);
      }
    }

    return diffs;
  }
  /**
   * Miscellaneous getters
   */


  async getCommit(ref) {
    const [commit] = await this.getCommits({
      max: 1,
      ref,
      includeUnborn: true
    });
    return commit;
  }

  async getHeadCommit() {
    const [headCommit] = await this.getCommits({
      max: 1,
      ref: 'HEAD',
      includeUnborn: true
    });
    return headCommit;
  }

  async getCommits(options = {}) {
    const {
      max,
      ref,
      includeUnborn,
      includePatch
    } = _objectSpread2({
      max: 1,
      ref: 'HEAD',
      includeUnborn: false,
      includePatch: false
    }, options); // https://git-scm.com/docs/git-log#_pretty_formats
    // %x00 - null byte
    // %H - commit SHA
    // %ae - author email
    // %an = author full name
    // %at - timestamp, UNIX timestamp
    // %s - subject
    // %b - body


    const args = ['log', '--pretty=format:%H%x00%ae%x00%an%x00%at%x00%s%x00%b%x00', '--no-abbrev-commit', '--no-prefix', '--no-ext-diff', '--no-renames', '-z', '-n', max, ref];

    if (includePatch) {
      args.push('--patch', '-m', '--first-parent');
    }

    const output = await this.exec(args.concat('--')).catch(err => {
      if (/unknown revision/.test(err.stdErr) || /bad revision 'HEAD'/.test(err.stdErr)) {
        return '';
      } else {
        throw err;
      }
    });

    if (output === '') {
      return includeUnborn ? [{
        sha: '',
        message: '',
        unbornRef: true
      }] : [];
    }

    const fields = output.trim().split('\0');
    const commits = [];

    for (let i = 0; i < fields.length; i += 7) {
      const body = fields[i + 5].trim();
      let patch = [];

      if (includePatch) {
        const diffs = fields[i + 6];
        patch = (0, _whatTheDiff.parse)(diffs.trim());
      }

      const {
        message: messageBody,
        coAuthors
      } = (0, _helpers.extractCoAuthorsAndRawCommitMessage)(body);
      commits.push({
        sha: fields[i] && fields[i].trim(),
        author: new _author.default(fields[i + 1] && fields[i + 1].trim(), fields[i + 2] && fields[i + 2].trim()),
        authorDate: parseInt(fields[i + 3], 10),
        messageSubject: fields[i + 4],
        messageBody,
        coAuthors,
        unbornRef: false,
        patch
      });
    }

    return commits;
  }

  async getAuthors(options = {}) {
    const {
      max,
      ref
    } = _objectSpread2({
      max: 1,
      ref: 'HEAD'
    }, options); // https://git-scm.com/docs/git-log#_pretty_formats
    // %x1F - field separator byte
    // %an - author name
    // %ae - author email
    // %cn - committer name
    // %ce - committer email
    // %(trailers:unfold,only) - the commit message trailers, separated
    //                           by newlines and unfolded (i.e. properly
    //                           formatted and one trailer per line).


    const delimiter = '1F';
    const delimiterString = String.fromCharCode(parseInt(delimiter, 16));
    const fields = ['%an', '%ae', '%cn', '%ce', '%(trailers:unfold,only)'];
    const format = fields.join(`%x${delimiter}`);

    try {
      const output = await this.exec(['log', `--format=${format}`, '-z', '-n', max, ref, '--']);
      return output.split('\0').reduce((acc, line) => {
        if (line.length === 0) {
          return acc;
        }

        const [an, ae, cn, ce, trailers] = line.split(delimiterString);
        trailers.split('\n').map(trailer => trailer.match(_helpers.CO_AUTHOR_REGEX)).filter(match => match !== null).forEach(([_, name, email]) => {
          acc[email] = name;
        });
        acc[ae] = an;
        acc[ce] = cn;
        return acc;
      }, {});
    } catch (err) {
      if (/unknown revision/.test(err.stdErr) || /bad revision 'HEAD'/.test(err.stdErr)) {
        return [];
      } else {
        throw err;
      }
    }
  }

  mergeTrailers(commitMessage, trailers) {
    const args = ['interpret-trailers'];

    for (const trailer of trailers) {
      args.push('--trailer', `${trailer.token}=${trailer.value}`);
    }

    return this.exec(args, {
      stdin: commitMessage
    });
  }

  readFileFromIndex(filePath) {
    return this.exec(['show', `:${(0, _helpers.toGitPathSep)(filePath)}`]);
  }
  /**
   * Merge
   */


  merge(branchName) {
    return this.gpgExec(['merge', branchName], {
      writeOperation: true
    });
  }

  isMerging(dotGitDir) {
    return (0, _helpers.fileExists)(_path.default.join(dotGitDir, 'MERGE_HEAD')).catch(() => false);
  }

  abortMerge() {
    return this.exec(['merge', '--abort'], {
      writeOperation: true
    });
  }

  checkoutSide(side, paths) {
    if (paths.length === 0) {
      return Promise.resolve();
    }

    return this.exec(['checkout', `--${side}`, ...paths.map(_helpers.toGitPathSep)]);
  }
  /**
   * Rebase
   */


  async isRebasing(dotGitDir) {
    const results = await Promise.all([(0, _helpers.fileExists)(_path.default.join(dotGitDir, 'rebase-merge')), (0, _helpers.fileExists)(_path.default.join(dotGitDir, 'rebase-apply'))]);
    return results.some(r => r);
  }
  /**
   * Remote interactions
   */


  clone(remoteUrl, options = {}) {
    const args = ['clone'];

    if (options.noLocal) {
      args.push('--no-local');
    }

    if (options.bare) {
      args.push('--bare');
    }

    if (options.recursive) {
      args.push('--recursive');
    }

    if (options.sourceRemoteName) {
      args.push('--origin', options.remoteName);
    }

    args.push(remoteUrl, this.workingDir);
    return this.exec(args, {
      useGitPromptServer: true,
      writeOperation: true
    });
  }

  fetch(remoteName, branchName) {
    return this.exec(['fetch', remoteName, branchName], {
      useGitPromptServer: true,
      writeOperation: true
    });
  }

  pull(remoteName, branchName, options = {}) {
    const args = ['pull', remoteName, options.refSpec || branchName];

    if (options.ffOnly) {
      args.push('--ff-only');
    }

    return this.gpgExec(args, {
      useGitPromptServer: true,
      writeOperation: true
    });
  }

  push(remoteName, branchName, options = {}) {
    const args = ['push', remoteName || 'origin', options.refSpec || `refs/heads/${branchName}`];

    if (options.setUpstream) {
      args.push('--set-upstream');
    }

    if (options.force) {
      args.push('--force');
    }

    return this.exec(args, {
      useGitPromptServer: true,
      writeOperation: true
    });
  }
  /**
   * Undo Operations
   */


  reset(type, revision = 'HEAD') {
    const validTypes = ['soft'];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    return this.exec(['reset', `--${type}`, revision]);
  }

  deleteRef(ref) {
    return this.exec(['update-ref', '-d', ref]);
  }
  /**
   * Branches
   */


  checkout(branchName, options = {}) {
    const args = ['checkout'];

    if (options.createNew) {
      args.push('-b');
    }

    args.push(branchName);

    if (options.startPoint) {
      if (options.track) {
        args.push('--track');
      }

      args.push(options.startPoint);
    }

    return this.exec(args, {
      writeOperation: true
    });
  }

  async getBranches() {
    const format = ['%(objectname)', '%(HEAD)', '%(refname:short)', '%(upstream)', '%(upstream:remotename)', '%(upstream:remoteref)', '%(push)', '%(push:remotename)', '%(push:remoteref)'].join('%00');
    const output = await this.exec(['for-each-ref', `--format=${format}`, 'refs/heads/**']);
    return output.trim().split(_helpers.LINE_ENDING_REGEX).map(line => {
      const [sha, head, name, upstreamTrackingRef, upstreamRemoteName, upstreamRemoteRef, pushTrackingRef, pushRemoteName, pushRemoteRef] = line.split('\0');
      const branch = {
        name,
        sha,
        head: head === '*'
      };

      if (upstreamTrackingRef || upstreamRemoteName || upstreamRemoteRef) {
        branch.upstream = {
          trackingRef: upstreamTrackingRef,
          remoteName: upstreamRemoteName,
          remoteRef: upstreamRemoteRef
        };
      }

      if (branch.upstream || pushTrackingRef || pushRemoteName || pushRemoteRef) {
        branch.push = {
          trackingRef: pushTrackingRef,
          remoteName: pushRemoteName || branch.upstream && branch.upstream.remoteName,
          remoteRef: pushRemoteRef || branch.upstream && branch.upstream.remoteRef
        };
      }

      return branch;
    });
  }

  async getBranchesWithCommit(sha, option = {}) {
    const args = ['branch', '--format=%(refname)', '--contains', sha];

    if (option.showLocal && option.showRemote) {
      args.splice(1, 0, '--all');
    } else if (option.showRemote) {
      args.splice(1, 0, '--remotes');
    }

    if (option.pattern) {
      args.push(option.pattern);
    }

    return (await this.exec(args)).trim().split(_helpers.LINE_ENDING_REGEX);
  }

  checkoutFiles(paths, revision) {
    if (paths.length === 0) {
      return null;
    }

    const args = ['checkout'];

    if (revision) {
      args.push(revision);
    }

    return this.exec(args.concat('--', paths.map(_helpers.toGitPathSep)), {
      writeOperation: true
    });
  }

  async describeHead() {
    return (await this.exec(['describe', '--contains', '--all', '--always', 'HEAD'])).trim();
  }

  async getConfig(option, {
    local
  } = {}) {
    let output;

    try {
      let args = ['config'];

      if (local) {
        args.push('--local');
      }

      args = args.concat(option);
      output = await this.exec(args);
    } catch (err) {
      if (err.code === 1 || err.code === 128) {
        // No matching config found OR --local can only be used inside a git repository
        return null;
      } else {
        throw err;
      }
    }

    return output.trim();
  }

  setConfig(option, value, {
    replaceAll,
    global
  } = {}) {
    let args = ['config'];

    if (replaceAll) {
      args.push('--replace-all');
    }

    if (global) {
      args.push('--global');
    }

    args = args.concat(option, value);
    return this.exec(args, {
      writeOperation: true
    });
  }

  unsetConfig(option) {
    return this.exec(['config', '--unset', option], {
      writeOperation: true
    });
  }

  async getRemotes() {
    let output = await this.getConfig(['--get-regexp', '^remote\\..*\\.url$'], {
      local: true
    });

    if (output) {
      output = output.trim();

      if (!output.length) {
        return [];
      }

      return output.split('\n').map(line => {
        const match = line.match(/^remote\.(.*)\.url (.*)$/);
        return {
          name: match[1],
          url: match[2]
        };
      });
    } else {
      return [];
    }
  }

  addRemote(name, url) {
    return this.exec(['remote', 'add', name, url]);
  }

  async createBlob({
    filePath,
    stdin
  } = {}) {
    let output;

    if (filePath) {
      try {
        output = (await this.exec(['hash-object', '-w', filePath], {
          writeOperation: true
        })).trim();
      } catch (e) {
        if (e.stdErr && e.stdErr.match(/fatal: Cannot open .*: No such file or directory/)) {
          output = null;
        } else {
          throw e;
        }
      }
    } else if (stdin) {
      output = (await this.exec(['hash-object', '-w', '--stdin'], {
        stdin,
        writeOperation: true
      })).trim();
    } else {
      throw new Error('Must supply file path or stdin');
    }

    return output;
  }

  async expandBlobToFile(absFilePath, sha) {
    const output = await this.exec(['cat-file', '-p', sha]);
    await _fsExtra.default.writeFile(absFilePath, output, {
      encoding: 'utf8'
    });
    return absFilePath;
  }

  async getBlobContents(sha) {
    return await this.exec(['cat-file', '-p', sha]);
  }

  async mergeFile(oursPath, commonBasePath, theirsPath, resultPath) {
    const args = ['merge-file', '-p', oursPath, commonBasePath, theirsPath, '-L', 'current', '-L', 'after discard', '-L', 'before discard'];
    let output;
    let conflict = false;

    try {
      output = await this.exec(args);
    } catch (e) {
      if (e instanceof GitError && e.code === 1) {
        output = e.stdOut;
        conflict = true;
      } else {
        throw e;
      }
    } // Interpret a relative resultPath as relative to the repository working directory for consistency with the
    // other arguments.


    const resolvedResultPath = _path.default.resolve(this.workingDir, resultPath);

    await _fsExtra.default.writeFile(resolvedResultPath, output, {
      encoding: 'utf8'
    });
    return {
      filePath: oursPath,
      resultPath,
      conflict
    };
  }

  async writeMergeConflictToIndex(filePath, commonBaseSha, oursSha, theirsSha) {
    const gitFilePath = (0, _helpers.toGitPathSep)(filePath);
    const fileMode = await this.getFileMode(filePath);
    let indexInfo = `0 0000000000000000000000000000000000000000\t${gitFilePath}\n`;

    if (commonBaseSha) {
      indexInfo += `${fileMode} ${commonBaseSha} 1\t${gitFilePath}\n`;
    }

    if (oursSha) {
      indexInfo += `${fileMode} ${oursSha} 2\t${gitFilePath}\n`;
    }

    if (theirsSha) {
      indexInfo += `${fileMode} ${theirsSha} 3\t${gitFilePath}\n`;
    }

    return this.exec(['update-index', '--index-info'], {
      stdin: indexInfo,
      writeOperation: true
    });
  }

  async getFileMode(filePath) {
    const output = await this.exec(['ls-files', '--stage', '--', (0, _helpers.toGitPathSep)(filePath)]);

    if (output) {
      return output.slice(0, 6);
    } else {
      const executable = await (0, _helpers.isFileExecutable)(_path.default.join(this.workingDir, filePath));
      const symlink = await (0, _helpers.isFileSymlink)(_path.default.join(this.workingDir, filePath));

      if (symlink) {
        return _file.default.modes.SYMLINK;
      } else if (executable) {
        return _file.default.modes.EXECUTABLE;
      } else {
        return _file.default.modes.NORMAL;
      }
    }
  }

  destroy() {
    this.commandQueue.dispose();
  }

}

exports.default = GitShellOutStrategy;

_defineProperty(GitShellOutStrategy, "defaultExecArgs", {
  stdin: null,
  useGitPromptServer: false,
  useGpgWrapper: false,
  useGpgAtomPrompt: false,
  writeOperation: false
});

function buildAddedFilePatch(filePath, contents, mode, realpath) {
  const hunks = [];

  if (contents) {
    let noNewLine;
    let lines;

    if (mode === _file.default.modes.SYMLINK) {
      noNewLine = false;
      lines = [`+${(0, _helpers.toGitPathSep)(realpath)}`, '\\ No newline at end of file'];
    } else {
      noNewLine = contents[contents.length - 1] !== '\n';
      lines = contents.trim().split(_helpers.LINE_ENDING_REGEX).map(line => `+${line}`);
    }

    if (noNewLine) {
      lines.push('\\ No newline at end of file');
    }

    hunks.push({
      lines,
      oldStartLine: 0,
      oldLineCount: 0,
      newStartLine: 1,
      heading: '',
      newLineCount: noNewLine ? lines.length - 1 : lines.length
    });
  }

  return {
    oldPath: null,
    newPath: (0, _helpers.toNativePathSep)(filePath),
    oldMode: null,
    newMode: mode,
    status: 'added',
    hunks
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9naXQtc2hlbGwtb3V0LXN0cmF0ZWd5LmpzIl0sIm5hbWVzIjpbIk1BWF9TVEFUVVNfT1VUUFVUX0xFTkdUSCIsImhlYWRsZXNzIiwiZXhlY1BhdGhQcm9taXNlIiwiR2l0RXJyb3IiLCJFcnJvciIsImNvbnN0cnVjdG9yIiwibWVzc2FnZSIsInN0YWNrIiwiTGFyZ2VSZXBvRXJyb3IiLCJJR05PUkVEX0dJVF9DT01NQU5EUyIsIkRJU0FCTEVfQ09MT1JfRkxBR1MiLCJyZWR1Y2UiLCJhY2MiLCJ0eXBlIiwidW5zaGlmdCIsIkVYUEFORF9USUxERV9SRUdFWCIsIlJlZ0V4cCIsIkdpdFNoZWxsT3V0U3RyYXRlZ3kiLCJ3b3JraW5nRGlyIiwib3B0aW9ucyIsInF1ZXVlIiwiY29tbWFuZFF1ZXVlIiwicGFyYWxsZWxpc20iLCJNYXRoIiwibWF4Iiwib3MiLCJjcHVzIiwibGVuZ3RoIiwiQXN5bmNRdWV1ZSIsInByb21wdCIsInF1ZXJ5IiwiUHJvbWlzZSIsInJlamVjdCIsIndvcmtlck1hbmFnZXIiLCJyZW1vdGUiLCJnZXRDdXJyZW50V2luZG93IiwiaXNWaXNpYmxlIiwic2V0UHJvbXB0Q2FsbGJhY2siLCJleGVjIiwiYXJncyIsImRlZmF1bHRFeGVjQXJncyIsInN0ZGluIiwidXNlR2l0UHJvbXB0U2VydmVyIiwidXNlR3BnV3JhcHBlciIsInVzZUdwZ0F0b21Qcm9tcHQiLCJ3cml0ZU9wZXJhdGlvbiIsImNvbW1hbmROYW1lIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJkaWFnbm9zdGljc0VuYWJsZWQiLCJwcm9jZXNzIiwiZW52IiwiQVRPTV9HSVRIVUJfR0lUX0RJQUdOT1NUSUNTIiwiYXRvbSIsImNvbmZpZyIsImdldCIsImZvcm1hdHRlZEFyZ3MiLCJqb2luIiwidGltaW5nTWFya2VyIiwiR2l0VGltaW5nc1ZpZXciLCJnZW5lcmF0ZU1hcmtlciIsIm1hcmsiLCJyZXNvbHZlIiwiY2hpbGRQcm9jZXNzIiwiZXJyb3IiLCJzdGRvdXQiLCJ0cmltIiwiZXhlY1BhdGgiLCJwdXNoIiwiZ2l0UHJvbXB0U2VydmVyIiwicGF0aFBhcnRzIiwiUEFUSCIsIkdJVF9URVJNSU5BTF9QUk9NUFQiLCJHSVRfT1BUSU9OQUxfTE9DS1MiLCJwYXRoIiwiZGVsaW1pdGVyIiwiZ2l0VGVtcERpciIsIkdpdFRlbXBEaXIiLCJlbnN1cmUiLCJnZXRHcGdXcmFwcGVyU2giLCJHaXRQcm9tcHRTZXJ2ZXIiLCJzdGFydCIsIkFUT01fR0lUSFVCX1RNUCIsImdldFJvb3RQYXRoIiwiQVRPTV9HSVRIVUJfQVNLUEFTU19QQVRIIiwiZ2V0QXNrUGFzc0pzIiwiQVRPTV9HSVRIVUJfQ1JFREVOVElBTF9QQVRIIiwiZ2V0Q3JlZGVudGlhbEhlbHBlckpzIiwiQVRPTV9HSVRIVUJfRUxFQ1RST05fUEFUSCIsIkFUT01fR0lUSFVCX1NPQ0tfQUREUiIsImdldEFkZHJlc3MiLCJBVE9NX0dJVEhVQl9XT1JLRElSX1BBVEgiLCJBVE9NX0dJVEhVQl9EVUdJVEVfUEFUSCIsIkFUT01fR0lUSFVCX0tFWVRBUl9TVFJBVEVHWV9QQVRIIiwiRElTUExBWSIsIkFUT01fR0lUSFVCX09SSUdJTkFMX1BBVEgiLCJBVE9NX0dJVEhVQl9PUklHSU5BTF9HSVRfQVNLUEFTUyIsIkdJVF9BU0tQQVNTIiwiQVRPTV9HSVRIVUJfT1JJR0lOQUxfU1NIX0FTS1BBU1MiLCJTU0hfQVNLUEFTUyIsIkFUT01fR0lUSFVCX09SSUdJTkFMX0dJVF9TU0hfQ09NTUFORCIsIkdJVF9TU0hfQ09NTUFORCIsIkFUT01fR0lUSFVCX1NQRUNfTU9ERSIsImluU3BlY01vZGUiLCJnZXRBc2tQYXNzU2giLCJwbGF0Zm9ybSIsImdldFNzaFdyYXBwZXJTaCIsIkdJVF9TU0giLCJjcmVkZW50aWFsSGVscGVyU2giLCJnZXRDcmVkZW50aWFsSGVscGVyU2giLCJBVE9NX0dJVEhVQl9HUEdfUFJPTVBUIiwiR0lUX1RSQUNFIiwiR0lUX1RSQUNFX0NVUkwiLCJvcHRzIiwic3RkaW5FbmNvZGluZyIsIlBSSU5UX0dJVF9USU1FUyIsImNvbnNvbGUiLCJ0aW1lIiwiYmVmb3JlUnVuIiwibmV3QXJnc09wdHMiLCJwcm9taXNlIiwiY2FuY2VsIiwiZXhlY3V0ZUdpdENvbW1hbmQiLCJleHBlY3RDYW5jZWwiLCJhZGQiLCJvbkRpZENhbmNlbCIsImhhbmRsZXJQaWQiLCJyZXNvbHZlS2lsbCIsInJlamVjdEtpbGwiLCJyZXF1aXJlIiwiZXJyIiwic3RkZXJyIiwiZXhpdENvZGUiLCJzaWduYWwiLCJ0aW1pbmciLCJjYXRjaCIsImV4ZWNUaW1lIiwic3Bhd25UaW1lIiwiaXBjVGltZSIsIm5vdyIsInBlcmZvcm1hbmNlIiwiZmluYWxpemUiLCJ0aW1lRW5kIiwidGVybWluYXRlIiwiZGlzcG9zZSIsImV4cG9zZUNvbnRyb2xDaGFyYWN0ZXJzIiwicmF3IiwicmVwbGFjZSIsInN1bW1hcnkiLCJ1bmRlZmluZWQiLCJsb2ciLCJoZWFkZXJTdHlsZSIsImdyb3VwQ29sbGFwc2VkIiwidXRpbCIsImluc3BlY3QiLCJicmVha0xlbmd0aCIsIkluZmluaXR5IiwiZ3JvdXBFbmQiLCJjb2RlIiwic3RkRXJyIiwic3RkT3V0IiwiY29tbWFuZCIsImluY2x1ZGVzIiwicGFyYWxsZWwiLCJncGdFeGVjIiwic2xpY2UiLCJlIiwidGVzdCIsIm1hcmtlciIsIkFUT01fR0lUSFVCX0lOTElORV9HSVRfRVhFQyIsIldvcmtlck1hbmFnZXIiLCJnZXRJbnN0YW5jZSIsImlzUmVhZHkiLCJjaGlsZFBpZCIsInByb2Nlc3NDYWxsYmFjayIsImNoaWxkIiwicGlkIiwib24iLCJHaXRQcm9jZXNzIiwicmVxdWVzdCIsInJlc29sdmVEb3RHaXREaXIiLCJmcyIsInN0YXQiLCJvdXRwdXQiLCJkb3RHaXREaXIiLCJpbml0Iiwic3RhZ2VGaWxlcyIsInBhdGhzIiwiY29uY2F0IiwibWFwIiwidG9HaXRQYXRoU2VwIiwiZmV0Y2hDb21taXRNZXNzYWdlVGVtcGxhdGUiLCJ0ZW1wbGF0ZVBhdGgiLCJnZXRDb25maWciLCJob21lRGlyIiwiaG9tZWRpciIsIl8iLCJ1c2VyIiwiZGlybmFtZSIsImlzQWJzb2x1dGUiLCJyZWFkRmlsZSIsImVuY29kaW5nIiwidW5zdGFnZUZpbGVzIiwiY29tbWl0Iiwic3RhZ2VGaWxlTW9kZUNoYW5nZSIsImZpbGVuYW1lIiwibmV3TW9kZSIsImluZGV4UmVhZFByb21pc2UiLCJkZXRlcm1pbmVBcmdzIiwiaW5kZXgiLCJvaWQiLCJzdWJzdHIiLCJzdGFnZUZpbGVTeW1saW5rQ2hhbmdlIiwiYXBwbHlQYXRjaCIsInBhdGNoIiwic3BsaWNlIiwicmF3TWVzc2FnZSIsImFsbG93RW1wdHkiLCJhbWVuZCIsImNvQXV0aG9ycyIsInZlcmJhdGltIiwibXNnIiwidW5ib3JuUmVmIiwibWVzc2FnZUJvZHkiLCJtZXNzYWdlU3ViamVjdCIsImdldEhlYWRDb21taXQiLCJ0ZW1wbGF0ZSIsImNvbW1lbnRDaGFyIiwic3BsaXQiLCJmaWx0ZXIiLCJsaW5lIiwic3RhcnRzV2l0aCIsImNvbmZpZ3VyZWQiLCJtb2RlIiwiYWRkQ29BdXRob3JzVG9NZXNzYWdlIiwidHJhaWxlcnMiLCJhdXRob3IiLCJ0b2tlbiIsInZhbHVlIiwibmFtZSIsImVtYWlsIiwibWVyZ2VUcmFpbGVycyIsImdldFN0YXR1c0J1bmRsZSIsInJlc3VsdHMiLCJlbnRyeVR5cGUiLCJBcnJheSIsImlzQXJyYXkiLCJ1cGRhdGVOYXRpdmVQYXRoU2VwRm9yRW50cmllcyIsImVudHJpZXMiLCJmb3JFYWNoIiwiZW50cnkiLCJmaWxlUGF0aCIsIm9yaWdGaWxlUGF0aCIsImRpZmZGaWxlU3RhdHVzIiwic3RhZ2VkIiwidGFyZ2V0Iiwic3RhdHVzTWFwIiwiQSIsIk0iLCJEIiwiVSIsImZpbGVTdGF0dXNlcyIsIkxJTkVfRU5ESU5HX1JFR0VYIiwic3RhdHVzIiwicmF3RmlsZVBhdGgiLCJ1bnRyYWNrZWQiLCJnZXRVbnRyYWNrZWRGaWxlcyIsInRvTmF0aXZlUGF0aFNlcCIsImdldERpZmZzRm9yRmlsZVBhdGgiLCJiYXNlQ29tbWl0IiwicmF3RGlmZnMiLCJyYXdEaWZmIiwiaSIsIm9sZFBhdGgiLCJuZXdQYXRoIiwiYWJzUGF0aCIsImV4ZWN1dGFibGUiLCJzeW1saW5rIiwiY29udGVudHMiLCJiaW5hcnkiLCJyZWFscGF0aCIsIkZpbGUiLCJtb2RlcyIsIkVYRUNVVEFCTEUiLCJTWU1MSU5LIiwiTk9STUFMIiwiYnVpbGRBZGRlZEZpbGVQYXRjaCIsImdldFN0YWdlZENoYW5nZXNQYXRjaCIsImRpZmZzIiwiZGlmZiIsImdldENvbW1pdCIsInJlZiIsImdldENvbW1pdHMiLCJpbmNsdWRlVW5ib3JuIiwiaGVhZENvbW1pdCIsImluY2x1ZGVQYXRjaCIsInNoYSIsImZpZWxkcyIsImNvbW1pdHMiLCJib2R5IiwiQXV0aG9yIiwiYXV0aG9yRGF0ZSIsInBhcnNlSW50IiwiZ2V0QXV0aG9ycyIsImRlbGltaXRlclN0cmluZyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImZvcm1hdCIsImFuIiwiYWUiLCJjbiIsImNlIiwidHJhaWxlciIsIm1hdGNoIiwiQ09fQVVUSE9SX1JFR0VYIiwiY29tbWl0TWVzc2FnZSIsInJlYWRGaWxlRnJvbUluZGV4IiwibWVyZ2UiLCJicmFuY2hOYW1lIiwiaXNNZXJnaW5nIiwiYWJvcnRNZXJnZSIsImNoZWNrb3V0U2lkZSIsInNpZGUiLCJpc1JlYmFzaW5nIiwiYWxsIiwic29tZSIsInIiLCJjbG9uZSIsInJlbW90ZVVybCIsIm5vTG9jYWwiLCJiYXJlIiwicmVjdXJzaXZlIiwic291cmNlUmVtb3RlTmFtZSIsInJlbW90ZU5hbWUiLCJmZXRjaCIsInB1bGwiLCJyZWZTcGVjIiwiZmZPbmx5Iiwic2V0VXBzdHJlYW0iLCJmb3JjZSIsInJlc2V0IiwicmV2aXNpb24iLCJ2YWxpZFR5cGVzIiwiZGVsZXRlUmVmIiwiY2hlY2tvdXQiLCJjcmVhdGVOZXciLCJzdGFydFBvaW50IiwidHJhY2siLCJnZXRCcmFuY2hlcyIsImhlYWQiLCJ1cHN0cmVhbVRyYWNraW5nUmVmIiwidXBzdHJlYW1SZW1vdGVOYW1lIiwidXBzdHJlYW1SZW1vdGVSZWYiLCJwdXNoVHJhY2tpbmdSZWYiLCJwdXNoUmVtb3RlTmFtZSIsInB1c2hSZW1vdGVSZWYiLCJicmFuY2giLCJ1cHN0cmVhbSIsInRyYWNraW5nUmVmIiwicmVtb3RlUmVmIiwiZ2V0QnJhbmNoZXNXaXRoQ29tbWl0Iiwib3B0aW9uIiwic2hvd0xvY2FsIiwic2hvd1JlbW90ZSIsInBhdHRlcm4iLCJjaGVja291dEZpbGVzIiwiZGVzY3JpYmVIZWFkIiwibG9jYWwiLCJzZXRDb25maWciLCJyZXBsYWNlQWxsIiwiZ2xvYmFsIiwidW5zZXRDb25maWciLCJnZXRSZW1vdGVzIiwidXJsIiwiYWRkUmVtb3RlIiwiY3JlYXRlQmxvYiIsImV4cGFuZEJsb2JUb0ZpbGUiLCJhYnNGaWxlUGF0aCIsIndyaXRlRmlsZSIsImdldEJsb2JDb250ZW50cyIsIm1lcmdlRmlsZSIsIm91cnNQYXRoIiwiY29tbW9uQmFzZVBhdGgiLCJ0aGVpcnNQYXRoIiwicmVzdWx0UGF0aCIsImNvbmZsaWN0IiwicmVzb2x2ZWRSZXN1bHRQYXRoIiwid3JpdGVNZXJnZUNvbmZsaWN0VG9JbmRleCIsImNvbW1vbkJhc2VTaGEiLCJvdXJzU2hhIiwidGhlaXJzU2hhIiwiZ2l0RmlsZVBhdGgiLCJmaWxlTW9kZSIsImdldEZpbGVNb2RlIiwiaW5kZXhJbmZvIiwiZGVzdHJveSIsImh1bmtzIiwibm9OZXdMaW5lIiwibGluZXMiLCJvbGRTdGFydExpbmUiLCJvbGRMaW5lQ291bnQiLCJuZXdTdGFydExpbmUiLCJoZWFkaW5nIiwibmV3TGluZUNvdW50Iiwib2xkTW9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLE1BQU1BLHdCQUF3QixHQUFHLE9BQU8sSUFBUCxHQUFjLEVBQS9DO0FBRUEsSUFB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QyxJQUFBQSxPQUFPLEVBQUUsOEJBQWdCdkIsUUFBaEIsQ0FGSjtBQUdMeUosSUFBQUEsT0FBTyxFQUFFLElBSEo7QUFJTHRNLElBQUFBLE9BQU8sRUFBRTJCLElBSko7QUFLTDhCLElBQUFBLE1BQU0sRUFBRSxPQUxIO0FBTUxxSSxJQUFBQTtBQU5LLEdBQVA7QUFRRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQge3JlbW90ZX0gZnJvbSAnZWxlY3Ryb24nO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge0dpdFByb2Nlc3N9IGZyb20gJ2R1Z2l0ZSc7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlRGlmZn0gZnJvbSAnd2hhdC10aGUtZGlmZic7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlU3RhdHVzfSBmcm9tICd3aGF0LXRoZS1zdGF0dXMnO1xuXG5pbXBvcnQgR2l0UHJvbXB0U2VydmVyIGZyb20gJy4vZ2l0LXByb21wdC1zZXJ2ZXInO1xuaW1wb3J0IEdpdFRlbXBEaXIgZnJvbSAnLi9naXQtdGVtcC1kaXInO1xuaW1wb3J0IEFzeW5jUXVldWUgZnJvbSAnLi9hc3luYy1xdWV1ZSc7XG5pbXBvcnQge2luY3JlbWVudENvdW50ZXJ9IGZyb20gJy4vcmVwb3J0ZXItcHJveHknO1xuaW1wb3J0IHtcbiAgZ2V0RHVnaXRlUGF0aCwgZ2V0U2hhcmVkTW9kdWxlUGF0aCwgZ2V0QXRvbUhlbHBlclBhdGgsXG4gIGV4dHJhY3RDb0F1dGhvcnNBbmRSYXdDb21taXRNZXNzYWdlLCBmaWxlRXhpc3RzLCBpc0ZpbGVFeGVjdXRhYmxlLCBpc0ZpbGVTeW1saW5rLCBpc0JpbmFyeSxcbiAgbm9ybWFsaXplR2l0SGVscGVyUGF0aCwgdG9OYXRpdmVQYXRoU2VwLCB0b0dpdFBhdGhTZXAsIExJTkVfRU5ESU5HX1JFR0VYLCBDT19BVVRIT1JfUkVHRVgsXG59IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgR2l0VGltaW5nc1ZpZXcgZnJvbSAnLi92aWV3cy9naXQtdGltaW5ncy12aWV3JztcbmltcG9ydCBGaWxlIGZyb20gJy4vbW9kZWxzL3BhdGNoL2ZpbGUnO1xuaW1wb3J0IFdvcmtlck1hbmFnZXIgZnJvbSAnLi93b3JrZXItbWFuYWdlcic7XG5pbXBvcnQgQXV0aG9yIGZyb20gJy4vbW9kZWxzL2F1dGhvcic7XG5cbmNvbnN0IE1BWF9TVEFUVVNfT1VUUFVUX0xFTkdUSCA9IDEwMjQgKiAxMDI0ICogMTA7XG5cbmxldCBoZWFkbGVzcyA9IG51bGw7XG5sZXQgZXhlY1BhdGhQcm9taXNlID0gbnVsbDtcblxuZXhwb3J0IGNsYXNzIEdpdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExhcmdlUmVwb0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gIH1cbn1cblxuLy8gaWdub3JlZCBmb3IgdGhlIHB1cnBvc2VzIG9mIHVzYWdlIG1ldHJpY3MgdHJhY2tpbmcgYmVjYXVzZSB0aGV5J3JlIG5vaXN5XG5jb25zdCBJR05PUkVEX0dJVF9DT01NQU5EUyA9IFsnY2F0LWZpbGUnLCAnY29uZmlnJywgJ2RpZmYnLCAnZm9yLWVhY2gtcmVmJywgJ2xvZycsICdyZXYtcGFyc2UnLCAnc3RhdHVzJ107XG5cbmNvbnN0IERJU0FCTEVfQ09MT1JfRkxBR1MgPSBbXG4gICdicmFuY2gnLCAnZGlmZicsICdzaG93QnJhbmNoJywgJ3N0YXR1cycsICd1aScsXG5dLnJlZHVjZSgoYWNjLCB0eXBlKSA9PiB7XG4gIGFjYy51bnNoaWZ0KCctYycsIGBjb2xvci4ke3R5cGV9PWZhbHNlYCk7XG4gIHJldHVybiBhY2M7XG59LCBbXSk7XG5cbi8qKlxuICogRXhwYW5kIGNvbmZpZyBwYXRoIG5hbWUgcGVyXG4gKiBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWNvbmZpZyNnaXQtY29uZmlnLXBhdGhuYW1lXG4gKiB0aGlzIHJlZ2V4IGF0dGVtcHRzIHRvIGdldCB0aGUgc3BlY2lmaWVkIHVzZXIncyBob21lIGRpcmVjdG9yeVxuICogRXg6IG9uIE1hYyB+a3V5Y2hhY28vIGlzIGV4cGFuZGVkIHRvIHRoZSBzcGVjaWZpZWQgdXNlcuKAmXMgaG9tZSBkaXJlY3RvcnkgKC9Vc2Vycy9rdXljaGFjbylcbiAqIFJlZ2V4IHRyYW5zbGF0aW9uOlxuICogXn4gbGluZSBzdGFydHMgd2l0aCB0aWxkZVxuICogKFteXFxcXFxcXFwvXSopW1xcXFxcXFxcL10gY2FwdHVyZXMgbm9uLXNsYXNoIGNoYXJhY3RlcnMgYmVmb3JlIGZpcnN0IHNsYXNoXG4gKi9cbmNvbnN0IEVYUEFORF9USUxERV9SRUdFWCA9IG5ldyBSZWdFeHAoJ15+KFteXFxcXFxcXFwvXSopW1xcXFxcXFxcL10nKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0U2hlbGxPdXRTdHJhdGVneSB7XG4gIHN0YXRpYyBkZWZhdWx0RXhlY0FyZ3MgPSB7XG4gICAgc3RkaW46IG51bGwsXG4gICAgdXNlR2l0UHJvbXB0U2VydmVyOiBmYWxzZSxcbiAgICB1c2VHcGdXcmFwcGVyOiBmYWxzZSxcbiAgICB1c2VHcGdBdG9tUHJvbXB0OiBmYWxzZSxcbiAgICB3cml0ZU9wZXJhdGlvbjogZmFsc2UsXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih3b3JraW5nRGlyLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLndvcmtpbmdEaXIgPSB3b3JraW5nRGlyO1xuICAgIGlmIChvcHRpb25zLnF1ZXVlKSB7XG4gICAgICB0aGlzLmNvbW1hbmRRdWV1ZSA9IG9wdGlvbnMucXVldWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhcmFsbGVsaXNtID0gb3B0aW9ucy5wYXJhbGxlbGlzbSB8fCBNYXRoLm1heCgzLCBvcy5jcHVzKCkubGVuZ3RoKTtcbiAgICAgIHRoaXMuY29tbWFuZFF1ZXVlID0gbmV3IEFzeW5jUXVldWUoe3BhcmFsbGVsaXNtfSk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9tcHQgPSBvcHRpb25zLnByb21wdCB8fCAocXVlcnkgPT4gUHJvbWlzZS5yZWplY3QoKSk7XG4gICAgdGhpcy53b3JrZXJNYW5hZ2VyID0gb3B0aW9ucy53b3JrZXJNYW5hZ2VyO1xuXG4gICAgaWYgKGhlYWRsZXNzID09PSBudWxsKSB7XG4gICAgICBoZWFkbGVzcyA9ICFyZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlzVmlzaWJsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIFByb3ZpZGUgYW4gYXN5bmNocm9ub3VzIGNhbGxiYWNrIHRvIGJlIHVzZWQgdG8gcmVxdWVzdCBpbnB1dCBmcm9tIHRoZSB1c2VyIGZvciBnaXQgb3BlcmF0aW9ucy5cbiAgICpcbiAgICogYHByb21wdGAgbXVzdCBiZSBhIGNhbGxhYmxlIHRoYXQgYWNjZXB0cyBhIHF1ZXJ5IG9iamVjdCBge3Byb21wdCwgaW5jbHVkZVVzZXJuYW1lfWAgYW5kIHJldHVybnMgYSBQcm9taXNlXG4gICAqIHRoYXQgZWl0aGVyIHJlc29sdmVzIHdpdGggYSByZXN1bHQgb2JqZWN0IGB7W3VzZXJuYW1lXSwgcGFzc3dvcmR9YCBvciByZWplY3RzIG9uIGNhbmNlbGxhdGlvbi5cbiAgICovXG4gIHNldFByb21wdENhbGxiYWNrKHByb21wdCkge1xuICAgIHRoaXMucHJvbXB0ID0gcHJvbXB0O1xuICB9XG5cbiAgLy8gRXhlY3V0ZSBhIGNvbW1hbmQgYW5kIHJlYWQgdGhlIG91dHB1dCB1c2luZyB0aGUgZW1iZWRkZWQgR2l0IGVudmlyb25tZW50XG4gIGFzeW5jIGV4ZWMoYXJncywgb3B0aW9ucyA9IEdpdFNoZWxsT3V0U3RyYXRlZ3kuZGVmYXVsdEV4ZWNBcmdzKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSxuby1jb250cm9sLXJlZ2V4ICovXG4gICAgY29uc3Qge3N0ZGluLCB1c2VHaXRQcm9tcHRTZXJ2ZXIsIHVzZUdwZ1dyYXBwZXIsIHVzZUdwZ0F0b21Qcm9tcHQsIHdyaXRlT3BlcmF0aW9ufSA9IG9wdGlvbnM7XG4gICAgY29uc3QgY29tbWFuZE5hbWUgPSBhcmdzWzBdO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IGRpYWdub3N0aWNzRW5hYmxlZCA9IHByb2Nlc3MuZW52LkFUT01fR0lUSFVCX0dJVF9ESUFHTk9TVElDUyB8fCBhdG9tLmNvbmZpZy5nZXQoJ2dpdGh1Yi5naXREaWFnbm9zdGljcycpO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkQXJncyA9IGBnaXQgJHthcmdzLmpvaW4oJyAnKX0gaW4gJHt0aGlzLndvcmtpbmdEaXJ9YDtcbiAgICBjb25zdCB0aW1pbmdNYXJrZXIgPSBHaXRUaW1pbmdzVmlldy5nZW5lcmF0ZU1hcmtlcihgZ2l0ICR7YXJncy5qb2luKCcgJyl9YCk7XG4gICAgdGltaW5nTWFya2VyLm1hcmsoJ3F1ZXVlZCcpO1xuXG4gICAgYXJncy51bnNoaWZ0KC4uLkRJU0FCTEVfQ09MT1JfRkxBR1MpO1xuXG4gICAgaWYgKGV4ZWNQYXRoUHJvbWlzZSA9PT0gbnVsbCkge1xuICAgICAgLy8gQXR0ZW1wdCB0byBjb2xsZWN0IHRoZSAtLWV4ZWMtcGF0aCBmcm9tIGEgbmF0aXZlIGdpdCBpbnN0YWxsYXRpb24uXG4gICAgICBleGVjUGF0aFByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY2hpbGRQcm9jZXNzLmV4ZWMoJ2dpdCAtLWV4ZWMtcGF0aCcsIChlcnJvciwgc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBPaCB3ZWxsXG4gICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUoc3Rkb3V0LnRyaW0oKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGV4ZWNQYXRoID0gYXdhaXQgZXhlY1BhdGhQcm9taXNlO1xuXG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgdGltaW5nTWFya2VyLm1hcmsoJ3ByZXBhcmUnKTtcbiAgICAgIGxldCBnaXRQcm9tcHRTZXJ2ZXI7XG5cbiAgICAgIGNvbnN0IHBhdGhQYXJ0cyA9IFtdO1xuICAgICAgaWYgKHByb2Nlc3MuZW52LlBBVEgpIHtcbiAgICAgICAgcGF0aFBhcnRzLnB1c2gocHJvY2Vzcy5lbnYuUEFUSCk7XG4gICAgICB9XG4gICAgICBpZiAoZXhlY1BhdGgpIHtcbiAgICAgICAgcGF0aFBhcnRzLnB1c2goZXhlY1BhdGgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlbnYgPSB7XG4gICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICBHSVRfVEVSTUlOQUxfUFJPTVBUOiAnMCcsXG4gICAgICAgIEdJVF9PUFRJT05BTF9MT0NLUzogJzAnLFxuICAgICAgICBQQVRIOiBwYXRoUGFydHMuam9pbihwYXRoLmRlbGltaXRlciksXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBnaXRUZW1wRGlyID0gbmV3IEdpdFRlbXBEaXIoKTtcblxuICAgICAgaWYgKHVzZUdwZ1dyYXBwZXIpIHtcbiAgICAgICAgYXdhaXQgZ2l0VGVtcERpci5lbnN1cmUoKTtcbiAgICAgICAgYXJncy51bnNoaWZ0KCctYycsIGBncGcucHJvZ3JhbT0ke2dpdFRlbXBEaXIuZ2V0R3BnV3JhcHBlclNoKCl9YCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh1c2VHaXRQcm9tcHRTZXJ2ZXIpIHtcbiAgICAgICAgZ2l0UHJvbXB0U2VydmVyID0gbmV3IEdpdFByb21wdFNlcnZlcihnaXRUZW1wRGlyKTtcbiAgICAgICAgYXdhaXQgZ2l0UHJvbXB0U2VydmVyLnN0YXJ0KHRoaXMucHJvbXB0KTtcblxuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfVE1QID0gZ2l0VGVtcERpci5nZXRSb290UGF0aCgpO1xuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfQVNLUEFTU19QQVRIID0gbm9ybWFsaXplR2l0SGVscGVyUGF0aChnaXRUZW1wRGlyLmdldEFza1Bhc3NKcygpKTtcbiAgICAgICAgZW52LkFUT01fR0lUSFVCX0NSRURFTlRJQUxfUEFUSCA9IG5vcm1hbGl6ZUdpdEhlbHBlclBhdGgoZ2l0VGVtcERpci5nZXRDcmVkZW50aWFsSGVscGVySnMoKSk7XG4gICAgICAgIGVudi5BVE9NX0dJVEhVQl9FTEVDVFJPTl9QQVRIID0gbm9ybWFsaXplR2l0SGVscGVyUGF0aChnZXRBdG9tSGVscGVyUGF0aCgpKTtcbiAgICAgICAgZW52LkFUT01fR0lUSFVCX1NPQ0tfQUREUiA9IGdpdFByb21wdFNlcnZlci5nZXRBZGRyZXNzKCk7XG5cbiAgICAgICAgZW52LkFUT01fR0lUSFVCX1dPUktESVJfUEFUSCA9IHRoaXMud29ya2luZ0RpcjtcbiAgICAgICAgZW52LkFUT01fR0lUSFVCX0RVR0lURV9QQVRIID0gZ2V0RHVnaXRlUGF0aCgpO1xuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfS0VZVEFSX1NUUkFURUdZX1BBVEggPSBnZXRTaGFyZWRNb2R1bGVQYXRoKCdrZXl0YXItc3RyYXRlZ3knKTtcblxuICAgICAgICAvLyBcInNzaFwiIHdvbid0IHJlc3BlY3QgU1NIX0FTS1BBU1MgdW5sZXNzOlxuICAgICAgICAvLyAoYSkgaXQncyBydW5uaW5nIHdpdGhvdXQgYSB0dHlcbiAgICAgICAgLy8gKGIpIERJU1BMQVkgaXMgc2V0IHRvIHNvbWV0aGluZyBub25lbXB0eVxuICAgICAgICAvLyBCdXQsIG9uIGEgTWFjLCBESVNQTEFZIGlzIHVuc2V0LiBFbnN1cmUgdGhhdCBpdCBpcyBzbyBvdXIgU1NIX0FTS1BBU1MgaXMgcmVzcGVjdGVkLlxuICAgICAgICBpZiAoIXByb2Nlc3MuZW52LkRJU1BMQVkgfHwgcHJvY2Vzcy5lbnYuRElTUExBWS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBlbnYuRElTUExBWSA9ICdhdG9tLWdpdGh1Yi1wbGFjZWhvbGRlcic7XG4gICAgICAgIH1cblxuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfT1JJR0lOQUxfUEFUSCA9IHByb2Nlc3MuZW52LlBBVEggfHwgJyc7XG4gICAgICAgIGVudi5BVE9NX0dJVEhVQl9PUklHSU5BTF9HSVRfQVNLUEFTUyA9IHByb2Nlc3MuZW52LkdJVF9BU0tQQVNTIHx8ICcnO1xuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfT1JJR0lOQUxfU1NIX0FTS1BBU1MgPSBwcm9jZXNzLmVudi5TU0hfQVNLUEFTUyB8fCAnJztcbiAgICAgICAgZW52LkFUT01fR0lUSFVCX09SSUdJTkFMX0dJVF9TU0hfQ09NTUFORCA9IHByb2Nlc3MuZW52LkdJVF9TU0hfQ09NTUFORCB8fCAnJztcbiAgICAgICAgZW52LkFUT01fR0lUSFVCX1NQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgICAgICBlbnYuU1NIX0FTS1BBU1MgPSBub3JtYWxpemVHaXRIZWxwZXJQYXRoKGdpdFRlbXBEaXIuZ2V0QXNrUGFzc1NoKCkpO1xuICAgICAgICBlbnYuR0lUX0FTS1BBU1MgPSBub3JtYWxpemVHaXRIZWxwZXJQYXRoKGdpdFRlbXBEaXIuZ2V0QXNrUGFzc1NoKCkpO1xuXG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gICAgICAgICAgZW52LkdJVF9TU0hfQ09NTUFORCA9IGdpdFRlbXBEaXIuZ2V0U3NoV3JhcHBlclNoKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuR0lUX1NTSF9DT01NQU5EKSB7XG4gICAgICAgICAgZW52LkdJVF9TU0hfQ09NTUFORCA9IHByb2Nlc3MuZW52LkdJVF9TU0hfQ09NTUFORDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnYuR0lUX1NTSCA9IHByb2Nlc3MuZW52LkdJVF9TU0g7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjcmVkZW50aWFsSGVscGVyU2ggPSBub3JtYWxpemVHaXRIZWxwZXJQYXRoKGdpdFRlbXBEaXIuZ2V0Q3JlZGVudGlhbEhlbHBlclNoKCkpO1xuICAgICAgICBhcmdzLnVuc2hpZnQoJy1jJywgYGNyZWRlbnRpYWwuaGVscGVyPSR7Y3JlZGVudGlhbEhlbHBlclNofWApO1xuICAgICAgfVxuXG4gICAgICBpZiAodXNlR3BnV3JhcHBlciAmJiB1c2VHaXRQcm9tcHRTZXJ2ZXIgJiYgdXNlR3BnQXRvbVByb21wdCkge1xuICAgICAgICBlbnYuQVRPTV9HSVRIVUJfR1BHX1BST01QVCA9ICd0cnVlJztcbiAgICAgIH1cblxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoZGlhZ25vc3RpY3NFbmFibGVkKSB7XG4gICAgICAgIGVudi5HSVRfVFJBQ0UgPSAndHJ1ZSc7XG4gICAgICAgIGVudi5HSVRfVFJBQ0VfQ1VSTCA9ICd0cnVlJztcbiAgICAgIH1cblxuICAgICAgbGV0IG9wdHMgPSB7ZW52fTtcblxuICAgICAgaWYgKHN0ZGluKSB7XG4gICAgICAgIG9wdHMuc3RkaW4gPSBzdGRpbjtcbiAgICAgICAgb3B0cy5zdGRpbkVuY29kaW5nID0gJ3V0ZjgnO1xuICAgICAgfVxuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwcm9jZXNzLmVudi5QUklOVF9HSVRfVElNRVMpIHtcbiAgICAgICAgY29uc29sZS50aW1lKGBnaXQ6JHtmb3JtYXR0ZWRBcmdzfWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVSdW4pIHtcbiAgICAgICAgICBjb25zdCBuZXdBcmdzT3B0cyA9IGF3YWl0IG9wdGlvbnMuYmVmb3JlUnVuKHthcmdzLCBvcHRzfSk7XG4gICAgICAgICAgYXJncyA9IG5ld0FyZ3NPcHRzLmFyZ3M7XG4gICAgICAgICAgb3B0cyA9IG5ld0FyZ3NPcHRzLm9wdHM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge3Byb21pc2UsIGNhbmNlbH0gPSB0aGlzLmV4ZWN1dGVHaXRDb21tYW5kKGFyZ3MsIG9wdHMsIHRpbWluZ01hcmtlcik7XG4gICAgICAgIGxldCBleHBlY3RDYW5jZWwgPSBmYWxzZTtcbiAgICAgICAgaWYgKGdpdFByb21wdFNlcnZlcikge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGdpdFByb21wdFNlcnZlci5vbkRpZENhbmNlbChhc3luYyAoe2hhbmRsZXJQaWR9KSA9PiB7XG4gICAgICAgICAgICBleHBlY3RDYW5jZWwgPSB0cnVlO1xuICAgICAgICAgICAgYXdhaXQgY2FuY2VsKCk7XG5cbiAgICAgICAgICAgIC8vIE9uIFdpbmRvd3MsIHRoZSBTU0hfQVNLUEFTUyBoYW5kbGVyIGlzIGV4ZWN1dGVkIGFzIGEgbm9uLWNoaWxkIHByb2Nlc3MsIHNvIHRoZSBiaW5cXGdpdC1hc2twYXNzLWF0b20uc2hcbiAgICAgICAgICAgIC8vIHByb2Nlc3MgZG9lcyBub3QgdGVybWluYXRlIHdoZW4gdGhlIGdpdCBwcm9jZXNzIGlzIGtpbGxlZC5cbiAgICAgICAgICAgIC8vIEtpbGwgdGhlIGhhbmRsZXIgcHJvY2VzcyAqYWZ0ZXIqIHRoZSBnaXQgcHJvY2VzcyBoYXMgYmVlbiBraWxsZWQgdG8gZW5zdXJlIHRoYXQgZ2l0IGRvZXNuJ3QgaGF2ZSBhXG4gICAgICAgICAgICAvLyBjaGFuY2UgdG8gZmFsbCBiYWNrIHRvIEdJVF9BU0tQQVNTIGZyb20gdGhlIGNyZWRlbnRpYWwgaGFuZGxlci5cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlS2lsbCwgcmVqZWN0S2lsbCkgPT4ge1xuICAgICAgICAgICAgICByZXF1aXJlKCd0cmVlLWtpbGwnKShoYW5kbGVyUGlkLCAnU0lHVEVSTScsIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZWplY3RLaWxsKGVycik7IH0gZWxzZSB7IHJlc29sdmVLaWxsKCk7IH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWluZ30gPSBhd2FpdCBwcm9taXNlLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgaWYgKGVyci5zaWduYWwpIHtcbiAgICAgICAgICAgIHJldHVybiB7c2lnbmFsOiBlcnIuc2lnbmFsfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGltaW5nKSB7XG4gICAgICAgICAgY29uc3Qge2V4ZWNUaW1lLCBzcGF3blRpbWUsIGlwY1RpbWV9ID0gdGltaW5nO1xuICAgICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIHRpbWluZ01hcmtlci5tYXJrKCduZXh0dGljaycsIG5vdyAtIGV4ZWNUaW1lIC0gc3Bhd25UaW1lIC0gaXBjVGltZSk7XG4gICAgICAgICAgdGltaW5nTWFya2VyLm1hcmsoJ2V4ZWN1dGUnLCBub3cgLSBleGVjVGltZSAtIGlwY1RpbWUpO1xuICAgICAgICAgIHRpbWluZ01hcmtlci5tYXJrKCdpcGMnLCBub3cgLSBpcGNUaW1lKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1pbmdNYXJrZXIuZmluYWxpemUoKTtcblxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHByb2Nlc3MuZW52LlBSSU5UX0dJVF9USU1FUykge1xuICAgICAgICAgIGNvbnNvbGUudGltZUVuZChgZ2l0OiR7Zm9ybWF0dGVkQXJnc31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChnaXRQcm9tcHRTZXJ2ZXIpIHtcbiAgICAgICAgICBnaXRQcm9tcHRTZXJ2ZXIudGVybWluYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG5cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmIChkaWFnbm9zdGljc0VuYWJsZWQpIHtcbiAgICAgICAgICBjb25zdCBleHBvc2VDb250cm9sQ2hhcmFjdGVycyA9IHJhdyA9PiB7XG4gICAgICAgICAgICBpZiAoIXJhdykgeyByZXR1cm4gJyc7IH1cblxuICAgICAgICAgICAgcmV0dXJuIHJhd1xuICAgICAgICAgICAgICAucmVwbGFjZSgvXFx1MDAwMC91ZywgJzxOVUw+XFxuJylcbiAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcdTAwMUYvdWcsICc8U0VQPicpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoaGVhZGxlc3MpIHtcbiAgICAgICAgICAgIGxldCBzdW1tYXJ5ID0gYGdpdDoke2Zvcm1hdHRlZEFyZ3N9XFxuYDtcbiAgICAgICAgICAgIGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHN1bW1hcnkgKz0gYGV4aXQgc3RhdHVzOiAke2V4aXRDb2RlfVxcbmA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNpZ25hbCkge1xuICAgICAgICAgICAgICBzdW1tYXJ5ICs9IGBleGl0IHNpZ25hbDogJHtzaWduYWx9XFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGRpbiAmJiBzdGRpbi5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgc3VtbWFyeSArPSBgc3RkaW46XFxuJHtleHBvc2VDb250cm9sQ2hhcmFjdGVycyhzdGRpbil9XFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1bW1hcnkgKz0gJ3N0ZG91dDonO1xuICAgICAgICAgICAgaWYgKHN0ZG91dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgc3VtbWFyeSArPSAnIDxlbXB0eT5cXG4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3VtbWFyeSArPSBgXFxuJHtleHBvc2VDb250cm9sQ2hhcmFjdGVycyhzdGRvdXQpfVxcbmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdW1tYXJ5ICs9ICdzdGRlcnI6JztcbiAgICAgICAgICAgIGlmIChzdGRlcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHN1bW1hcnkgKz0gJyA8ZW1wdHk+XFxuJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN1bW1hcnkgKz0gYFxcbiR7ZXhwb3NlQ29udHJvbENoYXJhY3RlcnMoc3RkZXJyKX1cXG5gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzdW1tYXJ5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyU3R5bGUgPSAnZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiBibHVlOyc7XG5cbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYGdpdDoke2Zvcm1hdHRlZEFyZ3N9YCk7XG4gICAgICAgICAgICBpZiAoZXhpdENvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJWNleGl0IHN0YXR1cyVjICVkJywgaGVhZGVyU3R5bGUsICdmb250LXdlaWdodDogbm9ybWFsOyBjb2xvcjogYmxhY2s7JywgZXhpdENvZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzaWduYWwpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJyVjZXhpdCBzaWduYWwlYyAlcycsIGhlYWRlclN0eWxlLCAnZm9udC13ZWlnaHQ6IG5vcm1hbDsgY29sb3I6IGJsYWNrOycsIHNpZ25hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgJyVjZnVsbCBhcmd1bWVudHMlYyAlcycsXG4gICAgICAgICAgICAgIGhlYWRlclN0eWxlLCAnZm9udC13ZWlnaHQ6IG5vcm1hbDsgY29sb3I6IGJsYWNrOycsXG4gICAgICAgICAgICAgIHV0aWwuaW5zcGVjdChhcmdzLCB7YnJlYWtMZW5ndGg6IEluZmluaXR5fSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHN0ZGluICYmIHN0ZGluLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJWNzdGRpbicsIGhlYWRlclN0eWxlKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXhwb3NlQ29udHJvbENoYXJhY3RlcnMoc3RkaW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCclY3N0ZG91dCcsIGhlYWRlclN0eWxlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV4cG9zZUNvbnRyb2xDaGFyYWN0ZXJzKHN0ZG91dCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyVjc3RkZXJyJywgaGVhZGVyU3R5bGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXhwb3NlQ29udHJvbENoYXJhY3RlcnMoc3RkZXJyKSk7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4aXRDb2RlICE9PSAwICYmICFleHBlY3RDYW5jZWwpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgR2l0RXJyb3IoXG4gICAgICAgICAgICBgJHtmb3JtYXR0ZWRBcmdzfSBleGl0ZWQgd2l0aCBjb2RlICR7ZXhpdENvZGV9XFxuc3Rkb3V0OiAke3N0ZG91dH1cXG5zdGRlcnI6ICR7c3RkZXJyfWAsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlcnIuY29kZSA9IGV4aXRDb2RlO1xuICAgICAgICAgIGVyci5zdGRFcnIgPSBzdGRlcnI7XG4gICAgICAgICAgZXJyLnN0ZE91dCA9IHN0ZG91dDtcbiAgICAgICAgICBlcnIuY29tbWFuZCA9IGZvcm1hdHRlZEFyZ3M7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIUlHTk9SRURfR0lUX0NPTU1BTkRTLmluY2x1ZGVzKGNvbW1hbmROYW1lKSkge1xuICAgICAgICAgIGluY3JlbWVudENvdW50ZXIoY29tbWFuZE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoc3Rkb3V0KTtcbiAgICAgIH0pO1xuICAgIH0sIHtwYXJhbGxlbDogIXdyaXRlT3BlcmF0aW9ufSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlLG5vLWNvbnRyb2wtcmVnZXggKi9cbiAgfVxuXG4gIGFzeW5jIGdwZ0V4ZWMoYXJncywgb3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjKGFyZ3Muc2xpY2UoKSwge1xuICAgICAgICB1c2VHcGdXcmFwcGVyOiB0cnVlLFxuICAgICAgICB1c2VHcGdBdG9tUHJvbXB0OiBmYWxzZSxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICgvZ3BnIGZhaWxlZC8udGVzdChlLnN0ZEVycikpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZXhlYyhhcmdzLCB7XG4gICAgICAgICAgdXNlR2l0UHJvbXB0U2VydmVyOiB0cnVlLFxuICAgICAgICAgIHVzZUdwZ1dyYXBwZXI6IHRydWUsXG4gICAgICAgICAgdXNlR3BnQXRvbVByb21wdDogdHJ1ZSxcbiAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZUdpdENvbW1hbmQoYXJncywgb3B0aW9ucywgbWFya2VyID0gbnVsbCkge1xuICAgIGlmIChwcm9jZXNzLmVudi5BVE9NX0dJVEhVQl9JTkxJTkVfR0lUX0VYRUMgfHwgIVdvcmtlck1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5pc1JlYWR5KCkpIHtcbiAgICAgIG1hcmtlciAmJiBtYXJrZXIubWFyaygnbmV4dHRpY2snKTtcblxuICAgICAgbGV0IGNoaWxkUGlkO1xuICAgICAgb3B0aW9ucy5wcm9jZXNzQ2FsbGJhY2sgPSBjaGlsZCA9PiB7XG4gICAgICAgIGNoaWxkUGlkID0gY2hpbGQucGlkO1xuXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGNoaWxkLnN0ZGluLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdyaXRpbmcgdG8gc3RkaW46IGdpdCAke2FyZ3Muam9pbignICcpfSBpbiAke3RoaXMud29ya2luZ0Rpcn1cXG4ke29wdGlvbnMuc3RkaW59XFxuJHtlcnJ9YCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgcHJvbWlzZSA9IEdpdFByb2Nlc3MuZXhlYyhhcmdzLCB0aGlzLndvcmtpbmdEaXIsIG9wdGlvbnMpO1xuICAgICAgbWFya2VyICYmIG1hcmtlci5tYXJrKCdleGVjdXRlJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlLFxuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICBpZiAoIWNoaWxkUGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlcXVpcmUoJ3RyZWUta2lsbCcpKGNoaWxkUGlkLCAnU0lHVEVSTScsIGVyciA9PiB7XG4gICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJlamVjdChlcnIpOyB9IGVsc2UgeyByZXNvbHZlKCk7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgd29ya2VyTWFuYWdlciA9IHRoaXMud29ya2VyTWFuYWdlciB8fCBXb3JrZXJNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG4gICAgICByZXR1cm4gd29ya2VyTWFuYWdlci5yZXF1ZXN0KHtcbiAgICAgICAgYXJncyxcbiAgICAgICAgd29ya2luZ0RpcjogdGhpcy53b3JraW5nRGlyLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVzb2x2ZURvdEdpdERpcigpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZnMuc3RhdCh0aGlzLndvcmtpbmdEaXIpOyAvLyBmYWlscyBpZiBmb2xkZXIgZG9lc24ndCBleGlzdFxuICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgdGhpcy5leGVjKFsncmV2LXBhcnNlJywgJy0tcmVzb2x2ZS1naXQtZGlyJywgcGF0aC5qb2luKHRoaXMud29ya2luZ0RpciwgJy5naXQnKV0pO1xuICAgICAgY29uc3QgZG90R2l0RGlyID0gb3V0cHV0LnRyaW0oKTtcbiAgICAgIHJldHVybiB0b05hdGl2ZVBhdGhTZXAoZG90R2l0RGlyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoWydpbml0JywgdGhpcy53b3JraW5nRGlyXSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhZ2luZy9VbnN0YWdpbmcgZmlsZXMgYW5kIHBhdGNoZXMgYW5kIGNvbW1pdHRpbmdcbiAgICovXG4gIHN0YWdlRmlsZXMocGF0aHMpIHtcbiAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7IH1cbiAgICBjb25zdCBhcmdzID0gWydhZGQnXS5jb25jYXQocGF0aHMubWFwKHRvR2l0UGF0aFNlcCkpO1xuICAgIHJldHVybiB0aGlzLmV4ZWMoYXJncywge3dyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBhc3luYyBmZXRjaENvbW1pdE1lc3NhZ2VUZW1wbGF0ZSgpIHtcbiAgICBsZXQgdGVtcGxhdGVQYXRoID0gYXdhaXQgdGhpcy5nZXRDb25maWcoJ2NvbW1pdC50ZW1wbGF0ZScpO1xuICAgIGlmICghdGVtcGxhdGVQYXRoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBob21lRGlyID0gb3MuaG9tZWRpcigpO1xuXG4gICAgdGVtcGxhdGVQYXRoID0gdGVtcGxhdGVQYXRoLnRyaW0oKS5yZXBsYWNlKEVYUEFORF9USUxERV9SRUdFWCwgKF8sIHVzZXIpID0+IHtcbiAgICAgIC8vIGlmIG5vIHVzZXIgaXMgc3BlY2lmaWVkLCBmYWxsIGJhY2sgdG8gdXNpbmcgdGhlIGhvbWUgZGlyZWN0b3J5LlxuICAgICAgcmV0dXJuIGAke3VzZXIgPyBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGhvbWVEaXIpLCB1c2VyKSA6IGhvbWVEaXJ9L2A7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVQYXRoID0gdG9OYXRpdmVQYXRoU2VwKHRlbXBsYXRlUGF0aCk7XG5cbiAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZSh0ZW1wbGF0ZVBhdGgpKSB7XG4gICAgICB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4odGhpcy53b3JraW5nRGlyLCB0ZW1wbGF0ZVBhdGgpO1xuICAgIH1cblxuICAgIGlmICghYXdhaXQgZmlsZUV4aXN0cyh0ZW1wbGF0ZVBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29tbWl0IHRlbXBsYXRlIHBhdGggc2V0IGluIEdpdCBjb25maWc6ICR7dGVtcGxhdGVQYXRofWApO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZnMucmVhZEZpbGUodGVtcGxhdGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGY4J30pO1xuICB9XG5cbiAgdW5zdGFnZUZpbGVzKHBhdGhzLCBjb21taXQgPSAnSEVBRCcpIHtcbiAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7IH1cbiAgICBjb25zdCBhcmdzID0gWydyZXNldCcsIGNvbW1pdCwgJy0tJ10uY29uY2F0KHBhdGhzLm1hcCh0b0dpdFBhdGhTZXApKTtcbiAgICByZXR1cm4gdGhpcy5leGVjKGFyZ3MsIHt3cml0ZU9wZXJhdGlvbjogdHJ1ZX0pO1xuICB9XG5cbiAgc3RhZ2VGaWxlTW9kZUNoYW5nZShmaWxlbmFtZSwgbmV3TW9kZSkge1xuICAgIGNvbnN0IGluZGV4UmVhZFByb21pc2UgPSB0aGlzLmV4ZWMoWydscy1maWxlcycsICctcycsICctLScsIGZpbGVuYW1lXSk7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ3VwZGF0ZS1pbmRleCcsICctLWNhY2hlaW5mbycsIGAke25ld01vZGV9LDxPSURfVEJEPiwke2ZpbGVuYW1lfWBdLCB7XG4gICAgICB3cml0ZU9wZXJhdGlvbjogdHJ1ZSxcbiAgICAgIGJlZm9yZVJ1bjogYXN5bmMgZnVuY3Rpb24gZGV0ZXJtaW5lQXJncyh7YXJncywgb3B0c30pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBhd2FpdCBpbmRleFJlYWRQcm9taXNlO1xuICAgICAgICBjb25zdCBvaWQgPSBpbmRleC5zdWJzdHIoNywgNDApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgYXJnczogWyd1cGRhdGUtaW5kZXgnLCAnLS1jYWNoZWluZm8nLCBgJHtuZXdNb2RlfSwke29pZH0sJHtmaWxlbmFtZX1gXSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBzdGFnZUZpbGVTeW1saW5rQ2hhbmdlKGZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ3JtJywgJy0tY2FjaGVkJywgZmlsZW5hbWVdLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGFwcGx5UGF0Y2gocGF0Y2gsIHtpbmRleH0gPSB7fSkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ2FwcGx5JywgJy0nXTtcbiAgICBpZiAoaW5kZXgpIHsgYXJncy5zcGxpY2UoMSwgMCwgJy0tY2FjaGVkJyk7IH1cbiAgICByZXR1cm4gdGhpcy5leGVjKGFyZ3MsIHtzdGRpbjogcGF0Y2gsIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBhc3luYyBjb21taXQocmF3TWVzc2FnZSwge2FsbG93RW1wdHksIGFtZW5kLCBjb0F1dGhvcnMsIHZlcmJhdGltfSA9IHt9KSB7XG4gICAgY29uc3QgYXJncyA9IFsnY29tbWl0J107XG4gICAgbGV0IG1zZztcblxuICAgIC8vIGlmIGFtZW5kaW5nIGFuZCBubyBuZXcgbWVzc2FnZSBpcyBwYXNzZWQsIHVzZSBsYXN0IGNvbW1pdCdzIG1lc3NhZ2UuIEVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gbWFuZ2xlIGl0IGluIHRoZSBwcm9jZXNzLlxuICAgIGlmIChhbWVuZCAmJiByYXdNZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3Qge3VuYm9yblJlZiwgbWVzc2FnZUJvZHksIG1lc3NhZ2VTdWJqZWN0fSA9IGF3YWl0IHRoaXMuZ2V0SGVhZENvbW1pdCgpO1xuICAgICAgaWYgKHVuYm9yblJlZikge1xuICAgICAgICBtc2cgPSByYXdNZXNzYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbXNnID0gYCR7bWVzc2FnZVN1YmplY3R9XFxuXFxuJHttZXNzYWdlQm9keX1gLnRyaW0oKTtcbiAgICAgICAgdmVyYmF0aW0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtc2cgPSByYXdNZXNzYWdlO1xuICAgIH1cblxuICAgIC8vIGlmIGNvbW1pdCB0ZW1wbGF0ZSBpcyB1c2VkLCBzdHJpcCBjb21tZW50ZWQgbGluZXMgZnJvbSBjb21taXRcbiAgICAvLyB0byBiZSBjb25zaXN0ZW50IHdpdGggY29tbWFuZCBsaW5lIGdpdC5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGF3YWl0IHRoaXMuZmV0Y2hDb21taXRNZXNzYWdlVGVtcGxhdGUoKTtcbiAgICBpZiAodGVtcGxhdGUpIHtcblxuICAgICAgLy8gcmVzcGVjdGluZyB0aGUgY29tbWVudCBjaGFyYWN0ZXIgZnJvbSB1c2VyIHNldHRpbmdzIG9yIGZhbGwgYmFjayB0byAjIGFzIGRlZmF1bHQuXG4gICAgICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWNvbmZpZyNnaXQtY29uZmlnLWNvcmVjb21tZW50Q2hhclxuICAgICAgbGV0IGNvbW1lbnRDaGFyID0gYXdhaXQgdGhpcy5nZXRDb25maWcoJ2NvcmUuY29tbWVudENoYXInKTtcbiAgICAgIGlmICghY29tbWVudENoYXIpIHtcbiAgICAgICAgY29tbWVudENoYXIgPSAnIyc7XG4gICAgICB9XG4gICAgICBtc2cgPSBtc2cuc3BsaXQoJ1xcbicpLmZpbHRlcihsaW5lID0+ICFsaW5lLnN0YXJ0c1dpdGgoY29tbWVudENoYXIpKS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIGNsZWFudXAgbW9kZS5cbiAgICBpZiAodmVyYmF0aW0pIHtcbiAgICAgIGFyZ3MucHVzaCgnLS1jbGVhbnVwPXZlcmJhdGltJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbmZpZ3VyZWQgPSBhd2FpdCB0aGlzLmdldENvbmZpZygnY29tbWl0LmNsZWFudXAnKTtcbiAgICAgIGNvbnN0IG1vZGUgPSAoY29uZmlndXJlZCAmJiBjb25maWd1cmVkICE9PSAnZGVmYXVsdCcpID8gY29uZmlndXJlZCA6ICdzdHJpcCc7XG4gICAgICBhcmdzLnB1c2goYC0tY2xlYW51cD0ke21vZGV9YCk7XG4gICAgfVxuXG4gICAgLy8gYWRkIGNvLWF1dGhvciBjb21taXQgdHJhaWxlcnMgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKGNvQXV0aG9ycyAmJiBjb0F1dGhvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbXNnID0gYXdhaXQgdGhpcy5hZGRDb0F1dGhvcnNUb01lc3NhZ2UobXNnLCBjb0F1dGhvcnMpO1xuICAgIH1cblxuICAgIGFyZ3MucHVzaCgnLW0nLCBtc2cudHJpbSgpKTtcblxuICAgIGlmIChhbWVuZCkgeyBhcmdzLnB1c2goJy0tYW1lbmQnKTsgfVxuICAgIGlmIChhbGxvd0VtcHR5KSB7IGFyZ3MucHVzaCgnLS1hbGxvdy1lbXB0eScpOyB9XG4gICAgcmV0dXJuIHRoaXMuZ3BnRXhlYyhhcmdzLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGFkZENvQXV0aG9yc1RvTWVzc2FnZShtZXNzYWdlLCBjb0F1dGhvcnMgPSBbXSkge1xuICAgIGNvbnN0IHRyYWlsZXJzID0gY29BdXRob3JzLm1hcChhdXRob3IgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9rZW46ICdDby1BdXRob3JlZC1CeScsXG4gICAgICAgIHZhbHVlOiBgJHthdXRob3IubmFtZX0gPCR7YXV0aG9yLmVtYWlsfT5gLFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEVuc3VyZSB0aGF0IG1lc3NhZ2UgZW5kcyB3aXRoIG5ld2xpbmUgZm9yIGdpdC1pbnRlcnByZXQgdHJhaWxlcnMgdG8gd29ya1xuICAgIGNvbnN0IG1zZyA9IGAke21lc3NhZ2UudHJpbSgpfVxcbmA7XG5cbiAgICByZXR1cm4gdHJhaWxlcnMubGVuZ3RoID8gdGhpcy5tZXJnZVRyYWlsZXJzKG1zZywgdHJhaWxlcnMpIDogbXNnO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbGUgU3RhdHVzIGFuZCBEaWZmc1xuICAgKi9cbiAgYXN5bmMgZ2V0U3RhdHVzQnVuZGxlKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3N0YXR1cycsICctLXBvcmNlbGFpbj12MicsICctLWJyYW5jaCcsICctLXVudHJhY2tlZC1maWxlcz1hbGwnLCAnLS1pZ25vcmUtc3VibW9kdWxlcz1kaXJ0eScsICcteiddO1xuICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhhcmdzKTtcbiAgICBpZiAob3V0cHV0Lmxlbmd0aCA+IE1BWF9TVEFUVVNfT1VUUFVUX0xFTkdUSCkge1xuICAgICAgdGhyb3cgbmV3IExhcmdlUmVwb0Vycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHBhcnNlU3RhdHVzKG91dHB1dCk7XG5cbiAgICBmb3IgKGNvbnN0IGVudHJ5VHlwZSBpbiByZXN1bHRzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHRzW2VudHJ5VHlwZV0pKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTmF0aXZlUGF0aFNlcEZvckVudHJpZXMocmVzdWx0c1tlbnRyeVR5cGVdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIHVwZGF0ZU5hdGl2ZVBhdGhTZXBGb3JFbnRyaWVzKGVudHJpZXMpIHtcbiAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgLy8gTm9ybWFsbHkgd2Ugd291bGQgYXZvaWQgbXV0YXRpbmcgcmVzcG9uc2VzIGZyb20gb3RoZXIgcGFja2FnZSdzIEFQSXMsIGJ1dCB3ZSBjb250cm9sXG4gICAgICAvLyB0aGUgYHdoYXQtdGhlLXN0YXR1c2AgbW9kdWxlIGFuZCBrbm93IHRoZXJlIGFyZSBubyBzaWRlIGVmZmVjdHMuXG4gICAgICAvLyBUaGlzIGlzIGEgaG90IGNvZGUgcGF0aCBhbmQgYnkgbXV0YXRpbmcgd2UgYXZvaWQgY3JlYXRpbmcgbmV3IG9iamVjdHMgdGhhdCB3aWxsIGp1c3QgYmUgR0MnZWRcbiAgICAgIGlmIChlbnRyeS5maWxlUGF0aCkge1xuICAgICAgICBlbnRyeS5maWxlUGF0aCA9IHRvTmF0aXZlUGF0aFNlcChlbnRyeS5maWxlUGF0aCk7XG4gICAgICB9XG4gICAgICBpZiAoZW50cnkub3JpZ0ZpbGVQYXRoKSB7XG4gICAgICAgIGVudHJ5Lm9yaWdGaWxlUGF0aCA9IHRvTmF0aXZlUGF0aFNlcChlbnRyeS5vcmlnRmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlmZkZpbGVTdGF0dXMob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgYXJncyA9IFsnZGlmZicsICctLW5hbWUtc3RhdHVzJywgJy0tbm8tcmVuYW1lcyddO1xuICAgIGlmIChvcHRpb25zLnN0YWdlZCkgeyBhcmdzLnB1c2goJy0tc3RhZ2VkJyk7IH1cbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHsgYXJncy5wdXNoKG9wdGlvbnMudGFyZ2V0KTsgfVxuICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhhcmdzKTtcblxuICAgIGNvbnN0IHN0YXR1c01hcCA9IHtcbiAgICAgIEE6ICdhZGRlZCcsXG4gICAgICBNOiAnbW9kaWZpZWQnLFxuICAgICAgRDogJ2RlbGV0ZWQnLFxuICAgICAgVTogJ3VubWVyZ2VkJyxcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsZVN0YXR1c2VzID0ge307XG4gICAgb3V0cHV0ICYmIG91dHB1dC50cmltKCkuc3BsaXQoTElORV9FTkRJTkdfUkVHRVgpLmZvckVhY2gobGluZSA9PiB7XG4gICAgICBjb25zdCBbc3RhdHVzLCByYXdGaWxlUGF0aF0gPSBsaW5lLnNwbGl0KCdcXHQnKTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gdG9OYXRpdmVQYXRoU2VwKHJhd0ZpbGVQYXRoKTtcbiAgICAgIGZpbGVTdGF0dXNlc1tmaWxlUGF0aF0gPSBzdGF0dXNNYXBbc3RhdHVzXTtcbiAgICB9KTtcbiAgICBpZiAoIW9wdGlvbnMuc3RhZ2VkKSB7XG4gICAgICBjb25zdCB1bnRyYWNrZWQgPSBhd2FpdCB0aGlzLmdldFVudHJhY2tlZEZpbGVzKCk7XG4gICAgICB1bnRyYWNrZWQuZm9yRWFjaChmaWxlUGF0aCA9PiB7IGZpbGVTdGF0dXNlc1tmaWxlUGF0aF0gPSAnYWRkZWQnOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVTdGF0dXNlcztcbiAgfVxuXG4gIGFzeW5jIGdldFVudHJhY2tlZEZpbGVzKCkge1xuICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhbJ2xzLWZpbGVzJywgJy0tb3RoZXJzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCddKTtcbiAgICBpZiAob3V0cHV0LnRyaW0oKSA9PT0gJycpIHsgcmV0dXJuIFtdOyB9XG4gICAgcmV0dXJuIG91dHB1dC50cmltKCkuc3BsaXQoTElORV9FTkRJTkdfUkVHRVgpLm1hcCh0b05hdGl2ZVBhdGhTZXApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGlmZnNGb3JGaWxlUGF0aChmaWxlUGF0aCwge3N0YWdlZCwgYmFzZUNvbW1pdH0gPSB7fSkge1xuICAgIGxldCBhcmdzID0gWydkaWZmJywgJy0tbm8tcHJlZml4JywgJy0tbm8tZXh0LWRpZmYnLCAnLS1uby1yZW5hbWVzJywgJy0tZGlmZi1maWx0ZXI9dSddO1xuICAgIGlmIChzdGFnZWQpIHsgYXJncy5wdXNoKCctLXN0YWdlZCcpOyB9XG4gICAgaWYgKGJhc2VDb21taXQpIHsgYXJncy5wdXNoKGJhc2VDb21taXQpOyB9XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KFsnLS0nLCB0b0dpdFBhdGhTZXAoZmlsZVBhdGgpXSk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgdGhpcy5leGVjKGFyZ3MpO1xuXG4gICAgbGV0IHJhd0RpZmZzID0gW107XG4gICAgaWYgKG91dHB1dCkge1xuICAgICAgcmF3RGlmZnMgPSBwYXJzZURpZmYob3V0cHV0KVxuICAgICAgICAuZmlsdGVyKHJhd0RpZmYgPT4gcmF3RGlmZi5zdGF0dXMgIT09ICd1bm1lcmdlZCcpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhd0RpZmZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHJhd0RpZmYgPSByYXdEaWZmc1tpXTtcbiAgICAgICAgaWYgKHJhd0RpZmYub2xkUGF0aCkge1xuICAgICAgICAgIHJhd0RpZmYub2xkUGF0aCA9IHRvTmF0aXZlUGF0aFNlcChyYXdEaWZmLm9sZFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyYXdEaWZmLm5ld1BhdGgpIHtcbiAgICAgICAgICByYXdEaWZmLm5ld1BhdGggPSB0b05hdGl2ZVBhdGhTZXAocmF3RGlmZi5uZXdQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghc3RhZ2VkICYmIChhd2FpdCB0aGlzLmdldFVudHJhY2tlZEZpbGVzKCkpLmluY2x1ZGVzKGZpbGVQYXRoKSkge1xuICAgICAgLy8gYWRkIHVudHJhY2tlZCBmaWxlXG4gICAgICBjb25zdCBhYnNQYXRoID0gcGF0aC5qb2luKHRoaXMud29ya2luZ0RpciwgZmlsZVBhdGgpO1xuICAgICAgY29uc3QgZXhlY3V0YWJsZSA9IGF3YWl0IGlzRmlsZUV4ZWN1dGFibGUoYWJzUGF0aCk7XG4gICAgICBjb25zdCBzeW1saW5rID0gYXdhaXQgaXNGaWxlU3ltbGluayhhYnNQYXRoKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZnMucmVhZEZpbGUoYWJzUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KTtcbiAgICAgIGNvbnN0IGJpbmFyeSA9IGlzQmluYXJ5KGNvbnRlbnRzKTtcbiAgICAgIGxldCBtb2RlO1xuICAgICAgbGV0IHJlYWxwYXRoO1xuICAgICAgaWYgKGV4ZWN1dGFibGUpIHtcbiAgICAgICAgbW9kZSA9IEZpbGUubW9kZXMuRVhFQ1VUQUJMRTtcbiAgICAgIH0gZWxzZSBpZiAoc3ltbGluaykge1xuICAgICAgICBtb2RlID0gRmlsZS5tb2Rlcy5TWU1MSU5LO1xuICAgICAgICByZWFscGF0aCA9IGF3YWl0IGZzLnJlYWxwYXRoKGFic1BhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbW9kZSA9IEZpbGUubW9kZXMuTk9STUFMO1xuICAgICAgfVxuXG4gICAgICByYXdEaWZmcy5wdXNoKGJ1aWxkQWRkZWRGaWxlUGF0Y2goZmlsZVBhdGgsIGJpbmFyeSA/IG51bGwgOiBjb250ZW50cywgbW9kZSwgcmVhbHBhdGgpKTtcbiAgICB9XG4gICAgaWYgKHJhd0RpZmZzLmxlbmd0aCA+IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYmV0d2VlbiAwIGFuZCAyIGRpZmZzIGZvciAke2ZpbGVQYXRofSBidXQgZ290ICR7cmF3RGlmZnMubGVuZ3RofWApO1xuICAgIH1cbiAgICByZXR1cm4gcmF3RGlmZnM7XG4gIH1cblxuICBhc3luYyBnZXRTdGFnZWRDaGFuZ2VzUGF0Y2goKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgdGhpcy5leGVjKFtcbiAgICAgICdkaWZmJywgJy0tc3RhZ2VkJywgJy0tbm8tcHJlZml4JywgJy0tbm8tZXh0LWRpZmYnLCAnLS1uby1yZW5hbWVzJywgJy0tZGlmZi1maWx0ZXI9dScsXG4gICAgXSk7XG5cbiAgICBpZiAoIW91dHB1dCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGRpZmZzID0gcGFyc2VEaWZmKG91dHB1dCk7XG4gICAgZm9yIChjb25zdCBkaWZmIG9mIGRpZmZzKSB7XG4gICAgICBpZiAoZGlmZi5vbGRQYXRoKSB7IGRpZmYub2xkUGF0aCA9IHRvTmF0aXZlUGF0aFNlcChkaWZmLm9sZFBhdGgpOyB9XG4gICAgICBpZiAoZGlmZi5uZXdQYXRoKSB7IGRpZmYubmV3UGF0aCA9IHRvTmF0aXZlUGF0aFNlcChkaWZmLm5ld1BhdGgpOyB9XG4gICAgfVxuICAgIHJldHVybiBkaWZmcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNaXNjZWxsYW5lb3VzIGdldHRlcnNcbiAgICovXG4gIGFzeW5jIGdldENvbW1pdChyZWYpIHtcbiAgICBjb25zdCBbY29tbWl0XSA9IGF3YWl0IHRoaXMuZ2V0Q29tbWl0cyh7bWF4OiAxLCByZWYsIGluY2x1ZGVVbmJvcm46IHRydWV9KTtcbiAgICByZXR1cm4gY29tbWl0O1xuICB9XG5cbiAgYXN5bmMgZ2V0SGVhZENvbW1pdCgpIHtcbiAgICBjb25zdCBbaGVhZENvbW1pdF0gPSBhd2FpdCB0aGlzLmdldENvbW1pdHMoe21heDogMSwgcmVmOiAnSEVBRCcsIGluY2x1ZGVVbmJvcm46IHRydWV9KTtcbiAgICByZXR1cm4gaGVhZENvbW1pdDtcbiAgfVxuXG4gIGFzeW5jIGdldENvbW1pdHMob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qge21heCwgcmVmLCBpbmNsdWRlVW5ib3JuLCBpbmNsdWRlUGF0Y2h9ID0ge1xuICAgICAgbWF4OiAxLFxuICAgICAgcmVmOiAnSEVBRCcsXG4gICAgICBpbmNsdWRlVW5ib3JuOiBmYWxzZSxcbiAgICAgIGluY2x1ZGVQYXRjaDogZmFsc2UsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG5cbiAgICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWxvZyNfcHJldHR5X2Zvcm1hdHNcbiAgICAvLyAleDAwIC0gbnVsbCBieXRlXG4gICAgLy8gJUggLSBjb21taXQgU0hBXG4gICAgLy8gJWFlIC0gYXV0aG9yIGVtYWlsXG4gICAgLy8gJWFuID0gYXV0aG9yIGZ1bGwgbmFtZVxuICAgIC8vICVhdCAtIHRpbWVzdGFtcCwgVU5JWCB0aW1lc3RhbXBcbiAgICAvLyAlcyAtIHN1YmplY3RcbiAgICAvLyAlYiAtIGJvZHlcbiAgICBjb25zdCBhcmdzID0gW1xuICAgICAgJ2xvZycsXG4gICAgICAnLS1wcmV0dHk9Zm9ybWF0OiVIJXgwMCVhZSV4MDAlYW4leDAwJWF0JXgwMCVzJXgwMCViJXgwMCcsXG4gICAgICAnLS1uby1hYmJyZXYtY29tbWl0JyxcbiAgICAgICctLW5vLXByZWZpeCcsXG4gICAgICAnLS1uby1leHQtZGlmZicsXG4gICAgICAnLS1uby1yZW5hbWVzJyxcbiAgICAgICcteicsXG4gICAgICAnLW4nLFxuICAgICAgbWF4LFxuICAgICAgcmVmLFxuICAgIF07XG5cbiAgICBpZiAoaW5jbHVkZVBhdGNoKSB7XG4gICAgICBhcmdzLnB1c2goJy0tcGF0Y2gnLCAnLW0nLCAnLS1maXJzdC1wYXJlbnQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLmV4ZWMoYXJncy5jb25jYXQoJy0tJykpLmNhdGNoKGVyciA9PiB7XG4gICAgICBpZiAoL3Vua25vd24gcmV2aXNpb24vLnRlc3QoZXJyLnN0ZEVycikgfHwgL2JhZCByZXZpc2lvbiAnSEVBRCcvLnRlc3QoZXJyLnN0ZEVycikpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG91dHB1dCA9PT0gJycpIHtcbiAgICAgIHJldHVybiBpbmNsdWRlVW5ib3JuID8gW3tzaGE6ICcnLCBtZXNzYWdlOiAnJywgdW5ib3JuUmVmOiB0cnVlfV0gOiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWVsZHMgPSBvdXRwdXQudHJpbSgpLnNwbGl0KCdcXDAnKTtcblxuICAgIGNvbnN0IGNvbW1pdHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkgKz0gNykge1xuICAgICAgY29uc3QgYm9keSA9IGZpZWxkc1tpICsgNV0udHJpbSgpO1xuICAgICAgbGV0IHBhdGNoID0gW107XG4gICAgICBpZiAoaW5jbHVkZVBhdGNoKSB7XG4gICAgICAgIGNvbnN0IGRpZmZzID0gZmllbGRzW2kgKyA2XTtcbiAgICAgICAgcGF0Y2ggPSBwYXJzZURpZmYoZGlmZnMudHJpbSgpKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge21lc3NhZ2U6IG1lc3NhZ2VCb2R5LCBjb0F1dGhvcnN9ID0gZXh0cmFjdENvQXV0aG9yc0FuZFJhd0NvbW1pdE1lc3NhZ2UoYm9keSk7XG5cbiAgICAgIGNvbW1pdHMucHVzaCh7XG4gICAgICAgIHNoYTogZmllbGRzW2ldICYmIGZpZWxkc1tpXS50cmltKCksXG4gICAgICAgIGF1dGhvcjogbmV3IEF1dGhvcihmaWVsZHNbaSArIDFdICYmIGZpZWxkc1tpICsgMV0udHJpbSgpLCBmaWVsZHNbaSArIDJdICYmIGZpZWxkc1tpICsgMl0udHJpbSgpKSxcbiAgICAgICAgYXV0aG9yRGF0ZTogcGFyc2VJbnQoZmllbGRzW2kgKyAzXSwgMTApLFxuICAgICAgICBtZXNzYWdlU3ViamVjdDogZmllbGRzW2kgKyA0XSxcbiAgICAgICAgbWVzc2FnZUJvZHksXG4gICAgICAgIGNvQXV0aG9ycyxcbiAgICAgICAgdW5ib3JuUmVmOiBmYWxzZSxcbiAgICAgICAgcGF0Y2gsXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdHM7XG4gIH1cblxuICBhc3luYyBnZXRBdXRob3JzKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHttYXgsIHJlZn0gPSB7bWF4OiAxLCByZWY6ICdIRUFEJywgLi4ub3B0aW9uc307XG5cbiAgICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWxvZyNfcHJldHR5X2Zvcm1hdHNcbiAgICAvLyAleDFGIC0gZmllbGQgc2VwYXJhdG9yIGJ5dGVcbiAgICAvLyAlYW4gLSBhdXRob3IgbmFtZVxuICAgIC8vICVhZSAtIGF1dGhvciBlbWFpbFxuICAgIC8vICVjbiAtIGNvbW1pdHRlciBuYW1lXG4gICAgLy8gJWNlIC0gY29tbWl0dGVyIGVtYWlsXG4gICAgLy8gJSh0cmFpbGVyczp1bmZvbGQsb25seSkgLSB0aGUgY29tbWl0IG1lc3NhZ2UgdHJhaWxlcnMsIHNlcGFyYXRlZFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgbmV3bGluZXMgYW5kIHVuZm9sZGVkIChpLmUuIHByb3Blcmx5XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWQgYW5kIG9uZSB0cmFpbGVyIHBlciBsaW5lKS5cblxuICAgIGNvbnN0IGRlbGltaXRlciA9ICcxRic7XG4gICAgY29uc3QgZGVsaW1pdGVyU3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChkZWxpbWl0ZXIsIDE2KSk7XG4gICAgY29uc3QgZmllbGRzID0gWyclYW4nLCAnJWFlJywgJyVjbicsICclY2UnLCAnJSh0cmFpbGVyczp1bmZvbGQsb25seSknXTtcbiAgICBjb25zdCBmb3JtYXQgPSBmaWVsZHMuam9pbihgJXgke2RlbGltaXRlcn1gKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLmV4ZWMoW1xuICAgICAgICAnbG9nJywgYC0tZm9ybWF0PSR7Zm9ybWF0fWAsICcteicsICctbicsIG1heCwgcmVmLCAnLS0nLFxuICAgICAgXSk7XG5cbiAgICAgIHJldHVybiBvdXRwdXQuc3BsaXQoJ1xcMCcpXG4gICAgICAgIC5yZWR1Y2UoKGFjYywgbGluZSkgPT4ge1xuICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gYWNjOyB9XG5cbiAgICAgICAgICBjb25zdCBbYW4sIGFlLCBjbiwgY2UsIHRyYWlsZXJzXSA9IGxpbmUuc3BsaXQoZGVsaW1pdGVyU3RyaW5nKTtcbiAgICAgICAgICB0cmFpbGVyc1xuICAgICAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgLm1hcCh0cmFpbGVyID0+IHRyYWlsZXIubWF0Y2goQ09fQVVUSE9SX1JFR0VYKSlcbiAgICAgICAgICAgIC5maWx0ZXIobWF0Y2ggPT4gbWF0Y2ggIT09IG51bGwpXG4gICAgICAgICAgICAuZm9yRWFjaCgoW18sIG5hbWUsIGVtYWlsXSkgPT4geyBhY2NbZW1haWxdID0gbmFtZTsgfSk7XG5cbiAgICAgICAgICBhY2NbYWVdID0gYW47XG4gICAgICAgICAgYWNjW2NlXSA9IGNuO1xuXG4gICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKC91bmtub3duIHJldmlzaW9uLy50ZXN0KGVyci5zdGRFcnIpIHx8IC9iYWQgcmV2aXNpb24gJ0hFQUQnLy50ZXN0KGVyci5zdGRFcnIpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtZXJnZVRyYWlsZXJzKGNvbW1pdE1lc3NhZ2UsIHRyYWlsZXJzKSB7XG4gICAgY29uc3QgYXJncyA9IFsnaW50ZXJwcmV0LXRyYWlsZXJzJ107XG4gICAgZm9yIChjb25zdCB0cmFpbGVyIG9mIHRyYWlsZXJzKSB7XG4gICAgICBhcmdzLnB1c2goJy0tdHJhaWxlcicsIGAke3RyYWlsZXIudG9rZW59PSR7dHJhaWxlci52YWx1ZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhhcmdzLCB7c3RkaW46IGNvbW1pdE1lc3NhZ2V9KTtcbiAgfVxuXG4gIHJlYWRGaWxlRnJvbUluZGV4KGZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ3Nob3cnLCBgOiR7dG9HaXRQYXRoU2VwKGZpbGVQYXRoKX1gXSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VcbiAgICovXG4gIG1lcmdlKGJyYW5jaE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5ncGdFeGVjKFsnbWVyZ2UnLCBicmFuY2hOYW1lXSwge3dyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBpc01lcmdpbmcoZG90R2l0RGlyKSB7XG4gICAgcmV0dXJuIGZpbGVFeGlzdHMocGF0aC5qb2luKGRvdEdpdERpciwgJ01FUkdFX0hFQUQnKSkuY2F0Y2goKCkgPT4gZmFsc2UpO1xuICB9XG5cbiAgYWJvcnRNZXJnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjKFsnbWVyZ2UnLCAnLS1hYm9ydCddLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGNoZWNrb3V0U2lkZShzaWRlLCBwYXRocykge1xuICAgIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leGVjKFsnY2hlY2tvdXQnLCBgLS0ke3NpZGV9YCwgLi4ucGF0aHMubWFwKHRvR2l0UGF0aFNlcCldKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWJhc2VcbiAgICovXG4gIGFzeW5jIGlzUmViYXNpbmcoZG90R2l0RGlyKSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIGZpbGVFeGlzdHMocGF0aC5qb2luKGRvdEdpdERpciwgJ3JlYmFzZS1tZXJnZScpKSxcbiAgICAgIGZpbGVFeGlzdHMocGF0aC5qb2luKGRvdEdpdERpciwgJ3JlYmFzZS1hcHBseScpKSxcbiAgICBdKTtcbiAgICByZXR1cm4gcmVzdWx0cy5zb21lKHIgPT4gcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3RlIGludGVyYWN0aW9uc1xuICAgKi9cbiAgY2xvbmUocmVtb3RlVXJsLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBhcmdzID0gWydjbG9uZSddO1xuICAgIGlmIChvcHRpb25zLm5vTG9jYWwpIHsgYXJncy5wdXNoKCctLW5vLWxvY2FsJyk7IH1cbiAgICBpZiAob3B0aW9ucy5iYXJlKSB7IGFyZ3MucHVzaCgnLS1iYXJlJyk7IH1cbiAgICBpZiAob3B0aW9ucy5yZWN1cnNpdmUpIHsgYXJncy5wdXNoKCctLXJlY3Vyc2l2ZScpOyB9XG4gICAgaWYgKG9wdGlvbnMuc291cmNlUmVtb3RlTmFtZSkgeyBhcmdzLnB1c2goJy0tb3JpZ2luJywgb3B0aW9ucy5yZW1vdGVOYW1lKTsgfVxuICAgIGFyZ3MucHVzaChyZW1vdGVVcmwsIHRoaXMud29ya2luZ0Rpcik7XG5cbiAgICByZXR1cm4gdGhpcy5leGVjKGFyZ3MsIHt1c2VHaXRQcm9tcHRTZXJ2ZXI6IHRydWUsIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBmZXRjaChyZW1vdGVOYW1lLCBicmFuY2hOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ2ZldGNoJywgcmVtb3RlTmFtZSwgYnJhbmNoTmFtZV0sIHt1c2VHaXRQcm9tcHRTZXJ2ZXI6IHRydWUsIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBwdWxsKHJlbW90ZU5hbWUsIGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3B1bGwnLCByZW1vdGVOYW1lLCBvcHRpb25zLnJlZlNwZWMgfHwgYnJhbmNoTmFtZV07XG4gICAgaWYgKG9wdGlvbnMuZmZPbmx5KSB7XG4gICAgICBhcmdzLnB1c2goJy0tZmYtb25seScpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ncGdFeGVjKGFyZ3MsIHt1c2VHaXRQcm9tcHRTZXJ2ZXI6IHRydWUsIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBwdXNoKHJlbW90ZU5hbWUsIGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3B1c2gnLCByZW1vdGVOYW1lIHx8ICdvcmlnaW4nLCBvcHRpb25zLnJlZlNwZWMgfHwgYHJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdO1xuICAgIGlmIChvcHRpb25zLnNldFVwc3RyZWFtKSB7IGFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTsgfVxuICAgIGlmIChvcHRpb25zLmZvcmNlKSB7IGFyZ3MucHVzaCgnLS1mb3JjZScpOyB9XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhhcmdzLCB7dXNlR2l0UHJvbXB0U2VydmVyOiB0cnVlLCB3cml0ZU9wZXJhdGlvbjogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gT3BlcmF0aW9uc1xuICAgKi9cbiAgcmVzZXQodHlwZSwgcmV2aXNpb24gPSAnSEVBRCcpIHtcbiAgICBjb25zdCB2YWxpZFR5cGVzID0gWydzb2Z0J107XG4gICAgaWYgKCF2YWxpZFR5cGVzLmluY2x1ZGVzKHR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdHlwZSAke3R5cGV9LiBNdXN0IGJlIG9uZSBvZjogJHt2YWxpZFR5cGVzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWMoWydyZXNldCcsIGAtLSR7dHlwZX1gLCByZXZpc2lvbl0pO1xuICB9XG5cbiAgZGVsZXRlUmVmKHJlZikge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoWyd1cGRhdGUtcmVmJywgJy1kJywgcmVmXSk7XG4gIH1cblxuICAvKipcbiAgICogQnJhbmNoZXNcbiAgICovXG4gIGNoZWNrb3V0KGJyYW5jaE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ2NoZWNrb3V0J107XG4gICAgaWYgKG9wdGlvbnMuY3JlYXRlTmV3KSB7XG4gICAgICBhcmdzLnB1c2goJy1iJyk7XG4gICAgfVxuICAgIGFyZ3MucHVzaChicmFuY2hOYW1lKTtcbiAgICBpZiAob3B0aW9ucy5zdGFydFBvaW50KSB7XG4gICAgICBpZiAob3B0aW9ucy50cmFjaykgeyBhcmdzLnB1c2goJy0tdHJhY2snKTsgfVxuICAgICAgYXJncy5wdXNoKG9wdGlvbnMuc3RhcnRQb2ludCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlYyhhcmdzLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGFzeW5jIGdldEJyYW5jaGVzKCkge1xuICAgIGNvbnN0IGZvcm1hdCA9IFtcbiAgICAgICclKG9iamVjdG5hbWUpJywgJyUoSEVBRCknLCAnJShyZWZuYW1lOnNob3J0KScsXG4gICAgICAnJSh1cHN0cmVhbSknLCAnJSh1cHN0cmVhbTpyZW1vdGVuYW1lKScsICclKHVwc3RyZWFtOnJlbW90ZXJlZiknLFxuICAgICAgJyUocHVzaCknLCAnJShwdXNoOnJlbW90ZW5hbWUpJywgJyUocHVzaDpyZW1vdGVyZWYpJyxcbiAgICBdLmpvaW4oJyUwMCcpO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgdGhpcy5leGVjKFsnZm9yLWVhY2gtcmVmJywgYC0tZm9ybWF0PSR7Zm9ybWF0fWAsICdyZWZzL2hlYWRzLyoqJ10pO1xuICAgIHJldHVybiBvdXRwdXQudHJpbSgpLnNwbGl0KExJTkVfRU5ESU5HX1JFR0VYKS5tYXAobGluZSA9PiB7XG4gICAgICBjb25zdCBbXG4gICAgICAgIHNoYSwgaGVhZCwgbmFtZSxcbiAgICAgICAgdXBzdHJlYW1UcmFja2luZ1JlZiwgdXBzdHJlYW1SZW1vdGVOYW1lLCB1cHN0cmVhbVJlbW90ZVJlZixcbiAgICAgICAgcHVzaFRyYWNraW5nUmVmLCBwdXNoUmVtb3RlTmFtZSwgcHVzaFJlbW90ZVJlZixcbiAgICAgIF0gPSBsaW5lLnNwbGl0KCdcXDAnKTtcblxuICAgICAgY29uc3QgYnJhbmNoID0ge25hbWUsIHNoYSwgaGVhZDogaGVhZCA9PT0gJyonfTtcbiAgICAgIGlmICh1cHN0cmVhbVRyYWNraW5nUmVmIHx8IHVwc3RyZWFtUmVtb3RlTmFtZSB8fCB1cHN0cmVhbVJlbW90ZVJlZikge1xuICAgICAgICBicmFuY2gudXBzdHJlYW0gPSB7XG4gICAgICAgICAgdHJhY2tpbmdSZWY6IHVwc3RyZWFtVHJhY2tpbmdSZWYsXG4gICAgICAgICAgcmVtb3RlTmFtZTogdXBzdHJlYW1SZW1vdGVOYW1lLFxuICAgICAgICAgIHJlbW90ZVJlZjogdXBzdHJlYW1SZW1vdGVSZWYsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoYnJhbmNoLnVwc3RyZWFtIHx8IHB1c2hUcmFja2luZ1JlZiB8fCBwdXNoUmVtb3RlTmFtZSB8fCBwdXNoUmVtb3RlUmVmKSB7XG4gICAgICAgIGJyYW5jaC5wdXNoID0ge1xuICAgICAgICAgIHRyYWNraW5nUmVmOiBwdXNoVHJhY2tpbmdSZWYsXG4gICAgICAgICAgcmVtb3RlTmFtZTogcHVzaFJlbW90ZU5hbWUgfHwgKGJyYW5jaC51cHN0cmVhbSAmJiBicmFuY2gudXBzdHJlYW0ucmVtb3RlTmFtZSksXG4gICAgICAgICAgcmVtb3RlUmVmOiBwdXNoUmVtb3RlUmVmIHx8IChicmFuY2gudXBzdHJlYW0gJiYgYnJhbmNoLnVwc3RyZWFtLnJlbW90ZVJlZiksXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYnJhbmNoO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZ2V0QnJhbmNoZXNXaXRoQ29tbWl0KHNoYSwgb3B0aW9uID0ge30pIHtcbiAgICBjb25zdCBhcmdzID0gWydicmFuY2gnLCAnLS1mb3JtYXQ9JShyZWZuYW1lKScsICctLWNvbnRhaW5zJywgc2hhXTtcbiAgICBpZiAob3B0aW9uLnNob3dMb2NhbCAmJiBvcHRpb24uc2hvd1JlbW90ZSkge1xuICAgICAgYXJncy5zcGxpY2UoMSwgMCwgJy0tYWxsJyk7XG4gICAgfSBlbHNlIGlmIChvcHRpb24uc2hvd1JlbW90ZSkge1xuICAgICAgYXJncy5zcGxpY2UoMSwgMCwgJy0tcmVtb3RlcycpO1xuICAgIH1cbiAgICBpZiAob3B0aW9uLnBhdHRlcm4pIHtcbiAgICAgIGFyZ3MucHVzaChvcHRpb24ucGF0dGVybik7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5leGVjKGFyZ3MpKS50cmltKCkuc3BsaXQoTElORV9FTkRJTkdfUkVHRVgpO1xuICB9XG5cbiAgY2hlY2tvdXRGaWxlcyhwYXRocywgcmV2aXNpb24pIHtcbiAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG4gICAgY29uc3QgYXJncyA9IFsnY2hlY2tvdXQnXTtcbiAgICBpZiAocmV2aXNpb24pIHsgYXJncy5wdXNoKHJldmlzaW9uKTsgfVxuICAgIHJldHVybiB0aGlzLmV4ZWMoYXJncy5jb25jYXQoJy0tJywgcGF0aHMubWFwKHRvR2l0UGF0aFNlcCkpLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGFzeW5jIGRlc2NyaWJlSGVhZCgpIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZXhlYyhbJ2Rlc2NyaWJlJywgJy0tY29udGFpbnMnLCAnLS1hbGwnLCAnLS1hbHdheXMnLCAnSEVBRCddKSkudHJpbSgpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29uZmlnKG9wdGlvbiwge2xvY2FsfSA9IHt9KSB7XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgbGV0IGFyZ3MgPSBbJ2NvbmZpZyddO1xuICAgICAgaWYgKGxvY2FsKSB7IGFyZ3MucHVzaCgnLS1sb2NhbCcpOyB9XG4gICAgICBhcmdzID0gYXJncy5jb25jYXQob3B0aW9uKTtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhhcmdzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIuY29kZSA9PT0gMSB8fCBlcnIuY29kZSA9PT0gMTI4KSB7XG4gICAgICAgIC8vIE5vIG1hdGNoaW5nIGNvbmZpZyBmb3VuZCBPUiAtLWxvY2FsIGNhbiBvbmx5IGJlIHVzZWQgaW5zaWRlIGEgZ2l0IHJlcG9zaXRvcnlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dC50cmltKCk7XG4gIH1cblxuICBzZXRDb25maWcob3B0aW9uLCB2YWx1ZSwge3JlcGxhY2VBbGwsIGdsb2JhbH0gPSB7fSkge1xuICAgIGxldCBhcmdzID0gWydjb25maWcnXTtcbiAgICBpZiAocmVwbGFjZUFsbCkgeyBhcmdzLnB1c2goJy0tcmVwbGFjZS1hbGwnKTsgfVxuICAgIGlmIChnbG9iYWwpIHsgYXJncy5wdXNoKCctLWdsb2JhbCcpOyB9XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KG9wdGlvbiwgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmV4ZWMoYXJncywge3dyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICB1bnNldENvbmZpZyhvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjKFsnY29uZmlnJywgJy0tdW5zZXQnLCBvcHRpb25dLCB7d3JpdGVPcGVyYXRpb246IHRydWV9KTtcbiAgfVxuXG4gIGFzeW5jIGdldFJlbW90ZXMoKSB7XG4gICAgbGV0IG91dHB1dCA9IGF3YWl0IHRoaXMuZ2V0Q29uZmlnKFsnLS1nZXQtcmVnZXhwJywgJ15yZW1vdGVcXFxcLi4qXFxcXC51cmwkJ10sIHtsb2NhbDogdHJ1ZX0pO1xuICAgIGlmIChvdXRwdXQpIHtcbiAgICAgIG91dHB1dCA9IG91dHB1dC50cmltKCk7XG4gICAgICBpZiAoIW91dHB1dC5sZW5ndGgpIHsgcmV0dXJuIFtdOyB9XG4gICAgICByZXR1cm4gb3V0cHV0LnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCgvXnJlbW90ZVxcLiguKilcXC51cmwgKC4qKSQvKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBtYXRjaFsxXSxcbiAgICAgICAgICB1cmw6IG1hdGNoWzJdLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBhZGRSZW1vdGUobmFtZSwgdXJsKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ3JlbW90ZScsICdhZGQnLCBuYW1lLCB1cmxdKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUJsb2Ioe2ZpbGVQYXRoLCBzdGRpbn0gPSB7fSkge1xuICAgIGxldCBvdXRwdXQ7XG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBvdXRwdXQgPSAoYXdhaXQgdGhpcy5leGVjKFsnaGFzaC1vYmplY3QnLCAnLXcnLCBmaWxlUGF0aF0sIHt3cml0ZU9wZXJhdGlvbjogdHJ1ZX0pKS50cmltKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLnN0ZEVyciAmJiBlLnN0ZEVyci5tYXRjaCgvZmF0YWw6IENhbm5vdCBvcGVuIC4qOiBObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5LykpIHtcbiAgICAgICAgICBvdXRwdXQgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN0ZGluKSB7XG4gICAgICBvdXRwdXQgPSAoYXdhaXQgdGhpcy5leGVjKFsnaGFzaC1vYmplY3QnLCAnLXcnLCAnLS1zdGRpbiddLCB7c3RkaW4sIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSkpLnRyaW0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN1cHBseSBmaWxlIHBhdGggb3Igc3RkaW4nKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGFzeW5jIGV4cGFuZEJsb2JUb0ZpbGUoYWJzRmlsZVBhdGgsIHNoYSkge1xuICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhbJ2NhdC1maWxlJywgJy1wJywgc2hhXSk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKGFic0ZpbGVQYXRoLCBvdXRwdXQsIHtlbmNvZGluZzogJ3V0ZjgnfSk7XG4gICAgcmV0dXJuIGFic0ZpbGVQYXRoO1xuICB9XG5cbiAgYXN5bmMgZ2V0QmxvYkNvbnRlbnRzKHNoYSkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmV4ZWMoWydjYXQtZmlsZScsICctcCcsIHNoYV0pO1xuICB9XG5cbiAgYXN5bmMgbWVyZ2VGaWxlKG91cnNQYXRoLCBjb21tb25CYXNlUGF0aCwgdGhlaXJzUGF0aCwgcmVzdWx0UGF0aCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAnbWVyZ2UtZmlsZScsICctcCcsIG91cnNQYXRoLCBjb21tb25CYXNlUGF0aCwgdGhlaXJzUGF0aCxcbiAgICAgICctTCcsICdjdXJyZW50JywgJy1MJywgJ2FmdGVyIGRpc2NhcmQnLCAnLUwnLCAnYmVmb3JlIGRpc2NhcmQnLFxuICAgIF07XG4gICAgbGV0IG91dHB1dDtcbiAgICBsZXQgY29uZmxpY3QgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5leGVjKGFyZ3MpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0RXJyb3IgJiYgZS5jb2RlID09PSAxKSB7XG4gICAgICAgIG91dHB1dCA9IGUuc3RkT3V0O1xuICAgICAgICBjb25mbGljdCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludGVycHJldCBhIHJlbGF0aXZlIHJlc3VsdFBhdGggYXMgcmVsYXRpdmUgdG8gdGhlIHJlcG9zaXRvcnkgd29ya2luZyBkaXJlY3RvcnkgZm9yIGNvbnNpc3RlbmN5IHdpdGggdGhlXG4gICAgLy8gb3RoZXIgYXJndW1lbnRzLlxuICAgIGNvbnN0IHJlc29sdmVkUmVzdWx0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndvcmtpbmdEaXIsIHJlc3VsdFBhdGgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShyZXNvbHZlZFJlc3VsdFBhdGgsIG91dHB1dCwge2VuY29kaW5nOiAndXRmOCd9KTtcblxuICAgIHJldHVybiB7ZmlsZVBhdGg6IG91cnNQYXRoLCByZXN1bHRQYXRoLCBjb25mbGljdH07XG4gIH1cblxuICBhc3luYyB3cml0ZU1lcmdlQ29uZmxpY3RUb0luZGV4KGZpbGVQYXRoLCBjb21tb25CYXNlU2hhLCBvdXJzU2hhLCB0aGVpcnNTaGEpIHtcbiAgICBjb25zdCBnaXRGaWxlUGF0aCA9IHRvR2l0UGF0aFNlcChmaWxlUGF0aCk7XG4gICAgY29uc3QgZmlsZU1vZGUgPSBhd2FpdCB0aGlzLmdldEZpbGVNb2RlKGZpbGVQYXRoKTtcbiAgICBsZXQgaW5kZXhJbmZvID0gYDAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFxcdCR7Z2l0RmlsZVBhdGh9XFxuYDtcbiAgICBpZiAoY29tbW9uQmFzZVNoYSkgeyBpbmRleEluZm8gKz0gYCR7ZmlsZU1vZGV9ICR7Y29tbW9uQmFzZVNoYX0gMVxcdCR7Z2l0RmlsZVBhdGh9XFxuYDsgfVxuICAgIGlmIChvdXJzU2hhKSB7IGluZGV4SW5mbyArPSBgJHtmaWxlTW9kZX0gJHtvdXJzU2hhfSAyXFx0JHtnaXRGaWxlUGF0aH1cXG5gOyB9XG4gICAgaWYgKHRoZWlyc1NoYSkgeyBpbmRleEluZm8gKz0gYCR7ZmlsZU1vZGV9ICR7dGhlaXJzU2hhfSAzXFx0JHtnaXRGaWxlUGF0aH1cXG5gOyB9XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhbJ3VwZGF0ZS1pbmRleCcsICctLWluZGV4LWluZm8nXSwge3N0ZGluOiBpbmRleEluZm8sIHdyaXRlT3BlcmF0aW9uOiB0cnVlfSk7XG4gIH1cblxuICBhc3luYyBnZXRGaWxlTW9kZShmaWxlUGF0aCkge1xuICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuZXhlYyhbJ2xzLWZpbGVzJywgJy0tc3RhZ2UnLCAnLS0nLCB0b0dpdFBhdGhTZXAoZmlsZVBhdGgpXSk7XG4gICAgaWYgKG91dHB1dCkge1xuICAgICAgcmV0dXJuIG91dHB1dC5zbGljZSgwLCA2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhlY3V0YWJsZSA9IGF3YWl0IGlzRmlsZUV4ZWN1dGFibGUocGF0aC5qb2luKHRoaXMud29ya2luZ0RpciwgZmlsZVBhdGgpKTtcbiAgICAgIGNvbnN0IHN5bWxpbmsgPSBhd2FpdCBpc0ZpbGVTeW1saW5rKHBhdGguam9pbih0aGlzLndvcmtpbmdEaXIsIGZpbGVQYXRoKSk7XG4gICAgICBpZiAoc3ltbGluaykge1xuICAgICAgICByZXR1cm4gRmlsZS5tb2Rlcy5TWU1MSU5LO1xuICAgICAgfSBlbHNlIGlmIChleGVjdXRhYmxlKSB7XG4gICAgICAgIHJldHVybiBGaWxlLm1vZGVzLkVYRUNVVEFCTEU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRmlsZS5tb2Rlcy5OT1JNQUw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNvbW1hbmRRdWV1ZS5kaXNwb3NlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRBZGRlZEZpbGVQYXRjaChmaWxlUGF0aCwgY29udGVudHMsIG1vZGUsIHJlYWxwYXRoKSB7XG4gIGNvbnN0IGh1bmtzID0gW107XG4gIGlmIChjb250ZW50cykge1xuICAgIGxldCBub05ld0xpbmU7XG4gICAgbGV0IGxpbmVzO1xuICAgIGlmIChtb2RlID09PSBGaWxlLm1vZGVzLlNZTUxJTkspIHtcbiAgICAgIG5vTmV3TGluZSA9IGZhbHNlO1xuICAgICAgbGluZXMgPSBbYCske3RvR2l0UGF0aFNlcChyZWFscGF0aCl9YCwgJ1xcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZSddO1xuICAgIH0gZWxzZSB7XG4gICAgICBub05ld0xpbmUgPSBjb250ZW50c1tjb250ZW50cy5sZW5ndGggLSAxXSAhPT0gJ1xcbic7XG4gICAgICBsaW5lcyA9IGNvbnRlbnRzLnRyaW0oKS5zcGxpdChMSU5FX0VORElOR19SRUdFWCkubWFwKGxpbmUgPT4gYCske2xpbmV9YCk7XG4gICAgfVxuICAgIGlmIChub05ld0xpbmUpIHsgbGluZXMucHVzaCgnXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlJyk7IH1cbiAgICBodW5rcy5wdXNoKHtcbiAgICAgIGxpbmVzLFxuICAgICAgb2xkU3RhcnRMaW5lOiAwLFxuICAgICAgb2xkTGluZUNvdW50OiAwLFxuICAgICAgbmV3U3RhcnRMaW5lOiAxLFxuICAgICAgaGVhZGluZzogJycsXG4gICAgICBuZXdMaW5lQ291bnQ6IG5vTmV3TGluZSA/IGxpbmVzLmxlbmd0aCAtIDEgOiBsaW5lcy5sZW5ndGgsXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBvbGRQYXRoOiBudWxsLFxuICAgIG5ld1BhdGg6IHRvTmF0aXZlUGF0aFNlcChmaWxlUGF0aCksXG4gICAgb2xkTW9kZTogbnVsbCxcbiAgICBuZXdNb2RlOiBtb2RlLFxuICAgIHN0YXR1czogJ2FkZGVkJyxcbiAgICBodW5rcyxcbiAgfTtcbn1cbiJdfQ==