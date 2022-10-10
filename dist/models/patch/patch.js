"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.REMOVED = exports.DEFERRED = exports.COLLAPSED = exports.EXPANDED = void 0;

var _atom = require("atom");

var _hunk = _interopRequireDefault(require("./hunk"));

var _region = require("./region");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const EXPANDED = {
  /* istanbul ignore next */
  toString() {
    return 'RenderStatus(expanded)';
  },

  isVisible() {
    return true;
  },

  isExpandable() {
    return false;
  }

};
exports.EXPANDED = EXPANDED;
const COLLAPSED = {
  /* istanbul ignore next */
  toString() {
    return 'RenderStatus(collapsed)';
  },

  isVisible() {
    return false;
  },

  isExpandable() {
    return true;
  }

};
exports.COLLAPSED = COLLAPSED;
const DEFERRED = {
  /* istanbul ignore next */
  toString() {
    return 'RenderStatus(deferred)';
  },

  isVisible() {
    return false;
  },

  isExpandable() {
    return true;
  }

};
exports.DEFERRED = DEFERRED;
const REMOVED = {
  /* istanbul ignore next */
  toString() {
    return 'RenderStatus(removed)';
  },

  isVisible() {
    return false;
  },

  isExpandable() {
    return false;
  }

};
exports.REMOVED = REMOVED;

class Patch {
  static createNull() {
    return new NullPatch();
  }

  static createHiddenPatch(marker, renderStatus, showFn) {
    return new HiddenPatch(marker, renderStatus, showFn);
  }

  constructor({
    status,
    hunks,
    marker
  }) {
    this.status = status;
    this.hunks = hunks;
    this.marker = marker;
    this.changedLineCount = this.getHunks().reduce((acc, hunk) => acc + hunk.changedLineCount(), 0);
  }

  getStatus() {
    return this.status;
  }

  getMarker() {
    return this.marker;
  }

  getRange() {
    return this.getMarker().getRange();
  }

  getStartRange() {
    const startPoint = this.getMarker().getRange().start;
    return _atom.Range.fromObject([startPoint, startPoint]);
  }

  getHunks() {
    return this.hunks;
  }

  getChangedLineCount() {
    return this.changedLineCount;
  }

  containsRow(row) {
    return this.marker.getRange().intersectsRow(row);
  }

  destroyMarkers() {
    this.marker.destroy();

    for (const hunk of this.hunks) {
      hunk.destroyMarkers();
    }
  }

  updateMarkers(map) {
    this.marker = map.get(this.marker) || this.marker;

    for (const hunk of this.hunks) {
      hunk.updateMarkers(map);
    }
  }

  getMaxLineNumberWidth() {
    const lastHunk = this.hunks[this.hunks.length - 1];
    return lastHunk ? lastHunk.getMaxLineNumberWidth() : 0;
  }

  clone(opts = {}) {
    return new this.constructor({
      status: opts.status !== undefined ? opts.status : this.getStatus(),
      hunks: opts.hunks !== undefined ? opts.hunks : this.getHunks(),
      marker: opts.marker !== undefined ? opts.marker : this.getMarker()
    });
  }
  /* Return the set of Markers owned by this Patch that butt up against the patch's beginning. */


  getStartingMarkers() {
    const markers = [this.marker];

    if (this.hunks.length > 0) {
      const firstHunk = this.hunks[0];
      markers.push(firstHunk.getMarker());

      if (firstHunk.getRegions().length > 0) {
        const firstRegion = firstHunk.getRegions()[0];
        markers.push(firstRegion.getMarker());
      }
    }

    return markers;
  }
  /* Return the set of Markers owned by this Patch that end at the patch's end position. */


  getEndingMarkers() {
    const markers = [this.marker];

    if (this.hunks.length > 0) {
      const lastHunk = this.hunks[this.hunks.length - 1];
      markers.push(lastHunk.getMarker());

      if (lastHunk.getRegions().length > 0) {
        const lastRegion = lastHunk.getRegions()[lastHunk.getRegions().length - 1];
        markers.push(lastRegion.getMarker());
      }
    }

    return markers;
  }

  buildStagePatchForLines(originalBuffer, nextPatchBuffer, rowSet) {
    const originalBaseOffset = this.getMarker().getRange().start.row;
    const builder = new BufferBuilder(originalBuffer, originalBaseOffset, nextPatchBuffer);
    const hunks = [];
    let newRowDelta = 0;

    for (const hunk of this.getHunks()) {
      let atLeastOneSelectedChange = false;
      let selectedDeletionRowCount = 0;
      let noNewlineRowCount = 0;

      for (const region of hunk.getRegions()) {
        for (const {
          intersection,
          gap
        } of region.intersectRows(rowSet, true)) {
          region.when({
            addition: () => {
              if (gap) {
                // Unselected addition: omit from new buffer
                builder.remove(intersection);
              } else {
                // Selected addition: include in new patch
                atLeastOneSelectedChange = true;
                builder.append(intersection);
                builder.markRegion(intersection, _region.Addition);
              }
            },
            deletion: () => {
              if (gap) {
                // Unselected deletion: convert to context row
                builder.append(intersection);
                builder.markRegion(intersection, _region.Unchanged);
              } else {
                // Selected deletion: include in new patch
                atLeastOneSelectedChange = true;
                builder.append(intersection);
                builder.markRegion(intersection, _region.Deletion);
                selectedDeletionRowCount += intersection.getRowCount();
              }
            },
            unchanged: () => {
              // Untouched context line: include in new patch
              builder.append(intersection);
              builder.markRegion(intersection, _region.Unchanged);
            },
            nonewline: () => {
              builder.append(intersection);
              builder.markRegion(intersection, _region.NoNewline);
              noNewlineRowCount += intersection.getRowCount();
            }
          });
        }
      }

      if (atLeastOneSelectedChange) {
        // Hunk contains at least one selected line
        builder.markHunkRange(hunk.getRange());
        const {
          regions,
          marker
        } = builder.latestHunkWasIncluded();
        const newStartRow = hunk.getNewStartRow() + newRowDelta;
        const newRowCount = marker.getRange().getRowCount() - selectedDeletionRowCount - noNewlineRowCount;
        hunks.push(new _hunk.default({
          oldStartRow: hunk.getOldStartRow(),
          oldRowCount: hunk.getOldRowCount(),
          newStartRow,
          newRowCount,
          sectionHeading: hunk.getSectionHeading(),
          marker,
          regions
        }));
        newRowDelta += newRowCount - hunk.getNewRowCount();
      } else {
        newRowDelta += hunk.getOldRowCount() - hunk.getNewRowCount();
        builder.latestHunkWasDiscarded();
      }
    }

    const marker = nextPatchBuffer.markRange(this.constructor.layerName, [[0, 0], [nextPatchBuffer.getBuffer().getLastRow() - 1, Infinity]], {
      invalidate: 'never',
      exclusive: false
    });
    const wholeFile = rowSet.size === this.changedLineCount;
    const status = this.getStatus() === 'deleted' && !wholeFile ? 'modified' : this.getStatus();
    return this.clone({
      hunks,
      status,
      marker
    });
  }

  buildUnstagePatchForLines(originalBuffer, nextPatchBuffer, rowSet) {
    const originalBaseOffset = this.getMarker().getRange().start.row;
    const builder = new BufferBuilder(originalBuffer, originalBaseOffset, nextPatchBuffer);
    const hunks = [];
    let newRowDelta = 0;

    for (const hunk of this.getHunks()) {
      let atLeastOneSelectedChange = false;
      let contextRowCount = 0;
      let additionRowCount = 0;
      let deletionRowCount = 0;

      for (const region of hunk.getRegions()) {
        for (const {
          intersection,
          gap
        } of region.intersectRows(rowSet, true)) {
          region.when({
            addition: () => {
              if (gap) {
                // Unselected addition: become a context line.
                builder.append(intersection);
                builder.markRegion(intersection, _region.Unchanged);
                contextRowCount += intersection.getRowCount();
              } else {
                // Selected addition: become a deletion.
                atLeastOneSelectedChange = true;
                builder.append(intersection);
                builder.markRegion(intersection, _region.Deletion);
                deletionRowCount += intersection.getRowCount();
              }
            },
            deletion: () => {
              if (gap) {
                // Non-selected deletion: omit from new buffer.
                builder.remove(intersection);
              } else {
                // Selected deletion: becomes an addition
                atLeastOneSelectedChange = true;
                builder.append(intersection);
                builder.markRegion(intersection, _region.Addition);
                additionRowCount += intersection.getRowCount();
              }
            },
            unchanged: () => {
              // Untouched context line: include in new patch.
              builder.append(intersection);
              builder.markRegion(intersection, _region.Unchanged);
              contextRowCount += intersection.getRowCount();
            },
            nonewline: () => {
              // Nonewline marker: include in new patch.
              builder.append(intersection);
              builder.markRegion(intersection, _region.NoNewline);
            }
          });
        }
      }

      if (atLeastOneSelectedChange) {
        // Hunk contains at least one selected line
        builder.markHunkRange(hunk.getRange());
        const {
          marker,
          regions
        } = builder.latestHunkWasIncluded();
        hunks.push(new _hunk.default({
          oldStartRow: hunk.getNewStartRow(),
          oldRowCount: contextRowCount + deletionRowCount,
          newStartRow: hunk.getNewStartRow() + newRowDelta,
          newRowCount: contextRowCount + additionRowCount,
          sectionHeading: hunk.getSectionHeading(),
          marker,
          regions
        }));
      } else {
        builder.latestHunkWasDiscarded();
      } // (contextRowCount + additionRowCount) - (contextRowCount + deletionRowCount)


      newRowDelta += additionRowCount - deletionRowCount;
    }

    const wholeFile = rowSet.size === this.changedLineCount;
    let status = this.getStatus();

    if (this.getStatus() === 'added') {
      status = wholeFile ? 'deleted' : 'modified';
    } else if (this.getStatus() === 'deleted') {
      status = 'added';
    }

    const marker = nextPatchBuffer.markRange(this.constructor.layerName, [[0, 0], [nextPatchBuffer.getBuffer().getLastRow(), Infinity]], {
      invalidate: 'never',
      exclusive: false
    });
    return this.clone({
      hunks,
      status,
      marker
    });
  }

  getFirstChangeRange() {
    const firstHunk = this.getHunks()[0];

    if (!firstHunk) {
      return _atom.Range.fromObject([[0, 0], [0, 0]]);
    }

    const firstChange = firstHunk.getChanges()[0];

    if (!firstChange) {
      return _atom.Range.fromObject([[0, 0], [0, 0]]);
    }

    const firstRow = firstChange.getStartBufferRow();
    return _atom.Range.fromObject([[firstRow, 0], [firstRow, Infinity]]);
  }

  toStringIn(buffer) {
    return this.getHunks().reduce((str, hunk) => str + hunk.toStringIn(buffer), '');
  }
  /*
   * Construct a String containing internal diagnostic information.
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

    let inspectString = `${indentation}(Patch marker=${this.marker.id}`;

    if (this.marker.isDestroyed()) {
      inspectString += ' [destroyed]';
    }

    if (!this.marker.isValid()) {
      inspectString += ' [invalid]';
    }

    inspectString += '\n';

    for (const hunk of this.hunks) {
      inspectString += hunk.inspect({
        indent: options.indent + 2
      });
    }

    inspectString += `${indentation})\n`;
    return inspectString;
  }

  isPresent() {
    return true;
  }

  getRenderStatus() {
    return EXPANDED;
  }

}

exports.default = Patch;

_defineProperty(Patch, "layerName", 'patch');

class HiddenPatch extends Patch {
  constructor(marker, renderStatus, showFn) {
    super({
      status: null,
      hunks: [],
      marker
    });
    this.renderStatus = renderStatus;
    this.show = showFn;
  }

  getInsertionPoint() {
    return this.getRange().end;
  }

  getRenderStatus() {
    return this.renderStatus;
  }
  /*
   * Construct a String containing internal diagnostic information.
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

    return `${indentation}(HiddenPatch marker=${this.marker.id})\n`;
  }

}

class NullPatch {
  constructor() {
    const buffer = new _atom.TextBuffer();
    this.marker = buffer.markRange([[0, 0], [0, 0]]);
  }

  getStatus() {
    return null;
  }

  getMarker() {
    return this.marker;
  }

  getRange() {
    return this.getMarker().getRange();
  }

  getStartRange() {
    return _atom.Range.fromObject([[0, 0], [0, 0]]);
  }

  getHunks() {
    return [];
  }

  getChangedLineCount() {
    return 0;
  }

  containsRow() {
    return false;
  }

  getMaxLineNumberWidth() {
    return 0;
  }

  clone(opts = {}) {
    if (opts.status === undefined && opts.hunks === undefined && opts.marker === undefined && opts.renderStatus === undefined) {
      return this;
    } else {
      return new Patch({
        status: opts.status !== undefined ? opts.status : this.getStatus(),
        hunks: opts.hunks !== undefined ? opts.hunks : this.getHunks(),
        marker: opts.marker !== undefined ? opts.marker : this.getMarker(),
        renderStatus: opts.renderStatus !== undefined ? opts.renderStatus : this.getRenderStatus()
      });
    }
  }

  getStartingMarkers() {
    return [];
  }

  getEndingMarkers() {
    return [];
  }

  buildStagePatchForLines() {
    return this;
  }

  buildUnstagePatchForLines() {
    return this;
  }

  getFirstChangeRange() {
    return _atom.Range.fromObject([[0, 0], [0, 0]]);
  }

  updateMarkers() {}

  toStringIn() {
    return '';
  }
  /*
   * Construct a String containing internal diagnostic information.
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

    return `${indentation}(NullPatch)\n`;
  }

  isPresent() {
    return false;
  }

  getRenderStatus() {
    return EXPANDED;
  }

}

class BufferBuilder {
  constructor(original, originalBaseOffset, nextPatchBuffer) {
    this.originalBuffer = original;
    this.nextPatchBuffer = nextPatchBuffer; // The ranges provided to builder methods are expected to be valid within the original buffer. Account for
    // the position of the Patch within its original TextBuffer, and any existing content already on the next
    // TextBuffer.

    this.offset = this.nextPatchBuffer.getBuffer().getLastRow() - originalBaseOffset;
    this.hunkBufferText = '';
    this.hunkRowCount = 0;
    this.hunkStartOffset = this.offset;
    this.hunkRegions = [];
    this.hunkRange = null;
    this.lastOffset = 0;
  }

  append(range) {
    this.hunkBufferText += this.originalBuffer.getTextInRange(range) + '\n';
    this.hunkRowCount += range.getRowCount();
  }

  remove(range) {
    this.offset -= range.getRowCount();
  }

  markRegion(range, RegionKind) {
    const finalRange = this.offset !== 0 ? range.translate([this.offset, 0], [this.offset, 0]) : range; // Collapse consecutive ranges of the same RegionKind into one continuous region.

    const lastRegion = this.hunkRegions[this.hunkRegions.length - 1];

    if (lastRegion && lastRegion.RegionKind === RegionKind && finalRange.start.row - lastRegion.range.end.row === 1) {
      lastRegion.range.end = finalRange.end;
    } else {
      this.hunkRegions.push({
        RegionKind,
        range: finalRange
      });
    }
  }

  markHunkRange(range) {
    let finalRange = range;

    if (this.hunkStartOffset !== 0 || this.offset !== 0) {
      finalRange = finalRange.translate([this.hunkStartOffset, 0], [this.offset, 0]);
    }

    this.hunkRange = finalRange;
  }

  latestHunkWasIncluded() {
    this.nextPatchBuffer.buffer.append(this.hunkBufferText, {
      normalizeLineEndings: false
    });
    const regions = this.hunkRegions.map(({
      RegionKind,
      range
    }) => {
      const regionMarker = this.nextPatchBuffer.markRange(RegionKind.layerName, range, {
        invalidate: 'never',
        exclusive: false
      });
      return new RegionKind(regionMarker);
    });
    const marker = this.nextPatchBuffer.markRange('hunk', this.hunkRange, {
      invalidate: 'never',
      exclusive: false
    });
    this.hunkBufferText = '';
    this.hunkRowCount = 0;
    this.hunkStartOffset = this.offset;
    this.hunkRegions = [];
    this.hunkRange = null;
    return {
      regions,
      marker
    };
  }

  latestHunkWasDiscarded() {
    this.offset -= this.hunkRowCount;
    this.hunkBufferText = '';
    this.hunkRowCount = 0;
    this.hunkStartOffset = this.offset;
    this.hunkRegions = [];
    this.hunkRange = null;
    return {
      regions: [],
      marker: null
    };
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvcGF0Y2guanMiXSwibmFtZXMiOlsiRVhQQU5ERUQiLCJ0b1N0cmluZyIsImlzVmlzaWJsZSIsImlzRXhwYW5kYWJsZSIsIkNPTExBUFNFRCIsIkRFRkVSUkVEIiwiUkVNT1ZFRCIsIlBhdGNoIiwiY3JlYXRlTnVsbCIsIk51bGxQYXRjaCIsImNyZWF0ZUhpZGRlblBhdGNoIiwibWFya2VyIiwicmVuZGVyU3RhdHVzIiwic2hvd0ZuIiwiSGlkZGVuUGF0Y2giLCJjb25zdHJ1Y3RvciIsInN0YXR1cyIsImh1bmtzIiwiY2hhbmdlZExpbmVDb3VudCIsImdldEh1bmtzIiwicmVkdWNlIiwiYWNjIiwiaHVuayIsImdldFN0YXR1cyIsImdldE1hcmtlciIsImdldFJhbmdlIiwiZ2V0U3RhcnRSYW5nZSIsInN0YXJ0UG9pbnQiLCJzdGFydCIsIlJhbmdlIiwiZnJvbU9iamVjdCIsImdldENoYW5nZWRMaW5lQ291bnQiLCJjb250YWluc1JvdyIsInJvdyIsImludGVyc2VjdHNSb3ciLCJkZXN0cm95TWFya2VycyIsImRlc3Ryb3kiLCJ1cGRhdGVNYXJrZXJzIiwibWFwIiwiZ2V0IiwiZ2V0TWF4TGluZU51bWJlcldpZHRoIiwibGFzdEh1bmsiLCJsZW5ndGgiLCJjbG9uZSIsIm9wdHMiLCJ1bmRlZmluZWQiLCJnZXRTdGFydGluZ01hcmtlcnMiLCJtYXJrZXJzIiwiZmlyc3RIdW5rIiwicHVzaCIsImdldFJlZ2lvbnMiLCJmaXJzdFJlZ2lvbiIsImdldEVuZGluZ01hcmtlcnMiLCJsYXN0UmVnaW9uIiwiYnVpbGRTdGFnZVBhdGNoRm9yTGluZXMiLCJvcmlnaW5hbEJ1ZmZlciIsIm5leHRQYXRjaEJ1ZmZlciIsInJvd1NldCIsIm9yaWdpbmFsQmFzZU9mZnNldCIsImJ1aWxkZXIiLCJCdWZmZXJCdWlsZGVyIiwibmV3Um93RGVsdGEiLCJhdExlYXN0T25lU2VsZWN0ZWRDaGFuZ2UiLCJzZWxlY3RlZERlbGV0aW9uUm93Q291bnQiLCJub05ld2xpbmVSb3dDb3VudCIsInJlZ2lvbiIsImludGVyc2VjdGlvbiIsImdhcCIsImludGVyc2VjdFJvd3MiLCJ3aGVuIiwiYWRkaXRpb24iLCJyZW1vdmUiLCJhcHBlbmQiLCJtYXJrUmVnaW9uIiwiQWRkaXRpb24iLCJkZWxldGlvbiIsIlVuY2hhbmdlZCIsIkRlbGV0aW9uIiwiZ2V0Um93Q291bnQiLCJ1bmNoYW5nZWQiLCJub25ld2xpbmUiLCJOb05ld2xpbmUiLCJtYXJrSHVua1JhbmdlIiwicmVnaW9ucyIsImxhdGVzdEh1bmtXYXNJbmNsdWRlZCIsIm5ld1N0YXJ0Um93IiwiZ2V0TmV3U3RhcnRSb3ciLCJuZXdSb3dDb3VudCIsIkh1bmsiLCJvbGRTdGFydFJvdyIsImdldE9sZFN0YXJ0Um93Iiwib2xkUm93Q291bnQiLCJnZXRPbGRSb3dDb3VudCIsInNlY3Rpb25IZWFkaW5nIiwiZ2V0U2VjdGlvbkhlYWRpbmciLCJnZXROZXdSb3dDb3VudCIsImxhdGVzdEh1bmtXYXNEaXNjYXJkZWQiLCJtYXJrUmFuZ2UiLCJsYXllck5hbWUiLCJnZXRCdWZmZXIiLCJnZXRMYXN0Um93IiwiSW5maW5pdHkiLCJpbnZhbGlkYXRlIiwiZXhjbHVzaXZlIiwid2hvbGVGaWxlIiwic2l6ZSIsImJ1aWxkVW5zdGFnZVBhdGNoRm9yTGluZXMiLCJjb250ZXh0Um93Q291bnQiLCJhZGRpdGlvblJvd0NvdW50IiwiZGVsZXRpb25Sb3dDb3VudCIsImdldEZpcnN0Q2hhbmdlUmFuZ2UiLCJmaXJzdENoYW5nZSIsImdldENoYW5nZXMiLCJmaXJzdFJvdyIsImdldFN0YXJ0QnVmZmVyUm93IiwidG9TdHJpbmdJbiIsImJ1ZmZlciIsInN0ciIsImluc3BlY3QiLCJvcHRpb25zIiwiaW5kZW50IiwiaW5kZW50YXRpb24iLCJpIiwiaW5zcGVjdFN0cmluZyIsImlkIiwiaXNEZXN0cm95ZWQiLCJpc1ZhbGlkIiwiaXNQcmVzZW50IiwiZ2V0UmVuZGVyU3RhdHVzIiwic2hvdyIsImdldEluc2VydGlvblBvaW50IiwiZW5kIiwiVGV4dEJ1ZmZlciIsIm9yaWdpbmFsIiwib2Zmc2V0IiwiaHVua0J1ZmZlclRleHQiLCJodW5rUm93Q291bnQiLCJodW5rU3RhcnRPZmZzZXQiLCJodW5rUmVnaW9ucyIsImh1bmtSYW5nZSIsImxhc3RPZmZzZXQiLCJyYW5nZSIsImdldFRleHRJblJhbmdlIiwiUmVnaW9uS2luZCIsImZpbmFsUmFuZ2UiLCJ0cmFuc2xhdGUiLCJub3JtYWxpemVMaW5lRW5kaW5ncyIsInJlZ2lvbk1hcmtlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOztBQUNBOzs7Ozs7OztBQUVPLE1BQU1BLFFBQVEsR0FBRztBQUN0QjtBQUNBQyxFQUFBQSxRQUFRLEdBQUc7QUFBRSxXQUFPLHdCQUFQO0FBQWtDLEdBRnpCOztBQUl0QkMsRUFBQUEsU0FBUyxHQUFHO0FBQUUsV0FBTyxJQUFQO0FBQWMsR0FKTjs7QUFNdEJDLEVBQUFBLFlBQVksR0FBRztBQUFFLFdBQU8sS0FBUDtBQUFlOztBQU5WLENBQWpCOztBQVNBLE1BQU1DLFNBQVMsR0FBRztBQUN2QjtBQUNBSCxFQUFBQSxRQUFRLEdBQUc7QUFBRSxXQUFPLHlCQUFQO0FBQW1DLEdBRnpCOztBQUl2QkMsRUFBQUEsU0FBUyxHQUFHO0FBQUUsV0FBTyxLQUFQO0FBQWUsR0FKTjs7QUFNdkJDLEVBQUFBLFlBQVksR0FBRztBQUFFLFdBQU8sSUFBUDtBQUFjOztBQU5SLENBQWxCOztBQVNBLE1BQU1FLFFBQVEsR0FBRztBQUN0QjtBQUNBSixFQUFBQSxRQUFRLEdBQUc7QUFBRSxXQUFPLHdCQUFQO0FBQWtDLEdBRnpCOztBQUl0QkMsRUFBQUEsU0FBUyxHQUFHO0FBQUUsV0FBTyxLQUFQO0FBQWUsR0FKUDs7QUFNdEJDLEVBQUFBLFlBQVksR0FBRztBQUFFLFdBQU8sSUFBUDtBQUFjOztBQU5ULENBQWpCOztBQVNBLE1BQU1HLE9BQU8sR0FBRztBQUNyQjtBQUNBTCxFQUFBQSxRQUFRLEdBQUc7QUFBRSxXQUFPLHVCQUFQO0FBQWlDLEdB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QSxTQUFTLEVBQUU7QUFBakMsT0FIbUIsQ0FBckI7QUFLQSxhQUFPLElBQUl3QyxVQUFKLENBQWVJLFlBQWYsQ0FBUDtBQUNELEtBUGUsQ0FBaEI7QUFTQSxVQUFNeEksTUFBTSxHQUFHLEtBQUs2QyxlQUFMLENBQXFCeUMsU0FBckIsQ0FBK0IsTUFBL0IsRUFBdUMsS0FBSzBDLFNBQTVDLEVBQXVEO0FBQUNyQyxNQUFBQSxVQUFVLEVBQUUsT0FBYjtBQUFzQkMsTUFBQUEsU0FBUyxFQUFFO0FBQWpDLEtBQXZELENBQWY7QUFFQSxTQUFLZ0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsQ0FBcEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCLEtBQUtILE1BQTVCO0FBQ0EsU0FBS0ksV0FBTCxHQUFtQixFQUFuQjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsSUFBakI7QUFFQSxXQUFPO0FBQUN4RCxNQUFBQSxPQUFEO0FBQVV4RSxNQUFBQTtBQUFWLEtBQVA7QUFDRDs7QUFFRHFGLEVBQUFBLHNCQUFzQixHQUFHO0FBQ3ZCLFNBQUtzQyxNQUFMLElBQWUsS0FBS0UsWUFBcEI7QUFFQSxTQUFLRCxjQUFMLEdBQXNCLEVBQXRCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixDQUFwQjtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsS0FBS0gsTUFBNUI7QUFDQSxTQUFLSSxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixJQUFqQjtBQUVBLFdBQU87QUFBQ3hELE1BQUFBLE9BQU8sRUFBRSxFQUFWO0FBQWN4RSxNQUFBQSxNQUFNLEVBQUU7QUFBdEIsS0FBUDtBQUNEOztBQW5GaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RleHRCdWZmZXIsIFJhbmdlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IEh1bmsgZnJvbSAnLi9odW5rJztcbmltcG9ydCB7VW5jaGFuZ2VkLCBBZGRpdGlvbiwgRGVsZXRpb24sIE5vTmV3bGluZX0gZnJvbSAnLi9yZWdpb24nO1xuXG5leHBvcnQgY29uc3QgRVhQQU5ERUQgPSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRvU3RyaW5nKCkgeyByZXR1cm4gJ1JlbmRlclN0YXR1cyhleHBhbmRlZCknOyB9LFxuXG4gIGlzVmlzaWJsZSgpIHsgcmV0dXJuIHRydWU7IH0sXG5cbiAgaXNFeHBhbmRhYmxlKCkgeyByZXR1cm4gZmFsc2U7IH0sXG59O1xuXG5leHBvcnQgY29uc3QgQ09MTEFQU0VEID0ge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0b1N0cmluZygpIHsgcmV0dXJuICdSZW5kZXJTdGF0dXMoY29sbGFwc2VkKSc7IH0sXG5cbiAgaXNWaXNpYmxlKCkgeyByZXR1cm4gZmFsc2U7IH0sXG5cbiAgaXNFeHBhbmRhYmxlKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZFUlJFRCA9IHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdG9TdHJpbmcoKSB7IHJldHVybiAnUmVuZGVyU3RhdHVzKGRlZmVycmVkKSc7IH0sXG5cbiAgaXNWaXNpYmxlKCkgeyByZXR1cm4gZmFsc2U7IH0sXG5cbiAgaXNFeHBhbmRhYmxlKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBSRU1PVkVEID0ge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0b1N0cmluZygpIHsgcmV0dXJuICdSZW5kZXJTdGF0dXMocmVtb3ZlZCknOyB9LFxuXG4gIGlzVmlzaWJsZSgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuXG4gIGlzRXhwYW5kYWJsZSgpIHsgcmV0dXJuIGZhbHNlOyB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0Y2gge1xuICBzdGF0aWMgbGF5ZXJOYW1lID0gJ3BhdGNoJztcblxuICBzdGF0aWMgY3JlYXRlTnVsbCgpIHtcbiAgICByZXR1cm4gbmV3IE51bGxQYXRjaCgpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUhpZGRlblBhdGNoKG1hcmtlciwgcmVuZGVyU3RhdHVzLCBzaG93Rm4pIHtcbiAgICByZXR1cm4gbmV3IEhpZGRlblBhdGNoKG1hcmtlciwgcmVuZGVyU3RhdHVzLCBzaG93Rm4pO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioe3N0YXR1cywgaHVua3MsIG1hcmtlcn0pIHtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLmh1bmtzID0gaHVua3M7XG4gICAgdGhpcy5tYXJrZXIgPSBtYXJrZXI7XG5cbiAgICB0aGlzLmNoYW5nZWRMaW5lQ291bnQgPSB0aGlzLmdldEh1bmtzKCkucmVkdWNlKChhY2MsIGh1bmspID0+IGFjYyArIGh1bmsuY2hhbmdlZExpbmVDb3VudCgpLCAwKTtcbiAgfVxuXG4gIGdldFN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0dXM7XG4gIH1cblxuICBnZXRNYXJrZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFya2VyO1xuICB9XG5cbiAgZ2V0UmFuZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2VyKCkuZ2V0UmFuZ2UoKTtcbiAgfVxuXG4gIGdldFN0YXJ0UmFuZ2UoKSB7XG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuZ2V0TWFya2VyKCkuZ2V0UmFuZ2UoKS5zdGFydDtcbiAgICByZXR1cm4gUmFuZ2UuZnJvbU9iamVjdChbc3RhcnRQb2ludCwgc3RhcnRQb2ludF0pO1xuICB9XG5cbiAgZ2V0SHVua3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHVua3M7XG4gIH1cblxuICBnZXRDaGFuZ2VkTGluZUNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZWRMaW5lQ291bnQ7XG4gIH1cblxuICBjb250YWluc1Jvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy5tYXJrZXIuZ2V0UmFuZ2UoKS5pbnRlcnNlY3RzUm93KHJvdyk7XG4gIH1cblxuICBkZXN0cm95TWFya2VycygpIHtcbiAgICB0aGlzLm1hcmtlci5kZXN0cm95KCk7XG4gICAgZm9yIChjb25zdCBodW5rIG9mIHRoaXMuaHVua3MpIHtcbiAgICAgIGh1bmsuZGVzdHJveU1hcmtlcnMoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVNYXJrZXJzKG1hcCkge1xuICAgIHRoaXMubWFya2VyID0gbWFwLmdldCh0aGlzLm1hcmtlcikgfHwgdGhpcy5tYXJrZXI7XG4gICAgZm9yIChjb25zdCBodW5rIG9mIHRoaXMuaHVua3MpIHtcbiAgICAgIGh1bmsudXBkYXRlTWFya2VycyhtYXApO1xuICAgIH1cbiAgfVxuXG4gIGdldE1heExpbmVOdW1iZXJXaWR0aCgpIHtcbiAgICBjb25zdCBsYXN0SHVuayA9IHRoaXMuaHVua3NbdGhpcy5odW5rcy5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gbGFzdEh1bmsgPyBsYXN0SHVuay5nZXRNYXhMaW5lTnVtYmVyV2lkdGgoKSA6IDA7XG4gIH1cblxuICBjbG9uZShvcHRzID0ge30pIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3Ioe1xuICAgICAgc3RhdHVzOiBvcHRzLnN0YXR1cyAhPT0gdW5kZWZpbmVkID8gb3B0cy5zdGF0dXMgOiB0aGlzLmdldFN0YXR1cygpLFxuICAgICAgaHVua3M6IG9wdHMuaHVua3MgIT09IHVuZGVmaW5lZCA/IG9wdHMuaHVua3MgOiB0aGlzLmdldEh1bmtzKCksXG4gICAgICBtYXJrZXI6IG9wdHMubWFya2VyICE9PSB1bmRlZmluZWQgPyBvcHRzLm1hcmtlciA6IHRoaXMuZ2V0TWFya2VyKCksXG4gICAgfSk7XG4gIH1cblxuICAvKiBSZXR1cm4gdGhlIHNldCBvZiBNYXJrZXJzIG93bmVkIGJ5IHRoaXMgUGF0Y2ggdGhhdCBidXR0IHVwIGFnYWluc3QgdGhlIHBhdGNoJ3MgYmVnaW5uaW5nLiAqL1xuICBnZXRTdGFydGluZ01hcmtlcnMoKSB7XG4gICAgY29uc3QgbWFya2VycyA9IFt0aGlzLm1hcmtlcl07XG4gICAgaWYgKHRoaXMuaHVua3MubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmlyc3RIdW5rID0gdGhpcy5odW5rc1swXTtcbiAgICAgIG1hcmtlcnMucHVzaChmaXJzdEh1bmsuZ2V0TWFya2VyKCkpO1xuICAgICAgaWYgKGZpcnN0SHVuay5nZXRSZWdpb25zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdFJlZ2lvbiA9IGZpcnN0SHVuay5nZXRSZWdpb25zKClbMF07XG4gICAgICAgIG1hcmtlcnMucHVzaChmaXJzdFJlZ2lvbi5nZXRNYXJrZXIoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXJrZXJzO1xuICB9XG5cbiAgLyogUmV0dXJuIHRoZSBzZXQgb2YgTWFya2VycyBvd25lZCBieSB0aGlzIFBhdGNoIHRoYXQgZW5kIGF0IHRoZSBwYXRjaCdzIGVuZCBwb3NpdGlvbi4gKi9cbiAgZ2V0RW5kaW5nTWFya2VycygpIHtcbiAgICBjb25zdCBtYXJrZXJzID0gW3RoaXMubWFya2VyXTtcbiAgICBpZiAodGhpcy5odW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBsYXN0SHVuayA9IHRoaXMuaHVua3NbdGhpcy5odW5rcy5sZW5ndGggLSAxXTtcbiAgICAgIG1hcmtlcnMucHVzaChsYXN0SHVuay5nZXRNYXJrZXIoKSk7XG4gICAgICBpZiAobGFzdEh1bmsuZ2V0UmVnaW9ucygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdFJlZ2lvbiA9IGxhc3RIdW5rLmdldFJlZ2lvbnMoKVtsYXN0SHVuay5nZXRSZWdpb25zKCkubGVuZ3RoIC0gMV07XG4gICAgICAgIG1hcmtlcnMucHVzaChsYXN0UmVnaW9uLmdldE1hcmtlcigpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcmtlcnM7XG4gIH1cblxuICBidWlsZFN0YWdlUGF0Y2hGb3JMaW5lcyhvcmlnaW5hbEJ1ZmZlciwgbmV4dFBhdGNoQnVmZmVyLCByb3dTZXQpIHtcbiAgICBjb25zdCBvcmlnaW5hbEJhc2VPZmZzZXQgPSB0aGlzLmdldE1hcmtlcigpLmdldFJhbmdlKCkuc3RhcnQucm93O1xuICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgQnVmZmVyQnVpbGRlcihvcmlnaW5hbEJ1ZmZlciwgb3JpZ2luYWxCYXNlT2Zmc2V0LCBuZXh0UGF0Y2hCdWZmZXIpO1xuICAgIGNvbnN0IGh1bmtzID0gW107XG5cbiAgICBsZXQgbmV3Um93RGVsdGEgPSAwO1xuXG4gICAgZm9yIChjb25zdCBodW5rIG9mIHRoaXMuZ2V0SHVua3MoKSkge1xuICAgICAgbGV0IGF0TGVhc3RPbmVTZWxlY3RlZENoYW5nZSA9IGZhbHNlO1xuICAgICAgbGV0IHNlbGVjdGVkRGVsZXRpb25Sb3dDb3VudCA9IDA7XG4gICAgICBsZXQgbm9OZXdsaW5lUm93Q291bnQgPSAwO1xuXG4gICAgICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiBodW5rLmdldFJlZ2lvbnMoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHtpbnRlcnNlY3Rpb24sIGdhcH0gb2YgcmVnaW9uLmludGVyc2VjdFJvd3Mocm93U2V0LCB0cnVlKSkge1xuICAgICAgICAgIHJlZ2lvbi53aGVuKHtcbiAgICAgICAgICAgIGFkZGl0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChnYXApIHtcbiAgICAgICAgICAgICAgICAvLyBVbnNlbGVjdGVkIGFkZGl0aW9uOiBvbWl0IGZyb20gbmV3IGJ1ZmZlclxuICAgICAgICAgICAgICAgIGJ1aWxkZXIucmVtb3ZlKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0ZWQgYWRkaXRpb246IGluY2x1ZGUgaW4gbmV3IHBhdGNoXG4gICAgICAgICAgICAgICAgYXRMZWFzdE9uZVNlbGVjdGVkQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBidWlsZGVyLmFwcGVuZChpbnRlcnNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGJ1aWxkZXIubWFya1JlZ2lvbihpbnRlcnNlY3Rpb24sIEFkZGl0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChnYXApIHtcbiAgICAgICAgICAgICAgICAvLyBVbnNlbGVjdGVkIGRlbGV0aW9uOiBjb252ZXJ0IHRvIGNvbnRleHQgcm93XG4gICAgICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBidWlsZGVyLm1hcmtSZWdpb24oaW50ZXJzZWN0aW9uLCBVbmNoYW5nZWQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNlbGVjdGVkIGRlbGV0aW9uOiBpbmNsdWRlIGluIG5ldyBwYXRjaFxuICAgICAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3RlZENoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBidWlsZGVyLm1hcmtSZWdpb24oaW50ZXJzZWN0aW9uLCBEZWxldGlvbik7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREZWxldGlvblJvd0NvdW50ICs9IGludGVyc2VjdGlvbi5nZXRSb3dDb3VudCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5jaGFuZ2VkOiAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFVudG91Y2hlZCBjb250ZXh0IGxpbmU6IGluY2x1ZGUgaW4gbmV3IHBhdGNoXG4gICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIGJ1aWxkZXIubWFya1JlZ2lvbihpbnRlcnNlY3Rpb24sIFVuY2hhbmdlZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbm9uZXdsaW5lOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIGJ1aWxkZXIubWFya1JlZ2lvbihpbnRlcnNlY3Rpb24sIE5vTmV3bGluZSk7XG4gICAgICAgICAgICAgIG5vTmV3bGluZVJvd0NvdW50ICs9IGludGVyc2VjdGlvbi5nZXRSb3dDb3VudCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYXRMZWFzdE9uZVNlbGVjdGVkQ2hhbmdlKSB7XG4gICAgICAgIC8vIEh1bmsgY29udGFpbnMgYXQgbGVhc3Qgb25lIHNlbGVjdGVkIGxpbmVcblxuICAgICAgICBidWlsZGVyLm1hcmtIdW5rUmFuZ2UoaHVuay5nZXRSYW5nZSgpKTtcbiAgICAgICAgY29uc3Qge3JlZ2lvbnMsIG1hcmtlcn0gPSBidWlsZGVyLmxhdGVzdEh1bmtXYXNJbmNsdWRlZCgpO1xuICAgICAgICBjb25zdCBuZXdTdGFydFJvdyA9IGh1bmsuZ2V0TmV3U3RhcnRSb3coKSArIG5ld1Jvd0RlbHRhO1xuICAgICAgICBjb25zdCBuZXdSb3dDb3VudCA9IG1hcmtlci5nZXRSYW5nZSgpLmdldFJvd0NvdW50KCkgLSBzZWxlY3RlZERlbGV0aW9uUm93Q291bnQgLSBub05ld2xpbmVSb3dDb3VudDtcblxuICAgICAgICBodW5rcy5wdXNoKG5ldyBIdW5rKHtcbiAgICAgICAgICBvbGRTdGFydFJvdzogaHVuay5nZXRPbGRTdGFydFJvdygpLFxuICAgICAgICAgIG9sZFJvd0NvdW50OiBodW5rLmdldE9sZFJvd0NvdW50KCksXG4gICAgICAgICAgbmV3U3RhcnRSb3csXG4gICAgICAgICAgbmV3Um93Q291bnQsXG4gICAgICAgICAgc2VjdGlvbkhlYWRpbmc6IGh1bmsuZ2V0U2VjdGlvbkhlYWRpbmcoKSxcbiAgICAgICAgICBtYXJrZXIsXG4gICAgICAgICAgcmVnaW9ucyxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIG5ld1Jvd0RlbHRhICs9IG5ld1Jvd0NvdW50IC0gaHVuay5nZXROZXdSb3dDb3VudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Um93RGVsdGEgKz0gaHVuay5nZXRPbGRSb3dDb3VudCgpIC0gaHVuay5nZXROZXdSb3dDb3VudCgpO1xuXG4gICAgICAgIGJ1aWxkZXIubGF0ZXN0SHVua1dhc0Rpc2NhcmRlZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1hcmtlciA9IG5leHRQYXRjaEJ1ZmZlci5tYXJrUmFuZ2UoXG4gICAgICB0aGlzLmNvbnN0cnVjdG9yLmxheWVyTmFtZSxcbiAgICAgIFtbMCwgMF0sIFtuZXh0UGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuZ2V0TGFzdFJvdygpIC0gMSwgSW5maW5pdHldXSxcbiAgICAgIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBleGNsdXNpdmU6IGZhbHNlfSxcbiAgICApO1xuXG4gICAgY29uc3Qgd2hvbGVGaWxlID0gcm93U2V0LnNpemUgPT09IHRoaXMuY2hhbmdlZExpbmVDb3VudDtcbiAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdldFN0YXR1cygpID09PSAnZGVsZXRlZCcgJiYgIXdob2xlRmlsZSA/ICdtb2RpZmllZCcgOiB0aGlzLmdldFN0YXR1cygpO1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtodW5rcywgc3RhdHVzLCBtYXJrZXJ9KTtcbiAgfVxuXG4gIGJ1aWxkVW5zdGFnZVBhdGNoRm9yTGluZXMob3JpZ2luYWxCdWZmZXIsIG5leHRQYXRjaEJ1ZmZlciwgcm93U2V0KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxCYXNlT2Zmc2V0ID0gdGhpcy5nZXRNYXJrZXIoKS5nZXRSYW5nZSgpLnN0YXJ0LnJvdztcbiAgICBjb25zdCBidWlsZGVyID0gbmV3IEJ1ZmZlckJ1aWxkZXIob3JpZ2luYWxCdWZmZXIsIG9yaWdpbmFsQmFzZU9mZnNldCwgbmV4dFBhdGNoQnVmZmVyKTtcbiAgICBjb25zdCBodW5rcyA9IFtdO1xuICAgIGxldCBuZXdSb3dEZWx0YSA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IGh1bmsgb2YgdGhpcy5nZXRIdW5rcygpKSB7XG4gICAgICBsZXQgYXRMZWFzdE9uZVNlbGVjdGVkQ2hhbmdlID0gZmFsc2U7XG4gICAgICBsZXQgY29udGV4dFJvd0NvdW50ID0gMDtcbiAgICAgIGxldCBhZGRpdGlvblJvd0NvdW50ID0gMDtcbiAgICAgIGxldCBkZWxldGlvblJvd0NvdW50ID0gMDtcblxuICAgICAgZm9yIChjb25zdCByZWdpb24gb2YgaHVuay5nZXRSZWdpb25zKCkpIHtcbiAgICAgICAgZm9yIChjb25zdCB7aW50ZXJzZWN0aW9uLCBnYXB9IG9mIHJlZ2lvbi5pbnRlcnNlY3RSb3dzKHJvd1NldCwgdHJ1ZSkpIHtcbiAgICAgICAgICByZWdpb24ud2hlbih7XG4gICAgICAgICAgICBhZGRpdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZ2FwKSB7XG4gICAgICAgICAgICAgICAgLy8gVW5zZWxlY3RlZCBhZGRpdGlvbjogYmVjb21lIGEgY29udGV4dCBsaW5lLlxuICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgYnVpbGRlci5tYXJrUmVnaW9uKGludGVyc2VjdGlvbiwgVW5jaGFuZ2VkKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0Um93Q291bnQgKz0gaW50ZXJzZWN0aW9uLmdldFJvd0NvdW50KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0ZWQgYWRkaXRpb246IGJlY29tZSBhIGRlbGV0aW9uLlxuICAgICAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3RlZENoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBidWlsZGVyLm1hcmtSZWdpb24oaW50ZXJzZWN0aW9uLCBEZWxldGlvbik7XG4gICAgICAgICAgICAgICAgZGVsZXRpb25Sb3dDb3VudCArPSBpbnRlcnNlY3Rpb24uZ2V0Um93Q291bnQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChnYXApIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tc2VsZWN0ZWQgZGVsZXRpb246IG9taXQgZnJvbSBuZXcgYnVmZmVyLlxuICAgICAgICAgICAgICAgIGJ1aWxkZXIucmVtb3ZlKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0ZWQgZGVsZXRpb246IGJlY29tZXMgYW4gYWRkaXRpb25cbiAgICAgICAgICAgICAgICBhdExlYXN0T25lU2VsZWN0ZWRDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgYnVpbGRlci5tYXJrUmVnaW9uKGludGVyc2VjdGlvbiwgQWRkaXRpb24pO1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uUm93Q291bnQgKz0gaW50ZXJzZWN0aW9uLmdldFJvd0NvdW50KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bmNoYW5nZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gVW50b3VjaGVkIGNvbnRleHQgbGluZTogaW5jbHVkZSBpbiBuZXcgcGF0Y2guXG4gICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIGJ1aWxkZXIubWFya1JlZ2lvbihpbnRlcnNlY3Rpb24sIFVuY2hhbmdlZCk7XG4gICAgICAgICAgICAgIGNvbnRleHRSb3dDb3VudCArPSBpbnRlcnNlY3Rpb24uZ2V0Um93Q291bnQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBub25ld2xpbmU6ICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gTm9uZXdsaW5lIG1hcmtlcjogaW5jbHVkZSBpbiBuZXcgcGF0Y2guXG4gICAgICAgICAgICAgIGJ1aWxkZXIuYXBwZW5kKGludGVyc2VjdGlvbik7XG4gICAgICAgICAgICAgIGJ1aWxkZXIubWFya1JlZ2lvbihpbnRlcnNlY3Rpb24sIE5vTmV3bGluZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhdExlYXN0T25lU2VsZWN0ZWRDaGFuZ2UpIHtcbiAgICAgICAgLy8gSHVuayBjb250YWlucyBhdCBsZWFzdCBvbmUgc2VsZWN0ZWQgbGluZVxuXG4gICAgICAgIGJ1aWxkZXIubWFya0h1bmtSYW5nZShodW5rLmdldFJhbmdlKCkpO1xuICAgICAgICBjb25zdCB7bWFya2VyLCByZWdpb25zfSA9IGJ1aWxkZXIubGF0ZXN0SHVua1dhc0luY2x1ZGVkKCk7XG4gICAgICAgIGh1bmtzLnB1c2gobmV3IEh1bmsoe1xuICAgICAgICAgIG9sZFN0YXJ0Um93OiBodW5rLmdldE5ld1N0YXJ0Um93KCksXG4gICAgICAgICAgb2xkUm93Q291bnQ6IGNvbnRleHRSb3dDb3VudCArIGRlbGV0aW9uUm93Q291bnQsXG4gICAgICAgICAgbmV3U3RhcnRSb3c6IGh1bmsuZ2V0TmV3U3RhcnRSb3coKSArIG5ld1Jvd0RlbHRhLFxuICAgICAgICAgIG5ld1Jvd0NvdW50OiBjb250ZXh0Um93Q291bnQgKyBhZGRpdGlvblJvd0NvdW50LFxuICAgICAgICAgIHNlY3Rpb25IZWFkaW5nOiBodW5rLmdldFNlY3Rpb25IZWFkaW5nKCksXG4gICAgICAgICAgbWFya2VyLFxuICAgICAgICAgIHJlZ2lvbnMsXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1aWxkZXIubGF0ZXN0SHVua1dhc0Rpc2NhcmRlZCgpO1xuICAgICAgfVxuXG4gICAgICAvLyAoY29udGV4dFJvd0NvdW50ICsgYWRkaXRpb25Sb3dDb3VudCkgLSAoY29udGV4dFJvd0NvdW50ICsgZGVsZXRpb25Sb3dDb3VudClcbiAgICAgIG5ld1Jvd0RlbHRhICs9IGFkZGl0aW9uUm93Q291bnQgLSBkZWxldGlvblJvd0NvdW50O1xuICAgIH1cblxuICAgIGNvbnN0IHdob2xlRmlsZSA9IHJvd1NldC5zaXplID09PSB0aGlzLmNoYW5nZWRMaW5lQ291bnQ7XG4gICAgbGV0IHN0YXR1cyA9IHRoaXMuZ2V0U3RhdHVzKCk7XG4gICAgaWYgKHRoaXMuZ2V0U3RhdHVzKCkgPT09ICdhZGRlZCcpIHtcbiAgICAgIHN0YXR1cyA9IHdob2xlRmlsZSA/ICdkZWxldGVkJyA6ICdtb2RpZmllZCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldFN0YXR1cygpID09PSAnZGVsZXRlZCcpIHtcbiAgICAgIHN0YXR1cyA9ICdhZGRlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgbWFya2VyID0gbmV4dFBhdGNoQnVmZmVyLm1hcmtSYW5nZShcbiAgICAgIHRoaXMuY29uc3RydWN0b3IubGF5ZXJOYW1lLFxuICAgICAgW1swLCAwXSwgW25leHRQYXRjaEJ1ZmZlci5nZXRCdWZmZXIoKS5nZXRMYXN0Um93KCksIEluZmluaXR5XV0sXG4gICAgICB7aW52YWxpZGF0ZTogJ25ldmVyJywgZXhjbHVzaXZlOiBmYWxzZX0sXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLmNsb25lKHtodW5rcywgc3RhdHVzLCBtYXJrZXJ9KTtcbiAgfVxuXG4gIGdldEZpcnN0Q2hhbmdlUmFuZ2UoKSB7XG4gICAgY29uc3QgZmlyc3RIdW5rID0gdGhpcy5nZXRIdW5rcygpWzBdO1xuICAgIGlmICghZmlyc3RIdW5rKSB7XG4gICAgICByZXR1cm4gUmFuZ2UuZnJvbU9iamVjdChbWzAsIDBdLCBbMCwgMF1dKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdENoYW5nZSA9IGZpcnN0SHVuay5nZXRDaGFuZ2VzKClbMF07XG4gICAgaWYgKCFmaXJzdENoYW5nZSkge1xuICAgICAgcmV0dXJuIFJhbmdlLmZyb21PYmplY3QoW1swLCAwXSwgWzAsIDBdXSk7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RSb3cgPSBmaXJzdENoYW5nZS5nZXRTdGFydEJ1ZmZlclJvdygpO1xuICAgIHJldHVybiBSYW5nZS5mcm9tT2JqZWN0KFtbZmlyc3RSb3csIDBdLCBbZmlyc3RSb3csIEluZmluaXR5XV0pO1xuICB9XG5cbiAgdG9TdHJpbmdJbihidWZmZXIpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRIdW5rcygpLnJlZHVjZSgoc3RyLCBodW5rKSA9PiBzdHIgKyBodW5rLnRvU3RyaW5nSW4oYnVmZmVyKSwgJycpO1xuICB9XG5cbiAgLypcbiAgICogQ29uc3RydWN0IGEgU3RyaW5nIGNvbnRhaW5pbmcgaW50ZXJuYWwgZGlhZ25vc3RpYyBpbmZvcm1hdGlvbi5cbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGluc3BlY3Qob3B0cyA9IHt9KSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGluZGVudDogMCxcbiAgICAgIC4uLm9wdHMsXG4gICAgfTtcblxuICAgIGxldCBpbmRlbnRhdGlvbiA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5pbmRlbnQ7IGkrKykge1xuICAgICAgaW5kZW50YXRpb24gKz0gJyAnO1xuICAgIH1cblxuICAgIGxldCBpbnNwZWN0U3RyaW5nID0gYCR7aW5kZW50YXRpb259KFBhdGNoIG1hcmtlcj0ke3RoaXMubWFya2VyLmlkfWA7XG4gICAgaWYgKHRoaXMubWFya2VyLmlzRGVzdHJveWVkKCkpIHtcbiAgICAgIGluc3BlY3RTdHJpbmcgKz0gJyBbZGVzdHJveWVkXSc7XG4gICAgfVxuICAgIGlmICghdGhpcy5tYXJrZXIuaXNWYWxpZCgpKSB7XG4gICAgICBpbnNwZWN0U3RyaW5nICs9ICcgW2ludmFsaWRdJztcbiAgICB9XG4gICAgaW5zcGVjdFN0cmluZyArPSAnXFxuJztcbiAgICBmb3IgKGNvbnN0IGh1bmsgb2YgdGhpcy5odW5rcykge1xuICAgICAgaW5zcGVjdFN0cmluZyArPSBodW5rLmluc3BlY3Qoe2luZGVudDogb3B0aW9ucy5pbmRlbnQgKyAyfSk7XG4gICAgfVxuICAgIGluc3BlY3RTdHJpbmcgKz0gYCR7aW5kZW50YXRpb259KVxcbmA7XG4gICAgcmV0dXJuIGluc3BlY3RTdHJpbmc7XG4gIH1cblxuICBpc1ByZXNlbnQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXRSZW5kZXJTdGF0dXMoKSB7XG4gICAgcmV0dXJuIEVYUEFOREVEO1xuICB9XG59XG5cbmNsYXNzIEhpZGRlblBhdGNoIGV4dGVuZHMgUGF0Y2gge1xuICBjb25zdHJ1Y3RvcihtYXJrZXIsIHJlbmRlclN0YXR1cywgc2hvd0ZuKSB7XG4gICAgc3VwZXIoe3N0YXR1czogbnVsbCwgaHVua3M6IFtdLCBtYXJrZXJ9KTtcblxuICAgIHRoaXMucmVuZGVyU3RhdHVzID0gcmVuZGVyU3RhdHVzO1xuICAgIHRoaXMuc2hvdyA9IHNob3dGbjtcbiAgfVxuXG4gIGdldEluc2VydGlvblBvaW50KCkge1xuICAgIHJldHVybiB0aGlzLmdldFJhbmdlKCkuZW5kO1xuICB9XG5cbiAgZ2V0UmVuZGVyU3RhdHVzKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlclN0YXR1cztcbiAgfVxuXG4gIC8qXG4gICAqIENvbnN0cnVjdCBhIFN0cmluZyBjb250YWluaW5nIGludGVybmFsIGRpYWdub3N0aWMgaW5mb3JtYXRpb24uXG4gICAqL1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpbnNwZWN0KG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBpbmRlbnQ6IDAsXG4gICAgICAuLi5vcHRzLFxuICAgIH07XG5cbiAgICBsZXQgaW5kZW50YXRpb24gPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMuaW5kZW50OyBpKyspIHtcbiAgICAgIGluZGVudGF0aW9uICs9ICcgJztcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7aW5kZW50YXRpb259KEhpZGRlblBhdGNoIG1hcmtlcj0ke3RoaXMubWFya2VyLmlkfSlcXG5gO1xuICB9XG59XG5cbmNsYXNzIE51bGxQYXRjaCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5tYXJrZXIgPSBidWZmZXIubWFya1JhbmdlKFtbMCwgMF0sIFswLCAwXV0pO1xuICB9XG5cbiAgZ2V0U3RhdHVzKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0TWFya2VyKCkge1xuICAgIHJldHVybiB0aGlzLm1hcmtlcjtcbiAgfVxuXG4gIGdldFJhbmdlKCkge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtlcigpLmdldFJhbmdlKCk7XG4gIH1cblxuICBnZXRTdGFydFJhbmdlKCkge1xuICAgIHJldHVybiBSYW5nZS5mcm9tT2JqZWN0KFtbMCwgMF0sIFswLCAwXV0pO1xuICB9XG5cbiAgZ2V0SHVua3MoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0Q2hhbmdlZExpbmVDb3VudCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnRhaW5zUm93KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldE1heExpbmVOdW1iZXJXaWR0aCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNsb25lKG9wdHMgPSB7fSkge1xuICAgIGlmIChcbiAgICAgIG9wdHMuc3RhdHVzID09PSB1bmRlZmluZWQgJiZcbiAgICAgIG9wdHMuaHVua3MgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgb3B0cy5tYXJrZXIgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgb3B0cy5yZW5kZXJTdGF0dXMgPT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUGF0Y2goe1xuICAgICAgICBzdGF0dXM6IG9wdHMuc3RhdHVzICE9PSB1bmRlZmluZWQgPyBvcHRzLnN0YXR1cyA6IHRoaXMuZ2V0U3RhdHVzKCksXG4gICAgICAgIGh1bmtzOiBvcHRzLmh1bmtzICE9PSB1bmRlZmluZWQgPyBvcHRzLmh1bmtzIDogdGhpcy5nZXRIdW5rcygpLFxuICAgICAgICBtYXJrZXI6IG9wdHMubWFya2VyICE9PSB1bmRlZmluZWQgPyBvcHRzLm1hcmtlciA6IHRoaXMuZ2V0TWFya2VyKCksXG4gICAgICAgIHJlbmRlclN0YXR1czogb3B0cy5yZW5kZXJTdGF0dXMgIT09IHVuZGVmaW5lZCA/IG9wdHMucmVuZGVyU3RhdHVzIDogdGhpcy5nZXRSZW5kZXJTdGF0dXMoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXJ0aW5nTWFya2VycygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXRFbmRpbmdNYXJrZXJzKCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGJ1aWxkU3RhZ2VQYXRjaEZvckxpbmVzKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYnVpbGRVbnN0YWdlUGF0Y2hGb3JMaW5lcygpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldEZpcnN0Q2hhbmdlUmFuZ2UoKSB7XG4gICAgcmV0dXJuIFJhbmdlLmZyb21PYmplY3QoW1swLCAwXSwgWzAsIDBdXSk7XG4gIH1cblxuICB1cGRhdGVNYXJrZXJzKCkge31cblxuICB0b1N0cmluZ0luKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8qXG4gICAqIENvbnN0cnVjdCBhIFN0cmluZyBjb250YWluaW5nIGludGVybmFsIGRpYWdub3N0aWMgaW5mb3JtYXRpb24uXG4gICAqL1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpbnNwZWN0KG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBpbmRlbnQ6IDAsXG4gICAgICAuLi5vcHRzLFxuICAgIH07XG5cbiAgICBsZXQgaW5kZW50YXRpb24gPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMuaW5kZW50OyBpKyspIHtcbiAgICAgIGluZGVudGF0aW9uICs9ICcgJztcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7aW5kZW50YXRpb259KE51bGxQYXRjaClcXG5gO1xuICB9XG5cbiAgaXNQcmVzZW50KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldFJlbmRlclN0YXR1cygpIHtcbiAgICByZXR1cm4gRVhQQU5ERUQ7XG4gIH1cbn1cblxuY2xhc3MgQnVmZmVyQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpbmFsLCBvcmlnaW5hbEJhc2VPZmZzZXQsIG5leHRQYXRjaEJ1ZmZlcikge1xuICAgIHRoaXMub3JpZ2luYWxCdWZmZXIgPSBvcmlnaW5hbDtcbiAgICB0aGlzLm5leHRQYXRjaEJ1ZmZlciA9IG5leHRQYXRjaEJ1ZmZlcjtcblxuICAgIC8vIFRoZSByYW5nZXMgcHJvdmlkZWQgdG8gYnVpbGRlciBtZXRob2RzIGFyZSBleHBlY3RlZCB0byBiZSB2YWxpZCB3aXRoaW4gdGhlIG9yaWdpbmFsIGJ1ZmZlci4gQWNjb3VudCBmb3JcbiAgICAvLyB0aGUgcG9zaXRpb24gb2YgdGhlIFBhdGNoIHdpdGhpbiBpdHMgb3JpZ2luYWwgVGV4dEJ1ZmZlciwgYW5kIGFueSBleGlzdGluZyBjb250ZW50IGFscmVhZHkgb24gdGhlIG5leHRcbiAgICAvLyBUZXh0QnVmZmVyLlxuICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5uZXh0UGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuZ2V0TGFzdFJvdygpIC0gb3JpZ2luYWxCYXNlT2Zmc2V0O1xuXG4gICAgdGhpcy5odW5rQnVmZmVyVGV4dCA9ICcnO1xuICAgIHRoaXMuaHVua1Jvd0NvdW50ID0gMDtcbiAgICB0aGlzLmh1bmtTdGFydE9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICAgIHRoaXMuaHVua1JlZ2lvbnMgPSBbXTtcbiAgICB0aGlzLmh1bmtSYW5nZSA9IG51bGw7XG5cbiAgICB0aGlzLmxhc3RPZmZzZXQgPSAwO1xuICB9XG5cbiAgYXBwZW5kKHJhbmdlKSB7XG4gICAgdGhpcy5odW5rQnVmZmVyVGV4dCArPSB0aGlzLm9yaWdpbmFsQnVmZmVyLmdldFRleHRJblJhbmdlKHJhbmdlKSArICdcXG4nO1xuICAgIHRoaXMuaHVua1Jvd0NvdW50ICs9IHJhbmdlLmdldFJvd0NvdW50KCk7XG4gIH1cblxuICByZW1vdmUocmFuZ2UpIHtcbiAgICB0aGlzLm9mZnNldCAtPSByYW5nZS5nZXRSb3dDb3VudCgpO1xuICB9XG5cbiAgbWFya1JlZ2lvbihyYW5nZSwgUmVnaW9uS2luZCkge1xuICAgIGNvbnN0IGZpbmFsUmFuZ2UgPSB0aGlzLm9mZnNldCAhPT0gMFxuICAgICAgPyByYW5nZS50cmFuc2xhdGUoW3RoaXMub2Zmc2V0LCAwXSwgW3RoaXMub2Zmc2V0LCAwXSlcbiAgICAgIDogcmFuZ2U7XG5cbiAgICAvLyBDb2xsYXBzZSBjb25zZWN1dGl2ZSByYW5nZXMgb2YgdGhlIHNhbWUgUmVnaW9uS2luZCBpbnRvIG9uZSBjb250aW51b3VzIHJlZ2lvbi5cbiAgICBjb25zdCBsYXN0UmVnaW9uID0gdGhpcy5odW5rUmVnaW9uc1t0aGlzLmh1bmtSZWdpb25zLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsYXN0UmVnaW9uICYmIGxhc3RSZWdpb24uUmVnaW9uS2luZCA9PT0gUmVnaW9uS2luZCAmJiBmaW5hbFJhbmdlLnN0YXJ0LnJvdyAtIGxhc3RSZWdpb24ucmFuZ2UuZW5kLnJvdyA9PT0gMSkge1xuICAgICAgbGFzdFJlZ2lvbi5yYW5nZS5lbmQgPSBmaW5hbFJhbmdlLmVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5odW5rUmVnaW9ucy5wdXNoKHtSZWdpb25LaW5kLCByYW5nZTogZmluYWxSYW5nZX0pO1xuICAgIH1cbiAgfVxuXG4gIG1hcmtIdW5rUmFuZ2UocmFuZ2UpIHtcbiAgICBsZXQgZmluYWxSYW5nZSA9IHJhbmdlO1xuICAgIGlmICh0aGlzLmh1bmtTdGFydE9mZnNldCAhPT0gMCB8fCB0aGlzLm9mZnNldCAhPT0gMCkge1xuICAgICAgZmluYWxSYW5nZSA9IGZpbmFsUmFuZ2UudHJhbnNsYXRlKFt0aGlzLmh1bmtTdGFydE9mZnNldCwgMF0sIFt0aGlzLm9mZnNldCwgMF0pO1xuICAgIH1cbiAgICB0aGlzLmh1bmtSYW5nZSA9IGZpbmFsUmFuZ2U7XG4gIH1cblxuICBsYXRlc3RIdW5rV2FzSW5jbHVkZWQoKSB7XG4gICAgdGhpcy5uZXh0UGF0Y2hCdWZmZXIuYnVmZmVyLmFwcGVuZCh0aGlzLmh1bmtCdWZmZXJUZXh0LCB7bm9ybWFsaXplTGluZUVuZGluZ3M6IGZhbHNlfSk7XG5cbiAgICBjb25zdCByZWdpb25zID0gdGhpcy5odW5rUmVnaW9ucy5tYXAoKHtSZWdpb25LaW5kLCByYW5nZX0pID0+IHtcbiAgICAgIGNvbnN0IHJlZ2lvbk1hcmtlciA9IHRoaXMubmV4dFBhdGNoQnVmZmVyLm1hcmtSYW5nZShcbiAgICAgICAgUmVnaW9uS2luZC5sYXllck5hbWUsXG4gICAgICAgIHJhbmdlLFxuICAgICAgICB7aW52YWxpZGF0ZTogJ25ldmVyJywgZXhjbHVzaXZlOiBmYWxzZX0sXG4gICAgICApO1xuICAgICAgcmV0dXJuIG5ldyBSZWdpb25LaW5kKHJlZ2lvbk1hcmtlcik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm5leHRQYXRjaEJ1ZmZlci5tYXJrUmFuZ2UoJ2h1bmsnLCB0aGlzLmh1bmtSYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcicsIGV4Y2x1c2l2ZTogZmFsc2V9KTtcblxuICAgIHRoaXMuaHVua0J1ZmZlclRleHQgPSAnJztcbiAgICB0aGlzLmh1bmtSb3dDb3VudCA9IDA7XG4gICAgdGhpcy5odW5rU3RhcnRPZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgICB0aGlzLmh1bmtSZWdpb25zID0gW107XG4gICAgdGhpcy5odW5rUmFuZ2UgPSBudWxsO1xuXG4gICAgcmV0dXJuIHtyZWdpb25zLCBtYXJrZXJ9O1xuICB9XG5cbiAgbGF0ZXN0SHVua1dhc0Rpc2NhcmRlZCgpIHtcbiAgICB0aGlzLm9mZnNldCAtPSB0aGlzLmh1bmtSb3dDb3VudDtcblxuICAgIHRoaXMuaHVua0J1ZmZlclRleHQgPSAnJztcbiAgICB0aGlzLmh1bmtSb3dDb3VudCA9IDA7XG4gICAgdGhpcy5odW5rU3RhcnRPZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgICB0aGlzLmh1bmtSZWdpb25zID0gW107XG4gICAgdGhpcy5odW5rUmFuZ2UgPSBudWxsO1xuXG4gICAgcmV0dXJuIHtyZWdpb25zOiBbXSwgbWFya2VyOiBudWxsfTtcbiAgfVxufVxuIl19