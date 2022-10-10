"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _yubikiri = _interopRequireDefault(require("yubikiri"));

var _reactRelay = require("react-relay");

var _commentDecorationsController = _interopRequireDefault(require("../controllers/comment-decorations-controller"));

var _observeModel = _interopRequireDefault(require("../views/observe-model"));

var _relayEnvironment = _interopRequireDefault(require("../views/relay-environment"));

var _propTypes2 = require("../prop-types");

var _keytarStrategy = require("../shared/keytar-strategy");

var _relayNetworkLayerManager = _interopRequireDefault(require("../relay-network-layer-manager"));

var _helpers = require("../helpers");

var _aggregatedReviewsContainer = _interopRequireDefault(require("./aggregated-reviews-container"));

var _commentPositioningContainer = _interopRequireDefault(require("./comment-positioning-container"));

var _prPatchContainer = _interopRequireDefault(require("./pr-patch-container"));

var _graphql;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommentDecorationsContainer extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderWithLocalRepositoryData", repoData => {
      if (!repoData) {
        return null;
      }

      return _react.default.createElement(_observeModel.default, {
        model: this.props.loginModel,
        fetchParams: [repoData],
        fetchData: this.fetchToken
      }, token => this.renderWithToken(token, {
        repoData
      }));
    });

    _defineProperty(this, "fetchRepositoryData", repository => {
      return (0, _yubikiri.default)({
        branches: repository.getBranches(),
        remotes: repository.getRemotes(),
        currentRemote: repository.getCurrentGitHubRemote(),
        workingDirectoryPath: repository.getWorkingDirectoryPath()
      });
    });

    _defineProperty(this, "fetchToken", (loginModel, repoData) => {
      const endpoint = repoData.currentRemote.getEndpoint();

      if (!endpoint) {
        return null;
      }

      return loginModel.getToken(endpoint.getLoginAccount());
    });
  }

  render() {
    return _react.default.createElement(_observeModel.default, {
      model: this.props.localRepository,
      fetchData: this.fetchRepositoryData
    }, this.renderWithLocalRepositoryData);
  }

  renderWithToken(token, {
    repoData
  }) {
    if (!token || token === _keytarStrategy.UNAUTHENTICATED || token === _keytarStrategy.INSUFFICIENT || token instanceof Error) {
      // we're not going to prompt users to log in to render decorations for comments
      // just let it go and move on with our lives.
      return null;
    }

    const head = repoData.branches.getHeadBranch();

    if (!head.isPresent()) {
      return null;
    }

    const push = head.getPush();

    if (!push.isPresent() || !push.isRemoteTracking()) {
      return null;
    }

    const pushRemote = repoData.remotes.withName(push.getRemoteName());

    if (!pushRemote.isPresent() || !pushRemote.isGithubRepo()) {
      return null;
    }

    const endpoint = repoData.currentRemote.getEndpoint();

    const environment = _relayNetworkLayerManager.default.getEnvironmentForHost(endpoint, token);

    const query = _graphql || (_graphql = function () {
      const node = require("./__generated__/commentDecorationsContainerQuery.graphql");

      if (node.hash && node.hash !== "8154acbf4c24d190f6fdf0254ae73817") {
        console.error("The definition of 'commentDecorationsContainerQuery' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
      }

      return require("./__generated__/commentDecorationsContainerQuery.graphql");
    });

    const variables = {
      headOwner: pushRemote.getOwner(),
      headName: pushRemote.getRepo(),
      headRef: push.getRemoteRef(),
      first: 1,
      reviewCount: _helpers.PAGE_SIZE,
      reviewCursor: null,
      threadCount: _helpers.PAGE_SIZE,
      threadCursor: null,
      commentCount: _helpers.PAGE_SIZE,
      commentCursor: null
    };
    return _react.default.createElement(_relayEnvironment.default.Provider, {
      value: environment
    }, _react.default.createElement(_reactRelay.QueryRenderer, {
      environment: environment,
      query: query,
      variables: variables,
      render: queryResult => this.renderWithPullRequest(_objectSpread2({
        endpoint,
        owner: variables.headOwner,
        repo: variables.headName
      }, queryResult), {
        repoData,
        token
      })
    }));
  }

  renderWithPullRequest({
    error,
    props,
    endpoint,
    owner,
    repo
  }, {
    repoData,
    token
  }) {
    if (error) {
      // eslint-disable-next-line no-console
      console.warn(`error fetching CommentDecorationsContainer data: ${error}`);
      return null;
    }

    if (!props || !props.repository || !props.repository.ref || !props.repository.ref.associatedPullRequests || props.repository.ref.associatedPullRequests.totalCount === 0) {
      // no loading spinner for you
      // just fetch silently behind the scenes like a good little container
      return null;
    }

    const currentPullRequest = props.repository.ref.associatedPullRequests.nodes[0];
    return _react.default.createElement(_aggregatedReviewsContainer.default, {
      pullRequest: currentPullRequest,
      reportRelayError: this.props.reportRelayError
    }, ({
      errors,
      summaries,
      commentThreads
    }) => {
      return this.renderWithReviews({
        errors,
        summaries,
        commentThreads
      }, {
        currentPullRequest,
        repoResult: props,
        endpoint,
        owner,
        repo,
        repoData,
        token
      });
    });
  }

  renderWithReviews({
    errors,
    summaries,
    commentThreads
  }, {
    currentPullRequest,
    repoResult,
    endpoint,
    owner,
    repo,
    repoData,
    token
  }) {
    if (errors && errors.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Errors aggregating reviews and comments for current pull request', ...errors);
      return null;
    }

    if (commentThreads.length === 0) {
      return null;
    }

    return _react.default.createElement(_prPatchContainer.default, {
      owner: owner,
      repo: repo,
      number: currentPullRequest.number,
      endpoint: endpoint,
      token: token,
      largeDiffThreshold: Infinity
    }, (patchError, patch) => this.renderWithPatch({
      error: patchError,
      patch
    }, {
      summaries,
      commentThreads,
      currentPullRequest,
      repoResult,
      endpoint,
      owner,
      repo,
      repoData,
      token
    }));
  }

  renderWithPatch({
    error,
    patch
  }, {
    summaries,
    commentThreads,
    currentPullRequest,
    repoResult,
    endpoint,
    owner,
    repo,
    repoData,
    token
  }) {
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Error fetching patch for current pull request', error);
      return null;
    }

    if (!patch) {
      return null;
    }

    return _react.default.createElement(_commentPositioningContainer.default, {
      multiFilePatch: patch,
      commentThreads: commentThreads,
      prCommitSha: currentPullRequest.headRefOid,
      localRepository: this.props.localRepository,
      workdir: repoData.workingDirectoryPath
    }, commentTranslations => {
      if (!commentTranslations) {
        return null;
      }

      return _react.default.createElement(_commentDecorationsController.default, {
        endpoint: endpoint,
        owner: owner,
        repo: repo,
        workspace: this.props.workspace,
        commands: this.props.commands,
        repoData: repoData,
        commentThreads: commentThreads,
        commentTranslations: commentTranslations,
        pullRequests: repoResult.repository.ref.associatedPullRequests.nodes
      });
    });
  }

}

exports.default = CommentDecorationsContainer;

_defineProperty(CommentDecorationsContainer, "propTypes", {
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  localRepository: _propTypes.default.object.isRequired,
  loginModel: _propTypes2.GithubLoginModelPropType.isRequired,
  reportRelayError: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250YWluZXJzL2NvbW1lbnQtZGVjb3JhdGlvbnMtY29udGFpbmVyLmpzIl0sIm5hbWVzIjpbIkNvbW1lbnREZWNvcmF0aW9uc0NvbnRhaW5lciIsIlJlYWN0IiwiQ29tcG9uZW50IiwicmVwb0RhdGEiLCJwcm9wcyIsImxvZ2luTW9kZWwiLCJmZXRjaFRva2VuIiwidG9rZW4iLCJyZW5kZXJXaXRoVG9rZW4iLCJyZXBvc2l0b3J5IiwiYnJhbmNoZXMiLCJnZXRCcmFuY2hlcyIsInJlbW90ZXMiLCJnZXRSZW1vdGVzIiwiY3VycmVudFJlbW90ZSIsImdldEN1cnJlbnRHaXRIdWJSZW1vdGUiLCJ3b3JraW5nRGlyZWN0b3J5UGF0aCIsImdldFdvcmtpbmdEaXJlY3RvcnlQYXRoIiwiZW5kcG9pbnQiLCJnZXRFbmRwb2ludCIsImdldFRva2VuIiwiZ2V0TG9naW5BY2NvdW50IiwicmVuZGVyIiwibG9jYWxSZXBvc2l0b3J5IiwiZmV0Y2hSZXBvc2l0b3J5RGF0YSIsInJlbmRlcldpdGhMb2NhbFJlcG9zaXRvcnlEYXRhIiwiVU5BVVRIRU5USUNBVEVEIiwiSU5TVUZGSUNJRU5UIiwiRXJyb3IiLCJoZWFkIiwiZ2V0SGVhZEJyYW5jaCIsImlzUHJlc2VudCIsInB1c2giLCJnZXRQdXNoIiwiaXNSZW1vdGVUcmFja2luZyIsInB1c2hSZW1vdGUiLCJ3aXRoTmFtZSIsImdldFJlbW90ZU5hbWUiLCJpc0dpdGh1YlJlcG8iLCJlbnZpcm9ubWVudCIsIlJlbGF5TmV0d29ya0xheWVyTWFuYWdlciIsImdldEVudmlyb25tZW50Rm9ySG9zdCIsInF1ZXJ5IiwidmFyaWFibGVzIiwiaGVhZE93bmVyIiwiZ2V0T3duZXIiLCJoZWFkTmFtZSIsImdldFJlcG8iLCJoZWFkUmVmIiwiZ2V0UmVtb3RlUmVmIiwiZmlyc3QiLCJyZXZpZXdDb3VudCIsIlBBR0VfU0laRSIsInJldmlld0N1cnNvciIsInRocmVhZENvdW50IiwidGhyZWFkQ3Vyc29yIiwiY29tbWVudENvdW50IiwiY29tbWVudEN1cnNvciIsInF1ZXJ5UmVzdWx0IiwicmVuZGVyV2l0aFB1bGxSZXF1ZXN0Iiwib3duZXIiLCJyZXBvIiwiZXJyb3IiLCJjb25zb2xlIiwid2FybiIsInJlZiIsImFzc29jaWF0ZWRQdWxsUmVxdWVzdHMiLCJ0b3RhbENvdW50IiwiY3VycmVudFB1bGxSZXF1ZXN0Iiwibm9kZXMiLCJyZXBvcnRSZWxheUVycm9yIiwiZXJyb3JzIiwic3VtbWFyaWVzIiwiY29tbWVudFRocmVhZHMiLCJyZW5kZXJXaXRoUmV2aWV3cyIsInJlcG9SZXN1bHQiLCJsZW5ndGgiLCJudW1iZXIiLCJJbmZpbml0eSIsInBhdGNoRXJyb3IiLCJwYXRjaCIsInJlbmRlcldpdGhQYXRjaCIsImhlYWRSZWZPaWQiLCJjb21tZW50VHJhbnNsYXRpb25zIiwid29ya3NwYWNlIiwiY29tbWFuZHMiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiR2l0aHViTG9naW5Nb2RlbFByb3BUeXBlIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRWUsTUFBTUEsMkJBQU4sU0FBMENDLGVBQU1DLFNBQWhELENBQTBEO0FBQUE7QUFBQTs7QUFBQSwyREFrQnZDQyxRQUFRLElBQUk7QUFDMUMsVUFBSSxDQUFDQSxRQUFMLEVBQWU7QUFDYixlQUFPLElBQVA7QUFDRDs7QUFFRCxhQUNFLDZCQUFDLHFCQUFEO0FBQ0UsUUFBQSxLQUFLLEVBQUUsS0FBS0MsS0FBTCxDQUFXQyxVQURwQjtBQUVFLFFBQUEsV0FBVyxFQUFFLENBQUNGLFFBQUQsQ0FGZjtBQUdFLFFBQUEsU0FBUyxFQUFFLEtBQUtHO0FBSGxCLFNBSUdDLEtBQUssSUFBSSxLQUFLQyxlQUFMLENBQXFCRCxLQUFyQixFQUE0QjtBQUFDSixRQUFBQTtBQUFELE9BQTVC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UUFBUSxFQUFFQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFGVjtBQUdqQmpFLEVBQUFBLGVBQWUsRUFBRStELG1CQUFVQyxNQUFWLENBQWlCQyxVQUhqQjtBQUlqQm5GLEVBQUFBLFVBQVUsRUFBRW9GLHFDQUF5QkQsVUFKcEI7QUFNakJsQixFQUFBQSxnQkFBZ0IsRUFBRWdCLG1CQUFVSSxJQUFWLENBQWVGO0FBTmhCLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB5dWJpa2lyaSBmcm9tICd5dWJpa2lyaSc7XG5pbXBvcnQge1F1ZXJ5UmVuZGVyZXIsIGdyYXBocWx9IGZyb20gJ3JlYWN0LXJlbGF5JztcblxuaW1wb3J0IENvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXIgZnJvbSAnLi4vY29udHJvbGxlcnMvY29tbWVudC1kZWNvcmF0aW9ucy1jb250cm9sbGVyJztcbmltcG9ydCBPYnNlcnZlTW9kZWwgZnJvbSAnLi4vdmlld3Mvb2JzZXJ2ZS1tb2RlbCc7XG5pbXBvcnQgUmVsYXlFbnZpcm9ubWVudCBmcm9tICcuLi92aWV3cy9yZWxheS1lbnZpcm9ubWVudCc7XG5pbXBvcnQge0dpdGh1YkxvZ2luTW9kZWxQcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQge1VOQVVUSEVOVElDQVRFRCwgSU5TVUZGSUNJRU5UfSBmcm9tICcuLi9zaGFyZWQva2V5dGFyLXN0cmF0ZWd5JztcbmltcG9ydCBSZWxheU5ldHdvcmtMYXllck1hbmFnZXIgZnJvbSAnLi4vcmVsYXktbmV0d29yay1sYXllci1tYW5hZ2VyJztcbmltcG9ydCB7UEFHRV9TSVpFfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCBBZ2dyZWdhdGVkUmV2aWV3c0NvbnRhaW5lciBmcm9tICcuL2FnZ3JlZ2F0ZWQtcmV2aWV3cy1jb250YWluZXInO1xuaW1wb3J0IENvbW1lbnRQb3NpdGlvbmluZ0NvbnRhaW5lciBmcm9tICcuL2NvbW1lbnQtcG9zaXRpb25pbmctY29udGFpbmVyJztcbmltcG9ydCBQdWxsUmVxdWVzdFBhdGNoQ29udGFpbmVyIGZyb20gJy4vcHItcGF0Y2gtY29udGFpbmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWVudERlY29yYXRpb25zQ29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB3b3Jrc3BhY2U6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb21tYW5kczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGxvY2FsUmVwb3NpdG9yeTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGxvZ2luTW9kZWw6IEdpdGh1YkxvZ2luTW9kZWxQcm9wVHlwZS5pc1JlcXVpcmVkLFxuXG4gICAgcmVwb3J0UmVsYXlFcnJvcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxPYnNlcnZlTW9kZWwgbW9kZWw9e3RoaXMucHJvcHMubG9jYWxSZXBvc2l0b3J5fSBmZXRjaERhdGE9e3RoaXMuZmV0Y2hSZXBvc2l0b3J5RGF0YX0+XG4gICAgICAgIHt0aGlzLnJlbmRlcldpdGhMb2NhbFJlcG9zaXRvcnlEYXRhfVxuICAgICAgPC9PYnNlcnZlTW9kZWw+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcldpdGhMb2NhbFJlcG9zaXRvcnlEYXRhID0gcmVwb0RhdGEgPT4ge1xuICAgIGlmICghcmVwb0RhdGEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8T2JzZXJ2ZU1vZGVsXG4gICAgICAgIG1vZGVsPXt0aGlzLnByb3BzLmxvZ2luTW9kZWx9XG4gICAgICAgIGZldGNoUGFyYW1zPXtbcmVwb0RhdGFdfVxuICAgICAgICBmZXRjaERhdGE9e3RoaXMuZmV0Y2hUb2tlbn0+XG4gICAgICAgIHt0b2tlbiA9PiB0aGlzLnJlbmRlcldpdGhUb2tlbih0b2tlbiwge3JlcG9EYXRhfSl9XG4gICAgICA8L09ic2VydmVNb2RlbD5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyV2l0aFRva2VuKHRva2VuLCB7cmVwb0RhdGF9KSB7XG4gICAgaWYgKCF0b2tlbiB8fCB0b2tlbiA9PT0gVU5BVVRIRU5USUNBVEVEIHx8IHRva2VuID09PSBJTlNVRkZJQ0lFTlQgfHwgdG9rZW4gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIHByb21wdCB1c2VycyB0byBsb2cgaW4gdG8gcmVuZGVyIGRlY29yYXRpb25zIGZvciBjb21tZW50c1xuICAgICAgLy8ganVzdCBsZXQgaXQgZ28gYW5kIG1vdmUgb24gd2l0aCBvdXIgbGl2ZXMuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkID0gcmVwb0RhdGEuYnJhbmNoZXMuZ2V0SGVhZEJyYW5jaCgpO1xuICAgIGlmICghaGVhZC5pc1ByZXNlbnQoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcHVzaCA9IGhlYWQuZ2V0UHVzaCgpO1xuICAgIGlmICghcHVzaC5pc1ByZXNlbnQoKSB8fCAhcHVzaC5pc1JlbW90ZVRyYWNraW5nKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHB1c2hSZW1vdGUgPSByZXBvRGF0YS5yZW1vdGVzLndpdGhOYW1lKHB1c2guZ2V0UmVtb3RlTmFtZSgpKTtcbiAgICBpZiAoIXB1c2hSZW1vdGUuaXNQcmVzZW50KCkgfHwgIXB1c2hSZW1vdGUuaXNHaXRodWJSZXBvKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGVuZHBvaW50ID0gcmVwb0RhdGEuY3VycmVudFJlbW90ZS5nZXRFbmRwb2ludCgpO1xuICAgIGNvbnN0IGVudmlyb25tZW50ID0gUmVsYXlOZXR3b3JrTGF5ZXJNYW5hZ2VyLmdldEVudmlyb25tZW50Rm9ySG9zdChlbmRwb2ludCwgdG9rZW4pO1xuICAgIGNvbnN0IHF1ZXJ5ID0gZ3JhcGhxbGBcbiAgICAgIHF1ZXJ5IGNvbW1lbnREZWNvcmF0aW9uc0NvbnRhaW5lclF1ZXJ5KFxuICAgICAgICAkaGVhZE93bmVyOiBTdHJpbmchXG4gICAgICAgICRoZWFkTmFtZTogU3RyaW5nIVxuICAgICAgICAkaGVhZFJlZjogU3RyaW5nIVxuICAgICAgICAkcmV2aWV3Q291bnQ6IEludCFcbiAgICAgICAgJHJldmlld0N1cnNvcjogU3RyaW5nXG4gICAgICAgICR0aHJlYWRDb3VudDogSW50IVxuICAgICAgICAkdGhyZWFkQ3Vyc29yOiBTdHJpbmdcbiAgICAgICAgJGNvbW1lbnRDb3VudDogSW50IVxuICAgICAgICAkY29tbWVudEN1cnNvcjogU3RyaW5nXG4gICAgICAgICRmaXJzdDogSW50IVxuICAgICAgKSB7XG4gICAgICAgIHJlcG9zaXRvcnkob3duZXI6ICRoZWFkT3duZXIsIG5hbWU6ICRoZWFkTmFtZSkge1xuICAgICAgICAgIHJlZihxdWFsaWZpZWROYW1lOiAkaGVhZFJlZikge1xuICAgICAgICAgICAgYXNzb2NpYXRlZFB1bGxSZXF1ZXN0cyhmaXJzdDogJGZpcnN0LCBzdGF0ZXM6IFtPUEVOXSkge1xuICAgICAgICAgICAgICB0b3RhbENvdW50XG4gICAgICAgICAgICAgIG5vZGVzIHtcbiAgICAgICAgICAgICAgICBudW1iZXJcbiAgICAgICAgICAgICAgICBoZWFkUmVmT2lkXG5cbiAgICAgICAgICAgICAgICAuLi5jb21tZW50RGVjb3JhdGlvbnNDb250cm9sbGVyX3B1bGxSZXF1ZXN0c1xuICAgICAgICAgICAgICAgIC4uLmFnZ3JlZ2F0ZWRSZXZpZXdzQ29udGFpbmVyX3B1bGxSZXF1ZXN0IEBhcmd1bWVudHMoXG4gICAgICAgICAgICAgICAgICByZXZpZXdDb3VudDogJHJldmlld0NvdW50XG4gICAgICAgICAgICAgICAgICByZXZpZXdDdXJzb3I6ICRyZXZpZXdDdXJzb3JcbiAgICAgICAgICAgICAgICAgIHRocmVhZENvdW50OiAkdGhyZWFkQ291bnRcbiAgICAgICAgICAgICAgICAgIHRocmVhZEN1cnNvcjogJHRocmVhZEN1cnNvclxuICAgICAgICAgICAgICAgICAgY29tbWVudENvdW50OiAkY29tbWVudENvdW50XG4gICAgICAgICAgICAgICAgICBjb21tZW50Q3Vyc29yOiAkY29tbWVudEN1cnNvclxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGA7XG4gICAgY29uc3QgdmFyaWFibGVzID0ge1xuICAgICAgaGVhZE93bmVyOiBwdXNoUmVtb3RlLmdldE93bmVyKCksXG4gICAgICBoZWFkTmFtZTogcHVzaFJlbW90ZS5nZXRSZXBvKCksXG4gICAgICBoZWFkUmVmOiBwdXNoLmdldFJlbW90ZVJlZigpLFxuICAgICAgZmlyc3Q6IDEsXG4gICAgICByZXZpZXdDb3VudDogUEFHRV9TSVpFLFxuICAgICAgcmV2aWV3Q3Vyc29yOiBudWxsLFxuICAgICAgdGhyZWFkQ291bnQ6IFBBR0VfU0laRSxcbiAgICAgIHRocmVhZEN1cnNvcjogbnVsbCxcbiAgICAgIGNvbW1lbnRDb3VudDogUEFHRV9TSVpFLFxuICAgICAgY29tbWVudEN1cnNvcjogbnVsbCxcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWxheUVudmlyb25tZW50LlByb3ZpZGVyIHZhbHVlPXtlbnZpcm9ubWVudH0+XG4gICAgICAgIDxRdWVyeVJlbmRlcmVyXG4gICAgICAgICAgZW52aXJvbm1lbnQ9e2Vudmlyb25tZW50fVxuICAgICAgICAgIHF1ZXJ5PXtxdWVyeX1cbiAgICAgICAgICB2YXJpYWJsZXM9e3ZhcmlhYmxlc31cbiAgICAgICAgICByZW5kZXI9e3F1ZXJ5UmVzdWx0ID0+IHRoaXMucmVuZGVyV2l0aFB1bGxSZXF1ZXN0KHtcbiAgICAgICAgICAgIGVuZHBvaW50LFxuICAgICAgICAgICAgb3duZXI6IHZhcmlhYmxlcy5oZWFkT3duZXIsXG4gICAgICAgICAgICByZXBvOiB2YXJpYWJsZXMuaGVhZE5hbWUsXG4gICAgICAgICAgICAuLi5xdWVyeVJlc3VsdCxcbiAgICAgICAgICB9LCB7cmVwb0RhdGEsIHRva2VufSl9XG4gICAgICAgIC8+XG4gICAgICA8L1JlbGF5RW52aXJvbm1lbnQuUHJvdmlkZXI+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcldpdGhQdWxsUmVxdWVzdCh7ZXJyb3IsIHByb3BzLCBlbmRwb2ludCwgb3duZXIsIHJlcG99LCB7cmVwb0RhdGEsIHRva2VufSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihgZXJyb3IgZmV0Y2hpbmcgQ29tbWVudERlY29yYXRpb25zQ29udGFpbmVyIGRhdGE6ICR7ZXJyb3J9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAhcHJvcHMgfHwgIXByb3BzLnJlcG9zaXRvcnkgfHwgIXByb3BzLnJlcG9zaXRvcnkucmVmIHx8XG4gICAgICAhcHJvcHMucmVwb3NpdG9yeS5yZWYuYXNzb2NpYXRlZFB1bGxSZXF1ZXN0cyB8fFxuICAgICAgcHJvcHMucmVwb3NpdG9yeS5yZWYuYXNzb2NpYXRlZFB1bGxSZXF1ZXN0cy50b3RhbENvdW50ID09PSAwXG4gICAgKSB7XG4gICAgICAvLyBubyBsb2FkaW5nIHNwaW5uZXIgZm9yIHlvdVxuICAgICAgLy8ganVzdCBmZXRjaCBzaWxlbnRseSBiZWhpbmQgdGhlIHNjZW5lcyBsaWtlIGEgZ29vZCBsaXR0bGUgY29udGFpbmVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50UHVsbFJlcXVlc3QgPSBwcm9wcy5yZXBvc2l0b3J5LnJlZi5hc3NvY2lhdGVkUHVsbFJlcXVlc3RzLm5vZGVzWzBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxBZ2dyZWdhdGVkUmV2aWV3c0NvbnRhaW5lclxuICAgICAgICBwdWxsUmVxdWVzdD17Y3VycmVudFB1bGxSZXF1ZXN0fVxuICAgICAgICByZXBvcnRSZWxheUVycm9yPXt0aGlzLnByb3BzLnJlcG9ydFJlbGF5RXJyb3J9PlxuICAgICAgICB7KHtlcnJvcnMsIHN1bW1hcmllcywgY29tbWVudFRocmVhZHN9KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aFJldmlld3MoXG4gICAgICAgICAgICB7ZXJyb3JzLCBzdW1tYXJpZXMsIGNvbW1lbnRUaHJlYWRzfSxcbiAgICAgICAgICAgIHtjdXJyZW50UHVsbFJlcXVlc3QsIHJlcG9SZXN1bHQ6IHByb3BzLCBlbmRwb2ludCwgb3duZXIsIHJlcG8sIHJlcG9EYXRhLCB0b2tlbn0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfX1cbiAgICAgIDwvQWdncmVnYXRlZFJldmlld3NDb250YWluZXI+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcldpdGhSZXZpZXdzKFxuICAgIHtlcnJvcnMsIHN1bW1hcmllcywgY29tbWVudFRocmVhZHN9LFxuICAgIHtjdXJyZW50UHVsbFJlcXVlc3QsIHJlcG9SZXN1bHQsIGVuZHBvaW50LCBvd25lciwgcmVwbywgcmVwb0RhdGEsIHRva2VufSxcbiAgKSB7XG4gICAgaWYgKGVycm9ycyAmJiBlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybignRXJyb3JzIGFnZ3JlZ2F0aW5nIHJldmlld3MgYW5kIGNvbW1lbnRzIGZvciBjdXJyZW50IHB1bGwgcmVxdWVzdCcsIC4uLmVycm9ycyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoY29tbWVudFRocmVhZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFB1bGxSZXF1ZXN0UGF0Y2hDb250YWluZXJcbiAgICAgICAgb3duZXI9e293bmVyfVxuICAgICAgICByZXBvPXtyZXBvfVxuICAgICAgICBudW1iZXI9e2N1cnJlbnRQdWxsUmVxdWVzdC5udW1iZXJ9XG4gICAgICAgIGVuZHBvaW50PXtlbmRwb2ludH1cbiAgICAgICAgdG9rZW49e3Rva2VufVxuICAgICAgICBsYXJnZURpZmZUaHJlc2hvbGQ9e0luZmluaXR5fT5cbiAgICAgICAgeyhwYXRjaEVycm9yLCBwYXRjaCkgPT4gdGhpcy5yZW5kZXJXaXRoUGF0Y2goXG4gICAgICAgICAge2Vycm9yOiBwYXRjaEVycm9yLCBwYXRjaH0sXG4gICAgICAgICAge3N1bW1hcmllcywgY29tbWVudFRocmVhZHMsIGN1cnJlbnRQdWxsUmVxdWVzdCwgcmVwb1Jlc3VsdCwgZW5kcG9pbnQsIG93bmVyLCByZXBvLCByZXBvRGF0YSwgdG9rZW59LFxuICAgICAgICApfVxuICAgICAgPC9QdWxsUmVxdWVzdFBhdGNoQ29udGFpbmVyPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJXaXRoUGF0Y2goXG4gICAge2Vycm9yLCBwYXRjaH0sXG4gICAge3N1bW1hcmllcywgY29tbWVudFRocmVhZHMsIGN1cnJlbnRQdWxsUmVxdWVzdCwgcmVwb1Jlc3VsdCwgZW5kcG9pbnQsIG93bmVyLCByZXBvLCByZXBvRGF0YSwgdG9rZW59LFxuICApIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGZldGNoaW5nIHBhdGNoIGZvciBjdXJyZW50IHB1bGwgcmVxdWVzdCcsIGVycm9yKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghcGF0Y2gpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8Q29tbWVudFBvc2l0aW9uaW5nQ29udGFpbmVyXG4gICAgICAgIG11bHRpRmlsZVBhdGNoPXtwYXRjaH1cbiAgICAgICAgY29tbWVudFRocmVhZHM9e2NvbW1lbnRUaHJlYWRzfVxuICAgICAgICBwckNvbW1pdFNoYT17Y3VycmVudFB1bGxSZXF1ZXN0LmhlYWRSZWZPaWR9XG4gICAgICAgIGxvY2FsUmVwb3NpdG9yeT17dGhpcy5wcm9wcy5sb2NhbFJlcG9zaXRvcnl9XG4gICAgICAgIHdvcmtkaXI9e3JlcG9EYXRhLndvcmtpbmdEaXJlY3RvcnlQYXRofT5cbiAgICAgICAge2NvbW1lbnRUcmFuc2xhdGlvbnMgPT4ge1xuICAgICAgICAgIGlmICghY29tbWVudFRyYW5zbGF0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxDb21tZW50RGVjb3JhdGlvbnNDb250cm9sbGVyXG4gICAgICAgICAgICAgIGVuZHBvaW50PXtlbmRwb2ludH1cbiAgICAgICAgICAgICAgb3duZXI9e293bmVyfVxuICAgICAgICAgICAgICByZXBvPXtyZXBvfVxuICAgICAgICAgICAgICB3b3Jrc3BhY2U9e3RoaXMucHJvcHMud29ya3NwYWNlfVxuICAgICAgICAgICAgICBjb21tYW5kcz17dGhpcy5wcm9wcy5jb21tYW5kc31cbiAgICAgICAgICAgICAgcmVwb0RhdGE9e3JlcG9EYXRhfVxuICAgICAgICAgICAgICBjb21tZW50VGhyZWFkcz17Y29tbWVudFRocmVhZHN9XG4gICAgICAgICAgICAgIGNvbW1lbnRUcmFuc2xhdGlvbnM9e2NvbW1lbnRUcmFuc2xhdGlvbnN9XG4gICAgICAgICAgICAgIHB1bGxSZXF1ZXN0cz17cmVwb1Jlc3VsdC5yZXBvc2l0b3J5LnJlZi5hc3NvY2lhdGVkUHVsbFJlcXVlc3RzLm5vZGVzfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApO1xuICAgICAgICB9fVxuICAgICAgPC9Db21tZW50UG9zaXRpb25pbmdDb250YWluZXI+XG4gICAgKTtcbiAgfVxuXG4gIGZldGNoUmVwb3NpdG9yeURhdGEgPSByZXBvc2l0b3J5ID0+IHtcbiAgICByZXR1cm4geXViaWtpcmkoe1xuICAgICAgYnJhbmNoZXM6IHJlcG9zaXRvcnkuZ2V0QnJhbmNoZXMoKSxcbiAgICAgIHJlbW90ZXM6IHJlcG9zaXRvcnkuZ2V0UmVtb3RlcygpLFxuICAgICAgY3VycmVudFJlbW90ZTogcmVwb3NpdG9yeS5nZXRDdXJyZW50R2l0SHViUmVtb3RlKCksXG4gICAgICB3b3JraW5nRGlyZWN0b3J5UGF0aDogcmVwb3NpdG9yeS5nZXRXb3JraW5nRGlyZWN0b3J5UGF0aCgpLFxuICAgIH0pO1xuICB9XG5cbiAgZmV0Y2hUb2tlbiA9IChsb2dpbk1vZGVsLCByZXBvRGF0YSkgPT4ge1xuICAgIGNvbnN0IGVuZHBvaW50ID0gcmVwb0RhdGEuY3VycmVudFJlbW90ZS5nZXRFbmRwb2ludCgpO1xuICAgIGlmICghZW5kcG9pbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBsb2dpbk1vZGVsLmdldFRva2VuKGVuZHBvaW50LmdldExvZ2luQWNjb3VudCgpKTtcbiAgfVxufVxuIl19