/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
type checkRunsAccumulator_checkSuite$ref = any;
type checkSuiteView_checkSuite$ref = any;
export type CheckConclusionState = "ACTION_REQUIRED" | "CANCELLED" | "FAILURE" | "NEUTRAL" | "SKIPPED" | "STALE" | "STARTUP_FAILURE" | "SUCCESS" | "TIMED_OUT" | "%future added value";
export type CheckStatusState = "COMPLETED" | "IN_PROGRESS" | "QUEUED" | "REQUESTED" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type checkSuitesAccumulator_commit$ref: FragmentReference;
declare export opaque type checkSuitesAccumulator_commit$fragmentType: checkSuitesAccumulator_commit$ref;
export type checkSuitesAccumulator_commit = {|
  +id: string,
  +checkSuites: ?{|
    +pageInfo: {|
      +hasNextPage: boolean,
      +endCursor: ?string,
    |},
    +edges: ?$ReadOnlyArray<?{|
      +cursor: string,
      +node: ?{|
        +id: string,
        +status: CheckStatusState,
        +conclusion: ?CheckConclusionState,
        +$fragmentRefs: checkSuiteView_checkSuite$ref & checkRunsAccumulator_checkSuite$ref,
      |},
    |}>,
  |},
  +$refType: checkSuitesAccumulator_commit$ref,
|};
export type checkSuitesAccumulator_commit$data = checkSuitesAccumulator_commit;
export type checkSuitesAccumulator_commit$key = {
  +$data?: checkSuitesAccumulator_commit$data,
  +$fragmentRefs: checkSuitesAccumulator_commit$ref,
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
  };
  return {
    "kind": "Fragment",
    "name": "checkSuitesAccumulator_commit",
    "type": "Commit",
    "metadata": {
      "connection": [{
        "count": "checkSuiteCount",
        "cursor": "checkSuiteCursor",
        "direction": "forward",
        "path": ["checkSuites"]
      }]
    },
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
      "alias": "checkSuites",
      "name": "__CheckSuiteAccumulator_checkSuites_connection",
      "storageKey": null,
      "args": null,
      "concreteType": "CheckSuiteConnection",
      "plural": false,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "pageInfo",
        "storageKey": null,
        "args": null,
        "concreteType": "PageInfo",
        "plural": false,
        "selections": [{
          "kind": "ScalarField",
          "alias": null,
          "name": "hasNextPage",
          "args": null,
          "storageKey": null
        }, {
          "kind": "ScalarField",
          "alias": null,
          "name": "endCursor",
          "args": null,
          "storageKey": null
        }]
      }, {
        "kind": "LinkedField",
        "alias": null,
        "name": "edges",
        "storageKey": null,
        "args": null,
        "concreteType": "CheckSuiteEdge",
        "plural": true,
        "selections": [{
          "kind": "ScalarField",
          "alias": null,
          "name": "cursor",
          "args": null,
          "storageKey": null
        }, {
          "kind": "LinkedField",
          "alias": null,
          "name": "node",
          "storageKey": null,
          "args": null,
          "concreteType": "CheckSuite",
          "plural": false,
          "selections": [v0
          /*: any*/
          , {
            "kind": "ScalarField",
            "alias": null,
            "name": "status",
            "args": null,
            "storageKey": null
          }, {
            "kind": "ScalarField",
            "alias": null,
            "name": "conclusion",
            "args": null,
            "storageKey": null
          }, {
            "kind": "ScalarField",
            "alias": null,
            "name": "__typename",
            "args": null,
            "storageKey": null
          }, {
            "kind": "FragmentSpread",
            "name": "checkSuiteView_checkSuite",
            "args": null
          }, {
            "kind": "FragmentSpread",
            "name": "checkRunsAccumulator_checkSuite",
            "args": [{
              "kind": "Variable",
              "name": "checkRunCount",
              "variableName": "checkRunCount"
            }, {
              "kind": "Variable",
              "name": "checkRunCursor",
              "variableName": "checkRunCursor"
            }]
          }]
        }]
      }]
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '582abc8127f0f2f19fb0a6a531af5e06';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9jb250YWluZXJzL2FjY3VtdWxhdG9ycy9fX2dlbmVyYXRlZF9fL2NoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0LmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwiaGFzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FBSUE7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQSxNQUFNQTtBQUFJO0FBQUEsRUFBd0IsWUFBVTtBQUM1QyxNQUFJQyxFQUFFLEdBQUc7QUFDUCxZQUFRLGFBREQ7QUFFUCxhQUFTLElBRkY7QUFHUCxZQUFRLElBSEQ7QUFJUCxZQUFRLElBSkQ7QUFLUCxrQkFBYztBQUxQLEdBQVQ7QUFPQSxTQUFPO0FBQ0wsWUFBUSxVQURIO0FBRUwsWUFBUSwrQkFGSDtBQUdMLFlBQVEsUUFISDtBQUlMLGdCQUFZO0FBQ1Ysb0JBQWMsQ0FDWjtBQUNFLGlCQUFTLGlCQURYO0FBRUUsa0JBQVUsa0JBRlo7QUFHRSxxQkFBYSxTQUhmO0FBSUUsZ0JBQVEsQ0FDTixhQURNO0FBSlYsT0FEWTtBQURKLEtBSlA7QUFnQkwsMkJBQXVCLENBQ3JCO0FBQ0UsY0FBUSxlQURWO0FBRUUsY0FBUSxpQkFGVjtBQUdFLGNBQVEsTUFIVjtBQUlFLHNCQUFnQjtBQUpsQixLQURxQixFQU9yQjtBQUNFLGNBQVEsZUFEVjtBQUVFLGNBQVEsa0JBRlY7QUFHRSxjQUFRLFFBSFY7QUFJRSxzQkFBZ0I7QUFKbEIsS0FQcUIsRUFhckI7QUFDRSxjQUFRLGVBRFY7QUFFRSxjQUFRLGVBRlY7QUFHRSxjQUFRLE1BSFY7QUFJRSxzQkFBZ0I7QUFKbEIsS0FicUIsRUFtQnJCO0FBQ0UsY0FBUSxlQURWO0FBRUUsY0FBUSxnQkFGVjtBQUdFLGNBQVEsUUFIVjtBQUlFLHNCQUFnQjtBQUpsQixLQW5CcUIsQ0FoQmxCO0FBMENMLGtCQUFjLENBQ1hBO0FBQUU7QUFEUyxNQUVaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxhQUZYO0FBR0UsY0FBUSxnREFIVjtBQUlFLG9CQUFjLElBSmhCO0FBS0UsY0FBUSxJQUxWO0FBTUUsc0JBQWdCLHNCQU5sQjtBQU9FLGdCQUFVLEtBUFo7QUFRRSxvQkFBYyxDQUNaO0FBQ0UsZ0JBQVEsYUFEVjtBQUVFLGlCQUFTLElBRlg7QUFHRSxnQkFBUSxVQUhWO0FBSUUsc0JBQWMsSUFKaEI7QUFLRSxnQkFBUSxJQUxWO0FBTUUsd0JBQWdCLFVBTmxCO0FBT0Usa0JBQVUsS0FQWjtBQVFFLHNCQUFjLENBQ1o7QUFDRSxrQkFBUSxhQURWO0FBRUUsbUJBQVMsSUFGWDtBQUdFLGtCQUFRLGFBSFY7QUFJRSxrQkFBUSxJQUpWO0FBS0Usd0JBQWM7QUFMaEIsU0FEWSxFQVFaO0FBQ0Usa0JBQVEsYUFEVjtBQUVFLG1CQUFTLElBRlg7QUFHRSxrQkFBUSxXQUhWO0FBSUUsa0JBQVEsSUFKVjtBQUtFLHdCQUFjO0FBTGhCLFNBUlk7QUFSaEIsT0FEWSxFQTBCWjtBQUNFLGdCQUFRLGFBRFY7QUFFRSxpQkFBUyxJQUZYO0FBR0UsZ0JBQVEsT0FIVjtBQUlFLHNCQUFjLElBSmhCO0FBS0UsZ0JBQVEsSUFMVjtBQU1FLHdCQUFnQixnQkFObEI7QUFPRSxrQkFBVSxJQVBaO0FBUUUsc0JBQWMsQ0FDWjtBQUNFLGtCQUFRLGFBRFY7QUFFRSxtQkFBUyxJQUZYO0FBR0Usa0JBQVEsUUFIVjtBQUlFLGtCQUFRLElBSlY7QUFLRSx3QkFBYztBQUxoQixTQURZLEVBUVo7QUFDRSxrQkFBUSxhQURWO0FBRUUsbUJBQVMsSUFGWDtBQUdFLGtCQUFRLE1BSFY7QUFJRSx3QkFBYyxJQUpoQjtBQUtFLGtCQUFRLElBTFY7QUFNRSwwQkFBZ0IsWUFObEI7QUFPRSxvQkFBVSxLQVBaO0FBUUUsd0JBQWMsQ0FDWEE7QUFBRTtBQURTLFlBRVo7QUFDRSxvQkFBUSxhQURWO0FBRUUscUJBQVMsSUFGWDtBQUdFLG9CQUFRLFFBSFY7QUFJRSxvQkFBUSxJQUpWO0FBS0UsMEJBQWM7QUFMaEIsV0FGWSxFQVNaO0FBQ0Usb0JBQVEsYUFEVjtBQUVFLHFCQUFTLElBRlg7QUFHRSxvQkFBUSxZQUhWO0FBSUUsb0JBQVEsSUFKVjtBQUtFLDBCQUFjO0FBTGhCLFdBVFksRUFnQlo7QUFDRSxvQkFBUSxhQURWO0FBRUUscUJBQVMsSUFGWDtBQUdFLG9CQUFRLFlBSFY7QUFJRSxvQkFBUSxJQUpWO0FBS0UsMEJBQWM7QUFMaEIsV0FoQlksRUF1Qlo7QUFDRSxvQkFBUSxnQkFEVjtBQUVFLG9CQUFRLDJCQUZWO0FBR0Usb0JBQVE7QUFIVixXQXZCWSxFQTRCWjtBQUNFLG9CQUFRLGdCQURWO0FBRUUsb0JBQVEsaUNBRlY7QUFHRSxvQkFBUSxDQUNOO0FBQ0Usc0JBQVEsVUFEVjtBQUVFLHNCQUFRLGVBRlY7QUFHRSw4QkFBZ0I7QUFIbEIsYUFETSxFQU1OO0FBQ0Usc0JBQVEsVUFEVjtBQUVFLHNCQUFRLGdCQUZWO0FBR0UsOEJBQWdCO0FBSGxCLGFBTk07QUFIVixXQTVCWTtBQVJoQixTQVJZO0FBUmhCLE9BMUJZO0FBUmhCLEtBRlk7QUExQ1QsR0FBUDtBQTBKQyxDQWxLZ0MsRUFBakMsQyxDQW1LQTs7O0FBQ0NEO0FBQUk7QUFBTCxDQUFnQkUsSUFBaEIsR0FBdUIsa0NBQXZCO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkosSUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmbG93XG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKjo6XG5pbXBvcnQgdHlwZSB7IFJlYWRlckZyYWdtZW50IH0gZnJvbSAncmVsYXktcnVudGltZSc7XG50eXBlIGNoZWNrUnVuc0FjY3VtdWxhdG9yX2NoZWNrU3VpdGUkcmVmID0gYW55O1xudHlwZSBjaGVja1N1aXRlVmlld19jaGVja1N1aXRlJHJlZiA9IGFueTtcbmV4cG9ydCB0eXBlIENoZWNrQ29uY2x1c2lvblN0YXRlID0gXCJBQ1RJT05fUkVRVUlSRURcIiB8IFwiQ0FOQ0VMTEVEXCIgfCBcIkZBSUxVUkVcIiB8IFwiTkVVVFJBTFwiIHwgXCJTS0lQUEVEXCIgfCBcIlNUQUxFXCIgfCBcIlNUQVJUVVBfRkFJTFVSRVwiIHwgXCJTVUNDRVNTXCIgfCBcIlRJTUVEX09VVFwiIHwgXCIlZnV0dXJlIGFkZGVkIHZhbHVlXCI7XG5leHBvcnQgdHlwZSBDaGVja1N0YXR1c1N0YXRlID0gXCJDT01QTEVURURcIiB8IFwiSU5fUFJPR1JFU1NcIiB8IFwiUVVFVUVEXCIgfCBcIlJFUVVFU1RFRFwiIHwgXCIlZnV0dXJlIGFkZGVkIHZhbHVlXCI7XG5pbXBvcnQgdHlwZSB7IEZyYWdtZW50UmVmZXJlbmNlIH0gZnJvbSBcInJlbGF5LXJ1bnRpbWVcIjtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdCRmcmFnbWVudFR5cGU6IGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JHJlZjtcbmV4cG9ydCB0eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0ID0ge3xcbiAgK2lkOiBzdHJpbmcsXG4gICtjaGVja1N1aXRlczogP3t8XG4gICAgK3BhZ2VJbmZvOiB7fFxuICAgICAgK2hhc05leHRQYWdlOiBib29sZWFuLFxuICAgICAgK2VuZEN1cnNvcjogP3N0cmluZyxcbiAgICB8fSxcbiAgICArZWRnZXM6ID8kUmVhZE9ubHlBcnJheTw/e3xcbiAgICAgICtjdXJzb3I6IHN0cmluZyxcbiAgICAgICtub2RlOiA/e3xcbiAgICAgICAgK2lkOiBzdHJpbmcsXG4gICAgICAgICtzdGF0dXM6IENoZWNrU3RhdHVzU3RhdGUsXG4gICAgICAgICtjb25jbHVzaW9uOiA/Q2hlY2tDb25jbHVzaW9uU3RhdGUsXG4gICAgICAgICskZnJhZ21lbnRSZWZzOiBjaGVja1N1aXRlVmlld19jaGVja1N1aXRlJHJlZiAmIGNoZWNrUnVuc0FjY3VtdWxhdG9yX2NoZWNrU3VpdGUkcmVmLFxuICAgICAgfH0sXG4gICAgfH0+LFxuICB8fSxcbiAgKyRyZWZUeXBlOiBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdCRyZWYsXG58fTtcbmV4cG9ydCB0eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JGRhdGEgPSBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdDtcbmV4cG9ydCB0eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JGtleSA9IHtcbiAgKyRkYXRhPzogY2hlY2tTdWl0ZXNBY2N1bXVsYXRvcl9jb21taXQkZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0JHJlZixcbn07XG4qL1xuXG5cbmNvbnN0IG5vZGUvKjogUmVhZGVyRnJhZ21lbnQqLyA9IChmdW5jdGlvbigpe1xudmFyIHYwID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcImlkXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcImNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0XCIsXG4gIFwidHlwZVwiOiBcIkNvbW1pdFwiLFxuICBcIm1ldGFkYXRhXCI6IHtcbiAgICBcImNvbm5lY3Rpb25cIjogW1xuICAgICAge1xuICAgICAgICBcImNvdW50XCI6IFwiY2hlY2tTdWl0ZUNvdW50XCIsXG4gICAgICAgIFwiY3Vyc29yXCI6IFwiY2hlY2tTdWl0ZUN1cnNvclwiLFxuICAgICAgICBcImRpcmVjdGlvblwiOiBcImZvcndhcmRcIixcbiAgICAgICAgXCJwYXRoXCI6IFtcbiAgICAgICAgICBcImNoZWNrU3VpdGVzXCJcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMb2NhbEFyZ3VtZW50XCIsXG4gICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlQ291bnRcIixcbiAgICAgIFwidHlwZVwiOiBcIkludCFcIixcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVDdXJzb3JcIixcbiAgICAgIFwidHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5Db3VudFwiLFxuICAgICAgXCJ0eXBlXCI6IFwiSW50IVwiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5DdXJzb3JcIixcbiAgICAgIFwidHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICAgIH1cbiAgXSxcbiAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAodjAvKjogYW55Ki8pLFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IFwiY2hlY2tTdWl0ZXNcIixcbiAgICAgIFwibmFtZVwiOiBcIl9fQ2hlY2tTdWl0ZUFjY3VtdWxhdG9yX2NoZWNrU3VpdGVzX2Nvbm5lY3Rpb25cIixcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIkNoZWNrU3VpdGVDb25uZWN0aW9uXCIsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJwYWdlSW5mb1wiLFxuICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUGFnZUluZm9cIixcbiAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcImhhc05leHRQYWdlXCIsXG4gICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJlbmRDdXJzb3JcIixcbiAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgXCJuYW1lXCI6IFwiZWRnZXNcIixcbiAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIkNoZWNrU3VpdGVFZGdlXCIsXG4gICAgICAgICAgXCJwbHVyYWxcIjogdHJ1ZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcImN1cnNvclwiLFxuICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibm9kZVwiLFxuICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiQ2hlY2tTdWl0ZVwiLFxuICAgICAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAgICAgICAgICAodjAvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJzdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjb25jbHVzaW9uXCIsXG4gICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiX190eXBlbmFtZVwiLFxuICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiRnJhZ21lbnRTcHJlYWRcIixcbiAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVWaWV3X2NoZWNrU3VpdGVcIixcbiAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJGcmFnbWVudFNwcmVhZFwiLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5zQWNjdW11bGF0b3JfY2hlY2tTdWl0ZVwiLFxuICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5Db3VudFwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwidmFyaWFibGVOYW1lXCI6IFwiY2hlY2tSdW5Db3VudFwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrUnVuQ3Vyc29yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJ2YXJpYWJsZU5hbWVcIjogXCJjaGVja1J1bkN1cnNvclwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG59KSgpO1xuLy8gcHJldHRpZXItaWdub3JlXG4obm9kZS8qOiBhbnkqLykuaGFzaCA9ICc1ODJhYmM4MTI3ZjBmMmYxOWZiMGE2YTUzMWFmNWUwNic7XG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG4iXX0=