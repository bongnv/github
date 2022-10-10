"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _helpers = require("../helpers");

var _atomTextEditor = _interopRequireDefault(require("../atom/atom-text-editor"));

var _decoration = _interopRequireDefault(require("../atom/decoration"));

var _markerLayer = _interopRequireDefault(require("../atom/marker-layer"));

var _gutter = _interopRequireDefault(require("../atom/gutter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PatchPreviewView extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      lastPatch: null,
      lastFileName: null,
      lastDiffRow: null,
      lastMaxRowCount: null,
      previewPatchBuffer: null
    });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.multiFilePatch === state.lastPatch && props.fileName === state.lastFileName && props.diffRow === state.lastDiffRow && props.maxRowCount === state.lastMaxRowCount) {
      return null;
    }

    const nextPreviewPatchBuffer = props.multiFilePatch.getPreviewPatchBuffer(props.fileName, props.diffRow, props.maxRowCount);
    let previewPatchBuffer = null;

    if (state.previewPatchBuffer !== null) {
      state.previewPatchBuffer.adopt(nextPreviewPatchBuffer);
      previewPatchBuffer = state.previewPatchBuffer;
    } else {
      previewPatchBuffer = nextPreviewPatchBuffer;
    }

    return {
      lastPatch: props.multiFilePatch,
      lastFileName: props.fileName,
      lastDiffRow: props.diffRow,
      lastMaxRowCount: props.maxRowCount,
      previewPatchBuffer
    };
  }

  render() {
    return _react.default.createElement(_atomTextEditor.default, {
      buffer: this.state.previewPatchBuffer.getBuffer(),
      readOnly: true,
      lineNumberGutterVisible: false,
      autoHeight: true,
      autoWidth: false,
      softWrapped: false
    }, this.props.config.get('github.showDiffIconGutter') && _react.default.createElement(_gutter.default, {
      name: "diff-icons",
      priority: 1,
      type: "line-number",
      className: "icons",
      labelFn: _helpers.blankLabel
    }), this.renderLayerDecorations('addition', 'github-FilePatchView-line--added'), this.renderLayerDecorations('deletion', 'github-FilePatchView-line--deleted'));
  }

  renderLayerDecorations(layerName, className) {
    const layer = this.state.previewPatchBuffer.getLayer(layerName);

    if (layer.getMarkerCount() === 0) {
      return null;
    }

    return _react.default.createElement(_markerLayer.default, {
      external: layer
    }, _react.default.createElement(_decoration.default, {
      type: "line",
      className: className,
      omitEmptyLastRow: false
    }), this.props.config.get('github.showDiffIconGutter') && _react.default.createElement(_decoration.default, {
      type: "line-number",
      gutterName: "diff-icons",
      className: className,
      omitEmptyLastRow: false
    }));
  }

}

exports.default = PatchPreviewView;

_defineProperty(PatchPreviewView, "propTypes", {
  multiFilePatch: _propTypes.default.shape({
    getPreviewPatchBuffer: _propTypes.default.func.isRequired
  }).isRequired,
  fileName: _propTypes.default.string.isRequired,
  diffRow: _propTypes.default.number.isRequired,
  maxRowCount: _propTypes.default.number.isRequired,
  // Atom environment
  config: _propTypes.default.shape({
    get: _propTypes.default.func.isRequired
  })
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9wYXRjaC1wcmV2aWV3LXZpZXcuanMiXSwibmFtZXMiOlsiUGF0Y2hQcmV2aWV3VmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwibGFzdFBhdGNoIiwibGFzdEZpbGVOYW1lIiwibGFzdERpZmZSb3ciLCJsYXN0TWF4Um93Q291bnQiLCJwcmV2aWV3UGF0Y2hCdWZmZXIiLCJnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMiLCJwcm9wcyIsInN0YXRlIiwibXVsdGlGaWxlUGF0Y2giLCJmaWxlTmFtZSIsImRpZmZSb3ciLCJtYXhSb3dDb3VudCIsIm5leHRQcmV2aWV3UGF0Y2hCdWZmZXIiLCJnZXRQcmV2aWV3UGF0Y2hCdWZmZXIiLCJhZG9wdCIsInJlbmRlciIsImdldEJ1ZmZlciIsImNvbmZpZyIsImdldCIsImJsYW5rTGFiZWwiLCJyZW5kZXJMYXllckRlY29yYXRpb25zIiwibGF5ZXJOYW1lIiwiY2xhc3NOYW1lIiwibGF5ZXIiLCJnZXRMYXllciIsImdldE1hcmtlckNvdW50IiwiUHJvcFR5cGVzIiwic2hhcGUiLCJmdW5jIiwiaXNSZXF1aXJlZCIsInN0cmluZyIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxnQkFBTixTQUErQkMsZUFBTUMsU0FBckMsQ0FBK0M7QUFBQTtBQUFBOztBQUFBLG1DQWVwRDtBQUNOQyxNQUFBQSxTQUFTLEVBQUUsSUFETDtBQUVOQyxNQUFBQSxZQUFZLEVBQUUsSUFGUjtBQUdOQyxNQUFBQSxXQUFXLEVBQUUsSUFIUDtBQUlOQyxNQUFBQSxlQUFlLEVBQUUsSUFKWDtBQUtOQyxNQUFBQSxrQkFBa0IsRUFBRTtBQUxkLEtBZm9EO0FBQUE7O0FBdUI1RCxTQUFPQyx3QkFBUCxDQUFnQ0MsS0FBaEMsRUFBdUNDLEtBQXZDLEVBQThDO0FBQzVDLFFBQ0VELEtBQUssQ0FBQ0UsY0FBTixLQUF5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RUFBRTtBQUEvRixNQUhKLENBREY7QUFRRDs7QUF4RjJEOzs7O2dCQUF6Q3pCLGdCLGVBQ0E7QUFDakJXLEVBQUFBLGNBQWMsRUFBRWtCLG1CQUFVQyxLQUFWLENBQWdCO0FBQzlCZCxJQUFBQSxxQkFBcUIsRUFBRWEsbUJBQVVFLElBQVYsQ0FBZUM7QUFEUixHQUFoQixFQUViQSxVQUhjO0FBSWpCcEIsRUFBQUEsUUFBUSxFQUFFaUIsbUJBQVVJLE1BQVYsQ0FBaUJELFVBSlY7QUFLakJuQixFQUFBQSxPQUFPLEVBQUVnQixtQkFBVUssTUFBVixDQUFpQkYsVUFMVDtBQU1qQmxCLEVBQUFBLFdBQVcsRUFBRWUsbUJBQVVLLE1BQVYsQ0FBaUJGLFVBTmI7QUFRakI7QUFDQVosRUFBQUEsTUFBTSxFQUFFUyxtQkFBVUMsS0FBVixDQUFnQjtBQUN0QlQsSUFBQUEsR0FBRyxFQUFFUSxtQkFBVUUsSUFBVixDQUFlQztBQURFLEdBQWhCO0FBVFMsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQge2JsYW5rTGFiZWx9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IEF0b21UZXh0RWRpdG9yIGZyb20gJy4uL2F0b20vYXRvbS10ZXh0LWVkaXRvcic7XG5pbXBvcnQgRGVjb3JhdGlvbiBmcm9tICcuLi9hdG9tL2RlY29yYXRpb24nO1xuaW1wb3J0IE1hcmtlckxheWVyIGZyb20gJy4uL2F0b20vbWFya2VyLWxheWVyJztcbmltcG9ydCBHdXR0ZXIgZnJvbSAnLi4vYXRvbS9ndXR0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRjaFByZXZpZXdWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBtdWx0aUZpbGVQYXRjaDogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGdldFByZXZpZXdQYXRjaEJ1ZmZlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICAgIGZpbGVOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZGlmZlJvdzogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG1heFJvd0NvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgICAvLyBBdG9tIGVudmlyb25tZW50XG4gICAgY29uZmlnOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgZ2V0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH0pLFxuICB9XG5cbiAgc3RhdGUgPSB7XG4gICAgbGFzdFBhdGNoOiBudWxsLFxuICAgIGxhc3RGaWxlTmFtZTogbnVsbCxcbiAgICBsYXN0RGlmZlJvdzogbnVsbCxcbiAgICBsYXN0TWF4Um93Q291bnQ6IG51bGwsXG4gICAgcHJldmlld1BhdGNoQnVmZmVyOiBudWxsLFxuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wcywgc3RhdGUpIHtcbiAgICBpZiAoXG4gICAgICBwcm9wcy5tdWx0aUZpbGVQYXRjaCA9PT0gc3RhdGUubGFzdFBhdGNoICYmXG4gICAgICBwcm9wcy5maWxlTmFtZSA9PT0gc3RhdGUubGFzdEZpbGVOYW1lICYmXG4gICAgICBwcm9wcy5kaWZmUm93ID09PSBzdGF0ZS5sYXN0RGlmZlJvdyAmJlxuICAgICAgcHJvcHMubWF4Um93Q291bnQgPT09IHN0YXRlLmxhc3RNYXhSb3dDb3VudFxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbmV4dFByZXZpZXdQYXRjaEJ1ZmZlciA9IHByb3BzLm11bHRpRmlsZVBhdGNoLmdldFByZXZpZXdQYXRjaEJ1ZmZlcihcbiAgICAgIHByb3BzLmZpbGVOYW1lLCBwcm9wcy5kaWZmUm93LCBwcm9wcy5tYXhSb3dDb3VudCxcbiAgICApO1xuICAgIGxldCBwcmV2aWV3UGF0Y2hCdWZmZXIgPSBudWxsO1xuICAgIGlmIChzdGF0ZS5wcmV2aWV3UGF0Y2hCdWZmZXIgIT09IG51bGwpIHtcbiAgICAgIHN0YXRlLnByZXZpZXdQYXRjaEJ1ZmZlci5hZG9wdChuZXh0UHJldmlld1BhdGNoQnVmZmVyKTtcbiAgICAgIHByZXZpZXdQYXRjaEJ1ZmZlciA9IHN0YXRlLnByZXZpZXdQYXRjaEJ1ZmZlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlld1BhdGNoQnVmZmVyID0gbmV4dFByZXZpZXdQYXRjaEJ1ZmZlcjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFzdFBhdGNoOiBwcm9wcy5tdWx0aUZpbGVQYXRjaCxcbiAgICAgIGxhc3RGaWxlTmFtZTogcHJvcHMuZmlsZU5hbWUsXG4gICAgICBsYXN0RGlmZlJvdzogcHJvcHMuZGlmZlJvdyxcbiAgICAgIGxhc3RNYXhSb3dDb3VudDogcHJvcHMubWF4Um93Q291bnQsXG4gICAgICBwcmV2aWV3UGF0Y2hCdWZmZXIsXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgIGJ1ZmZlcj17dGhpcy5zdGF0ZS5wcmV2aWV3UGF0Y2hCdWZmZXIuZ2V0QnVmZmVyKCl9XG4gICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZT17ZmFsc2V9XG4gICAgICAgIGF1dG9IZWlnaHQ9e3RydWV9XG4gICAgICAgIGF1dG9XaWR0aD17ZmFsc2V9XG4gICAgICAgIHNvZnRXcmFwcGVkPXtmYWxzZX0+XG5cbiAgICAgICAge3RoaXMucHJvcHMuY29uZmlnLmdldCgnZ2l0aHViLnNob3dEaWZmSWNvbkd1dHRlcicpICYmIChcbiAgICAgICAgICA8R3V0dGVyIG5hbWU9XCJkaWZmLWljb25zXCIgcHJpb3JpdHk9ezF9IHR5cGU9XCJsaW5lLW51bWJlclwiIGNsYXNzTmFtZT1cImljb25zXCIgbGFiZWxGbj17YmxhbmtMYWJlbH0gLz5cbiAgICAgICAgKX1cblxuICAgICAgICB7dGhpcy5yZW5kZXJMYXllckRlY29yYXRpb25zKCdhZGRpdGlvbicsICdnaXRodWItRmlsZVBhdGNoVmlldy1saW5lLS1hZGRlZCcpfVxuICAgICAgICB7dGhpcy5yZW5kZXJMYXllckRlY29yYXRpb25zKCdkZWxldGlvbicsICdnaXRodWItRmlsZVBhdGNoVmlldy1saW5lLS1kZWxldGVkJyl9XG5cbiAgICAgIDwvQXRvbVRleHRFZGl0b3I+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckxheWVyRGVjb3JhdGlvbnMobGF5ZXJOYW1lLCBjbGFzc05hbWUpIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMuc3RhdGUucHJldmlld1BhdGNoQnVmZmVyLmdldExheWVyKGxheWVyTmFtZSk7XG4gICAgaWYgKGxheWVyLmdldE1hcmtlckNvdW50KCkgPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8TWFya2VyTGF5ZXIgZXh0ZXJuYWw9e2xheWVyfT5cbiAgICAgICAgPERlY29yYXRpb24gdHlwZT1cImxpbmVcIiBjbGFzc05hbWU9e2NsYXNzTmFtZX0gb21pdEVtcHR5TGFzdFJvdz17ZmFsc2V9IC8+XG4gICAgICAgIHt0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ2dpdGh1Yi5zaG93RGlmZkljb25HdXR0ZXInKSAmJiAoXG4gICAgICAgICAgPERlY29yYXRpb24gdHlwZT1cImxpbmUtbnVtYmVyXCIgZ3V0dGVyTmFtZT1cImRpZmYtaWNvbnNcIiBjbGFzc05hbWU9e2NsYXNzTmFtZX0gb21pdEVtcHR5TGFzdFJvdz17ZmFsc2V9IC8+XG4gICAgICAgICl9XG4gICAgICA8L01hcmtlckxheWVyPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==