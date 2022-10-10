"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autobind = autobind;
exports.extractProps = extractProps;
exports.unusedProps = unusedProps;
exports.getPackageRoot = getPackageRoot;
exports.getAtomHelperPath = getAtomHelperPath;
exports.getDugitePath = getDugitePath;
exports.getSharedModulePath = getSharedModulePath;
exports.isBinary = isBinary;
exports.firstImplementer = firstImplementer;
exports.isValidWorkdir = isValidWorkdir;
exports.fileExists = fileExists;
exports.getTempDir = getTempDir;
exports.isFileExecutable = isFileExecutable;
exports.isFileSymlink = isFileSymlink;
exports.shortenSha = shortenSha;
exports.normalizeGitHelperPath = normalizeGitHelperPath;
exports.toNativePathSep = toNativePathSep;
exports.toGitPathSep = toGitPathSep;
exports.filePathEndsWith = filePathEndsWith;
exports.toSentence = toSentence;
exports.pushAtKey = pushAtKey;
exports.getCommitMessagePath = getCommitMessagePath;
exports.getCommitMessageEditors = getCommitMessageEditors;
exports.getFilePatchPaneItems = getFilePatchPaneItems;
exports.destroyFilePatchPaneItems = destroyFilePatchPaneItems;
exports.destroyEmptyFilePatchPaneItems = destroyEmptyFilePatchPaneItems;
exports.extractCoAuthorsAndRawCommitMessage = extractCoAuthorsAndRawCommitMessage;
exports.createItem = createItem;
exports.equalSets = equalSets;
exports.blankLabel = blankLabel;
exports.renderMarkdown = renderMarkdown;
exports.GHOST_USER = exports.reactionTypeToEmoji = exports.NBSP_CHARACTER = exports.classNameForStatus = exports.CHECK_RUN_PAGE_SIZE = exports.CHECK_SUITE_PAGE_SIZE = exports.PAGINATION_WAIT_TIME_MS = exports.PAGE_SIZE = exports.CO_AUTHOR_REGEX = exports.LINE_ENDING_REGEX = void 0;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _os = _interopRequireDefault(require("os"));

var _temp = _interopRequireDefault(require("temp"));

var _refHolder = _interopRequireDefault(require("./models/ref-holder"));

var _author = _interopRequireDefault(require("./models/author"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const LINE_ENDING_REGEX = /\r?\n/;
exports.LINE_ENDING_REGEX = LINE_ENDING_REGEX;
const CO_AUTHOR_REGEX = /^co-authored-by. (.+?) <(.+?)>$/i;
exports.CO_AUTHOR_REGEX = CO_AUTHOR_REGEX;
const PAGE_SIZE = 50;
exports.PAGE_SIZE = PAGE_SIZE;
const PAGINATION_WAIT_TIME_MS = 100;
exports.PAGINATION_WAIT_TIME_MS = PAGINATION_WAIT_TIME_MS;
const CHECK_SUITE_PAGE_SIZE = 10;
exports.CHECK_SUITE_PAGE_SIZE = CHECK_SUITE_PAGE_SIZE;
const CHECK_RUN_PAGE_SIZE = 20;
exports.CHECK_RUN_PAGE_SIZE = CHECK_RUN_PAGE_SIZE;

function autobind(self, ...methods) {
  for (const method of methods) {
    if (typeof self[method] !== 'function') {
      throw new Error(`Unable to autobind method ${method}`);
    }

    self[method] = self[method].bind(self);
  }
} // Extract a subset of props chosen from a propTypes object from a component's props to pass to a different API.
//
// Usage:
//
// ```js
// const apiProps = {
//   zero: PropTypes.number.isRequired,
//   one: PropTypes.string,
//   two: PropTypes.object,
// };
//
// class Component extends React.Component {
//   static propTypes = {
//     ...apiProps,
//     extra: PropTypes.func,
//   }
//
//   action() {
//     const options = extractProps(this.props, apiProps);
//     // options contains zero, one, and two, but not extra
//   }
// }
// ```


function extractProps(props, propTypes, nameMap = {}) {
  return Object.keys(propTypes).reduce((opts, propName) => {
    if (props[propName] !== undefined) {
      const destPropName = nameMap[propName] || propName;
      opts[destPropName] = props[propName];
    }

    return opts;
  }, {});
} // The opposite of extractProps. Return a subset of props that do *not* appear in a component's prop types.


function unusedProps(props, propTypes) {
  return Object.keys(props).reduce((opts, propName) => {
    if (propTypes[propName] === undefined) {
      opts[propName] = props[propName];
    }

    return opts;
  }, {});
}

function getPackageRoot() {
  const {
    resourcePath
  } = atom.getLoadSettings();
  const currentFileWasRequiredFromSnapshot = !_path.default.isAbsolute(__dirname);

  if (currentFileWasRequiredFromSnapshot) {
    return _path.default.join(resourcePath, 'node_modules', 'github');
  } else {
    const packageRoot = _path.default.resolve(__dirname, '..');

    if (_path.default.extname(resourcePath) === '.asar') {
      if (packageRoot.indexOf(resourcePath) === 0) {
        return _path.default.join(`${resourcePath}.unpacked`, 'node_modules', 'github');
      }
    }

    return packageRoot;
  }
}

function getAtomAppName() {
  const match = atom.getVersion().match(/-([A-Za-z]+)(\d+|-)/);

  if (match) {
    const channel = match[1];
    return `Atom ${channel.charAt(0).toUpperCase() + channel.slice(1)} Helper`;
  }

  return 'Atom Helper';
}

function getAtomHelperPath() {
  if (process.platform === 'darwin') {
    const appName = getAtomAppName();
    return _path.default.resolve(process.resourcesPath, '..', 'Frameworks', `${appName}.app`, 'Contents', 'MacOS', appName);
  } else {
    return process.execPath;
  }
}

let DUGITE_PATH;

function getDugitePath() {
  if (!DUGITE_PATH) {
    DUGITE_PATH = require.resolve('dugite');

    if (!_path.default.isAbsolute(DUGITE_PATH)) {
      // Assume we're snapshotted
      const {
        resourcePath
      } = atom.getLoadSettings();

      if (_path.default.extname(resourcePath) === '.asar') {
        DUGITE_PATH = _path.default.join(`${resourcePath}.unpacked`, 'node_modules', 'dugite');
      } else {
        DUGITE_PATH = _path.default.join(resourcePath, 'node_modules', 'dugite');
      }
    }
  }

  return DUGITE_PATH;
}

const SHARED_MODULE_PATHS = new Map();

function getSharedModulePath(relPath) {
  let modulePath = SHARED_MODULE_PATHS.get(relPath);

  if (!modulePath) {
    modulePath = require.resolve(_path.default.join(__dirname, 'shared', relPath));

    if (!_path.default.isAbsolute(modulePath)) {
      // Assume we're snapshotted
      const {
        resourcePath
      } = atom.getLoadSettings();
      modulePath = _path.default.join(resourcePath, modulePath);
    }

    SHARED_MODULE_PATHS.set(relPath, modulePath);
  }

  return modulePath;
}

function isBinary(data) {
  for (let i = 0; i < 50; i++) {
    const code = data.charCodeAt(i); // Char code 65533 is the "replacement character";
    // 8 and below are control characters.

    if (code === 65533 || code < 9) {
      return true;
    }
  }

  return false;
}

function descriptorsFromProto(proto) {
  return Object.getOwnPropertyNames(proto).reduce((acc, name) => {
    Object.assign(acc, {
      [name]: Reflect.getOwnPropertyDescriptor(proto, name)
    });
    return acc;
  }, {});
}
/**
 * Takes an array of targets and returns a proxy. The proxy intercepts property accessor calls and
 * returns the value of that property on the first object in `targets` where the target implements that property.
 */


function firstImplementer(...targets) {
  return new Proxy({
    __implementations: targets
  }, {
    get(target, name) {
      if (name === 'getImplementers') {
        return () => targets;
      }

      if (Reflect.has(target, name)) {
        return target[name];
      }

      const firstValidTarget = targets.find(t => Reflect.has(t, name));

      if (firstValidTarget) {
        return firstValidTarget[name];
      } else {
        return undefined;
      }
    },

    set(target, name, value) {
      const firstValidTarget = targets.find(t => Reflect.has(t, name));

      if (firstValidTarget) {
        // eslint-disable-next-line no-return-assign
        return firstValidTarget[name] = value;
      } else {
        // eslint-disable-next-line no-return-assign
        return target[name] = value;
      }
    },

    // Used by sinon
    has(target, name) {
      if (name === 'getImplementers') {
        return true;
      }

      return targets.some(t => Reflect.has(t, name));
    },

    // Used by sinon
    getOwnPropertyDescriptor(target, name) {
      const firstValidTarget = targets.find(t => Reflect.getOwnPropertyDescriptor(t, name));
      const compositeOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor(target, name);

      if (firstValidTarget) {
        return Reflect.getOwnPropertyDescriptor(firstValidTarget, name);
      } else if (compositeOwnPropertyDescriptor) {
        return compositeOwnPropertyDescriptor;
      } else {
        return undefined;
      }
    },

    // Used by sinon
    getPrototypeOf(target) {
      return targets.reduceRight((acc, t) => {
        return Object.create(acc, descriptorsFromProto(Object.getPrototypeOf(t)));
      }, Object.prototype);
    }

  });
}

function isRoot(dir) {
  return _path.default.resolve(dir, '..') === dir;
}

function isValidWorkdir(dir) {
  return dir !== _os.default.homedir() && !isRoot(dir);
}

async function fileExists(absoluteFilePath) {
  try {
    await _fsExtra.default.access(absoluteFilePath);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }

    throw e;
  }
}

function getTempDir(options = {}) {
  _temp.default.track();

  return new Promise((resolve, reject) => {
    _temp.default.mkdir(options, (tempError, folder) => {
      if (tempError) {
        reject(tempError);
        return;
      }

      if (options.symlinkOk) {
        resolve(folder);
      } else {
        _fsExtra.default.realpath(folder, (realError, rpath) => realError ? reject(realError) : resolve(rpath));
      }
    });
  });
}

async function isFileExecutable(absoluteFilePath) {
  const stat = await _fsExtra.default.stat(absoluteFilePath);
  return stat.mode & _fsExtra.default.constants.S_IXUSR; // eslint-disable-line no-bitwise
}

async function isFileSymlink(absoluteFilePath) {
  const stat = await _fsExtra.default.lstat(absoluteFilePath);
  return stat.isSymbolicLink();
}

function shortenSha(sha) {
  return sha.slice(0, 8);
}

const classNameForStatus = {
  added: 'added',
  deleted: 'removed',
  modified: 'modified',
  typechange: 'modified',
  equivalent: 'ignored'
};
/*
 * Apply any platform-specific munging to a path before presenting it as
 * a git environment variable or option.
 *
 * Convert a Windows-style "C:\foo\bar\baz" path to a "/c/foo/bar/baz" UNIX-y
 * path that the sh.exe used to execute git's credential helpers will
 * understand.
 */

exports.classNameForStatus = classNameForStatus;

function normalizeGitHelperPath(inPath) {
  if (process.platform === 'win32') {
    return inPath.replace(/\\/g, '/').replace(/^([^:]+):/, '/$1');
  } else {
    return inPath;
  }
}
/*
 * On Windows, git commands report paths with / delimiters. Convert them to \-delimited paths
 * so that Atom unifromly treats paths with native path separators.
 */


function toNativePathSep(rawPath) {
  if (process.platform !== 'win32') {
    return rawPath;
  } else {
    return rawPath.split('/').join(_path.default.sep);
  }
}
/*
 * Convert Windows paths back to /-delimited paths to be presented to git.
 */


function toGitPathSep(rawPath) {
  if (process.platform !== 'win32') {
    return rawPath;
  } else {
    return rawPath.split(_path.default.sep).join('/');
  }
}

function filePathEndsWith(filePath, ...segments) {
  return filePath.endsWith(_path.default.join(...segments));
}
/**
 * Turns an array of things @kuychaco cannot eat
 * into a sentence containing things @kuychaco cannot eat
 *
 * ['toast'] => 'toast'
 * ['toast', 'eggs'] => 'toast and eggs'
 * ['toast', 'eggs', 'cheese'] => 'toast, eggs, and cheese'
 *
 * Oxford comma included because you're wrong, shut up.
 */


function toSentence(array) {
  const len = array.length;

  if (len === 1) {
    return `${array[0]}`;
  } else if (len === 2) {
    return `${array[0]} and ${array[1]}`;
  }

  return array.reduce((acc, item, idx) => {
    if (idx === 0) {
      return `${item}`;
    } else if (idx === len - 1) {
      return `${acc}, and ${item}`;
    } else {
      return `${acc}, ${item}`;
    }
  }, '');
}

function pushAtKey(map, key, value) {
  let existing = map.get(key);

  if (!existing) {
    existing = [];
    map.set(key, existing);
  }

  existing.push(value);
} // Repository and workspace helpers


function getCommitMessagePath(repository) {
  return _path.default.join(repository.getGitDirectoryPath(), 'ATOM_COMMIT_EDITMSG');
}

function getCommitMessageEditors(repository, workspace) {
  if (!repository.isPresent()) {
    return [];
  }

  return workspace.getTextEditors().filter(editor => editor.getPath() === getCommitMessagePath(repository));
}

let ChangedFileItem = null;

function getFilePatchPaneItems({
  onlyStaged,
  empty
} = {}, workspace) {
  if (ChangedFileItem === null) {
    ChangedFileItem = require('./items/changed-file-item').default;
  }

  return workspace.getPaneItems().filter(item => {
    const isFilePatchItem = item && item.getRealItem && item.getRealItem() instanceof ChangedFileItem;

    if (onlyStaged) {
      return isFilePatchItem && item.stagingStatus === 'staged';
    } else if (empty) {
      return isFilePatchItem ? item.isEmpty() : false;
    } else {
      return isFilePatchItem;
    }
  });
}

function destroyFilePatchPaneItems({
  onlyStaged
} = {}, workspace) {
  const itemsToDestroy = getFilePatchPaneItems({
    onlyStaged
  }, workspace);
  itemsToDestroy.forEach(item => item.destroy());
}

function destroyEmptyFilePatchPaneItems(workspace) {
  const itemsToDestroy = getFilePatchPaneItems({
    empty: true
  }, workspace);
  itemsToDestroy.forEach(item => item.destroy());
}

function extractCoAuthorsAndRawCommitMessage(commitMessage) {
  const messageLines = [];
  const coAuthors = [];

  for (const line of commitMessage.split(LINE_ENDING_REGEX)) {
    const match = line.match(CO_AUTHOR_REGEX);

    if (match) {
      // eslint-disable-next-line no-unused-vars
      const [_, name, email] = match;
      coAuthors.push(new _author.default(email, name));
    } else {
      messageLines.push(line);
    }
  }

  return {
    message: messageLines.join('\n'),
    coAuthors
  };
} // Atom API pane item manipulation


function createItem(node, componentHolder = null, uri = null, extra = {}) {
  const holder = componentHolder || new _refHolder.default();

  const override = _objectSpread2({
    getElement: () => node,
    getRealItem: () => holder.getOr(null),
    getRealItemPromise: () => holder.getPromise()
  }, extra);

  if (uri) {
    override.getURI = () => uri;
  }

  if (componentHolder) {
    return new Proxy(override, {
      get(target, name) {
        if (Reflect.has(target, name)) {
          return target[name];
        } // The {value: ...} wrapper prevents .map() from flattening a returned RefHolder.
        // If component[name] is a RefHolder, we want to return that RefHolder as-is.


        const {
          value
        } = holder.map(component => ({
          value: component[name]
        })).getOr({
          value: undefined
        });
        return value;
      },

      set(target, name, value) {
        return holder.map(component => {
          component[name] = value;
          return true;
        }).getOr(true);
      },

      has(target, name) {
        return holder.map(component => Reflect.has(component, name)).getOr(false) || Reflect.has(target, name);
      }

    });
  } else {
    return override;
  }
} // Set functions


function equalSets(left, right) {
  if (left.size !== right.size) {
    return false;
  }

  for (const each of left) {
    if (!right.has(each)) {
      return false;
    }
  }

  return true;
} // Constants


const NBSP_CHARACTER = '\u00a0';
exports.NBSP_CHARACTER = NBSP_CHARACTER;

function blankLabel() {
  return NBSP_CHARACTER;
}

const reactionTypeToEmoji = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  LAUGH: '😆',
  HOORAY: '🎉',
  CONFUSED: '😕',
  HEART: '❤️',
  ROCKET: '🚀',
  EYES: '👀'
}; // Markdown

exports.reactionTypeToEmoji = reactionTypeToEmoji;
let marked = null;
let domPurify = null;

function renderMarkdown(md) {
  if (marked === null) {
    marked = require('marked');

    if (domPurify === null) {
      const createDOMPurify = require('dompurify');

      domPurify = createDOMPurify();
    }

    marked.setOptions({
      silent: true,
      sanitize: true,
      sanitizer: html => domPurify.sanitize(html)
    });
  }

  return marked(md);
}

const GHOST_USER = {
  login: 'ghost',
  avatarUrl: 'https://avatars1.githubusercontent.com/u/10137?v=4',
  url: 'https://github.com/ghost'
};
exports.GHOST_USER = GHOST_USER;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbIkxJTkVfRU5ESU5HX1JFR0VYIiwiQ09fQVVUSE9SX1JFR0VYIiwiUEFHRV9TSVpFIiwiUEFHSU5BVElPTl9XQUlUX1RJTUVfTVMiLCJDSEVDS19TVUlURV9QQUdFX1NJWkUiLCJDSEVDS19SVU5fUEFHRV9TSVpFIiwiYXV0b2JpbmQiLCJzZWxmIiwibWV0aG9kcyIsIm1ldGhvZCIsIkVycm9yIiwiYmluZCIsImV4dHJhY3RQcm9wcyIsInByb3BzIiwicHJvcFR5cGVzIiwibmFtZU1hcCIsIk9iamVjdCIsImtleXMiLCJyZWR1Y2UiLCJvcHRzIiwicHJvcE5hbWUiLCJ1bmRlZmluZWQiLCJkZXN0UHJvcE5hbWUiLCJ1bnVzZWRQcm9wcyIsImdldFBhY2thZ2VSb290IiwicmVzb3VyY2VQYXRoIiwiYXRvbSIsImdldExvYWRTZXR0aW5ncyIsImN1cnJlbnRGaWxlV2FzUmVxdWlyZWRGcm9tU25hcHNob3QiLCJwYXRoIiwiaXNBYnNvbHV0ZSIsIl9fZGlybmFtZSIsImpvaW4iLCJwYWNrYWdlUm9vdCIsInJlc29sdmUiLCJleHRuYW1lIiwiaW5kZXhPZiIsImdldEF0b21BcHBOYW1lIiwibWF0Y2giLCJnZXRWZXJzaW9uIiwiY2hhbm5lbCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJnZXRBdG9tSGVscGVyUGF0aCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsImFwcE5hbWUiLCJyZXNvdXJjZXNQYXRoIiwiZXhlY1BhdGgiLCJEVUdJVEVfUEFUSCIsImdldER1Z2l0ZVBhdGgiLCJyZXF1aXJlIiwiU0hBUkVEX01PRFVMRV9QQVRIUyIsIk1hcCIsImdldFNoYXJlZE1vZHVsZVBhdGgiLCJyZWxQYXRoIiwibW9kdWxlUGF0aCIsImdldCIsInNldCIsImlzQmluYXJ5IiwiZGF0YSIsImkiLCJjb2RlIiwiY2hhckNvZGVBdCIsImRlc2NyaXB0b3JzRnJvbVByb3RvIiwicHJvdG8iLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiYWNjIiwibmFtZSIsImFzc2lnbiIsIlJlZmxlY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJmaXJzdEltcGxlbWVudGVyIiwidGFyZ2V0cyIsIlByb3h5IiwiX19pbXBsZW1lbnRhdGlvbnMiLCJ0YXJnZXQiLCJoYXMiLCJmaXJzdFZhbGlkVGFyZ2V0IiwiZmluZCIsInQiLCJ2YWx1ZSIsInNvbWUiLCJjb21wb3NpdGVPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJnZXRQcm90b3R5cGVPZiIsInJlZHVjZVJpZ2h0IiwiY3JlYXRlIiwicHJvdG90eXBlIiwiaXNSb290IiwiZGlyIiwiaXNWYWxpZFdvcmtkaXIiLCJvcyIsImhvbWVkaXIiLCJmaWxlRXhpc3RzIiwiYWJzb2x1dGVGaWxlUGF0aCIsImZzIiwiYWNjZXNzIiwiZSIsImdldFRlbXBEaXIiLCJvcHRpb25zIiwidGVtcCIsInRyYWNrIiwiUHJvbWlzZSIsInJlamVjdCIsIm1rZGlyIiwidGVtcEVycm9yIiwiZm9sZGVyIiwic3ltbGlua09rIiwicmVhbHBhdGgiLCJyZWFsRXJyb3IiLCJycGF0aCIsImlzRmlsZUV4ZWN1dGFibGUiLCJzdGF0IiwibW9kZSIsImNvbnN0YW50cyIsIlNfSVhVU1IiLCJpc0ZpbGVTeW1saW5rIiwibHN0YXQiLCJpc1N5bWJvbGljTGluayIsInNob3J0ZW5TaGEiLCJzaGEiLCJjbGFzc05hbWVGb3JTdGF0dXMiLCJhZGRlZCIsImRlbGV0ZWQiLCJtb2RpZmllZCIsInR5cGVjaGFuZ2UiLCJlcXVpdmFsZW50Iiwibm9ybWFsaXplR2l0SGVscGVyUGF0aCIsImluUGF0aCIsInJlcGxhY2UiLCJ0b05hdGl2ZVBhdGhTZXAiLCJyYXdQYXRoIiwic3BsaXQiLCJzZXAiLCJ0b0dpdFBhdGhTZXAiLCJmaWxlUGF0aEVuZHNXaXRoIiwiZmlsZVBhdGgiLCJzZWdtZW50cyIsImVuZHNXaXRoIiwidG9TZW50ZW5jZSIsImFycmF5IiwibGVuIiwibGVuZ3RoIiwiaXRlbSIsImlkeCIsInB1c2hBdEtleSIsIm1hcCIsImtleSIsImV4aXN0aW5nIiwicHVzaCIsImdldENvbW1pdE1lc3NhZ2VQYXRoIiwicmVwb3NpdG9yeSIsImdldEdpdERpcmVjdG9yeVBhdGgiLCJnZXRDb21taXRNZXNzYWdlRWRpdG9ycyIsIndvcmtzcGFjZSIsImlzUHJlc2VudCIsImdldFRleHRFZGl0b3JzIiwiZmlsdGVyIiwiZWRpdG9yIiwiZ2V0UGF0aCIsIkNoYW5nZWRGaWxlSXRlbSIsImdldEZpbGVQYXRjaFBhbmVJdGVtcyIsIm9ubHlTdGFnZWQiLCJlbXB0eSIsImRlZmF1bHQiLCJnZXRQYW5lSXRlbXMiLCJpc0ZpbGVQYXRjaEl0ZW0iLCJnZXRSZWFsSXRlbSIsInN0YWdpbmdTdGF0dXMiLCJpc0VtcHR5IiwiZGVzdHJveUZpbGVQYXRjaFBhbmVJdGVtcyIsIml0ZW1zVG9EZXN0cm95IiwiZm9yRWFjaCIsImRlc3Ryb3kiLCJkZXN0cm95RW1wdHlGaWxlUGF0Y2hQYW5lSXRlbXMiLCJleHRyYWN0Q29BdXRob3JzQW5kUmF3Q29tbWl0TWVzc2FnZSIsImNvbW1pdE1lc3NhZ2UiLCJtZXNzYWdlTGluZXMiLCJjb0F1dGhvcnMiLCJsaW5lIiwiXyIsImVtYWlsIiwiQXV0aG9yIiwibWVzc2FnZSIsImNyZWF0ZUl0ZW0iLCJub2RlIiwiY29tcG9uZW50SG9sZGVyIiwidXJpIiwiZXh0cmEiLCJob2xkZXIiLCJSZWZIb2xkZXIiLCJvdmVycmlkZSIsImdldEVsZW1lbnQiLCJnZXRPciIsImdldFJlYWxJdGVtUHJvbWlzZSIsImdldFByb21pc2UiLCJnZXRVUkkiLCJjb21wb25lbnQiLCJlcXVhbFNldHMiLCJsZWZ0IiwicmlnaHQiLCJzaXplIiwiZWFjaCIsIk5CU1BfQ0hBUkFDVEVSIiwiYmxhbmtMYWJlbCIsInJlYWN0aW9uVHlwZVRvRW1vamkiLCJUSFVNQlNfVVAiLCJUSFVNQlNfRE9XTiIsIkxBVUdIIiwiSE9PUkFZIiwiQ09ORlVTRUQiLCJIRUFSVCIsIlJPQ0tFVCIsIkVZRVMiLCJtYXJrZWQiLCJkb21QdXJpZnkiLCJyZW5kZXJNYXJrZG93biIsIm1kIiwiY3JlYXRlRE9NUHVyaWZ5Iiwic2V0T3B0aW9ucyIsInNpbGVudCIsInNhbml0aXplIiwic2FuaXRpemVyIiwiaHRtbCIsIkdIT1NUX1VTRVIiLCJsb2dpbiIsImF2YXRhclVybCIsInVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFFTyxNQUFNQSxpQkFBaUIsR0FBRyxPQUExQjs7QUFDQSxNQUFNQyxlQUFlLEdBQUcsa0NBQXhCOztBQUNBLE1BQU1DLFNBQVMsR0FBRyxFQUFsQjs7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxHQUFoQzs7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxFQUE5Qjs7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxFQUE1Qjs7O0FBRUEsU0FBU0MsUUFBVCxDQUFrQkMsSUFBbEIsRUFBd0IsR0FBR0MsT0FBM0IsRUFBb0M7QUFDekMsT0FBSyxNQUFNQyxNQUFYLElBQXFCRCxPQUFyQixFQUE4QjtBQUM1QixRQUFJLE9BQU9ELElBQUksQ0FBQ0UsTUFBRCxDQUFYLEtBQXdCLFVBQTVCLEVBQXdDO0FBQ3RDLFlBQU0sSUFBSUMsS0FBSixDQUFXLDZCQUE0QkQsTUFBTyxFQUE5QyxDQUFOO0FBQ0Q7O0FBQ0RGLElBQUFBLElBQUksQ0FBQ0UsTUFBRCxDQUFKLEdBQWVGLElBQUksQ0FBQ0UsTUFBRCxDQUFKLENBQWFFLElBQWIsQ0FBa0JKLElBQWxCLENBQWY7QUFDRDtBQUNGLEMsQ0FFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDTyxTQUFTSyxZQUFULENBQXNCQyxLQUF0QixFQUE2QkMsU0FBN0IsRUFBd0NDLE9BQU8sR0FBRyxFQUFsRCxFQUFzRDtB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QjtBQUNoQkMsTUFBQUEsTUFBTSxFQUFFLElBRFE7QUFFaEJDLE1BQUFBLFFBQVEsRUFBRSxJQUZNO0FBR2hCQyxNQUFBQSxTQUFTLEVBQUVDLElBQUksSUFBSVIsU0FBUyxDQUFDTSxRQUFWLENBQW1CRSxJQUFuQjtBQUhILEtBQWxCO0FBS0Q7O0FBRUQsU0FBT1QsTUFBTSxDQUFDRyxFQUFELENBQWI7QUFDRDs7QUFFTSxNQUFNTyxVQUFVLEdBQUc7QUFDeEJDLEVBQUFBLEtBQUssRUFBRSxPQURpQjtBQUV4QkMsRUFBQUEsU0FBUyxFQUFFLG9EQUZhO0FBR3hCQyxFQUFBQSxHQUFHLEVBQUU7QUFIbUIsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5cbmltcG9ydCBSZWZIb2xkZXIgZnJvbSAnLi9tb2RlbHMvcmVmLWhvbGRlcic7XG5pbXBvcnQgQXV0aG9yIGZyb20gJy4vbW9kZWxzL2F1dGhvcic7XG5cbmV4cG9ydCBjb25zdCBMSU5FX0VORElOR19SRUdFWCA9IC9cXHI/XFxuLztcbmV4cG9ydCBjb25zdCBDT19BVVRIT1JfUkVHRVggPSAvXmNvLWF1dGhvcmVkLWJ5LiAoLis/KSA8KC4rPyk+JC9pO1xuZXhwb3J0IGNvbnN0IFBBR0VfU0laRSA9IDUwO1xuZXhwb3J0IGNvbnN0IFBBR0lOQVRJT05fV0FJVF9USU1FX01TID0gMTAwO1xuZXhwb3J0IGNvbnN0IENIRUNLX1NVSVRFX1BBR0VfU0laRSA9IDEwO1xuZXhwb3J0IGNvbnN0IENIRUNLX1JVTl9QQUdFX1NJWkUgPSAyMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGF1dG9iaW5kKHNlbGYsIC4uLm1ldGhvZHMpIHtcbiAgZm9yIChjb25zdCBtZXRob2Qgb2YgbWV0aG9kcykge1xuICAgIGlmICh0eXBlb2Ygc2VsZlttZXRob2RdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBhdXRvYmluZCBtZXRob2QgJHttZXRob2R9YCk7XG4gICAgfVxuICAgIHNlbGZbbWV0aG9kXSA9IHNlbGZbbWV0aG9kXS5iaW5kKHNlbGYpO1xuICB9XG59XG5cbi8vIEV4dHJhY3QgYSBzdWJzZXQgb2YgcHJvcHMgY2hvc2VuIGZyb20gYSBwcm9wVHlwZXMgb2JqZWN0IGZyb20gYSBjb21wb25lbnQncyBwcm9wcyB0byBwYXNzIHRvIGEgZGlmZmVyZW50IEFQSS5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyBgYGBqc1xuLy8gY29uc3QgYXBpUHJvcHMgPSB7XG4vLyAgIHplcm86IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbi8vICAgb25lOiBQcm9wVHlwZXMuc3RyaW5nLFxuLy8gICB0d286IFByb3BUeXBlcy5vYmplY3QsXG4vLyB9O1xuLy9cbi8vIGNsYXNzIENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4vLyAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4vLyAgICAgLi4uYXBpUHJvcHMsXG4vLyAgICAgZXh0cmE6IFByb3BUeXBlcy5mdW5jLFxuLy8gICB9XG4vL1xuLy8gICBhY3Rpb24oKSB7XG4vLyAgICAgY29uc3Qgb3B0aW9ucyA9IGV4dHJhY3RQcm9wcyh0aGlzLnByb3BzLCBhcGlQcm9wcyk7XG4vLyAgICAgLy8gb3B0aW9ucyBjb250YWlucyB6ZXJvLCBvbmUsIGFuZCB0d28sIGJ1dCBub3QgZXh0cmFcbi8vICAgfVxuLy8gfVxuLy8gYGBgXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFByb3BzKHByb3BzLCBwcm9wVHlwZXMsIG5hbWVNYXAgPSB7fSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMocHJvcFR5cGVzKS5yZWR1Y2UoKG9wdHMsIHByb3BOYW1lKSA9PiB7XG4gICAgaWYgKHByb3BzW3Byb3BOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBkZXN0UHJvcE5hbWUgPSBuYW1lTWFwW3Byb3BOYW1lXSB8fCBwcm9wTmFtZTtcbiAgICAgIG9wdHNbZGVzdFByb3BOYW1lXSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICB9XG4gICAgcmV0dXJuIG9wdHM7XG4gIH0sIHt9KTtcbn1cblxuLy8gVGhlIG9wcG9zaXRlIG9mIGV4dHJhY3RQcm9wcy4gUmV0dXJuIGEgc3Vic2V0IG9mIHByb3BzIHRoYXQgZG8gKm5vdCogYXBwZWFyIGluIGEgY29tcG9uZW50J3MgcHJvcCB0eXBlcy5cbmV4cG9ydCBmdW5jdGlvbiB1bnVzZWRQcm9wcyhwcm9wcywgcHJvcFR5cGVzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwcm9wcykucmVkdWNlKChvcHRzLCBwcm9wTmFtZSkgPT4ge1xuICAgIGlmIChwcm9wVHlwZXNbcHJvcE5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdHNbcHJvcE5hbWVdID0gcHJvcHNbcHJvcE5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gb3B0cztcbiAgfSwge30pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFja2FnZVJvb3QoKSB7XG4gIGNvbnN0IHtyZXNvdXJjZVBhdGh9ID0gYXRvbS5nZXRMb2FkU2V0dGluZ3MoKTtcbiAgY29uc3QgY3VycmVudEZpbGVXYXNSZXF1aXJlZEZyb21TbmFwc2hvdCA9ICFwYXRoLmlzQWJzb2x1dGUoX19kaXJuYW1lKTtcbiAgaWYgKGN1cnJlbnRGaWxlV2FzUmVxdWlyZWRGcm9tU25hcHNob3QpIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHJlc291cmNlUGF0aCwgJ25vZGVfbW9kdWxlcycsICdnaXRodWInKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYWNrYWdlUm9vdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicpO1xuICAgIGlmIChwYXRoLmV4dG5hbWUocmVzb3VyY2VQYXRoKSA9PT0gJy5hc2FyJykge1xuICAgICAgaWYgKHBhY2thZ2VSb290LmluZGV4T2YocmVzb3VyY2VQYXRoKSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGAke3Jlc291cmNlUGF0aH0udW5wYWNrZWRgLCAnbm9kZV9tb2R1bGVzJywgJ2dpdGh1YicpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFja2FnZVJvb3Q7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0QXRvbUFwcE5hbWUoKSB7XG4gIGNvbnN0IG1hdGNoID0gYXRvbS5nZXRWZXJzaW9uKCkubWF0Y2goLy0oW0EtWmEtel0rKShcXGQrfC0pLyk7XG4gIGlmIChtYXRjaCkge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBtYXRjaFsxXTtcbiAgICByZXR1cm4gYEF0b20gJHtjaGFubmVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY2hhbm5lbC5zbGljZSgxKX0gSGVscGVyYDtcbiAgfVxuXG4gIHJldHVybiAnQXRvbSBIZWxwZXInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXRvbUhlbHBlclBhdGgoKSB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIGNvbnN0IGFwcE5hbWUgPSBnZXRBdG9tQXBwTmFtZSgpO1xuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLCAnLi4nLCAnRnJhbWV3b3JrcycsXG4gICAgICBgJHthcHBOYW1lfS5hcHBgLCAnQ29udGVudHMnLCAnTWFjT1MnLCBhcHBOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5leGVjUGF0aDtcbiAgfVxufVxuXG5sZXQgRFVHSVRFX1BBVEg7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RHVnaXRlUGF0aCgpIHtcbiAgaWYgKCFEVUdJVEVfUEFUSCkge1xuICAgIERVR0lURV9QQVRIID0gcmVxdWlyZS5yZXNvbHZlKCdkdWdpdGUnKTtcbiAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShEVUdJVEVfUEFUSCkpIHtcbiAgICAgIC8vIEFzc3VtZSB3ZSdyZSBzbmFwc2hvdHRlZFxuICAgICAgY29uc3Qge3Jlc291cmNlUGF0aH0gPSBhdG9tLmdldExvYWRTZXR0aW5ncygpO1xuICAgICAgaWYgKHBhdGguZXh0bmFtZShyZXNvdXJjZVBhdGgpID09PSAnLmFzYXInKSB7XG4gICAgICAgIERVR0lURV9QQVRIID0gcGF0aC5qb2luKGAke3Jlc291cmNlUGF0aH0udW5wYWNrZWRgLCAnbm9kZV9tb2R1bGVzJywgJ2R1Z2l0ZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgRFVHSVRFX1BBVEggPSBwYXRoLmpvaW4ocmVzb3VyY2VQYXRoLCAnbm9kZV9tb2R1bGVzJywgJ2R1Z2l0ZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBEVUdJVEVfUEFUSDtcbn1cblxuY29uc3QgU0hBUkVEX01PRFVMRV9QQVRIUyA9IG5ldyBNYXAoKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRTaGFyZWRNb2R1bGVQYXRoKHJlbFBhdGgpIHtcbiAgbGV0IG1vZHVsZVBhdGggPSBTSEFSRURfTU9EVUxFX1BBVEhTLmdldChyZWxQYXRoKTtcbiAgaWYgKCFtb2R1bGVQYXRoKSB7XG4gICAgbW9kdWxlUGF0aCA9IHJlcXVpcmUucmVzb2x2ZShwYXRoLmpvaW4oX19kaXJuYW1lLCAnc2hhcmVkJywgcmVsUGF0aCkpO1xuICAgIGlmICghcGF0aC5pc0Fic29sdXRlKG1vZHVsZVBhdGgpKSB7XG4gICAgICAvLyBBc3N1bWUgd2UncmUgc25hcHNob3R0ZWRcbiAgICAgIGNvbnN0IHtyZXNvdXJjZVBhdGh9ID0gYXRvbS5nZXRMb2FkU2V0dGluZ3MoKTtcbiAgICAgIG1vZHVsZVBhdGggPSBwYXRoLmpvaW4ocmVzb3VyY2VQYXRoLCBtb2R1bGVQYXRoKTtcbiAgICB9XG5cbiAgICBTSEFSRURfTU9EVUxFX1BBVEhTLnNldChyZWxQYXRoLCBtb2R1bGVQYXRoKTtcbiAgfVxuXG4gIHJldHVybiBtb2R1bGVQYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnkoZGF0YSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDUwOyBpKyspIHtcbiAgICBjb25zdCBjb2RlID0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgIC8vIENoYXIgY29kZSA2NTUzMyBpcyB0aGUgXCJyZXBsYWNlbWVudCBjaGFyYWN0ZXJcIjtcbiAgICAvLyA4IGFuZCBiZWxvdyBhcmUgY29udHJvbCBjaGFyYWN0ZXJzLlxuICAgIGlmIChjb2RlID09PSA2NTUzMyB8fCBjb2RlIDwgOSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBkZXNjcmlwdG9yc0Zyb21Qcm90byhwcm90bykge1xuICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pLnJlZHVjZSgoYWNjLCBuYW1lKSA9PiB7XG4gICAgT2JqZWN0LmFzc2lnbihhY2MsIHtcbiAgICAgIFtuYW1lXTogUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG5hbWUpLFxuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiB0YXJnZXRzIGFuZCByZXR1cm5zIGEgcHJveHkuIFRoZSBwcm94eSBpbnRlcmNlcHRzIHByb3BlcnR5IGFjY2Vzc29yIGNhbGxzIGFuZFxuICogcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhhdCBwcm9wZXJ0eSBvbiB0aGUgZmlyc3Qgb2JqZWN0IGluIGB0YXJnZXRzYCB3aGVyZSB0aGUgdGFyZ2V0IGltcGxlbWVudHMgdGhhdCBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0SW1wbGVtZW50ZXIoLi4udGFyZ2V0cykge1xuICByZXR1cm4gbmV3IFByb3h5KHtfX2ltcGxlbWVudGF0aW9uczogdGFyZ2V0c30sIHtcbiAgICBnZXQodGFyZ2V0LCBuYW1lKSB7XG4gICAgICBpZiAobmFtZSA9PT0gJ2dldEltcGxlbWVudGVycycpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHRhcmdldHM7XG4gICAgICB9XG5cbiAgICAgIGlmIChSZWZsZWN0Lmhhcyh0YXJnZXQsIG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRbbmFtZV07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpcnN0VmFsaWRUYXJnZXQgPSB0YXJnZXRzLmZpbmQodCA9PiBSZWZsZWN0Lmhhcyh0LCBuYW1lKSk7XG4gICAgICBpZiAoZmlyc3RWYWxpZFRhcmdldCkge1xuICAgICAgICByZXR1cm4gZmlyc3RWYWxpZFRhcmdldFtuYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldCh0YXJnZXQsIG5hbWUsIHZhbHVlKSB7XG4gICAgICBjb25zdCBmaXJzdFZhbGlkVGFyZ2V0ID0gdGFyZ2V0cy5maW5kKHQgPT4gUmVmbGVjdC5oYXModCwgbmFtZSkpO1xuICAgICAgaWYgKGZpcnN0VmFsaWRUYXJnZXQpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJldHVybi1hc3NpZ25cbiAgICAgICAgcmV0dXJuIGZpcnN0VmFsaWRUYXJnZXRbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXR1cm4tYXNzaWduXG4gICAgICAgIHJldHVybiB0YXJnZXRbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gVXNlZCBieSBzaW5vblxuICAgIGhhcyh0YXJnZXQsIG5hbWUpIHtcbiAgICAgIGlmIChuYW1lID09PSAnZ2V0SW1wbGVtZW50ZXJzJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhcmdldHMuc29tZSh0ID0+IFJlZmxlY3QuaGFzKHQsIG5hbWUpKTtcbiAgICB9LFxuXG4gICAgLy8gVXNlZCBieSBzaW5vblxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIG5hbWUpIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsaWRUYXJnZXQgPSB0YXJnZXRzLmZpbmQodCA9PiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCBuYW1lKSk7XG4gICAgICBjb25zdCBjb21wb3NpdGVPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIG5hbWUpO1xuICAgICAgaWYgKGZpcnN0VmFsaWRUYXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZpcnN0VmFsaWRUYXJnZXQsIG5hbWUpO1xuICAgICAgfSBlbHNlIGlmIChjb21wb3NpdGVPd25Qcm9wZXJ0eURlc2NyaXB0b3IpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZU93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFVzZWQgYnkgc2lub25cbiAgICBnZXRQcm90b3R5cGVPZih0YXJnZXQpIHtcbiAgICAgIHJldHVybiB0YXJnZXRzLnJlZHVjZVJpZ2h0KChhY2MsIHQpID0+IHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoYWNjLCBkZXNjcmlwdG9yc0Zyb21Qcm90byhPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpKTtcbiAgICAgIH0sIE9iamVjdC5wcm90b3R5cGUpO1xuICAgIH0sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1Jvb3QoZGlyKSB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUoZGlyLCAnLi4nKSA9PT0gZGlyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFdvcmtkaXIoZGlyKSB7XG4gIHJldHVybiBkaXIgIT09IG9zLmhvbWVkaXIoKSAmJiAhaXNSb290KGRpcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaWxlRXhpc3RzKGFic29sdXRlRmlsZVBhdGgpIHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcy5hY2Nlc3MoYWJzb2x1dGVGaWxlUGF0aCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBEaXIob3B0aW9ucyA9IHt9KSB7XG4gIHRlbXAudHJhY2soKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRlbXAubWtkaXIob3B0aW9ucywgKHRlbXBFcnJvciwgZm9sZGVyKSA9PiB7XG4gICAgICBpZiAodGVtcEVycm9yKSB7XG4gICAgICAgIHJlamVjdCh0ZW1wRXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnN5bWxpbmtPaykge1xuICAgICAgICByZXNvbHZlKGZvbGRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy5yZWFscGF0aChmb2xkZXIsIChyZWFsRXJyb3IsIHJwYXRoKSA9PiAocmVhbEVycm9yID8gcmVqZWN0KHJlYWxFcnJvcikgOiByZXNvbHZlKHJwYXRoKSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRmlsZUV4ZWN1dGFibGUoYWJzb2x1dGVGaWxlUGF0aCkge1xuICBjb25zdCBzdGF0ID0gYXdhaXQgZnMuc3RhdChhYnNvbHV0ZUZpbGVQYXRoKTtcbiAgcmV0dXJuIHN0YXQubW9kZSAmIGZzLmNvbnN0YW50cy5TX0lYVVNSOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRmlsZVN5bWxpbmsoYWJzb2x1dGVGaWxlUGF0aCkge1xuICBjb25zdCBzdGF0ID0gYXdhaXQgZnMubHN0YXQoYWJzb2x1dGVGaWxlUGF0aCk7XG4gIHJldHVybiBzdGF0LmlzU3ltYm9saWNMaW5rKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGVuU2hhKHNoYSkge1xuICByZXR1cm4gc2hhLnNsaWNlKDAsIDgpO1xufVxuXG5leHBvcnQgY29uc3QgY2xhc3NOYW1lRm9yU3RhdHVzID0ge1xuICBhZGRlZDogJ2FkZGVkJyxcbiAgZGVsZXRlZDogJ3JlbW92ZWQnLFxuICBtb2RpZmllZDogJ21vZGlmaWVkJyxcbiAgdHlwZWNoYW5nZTogJ21vZGlmaWVkJyxcbiAgZXF1aXZhbGVudDogJ2lnbm9yZWQnLFxufTtcblxuLypcbiAqIEFwcGx5IGFueSBwbGF0Zm9ybS1zcGVjaWZpYyBtdW5naW5nIHRvIGEgcGF0aCBiZWZvcmUgcHJlc2VudGluZyBpdCBhc1xuICogYSBnaXQgZW52aXJvbm1lbnQgdmFyaWFibGUgb3Igb3B0aW9uLlxuICpcbiAqIENvbnZlcnQgYSBXaW5kb3dzLXN0eWxlIFwiQzpcXGZvb1xcYmFyXFxiYXpcIiBwYXRoIHRvIGEgXCIvYy9mb28vYmFyL2JhelwiIFVOSVgteVxuICogcGF0aCB0aGF0IHRoZSBzaC5leGUgdXNlZCB0byBleGVjdXRlIGdpdCdzIGNyZWRlbnRpYWwgaGVscGVycyB3aWxsXG4gKiB1bmRlcnN0YW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR2l0SGVscGVyUGF0aChpblBhdGgpIHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICByZXR1cm4gaW5QYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC9eKFteOl0rKTovLCAnLyQxJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGluUGF0aDtcbiAgfVxufVxuXG4vKlxuICogT24gV2luZG93cywgZ2l0IGNvbW1hbmRzIHJlcG9ydCBwYXRocyB3aXRoIC8gZGVsaW1pdGVycy4gQ29udmVydCB0aGVtIHRvIFxcLWRlbGltaXRlZCBwYXRoc1xuICogc28gdGhhdCBBdG9tIHVuaWZyb21seSB0cmVhdHMgcGF0aHMgd2l0aCBuYXRpdmUgcGF0aCBzZXBhcmF0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9OYXRpdmVQYXRoU2VwKHJhd1BhdGgpIHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcbiAgICByZXR1cm4gcmF3UGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmF3UGF0aC5zcGxpdCgnLycpLmpvaW4ocGF0aC5zZXApO1xuICB9XG59XG5cbi8qXG4gKiBDb252ZXJ0IFdpbmRvd3MgcGF0aHMgYmFjayB0byAvLWRlbGltaXRlZCBwYXRocyB0byBiZSBwcmVzZW50ZWQgdG8gZ2l0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9HaXRQYXRoU2VwKHJhd1BhdGgpIHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcbiAgICByZXR1cm4gcmF3UGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmF3UGF0aC5zcGxpdChwYXRoLnNlcCkuam9pbignLycpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWxlUGF0aEVuZHNXaXRoKGZpbGVQYXRoLCAuLi5zZWdtZW50cykge1xuICByZXR1cm4gZmlsZVBhdGguZW5kc1dpdGgocGF0aC5qb2luKC4uLnNlZ21lbnRzKSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgdGhpbmdzIEBrdXljaGFjbyBjYW5ub3QgZWF0XG4gKiBpbnRvIGEgc2VudGVuY2UgY29udGFpbmluZyB0aGluZ3MgQGt1eWNoYWNvIGNhbm5vdCBlYXRcbiAqXG4gKiBbJ3RvYXN0J10gPT4gJ3RvYXN0J1xuICogWyd0b2FzdCcsICdlZ2dzJ10gPT4gJ3RvYXN0IGFuZCBlZ2dzJ1xuICogWyd0b2FzdCcsICdlZ2dzJywgJ2NoZWVzZSddID0+ICd0b2FzdCwgZWdncywgYW5kIGNoZWVzZSdcbiAqXG4gKiBPeGZvcmQgY29tbWEgaW5jbHVkZWQgYmVjYXVzZSB5b3UncmUgd3JvbmcsIHNodXQgdXAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1NlbnRlbmNlKGFycmF5KSB7XG4gIGNvbnN0IGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMSkge1xuICAgIHJldHVybiBgJHthcnJheVswXX1gO1xuICB9IGVsc2UgaWYgKGxlbiA9PT0gMikge1xuICAgIHJldHVybiBgJHthcnJheVswXX0gYW5kICR7YXJyYXlbMV19YDtcbiAgfVxuXG4gIHJldHVybiBhcnJheS5yZWR1Y2UoKGFjYywgaXRlbSwgaWR4KSA9PiB7XG4gICAgaWYgKGlkeCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGAke2l0ZW19YDtcbiAgICB9IGVsc2UgaWYgKGlkeCA9PT0gbGVuIC0gMSkge1xuICAgICAgcmV0dXJuIGAke2FjY30sIGFuZCAke2l0ZW19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke2FjY30sICR7aXRlbX1gO1xuICAgIH1cbiAgfSwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHVzaEF0S2V5KG1hcCwga2V5LCB2YWx1ZSkge1xuICBsZXQgZXhpc3RpbmcgPSBtYXAuZ2V0KGtleSk7XG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICBleGlzdGluZyA9IFtdO1xuICAgIG1hcC5zZXQoa2V5LCBleGlzdGluZyk7XG4gIH1cbiAgZXhpc3RpbmcucHVzaCh2YWx1ZSk7XG59XG5cbi8vIFJlcG9zaXRvcnkgYW5kIHdvcmtzcGFjZSBoZWxwZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlUGF0aChyZXBvc2l0b3J5KSB7XG4gIHJldHVybiBwYXRoLmpvaW4ocmVwb3NpdG9yeS5nZXRHaXREaXJlY3RvcnlQYXRoKCksICdBVE9NX0NPTU1JVF9FRElUTVNHJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlRWRpdG9ycyhyZXBvc2l0b3J5LCB3b3Jrc3BhY2UpIHtcbiAgaWYgKCFyZXBvc2l0b3J5LmlzUHJlc2VudCgpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiB3b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5maWx0ZXIoZWRpdG9yID0+IGVkaXRvci5nZXRQYXRoKCkgPT09IGdldENvbW1pdE1lc3NhZ2VQYXRoKHJlcG9zaXRvcnkpKTtcbn1cblxubGV0IENoYW5nZWRGaWxlSXRlbSA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVBhdGNoUGFuZUl0ZW1zKHtvbmx5U3RhZ2VkLCBlbXB0eX0gPSB7fSwgd29ya3NwYWNlKSB7XG4gIGlmIChDaGFuZ2VkRmlsZUl0ZW0gPT09IG51bGwpIHtcbiAgICBDaGFuZ2VkRmlsZUl0ZW0gPSByZXF1aXJlKCcuL2l0ZW1zL2NoYW5nZWQtZmlsZS1pdGVtJykuZGVmYXVsdDtcbiAgfVxuXG4gIHJldHVybiB3b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkuZmlsdGVyKGl0ZW0gPT4ge1xuICAgIGNvbnN0IGlzRmlsZVBhdGNoSXRlbSA9IGl0ZW0gJiYgaXRlbS5nZXRSZWFsSXRlbSAmJiBpdGVtLmdldFJlYWxJdGVtKCkgaW5zdGFuY2VvZiBDaGFuZ2VkRmlsZUl0ZW07XG4gICAgaWYgKG9ubHlTdGFnZWQpIHtcbiAgICAgIHJldHVybiBpc0ZpbGVQYXRjaEl0ZW0gJiYgaXRlbS5zdGFnaW5nU3RhdHVzID09PSAnc3RhZ2VkJztcbiAgICB9IGVsc2UgaWYgKGVtcHR5KSB7XG4gICAgICByZXR1cm4gaXNGaWxlUGF0Y2hJdGVtID8gaXRlbS5pc0VtcHR5KCkgOiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlzRmlsZVBhdGNoSXRlbTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveUZpbGVQYXRjaFBhbmVJdGVtcyh7b25seVN0YWdlZH0gPSB7fSwgd29ya3NwYWNlKSB7XG4gIGNvbnN0IGl0ZW1zVG9EZXN0cm95ID0gZ2V0RmlsZVBhdGNoUGFuZUl0ZW1zKHtvbmx5U3RhZ2VkfSwgd29ya3NwYWNlKTtcbiAgaXRlbXNUb0Rlc3Ryb3kuZm9yRWFjaChpdGVtID0+IGl0ZW0uZGVzdHJveSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lFbXB0eUZpbGVQYXRjaFBhbmVJdGVtcyh3b3Jrc3BhY2UpIHtcbiAgY29uc3QgaXRlbXNUb0Rlc3Ryb3kgPSBnZXRGaWxlUGF0Y2hQYW5lSXRlbXMoe2VtcHR5OiB0cnVlfSwgd29ya3NwYWNlKTtcbiAgaXRlbXNUb0Rlc3Ryb3kuZm9yRWFjaChpdGVtID0+IGl0ZW0uZGVzdHJveSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDb0F1dGhvcnNBbmRSYXdDb21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2UpIHtcbiAgY29uc3QgbWVzc2FnZUxpbmVzID0gW107XG4gIGNvbnN0IGNvQXV0aG9ycyA9IFtdO1xuXG4gIGZvciAoY29uc3QgbGluZSBvZiBjb21taXRNZXNzYWdlLnNwbGl0KExJTkVfRU5ESU5HX1JFR0VYKSkge1xuICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaChDT19BVVRIT1JfUkVHRVgpO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICBjb25zdCBbXywgbmFtZSwgZW1haWxdID0gbWF0Y2g7XG4gICAgICBjb0F1dGhvcnMucHVzaChuZXcgQXV0aG9yKGVtYWlsLCBuYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2VMaW5lcy5wdXNoKGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7bWVzc2FnZTogbWVzc2FnZUxpbmVzLmpvaW4oJ1xcbicpLCBjb0F1dGhvcnN9O1xufVxuXG4vLyBBdG9tIEFQSSBwYW5lIGl0ZW0gbWFuaXB1bGF0aW9uXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVtKG5vZGUsIGNvbXBvbmVudEhvbGRlciA9IG51bGwsIHVyaSA9IG51bGwsIGV4dHJhID0ge30pIHtcbiAgY29uc3QgaG9sZGVyID0gY29tcG9uZW50SG9sZGVyIHx8IG5ldyBSZWZIb2xkZXIoKTtcblxuICBjb25zdCBvdmVycmlkZSA9IHtcbiAgICBnZXRFbGVtZW50OiAoKSA9PiBub2RlLFxuXG4gICAgZ2V0UmVhbEl0ZW06ICgpID0+IGhvbGRlci5nZXRPcihudWxsKSxcblxuICAgIGdldFJlYWxJdGVtUHJvbWlzZTogKCkgPT4gaG9sZGVyLmdldFByb21pc2UoKSxcblxuICAgIC4uLmV4dHJhLFxuICB9O1xuXG4gIGlmICh1cmkpIHtcbiAgICBvdmVycmlkZS5nZXRVUkkgPSAoKSA9PiB1cmk7XG4gIH1cblxuICBpZiAoY29tcG9uZW50SG9sZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm94eShvdmVycmlkZSwge1xuICAgICAgZ2V0KHRhcmdldCwgbmFtZSkge1xuICAgICAgICBpZiAoUmVmbGVjdC5oYXModGFyZ2V0LCBuYW1lKSkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXRbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUge3ZhbHVlOiAuLi59IHdyYXBwZXIgcHJldmVudHMgLm1hcCgpIGZyb20gZmxhdHRlbmluZyBhIHJldHVybmVkIFJlZkhvbGRlci5cbiAgICAgICAgLy8gSWYgY29tcG9uZW50W25hbWVdIGlzIGEgUmVmSG9sZGVyLCB3ZSB3YW50IHRvIHJldHVybiB0aGF0IFJlZkhvbGRlciBhcy1pcy5cbiAgICAgICAgY29uc3Qge3ZhbHVlfSA9IGhvbGRlci5tYXAoY29tcG9uZW50ID0+ICh7dmFsdWU6IGNvbXBvbmVudFtuYW1lXX0pKS5nZXRPcih7dmFsdWU6IHVuZGVmaW5lZH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LFxuXG4gICAgICBzZXQodGFyZ2V0LCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gaG9sZGVyLm1hcChjb21wb25lbnQgPT4ge1xuICAgICAgICAgIGNvbXBvbmVudFtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KS5nZXRPcih0cnVlKTtcbiAgICAgIH0sXG5cbiAgICAgIGhhcyh0YXJnZXQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGhvbGRlci5tYXAoY29tcG9uZW50ID0+IFJlZmxlY3QuaGFzKGNvbXBvbmVudCwgbmFtZSkpLmdldE9yKGZhbHNlKSB8fCBSZWZsZWN0Lmhhcyh0YXJnZXQsIG5hbWUpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3ZlcnJpZGU7XG4gIH1cbn1cblxuLy8gU2V0IGZ1bmN0aW9uc1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxTZXRzKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0LnNpemUgIT09IHJpZ2h0LnNpemUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGNvbnN0IGVhY2ggb2YgbGVmdCkge1xuICAgIGlmICghcmlnaHQuaGFzKGVhY2gpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENvbnN0YW50c1xuXG5leHBvcnQgY29uc3QgTkJTUF9DSEFSQUNURVIgPSAnXFx1MDBhMCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBibGFua0xhYmVsKCkge1xuICByZXR1cm4gTkJTUF9DSEFSQUNURVI7XG59XG5cbmV4cG9ydCBjb25zdCByZWFjdGlvblR5cGVUb0Vtb2ppID0ge1xuICBUSFVNQlNfVVA6ICfwn5GNJyxcbiAgVEhVTUJTX0RPV046ICfwn5GOJyxcbiAgTEFVR0g6ICfwn5iGJyxcbiAgSE9PUkFZOiAn8J+OiScsXG4gIENPTkZVU0VEOiAn8J+YlScsXG4gIEhFQVJUOiAn4p2k77iPJyxcbiAgUk9DS0VUOiAn8J+agCcsXG4gIEVZRVM6ICfwn5GAJyxcbn07XG5cbi8vIE1hcmtkb3duXG5cbmxldCBtYXJrZWQgPSBudWxsO1xubGV0IGRvbVB1cmlmeSA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJNYXJrZG93bihtZCkge1xuICBpZiAobWFya2VkID09PSBudWxsKSB7XG4gICAgbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJyk7XG5cbiAgICBpZiAoZG9tUHVyaWZ5ID09PSBudWxsKSB7XG4gICAgICBjb25zdCBjcmVhdGVET01QdXJpZnkgPSByZXF1aXJlKCdkb21wdXJpZnknKTtcbiAgICAgIGRvbVB1cmlmeSA9IGNyZWF0ZURPTVB1cmlmeSgpO1xuICAgIH1cblxuICAgIG1hcmtlZC5zZXRPcHRpb25zKHtcbiAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgIHNhbml0aXplOiB0cnVlLFxuICAgICAgc2FuaXRpemVyOiBodG1sID0+IGRvbVB1cmlmeS5zYW5pdGl6ZShodG1sKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBtYXJrZWQobWQpO1xufVxuXG5leHBvcnQgY29uc3QgR0hPU1RfVVNFUiA9IHtcbiAgbG9naW46ICdnaG9zdCcsXG4gIGF2YXRhclVybDogJ2h0dHBzOi8vYXZhdGFyczEuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTAxMzc/dj00JyxcbiAgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL2dob3N0Jyxcbn07XG4iXX0=