/**
 * @flow
 * @relayHash b78f52f30e644f67a35efd13a162469d
 */

/* eslint-disable */
'use strict';
/*::
import type { ConcreteRequest } from 'relay-runtime';
export type DeletePullRequestReviewInput = {|
  pullRequestReviewId: string,
  clientMutationId?: ?string,
|};
export type deletePrReviewMutationVariables = {|
  input: DeletePullRequestReviewInput
|};
export type deletePrReviewMutationResponse = {|
  +deletePullRequestReview: ?{|
    +pullRequestReview: ?{|
      +id: string
    |}
  |}
|};
export type deletePrReviewMutation = {|
  variables: deletePrReviewMutationVariables,
  response: deletePrReviewMutationResponse,
|};
*/

/*
mutation deletePrReviewMutation(
  $input: DeletePullRequestReviewInput!
) {
  deletePullRequestReview(input: $input) {
    pullRequestReview {
      id
    }
  }
}
*/

const node
/*: ConcreteRequest*/
= function () {
  var v0 = [{
    "kind": "LocalArgument",
    "name": "input",
    "type": "DeletePullRequestReviewInput!",
    "defaultValue": null
  }],
      v1 = [{
    "kind": "LinkedField",
    "alias": null,
    "name": "deletePullRequestReview",
    "storageKey": null,
    "args": [{
      "kind": "Variable",
      "name": "input",
      "variableName": "input"
    }],
    "concreteType": "DeletePullRequestReviewPayload",
    "plural": false,
    "selections": [{
      "kind": "LinkedField",
      "alias": null,
      "name": "pullRequestReview",
      "storageKey": null,
      "args": null,
      "concreteType": "PullRequestReview",
      "plural": false,
      "selections": [{
        "kind": "ScalarField",
        "alias": null,
        "name": "id",
        "args": null,
        "storageKey": null
      }]
    }]
  }];
  return {
    "kind": "Request",
    "fragment": {
      "kind": "Fragment",
      "name": "deletePrReviewMutation",
      "type": "Mutation",
      "metadata": null,
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": v1
      /*: any*/

    },
    "operation": {
      "kind": "Operation",
      "name": "deletePrReviewMutation",
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": v1
      /*: any*/

    },
    "params": {
      "operationKind": "mutation",
      "name": "deletePrReviewMutation",
      "id": null,
      "text": "mutation deletePrReviewMutation(\n  $input: DeletePullRequestReviewInput!\n) {\n  deletePullRequestReview(input: $input) {\n    pullRequestReview {\n      id\n    }\n  }\n}\n",
      "metadata": {}
    }
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '768b81334e225cb5d15c0508d2bd4b1f';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9tdXRhdGlvbnMvX19nZW5lcmF0ZWRfXy9kZWxldGVQclJldmlld011dGF0aW9uLmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwidjEiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FBS0E7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBOzs7Ozs7Ozs7Ozs7QUFZQSxNQUFNQTtBQUFJO0FBQUEsRUFBeUIsWUFBVTtBQUM3QyxNQUFJQyxFQUFFLEdBQUcsQ0FDUDtBQUNFLFlBQVEsZUFEVjtBQUVFLFlBQVEsT0FGVjtBQUdFLFlBQVEsK0JBSFY7QUFJRSxvQkFBZ0I7QUFKbEIsR0FETyxDQUFUO0FBQUEsTUFRQUMsRUFBRSxHQUFHLENBQ0g7QUFDRSxZQUFRLGFBRFY7QUFFRSxhQUFTLElBRlg7QUFHRSxZQUFRLHlCQUhWO0FBSUUsa0JBQWMsSUFKaEI7QUFLRSxZQUFRLENBQ047QUFDRSxjQUFRLFVBRFY7QUFFRSxjQUFRLE9BRlY7QUFHRSxzQkFBZ0I7QUFIbEIsS0FETSxDQUxWO0FBWUUsb0JBQWdCLGdDQVpsQjtBQWFFLGNBQVUsS0FiWjtBQWNFLGtCQUFjLENBQ1o7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLG1CQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsbUJBTmxCO0FBT0UsZ0JBQVUsS0FQWjtBQVFFLG9CQUFjLENBQ1o7QUFDRSxnQkFBUSxhQURWO0FBRUUsaUJBQVMsSUFGWDtBQUdFLGdCQUFRLElBSFY7QUFJRSxnQkFBUSxJQUpWO0FBS0Usc0JBQWM7QUFMaEIsT0FEWTtBQVJoQixLQURZO0FBZGhCLEdBREcsQ0FSTDtBQTZDQSxTQUFPO0FBQ0wsWUFBUSxTQURIO0FBRUwsZ0JBQVk7QUFDVixjQUFRLFVBREU7QUFFVixjQUFRLHdCQUZFO0FBR1YsY0FBUSxVQUhFO0FBSVYsa0JBQVksSUFKRjtBQUtWLDZCQUF3QkQ7QUFBRTtBQUxoQjtBQU1WLG9CQUFlQztBQUFFOztBQU5QLEtBRlA7QUFVTCxpQkFBYTtBQUNYLGNBQVEsV0FERztBQUVYLGNBQVEsd0JBRkc7QUFHWCw2QkFBd0JEO0FBQUU7QUFIZjtBQUlYLG9CQUFlQztBQUFFOztBQUpOLEtBVlI7QUFnQkwsY0FBVTtBQUNSLHVCQUFpQixVQURUO0FBRVIsY0FBUSx3QkFGQTtBQUdSLFlBQU0sSUFIRTtBQUlSLGNBQVEsZ0xBSkE7QUFLUixrQkFBWTtBQUxKO0FBaEJMLEdBQVA7QUF3QkMsQ0F0RWlDLEVBQWxDLEMsQ0F1RUE7OztBQUNDRjtBQUFJO0FBQUwsQ0FBZ0JHLElBQWhCLEdBQXVCLGtDQUF2QjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJMLElBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmxvd1xuICogQHJlbGF5SGFzaCBiNzhmNTJmMzBlNjQ0ZjY3YTM1ZWZkMTNhMTYyNDY5ZFxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyo6OlxuaW1wb3J0IHR5cGUgeyBDb25jcmV0ZVJlcXVlc3QgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbmV4cG9ydCB0eXBlIERlbGV0ZVB1bGxSZXF1ZXN0UmV2aWV3SW5wdXQgPSB7fFxuICBwdWxsUmVxdWVzdFJldmlld0lkOiBzdHJpbmcsXG4gIGNsaWVudE11dGF0aW9uSWQ/OiA/c3RyaW5nLFxufH07XG5leHBvcnQgdHlwZSBkZWxldGVQclJldmlld011dGF0aW9uVmFyaWFibGVzID0ge3xcbiAgaW5wdXQ6IERlbGV0ZVB1bGxSZXF1ZXN0UmV2aWV3SW5wdXRcbnx9O1xuZXhwb3J0IHR5cGUgZGVsZXRlUHJSZXZpZXdNdXRhdGlvblJlc3BvbnNlID0ge3xcbiAgK2RlbGV0ZVB1bGxSZXF1ZXN0UmV2aWV3OiA/e3xcbiAgICArcHVsbFJlcXVlc3RSZXZpZXc6ID97fFxuICAgICAgK2lkOiBzdHJpbmdcbiAgICB8fVxuICB8fVxufH07XG5leHBvcnQgdHlwZSBkZWxldGVQclJldmlld011dGF0aW9uID0ge3xcbiAgdmFyaWFibGVzOiBkZWxldGVQclJldmlld011dGF0aW9uVmFyaWFibGVzLFxuICByZXNwb25zZTogZGVsZXRlUHJSZXZpZXdNdXRhdGlvblJlc3BvbnNlLFxufH07XG4qL1xuXG5cbi8qXG5tdXRhdGlvbiBkZWxldGVQclJldmlld011dGF0aW9uKFxuICAkaW5wdXQ6IERlbGV0ZVB1bGxSZXF1ZXN0UmV2aWV3SW5wdXQhXG4pIHtcbiAgZGVsZXRlUHVsbFJlcXVlc3RSZXZpZXcoaW5wdXQ6ICRpbnB1dCkge1xuICAgIHB1bGxSZXF1ZXN0UmV2aWV3IHtcbiAgICAgIGlkXG4gICAgfVxuICB9XG59XG4qL1xuXG5jb25zdCBub2RlLyo6IENvbmNyZXRlUmVxdWVzdCovID0gKGZ1bmN0aW9uKCl7XG52YXIgdjAgPSBbXG4gIHtcbiAgICBcImtpbmRcIjogXCJMb2NhbEFyZ3VtZW50XCIsXG4gICAgXCJuYW1lXCI6IFwiaW5wdXRcIixcbiAgICBcInR5cGVcIjogXCJEZWxldGVQdWxsUmVxdWVzdFJldmlld0lucHV0IVwiLFxuICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgfVxuXSxcbnYxID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwiZGVsZXRlUHVsbFJlcXVlc3RSZXZpZXdcIixcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICBcImFyZ3NcIjogW1xuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICBcIm5hbWVcIjogXCJpbnB1dFwiLFxuICAgICAgICBcInZhcmlhYmxlTmFtZVwiOiBcImlucHV0XCJcbiAgICAgIH1cbiAgICBdLFxuICAgIFwiY29uY3JldGVUeXBlXCI6IFwiRGVsZXRlUHVsbFJlcXVlc3RSZXZpZXdQYXlsb2FkXCIsXG4gICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICBcIm5hbWVcIjogXCJwdWxsUmVxdWVzdFJldmlld1wiLFxuICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUHVsbFJlcXVlc3RSZXZpZXdcIixcbiAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgIFwibmFtZVwiOiBcImlkXCIsXG4gICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9XG5dO1xucmV0dXJuIHtcbiAgXCJraW5kXCI6IFwiUmVxdWVzdFwiLFxuICBcImZyYWdtZW50XCI6IHtcbiAgICBcImtpbmRcIjogXCJGcmFnbWVudFwiLFxuICAgIFwibmFtZVwiOiBcImRlbGV0ZVByUmV2aWV3TXV0YXRpb25cIixcbiAgICBcInR5cGVcIjogXCJNdXRhdGlvblwiLFxuICAgIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogKHYwLyo6IGFueSovKSxcbiAgICBcInNlbGVjdGlvbnNcIjogKHYxLyo6IGFueSovKVxuICB9LFxuICBcIm9wZXJhdGlvblwiOiB7XG4gICAgXCJraW5kXCI6IFwiT3BlcmF0aW9uXCIsXG4gICAgXCJuYW1lXCI6IFwiZGVsZXRlUHJSZXZpZXdNdXRhdGlvblwiLFxuICAgIFwiYXJndW1lbnREZWZpbml0aW9uc1wiOiAodjAvKjogYW55Ki8pLFxuICAgIFwic2VsZWN0aW9uc1wiOiAodjEvKjogYW55Ki8pXG4gIH0sXG4gIFwicGFyYW1zXCI6IHtcbiAgICBcIm9wZXJhdGlvbktpbmRcIjogXCJtdXRhdGlvblwiLFxuICAgIFwibmFtZVwiOiBcImRlbGV0ZVByUmV2aWV3TXV0YXRpb25cIixcbiAgICBcImlkXCI6IG51bGwsXG4gICAgXCJ0ZXh0XCI6IFwibXV0YXRpb24gZGVsZXRlUHJSZXZpZXdNdXRhdGlvbihcXG4gICRpbnB1dDogRGVsZXRlUHVsbFJlcXVlc3RSZXZpZXdJbnB1dCFcXG4pIHtcXG4gIGRlbGV0ZVB1bGxSZXF1ZXN0UmV2aWV3KGlucHV0OiAkaW5wdXQpIHtcXG4gICAgcHVsbFJlcXVlc3RSZXZpZXcge1xcbiAgICAgIGlkXFxuICAgIH1cXG4gIH1cXG59XFxuXCIsXG4gICAgXCJtZXRhZGF0YVwiOiB7fVxuICB9XG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnNzY4YjgxMzM0ZTIyNWNiNWQxNWMwNTA4ZDJiZDRiMWYnO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19