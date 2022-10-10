"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Accordion extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _helpers.autobind)(this, 'toggle');
    this.state = {
      expanded: true
    };
  }

  render() {
    return _react.default.createElement("details", {
      className: "github-Accordion",
      open: this.state.expanded
    }, _react.default.createElement("summary", {
      className: "github-Accordion-header",
      onClick: this.toggle
    }, this.renderHeader()), _react.default.createElement("main", {
      className: "github-Accordion-content"
    }, this.renderContent()));
  }

  renderHeader() {
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement("span", {
      className: "github-Accordion--leftTitle"
    }, this.props.leftTitle), this.props.rightTitle && _react.default.createElement("span", {
      className: "github-Accordion--rightTitle"
    }, this.props.rightTitle), this.props.reviewsButton());
  }

  renderContent() {
    if (this.props.isLoading) {
      const Loading = this.props.loadingComponent;
      return _react.default.createElement(Loading, null);
    }

    if (this.props.results.length === 0) {
      const Empty = this.props.emptyComponent;
      return _react.default.createElement(Empty, null);
    }

    if (!this.state.expanded) {
      return null;
    }

    const More = this.props.moreComponent;
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement("ul", {
      className: "github-Accordion-list"
    }, this.props.results.map((item, index) => {
      const key = item.key !== undefined ? item.key : index;
      return _react.default.createElement("li", {
        className: "github-Accordion-listItem",
        key: key,
        onClick: () => this.props.onClickItem(item)
      }, this.props.children(item));
    })), this.props.results.length < this.props.total && _react.default.createElement(More, null));
  }

  toggle(e) {
    e.preventDefault();
    return new Promise(resolve => {
      this.setState(prevState => ({
        expanded: !prevState.expanded
      }), resolve);
    });
  }

}

exports.default = Accordion;

_defineProperty(Accordion, "propTypes", {
  leftTitle: _propTypes.default.string.isRequired,
  rightTitle: _propTypes.default.string,
  results: _propTypes.default.arrayOf(_propTypes.default.any).isRequired,
  total: _propTypes.default.number.isRequired,
  isLoading: _propTypes.default.bool.isRequired,
  loadingComponent: _propTypes.default.func,
  emptyComponent: _propTypes.default.func,
  moreComponent: _propTypes.default.func,
  reviewsButton: _propTypes.default.func,
  onClickItem: _propTypes.default.func,
  children: _propTypes.default.func.isRequired
});

_defineProperty(Accordion, "defaultProps", {
  loadingComponent: () => null,
  emptyComponent: () => null,
  moreComponent: () => null,
  onClickItem: () => {},
  reviewsButton: () => null
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9hY2NvcmRpb24uanMiXSwibmFtZXMiOlsiQWNjb3JkaW9uIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGUiLCJleHBhbmRlZCIsInJlbmRlciIsInRvZ2dsZSIsInJlbmRlckhlYWRlciIsInJlbmRlckNvbnRlbnQiLCJsZWZ0VGl0bGUiLCJyaWdodFRpdGxlIiwicmV2aWV3c0J1dHRvbiIsImlzTG9hZGluZyIsIkxvYWRpbmciLCJsb2FkaW5nQ29tcG9uZW50IiwicmVzdWx0cyIsImxlbmd0aCIsIkVtcHR5IiwiZW1wdHlDb21wb25lbnQiLCJNb3JlIiwibW9yZUNvbXBvbmVudCIsIm1hcCIsIml0ZW0iLCJpbmRleCIsImtleSIsInVuZGVmaW5lZCIsIm9uQ2xpY2tJdGVtIiwiY2hpbGRyZW4iLCJ0b3RhbCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0U3RhdGUiLCJwcmV2U3RhdGUiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsImFueSIsIm51bWJlciIsImJvb2wiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBRUE7Ozs7Ozs7O0FBRWUsTUFBTUEsU0FBTixTQUF3QkMsZUFBTUMsU0FBOUIsQ0FBd0M7QUF1QnJEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNqQixVQUFNQSxLQUFOO0FBQ0EsMkJBQVMsSUFBVCxFQUFlLFFBQWY7QUFFQSxTQUFLQyxLQUFMLEdBQWE7QUFDWEMsTUFBQUEsUUFBUSxFQUFFO0FBREMsS0FBYjtBQUdEOztBQUVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUNFO0FBQVMsTUFBQSxTQUFTLEVBQUMsa0JBQW5CO0FBQXNDLE1BQUEsSUFBSSxFQUFFLEtBQUtGLEtBQUwsQ0FBV0M7QUFBdkQsT0FDRTtBQUFTLE1BQUEsU0FBUyxFQUFDLHlCQUFu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QUFBLGdCQUFnQixFQUFFcUIsbUJBQVVPLElBTlg7QUFPakJ4QixFQUFBQSxjQUFjLEVBQUVpQixtQkFBVU8sSUFQVDtBQVFqQnRCLEVBQUFBLGFBQWEsRUFBRWUsbUJBQVVPLElBUlI7QUFTakIvQixFQUFBQSxhQUFhLEVBQUV3QixtQkFBVU8sSUFUUjtBQVVqQmhCLEVBQUFBLFdBQVcsRUFBRVMsbUJBQVVPLElBVk47QUFXakJmLEVBQUFBLFFBQVEsRUFBRVEsbUJBQVVPLElBQVYsQ0FBZUw7QUFYUixDOztnQkFEQXZDLFMsa0JBZUc7QUFDcEJnQixFQUFBQSxnQkFBZ0IsRUFBRSxNQUFNLElBREo7QUFFcEJJLEVBQUFBLGNBQWMsRUFBRSxNQUFNLElBRkY7QUFHcEJFLEVBQUFBLGFBQWEsRUFBRSxNQUFNLElBSEQ7QUFJcEJNLEVBQUFBLFdBQVcsRUFBRSxNQUFNLENBQUUsQ0FKRDtBQUtwQmYsRUFBQUEsYUFBYSxFQUFFLE1BQU07QUFMRCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCB7YXV0b2JpbmR9IGZyb20gJy4uL2hlbHBlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2NvcmRpb24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGxlZnRUaXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHJpZ2h0VGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVzdWx0czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLmFueSkuaXNSZXF1aXJlZCxcbiAgICB0b3RhbDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGlzTG9hZGluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBsb2FkaW5nQ29tcG9uZW50OiBQcm9wVHlwZXMuZnVuYyxcbiAgICBlbXB0eUNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbW9yZUNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmV2aWV3c0J1dHRvbjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DbGlja0l0ZW06IFByb3BUeXBlcy5mdW5jLFxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbG9hZGluZ0NvbXBvbmVudDogKCkgPT4gbnVsbCxcbiAgICBlbXB0eUNvbXBvbmVudDogKCkgPT4gbnVsbCxcbiAgICBtb3JlQ29tcG9uZW50OiAoKSA9PiBudWxsLFxuICAgIG9uQ2xpY2tJdGVtOiAoKSA9PiB7fSxcbiAgICByZXZpZXdzQnV0dG9uOiAoKSA9PiBudWxsLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMsICd0b2dnbGUnKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBleHBhbmRlZDogdHJ1ZSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGV0YWlscyBjbGFzc05hbWU9XCJnaXRodWItQWNjb3JkaW9uXCIgb3Blbj17dGhpcy5zdGF0ZS5leHBhbmRlZH0+XG4gICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cImdpdGh1Yi1BY2NvcmRpb24taGVhZGVyXCIgb25DbGljaz17dGhpcy50b2dnbGV9PlxuICAgICAgICAgIHt0aGlzLnJlbmRlckhlYWRlcigpfVxuICAgICAgICA8L3N1bW1hcnk+XG4gICAgICAgIDxtYWluIGNsYXNzTmFtZT1cImdpdGh1Yi1BY2NvcmRpb24tY29udGVudFwiPlxuICAgICAgICAgIHt0aGlzLnJlbmRlckNvbnRlbnQoKX1cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9kZXRhaWxzPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJIZWFkZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ2l0aHViLUFjY29yZGlvbi0tbGVmdFRpdGxlXCI+XG4gICAgICAgICAge3RoaXMucHJvcHMubGVmdFRpdGxlfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIHt0aGlzLnByb3BzLnJpZ2h0VGl0bGUgJiYgKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1BY2NvcmRpb24tLXJpZ2h0VGl0bGVcIj5cbiAgICAgICAgICAgIHt0aGlzLnByb3BzLnJpZ2h0VGl0bGV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICB7dGhpcy5wcm9wcy5yZXZpZXdzQnV0dG9uKCl9XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb250ZW50KCkge1xuICAgIGlmICh0aGlzLnByb3BzLmlzTG9hZGluZykge1xuICAgICAgY29uc3QgTG9hZGluZyA9IHRoaXMucHJvcHMubG9hZGluZ0NvbXBvbmVudDtcbiAgICAgIHJldHVybiA8TG9hZGluZyAvPjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5yZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgRW1wdHkgPSB0aGlzLnByb3BzLmVtcHR5Q29tcG9uZW50O1xuICAgICAgcmV0dXJuIDxFbXB0eSAvPjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuZXhwYW5kZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IE1vcmUgPSB0aGlzLnByb3BzLm1vcmVDb21wb25lbnQ7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZyYWdtZW50PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZ2l0aHViLUFjY29yZGlvbi1saXN0XCI+XG4gICAgICAgICAge3RoaXMucHJvcHMucmVzdWx0cy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBpdGVtLmtleSAhPT0gdW5kZWZpbmVkID8gaXRlbS5rZXkgOiBpbmRleDtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJnaXRodWItQWNjb3JkaW9uLWxpc3RJdGVtXCIga2V5PXtrZXl9IG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25DbGlja0l0ZW0oaXRlbSl9PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVuKGl0ZW0pfVxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC91bD5cbiAgICAgICAge3RoaXMucHJvcHMucmVzdWx0cy5sZW5ndGggPCB0aGlzLnByb3BzLnRvdGFsICYmIDxNb3JlIC8+fVxuICAgICAgPC9GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgdG9nZ2xlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtleHBhbmRlZDogIXByZXZTdGF0ZS5leHBhbmRlZH0pLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19