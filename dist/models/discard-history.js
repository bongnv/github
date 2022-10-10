"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _discardHistoryStores = require("./discard-history-stores");

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const emptyFilePath = _path.default.join(_os.default.tmpdir(), 'empty-file.txt');

const emptyFilePromise = _fsExtra.default.writeFile(emptyFilePath, '');

class DiscardHistory {
  constructor(createBlob, expandBlobToFile, mergeFile, workdirPath, {
    maxHistoryLength
  } = {}) {
    this.createBlob = createBlob;
    this.expandBlobToFile = expandBlobToFile;
    this.mergeFile = mergeFile;
    this.workdirPath = workdirPath;
    this.partialFileHistory = new _discardHistoryStores.PartialFileDiscardHistory(maxHistoryLength);
    this.wholeFileHistory = new _discardHistoryStores.WholeFileDiscardHistory(maxHistoryLength);
  }

  getLastSnapshots(partialDiscardFilePath = null) {
    if (partialDiscardFilePath) {
      return this.partialFileHistory.getLastSnapshotsForPath(partialDiscardFilePath);
    } else {
      return this.wholeFileHistory.getLastSnapshots();
    }
  }

  getHistory(partialDiscardFilePath = null) {
    if (partialDiscardFilePath) {
      return this.partialFileHistory.getHistoryForPath(partialDiscardFilePath);
    } else {
      return this.wholeFileHistory.getHistory();
    }
  }

  hasHistory(partialDiscardFilePath = null) {
    const history = this.getHistory(partialDiscardFilePath);
    return history.length > 0;
  }

  popHistory(partialDiscardFilePath = null) {
    if (partialDiscardFilePath) {
      return this.partialFileHistory.popHistoryForPath(partialDiscardFilePath);
    } else {
      return this.wholeFileHistory.popHistory();
    }
  }

  clearHistory(partialDiscardFilePath = null) {
    if (partialDiscardFilePath) {
      this.partialFileHistory.clearHistoryForPath(partialDiscardFilePath);
    } else {
      this.wholeFileHistory.clearHistory();
    }
  }

  updateHistory(history) {
    this.partialFileHistory.setHistory(history.partialFileHistory || {});
    this.wholeFileHistory.setHistory(history.wholeFileHistory || []);
  }

  async createHistoryBlob() {
    const histories = {
      wholeFileHistory: this.wholeFileHistory.getHistory(),
      partialFileHistory: this.partialFileHistory.getHistory()
    };
    const historySha = await this.createBlob({
      stdin: JSON.stringify(histories)
    });
    return historySha;
  }

  async storeBeforeAndAfterBlobs(filePaths, isSafe, destructiveAction, partialDiscardFilePath = null) {
    if (partialDiscardFilePath) {
      return await this.storeBlobsForPartialFileHistory(partialDiscardFilePath, isSafe, destructiveAction);
    } else {
      return await this.storeBlobsForWholeFileHistory(filePaths, isSafe, destructiveAction);
    }
  }

  async storeBlobsForPartialFileHistory(filePath, isSafe, destructiveAction) {
    const beforeSha = await this.createBlob({
      filePath
    });
    const isNotSafe = !(await isSafe());

    if (isNotSafe) {
      return null;
    }

    await destructiveAction();
    const afterSha = await this.createBlob({
      filePath
    });
    const snapshots = {
      beforeSha,
      afterSha
    };
    this.partialFileHistory.addHistory(filePath, snapshots);
    return snapshots;
  }

  async storeBlobsForWholeFileHistory(filePaths, isSafe, destructiveAction) {
    const snapshotsByPath = {};
    const beforePromises = filePaths.map(async filePath => {
      snapshotsByPath[filePath] = {
        beforeSha: await this.createBlob({
          filePath
        })
      };
    });
    await Promise.all(beforePromises);
    const isNotSafe = !(await isSafe());

    if (isNotSafe) {
      return null;
    }

    await destructiveAction();
    const afterPromises = filePaths.map(async filePath => {
      snapshotsByPath[filePath].afterSha = await this.createBlob({
        filePath
      });
    });
    await Promise.all(afterPromises);
    this.wholeFileHistory.addHistory(snapshotsByPath);
    return snapshotsByPath;
  }

  async restoreLastDiscardInTempFiles(isSafe, partialDiscardFilePath = null) {
    let lastDiscardSnapshots = this.getLastSnapshots(partialDiscardFilePath);

    if (partialDiscardFilePath) {
      lastDiscardSnapshots = lastDiscardSnapshots ? [lastDiscardSnapshots] : [];
    }

    const tempFolderPaths = await this.expandBlobsToFilesInTempFolder(lastDiscardSnapshots);

    if (!isSafe()) {
      return [];
    }

    return await this.mergeFiles(tempFolderPaths);
  }

  async expandBlobsToFilesInTempFolder(snapshots) {
    const tempFolderPath = await (0, _helpers.getTempDir)({
      prefix: 'github-discard-history-'
    });
    const pathPromises = snapshots.map(async ({
      filePath,
      beforeSha,
      afterSha
    }) => {
      const dir = _path.default.dirname(_path.default.join(tempFolderPath, filePath));

      await (0, _mkdirp.default)(dir);
      const theirsPath = !beforeSha ? null : await this.expandBlobToFile(_path.default.join(tempFolderPath, `${filePath}-before-discard`), beforeSha);
      const commonBasePath = !afterSha ? null : await this.expandBlobToFile(_path.default.join(tempFolderPath, `${filePath}-after-discard`), afterSha);

      const resultPath = _path.default.join(dir, `~${_path.default.basename(filePath)}-merge-result`);

      return {
        filePath,
        commonBasePath,
        theirsPath,
        resultPath,
        theirsSha: beforeSha,
        commonBaseSha: afterSha
      };
    });
    return await Promise.all(pathPromises);
  }

  async mergeFiles(filePaths) {
    const mergeFilePromises = filePaths.map(async (filePathInfo, i) => {
      const {
        filePath,
        commonBasePath,
        theirsPath,
        resultPath,
        theirsSha,
        commonBaseSha
      } = filePathInfo;
      const currentSha = await this.createBlob({
        filePath
      });
      let mergeResult;

      if (theirsPath && commonBasePath) {
        mergeResult = await this.mergeFile(filePath, commonBasePath, theirsPath, resultPath);
      } else if (!theirsPath && commonBasePath) {
        // deleted file
        const oursSha = await this.createBlob({
          filePath
        });

        if (oursSha === commonBaseSha) {
          // no changes since discard, mark file to be deleted
          mergeResult = {
            filePath,
            resultPath: null,
            deleted: true,
            conflict: false
          };
        } else {
          // changes since discard result in conflict
          await _fsExtra.default.copy(_path.default.join(this.workdirPath, filePath), resultPath);
          mergeResult = {
            filePath,
            resultPath,
            conflict: true
          };
        }
      } else if (theirsPath && !commonBasePath) {
        // added file
        const fileDoesExist = await (0, _helpers.fileExists)(_path.default.join(this.workdirPath, filePath));

        if (!fileDoesExist) {
          await _fsExtra.default.copy(theirsPath, resultPath);
          mergeResult = {
            filePath,
            resultPath,
            conflict: false
          };
        } else {
          await emptyFilePromise;
          mergeResult = await this.mergeFile(filePath, emptyFilePath, theirsPath, resultPath);
        }
      } else {
        throw new Error('One of the following must be defined - theirsPath:' + `${theirsPath} or commonBasePath: ${commonBasePath}`);
      }

      return _objectSpread2({}, mergeResult, {
        theirsSha,
        commonBaseSha,
        currentSha
      });
    });
    return await Promise.all(mergeFilePromises);
  }

}

exports.default = DiscardHistory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvZGlzY2FyZC1oaXN0b3J5LmpzIl0sIm5hbWVzIjpbImVtcHR5RmlsZVBhdGgiLCJwYXRoIiwiam9pbiIsIm9zIiwidG1wZGlyIiwiZW1wdHlGaWxlUHJvbWlzZSIsImZzIiwid3JpdGVGaWxlIiwiRGlzY2FyZEhpc3RvcnkiLCJjb25zdHJ1Y3RvciIsImNyZWF0ZUJsb2IiLCJleHBhbmRCbG9iVG9GaWxlIiwibWVyZ2VGaWxlIiwid29ya2RpclBhdGgiLCJtYXhIaXN0b3J5TGVuZ3RoIiwicGFydGlhbEZpbGVIaXN0b3J5IiwiUGFydGlhbEZpbGVEaXNjYXJkSGlzdG9yeSIsIndob2xlRmlsZUhpc3RvcnkiLCJXaG9sZUZpbGVEaXNjYXJkSGlzdG9yeSIsImdldExhc3RTbmFwc2hvdHMiLCJwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoIiwiZ2V0TGFzdFNuYXBzaG90c0ZvclBhdGgiLCJnZXRIaXN0b3J5IiwiZ2V0SGlzdG9yeUZvclBhdGgiLCJoYXNIaXN0b3J5IiwiaGlzdG9yeSIsImxlbmd0aCIsInBvcEhpc3RvcnkiLCJwb3BIaXN0b3J5Rm9yUGF0aCIsImNsZWFySGlzdG9yeSIsImNsZWFySGlzdG9yeUZvclBhdGgiLCJ1cGRhdGVIaXN0b3J5Iiwic2V0SGlzdG9yeSIsImNyZWF0ZUhpc3RvcnlCbG9iIiwiaGlzdG9yaWVzIiwiaGlzdG9yeVNoYSIsInN0ZGluIiwiSlNPTiIsInN0cmluZ2lmeSIsInN0b3JlQmVmb3JlQW5kQWZ0ZXJCbG9icyIsImZpbGVQYXRocyIsImlzU2FmZSIsImRlc3RydWN0aXZlQWN0aW9uIiwic3RvcmVCbG9ic0ZvclBhcnRpYWxGaWxlSGlzdG9yeSIsInN0b3JlQmxvYnNGb3JXaG9sZUZpbGVIaXN0b3J5IiwiZmlsZVBhdGgiLCJiZWZvcmVTaGEiLCJpc05vdFNhZmUiLCJhZnRlclNoYSIsInNuYXBzaG90cyIsImFkZEhpc3RvcnkiLCJzbmFwc2hvdHNCeVBhdGgiLCJiZWZvcmVQcm9taXNlcyIsIm1hcCIsIlByb21pc2UiLCJhbGwiLCJhZnRlclByb21pc2VzIiwicmVzdG9yZUxhc3REaXNjYXJkSW5UZW1wRmlsZXMiLCJsYXN0RGlzY2FyZFNuYXBzaG90cyIsInRlbXBGb2xkZXJQYXRocyIsImV4cGFuZEJsb2JzVG9GaWxlc0luVGVtcEZvbGRlciIsIm1lcmdlRmlsZXMiLCJ0ZW1wRm9sZGVyUGF0aCIsInByZWZpeCIsInBhdGhQcm9taXNlcyIsImRpciIsImRpcm5hbWUiLCJ0aGVpcnNQYXRoIiwiY29tbW9uQmFzZVBhdGgiLCJyZXN1bHRQYXRoIiwiYmFzZW5hbWUiLCJ0aGVpcnNTaGEiLCJjb21tb25CYXNlU2hhIiwibWVyZ2VGaWxlUHJvbWlzZXMiLCJmaWxlUGF0aEluZm8iLCJpIiwiY3VycmVudFNoYSIsIm1lcmdlUmVzdWx0Iiwib3Vyc1NoYSIsImRlbGV0ZWQiLCJjb25mbGljdCIsImNvcHkiLCJmaWxlRG9lc0V4aXN0IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7Ozs7Ozs7QUFFQSxNQUFNQSxhQUFhLEdBQUdDLGNBQUtDLElBQUwsQ0FBVUMsWUFBR0MsTUFBSCxFQUFWLEVBQXVCLGdCQUF2QixDQUF0Qjs7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBR0MsaUJBQUdDLFNBQUgsQ0FBYVAsYUFBYixFQUE0QixFQUE1QixDQUF6Qjs7QUFFZSxNQUFNUSxjQUFOLENBQXFCO0FBQ2xDQyxFQUFBQSxXQUFXLENBQUNDLFVBQUQsRUFBYUMsZ0JBQWIsRUFBK0JDLFNBQS9CLEVBQTBDQyxXQUExQyxFQUF1RDtBQUFDQyxJQUFBQTtBQUFELE1BQXFCLEVBQTVFLEVBQWdGO0FBQ3pGLFNBQUtKLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0JBLGdCQUF4QjtBQUNBLFNBQUtDLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxTQUFLRSxrQkFBTCxHQUEwQixJ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S0FBS1csV0FBZixFQUE0QmdDLFFBQTVCLENBQVgsQ0FBNUI7O0FBQ0EsWUFBSSxDQUFDcUMsYUFBTCxFQUFvQjtBQUNsQixnQkFBTTVFLGlCQUFHMkUsSUFBSCxDQUFRZCxVQUFSLEVBQW9CRSxVQUFwQixDQUFOO0FBQ0FRLFVBQUFBLFdBQVcsR0FBRztBQUFDaEMsWUFBQUEsUUFBRDtBQUFXd0IsWUFBQUEsVUFBWDtBQUF1QlcsWUFBQUEsUUFBUSxFQUFFO0FBQWpDLFdBQWQ7QUFDRCxTQUhELE1BR087QUFDTCxnQkFBTTNFLGdCQUFOO0FBQ0F3RSxVQUFBQSxXQUFXLEdBQUcsTUFBTSxLQUFLakUsU0FBTCxDQUFlaUMsUUFBZixFQUF5QjdDLGFBQXpCLEVBQXdDbUUsVUFBeEMsRUFBb0RFLFVBQXBELENBQXBCO0FBQ0Q7QUFDRixPQVRNLE1BU0E7QUFDTCxjQUFNLElBQUljLEtBQUosQ0FBVSx1REFDYixHQUFFaEIsVUFBVyx1QkFBc0JDLGNBQWUsRUFEL0MsQ0FBTjtBQUVEOztBQUNELGdDQUFXUyxXQUFYO0FBQXdCTixRQUFBQSxTQUF4QjtBQUFtQ0MsUUFBQUEsYUFBbkM7QUFBa0RJLFFBQUFBO0FBQWxEO0FBQ0QsS0E1QnlCLENBQTFCO0FBNkJBLFdBQU8sTUFBTXRCLE9BQU8sQ0FBQ0MsR0FBUixDQUFZa0IsaUJBQVosQ0FBYjtBQUNEOztBQXpKaUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuXG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5cbmltcG9ydCB7UGFydGlhbEZpbGVEaXNjYXJkSGlzdG9yeSwgV2hvbGVGaWxlRGlzY2FyZEhpc3Rvcnl9IGZyb20gJy4vZGlzY2FyZC1oaXN0b3J5LXN0b3Jlcyc7XG5cbmltcG9ydCB7Z2V0VGVtcERpciwgZmlsZUV4aXN0c30gZnJvbSAnLi4vaGVscGVycyc7XG5cbmNvbnN0IGVtcHR5RmlsZVBhdGggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksICdlbXB0eS1maWxlLnR4dCcpO1xuY29uc3QgZW1wdHlGaWxlUHJvbWlzZSA9IGZzLndyaXRlRmlsZShlbXB0eUZpbGVQYXRoLCAnJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc2NhcmRIaXN0b3J5IHtcbiAgY29uc3RydWN0b3IoY3JlYXRlQmxvYiwgZXhwYW5kQmxvYlRvRmlsZSwgbWVyZ2VGaWxlLCB3b3JrZGlyUGF0aCwge21heEhpc3RvcnlMZW5ndGh9ID0ge30pIHtcbiAgICB0aGlzLmNyZWF0ZUJsb2IgPSBjcmVhdGVCbG9iO1xuICAgIHRoaXMuZXhwYW5kQmxvYlRvRmlsZSA9IGV4cGFuZEJsb2JUb0ZpbGU7XG4gICAgdGhpcy5tZXJnZUZpbGUgPSBtZXJnZUZpbGU7XG4gICAgdGhpcy53b3JrZGlyUGF0aCA9IHdvcmtkaXJQYXRoO1xuICAgIHRoaXMucGFydGlhbEZpbGVIaXN0b3J5ID0gbmV3IFBhcnRpYWxGaWxlRGlzY2FyZEhpc3RvcnkobWF4SGlzdG9yeUxlbmd0aCk7XG4gICAgdGhpcy53aG9sZUZpbGVIaXN0b3J5ID0gbmV3IFdob2xlRmlsZURpc2NhcmRIaXN0b3J5KG1heEhpc3RvcnlMZW5ndGgpO1xuICB9XG5cbiAgZ2V0TGFzdFNuYXBzaG90cyhwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJ0aWFsRmlsZUhpc3RvcnkuZ2V0TGFzdFNuYXBzaG90c0ZvclBhdGgocGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLndob2xlRmlsZUhpc3RvcnkuZ2V0TGFzdFNuYXBzaG90cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldEhpc3RvcnkocGFydGlhbERpc2NhcmRGaWxlUGF0aCA9IG51bGwpIHtcbiAgICBpZiAocGFydGlhbERpc2NhcmRGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFydGlhbEZpbGVIaXN0b3J5LmdldEhpc3RvcnlGb3JQYXRoKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy53aG9sZUZpbGVIaXN0b3J5LmdldEhpc3RvcnkoKTtcbiAgICB9XG4gIH1cblxuICBoYXNIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuZ2V0SGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKTtcbiAgICByZXR1cm4gaGlzdG9yeS5sZW5ndGggPiAwO1xuICB9XG5cbiAgcG9wSGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJ0aWFsRmlsZUhpc3RvcnkucG9wSGlzdG9yeUZvclBhdGgocGFydGlhbERpc2NhcmRGaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLndob2xlRmlsZUhpc3RvcnkucG9wSGlzdG9yeSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFySGlzdG9yeShwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhcnRpYWxGaWxlSGlzdG9yeS5jbGVhckhpc3RvcnlGb3JQYXRoKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndob2xlRmlsZUhpc3RvcnkuY2xlYXJIaXN0b3J5KCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlSGlzdG9yeShoaXN0b3J5KSB7XG4gICAgdGhpcy5wYXJ0aWFsRmlsZUhpc3Rvcnkuc2V0SGlzdG9yeShoaXN0b3J5LnBhcnRpYWxGaWxlSGlzdG9yeSB8fCB7fSk7XG4gICAgdGhpcy53aG9sZUZpbGVIaXN0b3J5LnNldEhpc3RvcnkoaGlzdG9yeS53aG9sZUZpbGVIaXN0b3J5IHx8IFtdKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUhpc3RvcnlCbG9iKCkge1xuICAgIGNvbnN0IGhpc3RvcmllcyA9IHtcbiAgICAgIHdob2xlRmlsZUhpc3Rvcnk6IHRoaXMud2hvbGVGaWxlSGlzdG9yeS5nZXRIaXN0b3J5KCksXG4gICAgICBwYXJ0aWFsRmlsZUhpc3Rvcnk6IHRoaXMucGFydGlhbEZpbGVIaXN0b3J5LmdldEhpc3RvcnkoKSxcbiAgICB9O1xuICAgIGNvbnN0IGhpc3RvcnlTaGEgPSBhd2FpdCB0aGlzLmNyZWF0ZUJsb2Ioe3N0ZGluOiBKU09OLnN0cmluZ2lmeShoaXN0b3JpZXMpfSk7XG4gICAgcmV0dXJuIGhpc3RvcnlTaGE7XG4gIH1cblxuICBhc3luYyBzdG9yZUJlZm9yZUFuZEFmdGVyQmxvYnMoZmlsZVBhdGhzLCBpc1NhZmUsIGRlc3RydWN0aXZlQWN0aW9uLCBwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoID0gbnVsbCkge1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yZUJsb2JzRm9yUGFydGlhbEZpbGVIaXN0b3J5KHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgsIGlzU2FmZSwgZGVzdHJ1Y3RpdmVBY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yZUJsb2JzRm9yV2hvbGVGaWxlSGlzdG9yeShmaWxlUGF0aHMsIGlzU2FmZSwgZGVzdHJ1Y3RpdmVBY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3JlQmxvYnNGb3JQYXJ0aWFsRmlsZUhpc3RvcnkoZmlsZVBhdGgsIGlzU2FmZSwgZGVzdHJ1Y3RpdmVBY3Rpb24pIHtcbiAgICBjb25zdCBiZWZvcmVTaGEgPSBhd2FpdCB0aGlzLmNyZWF0ZUJsb2Ioe2ZpbGVQYXRofSk7XG4gICAgY29uc3QgaXNOb3RTYWZlID0gIShhd2FpdCBpc1NhZmUoKSk7XG4gICAgaWYgKGlzTm90U2FmZSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGF3YWl0IGRlc3RydWN0aXZlQWN0aW9uKCk7XG4gICAgY29uc3QgYWZ0ZXJTaGEgPSBhd2FpdCB0aGlzLmNyZWF0ZUJsb2Ioe2ZpbGVQYXRofSk7XG4gICAgY29uc3Qgc25hcHNob3RzID0ge2JlZm9yZVNoYSwgYWZ0ZXJTaGF9O1xuICAgIHRoaXMucGFydGlhbEZpbGVIaXN0b3J5LmFkZEhpc3RvcnkoZmlsZVBhdGgsIHNuYXBzaG90cyk7XG4gICAgcmV0dXJuIHNuYXBzaG90cztcbiAgfVxuXG4gIGFzeW5jIHN0b3JlQmxvYnNGb3JXaG9sZUZpbGVIaXN0b3J5KGZpbGVQYXRocywgaXNTYWZlLCBkZXN0cnVjdGl2ZUFjdGlvbikge1xuICAgIGNvbnN0IHNuYXBzaG90c0J5UGF0aCA9IHt9O1xuICAgIGNvbnN0IGJlZm9yZVByb21pc2VzID0gZmlsZVBhdGhzLm1hcChhc3luYyBmaWxlUGF0aCA9PiB7XG4gICAgICBzbmFwc2hvdHNCeVBhdGhbZmlsZVBhdGhdID0ge2JlZm9yZVNoYTogYXdhaXQgdGhpcy5jcmVhdGVCbG9iKHtmaWxlUGF0aH0pfTtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChiZWZvcmVQcm9taXNlcyk7XG4gICAgY29uc3QgaXNOb3RTYWZlID0gIShhd2FpdCBpc1NhZmUoKSk7XG4gICAgaWYgKGlzTm90U2FmZSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGF3YWl0IGRlc3RydWN0aXZlQWN0aW9uKCk7XG4gICAgY29uc3QgYWZ0ZXJQcm9taXNlcyA9IGZpbGVQYXRocy5tYXAoYXN5bmMgZmlsZVBhdGggPT4ge1xuICAgICAgc25hcHNob3RzQnlQYXRoW2ZpbGVQYXRoXS5hZnRlclNoYSA9IGF3YWl0IHRoaXMuY3JlYXRlQmxvYih7ZmlsZVBhdGh9KTtcbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChhZnRlclByb21pc2VzKTtcbiAgICB0aGlzLndob2xlRmlsZUhpc3RvcnkuYWRkSGlzdG9yeShzbmFwc2hvdHNCeVBhdGgpO1xuICAgIHJldHVybiBzbmFwc2hvdHNCeVBhdGg7XG4gIH1cblxuICBhc3luYyByZXN0b3JlTGFzdERpc2NhcmRJblRlbXBGaWxlcyhpc1NhZmUsIHBhcnRpYWxEaXNjYXJkRmlsZVBhdGggPSBudWxsKSB7XG4gICAgbGV0IGxhc3REaXNjYXJkU25hcHNob3RzID0gdGhpcy5nZXRMYXN0U25hcHNob3RzKHBhcnRpYWxEaXNjYXJkRmlsZVBhdGgpO1xuICAgIGlmIChwYXJ0aWFsRGlzY2FyZEZpbGVQYXRoKSB7XG4gICAgICBsYXN0RGlzY2FyZFNuYXBzaG90cyA9IGxhc3REaXNjYXJkU25hcHNob3RzID8gW2xhc3REaXNjYXJkU25hcHNob3RzXSA6IFtdO1xuICAgIH1cbiAgICBjb25zdCB0ZW1wRm9sZGVyUGF0aHMgPSBhd2FpdCB0aGlzLmV4cGFuZEJsb2JzVG9GaWxlc0luVGVtcEZvbGRlcihsYXN0RGlzY2FyZFNuYXBzaG90cyk7XG4gICAgaWYgKCFpc1NhZmUoKSkgeyByZXR1cm4gW107IH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5tZXJnZUZpbGVzKHRlbXBGb2xkZXJQYXRocyk7XG4gIH1cblxuICBhc3luYyBleHBhbmRCbG9ic1RvRmlsZXNJblRlbXBGb2xkZXIoc25hcHNob3RzKSB7XG4gICAgY29uc3QgdGVtcEZvbGRlclBhdGggPSBhd2FpdCBnZXRUZW1wRGlyKHtwcmVmaXg6ICdnaXRodWItZGlzY2FyZC1oaXN0b3J5LSd9KTtcbiAgICBjb25zdCBwYXRoUHJvbWlzZXMgPSBzbmFwc2hvdHMubWFwKGFzeW5jICh7ZmlsZVBhdGgsIGJlZm9yZVNoYSwgYWZ0ZXJTaGF9KSA9PiB7XG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUocGF0aC5qb2luKHRlbXBGb2xkZXJQYXRoLCBmaWxlUGF0aCkpO1xuICAgICAgYXdhaXQgbWtkaXJwKGRpcik7XG4gICAgICBjb25zdCB0aGVpcnNQYXRoID0gIWJlZm9yZVNoYSA/IG51bGwgOlxuICAgICAgICBhd2FpdCB0aGlzLmV4cGFuZEJsb2JUb0ZpbGUocGF0aC5qb2luKHRlbXBGb2xkZXJQYXRoLCBgJHtmaWxlUGF0aH0tYmVmb3JlLWRpc2NhcmRgKSwgYmVmb3JlU2hhKTtcbiAgICAgIGNvbnN0IGNvbW1vbkJhc2VQYXRoID0gIWFmdGVyU2hhID8gbnVsbCA6XG4gICAgICAgIGF3YWl0IHRoaXMuZXhwYW5kQmxvYlRvRmlsZShwYXRoLmpvaW4odGVtcEZvbGRlclBhdGgsIGAke2ZpbGVQYXRofS1hZnRlci1kaXNjYXJkYCksIGFmdGVyU2hhKTtcbiAgICAgIGNvbnN0IHJlc3VsdFBhdGggPSBwYXRoLmpvaW4oZGlyLCBgfiR7cGF0aC5iYXNlbmFtZShmaWxlUGF0aCl9LW1lcmdlLXJlc3VsdGApO1xuICAgICAgcmV0dXJuIHtmaWxlUGF0aCwgY29tbW9uQmFzZVBhdGgsIHRoZWlyc1BhdGgsIHJlc3VsdFBhdGgsIHRoZWlyc1NoYTogYmVmb3JlU2hhLCBjb21tb25CYXNlU2hhOiBhZnRlclNoYX07XG4gICAgfSk7XG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHBhdGhQcm9taXNlcyk7XG4gIH1cblxuICBhc3luYyBtZXJnZUZpbGVzKGZpbGVQYXRocykge1xuICAgIGNvbnN0IG1lcmdlRmlsZVByb21pc2VzID0gZmlsZVBhdGhzLm1hcChhc3luYyAoZmlsZVBhdGhJbmZvLCBpKSA9PiB7XG4gICAgICBjb25zdCB7ZmlsZVBhdGgsIGNvbW1vbkJhc2VQYXRoLCB0aGVpcnNQYXRoLCByZXN1bHRQYXRoLCB0aGVpcnNTaGEsIGNvbW1vbkJhc2VTaGF9ID0gZmlsZVBhdGhJbmZvO1xuICAgICAgY29uc3QgY3VycmVudFNoYSA9IGF3YWl0IHRoaXMuY3JlYXRlQmxvYih7ZmlsZVBhdGh9KTtcbiAgICAgIGxldCBtZXJnZVJlc3VsdDtcbiAgICAgIGlmICh0aGVpcnNQYXRoICYmIGNvbW1vbkJhc2VQYXRoKSB7XG4gICAgICAgIG1lcmdlUmVzdWx0ID0gYXdhaXQgdGhpcy5tZXJnZUZpbGUoZmlsZVBhdGgsIGNvbW1vbkJhc2VQYXRoLCB0aGVpcnNQYXRoLCByZXN1bHRQYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoZWlyc1BhdGggJiYgY29tbW9uQmFzZVBhdGgpIHsgLy8gZGVsZXRlZCBmaWxlXG4gICAgICAgIGNvbnN0IG91cnNTaGEgPSBhd2FpdCB0aGlzLmNyZWF0ZUJsb2Ioe2ZpbGVQYXRofSk7XG4gICAgICAgIGlmIChvdXJzU2hhID09PSBjb21tb25CYXNlU2hhKSB7IC8vIG5vIGNoYW5nZXMgc2luY2UgZGlzY2FyZCwgbWFyayBmaWxlIHRvIGJlIGRlbGV0ZWRcbiAgICAgICAgICBtZXJnZVJlc3VsdCA9IHtmaWxlUGF0aCwgcmVzdWx0UGF0aDogbnVsbCwgZGVsZXRlZDogdHJ1ZSwgY29uZmxpY3Q6IGZhbHNlfTtcbiAgICAgICAgfSBlbHNlIHsgLy8gY2hhbmdlcyBzaW5jZSBkaXNjYXJkIHJlc3VsdCBpbiBjb25mbGljdFxuICAgICAgICAgIGF3YWl0IGZzLmNvcHkocGF0aC5qb2luKHRoaXMud29ya2RpclBhdGgsIGZpbGVQYXRoKSwgcmVzdWx0UGF0aCk7XG4gICAgICAgICAgbWVyZ2VSZXN1bHQgPSB7ZmlsZVBhdGgsIHJlc3VsdFBhdGgsIGNvbmZsaWN0OiB0cnVlfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGVpcnNQYXRoICYmICFjb21tb25CYXNlUGF0aCkgeyAvLyBhZGRlZCBmaWxlXG4gICAgICAgIGNvbnN0IGZpbGVEb2VzRXhpc3QgPSBhd2FpdCBmaWxlRXhpc3RzKHBhdGguam9pbih0aGlzLndvcmtkaXJQYXRoLCBmaWxlUGF0aCkpO1xuICAgICAgICBpZiAoIWZpbGVEb2VzRXhpc3QpIHtcbiAgICAgICAgICBhd2FpdCBmcy5jb3B5KHRoZWlyc1BhdGgsIHJlc3VsdFBhdGgpO1xuICAgICAgICAgIG1lcmdlUmVzdWx0ID0ge2ZpbGVQYXRoLCByZXN1bHRQYXRoLCBjb25mbGljdDogZmFsc2V9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IGVtcHR5RmlsZVByb21pc2U7XG4gICAgICAgICAgbWVyZ2VSZXN1bHQgPSBhd2FpdCB0aGlzLm1lcmdlRmlsZShmaWxlUGF0aCwgZW1wdHlGaWxlUGF0aCwgdGhlaXJzUGF0aCwgcmVzdWx0UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9mIHRoZSBmb2xsb3dpbmcgbXVzdCBiZSBkZWZpbmVkIC0gdGhlaXJzUGF0aDonICtcbiAgICAgICAgICBgJHt0aGVpcnNQYXRofSBvciBjb21tb25CYXNlUGF0aDogJHtjb21tb25CYXNlUGF0aH1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7Li4ubWVyZ2VSZXN1bHQsIHRoZWlyc1NoYSwgY29tbW9uQmFzZVNoYSwgY3VycmVudFNoYX07XG4gICAgfSk7XG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKG1lcmdlRmlsZVByb21pc2VzKTtcbiAgfVxufVxuIl19