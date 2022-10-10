"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _helpers = require("../helpers");

var _propTypes2 = require("../prop-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `Panel` renders a React component into an Atom panel. Specify the location via the `location` prop, and any
 * additional options to the `addXPanel` method in the `options` prop.
 *
 * You can get the underlying Atom panel via `getPanel()`, but you should consider controlling the panel via React and
 * the Panel component instead.
 */
class Panel extends _react.default.Component {
  constructor(props) {
    super(props);
    this.subscriptions = new _eventKit.CompositeDisposable();
    this.panel = null;
    this.didCloseItem = false;
    this.domNode = document.createElement('div');
    this.domNode.className = 'react-atom-panel';
  }

  componentDidMount() {
    this.setupPanel();
  }

  render() {
    return _reactDom.default.createPortal(this.props.children, this.domNode);
  }

  setupPanel() {
    if (this.panel) {
      return;
    } // "left" => "Left"


    const location = this.props.location.substr(0, 1).toUpperCase() + this.props.location.substr(1);
    const methodName = `add${location}Panel`;
    const item = (0, _helpers.createItem)(this.domNode, this.props.itemHolder);

    const options = _objectSpread2({}, this.props.options, {
      item
    });

    this.panel = this.props.workspace[methodName](options);
    this.subscriptions.add(this.panel.onDidDestroy(() => {
      this.didCloseItem = true;
      this.props.onDidClosePanel(this.panel);
    }));
  }

  componentWillUnmount() {
    this.subscriptions.dispose();

    if (this.panel) {
      this.panel.destroy();
    }
  }

  getPanel() {
    return this.panel;
  }

}

exports.default = Panel;

_defineProperty(Panel, "propTypes", {
  workspace: _propTypes.default.object.isRequired,
  location: _propTypes.default.oneOf(['top', 'bottom', 'left', 'right', 'header', 'footer', 'modal']).isRequired,
  children: _propTypes.default.element.isRequired,
  options: _propTypes.default.object,
  onDidClosePanel: _propTypes.default.func,
  itemHolder: _propTypes2.RefHolderPropType
});

_defineProperty(Panel, "defaultProps", {
  options: {},
  onDidClosePanel: panel => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hdG9tL3BhbmVsLmpzIl0sIm5hbWVzIjpbIlBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJwYW5lbCIsImRpZENsb3NlSXRlbSIsImRvbU5vZGUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJjb21wb25lbnREaWRNb3VudCIsInNldHVwUGFuZWwiLCJyZW5kZXIiLCJSZWFjdERPTSIsImNyZWF0ZVBvcnRhbCIsImNoaWxkcmVuIiwibG9jYXRpb24iLCJzdWJzdHIiLCJ0b1VwcGVyQ2FzZSIsIm1ldGhvZE5hbWUiLCJpdGVtIiwiaXRlbUhvbGRlciIsIm9wdGlvbnMiLCJ3b3Jrc3BhY2UiLCJhZGQiLCJvbkRpZERlc3Ryb3kiLCJvbkRpZENsb3NlUGFuZWwiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImRpc3Bvc2UiLCJkZXN0cm95IiwiZ2V0UGFuZWwiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwib25lT2YiLCJlbGVtZW50IiwiZnVuYyIsIlJlZkhvbGRlclByb3BUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7Ozs7QUFPZSxNQUFNQSxLQUFOLFNBQW9CQyxlQUFNQyxTQUExQixDQUFvQztBQWlCakRDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47QUFFQSxTQUFLQyxhQUFMLEdBQXFCLElBQUlDLDZCQUFKLEVBQXJCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLElBQWI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsU0FBS0MsT0FBTCxHQUFlQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBZjtBQUNBLFNBQUtGLE9BQUwsQ0FBYUcsU0FBYixHQUF5QixrQkFBekI7QUFDRDs7QUFFREMsRUFBQUEsaUJBQWlCLEdBQUc7QUFDbEIsU0FBS0MsVUFBTDtBQUNEOztBQUVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUFPQyxrQkFBU0MsWUFBVCxDQUNMLEtBQUtiLEtBQUwsQ0FBV2MsUUFETixFQUVMLEtBQUtULE9BRkEsQ0FBUDtBQUlEOztBQUVESyxFQUFBQSxVQUFVLEdBQUc7QUFDWCxRQUFJLEtBQUtQLEtBQVQsRUFBZ0I7QUFBRTtBQUFTLEtBRGhCLENBR1g7OztBQUNBLFVBQU1ZLFFBQVEsR0FBRyxLQUFLZixLQUFMLENBQVdlLFFBQVgsQ0FBb0JDLE1BQXBCLENBQTJCLENBQTNCLEVBQThCLENBQTlCLEVBQWlDQyxXQUFqQyxLQUFpRCxLQUFLakIsS0FBTCxDQUFXZSxRQUFYLENBQW9CQyxNQUFwQixDQUEyQixDQUEzQixDQUFsRTtBQUNBLFVBQU1FLFVBQVUsR0FBSSxNQUFLSCxRQUFTLE9BQWxDO0FBRUEsVUFBTUksSUFBSSxHQUFHLHlCQUFXLEtBQUtkLE9BQWhCLEVBQXlCLEtBQUtMLEtBQUwsQ0FBV29CLFVBQXBDLENBQWI7O0FBQ0EsVUFBTUMsT0FBTyxzQkFBTyxLQUFLckIsS0FBTCxDQUFXcUIsT0FBbEI7QUFBMkJGLE1BQUFBO0FBQTNCLE1BQWI7O0FBQ0EsU0FBS2hCLEtBQUwsR0FBYSxLQUFLSCxLQUFMLENBQVdzQixTQUFYLENBQXFCSixVQUFyQixFQUFpQ0csT0FBakMsQ0FBYjtBQUNBLFNBQUtwQixhQUFMLENBQW1Cc0IsR0FBbkIsQ0FDRSxLQUFLcEIsS0FBTCxDQUFXcUIsWUFBWCxDQUF3QixNQUFNO0FBQzVCLFdBQUtwQixZQUFMLEdBQW9CLElBQXBCO0FBQ0EsV0FBS0osS0FBTCxDQUFXeUIsZUFBWCxDQUEyQixLQUFLdEIsS0FBaEM7QUFDRCxLQUhELENBREY7QUFNRDs7QUFFRHVCLEVBQUFBLG9CQUFvQixHQUFHO0FBQ3JCLFNBQUt6QixhQUFMLENBQW1CMEIsT0FBbkI7O0FBQ0EsUUFBSSxLQUFLeEIsS0FBVCxFQUFnQjtBQUNkLFdBQUtBLEtBQUwsQ0FBV3lCLE9BQVg7QUFDRDtBQUNGOztBQUVEQyxFQUFBQSxRQUFRLEdBQUc7QUFDVCxXQUFPLEtBQUsxQixLQUFaO0FBQ0Q7O0FBakVnRDs7OztnQkFBOUJQLEssZUFDQTtBQUNqQjBCLEVBQUFBLFNBQVMsRUFBRVEsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFg7QUFFakJqQixFQUFBQSxRQUFRLEVBQUVlLG1CQUFVRyxLQUFWLENBQWdCLENBQ3hCLEtBRHdCLEVBQ2pCLFFBRGlCLEVBQ1AsTUFETyxFQUNDLE9BREQsRUFDVSxRQURWLEVBQ29CLFFBRHBCLEVBQzhCLE9BRDlCLENBQWhCLEVBRVBELFVBSmM7QUFLakJsQixFQUFBQSxRQUFRLEVBQUVnQixtQkFBVUksT0FBVixDQUFrQkYsVUFMWDtBQU1qQlgsRUFBQUEsT0FBTyxFQUFFUyxtQkFBVUMsTUFORjtBQU9qQk4sRUFBQUEsZUFBZSxFQUFFSyxtQkFBVUssSUFQVjtBQVFqQmYsRUFBQUEsVUFBVSxFQUFFZ0I7QUFSSyxDOztnQkFEQXhDLEssa0JBWUc7QUFDcEJ5QixFQUFBQSxPQUFPLEVBQUUsRUFEVztBQUVwQkksRUFBQUEsZUFBZSxFQUFFdEIsS0FBSyxJQUFJLENBQUU7QUFGUixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnZXZlbnQta2l0JztcblxuaW1wb3J0IHtjcmVhdGVJdGVtfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7UmVmSG9sZGVyUHJvcFR5cGV9IGZyb20gJy4uL3Byb3AtdHlwZXMnO1xuXG4vKipcbiAqIGBQYW5lbGAgcmVuZGVycyBhIFJlYWN0IGNvbXBvbmVudCBpbnRvIGFuIEF0b20gcGFuZWwuIFNwZWNpZnkgdGhlIGxvY2F0aW9uIHZpYSB0aGUgYGxvY2F0aW9uYCBwcm9wLCBhbmQgYW55XG4gKiBhZGRpdGlvbmFsIG9wdGlvbnMgdG8gdGhlIGBhZGRYUGFuZWxgIG1ldGhvZCBpbiB0aGUgYG9wdGlvbnNgIHByb3AuXG4gKlxuICogWW91IGNhbiBnZXQgdGhlIHVuZGVybHlpbmcgQXRvbSBwYW5lbCB2aWEgYGdldFBhbmVsKClgLCBidXQgeW91IHNob3VsZCBjb25zaWRlciBjb250cm9sbGluZyB0aGUgcGFuZWwgdmlhIFJlYWN0IGFuZFxuICogdGhlIFBhbmVsIGNvbXBvbmVudCBpbnN0ZWFkLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgd29ya3NwYWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgbG9jYXRpb246IFByb3BUeXBlcy5vbmVPZihbXG4gICAgICAndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ3JpZ2h0JywgJ2hlYWRlcicsICdmb290ZXInLCAnbW9kYWwnLFxuICAgIF0pLmlzUmVxdWlyZWQsXG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5lbGVtZW50LmlzUmVxdWlyZWQsXG4gICAgb3B0aW9uczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbkRpZENsb3NlUGFuZWw6IFByb3BUeXBlcy5mdW5jLFxuICAgIGl0ZW1Ib2xkZXI6IFJlZkhvbGRlclByb3BUeXBlLFxuICB9XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBvcHRpb25zOiB7fSxcbiAgICBvbkRpZENsb3NlUGFuZWw6IHBhbmVsID0+IHt9LFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIHRoaXMuZGlkQ2xvc2VJdGVtID0gZmFsc2U7XG4gICAgdGhpcy5kb21Ob2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kb21Ob2RlLmNsYXNzTmFtZSA9ICdyZWFjdC1hdG9tLXBhbmVsJztcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2V0dXBQYW5lbCgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdERPTS5jcmVhdGVQb3J0YWwoXG4gICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLFxuICAgICAgdGhpcy5kb21Ob2RlLFxuICAgICk7XG4gIH1cblxuICBzZXR1cFBhbmVsKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB7IHJldHVybjsgfVxuXG4gICAgLy8gXCJsZWZ0XCIgPT4gXCJMZWZ0XCJcbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMucHJvcHMubG9jYXRpb24uc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnByb3BzLmxvY2F0aW9uLnN1YnN0cigxKTtcbiAgICBjb25zdCBtZXRob2ROYW1lID0gYGFkZCR7bG9jYXRpb259UGFuZWxgO1xuXG4gICAgY29uc3QgaXRlbSA9IGNyZWF0ZUl0ZW0odGhpcy5kb21Ob2RlLCB0aGlzLnByb3BzLml0ZW1Ib2xkZXIpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7Li4udGhpcy5wcm9wcy5vcHRpb25zLCBpdGVtfTtcbiAgICB0aGlzLnBhbmVsID0gdGhpcy5wcm9wcy53b3Jrc3BhY2VbbWV0aG9kTmFtZV0ob3B0aW9ucyk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMucGFuZWwub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5kaWRDbG9zZUl0ZW0gPSB0cnVlO1xuICAgICAgICB0aGlzLnByb3BzLm9uRGlkQ2xvc2VQYW5lbCh0aGlzLnBhbmVsKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRQYW5lbCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lbDtcbiAgfVxufVxuIl19