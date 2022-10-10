"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes2 = require("../prop-types");

var _tooltip = _interopRequireDefault(require("../atom/tooltip"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getIconClass(icon, animation) {
  return (0, _classnames.default)('github-PushPull-icon', 'icon', `icon-${icon}`, {
    [`animate-${animation}`]: !!animation
  });
}

class PushPullView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onClickPush", clickEvent => {
      if (this.props.isSyncing) {
        return;
      }

      this.props.push({
        force: clickEvent.metaKey || clickEvent.ctrlKey,
        setUpstream: !this.props.currentRemote.isPresent()
      });
    });

    _defineProperty(this, "onClickPull", clickEvent => {
      if (this.props.isSyncing) {
        return;
      }

      this.props.pull();
    });

    _defineProperty(this, "onClickPushPull", clickEvent => {
      if (this.props.isSyncing) {
        return;
      }

      if (clickEvent.metaKey || clickEvent.ctrlKey) {
        this.props.push({
          force: true
        });
      } else {
        this.props.pull();
      }
    });

    _defineProperty(this, "onClickPublish", clickEvent => {
      if (this.props.isSyncing) {
        return;
      }

      this.props.push({
        setUpstream: !this.props.currentRemote.isPresent()
      });
    });

    _defineProperty(this, "onClickFetch", clickEvent => {
      if (this.props.isSyncing) {
        return;
      }

      this.props.fetch();
    });

    this.refTileNode = new _refHolder.default();
  }

  getTileStates() {
    const modKey = process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
    return {
      fetching: {
        tooltip: 'Fetching from remote',
        icon: 'sync',
        text: 'Fetching',
        iconAnimation: 'rotate'
      },
      pulling: {
        tooltip: 'Pulling from remote',
        icon: 'arrow-down',
        text: 'Pulling',
        iconAnimation: 'down'
      },
      pushing: {
        tooltip: 'Pushing to remote',
        icon: 'arrow-up',
        text: 'Pushing',
        iconAnimation: 'up'
      },
      ahead: {
        onClick: this.onClickPush,
        tooltip: `Click to push<br />${modKey}-click to force push<br />Right-click for more`,
        icon: 'arrow-up',
        text: `Push ${this.props.aheadCount}`
      },
      behind: {
        onClick: this.onClickPull,
        tooltip: 'Click to pull<br />Right-click for more',
        icon: 'arrow-down',
        text: `Pull ${this.props.behindCount}`
      },
      aheadBehind: {
        onClick: this.onClickPushPull,
        tooltip: `Click to pull<br />${modKey}-click to force push<br />Right-click for more`,
        icon: 'arrow-down',
        text: `Pull ${this.props.behindCount}`,
        secondaryIcon: 'arrow-up',
        secondaryText: `${this.props.aheadCount} `
      },
      published: {
        onClick: this.onClickFetch,
        tooltip: 'Click to fetch<br />Right-click for more',
        icon: 'sync',
        text: 'Fetch'
      },
      unpublished: {
        onClick: this.onClickPublish,
        tooltip: 'Click to set up a remote tracking branch<br />Right-click for more',
        icon: 'cloud-upload',
        text: 'Publish'
      },
      noRemote: {
        tooltip: 'There is no remote named "origin"',
        icon: 'stop',
        text: 'No remote'
      },
      detached: {
        tooltip: 'Create a branch if you wish to push your work anywhere',
        icon: 'stop',
        text: 'Not on branch'
      }
    };
  }

  render() {
    const isAhead = this.props.aheadCount > 0;
    const isBehind = this.props.behindCount > 0;
    const isUnpublished = !this.props.currentRemote.isPresent();
    const isDetached = this.props.currentBranch.isDetached();
    const isFetching = this.props.isFetching;
    const isPulling = this.props.isPulling;
    const isPushing = this.props.isPushing;
    const hasOrigin = !!this.props.originExists;
    const tileStates = this.getTileStates();
    let tileState;

    if (isFetching) {
      tileState = tileStates.fetching;
    } else if (isPulling) {
      tileState = tileStates.pulling;
    } else if (isPushing) {
      tileState = tileStates.pushing;
    } else if (isAhead && !isBehind && !isUnpublished) {
      tileState = tileStates.ahead;
    } else if (isBehind && !isAhead && !isUnpublished) {
      tileState = tileStates.behind;
    } else if (isBehind && isAhead && !isUnpublished) {
      tileState = tileStates.aheadBehind;
    } else if (!isBehind && !isAhead && !isUnpublished && !isDetached) {
      tileState = tileStates.published;
    } else if (isUnpublished && !isDetached && hasOrigin) {
      tileState = tileStates.unpublished;
    } else if (isUnpublished && !isDetached && !hasOrigin) {
      tileState = tileStates.noRemote;
    } else if (isDetached) {
      tileState = tileStates.detached;
    }

    return _react.default.createElement("div", {
      onClick: tileState.onClick,
      ref: this.refTileNode.setter,
      className: (0, _classnames.default)('github-PushPull', 'inline-block', {
        'github-branch-detached': isDetached
      })
    }, tileState && _react.default.createElement(_react.Fragment, null, _react.default.createElement("span", null, tileState.secondaryText && _react.default.createElement("span", {
      className: "secondary"
    }, _react.default.createElement("span", {
      className: getIconClass(tileState.secondaryIcon)
    }), tileState.secondaryText), _react.default.createElement("span", {
      className: getIconClass(tileState.icon, tileState.iconAnimation)
    }), tileState.text), _react.default.createElement(_tooltip.default, {
      key: "tooltip",
      manager: this.props.tooltipManager,
      target: this.refTileNode,
      title: `<div style="text-align: left; line-height: 1.2em;">${tileState.tooltip}</div>`,
      showDelay: atom.tooltips.hoverDefaults.delay.show,
      hideDelay: atom.tooltips.hoverDefaults.delay.hide
    })));
  }

}

exports.default = PushPullView;

_defineProperty(PushPullView, "propTypes", {
  currentBranch: _propTypes2.BranchPropType.isRequired,
  currentRemote: _propTypes2.RemotePropType.isRequired,
  isSyncing: _propTypes.default.bool,
  isFetching: _propTypes.default.bool,
  isPulling: _propTypes.default.bool,
  isPushing: _propTypes.default.bool,
  behindCount: _propTypes.default.number,
  aheadCount: _propTypes.default.number,
  push: _propTypes.default.func.isRequired,
  pull: _propTypes.default.func.isRequired,
  fetch: _propTypes.default.func.isRequired,
  originExists: _propTypes.default.bool,
  tooltipManager: _propTypes.default.object.isRequired
});

_defineProperty(PushPullView, "defaultProps", {
  isSyncing: false,
  isFetching: false,
  isPulling: false,
  isPushing: false,
  behindCount: 0,
  aheadCount: 0
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9wdXNoLXB1bGwtdmlldy5qcyJdLCJuYW1lcyI6WyJnZXRJY29uQ2xhc3MiLCJpY29uIiwiYW5pbWF0aW9uIiwiUHVzaFB1bGxWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY2xpY2tFdmVudCIsImlzU3luY2luZyIsInB1c2giLCJmb3JjZSIsIm1ldGFLZXkiLCJjdHJsS2V5Iiwic2V0VXBzdHJlYW0iLCJjdXJyZW50UmVtb3RlIiwiaXNQcmVzZW50IiwicHVsbCIsImZldGNoIiwicmVmVGlsZU5vZGUiLCJSZWZIb2xkZXIiLCJnZXRUaWxlU3RhdGVzIiwibW9kS2V5IiwicHJvY2VzcyIsInBsYXRmb3JtIiwiZmV0Y2hpbmciLCJ0b29sdGlwIiwidGV4dCIsImljb25BbmltYXRpb24iLCJwdWxsaW5nIiwicHVzaGluZyIsImFoZWFkIiwib25DbGljayIsIm9uQ2xpY2tQdXNoIiwiYWhlYWRDb3VudCIsImJlaGluZCIsIm9uQ2xpY2tQdWxsIiwiYmVoaW5kQ291bnQiLCJhaGVhZEJlaGluZCIsIm9uQ2xpY2tQdXNoUHVsbCIsInNlY29uZGFyeUljb24iLCJzZWNvbmRhcnlUZXh0IiwicHVibGlzaGVkIiwib25DbGlja0ZldGNoIiwidW5wdWJsaXNoZWQiLCJvbkNsaWNrUHVibGlzaCIsIm5vUmVtb3RlIiwiZGV0YWNoZWQiLCJyZW5kZXIiLCJpc0FoZWFkIiwiaXNCZWhpbmQiLCJpc1VucHVibGlzaGVkIiwiaXNEZXRhY2hlZCIsImN1cnJlbnRCcmFuY2giLCJpc0ZldGNoaW5nIiwiaXNQdWxsaW5nIiwiaXNQdXNoaW5nIiwiaGFzT3JpZ2luIiwib3JpZ2luRXhpc3RzIiwidGlsZVN0YXRlcyIsInRpbGVTdGF0ZSIsInNldHRlciIsInRvb2x0aXBNYW5hZ2VyIiwiYXRvbSIsInRvb2x0aXBzIiwiaG92ZXJEZWZhdWx0cyIsImRlbGF5Iiwic2hvdyIsImhpZGUiLCJCcmFuY2hQcm9wVHlwZSIsImlzUmVxdWlyZWQiLCJSZW1vdGVQcm9wVHlwZSIsIlByb3BUeXBlcyIsImJvb2wiLCJudW1iZXIiLCJmdW5jIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsU0FBU0EsWUFBVCxDQUFzQkMsSUFBdEIsRUFBNEJDLFNBQTVCLEVBQXVDO0FBQ3JDLFNBQU8seUJBQ0wsc0JBREssRUFFTCxNQUZLLEVBR0osUUFBT0QsSUFBSyxFQUhSLEVBSUw7QUFBQyxLQUFFLFdBQVVDLFNBQVUsRUFBdEIsR0FBMEIsQ0FBQyxDQUFDQTtBQUE3QixHQUpLLENBQVA7QUFNRDs7QUFFYyxNQUFNQyxZQUFOLFNBQTJCQyxlQUFNQyxTQUFqQyxDQUEyQztBQTBCeERDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47O0FBRGlCLHlDQU1MQyxVQUFVLElBQUk7QUFDMUIsVUFBSSxLQUFLRCxLQUFMLENBQVdFLFNBQWYsRUFBMEI7QUFDeEI7QUFDRDs7QUFDRCxXQUFLRixLQUFMLENBQVdHLElBQVgsQ0FBZ0I7QUFDZEMsUUFBQUEsS0FBSyxFQUFFSCxVQUFVLENBQUNJLE9BQVgsSUFBc0JKLFVBQVUsQ0FBQ0ssT0FEMUI7QUFFZEMsUUFBQUEsV0FBVyxFQUFFLENBQUMsS0FBS1AsS0FBTCxDQUFXUSxhQUFYLENBQXlCQyxTQUF6QjtBQUZBLE9BQWhCO0FBSUQsS0Fka0I7O0FBQUEseUNBZ0JMUixVQUFVLElBQUk7QUFDMUIsVUFBSSxLQUFLRCxLQUFMLENBQVdFLFNBQWYsRUFBMEI7QUFDeEI7QUFDRDs7QUFDRCxXQUFLRixLQUFMLENBQVdVLElBQVg7QUFDRCxLQXJCa0I7O0FBQUEsNkNBdUJEVCxVQUFVLElBQUk7QUFDOUIsVUFBSSxLQUFLRCxLQUFMLENBQVdFLFNBQWYsRUFBMEI7QUFDeEI7QUFDRDs7QUFDRCxVQUFJRCxVQUFVLENBQUNJLE9BQVgsSUFBc0JKLFVBQVUsQ0FBQ0ssT0FBckMs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WSxlQUNBO0FBQ2pCa0QsRUFBQUEsYUFBYSxFQUFFZ0IsMkJBQWVDLFVBRGI7QUFFakJ2RCxFQUFBQSxhQUFhLEVBQUV3RCwyQkFBZUQsVUFGYjtBQUdqQjdELEVBQUFBLFNBQVMsRUFBRStELG1CQUFVQyxJQUhKO0FBSWpCbkIsRUFBQUEsVUFBVSxFQUFFa0IsbUJBQVVDLElBSkw7QUFLakJsQixFQUFBQSxTQUFTLEVBQUVpQixtQkFBVUMsSUFMSjtBQU1qQmpCLEVBQUFBLFNBQVMsRUFBRWdCLG1CQUFVQyxJQU5KO0FBT2pCcEMsRUFBQUEsV0FBVyxFQUFFbUMsbUJBQVVFLE1BUE47QUFRakJ4QyxFQUFBQSxVQUFVLEVBQUVzQyxtQkFBVUUsTUFSTDtBQVNqQmhFLEVBQUFBLElBQUksRUFBRThELG1CQUFVRyxJQUFWLENBQWVMLFVBVEo7QUFVakJyRCxFQUFBQSxJQUFJLEVBQUV1RCxtQkFBVUcsSUFBVixDQUFlTCxVQVZKO0FBV2pCcEQsRUFBQUEsS0FBSyxFQUFFc0QsbUJBQVVHLElBQVYsQ0FBZUwsVUFYTDtBQVlqQlosRUFBQUEsWUFBWSxFQUFFYyxtQkFBVUMsSUFaUDtBQWFqQlgsRUFBQUEsY0FBYyxFQUFFVSxtQkFBVUksTUFBVixDQUFpQk47QUFiaEIsQzs7Z0JBREFuRSxZLGtCQWlCRztBQUNwQk0sRUFBQUEsU0FBUyxFQUFFLEtBRFM7QUFFcEI2QyxFQUFBQSxVQUFVLEVBQUUsS0FGUTtBQUdwQkMsRUFBQUEsU0FBUyxFQUFFLEtBSFM7QUFJcEJDLEVBQUFBLFNBQVMsRUFBRSxLQUpTO0FBS3BCbkIsRUFBQUEsV0FBVyxFQUFFLENBTE87QUFNcEJILEVBQUFBLFVBQVUsRUFBRTtBQU5RLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHtGcmFnbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjeCBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHtSZW1vdGVQcm9wVHlwZSwgQnJhbmNoUHJvcFR5cGV9IGZyb20gJy4uL3Byb3AtdHlwZXMnO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vYXRvbS90b29sdGlwJztcbmltcG9ydCBSZWZIb2xkZXIgZnJvbSAnLi4vbW9kZWxzL3JlZi1ob2xkZXInO1xuXG5mdW5jdGlvbiBnZXRJY29uQ2xhc3MoaWNvbiwgYW5pbWF0aW9uKSB7XG4gIHJldHVybiBjeChcbiAgICAnZ2l0aHViLVB1c2hQdWxsLWljb24nLFxuICAgICdpY29uJyxcbiAgICBgaWNvbi0ke2ljb259YCxcbiAgICB7W2BhbmltYXRlLSR7YW5pbWF0aW9ufWBdOiAhIWFuaW1hdGlvbn0sXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1c2hQdWxsVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY3VycmVudEJyYW5jaDogQnJhbmNoUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICBjdXJyZW50UmVtb3RlOiBSZW1vdGVQcm9wVHlwZS5pc1JlcXVpcmVkLFxuICAgIGlzU3luY2luZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgaXNGZXRjaGluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgaXNQdWxsaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpc1B1c2hpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgIGJlaGluZENvdW50OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGFoZWFkQ291bnQ6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcHVzaDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBwdWxsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGZldGNoOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9yaWdpbkV4aXN0czogUHJvcFR5cGVzLmJvb2wsXG4gICAgdG9vbHRpcE1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgfVxuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgaXNTeW5jaW5nOiBmYWxzZSxcbiAgICBpc0ZldGNoaW5nOiBmYWxzZSxcbiAgICBpc1B1bGxpbmc6IGZhbHNlLFxuICAgIGlzUHVzaGluZzogZmFsc2UsXG4gICAgYmVoaW5kQ291bnQ6IDAsXG4gICAgYWhlYWRDb3VudDogMCxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5yZWZUaWxlTm9kZSA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgfVxuXG4gIG9uQ2xpY2tQdXNoID0gY2xpY2tFdmVudCA9PiB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNTeW5jaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMucHVzaCh7XG4gICAgICBmb3JjZTogY2xpY2tFdmVudC5tZXRhS2V5IHx8IGNsaWNrRXZlbnQuY3RybEtleSxcbiAgICAgIHNldFVwc3RyZWFtOiAhdGhpcy5wcm9wcy5jdXJyZW50UmVtb3RlLmlzUHJlc2VudCgpLFxuICAgIH0pO1xuICB9XG5cbiAgb25DbGlja1B1bGwgPSBjbGlja0V2ZW50ID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5pc1N5bmNpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5wdWxsKCk7XG4gIH1cblxuICBvbkNsaWNrUHVzaFB1bGwgPSBjbGlja0V2ZW50ID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5pc1N5bmNpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNsaWNrRXZlbnQubWV0YUtleSB8fCBjbGlja0V2ZW50LmN0cmxLZXkpIHtcbiAgICAgIHRoaXMucHJvcHMucHVzaCh7XG4gICAgICAgIGZvcmNlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMucHVsbCgpO1xuICAgIH1cbiAgfVxuXG4gIG9uQ2xpY2tQdWJsaXNoID0gY2xpY2tFdmVudCA9PiB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNTeW5jaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMucHVzaCh7XG4gICAgICBzZXRVcHN0cmVhbTogIXRoaXMucHJvcHMuY3VycmVudFJlbW90ZS5pc1ByZXNlbnQoKSxcbiAgICB9KTtcbiAgfVxuXG4gIG9uQ2xpY2tGZXRjaCA9IGNsaWNrRXZlbnQgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLmlzU3luY2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLmZldGNoKCk7XG4gIH1cblxuICBnZXRUaWxlU3RhdGVzKCkge1xuICAgIGNvbnN0IG1vZEtleSA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gJ0NtZCcgOiAnQ3RybCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZldGNoaW5nOiB7XG4gICAgICAgIHRvb2x0aXA6ICdGZXRjaGluZyBmcm9tIHJlbW90ZScsXG4gICAgICAgIGljb246ICdzeW5jJyxcbiAgICAgICAgdGV4dDogJ0ZldGNoaW5nJyxcbiAgICAgICAgaWNvbkFuaW1hdGlvbjogJ3JvdGF0ZScsXG4gICAgICB9LFxuICAgICAgcHVsbGluZzoge1xuICAgICAgICB0b29sdGlwOiAnUHVsbGluZyBmcm9tIHJlbW90ZScsXG4gICAgICAgIGljb246ICdhcnJvdy1kb3duJyxcbiAgICAgICAgdGV4dDogJ1B1bGxpbmcnLFxuICAgICAgICBpY29uQW5pbWF0aW9uOiAnZG93bicsXG4gICAgICB9LFxuICAgICAgcHVzaGluZzoge1xuICAgICAgICB0b29sdGlwOiAnUHVzaGluZyB0byByZW1vdGUnLFxuICAgICAgICBpY29uOiAnYXJyb3ctdXAnLFxuICAgICAgICB0ZXh0OiAnUHVzaGluZycsXG4gICAgICAgIGljb25BbmltYXRpb246ICd1cCcsXG4gICAgICB9LFxuICAgICAgYWhlYWQ6IHtcbiAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrUHVzaCxcbiAgICAgICAgdG9vbHRpcDogYENsaWNrIHRvIHB1c2g8YnIgLz4ke21vZEtleX0tY2xpY2sgdG8gZm9yY2UgcHVzaDxiciAvPlJpZ2h0LWNsaWNrIGZvciBtb3JlYCxcbiAgICAgICAgaWNvbjogJ2Fycm93LXVwJyxcbiAgICAgICAgdGV4dDogYFB1c2ggJHt0aGlzLnByb3BzLmFoZWFkQ291bnR9YCxcbiAgICAgIH0sXG4gICAgICBiZWhpbmQ6IHtcbiAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrUHVsbCxcbiAgICAgICAgdG9vbHRpcDogJ0NsaWNrIHRvIHB1bGw8YnIgLz5SaWdodC1jbGljayBmb3IgbW9yZScsXG4gICAgICAgIGljb246ICdhcnJvdy1kb3duJyxcbiAgICAgICAgdGV4dDogYFB1bGwgJHt0aGlzLnByb3BzLmJlaGluZENvdW50fWAsXG4gICAgICB9LFxuICAgICAgYWhlYWRCZWhpbmQ6IHtcbiAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrUHVzaFB1bGwsXG4gICAgICAgIHRvb2x0aXA6IGBDbGljayB0byBwdWxsPGJyIC8+JHttb2RLZXl9LWNsaWNrIHRvIGZvcmNlIHB1c2g8YnIgLz5SaWdodC1jbGljayBmb3IgbW9yZWAsXG4gICAgICAgIGljb246ICdhcnJvdy1kb3duJyxcbiAgICAgICAgdGV4dDogYFB1bGwgJHt0aGlzLnByb3BzLmJlaGluZENvdW50fWAsXG4gICAgICAgIHNlY29uZGFyeUljb246ICdhcnJvdy11cCcsXG4gICAgICAgIHNlY29uZGFyeVRleHQ6IGAke3RoaXMucHJvcHMuYWhlYWRDb3VudH0gYCxcbiAgICAgIH0sXG4gICAgICBwdWJsaXNoZWQ6IHtcbiAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrRmV0Y2gsXG4gICAgICAgIHRvb2x0aXA6ICdDbGljayB0byBmZXRjaDxiciAvPlJpZ2h0LWNsaWNrIGZvciBtb3JlJyxcbiAgICAgICAgaWNvbjogJ3N5bmMnLFxuICAgICAgICB0ZXh0OiAnRmV0Y2gnLFxuICAgICAgfSxcbiAgICAgIHVucHVibGlzaGVkOiB7XG4gICAgICAgIG9uQ2xpY2s6IHRoaXMub25DbGlja1B1Ymxpc2gsXG4gICAgICAgIHRvb2x0aXA6ICdDbGljayB0byBzZXQgdXAgYSByZW1vdGUgdHJhY2tpbmcgYnJhbmNoPGJyIC8+UmlnaHQtY2xpY2sgZm9yIG1vcmUnLFxuICAgICAgICBpY29uOiAnY2xvdWQtdXBsb2FkJyxcbiAgICAgICAgdGV4dDogJ1B1Ymxpc2gnLFxuICAgICAgfSxcbiAgICAgIG5vUmVtb3RlOiB7XG4gICAgICAgIHRvb2x0aXA6ICdUaGVyZSBpcyBubyByZW1vdGUgbmFtZWQgXCJvcmlnaW5cIicsXG4gICAgICAgIGljb246ICdzdG9wJyxcbiAgICAgICAgdGV4dDogJ05vIHJlbW90ZScsXG4gICAgICB9LFxuICAgICAgZGV0YWNoZWQ6IHtcbiAgICAgICAgdG9vbHRpcDogJ0NyZWF0ZSBhIGJyYW5jaCBpZiB5b3Ugd2lzaCB0byBwdXNoIHlvdXIgd29yayBhbnl3aGVyZScsXG4gICAgICAgIGljb246ICdzdG9wJyxcbiAgICAgICAgdGV4dDogJ05vdCBvbiBicmFuY2gnLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlzQWhlYWQgPSB0aGlzLnByb3BzLmFoZWFkQ291bnQgPiAwO1xuICAgIGNvbnN0IGlzQmVoaW5kID0gdGhpcy5wcm9wcy5iZWhpbmRDb3VudCA+IDA7XG4gICAgY29uc3QgaXNVbnB1Ymxpc2hlZCA9ICF0aGlzLnByb3BzLmN1cnJlbnRSZW1vdGUuaXNQcmVzZW50KCk7XG4gICAgY29uc3QgaXNEZXRhY2hlZCA9IHRoaXMucHJvcHMuY3VycmVudEJyYW5jaC5pc0RldGFjaGVkKCk7XG4gICAgY29uc3QgaXNGZXRjaGluZyA9IHRoaXMucHJvcHMuaXNGZXRjaGluZztcbiAgICBjb25zdCBpc1B1bGxpbmcgPSB0aGlzLnByb3BzLmlzUHVsbGluZztcbiAgICBjb25zdCBpc1B1c2hpbmcgPSB0aGlzLnByb3BzLmlzUHVzaGluZztcbiAgICBjb25zdCBoYXNPcmlnaW4gPSAhIXRoaXMucHJvcHMub3JpZ2luRXhpc3RzO1xuXG4gICAgY29uc3QgdGlsZVN0YXRlcyA9IHRoaXMuZ2V0VGlsZVN0YXRlcygpO1xuXG4gICAgbGV0IHRpbGVTdGF0ZTtcblxuICAgIGlmIChpc0ZldGNoaW5nKSB7XG4gICAgICB0aWxlU3RhdGUgPSB0aWxlU3RhdGVzLmZldGNoaW5nO1xuICAgIH0gZWxzZSBpZiAoaXNQdWxsaW5nKSB7XG4gICAgICB0aWxlU3RhdGUgPSB0aWxlU3RhdGVzLnB1bGxpbmc7XG4gICAgfSBlbHNlIGlmIChpc1B1c2hpbmcpIHtcbiAgICAgIHRpbGVTdGF0ZSA9IHRpbGVTdGF0ZXMucHVzaGluZztcbiAgICB9IGVsc2UgaWYgKGlzQWhlYWQgJiYgIWlzQmVoaW5kICYmICFpc1VucHVibGlzaGVkKSB7XG4gICAgICB0aWxlU3RhdGUgPSB0aWxlU3RhdGVzLmFoZWFkO1xuICAgIH0gZWxzZSBpZiAoaXNCZWhpbmQgJiYgIWlzQWhlYWQgJiYgIWlzVW5wdWJsaXNoZWQpIHtcbiAgICAgIHRpbGVTdGF0ZSA9IHRpbGVTdGF0ZXMuYmVoaW5kO1xuICAgIH0gZWxzZSBpZiAoaXNCZWhpbmQgJiYgaXNBaGVhZCAmJiAhaXNVbnB1Ymxpc2hlZCkge1xuICAgICAgdGlsZVN0YXRlID0gdGlsZVN0YXRlcy5haGVhZEJlaGluZDtcbiAgICB9IGVsc2UgaWYgKCFpc0JlaGluZCAmJiAhaXNBaGVhZCAmJiAhaXNVbnB1Ymxpc2hlZCAmJiAhaXNEZXRhY2hlZCkge1xuICAgICAgdGlsZVN0YXRlID0gdGlsZVN0YXRlcy5wdWJsaXNoZWQ7XG4gICAgfSBlbHNlIGlmIChpc1VucHVibGlzaGVkICYmICFpc0RldGFjaGVkICYmIGhhc09yaWdpbikge1xuICAgICAgdGlsZVN0YXRlID0gdGlsZVN0YXRlcy51bnB1Ymxpc2hlZDtcbiAgICB9IGVsc2UgaWYgKGlzVW5wdWJsaXNoZWQgJiYgIWlzRGV0YWNoZWQgJiYgIWhhc09yaWdpbikge1xuICAgICAgdGlsZVN0YXRlID0gdGlsZVN0YXRlcy5ub1JlbW90ZTtcbiAgICB9IGVsc2UgaWYgKGlzRGV0YWNoZWQpIHtcbiAgICAgIHRpbGVTdGF0ZSA9IHRpbGVTdGF0ZXMuZGV0YWNoZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgb25DbGljaz17dGlsZVN0YXRlLm9uQ2xpY2t9XG4gICAgICAgIHJlZj17dGhpcy5yZWZUaWxlTm9kZS5zZXR0ZXJ9XG4gICAgICAgIGNsYXNzTmFtZT17Y3goJ2dpdGh1Yi1QdXNoUHVsbCcsICdpbmxpbmUtYmxvY2snLCB7J2dpdGh1Yi1icmFuY2gtZGV0YWNoZWQnOiBpc0RldGFjaGVkfSl9PlxuICAgICAgICB7dGlsZVN0YXRlICYmIChcbiAgICAgICAgICA8RnJhZ21lbnQ+XG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAge3RpbGVTdGF0ZS5zZWNvbmRhcnlUZXh0ICYmIChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzZWNvbmRhcnlcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Z2V0SWNvbkNsYXNzKHRpbGVTdGF0ZS5zZWNvbmRhcnlJY29uKX0gLz5cbiAgICAgICAgICAgICAgICAgIHt0aWxlU3RhdGUuc2Vjb25kYXJ5VGV4dH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Z2V0SWNvbkNsYXNzKHRpbGVTdGF0ZS5pY29uLCB0aWxlU3RhdGUuaWNvbkFuaW1hdGlvbil9IC8+XG4gICAgICAgICAgICAgIHt0aWxlU3RhdGUudGV4dH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDxUb29sdGlwXG4gICAgICAgICAgICAgIGtleT1cInRvb2x0aXBcIlxuICAgICAgICAgICAgICBtYW5hZ2VyPXt0aGlzLnByb3BzLnRvb2x0aXBNYW5hZ2VyfVxuICAgICAgICAgICAgICB0YXJnZXQ9e3RoaXMucmVmVGlsZU5vZGV9XG4gICAgICAgICAgICAgIHRpdGxlPXtgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGxpbmUtaGVpZ2h0OiAxLjJlbTtcIj4ke3RpbGVTdGF0ZS50b29sdGlwfTwvZGl2PmB9XG4gICAgICAgICAgICAgIHNob3dEZWxheT17YXRvbS50b29sdGlwcy5ob3ZlckRlZmF1bHRzLmRlbGF5LnNob3d9XG4gICAgICAgICAgICAgIGhpZGVEZWxheT17YXRvbS50b29sdGlwcy5ob3ZlckRlZmF1bHRzLmRlbGF5LmhpZGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=