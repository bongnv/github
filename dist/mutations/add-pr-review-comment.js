"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactRelay = require("react-relay");

var _relayRuntime = require("relay-runtime");

var _moment = _interopRequireDefault(require("moment"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* istanbul ignore file */
const mutation = function () {
  const node = require("./__generated__/addPrReviewCommentMutation.graphql");

  if (node.hash && node.hash !== "0485900371928de8c6b843560dfe441c") {
    console.error("The definition of 'addPrReviewCommentMutation' appears to have changed. Run `relay-compiler` to update the generated files to receive the expected data.");
  }

  return require("./__generated__/addPrReviewCommentMutation.graphql");
};

let placeholderID = 0;

var _default = (environment, {
  body,
  inReplyTo,
  reviewID,
  threadID,
  viewerID,
  path,
  position
}) => {
  const variables = {
    input: {
      body,
      inReplyTo,
      pullRequestReviewId: reviewID
    }
  };
  const configs = [{
    type: 'RANGE_ADD',
    parentID: threadID,
    connectionInfo: [{
      key: 'ReviewCommentsAccumulator_comments',
      rangeBehavior: 'append'
    }],
    edgeName: 'commentEdge'
  }];

  function optimisticUpdater(store) {
    const reviewThread = store.get(threadID);

    if (!reviewThread) {
      return;
    }

    const id = `add-pr-review-comment:comment:${placeholderID++}`;
    const comment = store.create(id, 'PullRequestReviewComment');
    comment.setValue(id, 'id');
    comment.setValue(body, 'body');
    comment.setValue((0, _helpers.renderMarkdown)(body), 'bodyHTML');
    comment.setValue(false, 'isMinimized');
    comment.setValue(false, 'viewerCanMinimize');
    comment.setValue(false, 'viewerCanReact');
    comment.setValue(false, 'viewerCanUpdate');
    comment.setValue((0, _moment.default)().toISOString(), 'createdAt');
    comment.setValue(null, 'lastEditedAt');
    comment.setValue('NONE', 'authorAssociation');
    comment.setValue('https://github.com', 'url');
    comment.setValue(path, 'path');
    comment.setValue(position, 'position');
    comment.setLinkedRecords([], 'reactionGroups');
    let author;

    if (viewerID) {
      author = store.get(viewerID);
    } else {
      author = store.create(`add-pr-review-comment:author:${placeholderID++}`, 'User');
      author.setValue('...', 'login');
      author.setValue('atom://github/img/avatar.svg', 'avatarUrl');
    }

    comment.setLinkedRecord(author, 'author');

    const comments = _relayRuntime.ConnectionHandler.getConnection(reviewThread, 'ReviewCommentsAccumulator_comments');

    const edge = _relayRuntime.ConnectionHandler.createEdge(store, comments, comment, 'PullRequestReviewCommentEdge');

    _relayRuntime.ConnectionHandler.insertEdgeAfter(comments, edge);
  }

  return new Promise((resolve, reject) => {
    (0, _reactRelay.commitMutation)(environment, {
      mutation,
      variables,
      configs,
      optimisticUpdater,
      onCompleted: resolve,
      onError: reject
    });
  });
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tdXRhdGlvbnMvYWRkLXByLXJldmlldy1jb21tZW50LmpzIl0sIm5hbWVzIjpbIm11dGF0aW9uIiwicGxhY2Vob2xkZXJJRCIsImVudmlyb25tZW50IiwiYm9keSIsImluUmVwbHlUbyIsInJldmlld0lEIiwidGhyZWFkSUQiLCJ2aWV3ZXJJRCIsInBhdGgiLCJwb3NpdGlvbiIsInZhcmlhYmxlcyIsImlucHV0IiwicHVsbFJlcXVlc3RSZXZpZXdJZCIsImNvbmZpZ3MiLCJ0eXBlIiwicGFyZW50SUQiLCJjb25uZWN0aW9uSW5mbyIsImtleSIsInJhbmdlQmVoYXZpb3IiLCJlZGdlTmFtZSIsIm9wdGltaXN0aWNVcGRhdGVyIiwic3RvcmUiLCJyZXZpZXdUaHJlYWQiLCJnZXQiLCJpZCIsImNvbW1lbnQiLCJjcmVhdGUiLCJzZXRWYWx1ZSIsInRvSVNPU3RyaW5nIiwic2V0TGlua2VkUmVjb3JkcyIsImF1dGhvciIsInNldExpbmtlZFJlY29yZCIsImNvbW1lbnRzIiwiQ29ubmVjdGlvbkhhbmRsZXIiLCJnZXRDb25uZWN0aW9uIiwiZWRnZSIsImNyZWF0ZUVkZ2UiLCJpbnNlcnRFZGdlQWZ0ZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uQ29tcGxldGVkIiwib25FcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUVBOzs7O0FBTkE7QUFRQSxNQUFNQSxRQUFRO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsQ0FBZDs7QUE0QkEsSUFBSUMsYUFBYSxHQUFHLENBQXBCOztlQUVlLENBQUNDLFdBQUQsRUFBYztBQUFDQyxFQUFBQSxJQUFEO0FBQU9DLEVBQUFBLFNBQVA7QUFBa0JDLEVBQUFBLFFBQWxCO0FBQTRCQyxFQUFBQSxRQUE1QjtBQUFzQ0MsRUFBQUEsUUFBdEM7QUFBZ0RDLEVBQUFBLElBQWhEO0FBQXNEQyxFQUFBQTtBQUF0RCxDQUFkLEtBQWtGO0FBQy9GLFFBQU1D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Q0FBa0JHLFVBQWxCLENBQTZCZixLQUE3QixFQUFvQ1csUUFBcEMsRUFBOENQLE9BQTlDLEVBQXVELDhCQUF2RCxDQUFiOztBQUNBUSxvQ0FBa0JJLGVBQWxCLENBQWtDTCxRQUFsQyxFQUE0Q0csSUFBNUM7QUFDRDs7QUFFRCxTQUFPLElBQUlHLE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDdEMsb0NBQ0V0QyxXQURGLEVBRUU7QUFDRUYsTUFBQUEsUUFERjtBQUVFVSxNQUFBQSxTQUZGO0FBR0VHLE1BQUFBLE9BSEY7QUFJRU8sTUFBQUEsaUJBSkY7QUFLRXFCLE1BQUFBLFdBQVcsRUFBRUYsT0FMZjtBQU1FRyxNQUFBQSxPQUFPLEVBQUVGO0FBTlgsS0FGRjtBQVdELEdBWk0sQ0FBUDtBQWFELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBpc3RhbmJ1bCBpZ25vcmUgZmlsZSAqL1xuXG5pbXBvcnQge2NvbW1pdE11dGF0aW9uLCBncmFwaHFsfSBmcm9tICdyZWFjdC1yZWxheSc7XG5pbXBvcnQge0Nvbm5lY3Rpb25IYW5kbGVyfSBmcm9tICdyZWxheS1ydW50aW1lJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuaW1wb3J0IHtyZW5kZXJNYXJrZG93bn0gZnJvbSAnLi4vaGVscGVycyc7XG5cbmNvbnN0IG11dGF0aW9uID0gZ3JhcGhxbGBcbiAgbXV0YXRpb24gYWRkUHJSZXZpZXdDb21tZW50TXV0YXRpb24oJGlucHV0OiBBZGRQdWxsUmVxdWVzdFJldmlld0NvbW1lbnRJbnB1dCEpIHtcbiAgICBhZGRQdWxsUmVxdWVzdFJldmlld0NvbW1lbnQoaW5wdXQ6ICRpbnB1dCkge1xuICAgICAgY29tbWVudEVkZ2Uge1xuICAgICAgICBub2RlIHtcbiAgICAgICAgICBpZFxuICAgICAgICAgIGF1dGhvciB7XG4gICAgICAgICAgICBhdmF0YXJVcmxcbiAgICAgICAgICAgIGxvZ2luXG4gICAgICAgICAgfVxuICAgICAgICAgIGJvZHlcbiAgICAgICAgICBib2R5SFRNTFxuICAgICAgICAgIGlzTWluaW1pemVkXG4gICAgICAgICAgdmlld2VyQ2FuUmVhY3RcbiAgICAgICAgICB2aWV3ZXJDYW5VcGRhdGVcbiAgICAgICAgICBwYXRoXG4gICAgICAgICAgcG9zaXRpb25cbiAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICBsYXN0RWRpdGVkQXRcbiAgICAgICAgICB1cmxcbiAgICAgICAgICBhdXRob3JBc3NvY2lhdGlvblxuICAgICAgICAgIC4uLmVtb2ppUmVhY3Rpb25zQ29udHJvbGxlcl9yZWFjdGFibGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuYDtcblxubGV0IHBsYWNlaG9sZGVySUQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCAoZW52aXJvbm1lbnQsIHtib2R5LCBpblJlcGx5VG8sIHJldmlld0lELCB0aHJlYWRJRCwgdmlld2VySUQsIHBhdGgsIHBvc2l0aW9ufSkgPT4ge1xuICBjb25zdCB2YXJpYWJsZXMgPSB7XG4gICAgaW5wdXQ6IHtcbiAgICAgIGJvZHksXG4gICAgICBpblJlcGx5VG8sXG4gICAgICBwdWxsUmVxdWVzdFJldmlld0lkOiByZXZpZXdJRCxcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0IGNvbmZpZ3MgPSBbe1xuICAgIHR5cGU6ICdSQU5HRV9BREQnLFxuICAgIHBhcmVudElEOiB0aHJlYWRJRCxcbiAgICBjb25uZWN0aW9uSW5mbzogW3trZXk6ICdSZXZpZXdDb21tZW50c0FjY3VtdWxhdG9yX2NvbW1lbnRzJywgcmFuZ2VCZWhhdmlvcjogJ2FwcGVuZCd9XSxcbiAgICBlZGdlTmFtZTogJ2NvbW1lbnRFZGdlJyxcbiAgfV07XG5cbiAgZnVuY3Rpb24gb3B0aW1pc3RpY1VwZGF0ZXIoc3RvcmUpIHtcbiAgICBjb25zdCByZXZpZXdUaHJlYWQgPSBzdG9yZS5nZXQodGhyZWFkSUQpO1xuICAgIGlmICghcmV2aWV3VGhyZWFkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaWQgPSBgYWRkLXByLXJldmlldy1jb21tZW50OmNvbW1lbnQ6JHtwbGFjZWhvbGRlcklEKyt9YDtcbiAgICBjb25zdCBjb21tZW50ID0gc3RvcmUuY3JlYXRlKGlkLCAnUHVsbFJlcXVlc3RSZXZpZXdDb21tZW50Jyk7XG4gICAgY29tbWVudC5zZXRWYWx1ZShpZCwgJ2lkJyk7XG4gICAgY29tbWVudC5zZXRWYWx1ZShib2R5LCAnYm9keScpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUocmVuZGVyTWFya2Rvd24oYm9keSksICdib2R5SFRNTCcpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUoZmFsc2UsICdpc01pbmltaXplZCcpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUoZmFsc2UsICd2aWV3ZXJDYW5NaW5pbWl6ZScpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUoZmFsc2UsICd2aWV3ZXJDYW5SZWFjdCcpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUoZmFsc2UsICd2aWV3ZXJDYW5VcGRhdGUnKTtcbiAgICBjb21tZW50LnNldFZhbHVlKG1vbWVudCgpLnRvSVNPU3RyaW5nKCksICdjcmVhdGVkQXQnKTtcbiAgICBjb21tZW50LnNldFZhbHVlKG51bGwsICdsYXN0RWRpdGVkQXQnKTtcbiAgICBjb21tZW50LnNldFZhbHVlKCdOT05FJywgJ2F1dGhvckFzc29jaWF0aW9uJyk7XG4gICAgY29tbWVudC5zZXRWYWx1ZSgnaHR0cHM6Ly9naXRodWIuY29tJywgJ3VybCcpO1xuICAgIGNvbW1lbnQuc2V0VmFsdWUocGF0aCwgJ3BhdGgnKTtcbiAgICBjb21tZW50LnNldFZhbHVlKHBvc2l0aW9uLCAncG9zaXRpb24nKTtcbiAgICBjb21tZW50LnNldExpbmtlZFJlY29yZHMoW10sICdyZWFjdGlvbkdyb3VwcycpO1xuXG4gICAgbGV0IGF1dGhvcjtcbiAgICBpZiAodmlld2VySUQpIHtcbiAgICAgIGF1dGhvciA9IHN0b3JlLmdldCh2aWV3ZXJJRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF1dGhvciA9IHN0b3JlLmNyZWF0ZShgYWRkLXByLXJldmlldy1jb21tZW50OmF1dGhvcjoke3BsYWNlaG9sZGVySUQrK31gLCAnVXNlcicpO1xuICAgICAgYXV0aG9yLnNldFZhbHVlKCcuLi4nLCAnbG9naW4nKTtcbiAgICAgIGF1dGhvci5zZXRWYWx1ZSgnYXRvbTovL2dpdGh1Yi9pbWcvYXZhdGFyLnN2ZycsICdhdmF0YXJVcmwnKTtcbiAgICB9XG4gICAgY29tbWVudC5zZXRMaW5rZWRSZWNvcmQoYXV0aG9yLCAnYXV0aG9yJyk7XG5cbiAgICBjb25zdCBjb21tZW50cyA9IENvbm5lY3Rpb25IYW5kbGVyLmdldENvbm5lY3Rpb24ocmV2aWV3VGhyZWFkLCAnUmV2aWV3Q29tbWVudHNBY2N1bXVsYXRvcl9jb21tZW50cycpO1xuICAgIGNvbnN0IGVkZ2UgPSBDb25uZWN0aW9uSGFuZGxlci5jcmVhdGVFZGdlKHN0b3JlLCBjb21tZW50cywgY29tbWVudCwgJ1B1bGxSZXF1ZXN0UmV2aWV3Q29tbWVudEVkZ2UnKTtcbiAgICBDb25uZWN0aW9uSGFuZGxlci5pbnNlcnRFZGdlQWZ0ZXIoY29tbWVudHMsIGVkZ2UpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb21taXRNdXRhdGlvbihcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAge1xuICAgICAgICBtdXRhdGlvbixcbiAgICAgICAgdmFyaWFibGVzLFxuICAgICAgICBjb25maWdzLFxuICAgICAgICBvcHRpbWlzdGljVXBkYXRlcixcbiAgICAgICAgb25Db21wbGV0ZWQ6IHJlc29sdmUsXG4gICAgICAgIG9uRXJyb3I6IHJlamVjdCxcbiAgICAgIH0sXG4gICAgKTtcbiAgfSk7XG59O1xuIl19