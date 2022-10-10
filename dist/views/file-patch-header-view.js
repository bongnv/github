"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _octicon = _interopRequireDefault(require("../atom/octicon"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _issueishDetailItem = _interopRequireDefault(require("../items/issueish-detail-item"));

var _changedFileItem = _interopRequireDefault(require("../items/changed-file-item"));

var _commitDetailItem = _interopRequireDefault(require("../items/commit-detail-item"));

var _propTypes2 = require("../prop-types");

var _reporterProxy = require("../reporter-proxy");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class FilePatchHeaderView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "togglePatchCollapse", () => {
      if (this.props.isCollapsed) {
        (0, _reporterProxy.addEvent)('expand-file-patch', {
          component: this.constructor.name,
          package: 'github'
        });
        this.props.triggerExpand();
      } else {
        (0, _reporterProxy.addEvent)('collapse-file-patch', {
          component: this.constructor.name,
          package: 'github'
        });
        this.props.triggerCollapse();
      }
    });

    this.refMirrorButton = new _refHolder.default();
    this.refOpenFileButton = new _refHolder.default();
  }

  render() {
    return _react.default.createElement("header", {
      className: "github-FilePatchView-header"
    }, this.renderCollapseButton(), _react.default.createElement("span", {
      className: "github-FilePatchView-title"
    }, this.renderTitle()), this.renderButtonGroup());
  }

  renderCollapseButton() {
    if (this.props.itemType === _changedFileItem.default) {
      return null;
    }

    const icon = this.props.isCollapsed ? 'chevron-right' : 'chevron-down';
    return _react.default.createElement("button", {
      className: "github-FilePatchView-collapseButton",
      onClick: this.togglePatchCollapse
    }, _react.default.createElement(_octicon.default, {
      className: "github-FilePatchView-collapseButtonIcon",
      icon: icon
    }));
  }

  renderTitle() {
    if (this.props.itemType === _changedFileItem.default) {
      const status = this.props.stagingStatus;
      return _react.default.createElement("span", null, status[0].toUpperCase(), status.slice(1), " Changes for ", this.renderDisplayPath());
    } else {
      return this.renderDisplayPath();
    }
  }

  renderDisplayPath() {
    if (this.props.newPath && this.props.newPath !== this.props.relPath) {
      const oldPath = this.renderPath(this.props.relPath);
      const newPath = this.renderPath(this.props.newPath);
      return _react.default.createElement("span", null, oldPath, " ", _react.default.createElement("span", null, "\u2192"), " ", newPath);
    } else {
      return this.renderPath(this.props.relPath);
    }
  }

  renderPath(filePath) {
    const dirname = _path.default.dirname(filePath);

    const basename = _path.default.basename(filePath);

    if (dirname === '.') {
      return _react.default.createElement("span", {
        className: "gitub-FilePatchHeaderView-basename"
      }, basename);
    } else {
      return _react.default.createElement("span", null, dirname, _path.default.sep, _react.default.createElement("span", {
        className: "gitub-FilePatchHeaderView-basename"
      }, basename));
    }
  }

  renderButtonGroup() {
    if (this.props.itemType === _commitDetailItem.default || this.props.itemType === _issueishDetailItem.default) {
      return null;
    } else {
      return _react.default.createElement("span", {
        className: "btn-group"
      }, this.renderUndoDiscardButton(), this.renderMirrorPatchButton(), this.renderOpenFileButton(), this.renderToggleFileButton());
    }
  }

  renderUndoDiscardButton() {
    const unstagedChangedFileItem = this.props.itemType === _changedFileItem.default && this.props.stagingStatus === 'unstaged';

    if (unstagedChangedFileItem && this.props.hasUndoHistory) {
      return _react.default.createElement("button", {
        className: "btn icon icon-history",
        onClick: this.props.undoLastDiscard
      }, "Undo Discard");
    } else {
      return null;
    }
  }

  renderMirrorPatchButton() {
    if (!this.props.isPartiallyStaged) {
      return null;
    }

    const attrs = this.props.stagingStatus === 'unstaged' ? {
      iconClass: 'icon-tasklist',
      buttonText: 'View Staged'
    } : {
      iconClass: 'icon-list-unordered',
      buttonText: 'View Unstaged'
    };
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement("button", {
      ref: this.refMirrorButton.setter,
      className: (0, _classnames.default)('btn', 'icon', attrs.iconClass),
      onClick: this.props.diveIntoMirrorPatch
    }, attrs.buttonText));
  }

  renderOpenFileButton() {
    let buttonText = 'Jump To File';

    if (this.props.hasMultipleFileSelections) {
      buttonText += 's';
    }

    return _react.default.createElement(_react.Fragment, null, _react.default.createElement("button", {
      ref: this.refOpenFileButton.setter,
      className: "btn icon icon-code github-FilePatchHeaderView-jumpToFileButton",
      onClick: this.props.openFile
    }, buttonText));
  }

  renderToggleFileButton() {
    const attrs = this.props.stagingStatus === 'unstaged' ? {
      buttonClass: 'icon-move-down',
      buttonText: 'Stage File'
    } : {
      buttonClass: 'icon-move-up',
      buttonText: 'Unstage File'
    };
    return _react.default.createElement("button", {
      className: (0, _classnames.default)('btn', 'icon', attrs.buttonClass),
      onClick: this.props.toggleFile
    }, attrs.buttonText);
  }

}

exports.default = FilePatchHeaderView;

_defineProperty(FilePatchHeaderView, "propTypes", {
  relPath: _propTypes.default.string.isRequired,
  newPath: _propTypes.default.string,
  stagingStatus: _propTypes.default.oneOf(['staged', 'unstaged']),
  isPartiallyStaged: _propTypes.default.bool,
  hasUndoHistory: _propTypes.default.bool,
  hasMultipleFileSelections: _propTypes.default.bool.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  undoLastDiscard: _propTypes.default.func.isRequired,
  diveIntoMirrorPatch: _propTypes.default.func.isRequired,
  openFile: _propTypes.default.func.isRequired,
  // should probably change 'toggleFile' to 'toggleFileStagingStatus'
  // because the addition of another toggling function makes the old name confusing.
  toggleFile: _propTypes.default.func.isRequired,
  itemType: _propTypes2.ItemTypePropType.isRequired,
  isCollapsed: _propTypes.default.bool.isRequired,
  triggerExpand: _propTypes.default.func.isRequired,
  triggerCollapse: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9maWxlLXBhdGNoLWhlYWRlci12aWV3LmpzIl0sIm5hbWVzIjpbIkZpbGVQYXRjaEhlYWRlclZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJpc0NvbGxhcHNlZCIsImNvbXBvbmVudCIsIm5hbWUiLCJwYWNrYWdlIiwidHJpZ2dlckV4cGFuZCIsInRyaWdnZXJDb2xsYXBzZSIsInJlZk1pcnJvckJ1dHRvbiIsIlJlZkhvbGRlciIsInJlZk9wZW5GaWxlQnV0dG9uIiwicmVuZGVyIiwicmVuZGVyQ29sbGFwc2VCdXR0b24iLCJyZW5kZXJUaXRsZSIsInJlbmRlckJ1dHRvbkdyb3VwIiwiaXRlbVR5cGUiLCJDaGFuZ2VkRmlsZUl0ZW0iLCJpY29uIiwidG9nZ2xlUGF0Y2hDb2xsYXBzZSIsInN0YXR1cyIsInN0YWdpbmdTdGF0dXMiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicmVuZGVyRGlzcGxheVBhdGgiLCJuZXdQYXRoIiwicmVsUGF0aCIsIm9sZFBhdGgiLCJyZW5kZXJQYXRoIiwiZmlsZVBhdGgiLCJkaXJuYW1lIiwicGF0aCIsImJhc2VuYW1lIiwic2VwIiwiQ29tbWl0RGV0YWlsSXRlbSIsIklzc3VlaXNoRGV0YWlsSXRlbSIsInJlbmRlclVuZG9EaXNjYXJkQnV0dG9uIiwicmVuZGVyTWlycm9yUGF0Y2hCdXR0b24iLCJyZW5kZXJPcGVuRmlsZUJ1dHRvbiIsInJlbmRlclRvZ2dsZUZpbGVCdXR0b24iLCJ1bnN0YWdlZENoYW5nZWRGaWxlSXRlbSIsImhhc1VuZG9IaXN0b3J5IiwidW5kb0xhc3REaXNjYXJkIiwiaXNQYXJ0aWFsbHlTdGFnZWQiLCJhdHRycyIsImljb25DbGFzcyIsImJ1dHRvblRleHQiLCJzZXR0ZXIiLCJkaXZlSW50b01pcnJvclBhdGNoIiwiaGFzTXVsdGlwbGVGaWxlU2VsZWN0aW9ucyIsIm9wZW5GaWxlIiwiYnV0dG9uQ2xhc3MiLCJ0b2dnbGVGaWxlIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsIm9uZU9mIiwiYm9vbCIsInRvb2x0aXBzIiwib2JqZWN0IiwiZnVuYyIsIkl0ZW1UeXBlUHJvcFR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFZSxNQUFNQSxtQkFBTixTQUFrQ0MsZUFBTUMsU0FBeEMsQ0FBa0Q7QUF5Qi9EQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNqQixVQUFNQSxLQUFOOztBQURpQixpREFtQkcsTUFBTTtBQUMxQixVQUFJLEtBQUtBLEtBQUwsQ0FBV0MsV0FBZixFQUE0QjtBQUMxQixxQ0FBUyxtQkFBVCxFQUE4QjtBQUFDQyxVQUFBQSxTQUFTLEVBQUUsS0FBS0gsV0FBTCxDQUFpQkksSUFBN0I7QUFBbUNDLFVBQUFBLE9BQU8sRUFBRTtBQUE1QyxTQUE5QjtBQUNBLGFBQUtKLEtBQUwsQ0FBV0ssYUFBWDtBQUNELE9BSEQsTUFHTztBQUNMLHFDQUFTLHFCQUFULEVBQWdDO0FBQUNILFVBQUFBLFNBQVMsRUFBRSxLQUFLSCxXQUFMLENBQWlCSSxJQUE3QjtBQUFtQ0MsVUFBQUEsT0FBTyxFQUFFO0FBQTVDLFNBQWhDO0FBQ0EsYUFBS0osS0FBTCxDQUFXTSxlQUFYO0FBQ0Q7QUFDRixLQTNCa0I7O0FBR2pCLFNBQUtDLGVBQUwsR0FBdUIsSUFBSUMsa0JBQUosRUFBdkI7QUFDQSxTQUFLQyxpQkFBTCxHQUF5QixJQUFJRCxrQkFBSixFQUF6QjtBQUNEOztBQUVERSxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUNFO0FBQVEsTUFBQSxTQUFTLEVBQUM7QUFBbEIsT0FDRyxLQUFLQyxvQkFBTCxFQURILEVBRUU7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUNHLEtBQUtDLFdBQUwsRUFESCxDQUZGLEVBS0csS0FBS0MsaUJBQUwsRUFMSCxDQURGO0FBU0Q7O0FBWURGLEVB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bkI7QUFZakJMLEVBQUFBLFFBQVEsRUFBRUcsbUJBQVVPLElBQVYsQ0FBZUwsVUFaUjtBQWFqQjtBQUNBO0FBQ0FILEVBQUFBLFVBQVUsRUFBRUMsbUJBQVVPLElBQVYsQ0FBZUwsVUFmVjtBQWlCakJ2QyxFQUFBQSxRQUFRLEVBQUU2Qyw2QkFBaUJOLFVBakJWO0FBbUJqQnBELEVBQUFBLFdBQVcsRUFBRWtELG1CQUFVSSxJQUFWLENBQWVGLFVBbkJYO0FBb0JqQmhELEVBQUFBLGFBQWEsRUFBRThDLG1CQUFVTyxJQUFWLENBQWVMLFVBcEJiO0FBcUJqQi9DLEVBQUFBLGVBQWUsRUFBRTZDLG1CQUFVTyxJQUFWLENBQWVMO0FBckJmLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY3ggZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBPY3RpY29uIGZyb20gJy4uL2F0b20vb2N0aWNvbic7XG5pbXBvcnQgUmVmSG9sZGVyIGZyb20gJy4uL21vZGVscy9yZWYtaG9sZGVyJztcbmltcG9ydCBJc3N1ZWlzaERldGFpbEl0ZW0gZnJvbSAnLi4vaXRlbXMvaXNzdWVpc2gtZGV0YWlsLWl0ZW0nO1xuaW1wb3J0IENoYW5nZWRGaWxlSXRlbSBmcm9tICcuLi9pdGVtcy9jaGFuZ2VkLWZpbGUtaXRlbSc7XG5pbXBvcnQgQ29tbWl0RGV0YWlsSXRlbSBmcm9tICcuLi9pdGVtcy9jb21taXQtZGV0YWlsLWl0ZW0nO1xuaW1wb3J0IHtJdGVtVHlwZVByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCB7YWRkRXZlbnR9IGZyb20gJy4uL3JlcG9ydGVyLXByb3h5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZVBhdGNoSGVhZGVyVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcmVsUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5ld1BhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc3RhZ2luZ1N0YXR1czogUHJvcFR5cGVzLm9uZU9mKFsnc3RhZ2VkJywgJ3Vuc3RhZ2VkJ10pLFxuICAgIGlzUGFydGlhbGx5U3RhZ2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBoYXNVbmRvSGlzdG9yeTogUHJvcFR5cGVzLmJvb2wsXG4gICAgaGFzTXVsdGlwbGVGaWxlU2VsZWN0aW9uczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcblxuICAgIHRvb2x0aXBzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICB1bmRvTGFzdERpc2NhcmQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgZGl2ZUludG9NaXJyb3JQYXRjaDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvcGVuRmlsZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyBzaG91bGQgcHJvYmFibHkgY2hhbmdlICd0b2dnbGVGaWxlJyB0byAndG9nZ2xlRmlsZVN0YWdpbmdTdGF0dXMnXG4gICAgLy8gYmVjYXVzZSB0aGUgYWRkaXRpb24gb2YgYW5vdGhlciB0b2dnbGluZyBmdW5jdGlvbiBtYWtlcyB0aGUgb2xkIG5hbWUgY29uZnVzaW5nLlxuICAgIHRvZ2dsZUZpbGU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICBpdGVtVHlwZTogSXRlbVR5cGVQcm9wVHlwZS5pc1JlcXVpcmVkLFxuXG4gICAgaXNDb2xsYXBzZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdHJpZ2dlckV4cGFuZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB0cmlnZ2VyQ29sbGFwc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnJlZk1pcnJvckJ1dHRvbiA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZk9wZW5GaWxlQnV0dG9uID0gbmV3IFJlZkhvbGRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LWhlYWRlclwiPlxuICAgICAgICB7dGhpcy5yZW5kZXJDb2xsYXBzZUJ1dHRvbigpfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItRmlsZVBhdGNoVmlldy10aXRsZVwiPlxuICAgICAgICAgIHt0aGlzLnJlbmRlclRpdGxlKCl9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAge3RoaXMucmVuZGVyQnV0dG9uR3JvdXAoKX1cbiAgICAgIDwvaGVhZGVyPlxuICAgICk7XG4gIH1cblxuICB0b2dnbGVQYXRjaENvbGxhcHNlID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLmlzQ29sbGFwc2VkKSB7XG4gICAgICBhZGRFdmVudCgnZXhwYW5kLWZpbGUtcGF0Y2gnLCB7Y29tcG9uZW50OiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIHBhY2thZ2U6ICdnaXRodWInfSk7XG4gICAgICB0aGlzLnByb3BzLnRyaWdnZXJFeHBhbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkRXZlbnQoJ2NvbGxhcHNlLWZpbGUtcGF0Y2gnLCB7Y29tcG9uZW50OiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIHBhY2thZ2U6ICdnaXRodWInfSk7XG4gICAgICB0aGlzLnByb3BzLnRyaWdnZXJDb2xsYXBzZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckNvbGxhcHNlQnV0dG9uKCkge1xuICAgIGlmICh0aGlzLnByb3BzLml0ZW1UeXBlID09PSBDaGFuZ2VkRmlsZUl0ZW0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBpY29uID0gdGhpcy5wcm9wcy5pc0NvbGxhcHNlZCA/ICdjaGV2cm9uLXJpZ2h0JyA6ICdjaGV2cm9uLWRvd24nO1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LWNvbGxhcHNlQnV0dG9uXCJcbiAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVQYXRjaENvbGxhcHNlfT5cbiAgICAgICAgPE9jdGljb24gY2xhc3NOYW1lPVwiZ2l0aHViLUZpbGVQYXRjaFZpZXctY29sbGFwc2VCdXR0b25JY29uXCIgaWNvbj17aWNvbn0gLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJUaXRsZSgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5pdGVtVHlwZSA9PT0gQ2hhbmdlZEZpbGVJdGVtKSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSB0aGlzLnByb3BzLnN0YWdpbmdTdGF0dXM7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8c3Bhbj57c3RhdHVzWzBdLnRvVXBwZXJDYXNlKCl9e3N0YXR1cy5zbGljZSgxKX0gQ2hhbmdlcyBmb3Ige3RoaXMucmVuZGVyRGlzcGxheVBhdGgoKX08L3NwYW4+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJEaXNwbGF5UGF0aCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckRpc3BsYXlQYXRoKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm5ld1BhdGggJiYgdGhpcy5wcm9wcy5uZXdQYXRoICE9PSB0aGlzLnByb3BzLnJlbFBhdGgpIHtcbiAgICAgIGNvbnN0IG9sZFBhdGggPSB0aGlzLnJlbmRlclBhdGgodGhpcy5wcm9wcy5yZWxQYXRoKTtcbiAgICAgIGNvbnN0IG5ld1BhdGggPSB0aGlzLnJlbmRlclBhdGgodGhpcy5wcm9wcy5uZXdQYXRoKTtcbiAgICAgIHJldHVybiA8c3Bhbj57b2xkUGF0aH0gPHNwYW4+4oaSPC9zcGFuPiB7bmV3UGF0aH08L3NwYW4+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJQYXRoKHRoaXMucHJvcHMucmVsUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyUGF0aChmaWxlUGF0aCkge1xuICAgIGNvbnN0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCk7XG5cbiAgICBpZiAoZGlybmFtZSA9PT0gJy4nKSB7XG4gICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwiZ2l0dWItRmlsZVBhdGNoSGVhZGVyVmlldy1iYXNlbmFtZVwiPntiYXNlbmFtZX08L3NwYW4+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICB7ZGlybmFtZX17cGF0aC5zZXB9PHNwYW4gY2xhc3NOYW1lPVwiZ2l0dWItRmlsZVBhdGNoSGVhZGVyVmlldy1iYXNlbmFtZVwiPntiYXNlbmFtZX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyQnV0dG9uR3JvdXAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXRlbVR5cGUgPT09IENvbW1pdERldGFpbEl0ZW0gfHwgdGhpcy5wcm9wcy5pdGVtVHlwZSA9PT0gSXNzdWVpc2hEZXRhaWxJdGVtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAge3RoaXMucmVuZGVyVW5kb0Rpc2NhcmRCdXR0b24oKX1cbiAgICAgICAgICB7dGhpcy5yZW5kZXJNaXJyb3JQYXRjaEJ1dHRvbigpfVxuICAgICAgICAgIHt0aGlzLnJlbmRlck9wZW5GaWxlQnV0dG9uKCl9XG4gICAgICAgICAge3RoaXMucmVuZGVyVG9nZ2xlRmlsZUJ1dHRvbigpfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlclVuZG9EaXNjYXJkQnV0dG9uKCkge1xuICAgIGNvbnN0IHVuc3RhZ2VkQ2hhbmdlZEZpbGVJdGVtID0gdGhpcy5wcm9wcy5pdGVtVHlwZSA9PT0gQ2hhbmdlZEZpbGVJdGVtICYmIHRoaXMucHJvcHMuc3RhZ2luZ1N0YXR1cyA9PT0gJ3Vuc3RhZ2VkJztcbiAgICBpZiAodW5zdGFnZWRDaGFuZ2VkRmlsZUl0ZW0gJiYgdGhpcy5wcm9wcy5oYXNVbmRvSGlzdG9yeSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLWhpc3RvcnlcIiBvbkNsaWNrPXt0aGlzLnByb3BzLnVuZG9MYXN0RGlzY2FyZH0+XG4gICAgICAgIFVuZG8gRGlzY2FyZFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlck1pcnJvclBhdGNoQnV0dG9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5pc1BhcnRpYWxseVN0YWdlZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLnByb3BzLnN0YWdpbmdTdGF0dXMgPT09ICd1bnN0YWdlZCdcbiAgICAgID8ge1xuICAgICAgICBpY29uQ2xhc3M6ICdpY29uLXRhc2tsaXN0JyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ1ZpZXcgU3RhZ2VkJyxcbiAgICAgIH1cbiAgICAgIDoge1xuICAgICAgICBpY29uQ2xhc3M6ICdpY29uLWxpc3QtdW5vcmRlcmVkJyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ1ZpZXcgVW5zdGFnZWQnLFxuICAgICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICByZWY9e3RoaXMucmVmTWlycm9yQnV0dG9uLnNldHRlcn1cbiAgICAgICAgICBjbGFzc05hbWU9e2N4KCdidG4nLCAnaWNvbicsIGF0dHJzLmljb25DbGFzcyl9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5kaXZlSW50b01pcnJvclBhdGNofT5cbiAgICAgICAgICB7YXR0cnMuYnV0dG9uVGV4dH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJPcGVuRmlsZUJ1dHRvbigpIHtcbiAgICBsZXQgYnV0dG9uVGV4dCA9ICdKdW1wIFRvIEZpbGUnO1xuICAgIGlmICh0aGlzLnByb3BzLmhhc011bHRpcGxlRmlsZVNlbGVjdGlvbnMpIHtcbiAgICAgIGJ1dHRvblRleHQgKz0gJ3MnO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICByZWY9e3RoaXMucmVmT3BlbkZpbGVCdXR0b24uc2V0dGVyfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tY29kZSBnaXRodWItRmlsZVBhdGNoSGVhZGVyVmlldy1qdW1wVG9GaWxlQnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9wZW5GaWxlfT5cbiAgICAgICAgICB7YnV0dG9uVGV4dH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJUb2dnbGVGaWxlQnV0dG9uKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5wcm9wcy5zdGFnaW5nU3RhdHVzID09PSAndW5zdGFnZWQnXG4gICAgICA/IHtcbiAgICAgICAgYnV0dG9uQ2xhc3M6ICdpY29uLW1vdmUtZG93bicsXG4gICAgICAgIGJ1dHRvblRleHQ6ICdTdGFnZSBGaWxlJyxcbiAgICAgIH1cbiAgICAgIDoge1xuICAgICAgICBidXR0b25DbGFzczogJ2ljb24tbW92ZS11cCcsXG4gICAgICAgIGJ1dHRvblRleHQ6ICdVbnN0YWdlIEZpbGUnLFxuICAgICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT17Y3goJ2J0bicsICdpY29uJywgYXR0cnMuYnV0dG9uQ2xhc3MpfSBvbkNsaWNrPXt0aGlzLnByb3BzLnRvZ2dsZUZpbGV9PlxuICAgICAgICB7YXR0cnMuYnV0dG9uVGV4dH1cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==