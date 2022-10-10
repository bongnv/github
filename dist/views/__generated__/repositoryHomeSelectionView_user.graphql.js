/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type repositoryHomeSelectionView_user$ref: FragmentReference;
declare export opaque type repositoryHomeSelectionView_user$fragmentType: repositoryHomeSelectionView_user$ref;
export type repositoryHomeSelectionView_user = {|
  +id: string,
  +login: string,
  +avatarUrl: any,
  +organizations: {|
    +pageInfo: {|
      +hasNextPage: boolean,
      +endCursor: ?string,
    |},
    +edges: ?$ReadOnlyArray<?{|
      +cursor: string,
      +node: ?{|
        +id: string,
        +login: string,
        +avatarUrl: any,
        +viewerCanCreateRepositories: boolean,
      |},
    |}>,
  |},
  +$refType: repositoryHomeSelectionView_user$ref,
|};
export type repositoryHomeSelectionView_user$data = repositoryHomeSelectionView_user;
export type repositoryHomeSelectionView_user$key = {
  +$data?: repositoryHomeSelectionView_user$data,
  +$fragmentRefs: repositoryHomeSelectionView_user$ref,
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
    "name": "login",
    "args": null,
    "storageKey": null
  },
      v2 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "avatarUrl",
    "args": [{
      "kind": "Literal",
      "name": "size",
      "value": 24
    }],
    "storageKey": "avatarUrl(size:24)"
  };
  return {
    "kind": "Fragment",
    "name": "repositoryHomeSelectionView_user",
    "type": "User",
    "metadata": {
      "connection": [{
        "count": "organizationCount",
        "cursor": "organizationCursor",
        "direction": "forward",
        "path": ["organizations"]
      }]
    },
    "argumentDefinitions": [{
      "kind": "LocalArgument",
      "name": "organizationCount",
      "type": "Int!",
      "defaultValue": null
    }, {
      "kind": "LocalArgument",
      "name": "organizationCursor",
      "type": "String",
      "defaultValue": null
    }],
    "selections": [v0
    /*: any*/
    , v1
    /*: any*/
    , v2
    /*: any*/
    , {
      "kind": "LinkedField",
      "alias": "organizations",
      "name": "__RepositoryHomeSelectionView_organizations_connection",
      "storageKey": null,
      "args": null,
      "concreteType": "OrganizationConnection",
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
        "concreteType": "OrganizationEdge",
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
          "concreteType": "Organization",
          "plural": false,
          "selections": [v0
          /*: any*/
          , v1
          /*: any*/
          , v2
          /*: any*/
          , {
            "kind": "ScalarField",
            "alias": null,
            "name": "viewerCanCreateRepositories",
            "args": null,
            "storageKey": null
          }, {
            "kind": "ScalarField",
            "alias": null,
            "name": "__typename",
            "args": null,
            "storageKey": null
          }]
        }]
      }]
    }]
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '11a1f1d0eac32bff0a3371217c0eede3';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi92aWV3cy9fX2dlbmVyYXRlZF9fL3JlcG9zaXRvcnlIb21lU2VsZWN0aW9uVmlld191c2VyLmdyYXBocWwuanMiXSwibmFtZXMiOlsibm9kZSIsInYwIiwidjEiLCJ2MiIsImhhc2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztBQUlBO0FBRUE7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NBLE1BQU1BO0FBQUk7QUFBQSxFQUF3QixZQUFVO0FBQzVDLE1BQUlDLEVBQUUsR0FBRztBQUNQLFlBQVEsYUFERDtBQUVQLGFBQVMsSUFGRjtBQUdQLFlBQVEsSUFIRDtBQUlQLFlBQVEsSUFKRDtBQUtQLGtCQUFjO0FBTFAsR0FBVDtBQUFBLE1BT0FDLEVBQUUsR0FBRztBQUNILFlBQVEsYUFETDtBQUVILGFBQVMsSUFGTjtBQUdILFlBQVEsT0FITDtBQUlILFlBQVEsSUFKTDtBQUtILGtCQUFjO0FBTFgsR0FQTDtBQUFBLE1BY0FDLEVBQUUsR0FBRztBQUNILFlBQVEsYUFETDtBQUVILGFBQVMsSUFGTjtBQUdILFlBQVEsV0FITDtBQUlILFlBQVEsQ0FDTjtBQUNFLGNBQVEsU0FEVjtBQUVFLGNBQVEsTUFGVjtBQUdFLGVBQVM7QUFIWCxLQURNLENBSkw7QUFXSCxrQkFBYztBQVhYLEdBZEw7QUEyQkEsU0FBTztBQUNMLFlBQVEsVUFESDtBQUVMLFlBQVEsa0NBRkg7QUFHTCxZQUFRLE1BSEg7QUFJTCxnQkFBWTtBQUNWLG9CQUFjLENBQ1o7QUFDRSxpQkFBUyxtQkFEWDtBQUVFLGtCQUFVLG9CQUZaO0FBR0UscUJBQWEsU0FIZjtBQUlFLGdCQUFRLENBQ04sZUFETTtBQUpWLE9BRFk7QUFESixLQUpQO0FBZ0JMLDJCQUF1QixDQUNyQjtBQUNFLGNBQVEsZUFEVjtBQUVFLGNBQVEsbUJBRlY7QUFHRSxjQUFRLE1BSFY7QUFJRSxzQkFBZ0I7QUFKbEIsS0FEcUIsRUFPckI7QUFDRSxjQUFRLGVBRFY7QUFFRSxjQUFRLG9CQUZWO0FBR0UsY0FBUSxRQUhWO0FBSUUsc0JBQWdCO0FBSmxCLEtBUHFCLENBaEJsQjtBQThCTCxrQkFBYyxDQUNYRjtBQUFFO0FBRFMsTUFFWEM7QUFBRTtBQUZTLE1BR1hDO0FBQUU7QUFIUyxNQUlaO0FBQ0UsY0FBUSxhQURWO0FBRUUsZUFBUyxlQUZYO0FBR0UsY0FBUSx3REFIVjtBQUlFLG9CQUFjLElBSmhCO0FBS0UsY0FBUSxJQUxWO0FBTUUsc0JBQWdCLHdCQU5sQjtBQU9FLGdCQUFVLEtBUFo7QUFRRSxvQkFBYyxDQUNaO0FBQ0UsZ0JBQVEsYUFEVjtBQUVFLGlCQUFTLElBRlg7QUFHRSxnQkFBUSxVQUhWO0FBSUUsc0JBQWMsSUFKaEI7QUFLRSxnQkFBUSxJQUxWO0FBTUUsd0JBQWdCLFVBTmxCO0FBT0Usa0JBQVUsS0FQWjtBQVFFLHNCQUFjLENBQ1o7QUFDRSxrQkFBUSxhQURWO0FBRUUsbUJBQVMsSUFGWDtBQUdFLGtCQUFRLGFBSFY7QUFJRSxrQkFBUSxJQUpWO0FBS0Usd0JBQWM7QUFMaEIsU0FEWSxFQVFaO0FBQ0Usa0JBQVEsYUFEVjtBQUVFLG1CQUFTLElBRlg7QUFHRSxrQkFBUSxXQUhWO0FBSUUsa0JBQVEsSUFKVjtBQUtFLHdCQUFjO0FBTGhCLFNBUlk7QUFSaEIsT0FEWSxFQTBCWjtBQUNFLGdCQUFRLGFBRFY7QUFFRSxpQkFBUyxJQUZYO0FBR0UsZ0JBQVEsT0FIVjtBQUlFLHNCQUFjLElBSmhCO0FBS0UsZ0JBQVEsSUFMVjtBQU1FLHdCQUFnQixrQkFObEI7QUFPRSxrQkFBVSxJQVBaO0FBUUUsc0JBQWMsQ0FDWjtBQUNFLGtCQUFRLGFBRFY7QUFFRSxtQkFBUyxJQUZYO0FBR0Usa0JBQVEsUUFIVjtBQUlFLGtCQUFRLElBSlY7QUFLRSx3QkFBYztBQUxoQixTQURZLEVBUVo7QUFDRSxrQkFBUSxhQURWO0FBRUUsbUJBQVMsSUFGWDtBQUdFLGtCQUFRLE1BSFY7QUFJRSx3QkFBYyxJQUpoQjtBQUtFLGtCQUFRLElBTFY7QUFNRSwwQkFBZ0IsY0FObEI7QUFPRSxvQkFBVSxLQVBaO0FBUUUsd0JBQWMsQ0FDWEY7QUFBRTtBQURTLFlBRVhDO0FBQUU7QUFGUyxZQUdYQztBQUFFO0FBSFMsWUFJWjtBQUNFLG9CQUFRLGFBRFY7QUFFRSxxQkFBUyxJQUZYO0FBR0Usb0JBQVEsNkJBSFY7QUFJRSxvQkFBUSxJQUpWO0FBS0UsMEJBQWM7QUFMaEIsV0FKWSxFQVdaO0FBQ0Usb0JBQVEsYUFEVjtBQUVFLHFCQUFTLElBRlg7QUFHRSxvQkFBUSxZQUhWO0FBSUUsb0JBQVEsSUFKVjtBQUtFLDBCQUFjO0FBTGhCLFdBWFk7QUFSaEIsU0FSWTtBQVJoQixPQTFCWTtBQVJoQixLQUpZO0FBOUJULEdBQVA7QUFzSEMsQ0FsSmdDLEVBQWpDLEMsQ0FtSkE7OztBQUNDSDtBQUFJO0FBQUwsQ0FBZ0JJLElBQWhCLEdBQXVCLGtDQUF2QjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJOLElBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmxvd1xuICovXG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyo6OlxuaW1wb3J0IHR5cGUgeyBSZWFkZXJGcmFnbWVudCB9IGZyb20gJ3JlbGF5LXJ1bnRpbWUnO1xuaW1wb3J0IHR5cGUgeyBGcmFnbWVudFJlZmVyZW5jZSB9IGZyb20gXCJyZWxheS1ydW50aW1lXCI7XG5kZWNsYXJlIGV4cG9ydCBvcGFxdWUgdHlwZSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRyZWY6IEZyYWdtZW50UmVmZXJlbmNlO1xuZGVjbGFyZSBleHBvcnQgb3BhcXVlIHR5cGUgcmVwb3NpdG9yeUhvbWVTZWxlY3Rpb25WaWV3X3VzZXIkZnJhZ21lbnRUeXBlOiByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRyZWY7XG5leHBvcnQgdHlwZSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciA9IHt8XG4gICtpZDogc3RyaW5nLFxuICArbG9naW46IHN0cmluZyxcbiAgK2F2YXRhclVybDogYW55LFxuICArb3JnYW5pemF0aW9uczoge3xcbiAgICArcGFnZUluZm86IHt8XG4gICAgICAraGFzTmV4dFBhZ2U6IGJvb2xlYW4sXG4gICAgICArZW5kQ3Vyc29yOiA/c3RyaW5nLFxuICAgIHx9LFxuICAgICtlZGdlczogPyRSZWFkT25seUFycmF5PD97fFxuICAgICAgK2N1cnNvcjogc3RyaW5nLFxuICAgICAgK25vZGU6ID97fFxuICAgICAgICAraWQ6IHN0cmluZyxcbiAgICAgICAgK2xvZ2luOiBzdHJpbmcsXG4gICAgICAgICthdmF0YXJVcmw6IGFueSxcbiAgICAgICAgK3ZpZXdlckNhbkNyZWF0ZVJlcG9zaXRvcmllczogYm9vbGVhbixcbiAgICAgIHx9LFxuICAgIHx9PixcbiAgfH0sXG4gICskcmVmVHlwZTogcmVwb3NpdG9yeUhvbWVTZWxlY3Rpb25WaWV3X3VzZXIkcmVmLFxufH07XG5leHBvcnQgdHlwZSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRkYXRhID0gcmVwb3NpdG9yeUhvbWVTZWxlY3Rpb25WaWV3X3VzZXI7XG5leHBvcnQgdHlwZSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRrZXkgPSB7XG4gICskZGF0YT86IHJlcG9zaXRvcnlIb21lU2VsZWN0aW9uVmlld191c2VyJGRhdGEsXG4gICskZnJhZ21lbnRSZWZzOiByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRyZWYsXG59O1xuKi9cblxuXG5jb25zdCBub2RlLyo6IFJlYWRlckZyYWdtZW50Ki8gPSAoZnVuY3Rpb24oKXtcbnZhciB2MCA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJpZFwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn0sXG52MSA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJsb2dpblwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn0sXG52MiA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJhdmF0YXJVcmxcIixcbiAgXCJhcmdzXCI6IFtcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJMaXRlcmFsXCIsXG4gICAgICBcIm5hbWVcIjogXCJzaXplXCIsXG4gICAgICBcInZhbHVlXCI6IDI0XG4gICAgfVxuICBdLFxuICBcInN0b3JhZ2VLZXlcIjogXCJhdmF0YXJVcmwoc2l6ZToyNClcIlxufTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIkZyYWdtZW50XCIsXG4gIFwibmFtZVwiOiBcInJlcG9zaXRvcnlIb21lU2VsZWN0aW9uVmlld191c2VyXCIsXG4gIFwidHlwZVwiOiBcIlVzZXJcIixcbiAgXCJtZXRhZGF0YVwiOiB7XG4gICAgXCJjb25uZWN0aW9uXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJjb3VudFwiOiBcIm9yZ2FuaXphdGlvbkNvdW50XCIsXG4gICAgICAgIFwiY3Vyc29yXCI6IFwib3JnYW5pemF0aW9uQ3Vyc29yXCIsXG4gICAgICAgIFwiZGlyZWN0aW9uXCI6IFwiZm9yd2FyZFwiLFxuICAgICAgICBcInBhdGhcIjogW1xuICAgICAgICAgIFwib3JnYW5pemF0aW9uc1wiXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG4gIFwiYXJndW1lbnREZWZpbml0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwib3JnYW5pemF0aW9uQ291bnRcIixcbiAgICAgIFwidHlwZVwiOiBcIkludCFcIixcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICAgIFwibmFtZVwiOiBcIm9yZ2FuaXphdGlvbkN1cnNvclwiLFxuICAgICAgXCJ0eXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICBcImRlZmF1bHRWYWx1ZVwiOiBudWxsXG4gICAgfVxuICBdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgICh2MC8qOiBhbnkqLyksXG4gICAgKHYxLyo6IGFueSovKSxcbiAgICAodjIvKjogYW55Ki8pLFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IFwib3JnYW5pemF0aW9uc1wiLFxuICAgICAgXCJuYW1lXCI6IFwiX19SZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfb3JnYW5pemF0aW9uc19jb25uZWN0aW9uXCIsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJPcmdhbml6YXRpb25Db25uZWN0aW9uXCIsXG4gICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICBcIm5hbWVcIjogXCJwYWdlSW5mb1wiLFxuICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiUGFnZUluZm9cIixcbiAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcImhhc05leHRQYWdlXCIsXG4gICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJlbmRDdXJzb3JcIixcbiAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgXCJuYW1lXCI6IFwiZWRnZXNcIixcbiAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIk9yZ2FuaXphdGlvbkVkZ2VcIixcbiAgICAgICAgICBcInBsdXJhbFwiOiB0cnVlLFxuICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiY3Vyc29yXCIsXG4gICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJub2RlXCIsXG4gICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJPcmdhbml6YXRpb25cIixcbiAgICAgICAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgICAgKHYwLyo6IGFueSovKSxcbiAgICAgICAgICAgICAgICAodjEvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICh2Mi8qOiBhbnkqLyksXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcInZpZXdlckNhbkNyZWF0ZVJlcG9zaXRvcmllc1wiLFxuICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIl9fdHlwZW5hbWVcIixcbiAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG59KSgpO1xuLy8gcHJldHRpZXItaWdub3JlXG4obm9kZS8qOiBhbnkqLykuaGFzaCA9ICcxMWExZjFkMGVhYzMyYmZmMGEzMzcxMjE3YzBlZWRlMyc7XG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG4iXX0=