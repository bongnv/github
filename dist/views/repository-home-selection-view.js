"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BareRepositoryHomeSelectionView = exports.PAGE_SIZE = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRelay = require("react-relay");

var _tabbable = require("./tabbable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const PAGE_DELAY = 500;
const PAGE_SIZE = 50;
exports.PAGE_SIZE = PAGE_SIZE;

class BareRepositoryHomeSelectionView extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderOwner", owner => _react.default.createElement(_react.Fragment, null, _react.default.createElement("div", {
      className: "github-RepositoryHome-ownerOption"
    }, _react.default.createElement("img", {
      alt: "",
      src: owner.avatarURL,
      className: "github-RepositoryHome-ownerAvatar"
    }), _react.default.createElement("span", {
      className: "github-RepositoryHome-ownerName"
    }, owner.login)), owner.disabled && !owner.placeholder && _react.default.createElement("div", {
      className: "github-RepositoryHome-ownerUnwritable"
    }, "(insufficient permissions)")));

    _defineProperty(this, "didChangeOwner", owner => this.props.didChangeOwnerID(owner.id));

    _defineProperty(this, "loadNextPage", () => {
      /* istanbul ignore if */
      if (this.props.relay.isLoading()) {
        setTimeout(this.loadNextPage, PAGE_DELAY);
        return;
      }

      this.props.relay.loadMore(PAGE_SIZE);
    });
  }

  render() {
    const owners = this.getOwners();
    const currentOwner = owners.find(o => o.id === this.props.selectedOwnerID) || owners[0];
    return _react.default.createElement("div", {
      className: "github-RepositoryHome"
    }, _react.default.createElement(_tabbable.TabbableSelect, {
      tabGroup: this.props.tabGroup,
      commands: this.props.commands,
      autofocus: this.props.autofocusOwner,
      className: "github-RepositoryHome-owner",
      clearable: false,
      disabled: this.props.isLoading,
      options: owners,
      optionRenderer: this.renderOwner,
      value: currentOwner,
      valueRenderer: this.renderOwner,
      onChange: this.didChangeOwner
    }), _react.default.createElement("span", {
      className: "github-RepositoryHome-separator"
    }, "/"), _react.default.createElement(_tabbable.TabbableTextEditor, {
      tabGroup: this.props.tabGroup,
      commands: this.props.commands,
      autofocus: this.props.autofocusName,
      mini: true,
      buffer: this.props.nameBuffer
    }));
  }

  componentDidMount() {
    this.schedulePageLoad();
  }

  componentDidUpdate() {
    this.schedulePageLoad();
  }

  getOwners() {
    if (!this.props.user) {
      return [{
        id: 'loading',
        login: 'loading...',
        avatarURL: '',
        disabled: true,
        placeholder: true
      }];
    }

    const owners = [{
      id: this.props.user.id,
      login: this.props.user.login,
      avatarURL: this.props.user.avatarUrl,
      disabled: false
    }];
    /* istanbul ignore if */

    if (!this.props.user.organizations.edges) {
      return owners;
    }

    for (const {
      node
    } of this.props.user.organizations.edges) {
      /* istanbul ignore if */
      if (!node) {
        continue;
      }

      owners.push({
        id: node.id,
        login: node.login,
        avatarURL: node.avatarUrl,
        disabled: !node.viewerCanCreateRepositories
      });
    }

    if (this.props.relay && this.props.relay.hasMore()) {
      owners.push({
        id: 'loading',
        login: 'loading...',
        avatarURL: '',
        disabled: true,
        placeholder: true
      });
    }

    return owners;
  }

  schedulePageLoad() {
    if (!this.props.relay.hasMore()) {
      return;
    }

    setTimeout(this.loadNextPage, PAGE_DELAY);
  }

}

exports.BareRepositoryHomeSelectionView = BareRepositoryHomeSelectionView;

_defineProperty(BareRepositoryHomeSelectionView, "propTypes", {
  // Relay
  relay: _propTypes.default.shape({
    hasMore: _propTypes.default.func.isRequired,
    isLoading: _propTypes.default.func.isRequired,
    loadMore: _propTypes.default.func.isRequired
  }).isRequired,
  user: _propTypes.default.shape({
    id: _propTypes.default.string.isRequired,
    login: _propTypes.default.string.isRequired,
    avatarUrl: _propTypes.default.string.isRequired,
    organizations: _propTypes.default.shape({
      edges: _propTypes.default.arrayOf(_propTypes.default.shape({
        node: _propTypes.default.shape({
          id: _propTypes.default.string.isRequired,
          login: _propTypes.default.string.isRequired,
          avatarUrl: _propTypes.default.string.isRequired,
          viewerCanCreateRepositories: _propTypes.default.bool.isRequired
        })
      }))
    }).isRequired
  }),
  // Model
  nameBuffer: _propTypes.default.object.isRequired,
  isLoading: _propTypes.default.bool.isRequired,
  selectedOwnerID: _propTypes.default.string.isRequired,
  tabGroup: _propTypes.default.object.isRequired,
  autofocusOwner: _propTypes.default.bool,
  autofocusName: _propTypes.default.bool,
  // Selection callback
  didChangeOwnerID: _propTypes.default.func.isRequired,
  // Atom environment
  commands: _propTypes.default.object.isRequired
});

_defineProperty(BareRepositoryHomeSelectionView, "defaultProps", {
  autofocusOwner: false,
  autofocusName: false
});

var _default = (0, _reactRelay.createPaginationContainer)(BareRepositoryHomeSelectionView, {
  user: function () {
    const node = require("./__generated__/repositoryHomeSelectionView_user.graphql");

    if (node.hash && node.hash !== "11a1f1d0eac32bff0a3371217c0eede3") {
      console.error("The definition of 'repositoryHomeSelectionView_user' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/repositoryHomeSelectionView_user.graphql");
  }
}, {
  direction: 'forward',

  /* istanbul ignore next */
  getConnectionFromProps(props) {
    return props.user && props.user.organizations;
  },

  /* istanbul ignore next */
  getFragmentVariables(prevVars, totalCount) {
    return _objectSpread2({}, prevVars, {
      totalCount
    });
  },

  /* istanbul ignore next */
  getVariables(props, {
    count,
    cursor
  }) {
    return {
      id: props.user.id,
      organizationCount: count,
      organizationCursor: cursor
    };
  },

  query: function () {
    const node = require("./__generated__/repositoryHomeSelectionViewQuery.graphql");

    if (node.hash && node.hash !== "67e7843e3ff792e86e979cc948929ea3") {
      console.error("The definition of 'repositoryHomeSelectionViewQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
    }

    return require("./__generated__/repositoryHomeSelectionViewQuery.graphql");
  }
});

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9yZXBvc2l0b3J5LWhvbWUtc2VsZWN0aW9uLXZpZXcuanMiXSwibmFtZXMiOlsiUEFHRV9ERUxBWSIsIlBBR0VfU0laRSIsIkJhcmVSZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsIm93bmVyIiwiYXZhdGFyVVJMIiwibG9naW4iLCJkaXNhYmxlZCIsInBsYWNlaG9sZGVyIiwicHJvcHMiLCJkaWRDaGFuZ2VPd25lcklEIiwiaWQiLCJyZWxheSIsImlzTG9hZGluZyIsInNldFRpbWVvdXQiLCJsb2FkTmV4dFBhZ2UiLCJsb2FkTW9yZSIsInJlbmRlciIsIm93bmVycyIsImdldE93bmVycyIsImN1cnJlbnRPd25lciIsImZpbmQiLCJvIiwic2VsZWN0ZWRPd25lcklEIiwidGFiR3JvdXAiLCJjb21tYW5kcyIsImF1dG9mb2N1c093bmVyIiwicmVuZGVyT3duZXIiLCJkaWRDaGFuZ2VPd25lciIsImF1dG9mb2N1c05hbWUiLCJuYW1lQnVmZmVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJzY2hlZHVsZVBhZ2VMb2FkIiwiY29tcG9uZW50RGlkVXBkYXRlIiwidXNlciIsImF2YXRhclVybCIsIm9yZ2FuaXphdGlvbnMiLCJlZGdlcyIsIm5vZGUiLCJwdXNoIiwidmlld2VyQ2FuQ3JlYXRlUmVwb3NpdG9yaWVzIiwiaGFzTW9yZSIsIlByb3BUeXBlcyIsInNoYXBlIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJhcnJheU9mIiwiYm9vbCIsIm9iamVjdCIsImRpcmVjdGlvbiIsImdldENvbm5lY3Rpb25Gcm9tUHJvcHMiLCJnZXRGcmFnbWVudFZhcmlhYmxlcyIsInByZXZWYXJzIiwidG90YWxDb3VudCIsImdldFZhcmlhYmxlcyIsImNvdW50IiwiY3Vyc29yIiwib3JnYW5pemF0aW9uQ291bnQiLCJvcmdhbml6YXRpb25DdXJzb3IiLCJxdWVyeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztB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O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFEb0UsQ0FBM0QsRUErQlo7QUFDRGdCLEVBQUFBLFNBQVMsRUFBRSxTQURWOztBQUVEO0FBQ0FDLEVBQUFBLHNCQUFzQixDQUFDMUMsS0FBRCxFQUFRO0FBQzVCLFdBQU9BLEtBQUssQ0FBQ3lCLElBQU4sSUFBY3pCLEtBQUssQ0FBQ3lCLElBQU4sQ0FBV0UsYUFBaEM7QUFDRCxHQUxBOztBQU1EO0FBQ0FnQixFQUFBQSxvQkFBb0IsQ0FBQ0MsUUFBRCxFQUFXQyxVQUFYLEVBQXVCO0FBQ3pDLDhCQUFXRCxRQUFYO0FBQXFCQyxNQUFBQTtBQUFyQjtBQUNELEdBVEE7O0FBVUQ7QUFDQUMsRUFBQUEsWUFBWSxDQUFDOUMsS0FBRCxFQUFRO0FBQUMrQyxJQUFBQSxLQUFEO0FBQVFDLElBQUFBO0FBQVIsR0FBUixFQUF5QjtBQUNuQyxXQUFPO0FBQ0w5QyxNQUFBQSxFQUFFLEVBQUVGLEtBQUssQ0FBQ3lCLElBQU4sQ0FBV3ZCLEVBRFY7QUFFTCtDLE1BQUFBLGlCQUFpQixFQUFFRixLQUZkO0FBR0xHLE1BQUFBLGtCQUFrQixFQUFFRjtBQUhmLEtBQVA7QUFLRCxHQWpCQTs7QUFrQkRHLEVBQUFBLEtBQUs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQWxCSixDQS9CWSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge2NyZWF0ZVBhZ2luYXRpb25Db250YWluZXIsIGdyYXBocWx9IGZyb20gJ3JlYWN0LXJlbGF5JztcblxuaW1wb3J0IHtUYWJiYWJsZVRleHRFZGl0b3IsIFRhYmJhYmxlU2VsZWN0fSBmcm9tICcuL3RhYmJhYmxlJztcblxuY29uc3QgUEFHRV9ERUxBWSA9IDUwMDtcblxuZXhwb3J0IGNvbnN0IFBBR0VfU0laRSA9IDUwO1xuXG5leHBvcnQgY2xhc3MgQmFyZVJlcG9zaXRvcnlIb21lU2VsZWN0aW9uVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLy8gUmVsYXlcbiAgICByZWxheTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGhhc01vcmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBsb2FkTW9yZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICAgIHVzZXI6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBpZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgbG9naW46IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIGF2YXRhclVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgb3JnYW5pemF0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgZWRnZXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgbm9kZTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICAgIGlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBsb2dpbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgYXZhdGFyVXJsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICB2aWV3ZXJDYW5DcmVhdGVSZXBvc2l0b3JpZXM6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pKSxcbiAgICAgIH0pLmlzUmVxdWlyZWQsXG4gICAgfSksXG5cbiAgICAvLyBNb2RlbFxuICAgIG5hbWVCdWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0ZWRPd25lcklEOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdGFiR3JvdXA6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBhdXRvZm9jdXNPd25lcjogUHJvcFR5cGVzLmJvb2wsXG4gICAgYXV0b2ZvY3VzTmFtZTogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAvLyBTZWxlY3Rpb24gY2FsbGJhY2tcbiAgICBkaWRDaGFuZ2VPd25lcklEOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQXRvbSBlbnZpcm9ubWVudFxuICAgIGNvbW1hbmRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGF1dG9mb2N1c093bmVyOiBmYWxzZSxcbiAgICBhdXRvZm9jdXNOYW1lOiBmYWxzZSxcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBvd25lcnMgPSB0aGlzLmdldE93bmVycygpO1xuICAgIGNvbnN0IGN1cnJlbnRPd25lciA9IG93bmVycy5maW5kKG8gPT4gby5pZCA9PT0gdGhpcy5wcm9wcy5zZWxlY3RlZE93bmVySUQpIHx8IG93bmVyc1swXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1SZXBvc2l0b3J5SG9tZVwiPlxuICAgICAgICA8VGFiYmFibGVTZWxlY3RcbiAgICAgICAgICB0YWJHcm91cD17dGhpcy5wcm9wcy50YWJHcm91cH1cbiAgICAgICAgICBjb21tYW5kcz17dGhpcy5wcm9wcy5jb21tYW5kc31cbiAgICAgICAgICBhdXRvZm9jdXM9e3RoaXMucHJvcHMuYXV0b2ZvY3VzT3duZXJ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLVJlcG9zaXRvcnlIb21lLW93bmVyXCJcbiAgICAgICAgICBjbGVhcmFibGU9e2ZhbHNlfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmlzTG9hZGluZ31cbiAgICAgICAgICBvcHRpb25zPXtvd25lcnN9XG4gICAgICAgICAgb3B0aW9uUmVuZGVyZXI9e3RoaXMucmVuZGVyT3duZXJ9XG4gICAgICAgICAgdmFsdWU9e2N1cnJlbnRPd25lcn1cbiAgICAgICAgICB2YWx1ZVJlbmRlcmVyPXt0aGlzLnJlbmRlck93bmVyfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmRpZENoYW5nZU93bmVyfVxuICAgICAgICAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItUmVwb3NpdG9yeUhvbWUtc2VwYXJhdG9yXCI+Lzwvc3Bhbj5cbiAgICAgICAgPFRhYmJhYmxlVGV4dEVkaXRvclxuICAgICAgICAgIHRhYkdyb3VwPXt0aGlzLnByb3BzLnRhYkdyb3VwfVxuICAgICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICAgIGF1dG9mb2N1cz17dGhpcy5wcm9wcy5hdXRvZm9jdXNOYW1lfVxuICAgICAgICAgIG1pbmk9e3RydWV9XG4gICAgICAgICAgYnVmZmVyPXt0aGlzLnByb3BzLm5hbWVCdWZmZXJ9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyT3duZXIgPSBvd25lciA9PiAoXG4gICAgPEZyYWdtZW50PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItUmVwb3NpdG9yeUhvbWUtb3duZXJPcHRpb25cIj5cbiAgICAgICAgPGltZyBhbHQ9XCJcIiBzcmM9e293bmVyLmF2YXRhclVSTH0gY2xhc3NOYW1lPVwiZ2l0aHViLVJlcG9zaXRvcnlIb21lLW93bmVyQXZhdGFyXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ2l0aHViLVJlcG9zaXRvcnlIb21lLW93bmVyTmFtZVwiPntvd25lci5sb2dpbn08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIHtvd25lci5kaXNhYmxlZCAmJiAhb3duZXIucGxhY2Vob2xkZXIgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1SZXBvc2l0b3J5SG9tZS1vd25lclVud3JpdGFibGVcIj5cbiAgICAgICAgICAoaW5zdWZmaWNpZW50IHBlcm1pc3Npb25zKVxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG4gICAgPC9GcmFnbWVudD5cbiAgKTtcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnNjaGVkdWxlUGFnZUxvYWQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnNjaGVkdWxlUGFnZUxvYWQoKTtcbiAgfVxuXG4gIGdldE93bmVycygpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMudXNlcikge1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIGlkOiAnbG9hZGluZycsXG4gICAgICAgIGxvZ2luOiAnbG9hZGluZy4uLicsXG4gICAgICAgIGF2YXRhclVSTDogJycsXG4gICAgICAgIGRpc2FibGVkOiB0cnVlLFxuICAgICAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICAgIH1dO1xuICAgIH1cblxuICAgIGNvbnN0IG93bmVycyA9IFt7XG4gICAgICBpZDogdGhpcy5wcm9wcy51c2VyLmlkLFxuICAgICAgbG9naW46IHRoaXMucHJvcHMudXNlci5sb2dpbixcbiAgICAgIGF2YXRhclVSTDogdGhpcy5wcm9wcy51c2VyLmF2YXRhclVybCxcbiAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICB9XTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghdGhpcy5wcm9wcy51c2VyLm9yZ2FuaXphdGlvbnMuZWRnZXMpIHtcbiAgICAgIHJldHVybiBvd25lcnM7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB7bm9kZX0gb2YgdGhpcy5wcm9wcy51c2VyLm9yZ2FuaXphdGlvbnMuZWRnZXMpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBvd25lcnMucHVzaCh7XG4gICAgICAgIGlkOiBub2RlLmlkLFxuICAgICAgICBsb2dpbjogbm9kZS5sb2dpbixcbiAgICAgICAgYXZhdGFyVVJMOiBub2RlLmF2YXRhclVybCxcbiAgICAgICAgZGlzYWJsZWQ6ICFub2RlLnZpZXdlckNhbkNyZWF0ZVJlcG9zaXRvcmllcyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLnJlbGF5ICYmIHRoaXMucHJvcHMucmVsYXkuaGFzTW9yZSgpKSB7XG4gICAgICBvd25lcnMucHVzaCh7XG4gICAgICAgIGlkOiAnbG9hZGluZycsXG4gICAgICAgIGxvZ2luOiAnbG9hZGluZy4uLicsXG4gICAgICAgIGF2YXRhclVSTDogJycsXG4gICAgICAgIGRpc2FibGVkOiB0cnVlLFxuICAgICAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBvd25lcnM7XG4gIH1cblxuICBkaWRDaGFuZ2VPd25lciA9IG93bmVyID0+IHRoaXMucHJvcHMuZGlkQ2hhbmdlT3duZXJJRChvd25lci5pZCk7XG5cbiAgc2NoZWR1bGVQYWdlTG9hZCgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMucmVsYXkuaGFzTW9yZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dCh0aGlzLmxvYWROZXh0UGFnZSwgUEFHRV9ERUxBWSk7XG4gIH1cblxuICBsb2FkTmV4dFBhZ2UgPSAoKSA9PiB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKHRoaXMucHJvcHMucmVsYXkuaXNMb2FkaW5nKCkpIHtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5sb2FkTmV4dFBhZ2UsIFBBR0VfREVMQVkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMucmVsYXkubG9hZE1vcmUoUEFHRV9TSVpFKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVQYWdpbmF0aW9uQ29udGFpbmVyKEJhcmVSZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXcsIHtcbiAgdXNlcjogZ3JhcGhxbGBcbiAgICBmcmFnbWVudCByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciBvbiBVc2VyXG4gICAgQGFyZ3VtZW50RGVmaW5pdGlvbnMoXG4gICAgICBvcmdhbml6YXRpb25Db3VudDoge3R5cGU6IFwiSW50IVwifVxuICAgICAgb3JnYW5pemF0aW9uQ3Vyc29yOiB7dHlwZTogXCJTdHJpbmdcIn1cbiAgICApIHtcbiAgICAgIGlkXG4gICAgICBsb2dpblxuICAgICAgYXZhdGFyVXJsKHNpemU6IDI0KVxuICAgICAgb3JnYW5pemF0aW9ucyhcbiAgICAgICAgZmlyc3Q6ICRvcmdhbml6YXRpb25Db3VudFxuICAgICAgICBhZnRlcjogJG9yZ2FuaXphdGlvbkN1cnNvclxuICAgICAgKSBAY29ubmVjdGlvbihrZXk6IFwiUmVwb3NpdG9yeUhvbWVTZWxlY3Rpb25WaWV3X29yZ2FuaXphdGlvbnNcIikge1xuICAgICAgICBwYWdlSW5mbyB7XG4gICAgICAgICAgaGFzTmV4dFBhZ2VcbiAgICAgICAgICBlbmRDdXJzb3JcbiAgICAgICAgfVxuXG4gICAgICAgIGVkZ2VzIHtcbiAgICAgICAgICBjdXJzb3JcbiAgICAgICAgICBub2RlIHtcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBsb2dpblxuICAgICAgICAgICAgYXZhdGFyVXJsKHNpemU6IDI0KVxuICAgICAgICAgICAgdmlld2VyQ2FuQ3JlYXRlUmVwb3NpdG9yaWVzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgLFxufSwge1xuICBkaXJlY3Rpb246ICdmb3J3YXJkJyxcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgZ2V0Q29ubmVjdGlvbkZyb21Qcm9wcyhwcm9wcykge1xuICAgIHJldHVybiBwcm9wcy51c2VyICYmIHByb3BzLnVzZXIub3JnYW5pemF0aW9ucztcbiAgfSxcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgZ2V0RnJhZ21lbnRWYXJpYWJsZXMocHJldlZhcnMsIHRvdGFsQ291bnQpIHtcbiAgICByZXR1cm4gey4uLnByZXZWYXJzLCB0b3RhbENvdW50fTtcbiAgfSxcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgZ2V0VmFyaWFibGVzKHByb3BzLCB7Y291bnQsIGN1cnNvcn0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHByb3BzLnVzZXIuaWQsXG4gICAgICBvcmdhbml6YXRpb25Db3VudDogY291bnQsXG4gICAgICBvcmdhbml6YXRpb25DdXJzb3I6IGN1cnNvcixcbiAgICB9O1xuICB9LFxuICBxdWVyeTogZ3JhcGhxbGBcbiAgICBxdWVyeSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdRdWVyeShcbiAgICAgICRpZDogSUQhXG4gICAgICAkb3JnYW5pemF0aW9uQ291bnQ6IEludCFcbiAgICAgICRvcmdhbml6YXRpb25DdXJzb3I6IFN0cmluZ1xuICAgICkge1xuICAgICAgbm9kZShpZDogJGlkKSB7XG4gICAgICAgIC4uLiBvbiBVc2VyIHtcbiAgICAgICAgICAuLi5yZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciBAYXJndW1lbnRzKFxuICAgICAgICAgICAgb3JnYW5pemF0aW9uQ291bnQ6ICRvcmdhbml6YXRpb25Db3VudFxuICAgICAgICAgICAgb3JnYW5pemF0aW9uQ3Vyc29yOiAkb3JnYW5pemF0aW9uQ3Vyc29yXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBgLFxufSk7XG4iXX0=