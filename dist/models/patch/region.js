"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NoNewline = exports.Unchanged = exports.Deletion = exports.Addition = void 0;

var _atom = require("atom");

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Region {
  constructor(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }

  getRange() {
    return this.marker.getRange();
  }

  getStartBufferRow() {
    return this.getRange().start.row;
  }

  getEndBufferRow() {
    return this.getRange().end.row;
  }

  includesBufferRow(row) {
    return this.getRange().intersectsRow(row);
  }
  /*
   * intersectRows breaks a Region into runs of rows that are included in
   * rowSet and rows that are not. For example:
   *  @this Region        row 10-20
   *  @param rowSet       row 11, 12, 13, 17, 19
   *  @param includeGaps  true (whether the result will include gaps or not)
   *  @return an array of regions like this:
   *    (10, gap = true) (11, 12, 13, gap = false) (14, 15, 16, gap = true)
   *    (17, gap = false) (18, gap = true) (19, gap = false) (20, gap = true)
   */


  intersectRows(rowSet, includeGaps) {
    const intersections = [];
    let withinIntersection = false;
    let currentRow = this.getRange().start.row;
    let nextStartRow = currentRow;

    const finishRowRange = isGap => {
      if (isGap && !includeGaps) {
        nextStartRow = currentRow;
        return;
      }

      if (currentRow <= this.getRange().start.row) {
        return;
      }

      intersections.push({
        intersection: _atom.Range.fromObject([[nextStartRow, 0], [currentRow - 1, Infinity]]),
        gap: isGap
      });
      nextStartRow = currentRow;
    };

    while (currentRow <= this.getRange().end.row) {
      if (rowSet.has(currentRow) && !withinIntersection) {
        // One row past the end of a gap. Start of intersecting row range.
        finishRowRange(true);
        withinIntersection = true;
      } else if (!rowSet.has(currentRow) && withinIntersection) {
        // One row past the end of intersecting row range. Start of the next gap.
        finishRowRange(false);
        withinIntersection = false;
      }

      currentRow++;
    }

    finishRowRange(!withinIntersection);
    return intersections;
  }

  isAddition() {
    return false;
  }

  isDeletion() {
    return false;
  }

  isUnchanged() {
    return false;
  }

  isNoNewline() {
    return false;
  }

  getBufferRows() {
    return this.getRange().getRows();
  }

  bufferRowCount() {
    return this.getRange().getRowCount();
  }

  when(callbacks) {
    const callback = callbacks[this.constructor.name.toLowerCase()] || callbacks.default || (() => undefined);

    return callback();
  }

  updateMarkers(map) {
    this.marker = map.get(this.marker) || this.marker;
  }

  destroyMarkers() {
    this.marker.destroy();
  }

  toStringIn(buffer) {
    const raw = buffer.getTextInRange(this.getRange());
    return this.constructor.origin + raw.replace(/\r?\n/g, '$&' + this.constructor.origin) + buffer.lineEndingForRow(this.getRange().end.row);
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

    let inspectString = `${indentation}(${this.constructor.name} marker=${this.marker.id})`;

    if (this.marker.isDestroyed()) {
      inspectString += ' [destroyed]';
    }

    if (!this.marker.isValid()) {
      inspectString += ' [invalid]';
    }

    return inspectString + '\n';
  }

  isChange() {
    return true;
  }

}

class Addition extends Region {
  isAddition() {
    return true;
  }

  invertIn(nextBuffer) {
    return new Deletion(nextBuffer.markRange(this.getRange()));
  }

}

exports.Addition = Addition;

_defineProperty(Addition, "origin", '+');

_defineProperty(Addition, "layerName", 'addition');

class Deletion extends Region {
  isDeletion() {
    return true;
  }

  invertIn(nextBuffer) {
    return new Addition(nextBuffer.markRange(this.getRange()));
  }

}

exports.Deletion = Deletion;

_defineProperty(Deletion, "origin", '-');

_defineProperty(Deletion, "layerName", 'deletion');

class Unchanged extends Region {
  isUnchanged() {
    return true;
  }

  isChange() {
    return false;
  }

  invertIn(nextBuffer) {
    return new Unchanged(nextBuffer.markRange(this.getRange()));
  }

}

exports.Unchanged = Unchanged;

_defineProperty(Unchanged, "origin", ' ');

_defineProperty(Unchanged, "layerName", 'unchanged');

class NoNewline extends Region {
  isNoNewline() {
    return true;
  }

  isChange() {
    return false;
  }

  invertIn(nextBuffer) {
    return new NoNewline(nextBuffer.markRange(this.getRange()));
  }

}

exports.NoNewline = NoNewline;

_defineProperty(NoNewline, "origin", '\\');

_defineProperty(NoNewline, "layerName", 'nonewline');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvcmVnaW9uLmpzIl0sIm5hbWVzIjpbIlJlZ2lvbiIsImNvbnN0cnVjdG9yIiwibWFya2VyIiwiZ2V0TWFya2VyIiwiZ2V0UmFuZ2UiLCJnZXRTdGFydEJ1ZmZlclJvdyIsInN0YXJ0Iiwicm93IiwiZ2V0RW5kQnVmZmVyUm93IiwiZW5kIiwiaW5jbHVkZXNCdWZmZXJSb3ciLCJpbnRlcnNlY3RzUm93IiwiaW50ZXJzZWN0Um93cyIsInJvd1NldCIsImluY2x1ZGVHYXBzIiwiaW50ZXJzZWN0aW9ucyIsIndpdGhpbkludGVyc2VjdGlvbiIsImN1cnJlbnRSb3ciLCJuZXh0U3RhcnRSb3ciLCJmaW5pc2hSb3dSYW5nZSIsImlzR2FwIiwicHVzaCIsImludGVyc2VjdGlvbiIsIlJhbmdlIiwiZnJvbU9iamVjdCIsIkluZmluaXR5IiwiZ2FwIiwiaGFzIiwiaXNBZGRpdGlvbiIsImlzRGVsZXRpb24iLCJpc1VuY2hhbmdlZCIsImlzTm9OZXdsaW5lIiwiZ2V0QnVmZmVyUm93cyIsImdldFJvd3MiLCJidWZmZXJSb3dDb3VudCIsImdldFJvd0NvdW50Iiwid2hlbiIsImNhbGxiYWNrcyIsImNhbGxiYWNrIiwibmFtZSIsInRvTG93ZXJDYXNlIiwiZGVmYXVsdCIsInVuZGVmaW5lZCIsInVwZGF0ZU1hcmtlcnMiLCJtYXAiLCJnZXQiLCJkZXN0cm95TWFya2VycyIsImRlc3Ryb3kiLCJ0b1N0cmluZ0luIiwiYnVmZmVyIiwicmF3IiwiZ2V0VGV4dEluUmFuZ2UiLCJvcmlnaW4iLCJyZXBsYWNlIiwibGluZUVuZGluZ0ZvclJvdyIsImluc3BlY3QiLCJvcHRzIiwib3B0aW9ucyIsImluZGVudCIsImluZGVudGF0aW9uIiwiaSIsImluc3BlY3RTdHJpbmciLCJpZCIsImlzRGVzdHJveWVkIiwiaXNWYWxpZCIsImlzQ2hhbmdlIiwiQWRkaXRpb24iLCJpbnZlcnRJbiIsIm5leHRCdWZmZXIiLCJEZWxldGlvbiIsIm1hcmtS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Qzs7OztnQkFBeEJpRSxRLFlBQ0ssRzs7Z0JBRExBLFEsZUFHUSxVOztBQVdkLE1BQU1FLFNBQU4sU0FBd0J2RSxNQUF4QixDQUErQjtBQUtwQzhCLEVBQUFBLFdBQVcsR0FBRztBQUNaLFdBQU8sSUFBUDtBQUNEOztBQUVEbUMsRUFBQUEsUUFBUSxHQUFHO0FBQ1QsV0FBTyxLQUFQO0FBQ0Q7O0FBRURFLEVBQUFBLFFBQVEsQ0FBQ0MsVUFBRCxFQUFhO0FBQ25CLFdBQU8sSUFBSUcsU0FBSixDQUFjSCxVQUFVLENBQUNFLFNBQVgsQ0FBcUIsS0FBS2xFLFFBQUwsRUFBckIsQ0FBZCxDQUFQO0FBQ0Q7O0FBZm1DOzs7O2dCQUF6Qm1FLFMsWUFDSyxHOztnQkFETEEsUyxlQUdRLFc7O0FBZWQsTUFBTUMsU0FBTixTQUF3QnhFLE1BQXhCLENBQStCO0FBS3BDK0IsRUFBQUEsV0FBVyxHQUFHO0FBQ1osV0FBTyxJQUFQO0FBQ0Q7O0FBRURrQyxFQUFBQSxRQUFRLEdBQUc7QUFDVCxXQUFPLEtBQVA7QUFDRDs7QUFFREUsRUFBQUEsUUFBUSxDQUFDQyxVQUFELEVBQWE7QUFDbkIsV0FBTyxJQUFJSSxTQUFKLENBQWNKLFVBQVUsQ0FBQ0UsU0FBWCxDQUFxQixLQUFLbEUsUUFBTCxFQUFyQixDQUFkLENBQVA7QUFDRDs7QUFmbUM7Ozs7Z0JBQXpCb0UsUyxZQUNLLEk7O2dCQURMQSxTLGVBR1EsVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuXG5jbGFzcyBSZWdpb24ge1xuICBjb25zdHJ1Y3RvcihtYXJrZXIpIHtcbiAgICB0aGlzLm1hcmtlciA9IG1hcmtlcjtcbiAgfVxuXG4gIGdldE1hcmtlcigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXJrZXI7XG4gIH1cblxuICBnZXRSYW5nZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXJrZXIuZ2V0UmFuZ2UoKTtcbiAgfVxuXG4gIGdldFN0YXJ0QnVmZmVyUm93KCkge1xuICAgIHJldHVybiB0aGlzLmdldFJhbmdlKCkuc3RhcnQucm93O1xuICB9XG5cbiAgZ2V0RW5kQnVmZmVyUm93KCkge1xuICAgIHJldHVybiB0aGlzLmdldFJhbmdlKCkuZW5kLnJvdztcbiAgfVxuXG4gIGluY2x1ZGVzQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLmdldFJhbmdlKCkuaW50ZXJzZWN0c1Jvdyhyb3cpO1xuICB9XG5cbiAgLypcbiAgICogaW50ZXJzZWN0Um93cyBicmVha3MgYSBSZWdpb24gaW50byBydW5zIG9mIHJvd3MgdGhhdCBhcmUgaW5jbHVkZWQgaW5cbiAgICogcm93U2V0IGFuZCByb3dzIHRoYXQgYXJlIG5vdC4gRm9yIGV4YW1wbGU6XG4gICAqICBAdGhpcyBSZWdpb24gICAgICAgIHJvdyAxMC0yMFxuICAgKiAgQHBhcmFtIHJvd1NldCAgICAgICByb3cgMTEsIDEyLCAxMywgMTcsIDE5XG4gICAqICBAcGFyYW0gaW5jbHVkZUdhcHMgIHRydWUgKHdoZXRoZXIgdGhlIHJlc3VsdCB3aWxsIGluY2x1ZGUgZ2FwcyBvciBub3QpXG4gICAqICBAcmV0dXJuIGFuIGFycmF5IG9mIHJlZ2lvbnMgbGlrZSB0aGlzOlxuICAgKiAgICAoMTAsIGdhcCA9IHRydWUpICgxMSwgMTIsIDEzLCBnYXAgPSBmYWxzZSkgKDE0LCAxNSwgMTYsIGdhcCA9IHRydWUpXG4gICAqICAgICgxNywgZ2FwID0gZmFsc2UpICgxOCwgZ2FwID0gdHJ1ZSkgKDE5LCBnYXAgPSBmYWxzZSkgKDIwLCBnYXAgPSB0cnVlKVxuICAgKi9cbiAgaW50ZXJzZWN0Um93cyhyb3dTZXQsIGluY2x1ZGVHYXBzKSB7XG4gICAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IFtdO1xuICAgIGxldCB3aXRoaW5JbnRlcnNlY3Rpb24gPSBmYWxzZTtcblxuICAgIGxldCBjdXJyZW50Um93ID0gdGhpcy5nZXRSYW5nZSgpLnN0YXJ0LnJvdztcbiAgICBsZXQgbmV4dFN0YXJ0Um93ID0gY3VycmVudFJvdztcblxuICAgIGNvbnN0IGZpbmlzaFJvd1JhbmdlID0gaXNHYXAgPT4ge1xuICAgICAgaWYgKGlzR2FwICYmICFpbmNsdWRlR2Fwcykge1xuICAgICAgICBuZXh0U3RhcnRSb3cgPSBjdXJyZW50Um93O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50Um93IDw9IHRoaXMuZ2V0UmFuZ2UoKS5zdGFydC5yb3cpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goe1xuICAgICAgICBpbnRlcnNlY3Rpb246IFJhbmdlLmZyb21PYmplY3QoW1tuZXh0U3RhcnRSb3csIDBdLCBbY3VycmVudFJvdyAtIDEsIEluZmluaXR5XV0pLFxuICAgICAgICBnYXA6IGlzR2FwLFxuICAgICAgfSk7XG5cbiAgICAgIG5leHRTdGFydFJvdyA9IGN1cnJlbnRSb3c7XG4gICAgfTtcblxuICAgIHdoaWxlIChjdXJyZW50Um93IDw9IHRoaXMuZ2V0UmFuZ2UoKS5lbmQucm93KSB7XG4gICAgICBpZiAocm93U2V0LmhhcyhjdXJyZW50Um93KSAmJiAhd2l0aGluSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIC8vIE9uZSByb3cgcGFzdCB0aGUgZW5kIG9mIGEgZ2FwLiBTdGFydCBvZiBpbnRlcnNlY3Rpbmcgcm93IHJhbmdlLlxuICAgICAgICBmaW5pc2hSb3dSYW5nZSh0cnVlKTtcbiAgICAgICAgd2l0aGluSW50ZXJzZWN0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoIXJvd1NldC5oYXMoY3VycmVudFJvdykgJiYgd2l0aGluSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIC8vIE9uZSByb3cgcGFzdCB0aGUgZW5kIG9mIGludGVyc2VjdGluZyByb3cgcmFuZ2UuIFN0YXJ0IG9mIHRoZSBuZXh0IGdhcC5cbiAgICAgICAgZmluaXNoUm93UmFuZ2UoZmFsc2UpO1xuICAgICAgICB3aXRoaW5JbnRlcnNlY3Rpb24gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY3VycmVudFJvdysrO1xuICAgIH1cblxuICAgIGZpbmlzaFJvd1JhbmdlKCF3aXRoaW5JbnRlcnNlY3Rpb24pO1xuICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICB9XG5cbiAgaXNBZGRpdGlvbigpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc0RlbGV0aW9uKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzVW5jaGFuZ2VkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzTm9OZXdsaW5lKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldEJ1ZmZlclJvd3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmFuZ2UoKS5nZXRSb3dzKCk7XG4gIH1cblxuICBidWZmZXJSb3dDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSYW5nZSgpLmdldFJvd0NvdW50KCk7XG4gIH1cblxuICB3aGVuKGNhbGxiYWNrcykge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gY2FsbGJhY2tzW3RoaXMuY29uc3RydWN0b3IubmFtZS50b0xvd2VyQ2FzZSgpXSB8fCBjYWxsYmFja3MuZGVmYXVsdCB8fCAoKCkgPT4gdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuXG4gIHVwZGF0ZU1hcmtlcnMobWFwKSB7XG4gICAgdGhpcy5tYXJrZXIgPSBtYXAuZ2V0KHRoaXMubWFya2VyKSB8fCB0aGlzLm1hcmtlcjtcbiAgfVxuXG4gIGRlc3Ryb3lNYXJrZXJzKCkge1xuICAgIHRoaXMubWFya2VyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHRvU3RyaW5nSW4oYnVmZmVyKSB7XG4gICAgY29uc3QgcmF3ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKHRoaXMuZ2V0UmFuZ2UoKSk7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3JpZ2luICsgcmF3LnJlcGxhY2UoL1xccj9cXG4vZywgJyQmJyArIHRoaXMuY29uc3RydWN0b3Iub3JpZ2luKSArXG4gICAgICBidWZmZXIubGluZUVuZGluZ0ZvclJvdyh0aGlzLmdldFJhbmdlKCkuZW5kLnJvdyk7XG4gIH1cblxuICAvKlxuICAgKiBDb25zdHJ1Y3QgYSBTdHJpbmcgY29udGFpbmluZyBpbnRlcm5hbCBkaWFnbm9zdGljIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaW5zcGVjdChvcHRzID0ge30pIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgaW5kZW50OiAwLFxuICAgICAgLi4ub3B0cyxcbiAgICB9O1xuXG4gICAgbGV0IGluZGVudGF0aW9uID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmluZGVudDsgaSsrKSB7XG4gICAgICBpbmRlbnRhdGlvbiArPSAnICc7XG4gICAgfVxuXG4gICAgbGV0IGluc3BlY3RTdHJpbmcgPSBgJHtpbmRlbnRhdGlvbn0oJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IG1hcmtlcj0ke3RoaXMubWFya2VyLmlkfSlgO1xuICAgIGlmICh0aGlzLm1hcmtlci5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICBpbnNwZWN0U3RyaW5nICs9ICcgW2Rlc3Ryb3llZF0nO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWFya2VyLmlzVmFsaWQoKSkge1xuICAgICAgaW5zcGVjdFN0cmluZyArPSAnIFtpbnZhbGlkXSc7XG4gICAgfVxuICAgIHJldHVybiBpbnNwZWN0U3RyaW5nICsgJ1xcbic7XG4gIH1cblxuICBpc0NoYW5nZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkaXRpb24gZXh0ZW5kcyBSZWdpb24ge1xuICBzdGF0aWMgb3JpZ2luID0gJysnO1xuXG4gIHN0YXRpYyBsYXllck5hbWUgPSAnYWRkaXRpb24nO1xuXG4gIGlzQWRkaXRpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpbnZlcnRJbihuZXh0QnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGlvbihuZXh0QnVmZmVyLm1hcmtSYW5nZSh0aGlzLmdldFJhbmdlKCkpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRpb24gZXh0ZW5kcyBSZWdpb24ge1xuICBzdGF0aWMgb3JpZ2luID0gJy0nO1xuXG4gIHN0YXRpYyBsYXllck5hbWUgPSAnZGVsZXRpb24nO1xuXG4gIGlzRGVsZXRpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpbnZlcnRJbihuZXh0QnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBBZGRpdGlvbihuZXh0QnVmZmVyLm1hcmtSYW5nZSh0aGlzLmdldFJhbmdlKCkpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5jaGFuZ2VkIGV4dGVuZHMgUmVnaW9uIHtcbiAgc3RhdGljIG9yaWdpbiA9ICcgJztcblxuICBzdGF0aWMgbGF5ZXJOYW1lID0gJ3VuY2hhbmdlZCc7XG5cbiAgaXNVbmNoYW5nZWQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc0NoYW5nZSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpbnZlcnRJbihuZXh0QnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBVbmNoYW5nZWQobmV4dEJ1ZmZlci5tYXJrUmFuZ2UodGhpcy5nZXRSYW5nZSgpKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vTmV3bGluZSBleHRlbmRzIFJlZ2lvbiB7XG4gIHN0YXRpYyBvcmlnaW4gPSAnXFxcXCc7XG5cbiAgc3RhdGljIGxheWVyTmFtZSA9ICdub25ld2xpbmUnO1xuXG4gIGlzTm9OZXdsaW5lKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNDaGFuZ2UoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaW52ZXJ0SW4obmV4dEJ1ZmZlcikge1xuICAgIHJldHVybiBuZXcgTm9OZXdsaW5lKG5leHRCdWZmZXIubWFya1JhbmdlKHRoaXMuZ2V0UmFuZ2UoKSkpO1xuICB9XG59XG4iXX0=