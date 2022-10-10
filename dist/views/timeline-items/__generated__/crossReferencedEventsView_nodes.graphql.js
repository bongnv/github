/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
type crossReferencedEventView_item$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type crossReferencedEventsView_nodes$ref: FragmentReference;
declare export opaque type crossReferencedEventsView_nodes$fragmentType: crossReferencedEventsView_nodes$ref;
export type crossReferencedEventsView_nodes = $ReadOnlyArray<{|
  +id: string,
  +referencedAt: any,
  +isCrossRepository: boolean,
  +actor: ?{|
    +login: string,
    +avatarUrl: any,
  |},
  +source: {|
    +__typename: string,
    +repository?: {|
      +name: string,
      +owner: {|
        +login: string
      |},
    |},
  |},
  +$fragmentRefs: crossReferencedEventView_item$ref,
  +$refType: crossReferencedEventsView_nodes$ref,
|}>;
export type crossReferencedEventsView_nodes$data = crossReferencedEventsView_nodes;
export type crossReferencedEventsView_nodes$key = $ReadOnlyArray<{
  +$data?: crossReferencedEventsView_nodes$data,
  +$fragmentRefs: crossReferencedEventsView_nodes$ref,
}>;
*/

const node
/*: ReaderFragment*/
= function () {
  var v0 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "login",
    "args": null,
    "storageKey": null
  };
  return {
    "kind": "Fragment",
    "name": "crossReferencedEventsView_nodes",
    "type": "CrossReferencedEvent",
    "metadata": {
      "plural": true
    },
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
      "name": "referencedAt",
      "args": null,
      "storageKey": null
    }, {
      "kind": "ScalarField",
      "alias": null,
      "name": "isCrossRepository",
      "args": null,
      "storageKey": null
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "actor",
      "storageKey": null,
      "args": null,
      "concreteType": null,
      "plural": false,
      "selections": [v0
      /*: any*/
      , {
        "kind": "ScalarField",
        "alias": null,
        "name": "avatarUrl",
        "args": null,
        "storageKey": null
      }]
    }, {
      "kind": "LinkedField",
      "alias": null,
      "name": "source",
      "storageKey": null,
      "args": null,
      "concreteType": null,
      "plural": false,
      "selections": [{
        "kind": "ScalarField",
        "alias": null,
        "name": "__typename",
        "args": null,
        "storageKey": null
      }, {
        "kind": "LinkedField",
        "alias": null,
        "name": "repository",
        "storageKey": null,
        "args": null,
        "concreteType": "Repository",
        "plural": false,
        "selections": [{
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
          "selections": [v0
          /*: any*/
          ]
        }]
      }]
    }, {
      "kind": "FragmentSpread",
      "name": "crossReferencedEventView_item",
      "args": null
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '5bbb7b39e10559bac4af2d6f9ff7a9e2';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi92aWV3cy90aW1lbGluZS1pdGVtcy9fX2dlbmVyYXRlZF9fL2Nyb3NzUmVmZXJlbmNlZEV2ZW50c1ZpZXdfbm9kZXMuZ3JhcGhxbC5qcyJdLCJuYW1lcyI6WyJub2RlIiwidjAiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDQSxNQUFNQTtBQUFJO0FBQUEsRUFBd0IsWUFBVTtBQUM1QyxNQUFJQyxFQUFFLEdBQUc7QUFDUCxZQUFRLGFBREQ7QUFFUCxhQUFTLElBRkY7QUFHUCxZQUFRLE9BSEQ7QUFJUCxZQUFRLElBSkQ7QUFLUCxrQkFBYztBQUxQLEdBQVQ7QUFPQSxTQUFPO0FBQ0wsWUFBUSxVQURIO0FBRUwsWUFBUSxpQ0FGSDtBQUdMLFlBQVEsc0JBSEg7QUFJTCxnQkFBWTtBQUNWLGdCQUFVO0FBREEsS0FKUDtBQU9MLDJCQUF1QixFQVBsQjtBQVFMLGtCQUFjLENBQ1o7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLElBSFY7QUFJRSxjQUFRLElBSlY7QUFLRSxvQkFBYztBQUxoQixLQURZLEVBUVo7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLGNBSFY7QUFJRSxjQUFRLElBSlY7QUFLRSxvQkFBYztBQUxoQixLQVJZLEVBZVo7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLG1CQUhWO0FBSUUsY0FBUSxJQUpWO0FBS0Usb0JBQWM7QUFMaEIsS0FmWSxFQXNCWjtBQUNFLGNBQVEsYUFEVjtBQUVFLGVBQVMsSUFGWDtBQUdFLGNBQVEsT0FIVjtBQUlFLG9CQUFjLElBSmhCO0FBS0UsY0FBUSxJQUxWO0FBTUUsc0JBQWdCLElBTmxCO0FBT0UsZ0JBQVUsS0FQWjtBQVFFLG9CQUFjLENBQ1hBO0FBQUU7QUFEUyxRQUVaO0FBQ0UsZ0JBQVEsYUFEVjtBQUVFLGlCQUFTLElBRlg7QUFHRSxnQkFBUSxXQUhWO0FBSUUsZ0JBQVEsSUFKVjtBQUtFLHNCQUFjO0FBTGhCLE9BRlk7QUFSaEIsS0F0QlksRUF5Q1o7QUFDRSxjQUFRLGFBRFY7QUFFRSxlQUFTLElBRlg7QUFHRSxjQUFRLFFBSFY7QUFJRSxvQkFBYyxJQUpoQjtBQUtFLGNBQVEsSUFMVjtBQU1FLHNCQUFnQixJQU5sQjtBQU9FLGdCQUFVLEtBUFo7QUFRRSxvQkFBYyxDQUNaO0FBQ0UsZ0JBQVEsYUFEVjtBQUVFLGlCQUFTLElBRlg7QUFHRSxnQkFBUSxZQUhWO0FBSUUsZ0JBQVEsSUFKVjtBQUtFLHNCQUFjO0FBTGhCLE9BRFksRUFRWjtBQUNFLGdCQUFRLGFBRFY7QUFFRSxpQkFBUyxJQUZYO0FBR0UsZ0JBQVEsWUFIVjtBQUlFLHNCQUFjLElBSmhCO0FBS0UsZ0JBQVEsSUFMVjtBQU1FLHdCQUFnQixZQU5sQjtBQU9FLGtCQUFVLEtBUFo7QUFRRSxzQkFBYyxDQUNaO0FBQ0Usa0JBQVEsYUFEVjtBQUVFLG1CQUFTLElBRlg7QUFHRSxrQkFBUSxNQUhWO0FBSUUsa0JBQVEsSUFKVjtBQUtFLHdCQUFjO0FBTGhCLFNBRFksRUFRWjtBQUNFLGtCQUFRLGFBRFY7QUFFRSxtQkFBUyxJQUZYO0FBR0Usa0JBQVEsT0FIVjtBQUlFLHdCQUFjLElBSmhCO0FBS0Usa0JBQVEsSUFMVjtBQU1FLDBCQUFnQixJQU5sQjtBQU9FLG9CQUFVLEtBUFo7QUFRRSx3QkFBYyxDQUNYQTtBQUFFO0FBRFM7QUFSaEIsU0FSWTtBQVJoQixPQVJZO0FBUmhCLEtBekNZLEVBeUZaO0FBQ0UsY0FBUSxnQkFEVjtBQUVFLGNBQVEsK0JBRlY7QUFHRSxjQUFRO0FBSFYsS0F6Rlk7QUFSVCxHQUFQO0FBd0dDLENBaEhnQyxFQUFqQyxDLENBaUhBOzs7QUFDQ0Q7QUFBSTtBQUFMLENBQWdCRSxJQUFoQixHQUF1QixrQ0FBdkI7QUFDQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSixJQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZsb3dcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qOjpcbmltcG9ydCB0eXBlIHsgUmVhZGVyRnJhZ21lbnQgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbnR5cGUgY3Jvc3NSZWZlcmVuY2VkRXZlbnRWaWV3X2l0ZW0kcmVmID0gYW55O1xuaW1wb3J0IHR5cGUgeyBGcmFnbWVudFJlZmVyZW5jZSB9IGZyb20gXCJyZWxheS1ydW50aW1lXCI7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzJHJlZjogRnJhZ21lbnRSZWZlcmVuY2U7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSBjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzJGZyYWdtZW50VHlwZTogY3Jvc3NSZWZlcmVuY2VkRXZlbnRzVmlld19ub2RlcyRyZWY7XG5leHBvcnQgdHlwZSBjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzID0gJFJlYWRPbmx5QXJyYXk8e3xcbiAgK2lkOiBzdHJpbmcsXG4gICtyZWZlcmVuY2VkQXQ6IGFueSxcbiAgK2lzQ3Jvc3NSZXBvc2l0b3J5OiBib29sZWFuLFxuICArYWN0b3I6ID97fFxuICAgICtsb2dpbjogc3RyaW5nLFxuICAgICthdmF0YXJVcmw6IGFueSxcbiAgfH0sXG4gICtzb3VyY2U6IHt8XG4gICAgK19fdHlwZW5hbWU6IHN0cmluZyxcbiAgICArcmVwb3NpdG9yeT86IHt8XG4gICAgICArbmFtZTogc3RyaW5nLFxuICAgICAgK293bmVyOiB7fFxuICAgICAgICArbG9naW46IHN0cmluZ1xuICAgICAgfH0sXG4gICAgfH0sXG4gIHx9LFxuICArJGZyYWdtZW50UmVmczogY3Jvc3NSZWZlcmVuY2VkRXZlbnRWaWV3X2l0ZW0kcmVmLFxuICArJHJlZlR5cGU6IGNyb3NzUmVmZXJlbmNlZEV2ZW50c1ZpZXdfbm9kZXMkcmVmLFxufH0+O1xuZXhwb3J0IHR5cGUgY3Jvc3NSZWZlcmVuY2VkRXZlbnRzVmlld19ub2RlcyRkYXRhID0gY3Jvc3NSZWZlcmVuY2VkRXZlbnRzVmlld19ub2RlcztcbmV4cG9ydCB0eXBlIGNyb3NzUmVmZXJlbmNlZEV2ZW50c1ZpZXdfbm9kZXMka2V5ID0gJFJlYWRPbmx5QXJyYXk8e1xuICArJGRhdGE/OiBjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzJGRhdGEsXG4gICskZnJhZ21lbnRSZWZzOiBjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzJHJlZixcbn0+O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSAoZnVuY3Rpb24oKXtcbnZhciB2MCA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJsb2dpblwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn07XG5yZXR1cm4ge1xuICBcImtpbmRcIjogXCJGcmFnbWVudFwiLFxuICBcIm5hbWVcIjogXCJjcm9zc1JlZmVyZW5jZWRFdmVudHNWaWV3X25vZGVzXCIsXG4gIFwidHlwZVwiOiBcIkNyb3NzUmVmZXJlbmNlZEV2ZW50XCIsXG4gIFwibWV0YWRhdGFcIjoge1xuICAgIFwicGx1cmFsXCI6IHRydWVcbiAgfSxcbiAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6IFtdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJpZFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcInJlZmVyZW5jZWRBdFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcImlzQ3Jvc3NSZXBvc2l0b3J5XCIsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiYWN0b3JcIixcbiAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcImNvbmNyZXRlVHlwZVwiOiBudWxsLFxuICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAodjAvKjogYW55Ki8pLFxuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgXCJuYW1lXCI6IFwiYXZhdGFyVXJsXCIsXG4gICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgIFwibmFtZVwiOiBcInNvdXJjZVwiLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgIFwiY29uY3JldGVUeXBlXCI6IG51bGwsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJfX3R5cGVuYW1lXCIsXG4gICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgIFwibmFtZVwiOiBcInJlcG9zaXRvcnlcIixcbiAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIlJlcG9zaXRvcnlcIixcbiAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcIm5hbWVcIixcbiAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcIm93bmVyXCIsXG4gICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgICAgKHYwLyo6IGFueSovKVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJGcmFnbWVudFNwcmVhZFwiLFxuICAgICAgXCJuYW1lXCI6IFwiY3Jvc3NSZWZlcmVuY2VkRXZlbnRWaWV3X2l0ZW1cIixcbiAgICAgIFwiYXJnc1wiOiBudWxsXG4gICAgfVxuICBdXG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnNWJiYjdiMzllMTA1NTliYWM0YWYyZDZmOWZmN2E5ZTInO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19