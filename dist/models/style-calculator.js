"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventKit = require("event-kit");

var _helpers = require("../helpers");

class StyleCalculator {
  constructor(styles, config) {
    (0, _helpers.autobind)(this, 'updateStyles');
    this.styles = styles;
    this.config = config;
  }

  startWatching(sourcePath, configsToWatch, getStylesheetFn) {
    const subscriptions = new _eventKit.CompositeDisposable();

    const updateStyles = () => {
      this.updateStyles(sourcePath, getStylesheetFn);
    };

    configsToWatch.forEach(configToWatch => {
      subscriptions.add(this.config.onDidChange(configToWatch, updateStyles));
    });
    updateStyles();
    return subscriptions;
  }

  updateStyles(sourcePath, getStylesheetFn) {
    const stylesheet = getStylesheetFn(this.config);
    this.styles.addStyleSheet(stylesheet, {
      sourcePath,
      priority: 0
    });
  }

}

exports.default = StyleCalculator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvc3R5bGUtY2FsY3VsYXRvci5qcyJdLCJuYW1lcyI6WyJTdHlsZUNhbGN1bGF0b3IiLCJjb25zdHJ1Y3RvciIsInN0eWxlcyIsImNvbmZpZyIsInN0YXJ0V2F0Y2hpbmciLCJzb3VyY2VQYXRoIiwiY29uZmlnc1RvV2F0Y2giLCJnZXRTdHlsZXNoZWV0Rm4iLCJzdWJzY3JpcHRpb25zIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsInVwZGF0ZVN0eWxlcyIsImZvckVhY2giLCJjb25maWdUb1dhdGNoIiwiYWRkIiwib25EaWRDaGFuZ2UiLCJzdHlsZXNoZWV0IiwiYWRkU3R5bGVTaGVldCIsInByaW9yaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7O0FBRWUsTUFBTUEsZUFBTixDQUFzQjtBQUNuQ0MsRUFBQUEsV0FBVyxDQUFDQyxNQUFELEVBQVNDLE1BQVQsRUFBaUI7QUFDMUIsMkJBQVMsSUFBVCxFQUFlLGNBQWY7QUFFQSxTQUFLRCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7QUFFREMsRUFBQUEsYUFBYSxDQUFDQyxVQUFELEVBQWFDLGNBQWIsRUFBNkJDLGVBQTdCLEVBQThDO0FBQ3pELFVBQU1DLGFBQWEsR0FBRyxJQUFJQyw2QkFBSixFQUF0Qjs7QUFDQSxVQUFNQyxZQUFZLEdBQUcsTUFBTTtBQUN6QixXQUFLQSxZQUFMLENBQWtCTCxVQUFsQixFQUE4QkUsZUFBOUI7QUFDRCxLQUZEOztBQUdBRCxJQUFBQSxjQUFjLENBQUNLLE9BQWYsQ0FBdUJDLGFBQWEsSUFBSTtBQUN0Q0osTUFBQUEsYUFBYSxDQUFDSyxHQUFkLENBQ0UsS0FBS1YsTUFBTCxDQUFZVyxXQUFaLENBQXdCRixhQUF4QixFQUF1Q0YsWUFBdkMsQ0FERjtBQUdELEtBSkQ7QUFLQUEsSUFBQUEsWUFBWTtBQUNaLFdBQU9GLGFBQVA7QUFDRDs7QUFFREUsRUFBQUEsWUFBWSxDQUFDTCxVQUFELEVBQWFFLGVBQWIsRUFBOEI7QUFDeEMsVUFBTVEsVUFBVSxHQUFHUixlQUFlLENBQUMsS0FBS0osTUFBTixDQUFsQztBQUNBLFNBQUtELE1BQUwsQ0FBWWMsYUFBWixDQUEwQkQsVUFBMUIsRUFBc0M7QUFBQ1YsTUFBQUEsVUFBRDtBQUFhWSxNQUFBQSxRQUFRLEVBQUU7QUFBdkIsS0FBdEM7QUFDRDs7QUF6QmtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuXG5pbXBvcnQge2F1dG9iaW5kfSBmcm9tICcuLi9oZWxwZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3R5bGVDYWxjdWxhdG9yIHtcbiAgY29uc3RydWN0b3Ioc3R5bGVzLCBjb25maWcpIHtcbiAgICBhdXRvYmluZCh0aGlzLCAndXBkYXRlU3R5bGVzJyk7XG5cbiAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIHN0YXJ0V2F0Y2hpbmcoc291cmNlUGF0aCwgY29uZmlnc1RvV2F0Y2gsIGdldFN0eWxlc2hlZXRGbikge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IHVwZGF0ZVN0eWxlcyA9ICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlU3R5bGVzKHNvdXJjZVBhdGgsIGdldFN0eWxlc2hlZXRGbik7XG4gICAgfTtcbiAgICBjb25maWdzVG9XYXRjaC5mb3JFYWNoKGNvbmZpZ1RvV2F0Y2ggPT4ge1xuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgIHRoaXMuY29uZmlnLm9uRGlkQ2hhbmdlKGNvbmZpZ1RvV2F0Y2gsIHVwZGF0ZVN0eWxlcyksXG4gICAgICApO1xuICAgIH0pO1xuICAgIHVwZGF0ZVN0eWxlcygpO1xuICAgIHJldHVybiBzdWJzY3JpcHRpb25zO1xuICB9XG5cbiAgdXBkYXRlU3R5bGVzKHNvdXJjZVBhdGgsIGdldFN0eWxlc2hlZXRGbikge1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBnZXRTdHlsZXNoZWV0Rm4odGhpcy5jb25maWcpO1xuICAgIHRoaXMuc3R5bGVzLmFkZFN0eWxlU2hlZXQoc3R5bGVzaGVldCwge3NvdXJjZVBhdGgsIHByaW9yaXR5OiAwfSk7XG4gIH1cbn1cbiJdfQ==