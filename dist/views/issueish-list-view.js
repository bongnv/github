"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _propTypes2 = require("../prop-types");

var _accordion = _interopRequireDefault(require("./accordion"));

var _timeago = _interopRequireDefault(require("./timeago"));

var _statusDonutChart = _interopRequireDefault(require("./status-donut-chart"));

var _checkSuitesAccumulator = _interopRequireDefault(require("../containers/accumulators/check-suites-accumulator"));

var _queryErrorTile = _interopRequireDefault(require("./query-error-tile"));

var _octicon = _interopRequireDefault(require("../atom/octicon"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class IssueishListView extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderReviewsButton", () => {
      if (!this.props.needReviewsButton || this.props.issueishes.length < 1) {
        return null;
      }

      return _react.default.createElement("button", {
        className: "btn btn-primary btn-sm github-IssueishList-openReviewsButton",
        onClick: this.openReviews
      }, "See reviews");
    });

    _defineProperty(this, "openReviews", e => {
      e.stopPropagation();
      this.props.openReviews(this.props.issueishes[0]);
    });

    _defineProperty(this, "renderIssueish", issueish => {
      return _react.default.createElement(_checkSuitesAccumulator.default, {
        commit: issueish.getLatestCommit()
      }, ({
        runsBySuite
      }) => {
        issueish.setCheckRuns(runsBySuite);
        return _react.default.createElement(_react.Fragment, null, _react.default.createElement("img", {
          className: "github-IssueishList-item github-IssueishList-item--avatar",
          src: issueish.getAuthorAvatarURL(32),
          title: issueish.getAuthorLogin(),
          alt: issueish.getAuthorLogin()
        }), _react.default.createElement("span", {
          className: "github-IssueishList-item github-IssueishList-item--title"
        }, issueish.getTitle()), _react.default.createElement("span", {
          className: "github-IssueishList-item github-IssueishList-item--number"
        }, "#", issueish.getNumber()), this.renderStatusSummary(issueish.getStatusCounts()), _react.default.createElement(_timeago.default, {
          time: issueish.getCreatedAt(),
          displayStyle: "short",
          className: "github-IssueishList-item github-IssueishList-item--age"
        }), _react.default.createElement(_octicon.default, {
          icon: "ellipses",
          className: "github-IssueishList-item github-IssueishList-item--menu",
          onClick: event => this.showActionsMenu(event, issueish)
        }));
      });
    });

    _defineProperty(this, "renderLoadingTile", () => {
      return _react.default.createElement("div", {
        className: "github-IssueishList-loading"
      }, "Loading");
    });

    _defineProperty(this, "renderEmptyTile", () => {
      if (this.props.error) {
        return _react.default.createElement(_queryErrorTile.default, {
          error: this.props.error
        });
      }

      if (this.props.emptyComponent) {
        const EmptyComponent = this.props.emptyComponent;
        return _react.default.createElement(EmptyComponent, null);
      }

      return null;
    });

    _defineProperty(this, "renderMoreTile", () => {
      /* eslint-disable jsx-a11y/anchor-is-valid */
      if (this.props.onMoreClick) {
        return _react.default.createElement("div", {
          className: "github-IssueishList-more"
        }, _react.default.createElement("a", {
          onClick: this.props.onMoreClick
        }, "More..."));
      }

      return null;
    });
  }

  render() {
    return _react.default.createElement(_accordion.default, {
      leftTitle: this.props.title,
      isLoading: this.props.isLoading,
      results: this.props.issueishes,
      total: this.props.total,
      loadingComponent: this.renderLoadingTile,
      emptyComponent: this.renderEmptyTile,
      moreComponent: this.renderMoreTile,
      reviewsButton: this.renderReviewsButton,
      onClickItem: this.props.onIssueishClick
    }, this.renderIssueish);
  }

  showActionsMenu(event, issueish) {
    event.preventDefault();
    event.stopPropagation();
    this.props.showActionsMenu(issueish);
  }

  renderStatusSummary(statusCounts) {
    if (['success', 'failure', 'pending'].every(kind => statusCounts[kind] === 0)) {
      return _react.default.createElement(_octicon.default, {
        className: "github-IssueishList-item github-IssueishList-item--status",
        icon: "dash"
      });
    }

    if (statusCounts.success > 0 && statusCounts.failure === 0 && statusCounts.pending === 0) {
      return _react.default.createElement(_octicon.default, {
        className: "github-IssueishList-item github-IssueishList-item--status",
        icon: "check"
      });
    }

    if (statusCounts.success === 0 && statusCounts.failure > 0 && statusCounts.pending === 0) {
      return _react.default.createElement(_octicon.default, {
        className: "github-IssueishList-item github-IssueishList-item--status",
        icon: "x"
      });
    }

    return _react.default.createElement(_statusDonutChart.default, _extends({}, statusCounts, {
      className: "github-IssueishList-item github-IssueishList-item--status"
    }));
  }

}

exports.default = IssueishListView;

_defineProperty(IssueishListView, "propTypes", {
  title: _propTypes.default.string.isRequired,
  isLoading: _propTypes.default.bool.isRequired,
  total: _propTypes.default.number.isRequired,
  issueishes: _propTypes.default.arrayOf(_propTypes2.IssueishPropType).isRequired,
  repository: _propTypes.default.shape({
    defaultBranchRef: _propTypes.default.shape({
      prefix: _propTypes.default.string.isRequired,
      name: _propTypes.default.string.isRequired
    })
  }),
  needReviewsButton: _propTypes.default.bool,
  onIssueishClick: _propTypes.default.func.isRequired,
  onMoreClick: _propTypes.default.func,
  openReviews: _propTypes.default.func.isRequired,
  openOnGitHub: _propTypes.default.func.isRequired,
  showActionsMenu: _propTypes.default.func.isRequired,
  emptyComponent: _propTypes.default.func,
  error: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9pc3N1ZWlzaC1saXN0LXZpZXcuanMiXSwibmFtZXMiOlsiSXNzdWVpc2hMaXN0VmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJuZWVkUmV2aWV3c0J1dHRvbiIsImlzc3VlaXNoZXMiLCJsZW5ndGgiLCJvcGVuUmV2aWV3cyIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJpc3N1ZWlzaCIsImdldExhdGVzdENvbW1pdCIsInJ1bnNCeVN1aXRlIiwic2V0Q2hlY2tSdW5zIiwiZ2V0QXV0aG9yQXZhdGFyVVJMIiwiZ2V0QXV0aG9yTG9naW4iLCJnZXRUaXRsZSIsImdldE51bWJlciIsInJlbmRlclN0YXR1c1N1bW1hcnkiLCJnZXRTdGF0dXNDb3VudHMiLCJnZXRDcmVhdGVkQXQiLCJldmVudCIsInNob3dBY3Rpb25zTWVudSIsImVycm9yIiwiZW1wdHlDb21wb25lbnQiLCJFbXB0eUNvbXBvbmVudCIsIm9uTW9yZUNsaWNrIiwicmVuZGVyIiwidGl0bGUiLCJpc0xvYWRpbmciLCJ0b3RhbCIsInJlbmRlckxvYWRpbmdUaWxlIiwicmVuZGVyRW1wdHlUaWxlIiwicmVuZGVyTW9yZVRpbGUiLCJyZW5kZXJSZXZpZXdzQnV0dG9uIiwib25Jc3N1ZWlzaENsaWNrIiwicmVuZGVySXNzdWVpc2giLCJwcmV2ZW50RGVmYXVsdCIsInN0YXR1c0NvdW50cyIsImV2ZXJ5Iiwia2luZCIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwicGVuZGluZyIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJib29sIiwibnVtYmVyIiwiYXJyYXlPZiIsIklzc3VlaXNoUHJvcFR5cGUiLCJyZXBvc2l0b3J5Iiwic2hhcGUiLCJkZWZhdWx0QnJhbmNoUmVmIiwicHJlZml4IiwibmFtZSIsImZ1bmMiLCJvcGVuT25HaXRIdWIiLCJvYmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVlLE1BQU1BLGdCQUFOLFNBQStCQyxlQUFNQyxTQUFyQyxDQUErQztBQUFBO0FBQUE7O0FBQUEsaURBMEN0QyxNQUFNO0FBQzFCLFVBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdDLGlCQUFaLElBQWlDLEtBQUtELEtBQUwsQ0FBV0UsVUFBWCxDQUFzQkMsTUFBdEIsR0FBK0IsQ0FBcEUsRUFBdUU7QUFDckUsZUFBTyxJQUFQO0FBQ0Q7O0FBQ0QsYUFDRTtBQUNFLFFBQUEsU0FBUyxFQUFDLDhEQURaO0FBRUUsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFGaEIsdUJBREY7QUFPRCxLQXJEMkQ7O0FBQUEseUNBdUQ5Q0MsQ0FBQyxJQUFJO0FBQ2pCQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQSxXQUFLTixLQUFMLENBQVdJLFdBQVgsQ0FBdUIsS0FBS0osS0FBTCxDQUFXRSxVQUFYLENBQXNCLENBQXRCLENBQXZCO0FBQ0QsS0ExRDJEOztBQUFBLDRDQTREM0NLLFFBQVEsSUFBSTtBQUMzQixhQUNFLDZCQUFDLCtCQUFEO0FBQXdCLFFBQUEsTUFBTSxFQUFFQSxRQUFRLENBQUNDLGVBQVQ7QUFBaEMsU0FDRyxDQUFDO0FBQUNDLFFBQUFBO0FBQUQsT0FBRCxLQUFtQjtBQUNsQkYsUUFBQUEsUUFBUSxDQUFDRyxZQUFULENBQXNCRCxXQUF0QjtBQUVBLGVBQ0UsNkJBQUMsZUFBRCxRQUNFO0FBQ0UsVUFBQSxTQUFTLEVBQUMsMkRBRFo7QUFFRSxVQUFBLEdBQUcsRUFBRUYsUUFBUSxDQUFDSSxrQkFBVCxDQUE0QixFQUE1QixDQUZQO0FBR0UsVUFBQSxLQUFLLEVBQUVKLFFBQVEsQ0FBQ0ssY0FBVCxFQUhUO0FBSUUsVUFBQSxHQUFHLEVBQUVMLFFBQVEsQ0FBQ0ssY0FBVDtBQUpQLFVBREYsRUFPRTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFdBQ0dMLFFBQVEsQ0FBQ00sUUFBVCxFQURILENBUEYsRUFVRTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLGdCQUNJTixRQUFRLENBQUNPLFNBQVQsRUFESixDQVZGLEVBYUcsS0FBS0MsbUJBQUwsQ0FBeUJSLFFBQVEsQ0FBQ1MsZUFBVCxFQUF6QixDQWJILEVBY0UsNkJBQUMsZ0JBQUQ7QUFDRSxVQUFBLElBQUksRUFBRVQsUUFBUSxDQUFDVSxZQUFULEVBRFI7QUFFRSxVQUFBLFlBQVksRUFBQyxPQUZmO0FBR0UsVUFBQSxTQUFTLEVBQUM7QUFIWixVQWRGLEVBbUJFLDZCQUFDLGdCQUFEO0FBQVMsVUFBQSxJQUFJLEVBQUMsVUFBZDtBQUNFLFVBQUEsU0FBUyxFQUFDLHlEQURaO0FBRUUsVUFBQSxPQUFPLEVBQUVDLEtBQUssSUFBSSxLQUFLQyxlQUFMLENBQXFCRCxLQUFyQixFQUE0QlgsUUFBNUI7QUFGcEIsVUFuQkYsQ0FERjtBQTBCRCxPQTlCSCxDQURGO0FBa0NELEtBL0YyRDs7QUFBQSwrQ0F3SHhDLE1BQU07QUFDeEIsYUFDRTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsbUJBREY7QUFLRCxLQTlIMkQ7O0FBQUEsNkNBZ0kxQyxNQUFNO0FBQ3RCLFVBQUksS0FBS1AsS0FBTCxDQUFXb0IsS0FBZixFQUFzQjtBQUNwQixlQUFPLDZCQUFDLHVCQUFEO0FBQWdCLFVBQUEsS0FBSyxFQUFFLEtBQUtwQixLQUFMLENBQVdvQjtBQUFsQyxVQUFQO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLcEIsS0FBTCxDQUFXcUIsY0FBZixFQUErQjtBQUM3QixjQUFNQyxjQUFjLEdBQUcsS0FBS3RCLEtBQUwsQ0FBV3FCLGNBQWxDO0FBQ0EsZUFBTyw2QkFBQyxjQUFELE9BQVA7QUFDRDs7QUFFRCxhQUFPLElBQVA7QUFDRCxLQTNJMkQ7O0FBQUEsNENBNkkzQyxNQUFNO0FBQ3JCO0FBQ0EsVUFBSSxLQUFLckIsS0FBTCxDQUFXdUIsV0FBZixFQUE0QjtBQUMxQixlQUNFO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZixXQUNFO0FBQUcsVUFBQSxPQUFPLEVBQUUsS0FBS3ZCLEtBQUwsQ0FBV3VCO0FBQXZCLHFCQURGLENBREY7QUFPRDs7QUFFRCxhQUFPLElBQVA7QUFDRCxLQTFKMkQ7QUFBQTs7QUF5QjVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUNFLDZCQUFDLGtCQUFEO0FBQ0UsTUFBQSxTQUFTLEVBQUUsS0FBS3hCLEtBQUwsQ0FBV3lCLEtBRHhCO0FBRUUsTUFBQSxTQUFTLEVBQUUsS0FBS3pCLEtBQUwsQ0FBVzBCLFNBRnhCO0FBR0UsTUFBQSxPQUFPLEVBQUUsS0FBSzFCLEtBQUwsQ0FBV0UsVUFIdEI7QUFJRSxNQUFBLEtBQUssRUFBRSxLQUFLRixLQUFMLENBQVcyQixLQUpwQjtBQUtFLE1BQUEsZ0JBQWdCLEVBQUUsS0FBS0MsaUJBTHpCO0FBTUUsTUFBQSxjQUFjLEVBQUUsS0FBS0MsZUFOdkI7QUFPRSxNQUFBLGFBQWEsRUFBRSxLQUFLQyxjQVB0QjtBQVFFLE1BQUEsYUFBYSxFQUFFLEtBQUtDLG1CQVJ0QjtBQVNFLE1BQUEsV0FBVyxFQUFFLEtBQUsvQixLQUFMLENBQVdnQztBQVQxQixPQVVHLEtBQUtDLGNBVlIsQ0FERjtBQWNEOztBQXlERGQsRUFBQUEsZUFBZSxDQUFDRCxLQUFELEVBQVFYLFFBQVIsRUFBa0I7QUFDL0JXLElBQUFBLEtBQUssQ0FBQ2dCLGNBQU47QUFDQWhCLElBQUFBLEtBQUssQ0FBQ1osZUFBTjtBQUVBLFNBQUtOLEtBQUwsQ0FBV21CLGVBQVgsQ0FBMkJaLFFBQTNCO0FBQ0Q7O0FBRURRLEVBQUFBLG1CQUFtQixDQUFDb0IsWUFBRCxFQUFlO0FBQ2hDLFFBQUksQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQ0MsS0FBbEMsQ0FBd0NDLElBQUksSUFBSUYsWUFBWSxDQUFDRSxJQUFELENBQVosS0FBdUIsQ0FBdkUsQ0FBSixFQUErRTtBQUM3RSxhQUFPLDZCQUFDLGdCQUFEO0FBQVMsUUFBQSxTQUFTLEVBQUMsMkRBQW5CO0FBQStFLFFBQUEsSUFBSSxFQUFDO0FBQXBGLFFBQVA7QUFDRDs7QUFFRCxRQUFJRixZQUFZLENBQUNHLE9BQWIsR0FBdUIsQ0FBdkIsSUFBNEJILFlBQVksQ0FBQ0ksT0FBYixLQUF5QixDQUFyRCxJQUEwREosWUFBWSxDQUFDSyxPQUFiLEtBQXlCLENBQXZGLEVBQTBGO0FBQ3hGLGFBQU8sNkJBQUMsZ0JBQUQ7QUFBUyxRQUFBLFNBQVMsRUFBQywyREFBbkI7QUFBK0UsUUFBQSxJQUFJLEVBQUM7QUFBcEYsUUFBUDtBQUNEOztBQUVELFFBQUlMLFlBQVksQ0FBQ0csT0FBYixLQUF5QixDQUF6QixJQUE4QkgsWUFBWSxDQUFDSSxPQUFiLEdBQXVCLENBQXJELElBQTBESixZQUFZLENBQUNLLE9BQWIsS0FBeUIsQ0FBdkYsRUFBMEY7QUFDeEYsYUFBTyw2QkFBQyxnQkFBRDtBQUFTLFFBQUEsU0FBUyxFQUFDLDJEQUFuQjtBQUErRSxRQUFBLElBQUksRUFBQztBQUFwRixRQUFQO0FBQ0Q7O0FBRUQsV0FBTyw2QkFBQyx5QkFBRCxlQUFzQkwsWUFBdEI7QUFBb0MsTUFBQSxTQUFTLEVBQUM7QUFBOUMsT0FBUDtBQUNEOztBQXRIMkQ7Ozs7Z0JBQXpDdEMsZ0IsZUFDQTtBQUNqQjRCLEVBQUFBLEtBQUssRUFBRWdCLG1CQUFVQyxNQUFWLENBQWlCQyxVQURQO0FBRWpCakIsRUFBQUEsU0FBUyxFQUFFZSxtQkFBVUcsSUFBVixDQUFlRCxVQUZUO0FBR2pCaEIsRUFBQUEsS0FBSyxFQUFFYyxtQkFBVUksTUFBVixDQUFpQkYsVUFIUDtBQUlqQnpDLEVBQUFBLFVBQVUsRUFBRXVDLG1CQUFVSyxPQUFWLENBQWtCQyw0QkFBbEIsRUFBb0NKLFVBSi9CO0FBTWpCSyxFQUFBQSxVQUFVLEVBQUVQLG1CQUFVUSxLQUFWLENBQWdCO0FBQzFCQyxJQUFBQSxnQkFBZ0IsRUFBRVQsbUJBQVVRLEtBQVYsQ0FBZ0I7QUFDaENFLE1BQUFBLE1BQU0sRUFBRVYsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRE87QUFFaENTLE1BQUFBLElBQUksRUFBRVgsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRlMsS0FBaEI7QUFEUSxHQUFoQixDQU5LO0FBYWpCMUMsRUFBQUEsaUJBQWlCLEVBQUV3QyxtQkFBVUcsSUFiWjtBQWNqQlosRUFBQUEsZUFBZSxFQUFFUyxtQkFBVVksSUFBVixDQUFlVixVQWRmO0FBZWpCcEIsRUFBQUEsV0FBVyxFQUFFa0IsbUJBQVVZLElBZk47QUFnQmpCakQsRUFBQUEsV0FBVyxFQUFFcUMsbUJBQVVZLElBQVYsQ0FBZVYsVUFoQlg7QUFpQmpCVyxFQUFBQSxZQUFZLEVBQUViLG1CQUFVWSxJQUFWLENBQWVWLFVBakJaO0FBa0JqQnhCLEVBQUFBLGVBQWUsRUFBRXNCLG1CQUFVWSxJQUFWLENBQWVWLFVBbEJmO0FBb0JqQnRCLEVBQUFBLGNBQWMsRUFBRW9CLG1CQUFVWSxJQXBCVDtBQXFCakJqQyxFQUFBQSxLQUFLLEVBQUVxQixtQkFBVWM7QUFyQkEsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge0ZyYWdtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQge0lzc3VlaXNoUHJvcFR5cGV9IGZyb20gJy4uL3Byb3AtdHlwZXMnO1xuaW1wb3J0IEFjY29yZGlvbiBmcm9tICcuL2FjY29yZGlvbic7XG5pbXBvcnQgVGltZWFnbyBmcm9tICcuL3RpbWVhZ28nO1xuaW1wb3J0IFN0YXR1c0RvbnV0Q2hhcnQgZnJvbSAnLi9zdGF0dXMtZG9udXQtY2hhcnQnO1xuaW1wb3J0IENoZWNrU3VpdGVzQWNjdW11bGF0b3IgZnJvbSAnLi4vY29udGFpbmVycy9hY2N1bXVsYXRvcnMvY2hlY2stc3VpdGVzLWFjY3VtdWxhdG9yJztcbmltcG9ydCBRdWVyeUVycm9yVGlsZSBmcm9tICcuL3F1ZXJ5LWVycm9yLXRpbGUnO1xuaW1wb3J0IE9jdGljb24gZnJvbSAnLi4vYXRvbS9vY3RpY29uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSXNzdWVpc2hMaXN0VmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdG90YWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBpc3N1ZWlzaGVzOiBQcm9wVHlwZXMuYXJyYXlPZihJc3N1ZWlzaFByb3BUeXBlKS5pc1JlcXVpcmVkLFxuXG4gICAgcmVwb3NpdG9yeTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGRlZmF1bHRCcmFuY2hSZWY6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgIHByZWZpeDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB9KSxcbiAgICB9KSxcblxuICAgIG5lZWRSZXZpZXdzQnV0dG9uOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBvbklzc3VlaXNoQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25Nb3JlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9wZW5SZXZpZXdzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9wZW5PbkdpdEh1YjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaG93QWN0aW9uc01lbnU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICBlbXB0eUNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgZXJyb3I6IFByb3BUeXBlcy5vYmplY3QsXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxBY2NvcmRpb25cbiAgICAgICAgbGVmdFRpdGxlPXt0aGlzLnByb3BzLnRpdGxlfVxuICAgICAgICBpc0xvYWRpbmc9e3RoaXMucHJvcHMuaXNMb2FkaW5nfVxuICAgICAgICByZXN1bHRzPXt0aGlzLnByb3BzLmlzc3VlaXNoZXN9XG4gICAgICAgIHRvdGFsPXt0aGlzLnByb3BzLnRvdGFsfVxuICAgICAgICBsb2FkaW5nQ29tcG9uZW50PXt0aGlzLnJlbmRlckxvYWRpbmdUaWxlfVxuICAgICAgICBlbXB0eUNvbXBvbmVudD17dGhpcy5yZW5kZXJFbXB0eVRpbGV9XG4gICAgICAgIG1vcmVDb21wb25lbnQ9e3RoaXMucmVuZGVyTW9yZVRpbGV9XG4gICAgICAgIHJldmlld3NCdXR0b249e3RoaXMucmVuZGVyUmV2aWV3c0J1dHRvbn1cbiAgICAgICAgb25DbGlja0l0ZW09e3RoaXMucHJvcHMub25Jc3N1ZWlzaENsaWNrfT5cbiAgICAgICAge3RoaXMucmVuZGVySXNzdWVpc2h9XG4gICAgICA8L0FjY29yZGlvbj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyUmV2aWV3c0J1dHRvbiA9ICgpID0+IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubmVlZFJldmlld3NCdXR0b24gfHwgdGhpcy5wcm9wcy5pc3N1ZWlzaGVzLmxlbmd0aCA8IDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGdpdGh1Yi1Jc3N1ZWlzaExpc3Qtb3BlblJldmlld3NCdXR0b25cIlxuICAgICAgICBvbkNsaWNrPXt0aGlzLm9wZW5SZXZpZXdzfT5cbiAgICAgICAgU2VlIHJldmlld3NcbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cblxuICBvcGVuUmV2aWV3cyA9IGUgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5wcm9wcy5vcGVuUmV2aWV3cyh0aGlzLnByb3BzLmlzc3VlaXNoZXNbMF0pO1xuICB9XG5cbiAgcmVuZGVySXNzdWVpc2ggPSBpc3N1ZWlzaCA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxDaGVja1N1aXRlc0FjY3VtdWxhdG9yIGNvbW1pdD17aXNzdWVpc2guZ2V0TGF0ZXN0Q29tbWl0KCl9PlxuICAgICAgICB7KHtydW5zQnlTdWl0ZX0pID0+IHtcbiAgICAgICAgICBpc3N1ZWlzaC5zZXRDaGVja1J1bnMocnVuc0J5U3VpdGUpO1xuXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtaXRlbSBnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0tLWF2YXRhclwiXG4gICAgICAgICAgICAgICAgc3JjPXtpc3N1ZWlzaC5nZXRBdXRob3JBdmF0YXJVUkwoMzIpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtpc3N1ZWlzaC5nZXRBdXRob3JMb2dpbigpfVxuICAgICAgICAgICAgICAgIGFsdD17aXNzdWVpc2guZ2V0QXV0aG9yTG9naW4oKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ2l0aHViLUlzc3VlaXNoTGlzdC1pdGVtIGdpdGh1Yi1Jc3N1ZWlzaExpc3QtaXRlbS0tdGl0bGVcIj5cbiAgICAgICAgICAgICAgICB7aXNzdWVpc2guZ2V0VGl0bGUoKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0gZ2l0aHViLUlzc3VlaXNoTGlzdC1pdGVtLS1udW1iZXJcIj5cbiAgICAgICAgICAgICAgICAje2lzc3VlaXNoLmdldE51bWJlcigpfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHt0aGlzLnJlbmRlclN0YXR1c1N1bW1hcnkoaXNzdWVpc2guZ2V0U3RhdHVzQ291bnRzKCkpfVxuICAgICAgICAgICAgICA8VGltZWFnb1xuICAgICAgICAgICAgICAgIHRpbWU9e2lzc3VlaXNoLmdldENyZWF0ZWRBdCgpfVxuICAgICAgICAgICAgICAgIGRpc3BsYXlTdHlsZT1cInNob3J0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0gZ2l0aHViLUlzc3VlaXNoTGlzdC1pdGVtLS1hZ2VcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8T2N0aWNvbiBpY29uPVwiZWxsaXBzZXNcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtaXRlbSBnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0tLW1lbnVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V2ZW50ID0+IHRoaXMuc2hvd0FjdGlvbnNNZW51KGV2ZW50LCBpc3N1ZWlzaCl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICk7XG4gICAgICAgIH19XG4gICAgICA8L0NoZWNrU3VpdGVzQWNjdW11bGF0b3I+XG4gICAgKTtcbiAgfVxuXG4gIHNob3dBY3Rpb25zTWVudShldmVudCwgaXNzdWVpc2gpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5wcm9wcy5zaG93QWN0aW9uc01lbnUoaXNzdWVpc2gpO1xuICB9XG5cbiAgcmVuZGVyU3RhdHVzU3VtbWFyeShzdGF0dXNDb3VudHMpIHtcbiAgICBpZiAoWydzdWNjZXNzJywgJ2ZhaWx1cmUnLCAncGVuZGluZyddLmV2ZXJ5KGtpbmQgPT4gc3RhdHVzQ291bnRzW2tpbmRdID09PSAwKSkge1xuICAgICAgcmV0dXJuIDxPY3RpY29uIGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtaXRlbSBnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0tLXN0YXR1c1wiIGljb249XCJkYXNoXCIgLz47XG4gICAgfVxuXG4gICAgaWYgKHN0YXR1c0NvdW50cy5zdWNjZXNzID4gMCAmJiBzdGF0dXNDb3VudHMuZmFpbHVyZSA9PT0gMCAmJiBzdGF0dXNDb3VudHMucGVuZGluZyA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxPY3RpY29uIGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtaXRlbSBnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0tLXN0YXR1c1wiIGljb249XCJjaGVja1wiIC8+O1xuICAgIH1cblxuICAgIGlmIChzdGF0dXNDb3VudHMuc3VjY2VzcyA9PT0gMCAmJiBzdGF0dXNDb3VudHMuZmFpbHVyZSA+IDAgJiYgc3RhdHVzQ291bnRzLnBlbmRpbmcgPT09IDApIHtcbiAgICAgIHJldHVybiA8T2N0aWNvbiBjbGFzc05hbWU9XCJnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0gZ2l0aHViLUlzc3VlaXNoTGlzdC1pdGVtLS1zdGF0dXNcIiBpY29uPVwieFwiIC8+O1xuICAgIH1cblxuICAgIHJldHVybiA8U3RhdHVzRG9udXRDaGFydCB7Li4uc3RhdHVzQ291bnRzfSBjbGFzc05hbWU9XCJnaXRodWItSXNzdWVpc2hMaXN0LWl0ZW0gZ2l0aHViLUlzc3VlaXNoTGlzdC1pdGVtLS1zdGF0dXNcIiAvPjtcbiAgfVxuXG4gIHJlbmRlckxvYWRpbmdUaWxlID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtbG9hZGluZ1wiPlxuICAgICAgICBMb2FkaW5nXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyRW1wdHlUaWxlID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLnByb3BzLmVycm9yKSB7XG4gICAgICByZXR1cm4gPFF1ZXJ5RXJyb3JUaWxlIGVycm9yPXt0aGlzLnByb3BzLmVycm9yfSAvPjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5lbXB0eUNvbXBvbmVudCkge1xuICAgICAgY29uc3QgRW1wdHlDb21wb25lbnQgPSB0aGlzLnByb3BzLmVtcHR5Q29tcG9uZW50O1xuICAgICAgcmV0dXJuIDxFbXB0eUNvbXBvbmVudCAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlbmRlck1vcmVUaWxlID0gKCkgPT4ge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGpzeC1hMTF5L2FuY2hvci1pcy12YWxpZCAqL1xuICAgIGlmICh0aGlzLnByb3BzLm9uTW9yZUNsaWNrKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Jc3N1ZWlzaExpc3QtbW9yZVwiPlxuICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Nb3JlQ2xpY2t9PlxuICAgICAgICAgICAgTW9yZS4uLlxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=