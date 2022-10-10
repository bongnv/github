"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _propTypes2 = require("../prop-types");

var _commitPreviewContainer = _interopRequireDefault(require("../containers/commit-preview-container"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommitPreviewItem extends _react.default.Component {
  static buildURI(workingDirectory) {
    return `atom-github://commit-preview?workdir=${encodeURIComponent(workingDirectory)}`;
  }

  constructor(props) {
    super(props);

    _defineProperty(this, "destroy", () => {
      /* istanbul ignore else */
      if (!this.isDestroyed) {
        this.emitter.emit('did-destroy');
        this.isDestroyed = true;
      }
    });

    this.emitter = new _eventKit.Emitter();
    this.isDestroyed = false;
    this.hasTerminatedPendingState = false;
    this.refInitialFocus = new _refHolder.default();
    this.refEditor = new _refHolder.default();
    this.refEditor.observe(editor => {
      if (editor.isAlive()) {
        this.emitter.emit('did-change-embedded-text-editor', editor);
      }
    });
  }

  terminatePendingState() {
    if (!this.hasTerminatedPendingState) {
      this.emitter.emit('did-terminate-pending-state');
      this.hasTerminatedPendingState = true;
    }
  }

  onDidTerminatePendingState(callback) {
    return this.emitter.on('did-terminate-pending-state', callback);
  }

  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback);
  }

  render() {
    const repository = this.props.workdirContextPool.getContext(this.props.workingDirectory).getRepository();
    return _react.default.createElement(_commitPreviewContainer.default, _extends({
      itemType: this.constructor,
      repository: repository
    }, this.props, {
      destroy: this.destroy,
      refEditor: this.refEditor,
      refInitialFocus: this.refInitialFocus
    }));
  }

  getTitle() {
    return 'Staged Changes';
  }

  getIconName() {
    return 'tasklist';
  }

  observeEmbeddedTextEditor(cb) {
    this.refEditor.map(editor => editor.isAlive() && cb(editor));
    return this.emitter.on('did-change-embedded-text-editor', cb);
  }

  getWorkingDirectory() {
    return this.props.workingDirectory;
  }

  serialize() {
    return {
      deserializer: 'CommitPreviewStub',
      uri: CommitPreviewItem.buildURI(this.props.workingDirectory)
    };
  }

  focus() {
    this.refInitialFocus.map(focusable => focusable.focus());
  }

}

exports.default = CommitPreviewItem;

_defineProperty(CommitPreviewItem, "propTypes", {
  workdirContextPool: _propTypes2.WorkdirContextPoolPropType.isRequired,
  workingDirectory: _propTypes.default.string.isRequired,
  discardLines: _propTypes.default.func.isRequired,
  undoLastDiscard: _propTypes.default.func.isRequired,
  surfaceToCommitPreviewButton: _propTypes.default.func.isRequired
});

_defineProperty(CommitPreviewItem, "uriPattern", 'atom-github://commit-preview?workdir={workingDirectory}');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9pdGVtcy9jb21taXQtcHJldmlldy1pdGVtLmpzIl0sIm5hbWVzIjpbIkNvbW1pdFByZXZpZXdJdGVtIiwiUmVhY3QiLCJDb21wb25lbnQiLCJidWlsZFVSSSIsIndvcmtpbmdEaXJlY3RvcnkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiaXNEZXN0cm95ZWQiLCJlbWl0dGVyIiwiZW1pdCIsIkVtaXR0ZXIiLCJoYXNUZXJtaW5hdGVkUGVuZGluZ1N0YXRlIiwicmVmSW5pdGlhbEZvY3VzIiwiUmVmSG9sZGVyIiwicmVmRWRpdG9yIiwib2JzZXJ2ZSIsImVkaXRvciIsImlzQWxpdmUiLCJ0ZXJtaW5hdGVQZW5kaW5nU3RhdGUiLCJvbkRpZFRlcm1pbmF0ZVBlbmRpbmdTdGF0ZSIsImNhbGxiYWNrIiwib24iLCJvbkRpZERlc3Ryb3kiLCJyZW5kZXIiLCJyZXBvc2l0b3J5Iiwid29ya2RpckNvbnRleHRQb29sIiwiZ2V0Q29udGV4dCIsImdldFJlcG9zaXRvcnkiLCJkZXN0cm95IiwiZ2V0VGl0bGUiLCJnZXRJY29uTmFtZSIsIm9ic2VydmVFbWJlZGRlZFRleHRFZGl0b3IiLCJjYiIsIm1hcCIsImdldFdvcmtpbmdEaXJlY3RvcnkiLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZXIiLCJ1cmkiLCJmb2N1cyIsImZvY3VzYWJsZSIsIldvcmtkaXJDb250ZXh0UG9vbFByb3BUeXBlIiwiaXNSZXF1aXJlZCIsIlByb3BUeXBlcyIsInN0cmluZyIsImRpc2NhcmRMaW5lcyIsImZ1bmMiLCJ1bmRvTGFzdERpc2NhcmQiLCJzdXJmYWNlVG9Db21taXRQcmV2aWV3QnV0dG9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRWUsTUFBTUEsaUJBQU4sU0FBZ0NDLGVBQU1DLFNBQXRDLENBQWdEO0FBWTdELFNBQU9DLFFBQVAsQ0FBZ0JDLGdCQUFoQixFQUFrQztBQUNoQyxXQUFRLHdDQUF1Q0Msa0JBQWtCLENBQUNELGdCQUFELENBQW1CLEVBQXBGO0FBQ0Q7O0FBRURFLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47O0FBRGlCLHFDQTJCVCxNQUFNO0FBQ2Q7QUFDQSxVQUFJLENBQUMsS0FBS0MsV0FBVixFQUF1QjtBQUNyQixhQUFLQyxPQUFMLENBQWFDLElBQWIsQ0FBa0IsYUFBbEI7QUFDQSxhQUFLRixXQUFMLEdBQW1CLElBQW5CO0FBQ0Q7QUFDRixLQWpDa0I7O0FBR2pCLFNBQUtDLE9BQUwsR0FBZSxJQUFJRSxpQkFBSixFQUFmO0FBQ0EsU0FBS0gsV0FBTCxHQUFtQixLQUFuQjtBQUNBLFNBQUtJLHlCQUFMLEdBQWlDLEtBQWpDO0FBQ0EsU0FBS0MsZUFBTCxHQUF1QixJQUFJQyxrQkFBSixFQUF2QjtBQUVBLFNBQUtDLFNBQUwsR0FBaUIsSUFBSUQsa0JBQUosRUFBakI7QUFDQSxTQUFLQyxTQUFMLENBQWVDLE9BQWYsQ0FBdUJDLE1BQU0sSUFBSTtBQUMvQixVQUFJQSxNQUFNLENBQUNDLE9BQVAsRUFBSixFQUFzQjtBQUNwQixhQUFLVCxPQUFMLENBQWFDLElBQWIsQ0FBa0IsaUNBQWxCLEVBQXFETyxNQUFyRDtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQUVERSxFQUFBQSxxQkFBcUIsR0FBRztBQUN0QixRQUFJLENBQUMsS0FBS1AseUJBQVYsRUFBcUM7QUFDbkMsV0FBS0gsT0FBTCxDQUFhQyxJQUFiLENBQWtCLDZCQUFsQjtBQUNBLFdBQUtFLHlCQUFMLEdBQWlDLElBQWpDO0FBQ0Q7QUFDRjs7QUFFRFEsRUFBQUEsMEJBQTBCLENBQUNDLFFBQUQsRUFBVztBQUNuQyxXQUFPLEtBQUtaLE9BQUwsQ0FBYWEsRUFBYixDQUFnQiw2QkFBaEIsRUFBK0NELFFBQS9DLENBQVA7QUFDRDs7QUFVREUsRUFBQUEsWUFBWSxDQUFDRixRQUFELEVBQVc7QUFDckIsV0FBTyxLQUFLWixPQUFMLENBQWFhLEVBQWIsQ0FBZ0IsYUFBaEIsRUFBK0JELFFBQS9CLENBQVA7QUFDRDs7QUFFREcsRUFBQUEsTUFBTSxHQUFHO0FBQ1AsVUFBTUMsVUFBVSxHQUFHLEtBQUtsQixLQUFMLENBQVdtQixrQkFBWCxDQUE4QkMsVUFBOUIsQ0FBeUMsS0FBS3BCLEtBQUwsQ0FBV0gsZ0JBQXBELEVBQXNFd0IsYUFBdEUsRUFBbkI7QUFFQSxXQUNFLDZCQUFDLCtCQUFEO0FBQ0UsTUFBQSxRQUFRLEVBQUUsS0FBS3RCLFdBRGpCO0FBRUUsTUFBQSxVQUFVLEVBQUVtQjtBQUZkLE9BR00sS0FBS2xCLEtBSFg7QUFJRSxNQUFBLE9BQU8sRUFBRSxLQUFLc0IsT0FKaEI7QUFLRSxNQUFBLFNBQVMsRUFBRSxLQUFLZCxTQUxsQjtBQU1FLE1BQUEsZUFBZSxFQUFFLEtBQUtGO0FBTnhCLE9BREY7QUFVRDs7QUFFRGlCLEVBQUFBLFFBQVEsR0FBRztBQUNULFdBQU8sZ0JBQVA7QUFDRDs7QUFFREMsRUFBQUEsV0FBVyxHQUFHO0FBQ1osV0FBTyxVQUFQO0FBQ0Q7O0FBRURDLEVBQUFBLHlCQUF5QixDQUFDQyxFQUFELEVBQUs7QUFDNUIsU0FBS2xCLFNBQUwsQ0FBZW1CLEdBQWYsQ0FBbUJqQixNQUFNLElBQUlBLE1BQU0sQ0FBQ0MsT0FBUCxNQUFvQmUsRUFBRSxDQUFDaEIsTUFBRCxDQUFuRDtBQUNBLFdBQU8sS0FBS1IsT0FBTCxDQUFhYSxFQUFiLENBQWdCLGlDQUFoQixFQUFtRFcsRUFBbkQsQ0FBUDtBQUNEOztBQUVERSxFQUFBQSxtQkFBbUIsR0FBRztBQUNwQixXQUFPLEtBQUs1QixLQUFMLENBQVdILGdCQUFsQjtBQUNEOztBQUVEZ0MsRUFBQUEsU0FBUyxHQUFHO0FBQ1YsV0FBTztBQUNMQyxNQUFBQSxZQUFZLEVBQUUsbUJBRFQ7QUFFTEMsTUFBQUEsR0FBRyxFQUFFdEMsaUJBQWlCLENBQUNHLFFBQWxCLENBQTJCLEtBQUtJLEtBQUwsQ0FBV0gsZ0JBQXRDO0FBRkEsS0FBUDtBQUlEOztBQUVEbUMsRUFBQUEsS0FBSyxHQUFHO0FBQ04sU0FBSzFCLGVBQUwsQ0FBcUJxQixHQUFyQixDQUF5Qk0sU0FBUyxJQUFJQSxTQUFTLENBQUNELEtBQVYsRUFBdEM7QUFDRDs7QUFoRzREOzs7O2dCQUExQ3ZDLGlCLGVBQ0E7QUFDakIwQixFQUFBQSxrQkFBa0IsRUFBRWUsdUNBQTJCQyxVQUQ5QjtBQUVqQnRDLEVBQUFBLGdCQUFnQixFQUFFdUMsbUJBQVVDLE1BQVYsQ0FBaUJGLFVBRmxCO0FBSWpCRyxFQUFBQSxZQUFZLEVBQUVGLG1CQUFVRyxJQUFWLENBQWVKLFVBSlo7QUFLakJLLEVBQUFBLGVBQWUsRUFBRUosbUJBQVVHLElBQVYsQ0FBZUosVUFMZjtBQU1qQk0sRUFBQUEsNEJBQTRCLEVBQUVMLG1CQUFVRyxJQUFWLENBQWVKO0FBTjVCLEM7O2dCQURBMUMsaUIsZ0JBVUMseUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnZXZlbnQta2l0JztcblxuaW1wb3J0IHtXb3JrZGlyQ29udGV4dFBvb2xQcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgQ29tbWl0UHJldmlld0NvbnRhaW5lciBmcm9tICcuLi9jb250YWluZXJzL2NvbW1pdC1wcmV2aWV3LWNvbnRhaW5lcic7XG5pbXBvcnQgUmVmSG9sZGVyIGZyb20gJy4uL21vZGVscy9yZWYtaG9sZGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWl0UHJldmlld0l0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHdvcmtkaXJDb250ZXh0UG9vbDogV29ya2RpckNvbnRleHRQb29sUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cbiAgICBkaXNjYXJkTGluZXM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdW5kb0xhc3REaXNjYXJkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHN1cmZhY2VUb0NvbW1pdFByZXZpZXdCdXR0b246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0aWMgdXJpUGF0dGVybiA9ICdhdG9tLWdpdGh1YjovL2NvbW1pdC1wcmV2aWV3P3dvcmtkaXI9e3dvcmtpbmdEaXJlY3Rvcnl9J1xuXG4gIHN0YXRpYyBidWlsZFVSSSh3b3JraW5nRGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIGBhdG9tLWdpdGh1YjovL2NvbW1pdC1wcmV2aWV3P3dvcmtkaXI9JHtlbmNvZGVVUklDb21wb25lbnQod29ya2luZ0RpcmVjdG9yeSl9YDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLmlzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5oYXNUZXJtaW5hdGVkUGVuZGluZ1N0YXRlID0gZmFsc2U7XG4gICAgdGhpcy5yZWZJbml0aWFsRm9jdXMgPSBuZXcgUmVmSG9sZGVyKCk7XG5cbiAgICB0aGlzLnJlZkVkaXRvciA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkVkaXRvci5vYnNlcnZlKGVkaXRvciA9PiB7XG4gICAgICBpZiAoZWRpdG9yLmlzQWxpdmUoKSkge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1lbWJlZGRlZC10ZXh0LWVkaXRvcicsIGVkaXRvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB0ZXJtaW5hdGVQZW5kaW5nU3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Rlcm1pbmF0ZWRQZW5kaW5nU3RhdGUpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdGVybWluYXRlLXBlbmRpbmctc3RhdGUnKTtcbiAgICAgIHRoaXMuaGFzVGVybWluYXRlZFBlbmRpbmdTdGF0ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgb25EaWRUZXJtaW5hdGVQZW5kaW5nU3RhdGUoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdGVybWluYXRlLXBlbmRpbmctc3RhdGUnLCBjYWxsYmFjayk7XG4gIH1cblxuICBkZXN0cm95ID0gKCkgPT4ge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKCF0aGlzLmlzRGVzdHJveWVkKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKTtcbiAgICAgIHRoaXMuaXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSB0aGlzLnByb3BzLndvcmtkaXJDb250ZXh0UG9vbC5nZXRDb250ZXh0KHRoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeSkuZ2V0UmVwb3NpdG9yeSgpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb21taXRQcmV2aWV3Q29udGFpbmVyXG4gICAgICAgIGl0ZW1UeXBlPXt0aGlzLmNvbnN0cnVjdG9yfVxuICAgICAgICByZXBvc2l0b3J5PXtyZXBvc2l0b3J5fVxuICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgZGVzdHJveT17dGhpcy5kZXN0cm95fVxuICAgICAgICByZWZFZGl0b3I9e3RoaXMucmVmRWRpdG9yfVxuICAgICAgICByZWZJbml0aWFsRm9jdXM9e3RoaXMucmVmSW5pdGlhbEZvY3VzfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdTdGFnZWQgQ2hhbmdlcyc7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpIHtcbiAgICByZXR1cm4gJ3Rhc2tsaXN0JztcbiAgfVxuXG4gIG9ic2VydmVFbWJlZGRlZFRleHRFZGl0b3IoY2IpIHtcbiAgICB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IGVkaXRvci5pc0FsaXZlKCkgJiYgY2IoZWRpdG9yKSk7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1lbWJlZGRlZC10ZXh0LWVkaXRvcicsIGNiKTtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnQ29tbWl0UHJldmlld1N0dWInLFxuICAgICAgdXJpOiBDb21taXRQcmV2aWV3SXRlbS5idWlsZFVSSSh0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnkpLFxuICAgIH07XG4gIH1cblxuICBmb2N1cygpIHtcbiAgICB0aGlzLnJlZkluaXRpYWxGb2N1cy5tYXAoZm9jdXNhYmxlID0+IGZvY3VzYWJsZS5mb2N1cygpKTtcbiAgfVxufVxuIl19