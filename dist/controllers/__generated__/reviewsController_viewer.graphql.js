/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type reviewsController_viewer$ref: FragmentReference;
declare export opaque type reviewsController_viewer$fragmentType: reviewsController_viewer$ref;
export type reviewsController_viewer = {|
  +id: string,
  +login: string,
  +avatarUrl: any,
  +$refType: reviewsController_viewer$ref,
|};
export type reviewsController_viewer$data = reviewsController_viewer;
export type reviewsController_viewer$key = {
  +$data?: reviewsController_viewer$data,
  +$fragmentRefs: reviewsController_viewer$ref,
};
*/

const node
/*: ReaderFragment*/
= {
  "kind": "Fragment",
  "name": "reviewsController_viewer",
  "type": "User",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [{
    "kind": "ScalarField",
    "alias": null,
    "name": "id",
    "args": null,
    "storageKey": null
  }, {
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
  }]
}; // prettier-ignore

node
/*: any*/
.hash = 'e9e4cf88f2d8a809620a0f225d502896';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250cm9sbGVycy9fX2dlbmVyYXRlZF9fL3Jldmlld3NDb250cm9sbGVyX3ZpZXdlci5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxNQUFNQTtBQUFJO0FBQUEsRUFBdUI7QUFDL0IsVUFBUSxVQUR1QjtBQUUvQixVQUFRLDBCQUZ1QjtBQUcvQixVQUFRLE1BSHVCO0FBSS9CLGNBQVksSUFKbUI7QUFLL0IseUJBQXVCLEVBTFE7QUFNL0IsZ0JBQWMsQ0FDWjtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsSUFIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBRFksRUFRWjtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsT0FIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBUlksRUFlWjtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsV0FIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBZlk7QUFOaUIsQ0FBakMsQyxDQThCQTs7QUFDQ0E7QUFBSTtBQUFMLENBQWdCQyxJQUFoQixHQUF1QixrQ0FBdkI7QUFDQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSCxJQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZsb3dcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qOjpcbmltcG9ydCB0eXBlIHsgUmVhZGVyRnJhZ21lbnQgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbmltcG9ydCB0eXBlIHsgRnJhZ21lbnRSZWZlcmVuY2UgfSBmcm9tIFwicmVsYXktcnVudGltZVwiO1xuZGVjbGFyZSBleHBvcnQgb3BhcXVlIHR5cGUgcmV2aWV3c0NvbnRyb2xsZXJfdmlld2VyJHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSByZXZpZXdzQ29udHJvbGxlcl92aWV3ZXIkZnJhZ21lbnRUeXBlOiByZXZpZXdzQ29udHJvbGxlcl92aWV3ZXIkcmVmO1xuZXhwb3J0IHR5cGUgcmV2aWV3c0NvbnRyb2xsZXJfdmlld2VyID0ge3xcbiAgK2lkOiBzdHJpbmcsXG4gICtsb2dpbjogc3RyaW5nLFxuICArYXZhdGFyVXJsOiBhbnksXG4gICskcmVmVHlwZTogcmV2aWV3c0NvbnRyb2xsZXJfdmlld2VyJHJlZixcbnx9O1xuZXhwb3J0IHR5cGUgcmV2aWV3c0NvbnRyb2xsZXJfdmlld2VyJGRhdGEgPSByZXZpZXdzQ29udHJvbGxlcl92aWV3ZXI7XG5leHBvcnQgdHlwZSByZXZpZXdzQ29udHJvbGxlcl92aWV3ZXIka2V5ID0ge1xuICArJGRhdGE/OiByZXZpZXdzQ29udHJvbGxlcl92aWV3ZXIkZGF0YSxcbiAgKyRmcmFnbWVudFJlZnM6IHJldmlld3NDb250cm9sbGVyX3ZpZXdlciRyZWYsXG59O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcInJldmlld3NDb250cm9sbGVyX3ZpZXdlclwiLFxuICBcInR5cGVcIjogXCJVc2VyXCIsXG4gIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJpZFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImxvZ2luXCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiYXZhdGFyVXJsXCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfVxuICBdXG59O1xuLy8gcHJldHRpZXItaWdub3JlXG4obm9kZS8qOiBhbnkqLykuaGFzaCA9ICdlOWU0Y2Y4OGYyZDhhODA5NjIwYTBmMjI1ZDUwMjg5Nic7XG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG4iXX0=