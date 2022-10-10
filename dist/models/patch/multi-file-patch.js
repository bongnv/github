"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var _bintrees = require("bintrees");

var _patchBuffer = _interopRequireDefault(require("./patch-buffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MultiFilePatch {
  static createNull() {
    return new this({
      patchBuffer: new _patchBuffer.default(),
      filePatches: []
    });
  }

  constructor({
    patchBuffer,
    filePatches
  }) {
    _defineProperty(this, "isPatchVisible", filePatchPath => {
      const patch = this.filePatchesByPath.get(filePatchPath);

      if (!patch) {
        return false;
      }

      return patch.getRenderStatus().isVisible();
    });

    _defineProperty(this, "getBufferRowForDiffPosition", (fileName, diffRow) => {
      const offsetIndex = this.diffRowOffsetIndices.get(fileName);

      if (!offsetIndex) {
        // eslint-disable-next-line no-console
        console.error('Attempt to compute buffer row for invalid diff position: file not included', {
          fileName,
          diffRow,
          validFileNames: Array.from(this.diffRowOffsetIndices.keys())
        });
        return null;
      }

      const {
        startBufferRow,
        index
      } = offsetIndex;
      const result = index.lowerBound({
        diffRow
      }).data();

      if (!result) {
        // eslint-disable-next-line no-console
        console.error('Attempt to compute buffer row for invalid diff position: diff row out of range', {
          fileName,
          diffRow
        });
        return null;
      }

      const {
        offset
      } = result;
      return startBufferRow + diffRow - offset;
    });

    this.patchBuffer = patchBuffer;
    this.filePatches = filePatches;
    this.filePatchesByMarker = new Map();
    this.filePatchesByPath = new Map();
    this.hunksByMarker = new Map(); // Store a map of {diffRow, offset} for each FilePatch where offset is the number of Hunk headers within the current
    // FilePatch that occur before this row in the original diff output.

    this.diffRowOffsetIndices = new Map();

    for (const filePatch of this.filePatches) {
      this.filePatchesByPath.set(filePatch.getPath(), filePatch);
      this.filePatchesByMarker.set(filePatch.getMarker(), filePatch);
      this.populateDiffRowOffsetIndices(filePatch);
    }
  }

  clone(opts = {}) {
    return new this.constructor({
      patchBuffer: opts.patchBuffer !== undefined ? opts.patchBuffer : this.getPatchBuffer(),
      filePatches: opts.filePatches !== undefined ? opts.filePatches : this.getFilePatches()
    });
  }

  getPatchBuffer() {
    return this.patchBuffer;
  }

  getBuffer() {
    return this.getPatchBuffer().getBuffer();
  }

  getPatchLayer() {
    return this.getPatchBuffer().getLayer('patch');
  }

  getHunkLayer() {
    return this.getPatchBuffer().getLayer('hunk');
  }

  getUnchangedLayer() {
    return this.getPatchBuffer().getLayer('unchanged');
  }

  getAdditionLayer() {
    return this.getPatchBuffer().getLayer('addition');
  }

  getDeletionLayer() {
    return this.getPatchBuffer().getLayer('deletion');
  }

  getNoNewlineLayer() {
    return this.getPatchBuffer().getLayer('nonewline');
  }

  getFilePatches() {
    return this.filePatches;
  }

  getPatchForPath(path) {
    return this.filePatchesByPath.get(path);
  }

  getPathSet() {
    return this.getFilePatches().reduce((pathSet, filePatch) => {
      for (const file of [filePatch.getOldFile(), filePatch.getNewFile()]) {
        if (file.isPresent()) {
          pathSet.add(file.getPath());
        }
      }

      return pathSet;
    }, new Set());
  }

  getFilePatchAt(bufferRow) {
    if (bufferRow < 0 || bufferRow > this.patchBuffer.getBuffer().getLastRow()) {
      return undefined;
    }

    const [marker] = this.patchBuffer.findMarkers('patch', {
      intersectsRow: bufferRow
    });
    return this.filePatchesByMarker.get(marker);
  }

  getHunkAt(bufferRow) {
    if (bufferRow < 0) {
      return undefined;
    }

    const [marker] = this.patchBuffer.findMarkers('hunk', {
      intersectsRow: bufferRow
    });
    return this.hunksByMarker.get(marker);
  }

  getStagePatchForLines(selectedLineSet) {
    const nextPatchBuffer = new _patchBuffer.default();
    const nextFilePatches = this.getFilePatchesContaining(selectedLineSet).map(fp => {
      return fp.buildStagePatchForLines(this.getBuffer(), nextPatchBuffer, selectedLineSet);
    });
    return this.clone({
      patchBuffer: nextPatchBuffer,
      filePatches: nextFilePatches
    });
  }

  getStagePatchForHunk(hunk) {
    return this.getStagePatchForLines(new Set(hunk.getBufferRows()));
  }

  getUnstagePatchForLines(selectedLineSet) {
    const nextPatchBuffer = new _patchBuffer.default();
    const nextFilePatches = this.getFilePatchesContaining(selectedLineSet).map(fp => {
      return fp.buildUnstagePatchForLines(this.getBuffer(), nextPatchBuffer, selectedLineSet);
    });
    return this.clone({
      patchBuffer: nextPatchBuffer,
      filePatches: nextFilePatches
    });
  }

  getUnstagePatchForHunk(hunk) {
    return this.getUnstagePatchForLines(new Set(hunk.getBufferRows()));
  }

  getMaxSelectionIndex(selectedRows) {
    if (selectedRows.size === 0) {
      return 0;
    }

    const lastMax = Math.max(...selectedRows);
    let selectionIndex = 0; // counts unselected lines in changed regions from the old patch
    // until we get to the bottom-most selected line from the old patch (lastMax).

    patchLoop: for (const filePatch of this.getFilePatches()) {
      for (const hunk of filePatch.getHunks()) {
        let includesMax = false;

        for (const change of hunk.getChanges()) {
          for (const {
            intersection,
            gap
          } of change.intersectRows(selectedRows, true)) {
            // Only include a partial range if this intersection includes the last selected buffer row.
            includesMax = intersection.intersectsRow(lastMax);
            const delta = includesMax ? lastMax - intersection.start.row + 1 : intersection.getRowCount();

            if (gap) {
              // Range of unselected changes.
              selectionIndex += delta;
            }

            if (includesMax) {
              break patchLoop;
            }
          }
        }
      }
    }

    return selectionIndex;
  }

  getSelectionRangeForIndex(selectionIndex) {
    // Iterate over changed lines in this patch in order to find the
    // new row to be selected based on the last selection index.
    // As we walk through the changed lines, we whittle down the
    // remaining lines until we reach the row that corresponds to the
    // last selected index.
    let selectionRow = 0;
    let remainingChangedLines = selectionIndex;
    let foundRow = false;
    let lastChangedRow = 0;

    patchLoop: for (const filePatch of this.getFilePatches()) {
      for (const hunk of filePatch.getHunks()) {
        for (const change of hunk.getChanges()) {
          if (remainingChangedLines < change.bufferRowCount()) {
            selectionRow = change.getStartBufferRow() + remainingChangedLines;
            foundRow = true;
            break patchLoop;
          } else {
            remainingChangedLines -= change.bufferRowCount();
            lastChangedRow = change.getEndBufferRow();
          }
        }
      }
    } // If we never got to the last selected index, that means it is
    // no longer present in the new patch (ie. we staged the last line of the file).
    // In this case we want the next selected line to be the last changed row in the file


    if (!foundRow) {
      selectionRow = lastChangedRow;
    }

    return _atom.Range.fromObject([[selectionRow, 0], [selectionRow, Infinity]]);
  }

  isDiffRowOffsetIndexEmpty(filePatchPath) {
    const diffRowOffsetIndex = this.diffRowOffsetIndices.get(filePatchPath);
    return diffRowOffsetIndex.index.size === 0;
  }

  populateDiffRowOffsetIndices(filePatch) {
    let diffRow = 1;
    const index = new _bintrees.RBTree((a, b) => a.diffRow - b.diffRow);
    this.diffRowOffsetIndices.set(filePatch.getPath(), {
      startBufferRow: filePatch.getStartRange().start.row,
      index
    });

    for (let hunkIndex = 0; hunkIndex < filePatch.getHunks().length; hunkIndex++) {
      const hunk = filePatch.getHunks()[hunkIndex];
      this.hunksByMarker.set(hunk.getMarker(), hunk); // Advance past the hunk body

      diffRow += hunk.bufferRowCount();
      index.insert({
        diffRow,
        offset: hunkIndex + 1
      }); // Advance past the next hunk header

      diffRow++;
    }
  }

  adoptBuffer(nextPatchBuffer) {
    nextPatchBuffer.clearAllLayers();
    this.filePatchesByMarker.clear();
    this.hunksByMarker.clear();
    const markerMap = nextPatchBuffer.adopt(this.patchBuffer);

    for (const filePatch of this.getFilePatches()) {
      filePatch.updateMarkers(markerMap);
      this.filePatchesByMarker.set(filePatch.getMarker(), filePatch);

      for (const hunk of filePatch.getHunks()) {
        this.hunksByMarker.set(hunk.getMarker(), hunk);
      }
    }

    this.patchBuffer = nextPatchBuffer;
  }
  /*
   * Efficiently locate the FilePatch instances that contain at least one row from a Set.
   */


  getFilePatchesContaining(rowSet) {
    const sortedRowSet = Array.from(rowSet);
    sortedRowSet.sort((a, b) => a - b);
    const filePatches = [];
    let lastFilePatch = null;

    for (const row of sortedRowSet) {
      // Because the rows are sorted, consecutive rows will almost certainly belong to the same patch, so we can save
      // many avoidable marker index lookups by comparing with the last.
      if (lastFilePatch && lastFilePatch.containsRow(row)) {
        continue;
      }

      lastFilePatch = this.getFilePatchAt(row);
      filePatches.push(lastFilePatch);
    }

    return filePatches;
  }

  anyPresent() {
    return this.patchBuffer !== null && this.filePatches.some(fp => fp.isPresent());
  }

  didAnyChangeExecutableMode() {
    for (const filePatch of this.getFilePatches()) {
      if (filePatch.didChangeExecutableMode()) {
        return true;
      }
    }

    return false;
  }

  anyHaveTypechange() {
    return this.getFilePatches().some(fp => fp.hasTypechange());
  }

  getMaxLineNumberWidth() {
    return this.getFilePatches().reduce((maxWidth, filePatch) => {
      const width = filePatch.getMaxLineNumberWidth();
      return maxWidth >= width ? maxWidth : width;
    }, 0);
  }

  spansMultipleFiles(rows) {
    let lastFilePatch = null;

    for (const row of rows) {
      if (lastFilePatch) {
        if (lastFilePatch.containsRow(row)) {
          continue;
        }

        return true;
      } else {
        lastFilePatch = this.getFilePatchAt(row);
      }
    }

    return false;
  }

  collapseFilePatch(filePatch) {
    const index = this.filePatches.indexOf(filePatch);
    this.filePatchesByMarker.delete(filePatch.getMarker());

    for (const hunk of filePatch.getHunks()) {
      this.hunksByMarker.delete(hunk.getMarker());
    }

    const before = this.getMarkersBefore(index);
    const after = this.getMarkersAfter(index);
    filePatch.triggerCollapseIn(this.patchBuffer, {
      before,
      after
    });
    this.filePatchesByMarker.set(filePatch.getMarker(), filePatch); // This hunk collection should be empty, but let's iterate anyway just in case filePatch was already collapsed

    /* istanbul ignore next */

    for (const hunk of filePatch.getHunks()) {
      this.hunksByMarker.set(hunk.getMarker(), hunk);
    }
  }

  expandFilePatch(filePatch) {
    const index = this.filePatches.indexOf(filePatch);
    this.filePatchesByMarker.delete(filePatch.getMarker());

    for (const hunk of filePatch.getHunks()) {
      this.hunksByMarker.delete(hunk.getMarker());
    }

    const before = this.getMarkersBefore(index);
    const after = this.getMarkersAfter(index);
    filePatch.triggerExpandIn(this.patchBuffer, {
      before,
      after
    });
    this.filePatchesByMarker.set(filePatch.getMarker(), filePatch);

    for (const hunk of filePatch.getHunks()) {
      this.hunksByMarker.set(hunk.getMarker(), hunk);
    } // if the patch was initially collapsed, we need to calculate
    // the diffRowOffsetIndices to calculate comment position.


    if (this.isDiffRowOffsetIndexEmpty(filePatch.getPath())) {
      this.populateDiffRowOffsetIndices(filePatch);
    }
  }

  getMarkersBefore(filePatchIndex) {
    const before = [];
    let beforeIndex = filePatchIndex - 1;

    while (beforeIndex >= 0) {
      const beforeFilePatch = this.filePatches[beforeIndex];
      before.push(...beforeFilePatch.getEndingMarkers());

      if (!beforeFilePatch.getMarker().getRange().isEmpty()) {
        break;
      }

      beforeIndex--;
    }

    return before;
  }

  getMarkersAfter(filePatchIndex) {
    const after = [];
    let afterIndex = filePatchIndex + 1;

    while (afterIndex < this.filePatches.length) {
      const afterFilePatch = this.filePatches[afterIndex];
      after.push(...afterFilePatch.getStartingMarkers());

      if (!afterFilePatch.getMarker().getRange().isEmpty()) {
        break;
      }

      afterIndex++;
    }

    return after;
  }

  getPreviewPatchBuffer(fileName, diffRow, maxRowCount) {
    const bufferRow = this.getBufferRowForDiffPosition(fileName, diffRow);

    if (bufferRow === null) {
      return new _patchBuffer.default();
    }

    const filePatch = this.getFilePatchAt(bufferRow);
    const filePatchIndex = this.filePatches.indexOf(filePatch);
    const hunk = this.getHunkAt(bufferRow);
    const previewStartRow = Math.max(bufferRow - maxRowCount + 1, hunk.getRange().start.row);
    const previewEndRow = bufferRow;
    const before = this.getMarkersBefore(filePatchIndex);
    const after = this.getMarkersAfter(filePatchIndex);
    const exclude = new Set([...before, ...after]);
    return this.patchBuffer.createSubBuffer([[previewStartRow, 0], [previewEndRow, Infinity]], {
      exclude
    }).patchBuffer;
  }
  /*
   * Construct an apply-able patch String.
   */


  toString() {
    return this.filePatches.map(fp => fp.toStringIn(this.getBuffer())).join('') + '\n';
  }
  /*
   * Construct a string of diagnostic information useful for debugging.
   */

  /* istanbul ignore next */


  inspect() {
    let inspectString = '(MultiFilePatch';
    inspectString += ` filePatchesByMarker=(${Array.from(this.filePatchesByMarker.keys(), m => m.id).join(', ')})`;
    inspectString += ` hunksByMarker=(${Array.from(this.hunksByMarker.keys(), m => m.id).join(', ')})\n`;

    for (const filePatch of this.filePatches) {
      inspectString += filePatch.inspect({
        indent: 2
      });
    }

    inspectString += ')\n';
    return inspectString;
  }
  /* istanbul ignore next */


  isEqual(other) {
    return this.toString() === other.toString();
  }

}

exports.default = MultiFilePatch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvbXVsdGktZmlsZS1wYXRjaC5qcyJdLCJuYW1lcyI6WyJNdWx0aUZpbGVQYXRjaCIsImNyZWF0ZU51bGwiLCJwYXRjaEJ1ZmZlciIsIlBhdGNoQnVmZmVyIiwiZmlsZVBhdGNoZXMiLCJjb25zdHJ1Y3RvciIsImZpbGVQYXRjaFBhdGgiLCJwYXRjaCIsImZpbGVQYXRjaGVzQnlQYXRoIiwiZ2V0IiwiZ2V0UmVuZGVyU3RhdHVzIiwiaXNWaXNpYmxlIiwiZmlsZU5hbWUiLCJkaWZmUm93Iiwib2Zmc2V0SW5kZXgiLCJkaWZmUm93T2Zmc2V0SW5kaWNlcyIsImNvbnNvbGUiLCJlcnJvciIsInZhbGlkRmlsZU5hbWVzIiwiQXJyYXkiLCJmcm9tIiwia2V5cyIsInN0YXJ0QnVmZmVyUm93IiwiaW5kZXgiLCJyZXN1bHQiLCJsb3dlckJvdW5kIiwiZGF0YSIsIm9mZnNldCIsImZpbGVQYXRjaGVzQnlNYXJrZXIiLCJNYXAiLCJodW5rc0J5TWFya2VyIiwiZmlsZVBhdGNoIiwic2V0IiwiZ2V0UGF0aCIsImdldE1hcmtlciIsInBvcHVsYXRlRGlmZlJvd09mZnNldEluZGljZXMiLCJjbG9uZSIsIm9wdHMiLCJ1bmRlZmluZWQiLCJnZXRQYXRjaEJ1ZmZlciIsImdldEZpbGVQYXRjaGVzIiwiZ2V0QnVmZmVyIiwiZ2V0UGF0Y2hMYXllciIsImdldExheWVyIiwiZ2V0SHVua0xheWVyIiwiZ2V0VW5jaGFuZ2VkTGF5ZXIiLCJnZXRBZGRpdGlvbkxheWVyIiwiZ2V0RGVsZXRpb25MYXllciIsImdldE5vTmV3bGluZUxheWVyIiwiZ2V0UGF0Y2hGb3JQYXRoIiwicGF0aCIsImdldFBhdGhTZXQiLCJyZWR1Y2UiLCJwYXRoU2V0IiwiZmlsZSIsImdldE9sZEZpbGUiLCJnZXROZXdGaWxlIiwiaXNQcmVzZW50IiwiYWRkIiwiU2V0IiwiZ2V0RmlsZVBhdGNoQXQiLCJidWZmZXJSb3ciLCJnZXRMYXN0Um93IiwibWFya2VyIiwiZmluZE1hcmtlcnMiLCJpbnRlcnNlY3RzUm93IiwiZ2V0SHVua0F0IiwiZ2V0U3RhZ2VQYXRjaEZvckxpbmVzIiwic2VsZWN0ZWRMaW5lU2V0IiwibmV4dFBhdGNoQnVmZmVyIiwibmV4dEZpbGVQYXRjaGVzIiwiZ2V0RmlsZVBhdGNoZXNDb250YWluaW5nIiwibWFwIiwiZnAiLCJidWlsZFN0YWdlUGF0Y2hGb3JMaW5lcyIsImdldFN0YWdlUGF0Y2hGb3JIdW5rIiwiaHVuayIsImdldEJ1ZmZlclJvd3MiLCJnZXRVbnN0YWdlUGF0Y2hGb3JMaW5lcyIsImJ1aWxkVW5zdGFnZVBhdGNoRm9yTGluZXMiLCJnZXRVbnN0YWdlUGF0Y2hGb3JIdW5rIiwiZ2V0TWF4U2VsZWN0aW9uSW5kZXgiLCJzZWxlY3RlZFJvd3MiLCJzaXplIiwibGFzdE1heCIsIk1hdGgiLCJtYXgiLCJzZWxlY3Rpb25JbmRleCIsInBhdGNoTG9vcCIsImdldEh1bmtzIiwiaW5jbHVkZXNNYXgiLCJjaGFuZ2UiLCJnZXRDaGFuZ2VzIiwiaW50ZXJzZWN0aW9uIiwiZ2FwIiwiaW50ZXJzZWN0Um93cyIsImRlbHRhIiwic3RhcnQiLCJyb3ciLCJnZXRSb3dDb3VudCIsImdldFNlbGVjdGlvblJhbmdlRm9ySW5kZXgiLCJzZWxlY3Rpb25Sb3ciLCJyZW1haW5pbmdDaGFuZ2VkTGluZXMiLCJmb3VuZFJvdyIsImxhc3RDaGFuZ2VkUm93IiwiYnVmZmVyUm93Q291bnQiLCJnZXRTdGFydEJ1ZmZlclJvdyIsImdldEVuZEJ1ZmZlclJvdyIsIlJhbmdlIiwiZnJvbU9iamVjdCIsIkluZmluaXR5IiwiaXNEaWZmUm93T2Zmc2V0SW5kZXhFbXB0eSIsImRpZmZSb3dPZmZzZXRJbmRleCIsIlJCVHJlZSIsImEiLCJiIiwiZ2V0U3RhcnRSYW5nZSIsImh1bmtJbmRleCIsImxlbmd0aCIsImluc2VydCIsImFkb3B0QnVmZmVyIiwiY2xlYXJBbGxMYXllcnMiLCJjbGVhciIsIm1hcmtlck1hcCIsImFkb3B0IiwidXBkYXRlTWFya2VycyIsInJvd1NldCIsInNvcnRlZFJvd1NldCIsInNvcnQiLCJsYXN0RmlsZVBhdGNoIiwiY29udGFpbnNSb3ciLCJwdXNoIiwiYW55UHJlc2VudCIsInNvbWUiLCJkaWRBbnlDaGFuZ2VFeGVjdXRhYmxlTW9kZSIsImRpZENoYW5nZUV4ZWN1dGFibGVNb2RlIiwiYW55SGF2ZVR5cGVjaGFuZ2UiLCJoYXNUeXBlY2hhbmdlIiwiZ2V0TWF4TGluZU51bWJlcldpZHRoIiwibWF4V2lkdGgiLCJ3aWR0aCIsInNwYW5zTXVsdGlwbGVGaWxlcyIsInJvd3MiLCJjb2xsYXBzZUZpbGVQYXRjaCIsImluZGV4T2YiLCJkZWxldGUiLCJiZWZvcmUiLCJnZXRNYXJrZXJzQmVmb3JlIiwiYWZ0ZXIiLCJnZXRNYXJrZXJzQWZ0ZXIiLCJ0cmlnZ2VyQ29sbGFwc2VJbiIsImV4cGFuZEZpbGVQYXRjaCIsInRyaWdnZXJFeHBhbmRJbiIsImZpbGVQYXRjaEluZGV4IiwiYmVmb3JlSW5kZXgiLCJiZWZvcmVGaWxlUGF0Y2giLCJnZXRFbmRpbmdNYXJrZXJzIiwiZ2V0UmFuZ2UiLCJpc0VtcHR5IiwiYWZ0ZXJJbmRleCIsImFmdGVyRmlsZVBhdGNoIiwiZ2V0U3RhcnRpbmdNYXJrZXJzIiwiZ2V0UHJldmlld1BhdGNoQnVmZmVyIiwibWF4Um93Q291bnQiLCJnZXRCdWZmZXJSb3dGb3JEaWZmUG9zaXRpb24iLCJwcmV2aWV3U3RhcnRSb3ciLCJwcmV2aWV3RW5kUm93IiwiZXhjbHVkZSIsImNyZWF0ZVN1YkJ1ZmZlciIsInRvU3RyaW5nIiwidG9TdHJpbmdJbiIsImpvaW4iLCJpbnNwZWN0IiwiaW5zcGVjdFN0cmluZyIsIm0iLCJpZCIsImluZGVudCIsImlzRXF1YWwiLCJvdGhlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOzs7Ozs7QUFFZSxNQUFNQSxjQUFOLENBQXFCO0FBQ2xDLFNBQU9DLFVBQVAsR0FBb0I7QUFDbEIsV0FBTyxJQUFJLElBQUosQ0FBUztBQUFDQyxNQUFBQSxXQUFXLEVBQUUsSUFBSUMsb0JB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QUFDQUEsSUFBQUEsYUFBYSxJQUFLLHlCQUF3QjFKLEtBQUssQ0FBQ0MsSUFBTixDQUFXLEtBQUtRLG1CQUFMLENBQXlCUCxJQUF6QixFQUFYLEVBQTRDeUosQ0FBQyxJQUFJQSxDQUFDLENBQUNDLEVBQW5ELEVBQXVESixJQUF2RCxDQUE0RCxJQUE1RCxDQUFrRSxHQUE1RztBQUNBRSxJQUFBQSxhQUFhLElBQUssbUJBQWtCMUosS0FBSyxDQUFDQyxJQUFOLENBQVcsS0FBS1UsYUFBTCxDQUFtQlQsSUFBbkIsRUFBWCxFQUFzQ3lKLENBQUMsSUFBSUEsQ0FBQyxDQUFDQyxFQUE3QyxFQUFpREosSUFBakQsQ0FBc0QsSUFBdEQsQ0FBNEQsS0FBaEc7O0FBQ0EsU0FBSyxNQUFNNUksU0FBWCxJQUF3QixLQUFLM0IsV0FBN0IsRUFBMEM7QUFDeEN5SyxNQUFBQSxhQUFhLElBQUk5SSxTQUFTLENBQUM2SSxPQUFWLENBQWtCO0FBQUNJLFFBQUFBLE1BQU0sRUFBRTtBQUFULE9BQWxCLENBQWpCO0FBQ0Q7O0FBQ0RILElBQUFBLGFBQWEsSUFBSSxLQUFqQjtBQUNBLFdBQU9BLGFBQVA7QUFDRDtBQUVEOzs7QUFDQUksRUFBQUEsT0FBTyxDQUFDQyxLQUFELEVBQVE7QUFDYixXQUFPLEtBQUtULFFBQUwsT0FBb0JTLEtBQUssQ0FBQ1QsUUFBTixFQUEzQjtBQUNEOztBQTVjaUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UkJUcmVlfSBmcm9tICdiaW50cmVlcyc7XG5cbmltcG9ydCBQYXRjaEJ1ZmZlciBmcm9tICcuL3BhdGNoLWJ1ZmZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpRmlsZVBhdGNoIHtcbiAgc3RhdGljIGNyZWF0ZU51bGwoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHtwYXRjaEJ1ZmZlcjogbmV3IFBhdGNoQnVmZmVyKCksIGZpbGVQYXRjaGVzOiBbXX0pO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioe3BhdGNoQnVmZmVyLCBmaWxlUGF0Y2hlc30pIHtcbiAgICB0aGlzLnBhdGNoQnVmZmVyID0gcGF0Y2hCdWZmZXI7XG4gICAgdGhpcy5maWxlUGF0Y2hlcyA9IGZpbGVQYXRjaGVzO1xuXG4gICAgdGhpcy5maWxlUGF0Y2hlc0J5TWFya2VyID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZmlsZVBhdGNoZXNCeVBhdGggPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5odW5rc0J5TWFya2VyID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gU3RvcmUgYSBtYXAgb2Yge2RpZmZSb3csIG9mZnNldH0gZm9yIGVhY2ggRmlsZVBhdGNoIHdoZXJlIG9mZnNldCBpcyB0aGUgbnVtYmVyIG9mIEh1bmsgaGVhZGVycyB3aXRoaW4gdGhlIGN1cnJlbnRcbiAgICAvLyBGaWxlUGF0Y2ggdGhhdCBvY2N1ciBiZWZvcmUgdGhpcyByb3cgaW4gdGhlIG9yaWdpbmFsIGRpZmYgb3V0cHV0LlxuICAgIHRoaXMuZGlmZlJvd09mZnNldEluZGljZXMgPSBuZXcgTWFwKCk7XG5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRjaCBvZiB0aGlzLmZpbGVQYXRjaGVzKSB7XG4gICAgICB0aGlzLmZpbGVQYXRjaGVzQnlQYXRoLnNldChmaWxlUGF0Y2guZ2V0UGF0aCgpLCBmaWxlUGF0Y2gpO1xuICAgICAgdGhpcy5maWxlUGF0Y2hlc0J5TWFya2VyLnNldChmaWxlUGF0Y2guZ2V0TWFya2VyKCksIGZpbGVQYXRjaCk7XG5cbiAgICAgIHRoaXMucG9wdWxhdGVEaWZmUm93T2Zmc2V0SW5kaWNlcyhmaWxlUGF0Y2gpO1xuICAgIH1cbiAgfVxuXG4gIGNsb25lKG9wdHMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih7XG4gICAgICBwYXRjaEJ1ZmZlcjogb3B0cy5wYXRjaEJ1ZmZlciAhPT0gdW5kZWZpbmVkID8gb3B0cy5wYXRjaEJ1ZmZlciA6IHRoaXMuZ2V0UGF0Y2hCdWZmZXIoKSxcbiAgICAgIGZpbGVQYXRjaGVzOiBvcHRzLmZpbGVQYXRjaGVzICE9PSB1bmRlZmluZWQgPyBvcHRzLmZpbGVQYXRjaGVzIDogdGhpcy5nZXRGaWxlUGF0Y2hlcygpLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UGF0Y2hCdWZmZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0Y2hCdWZmZXI7XG4gIH1cblxuICBnZXRCdWZmZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hCdWZmZXIoKS5nZXRCdWZmZXIoKTtcbiAgfVxuXG4gIGdldFBhdGNoTGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hCdWZmZXIoKS5nZXRMYXllcigncGF0Y2gnKTtcbiAgfVxuXG4gIGdldEh1bmtMYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXRjaEJ1ZmZlcigpLmdldExheWVyKCdodW5rJyk7XG4gIH1cblxuICBnZXRVbmNoYW5nZWRMYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXRjaEJ1ZmZlcigpLmdldExheWVyKCd1bmNoYW5nZWQnKTtcbiAgfVxuXG4gIGdldEFkZGl0aW9uTGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hCdWZmZXIoKS5nZXRMYXllcignYWRkaXRpb24nKTtcbiAgfVxuXG4gIGdldERlbGV0aW9uTGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hCdWZmZXIoKS5nZXRMYXllcignZGVsZXRpb24nKTtcbiAgfVxuXG4gIGdldE5vTmV3bGluZUxheWVyKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhdGNoQnVmZmVyKCkuZ2V0TGF5ZXIoJ25vbmV3bGluZScpO1xuICB9XG5cbiAgZ2V0RmlsZVBhdGNoZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdGNoZXM7XG4gIH1cblxuICBnZXRQYXRjaEZvclBhdGgocGF0aCkge1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRjaGVzQnlQYXRoLmdldChwYXRoKTtcbiAgfVxuXG4gIGdldFBhdGhTZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmlsZVBhdGNoZXMoKS5yZWR1Y2UoKHBhdGhTZXQsIGZpbGVQYXRjaCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIFtmaWxlUGF0Y2guZ2V0T2xkRmlsZSgpLCBmaWxlUGF0Y2guZ2V0TmV3RmlsZSgpXSkge1xuICAgICAgICBpZiAoZmlsZS5pc1ByZXNlbnQoKSkge1xuICAgICAgICAgIHBhdGhTZXQuYWRkKGZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBhdGhTZXQ7XG4gICAgfSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIGdldEZpbGVQYXRjaEF0KGJ1ZmZlclJvdykge1xuICAgIGlmIChidWZmZXJSb3cgPCAwIHx8IGJ1ZmZlclJvdyA+IHRoaXMucGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuZ2V0TGFzdFJvdygpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBbbWFya2VyXSA9IHRoaXMucGF0Y2hCdWZmZXIuZmluZE1hcmtlcnMoJ3BhdGNoJywge2ludGVyc2VjdHNSb3c6IGJ1ZmZlclJvd30pO1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRjaGVzQnlNYXJrZXIuZ2V0KG1hcmtlcik7XG4gIH1cblxuICBnZXRIdW5rQXQoYnVmZmVyUm93KSB7XG4gICAgaWYgKGJ1ZmZlclJvdyA8IDApIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IFttYXJrZXJdID0gdGhpcy5wYXRjaEJ1ZmZlci5maW5kTWFya2VycygnaHVuaycsIHtpbnRlcnNlY3RzUm93OiBidWZmZXJSb3d9KTtcbiAgICByZXR1cm4gdGhpcy5odW5rc0J5TWFya2VyLmdldChtYXJrZXIpO1xuICB9XG5cbiAgZ2V0U3RhZ2VQYXRjaEZvckxpbmVzKHNlbGVjdGVkTGluZVNldCkge1xuICAgIGNvbnN0IG5leHRQYXRjaEJ1ZmZlciA9IG5ldyBQYXRjaEJ1ZmZlcigpO1xuICAgIGNvbnN0IG5leHRGaWxlUGF0Y2hlcyA9IHRoaXMuZ2V0RmlsZVBhdGNoZXNDb250YWluaW5nKHNlbGVjdGVkTGluZVNldCkubWFwKGZwID0+IHtcbiAgICAgIHJldHVybiBmcC5idWlsZFN0YWdlUGF0Y2hGb3JMaW5lcyh0aGlzLmdldEJ1ZmZlcigpLCBuZXh0UGF0Y2hCdWZmZXIsIHNlbGVjdGVkTGluZVNldCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe3BhdGNoQnVmZmVyOiBuZXh0UGF0Y2hCdWZmZXIsIGZpbGVQYXRjaGVzOiBuZXh0RmlsZVBhdGNoZXN9KTtcbiAgfVxuXG4gIGdldFN0YWdlUGF0Y2hGb3JIdW5rKGh1bmspIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGFnZVBhdGNoRm9yTGluZXMobmV3IFNldChodW5rLmdldEJ1ZmZlclJvd3MoKSkpO1xuICB9XG5cbiAgZ2V0VW5zdGFnZVBhdGNoRm9yTGluZXMoc2VsZWN0ZWRMaW5lU2V0KSB7XG4gICAgY29uc3QgbmV4dFBhdGNoQnVmZmVyID0gbmV3IFBhdGNoQnVmZmVyKCk7XG4gICAgY29uc3QgbmV4dEZpbGVQYXRjaGVzID0gdGhpcy5nZXRGaWxlUGF0Y2hlc0NvbnRhaW5pbmcoc2VsZWN0ZWRMaW5lU2V0KS5tYXAoZnAgPT4ge1xuICAgICAgcmV0dXJuIGZwLmJ1aWxkVW5zdGFnZVBhdGNoRm9yTGluZXModGhpcy5nZXRCdWZmZXIoKSwgbmV4dFBhdGNoQnVmZmVyLCBzZWxlY3RlZExpbmVTZXQpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtwYXRjaEJ1ZmZlcjogbmV4dFBhdGNoQnVmZmVyLCBmaWxlUGF0Y2hlczogbmV4dEZpbGVQYXRjaGVzfSk7XG4gIH1cblxuICBnZXRVbnN0YWdlUGF0Y2hGb3JIdW5rKGh1bmspIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVbnN0YWdlUGF0Y2hGb3JMaW5lcyhuZXcgU2V0KGh1bmsuZ2V0QnVmZmVyUm93cygpKSk7XG4gIH1cblxuICBnZXRNYXhTZWxlY3Rpb25JbmRleChzZWxlY3RlZFJvd3MpIHtcbiAgICBpZiAoc2VsZWN0ZWRSb3dzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RNYXggPSBNYXRoLm1heCguLi5zZWxlY3RlZFJvd3MpO1xuXG4gICAgbGV0IHNlbGVjdGlvbkluZGV4ID0gMDtcbiAgICAvLyBjb3VudHMgdW5zZWxlY3RlZCBsaW5lcyBpbiBjaGFuZ2VkIHJlZ2lvbnMgZnJvbSB0aGUgb2xkIHBhdGNoXG4gICAgLy8gdW50aWwgd2UgZ2V0IHRvIHRoZSBib3R0b20tbW9zdCBzZWxlY3RlZCBsaW5lIGZyb20gdGhlIG9sZCBwYXRjaCAobGFzdE1heCkuXG4gICAgcGF0Y2hMb29wOiBmb3IgKGNvbnN0IGZpbGVQYXRjaCBvZiB0aGlzLmdldEZpbGVQYXRjaGVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgaHVuayBvZiBmaWxlUGF0Y2guZ2V0SHVua3MoKSkge1xuICAgICAgICBsZXQgaW5jbHVkZXNNYXggPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBodW5rLmdldENoYW5nZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3Qge2ludGVyc2VjdGlvbiwgZ2FwfSBvZiBjaGFuZ2UuaW50ZXJzZWN0Um93cyhzZWxlY3RlZFJvd3MsIHRydWUpKSB7XG4gICAgICAgICAgICAvLyBPbmx5IGluY2x1ZGUgYSBwYXJ0aWFsIHJhbmdlIGlmIHRoaXMgaW50ZXJzZWN0aW9uIGluY2x1ZGVzIHRoZSBsYXN0IHNlbGVjdGVkIGJ1ZmZlciByb3cuXG4gICAgICAgICAgICBpbmNsdWRlc01heCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3RzUm93KGxhc3RNYXgpO1xuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSBpbmNsdWRlc01heCA/IGxhc3RNYXggLSBpbnRlcnNlY3Rpb24uc3RhcnQucm93ICsgMSA6IGludGVyc2VjdGlvbi5nZXRSb3dDb3VudCgpO1xuXG4gICAgICAgICAgICBpZiAoZ2FwKSB7XG4gICAgICAgICAgICAgIC8vIFJhbmdlIG9mIHVuc2VsZWN0ZWQgY2hhbmdlcy5cbiAgICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXggKz0gZGVsdGE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlc01heCkge1xuICAgICAgICAgICAgICBicmVhayBwYXRjaExvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGlvbkluZGV4O1xuICB9XG5cbiAgZ2V0U2VsZWN0aW9uUmFuZ2VGb3JJbmRleChzZWxlY3Rpb25JbmRleCkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBjaGFuZ2VkIGxpbmVzIGluIHRoaXMgcGF0Y2ggaW4gb3JkZXIgdG8gZmluZCB0aGVcbiAgICAvLyBuZXcgcm93IHRvIGJlIHNlbGVjdGVkIGJhc2VkIG9uIHRoZSBsYXN0IHNlbGVjdGlvbiBpbmRleC5cbiAgICAvLyBBcyB3ZSB3YWxrIHRocm91Z2ggdGhlIGNoYW5nZWQgbGluZXMsIHdlIHdoaXR0bGUgZG93biB0aGVcbiAgICAvLyByZW1haW5pbmcgbGluZXMgdW50aWwgd2UgcmVhY2ggdGhlIHJvdyB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZVxuICAgIC8vIGxhc3Qgc2VsZWN0ZWQgaW5kZXguXG5cbiAgICBsZXQgc2VsZWN0aW9uUm93ID0gMDtcbiAgICBsZXQgcmVtYWluaW5nQ2hhbmdlZExpbmVzID0gc2VsZWN0aW9uSW5kZXg7XG5cbiAgICBsZXQgZm91bmRSb3cgPSBmYWxzZTtcbiAgICBsZXQgbGFzdENoYW5nZWRSb3cgPSAwO1xuXG4gICAgcGF0Y2hMb29wOiBmb3IgKGNvbnN0IGZpbGVQYXRjaCBvZiB0aGlzLmdldEZpbGVQYXRjaGVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgaHVuayBvZiBmaWxlUGF0Y2guZ2V0SHVua3MoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBodW5rLmdldENoYW5nZXMoKSkge1xuICAgICAgICAgIGlmIChyZW1haW5pbmdDaGFuZ2VkTGluZXMgPCBjaGFuZ2UuYnVmZmVyUm93Q291bnQoKSkge1xuICAgICAgICAgICAgc2VsZWN0aW9uUm93ID0gY2hhbmdlLmdldFN0YXJ0QnVmZmVyUm93KCkgKyByZW1haW5pbmdDaGFuZ2VkTGluZXM7XG4gICAgICAgICAgICBmb3VuZFJvdyA9IHRydWU7XG4gICAgICAgICAgICBicmVhayBwYXRjaExvb3A7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYW5nZWRMaW5lcyAtPSBjaGFuZ2UuYnVmZmVyUm93Q291bnQoKTtcbiAgICAgICAgICAgIGxhc3RDaGFuZ2VkUm93ID0gY2hhbmdlLmdldEVuZEJ1ZmZlclJvdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIG5ldmVyIGdvdCB0byB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCwgdGhhdCBtZWFucyBpdCBpc1xuICAgIC8vIG5vIGxvbmdlciBwcmVzZW50IGluIHRoZSBuZXcgcGF0Y2ggKGllLiB3ZSBzdGFnZWQgdGhlIGxhc3QgbGluZSBvZiB0aGUgZmlsZSkuXG4gICAgLy8gSW4gdGhpcyBjYXNlIHdlIHdhbnQgdGhlIG5leHQgc2VsZWN0ZWQgbGluZSB0byBiZSB0aGUgbGFzdCBjaGFuZ2VkIHJvdyBpbiB0aGUgZmlsZVxuICAgIGlmICghZm91bmRSb3cpIHtcbiAgICAgIHNlbGVjdGlvblJvdyA9IGxhc3RDaGFuZ2VkUm93O1xuICAgIH1cblxuICAgIHJldHVybiBSYW5nZS5mcm9tT2JqZWN0KFtbc2VsZWN0aW9uUm93LCAwXSwgW3NlbGVjdGlvblJvdywgSW5maW5pdHldXSk7XG4gIH1cblxuICBpc0RpZmZSb3dPZmZzZXRJbmRleEVtcHR5KGZpbGVQYXRjaFBhdGgpIHtcbiAgICBjb25zdCBkaWZmUm93T2Zmc2V0SW5kZXggPSB0aGlzLmRpZmZSb3dPZmZzZXRJbmRpY2VzLmdldChmaWxlUGF0Y2hQYXRoKTtcbiAgICByZXR1cm4gZGlmZlJvd09mZnNldEluZGV4LmluZGV4LnNpemUgPT09IDA7XG4gIH1cblxuICBwb3B1bGF0ZURpZmZSb3dPZmZzZXRJbmRpY2VzKGZpbGVQYXRjaCkge1xuICAgIGxldCBkaWZmUm93ID0gMTtcbiAgICBjb25zdCBpbmRleCA9IG5ldyBSQlRyZWUoKGEsIGIpID0+IGEuZGlmZlJvdyAtIGIuZGlmZlJvdyk7XG4gICAgdGhpcy5kaWZmUm93T2Zmc2V0SW5kaWNlcy5zZXQoZmlsZVBhdGNoLmdldFBhdGgoKSwge3N0YXJ0QnVmZmVyUm93OiBmaWxlUGF0Y2guZ2V0U3RhcnRSYW5nZSgpLnN0YXJ0LnJvdywgaW5kZXh9KTtcblxuICAgIGZvciAobGV0IGh1bmtJbmRleCA9IDA7IGh1bmtJbmRleCA8IGZpbGVQYXRjaC5nZXRIdW5rcygpLmxlbmd0aDsgaHVua0luZGV4KyspIHtcbiAgICAgIGNvbnN0IGh1bmsgPSBmaWxlUGF0Y2guZ2V0SHVua3MoKVtodW5rSW5kZXhdO1xuICAgICAgdGhpcy5odW5rc0J5TWFya2VyLnNldChodW5rLmdldE1hcmtlcigpLCBodW5rKTtcblxuICAgICAgLy8gQWR2YW5jZSBwYXN0IHRoZSBodW5rIGJvZHlcbiAgICAgIGRpZmZSb3cgKz0gaHVuay5idWZmZXJSb3dDb3VudCgpO1xuICAgICAgaW5kZXguaW5zZXJ0KHtkaWZmUm93LCBvZmZzZXQ6IGh1bmtJbmRleCArIDF9KTtcblxuICAgICAgLy8gQWR2YW5jZSBwYXN0IHRoZSBuZXh0IGh1bmsgaGVhZGVyXG4gICAgICBkaWZmUm93Kys7XG4gICAgfVxuICB9XG5cbiAgYWRvcHRCdWZmZXIobmV4dFBhdGNoQnVmZmVyKSB7XG4gICAgbmV4dFBhdGNoQnVmZmVyLmNsZWFyQWxsTGF5ZXJzKCk7XG5cbiAgICB0aGlzLmZpbGVQYXRjaGVzQnlNYXJrZXIuY2xlYXIoKTtcbiAgICB0aGlzLmh1bmtzQnlNYXJrZXIuY2xlYXIoKTtcblxuICAgIGNvbnN0IG1hcmtlck1hcCA9IG5leHRQYXRjaEJ1ZmZlci5hZG9wdCh0aGlzLnBhdGNoQnVmZmVyKTtcblxuICAgIGZvciAoY29uc3QgZmlsZVBhdGNoIG9mIHRoaXMuZ2V0RmlsZVBhdGNoZXMoKSkge1xuICAgICAgZmlsZVBhdGNoLnVwZGF0ZU1hcmtlcnMobWFya2VyTWFwKTtcbiAgICAgIHRoaXMuZmlsZVBhdGNoZXNCeU1hcmtlci5zZXQoZmlsZVBhdGNoLmdldE1hcmtlcigpLCBmaWxlUGF0Y2gpO1xuXG4gICAgICBmb3IgKGNvbnN0IGh1bmsgb2YgZmlsZVBhdGNoLmdldEh1bmtzKCkpIHtcbiAgICAgICAgdGhpcy5odW5rc0J5TWFya2VyLnNldChodW5rLmdldE1hcmtlcigpLCBodW5rKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBhdGNoQnVmZmVyID0gbmV4dFBhdGNoQnVmZmVyO1xuICB9XG5cbiAgLypcbiAgICogRWZmaWNpZW50bHkgbG9jYXRlIHRoZSBGaWxlUGF0Y2ggaW5zdGFuY2VzIHRoYXQgY29udGFpbiBhdCBsZWFzdCBvbmUgcm93IGZyb20gYSBTZXQuXG4gICAqL1xuICBnZXRGaWxlUGF0Y2hlc0NvbnRhaW5pbmcocm93U2V0KSB7XG4gICAgY29uc3Qgc29ydGVkUm93U2V0ID0gQXJyYXkuZnJvbShyb3dTZXQpO1xuICAgIHNvcnRlZFJvd1NldC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cbiAgICBjb25zdCBmaWxlUGF0Y2hlcyA9IFtdO1xuICAgIGxldCBsYXN0RmlsZVBhdGNoID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzb3J0ZWRSb3dTZXQpIHtcbiAgICAgIC8vIEJlY2F1c2UgdGhlIHJvd3MgYXJlIHNvcnRlZCwgY29uc2VjdXRpdmUgcm93cyB3aWxsIGFsbW9zdCBjZXJ0YWlubHkgYmVsb25nIHRvIHRoZSBzYW1lIHBhdGNoLCBzbyB3ZSBjYW4gc2F2ZVxuICAgICAgLy8gbWFueSBhdm9pZGFibGUgbWFya2VyIGluZGV4IGxvb2t1cHMgYnkgY29tcGFyaW5nIHdpdGggdGhlIGxhc3QuXG4gICAgICBpZiAobGFzdEZpbGVQYXRjaCAmJiBsYXN0RmlsZVBhdGNoLmNvbnRhaW5zUm93KHJvdykpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxhc3RGaWxlUGF0Y2ggPSB0aGlzLmdldEZpbGVQYXRjaEF0KHJvdyk7XG4gICAgICBmaWxlUGF0Y2hlcy5wdXNoKGxhc3RGaWxlUGF0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWxlUGF0Y2hlcztcbiAgfVxuXG4gIGFueVByZXNlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0Y2hCdWZmZXIgIT09IG51bGwgJiYgdGhpcy5maWxlUGF0Y2hlcy5zb21lKGZwID0+IGZwLmlzUHJlc2VudCgpKTtcbiAgfVxuXG4gIGRpZEFueUNoYW5nZUV4ZWN1dGFibGVNb2RlKCkge1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGNoIG9mIHRoaXMuZ2V0RmlsZVBhdGNoZXMoKSkge1xuICAgICAgaWYgKGZpbGVQYXRjaC5kaWRDaGFuZ2VFeGVjdXRhYmxlTW9kZSgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhbnlIYXZlVHlwZWNoYW5nZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaWxlUGF0Y2hlcygpLnNvbWUoZnAgPT4gZnAuaGFzVHlwZWNoYW5nZSgpKTtcbiAgfVxuXG4gIGdldE1heExpbmVOdW1iZXJXaWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaWxlUGF0Y2hlcygpLnJlZHVjZSgobWF4V2lkdGgsIGZpbGVQYXRjaCkgPT4ge1xuICAgICAgY29uc3Qgd2lkdGggPSBmaWxlUGF0Y2guZ2V0TWF4TGluZU51bWJlcldpZHRoKCk7XG4gICAgICByZXR1cm4gbWF4V2lkdGggPj0gd2lkdGggPyBtYXhXaWR0aCA6IHdpZHRoO1xuICAgIH0sIDApO1xuICB9XG5cbiAgc3BhbnNNdWx0aXBsZUZpbGVzKHJvd3MpIHtcbiAgICBsZXQgbGFzdEZpbGVQYXRjaCA9IG51bGw7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgaWYgKGxhc3RGaWxlUGF0Y2gpIHtcbiAgICAgICAgaWYgKGxhc3RGaWxlUGF0Y2guY29udGFpbnNSb3cocm93KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXN0RmlsZVBhdGNoID0gdGhpcy5nZXRGaWxlUGF0Y2hBdChyb3cpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb2xsYXBzZUZpbGVQYXRjaChmaWxlUGF0Y2gpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZmlsZVBhdGNoZXMuaW5kZXhPZihmaWxlUGF0Y2gpO1xuXG4gICAgdGhpcy5maWxlUGF0Y2hlc0J5TWFya2VyLmRlbGV0ZShmaWxlUGF0Y2guZ2V0TWFya2VyKCkpO1xuICAgIGZvciAoY29uc3QgaHVuayBvZiBmaWxlUGF0Y2guZ2V0SHVua3MoKSkge1xuICAgICAgdGhpcy5odW5rc0J5TWFya2VyLmRlbGV0ZShodW5rLmdldE1hcmtlcigpKTtcbiAgICB9XG5cbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmdldE1hcmtlcnNCZWZvcmUoaW5kZXgpO1xuICAgIGNvbnN0IGFmdGVyID0gdGhpcy5nZXRNYXJrZXJzQWZ0ZXIoaW5kZXgpO1xuXG4gICAgZmlsZVBhdGNoLnRyaWdnZXJDb2xsYXBzZUluKHRoaXMucGF0Y2hCdWZmZXIsIHtiZWZvcmUsIGFmdGVyfSk7XG5cbiAgICB0aGlzLmZpbGVQYXRjaGVzQnlNYXJrZXIuc2V0KGZpbGVQYXRjaC5nZXRNYXJrZXIoKSwgZmlsZVBhdGNoKTtcblxuICAgIC8vIFRoaXMgaHVuayBjb2xsZWN0aW9uIHNob3VsZCBiZSBlbXB0eSwgYnV0IGxldCdzIGl0ZXJhdGUgYW55d2F5IGp1c3QgaW4gY2FzZSBmaWxlUGF0Y2ggd2FzIGFscmVhZHkgY29sbGFwc2VkXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmb3IgKGNvbnN0IGh1bmsgb2YgZmlsZVBhdGNoLmdldEh1bmtzKCkpIHtcbiAgICAgIHRoaXMuaHVua3NCeU1hcmtlci5zZXQoaHVuay5nZXRNYXJrZXIoKSwgaHVuayk7XG4gICAgfVxuICB9XG5cbiAgZXhwYW5kRmlsZVBhdGNoKGZpbGVQYXRjaCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5maWxlUGF0Y2hlcy5pbmRleE9mKGZpbGVQYXRjaCk7XG5cbiAgICB0aGlzLmZpbGVQYXRjaGVzQnlNYXJrZXIuZGVsZXRlKGZpbGVQYXRjaC5nZXRNYXJrZXIoKSk7XG4gICAgZm9yIChjb25zdCBodW5rIG9mIGZpbGVQYXRjaC5nZXRIdW5rcygpKSB7XG4gICAgICB0aGlzLmh1bmtzQnlNYXJrZXIuZGVsZXRlKGh1bmsuZ2V0TWFya2VyKCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuZ2V0TWFya2Vyc0JlZm9yZShpbmRleCk7XG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLmdldE1hcmtlcnNBZnRlcihpbmRleCk7XG5cbiAgICBmaWxlUGF0Y2gudHJpZ2dlckV4cGFuZEluKHRoaXMucGF0Y2hCdWZmZXIsIHtiZWZvcmUsIGFmdGVyfSk7XG5cbiAgICB0aGlzLmZpbGVQYXRjaGVzQnlNYXJrZXIuc2V0KGZpbGVQYXRjaC5nZXRNYXJrZXIoKSwgZmlsZVBhdGNoKTtcbiAgICBmb3IgKGNvbnN0IGh1bmsgb2YgZmlsZVBhdGNoLmdldEh1bmtzKCkpIHtcbiAgICAgIHRoaXMuaHVua3NCeU1hcmtlci5zZXQoaHVuay5nZXRNYXJrZXIoKSwgaHVuayk7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIHBhdGNoIHdhcyBpbml0aWFsbHkgY29sbGFwc2VkLCB3ZSBuZWVkIHRvIGNhbGN1bGF0ZVxuICAgIC8vIHRoZSBkaWZmUm93T2Zmc2V0SW5kaWNlcyB0byBjYWxjdWxhdGUgY29tbWVudCBwb3NpdGlvbi5cbiAgICBpZiAodGhpcy5pc0RpZmZSb3dPZmZzZXRJbmRleEVtcHR5KGZpbGVQYXRjaC5nZXRQYXRoKCkpKSB7XG4gICAgICB0aGlzLnBvcHVsYXRlRGlmZlJvd09mZnNldEluZGljZXMoZmlsZVBhdGNoKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXJrZXJzQmVmb3JlKGZpbGVQYXRjaEluZGV4KSB7XG4gICAgY29uc3QgYmVmb3JlID0gW107XG4gICAgbGV0IGJlZm9yZUluZGV4ID0gZmlsZVBhdGNoSW5kZXggLSAxO1xuICAgIHdoaWxlIChiZWZvcmVJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBiZWZvcmVGaWxlUGF0Y2ggPSB0aGlzLmZpbGVQYXRjaGVzW2JlZm9yZUluZGV4XTtcbiAgICAgIGJlZm9yZS5wdXNoKC4uLmJlZm9yZUZpbGVQYXRjaC5nZXRFbmRpbmdNYXJrZXJzKCkpO1xuXG4gICAgICBpZiAoIWJlZm9yZUZpbGVQYXRjaC5nZXRNYXJrZXIoKS5nZXRSYW5nZSgpLmlzRW1wdHkoKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJlZm9yZUluZGV4LS07XG4gICAgfVxuICAgIHJldHVybiBiZWZvcmU7XG4gIH1cblxuICBnZXRNYXJrZXJzQWZ0ZXIoZmlsZVBhdGNoSW5kZXgpIHtcbiAgICBjb25zdCBhZnRlciA9IFtdO1xuICAgIGxldCBhZnRlckluZGV4ID0gZmlsZVBhdGNoSW5kZXggKyAxO1xuICAgIHdoaWxlIChhZnRlckluZGV4IDwgdGhpcy5maWxlUGF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGFmdGVyRmlsZVBhdGNoID0gdGhpcy5maWxlUGF0Y2hlc1thZnRlckluZGV4XTtcbiAgICAgIGFmdGVyLnB1c2goLi4uYWZ0ZXJGaWxlUGF0Y2guZ2V0U3RhcnRpbmdNYXJrZXJzKCkpO1xuXG4gICAgICBpZiAoIWFmdGVyRmlsZVBhdGNoLmdldE1hcmtlcigpLmdldFJhbmdlKCkuaXNFbXB0eSgpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYWZ0ZXJJbmRleCsrO1xuICAgIH1cbiAgICByZXR1cm4gYWZ0ZXI7XG4gIH1cblxuICBpc1BhdGNoVmlzaWJsZSA9IGZpbGVQYXRjaFBhdGggPT4ge1xuICAgIGNvbnN0IHBhdGNoID0gdGhpcy5maWxlUGF0Y2hlc0J5UGF0aC5nZXQoZmlsZVBhdGNoUGF0aCk7XG4gICAgaWYgKCFwYXRjaCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcGF0Y2guZ2V0UmVuZGVyU3RhdHVzKCkuaXNWaXNpYmxlKCk7XG4gIH1cblxuICBnZXRCdWZmZXJSb3dGb3JEaWZmUG9zaXRpb24gPSAoZmlsZU5hbWUsIGRpZmZSb3cpID0+IHtcbiAgICBjb25zdCBvZmZzZXRJbmRleCA9IHRoaXMuZGlmZlJvd09mZnNldEluZGljZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoIW9mZnNldEluZGV4KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcignQXR0ZW1wdCB0byBjb21wdXRlIGJ1ZmZlciByb3cgZm9yIGludmFsaWQgZGlmZiBwb3NpdGlvbjogZmlsZSBub3QgaW5jbHVkZWQnLCB7XG4gICAgICAgIGZpbGVOYW1lLFxuICAgICAgICBkaWZmUm93LFxuICAgICAgICB2YWxpZEZpbGVOYW1lczogQXJyYXkuZnJvbSh0aGlzLmRpZmZSb3dPZmZzZXRJbmRpY2VzLmtleXMoKSksXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7c3RhcnRCdWZmZXJSb3csIGluZGV4fSA9IG9mZnNldEluZGV4O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gaW5kZXgubG93ZXJCb3VuZCh7ZGlmZlJvd30pLmRhdGEoKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0F0dGVtcHQgdG8gY29tcHV0ZSBidWZmZXIgcm93IGZvciBpbnZhbGlkIGRpZmYgcG9zaXRpb246IGRpZmYgcm93IG91dCBvZiByYW5nZScsIHtcbiAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgIGRpZmZSb3csXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7b2Zmc2V0fSA9IHJlc3VsdDtcblxuICAgIHJldHVybiBzdGFydEJ1ZmZlclJvdyArIGRpZmZSb3cgLSBvZmZzZXQ7XG4gIH1cblxuICBnZXRQcmV2aWV3UGF0Y2hCdWZmZXIoZmlsZU5hbWUsIGRpZmZSb3csIG1heFJvd0NvdW50KSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5nZXRCdWZmZXJSb3dGb3JEaWZmUG9zaXRpb24oZmlsZU5hbWUsIGRpZmZSb3cpO1xuICAgIGlmIChidWZmZXJSb3cgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgUGF0Y2hCdWZmZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0Y2ggPSB0aGlzLmdldEZpbGVQYXRjaEF0KGJ1ZmZlclJvdyk7XG4gICAgY29uc3QgZmlsZVBhdGNoSW5kZXggPSB0aGlzLmZpbGVQYXRjaGVzLmluZGV4T2YoZmlsZVBhdGNoKTtcbiAgICBjb25zdCBodW5rID0gdGhpcy5nZXRIdW5rQXQoYnVmZmVyUm93KTtcblxuICAgIGNvbnN0IHByZXZpZXdTdGFydFJvdyA9IE1hdGgubWF4KGJ1ZmZlclJvdyAtIG1heFJvd0NvdW50ICsgMSwgaHVuay5nZXRSYW5nZSgpLnN0YXJ0LnJvdyk7XG4gICAgY29uc3QgcHJldmlld0VuZFJvdyA9IGJ1ZmZlclJvdztcblxuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuZ2V0TWFya2Vyc0JlZm9yZShmaWxlUGF0Y2hJbmRleCk7XG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLmdldE1hcmtlcnNBZnRlcihmaWxlUGF0Y2hJbmRleCk7XG4gICAgY29uc3QgZXhjbHVkZSA9IG5ldyBTZXQoWy4uLmJlZm9yZSwgLi4uYWZ0ZXJdKTtcblxuICAgIHJldHVybiB0aGlzLnBhdGNoQnVmZmVyLmNyZWF0ZVN1YkJ1ZmZlcihbW3ByZXZpZXdTdGFydFJvdywgMF0sIFtwcmV2aWV3RW5kUm93LCBJbmZpbml0eV1dLCB7ZXhjbHVkZX0pLnBhdGNoQnVmZmVyO1xuICB9XG5cbiAgLypcbiAgICogQ29uc3RydWN0IGFuIGFwcGx5LWFibGUgcGF0Y2ggU3RyaW5nLlxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdGNoZXMubWFwKGZwID0+IGZwLnRvU3RyaW5nSW4odGhpcy5nZXRCdWZmZXIoKSkpLmpvaW4oJycpICsgJ1xcbic7XG4gIH1cblxuICAvKlxuICAgKiBDb25zdHJ1Y3QgYSBzdHJpbmcgb2YgZGlhZ25vc3RpYyBpbmZvcm1hdGlvbiB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGluc3BlY3QoKSB7XG4gICAgbGV0IGluc3BlY3RTdHJpbmcgPSAnKE11bHRpRmlsZVBhdGNoJztcbiAgICBpbnNwZWN0U3RyaW5nICs9IGAgZmlsZVBhdGNoZXNCeU1hcmtlcj0oJHtBcnJheS5mcm9tKHRoaXMuZmlsZVBhdGNoZXNCeU1hcmtlci5rZXlzKCksIG0gPT4gbS5pZCkuam9pbignLCAnKX0pYDtcbiAgICBpbnNwZWN0U3RyaW5nICs9IGAgaHVua3NCeU1hcmtlcj0oJHtBcnJheS5mcm9tKHRoaXMuaHVua3NCeU1hcmtlci5rZXlzKCksIG0gPT4gbS5pZCkuam9pbignLCAnKX0pXFxuYDtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRjaCBvZiB0aGlzLmZpbGVQYXRjaGVzKSB7XG4gICAgICBpbnNwZWN0U3RyaW5nICs9IGZpbGVQYXRjaC5pbnNwZWN0KHtpbmRlbnQ6IDJ9KTtcbiAgICB9XG4gICAgaW5zcGVjdFN0cmluZyArPSAnKVxcbic7XG4gICAgcmV0dXJuIGluc3BlY3RTdHJpbmc7XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpc0VxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKSA9PT0gb3RoZXIudG9TdHJpbmcoKTtcbiAgfVxufVxuIl19