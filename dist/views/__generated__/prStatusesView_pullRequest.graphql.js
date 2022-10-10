/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
type checkSuitesAccumulator_commit$ref = any;
type prStatusContextView_context$ref = any;
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type prStatusesView_pullRequest$ref: FragmentReference;
declare export opaque type prStatusesView_pullRequest$fragmentType: prStatusesView_pullRequest$ref;
export type prStatusesView_pullRequest = {|
  +id: string,
  +recentCommits: {|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +commit: {|
          +status: ?{|
            +state: StatusState,
            +contexts: $ReadOnlyArray<{|
              +id: string,
              +state: StatusState,
              +$fragmentRefs: prStatusContextView_context$ref,
            |}>,
          |},
          +$fragmentRefs: checkSuitesAccumulator_commit$ref,
        |}
      |}
    |}>
  |},
  +$refType: prStatusesView_pullRequest$ref,
|};
export type prStatusesView_pullRequest$data = prStatusesView_pullRequest;
export type prStatusesView_pullRequest$key = {
  +$data?: prStatusesView_pullRequest$data,
  +$fragmentRefs: prStatusesView_pullRequest$ref,
};
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "id",
    "args": null,
    "storageKey": null
  },
      v1 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "state",
    "args": null,
    "storageKey": null
  };
  return {
    "kind": "Fragment",
    "name": "prStatusesView_pullRequest",
    "type": "PullRequest",
    "metadata": null,
    "argumentDefinitions": [{
      "kind": "LocalArgument",
      "name": "checkSuiteCount",
      "type": "Int!",
      "defaultValue": null
    }, {
      "kind": "LocalArgument",
      "name": "checkSuiteCursor",
      "type": "String",
      "defaultValue": null
    }, {
      "kind": "LocalArgument",
      "name": "checkRunCount",
      "type": "Int!",
      "defaultValue": null
    }, {
      "kind": "LocalArgument",
      "name": "checkRunCursor",
      "type": "String",
      "defaultValue": null
    }],
    "selections": [v0
    /*: any*/
    , {
      "kind": "LinkedField",
      "alias": "recentCommits",
      "name": "commits",
      "storageKey": "commits(last:1)",
      "args": [{
        "kind": "Literal",
        "name": "last",
        "value": 1
      }],
      "concreteType": "PullRequestCommitConnection",
      "plural": false,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "edges",
        "storageKey": null,
        "args": null,
        "concreteType": "PullRequestCommitEdge",
        "plural": true,
        "selections": [{
          "kind": "LinkedField",
          "alias": null,
          "name": "node",
          "storageKey": null,
          "args": null,
          "concreteType": "PullRequestCommit",
          "plural": false,
          "selections": [{
            "kind": "LinkedField",
            "alias": null,
            "name": "commit",
            "storageKey": null,
            "args": null,
            "concreteType": "Commit",
            "plural": false,
            "selections": [{
              "kind": "LinkedField",
              "alias": null,
              "name": "status",
              "storageKey": null,
              "args": null,
              "concreteType": "Status",
              "plural": false,
              "selections": [v1
              /*: any*/
              , {
                "kind": "LinkedField",
                "alias": null,
                "name": "contexts",
                "storageKey": null,
                "args": null,
                "concreteType": "StatusContext",
                "plural": true,
                "selections": [v0
                /*: any*/
                , v1
                /*: any*/
                , {
                  "kind": "FragmentSpread",
                  "name": "prStatusContextView_context",
                  "args": null
                }]
              }]
            }, {
              "kind": "FragmentSpread",
              "name": "checkSuitesAccumulator_commit",
              "args": [{
                "kind": "Variable",
                "name": "checkRunCount",
                "variableName": "checkRunCount"
              }, {
                "kind": "Variable",
                "name": "checkRunCursor",
                "variableName": "checkRunCursor"
              }, {
                "kind": "Variable",
                "name": "checkSuiteCount",
                "variableName": "checkSuiteCount"
              }, {
                "kind": "Variable",
                "name": "checkSuiteCursor",
                "variableName": "checkSuiteCursor"
              }]
            }]
          }]
        }]
      }]
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = 'e21e2ef5e505a4a8e895bf13cb4202ab';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi92aWV3cy9fX2dlbmVyYXRlZF9fL3ByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0LmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwidjEiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxNQUFNQTtBQUFJO0FBQUEsRUFBd0IsWUFBVTtBQUM1QyxNQUFJQyxFQUFFLEdBQUc7QUFDUCxZQUFRLGFBREQ7QUFFUCxhQUFTLElBRkY7QUFHUCxZQUFRLElBSEQ7QUFJUCxZQUFRLElBSkQ7QUFLUCxrQkFBYztBQUxQLEdBQVQ7QUFBQSxNQU9BQyxFQUFFLEdBQUc7QUFDSCxZQUFRLGFBREw7QUFFSCxhQUFTLElBRk47QUFHSCxZQUFRLE9BSEw7QUFJSCxZQUFRLElBSkw7QUFLSCxrQkFBYztBQUxYLEdBUEw7QUFjQSxTQUFPO0FBQ0wsWUFBUSxVQURIO0FBRUwsWUFBUSw0QkFGSDtBQUdMLFlBQVEsYUFISDtBQUlMLGdCQUFZLElBSlA7QUFLTCwyQkFBdUIsQ0FDckI7QUFDRSxjQUFRLGVBRFY7QUFFRSxjQUFRLGlCQUZWO0FBR0UsY0FBUSxNQUhWO0FBSUUsc0JBQWdCO0FBSmxCLEtBRHFCLEVBT3JCO0FBQ0UsY0FBUSxlQURWO0FBRUUsY0FBUSxrQkFGVjtBQUdFLGNBQVEsUUFIVjtBQUlFLHNCQUFnQjtBQUpsQixLQVBxQixFQWFyQjtBQUNFLGNBQVEsZUFEVjtBQUVFLGNBQVEsZUFGVjtBQUdFLGNBQVEsTUFIVjtBQUlFLHNCQUFnQjtBQUpsQixLQWJxQixFQW1CckI7QUFDRSxjQUFRLGVBRFY7QUFFRSxjQUFRLGdCQUZWO0FBR0UsY0FBUSxRQUhWO0FBSUUsc0JBQWdCO0FBSmxCLEtBbkJxQixDQUxsQjtBQStCTCxrQkFBYyxDQUNYRDtBQUFFO0FBRFMsTUFFWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsZUFGWDtBQUdFLGNBQVEsU0FIVjtBQUlFLG9CQUFjLGlCQUpoQjtBQUtFLGNBQVEsQ0FDTjtBQUNFLGdCQUFRLFNBRFY7QUFFRSxnQkFBUSxNQUZWO0FBR0UsaUJBQVM7QUFIWCxPQURNLENBTFY7QUFZRSxzQkFBZ0IsNkJBWmxCO0FBYUUsZ0JBQVUsS0FiWjtBQWNFLG9CQUFjLENBQ1o7QUFDRSxnQkFBUSxhQURWO0FBRUUsaUJBQVMsSUFGWDtBQUdFLGdCQUFRLE9BSFY7QUFJRSxzQkFBYyxJQUpoQjtBQUtFLGdCQUFRLElBTFY7QUFNRSx3QkFBZ0IsdUJBTmxCO0FBT0Usa0JBQVUsSUFQWjtBQVFFLHNCQUFjLENBQ1o7QUFDRSxrQkFBUSxhQURWO0FBRUUsbUJBQVMsSUFGWDtBQUdFLGtCQUFRLE1BSFY7QUFJRSx3QkFBYyxJQUpoQjtBQUtFLGtCQUFRLElBTFY7QUFNRSwwQkFBZ0IsbUJBTmxCO0FBT0Usb0JBQVUsS0FQWjtBQVFFLHdCQUFjLENBQ1o7QUFDRSxvQkFBUSxhQURWO0FBRUUscUJBQVMsSUFGWDtBQUdFLG9CQUFRLFFBSFY7QUFJRSwwQkFBYyxJQUpoQjtBQUtFLG9CQUFRLElBTFY7QUFNRSw0QkFBZ0IsUUFObEI7QUFPRSxzQkFBVSxLQVBaO0FBUUUsMEJBQWMsQ0FDWjtBQUNFLHNCQUFRLGFBRFY7QUFFRSx1QkFBUyxJQUZYO0FBR0Usc0JBQVEsUUFIVjtBQUlFLDRCQUFjLElBSmhCO0FBS0Usc0JBQVEsSUFMVjtBQU1FLDhCQUFnQixRQU5sQjtBQU9FLHdCQUFVLEtBUFo7QUFRRSw0QkFBYyxDQUNYQztBQUFFO0FBRFMsZ0JBRVo7QUFDRSx3QkFBUSxhQURWO0FBRUUseUJBQVMsSUFGWDtBQUdFLHdCQUFRLFVBSFY7QUFJRSw4QkFBYyxJQUpoQjtBQUtFLHdCQUFRLElBTFY7QUFNRSxnQ0FBZ0IsZUFObEI7QUFPRSwwQkFBVSxJQVBaO0FBUUUsOEJBQWMsQ0FDWEQ7QUFBRTtBQURTLGtCQUVYQztBQUFFO0FBRlMsa0JBR1o7QUFDRSwwQkFBUSxnQkFEVjtBQUVFLDBCQUFRLDZCQUZWO0FBR0UsMEJBQVE7QUFIVixpQkFIWTtBQVJoQixlQUZZO0FBUmhCLGFBRFksRUErQlo7QUFDRSxzQkFBUSxnQkFEVjtBQUVFLHNCQUFRLCtCQUZWO0FBR0Usc0JBQVEsQ0FDTjtBQUNFLHdCQUFRLFVBRFY7QUFFRSx3QkFBUSxlQUZWO0FBR0UsZ0NBQWdCO0FBSGxCLGVBRE0sRUFNTjtBQUNFLHdCQUFRLFVBRFY7QUFFRSx3QkFBUSxnQkFGVjtBQUdFLGdDQUFnQjtBQUhsQixlQU5NLEVBV047QUFDRSx3QkFBUSxVQURWO0FBRUUsd0JBQVEsaUJBRlY7QUFHRSxnQ0FBZ0I7QUFIbEIsZUFYTSxFQWdCTjtBQUNFLHdCQUFRLFVBRFY7QUFFRSx3QkFBUSxrQkFGVjtBQUdFLGdDQUFnQjtBQUhsQixlQWhCTTtBQUhWLGFBL0JZO0FBUmhCLFdBRFk7QUFSaEIsU0FEWTtBQVJoQixPQURZO0FBZGhCLEtBRlk7QUEvQlQsR0FBUDtBQTZJQyxDQTVKZ0MsRUFBakMsQyxDQTZKQTs7O0FBQ0NGO0FBQUk7QUFBTCxDQUFnQkcsSUFBaEIsR0FBdUIsa0NBQXZCO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkwsSUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmbG93XG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKjo6XG5pbXBvcnQgdHlwZSB7IFJlYWRlckZyYWdtZW50IH0gZnJvbSAncmVsYXktcnVudGltZSc7XG50eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JHJlZiA9IGFueTtcbnR5cGUgcHJTdGF0dXNDb250ZXh0Vmlld19jb250ZXh0JHJlZiA9IGFueTtcbmV4cG9ydCB0eXBlIFN0YXR1c1N0YXRlID0gXCJFUlJPUlwiIHwgXCJFWFBFQ1RFRFwiIHwgXCJGQUlMVVJFXCIgfCBcIlBFTkRJTkdcIiB8IFwiU1VDQ0VTU1wiIHwgXCIlZnV0dXJlIGFkZGVkIHZhbHVlXCI7XG5pbXBvcnQgdHlwZSB7IEZyYWdtZW50UmVmZXJlbmNlIH0gZnJvbSBcInJlbGF5LXJ1bnRpbWVcIjtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0JHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBwclN0YXR1c2VzVmlld19wdWxsUmVxdWVzdCRmcmFnbWVudFR5cGU6IHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0JHJlZjtcbmV4cG9ydCB0eXBlIHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0ID0ge3xcbiAgK2lkOiBzdHJpbmcsXG4gICtyZWNlbnRDb21taXRzOiB7fFxuICAgICtlZGdlczogPyRSZWFkT25seUFycmF5PD97fFxuICAgICAgK25vZGU6ID97fFxuICAgICAgICArY29tbWl0OiB7fFxuICAgICAgICAgICtzdGF0dXM6ID97fFxuICAgICAgICAgICAgK3N0YXRlOiBTdGF0dXNTdGF0ZSxcbiAgICAgICAgICAgICtjb250ZXh0czogJFJlYWRPbmx5QXJyYXk8e3xcbiAgICAgICAgICAgICAgK2lkOiBzdHJpbmcsXG4gICAgICAgICAgICAgICtzdGF0ZTogU3RhdHVzU3RhdGUsXG4gICAgICAgICAgICAgICskZnJhZ21lbnRSZWZzOiBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQkcmVmLFxuICAgICAgICAgICAgfH0+LFxuICAgICAgICAgIHx9LFxuICAgICAgICAgICskZnJhZ21lbnRSZWZzOiBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdCRyZWYsXG4gICAgICAgIHx9XG4gICAgICB8fVxuICAgIHx9PlxuICB8fSxcbiAgKyRyZWZUeXBlOiBwclN0YXR1c2VzVmlld19wdWxsUmVxdWVzdCRyZWYsXG58fTtcbmV4cG9ydCB0eXBlIHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0JGRhdGEgPSBwclN0YXR1c2VzVmlld19wdWxsUmVxdWVzdDtcbmV4cG9ydCB0eXBlIHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0JGtleSA9IHtcbiAgKyRkYXRhPzogcHJTdGF0dXNlc1ZpZXdfcHVsbFJlcXVlc3QkZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IHByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0JHJlZixcbn07XG4qL1xuXG5cbmNvbnN0IG5vZGUvKjogUmVhZGVyRnJhZ21lbnQqLyA9IChmdW5jdGlvbigpe1xudmFyIHYwID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcImlkXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufSxcbnYxID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcInN0YXRlXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcInByU3RhdHVzZXNWaWV3X3B1bGxSZXF1ZXN0XCIsXG4gIFwidHlwZVwiOiBcIlB1bGxSZXF1ZXN0XCIsXG4gIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMb2NhbEFyZ3VtZW50XCIsXG4gICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlQ291bnRcIixcbiAgICAgIFwidHlwZVwiOiBcIkludCFcIixcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVDdXJzb3JcIixcbiAgICAgIFwidHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5Db3VudFwiLFxuICAgICAgXCJ0eXBlXCI6IFwiSW50IVwiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5DdXJzb3JcIixcbiAgICAgIFwidHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH1cbiAgXSxcbiAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAodjAvKjogYW55Ki8pLFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IFwicmVjZW50Q29tbWl0c1wiLFxuICAgICAgXCJuYW1lXCI6IFwiY29tbWl0c1wiLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IFwiY29tbWl0cyhsYXN0OjEpXCIsXG4gICAgICBcImFyZ3NcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiTGl0ZXJhbFwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcImxhc3RcIixcbiAgICAgICAgICBcInZhbHVlXCI6IDFcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUHVsbFJlcXVlc3RDb21taXRDb25uZWN0aW9uXCIsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJlZGdlc1wiLFxuICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUHVsbFJlcXVlc3RDb21taXRFZGdlXCIsXG4gICAgICAgICAgXCJwbHVyYWxcIjogdHJ1ZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcIm5vZGVcIixcbiAgICAgICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIlB1bGxSZXF1ZXN0Q29tbWl0XCIsXG4gICAgICAgICAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjb21taXRcIixcbiAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIkNvbW1pdFwiLFxuICAgICAgICAgICAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwic3RhdHVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJTdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgKHYxLyo6IGFueSovKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjb250ZXh0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiU3RhdHVzQ29udGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInBsdXJhbFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2MC8qOiBhbnkqLyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHYxLyo6IGFueSovKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJGcmFnbWVudFNwcmVhZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwicHJTdGF0dXNDb250ZXh0Vmlld19jb250ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkZyYWdtZW50U3ByZWFkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiY2hlY2tTdWl0ZXNBY2N1bXVsYXRvcl9jb21taXRcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1J1bkNvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFyaWFibGVOYW1lXCI6IFwiY2hlY2tSdW5Db3VudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1J1bkN1cnNvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhcmlhYmxlTmFtZVwiOiBcImNoZWNrUnVuQ3Vyc29yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVDb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhcmlhYmxlTmFtZVwiOiBcImNoZWNrU3VpdGVDb3VudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlQ3Vyc29yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFyaWFibGVOYW1lXCI6IFwiY2hlY2tTdWl0ZUN1cnNvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnZTIxZTJlZjVlNTA1YTRhOGU4OTViZjEzY2I0MjAyYWInO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19