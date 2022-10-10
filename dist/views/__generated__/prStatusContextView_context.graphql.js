/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type prStatusContextView_context$ref: FragmentReference;
declare export opaque type prStatusContextView_context$fragmentType: prStatusContextView_context$ref;
export type prStatusContextView_context = {|
  +context: string,
  +description: ?string,
  +state: StatusState,
  +targetUrl: ?any,
  +$refType: prStatusContextView_context$ref,
|};
export type prStatusContextView_context$data = prStatusContextView_context;
export type prStatusContextView_context$key = {
  +$data?: prStatusContextView_context$data,
  +$fragmentRefs: prStatusContextView_context$ref,
};
*/

const node
/*: ReaderFragment*/
= {
  "kind": "Fragment",
  "name": "prStatusContextView_context",
  "type": "StatusContext",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [{
    "kind": "ScalarField",
    "alias": null,
    "name": "context",
    "args": null,
    "storageKey": null
  }, {
    "kind": "ScalarField",
    "alias": null,
    "name": "description",
    "args": null,
    "storageKey": null
  }, {
    "kind": "ScalarField",
    "alias": null,
    "name": "state",
    "args": null,
    "storageKey": null
  }, {
    "kind": "ScalarField",
    "alias": null,
    "name": "targetUrl",
    "args": null,
    "storageKey": null
  }]
}; // prettier-ignore

node
/*: any*/
.hash = 'e729074e494e07b59b4a177416eb7a3c';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi92aWV3cy9fX2dlbmVyYXRlZF9fL3ByU3RhdHVzQ29udGV4dFZpZXdfY29udGV4dC5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBLE1BQU1BO0FBQUk7QUFBQSxFQUF1QjtBQUMvQixVQUFRLFVBRHVCO0FBRS9CLFVBQVEsNkJBRnVCO0FBRy9CLFVBQVEsZUFIdUI7QUFJL0IsY0FBWSxJQUptQjtBQUsvQix5QkFBdUIsRUFMUTtBQU0vQixnQkFBYyxDQUNaO0FBQ0UsWUFBUSxhQURWO0FBRUUsYUFBUyxJQUZYO0FBR0UsWUFBUSxTQUhWO0FBSUUsWUFBUSxJQUpWO0FBS0Usa0JBQWM7QUFMaEIsR0FEWSxFQVFaO0FBQ0UsWUFBUSxhQURWO0FBRUUsYUFBUyxJQUZYO0FBR0UsWUFBUSxhQUhWO0FBSUUsWUFBUSxJQUpWO0FBS0Usa0JBQWM7QUFMaEIsR0FSWSxFQWVaO0FBQ0UsWUFBUSxhQURWO0FBRUUsYUFBUyxJQUZYO0FBR0UsWUFBUSxPQUhWO0FBSUUsWUFBUSxJQUpWO0FBS0Usa0JBQWM7QUFMaEIsR0FmWSxFQXNCWjtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsV0FIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBdEJZO0FBTmlCLENBQWpDLEMsQ0FxQ0E7O0FBQ0NBO0FBQUk7QUFBTCxDQUFnQkMsSUFBaEIsR0FBdUIsa0NBQXZCO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkgsSUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmbG93XG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKjo6XG5pbXBvcnQgdHlwZSB7IFJlYWRlckZyYWdtZW50IH0gZnJvbSAncmVsYXktcnVudGltZSc7XG5leHBvcnQgdHlwZSBTdGF0dXNTdGF0ZSA9IFwiRVJST1JcIiB8IFwiRVhQRUNURURcIiB8IFwiRkFJTFVSRVwiIHwgXCJQRU5ESU5HXCIgfCBcIlNVQ0NFU1NcIiB8IFwiJWZ1dHVyZSBhZGRlZCB2YWx1ZVwiO1xuaW1wb3J0IHR5cGUgeyBGcmFnbWVudFJlZmVyZW5jZSB9IGZyb20gXCJyZWxheS1ydW50aW1lXCI7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQkcmVmOiBGcmFnbWVudFJlZmVyZW5jZTtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIHByU3RhdHVzQ29udGV4dFZpZXdfY29udGV4dCRmcmFnbWVudFR5cGU6IHByU3RhdHVzQ29udGV4dFZpZXdfY29udGV4dCRyZWY7XG5leHBvcnQgdHlwZSBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQgPSB7fFxuICArY29udGV4dDogc3RyaW5nLFxuICArZGVzY3JpcHRpb246ID9zdHJpbmcsXG4gICtzdGF0ZTogU3RhdHVzU3RhdGUsXG4gICt0YXJnZXRVcmw6ID9hbnksXG4gICskcmVmVHlwZTogcHJTdGF0dXNDb250ZXh0Vmlld19jb250ZXh0JHJlZixcbnx9O1xuZXhwb3J0IHR5cGUgcHJTdGF0dXNDb250ZXh0Vmlld19jb250ZXh0JGRhdGEgPSBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQ7XG5leHBvcnQgdHlwZSBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQka2V5ID0ge1xuICArJGRhdGE/OiBwclN0YXR1c0NvbnRleHRWaWV3X2NvbnRleHQkZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IHByU3RhdHVzQ29udGV4dFZpZXdfY29udGV4dCRyZWYsXG59O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcInByU3RhdHVzQ29udGV4dFZpZXdfY29udGV4dFwiLFxuICBcInR5cGVcIjogXCJTdGF0dXNDb250ZXh0XCIsXG4gIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJjb250ZXh0XCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiZGVzY3JpcHRpb25cIixcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJzdGF0ZVwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcInRhcmdldFVybFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH1cbiAgXVxufTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnZTcyOTA3NGU0OTRlMDdiNTliNGExNzc0MTZlYjdhM2MnO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19