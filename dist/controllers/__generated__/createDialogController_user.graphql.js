/**
 * @flow
 */

/* eslint-disable */
'use strict';
/*::
import type { ReaderFragment } from 'relay-runtime';
type repositoryHomeSelectionView_user$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type createDialogController_user$ref: FragmentReference;
declare export opaque type createDialogController_user$fragmentType: createDialogController_user$ref;
export type createDialogController_user = {|
  +id: string,
  +$fragmentRefs: repositoryHomeSelectionView_user$ref,
  +$refType: createDialogController_user$ref,
|};
export type createDialogController_user$data = createDialogController_user;
export type createDialogController_user$key = {
  +$data?: createDialogController_user$data,
  +$fragmentRefs: createDialogController_user$ref,
};
*/

const node
/*: ReaderFragment*/
= {
  "kind": "Fragment",
  "name": "createDialogController_user",
  "type": "User",
  "metadata": null,
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
  "selections": [{
    "kind": "ScalarField",
    "alias": null,
    "name": "id",
    "args": null,
    "storageKey": null
  }, {
    "kind": "FragmentSpread",
    "name": "repositoryHomeSelectionView_user",
    "args": [{
      "kind": "Variable",
      "name": "organizationCount",
      "variableName": "organizationCount"
    }, {
      "kind": "Variable",
      "name": "organizationCursor",
      "variableName": "organizationCursor"
    }]
  }]
}; // prettier-ignore

node
/*: any*/
.hash = '729f5d41fc5444c5f12632127f89ed21';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9jb250cm9sbGVycy9fX2dlbmVyYXRlZF9fL2NyZWF0ZURpYWxvZ0NvbnRyb2xsZXJfdXNlci5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxNQUFNQTtBQUFJO0FBQUEsRUFBdUI7QUFDL0IsVUFBUSxVQUR1QjtBQUUvQixVQUFRLDZCQUZ1QjtBQUcvQixVQUFRLE1BSHVCO0FBSS9CLGNBQVksSUFKbUI7QUFLL0IseUJBQXVCLENBQ3JCO0FBQ0UsWUFBUSxlQURWO0FBRUUsWUFBUSxtQkFGVjtBQUdFLFlBQVEsTUFIVjtBQUlFLG9CQUFnQjtBQUpsQixHQURxQixFQU9yQjtBQUNFLFlBQVEsZUFEVjtBQUVFLFlBQVEsb0JBRlY7QUFHRSxZQUFRLFFBSFY7QUFJRSxvQkFBZ0I7QUFKbEIsR0FQcUIsQ0FMUTtBQW1CL0IsZ0JBQWMsQ0FDWjtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsSUFIVjtBQUlFLFlBQVEsSUFKVjtBQUtFLGtCQUFjO0FBTGhCLEdBRFksRUFRWjtBQUNFLFlBQVEsZ0JBRFY7QUFFRSxZQUFRLGtDQUZWO0FBR0UsWUFBUSxDQUNOO0FBQ0UsY0FBUSxVQURWO0FBRUUsY0FBUSxtQkFGVjtBQUdFLHNCQUFnQjtBQUhsQixLQURNLEVBTU47QUFDRSxjQUFRLFVBRFY7QUFFRSxjQUFRLG9CQUZWO0FBR0Usc0JBQWdCO0FBSGxCLEtBTk07QUFIVixHQVJZO0FBbkJpQixDQUFqQyxDLENBNkNBOztBQUNDQTtBQUFJO0FBQUwsQ0FBZ0JDLElBQWhCLEdBQXVCLGtDQUF2QjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJILElBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmxvd1xuICovXG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyo6OlxuaW1wb3J0IHR5cGUgeyBSZWFkZXJGcmFnbWVudCB9IGZyb20gJ3JlbGF5LXJ1bnRpbWUnO1xudHlwZSByZXBvc2l0b3J5SG9tZVNlbGVjdGlvblZpZXdfdXNlciRyZWYgPSBhbnk7XG5pbXBvcnQgdHlwZSB7IEZyYWdtZW50UmVmZXJlbmNlIH0gZnJvbSBcInJlbGF5LXJ1bnRpbWVcIjtcbmRlY2xhcmUgZXhwb3J0IG9wYXF1ZSB0eXBlIGNyZWF0ZURpYWxvZ0NvbnRyb2xsZXJfdXNlciRyZWY6IEZyYWdtZW50UmVmZXJlbmNlO1xuZGVjbGFyZSBleHBvcnQgb3BhcXVlIHR5cGUgY3JlYXRlRGlhbG9nQ29udHJvbGxlcl91c2VyJGZyYWdtZW50VHlwZTogY3JlYXRlRGlhbG9nQ29udHJvbGxlcl91c2VyJHJlZjtcbmV4cG9ydCB0eXBlIGNyZWF0ZURpYWxvZ0NvbnRyb2xsZXJfdXNlciA9IHt8XG4gICtpZDogc3RyaW5nLFxuICArJGZyYWdtZW50UmVmczogcmVwb3NpdG9yeUhvbWVTZWxlY3Rpb25WaWV3X3VzZXIkcmVmLFxuICArJHJlZlR5cGU6IGNyZWF0ZURpYWxvZ0NvbnRyb2xsZXJfdXNlciRyZWYsXG58fTtcbmV4cG9ydCB0eXBlIGNyZWF0ZURpYWxvZ0NvbnRyb2xsZXJfdXNlciRkYXRhID0gY3JlYXRlRGlhbG9nQ29udHJvbGxlcl91c2VyO1xuZXhwb3J0IHR5cGUgY3JlYXRlRGlhbG9nQ29udHJvbGxlcl91c2VyJGtleSA9IHtcbiAgKyRkYXRhPzogY3JlYXRlRGlhbG9nQ29udHJvbGxlcl91c2VyJGRhdGEsXG4gICskZnJhZ21lbnRSZWZzOiBjcmVhdGVEaWFsb2dDb250cm9sbGVyX3VzZXIkcmVmLFxufTtcbiovXG5cblxuY29uc3Qgbm9kZS8qOiBSZWFkZXJGcmFnbWVudCovID0ge1xuICBcImtpbmRcIjogXCJGcmFnbWVudFwiLFxuICBcIm5hbWVcIjogXCJjcmVhdGVEaWFsb2dDb250cm9sbGVyX3VzZXJcIixcbiAgXCJ0eXBlXCI6IFwiVXNlclwiLFxuICBcIm1ldGFkYXRhXCI6IG51bGwsXG4gIFwiYXJndW1lbnREZWZpbml0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgICAgXCJuYW1lXCI6IFwib3JnYW5pemF0aW9uQ291bnRcIixcbiAgICAgIFwidHlwZVwiOiBcIkludCFcIixcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICAgIFwibmFtZVwiOiBcIm9yZ2FuaXphdGlvbkN1cnNvclwiLFxuICAgICAgXCJ0eXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICBcImRlZmF1bHRWYWx1ZVwiOiBudWxsXG4gICAgfVxuICBdLFxuICBcInNlbGVjdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJpZFwiLFxuICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgXCJraW5kXCI6IFwiRnJhZ21lbnRTcHJlYWRcIixcbiAgICAgIFwibmFtZVwiOiBcInJlcG9zaXRvcnlIb21lU2VsZWN0aW9uVmlld191c2VyXCIsXG4gICAgICBcImFyZ3NcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiVmFyaWFibGVcIixcbiAgICAgICAgICBcIm5hbWVcIjogXCJvcmdhbml6YXRpb25Db3VudFwiLFxuICAgICAgICAgIFwidmFyaWFibGVOYW1lXCI6IFwib3JnYW5pemF0aW9uQ291bnRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJraW5kXCI6IFwiVmFyaWFibGVcIixcbiAgICAgICAgICBcIm5hbWVcIjogXCJvcmdhbml6YXRpb25DdXJzb3JcIixcbiAgICAgICAgICBcInZhcmlhYmxlTmFtZVwiOiBcIm9yZ2FuaXphdGlvbkN1cnNvclwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG4vLyBwcmV0dGllci1pZ25vcmVcbihub2RlLyo6IGFueSovKS5oYXNoID0gJzcyOWY1ZDQxZmM1NDQ0YzVmMTI2MzIxMjdmODllZDIxJztcbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcbiJdfQ==