"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _propTypes2 = require("../prop-types");

var _relayNetworkLayerManager = _interopRequireDefault(require("../relay-network-layer-manager"));

var _keytarStrategy = require("../shared/keytar-strategy");

var _author = _interopRequireWildcard(require("../models/author"));

var _githubTabHeaderController = _interopRequireDefault(require("../controllers/github-tab-header-controller"));

var _graphql;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class GithubTabHeaderContainer extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderWithResult", ({
      error,
      props
    }) => {
      if (error || props === null) {
        return this.renderNoResult();
      } // eslint-disable-next-line react/prop-types


      const {
        email,
        name,
        avatarUrl,
        login
      } = props.viewer;
      return _react.default.createElement(_githubTabHeaderController.default, {
        user: new _author.default(email, name, login, false, avatarUrl) // Workspace
        ,
        currentWorkDir: this.props.currentWorkDir,
        contextLocked: this.props.contextLocked,
        getCurrentWorkDirs: this.props.getCurrentWorkDirs,
        changeWorkingDirectory: this.props.changeWorkingDirectory,
        setContextLock: this.props.setContextLock // Event Handlers
        ,
        onDidChangeWorkDirs: this.props.onDidChangeWorkDirs
      });
    });
  }

  render() {
    if (this.props.token == null || this.props.token instanceof Error || this.props.token === _keytarStrategy.UNAUTHENTICATED || this.props.token === _keytarStrategy.INSUFFICIENT) {
      return this.renderNoResult();
    }

    const environment = _relayNetworkLayerManager.default.getEnvironmentForHost(this.props.endpoint, this.props.token);

    const query = _graphql || (_graphql = function () {
      const node = require("./__generated__/githubTabHeaderContainerQuery.graphql");

      if (node.hash && node.hash !== "003bcc6b15469f788437eba2b4ce780b") {
        console.error("The definition of 'githubTabHeaderContainerQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
      }

      return require("./__generated__/githubTabHeaderContainerQuery.graphql");
    });

    return _react.default.createElement(_reactRelay.QueryRenderer, {
      environment: environment,
      variables: {},
      query: query,
      render: this.renderWithResult
    });
  }

  renderNoResult() {
    return _react.default.createElement(_githubTabHeaderController.default, {
      user: _author.nullAuthor // Workspace
      ,
      currentWorkDir: this.props.currentWorkDir,
      contextLocked: this.props.contextLocked,
      changeWorkingDirectory: this.props.changeWorkingDirectory,
      setContextLock: this.props.setContextLock,
      getCurrentWorkDirs: this.props.getCurrentWorkDirs // Event Handlers
      ,
      onDidChangeWorkDirs: this.props.onDidChangeWorkDirs
    });
  }

}

exports.default = GithubTabHeaderContainer;

_defineProperty(GithubTabHeaderContainer, "propTypes", {
  // Connection
  endpoint: _propTypes2.EndpointPropType.isRequired,
  token: _propTypes2.TokenPropType,
  // Workspace
  currentWorkDir: _propTypes.default.string,
  contextLocked: _propTypes.default.bool.isRequired,
  changeWorkingDirectory: _propTypes.default.func.isRequired,
  setContextLock: _propTypes.default.func.isRequired,
  getCurrentWorkDirs: _propTypes.default.func.isRequired,
  // Event Handlers
  onDidChangeWorkDirs: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250YWluZXJzL2dpdGh1Yi10YWItaGVhZGVyLWNvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJHaXRodWJUYWJIZWFkZXJDb250YWluZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImVycm9yIiwicHJvcHMiLCJyZW5kZXJOb1Jlc3VsdCIsImVtYWlsIiwibmFtZSIsImF2YXRhclVybCIsImxvZ2luIiwidmlld2VyIiwiQXV0aG9yIiwiY3VycmVudFdvcmtEaXIiLCJjb250ZXh0TG9ja2VkIiwiZ2V0Q3VycmVudFdvcmtEaXJzIiwiY2hhbmdlV29ya2luZ0RpcmVjdG9yeSIsInNldENvbnRleHRMb2NrIiwib25EaWRDaGFuZ2VXb3JrRGlycyIsInJlbmRlciIsInRva2VuIiwiRXJyb3IiLCJVTkFVVEhFTlRJQ0FURUQiLCJJTlNVRkZJQ0lFTlQiLCJlbnZpcm9ubWVudCIsIlJlbGF5TmV0d29ya0xheWVyTWFuYWdlciIsImdldEVudmlyb25tZW50Rm9ySG9zdCIsImVuZHBvaW50IiwicXVlcnkiLCJyZW5kZXJXaXRoUmVzdWx0IiwibnVsbEF1dGhvciIsIkVuZHBvaW50UHJvcFR5cGUiLCJpc1JlcXVpcmVkIiwiVG9rZW5Qcm9wVHlwZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFZSxNQUFNQSx3QkFBTixTQUF1Q0MsZUFBTUMsU0FBN0MsQ0FBdUQ7QUFBQTtBQUFBOztBQUFBLDhDQWlEakQsQ0FBQztBQUFDQyxNQUFBQSxLQUFEO0FBQVFDLE1BQUFBO0FBQVIsS0FBRCxLQUFvQjtBQUNyQyxVQUFJRCxLQUFLLElBQUlDLEtBQUssS0FBSyxJQUF2QixFQUE2QjtBQUMzQixlQUFPLEtBQUtDLGNBQUwsRUFBUDtBQUNELE9BSG9DLENBS3JDOzs7QUFDQSxZQUFNO0FBQUNDLFFBQUFB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YmQsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtRdWVyeVJlbmRlcmVyLCBncmFwaHFsfSBmcm9tICdyZWFjdC1yZWxheSc7XG5cbmltcG9ydCB7RW5kcG9pbnRQcm9wVHlwZSwgVG9rZW5Qcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgUmVsYXlOZXR3b3JrTGF5ZXJNYW5hZ2VyIGZyb20gJy4uL3JlbGF5LW5ldHdvcmstbGF5ZXItbWFuYWdlcic7XG5pbXBvcnQge1VOQVVUSEVOVElDQVRFRCwgSU5TVUZGSUNJRU5UfSBmcm9tICcuLi9zaGFyZWQva2V5dGFyLXN0cmF0ZWd5JztcbmltcG9ydCBBdXRob3IsIHtudWxsQXV0aG9yfSBmcm9tICcuLi9tb2RlbHMvYXV0aG9yJztcbmltcG9ydCBHaXRodWJUYWJIZWFkZXJDb250cm9sbGVyIGZyb20gJy4uL2NvbnRyb2xsZXJzL2dpdGh1Yi10YWItaGVhZGVyLWNvbnRyb2xsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHaXRodWJUYWJIZWFkZXJDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8vIENvbm5lY3Rpb25cbiAgICBlbmRwb2ludDogRW5kcG9pbnRQcm9wVHlwZS5pc1JlcXVpcmVkLFxuICAgIHRva2VuOiBUb2tlblByb3BUeXBlLFxuXG4gICAgLy8gV29ya3NwYWNlXG4gICAgY3VycmVudFdvcmtEaXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgY29udGV4dExvY2tlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBjaGFuZ2VXb3JraW5nRGlyZWN0b3J5OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNldENvbnRleHRMb2NrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGdldEN1cnJlbnRXb3JrRGlyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgIC8vIEV2ZW50IEhhbmRsZXJzXG4gICAgb25EaWRDaGFuZ2VXb3JrRGlyczogUHJvcFR5cGVzLmZ1bmMsXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5wcm9wcy50b2tlbiA9PSBudWxsXG4gICAgICB8fCB0aGlzLnByb3BzLnRva2VuIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgIHx8IHRoaXMucHJvcHMudG9rZW4gPT09IFVOQVVUSEVOVElDQVRFRFxuICAgICAgfHwgdGhpcy5wcm9wcy50b2tlbiA9PT0gSU5TVUZGSUNJRU5UXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJOb1Jlc3VsdCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGVudmlyb25tZW50ID0gUmVsYXlOZXR3b3JrTGF5ZXJNYW5hZ2VyLmdldEVudmlyb25tZW50Rm9ySG9zdCh0aGlzLnByb3BzLmVuZHBvaW50LCB0aGlzLnByb3BzLnRva2VuKTtcbiAgICBjb25zdCBxdWVyeSA9IGdyYXBocWxgXG4gICAgICBxdWVyeSBnaXRodWJUYWJIZWFkZXJDb250YWluZXJRdWVyeSB7XG4gICAgICAgIHZpZXdlciB7XG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICBhdmF0YXJVcmwsXG4gICAgICAgICAgbG9naW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFF1ZXJ5UmVuZGVyZXJcbiAgICAgICAgZW52aXJvbm1lbnQ9e2Vudmlyb25tZW50fVxuICAgICAgICB2YXJpYWJsZXM9e3t9fVxuICAgICAgICBxdWVyeT17cXVlcnl9XG4gICAgICAgIHJlbmRlcj17dGhpcy5yZW5kZXJXaXRoUmVzdWx0fVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyV2l0aFJlc3VsdCA9ICh7ZXJyb3IsIHByb3BzfSkgPT4ge1xuICAgIGlmIChlcnJvciB8fCBwcm9wcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTm9SZXN1bHQoKTtcbiAgICB9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJvcC10eXBlc1xuICAgIGNvbnN0IHtlbWFpbCwgbmFtZSwgYXZhdGFyVXJsLCBsb2dpbn0gPSBwcm9wcy52aWV3ZXI7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEdpdGh1YlRhYkhlYWRlckNvbnRyb2xsZXJcbiAgICAgICAgdXNlcj17bmV3IEF1dGhvcihlbWFpbCwgbmFtZSwgbG9naW4sIGZhbHNlLCBhdmF0YXJVcmwpfVxuXG4gICAgICAgIC8vIFdvcmtzcGFjZVxuICAgICAgICBjdXJyZW50V29ya0Rpcj17dGhpcy5wcm9wcy5jdXJyZW50V29ya0Rpcn1cbiAgICAgICAgY29udGV4dExvY2tlZD17dGhpcy5wcm9wcy5jb250ZXh0TG9ja2VkfVxuICAgICAgICBnZXRDdXJyZW50V29ya0RpcnM9e3RoaXMucHJvcHMuZ2V0Q3VycmVudFdvcmtEaXJzfVxuICAgICAgICBjaGFuZ2VXb3JraW5nRGlyZWN0b3J5PXt0aGlzLnByb3BzLmNoYW5nZVdvcmtpbmdEaXJlY3Rvcnl9XG4gICAgICAgIHNldENvbnRleHRMb2NrPXt0aGlzLnByb3BzLnNldENvbnRleHRMb2NrfVxuXG4gICAgICAgIC8vIEV2ZW50IEhhbmRsZXJzXG4gICAgICAgIG9uRGlkQ2hhbmdlV29ya0RpcnM9e3RoaXMucHJvcHMub25EaWRDaGFuZ2VXb3JrRGlyc31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlck5vUmVzdWx0KCkge1xuICAgIHJldHVybiAoXG4gICAgICA8R2l0aHViVGFiSGVhZGVyQ29udHJvbGxlclxuICAgICAgICB1c2VyPXtudWxsQXV0aG9yfVxuXG4gICAgICAgIC8vIFdvcmtzcGFjZVxuICAgICAgICBjdXJyZW50V29ya0Rpcj17dGhpcy5wcm9wcy5jdXJyZW50V29ya0Rpcn1cbiAgICAgICAgY29udGV4dExvY2tlZD17dGhpcy5wcm9wcy5jb250ZXh0TG9ja2VkfVxuICAgICAgICBjaGFuZ2VXb3JraW5nRGlyZWN0b3J5PXt0aGlzLnByb3BzLmNoYW5nZVdvcmtpbmdEaXJlY3Rvcnl9XG4gICAgICAgIHNldENvbnRleHRMb2NrPXt0aGlzLnByb3BzLnNldENvbnRleHRMb2NrfVxuICAgICAgICBnZXRDdXJyZW50V29ya0RpcnM9e3RoaXMucHJvcHMuZ2V0Q3VycmVudFdvcmtEaXJzfVxuXG4gICAgICAgIC8vIEV2ZW50IEhhbmRsZXJzXG4gICAgICAgIG9uRGlkQ2hhbmdlV29ya0RpcnM9e3RoaXMucHJvcHMub25EaWRDaGFuZ2VXb3JrRGlyc31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxufVxuIl19