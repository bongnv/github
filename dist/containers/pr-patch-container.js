"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _whatTheDiff = require("what-the-diff");

var _helpers = require("../helpers");

var _propTypes2 = require("../prop-types");

var _filter = require("../models/patch/filter");

var _patch = require("../models/patch");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PullRequestPatchContainer extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      multiFilePatch: null,
      error: null,
      last: {
        url: null,
        patch: null,
        etag: null
      }
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchDiff(this.state.last);
  }

  componentDidUpdate(prevProps) {
    const explicitRefetch = this.props.refetch && !prevProps.refetch;
    const requestedURLChange = this.state.last.url !== this.getDiffURL();

    if (explicitRefetch || requestedURLChange) {
      const {
        last
      } = this.state;
      this.setState({
        multiFilePatch: null,
        error: null,
        last: {
          url: this.getDiffURL(),
          patch: null,
          etag: null
        }
      });
      this.fetchDiff(last);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    return this.props.children(this.state.error, this.state.multiFilePatch);
  } // Generate a v3 GitHub API REST URL for the pull request resource.
  // Example: https://api.github.com/repos/atom/github/pulls/1829


  getDiffURL() {
    return this.props.endpoint.getRestURI('repos', this.props.owner, this.props.repo, 'pulls', this.props.number);
  }

  buildPatch(rawDiff) {
    const {
      filtered,
      removed
    } = (0, _filter.filter)(rawDiff);
    const diffs = (0, _whatTheDiff.parse)(filtered).map(diff => {
      // diff coming from API will have the defaul git diff prefixes a/ and b/ and use *nix-style / path separators.
      // e.g. a/dir/file1.js and b/dir/file2.js
      // see https://git-scm.com/docs/git-diff#_generating_patches_with_p
      return _objectSpread2({}, diff, {
        newPath: diff.newPath ? (0, _helpers.toNativePathSep)(diff.newPath.replace(/^[a|b]\//, '')) : diff.newPath,
        oldPath: diff.oldPath ? (0, _helpers.toNativePathSep)(diff.oldPath.replace(/^[a|b]\//, '')) : diff.oldPath
      });
    });
    const options = {
      preserveOriginal: true,
      removed
    };

    if (this.props.largeDiffThreshold) {
      options.largeDiffThreshold = this.props.largeDiffThreshold;
    }

    const mfp = (0, _patch.buildMultiFilePatch)(diffs, options);
    return mfp;
  }

  async fetchDiff(last) {
    const url = this.getDiffURL();
    let response;

    try {
      const headers = {
        Accept: 'application/vnd.github.v3.diff',
        Authorization: `bearer ${this.props.token}`
      };

      if (url === last.url && last.etag !== null) {
        headers['If-None-Match'] = last.etag;
      }

      response = await fetch(url, {
        headers
      });
    } catch (err) {
      return this.reportDiffError(`Network error encountered fetching the patch: ${err.message}.`, err);
    }

    if (response.status === 304) {
      // Not modified.
      if (!this.mounted) {
        return null;
      }

      return new Promise(resolve => this.setState({
        multiFilePatch: last.patch,
        error: null,
        last
      }));
    }

    if (!response.ok) {
      return this.reportDiffError(`Unable to fetch the diff for this pull request: ${response.statusText}.`);
    }

    try {
      const etag = response.headers.get('ETag');
      const rawDiff = await response.text();

      if (!this.mounted) {
        return null;
      }

      const multiFilePatch = this.buildPatch(rawDiff);
      return new Promise(resolve => this.setState({
        multiFilePatch,
        error: null,
        last: {
          url,
          patch: multiFilePatch,
          etag
        }
      }, resolve));
    } catch (err) {
      return this.reportDiffError('Unable to parse the diff for this pull request.', err);
    }
  }

  reportDiffError(message, error) {
    if (!this.mounted) {
      return null;
    }

    return new Promise(resolve => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      if (!this.mounted) {
        resolve();
        return;
      }

      this.setState({
        error: message
      }, resolve);
    });
  }

}

exports.default = PullRequestPatchContainer;

_defineProperty(PullRequestPatchContainer, "propTypes", {
  // Pull request properties
  owner: _propTypes.default.string.isRequired,
  repo: _propTypes.default.string.isRequired,
  number: _propTypes.default.number.isRequired,
  // Connection properties
  endpoint: _propTypes2.EndpointPropType.isRequired,
  token: _propTypes.default.string.isRequired,
  // Fetching and parsing
  refetch: _propTypes.default.bool,
  largeDiffThreshold: _propTypes.default.number,
  // Render prop. Called with (error or null, multiFilePatch or null)
  children: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb250YWluZXJzL3ByLXBhdGNoLWNvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJQdWxsUmVxdWVzdFBhdGNoQ29udGFpbmVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJtdWx0aUZpbGVQYXRjaCIsImVycm9yIiwibGFzdCIsInVybCIsInBhdGNoIiwiZXRhZyIsImNvbXBvbmVudERpZE1vdW50IiwibW91bnRlZCIsImZldGNoRGlmZiIsInN0YXRlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwiZXhwbGljaXRSZWZldGNoIiwicHJvcHMiLCJyZWZldGNoIiwicmVxdWVzdGVkVVJMQ2hhbmdlIiwiZ2V0RGlmZlVSTCIsInNldFN0YXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW5kZXIiLCJjaGlsZHJlbiIsImVuZHBvaW50IiwiZ2V0UmVzdFVSSSIsIm93bmVyIiwicmVwbyIsIm51bWJlciIsImJ1aWxkUGF0Y2giLCJyYXdEaWZmIiwiZmlsdGVyZWQiLCJyZW1vdmVkIiwiZGlmZnMiLCJtYXAiLCJkaWZmIiwibmV3UGF0aCIsInJlcGxhY2UiLCJvbGRQYXRoIiwib3B0aW9ucyIsInByZXNlcnZlT3JpZ2luYWwiLCJsYXJnZURpZmZUaHJlc2hvbGQiLCJtZnAiLCJyZXNwb25zZSIsImhlYWRlcnMiLCJBY2NlcHQiLCJBdXRob3JpemF0aW9uIiwidG9rZW4iLCJmZXRjaCIsImVyciIsInJlcG9ydERpZmZFcnJvciIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm9rIiwic3RhdHVzVGV4dCIsImdldCIsInRleHQiLCJjb25zb2xlIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsIkVuZHBvaW50UHJvcFR5cGUiLCJib29sIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVlLE1BQU1BLHlCQUFOLFNBQXdDQyxlQUFNQyxTQUE5QyxDQUF3RDtBQUFBO0FBQUE7O0FBQUEsbUNBbUI3RDtBQUNOQyxNQUFBQSxjQUFjLEVBQUUsSUFEVjtBQUVOQyxNQUFBQSxLQUFLLEVBQUUsSUFGRDtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFBQ0MsUUFBQUEsR0FBRyxFQUFFLElBQU47QUFBWUMsUUFBQUEsS0FBSyxFQUFFLElBQW5CO0FBQXlCQyxRQUFBQSxJQUFJLEVBQUU7QUFBL0I7QUFIQSxLQW5CNkQ7QUFBQTs7QUF5QnJFQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixTQUFLQyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUtDLFNBQUwsQ0FBZSxLQUFLQyxLQUFMLENBQVdQLElBQTFCO0FBQ0Q7O0FBRURRLEVBQUFBLGtCQUFrQixDQUFDQyxTQUFELEVBQVk7QUFDNUIsVUFBTUMsZUFBZSxHQUFHLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWCxJQUFzQixDQUFDSCxTQUFTLENBQUNHLE9BQXpEO0FBQ0EsVUFBTUMsa0JBQWtCLEdBQUcsS0FBS04sS0FBTCxDQUFXUCxJQUFYLENBQWdCQyxHQUFoQixLQUF3QixLQUFLYSxVQUFMLEVBQW5EOztBQUVBLFFBQUlKLGVBQWUsSUFBSUcsa0JBQXZCLEVBQTJDO0FBQ3pDLFlBQU07QUFBQ2IsUUFBQUE7QUFBRCxVQUFTLEtBQUtPLEtBQXBCO0FBQ0EsV0FBS1EsUUFBTCxDQUFjO0FBQ1pqQixRQUFBQSxjQUFjLEVBQUUsSUFESjtBQUVaQyxRQUFBQSxLQUFLLEVBQUUsSUFGSztBQUdaQyxRQUFBQSxJQUFJLEVBQUU7QUFBQ0MsVUFBQUEsR0FBRyxFQUFFLEtBQUthLFVBQUwsRUFBTjtBQUF5QlosVUFBQUEsS0FBSyxFQUFFLElBQWhDO0FBQXNDQyxVQUFBQSxJQUFJLEVBQUU7QUFBNUM7QUFITSxPQUFkO0FBS0EsV0FBS0csU0FBTCxDQUFlTixJQUFmO0FBQ0Q7QUFDRjs7QUFFRGdCLEVBQUFBLG9CQUFvQixHQUFHO0FBQ3JCLFNBQUtYLE9BQUwsR0FBZSxLQUFmO0FBQ0Q7O0FBRURZLEVBQUFBLE1BQU0sR0FBRztBQUNQLFdBQU8sS0FBS04sS0FBTCxDQUFXTyxRQUFYLENBQW9CLEtBQUtYLEtBQUwsQ0FBV1IsS0FBL0IsRUFBc0MsS0FBS1EsS0FBTCxDQUFXVCxjQUFqRCxDQUFQO0FBQ0QsR0FuRG9FLENBcURyRTtBQUNBOzs7QUFDQWdCLEVBQUFBLFVBQVUsR0FBRztBQUNYLFdBQU8sS0FBS0gsS0FBTCxDQUFXUSxRQUFYLENBQW9CQyxVQUFwQixDQUErQixPQUEvQixFQUF3QyxLQUFLVCxLQUFMLENBQVdVLEtBQW5ELEVBQTBELEtBQUtWLEtBQUwsQ0FBV1csSUFBckUsRUFBMkUsT0FBM0UsRUFBb0YsS0FBS1gsS0FBTCxDQUFXWSxNQUEvRixDQUFQO0FBQ0Q7O0FBRURDLEVBQUFBLFVBQVUsQ0FBQ0MsT0FBRCxFQUFVO0FBQ2xCLFVBQU07QUFBQ0MsTUFBQUEsUUFBRDtBQUFXQyxNQUFBQTtBQUFYLFFBQXNCLG9CQUFXRixPQUFYLENBQTVCO0FBQ0EsVUFBTUcsS0FBSyxHQUFHLHdCQUFVRixRQUFWLEVBQW9CRyxHQUFwQixDQUF3QkMsSUFBSSxJQUFJO0FBQzlDO0FBQ0E7QUFDQTtBQUNFLGdDQUNLQSxJQURMO0FBRUVDLFFBQUFBLE9BQU8sRUFBRUQsSUFBSSxDQUFDQyxPQUFMLEdBQWUsOEJBQWdCRCxJQUFJLENBQUNDLE9BQUwsQ0FBYUMsT0FBYixDQUFxQixVQUFyQixFQUFpQyxFQUFqQyxDQUFoQixDQUFmLEdBQXVFRixJQUFJLENBQUNDLE9BRnZGO0FBR0VFLFFBQUFBLE9BQU8sRUFBRUgsSUFBSSxDQUFDRyxPQUFMLEdBQWUsOEJBQWdCSCxJQUFJLENBQUNHLE9BQUwsQ0FBYUQsT0FBYixDQUFxQixVQUFyQixFQUFpQyxFQUFqQyxDQUFoQixDQUFmLEdBQXVFRixJQUFJLENBQUNHO0FBSHZGO0FBS0QsS0FUYSxDQUFkO0FBVUEsVUFBTUMsT0FBTyxHQUFHO0FBQ2RDLE1BQUFBLGdCQUFnQixFQUFFLElBREo7QUFFZFIsTUFBQUE7QUFGYyxLQUFoQjs7QUFJQSxRQUFJLEtBQUtoQixLQUFMLENBQVd5QixrQkFBZixFQUFtQztBQUNqQ0YsTUFBQUEsT0FBTyxDQUFDRSxrQkFBUixHQUE2QixLQUFLekIsS0FBTCxDQUFXeUIsa0JBQXhDO0FBQ0Q7O0FBQ0QsVUFBTUMsR0FBRyxHQUFHLGdDQUFvQlQsS0FBcEIsRUFBMkJNLE9BQTNCLENBQVo7QUFDQSxXQUFPRyxHQUFQO0FBQ0Q7O0FBRUQsUUFBTS9CLFNBQU4sQ0FBZ0JOLElBQWhCLEVBQXNCO0FBQ3BCLFVBQU1DLEdBQUcsR0FBRyxLQUFLYSxVQUFMLEVBQVo7QUFDQSxRQUFJd0IsUUFBSjs7QUFFQSxRQUFJO0FBQ0YsWUFBTUMsT0FBTyxHQUFHO0FBQ2RDLFFBQUFBLE1BQU0sRUFBRSxnQ0FETTtBQUVkQyxRQUFBQSxhQUFhLEVBQUcsVUFBUyxLQUFLOUIsS0FBTCxDQUFXK0IsS0FBTTtBQUY1QixPQUFoQjs7QUFLQSxVQUFJekMsR0FBRyxLQUFLRCxJQUFJLENBQUNDLEdBQWIsSUFBb0JELElBQUksQ0FBQ0csSUFBTCxLQUFjLElBQXRDLEVBQTRDO0FBQzFDb0MsUUFBQUEsT0FBTyxDQUFDLGVBQUQsQ0FBUCxHQUEyQnZDLElBQUksQ0FBQ0csSUFBaEM7QUFDRDs7QUFFRG1DLE1BQUFBLFFBQVEsR0FBRyxNQUFNSyxLQUFLLENBQUMxQyxHQUFELEVBQU07QUFBQ3NDLFFBQUFBO0FBQUQsT0FBTixDQUF0QjtBQUNELEtBWEQsQ0FXRSxPQUFPSyxHQUFQLEVBQVk7QUFDWixhQUFPLEtBQUtDLGVBQUwsQ0FBc0IsaURBQWdERCxHQUFHLENBQUNFLE9BQVEsR0FBbEYsRUFBc0ZGLEdBQXRGLENBQVA7QUFDRDs7QUFFRCxRQUFJTixRQUFRLENBQUNTLE1BQVQsS0FBb0IsR0FBeEIsRUFBNkI7QUFDM0I7QUFDQSxVQUFJLENBQUMsS0FBSzFDLE9BQVYsRUFBbUI7QUFDakIsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQsYUFBTyxJQUFJMkMsT0FBSixDQUFZQyxPQUFPLElBQUksS0FBS2xDLFFBQUwsQ0FBYztBQUMxQ2pCLFFBQUFBLGNBQWMsRUFBRUUsSUFBSSxDQUFDRSxLQURxQjtBQUUxQ0gsUUFBQUEsS0FBSyxFQUFFLElBRm1DO0FBRzFDQyxRQUFBQTtBQUgwQyxPQUFkLENBQXZCLENBQVA7QUFLRDs7QUFFRCxRQUFJLENBQUNzQyxRQUFRLENBQUNZLEVBQWQsRUFBa0I7QUFDaEIsYUFBTyxLQUFLTCxlQUFMLENBQXNCLG1EQUFrRFAsUUFBUSxDQUFDYSxVQUFXLEdBQTVGLENBQVA7QUFDRDs7QUFFRCxRQUFJO0FBQ0YsWUFBTWhELElBQUksR0FBR21DLFFBQVEsQ0FBQ0MsT0FBVCxDQUFpQmEsR0FBakIsQ0FBcUIsTUFBckIsQ0FBYjtBQUNBLFlBQU0zQixPQUFPLEdBQUcsTUFBTWEsUUFBUSxDQUFDZSxJQUFULEVBQXRCOztBQUNBLFVBQUksQ0FBQyxLQUFLaEQsT0FBVixFQUFtQjtBQUNqQixlQUFPLElBQVA7QUFDRDs7QUFFRCxZQUFNUCxjQUFjLEdBQUcsS0FBSzBCLFVBQUwsQ0FBZ0JDLE9BQWhCLENBQXZCO0FBQ0EsYUFBTyxJQUFJdUIsT0FBSixDQUFZQyxPQUFPLElBQUksS0FBS2xDLFFBQUwsQ0FBYztBQUMxQ2pCLFFBQUFBLGNBRDBDO0FBRTFDQyxRQUFBQSxLQUFLLEVBQUUsSUFGbUM7QUFHMUNDLFFBQUFBLElBQUksRUFBRTtBQUFDQyxVQUFBQSxHQUFEO0FBQU1DLFVBQUFBLEtBQUssRUFBRUosY0FBYjtBQUE2QkssVUFBQUE7QUFBN0I7QUFIb0MsT0FBZCxFQUkzQjhDLE9BSjJCLENBQXZCLENBQVA7QUFLRCxLQWJELENBYUUsT0FBT0wsR0FBUCxFQUFZO0FBQ1osYUFBTyxLQUFLQyxlQUFMLENBQXFCLGlEQUFyQixFQUF3RUQsR0FBeEUsQ0FBUDtBQUNEO0FBQ0Y7O0FBRURDLEVBQUFBLGVBQWUsQ0FBQ0MsT0FBRCxFQUFVL0MsS0FBVixFQUFpQjtBQUM5QixRQUFJLENBQUMsS0FBS00sT0FBVixFQUFtQjtBQUNqQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUFPLElBQUkyQyxPQUFKLENBQVlDLE9BQU8sSUFBSTtBQUM1QixVQUFJbEQsS0FBSixFQUFXO0FBQ1Q7QUFDQXVELFFBQUFBLE9BQU8sQ0FBQ3ZELEtBQVIsQ0FBY0EsS0FBZDtBQUNEOztBQUVELFVBQUksQ0FBQyxLQUFLTSxPQUFWLEVBQW1CO0FBQ2pCNEMsUUFBQUEsT0FBTztBQUNQO0FBQ0Q7O0FBRUQsV0FBS2xDLFFBQUwsQ0FBYztBQUFDaEIsUUFBQUEsS0FBSyxFQUFFK0M7QUFBUixPQUFkLEVBQWdDRyxPQUFoQztBQUNELEtBWk0sQ0FBUDtBQWFEOztBQTFKb0U7Ozs7Z0JBQWxEdEQseUIsZUFDQTtBQUNqQjtBQUNBMEIsRUFBQUEsS0FBSyxFQUFFa0MsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRlA7QUFHakJuQyxFQUFBQSxJQUFJLEVBQUVpQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFITjtBQUlqQmxDLEVBQUFBLE1BQU0sRUFBRWdDLG1CQUFVaEMsTUFBVixDQUFpQmtDLFVBSlI7QUFNakI7QUFDQXRDLEVBQUFBLFFBQVEsRUFBRXVDLDZCQUFpQkQsVUFQVjtBQVFqQmYsRUFBQUEsS0FBSyxFQUFFYSxtQkFBVUMsTUFBVixDQUFpQkMsVUFSUDtBQVVqQjtBQUNBN0MsRUFBQUEsT0FBTyxFQUFFMkMsbUJBQVVJLElBWEY7QUFZakJ2QixFQUFBQSxrQkFBa0IsRUFBRW1CLG1CQUFVaEMsTUFaYjtBQWNqQjtBQUNBTCxFQUFBQSxRQUFRLEVBQUVxQyxtQkFBVUssSUFBVixDQUFlSDtBQWZSLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VEaWZmfSBmcm9tICd3aGF0LXRoZS1kaWZmJztcblxuaW1wb3J0IHt0b05hdGl2ZVBhdGhTZXB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHtFbmRwb2ludFByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCB7ZmlsdGVyIGFzIGZpbHRlckRpZmZ9IGZyb20gJy4uL21vZGVscy9wYXRjaC9maWx0ZXInO1xuaW1wb3J0IHtidWlsZE11bHRpRmlsZVBhdGNofSBmcm9tICcuLi9tb2RlbHMvcGF0Y2gnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdWxsUmVxdWVzdFBhdGNoQ29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvLyBQdWxsIHJlcXVlc3QgcHJvcGVydGllc1xuICAgIG93bmVyOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcmVwbzogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG51bWJlcjogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuXG4gICAgLy8gQ29ubmVjdGlvbiBwcm9wZXJ0aWVzXG4gICAgZW5kcG9pbnQ6IEVuZHBvaW50UHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICB0b2tlbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXG4gICAgLy8gRmV0Y2hpbmcgYW5kIHBhcnNpbmdcbiAgICByZWZldGNoOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBsYXJnZURpZmZUaHJlc2hvbGQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgICAvLyBSZW5kZXIgcHJvcC4gQ2FsbGVkIHdpdGggKGVycm9yIG9yIG51bGwsIG11bHRpRmlsZVBhdGNoIG9yIG51bGwpXG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0ZSA9IHtcbiAgICBtdWx0aUZpbGVQYXRjaDogbnVsbCxcbiAgICBlcnJvcjogbnVsbCxcbiAgICBsYXN0OiB7dXJsOiBudWxsLCBwYXRjaDogbnVsbCwgZXRhZzogbnVsbH0sXG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLm1vdW50ZWQgPSB0cnVlO1xuICAgIHRoaXMuZmV0Y2hEaWZmKHRoaXMuc3RhdGUubGFzdCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgY29uc3QgZXhwbGljaXRSZWZldGNoID0gdGhpcy5wcm9wcy5yZWZldGNoICYmICFwcmV2UHJvcHMucmVmZXRjaDtcbiAgICBjb25zdCByZXF1ZXN0ZWRVUkxDaGFuZ2UgPSB0aGlzLnN0YXRlLmxhc3QudXJsICE9PSB0aGlzLmdldERpZmZVUkwoKTtcblxuICAgIGlmIChleHBsaWNpdFJlZmV0Y2ggfHwgcmVxdWVzdGVkVVJMQ2hhbmdlKSB7XG4gICAgICBjb25zdCB7bGFzdH0gPSB0aGlzLnN0YXRlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG11bHRpRmlsZVBhdGNoOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgbGFzdDoge3VybDogdGhpcy5nZXREaWZmVVJMKCksIHBhdGNoOiBudWxsLCBldGFnOiBudWxsfSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5mZXRjaERpZmYobGFzdCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5tb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW4odGhpcy5zdGF0ZS5lcnJvciwgdGhpcy5zdGF0ZS5tdWx0aUZpbGVQYXRjaCk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBhIHYzIEdpdEh1YiBBUEkgUkVTVCBVUkwgZm9yIHRoZSBwdWxsIHJlcXVlc3QgcmVzb3VyY2UuXG4gIC8vIEV4YW1wbGU6IGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvYXRvbS9naXRodWIvcHVsbHMvMTgyOVxuICBnZXREaWZmVVJMKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmVuZHBvaW50LmdldFJlc3RVUkkoJ3JlcG9zJywgdGhpcy5wcm9wcy5vd25lciwgdGhpcy5wcm9wcy5yZXBvLCAncHVsbHMnLCB0aGlzLnByb3BzLm51bWJlcik7XG4gIH1cblxuICBidWlsZFBhdGNoKHJhd0RpZmYpIHtcbiAgICBjb25zdCB7ZmlsdGVyZWQsIHJlbW92ZWR9ID0gZmlsdGVyRGlmZihyYXdEaWZmKTtcbiAgICBjb25zdCBkaWZmcyA9IHBhcnNlRGlmZihmaWx0ZXJlZCkubWFwKGRpZmYgPT4ge1xuICAgIC8vIGRpZmYgY29taW5nIGZyb20gQVBJIHdpbGwgaGF2ZSB0aGUgZGVmYXVsIGdpdCBkaWZmIHByZWZpeGVzIGEvIGFuZCBiLyBhbmQgdXNlICpuaXgtc3R5bGUgLyBwYXRoIHNlcGFyYXRvcnMuXG4gICAgLy8gZS5nLiBhL2Rpci9maWxlMS5qcyBhbmQgYi9kaXIvZmlsZTIuanNcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1kaWZmI19nZW5lcmF0aW5nX3BhdGNoZXNfd2l0aF9wXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kaWZmLFxuICAgICAgICBuZXdQYXRoOiBkaWZmLm5ld1BhdGggPyB0b05hdGl2ZVBhdGhTZXAoZGlmZi5uZXdQYXRoLnJlcGxhY2UoL15bYXxiXVxcLy8sICcnKSkgOiBkaWZmLm5ld1BhdGgsXG4gICAgICAgIG9sZFBhdGg6IGRpZmYub2xkUGF0aCA/IHRvTmF0aXZlUGF0aFNlcChkaWZmLm9sZFBhdGgucmVwbGFjZSgvXlthfGJdXFwvLywgJycpKSA6IGRpZmYub2xkUGF0aCxcbiAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHByZXNlcnZlT3JpZ2luYWw6IHRydWUsXG4gICAgICByZW1vdmVkLFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJvcHMubGFyZ2VEaWZmVGhyZXNob2xkKSB7XG4gICAgICBvcHRpb25zLmxhcmdlRGlmZlRocmVzaG9sZCA9IHRoaXMucHJvcHMubGFyZ2VEaWZmVGhyZXNob2xkO1xuICAgIH1cbiAgICBjb25zdCBtZnAgPSBidWlsZE11bHRpRmlsZVBhdGNoKGRpZmZzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gbWZwO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hEaWZmKGxhc3QpIHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLmdldERpZmZVUkwoKTtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52My5kaWZmJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYGJlYXJlciAke3RoaXMucHJvcHMudG9rZW59YCxcbiAgICAgIH07XG5cbiAgICAgIGlmICh1cmwgPT09IGxhc3QudXJsICYmIGxhc3QuZXRhZyAhPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzWydJZi1Ob25lLU1hdGNoJ10gPSBsYXN0LmV0YWc7XG4gICAgICB9XG5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7aGVhZGVyc30pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RGlmZkVycm9yKGBOZXR3b3JrIGVycm9yIGVuY291bnRlcmVkIGZldGNoaW5nIHRoZSBwYXRjaDogJHtlcnIubWVzc2FnZX0uYCwgZXJyKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAzMDQpIHtcbiAgICAgIC8vIE5vdCBtb2RpZmllZC5cbiAgICAgIGlmICghdGhpcy5tb3VudGVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbXVsdGlGaWxlUGF0Y2g6IGxhc3QucGF0Y2gsXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBsYXN0LFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydERpZmZFcnJvcihgVW5hYmxlIHRvIGZldGNoIHRoZSBkaWZmIGZvciB0aGlzIHB1bGwgcmVxdWVzdDogJHtyZXNwb25zZS5zdGF0dXNUZXh0fS5gKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZXRhZyA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdFVGFnJyk7XG4gICAgICBjb25zdCByYXdEaWZmID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgaWYgKCF0aGlzLm1vdW50ZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG11bHRpRmlsZVBhdGNoID0gdGhpcy5idWlsZFBhdGNoKHJhd0RpZmYpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG11bHRpRmlsZVBhdGNoLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgbGFzdDoge3VybCwgcGF0Y2g6IG11bHRpRmlsZVBhdGNoLCBldGFnfSxcbiAgICAgIH0sIHJlc29sdmUpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydERpZmZFcnJvcignVW5hYmxlIHRvIHBhcnNlIHRoZSBkaWZmIGZvciB0aGlzIHB1bGwgcmVxdWVzdC4nLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHJlcG9ydERpZmZFcnJvcihtZXNzYWdlLCBlcnJvcikge1xuICAgIGlmICghdGhpcy5tb3VudGVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5tb3VudGVkKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtlcnJvcjogbWVzc2FnZX0sIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=