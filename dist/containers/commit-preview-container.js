"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _yubikiri = _interopRequireDefault(require("yubikiri"));

var _eventKit = require("event-kit");

var _observeModel = _interopRequireDefault(require("../views/observe-model"));

var _loadingView = _interopRequireDefault(require("../views/loading-view"));

var _commitPreviewController = _interopRequireDefault(require("../controllers/commit-preview-controller"));

var _patchBuffer = _interopRequireDefault(require("../models/patch/patch-buffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommitPreviewContainer extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "fetchData", repository => {
      const builderOpts = {
        renderStatusOverrides: this.state.renderStatusOverrides
      };

      if (this.props.largeDiffThreshold !== undefined) {
        builderOpts.largeDiffThreshold = this.props.largeDiffThreshold;
      }

      const before = () => this.emitter.emit('will-update-patch');

      const after = patch => this.emitter.emit('did-update-patch', patch);

      return (0, _yubikiri.default)({
        multiFilePatch: repository.getStagedChangesPatch({
          patchBuffer: this.patchBuffer,
          builder: builderOpts,
          before,
          after
        })
      });
    });

    _defineProperty(this, "renderResult", data => {
      const currentMultiFilePatch = data && data.multiFilePatch;

      if (currentMultiFilePatch !== this.lastMultiFilePatch) {
        this.sub.dispose();

        if (currentMultiFilePatch) {
          this.sub = new _eventKit.CompositeDisposable(...currentMultiFilePatch.getFilePatches().map(fp => fp.onDidChangeRenderStatus(() => {
            this.setState(prevState => {
              return {
                renderStatusOverrides: _objectSpread2({}, prevState.renderStatusOverrides, {
                  [fp.getPath()]: fp.getRenderStatus()
                })
              };
            });
          })));
        }

        this.lastMultiFilePatch = currentMultiFilePatch;
      }

      if (this.props.repository.isLoading() || data === null) {
        return _react.default.createElement(_loadingView.default, null);
      }

      return _react.default.createElement(_commitPreviewController.default, _extends({
        stagingStatus: 'staged',
        onWillUpdatePatch: this.onWillUpdatePatch,
        onDidUpdatePatch: this.onDidUpdatePatch
      }, data, this.props));
    });

    _defineProperty(this, "onWillUpdatePatch", cb => this.emitter.on('will-update-patch', cb));

    _defineProperty(this, "onDidUpdatePatch", cb => this.emitter.on('did-update-patch', cb));

    this.emitter = new _eventKit.Emitter();
    this.patchBuffer = new _patchBuffer.default();
    this.lastMultiFilePatch = null;
    this.sub = new _eventKit.CompositeDisposable();
    this.state = {
      renderStatusOverrides: {}
    };
  }

  render() {
    return _react.default.createElement(_observeModel.default, {
      model: this.props.repository,
      fetchData: this.fetchData
    }, this.renderResult);
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

}

exports.default = CommitPreviewContainer;

_defineProperty(CommitPreviewContainer, "propTypes", {
  repository: _propTypes.default.object.isRequired,
  largeDiffThreshold: _propTypes.default.number
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250YWluZXJzL2NvbW1pdC1wcmV2aWV3LWNvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJDb21taXRQcmV2aWV3Q29udGFpbmVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicmVwb3NpdG9yeSIsImJ1aWxkZXJPcHRzIiwicmVuZGVyU3RhdHVzT3ZlcnJpZGVzIiwic3RhdGUiLCJsYXJnZURpZmZUaHJlc2hvbGQiLCJ1bmRlZmluZWQiLCJiZWZvcmUiLCJlbWl0dGVyIiwiZW1pdCIsImFmdGVyIiwicGF0Y2giLCJtdWx0aUZpbGVQYXRjaCIsImdldFN0YWdlZENoYW5nZXNQYXRjaCIsInBhdGNoQnVmZmVyIiwiYnVpbGRlciIsImRhdGEiLCJjdXJyZW50TXVsdGlGaWxlUGF0Y2giLCJsYXN0TXVsdGlGaWxlUGF0Y2giLCJzdWIiLCJkaXNwb3NlIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsImdldEZpbGVQYXRjaGVzIiwibWFwIiwiZnAiLCJvbkRpZENoYW5nZVJlbmRlclN0YXR1cyIsInNldFN0YXRlIiwicHJldlN0YXRlIiwiZ2V0UGF0aCIsImdldFJlbmRlclN0YXR1cyIsImlzTG9hZGluZyIsIm9uV2lsbFVwZGF0ZVBhdGNoIiwib25EaWRVcGRhdGVQYXRjaCIsImNiIiwib24iLCJFbWl0dGVyIiwiUGF0Y2hCdWZmZXIiLCJyZW5kZXIiLCJmZXRjaERhdGEiLCJyZW5kZXJSZXN1bHQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJudW1iZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVlLE1BQU1BLHNCQUFOLFNBQXFDQyxlQUFNQyxTQUEzQyxDQUFxRDtBQU1sRUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FB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QkFBQyxxQkFBRDtBQUFjLE1BQUEsS0FBSyxFQUFFLEtBQUtyQyxLQUFMLENBQVdDLFVBQWhDO0FBQTRDLE1BQUEsU0FBUyxFQUFFLEtBQUtxQztBQUE1RCxPQUNHLEtBQUtDLFlBRFIsQ0FERjtBQUtEOztBQXNDREMsRUFBQUEsb0JBQW9CLEdBQUc7QUFDckIsU0FBS3JCLEdBQUwsQ0FBU0MsT0FBVDtBQUNEOztBQXJGaUU7Ozs7Z0JBQS9DeEIsc0IsZUFDQTtBQUNqQkssRUFBQUEsVUFBVSxFQUFFd0MsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFo7QUFFakJ0QyxFQUFBQSxrQkFBa0IsRUFBRW9DLG1CQUFVRztBQUZiLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB5dWJpa2lyaSBmcm9tICd5dWJpa2lyaSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5cbmltcG9ydCBPYnNlcnZlTW9kZWwgZnJvbSAnLi4vdmlld3Mvb2JzZXJ2ZS1tb2RlbCc7XG5pbXBvcnQgTG9hZGluZ1ZpZXcgZnJvbSAnLi4vdmlld3MvbG9hZGluZy12aWV3JztcbmltcG9ydCBDb21taXRQcmV2aWV3Q29udHJvbGxlciBmcm9tICcuLi9jb250cm9sbGVycy9jb21taXQtcHJldmlldy1jb250cm9sbGVyJztcbmltcG9ydCBQYXRjaEJ1ZmZlciBmcm9tICcuLi9tb2RlbHMvcGF0Y2gvcGF0Y2gtYnVmZmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWl0UHJldmlld0NvbnRhaW5lciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcmVwb3NpdG9yeTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGxhcmdlRGlmZlRocmVzaG9sZDogUHJvcFR5cGVzLm51bWJlcixcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIHRoaXMucGF0Y2hCdWZmZXIgPSBuZXcgUGF0Y2hCdWZmZXIoKTtcblxuICAgIHRoaXMubGFzdE11bHRpRmlsZVBhdGNoID0gbnVsbDtcbiAgICB0aGlzLnN1YiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLnN0YXRlID0ge3JlbmRlclN0YXR1c092ZXJyaWRlczoge319O1xuICB9XG5cbiAgZmV0Y2hEYXRhID0gcmVwb3NpdG9yeSA9PiB7XG4gICAgY29uc3QgYnVpbGRlck9wdHMgPSB7cmVuZGVyU3RhdHVzT3ZlcnJpZGVzOiB0aGlzLnN0YXRlLnJlbmRlclN0YXR1c092ZXJyaWRlc307XG5cbiAgICBpZiAodGhpcy5wcm9wcy5sYXJnZURpZmZUaHJlc2hvbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYnVpbGRlck9wdHMubGFyZ2VEaWZmVGhyZXNob2xkID0gdGhpcy5wcm9wcy5sYXJnZURpZmZUaHJlc2hvbGQ7XG4gICAgfVxuXG4gICAgY29uc3QgYmVmb3JlID0gKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ3dpbGwtdXBkYXRlLXBhdGNoJyk7XG4gICAgY29uc3QgYWZ0ZXIgPSBwYXRjaCA9PiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZS1wYXRjaCcsIHBhdGNoKTtcblxuICAgIHJldHVybiB5dWJpa2lyaSh7XG4gICAgICBtdWx0aUZpbGVQYXRjaDogcmVwb3NpdG9yeS5nZXRTdGFnZWRDaGFuZ2VzUGF0Y2goe1xuICAgICAgICBwYXRjaEJ1ZmZlcjogdGhpcy5wYXRjaEJ1ZmZlcixcbiAgICAgICAgYnVpbGRlcjogYnVpbGRlck9wdHMsXG4gICAgICAgIGJlZm9yZSxcbiAgICAgICAgYWZ0ZXIsXG4gICAgICB9KSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPE9ic2VydmVNb2RlbCBtb2RlbD17dGhpcy5wcm9wcy5yZXBvc2l0b3J5fSBmZXRjaERhdGE9e3RoaXMuZmV0Y2hEYXRhfT5cbiAgICAgICAge3RoaXMucmVuZGVyUmVzdWx0fVxuICAgICAgPC9PYnNlcnZlTW9kZWw+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclJlc3VsdCA9IGRhdGEgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRNdWx0aUZpbGVQYXRjaCA9IGRhdGEgJiYgZGF0YS5tdWx0aUZpbGVQYXRjaDtcbiAgICBpZiAoY3VycmVudE11bHRpRmlsZVBhdGNoICE9PSB0aGlzLmxhc3RNdWx0aUZpbGVQYXRjaCkge1xuICAgICAgdGhpcy5zdWIuZGlzcG9zZSgpO1xuICAgICAgaWYgKGN1cnJlbnRNdWx0aUZpbGVQYXRjaCkge1xuICAgICAgICB0aGlzLnN1YiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgICAgIC4uLmN1cnJlbnRNdWx0aUZpbGVQYXRjaC5nZXRGaWxlUGF0Y2hlcygpLm1hcChmcCA9PiBmcC5vbkRpZENoYW5nZVJlbmRlclN0YXR1cygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyU3RhdHVzT3ZlcnJpZGVzOiB7XG4gICAgICAgICAgICAgICAgICAuLi5wcmV2U3RhdGUucmVuZGVyU3RhdHVzT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgICAgW2ZwLmdldFBhdGgoKV06IGZwLmdldFJlbmRlclN0YXR1cygpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RNdWx0aUZpbGVQYXRjaCA9IGN1cnJlbnRNdWx0aUZpbGVQYXRjaDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5yZXBvc2l0b3J5LmlzTG9hZGluZygpIHx8IGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiA8TG9hZGluZ1ZpZXcgLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb21taXRQcmV2aWV3Q29udHJvbGxlclxuICAgICAgICBzdGFnaW5nU3RhdHVzPXsnc3RhZ2VkJ31cbiAgICAgICAgb25XaWxsVXBkYXRlUGF0Y2g9e3RoaXMub25XaWxsVXBkYXRlUGF0Y2h9XG4gICAgICAgIG9uRGlkVXBkYXRlUGF0Y2g9e3RoaXMub25EaWRVcGRhdGVQYXRjaH1cbiAgICAgICAgey4uLmRhdGF9XG4gICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWIuZGlzcG9zZSgpO1xuICB9XG5cbiAgb25XaWxsVXBkYXRlUGF0Y2ggPSBjYiA9PiB0aGlzLmVtaXR0ZXIub24oJ3dpbGwtdXBkYXRlLXBhdGNoJywgY2IpO1xuXG4gIG9uRGlkVXBkYXRlUGF0Y2ggPSBjYiA9PiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUtcGF0Y2gnLCBjYik7XG59XG4iXX0=