"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DonutChart extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'renderArc');
  }

  render() {
    const _this$props = this.props,
          {
      slices,
      baseOffset
    } = _this$props,
          others = _objectWithoutProperties(_this$props, ["slices", "baseOffset"]); // eslint-disable-line no-unused-vars


    const arcs = this.calculateArcs(slices);
    return _react.default.createElement("svg", others, arcs.map(this.renderArc));
  }

  calculateArcs(slices) {
    const total = slices.reduce((acc, item) => acc + item.count, 0);
    let lengthSoFar = 0;
    return slices.map((_ref) => {
      let {
        count
      } = _ref,
          others = _objectWithoutProperties(_ref, ["count"]);

      const piece = _objectSpread2({
        length: count / total * 100,
        position: lengthSoFar
      }, others);

      lengthSoFar += piece.length;
      return piece;
    });
  }

  renderArc({
    length,
    position,
    type,
    className
  }) {
    return _react.default.createElement("circle", {
      key: type,
      cx: "21",
      cy: "21",
      r: "15.91549430918954",
      fill: "transparent",
      className: `donut-ring-${type}`,
      pathLength: "100",
      strokeWidth: "3",
      strokeDasharray: `${length} ${100 - length}`,
      strokeDashoffset: `${100 - position + this.props.baseOffset}`
    });
  }

}

exports.default = DonutChart;

_defineProperty(DonutChart, "propTypes", {
  baseOffset: _propTypes.default.number,
  slices: _propTypes.default.arrayOf(_propTypes.default.shape({
    type: _propTypes.default.string,
    className: _propTypes.default.string,
    count: _propTypes.default.number
  }))
});

_defineProperty(DonutChart, "defaultProps", {
  baseOffset: 25
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9kb251dC1jaGFydC5qcyJdLCJuYW1lcyI6WyJEb251dENoYXJ0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicmVuZGVyIiwic2xpY2VzIiwiYmFzZU9mZnNldCIsIm90aGVycyIsImFyY3MiLCJjYWxjdWxhdGVBcmNzIiwibWFwIiwicmVuZGVyQXJjIiwidG90YWwiLCJyZWR1Y2UiLCJhY2MiLCJpdGVtIiwiY291bnQiLCJsZW5ndGhTb0ZhciIsInBpZWNlIiwibGVuZ3RoIiwicG9zaXRpb24iLCJ0eXBlIiwiY2xhc3NOYW1lIiwiUHJvcFR5cGVzIiwibnVtYmVyIiwiYXJyYXlPZiIsInNoYXBlIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQUVlLE1BQU1BLFVBQU4sU0FBeUJDLGVBQU1DLFNBQS9CLENBQXlDO0FBZ0J0REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FBTjtBQUNBLDJCQUFTLElBQVQsRUFBZSxXQUFmO0FBQ0Q7O0FBRURDLEVBQUFBLE1BQU0sR0FBRztBQUNQLHdCQUF3QyxLQUFLRCxLQUE3QztBQUFBLFVBQU07QUFBQ0UsTUFBQUEsTUFBRDtBQUFTQyxNQUFBQTtBQUFULEtBQU47QUFBQSxVQUE4QkMsTUFBOUIsbUVBRE8sQ0FDNkM7OztBQUNwRCxVQUFNQyxJQUFJLEdBQUcsS0FBS0MsYUFBTCxDQUFtQkosTUFBbkIsQ0FBYjtBQUVBLFdBQ0Usb0NBQVNFLE1BQVQsRUFDR0MsSUFBSSxDQUFDRSxHQUFMLENBQVMsS0FBS0MsU0FBZCxDQURILENBREY7QUFLRDs7QUFFREYsRUFBQUEsYUFBYSxDQUFDSixNQUFELEVBQVM7QUFDcEIsVUFBTU8sS0FBSyxHQUFHUCxNQUFNLENBQUNRLE1BQVAsQ0FBYyxDQUFDQyxHQUFELEVBQU1DLElBQU4sS0FBZUQsR0FBRyxHQUFHQyxJQUFJLENBQUNDLEtBQXhDLEVBQStDLENBQS9DLENBQWQ7QUFDQSxRQUFJQyxXQUFXLEdBQUcsQ0FBbEI7QUFFQSxXQUFPWixNQUFNLENBQUNLLEdBQVAsQ0FBVyxVQUF3QjtBQUFBLFVBQXZCO0FBQUNNLFFBQUFBO0FBQUQsT0FBdUI7QUFBQSxVQUFaVCxNQUFZOztBQUN4QyxZQUFNVyxLQUFLO0FBQ1RDLFFBQUFBLE1BQU0sRUFBRUgsS0FBSyxHQUFHSixLQUFSLEdBQWdCLEdBRGY7QUFFVFEsUUFBQUEsUUFBUSxFQUFFSDtBQUZELFNBR05WLE1BSE0sQ0FBWDs7QUFLQVUsTUFBQUEsV0FBVyxJQUFJQyxLQUFLLENBQUNDLE1BQXJCO0FBQ0EsYUFBT0QsS0FBUDtBQUNELEtBUk0sQ0FBUDtBQVNEOztBQUVEUCxFQUFBQSxTQUFTLENBQUM7QUFBQ1EsSUFBQUEsTUFBRDtBQUFTQyxJQUFBQSxRQUFUO0FBQW1CQyxJQUFBQSxJQUFuQjtBQUF5QkMsSUFBQUE7QUFBekIsR0FBRCxFQUFzQztBQUM3QyxXQUNFO0FBQ0UsTUFBQSxHQUFHLEVBQUVELElBRFA7QUFFRSxNQUFBLEVBQUUsRUFBQyxJQUZMO0FBR0UsTUFBQSxFQUFFLEVBQUMsSUFITDtBQUlFLE1BQUEsQ0FBQyxFQUFDLG1CQUpKO0FBS0UsTUFBQSxJQUFJLEVBQUMsYUFMUDtBQU1FLE1BQUEsU0FBUyxFQUFHLGNBQWFBLElBQUssRUFOaEM7QUFPRSxNQUFBLFVBQVUsRUFBQyxLQVBiO0FBUUUsTUFBQSxXQUFXLEVBQUMsR0FSZDtBQVNFLE1BQUEsZUFBZSxFQUFHLEdBQUVGLE1BQU8sSUFBRyxNQUFNQSxNQUFPLEVBVDdDO0FBVUUsTUFBQSxnQkFBZ0IsRUFBRyxHQUFFLE1BQU1DLFFBQU4sR0FBaUIsS0FBS2pCLEtBQUwsQ0FBV0csVUFBVztBQVY5RCxNQURGO0FBY0Q7O0FBOURxRDs7OztnQkFBbkNQLFUsZUFDQTtBQUNqQk8sRUFBQUEsVUFBVSxFQUFFaUIsbUJBQVVDLE1BREw7QUFFakJuQixFQUFBQSxNQUFNLEVBQUVrQixtQkFBVUUsT0FBVixDQUNORixtQkFBVUcsS0FBVixDQUFnQjtBQUNkTCxJQUFBQSxJQUFJLEVBQUVFLG1CQUFVSSxNQURGO0FBRWRMLElBQUFBLFNBQVMsRUFBRUMsbUJBQVVJLE1BRlA7QUFHZFgsSUFBQUEsS0FBSyxFQUFFTyxtQkFBVUM7QUFISCxHQUFoQixDQURNO0FBRlMsQzs7Z0JBREF6QixVLGtCQVlHO0FBQ3BCTyxFQUFBQSxVQUFVLEVBQUU7QUFEUSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCB7YXV0b2JpbmR9IGZyb20gJy4uL2hlbHBlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb251dENoYXJ0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBiYXNlT2Zmc2V0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHNsaWNlczogUHJvcFR5cGVzLmFycmF5T2YoXG4gICAgICBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICB0eXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGNvdW50OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgfSksXG4gICAgKSxcbiAgfVxuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgYmFzZU9mZnNldDogMjUsXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBhdXRvYmluZCh0aGlzLCAncmVuZGVyQXJjJyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3NsaWNlcywgYmFzZU9mZnNldCwgLi4ub3RoZXJzfSA9IHRoaXMucHJvcHM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBjb25zdCBhcmNzID0gdGhpcy5jYWxjdWxhdGVBcmNzKHNsaWNlcyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHN2ZyB7Li4ub3RoZXJzfT5cbiAgICAgICAge2FyY3MubWFwKHRoaXMucmVuZGVyQXJjKX1cbiAgICAgIDwvc3ZnPlxuICAgICk7XG4gIH1cblxuICBjYWxjdWxhdGVBcmNzKHNsaWNlcykge1xuICAgIGNvbnN0IHRvdGFsID0gc2xpY2VzLnJlZHVjZSgoYWNjLCBpdGVtKSA9PiBhY2MgKyBpdGVtLmNvdW50LCAwKTtcbiAgICBsZXQgbGVuZ3RoU29GYXIgPSAwO1xuXG4gICAgcmV0dXJuIHNsaWNlcy5tYXAoKHtjb3VudCwgLi4ub3RoZXJzfSkgPT4ge1xuICAgICAgY29uc3QgcGllY2UgPSB7XG4gICAgICAgIGxlbmd0aDogY291bnQgLyB0b3RhbCAqIDEwMCxcbiAgICAgICAgcG9zaXRpb246IGxlbmd0aFNvRmFyLFxuICAgICAgICAuLi5vdGhlcnMsXG4gICAgICB9O1xuICAgICAgbGVuZ3RoU29GYXIgKz0gcGllY2UubGVuZ3RoO1xuICAgICAgcmV0dXJuIHBpZWNlO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyQXJjKHtsZW5ndGgsIHBvc2l0aW9uLCB0eXBlLCBjbGFzc05hbWV9KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxjaXJjbGVcbiAgICAgICAga2V5PXt0eXBlfVxuICAgICAgICBjeD1cIjIxXCJcbiAgICAgICAgY3k9XCIyMVwiXG4gICAgICAgIHI9XCIxNS45MTU0OTQzMDkxODk1NFwiXG4gICAgICAgIGZpbGw9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRvbnV0LXJpbmctJHt0eXBlfWB9XG4gICAgICAgIHBhdGhMZW5ndGg9XCIxMDBcIlxuICAgICAgICBzdHJva2VXaWR0aD1cIjNcIlxuICAgICAgICBzdHJva2VEYXNoYXJyYXk9e2Ake2xlbmd0aH0gJHsxMDAgLSBsZW5ndGh9YH1cbiAgICAgICAgc3Ryb2tlRGFzaG9mZnNldD17YCR7MTAwIC0gcG9zaXRpb24gKyB0aGlzLnByb3BzLmJhc2VPZmZzZXR9YH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxufVxuIl19