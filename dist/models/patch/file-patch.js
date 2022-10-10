"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventKit = require("event-kit");

var _file = require("./file");

var _patch = _interopRequireWildcard(require("./patch"));

var _helpers = require("../../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class FilePatch {
  static createNull() {
    return new this(_file.nullFile, _file.nullFile, _patch.default.createNull());
  }

  static createHiddenFilePatch(oldFile, newFile, marker, renderStatus, showFn) {
    return new this(oldFile, newFile, _patch.default.createHiddenPatch(marker, renderStatus, showFn));
  }

  constructor(oldFile, newFile, patch, rawPatches) {
    this.oldFile = oldFile;
    this.newFile = newFile;
    this.patch = patch;
    this.rawPatches = rawPatches;
    this.emitter = new _eventKit.Emitter();
  }

  isPresent() {
    return this.oldFile.isPresent() || this.newFile.isPresent() || this.patch.isPresent();
  }

  getRenderStatus() {
    return this.patch.getRenderStatus();
  }

  getOldFile() {
    return this.oldFile;
  }

  getNewFile() {
    return this.newFile;
  }

  getRawContentPatch() {
    if (!this.rawPatches) {
      throw new Error('FilePatch was not parsed with {perserveOriginal: true}');
    }

    return this.rawPatches.content;
  }

  getPatch() {
    return this.patch;
  }

  getMarker() {
    return this.getPatch().getMarker();
  }

  getStartRange() {
    return this.getPatch().getStartRange();
  }

  getOldPath() {
    return this.getOldFile().getPath();
  }

  getNewPath() {
    return this.getNewFile().getPath();
  }

  getOldMode() {
    return this.getOldFile().getMode();
  }

  getNewMode() {
    return this.getNewFile().getMode();
  }

  getOldSymlink() {
    return this.getOldFile().getSymlink();
  }

  getNewSymlink() {
    return this.getNewFile().getSymlink();
  }

  getFirstChangeRange() {
    return this.getPatch().getFirstChangeRange();
  }

  getMaxLineNumberWidth() {
    return this.getPatch().getMaxLineNumberWidth();
  }

  containsRow(row) {
    return this.getPatch().containsRow(row);
  }

  didChangeExecutableMode() {
    if (!this.oldFile.isPresent() || !this.newFile.isPresent()) {
      return false;
    }

    return this.oldFile.isExecutable() && !this.newFile.isExecutable() || !this.oldFile.isExecutable() && this.newFile.isExecutable();
  }

  hasSymlink() {
    return Boolean(this.getOldFile().getSymlink() || this.getNewFile().getSymlink());
  }

  hasTypechange() {
    if (!this.oldFile.isPresent() || !this.newFile.isPresent()) {
      return false;
    }

    return this.oldFile.isSymlink() && !this.newFile.isSymlink() || !this.oldFile.isSymlink() && this.newFile.isSymlink();
  }

  getPath() {
    return this.getOldPath() || this.getNewPath();
  }

  getStatus() {
    return this.getPatch().getStatus();
  }

  getHunks() {
    return this.getPatch().getHunks();
  }

  updateMarkers(map) {
    return this.patch.updateMarkers(map);
  }

  triggerCollapseIn(patchBuffer, {
    before,
    after
  }) {
    if (!this.patch.getRenderStatus().isVisible()) {
      return false;
    }

    const oldPatch = this.patch;
    const oldRange = oldPatch.getRange().copy();
    const insertionPosition = oldRange.start;
    const exclude = new Set([...before, ...after]);
    const {
      patchBuffer: subPatchBuffer,
      markerMap
    } = patchBuffer.extractPatchBuffer(oldRange, {
      exclude
    });
    oldPatch.destroyMarkers();
    oldPatch.updateMarkers(markerMap); // Delete the separating newline after the collapsing patch, if any.

    if (!oldRange.isEmpty()) {
      patchBuffer.getBuffer().deleteRow(insertionPosition.row);
    }

    const patchMarker = patchBuffer.markPosition(_patch.default.layerName, insertionPosition, {
      invalidate: 'never',
      exclusive: true
    });
    this.patch = _patch.default.createHiddenPatch(patchMarker, _patch.COLLAPSED, () => {
      return {
        patch: oldPatch,
        patchBuffer: subPatchBuffer
      };
    });
    this.didChangeRenderStatus();
    return true;
  }

  triggerExpandIn(patchBuffer, {
    before,
    after
  }) {
    if (this.patch.getRenderStatus().isVisible()) {
      return false;
    }

    const {
      patch: nextPatch,
      patchBuffer: subPatchBuffer
    } = this.patch.show();
    const atStart = this.patch.getInsertionPoint().isEqual([0, 0]);
    const atEnd = this.patch.getInsertionPoint().isEqual(patchBuffer.getBuffer().getEndPosition());
    const willHaveContent = !subPatchBuffer.getBuffer().isEmpty(); // The expanding patch's insertion point is just after the unmarked newline that separates adjacent visible
    // patches:
    // <p0> '\n' * <p1> '\n' <p2>
    //
    // If it's to become the first (visible) patch, its insertion point is at [0, 0]:
    // * <p0> '\n' <p1> '\n' <p2>
    //
    // If it's to become the final (visible) patch, its insertion point is at the buffer end:
    // <p0> '\n' <p1> '\n' <p2> *
    //
    // Insert a newline *before* the expanding patch if we're inserting at the buffer's end, but the buffer is non-empty
    // (so it isn't also the end of the buffer). Insert a newline *after* the expanding patch when inserting anywhere
    // but the buffer's end.

    if (willHaveContent && atEnd && !atStart) {
      const beforeNewline = [];
      const afterNewline = after.slice();

      for (const marker of before) {
        if (marker.getRange().isEmpty()) {
          afterNewline.push(marker);
        } else {
          beforeNewline.push(marker);
        }
      }

      patchBuffer.createInserterAt(this.patch.getInsertionPoint()).keepBefore(beforeNewline).keepAfter(afterNewline).insert('\n').apply();
    }

    patchBuffer.createInserterAt(this.patch.getInsertionPoint()).keepBefore(before).keepAfter(after).insertPatchBuffer(subPatchBuffer, {
      callback: map => nextPatch.updateMarkers(map)
    }).insert(!atEnd ? '\n' : '').apply();
    this.patch.destroyMarkers();
    this.patch = nextPatch;
    this.didChangeRenderStatus();
    return true;
  }

  didChangeRenderStatus() {
    return this.emitter.emit('change-render-status', this);
  }

  onDidChangeRenderStatus(callback) {
    return this.emitter.on('change-render-status', callback);
  }

  clone(opts = {}) {
    return new this.constructor(opts.oldFile !== undefined ? opts.oldFile : this.oldFile, opts.newFile !== undefined ? opts.newFile : this.newFile, opts.patch !== undefined ? opts.patch : this.patch);
  }

  getStartingMarkers() {
    return this.patch.getStartingMarkers();
  }

  getEndingMarkers() {
    return this.patch.getEndingMarkers();
  }

  buildStagePatchForLines(originalBuffer, nextPatchBuffer, selectedLineSet) {
    let newFile = this.getNewFile();

    if (this.getStatus() === 'deleted') {
      if (this.patch.getChangedLineCount() === selectedLineSet.size && Array.from(selectedLineSet, row => this.patch.containsRow(row)).every(Boolean)) {
        // Whole file deletion staged.
        newFile = _file.nullFile;
      } else {
        // Partial file deletion, which becomes a modification.
        newFile = this.getOldFile();
      }
    }

    const patch = this.patch.buildStagePatchForLines(originalBuffer, nextPatchBuffer, selectedLineSet);
    return this.clone({
      newFile,
      patch
    });
  }

  buildUnstagePatchForLines(originalBuffer, nextPatchBuffer, selectedLineSet) {
    const nonNullFile = this.getNewFile().isPresent() ? this.getNewFile() : this.getOldFile();
    let oldFile = this.getNewFile();
    let newFile = nonNullFile;

    if (this.getStatus() === 'added') {
      if (selectedLineSet.size === this.patch.getChangedLineCount() && Array.from(selectedLineSet, row => this.patch.containsRow(row)).every(Boolean)) {
        // Ensure that newFile is null if the patch is an addition because we're deleting the entire file from the
        // index. If a symlink was deleted and replaced by a non-symlink file, we don't want the symlink entry to muck
        // up the patch.
        oldFile = nonNullFile;
        newFile = _file.nullFile;
      }
    } else if (this.getStatus() === 'deleted') {
      if (selectedLineSet.size === this.patch.getChangedLineCount() && Array.from(selectedLineSet, row => this.patch.containsRow(row)).every(Boolean)) {
        oldFile = _file.nullFile;
        newFile = nonNullFile;
      }
    }

    const patch = this.patch.buildUnstagePatchForLines(originalBuffer, nextPatchBuffer, selectedLineSet);
    return this.clone({
      oldFile,
      newFile,
      patch
    });
  }

  toStringIn(buffer) {
    if (!this.isPresent()) {
      return '';
    }

    if (this.hasTypechange()) {
      const left = this.clone({
        newFile: _file.nullFile,
        patch: this.getOldSymlink() ? this.getPatch().clone({
          status: 'deleted'
        }) : this.getPatch()
      });
      const right = this.clone({
        oldFile: _file.nullFile,
        patch: this.getNewSymlink() ? this.getPatch().clone({
          status: 'added'
        }) : this.getPatch()
      });
      return left.toStringIn(buffer) + right.toStringIn(buffer);
    } else if (this.getStatus() === 'added' && this.getNewFile().isSymlink()) {
      const symlinkPath = this.getNewSymlink();
      return this.getHeaderString() + `@@ -0,0 +1 @@\n+${symlinkPath}\n\\ No newline at end of file\n`;
    } else if (this.getStatus() === 'deleted' && this.getOldFile().isSymlink()) {
      const symlinkPath = this.getOldSymlink();
      return this.getHeaderString() + `@@ -1 +0,0 @@\n-${symlinkPath}\n\\ No newline at end of file\n`;
    } else {
      return this.getHeaderString() + this.getPatch().toStringIn(buffer);
    }
  }
  /*
   * Construct a String containing diagnostic information about the internal state of this FilePatch.
   */

  /* istanbul ignore next */


  inspect(opts = {}) {
    const options = _objectSpread2({
      indent: 0
    }, opts);

    let indentation = '';

    for (let i = 0; i < options.indent; i++) {
      indentation += ' ';
    }

    let inspectString = `${indentation}(FilePatch `;

    if (this.getOldPath() !== this.getNewPath()) {
      inspectString += `oldPath=${this.getOldPath()} newPath=${this.getNewPath()}`;
    } else {
      inspectString += `path=${this.getPath()}`;
    }

    inspectString += '\n';
    inspectString += this.patch.inspect({
      indent: options.indent + 2
    });
    inspectString += `${indentation})\n`;
    return inspectString;
  }

  getHeaderString() {
    const fromPath = this.getOldPath() || this.getNewPath();
    const toPath = this.getNewPath() || this.getOldPath();
    let header = `diff --git a/${(0, _helpers.toGitPathSep)(fromPath)} b/${(0, _helpers.toGitPathSep)(toPath)}`;
    header += '\n';

    if (this.getStatus() === 'added') {
      header += `new file mode ${this.getNewMode()}`;
      header += '\n';
    } else if (this.getStatus() === 'deleted') {
      header += `deleted file mode ${this.getOldMode()}`;
      header += '\n';
    }

    header += this.getOldPath() ? `--- a/${(0, _helpers.toGitPathSep)(this.getOldPath())}` : '--- /dev/null';
    header += '\n';
    header += this.getNewPath() ? `+++ b/${(0, _helpers.toGitPathSep)(this.getNewPath())}` : '+++ /dev/null';
    header += '\n';
    return header;
  }

}

exports.default = FilePatch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvZmlsZS1wYXRjaC5qcyJdLCJuYW1lcyI6WyJGaWxlUGF0Y2giLCJjcmVhdGVOdWxsIiwibnVsbEZpbGUiLCJQYXRjaCIsImNyZWF0ZUhpZGRlbkZpbGVQYXRjaCIsIm9sZEZpbGUiLCJuZXdGaWxlIiwibWFya2VyIiwicmVuZGVyU3RhdHVzIiwic2hvd0ZuIiwiY3JlYXRlSGlkZGVuUGF0Y2giLCJjb25zdHJ1Y3RvciIsInBhdGNoIiwicmF3UGF0Y2hlcyIsImVtaXR0ZXIiLCJFbWl0dGVyIiwiaXNQcmVzZW50IiwiZ2V0UmVuZGVyU3RhdHVzIiwiZ2V0T2xkRmlsZSIsImdldE5ld0ZpbGUiLCJnZXRSYXdDb250ZW50UGF0Y2giLCJFcnJvciIsImNvbnRlbnQiLCJnZXRQYXRjaCIsImdldE1hcmtlciIsImdldFN0YXJ0UmFuZ2UiLCJnZXRPbGRQYXRoIiwiZ2V0UGF0aCIsImdldE5ld1BhdGgiLCJnZXRPbGRNb2RlIiwiZ2V0TW9kZSIsImdldE5ld01vZGUiLCJnZXRPbGRTeW1saW5rIiwiZ2V0U3ltbGluayIsImdldE5ld1N5bWxpbmsiLCJnZXRGaXJzdENoYW5nZVJhbmdlIiwiZ2V0TWF4TGluZU51bWJlcldpZHRoIiwiY29udGFpbnNSb3ciLCJyb3ciLCJkaWRDaGFuZ2VFeGVjdXRhYmxlTW9kZSIsImlzRXhlY3V0YWJsZSIsImhhc1N5bWxpbmsiLCJCb29sZWFuIiwiaGFzVHlwZWNoYW5nZSIsImlzU3ltbGluayIsImdldFN0YXR1cyIsImdldEh1bmtzIiwidXBkYXRlTWFya2VycyIsIm1hcCIsInRyaWdnZXJDb2xsYXBzZUluIiwicGF0Y2hCdWZmZXIiLCJiZWZvcmUiLCJhZnRlciIsImlzVmlzaWJsZSIsIm9sZFBhdGNoIiwib2xkUmFuZ2UiLCJnZXRSYW5nZSIsImNvcHkiLCJpbnNlcnRpb25Qb3NpdGlvbiIsInN0YXJ0IiwiZXhjbHVkZSIsIlNldCIsInN1YlBhdGNoQnVmZmVyIiwibWFya2VyTWFwIiwiZXh0cmFjdFBhdGNoQnVmZmVyIiwiZGVzdHJveU1hcmtlcnMiLCJpc0VtcHR5IiwiZ2V0QnVmZmVyIiwiZGVsZXRlUm93IiwicGF0Y2hNYXJrZXIiLCJtYXJrUG9zaXRpb24iLCJsYXllck5hbWUiLCJpbnZhbGlkYXRlIiwiZXhjbHVzaXZlIiwiQ09MTEFQU0VEIiwiZGlkQ2hhbmdlUmVuZGVyU3RhdHVzIiwidHJpZ2dlckV4cGFuZEluIiwibmV4dFBhdGNoIiwic2hvdyIsImF0U3RhcnQiLCJnZXRJbnNlcnRpb25Qb2ludCIsImlzRXF1YWwiLCJhdEVuZCIsImdldEVuZFBvc2l0aW9uIiwid2lsbEhhdmVDb250ZW50IiwiYmVmb3JlTmV3bGluZSIsImFmdGVyTmV3bGluZSIsInNsaWNlIiwicHVzaCIsImNyZWF0ZUluc2VydGVyQXQiLCJrZWVwQmVmb3JlIiwia2VlcEFmdGVyIiwiaW5zZXJ0IiwiYXBwbHkiLCJpbnNlcnRQYXRjaEJ1ZmZlciIsImNhbGxiYWNrIiwiZW1pdCIsIm9uRGlkQ2hhbmdlUmVuZGVyU3RhdHVzIiwib24iLCJjbG9uZSIsIm9wdHMiLCJ1bmRlZmluZWQiLCJnZXRTdGFydGluZ01hcmtlcnMiLCJnZXRFbmRpbmdNYXJrZXJzIiwiYnVpbGRTdGFnZVBhdGNoRm9yTGluZXMiLCJvcmlnaW5hbEJ1ZmZlciIsIm5leHRQYXRjaEJ1ZmZlciIsInNlbGVjdGVkTGluZVNldCIsImdldENoYW5nZWRMaW5lQ291bnQiLCJzaXplIiwiQXJyYXkiLCJmcm9tIiwiZXZlcnkiLCJidWlsZFVuc3RhZ2VQYXRjaEZvckxpbmVzIiwibm9uTnVsbEZpbGUiLCJ0b1N0cmluZ0luIiwiYnVmZmVyIiwibGVmdCIsInN0YXR1cyIsInJpZ2h0Iiwic3ltbGlua1BhdGgiLCJnZXRIZWFkZXJTdHJpbmciLCJpbnNwZWN0Iiwib3B0aW9ucyIsImluZGVudCIsImluZGVudGF0aW9uIiwiaSIsImluc3BlY3RTdHJpbmciLCJmcm9tUGF0aCIsInRvUGF0aCIsImhlYWRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7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QUFvQztBQUN6Q3FGLE1BQUFBLE1BQU0sSUFBSyxxQkFBb0IsS0FBS3JHLFVBQUwsRUFBa0IsRUFBakQ7QUFDQXFHLE1BQUFBLE1BQU0sSUFBSSxJQUFWO0FBQ0Q7O0FBQ0RBLElBQUFBLE1BQU0sSUFBSSxLQUFLeEcsVUFBTCxLQUFxQixTQUFRLDJCQUFhLEtBQUtBLFVBQUwsRUFBYixDQUFnQyxFQUE3RCxHQUFpRSxlQUEzRTtBQUNBd0csSUFBQUEsTUFBTSxJQUFJLElBQVY7QUFDQUEsSUFBQUEsTUFBTSxJQUFJLEtBQUt0RyxVQUFMLEtBQXFCLFNBQVEsMkJBQWEsS0FBS0EsVUFBTCxFQUFiLENBQWdDLEVBQTdELEdBQWlFLGVBQTNFO0FBQ0FzRyxJQUFBQSxNQUFNLElBQUksSUFBVjtBQUNBLFdBQU9BLE1BQVA7QUFDRDs7QUFwWDRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdldmVudC1raXQnO1xuXG5pbXBvcnQge251bGxGaWxlfSBmcm9tICcuL2ZpbGUnO1xuaW1wb3J0IFBhdGNoLCB7Q09MTEFQU0VEfSBmcm9tICcuL3BhdGNoJztcbmltcG9ydCB7dG9HaXRQYXRoU2VwfSBmcm9tICcuLi8uLi9oZWxwZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZVBhdGNoIHtcbiAgc3RhdGljIGNyZWF0ZU51bGwoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG51bGxGaWxlLCBudWxsRmlsZSwgUGF0Y2guY3JlYXRlTnVsbCgpKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVIaWRkZW5GaWxlUGF0Y2gob2xkRmlsZSwgbmV3RmlsZSwgbWFya2VyLCByZW5kZXJTdGF0dXMsIHNob3dGbikge1xuICAgIHJldHVybiBuZXcgdGhpcyhvbGRGaWxlLCBuZXdGaWxlLCBQYXRjaC5jcmVhdGVIaWRkZW5QYXRjaChtYXJrZXIsIHJlbmRlclN0YXR1cywgc2hvd0ZuKSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihvbGRGaWxlLCBuZXdGaWxlLCBwYXRjaCwgcmF3UGF0Y2hlcykge1xuICAgIHRoaXMub2xkRmlsZSA9IG9sZEZpbGU7XG4gICAgdGhpcy5uZXdGaWxlID0gbmV3RmlsZTtcbiAgICB0aGlzLnBhdGNoID0gcGF0Y2g7XG4gICAgdGhpcy5yYXdQYXRjaGVzID0gcmF3UGF0Y2hlcztcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gIH1cblxuICBpc1ByZXNlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMub2xkRmlsZS5pc1ByZXNlbnQoKSB8fCB0aGlzLm5ld0ZpbGUuaXNQcmVzZW50KCkgfHwgdGhpcy5wYXRjaC5pc1ByZXNlbnQoKTtcbiAgfVxuXG4gIGdldFJlbmRlclN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRjaC5nZXRSZW5kZXJTdGF0dXMoKTtcbiAgfVxuXG4gIGdldE9sZEZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMub2xkRmlsZTtcbiAgfVxuXG4gIGdldE5ld0ZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMubmV3RmlsZTtcbiAgfVxuXG4gIGdldFJhd0NvbnRlbnRQYXRjaCgpIHtcbiAgICBpZiAoIXRoaXMucmF3UGF0Y2hlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlUGF0Y2ggd2FzIG5vdCBwYXJzZWQgd2l0aCB7cGVyc2VydmVPcmlnaW5hbDogdHJ1ZX0nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yYXdQYXRjaGVzLmNvbnRlbnQ7XG4gIH1cblxuICBnZXRQYXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRjaDtcbiAgfVxuXG4gIGdldE1hcmtlcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXRjaCgpLmdldE1hcmtlcigpO1xuICB9XG5cbiAgZ2V0U3RhcnRSYW5nZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXRjaCgpLmdldFN0YXJ0UmFuZ2UoKTtcbiAgfVxuXG4gIGdldE9sZFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0T2xkRmlsZSgpLmdldFBhdGgoKTtcbiAgfVxuXG4gIGdldE5ld1BhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmV3RmlsZSgpLmdldFBhdGgoKTtcbiAgfVxuXG4gIGdldE9sZE1vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0T2xkRmlsZSgpLmdldE1vZGUoKTtcbiAgfVxuXG4gIGdldE5ld01vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmV3RmlsZSgpLmdldE1vZGUoKTtcbiAgfVxuXG4gIGdldE9sZFN5bWxpbmsoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0T2xkRmlsZSgpLmdldFN5bWxpbmsoKTtcbiAgfVxuXG4gIGdldE5ld1N5bWxpbmsoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmV3RmlsZSgpLmdldFN5bWxpbmsoKTtcbiAgfVxuXG4gIGdldEZpcnN0Q2hhbmdlUmFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2goKS5nZXRGaXJzdENoYW5nZVJhbmdlKCk7XG4gIH1cblxuICBnZXRNYXhMaW5lTnVtYmVyV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2goKS5nZXRNYXhMaW5lTnVtYmVyV2lkdGgoKTtcbiAgfVxuXG4gIGNvbnRhaW5zUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLmdldFBhdGNoKCkuY29udGFpbnNSb3cocm93KTtcbiAgfVxuXG4gIGRpZENoYW5nZUV4ZWN1dGFibGVNb2RlKCkge1xuICAgIGlmICghdGhpcy5vbGRGaWxlLmlzUHJlc2VudCgpIHx8ICF0aGlzLm5ld0ZpbGUuaXNQcmVzZW50KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vbGRGaWxlLmlzRXhlY3V0YWJsZSgpICYmICF0aGlzLm5ld0ZpbGUuaXNFeGVjdXRhYmxlKCkgfHxcbiAgICAgICF0aGlzLm9sZEZpbGUuaXNFeGVjdXRhYmxlKCkgJiYgdGhpcy5uZXdGaWxlLmlzRXhlY3V0YWJsZSgpO1xuICB9XG5cbiAgaGFzU3ltbGluaygpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLmdldE9sZEZpbGUoKS5nZXRTeW1saW5rKCkgfHwgdGhpcy5nZXROZXdGaWxlKCkuZ2V0U3ltbGluaygpKTtcbiAgfVxuXG4gIGhhc1R5cGVjaGFuZ2UoKSB7XG4gICAgaWYgKCF0aGlzLm9sZEZpbGUuaXNQcmVzZW50KCkgfHwgIXRoaXMubmV3RmlsZS5pc1ByZXNlbnQoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9sZEZpbGUuaXNTeW1saW5rKCkgJiYgIXRoaXMubmV3RmlsZS5pc1N5bWxpbmsoKSB8fFxuICAgICAgIXRoaXMub2xkRmlsZS5pc1N5bWxpbmsoKSAmJiB0aGlzLm5ld0ZpbGUuaXNTeW1saW5rKCk7XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIHJldHVybiB0aGlzLmdldE9sZFBhdGgoKSB8fCB0aGlzLmdldE5ld1BhdGgoKTtcbiAgfVxuXG4gIGdldFN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXRjaCgpLmdldFN0YXR1cygpO1xuICB9XG5cbiAgZ2V0SHVua3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2goKS5nZXRIdW5rcygpO1xuICB9XG5cbiAgdXBkYXRlTWFya2VycyhtYXApIHtcbiAgICByZXR1cm4gdGhpcy5wYXRjaC51cGRhdGVNYXJrZXJzKG1hcCk7XG4gIH1cblxuICB0cmlnZ2VyQ29sbGFwc2VJbihwYXRjaEJ1ZmZlciwge2JlZm9yZSwgYWZ0ZXJ9KSB7XG4gICAgaWYgKCF0aGlzLnBhdGNoLmdldFJlbmRlclN0YXR1cygpLmlzVmlzaWJsZSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgb2xkUGF0Y2ggPSB0aGlzLnBhdGNoO1xuICAgIGNvbnN0IG9sZFJhbmdlID0gb2xkUGF0Y2guZ2V0UmFuZ2UoKS5jb3B5KCk7XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9zaXRpb24gPSBvbGRSYW5nZS5zdGFydDtcbiAgICBjb25zdCBleGNsdWRlID0gbmV3IFNldChbLi4uYmVmb3JlLCAuLi5hZnRlcl0pO1xuICAgIGNvbnN0IHtwYXRjaEJ1ZmZlcjogc3ViUGF0Y2hCdWZmZXIsIG1hcmtlck1hcH0gPSBwYXRjaEJ1ZmZlci5leHRyYWN0UGF0Y2hCdWZmZXIob2xkUmFuZ2UsIHtleGNsdWRlfSk7XG4gICAgb2xkUGF0Y2guZGVzdHJveU1hcmtlcnMoKTtcbiAgICBvbGRQYXRjaC51cGRhdGVNYXJrZXJzKG1hcmtlck1hcCk7XG5cbiAgICAvLyBEZWxldGUgdGhlIHNlcGFyYXRpbmcgbmV3bGluZSBhZnRlciB0aGUgY29sbGFwc2luZyBwYXRjaCwgaWYgYW55LlxuICAgIGlmICghb2xkUmFuZ2UuaXNFbXB0eSgpKSB7XG4gICAgICBwYXRjaEJ1ZmZlci5nZXRCdWZmZXIoKS5kZWxldGVSb3coaW5zZXJ0aW9uUG9zaXRpb24ucm93KTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXRjaE1hcmtlciA9IHBhdGNoQnVmZmVyLm1hcmtQb3NpdGlvbihcbiAgICAgIFBhdGNoLmxheWVyTmFtZSxcbiAgICAgIGluc2VydGlvblBvc2l0aW9uLFxuICAgICAge2ludmFsaWRhdGU6ICduZXZlcicsIGV4Y2x1c2l2ZTogdHJ1ZX0sXG4gICAgKTtcbiAgICB0aGlzLnBhdGNoID0gUGF0Y2guY3JlYXRlSGlkZGVuUGF0Y2gocGF0Y2hNYXJrZXIsIENPTExBUFNFRCwgKCkgPT4ge1xuICAgICAgcmV0dXJuIHtwYXRjaDogb2xkUGF0Y2gsIHBhdGNoQnVmZmVyOiBzdWJQYXRjaEJ1ZmZlcn07XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpZENoYW5nZVJlbmRlclN0YXR1cygpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdHJpZ2dlckV4cGFuZEluKHBhdGNoQnVmZmVyLCB7YmVmb3JlLCBhZnRlcn0pIHtcbiAgICBpZiAodGhpcy5wYXRjaC5nZXRSZW5kZXJTdGF0dXMoKS5pc1Zpc2libGUoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHtwYXRjaDogbmV4dFBhdGNoLCBwYXRjaEJ1ZmZlcjogc3ViUGF0Y2hCdWZmZXJ9ID0gdGhpcy5wYXRjaC5zaG93KCk7XG4gICAgY29uc3QgYXRTdGFydCA9IHRoaXMucGF0Y2guZ2V0SW5zZXJ0aW9uUG9pbnQoKS5pc0VxdWFsKFswLCAwXSk7XG4gICAgY29uc3QgYXRFbmQgPSB0aGlzLnBhdGNoLmdldEluc2VydGlvblBvaW50KCkuaXNFcXVhbChwYXRjaEJ1ZmZlci5nZXRCdWZmZXIoKS5nZXRFbmRQb3NpdGlvbigpKTtcbiAgICBjb25zdCB3aWxsSGF2ZUNvbnRlbnQgPSAhc3ViUGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuaXNFbXB0eSgpO1xuXG4gICAgLy8gVGhlIGV4cGFuZGluZyBwYXRjaCdzIGluc2VydGlvbiBwb2ludCBpcyBqdXN0IGFmdGVyIHRoZSB1bm1hcmtlZCBuZXdsaW5lIHRoYXQgc2VwYXJhdGVzIGFkamFjZW50IHZpc2libGVcbiAgICAvLyBwYXRjaGVzOlxuICAgIC8vIDxwMD4gJ1xcbicgKiA8cDE+ICdcXG4nIDxwMj5cbiAgICAvL1xuICAgIC8vIElmIGl0J3MgdG8gYmVjb21lIHRoZSBmaXJzdCAodmlzaWJsZSkgcGF0Y2gsIGl0cyBpbnNlcnRpb24gcG9pbnQgaXMgYXQgWzAsIDBdOlxuICAgIC8vICogPHAwPiAnXFxuJyA8cDE+ICdcXG4nIDxwMj5cbiAgICAvL1xuICAgIC8vIElmIGl0J3MgdG8gYmVjb21lIHRoZSBmaW5hbCAodmlzaWJsZSkgcGF0Y2gsIGl0cyBpbnNlcnRpb24gcG9pbnQgaXMgYXQgdGhlIGJ1ZmZlciBlbmQ6XG4gICAgLy8gPHAwPiAnXFxuJyA8cDE+ICdcXG4nIDxwMj4gKlxuICAgIC8vXG4gICAgLy8gSW5zZXJ0IGEgbmV3bGluZSAqYmVmb3JlKiB0aGUgZXhwYW5kaW5nIHBhdGNoIGlmIHdlJ3JlIGluc2VydGluZyBhdCB0aGUgYnVmZmVyJ3MgZW5kLCBidXQgdGhlIGJ1ZmZlciBpcyBub24tZW1wdHlcbiAgICAvLyAoc28gaXQgaXNuJ3QgYWxzbyB0aGUgZW5kIG9mIHRoZSBidWZmZXIpLiBJbnNlcnQgYSBuZXdsaW5lICphZnRlciogdGhlIGV4cGFuZGluZyBwYXRjaCB3aGVuIGluc2VydGluZyBhbnl3aGVyZVxuICAgIC8vIGJ1dCB0aGUgYnVmZmVyJ3MgZW5kLlxuXG4gICAgaWYgKHdpbGxIYXZlQ29udGVudCAmJiBhdEVuZCAmJiAhYXRTdGFydCkge1xuICAgICAgY29uc3QgYmVmb3JlTmV3bGluZSA9IFtdO1xuICAgICAgY29uc3QgYWZ0ZXJOZXdsaW5lID0gYWZ0ZXIuc2xpY2UoKTtcblxuICAgICAgZm9yIChjb25zdCBtYXJrZXIgb2YgYmVmb3JlKSB7XG4gICAgICAgIGlmIChtYXJrZXIuZ2V0UmFuZ2UoKS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICBhZnRlck5ld2xpbmUucHVzaChtYXJrZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJlZm9yZU5ld2xpbmUucHVzaChtYXJrZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHBhdGNoQnVmZmVyXG4gICAgICAgIC5jcmVhdGVJbnNlcnRlckF0KHRoaXMucGF0Y2guZ2V0SW5zZXJ0aW9uUG9pbnQoKSlcbiAgICAgICAgLmtlZXBCZWZvcmUoYmVmb3JlTmV3bGluZSlcbiAgICAgICAgLmtlZXBBZnRlcihhZnRlck5ld2xpbmUpXG4gICAgICAgIC5pbnNlcnQoJ1xcbicpXG4gICAgICAgIC5hcHBseSgpO1xuICAgIH1cblxuICAgIHBhdGNoQnVmZmVyXG4gICAgICAuY3JlYXRlSW5zZXJ0ZXJBdCh0aGlzLnBhdGNoLmdldEluc2VydGlvblBvaW50KCkpXG4gICAgICAua2VlcEJlZm9yZShiZWZvcmUpXG4gICAgICAua2VlcEFmdGVyKGFmdGVyKVxuICAgICAgLmluc2VydFBhdGNoQnVmZmVyKHN1YlBhdGNoQnVmZmVyLCB7Y2FsbGJhY2s6IG1hcCA9PiBuZXh0UGF0Y2gudXBkYXRlTWFya2VycyhtYXApfSlcbiAgICAgIC5pbnNlcnQoIWF0RW5kID8gJ1xcbicgOiAnJylcbiAgICAgIC5hcHBseSgpO1xuXG4gICAgdGhpcy5wYXRjaC5kZXN0cm95TWFya2VycygpO1xuICAgIHRoaXMucGF0Y2ggPSBuZXh0UGF0Y2g7XG4gICAgdGhpcy5kaWRDaGFuZ2VSZW5kZXJTdGF0dXMoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRpZENoYW5nZVJlbmRlclN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2NoYW5nZS1yZW5kZXItc3RhdHVzJywgdGhpcyk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJlbmRlclN0YXR1cyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2NoYW5nZS1yZW5kZXItc3RhdHVzJywgY2FsbGJhY2spO1xuICB9XG5cbiAgY2xvbmUob3B0cyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKFxuICAgICAgb3B0cy5vbGRGaWxlICE9PSB1bmRlZmluZWQgPyBvcHRzLm9sZEZpbGUgOiB0aGlzLm9sZEZpbGUsXG4gICAgICBvcHRzLm5ld0ZpbGUgIT09IHVuZGVmaW5lZCA/IG9wdHMubmV3RmlsZSA6IHRoaXMubmV3RmlsZSxcbiAgICAgIG9wdHMucGF0Y2ggIT09IHVuZGVmaW5lZCA/IG9wdHMucGF0Y2ggOiB0aGlzLnBhdGNoLFxuICAgICk7XG4gIH1cblxuICBnZXRTdGFydGluZ01hcmtlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0Y2guZ2V0U3RhcnRpbmdNYXJrZXJzKCk7XG4gIH1cblxuICBnZXRFbmRpbmdNYXJrZXJzKCkge1xuICAgIHJldHVybiB0aGlzLnBhdGNoLmdldEVuZGluZ01hcmtlcnMoKTtcbiAgfVxuXG4gIGJ1aWxkU3RhZ2VQYXRjaEZvckxpbmVzKG9yaWdpbmFsQnVmZmVyLCBuZXh0UGF0Y2hCdWZmZXIsIHNlbGVjdGVkTGluZVNldCkge1xuICAgIGxldCBuZXdGaWxlID0gdGhpcy5nZXROZXdGaWxlKCk7XG4gICAgaWYgKHRoaXMuZ2V0U3RhdHVzKCkgPT09ICdkZWxldGVkJykge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnBhdGNoLmdldENoYW5nZWRMaW5lQ291bnQoKSA9PT0gc2VsZWN0ZWRMaW5lU2V0LnNpemUgJiZcbiAgICAgICAgQXJyYXkuZnJvbShzZWxlY3RlZExpbmVTZXQsIHJvdyA9PiB0aGlzLnBhdGNoLmNvbnRhaW5zUm93KHJvdykpLmV2ZXJ5KEJvb2xlYW4pXG4gICAgICApIHtcbiAgICAgICAgLy8gV2hvbGUgZmlsZSBkZWxldGlvbiBzdGFnZWQuXG4gICAgICAgIG5ld0ZpbGUgPSBudWxsRmlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFBhcnRpYWwgZmlsZSBkZWxldGlvbiwgd2hpY2ggYmVjb21lcyBhIG1vZGlmaWNhdGlvbi5cbiAgICAgICAgbmV3RmlsZSA9IHRoaXMuZ2V0T2xkRmlsZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBhdGNoID0gdGhpcy5wYXRjaC5idWlsZFN0YWdlUGF0Y2hGb3JMaW5lcyhcbiAgICAgIG9yaWdpbmFsQnVmZmVyLFxuICAgICAgbmV4dFBhdGNoQnVmZmVyLFxuICAgICAgc2VsZWN0ZWRMaW5lU2V0LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe25ld0ZpbGUsIHBhdGNofSk7XG4gIH1cblxuICBidWlsZFVuc3RhZ2VQYXRjaEZvckxpbmVzKG9yaWdpbmFsQnVmZmVyLCBuZXh0UGF0Y2hCdWZmZXIsIHNlbGVjdGVkTGluZVNldCkge1xuICAgIGNvbnN0IG5vbk51bGxGaWxlID0gdGhpcy5nZXROZXdGaWxlKCkuaXNQcmVzZW50KCkgPyB0aGlzLmdldE5ld0ZpbGUoKSA6IHRoaXMuZ2V0T2xkRmlsZSgpO1xuICAgIGxldCBvbGRGaWxlID0gdGhpcy5nZXROZXdGaWxlKCk7XG4gICAgbGV0IG5ld0ZpbGUgPSBub25OdWxsRmlsZTtcblxuICAgIGlmICh0aGlzLmdldFN0YXR1cygpID09PSAnYWRkZWQnKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHNlbGVjdGVkTGluZVNldC5zaXplID09PSB0aGlzLnBhdGNoLmdldENoYW5nZWRMaW5lQ291bnQoKSAmJlxuICAgICAgICBBcnJheS5mcm9tKHNlbGVjdGVkTGluZVNldCwgcm93ID0+IHRoaXMucGF0Y2guY29udGFpbnNSb3cocm93KSkuZXZlcnkoQm9vbGVhbilcbiAgICAgICkge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCBuZXdGaWxlIGlzIG51bGwgaWYgdGhlIHBhdGNoIGlzIGFuIGFkZGl0aW9uIGJlY2F1c2Ugd2UncmUgZGVsZXRpbmcgdGhlIGVudGlyZSBmaWxlIGZyb20gdGhlXG4gICAgICAgIC8vIGluZGV4LiBJZiBhIHN5bWxpbmsgd2FzIGRlbGV0ZWQgYW5kIHJlcGxhY2VkIGJ5IGEgbm9uLXN5bWxpbmsgZmlsZSwgd2UgZG9uJ3Qgd2FudCB0aGUgc3ltbGluayBlbnRyeSB0byBtdWNrXG4gICAgICAgIC8vIHVwIHRoZSBwYXRjaC5cbiAgICAgICAgb2xkRmlsZSA9IG5vbk51bGxGaWxlO1xuICAgICAgICBuZXdGaWxlID0gbnVsbEZpbGU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldFN0YXR1cygpID09PSAnZGVsZXRlZCcpIHtcbiAgICAgIGlmIChcbiAgICAgICAgc2VsZWN0ZWRMaW5lU2V0LnNpemUgPT09IHRoaXMucGF0Y2guZ2V0Q2hhbmdlZExpbmVDb3VudCgpICYmXG4gICAgICAgIEFycmF5LmZyb20oc2VsZWN0ZWRMaW5lU2V0LCByb3cgPT4gdGhpcy5wYXRjaC5jb250YWluc1Jvdyhyb3cpKS5ldmVyeShCb29sZWFuKVxuICAgICAgKSB7XG4gICAgICAgIG9sZEZpbGUgPSBudWxsRmlsZTtcbiAgICAgICAgbmV3RmlsZSA9IG5vbk51bGxGaWxlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBhdGNoID0gdGhpcy5wYXRjaC5idWlsZFVuc3RhZ2VQYXRjaEZvckxpbmVzKFxuICAgICAgb3JpZ2luYWxCdWZmZXIsXG4gICAgICBuZXh0UGF0Y2hCdWZmZXIsXG4gICAgICBzZWxlY3RlZExpbmVTZXQsXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7b2xkRmlsZSwgbmV3RmlsZSwgcGF0Y2h9KTtcbiAgfVxuXG4gIHRvU3RyaW5nSW4oYnVmZmVyKSB7XG4gICAgaWYgKCF0aGlzLmlzUHJlc2VudCgpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzVHlwZWNoYW5nZSgpKSB7XG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5jbG9uZSh7XG4gICAgICAgIG5ld0ZpbGU6IG51bGxGaWxlLFxuICAgICAgICBwYXRjaDogdGhpcy5nZXRPbGRTeW1saW5rKCkgPyB0aGlzLmdldFBhdGNoKCkuY2xvbmUoe3N0YXR1czogJ2RlbGV0ZWQnfSkgOiB0aGlzLmdldFBhdGNoKCksXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLmNsb25lKHtcbiAgICAgICAgb2xkRmlsZTogbnVsbEZpbGUsXG4gICAgICAgIHBhdGNoOiB0aGlzLmdldE5ld1N5bWxpbmsoKSA/IHRoaXMuZ2V0UGF0Y2goKS5jbG9uZSh7c3RhdHVzOiAnYWRkZWQnfSkgOiB0aGlzLmdldFBhdGNoKCksXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGxlZnQudG9TdHJpbmdJbihidWZmZXIpICsgcmlnaHQudG9TdHJpbmdJbihidWZmZXIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRTdGF0dXMoKSA9PT0gJ2FkZGVkJyAmJiB0aGlzLmdldE5ld0ZpbGUoKS5pc1N5bWxpbmsoKSkge1xuICAgICAgY29uc3Qgc3ltbGlua1BhdGggPSB0aGlzLmdldE5ld1N5bWxpbmsoKTtcbiAgICAgIHJldHVybiB0aGlzLmdldEhlYWRlclN0cmluZygpICsgYEBAIC0wLDAgKzEgQEBcXG4rJHtzeW1saW5rUGF0aH1cXG5cXFxcIE5vIG5ld2xpbmUgYXQgZW5kIG9mIGZpbGVcXG5gO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRTdGF0dXMoKSA9PT0gJ2RlbGV0ZWQnICYmIHRoaXMuZ2V0T2xkRmlsZSgpLmlzU3ltbGluaygpKSB7XG4gICAgICBjb25zdCBzeW1saW5rUGF0aCA9IHRoaXMuZ2V0T2xkU3ltbGluaygpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SGVhZGVyU3RyaW5nKCkgKyBgQEAgLTEgKzAsMCBAQFxcbi0ke3N5bWxpbmtQYXRofVxcblxcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZVxcbmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEhlYWRlclN0cmluZygpICsgdGhpcy5nZXRQYXRjaCgpLnRvU3RyaW5nSW4oYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBDb25zdHJ1Y3QgYSBTdHJpbmcgY29udGFpbmluZyBkaWFnbm9zdGljIGluZm9ybWF0aW9uIGFib3V0IHRoZSBpbnRlcm5hbCBzdGF0ZSBvZiB0aGlzIEZpbGVQYXRjaC5cbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGluc3BlY3Qob3B0cyA9IHt9KSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGluZGVudDogMCxcbiAgICAgIC4uLm9wdHMsXG4gICAgfTtcblxuICAgIGxldCBpbmRlbnRhdGlvbiA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5pbmRlbnQ7IGkrKykge1xuICAgICAgaW5kZW50YXRpb24gKz0gJyAnO1xuICAgIH1cblxuICAgIGxldCBpbnNwZWN0U3RyaW5nID0gYCR7aW5kZW50YXRpb259KEZpbGVQYXRjaCBgO1xuICAgIGlmICh0aGlzLmdldE9sZFBhdGgoKSAhPT0gdGhpcy5nZXROZXdQYXRoKCkpIHtcbiAgICAgIGluc3BlY3RTdHJpbmcgKz0gYG9sZFBhdGg9JHt0aGlzLmdldE9sZFBhdGgoKX0gbmV3UGF0aD0ke3RoaXMuZ2V0TmV3UGF0aCgpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluc3BlY3RTdHJpbmcgKz0gYHBhdGg9JHt0aGlzLmdldFBhdGgoKX1gO1xuICAgIH1cbiAgICBpbnNwZWN0U3RyaW5nICs9ICdcXG4nO1xuXG4gICAgaW5zcGVjdFN0cmluZyArPSB0aGlzLnBhdGNoLmluc3BlY3Qoe2luZGVudDogb3B0aW9ucy5pbmRlbnQgKyAyfSk7XG5cbiAgICBpbnNwZWN0U3RyaW5nICs9IGAke2luZGVudGF0aW9ufSlcXG5gO1xuICAgIHJldHVybiBpbnNwZWN0U3RyaW5nO1xuICB9XG5cbiAgZ2V0SGVhZGVyU3RyaW5nKCkge1xuICAgIGNvbnN0IGZyb21QYXRoID0gdGhpcy5nZXRPbGRQYXRoKCkgfHwgdGhpcy5nZXROZXdQYXRoKCk7XG4gICAgY29uc3QgdG9QYXRoID0gdGhpcy5nZXROZXdQYXRoKCkgfHwgdGhpcy5nZXRPbGRQYXRoKCk7XG4gICAgbGV0IGhlYWRlciA9IGBkaWZmIC0tZ2l0IGEvJHt0b0dpdFBhdGhTZXAoZnJvbVBhdGgpfSBiLyR7dG9HaXRQYXRoU2VwKHRvUGF0aCl9YDtcbiAgICBoZWFkZXIgKz0gJ1xcbic7XG4gICAgaWYgKHRoaXMuZ2V0U3RhdHVzKCkgPT09ICdhZGRlZCcpIHtcbiAgICAgIGhlYWRlciArPSBgbmV3IGZpbGUgbW9kZSAke3RoaXMuZ2V0TmV3TW9kZSgpfWA7XG4gICAgICBoZWFkZXIgKz0gJ1xcbic7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldFN0YXR1cygpID09PSAnZGVsZXRlZCcpIHtcbiAgICAgIGhlYWRlciArPSBgZGVsZXRlZCBmaWxlIG1vZGUgJHt0aGlzLmdldE9sZE1vZGUoKX1gO1xuICAgICAgaGVhZGVyICs9ICdcXG4nO1xuICAgIH1cbiAgICBoZWFkZXIgKz0gdGhpcy5nZXRPbGRQYXRoKCkgPyBgLS0tIGEvJHt0b0dpdFBhdGhTZXAodGhpcy5nZXRPbGRQYXRoKCkpfWAgOiAnLS0tIC9kZXYvbnVsbCc7XG4gICAgaGVhZGVyICs9ICdcXG4nO1xuICAgIGhlYWRlciArPSB0aGlzLmdldE5ld1BhdGgoKSA/IGArKysgYi8ke3RvR2l0UGF0aFNlcCh0aGlzLmdldE5ld1BhdGgoKSl9YCA6ICcrKysgL2Rldi9udWxsJztcbiAgICBoZWFkZXIgKz0gJ1xcbic7XG4gICAgcmV0dXJuIGhlYWRlcjtcbiAgfVxufVxuIl19