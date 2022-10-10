"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _commitDetailView = _interopRequireDefault(require("../views/commit-detail-view"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommitDetailController extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "toggleMessage", () => {
      return new Promise(resolve => {
        this.setState(prevState => ({
          messageOpen: !prevState.messageOpen
        }), resolve);
      });
    });

    this.state = {
      messageCollapsible: this.props.commit.isBodyLong(),
      messageOpen: !this.props.commit.isBodyLong()
    };
  }

  render() {
    return _react.default.createElement(_commitDetailView.default, _extends({
      messageCollapsible: this.state.messageCollapsible,
      messageOpen: this.state.messageOpen,
      toggleMessage: this.toggleMessage
    }, this.props));
  }

}

exports.default = CommitDetailController;

_defineProperty(CommitDetailController, "propTypes", _objectSpread2({}, _commitDetailView.default.drilledPropTypes, {
  commit: _propTypes.default.object.isRequired
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250cm9sbGVycy9jb21taXQtZGV0YWlsLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiQ29tbWl0RGV0YWlsQ29udHJvbGxlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0U3RhdGUiLCJwcmV2U3RhdGUiLCJtZXNzYWdlT3BlbiIsInN0YXRlIiwibWVzc2FnZUNvbGxhcHNpYmxlIiwiY29tbWl0IiwiaXNCb2R5TG9uZyIsInJlbmRlciIsInRvZ2dsZU1lc3NhZ2UiLCJDb21taXREZXRhaWxWaWV3IiwiZHJpbGxlZFByb3BUeXBlcyIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQUVlLE1BQU1BLHNCQUFOLFNBQXFDQyxlQUFNQyxTQUEzQyxDQUFxRDtBQU9sRUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDakIsVUFBTUEsS0FBTjs7QUFEaUIsMkNBb0JILE1BQU07QUFDcEIsYUFBTyxJQUFJQyxPQUFKLENBQVlDLE9BQU8sSUFBSTtBQUM1QixhQUFLQyxRQUFMLENBQWNDLFNBQVMsS0FBSztBQUFDQyxVQUFBQSxXQUFXLEVBQUUsQ0FBQ0QsU0FBUyxDQUFDQztBQUF6QixTQUFMLENBQXZCLEVBQW9FSCxPQUFwRTtBQUNELE9BRk0sQ0FBUDtBQUdELEtBeEJrQjs7QUFHakIsU0FBS0ksS0FBTCxHQUFhO0FBQ1hDLE1BQUFBLGtCQUFrQixFQUFFLEtBQUtQLEtBQUwsQ0FBV1EsTUFBWCxDQUFrQkMsVUFBbEIsRUFEVDtBQUVYSixNQUFBQSxXQUFXLEVBQUUsQ0FBQyxLQUFLTCxLQUFMLENBQVdRLE1BQVgsQ0FBa0JDLFVBQWxCO0FBRkgsS0FBYjtBQUlEOztBQUVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUNFLDZCQUFDLHlCQUFEO0FBQ0UsTUFBQSxrQkFBa0IsRUFBRSxLQUFLSixLQUFMLENBQVdDLGtCQURqQztBQUVFLE1BQUEsV0FBVyxFQUFFLEtBQUtELEtBQUwsQ0FBV0QsV0FGMUI7QUFHRSxNQUFBLGFBQWEsRUFBRSxLQUFLTTtBQUh0QixPQUlNLEtBQUtYLEtBSlgsRUFERjtBQVFEOztBQXpCaUU7Ozs7Z0JBQS9DSixzQixrQ0FFZGdCLDBCQUFpQkMsZ0I7QUFFcEJMLEVBQUFBLE1BQU0sRUFBRU0sbUJBQVVDLE1BQVYsQ0FBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCBDb21taXREZXRhaWxWaWV3IGZyb20gJy4uL3ZpZXdzL2NvbW1pdC1kZXRhaWwtdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1pdERldGFpbENvbnRyb2xsZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC4uLkNvbW1pdERldGFpbFZpZXcuZHJpbGxlZFByb3BUeXBlcyxcblxuICAgIGNvbW1pdDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWVzc2FnZUNvbGxhcHNpYmxlOiB0aGlzLnByb3BzLmNvbW1pdC5pc0JvZHlMb25nKCksXG4gICAgICBtZXNzYWdlT3BlbjogIXRoaXMucHJvcHMuY29tbWl0LmlzQm9keUxvbmcoKSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29tbWl0RGV0YWlsVmlld1xuICAgICAgICBtZXNzYWdlQ29sbGFwc2libGU9e3RoaXMuc3RhdGUubWVzc2FnZUNvbGxhcHNpYmxlfVxuICAgICAgICBtZXNzYWdlT3Blbj17dGhpcy5zdGF0ZS5tZXNzYWdlT3Blbn1cbiAgICAgICAgdG9nZ2xlTWVzc2FnZT17dGhpcy50b2dnbGVNZXNzYWdlfVxuICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHRvZ2dsZU1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHttZXNzYWdlT3BlbjogIXByZXZTdGF0ZS5tZXNzYWdlT3Blbn0pLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19