"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var _util = require("util");

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const LAYER_NAMES = ['unchanged', 'addition', 'deletion', 'nonewline', 'hunk', 'patch'];

class PatchBuffer {
  constructor() {
    this.buffer = new _atom.TextBuffer();
    this.buffer.retain();
    this.layers = LAYER_NAMES.reduce((map, layerName) => {
      map[layerName] = this.buffer.addMarkerLayer();
      return map;
    }, {});
  }

  getBuffer() {
    return this.buffer;
  }

  getInsertionPoint() {
    return this.buffer.getEndPosition();
  }

  getLayer(layerName) {
    return this.layers[layerName];
  }

  findMarkers(layerName, ...args) {
    return this.layers[layerName].findMarkers(...args);
  }

  findAllMarkers(...args) {
    return LAYER_NAMES.reduce((arr, layerName) => {
      arr.push(...this.findMarkers(layerName, ...args));
      return arr;
    }, []);
  }

  markPosition(layerName, ...args) {
    return this.layers[layerName].markPosition(...args);
  }

  markRange(layerName, ...args) {
    return this.layers[layerName].markRange(...args);
  }

  clearAllLayers() {
    for (const layerName of LAYER_NAMES) {
      this.layers[layerName].clear();
    }
  }

  createInserterAt(insertionPoint) {
    return new Inserter(this, _atom.Point.fromObject(insertionPoint));
  }

  createInserterAtEnd() {
    return this.createInserterAt(this.getInsertionPoint());
  }

  createSubBuffer(rangeLike, options = {}) {
    const opts = _objectSpread2({
      exclude: new Set()
    }, options);

    const range = _atom.Range.fromObject(rangeLike);

    const baseOffset = range.start.negate();
    const includedMarkersByLayer = LAYER_NAMES.reduce((map, layerName) => {
      map[layerName] = this.layers[layerName].findMarkers({
        intersectsRange: range
      }).filter(m => !opts.exclude.has(m));
      return map;
    }, {});
    const markerMap = new Map();
    const subBuffer = new PatchBuffer();
    subBuffer.getBuffer().setText(this.buffer.getTextInRange(range));

    for (const layerName of LAYER_NAMES) {
      for (const oldMarker of includedMarkersByLayer[layerName]) {
        const oldRange = oldMarker.getRange();
        const clippedStart = oldRange.start.isLessThanOrEqual(range.start) ? range.start : oldRange.start;
        const clippedEnd = oldRange.end.isGreaterThanOrEqual(range.end) ? range.end : oldRange.end; // Exclude non-empty markers that intersect *only* at the range start or end

        if (clippedStart.isEqual(clippedEnd) && !oldRange.start.isEqual(oldRange.end)) {
          continue;
        }

        const startOffset = clippedStart.row === range.start.row ? baseOffset : [baseOffset.row, 0];
        const endOffset = clippedEnd.row === range.start.row ? baseOffset : [baseOffset.row, 0];
        const newMarker = subBuffer.markRange(layerName, [clippedStart.translate(startOffset), clippedEnd.translate(endOffset)], oldMarker.getProperties());
        markerMap.set(oldMarker, newMarker);
      }
    }

    return {
      patchBuffer: subBuffer,
      markerMap
    };
  }

  extractPatchBuffer(rangeLike, options = {}) {
    const {
      patchBuffer: subBuffer,
      markerMap
    } = this.createSubBuffer(rangeLike, options);

    for (const oldMarker of markerMap.keys()) {
      oldMarker.destroy();
    }

    this.buffer.setTextInRange(rangeLike, '');
    return {
      patchBuffer: subBuffer,
      markerMap
    };
  }

  deleteLastNewline() {
    if (this.buffer.getLastLine() === '') {
      this.buffer.deleteRow(this.buffer.getLastRow());
    }

    return this;
  }

  adopt(original) {
    this.clearAllLayers();
    this.buffer.setText(original.getBuffer().getText());
    const markerMap = new Map();

    for (const layerName of LAYER_NAMES) {
      for (const originalMarker of original.getLayer(layerName).getMarkers()) {
        const newMarker = this.markRange(layerName, originalMarker.getRange(), originalMarker.getProperties());
        markerMap.set(originalMarker, newMarker);
      }
    }

    return markerMap;
  }
  /* istanbul ignore next */


  inspect(opts = {}) {
    /* istanbul ignore next */
    const options = _objectSpread2({
      layerNames: LAYER_NAMES
    }, opts);

    let inspectString = '';
    const increasingMarkers = [];

    for (const layerName of options.layerNames) {
      for (const marker of this.findMarkers(layerName, {})) {
        increasingMarkers.push({
          layerName,
          point: marker.getRange().start,
          start: true,
          id: marker.id
        });
        increasingMarkers.push({
          layerName,
          point: marker.getRange().end,
          end: true,
          id: marker.id
        });
      }
    }

    increasingMarkers.sort((a, b) => {
      const cmp = a.point.compare(b.point);

      if (cmp !== 0) {
        return cmp;
      } else if (a.start && b.start) {
        return 0;
      } else if (a.start && !b.start) {
        return -1;
      } else if (!a.start && b.start) {
        return 1;
      } else {
        return 0;
      }
    });

    let inspectPoint = _atom.Point.fromObject([0, 0]);

    for (const marker of increasingMarkers) {
      if (!marker.point.isEqual(inspectPoint)) {
        inspectString += (0, _util.inspect)(this.buffer.getTextInRange([inspectPoint, marker.point])) + '\n';
      }

      if (marker.start) {
        inspectString += `  start ${marker.layerName}@${marker.id}\n`;
      } else if (marker.end) {
        inspectString += `  end ${marker.layerName}@${marker.id}\n`;
      }

      inspectPoint = marker.point;
    }

    return inspectString;
  }

}

exports.default = PatchBuffer;

class Inserter {
  constructor(patchBuffer, insertionPoint) {
    const clipped = patchBuffer.getBuffer().clipPosition(insertionPoint);
    this.patchBuffer = patchBuffer;
    this.startPoint = clipped.copy();
    this.insertionPoint = clipped.copy();
    this.markerBlueprints = [];
    this.markerMapCallbacks = [];
    this.markersBefore = new Set();
    this.markersAfter = new Set();
  }

  keepBefore(markers) {
    for (const marker of markers) {
      if (marker.getRange().end.isEqual(this.startPoint)) {
        this.markersBefore.add(marker);
      }
    }

    return this;
  }

  keepAfter(markers) {
    for (const marker of markers) {
      if (marker.getRange().start.isEqual(this.startPoint)) {
        this.markersAfter.add(marker);
      }
    }

    return this;
  }

  markWhile(layerName, block, markerOpts) {
    const start = this.insertionPoint.copy();
    block();
    const end = this.insertionPoint.copy();
    this.markerBlueprints.push({
      layerName,
      range: new _atom.Range(start, end),
      markerOpts
    });
    return this;
  }

  insert(text) {
    const insertedRange = this.patchBuffer.getBuffer().insert(this.insertionPoint, text);
    this.insertionPoint = insertedRange.end;
    return this;
  }

  insertMarked(text, layerName, markerOpts) {
    return this.markWhile(layerName, () => this.insert(text), markerOpts);
  }

  insertPatchBuffer(subPatchBuffer, opts) {
    const baseOffset = this.insertionPoint.copy();
    this.insert(subPatchBuffer.getBuffer().getText());
    const subMarkerMap = new Map();

    for (const layerName of LAYER_NAMES) {
      for (const oldMarker of subPatchBuffer.findMarkers(layerName, {})) {
        const startOffset = oldMarker.getRange().start.row === 0 ? baseOffset : [baseOffset.row, 0];
        const endOffset = oldMarker.getRange().end.row === 0 ? baseOffset : [baseOffset.row, 0];
        const range = oldMarker.getRange().translate(startOffset, endOffset);

        const markerOpts = _objectSpread2({}, oldMarker.getProperties(), {
          callback: newMarker => {
            subMarkerMap.set(oldMarker, newMarker);
          }
        });

        this.markerBlueprints.push({
          layerName,
          range,
          markerOpts
        });
      }
    }

    this.markerMapCallbacks.push({
      markerMap: subMarkerMap,
      callback: opts.callback
    });
    return this;
  }

  apply() {
    for (const {
      layerName,
      range,
      markerOpts
    } of this.markerBlueprints) {
      const callback = markerOpts.callback;
      delete markerOpts.callback;
      const marker = this.patchBuffer.markRange(layerName, range, markerOpts);

      if (callback) {
        callback(marker);
      }
    }

    for (const {
      markerMap,
      callback
    } of this.markerMapCallbacks) {
      callback(markerMap);
    }

    for (const beforeMarker of this.markersBefore) {
      const isEmpty = beforeMarker.getRange().isEmpty();

      if (!beforeMarker.isReversed()) {
        beforeMarker.setHeadPosition(this.startPoint);

        if (isEmpty) {
          beforeMarker.setTailPosition(this.startPoint);
        }
      } else {
        beforeMarker.setTailPosition(this.startPoint);

        if (isEmpty) {
          beforeMarker.setHeadPosition(this.startPoint);
        }
      }
    }

    for (const afterMarker of this.markersAfter) {
      const isEmpty = afterMarker.getRange().isEmpty();

      if (!afterMarker.isReversed()) {
        afterMarker.setTailPosition(this.insertionPoint);

        if (isEmpty) {
          afterMarker.setHeadPosition(this.insertionPoint);
        }
      } else {
        afterMarker.setHeadPosition(this.insertionPoint);

        if (isEmpty) {
          afterMarker.setTailPosition(this.insertionPoint);
        }
      }
    }
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tb2RlbHMvcGF0Y2gvcGF0Y2gtYnVmZmVyLmpzIl0sIm5hbWVzIjpbIkxBWUVSX05BTUVTIiwiUGF0Y2hCdWZmZXIiLCJjb25zdHJ1Y3RvciIsImJ1ZmZlciIsIlRleHRCdWZmZXIiLCJyZXRhaW4iLCJsYXllcnMiLCJyZWR1Y2UiLCJtYXAiLCJsYXllck5hbWUiLCJhZGRNYXJrZXJMYXllciIsImdldEJ1ZmZlciIsImdldEluc2VydGlvblBvaW50IiwiZ2V0RW5kUG9zaXRpb24iLCJnZXRMYXllciIsImZpbmRNYXJrZXJzIiwiYXJncyIsImZpbmRBbGxNYXJrZXJzIiwiYXJyIiwicHVzaCIsIm1hcmtQb3NpdGlvbiIsIm1hcmtSYW5nZSIsImNsZWFyQWxsTGF5ZXJzIiwiY2xlYXIiLCJjcmVhdGVJbnNlcnRlckF0IiwiaW5zZXJ0aW9uUG9pbnQiLCJJbnNlcnRlciIsIlBvaW50IiwiZnJvbU9iamVjdCIsImNyZWF0ZUluc2VydGVyQXRFbmQiLCJjcmVhdGVTdWJCdWZmZXIiLCJyYW5nZUxpa2UiLCJvcHRpb25zIiwib3B0cyIsImV4Y2x1ZGUiLCJTZXQiLCJyYW5nZSIsIlJhbmdlIiwiYmFzZU9mZnNldCIsInN0YXJ0IiwibmVnYXRlIiwiaW5jbHVkZWRNYXJrZXJzQnlMYXllciIsImludGVyc2VjdHNSYW5nZSIsImZpbHRlciIsIm0iLCJoYXMiLCJtYXJrZXJNYXAiLCJNYXAiLCJzdWJCdWZmZXIiLCJzZXRUZXh0IiwiZ2V0VGV4dEluUmFuZ2UiLCJvbGRNYXJrZXIiLCJvbGRSYW5nZSIsImdldFJhbmdlIiwiY2xpcHBlZFN0YXJ0IiwiaXNMZXNzVGhhbk9yRXF1YWwiLCJjbGlwcGVkRW5kIiwiZW5kIiwiaXNHcmVhdGVyVGhhbk9yRXF1YWwiLCJpc0VxdWFsIiwic3RhcnRPZmZzZXQiLCJyb3ciLCJlbmRPZmZzZXQiLCJuZXdNYXJrZXIiLCJ0cmFuc2xhdGUiLCJnZXRQcm9wZXJ0aWVzIiwic2V0IiwicGF0Y2hCdWZmZXIiLCJleHRyYWN0UGF0Y2hCdWZmZXIiLCJrZXlzIiwiZGVzdHJveSIsInNldFRleHRJblJhbmdlIiwiZGVsZXRlTGFzdE5ld2xpbmUiLCJnZXRMYXN0TGluZSIsImRlbGV0ZVJvdyIsImdldExhc3RSb3ciLCJhZG9wdCIsIm9yaWdpbmFsIiwiZ2V0VGV4dCIsIm9yaWdpbmFsTWFya2VyIiwiZ2V0TWFya2VycyIsImluc3BlY3QiLCJsYXllck5hbWVzIiwiaW5zcGVjdFN0cmluZyIsImluY3JlYXNpbmdNYXJrZXJzIiwibWFya2VyIiwicG9pbnQiLCJpZCIsInNvcnQiLCJhIiwiYiIsImNtcCIsImNvbXBhcmUiLCJpbnNwZWN0UG9pbnQiLCJjbGlwcGVkIiwiY2xpcFBvc2l0aW9uIiwic3RhcnRQb2ludCIsImNvcHkiLCJtYXJrZXJCbHVlcHJpbnRzIiwibWFya2VyTWFwQ2FsbGJhY2tzIiwibWFya2Vyc0JlZm9yZSIsIm1hcmtlcnNBZnRlciIsImtlZXBCZWZvcmUiLCJtYXJrZXJzIiwiYWRkIiwia2VlcEFmdGVyIiwibWFya1doaWxlIiwiYmxvY2siLCJtYXJrZXJPcHRzIiwiaW5zZXJ0IiwidGV4dCIsImluc2VydGVkUmFuZ2UiLCJpbnNlcnRNYXJrZWQiLCJpbnNlcnRQYXRjaEJ1ZmZlciIsInN1YlBhdGNoQnVmZmVyIiwic3ViTWFya2VyTWFwIiwiY2FsbGJhY2siLCJhcHBseSIsImJlZm9yZU1hcmtlciIsImlzRW1wdHkiLCJpc1JldmVyc2VkIiwic2V0SGVhZFBvc2l0aW9uIiwic2V0VGFpbFBvc2l0aW9uIiwiYWZ0ZXJNYXJrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsV0FBVyxHQUFHLENBQUMsV0FBRCxFQUFjLFVBQWQsRUFBMEIsVUFBMUIsRUFBc0MsV0FBdEMsRUFBbUQsTUFBbkQsRUFBMkQsT0FBM0QsQ0FBcEI7O0FBRWUsTUFBTUMsV0FBTixDQUFrQjtBQUMvQkMsRUFBQUEsV0FBVyxHQUFHO0FBQ1osU0FBS0MsTUFBTCxHQUFjLElBQUlDLGdC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QUEsV0FBVyxDQUFDRixlQUFaLENBQTRCLEtBQUtoRyxjQUFqQztBQUNEO0FBQ0YsT0FMRCxNQUtPO0FBQ0xrRyxRQUFBQSxXQUFXLENBQUNGLGVBQVosQ0FBNEIsS0FBS2hHLGNBQWpDOztBQUNBLFlBQUk4RixPQUFKLEVBQWE7QUFDWEksVUFBQUEsV0FBVyxDQUFDRCxlQUFaLENBQTRCLEtBQUtqRyxjQUFqQztBQUNEO0FBQ0Y7QUFDRjtBQUNGOztBQXhIWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VGV4dEJ1ZmZlciwgUmFuZ2UsIFBvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCB7aW5zcGVjdH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IExBWUVSX05BTUVTID0gWyd1bmNoYW5nZWQnLCAnYWRkaXRpb24nLCAnZGVsZXRpb24nLCAnbm9uZXdsaW5lJywgJ2h1bmsnLCAncGF0Y2gnXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0Y2hCdWZmZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5idWZmZXIucmV0YWluKCk7XG5cbiAgICB0aGlzLmxheWVycyA9IExBWUVSX05BTUVTLnJlZHVjZSgobWFwLCBsYXllck5hbWUpID0+IHtcbiAgICAgIG1hcFtsYXllck5hbWVdID0gdGhpcy5idWZmZXIuYWRkTWFya2VyTGF5ZXIoKTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfSwge30pO1xuICB9XG5cbiAgZ2V0QnVmZmVyKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlcjtcbiAgfVxuXG4gIGdldEluc2VydGlvblBvaW50KCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5nZXRFbmRQb3NpdGlvbigpO1xuICB9XG5cbiAgZ2V0TGF5ZXIobGF5ZXJOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5ZXJzW2xheWVyTmFtZV07XG4gIH1cblxuICBmaW5kTWFya2VycyhsYXllck5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5sYXllcnNbbGF5ZXJOYW1lXS5maW5kTWFya2VycyguLi5hcmdzKTtcbiAgfVxuXG4gIGZpbmRBbGxNYXJrZXJzKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gTEFZRVJfTkFNRVMucmVkdWNlKChhcnIsIGxheWVyTmFtZSkgPT4ge1xuICAgICAgYXJyLnB1c2goLi4udGhpcy5maW5kTWFya2VycyhsYXllck5hbWUsIC4uLmFyZ3MpKTtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgbWFya1Bvc2l0aW9uKGxheWVyTmFtZSwgLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmxheWVyc1tsYXllck5hbWVdLm1hcmtQb3NpdGlvbiguLi5hcmdzKTtcbiAgfVxuXG4gIG1hcmtSYW5nZShsYXllck5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5sYXllcnNbbGF5ZXJOYW1lXS5tYXJrUmFuZ2UoLi4uYXJncyk7XG4gIH1cblxuICBjbGVhckFsbExheWVycygpIHtcbiAgICBmb3IgKGNvbnN0IGxheWVyTmFtZSBvZiBMQVlFUl9OQU1FUykge1xuICAgICAgdGhpcy5sYXllcnNbbGF5ZXJOYW1lXS5jbGVhcigpO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUluc2VydGVyQXQoaW5zZXJ0aW9uUG9pbnQpIHtcbiAgICByZXR1cm4gbmV3IEluc2VydGVyKHRoaXMsIFBvaW50LmZyb21PYmplY3QoaW5zZXJ0aW9uUG9pbnQpKTtcbiAgfVxuXG4gIGNyZWF0ZUluc2VydGVyQXRFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlSW5zZXJ0ZXJBdCh0aGlzLmdldEluc2VydGlvblBvaW50KCkpO1xuICB9XG5cbiAgY3JlYXRlU3ViQnVmZmVyKHJhbmdlTGlrZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgIGV4Y2x1ZGU6IG5ldyBTZXQoKSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZUxpa2UpO1xuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSByYW5nZS5zdGFydC5uZWdhdGUoKTtcbiAgICBjb25zdCBpbmNsdWRlZE1hcmtlcnNCeUxheWVyID0gTEFZRVJfTkFNRVMucmVkdWNlKChtYXAsIGxheWVyTmFtZSkgPT4ge1xuICAgICAgbWFwW2xheWVyTmFtZV0gPSB0aGlzLmxheWVyc1tsYXllck5hbWVdXG4gICAgICAgIC5maW5kTWFya2Vycyh7aW50ZXJzZWN0c1JhbmdlOiByYW5nZX0pXG4gICAgICAgIC5maWx0ZXIobSA9PiAhb3B0cy5leGNsdWRlLmhhcyhtKSk7XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH0sIHt9KTtcbiAgICBjb25zdCBtYXJrZXJNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdCBzdWJCdWZmZXIgPSBuZXcgUGF0Y2hCdWZmZXIoKTtcbiAgICBzdWJCdWZmZXIuZ2V0QnVmZmVyKCkuc2V0VGV4dCh0aGlzLmJ1ZmZlci5nZXRUZXh0SW5SYW5nZShyYW5nZSkpO1xuXG4gICAgZm9yIChjb25zdCBsYXllck5hbWUgb2YgTEFZRVJfTkFNRVMpIHtcbiAgICAgIGZvciAoY29uc3Qgb2xkTWFya2VyIG9mIGluY2x1ZGVkTWFya2Vyc0J5TGF5ZXJbbGF5ZXJOYW1lXSkge1xuICAgICAgICBjb25zdCBvbGRSYW5nZSA9IG9sZE1hcmtlci5nZXRSYW5nZSgpO1xuXG4gICAgICAgIGNvbnN0IGNsaXBwZWRTdGFydCA9IG9sZFJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHJhbmdlLnN0YXJ0KSA/IHJhbmdlLnN0YXJ0IDogb2xkUmFuZ2Uuc3RhcnQ7XG4gICAgICAgIGNvbnN0IGNsaXBwZWRFbmQgPSBvbGRSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocmFuZ2UuZW5kKSA/IHJhbmdlLmVuZCA6IG9sZFJhbmdlLmVuZDtcblxuICAgICAgICAvLyBFeGNsdWRlIG5vbi1lbXB0eSBtYXJrZXJzIHRoYXQgaW50ZXJzZWN0ICpvbmx5KiBhdCB0aGUgcmFuZ2Ugc3RhcnQgb3IgZW5kXG4gICAgICAgIGlmIChjbGlwcGVkU3RhcnQuaXNFcXVhbChjbGlwcGVkRW5kKSAmJiAhb2xkUmFuZ2Uuc3RhcnQuaXNFcXVhbChvbGRSYW5nZS5lbmQpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGFydE9mZnNldCA9IGNsaXBwZWRTdGFydC5yb3cgPT09IHJhbmdlLnN0YXJ0LnJvdyA/IGJhc2VPZmZzZXQgOiBbYmFzZU9mZnNldC5yb3csIDBdO1xuICAgICAgICBjb25zdCBlbmRPZmZzZXQgPSBjbGlwcGVkRW5kLnJvdyA9PT0gcmFuZ2Uuc3RhcnQucm93ID8gYmFzZU9mZnNldCA6IFtiYXNlT2Zmc2V0LnJvdywgMF07XG5cbiAgICAgICAgY29uc3QgbmV3TWFya2VyID0gc3ViQnVmZmVyLm1hcmtSYW5nZShcbiAgICAgICAgICBsYXllck5hbWUsXG4gICAgICAgICAgW2NsaXBwZWRTdGFydC50cmFuc2xhdGUoc3RhcnRPZmZzZXQpLCBjbGlwcGVkRW5kLnRyYW5zbGF0ZShlbmRPZmZzZXQpXSxcbiAgICAgICAgICBvbGRNYXJrZXIuZ2V0UHJvcGVydGllcygpLFxuICAgICAgICApO1xuICAgICAgICBtYXJrZXJNYXAuc2V0KG9sZE1hcmtlciwgbmV3TWFya2VyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge3BhdGNoQnVmZmVyOiBzdWJCdWZmZXIsIG1hcmtlck1hcH07XG4gIH1cblxuICBleHRyYWN0UGF0Y2hCdWZmZXIocmFuZ2VMaWtlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7cGF0Y2hCdWZmZXI6IHN1YkJ1ZmZlciwgbWFya2VyTWFwfSA9IHRoaXMuY3JlYXRlU3ViQnVmZmVyKHJhbmdlTGlrZSwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKGNvbnN0IG9sZE1hcmtlciBvZiBtYXJrZXJNYXAua2V5cygpKSB7XG4gICAgICBvbGRNYXJrZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyLnNldFRleHRJblJhbmdlKHJhbmdlTGlrZSwgJycpO1xuICAgIHJldHVybiB7cGF0Y2hCdWZmZXI6IHN1YkJ1ZmZlciwgbWFya2VyTWFwfTtcbiAgfVxuXG4gIGRlbGV0ZUxhc3ROZXdsaW5lKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlci5nZXRMYXN0TGluZSgpID09PSAnJykge1xuICAgICAgdGhpcy5idWZmZXIuZGVsZXRlUm93KHRoaXMuYnVmZmVyLmdldExhc3RSb3coKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZG9wdChvcmlnaW5hbCkge1xuICAgIHRoaXMuY2xlYXJBbGxMYXllcnMoKTtcbiAgICB0aGlzLmJ1ZmZlci5zZXRUZXh0KG9yaWdpbmFsLmdldEJ1ZmZlcigpLmdldFRleHQoKSk7XG5cbiAgICBjb25zdCBtYXJrZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBsYXllck5hbWUgb2YgTEFZRVJfTkFNRVMpIHtcbiAgICAgIGZvciAoY29uc3Qgb3JpZ2luYWxNYXJrZXIgb2Ygb3JpZ2luYWwuZ2V0TGF5ZXIobGF5ZXJOYW1lKS5nZXRNYXJrZXJzKCkpIHtcbiAgICAgICAgY29uc3QgbmV3TWFya2VyID0gdGhpcy5tYXJrUmFuZ2UobGF5ZXJOYW1lLCBvcmlnaW5hbE1hcmtlci5nZXRSYW5nZSgpLCBvcmlnaW5hbE1hcmtlci5nZXRQcm9wZXJ0aWVzKCkpO1xuICAgICAgICBtYXJrZXJNYXAuc2V0KG9yaWdpbmFsTWFya2VyLCBuZXdNYXJrZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFya2VyTWFwO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaW5zcGVjdChvcHRzID0ge30pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBsYXllck5hbWVzOiBMQVlFUl9OQU1FUyxcbiAgICAgIC4uLm9wdHMsXG4gICAgfTtcblxuICAgIGxldCBpbnNwZWN0U3RyaW5nID0gJyc7XG5cbiAgICBjb25zdCBpbmNyZWFzaW5nTWFya2VycyA9IFtdO1xuICAgIGZvciAoY29uc3QgbGF5ZXJOYW1lIG9mIG9wdGlvbnMubGF5ZXJOYW1lcykge1xuICAgICAgZm9yIChjb25zdCBtYXJrZXIgb2YgdGhpcy5maW5kTWFya2VycyhsYXllck5hbWUsIHt9KSkge1xuICAgICAgICBpbmNyZWFzaW5nTWFya2Vycy5wdXNoKHtsYXllck5hbWUsIHBvaW50OiBtYXJrZXIuZ2V0UmFuZ2UoKS5zdGFydCwgc3RhcnQ6IHRydWUsIGlkOiBtYXJrZXIuaWR9KTtcbiAgICAgICAgaW5jcmVhc2luZ01hcmtlcnMucHVzaCh7bGF5ZXJOYW1lLCBwb2ludDogbWFya2VyLmdldFJhbmdlKCkuZW5kLCBlbmQ6IHRydWUsIGlkOiBtYXJrZXIuaWR9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5jcmVhc2luZ01hcmtlcnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgY21wID0gYS5wb2ludC5jb21wYXJlKGIucG9pbnQpO1xuICAgICAgaWYgKGNtcCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gY21wO1xuICAgICAgfSBlbHNlIGlmIChhLnN0YXJ0ICYmIGIuc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2UgaWYgKGEuc3RhcnQgJiYgIWIuc3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmICghYS5zdGFydCAmJiBiLnN0YXJ0KSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgaW5zcGVjdFBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChbMCwgMF0pO1xuICAgIGZvciAoY29uc3QgbWFya2VyIG9mIGluY3JlYXNpbmdNYXJrZXJzKSB7XG4gICAgICBpZiAoIW1hcmtlci5wb2ludC5pc0VxdWFsKGluc3BlY3RQb2ludCkpIHtcbiAgICAgICAgaW5zcGVjdFN0cmluZyArPSBpbnNwZWN0KHRoaXMuYnVmZmVyLmdldFRleHRJblJhbmdlKFtpbnNwZWN0UG9pbnQsIG1hcmtlci5wb2ludF0pKSArICdcXG4nO1xuICAgICAgfVxuXG4gICAgICBpZiAobWFya2VyLnN0YXJ0KSB7XG4gICAgICAgIGluc3BlY3RTdHJpbmcgKz0gYCAgc3RhcnQgJHttYXJrZXIubGF5ZXJOYW1lfUAke21hcmtlci5pZH1cXG5gO1xuICAgICAgfSBlbHNlIGlmIChtYXJrZXIuZW5kKSB7XG4gICAgICAgIGluc3BlY3RTdHJpbmcgKz0gYCAgZW5kICR7bWFya2VyLmxheWVyTmFtZX1AJHttYXJrZXIuaWR9XFxuYDtcbiAgICAgIH1cblxuICAgICAgaW5zcGVjdFBvaW50ID0gbWFya2VyLnBvaW50O1xuICAgIH1cblxuICAgIHJldHVybiBpbnNwZWN0U3RyaW5nO1xuICB9XG59XG5cbmNsYXNzIEluc2VydGVyIHtcbiAgY29uc3RydWN0b3IocGF0Y2hCdWZmZXIsIGluc2VydGlvblBvaW50KSB7XG4gICAgY29uc3QgY2xpcHBlZCA9IHBhdGNoQnVmZmVyLmdldEJ1ZmZlcigpLmNsaXBQb3NpdGlvbihpbnNlcnRpb25Qb2ludCk7XG5cbiAgICB0aGlzLnBhdGNoQnVmZmVyID0gcGF0Y2hCdWZmZXI7XG4gICAgdGhpcy5zdGFydFBvaW50ID0gY2xpcHBlZC5jb3B5KCk7XG4gICAgdGhpcy5pbnNlcnRpb25Qb2ludCA9IGNsaXBwZWQuY29weSgpO1xuICAgIHRoaXMubWFya2VyQmx1ZXByaW50cyA9IFtdO1xuICAgIHRoaXMubWFya2VyTWFwQ2FsbGJhY2tzID0gW107XG5cbiAgICB0aGlzLm1hcmtlcnNCZWZvcmUgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5tYXJrZXJzQWZ0ZXIgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBrZWVwQmVmb3JlKG1hcmtlcnMpIHtcbiAgICBmb3IgKGNvbnN0IG1hcmtlciBvZiBtYXJrZXJzKSB7XG4gICAgICBpZiAobWFya2VyLmdldFJhbmdlKCkuZW5kLmlzRXF1YWwodGhpcy5zdGFydFBvaW50KSkge1xuICAgICAgICB0aGlzLm1hcmtlcnNCZWZvcmUuYWRkKG1hcmtlcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAga2VlcEFmdGVyKG1hcmtlcnMpIHtcbiAgICBmb3IgKGNvbnN0IG1hcmtlciBvZiBtYXJrZXJzKSB7XG4gICAgICBpZiAobWFya2VyLmdldFJhbmdlKCkuc3RhcnQuaXNFcXVhbCh0aGlzLnN0YXJ0UG9pbnQpKSB7XG4gICAgICAgIHRoaXMubWFya2Vyc0FmdGVyLmFkZChtYXJrZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG1hcmtXaGlsZShsYXllck5hbWUsIGJsb2NrLCBtYXJrZXJPcHRzKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmluc2VydGlvblBvaW50LmNvcHkoKTtcbiAgICBibG9jaygpO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMuaW5zZXJ0aW9uUG9pbnQuY29weSgpO1xuICAgIHRoaXMubWFya2VyQmx1ZXByaW50cy5wdXNoKHtsYXllck5hbWUsIHJhbmdlOiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZCksIG1hcmtlck9wdHN9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGluc2VydCh0ZXh0KSB7XG4gICAgY29uc3QgaW5zZXJ0ZWRSYW5nZSA9IHRoaXMucGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCkuaW5zZXJ0KHRoaXMuaW5zZXJ0aW9uUG9pbnQsIHRleHQpO1xuICAgIHRoaXMuaW5zZXJ0aW9uUG9pbnQgPSBpbnNlcnRlZFJhbmdlLmVuZDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGluc2VydE1hcmtlZCh0ZXh0LCBsYXllck5hbWUsIG1hcmtlck9wdHMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXJrV2hpbGUobGF5ZXJOYW1lLCAoKSA9PiB0aGlzLmluc2VydCh0ZXh0KSwgbWFya2VyT3B0cyk7XG4gIH1cblxuICBpbnNlcnRQYXRjaEJ1ZmZlcihzdWJQYXRjaEJ1ZmZlciwgb3B0cykge1xuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSB0aGlzLmluc2VydGlvblBvaW50LmNvcHkoKTtcbiAgICB0aGlzLmluc2VydChzdWJQYXRjaEJ1ZmZlci5nZXRCdWZmZXIoKS5nZXRUZXh0KCkpO1xuXG4gICAgY29uc3Qgc3ViTWFya2VyTWFwID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgbGF5ZXJOYW1lIG9mIExBWUVSX05BTUVTKSB7XG4gICAgICBmb3IgKGNvbnN0IG9sZE1hcmtlciBvZiBzdWJQYXRjaEJ1ZmZlci5maW5kTWFya2VycyhsYXllck5hbWUsIHt9KSkge1xuICAgICAgICBjb25zdCBzdGFydE9mZnNldCA9IG9sZE1hcmtlci5nZXRSYW5nZSgpLnN0YXJ0LnJvdyA9PT0gMCA/IGJhc2VPZmZzZXQgOiBbYmFzZU9mZnNldC5yb3csIDBdO1xuICAgICAgICBjb25zdCBlbmRPZmZzZXQgPSBvbGRNYXJrZXIuZ2V0UmFuZ2UoKS5lbmQucm93ID09PSAwID8gYmFzZU9mZnNldCA6IFtiYXNlT2Zmc2V0LnJvdywgMF07XG5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSBvbGRNYXJrZXIuZ2V0UmFuZ2UoKS50cmFuc2xhdGUoc3RhcnRPZmZzZXQsIGVuZE9mZnNldCk7XG4gICAgICAgIGNvbnN0IG1hcmtlck9wdHMgPSB7XG4gICAgICAgICAgLi4ub2xkTWFya2VyLmdldFByb3BlcnRpZXMoKSxcbiAgICAgICAgICBjYWxsYmFjazogbmV3TWFya2VyID0+IHsgc3ViTWFya2VyTWFwLnNldChvbGRNYXJrZXIsIG5ld01hcmtlcik7IH0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWFya2VyQmx1ZXByaW50cy5wdXNoKHtsYXllck5hbWUsIHJhbmdlLCBtYXJrZXJPcHRzfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tYXJrZXJNYXBDYWxsYmFja3MucHVzaCh7bWFya2VyTWFwOiBzdWJNYXJrZXJNYXAsIGNhbGxiYWNrOiBvcHRzLmNhbGxiYWNrfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFwcGx5KCkge1xuICAgIGZvciAoY29uc3Qge2xheWVyTmFtZSwgcmFuZ2UsIG1hcmtlck9wdHN9IG9mIHRoaXMubWFya2VyQmx1ZXByaW50cykge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSBtYXJrZXJPcHRzLmNhbGxiYWNrO1xuICAgICAgZGVsZXRlIG1hcmtlck9wdHMuY2FsbGJhY2s7XG5cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGF0Y2hCdWZmZXIubWFya1JhbmdlKGxheWVyTmFtZSwgcmFuZ2UsIG1hcmtlck9wdHMpO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG1hcmtlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB7bWFya2VyTWFwLCBjYWxsYmFja30gb2YgdGhpcy5tYXJrZXJNYXBDYWxsYmFja3MpIHtcbiAgICAgIGNhbGxiYWNrKG1hcmtlck1hcCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBiZWZvcmVNYXJrZXIgb2YgdGhpcy5tYXJrZXJzQmVmb3JlKSB7XG4gICAgICBjb25zdCBpc0VtcHR5ID0gYmVmb3JlTWFya2VyLmdldFJhbmdlKCkuaXNFbXB0eSgpO1xuXG4gICAgICBpZiAoIWJlZm9yZU1hcmtlci5pc1JldmVyc2VkKCkpIHtcbiAgICAgICAgYmVmb3JlTWFya2VyLnNldEhlYWRQb3NpdGlvbih0aGlzLnN0YXJ0UG9pbnQpO1xuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGJlZm9yZU1hcmtlci5zZXRUYWlsUG9zaXRpb24odGhpcy5zdGFydFBvaW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVmb3JlTWFya2VyLnNldFRhaWxQb3NpdGlvbih0aGlzLnN0YXJ0UG9pbnQpO1xuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGJlZm9yZU1hcmtlci5zZXRIZWFkUG9zaXRpb24odGhpcy5zdGFydFBvaW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYWZ0ZXJNYXJrZXIgb2YgdGhpcy5tYXJrZXJzQWZ0ZXIpIHtcbiAgICAgIGNvbnN0IGlzRW1wdHkgPSBhZnRlck1hcmtlci5nZXRSYW5nZSgpLmlzRW1wdHkoKTtcblxuICAgICAgaWYgKCFhZnRlck1hcmtlci5pc1JldmVyc2VkKCkpIHtcbiAgICAgICAgYWZ0ZXJNYXJrZXIuc2V0VGFpbFBvc2l0aW9uKHRoaXMuaW5zZXJ0aW9uUG9pbnQpO1xuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGFmdGVyTWFya2VyLnNldEhlYWRQb3NpdGlvbih0aGlzLmluc2VydGlvblBvaW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWZ0ZXJNYXJrZXIuc2V0SGVhZFBvc2l0aW9uKHRoaXMuaW5zZXJ0aW9uUG9pbnQpO1xuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIGFmdGVyTWFya2VyLnNldFRhaWxQb3NpdGlvbih0aGlzLmluc2VydGlvblBvaW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19