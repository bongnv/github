/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type headRefForcePushedEventView_item$ref: FragmentReference;
declare export opaque type headRefForcePushedEventView_item$fragmentType: headRefForcePushedEventView_item$ref;
export type headRefForcePushedEventView_item = {|
  +actor: ?{|
    +avatarUrl: any,
    +login: string,
  |},
  +beforeCommit: ?{|
    +oid: any
  |},
  +afterCommit: ?{|
    +oid: any
  |},
  +createdAt: any,
  +$refType: headRefForcePushedEventView_item$ref,
|};
export type headRefForcePushedEventView_item$data = headRefForcePushedEventView_item;
export type headRefForcePushedEventView_item$key = {
  +$data?: headRefForcePushedEventView_item$data,
  +$fragmentRefs: headRefForcePushedEventView_item$ref,
};
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = [{
    "kind": "ScalarField",
    "alias": null,
    "name": "oid",
    "args": null,
    "storageKey": null
  }];
  return {
    "kind": "Fragment",
    "name": "headRefForcePushedEventView_item",
    "type": "HeadRefForcePushedEvent",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [{
      "kind": "LinkedField",
      "alias": null,
      "name": "actor",
      "storageKey": null,
      "args": null,
      "concreteType": null,
      "plural": false,
      "selections": [{
        "kind": "ScalarField",
        "alias": null,
        "name": "avatarUrl",
        "args": null,
        "storageKey": null
      }, {
        "kind": "ScalarField",
        "alias": null,
        "name": "login",
        "args": null,
        "storageKey": null
      }]
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "beforeCommit",
      "storageKey": null,
      "args": null,
      "concreteType": "Commit",
      "plural": false,
      "selections": v0
      /*: any*/

    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "afterCommit",
      "storageKey": null,
      "args": null,
      "concreteType": "Commit",
      "plural": false,
      "selections": v0
      /*: any*/

    }, {
      "kind": "ScalarField",
      "alias": null,
      "name": "createdAt",
      "args": null,
      "storageKey": null
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = 'fc403545674c57c1997c870805101ffb';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi92aWV3cy90aW1lbGluZS1pdGVtcy9fX2dlbmVyYXRlZF9fL2hlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtLmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwiaGFzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FBSUE7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQSxNQUFNQTtBQUFJO0FBQUEsRUFBd0IsWUFBVTtBQUM1QyxNQUFJQyxFQUFFLEdBQUcsQ0FDUDtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsS0FIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBRE8sQ0FBVDtBQVNBLFNBQU87QUFDTCxZQUFRLFVBREg7QUFFTCxZQUFRLGtDQUZIO0FBR0wsWUFBUSx5QkFISDtBQUlMLGdCQUFZLElBSlA7QUFLTCwyQkFBdUIsRUFMbEI7QUFNTCxrQkFBYyxDQUNaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxJQUZYO0FBR0UsY0FBUSxPQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsSUFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWMsQ0FDWjtBQUNFLGdCQUFRLGFBRFY7QUFFRSxpQkFBUyxJQUZYO0FBR0UsZ0JBQVEsV0FIVjtBQUlFLGdCQUFRLElBSlY7QUFLRSxzQkFBYztBQUxoQixPQURZLEVBUVo7QUFDRSxnQkFBUSxhQURWO0FBRUUsaUJBQVMsSUFGWDtBQUdFLGdCQUFRLE9BSFY7QUFJRSxnQkFBUSxJQUpWO0FBS0Usc0JBQWM7QUFMaEIsT0FSWTtBQVJoQixLQURZLEVBMEJaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxJQUZYO0FBR0UsY0FBUSxjQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsUUFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWVBO0FBQUU7O0FBUm5CLEtBMUJZLEVBb0NaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxJQUZYO0FBR0UsY0FBUSxhQUhWO0FBSUUsb0JBQWMsSUFKaEI7QUFLRSxjQUFRLElBTFY7QUFNRSxzQkFBZ0IsUUFObEI7QUFPRSxnQkFBVSxLQVBaO0FBUUUsb0JBQWVBO0FBQUU7O0FBUm5CLEtBcENZLEVBOENaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxJQUZYO0FBR0UsY0FBUSxXQUhWO0FBSUUsY0FBUSxJQUpWO0FBS0Usb0JBQWM7QUFMaEIsS0E5Q1k7QUFOVCxHQUFQO0FBNkRDLENBdkVnQyxFQUFqQyxDLENBd0VBOzs7QUFDQ0Q7QUFBSTtBQUFMLENBQWdCRSxJQUFoQixHQUF1QixrQ0FBdkI7QUFDQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSixJQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZsb3dcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qOjpcbmltcG9ydCB0eXBlIHsgUmVhZGVyRnJhZ21lbnQgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbmltcG9ydCB0eXBlIHsgRnJhZ21lbnRSZWZlcmVuY2UgfSBmcm9tIFwicmVsYXktcnVudGltZVwiO1xuZGVjbGFyZSBleHBvcnQgb3BhcXVlIHR5cGUgaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2l0ZW0kcmVmOiBGcmFnbWVudFJlZmVyZW5jZTtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtJGZyYWdtZW50VHlwZTogaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2l0ZW0kcmVmO1xuZXhwb3J0IHR5cGUgaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2l0ZW0gPSB7fFxuICArYWN0b3I6ID97fFxuICAgICthdmF0YXJVcmw6IGFueSxcbiAgICArbG9naW46IHN0cmluZyxcbiAgfH0sXG4gICtiZWZvcmVDb21taXQ6ID97fFxuICAgICtvaWQ6IGFueVxuICB8fSxcbiAgK2FmdGVyQ29tbWl0OiA/e3xcbiAgICArb2lkOiBhbnlcbiAgfH0sXG4gICtjcmVhdGVkQXQ6IGFueSxcbiAgKyRyZWZUeXBlOiBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXRlbSRyZWYsXG58fTtcbmV4cG9ydCB0eXBlIGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtJGRhdGEgPSBoZWFkUmVmRm9yY2VQdXNoZWRFdmVudFZpZXdfaXRlbTtcbmV4cG9ydCB0eXBlIGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtJGtleSA9IHtcbiAgKyRkYXRhPzogaGVhZFJlZkZvcmNlUHVzaGVkRXZlbnRWaWV3X2l0ZW0kZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IGhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtJHJlZixcbn07XG4qL1xuXG5cbmNvbnN0IG5vZGUvKjogUmVhZGVyRnJhZ21lbnQqLyA9IChmdW5jdGlvbigpe1xudmFyIHYwID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwib2lkXCIsXG4gICAgXCJhcmdzXCI6IG51bGwsXG4gICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgfVxuXTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcImhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50Vmlld19pdGVtXCIsXG4gIFwidHlwZVwiOiBcIkhlYWRSZWZGb3JjZVB1c2hlZEV2ZW50XCIsXG4gIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJhY3RvclwiLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwiY29uY3JldGVUeXBlXCI6IG51bGwsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJhdmF0YXJVcmxcIixcbiAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgXCJuYW1lXCI6IFwibG9naW5cIixcbiAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiYmVmb3JlQ29tbWl0XCIsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJDb21taXRcIixcbiAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgXCJzZWxlY3Rpb25zXCI6ICh2MC8qOiBhbnkqLylcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJhZnRlckNvbW1pdFwiLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiQ29tbWl0XCIsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiAodjAvKjogYW55Ki8pXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiY3JlYXRlZEF0XCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfVxuICBdXG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnZmM0MDM1NDU2NzRjNTdjMTk5N2M4NzA4MDUxMDFmZmInO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19