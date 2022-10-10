"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var _eventKit = require("event-kit");

var _electron = require("electron");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _octicon = _interopRequireDefault(require("../atom/octicon"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  dialog
} = _electron.remote;
const genArray = (0, _lodash.default)(function genArray(interval, count) {
  const arr = [];

  for (let i = 1; i <= count; i++) {
    arr.push(interval * i);
  }

  return arr;
}, (interval, count) => `${interval}:${count}`);

class Marker {
  static deserialize(data) {
    const marker = new Marker(data.label, () => {});
    marker.end = data.end;
    marker.markers = data.markers;
    return marker;
  }

  constructor(label, didUpdate) {
    this.label = label;
    this.didUpdate = didUpdate;
    this.end = null;
    this.markers = [];
  }

  getStart() {
    return this.markers.length ? this.markers[0].start : null;
  }

  getEnd() {
    return this.end;
  }

  mark(sectionName, start) {
    this.markers.push({
      name: sectionName,
      start: start || performance.now()
    });
  }

  finalize() {
    this.end = performance.now();
    this.didUpdate();
  }

  getTimings() {
    return this.markers.map((timing, idx, ary) => {
      const next = ary[idx + 1];
      const end = next ? next.start : this.getEnd();
      return _objectSpread2({}, timing, {
        end
      });
    });
  }

  serialize() {
    return {
      label: this.label,
      end: this.end,
      markers: this.markers.slice()
    };
  }

}

class MarkerTooltip extends _react.default.Component {
  render() {
    const {
      marker
    } = this.props;
    const timings = marker.getTimings();
    return _react.default.createElement("div", {
      style: {
        textAlign: 'left',
        maxWidth: 300,
        whiteSpace: 'initial'
      }
    }, _react.default.createElement("strong", null, _react.default.createElement("tt", null, marker.label)), _react.default.createElement("ul", {
      style: {
        paddingLeft: 20,
        marginTop: 10
      }
    }, timings.map(({
      name,
      start,
      end
    }) => {
      const duration = end - start;
      return _react.default.createElement("li", {
        key: name
      }, name, ": ", Math.floor(duration * 100) / 100, "ms");
    })));
  }

}

_defineProperty(MarkerTooltip, "propTypes", {
  marker: _propTypes.default.instanceOf(Marker).isRequired
});

const COLORS = {
  queued: 'red',
  prepare: 'cyan',
  nexttick: 'yellow',
  execute: 'green',
  ipc: 'pink'
};

class MarkerSpan extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'handleMouseOver', 'handleMouseOut');
  }

  render() {
    const _this$props = this.props,
          {
      marker
    } = _this$props,
          others = _objectWithoutProperties(_this$props, ["marker"]);

    const timings = marker.getTimings();
    const totalTime = marker.getEnd() - marker.getStart();
    const percentages = timings.map(({
      name,
      start,
      end
    }) => {
      const duration = end - start;
      return {
        color: COLORS[name],
        percent: duration / totalTime * 100
      };
    });
    return _react.default.createElement("span", _extends({}, others, {
      ref: c => {
        this.element = c;
      },
      onMouseOver: this.handleMouseOver,
      onMouseOut: this.handleMouseOut
    }), percentages.map(({
      color,
      percent
    }, i) => {
      const style = {
        width: `${percent}%`,
        background: color
      };
      return _react.default.createElement("span", {
        className: "waterfall-marker-section",
        key: i,
        style: style
      });
    }));
  }

  handleMouseOver(e) {
    const elem = document.createElement('div');

    _reactDom.default.render(_react.default.createElement(MarkerTooltip, {
      marker: this.props.marker
    }), elem);

    this.tooltipDisposable = atom.tooltips.add(this.element, {
      item: elem,
      placement: 'auto bottom',
      trigger: 'manual'
    });
  }

  closeTooltip() {
    this.tooltipDisposable && this.tooltipDisposable.dispose();
    this.tooltipDisposable = null;
  }

  handleMouseOut(e) {
    this.closeTooltip();
  }

  componentWillUnmount() {
    this.closeTooltip();
  }

}

_defineProperty(MarkerSpan, "propTypes", {
  marker: _propTypes.default.instanceOf(Marker).isRequired
});

class Waterfall extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _helpers.autobind)(this, 'renderMarker');
    this.state = this.getNextState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getNextState(nextProps));
  }

  getNextState(props) {
    const {
      markers
    } = props;
    const firstMarker = markers[0];
    const lastMarker = markers[markers.length - 1];
    const startTime = firstMarker.getStart();
    const endTime = lastMarker.getEnd();
    const totalDuration = endTime - startTime;
    let timelineMarkInterval = null;

    if (props.zoomFactor <= 0.15) {
      timelineMarkInterval = 1000;
    } else if (props.zoomFactor <= 0.3) {
      timelineMarkInterval = 500;
    } else if (props.zoomFactor <= 0.6) {
      timelineMarkInterval = 250;
    } else {
      timelineMarkInterval = 100;
    }

    const timelineMarks = genArray(timelineMarkInterval, Math.ceil(totalDuration / timelineMarkInterval));
    return {
      firstMarker,
      lastMarker,
      startTime,
      endTime,
      totalDuration,
      timelineMarks
    };
  }

  render() {
    return _react.default.createElement("div", {
      className: "waterfall-scroller"
    }, _react.default.createElement("div", {
      className: "waterfall-container"
    }, this.renderTimeMarkers(), this.renderTimeline(), this.props.markers.map(this.renderMarker)));
  }

  renderTimeline() {
    return _react.default.createElement("div", {
      className: "waterfall-timeline"
    }, "\xA0", this.state.timelineMarks.map(time => {
      const leftPos = time * this.props.zoomFactor;
      const style = {
        left: leftPos
      };
      return _react.default.createElement("span", {
        className: "waterfall-timeline-label",
        style: style,
        key: `tl:${time}`
      }, time, "ms");
    }));
  }

  renderTimeMarkers() {
    return _react.default.createElement("div", {
      className: "waterfall-time-markers"
    }, this.state.timelineMarks.map(time => {
      const leftPos = time * this.props.zoomFactor;
      const style = {
        left: leftPos
      };
      return _react.default.createElement("span", {
        className: "waterfall-time-marker",
        style: style,
        key: `tm:${time}`
      });
    }));
  }

  renderMarker(marker, i) {
    if (marker.getStart() === null || marker.getEnd() === null) {
      return _react.default.createElement("div", {
        key: i
      });
    }

    const startOffset = marker.getStart() - this.state.startTime;
    const duration = marker.getEnd() - marker.getStart();
    const markerStyle = {
      left: startOffset * this.props.zoomFactor,
      width: duration * this.props.zoomFactor
    };
    return _react.default.createElement("div", {
      className: "waterfall-row",
      key: i
    }, _react.default.createElement("span", {
      className: "waterfall-row-label",
      style: {
        paddingLeft: markerStyle.left + markerStyle.width
      }
    }, marker.label), _react.default.createElement(MarkerSpan, {
      className: "waterfall-marker",
      style: markerStyle,
      marker: marker
    }));
  }

}

_defineProperty(Waterfall, "propTypes", {
  markers: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Marker)).isRequired,
  zoomFactor: _propTypes.default.number.isRequired
});

class WaterfallWidget extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _helpers.autobind)(this, 'handleZoomFactorChange', 'handleCollapseClick', 'handleExportClick');
    this.state = {
      zoomFactor: 0.3,
      collapsed: false
    };
  }

  render() {
    const {
      markers
    } = this.props;
    const firstMarker = markers[0];
    const lastMarker = markers[markers.length - 1];
    const startTime = firstMarker.getStart();
    const endTime = lastMarker.getEnd();
    const duration = endTime - startTime;
    return _react.default.createElement("div", {
      className: "waterfall-widget inset-pannel"
    }, _react.default.createElement("div", {
      className: "waterfall-header"
    }, _react.default.createElement("div", {
      className: "waterfall-header-text"
    }, _react.default.createElement("span", {
      onClick: this.handleCollapseClick,
      className: "collapse-toggle"
    }, this.state.collapsed ? '\u25b6' : '\u25bc'), this.props.markers.length, " event(s) over ", Math.floor(duration), "ms"), _react.default.createElement("div", {
      className: "waterfall-header-controls"
    }, _react.default.createElement("button", {
      className: "waterfall-export-button btn btn-sm",
      onClick: this.handleExportClick
    }, "Export"), _react.default.createElement(_octicon.default, {
      icon: "search"
    }), _react.default.createElement("input", {
      type: "range",
      className: "input-range",
      min: 0.1,
      max: 1,
      step: 0.01,
      value: this.state.zoomFactor,
      onChange: this.handleZoomFactorChange
    }))), this.state.collapsed ? null : _react.default.createElement(Waterfall, {
      markers: this.props.markers,
      zoomFactor: this.state.zoomFactor
    }));
  }

  handleZoomFactorChange(e) {
    this.setState({
      zoomFactor: parseFloat(e.target.value)
    });
  }

  handleCollapseClick(e) {
    this.setState(s => ({
      collapsed: !s.collapsed
    }));
  }

  async handleExportClick(e) {
    e.preventDefault();
    const json = JSON.stringify(this.props.markers.map(m => m.serialize()), null, '  ');
    const buffer = new _atom.TextBuffer({
      text: json
    });
    const {
      filePath
    } = await dialog.showSaveDialog({
      defaultPath: 'git-timings.json'
    });

    if (!filePath) {
      return;
    }

    buffer.saveAs(filePath);
  }

}

_defineProperty(WaterfallWidget, "propTypes", {
  markers: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Marker)).isRequired
});

let markers = null;
let groupId = 0;
const groups = [];
let lastMarkerTime = null;
let updateTimer = null;

class GitTimingsView extends _react.default.Component {
  static buildURI() {
    return this.uriPattern;
  }

  static generateMarker(label) {
    const marker = new Marker(label, () => {
      GitTimingsView.scheduleUpdate();
    });
    const now = performance.now();

    if (!markers || lastMarkerTime && Math.abs(now - lastMarkerTime) >= 5000) {
      groupId++;
      markers = [];
      groups.unshift({
        id: groupId,
        markers
      });

      if (groups.length > 100) {
        groups.pop();
      }
    }

    lastMarkerTime = now;
    markers.push(marker);
    GitTimingsView.scheduleUpdate();
    return marker;
  }

  static restoreGroup(group) {
    groupId++;
    groups.unshift({
      id: groupId,
      markers: group
    });
    GitTimingsView.scheduleUpdate(true);
  }

  static scheduleUpdate(immediate = false) {
    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    updateTimer = setTimeout(() => {
      GitTimingsView.emitter.emit('did-update');
    }, immediate ? 0 : 1000);
  }

  static onDidUpdate(callback) {
    return GitTimingsView.emitter.on('did-update', callback);
  }

  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'handleImportClick');
  }

  componentDidMount() {
    this.subscriptions = new _eventKit.CompositeDisposable(GitTimingsView.onDidUpdate(() => this.forceUpdate()));
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  render() {
    return _react.default.createElement("div", {
      className: "github-GitTimingsView"
    }, _react.default.createElement("div", {
      className: "github-GitTimingsView-header"
    }, _react.default.createElement("button", {
      className: "import-button btn",
      onClick: this.handleImportClick
    }, "Import")), groups.map((group, idx) => _react.default.createElement(WaterfallWidget, {
      key: group.id,
      markers: group.markers
    })));
  }

  async handleImportClick(e) {
    e.preventDefault();
    const {
      filePaths
    } = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (!filePaths.length) {
      return;
    }

    const filename = filePaths[0];

    try {
      const contents = await _fsExtra.default.readFile(filename, {
        encoding: 'utf8'
      });
      const data = JSON.parse(contents);
      const restoredMarkers = data.map(item => Marker.deserialize(item));
      GitTimingsView.restoreGroup(restoredMarkers);
    } catch (_err) {
      atom.notifications.addError(`Could not import timings from ${filename}`);
    }
  }

  serialize() {
    return {
      deserializer: 'GitTimingsView'
    };
  }

  getURI() {
    return this.constructor.buildURI();
  }

  getTitle() {
    return 'GitHub Package Timings View';
  }

}

exports.default = GitTimingsView;

_defineProperty(GitTimingsView, "uriPattern", 'atom-github://debug/timings');

_defineProperty(GitTimingsView, "emitter", new _eventKit.Emitter());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9naXQtdGltaW5ncy12aWV3LmpzIl0sIm5hbWVzIjpbImRpYWxvZyIsInJlbW90ZSIsImdlbkFycmF5IiwiaW50ZXJ2YWwiLCJjb3VudCIsImFyciIsImkiLCJwdXNoIiwiTWFya2VyIiwiZGVzZXJpYWxpemUiLCJkYXRhIiwibWFya2VyIiwibGFiZWwiLCJlbmQiLCJtYXJrZXJzIiwiY29uc3RydWN0b3IiLCJkaWRVcGRhdGUiLCJnZXRTdGFydCIsImxlbmd0aCIsInN0YXJ0IiwiZ2V0RW5kIiwibWFyayIsInNlY3Rpb25OYW1lIiwibmFtZSIsInBlcmZvcm1hbmNlIiwibm93IiwiZmluYWxpemUiLCJnZXRUaW1pbmdzIiwibWFwIiwidGltaW5nIiwiaWR4IiwiYXJ5IiwibmV4dCIsInNlcmlhbGl6ZSIsInNsaWNlIiwiTWFya2VyVG9vbHRpcCIsIlJlYWN0IiwiQ29tcG9uZW50IiwicmVuZGVyIiwicHJvcHMiLCJ0aW1pbmdzIiwidGV4dEFsaWduIiwibWF4V2lkdGgiLCJ3aGl0ZVNwYWNlIiwicGFkZGluZ0xlZnQiLCJtYXJnaW5Ub3AiLCJkdXJhdGlvbiIsIk1hdGgiLCJmbG9vciIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJpc1JlcXVpcmVkIiwiQ09MT1JTIiwicXVldWVkIiwicHJlcGFyZSIsIm5leHR0aWNrIiwiZXhlY3V0ZSIsImlwYyIsIk1hcmtlclNwYW4iLCJvdGhlcnMiLCJ0b3RhbFRpbWUiLCJwZXJjZW50YWdlcyIsImNvbG9yIiwicGVyY2VudCIsImMiLCJlbGVtZW50IiwiaGFuZGxlTW91c2VPdmVyIiwiaGFuZGxlTW91c2VPdXQiLCJzdHlsZSIsIndpZHRoIiwiYmFja2dyb3VuZCIsImUiLCJlbGVtIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiUmVhY3REb20iLCJ0b29sdGlwRGlzcG9zYWJsZSIsImF0b20iLCJ0b29sdGlwcyIsImFkZCIsIml0ZW0iLCJwbGFjZW1lbnQiLCJ0cmlnZ2VyIiwiY2xvc2VUb29sdGlwIiwiZGlzcG9zZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiV2F0ZXJmYWxsIiwiY29udGV4dCIsInN0YXRlIiwiZ2V0TmV4dFN0YXRlIiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsInNldFN0YXRlIiwiZmlyc3RNYXJrZXIiLCJsYXN0TWFya2VyIiwic3RhcnRUaW1lIiwiZW5kVGltZSIsInRvdGFsRHVyYXRpb24iLCJ0aW1lbGluZU1hcmtJbnRlcnZhbCIsInpvb21GYWN0b3IiLCJ0aW1lbGluZU1hcmtzIiwiY2VpbCIsInJlbmRlclRpbWVNYXJrZXJzIiwicmVuZGVyVGltZWxpbmUiLCJyZW5kZXJNYXJrZXIiLCJ0aW1lIiwibGVmdFBvcyIsImxlZnQiLCJzdGFydE9mZnNldCIsIm1hcmtlclN0eWxlIiwiYXJyYXlPZiIsIm51bWJlciIsIldhdGVyZmFsbFdpZGdldCIsImNvbGxhcHNlZCIsImhhbmRsZUNvbGxhcHNlQ2xpY2siLCJoYW5kbGVFeHBvcnRDbGljayIsImhhbmRsZVpvb21GYWN0b3JDaGFuZ2UiLCJwYXJzZUZsb2F0IiwidGFyZ2V0IiwidmFsdWUiLCJzIiwicHJldmVudERlZmF1bHQiLCJqc29uIiwiSlNPTiIsInN0cmluZ2lmeSIsIm0iLCJidWZmZXIiLCJUZXh0QnVmZmVyIiwidGV4dCIsImZpbGVQYXRoIiwic2hvd1NhdmVEaWFsb2ciLCJkZWZhdWx0UGF0aCIsInNhdmVBcyIsImdyb3VwSWQiLCJncm91cHMiLCJsYXN0TWFya2VyVGltZSIsInVwZGF0ZVRpbWVyIiwiR2l0VGltaW5nc1ZpZXciLCJidWlsZFVSSSIsInVyaVBhdHRlcm4iLCJnZW5lcmF0ZU1hcmtlciIsInNjaGVkdWxlVXBkYXRlIiwiYWJzIiwidW5zaGlmdCIsImlkIiwicG9wIiwicmVzdG9yZUdyb3VwIiwiZ3JvdXAiLCJpbW1lZGlhdGUiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZW1pdHRlciIsImVtaXQiLCJvbkRpZFVwZGF0ZSIsImNhbGxiYWNrIiwib24iLCJjb21wb25lbnREaWRNb3VudCIsInN1YnNjcmlwdGlvbnMiLCJDb21wb3NpdGVEaXNwb3NhYmxlIiwiZm9yY2VVcGRhdGUiLCJoYW5kbGVJbXBvcnRDbGljayIsImZpbGVQYXRocyIsInNob3dPcGVuRGlhbG9nIiwicHJvcGVydGllcyIsImZpbGVuYW1lIiwiY29udGVudHMiLCJmcyIsInJlYWRGaWxlIiwiZW5jb2RpbmciLCJwYXJzZSIsInJlc3RvcmVkTWFya2VycyIsIl9lcnIiLCJub3RpZmljYXRpb25zIiwiYWRkRXJyb3IiLCJkZXNlcmlhbGl6ZXIiLCJnZXRVUkkiLCJnZXRUaXRsZSIsIkVtaXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFSQSxNQUFNO0FBQUNBLEVBQUFBO0FBQUQsSUFBV0MsZ0JBQWpCO0FBVUEsTUFBTUMsUUFBUSxHQUFHLHFCQUFRLFNBQVNBLFFBQVQsQ0FBa0JDLFFBQWxCLEVBQTRCQyxLQUE1QixFQUFtQztBQUMxRCxRQUFNQyxHQUFHLEdBQUcsRUFBWjs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLElBQUlGLEtBQXJCLEVBQTRCRSxDQUFDLEVBQTdCLEVBQWlDO0FBQy9CRCxJQUFBQSxHQUFHLENBQUNFLElBQUosQ0FBU0osUUFBUSxHQUFHRyxDQUFwQjtBQUNEOztBQUNELFNBQU9ELEdBQVA7QUFDRCxDQU5nQixFQU1kLENBQUNGLFFBQUQsRUFBV0MsS0FBWCxLQUFzQixHQUFFRCxRQUFTLElBQUdDLEtBQU0sRUFONUIsQ0FBakI7O0FBUUEsTUFBTUksTUFBTixDQUFhO0FBQ1gsU0FBT0MsV0FBUCxDQUFtQkMsSUFBbkIsRUFBeUI7QUFDdkIsVUFBTUMsTUFBTSxHQUFHLElBQUlILE1BQUosQ0FBV0UsSUFBSSxDQUFDRSxLQUFoQixFQUF1QixNQUFNLENBQUUsQ0FBL0IsQ0FBZjtB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QUEsUUFBUSxFQUFFO0FBQVgsT0FBdEIsQ0FBdkI7QUFDQSxZQUFNOUosSUFBSSxHQUFHaUgsSUFBSSxDQUFDOEMsS0FBTCxDQUFXSixRQUFYLENBQWI7QUFDQSxZQUFNSyxlQUFlLEdBQUdoSyxJQUFJLENBQUNrQixHQUFMLENBQVNvRCxJQUFJLElBQUl4RSxNQUFNLENBQUNDLFdBQVAsQ0FBbUJ1RSxJQUFuQixDQUFqQixDQUF4QjtBQUNBeUQsTUFBQUEsY0FBYyxDQUFDUyxZQUFmLENBQTRCd0IsZUFBNUI7QUFDRCxLQUxELENBS0UsT0FBT0MsSUFBUCxFQUFhO0FBQ2I5RixNQUFBQSxJQUFJLENBQUMrRixhQUFMLENBQW1CQyxRQUFuQixDQUE2QixpQ0FBZ0NULFFBQVMsRUFBdEU7QUFDRDtBQUNGOztBQUVEbkksRUFBQUEsU0FBUyxHQUFHO0FBQ1YsV0FBTztBQUNMNkksTUFBQUEsWUFBWSxFQUFFO0FBRFQsS0FBUDtBQUdEOztBQUVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUFPLEtBQUtoSyxXQUFMLENBQWlCMkgsUUFBakIsRUFBUDtBQUNEOztBQUVEc0MsRUFBQUEsUUFBUSxHQUFHO0FBQ1QsV0FBTyw2QkFBUDtBQUNEOztBQTVHeUQ7Ozs7Z0JBQXZDdkMsYyxnQkFFQyw2Qjs7Z0JBRkRBLGMsYUFRRixJQUFJd0MsaUJBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge3JlbW90ZX0gZnJvbSAnZWxlY3Ryb24nO1xuY29uc3Qge2RpYWxvZ30gPSByZW1vdGU7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RG9tIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoLm1lbW9pemUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IE9jdGljb24gZnJvbSAnLi4vYXRvbS9vY3RpY29uJztcbmltcG9ydCB7YXV0b2JpbmR9IGZyb20gJy4uL2hlbHBlcnMnO1xuXG5jb25zdCBnZW5BcnJheSA9IG1lbW9pemUoZnVuY3Rpb24gZ2VuQXJyYXkoaW50ZXJ2YWwsIGNvdW50KSB7XG4gIGNvbnN0IGFyciA9IFtdO1xuICBmb3IgKGxldCBpID0gMTsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgYXJyLnB1c2goaW50ZXJ2YWwgKiBpKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufSwgKGludGVydmFsLCBjb3VudCkgPT4gYCR7aW50ZXJ2YWx9OiR7Y291bnR9YCk7XG5cbmNsYXNzIE1hcmtlciB7XG4gIHN0YXRpYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgY29uc3QgbWFya2VyID0gbmV3IE1hcmtlcihkYXRhLmxhYmVsLCAoKSA9PiB7fSk7XG4gICAgbWFya2VyLmVuZCA9IGRhdGEuZW5kO1xuICAgIG1hcmtlci5tYXJrZXJzID0gZGF0YS5tYXJrZXJzO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihsYWJlbCwgZGlkVXBkYXRlKSB7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgIHRoaXMuZGlkVXBkYXRlID0gZGlkVXBkYXRlO1xuICAgIHRoaXMuZW5kID0gbnVsbDtcbiAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgfVxuXG4gIGdldFN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLm1hcmtlcnMubGVuZ3RoID8gdGhpcy5tYXJrZXJzWzBdLnN0YXJ0IDogbnVsbDtcbiAgfVxuXG4gIGdldEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmQ7XG4gIH1cblxuICBtYXJrKHNlY3Rpb25OYW1lLCBzdGFydCkge1xuICAgIHRoaXMubWFya2Vycy5wdXNoKHtuYW1lOiBzZWN0aW9uTmFtZSwgc3RhcnQ6IHN0YXJ0IHx8IHBlcmZvcm1hbmNlLm5vdygpfSk7XG4gIH1cblxuICBmaW5hbGl6ZSgpIHtcbiAgICB0aGlzLmVuZCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuZGlkVXBkYXRlKCk7XG4gIH1cblxuICBnZXRUaW1pbmdzKCkge1xuICAgIHJldHVybiB0aGlzLm1hcmtlcnMubWFwKCh0aW1pbmcsIGlkeCwgYXJ5KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gYXJ5W2lkeCArIDFdO1xuICAgICAgY29uc3QgZW5kID0gbmV4dCA/IG5leHQuc3RhcnQgOiB0aGlzLmdldEVuZCgpO1xuICAgICAgcmV0dXJuIHsuLi50aW1pbmcsIGVuZH07XG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiB0aGlzLmxhYmVsLFxuICAgICAgZW5kOiB0aGlzLmVuZCxcbiAgICAgIG1hcmtlcnM6IHRoaXMubWFya2Vycy5zbGljZSgpLFxuICAgIH07XG4gIH1cbn1cblxuXG5jbGFzcyBNYXJrZXJUb29sdGlwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBtYXJrZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKE1hcmtlcikuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7bWFya2VyfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdGltaW5ncyA9IG1hcmtlci5nZXRUaW1pbmdzKCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBzdHlsZT17e3RleHRBbGlnbjogJ2xlZnQnLCBtYXhXaWR0aDogMzAwLCB3aGl0ZVNwYWNlOiAnaW5pdGlhbCd9fT5cbiAgICAgICAgPHN0cm9uZz48dHQ+e21hcmtlci5sYWJlbH08L3R0Pjwvc3Ryb25nPlxuICAgICAgICA8dWwgc3R5bGU9e3twYWRkaW5nTGVmdDogMjAsIG1hcmdpblRvcDogMTB9fT5cbiAgICAgICAgICB7dGltaW5ncy5tYXAoKHtuYW1lLCBzdGFydCwgZW5kfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmQgLSBzdGFydDtcbiAgICAgICAgICAgIHJldHVybiA8bGkga2V5PXtuYW1lfT57bmFtZX06IHtNYXRoLmZsb29yKGR1cmF0aW9uICogMTAwKSAvIDEwMH1tczwvbGk+O1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBDT0xPUlMgPSB7XG4gIHF1ZXVlZDogJ3JlZCcsXG4gIHByZXBhcmU6ICdjeWFuJyxcbiAgbmV4dHRpY2s6ICd5ZWxsb3cnLFxuICBleGVjdXRlOiAnZ3JlZW4nLFxuICBpcGM6ICdwaW5rJyxcbn07XG5jbGFzcyBNYXJrZXJTcGFuIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBtYXJrZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKE1hcmtlcikuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMsICdoYW5kbGVNb3VzZU92ZXInLCAnaGFuZGxlTW91c2VPdXQnKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7bWFya2VyLCAuLi5vdGhlcnN9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB0aW1pbmdzID0gbWFya2VyLmdldFRpbWluZ3MoKTtcbiAgICBjb25zdCB0b3RhbFRpbWUgPSBtYXJrZXIuZ2V0RW5kKCkgLSBtYXJrZXIuZ2V0U3RhcnQoKTtcbiAgICBjb25zdCBwZXJjZW50YWdlcyA9IHRpbWluZ3MubWFwKCh7bmFtZSwgc3RhcnQsIGVuZH0pID0+IHtcbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kIC0gc3RhcnQ7XG4gICAgICByZXR1cm4ge2NvbG9yOiBDT0xPUlNbbmFtZV0sIHBlcmNlbnQ6IGR1cmF0aW9uIC8gdG90YWxUaW1lICogMTAwfTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW5cbiAgICAgICAgey4uLm90aGVyc31cbiAgICAgICAgcmVmPXtjID0+IHsgdGhpcy5lbGVtZW50ID0gYzsgfX1cbiAgICAgICAgb25Nb3VzZU92ZXI9e3RoaXMuaGFuZGxlTW91c2VPdmVyfVxuICAgICAgICBvbk1vdXNlT3V0PXt0aGlzLmhhbmRsZU1vdXNlT3V0fT5cbiAgICAgICAge3BlcmNlbnRhZ2VzLm1hcCgoe2NvbG9yLCBwZXJjZW50fSwgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IGAke3BlcmNlbnR9JWAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBjb2xvcixcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtbWFya2VyLXNlY3Rpb25cIiBrZXk9e2l9IHN0eWxlPXtzdHlsZX0gLz47XG4gICAgICAgIH0pfVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVNb3VzZU92ZXIoZSkge1xuICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBSZWFjdERvbS5yZW5kZXIoPE1hcmtlclRvb2x0aXAgbWFya2VyPXt0aGlzLnByb3BzLm1hcmtlcn0gLz4sIGVsZW0pO1xuICAgIHRoaXMudG9vbHRpcERpc3Bvc2FibGUgPSBhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgIGl0ZW06IGVsZW0sXG4gICAgICBwbGFjZW1lbnQ6ICdhdXRvIGJvdHRvbScsXG4gICAgICB0cmlnZ2VyOiAnbWFudWFsJyxcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlVG9vbHRpcCgpIHtcbiAgICB0aGlzLnRvb2x0aXBEaXNwb3NhYmxlICYmIHRoaXMudG9vbHRpcERpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIHRoaXMudG9vbHRpcERpc3Bvc2FibGUgPSBudWxsO1xuICB9XG5cbiAgaGFuZGxlTW91c2VPdXQoZSkge1xuICAgIHRoaXMuY2xvc2VUb29sdGlwKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLmNsb3NlVG9vbHRpcCgpO1xuICB9XG59XG5cblxuY2xhc3MgV2F0ZXJmYWxsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBtYXJrZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuaW5zdGFuY2VPZihNYXJrZXIpKS5pc1JlcXVpcmVkLFxuICAgIHpvb21GYWN0b3I6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgIGF1dG9iaW5kKHRoaXMsICdyZW5kZXJNYXJrZXInKTtcbiAgICB0aGlzLnN0YXRlID0gdGhpcy5nZXROZXh0U3RhdGUocHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0TmV4dFN0YXRlKG5leHRQcm9wcykpO1xuICB9XG5cbiAgZ2V0TmV4dFN0YXRlKHByb3BzKSB7XG4gICAgY29uc3Qge21hcmtlcnN9ID0gcHJvcHM7XG4gICAgY29uc3QgZmlyc3RNYXJrZXIgPSBtYXJrZXJzWzBdO1xuICAgIGNvbnN0IGxhc3RNYXJrZXIgPSBtYXJrZXJzW21hcmtlcnMubGVuZ3RoIC0gMV07XG5cbiAgICBjb25zdCBzdGFydFRpbWUgPSBmaXJzdE1hcmtlci5nZXRTdGFydCgpO1xuICAgIGNvbnN0IGVuZFRpbWUgPSBsYXN0TWFya2VyLmdldEVuZCgpO1xuICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lO1xuICAgIGxldCB0aW1lbGluZU1hcmtJbnRlcnZhbCA9IG51bGw7XG4gICAgaWYgKHByb3BzLnpvb21GYWN0b3IgPD0gMC4xNSkge1xuICAgICAgdGltZWxpbmVNYXJrSW50ZXJ2YWwgPSAxMDAwO1xuICAgIH0gZWxzZSBpZiAocHJvcHMuem9vbUZhY3RvciA8PSAwLjMpIHtcbiAgICAgIHRpbWVsaW5lTWFya0ludGVydmFsID0gNTAwO1xuICAgIH0gZWxzZSBpZiAocHJvcHMuem9vbUZhY3RvciA8PSAwLjYpIHtcbiAgICAgIHRpbWVsaW5lTWFya0ludGVydmFsID0gMjUwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lbGluZU1hcmtJbnRlcnZhbCA9IDEwMDtcbiAgICB9XG4gICAgY29uc3QgdGltZWxpbmVNYXJrcyA9IGdlbkFycmF5KHRpbWVsaW5lTWFya0ludGVydmFsLCBNYXRoLmNlaWwodG90YWxEdXJhdGlvbiAvIHRpbWVsaW5lTWFya0ludGVydmFsKSk7XG5cbiAgICByZXR1cm4ge2ZpcnN0TWFya2VyLCBsYXN0TWFya2VyLCBzdGFydFRpbWUsIGVuZFRpbWUsIHRvdGFsRHVyYXRpb24sIHRpbWVsaW5lTWFya3N9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndhdGVyZmFsbC1zY3JvbGxlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndhdGVyZmFsbC1jb250YWluZXJcIj5cbiAgICAgICAgICB7dGhpcy5yZW5kZXJUaW1lTWFya2VycygpfVxuICAgICAgICAgIHt0aGlzLnJlbmRlclRpbWVsaW5lKCl9XG4gICAgICAgICAge3RoaXMucHJvcHMubWFya2Vycy5tYXAodGhpcy5yZW5kZXJNYXJrZXIpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJUaW1lbGluZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtdGltZWxpbmVcIj5cbiAgICAgICAgJm5ic3A7XG4gICAgICAgIHt0aGlzLnN0YXRlLnRpbWVsaW5lTWFya3MubWFwKHRpbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGxlZnRQb3MgPSB0aW1lICogdGhpcy5wcm9wcy56b29tRmFjdG9yO1xuICAgICAgICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgICAgICAgbGVmdDogbGVmdFBvcyxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtdGltZWxpbmUtbGFiZWxcIiBzdHlsZT17c3R5bGV9IGtleT17YHRsOiR7dGltZX1gfT57dGltZX1tczwvc3Bhbj47XG4gICAgICAgIH0pfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclRpbWVNYXJrZXJzKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndhdGVyZmFsbC10aW1lLW1hcmtlcnNcIj5cbiAgICAgICAge3RoaXMuc3RhdGUudGltZWxpbmVNYXJrcy5tYXAodGltZSA9PiB7XG4gICAgICAgICAgY29uc3QgbGVmdFBvcyA9IHRpbWUgKiB0aGlzLnByb3BzLnpvb21GYWN0b3I7XG4gICAgICAgICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0UG9zLFxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIndhdGVyZmFsbC10aW1lLW1hcmtlclwiIHN0eWxlPXtzdHlsZX0ga2V5PXtgdG06JHt0aW1lfWB9IC8+O1xuICAgICAgICB9KX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJNYXJrZXIobWFya2VyLCBpKSB7XG4gICAgaWYgKG1hcmtlci5nZXRTdGFydCgpID09PSBudWxsIHx8IG1hcmtlci5nZXRFbmQoKSA9PT0gbnVsbCkgeyByZXR1cm4gPGRpdiBrZXk9e2l9IC8+OyB9XG5cbiAgICBjb25zdCBzdGFydE9mZnNldCA9IG1hcmtlci5nZXRTdGFydCgpIC0gdGhpcy5zdGF0ZS5zdGFydFRpbWU7XG4gICAgY29uc3QgZHVyYXRpb24gPSBtYXJrZXIuZ2V0RW5kKCkgLSBtYXJrZXIuZ2V0U3RhcnQoKTtcbiAgICBjb25zdCBtYXJrZXJTdHlsZSA9IHtcbiAgICAgIGxlZnQ6IHN0YXJ0T2Zmc2V0ICogdGhpcy5wcm9wcy56b29tRmFjdG9yLFxuICAgICAgd2lkdGg6IGR1cmF0aW9uICogdGhpcy5wcm9wcy56b29tRmFjdG9yLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtcm93XCIga2V5PXtpfT5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtcm93LWxhYmVsXCJcbiAgICAgICAgICBzdHlsZT17e3BhZGRpbmdMZWZ0OiBtYXJrZXJTdHlsZS5sZWZ0ICsgbWFya2VyU3R5bGUud2lkdGh9fT57bWFya2VyLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPE1hcmtlclNwYW4gY2xhc3NOYW1lPVwid2F0ZXJmYWxsLW1hcmtlclwiIHN0eWxlPXttYXJrZXJTdHlsZX0gbWFya2VyPXttYXJrZXJ9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cblxuY2xhc3MgV2F0ZXJmYWxsV2lkZ2V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBtYXJrZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuaW5zdGFuY2VPZihNYXJrZXIpKS5pc1JlcXVpcmVkLFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgYXV0b2JpbmQodGhpcywgJ2hhbmRsZVpvb21GYWN0b3JDaGFuZ2UnLCAnaGFuZGxlQ29sbGFwc2VDbGljaycsICdoYW5kbGVFeHBvcnRDbGljaycpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6b29tRmFjdG9yOiAwLjMsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge21hcmtlcnN9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmaXJzdE1hcmtlciA9IG1hcmtlcnNbMF07XG4gICAgY29uc3QgbGFzdE1hcmtlciA9IG1hcmtlcnNbbWFya2Vycy5sZW5ndGggLSAxXTtcblxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGZpcnN0TWFya2VyLmdldFN0YXJ0KCk7XG4gICAgY29uc3QgZW5kVGltZSA9IGxhc3RNYXJrZXIuZ2V0RW5kKCk7XG4gICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2F0ZXJmYWxsLXdpZGdldCBpbnNldC1wYW5uZWxcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtaGVhZGVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtaGVhZGVyLXRleHRcIj5cbiAgICAgICAgICAgIDxzcGFuIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ29sbGFwc2VDbGlja30gY2xhc3NOYW1lPVwiY29sbGFwc2UtdG9nZ2xlXCI+XG4gICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvbGxhcHNlZCA/ICdcXHUyNWI2JyA6ICdcXHUyNWJjJ31cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIHt0aGlzLnByb3BzLm1hcmtlcnMubGVuZ3RofSBldmVudChzKSBvdmVyIHtNYXRoLmZsb29yKGR1cmF0aW9uKX1tc1xuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2F0ZXJmYWxsLWhlYWRlci1jb250cm9sc1wiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3YXRlcmZhbGwtZXhwb3J0LWJ1dHRvbiBidG4gYnRuLXNtXCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVFeHBvcnRDbGlja30+RXhwb3J0PC9idXR0b24+XG4gICAgICAgICAgICA8T2N0aWNvbiBpY29uPVwic2VhcmNoXCIgLz5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwicmFuZ2VcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbnB1dC1yYW5nZVwiXG4gICAgICAgICAgICAgIG1pbj17MC4xfVxuICAgICAgICAgICAgICBtYXg9ezF9XG4gICAgICAgICAgICAgIHN0ZXA9ezAuMDF9XG4gICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnpvb21GYWN0b3J9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZVpvb21GYWN0b3JDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3RoaXMuc3RhdGUuY29sbGFwc2VkID8gbnVsbCA6IDxXYXRlcmZhbGwgbWFya2Vycz17dGhpcy5wcm9wcy5tYXJrZXJzfSB6b29tRmFjdG9yPXt0aGlzLnN0YXRlLnpvb21GYWN0b3J9IC8+fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZVpvb21GYWN0b3JDaGFuZ2UoZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3pvb21GYWN0b3I6IHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpfSk7XG4gIH1cblxuICBoYW5kbGVDb2xsYXBzZUNsaWNrKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHMgPT4gKHtjb2xsYXBzZWQ6ICFzLmNvbGxhcHNlZH0pKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZUV4cG9ydENsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMubWFya2Vycy5tYXAobSA9PiBtLnNlcmlhbGl6ZSgpKSwgbnVsbCwgJyAgJyk7XG4gICAgY29uc3QgYnVmZmVyID0gbmV3IFRleHRCdWZmZXIoe3RleHQ6IGpzb259KTtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gYXdhaXQgZGlhbG9nLnNob3dTYXZlRGlhbG9nKHtcbiAgICAgIGRlZmF1bHRQYXRoOiAnZ2l0LXRpbWluZ3MuanNvbicsXG4gICAgfSk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBidWZmZXIuc2F2ZUFzKGZpbGVQYXRoKTtcbiAgfVxufVxuXG5cbmxldCBtYXJrZXJzID0gbnVsbDtcbmxldCBncm91cElkID0gMDtcbmNvbnN0IGdyb3VwcyA9IFtdO1xubGV0IGxhc3RNYXJrZXJUaW1lID0gbnVsbDtcbmxldCB1cGRhdGVUaW1lciA9IG51bGw7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdpdFRpbWluZ3NWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgdXJpUGF0dGVybiA9ICdhdG9tLWdpdGh1YjovL2RlYnVnL3RpbWluZ3MnO1xuXG4gIHN0YXRpYyBidWlsZFVSSSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmlQYXR0ZXJuO1xuICB9XG5cbiAgc3RhdGljIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gIHN0YXRpYyBnZW5lcmF0ZU1hcmtlcihsYWJlbCkge1xuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBNYXJrZXIobGFiZWwsICgpID0+IHtcbiAgICAgIEdpdFRpbWluZ3NWaWV3LnNjaGVkdWxlVXBkYXRlKCk7XG4gICAgfSk7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgaWYgKCFtYXJrZXJzIHx8IChsYXN0TWFya2VyVGltZSAmJiBNYXRoLmFicyhub3cgLSBsYXN0TWFya2VyVGltZSkgPj0gNTAwMCkpIHtcbiAgICAgIGdyb3VwSWQrKztcbiAgICAgIG1hcmtlcnMgPSBbXTtcbiAgICAgIGdyb3Vwcy51bnNoaWZ0KHtpZDogZ3JvdXBJZCwgbWFya2Vyc30pO1xuICAgICAgaWYgKGdyb3Vwcy5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgZ3JvdXBzLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0TWFya2VyVGltZSA9IG5vdztcbiAgICBtYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICBHaXRUaW1pbmdzVmlldy5zY2hlZHVsZVVwZGF0ZSgpO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICBzdGF0aWMgcmVzdG9yZUdyb3VwKGdyb3VwKSB7XG4gICAgZ3JvdXBJZCsrO1xuICAgIGdyb3Vwcy51bnNoaWZ0KHtpZDogZ3JvdXBJZCwgbWFya2VyczogZ3JvdXB9KTtcbiAgICBHaXRUaW1pbmdzVmlldy5zY2hlZHVsZVVwZGF0ZSh0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBzY2hlZHVsZVVwZGF0ZShpbW1lZGlhdGUgPSBmYWxzZSkge1xuICAgIGlmICh1cGRhdGVUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHVwZGF0ZVRpbWVyKTtcbiAgICB9XG5cbiAgICB1cGRhdGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgR2l0VGltaW5nc1ZpZXcuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJyk7XG4gICAgfSwgaW1tZWRpYXRlID8gMCA6IDEwMDApO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkVXBkYXRlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIEdpdFRpbWluZ3NWaWV3LmVtaXR0ZXIub24oJ2RpZC11cGRhdGUnLCBjYWxsYmFjayk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBhdXRvYmluZCh0aGlzLCAnaGFuZGxlSW1wb3J0Q2xpY2snKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgR2l0VGltaW5nc1ZpZXcub25EaWRVcGRhdGUoKCkgPT4gdGhpcy5mb3JjZVVwZGF0ZSgpKSxcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItR2l0VGltaW5nc1ZpZXdcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItR2l0VGltaW5nc1ZpZXctaGVhZGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJpbXBvcnQtYnV0dG9uIGJ0blwiIG9uQ2xpY2s9e3RoaXMuaGFuZGxlSW1wb3J0Q2xpY2t9PkltcG9ydDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2dyb3Vwcy5tYXAoKGdyb3VwLCBpZHgpID0+IChcbiAgICAgICAgICA8V2F0ZXJmYWxsV2lkZ2V0IGtleT17Z3JvdXAuaWR9IG1hcmtlcnM9e2dyb3VwLm1hcmtlcnN9IC8+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZUltcG9ydENsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3Qge2ZpbGVQYXRoc30gPSBhd2FpdCBkaWFsb2cuc2hvd09wZW5EaWFsb2coe1xuICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZSddLFxuICAgIH0pO1xuICAgIGlmICghZmlsZVBhdGhzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlbmFtZSA9IGZpbGVQYXRoc1swXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudHMgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlbmFtZSwge2VuY29kaW5nOiAndXRmOCd9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHJlc3RvcmVkTWFya2VycyA9IGRhdGEubWFwKGl0ZW0gPT4gTWFya2VyLmRlc2VyaWFsaXplKGl0ZW0pKTtcbiAgICAgIEdpdFRpbWluZ3NWaWV3LnJlc3RvcmVHcm91cChyZXN0b3JlZE1hcmtlcnMpO1xuICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgQ291bGQgbm90IGltcG9ydCB0aW1pbmdzIGZyb20gJHtmaWxlbmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ0dpdFRpbWluZ3NWaWV3JyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmJ1aWxkVVJJKCk7XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ0dpdEh1YiBQYWNrYWdlIFRpbWluZ3MgVmlldyc7XG4gIH1cbn1cbiJdfQ==