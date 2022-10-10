/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type commentDecorationsController_pullRequests$ref: FragmentReference;
declare export opaque type commentDecorationsController_pullRequests$fragmentType: commentDecorationsController_pullRequests$ref;
export type commentDecorationsController_pullRequests = $ReadOnlyArray<{|
  +number: number,
  +headRefName: string,
  +headRefOid: any,
  +headRepository: ?{|
    +name: string,
    +owner: {|
      +login: string
    |},
  |},
  +repository: {|
    +name: string,
    +owner: {|
      +login: string
    |},
  |},
  +$refType: commentDecorationsController_pullRequests$ref,
|}>;
export type commentDecorationsController_pullRequests$data = commentDecorationsController_pullRequests;
export type commentDecorationsController_pullRequests$key = $ReadOnlyArray<{
  +$data?: commentDecorationsController_pullRequests$data,
  +$fragmentRefs: commentDecorationsController_pullRequests$ref,
}>;
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = [{
    "kind": "ScalarField",
    "alias": null,
    "name": "name",
    "args": null,
    "storageKey": null
  }, {
    "kind": "LinkedField",
    "alias": null,
    "name": "owner",
    "storageKey": null,
    "args": null,
    "concreteType": null,
    "plural": false,
    "selections": [{
      "kind": "ScalarField",
      "alias": null,
      "name": "login",
      "args": null,
      "storageKey": null
    }]
  }];
  return {
    "kind": "Fragment",
    "name": "commentDecorationsController_pullRequests",
    "type": "PullRequest",
    "metadata": {
      "plural": true
    },
    "argumentDefinitions": [],
    "selections": [{
      "kind": "ScalarField",
      "alias": null,
      "name": "number",
      "args": null,
      "storageKey": null
    }, {
      "kind": "ScalarField",
      "alias": null,
      "name": "headRefName",
      "args": null,
      "storageKey": null
    }, {
      "kind": "ScalarField",
      "alias": null,
      "name": "headRefOid",
      "args": null,
      "storageKey": null
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "headRepository",
      "storageKey": null,
      "args": null,
      "concreteType": "Repository",
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
      "selections": v0
      /*: any*/

    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '62f96ccd13dfc2649112a7b4afaf4ba2';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250cm9sbGVycy9fX2dlbmVyYXRlZF9fL2NvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzLmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwiaGFzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FBSUE7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQkEsTUFBTUE7QUFBSTtBQUFBLEVBQXdCLFlBQVU7QUFDNUMsTUFBSUMsRUFBRSxHQUFHLENBQ1A7QUFDRSxZQUFRLGFBRFY7QUFFRSxhQUFTLElBRlg7QUFHRSxZQUFRLE1BSFY7QUFJRSxZQUFRLElBSlY7QUFLRSxrQkFBYztBQUxoQixHQURPLEVBUVA7QUFDRSxZQUFRLGFBRFY7QUFFRSxhQUFTLElBRlg7QUFHRSxZQUFRLE9BSFY7QUFJRSxrQkFBYyxJQUpoQjtBQUtFLFlBQVEsSUFMVjtBQU1FLG9CQUFnQixJQU5sQjtBQU9FLGNBQVUsS0FQWjtBQVFFLGtCQUFjLENBQ1o7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLE9BSFY7QUFJRSxjQUFRLElBSlY7QUFLRSxvQkFBYztBQUxoQixLQURZO0FBUmhCLEdBUk8sQ0FBVDtBQTJCQSxTQUFPO0FBQ0wsWUFBUSxVQURIO0FBRUwsWUFBUSwyQ0FGSDtBQUdMLFlBQVEsYUFISDtBQUlMLGdCQUFZO0FBQ1YsZ0JBQVU7QUFEQSxLQUpQO0FBT0wsMkJBQXVCLEVBUGxCO0FBUUwsa0JBQWMsQ0FDWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsUUFIVjtBQUlFLGNBQVEsSUFKVjtBQUtFLG9CQUFjO0FBTGhCLEtBRFksRUFRWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsYUFIVjtBQUlFLGNBQVEsSUFKVjtBQUtFLG9CQUFjO0FBTGhCLEtBUlksRUFlWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsWUFIVjtBQUlFLGNBQVEsSUFKVjtBQUtFLG9CQUFjO0FBTGhCLEtBZlksRUFzQlo7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLGdCQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsWUFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWVBO0FBQUU7O0FBUm5CLEtBdEJZLEVBZ0NaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxJQUZYO0FBR0UsY0FBUSxZQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsWUFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWVBO0FBQUU7O0FBUm5CLEtBaENZO0FBUlQsR0FBUDtBQW9EQyxDQWhGZ0MsRUFBakMsQyxDQWlGQTs7O0FBQ0NEO0FBQUk7QUFBTCxDQUFnQkUsSUFBaEIsR0FBdUIsa0NBQXZCO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkosSUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmbG93XG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKjo6XG5pbXBvcnQgdHlwZSB7IFJlYWRlckZyYWdtZW50IH0gZnJvbSAncmVsYXktcnVudGltZSc7XG5pbXBvcnQgdHlwZSB7IEZyYWdtZW50UmVmZXJlbmNlIH0gZnJvbSBcInJlbGF5LXJ1bnRpbWVcIjtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBjb21tZW50RGVjb3JhdGlvbnNDb250cm9sbGVyX3B1bGxSZXF1ZXN0cyRmcmFnbWVudFR5cGU6IGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJHJlZjtcbmV4cG9ydCB0eXBlIGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzID0gJFJlYWRPbmx5QXJyYXk8e3xcbiAgK251bWJlcjogbnVtYmVyLFxuICAraGVhZFJlZk5hbWU6IHN0cmluZyxcbiAgK2hlYWRSZWZPaWQ6IGFueSxcbiAgK2hlYWRSZXBvc2l0b3J5OiA/e3xcbiAgICArbmFtZTogc3RyaW5nLFxuICAgICtvd25lcjoge3xcbiAgICAgICtsb2dpbjogc3RyaW5nXG4gICAgfH0sXG4gIHx9LFxuICArcmVwb3NpdG9yeToge3xcbiAgICArbmFtZTogc3RyaW5nLFxuICAgICtvd25lcjoge3xcbiAgICAgICtsb2dpbjogc3RyaW5nXG4gICAgfH0sXG4gIHx9LFxuICArJHJlZlR5cGU6IGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJHJlZixcbnx9PjtcbmV4cG9ydCB0eXBlIGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJGRhdGEgPSBjb21tZW50RGVjb3JhdGlvbnNDb250cm9sbGVyX3B1bGxSZXF1ZXN0cztcbmV4cG9ydCB0eXBlIGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJGtleSA9ICRSZWFkT25seUFycmF5PHtcbiAgKyRkYXRhPzogY29tbWVudERlY29yYXRpb25zQ29udHJvbGxlcl9wdWxsUmVxdWVzdHMkZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IGNvbW1lbnREZWNvcmF0aW9uc0NvbnRyb2xsZXJfcHVsbFJlcXVlc3RzJHJlZixcbn0+O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSAoZnVuY3Rpb24oKXtcbnZhciB2MCA9IFtcbiAge1xuICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgXCJhbGlhc1wiOiBudWxsLFxuICAgIFwibmFtZVwiOiBcIm5hbWVcIixcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICB9LFxuICB7XG4gICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwib3duZXJcIixcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcImNvbmNyZXRlVHlwZVwiOiBudWxsLFxuICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgXCJuYW1lXCI6IFwibG9naW5cIixcbiAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICB9XG4gICAgXVxuICB9XG5dO1xucmV0dXJuIHtcbiAgXCJraW5kXCI6IFwiRnJhZ21lbnRcIixcbiAgXCJuYW1lXCI6IFwiY29tbWVudERlY29yYXRpb25zQ29udHJvbGxlcl9wdWxsUmVxdWVzdHNcIixcbiAgXCJ0eXBlXCI6IFwiUHVsbFJlcXVlc3RcIixcbiAgXCJtZXRhZGF0YVwiOiB7XG4gICAgXCJwbHVyYWxcIjogdHJ1ZVxuICB9LFxuICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogW10sXG4gIFwic2VsZWN0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcIm51bWJlclwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImhlYWRSZWZOYW1lXCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiaGVhZFJlZk9pZFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImhlYWRSZXBvc2l0b3J5XCIsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJSZXBvc2l0b3J5XCIsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiAodjAvKjogYW55Ki8pXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwicmVwb3NpdG9yeVwiLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUmVwb3NpdG9yeVwiLFxuICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICBcInNlbGVjdGlvbnNcIjogKHYwLyo6IGFueSovKVxuICAgIH1cbiAgXVxufTtcbn0pKCk7XG4vLyBwcmV0dGllci1pZ25vcmVcbihub2RlLyo6IGFueSovKS5oYXNoID0gJzYyZjk2Y2NkMTNkZmMyNjQ5MTEyYTdiNGFmYWY0YmEyJztcbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcbiJdfQ==