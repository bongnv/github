/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type userMentionTooltipContainer_repositoryOwner$ref: FragmentReference;
declare export opaque type userMentionTooltipContainer_repositoryOwner$fragmentType: userMentionTooltipContainer_repositoryOwner$ref;
export type userMentionTooltipContainer_repositoryOwner = {|
  +login: string,
  +avatarUrl: any,
  +repositories: {|
    +totalCount: number
  |},
  +company?: ?string,
  +membersWithRole?: {|
    +totalCount: number
  |},
  +$refType: userMentionTooltipContainer_repositoryOwner$ref,
|};
export type userMentionTooltipContainer_repositoryOwner$data = userMentionTooltipContainer_repositoryOwner;
export type userMentionTooltipContainer_repositoryOwner$key = {
  +$data?: userMentionTooltipContainer_repositoryOwner$data,
  +$fragmentRefs: userMentionTooltipContainer_repositoryOwner$ref,
};
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = [{
    "kind": "ScalarField",
    "alias": null,
    "name": "totalCount",
    "args": null,
    "storageKey": null
  }];
  return {
    "kind": "Fragment",
    "name": "userMentionTooltipContainer_repositoryOwner",
    "type": "RepositoryOwner",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [{
      "kind": "ScalarField",
      "alias": null,
      "name": "login",
      "args": null,
      "storageKey": null
    }, {
      "kind": "ScalarField",
      "alias": null,
      "name": "avatarUrl",
      "args": null,
      "storageKey": null
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "repositories",
      "storageKey": null,
      "args": null,
      "concreteType": "RepositoryConnection",
      "plural": false,
      "selections": v0
      /*: any*/

    }, {
      "kind": "InlineFragment",
      "type": "User",
      "selections": [{
        "kind": "ScalarField",
        "alias": null,
        "name": "company",
        "args": null,
        "storageKey": null
      }]
    }, {
      "kind": "InlineFragment",
      "type": "Organization",
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "membersWithRole",
        "storageKey": null,
        "args": null,
        "concreteType": "OrganizationMemberConnection",
        "plural": false,
        "selections": v0
        /*: any*/

      }]
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '3ee858460adcfbee1dfc27cf8dc46332';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250YWluZXJzL19fZ2VuZXJhdGVkX18vdXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lci5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJ2MCIsImhhc2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztBQUlBO0FBRUE7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBLE1BQU1BO0FBQUk7QUFBQSxFQUF3QixZQUFVO0FBQzVDLE1BQUlDLEVBQUUsR0FBRyxDQUNQO0FBQ0UsWUFBUSxhQURWO0FBRUUsYUFBUyxJQUZYO0FBR0UsWUFBUSxZQUhWO0FBSUUsWUFBUSxJQUpWO0FBS0Usa0JBQWM7QUFMaEIsR0FETyxDQUFUO0FBU0EsU0FBTztBQUNMLFlBQVEsVUFESDtBQUVMLFlBQVEsNkNBRkg7QUFHTCxZQUFRLGlCQUhIO0FBSUwsZ0JBQVksSUFKUDtBQUtMLDJCQUF1QixFQUxsQjtBQU1MLGtCQUFjLENBQ1o7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLE9BSFY7QUFJRSxjQUFRLElBSlY7QUFLRSxvQkFBYztBQUxoQixLQURZLEVBUVo7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLFdBSFY7QUFJRSxjQUFRLElBSlY7QUFLRSxvQkFBYztBQUxoQixLQVJZLEVBZVo7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLGNBSFY7QUFJRSxvQkFBYyxJQUpoQjtBQUtFLGNBQVEsSUFMVjtBQU1FLHNCQUFnQixzQkFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWVBO0FBQUU7O0FBUm5CLEtBZlksRUF5Qlo7QUFDRSxjQUFRLGdCQURWO0FBRUUsY0FBUSxNQUZWO0FBR0Usb0JBQWMsQ0FDWjtBQUNFLGdCQUFRLGFBRFY7QUFFRSxpQkFBUyxJQUZYO0FBR0UsZ0JBQVEsU0FIVjtBQUlFLGdCQUFRLElBSlY7QUFLRSxzQkFBYztBQUxoQixPQURZO0FBSGhCLEtBekJZLEVBc0NaO0FBQ0UsY0FBUSxnQkFEVjtBQUVFLGNBQVEsY0FGVjtBQUdFLG9CQUFjLENBQ1o7QUFDRSxnQkFBUSxhQURWO0FBRUUsaUJBQVMsSUFGWDtBQUdFLGdCQUFRLGlCQUhWO0FBSUUsc0JBQWMsSUFKaEI7QUFLRSxnQkFBUSxJQUxWO0FBTUUsd0JBQWdCLDhCQU5sQjtBQU9FLGtCQUFVLEtBUFo7QUFRRSxzQkFBZUE7QUFBRTs7QUFSbkIsT0FEWTtBQUhoQixLQXRDWTtBQU5ULEdBQVA7QUE4REMsQ0F4RWdDLEVBQWpDLEMsQ0F5RUE7OztBQUNDRDtBQUFJO0FBQUwsQ0FBZ0JFLElBQWhCLEdBQXVCLGtDQUF2QjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJKLElBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmxvd1xuICovXG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyo6OlxuaW1wb3J0IHR5cGUgeyBSZWFkZXJGcmFnbWVudCB9IGZyb20gJ3JlbGF5LXJ1bnRpbWUnO1xuaW1wb3J0IHR5cGUgeyBGcmFnbWVudFJlZmVyZW5jZSB9IGZyb20gXCJyZWxheS1ydW50aW1lXCI7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSB1c2VyTWVudGlvblRvb2x0aXBDb250YWluZXJfcmVwb3NpdG9yeU93bmVyJHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSB1c2VyTWVudGlvblRvb2x0aXBDb250YWluZXJfcmVwb3NpdG9yeU93bmVyJGZyYWdtZW50VHlwZTogdXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lciRyZWY7XG5leHBvcnQgdHlwZSB1c2VyTWVudGlvblRvb2x0aXBDb250YWluZXJfcmVwb3NpdG9yeU93bmVyID0ge3xcbiAgK2xvZ2luOiBzdHJpbmcsXG4gICthdmF0YXJVcmw6IGFueSxcbiAgK3JlcG9zaXRvcmllczoge3xcbiAgICArdG90YWxDb3VudDogbnVtYmVyXG4gIHx9LFxuICArY29tcGFueT86ID9zdHJpbmcsXG4gICttZW1iZXJzV2l0aFJvbGU/OiB7fFxuICAgICt0b3RhbENvdW50OiBudW1iZXJcbiAgfH0sXG4gICskcmVmVHlwZTogdXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lciRyZWYsXG58fTtcbmV4cG9ydCB0eXBlIHVzZXJNZW50aW9uVG9vbHRpcENvbnRhaW5lcl9yZXBvc2l0b3J5T3duZXIkZGF0YSA9IHVzZXJNZW50aW9uVG9vbHRpcENvbnRhaW5lcl9yZXBvc2l0b3J5T3duZXI7XG5leHBvcnQgdHlwZSB1c2VyTWVudGlvblRvb2x0aXBDb250YWluZXJfcmVwb3NpdG9yeU93bmVyJGtleSA9IHtcbiAgKyRkYXRhPzogdXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lciRkYXRhLFxuICArJGZyYWdtZW50UmVmczogdXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lciRyZWYsXG59O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSAoZnVuY3Rpb24oKXtcbnZhciB2MCA9IFtcbiAge1xuICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgXCJhbGlhc1wiOiBudWxsLFxuICAgIFwibmFtZVwiOiBcInRvdGFsQ291bnRcIixcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICB9XG5dO1xucmV0dXJuIHtcbiAgXCJraW5kXCI6IFwiRnJhZ21lbnRcIixcbiAgXCJuYW1lXCI6IFwidXNlck1lbnRpb25Ub29sdGlwQ29udGFpbmVyX3JlcG9zaXRvcnlPd25lclwiLFxuICBcInR5cGVcIjogXCJSZXBvc2l0b3J5T3duZXJcIixcbiAgXCJtZXRhZGF0YVwiOiBudWxsLFxuICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogW10sXG4gIFwic2VsZWN0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImxvZ2luXCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiYXZhdGFyVXJsXCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwicmVwb3NpdG9yaWVzXCIsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJSZXBvc2l0b3J5Q29ubmVjdGlvblwiLFxuICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICBcInNlbGVjdGlvbnNcIjogKHYwLyo6IGFueSovKVxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiSW5saW5lRnJhZ21lbnRcIixcbiAgICAgIFwidHlwZVwiOiBcIlVzZXJcIixcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJjb21wYW55XCIsXG4gICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiSW5saW5lRnJhZ21lbnRcIixcbiAgICAgIFwidHlwZVwiOiBcIk9yZ2FuaXphdGlvblwiLFxuICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgIFwibmFtZVwiOiBcIm1lbWJlcnNXaXRoUm9sZVwiLFxuICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiT3JnYW5pemF0aW9uTWVtYmVyQ29ubmVjdGlvblwiLFxuICAgICAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiAodjAvKjogYW55Ki8pXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG59KSgpO1xuLy8gcHJldHRpZXItaWdub3JlXG4obm9kZS8qOiBhbnkqLykuaGFzaCA9ICczZWU4NTg0NjBhZGNmYmVlMWRmYzI3Y2Y4ZGM0NjMzMic7XG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG4iXX0=