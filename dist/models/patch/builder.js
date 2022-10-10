"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildFilePatch = buildFilePatch;
exports.buildMultiFilePatch = buildMultiFilePatch;
exports.DEFAULT_OPTIONS = void 0;

var _patchBuffer = _interopRequireDefault(require("./patch-buffer"));

var _hunk = _interopRequireDefault(require("./hunk"));

var _file = _interopRequireWildcard(require("./file"));

var _patch = _interopRequireWildcard(require("./patch"));

var _region = require("./region");

var _filePatch = _interopRequireDefault(require("./file-patch"));

var _multiFilePatch = _interopRequireDefault(require("./multi-file-patch"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DEFAULT_OPTIONS = {
  // Number of lines after which we consider the diff "large"
  largeDiffThreshold: 800,
  // Map of file path (relative to repository root) to Patch render status (EXPANDED, COLLAPSED, DEFERRED)
  renderStatusOverrides: {},
  // Existing patch buffer to render onto
  patchBuffer: null,
  // Store off what-the-diff file patch
  preserveOriginal: false,
  // Paths of file patches that have been removed from the patch before parsing
  removed: new Set()
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

function buildFilePatch(diffs, options) {
  const opts = _objectSpread2({}, DEFAULT_OPTIONS, {}, options);

  const patchBuffer = new _patchBuffer.default();
  let filePatch;

  if (diffs.length === 0) {
    filePatch = emptyDiffFilePatch();
  } else if (diffs.length === 1) {
    filePatch = singleDiffFilePatch(diffs[0], patchBuffer, opts);
  } else if (diffs.length === 2) {
    filePatch = dualDiffFilePatch(diffs[0], diffs[1], patchBuffer, opts);
  } else {
    throw new Error(`Unexpected number of diffs: ${diffs.length}`);
  } // Delete the trailing newline.


  patchBuffer.deleteLastNewline();
  return new _multiFilePatch.default({
    patchBuffer,
    filePatches: [filePatch]
  });
}

function buildMultiFilePatch(diffs, options) {
  const opts = _objectSpread2({}, DEFAULT_OPTIONS, {}, options);

  const patchBuffer = new _patchBuffer.default();
  const byPath = new Map();
  const actions = [];
  let index = 0;

  for (const diff of diffs) {
    const thePath = diff.oldPath || diff.newPath;

    if (diff.status === 'added' || diff.status === 'deleted') {
      // Potential paired diff. Either a symlink deletion + content addition or a symlink addition +
      // content deletion.
      const otherHalf = byPath.get(thePath);

      if (otherHalf) {
        // The second half. Complete the paired diff, or fail if they have unexpected statuses or modes.
        const [otherDiff, otherIndex] = otherHalf;

        actions[otherIndex] = function (_diff, _otherDiff) {
          return () => dualDiffFilePatch(_diff, _otherDiff, patchBuffer, opts);
        }(diff, otherDiff);

        byPath.delete(thePath);
      } else {
        // The first half we've seen.
        byPath.set(thePath, [diff, index]);
        index++;
      }
    } else {
      actions[index] = function (_diff) {
        return () => singleDiffFilePatch(_diff, patchBuffer, opts);
      }(diff);

      index++;
    }
  } // Populate unpaired diffs that looked like they could be part of a pair, but weren't.


  for (const [unpairedDiff, originalIndex] of byPath.values()) {
    actions[originalIndex] = function (_unpairedDiff) {
      return () => singleDiffFilePatch(_unpairedDiff, patchBuffer, opts);
    }(unpairedDiff);
  }

  const filePatches = actions.map(action => action()); // Delete the final trailing newline from the last non-empty patch.

  patchBuffer.deleteLastNewline(); // Append hidden patches corresponding to each removed file.

  for (const removedPath of opts.removed) {
    const removedFile = new _file.default({
      path: removedPath
    });
    const removedMarker = patchBuffer.markPosition(_patch.default.layerName, patchBuffer.getBuffer().getEndPosition(), {
      invalidate: 'never',
      exclusive: false
    });
    filePatches.push(_filePatch.default.createHiddenFilePatch(removedFile, removedFile, removedMarker, _patch.REMOVED,
    /* istanbul ignore next */
    () => {
      throw new Error(`Attempt to expand removed file patch ${removedPath}`);
    }));
  }

  return new _multiFilePatch.default({
    patchBuffer,
    filePatches
  });
}

function emptyDiffFilePatch() {
  return _filePatch.default.createNull();
}

function singleDiffFilePatch(diff, patchBuffer, opts) {
  const wasSymlink = diff.oldMode === _file.default.modes.SYMLINK;
  const isSymlink = diff.newMode === _file.default.modes.SYMLINK;
  let oldSymlink = null;
  let newSymlink = null;

  if (wasSymlink && !isSymlink) {
    oldSymlink = diff.hunks[0].lines[0].slice(1);
  } else if (!wasSymlink && isSymlink) {
    newSymlink = diff.hunks[0].lines[0].slice(1);
  } else if (wasSymlink && isSymlink) {
    oldSymlink = diff.hunks[0].lines[0].slice(1);
    newSymlink = diff.hunks[0].lines[2].slice(1);
  }

  const oldFile = diff.oldPath !== null || diff.oldMode !== null ? new _file.default({
    path: diff.oldPath,
    mode: diff.oldMode,
    symlink: oldSymlink
  }) : _file.nullFile;
  const newFile = diff.newPath !== null || diff.newMode !== null ? new _file.default({
    path: diff.newPath,
    mode: diff.newMode,
    symlink: newSymlink
  }) : _file.nullFile;
  const renderStatusOverride = oldFile.isPresent() && opts.renderStatusOverrides[oldFile.getPath()] || newFile.isPresent() && opts.renderStatusOverrides[newFile.getPath()] || undefined;

  const renderStatus = renderStatusOverride || isDiffLarge([diff], opts) && _patch.DEFERRED || _patch.EXPANDED;

  if (!renderStatus.isVisible()) {
    const patchMarker = patchBuffer.markPosition(_patch.default.layerName, patchBuffer.getBuffer().getEndPosition(), {
      invalidate: 'never',
      exclusive: false
    });
    return _filePatch.default.createHiddenFilePatch(oldFile, newFile, patchMarker, renderStatus, () => {
      const subPatchBuffer = new _patchBuffer.default();
      const [hunks, nextPatchMarker] = buildHunks(diff, subPatchBuffer);
      const nextPatch = new _patch.default({
        status: diff.status,
        hunks,
        marker: nextPatchMarker
      });
      subPatchBuffer.deleteLastNewline();
      return {
        patch: nextPatch,
        patchBuffer: subPatchBuffer
      };
    });
  } else {
    const [hunks, patchMarker] = buildHunks(diff, patchBuffer);
    const patch = new _patch.default({
      status: diff.status,
      hunks,
      marker: patchMarker
    });
    const rawPatches = opts.preserveOriginal ? {
      content: diff
    } : null;
    return new _filePatch.default(oldFile, newFile, patch, rawPatches);
  }
}

function dualDiffFilePatch(diff1, diff2, patchBuffer, opts) {
  let modeChangeDiff, contentChangeDiff;

  if (diff1.oldMode === _file.default.modes.SYMLINK || diff1.newMode === _file.default.modes.SYMLINK) {
    modeChangeDiff = diff1;
    contentChangeDiff = diff2;
  } else {
    modeChangeDiff = diff2;
    contentChangeDiff = diff1;
  }

  const filePath = contentChangeDiff.oldPath || contentChangeDiff.newPath;
  const symlink = modeChangeDiff.hunks[0].lines[0].slice(1);
  let status;
  let oldMode, newMode;
  let oldSymlink = null;
  let newSymlink = null;

  if (modeChangeDiff.status === 'added') {
    // contents were deleted and replaced with symlink
    status = 'deleted';
    oldMode = contentChangeDiff.oldMode;
    newMode = modeChangeDiff.newMode;
    newSymlink = symlink;
  } else if (modeChangeDiff.status === 'deleted') {
    // contents were added after symlink was deleted
    status = 'added';
    oldMode = modeChangeDiff.oldMode;
    oldSymlink = symlink;
    newMode = contentChangeDiff.newMode;
  } else {
    throw new Error(`Invalid mode change diff status: ${modeChangeDiff.status}`);
  }

  const oldFile = new _file.default({
    path: filePath,
    mode: oldMode,
    symlink: oldSymlink
  });
  const newFile = new _file.default({
    path: filePath,
    mode: newMode,
    symlink: newSymlink
  });

  const renderStatus = opts.renderStatusOverrides[filePath] || isDiffLarge([contentChangeDiff], opts) && _patch.DEFERRED || _patch.EXPANDED;

  if (!renderStatus.isVisible()) {
    const patchMarker = patchBuffer.markPosition(_patch.default.layerName, patchBuffer.getBuffer().getEndPosition(), {
      invalidate: 'never',
      exclusive: false
    });
    return _filePatch.default.createHiddenFilePatch(oldFile, newFile, patchMarker, renderStatus, () => {
      const subPatchBuffer = new _patchBuffer.default();
      const [hunks, nextPatchMarker] = buildHunks(contentChangeDiff, subPatchBuffer);
      const nextPatch = new _patch.default({
        status,
        hunks,
        marker: nextPatchMarker
      });
      subPatchBuffer.deleteLastNewline();
      return {
        patch: nextPatch,
        patchBuffer: subPatchBuffer
      };
    });
  } else {
    const [hunks, patchMarker] = buildHunks(contentChangeDiff, patchBuffer);
    const patch = new _patch.default({
      status,
      hunks,
      marker: patchMarker
    });
    const rawPatches = opts.preserveOriginal ? {
      content: contentChangeDiff,
      mode: modeChangeDiff
    } : null;
    return new _filePatch.default(oldFile, newFile, patch, rawPatches);
  }
}

const CHANGEKIND = {
  '+': _region.Addition,
  '-': _region.Deletion,
  ' ': _region.Unchanged,
  '\\': _region.NoNewline
};

function buildHunks(diff, patchBuffer) {
  const inserter = patchBuffer.createInserterAtEnd().keepBefore(patchBuffer.findAllMarkers({
    endPosition: patchBuffer.getInsertionPoint()
  }));
  let patchMarker = null;
  let firstHunk = true;
  const hunks = [];
  inserter.markWhile(_patch.default.layerName, () => {
    for (const rawHunk of diff.hunks) {
      let firstRegion = true;
      const regions = []; // Separate hunks with an unmarked newline

      if (firstHunk) {
        firstHunk = false;
      } else {
        inserter.insert('\n');
      }

      inserter.markWhile(_hunk.default.layerName, () => {
        let firstRegionLine = true;
        let currentRegionText = '';
        let CurrentRegionKind = null;

        function finishRegion() {
          if (CurrentRegionKind === null) {
            return;
          } // Separate regions with an unmarked newline


          if (firstRegion) {
            firstRegion = false;
          } else {
            inserter.insert('\n');
          }

          inserter.insertMarked(currentRegionText, CurrentRegionKind.layerName, {
            invalidate: 'never',
            exclusive: false,
            callback: function (_regions, _CurrentRegionKind) {
              return regionMarker => {
                _regions.push(new _CurrentRegionKind(regionMarker));
              };
            }(regions, CurrentRegionKind)
          });
        }

        for (const rawLine of rawHunk.lines) {
          const NextRegionKind = CHANGEKIND[rawLine[0]];

          if (NextRegionKind === undefined) {
            throw new Error(`Unknown diff status character: "${rawLine[0]}"`);
          }

          const nextLine = rawLine.slice(1);
          let separator = '';

          if (firstRegionLine) {
            firstRegionLine = false;
          } else {
            separator = '\n';
          }

          if (NextRegionKind === CurrentRegionKind) {
            currentRegionText += separator + nextLine;
            continue;
          } else {
            finishRegion();
            CurrentRegionKind = NextRegionKind;
            currentRegionText = nextLine;
          }
        }

        finishRegion();
      }, {
        invalidate: 'never',
        exclusive: false,
        callback: function (_hunks, _rawHunk, _regions) {
          return hunkMarker => {
            _hunks.push(new _hunk.default({
              oldStartRow: _rawHunk.oldStartLine,
              newStartRow: _rawHunk.newStartLine,
              oldRowCount: _rawHunk.oldLineCount,
              newRowCount: _rawHunk.newLineCount,
              sectionHeading: _rawHunk.heading,
              marker: hunkMarker,
              regions: _regions
            }));
          };
        }(hunks, rawHunk, regions)
      });
    }
  }, {
    invalidate: 'never',
    exclusive: false,
    callback: marker => {
      patchMarker = marker;
    }
  }); // Separate multiple non-empty patches on the same buffer with an unmarked newline. The newline after the final
  // non-empty patch (if there is one) should be deleted before MultiFilePatch construction.

  if (diff.hunks.length > 0) {
    inserter.insert('\n');
  }

  inserter.apply();
  return [hunks, patchMarker];
}

function isDiffLarge(diffs, opts) {
  const size = diffs.reduce((diffSizeCounter, diff) => {
    return diffSizeCounter + diff.hunks.reduce((hunkSizeCounter, hunk) => {
      return hunkSizeCounter + hunk.lines.length;
    }, 0);
  }, 0);
  return size > opts.largeDiffThreshold;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvYnVpbGRlci5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX09QVElPTlMiLCJsYXJnZURpZmZUaHJlc2hvbGQiLCJyZW5kZXJTdGF0dXNPdmVycmlkZXMiLCJwYXRjaEJ1ZmZlciIsInByZXNlcnZlT3JpZ2luYWwiLCJyZW1vdmVkIiwiU2V0IiwiYnVpbGRGaWxlUGF0Y2giLCJkaWZmcyIsIm9wdGlvbnMiLCJvcHRzIiwiUGF0Y2hCdWZmZXIiLCJmaWxlUGF0Y2giLCJsZW5ndGgiLCJlbXB0eURpZmZGaWxlUGF0Y2giLCJzaW5nbGVEaWZmRmlsZVBhdGNoIiwiZHVhbERpZmZGaWxlUGF0Y2giLCJFcnJvciIsImRlbGV0ZUxhc3ROZXdsaW5lIiwiTXVsdGlGaWxlUGF0Y2giLCJmaWxlUGF0Y2hlcyIsImJ1aWxkTXVsdGlGaWxlUGF0Y2giLCJieVBhdGgiLCJNYXAiLCJhY3Rpb25zIiwiaW5kZXgiLCJkaWZmIiwidGhlUGF0aCIsIm9sZFBhdGgiLCJuZXdQYXRoIiwic3RhdHVzIiwib3RoZXJIYWxmIiwiZ2V0Iiwib3RoZXJEaWZmIiwib3RoZXJJbmRleCIsIl9kaWZmIiwiX290aGVyRGlmZiIsImRlbGV0ZSIsInNldCIsInVucGFpcmVkRGlmZiIsIm9yaWdpbmFsSW5kZXgiLCJ2YWx1ZXMiLCJfdW5wYWlyZWREaWZmIiwibWFwIiwiYWN0aW9uIiwicmVtb3ZlZFBhdGgiLCJyZW1vdmVkRmlsZSIsIkZpbGUiLCJwYXRoIiwicmVtb3ZlZE1hcmtlciIsIm1hcmtQb3NpdGlvbiIsIlBhdGNoIiwibGF5ZXJOYW1lIiwiZ2V0QnVmZmVyIiwiZ2V0RW5kUG9zaXRpb24iLCJpbnZhbGlkYXRlIiwiZXhjbHVzaXZlIiwicHVzaCIsIkZpbGVQYXRjaCIsImNyZWF0ZUhpZGRlbkZpbGVQYXRjaCIsIlJFTU9WRUQiLCJjcmVhdGVOdWxsIiwid2FzU3ltbGluayIsIm9sZE1vZGUiLCJtb2RlcyIsIlNZTUxJTksiLCJpc1N5bWxpbmsiLCJuZXdNb2RlIiwib2xkU3ltbGluayIsIm5ld1N5bWxpbmsiLCJodW5rcyIsImxpbmVzIiwic2xpY2UiLCJvbGRGaWxlIiwibW9kZSIsInN5bWxpbmsiLCJudWxsRmlsZSIsIm5ld0ZpbGUiLCJyZW5kZXJTdGF0dXNPdmVycmlkZSIsImlzUHJlc2VudCIsImdldFBhdGgiLCJ1bmRlZmluZWQiLCJyZW5kZXJTdGF0dXMiLCJpc0RpZmZMYXJnZSIsIkRFRkVSUkVEIiwiRVhQQU5ERUQiLCJpc1Zpc2libGUiLCJwYXRjaE1hcmtlciIsInN1YlBhdGNoQnVmZmVyIiwibmV4dFBhdGNoTWFya2VyIiwiYnVpbGRIdW5rcyIsIm5leHRQYXRjaCIsIm1hcmtlciIsInBhdGNoIiwicmF3UGF0Y2hlcyIsImNvbnRlbnQiLCJkaWZmMSIsImRpZmYyIiwibW9kZUNoYW5nZURpZmYiLCJjb250ZW50Q2hhbmdlRGlmZiIsImZpbGVQYXRoIiwiQ0hBTkdFS0lORCIsIkFkZGl0aW9uIiwiRGVsZXRpb24iLCJVbmNoYW5nZWQiLCJOb05ld2xpbmUiLCJpbnNlcnRlciIsImNyZWF0ZUluc2VydGVyQXRFbmQiLCJrZWVwQmVmb3JlIiwiZmluZEFsbE1hcmtlcnMiLCJlbmRQb3NpdGlvbiIsImdldEluc2VydGlvblBvaW50IiwiZmlyc3RIdW5rIiwibWFya1doaWxlIiwicmF3SHVuayIsImZpcnN0UmVnaW9uIiwicmVnaW9ucyIsImluc2VydCIsIkh1bmsiLCJmaXJzdFJlZ2lvbkxpbmUiLCJjdXJyZW50UmVnaW9uVGV4dCIsIkN1cnJlbnRSZWdpb25LaW5kIiwiZmluaXNoUmVnaW9uIiwiaW5zZXJ0TWFya2VkIiwiY2FsbGJhY2siLCJfcmVnaW9ucyIsIl9DdXJyZW50UmVnaW9uS2luZCIsInJlZ2lvbk1hcmtlciIsInJhd0xpbmUiLCJOZXh0UmVnaW9uS2luZCIsIm5leHRMaW5lIiwic2VwYXJhdG9yIiwiX2h1bmtzIiwiX3Jhd0h1bmsiLCJodW5rTWFya2VyIiwib2xkU3RhcnRSb3ciLCJvbGRTdGFydExpbmUiLCJuZXdTdGFydFJvdyIsIm5ld1N0YXJ0TGluZSIsIm9sZFJvd0NvdW50Iiwib2xkTGluZUNvdW50IiwibmV3Um93Q291bnQiLCJuZXdMaW5lQ291bnQiLCJzZWN0aW9uSGVhZGluZyIsImhlYWRpbmciLCJhcHBseSIsInNpemUiLCJyZWR1Y2UiLCJkaWZmU2l6ZUNvdW50ZXIiLCJodW5rU2l6ZUNvdW50ZXIiLCJodW5rIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVPLE1BQU1BLGVBQWUsR0FBRztBQUM3QjtBQUNBQyxFQUFBQSxrQkFBa0IsRUFBRSxHQUZTO0FBSTdCO0FBQ0FDLEVBQUFBLHFCQUFxQixFQUFFLEVBTE07QUFPN0I7QUFDQUMsRUFBQUEsV0FBVyxFQUFFLElBUmdCO0FBVTdCO0FBQ0FDLEVBQUFBLGdCQUFnQixFQUFFLEtBWFc7QUFhN0I7QUFDQUMsRUFBQUEsT0FBTyxFQUFFLElBQUlDLEdBQUo7QUFkb0IsQ0FBeEI7OztBQWlCQSxTQUFTQyxjQUFULENBQXdCQyxLQUF4QixFQUErQkMsT0FBL0IsRUFBd0M7QUFDN0MsUUFBTUMsSUFBSSxzQkFBT1YsZUFBUCxNQUEyQlMsT0FBM0IsQ0FBVjs7QUFDQSxRQUFNTixXQUFXLEdBQUcsSUFBSVEsb0JBQUosRUFBcEI7QUFFQSxNQUFJQyxTQUFKOztBQUNBLE1BQUlKLEtBQUssQ0FBQ0ssTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUN0QkQsSUFBQUEsU0FBUyxHQUFHRSxrQkFBa0IsRUFBOUI7QUFDRCxHQUZELE1BRU8sSUFBSU4sS0FBSyxDQUFDSyxNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQzdCRCxJQUFBQSxTQUFTLEdBQUdHLG1CQUFtQixDQUFDUCxLQUFLLENBQUMsQ0FBRCxDQUFOLEVBQVdMLFdBQVgsRUFBd0JPLElBQXhCLENBQS9CO0FBQ0QsR0FGTSxNQUVBLElBQUlGLEtBQUssQ0FBQ0ssTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUM3QkQs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QjFILElBQWxCLEtBQTJCO0FBQ25ELFdBQU8wSCxlQUFlLEdBQUcxSCxJQUFJLENBQUM0QyxLQUFMLENBQVc2RSxNQUFYLENBQWtCLENBQUNFLGVBQUQsRUFBa0JDLElBQWxCLEtBQTJCO0FBQ3BFLGFBQU9ELGVBQWUsR0FBR0MsSUFBSSxDQUFDL0UsS0FBTCxDQUFXMUQsTUFBcEM7QUFDRCxLQUZ3QixFQUV0QixDQUZzQixDQUF6QjtBQUdELEdBSlksRUFJVixDQUpVLENBQWI7QUFNQSxTQUFPcUksSUFBSSxHQUFHeEksSUFBSSxDQUFDVCxrQkFBbkI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQYXRjaEJ1ZmZlciBmcm9tICcuL3BhdGNoLWJ1ZmZlcic7XG5pbXBvcnQgSHVuayBmcm9tICcuL2h1bmsnO1xuaW1wb3J0IEZpbGUsIHtudWxsRmlsZX0gZnJvbSAnLi9maWxlJztcbmltcG9ydCBQYXRjaCwge0RFRkVSUkVELCBFWFBBTkRFRCwgUkVNT1ZFRH0gZnJvbSAnLi9wYXRjaCc7XG5pbXBvcnQge1VuY2hhbmdlZCwgQWRkaXRpb24sIERlbGV0aW9uLCBOb05ld2xpbmV9IGZyb20gJy4vcmVnaW9uJztcbmltcG9ydCBGaWxlUGF0Y2ggZnJvbSAnLi9maWxlLXBhdGNoJztcbmltcG9ydCBNdWx0aUZpbGVQYXRjaCBmcm9tICcuL211bHRpLWZpbGUtcGF0Y2gnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICAvLyBOdW1iZXIgb2YgbGluZXMgYWZ0ZXIgd2hpY2ggd2UgY29uc2lkZXIgdGhlIGRpZmYgXCJsYXJnZVwiXG4gIGxhcmdlRGlmZlRocmVzaG9sZDogODAwLFxuXG4gIC8vIE1hcCBvZiBmaWxlIHBhdGggKHJlbGF0aXZlIHRvIHJlcG9zaXRvcnkgcm9vdCkgdG8gUGF0Y2ggcmVuZGVyIHN0YXR1cyAoRVhQQU5ERUQsIENPTExBUFNFRCwgREVGRVJSRUQpXG4gIHJlbmRlclN0YXR1c092ZXJyaWRlczoge30sXG5cbiAgLy8gRXhpc3RpbmcgcGF0Y2ggYnVmZmVyIHRvIHJlbmRlciBvbnRvXG4gIHBhdGNoQnVmZmVyOiBudWxsLFxuXG4gIC8vIFN0b3JlIG9mZiB3aGF0LXRoZS1kaWZmIGZpbGUgcGF0Y2hcbiAgcHJlc2VydmVPcmlnaW5hbDogZmFsc2UsXG5cbiAgLy8gUGF0aHMgb2YgZmlsZSBwYXRjaGVzIHRoYXQgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgcGF0Y2ggYmVmb3JlIHBhcnNpbmdcbiAgcmVtb3ZlZDogbmV3IFNldCgpLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRmlsZVBhdGNoKGRpZmZzLCBvcHRpb25zKSB7XG4gIGNvbnN0IG9wdHMgPSB7Li4uREVGQVVMVF9PUFRJT05TLCAuLi5vcHRpb25zfTtcbiAgY29uc3QgcGF0Y2hCdWZmZXIgPSBuZXcgUGF0Y2hCdWZmZXIoKTtcblxuICBsZXQgZmlsZVBhdGNoO1xuICBpZiAoZGlmZnMubGVuZ3RoID09PSAwKSB7XG4gICAgZmlsZVBhdGNoID0gZW1wdHlEaWZmRmlsZVBhdGNoKCk7XG4gIH0gZWxzZSBpZiAoZGlmZnMubGVuZ3RoID09PSAxKSB7XG4gICAgZmlsZVBhdGNoID0gc2luZ2xlRGlmZkZpbGVQYXRjaChkaWZmc1swXSwgcGF0Y2hCdWZmZXIsIG9wdHMpO1xuICB9IGVsc2UgaWYgKGRpZmZzLmxlbmd0aCA9PT0gMikge1xuICAgIGZpbGVQYXRjaCA9IGR1YWxEaWZmRmlsZVBhdGNoKGRpZmZzWzBdLCBkaWZmc1sxXSwgcGF0Y2hCdWZmZXIsIG9wdHMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBudW1iZXIgb2YgZGlmZnM6ICR7ZGlmZnMubGVuZ3RofWApO1xuICB9XG5cbiAgLy8gRGVsZXRlIHRoZSB0cmFpbGluZyBuZXdsaW5lLlxuICBwYXRjaEJ1ZmZlci5kZWxldGVMYXN0TmV3bGluZSgpO1xuXG4gIHJldHVybiBuZXcgTXVsdGlGaWxlUGF0Y2goe3BhdGNoQnVmZmVyLCBmaWxlUGF0Y2hlczogW2ZpbGVQYXRjaF19KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTXVsdGlGaWxlUGF0Y2goZGlmZnMsIG9wdGlvbnMpIHtcbiAgY29uc3Qgb3B0cyA9IHsuLi5ERUZBVUxUX09QVElPTlMsIC4uLm9wdGlvbnN9O1xuXG4gIGNvbnN0IHBhdGNoQnVmZmVyID0gbmV3IFBhdGNoQnVmZmVyKCk7XG5cbiAgY29uc3QgYnlQYXRoID0gbmV3IE1hcCgpO1xuICBjb25zdCBhY3Rpb25zID0gW107XG5cbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChjb25zdCBkaWZmIG9mIGRpZmZzKSB7XG4gICAgY29uc3QgdGhlUGF0aCA9IGRpZmYub2xkUGF0aCB8fCBkaWZmLm5ld1BhdGg7XG5cbiAgICBpZiAoZGlmZi5zdGF0dXMgPT09ICdhZGRlZCcgfHwgZGlmZi5zdGF0dXMgPT09ICdkZWxldGVkJykge1xuICAgICAgLy8gUG90ZW50aWFsIHBhaXJlZCBkaWZmLiBFaXRoZXIgYSBzeW1saW5rIGRlbGV0aW9uICsgY29udGVudCBhZGRpdGlvbiBvciBhIHN5bWxpbmsgYWRkaXRpb24gK1xuICAgICAgLy8gY29udGVudCBkZWxldGlvbi5cbiAgICAgIGNvbnN0IG90aGVySGFsZiA9IGJ5UGF0aC5nZXQodGhlUGF0aCk7XG4gICAgICBpZiAob3RoZXJIYWxmKSB7XG4gICAgICAgIC8vIFRoZSBzZWNvbmQgaGFsZi4gQ29tcGxldGUgdGhlIHBhaXJlZCBkaWZmLCBvciBmYWlsIGlmIHRoZXkgaGF2ZSB1bmV4cGVjdGVkIHN0YXR1c2VzIG9yIG1vZGVzLlxuICAgICAgICBjb25zdCBbb3RoZXJEaWZmLCBvdGhlckluZGV4XSA9IG90aGVySGFsZjtcbiAgICAgICAgYWN0aW9uc1tvdGhlckluZGV4XSA9IChmdW5jdGlvbihfZGlmZiwgX290aGVyRGlmZikge1xuICAgICAgICAgIHJldHVybiAoKSA9PiBkdWFsRGlmZkZpbGVQYXRjaChfZGlmZiwgX290aGVyRGlmZiwgcGF0Y2hCdWZmZXIsIG9wdHMpO1xuICAgICAgICB9KShkaWZmLCBvdGhlckRpZmYpO1xuICAgICAgICBieVBhdGguZGVsZXRlKHRoZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IGhhbGYgd2UndmUgc2Vlbi5cbiAgICAgICAgYnlQYXRoLnNldCh0aGVQYXRoLCBbZGlmZiwgaW5kZXhdKTtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uc1tpbmRleF0gPSAoZnVuY3Rpb24oX2RpZmYpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHNpbmdsZURpZmZGaWxlUGF0Y2goX2RpZmYsIHBhdGNoQnVmZmVyLCBvcHRzKTtcbiAgICAgIH0pKGRpZmYpO1xuICAgICAgaW5kZXgrKztcbiAgICB9XG4gIH1cblxuICAvLyBQb3B1bGF0ZSB1bnBhaXJlZCBkaWZmcyB0aGF0IGxvb2tlZCBsaWtlIHRoZXkgY291bGQgYmUgcGFydCBvZiBhIHBhaXIsIGJ1dCB3ZXJlbid0LlxuICBmb3IgKGNvbnN0IFt1bnBhaXJlZERpZmYsIG9yaWdpbmFsSW5kZXhdIG9mIGJ5UGF0aC52YWx1ZXMoKSkge1xuICAgIGFjdGlvbnNbb3JpZ2luYWxJbmRleF0gPSAoZnVuY3Rpb24oX3VucGFpcmVkRGlmZikge1xuICAgICAgcmV0dXJuICgpID0+IHNpbmdsZURpZmZGaWxlUGF0Y2goX3VucGFpcmVkRGlmZiwgcGF0Y2hCdWZmZXIsIG9wdHMpO1xuICAgIH0pKHVucGFpcmVkRGlmZik7XG4gIH1cblxuICBjb25zdCBmaWxlUGF0Y2hlcyA9IGFjdGlvbnMubWFwKGFjdGlvbiA9PiBhY3Rpb24oKSk7XG5cbiAgLy8gRGVsZXRlIHRoZSBmaW5hbCB0cmFpbGluZyBuZXdsaW5lIGZyb20gdGhlIGxhc3Qgbm9uLWVtcHR5IHBhdGNoLlxuICBwYXRjaEJ1ZmZlci5kZWxldGVMYXN0TmV3bGluZSgpO1xuXG4gIC8vIEFwcGVuZCBoaWRkZW4gcGF0Y2hlcyBjb3JyZXNwb25kaW5nIHRvIGVhY2ggcmVtb3ZlZCBmaWxlLlxuICBmb3IgKGNvbnN0IHJlbW92ZWRQYXRoIG9mIG9wdHMucmVtb3ZlZCkge1xuICAgIGNvbnN0IHJlbW92ZWRGaWxlID0gbmV3IEZpbGUoe3BhdGg6IHJlbW92ZWRQYXRofSk7XG4gICAgY29uc3QgcmVtb3ZlZE1hcmtlciA9IHBhdGNoQnVmZmVyLm1hcmtQb3NpdGlvbihcbiAgICAgIFBhdGNoLmxheWVyTmFtZSxcbiAgICAgIHBhdGNoQnVmZmVyLmdldEJ1ZmZlcigpLmdldEVuZFBvc2l0aW9uKCksXG4gICAgICB7aW52YWxpZGF0ZTogJ25ldmVyJywgZXhjbHVzaXZlOiBmYWxzZX0sXG4gICAgKTtcbiAgICBmaWxlUGF0Y2hlcy5wdXNoKEZpbGVQYXRjaC5jcmVhdGVIaWRkZW5GaWxlUGF0Y2goXG4gICAgICByZW1vdmVkRmlsZSxcbiAgICAgIHJlbW92ZWRGaWxlLFxuICAgICAgcmVtb3ZlZE1hcmtlcixcbiAgICAgIFJFTU9WRUQsXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoYEF0dGVtcHQgdG8gZXhwYW5kIHJlbW92ZWQgZmlsZSBwYXRjaCAke3JlbW92ZWRQYXRofWApOyB9LFxuICAgICkpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBNdWx0aUZpbGVQYXRjaCh7cGF0Y2hCdWZmZXIsIGZpbGVQYXRjaGVzfSk7XG59XG5cbmZ1bmN0aW9uIGVtcHR5RGlmZkZpbGVQYXRjaCgpIHtcbiAgcmV0dXJuIEZpbGVQYXRjaC5jcmVhdGVOdWxsKCk7XG59XG5cbmZ1bmN0aW9uIHNpbmdsZURpZmZGaWxlUGF0Y2goZGlmZiwgcGF0Y2hCdWZmZXIsIG9wdHMpIHtcbiAgY29uc3Qgd2FzU3ltbGluayA9IGRpZmYub2xkTW9kZSA9PT0gRmlsZS5tb2Rlcy5TWU1MSU5LO1xuICBjb25zdCBpc1N5bWxpbmsgPSBkaWZmLm5ld01vZGUgPT09IEZpbGUubW9kZXMuU1lNTElOSztcblxuICBsZXQgb2xkU3ltbGluayA9IG51bGw7XG4gIGxldCBuZXdTeW1saW5rID0gbnVsbDtcbiAgaWYgKHdhc1N5bWxpbmsgJiYgIWlzU3ltbGluaykge1xuICAgIG9sZFN5bWxpbmsgPSBkaWZmLmh1bmtzWzBdLmxpbmVzWzBdLnNsaWNlKDEpO1xuICB9IGVsc2UgaWYgKCF3YXNTeW1saW5rICYmIGlzU3ltbGluaykge1xuICAgIG5ld1N5bWxpbmsgPSBkaWZmLmh1bmtzWzBdLmxpbmVzWzBdLnNsaWNlKDEpO1xuICB9IGVsc2UgaWYgKHdhc1N5bWxpbmsgJiYgaXNTeW1saW5rKSB7XG4gICAgb2xkU3ltbGluayA9IGRpZmYuaHVua3NbMF0ubGluZXNbMF0uc2xpY2UoMSk7XG4gICAgbmV3U3ltbGluayA9IGRpZmYuaHVua3NbMF0ubGluZXNbMl0uc2xpY2UoMSk7XG4gIH1cblxuICBjb25zdCBvbGRGaWxlID0gZGlmZi5vbGRQYXRoICE9PSBudWxsIHx8IGRpZmYub2xkTW9kZSAhPT0gbnVsbFxuICAgID8gbmV3IEZpbGUoe3BhdGg6IGRpZmYub2xkUGF0aCwgbW9kZTogZGlmZi5vbGRNb2RlLCBzeW1saW5rOiBvbGRTeW1saW5rfSlcbiAgICA6IG51bGxGaWxlO1xuICBjb25zdCBuZXdGaWxlID0gZGlmZi5uZXdQYXRoICE9PSBudWxsIHx8IGRpZmYubmV3TW9kZSAhPT0gbnVsbFxuICAgID8gbmV3IEZpbGUoe3BhdGg6IGRpZmYubmV3UGF0aCwgbW9kZTogZGlmZi5uZXdNb2RlLCBzeW1saW5rOiBuZXdTeW1saW5rfSlcbiAgICA6IG51bGxGaWxlO1xuXG4gIGNvbnN0IHJlbmRlclN0YXR1c092ZXJyaWRlID1cbiAgICAob2xkRmlsZS5pc1ByZXNlbnQoKSAmJiBvcHRzLnJlbmRlclN0YXR1c092ZXJyaWRlc1tvbGRGaWxlLmdldFBhdGgoKV0pIHx8XG4gICAgKG5ld0ZpbGUuaXNQcmVzZW50KCkgJiYgb3B0cy5yZW5kZXJTdGF0dXNPdmVycmlkZXNbbmV3RmlsZS5nZXRQYXRoKCldKSB8fFxuICAgIHVuZGVmaW5lZDtcblxuICBjb25zdCByZW5kZXJTdGF0dXMgPSByZW5kZXJTdGF0dXNPdmVycmlkZSB8fFxuICAgIChpc0RpZmZMYXJnZShbZGlmZl0sIG9wdHMpICYmIERFRkVSUkVEKSB8fFxuICAgIEVYUEFOREVEO1xuXG4gIGlmICghcmVuZGVyU3RhdHVzLmlzVmlzaWJsZSgpKSB7XG4gICAgY29uc3QgcGF0Y2hNYXJrZXIgPSBwYXRjaEJ1ZmZlci5tYXJrUG9zaXRpb24oXG4gICAgICBQYXRjaC5sYXllck5hbWUsXG4gICAgICBwYXRjaEJ1ZmZlci5nZXRCdWZmZXIoKS5nZXRFbmRQb3NpdGlvbigpLFxuICAgICAge2ludmFsaWRhdGU6ICduZXZlcicsIGV4Y2x1c2l2ZTogZmFsc2V9LFxuICAgICk7XG5cbiAgICByZXR1cm4gRmlsZVBhdGNoLmNyZWF0ZUhpZGRlbkZpbGVQYXRjaChcbiAgICAgIG9sZEZpbGUsIG5ld0ZpbGUsIHBhdGNoTWFya2VyLCByZW5kZXJTdGF0dXMsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YlBhdGNoQnVmZmVyID0gbmV3IFBhdGNoQnVmZmVyKCk7XG4gICAgICAgIGNvbnN0IFtodW5rcywgbmV4dFBhdGNoTWFya2VyXSA9IGJ1aWxkSHVua3MoZGlmZiwgc3ViUGF0Y2hCdWZmZXIpO1xuICAgICAgICBjb25zdCBuZXh0UGF0Y2ggPSBuZXcgUGF0Y2goe3N0YXR1czogZGlmZi5zdGF0dXMsIGh1bmtzLCBtYXJrZXI6IG5leHRQYXRjaE1hcmtlcn0pO1xuXG4gICAgICAgIHN1YlBhdGNoQnVmZmVyLmRlbGV0ZUxhc3ROZXdsaW5lKCk7XG4gICAgICAgIHJldHVybiB7cGF0Y2g6IG5leHRQYXRjaCwgcGF0Y2hCdWZmZXI6IHN1YlBhdGNoQnVmZmVyfTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBbaHVua3MsIHBhdGNoTWFya2VyXSA9IGJ1aWxkSHVua3MoZGlmZiwgcGF0Y2hCdWZmZXIpO1xuICAgIGNvbnN0IHBhdGNoID0gbmV3IFBhdGNoKHtzdGF0dXM6IGRpZmYuc3RhdHVzLCBodW5rcywgbWFya2VyOiBwYXRjaE1hcmtlcn0pO1xuXG4gICAgY29uc3QgcmF3UGF0Y2hlcyA9IG9wdHMucHJlc2VydmVPcmlnaW5hbCA/IHtjb250ZW50OiBkaWZmfSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBGaWxlUGF0Y2gob2xkRmlsZSwgbmV3RmlsZSwgcGF0Y2gsIHJhd1BhdGNoZXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGR1YWxEaWZmRmlsZVBhdGNoKGRpZmYxLCBkaWZmMiwgcGF0Y2hCdWZmZXIsIG9wdHMpIHtcbiAgbGV0IG1vZGVDaGFuZ2VEaWZmLCBjb250ZW50Q2hhbmdlRGlmZjtcbiAgaWYgKGRpZmYxLm9sZE1vZGUgPT09IEZpbGUubW9kZXMuU1lNTElOSyB8fCBkaWZmMS5uZXdNb2RlID09PSBGaWxlLm1vZGVzLlNZTUxJTkspIHtcbiAgICBtb2RlQ2hhbmdlRGlmZiA9IGRpZmYxO1xuICAgIGNvbnRlbnRDaGFuZ2VEaWZmID0gZGlmZjI7XG4gIH0gZWxzZSB7XG4gICAgbW9kZUNoYW5nZURpZmYgPSBkaWZmMjtcbiAgICBjb250ZW50Q2hhbmdlRGlmZiA9IGRpZmYxO1xuICB9XG5cbiAgY29uc3QgZmlsZVBhdGggPSBjb250ZW50Q2hhbmdlRGlmZi5vbGRQYXRoIHx8IGNvbnRlbnRDaGFuZ2VEaWZmLm5ld1BhdGg7XG4gIGNvbnN0IHN5bWxpbmsgPSBtb2RlQ2hhbmdlRGlmZi5odW5rc1swXS5saW5lc1swXS5zbGljZSgxKTtcblxuICBsZXQgc3RhdHVzO1xuICBsZXQgb2xkTW9kZSwgbmV3TW9kZTtcbiAgbGV0IG9sZFN5bWxpbmsgPSBudWxsO1xuICBsZXQgbmV3U3ltbGluayA9IG51bGw7XG4gIGlmIChtb2RlQ2hhbmdlRGlmZi5zdGF0dXMgPT09ICdhZGRlZCcpIHtcbiAgICAvLyBjb250ZW50cyB3ZXJlIGRlbGV0ZWQgYW5kIHJlcGxhY2VkIHdpdGggc3ltbGlua1xuICAgIHN0YXR1cyA9ICdkZWxldGVkJztcbiAgICBvbGRNb2RlID0gY29udGVudENoYW5nZURpZmYub2xkTW9kZTtcbiAgICBuZXdNb2RlID0gbW9kZUNoYW5nZURpZmYubmV3TW9kZTtcbiAgICBuZXdTeW1saW5rID0gc3ltbGluaztcbiAgfSBlbHNlIGlmIChtb2RlQ2hhbmdlRGlmZi5zdGF0dXMgPT09ICdkZWxldGVkJykge1xuICAgIC8vIGNvbnRlbnRzIHdlcmUgYWRkZWQgYWZ0ZXIgc3ltbGluayB3YXMgZGVsZXRlZFxuICAgIHN0YXR1cyA9ICdhZGRlZCc7XG4gICAgb2xkTW9kZSA9IG1vZGVDaGFuZ2VEaWZmLm9sZE1vZGU7XG4gICAgb2xkU3ltbGluayA9IHN5bWxpbms7XG4gICAgbmV3TW9kZSA9IGNvbnRlbnRDaGFuZ2VEaWZmLm5ld01vZGU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG1vZGUgY2hhbmdlIGRpZmYgc3RhdHVzOiAke21vZGVDaGFuZ2VEaWZmLnN0YXR1c31gKTtcbiAgfVxuXG4gIGNvbnN0IG9sZEZpbGUgPSBuZXcgRmlsZSh7cGF0aDogZmlsZVBhdGgsIG1vZGU6IG9sZE1vZGUsIHN5bWxpbms6IG9sZFN5bWxpbmt9KTtcbiAgY29uc3QgbmV3RmlsZSA9IG5ldyBGaWxlKHtwYXRoOiBmaWxlUGF0aCwgbW9kZTogbmV3TW9kZSwgc3ltbGluazogbmV3U3ltbGlua30pO1xuXG4gIGNvbnN0IHJlbmRlclN0YXR1cyA9IG9wdHMucmVuZGVyU3RhdHVzT3ZlcnJpZGVzW2ZpbGVQYXRoXSB8fFxuICAgIChpc0RpZmZMYXJnZShbY29udGVudENoYW5nZURpZmZdLCBvcHRzKSAmJiBERUZFUlJFRCkgfHxcbiAgICBFWFBBTkRFRDtcblxuICBpZiAoIXJlbmRlclN0YXR1cy5pc1Zpc2libGUoKSkge1xuICAgIGNvbnN0IHBhdGNoTWFya2VyID0gcGF0Y2hCdWZmZXIubWFya1Bvc2l0aW9uKFxuICAgICAgUGF0Y2gubGF5ZXJOYW1lLFxuICAgICAgcGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuZ2V0RW5kUG9zaXRpb24oKSxcbiAgICAgIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBleGNsdXNpdmU6IGZhbHNlfSxcbiAgICApO1xuXG4gICAgcmV0dXJuIEZpbGVQYXRjaC5jcmVhdGVIaWRkZW5GaWxlUGF0Y2goXG4gICAgICBvbGRGaWxlLCBuZXdGaWxlLCBwYXRjaE1hcmtlciwgcmVuZGVyU3RhdHVzLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJQYXRjaEJ1ZmZlciA9IG5ldyBQYXRjaEJ1ZmZlcigpO1xuICAgICAgICBjb25zdCBbaHVua3MsIG5leHRQYXRjaE1hcmtlcl0gPSBidWlsZEh1bmtzKGNvbnRlbnRDaGFuZ2VEaWZmLCBzdWJQYXRjaEJ1ZmZlcik7XG4gICAgICAgIGNvbnN0IG5leHRQYXRjaCA9IG5ldyBQYXRjaCh7c3RhdHVzLCBodW5rcywgbWFya2VyOiBuZXh0UGF0Y2hNYXJrZXJ9KTtcblxuICAgICAgICBzdWJQYXRjaEJ1ZmZlci5kZWxldGVMYXN0TmV3bGluZSgpO1xuICAgICAgICByZXR1cm4ge3BhdGNoOiBuZXh0UGF0Y2gsIHBhdGNoQnVmZmVyOiBzdWJQYXRjaEJ1ZmZlcn07XG4gICAgICB9LFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgW2h1bmtzLCBwYXRjaE1hcmtlcl0gPSBidWlsZEh1bmtzKGNvbnRlbnRDaGFuZ2VEaWZmLCBwYXRjaEJ1ZmZlcik7XG4gICAgY29uc3QgcGF0Y2ggPSBuZXcgUGF0Y2goe3N0YXR1cywgaHVua3MsIG1hcmtlcjogcGF0Y2hNYXJrZXJ9KTtcblxuICAgIGNvbnN0IHJhd1BhdGNoZXMgPSBvcHRzLnByZXNlcnZlT3JpZ2luYWwgPyB7Y29udGVudDogY29udGVudENoYW5nZURpZmYsIG1vZGU6IG1vZGVDaGFuZ2VEaWZmfSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBGaWxlUGF0Y2gob2xkRmlsZSwgbmV3RmlsZSwgcGF0Y2gsIHJhd1BhdGNoZXMpO1xuICB9XG59XG5cbmNvbnN0IENIQU5HRUtJTkQgPSB7XG4gICcrJzogQWRkaXRpb24sXG4gICctJzogRGVsZXRpb24sXG4gICcgJzogVW5jaGFuZ2VkLFxuICAnXFxcXCc6IE5vTmV3bGluZSxcbn07XG5cbmZ1bmN0aW9uIGJ1aWxkSHVua3MoZGlmZiwgcGF0Y2hCdWZmZXIpIHtcbiAgY29uc3QgaW5zZXJ0ZXIgPSBwYXRjaEJ1ZmZlci5jcmVhdGVJbnNlcnRlckF0RW5kKClcbiAgICAua2VlcEJlZm9yZShwYXRjaEJ1ZmZlci5maW5kQWxsTWFya2Vycyh7ZW5kUG9zaXRpb246IHBhdGNoQnVmZmVyLmdldEluc2VydGlvblBvaW50KCl9KSk7XG5cbiAgbGV0IHBhdGNoTWFya2VyID0gbnVsbDtcbiAgbGV0IGZpcnN0SHVuayA9IHRydWU7XG4gIGNvbnN0IGh1bmtzID0gW107XG5cbiAgaW5zZXJ0ZXIubWFya1doaWxlKFBhdGNoLmxheWVyTmFtZSwgKCkgPT4ge1xuICAgIGZvciAoY29uc3QgcmF3SHVuayBvZiBkaWZmLmh1bmtzKSB7XG4gICAgICBsZXQgZmlyc3RSZWdpb24gPSB0cnVlO1xuICAgICAgY29uc3QgcmVnaW9ucyA9IFtdO1xuXG4gICAgICAvLyBTZXBhcmF0ZSBodW5rcyB3aXRoIGFuIHVubWFya2VkIG5ld2xpbmVcbiAgICAgIGlmIChmaXJzdEh1bmspIHtcbiAgICAgICAgZmlyc3RIdW5rID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnNlcnRlci5pbnNlcnQoJ1xcbicpO1xuICAgICAgfVxuXG4gICAgICBpbnNlcnRlci5tYXJrV2hpbGUoSHVuay5sYXllck5hbWUsICgpID0+IHtcbiAgICAgICAgbGV0IGZpcnN0UmVnaW9uTGluZSA9IHRydWU7XG4gICAgICAgIGxldCBjdXJyZW50UmVnaW9uVGV4dCA9ICcnO1xuICAgICAgICBsZXQgQ3VycmVudFJlZ2lvbktpbmQgPSBudWxsO1xuXG4gICAgICAgIGZ1bmN0aW9uIGZpbmlzaFJlZ2lvbigpIHtcbiAgICAgICAgICBpZiAoQ3VycmVudFJlZ2lvbktpbmQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTZXBhcmF0ZSByZWdpb25zIHdpdGggYW4gdW5tYXJrZWQgbmV3bGluZVxuICAgICAgICAgIGlmIChmaXJzdFJlZ2lvbikge1xuICAgICAgICAgICAgZmlyc3RSZWdpb24gPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5zZXJ0ZXIuaW5zZXJ0KCdcXG4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbnNlcnRlci5pbnNlcnRNYXJrZWQoY3VycmVudFJlZ2lvblRleHQsIEN1cnJlbnRSZWdpb25LaW5kLmxheWVyTmFtZSwge1xuICAgICAgICAgICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICAgICAgICAgIGV4Y2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBjYWxsYmFjazogKGZ1bmN0aW9uKF9yZWdpb25zLCBfQ3VycmVudFJlZ2lvbktpbmQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbk1hcmtlciA9PiB7IF9yZWdpb25zLnB1c2gobmV3IF9DdXJyZW50UmVnaW9uS2luZChyZWdpb25NYXJrZXIpKTsgfTtcbiAgICAgICAgICAgIH0pKHJlZ2lvbnMsIEN1cnJlbnRSZWdpb25LaW5kKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgcmF3TGluZSBvZiByYXdIdW5rLmxpbmVzKSB7XG4gICAgICAgICAgY29uc3QgTmV4dFJlZ2lvbktpbmQgPSBDSEFOR0VLSU5EW3Jhd0xpbmVbMF1dO1xuICAgICAgICAgIGlmIChOZXh0UmVnaW9uS2luZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGlmZiBzdGF0dXMgY2hhcmFjdGVyOiBcIiR7cmF3TGluZVswXX1cImApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXh0TGluZSA9IHJhd0xpbmUuc2xpY2UoMSk7XG5cbiAgICAgICAgICBsZXQgc2VwYXJhdG9yID0gJyc7XG4gICAgICAgICAgaWYgKGZpcnN0UmVnaW9uTGluZSkge1xuICAgICAgICAgICAgZmlyc3RSZWdpb25MaW5lID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlcGFyYXRvciA9ICdcXG4nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChOZXh0UmVnaW9uS2luZCA9PT0gQ3VycmVudFJlZ2lvbktpbmQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRSZWdpb25UZXh0ICs9IHNlcGFyYXRvciArIG5leHRMaW5lO1xuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmluaXNoUmVnaW9uKCk7XG5cbiAgICAgICAgICAgIEN1cnJlbnRSZWdpb25LaW5kID0gTmV4dFJlZ2lvbktpbmQ7XG4gICAgICAgICAgICBjdXJyZW50UmVnaW9uVGV4dCA9IG5leHRMaW5lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaW5pc2hSZWdpb24oKTtcbiAgICAgIH0sIHtcbiAgICAgICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICAgICAgZXhjbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbihfaHVua3MsIF9yYXdIdW5rLCBfcmVnaW9ucykge1xuICAgICAgICAgIHJldHVybiBodW5rTWFya2VyID0+IHtcbiAgICAgICAgICAgIF9odW5rcy5wdXNoKG5ldyBIdW5rKHtcbiAgICAgICAgICAgICAgb2xkU3RhcnRSb3c6IF9yYXdIdW5rLm9sZFN0YXJ0TGluZSxcbiAgICAgICAgICAgICAgbmV3U3RhcnRSb3c6IF9yYXdIdW5rLm5ld1N0YXJ0TGluZSxcbiAgICAgICAgICAgICAgb2xkUm93Q291bnQ6IF9yYXdIdW5rLm9sZExpbmVDb3VudCxcbiAgICAgICAgICAgICAgbmV3Um93Q291bnQ6IF9yYXdIdW5rLm5ld0xpbmVDb3VudCxcbiAgICAgICAgICAgICAgc2VjdGlvbkhlYWRpbmc6IF9yYXdIdW5rLmhlYWRpbmcsXG4gICAgICAgICAgICAgIG1hcmtlcjogaHVua01hcmtlcixcbiAgICAgICAgICAgICAgcmVnaW9uczogX3JlZ2lvbnMsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaHVua3MsIHJhd0h1bmssIHJlZ2lvbnMpLFxuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICBleGNsdXNpdmU6IGZhbHNlLFxuICAgIGNhbGxiYWNrOiBtYXJrZXIgPT4geyBwYXRjaE1hcmtlciA9IG1hcmtlcjsgfSxcbiAgfSk7XG5cbiAgLy8gU2VwYXJhdGUgbXVsdGlwbGUgbm9uLWVtcHR5IHBhdGNoZXMgb24gdGhlIHNhbWUgYnVmZmVyIHdpdGggYW4gdW5tYXJrZWQgbmV3bGluZS4gVGhlIG5ld2xpbmUgYWZ0ZXIgdGhlIGZpbmFsXG4gIC8vIG5vbi1lbXB0eSBwYXRjaCAoaWYgdGhlcmUgaXMgb25lKSBzaG91bGQgYmUgZGVsZXRlZCBiZWZvcmUgTXVsdGlGaWxlUGF0Y2ggY29uc3RydWN0aW9uLlxuICBpZiAoZGlmZi5odW5rcy5sZW5ndGggPiAwKSB7XG4gICAgaW5zZXJ0ZXIuaW5zZXJ0KCdcXG4nKTtcbiAgfVxuXG4gIGluc2VydGVyLmFwcGx5KCk7XG5cbiAgcmV0dXJuIFtodW5rcywgcGF0Y2hNYXJrZXJdO1xufVxuXG5mdW5jdGlvbiBpc0RpZmZMYXJnZShkaWZmcywgb3B0cykge1xuICBjb25zdCBzaXplID0gZGlmZnMucmVkdWNlKChkaWZmU2l6ZUNvdW50ZXIsIGRpZmYpID0+IHtcbiAgICByZXR1cm4gZGlmZlNpemVDb3VudGVyICsgZGlmZi5odW5rcy5yZWR1Y2UoKGh1bmtTaXplQ291bnRlciwgaHVuaykgPT4ge1xuICAgICAgcmV0dXJuIGh1bmtTaXplQ291bnRlciArIGh1bmsubGluZXMubGVuZ3RoO1xuICAgIH0sIDApO1xuICB9LCAwKTtcblxuICByZXR1cm4gc2l6ZSA+IG9wdHMubGFyZ2VEaWZmVGhyZXNob2xkO1xufVxuIl19