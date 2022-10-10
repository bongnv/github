"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _propTypes2 = require("../prop-types");

var _commitDetailContainer = _interopRequireDefault(require("../containers/commit-detail-container"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommitDetailItem extends _react.default.Component {
  static buildURI(workingDirectory, sha) {
    return `atom-github://commit-detail?workdir=${encodeURIComponent(workingDirectory)}&sha=${encodeURIComponent(sha)}`;
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
    this.shouldFocus = true;
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
    return _react.default.createElement(_commitDetailContainer.default, _extends({
      itemType: this.constructor,
      repository: repository
    }, this.props, {
      destroy: this.destroy,
      refEditor: this.refEditor,
      refInitialFocus: this.refInitialFocus
    }));
  }

  getTitle() {
    return `Commit: ${this.props.sha}`;
  }

  getIconName() {
    return 'git-commit';
  }

  observeEmbeddedTextEditor(cb) {
    this.refEditor.map(editor => editor.isAlive() && cb(editor));
    return this.emitter.on('did-change-embedded-text-editor', cb);
  }

  getWorkingDirectory() {
    return this.props.workingDirectory;
  }

  getSha() {
    return this.props.sha;
  }

  serialize() {
    return {
      deserializer: 'CommitDetailStub',
      uri: CommitDetailItem.buildURI(this.props.workingDirectory, this.props.sha)
    };
  }

  preventFocus() {
    this.shouldFocus = false;
  }

  focus() {
    this.refInitialFocus.getPromise().then(focusable => {
      if (!this.shouldFocus) {
        return;
      }

      focusable.focus();
    });
  }

}

exports.default = CommitDetailItem;

_defineProperty(CommitDetailItem, "propTypes", {
  workdirContextPool: _propTypes2.WorkdirContextPoolPropType.isRequired,
  workingDirectory: _propTypes.default.string.isRequired,
  sha: _propTypes.default.string.isRequired
});

_defineProperty(CommitDetailItem, "uriPattern", 'atom-github://commit-detail?workdir={workingDirectory}&sha={sha}');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9pdGVtcy9jb21taXQtZGV0YWlsLWl0ZW0uanMiXSwibmFtZXMiOlsiQ29tbWl0RGV0YWlsSXRlbSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiYnVpbGRVUkkiLCJ3b3JraW5nRGlyZWN0b3J5Iiwic2hhIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImlzRGVzdHJveWVkIiwiZW1pdHRlciIsImVtaXQiLCJFbWl0dGVyIiwiaGFzVGVybWluYXRlZFBlbmRpbmdTdGF0ZSIsInNob3VsZEZvY3VzIiwicmVmSW5pdGlhbEZvY3VzIiwiUmVmSG9sZGVyIiwicmVmRWRpdG9yIiwib2JzZXJ2ZSIsImVkaXRvciIsImlzQWxpdmUiLCJ0ZXJtaW5hdGVQZW5kaW5nU3RhdGUiLCJvbkRpZFRlcm1pbmF0ZVBlbmRpbmdTdGF0ZSIsImNhbGxiYWNrIiwib24iLCJvbkRpZERlc3Ryb3kiLCJyZW5kZXIiLCJyZXBvc2l0b3J5Iiwid29ya2RpckNvbnRleHRQb29sIiwiZ2V0Q29udGV4dCIsImdldFJlcG9zaXRvcnkiLCJkZXN0cm95IiwiZ2V0VGl0bGUiLCJnZXRJY29uTmFtZSIsIm9ic2VydmVFbWJlZGRlZFRleHRFZGl0b3IiLCJjYiIsIm1hcCIsImdldFdvcmtpbmdEaXJlY3RvcnkiLCJnZXRTaGEiLCJzZXJpYWxpemUiLCJkZXNlcmlhbGl6ZXIiLCJ1cmkiLCJwcmV2ZW50Rm9jdXMiLCJmb2N1cyIsImdldFByb21pc2UiLCJ0aGVuIiwiZm9jdXNhYmxlIiwiV29ya2RpckNvbnRleHRQb29sUHJvcFR5cGUiLCJpc1JlcXVpcmVkIiwiUHJvcFR5cGVzIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRWUsTUFBTUEsZ0JBQU4sU0FBK0JDLGVBQU1DLFNBQXJDLENBQStDO0FBUzVELFNBQU9DLFFBQVAsQ0FBZ0JDLGdCQUFoQixFQUFrQ0Ms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QUFHO0FBQ1YsV0FBTztBQUNMQyxNQUFBQSxZQUFZLEVBQUUsa0JBRFQ7QUFFTEMsTUFBQUEsR0FBRyxFQUFFekMsZ0JBQWdCLENBQUNHLFFBQWpCLENBQTBCLEtBQUtLLEtBQUwsQ0FBV0osZ0JBQXJDLEVBQXVELEtBQUtJLEtBQUwsQ0FBV0gsR0FBbEU7QUFGQSxLQUFQO0FBSUQ7O0FBRURxQyxFQUFBQSxZQUFZLEdBQUc7QUFDYixTQUFLNUIsV0FBTCxHQUFtQixLQUFuQjtBQUNEOztBQUVENkIsRUFBQUEsS0FBSyxHQUFHO0FBQ04sU0FBSzVCLGVBQUwsQ0FBcUI2QixVQUFyQixHQUFrQ0MsSUFBbEMsQ0FBdUNDLFNBQVMsSUFBSTtBQUNsRCxVQUFJLENBQUMsS0FBS2hDLFdBQVYsRUFBdUI7QUFDckI7QUFDRDs7QUFFRGdDLE1BQUFBLFNBQVMsQ0FBQ0gsS0FBVjtBQUNELEtBTkQ7QUFPRDs7QUE1RzJEOzs7O2dCQUF6QzNDLGdCLGVBQ0E7QUFDakI0QixFQUFBQSxrQkFBa0IsRUFBRW1CLHVDQUEyQkMsVUFEOUI7QUFFakI1QyxFQUFBQSxnQkFBZ0IsRUFBRTZDLG1CQUFVQyxNQUFWLENBQWlCRixVQUZsQjtBQUdqQjNDLEVBQUFBLEdBQUcsRUFBRTRDLG1CQUFVQyxNQUFWLENBQWlCRjtBQUhMLEM7O2dCQURBaEQsZ0IsZ0JBT0Msa0UiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnZXZlbnQta2l0JztcblxuaW1wb3J0IHtXb3JrZGlyQ29udGV4dFBvb2xQcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgQ29tbWl0RGV0YWlsQ29udGFpbmVyIGZyb20gJy4uL2NvbnRhaW5lcnMvY29tbWl0LWRldGFpbC1jb250YWluZXInO1xuaW1wb3J0IFJlZkhvbGRlciBmcm9tICcuLi9tb2RlbHMvcmVmLWhvbGRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1pdERldGFpbEl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHdvcmtkaXJDb250ZXh0UG9vbDogV29ya2RpckNvbnRleHRQb29sUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgc2hhOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0aWMgdXJpUGF0dGVybiA9ICdhdG9tLWdpdGh1YjovL2NvbW1pdC1kZXRhaWw/d29ya2Rpcj17d29ya2luZ0RpcmVjdG9yeX0mc2hhPXtzaGF9J1xuXG4gIHN0YXRpYyBidWlsZFVSSSh3b3JraW5nRGlyZWN0b3J5LCBzaGEpIHtcbiAgICByZXR1cm4gYGF0b20tZ2l0aHViOi8vY29tbWl0LWRldGFpbD93b3JrZGlyPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHdvcmtpbmdEaXJlY3RvcnkpfSZzaGE9JHtlbmNvZGVVUklDb21wb25lbnQoc2hhKX1gO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuaXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmhhc1Rlcm1pbmF0ZWRQZW5kaW5nU3RhdGUgPSBmYWxzZTtcbiAgICB0aGlzLnNob3VsZEZvY3VzID0gdHJ1ZTtcbiAgICB0aGlzLnJlZkluaXRpYWxGb2N1cyA9IG5ldyBSZWZIb2xkZXIoKTtcblxuICAgIHRoaXMucmVmRWRpdG9yID0gbmV3IFJlZkhvbGRlcigpO1xuICAgIHRoaXMucmVmRWRpdG9yLm9ic2VydmUoZWRpdG9yID0+IHtcbiAgICAgIGlmIChlZGl0b3IuaXNBbGl2ZSgpKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWVtYmVkZGVkLXRleHQtZWRpdG9yJywgZWRpdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRlcm1pbmF0ZVBlbmRpbmdTdGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuaGFzVGVybWluYXRlZFBlbmRpbmdTdGF0ZSkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC10ZXJtaW5hdGUtcGVuZGluZy1zdGF0ZScpO1xuICAgICAgdGhpcy5oYXNUZXJtaW5hdGVkUGVuZGluZ1N0YXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBvbkRpZFRlcm1pbmF0ZVBlbmRpbmdTdGF0ZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC10ZXJtaW5hdGUtcGVuZGluZy1zdGF0ZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoIXRoaXMuaXNEZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjayk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHRoaXMucHJvcHMud29ya2RpckNvbnRleHRQb29sLmdldENvbnRleHQodGhpcy5wcm9wcy53b3JraW5nRGlyZWN0b3J5KS5nZXRSZXBvc2l0b3J5KCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENvbW1pdERldGFpbENvbnRhaW5lclxuICAgICAgICBpdGVtVHlwZT17dGhpcy5jb25zdHJ1Y3Rvcn1cbiAgICAgICAgcmVwb3NpdG9yeT17cmVwb3NpdG9yeX1cbiAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgIGRlc3Ryb3k9e3RoaXMuZGVzdHJveX1cbiAgICAgICAgcmVmRWRpdG9yPXt0aGlzLnJlZkVkaXRvcn1cbiAgICAgICAgcmVmSW5pdGlhbEZvY3VzPXt0aGlzLnJlZkluaXRpYWxGb2N1c31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBgQ29tbWl0OiAke3RoaXMucHJvcHMuc2hhfWA7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpIHtcbiAgICByZXR1cm4gJ2dpdC1jb21taXQnO1xuICB9XG5cbiAgb2JzZXJ2ZUVtYmVkZGVkVGV4dEVkaXRvcihjYikge1xuICAgIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4gZWRpdG9yLmlzQWxpdmUoKSAmJiBjYihlZGl0b3IpKTtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWVtYmVkZGVkLXRleHQtZWRpdG9yJywgY2IpO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy53b3JraW5nRGlyZWN0b3J5O1xuICB9XG5cbiAgZ2V0U2hhKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnNoYTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnQ29tbWl0RGV0YWlsU3R1YicsXG4gICAgICB1cmk6IENvbW1pdERldGFpbEl0ZW0uYnVpbGRVUkkodGhpcy5wcm9wcy53b3JraW5nRGlyZWN0b3J5LCB0aGlzLnByb3BzLnNoYSksXG4gICAgfTtcbiAgfVxuXG4gIHByZXZlbnRGb2N1cygpIHtcbiAgICB0aGlzLnNob3VsZEZvY3VzID0gZmFsc2U7XG4gIH1cblxuICBmb2N1cygpIHtcbiAgICB0aGlzLnJlZkluaXRpYWxGb2N1cy5nZXRQcm9taXNlKCkudGhlbihmb2N1c2FibGUgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNob3VsZEZvY3VzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==