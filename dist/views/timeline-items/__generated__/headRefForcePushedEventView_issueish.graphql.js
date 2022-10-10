/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type headRefForcePushedEventView_issueish$ref: FragmentReference;
declare export opaque type headRefForcePushedEventView_issueish$fragmentType: headRefForcePushedEventView_issueish$ref;
export type headRefForcePushedEventView_issueish = {|
  +headRefName: string,
  +headRepositoryOwner: ?{|
    +login: string
  |},
  +repository: {|
    +owner: {|
      +login: string
    |}
  |},
  +$refType: headRefForcePushedEventView_issueish$ref,
|};
export type headRefForcePushedEventView_issueish$data = headRefForcePushedEventView_issueish;
export type headRefForcePushedEventView_issueish$key = {
  +$data?: headRefForcePushedEventView_issueish$data,
  +$fragmentRefs: headRefForcePushedEventView_issueish$ref,
};
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = [{
    "kind": "ScalarField",
    "alias": null,
    "name": "login",
    "args": null,
    "storageKey": null
  }];
  return {
    "kind": "Fragment",
    "name": "headRefForcePushedEventView_issueish",
    "type": "PullRequest",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [{
      "kind": "ScalarField",
      "alias": null,
      "name": "headRefName",
      "args": null,
      "storageKey": null
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "headRepositoryOwner",
      "storageKey": null,
      "args": null,
      "concreteType": null,
      "plural": false,
      "selections": v0
      /*: any*/

    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "repository",
      "storageKey": null,
      "args": null,
      "concreteType": "Repository",
      "plural": false,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "owner",
        "storageKey": null,
        "args": null,
        "concreteType": null,
        "plural": false,
        "selections": v0
        /*: any*/

      }]
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '4c639070afc4a02cedf062d836d0dd7f';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi92aWV3cy90aW1lbGluZS1pdGVtcy9fX2dlbmVyYXRlZF9fL2hlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pc3N1ZWlzaC5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJ2MCIsImhhc2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztBQUlBO0FBRUE7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBLE1BQU1BO0FBQUk7QUFBQSxFQUF3QixZQUFVO0FBQzVDLE1BQUlDLEVBQUUsR0FBRyxDQUNQO0FBQ0UsWUFBUSxhQURWO0FBRUUsYUFBUyxJQUZYO0FBR0UsWUFBUSxPQUhWO0FBSUUsWUFBUSxJQUpWO0FBS0Usa0JBQWM7QUFMaEIsR0FETyxDQUFUO0FBU0EsU0FBTztBQUNMLFlBQVEsVUFESDtBQUVMLFlBQVEsc0NBRkg7QUFHTCxZQUFRLGFBSEg7QUFJTCxnQkFBWSxJQUpQO0FBS0wsMkJBQXVCLEVBTGxCO0FBTUwsa0JBQWMsQ0FDWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsYUFIVjtBQUlFLGNBQVEsSUFKVjtBQUtFLG9CQUFjO0FBTGhCLEtBRFksRUFRWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEscUJBSFY7QUFJRSxvQkFBYyxJQUpoQjtBQUtFLGNBQVEsSUFMVjtBQU1FLHNCQUFnQixJQU5sQjtBQU9FLGdCQUFVLEtBUFo7QUFRRSxvQkFBZUE7QUFBRTs7QUFSbkIsS0FSWSxFQWtCWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsWUFIVjtBQUlFLG9CQUFjLElBSmhCO0FBS0UsY0FBUSxJQUxWO0FBTUUsc0JBQWdCLFlBTmxCO0FBT0UsZ0JBQVUsS0FQWjtBQVFFLG9CQUFjLENBQ1o7QUFDRSxnQkFBUSxhQURWO0FBRUUsaUJBQVMsSUFGWDtBQUdFLGdCQUFRLE9BSFY7QUFJRSxzQkFBYyxJQUpoQjtBQUtFLGdCQUFRLElBTFY7QUFNRSx3QkFBZ0IsSUFObEI7QUFPRSxrQkFBVSxLQVBaO0FBUUUsc0JBQWVBO0FBQUU7O0FBUm5CLE9BRFk7QUFSaEIsS0FsQlk7QUFOVCxHQUFQO0FBK0NDLENBekRnQyxFQUFqQyxDLENBMERBOzs7QUFDQ0Q7QUFBSTtBQUFMLENBQWdCRSxJQUFoQixHQUF1QixrQ0FBdkI7QUFDQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSixJQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZsb3dcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qOjpcbmltcG9ydCB0eXBlIHsgUmVhZGVyRnJhZ21lbnQgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbmltcG9ydCB0eXBlIHsgRnJhZ21lbnRSZWZlcmVuY2UgfSBmcm9tIFwicmVsYXktcnVudGltZVwiO1xuZGVjbGFyZSBleHBvcnQgb3BhcXVlIHR5cGUgaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2lzc3VlaXNoJHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXNzdWVpc2gkZnJhZ21lbnRUeXBlOiBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXNzdWVpc2gkcmVmO1xuZXhwb3J0IHR5cGUgaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2lzc3VlaXNoID0ge3xcbiAgK2hlYWRSZWZOYW1lOiBzdHJpbmcsXG4gICtoZWFkUmVwb3NpdG9yeU93bmVyOiA/e3xcbiAgICArbG9naW46IHN0cmluZ1xuICB8fSxcbiAgK3JlcG9zaXRvcnk6IHt8XG4gICAgK293bmVyOiB7fFxuICAgICAgK2xvZ2luOiBzdHJpbmdcbiAgICB8fVxuICB8fSxcbiAgKyRyZWZUeXBlOiBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXNzdWVpc2gkcmVmLFxufH07XG5leHBvcnQgdHlwZSBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXNzdWVpc2gkZGF0YSA9IGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pc3N1ZWlzaDtcbmV4cG9ydCB0eXBlIGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pc3N1ZWlzaCRrZXkgPSB7XG4gICskZGF0YT86IGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pc3N1ZWlzaCRkYXRhLFxuICArJGZyYWdtZW50UmVmczogaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2lzc3VlaXNoJHJlZixcbn07XG4qL1xuXG5cbmNvbnN0IG5vZGUvKjogUmVhZGVyRnJhZ21lbnQqLyA9IChmdW5jdGlvbigpe1xudmFyIHYwID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwibG9naW5cIixcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICB9XG5dO1xucmV0dXJuIHtcbiAgXCJraW5kXCI6IFwiRnJhZ21lbnRcIixcbiAgXCJuYW1lXCI6IFwiaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2lzc3VlaXNoXCIsXG4gIFwidHlwZVwiOiBcIlB1bGxSZXF1ZXN0XCIsXG4gIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJoZWFkUmVmTmFtZVwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImhlYWRSZXBvc2l0b3J5T3duZXJcIixcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcImNvbmNyZXRlVHlwZVwiOiBudWxsLFxuICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICBcInNlbGVjdGlvbnNcIjogKHYwLyo6IGFueSovKVxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcInJlcG9zaXRvcnlcIixcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIlJlcG9zaXRvcnlcIixcbiAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgIFwibmFtZVwiOiBcIm93bmVyXCIsXG4gICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogKHYwLyo6IGFueSovKVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnNGM2MzkwNzBhZmM0YTAyY2VkZjA2MmQ4MzZkMGRkN2YnO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19