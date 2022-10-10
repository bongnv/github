/**
 * @flow
 * @relayHash f4ea156db8d2e5b7488028bf9c4607dd
 */

/* eslint-disable */
'use strict';
/*::
import type { ConcreteRequest } from 'relay-runtime';
type issueishTooltipContainer_resource$ref = any;
export type issueishTooltipItemQueryVariables = {|
  issueishUrl: any
|};
export type issueishTooltipItemQueryResponse = {|
  +resource: ?{|
    +$fragmentRefs: issueishTooltipContainer_resource$ref
  |}
|};
export type issueishTooltipItemQuery = {|
  variables: issueishTooltipItemQueryVariables,
  response: issueishTooltipItemQueryResponse,
|};
*/

/*
query issueishTooltipItemQuery(
  $issueishUrl: URI!
) {
  resource(url: $issueishUrl) {
    __typename
    ...issueishTooltipContainer_resource
    ... on Node {
      id
    }
  }
}

fragment issueishTooltipContainer_resource on UniformResourceLocatable {
  __typename
  ... on Issue {
    state
    number
    title
    repository {
      name
      owner {
        __typename
        login
        id
      }
      id
    }
    author {
      __typename
      login
      avatarUrl
      ... on Node {
        id
      }
    }
  }
  ... on PullRequest {
    state
    number
    title
    repository {
      name
      owner {
        __typename
        login
        id
      }
      id
    }
    author {
      __typename
      login
      avatarUrl
      ... on Node {
        id
      }
    }
  }
}
*/

const node
/*: ConcreteRequest*/
= function () {
  var v0 = [{
    "kind": "LocalArgument",
    "name": "issueishUrl",
    "type": "URI!",
    "defaultValue": null
  }],
      v1 = [{
    "kind": "Variable",
    "name": "url",
    "variableName": "issueishUrl"
  }],
      v2 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "__typename",
    "args": null,
    "storageKey": null
  },
      v3 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "id",
    "args": null,
    "storageKey": null
  },
      v4 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "login",
    "args": null,
    "storageKey": null
  },
      v5 = [{
    "kind": "ScalarField",
    "alias": null,
    "name": "state",
    "args": null,
    "storageKey": null
  }, {
    "kind": "ScalarField",
    "alias": null,
    "name": "number",
    "args": null,
    "storageKey": null
  }, {
    "kind": "ScalarField",
    "alias": null,
    "name": "title",
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
      "selections": [v2
      /*: any*/
      , v4
      /*: any*/
      , v3
      /*: any*/
      ]
    }, v3
    /*: any*/
    ]
  }, {
    "kind": "LinkedField",
    "alias": null,
    "name": "author",
    "storageKey": null,
    "args": null,
    "concreteType": null,
    "plural": false,
    "selections": [v2
    /*: any*/
    , v4
    /*: any*/
    , {
      "kind": "ScalarField",
      "alias": null,
      "name": "avatarUrl",
      "args": null,
      "storageKey": null
    }, v3
    /*: any*/
    ]
  }];
  return {
    "kind": "Request",
    "fragment": {
      "kind": "Fragment",
      "name": "issueishTooltipItemQuery",
      "type": "Query",
      "metadata": null,
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "resource",
        "storageKey": null,
        "args": v1
        /*: any*/
        ,
        "concreteType": null,
        "plural": false,
        "selections": [{
          "kind": "FragmentSpread",
          "name": "issueishTooltipContainer_resource",
          "args": null
        }]
      }]
    },
    "operation": {
      "kind": "Operation",
      "name": "issueishTooltipItemQuery",
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "resource",
        "storageKey": null,
        "args": v1
        /*: any*/
        ,
        "concreteType": null,
        "plural": false,
        "selections": [v2
        /*: any*/
        , v3
        /*: any*/
        , {
          "kind": "InlineFragment",
          "type": "Issue",
          "selections": v5
          /*: any*/

        }, {
          "kind": "InlineFragment",
          "type": "PullRequest",
          "selections": v5
          /*: any*/

        }]
      }]
    },
    "params": {
      "operationKind": "query",
      "name": "issueishTooltipItemQuery",
      "id": null,
      "text": "query issueishTooltipItemQuery(\n  $issueishUrl: URI!\n) {\n  resource(url: $issueishUrl) {\n    __typename\n    ...issueishTooltipContainer_resource\n    ... on Node {\n      id\n    }\n  }\n}\n\nfragment issueishTooltipContainer_resource on UniformResourceLocatable {\n  __typename\n  ... on Issue {\n    state\n    number\n    title\n    repository {\n      name\n      owner {\n        __typename\n        login\n        id\n      }\n      id\n    }\n    author {\n      __typename\n      login\n      avatarUrl\n      ... on Node {\n        id\n      }\n    }\n  }\n  ... on PullRequest {\n    state\n    number\n    title\n    repository {\n      name\n      owner {\n        __typename\n        login\n        id\n      }\n      id\n    }\n    author {\n      __typename\n      login\n      avatarUrl\n      ... on Node {\n        id\n      }\n    }\n  }\n}\n",
      "metadata": {}
    }
  };
}(); // prettier-ignore


node
/*: any*/
.hash = '8e6b32b5cdcdd3debccc7adaa2b4e82c';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9pdGVtcy9fX2dlbmVyYXRlZF9fL2lzc3VlaXNoVG9vbHRpcEl0ZW1RdWVyeS5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJ2MCIsInYxIiwidjIiLCJ2MyIsInY0IiwidjUiLCJoYXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FBS0E7QUFFQTtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4REEsTUFBTUE7QUFBSTtBQUFBLEVBQXlCLFlBQVU7QUFDN0MsTUFBSUMsRUFBRSxHQUFHLENBQ1A7QUFDRSxZQUFRLGVBRFY7QUFFRSxZQUFRLGFBRlY7QUFHRSxZQUFRLE1BSFY7QUFJRSxvQkFBZ0I7QUFKbEIsR0FETyxDQUFUO0FBQUEsTUFRQUMsRUFBRSxHQUFHLENBQ0g7QUFDRSxZQUFRLFVBRFY7QUFFRSxZQUFRLEtBRlY7QUFHRSxvQkFBZ0I7QUFIbEIsR0FERyxDQVJMO0FBQUEsTUFlQUMsRUFBRSxHQUFHO0FBQ0gsWUFBUSxhQURMO0FBRUgsYUFBUyxJQUZOO0FBR0gsWUFBUSxZQUhMO0FBSUgsWUFBUSxJQUpMO0FBS0gsa0JBQWM7QUFMWCxHQWZMO0FBQUEsTUFzQkFDLEVBQUUsR0FBRztBQUNILFlBQVEsYUFETDtBQUVILGFBQVMsSUFGTjtBQUdILFlBQVEsSUFITDtBQUlILFlBQVEsSUFKTDtBQUtILGtCQUFjO0FBTFgsR0F0Qkw7QUFBQSxNQTZCQUMsRUFBRSxHQUFHO0FBQ0gsWUFBUSxhQURMO0FBRUgsYUFBUyxJQUZOO0FBR0gsWUFBUSxPQUhMO0FBSUgsWUFBUSxJQUpMO0FBS0gsa0JBQWM7QUFMWCxHQTdCTDtBQUFBLE1Bb0NBQyxFQUFFLEdBQUcsQ0FDSDtBQUNFLFlBQVEsYUFEVjtBQUVFLGFBQVMsSUFGWDtBQUdFLFlBQVEsT0FIVjtBQUlFLFlBQVEsSUFK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QUFBSTtBQUFMLENBQWdCTyxJQUFoQixHQUF1QixrQ0FBdkI7QUFDQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCVCxJQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZsb3dcbiAqIEByZWxheUhhc2ggZjRlYTE1NmRiOGQyZTViNzQ4ODAyOGJmOWM0NjA3ZGRcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qOjpcbmltcG9ydCB0eXBlIHsgQ29uY3JldGVSZXF1ZXN0IH0gZnJvbSAncmVsYXktcnVudGltZSc7XG50eXBlIGlzc3VlaXNoVG9vbHRpcENvbnRhaW5lcl9yZXNvdXJjZSRyZWYgPSBhbnk7XG5leHBvcnQgdHlwZSBpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnlWYXJpYWJsZXMgPSB7fFxuICBpc3N1ZWlzaFVybDogYW55XG58fTtcbmV4cG9ydCB0eXBlIGlzc3VlaXNoVG9vbHRpcEl0ZW1RdWVyeVJlc3BvbnNlID0ge3xcbiAgK3Jlc291cmNlOiA/e3xcbiAgICArJGZyYWdtZW50UmVmczogaXNzdWVpc2hUb29sdGlwQ29udGFpbmVyX3Jlc291cmNlJHJlZlxuICB8fVxufH07XG5leHBvcnQgdHlwZSBpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnkgPSB7fFxuICB2YXJpYWJsZXM6IGlzc3VlaXNoVG9vbHRpcEl0ZW1RdWVyeVZhcmlhYmxlcyxcbiAgcmVzcG9uc2U6IGlzc3VlaXNoVG9vbHRpcEl0ZW1RdWVyeVJlc3BvbnNlLFxufH07XG4qL1xuXG5cbi8qXG5xdWVyeSBpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnkoXG4gICRpc3N1ZWlzaFVybDogVVJJIVxuKSB7XG4gIHJlc291cmNlKHVybDogJGlzc3VlaXNoVXJsKSB7XG4gICAgX190eXBlbmFtZVxuICAgIC4uLmlzc3VlaXNoVG9vbHRpcENvbnRhaW5lcl9yZXNvdXJjZVxuICAgIC4uLiBvbiBOb2RlIHtcbiAgICAgIGlkXG4gICAgfVxuICB9XG59XG5cbmZyYWdtZW50IGlzc3VlaXNoVG9vbHRpcENvbnRhaW5lcl9yZXNvdXJjZSBvbiBVbmlmb3JtUmVzb3VyY2VMb2NhdGFibGUge1xuICBfX3R5cGVuYW1lXG4gIC4uLiBvbiBJc3N1ZSB7XG4gICAgc3RhdGVcbiAgICBudW1iZXJcbiAgICB0aXRsZVxuICAgIHJlcG9zaXRvcnkge1xuICAgICAgbmFtZVxuICAgICAgb3duZXIge1xuICAgICAgICBfX3R5cGVuYW1lXG4gICAgICAgIGxvZ2luXG4gICAgICAgIGlkXG4gICAgICB9XG4gICAgICBpZFxuICAgIH1cbiAgICBhdXRob3Ige1xuICAgICAgX190eXBlbmFtZVxuICAgICAgbG9naW5cbiAgICAgIGF2YXRhclVybFxuICAgICAgLi4uIG9uIE5vZGUge1xuICAgICAgICBpZFxuICAgICAgfVxuICAgIH1cbiAgfVxuICAuLi4gb24gUHVsbFJlcXVlc3Qge1xuICAgIHN0YXRlXG4gICAgbnVtYmVyXG4gICAgdGl0bGVcbiAgICByZXBvc2l0b3J5IHtcbiAgICAgIG5hbWVcbiAgICAgIG93bmVyIHtcbiAgICAgICAgX190eXBlbmFtZVxuICAgICAgICBsb2dpblxuICAgICAgICBpZFxuICAgICAgfVxuICAgICAgaWRcbiAgICB9XG4gICAgYXV0aG9yIHtcbiAgICAgIF9fdHlwZW5hbWVcbiAgICAgIGxvZ2luXG4gICAgICBhdmF0YXJVcmxcbiAgICAgIC4uLiBvbiBOb2RlIHtcbiAgICAgICAgaWRcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiovXG5cbmNvbnN0IG5vZGUvKjogQ29uY3JldGVSZXF1ZXN0Ki8gPSAoZnVuY3Rpb24oKXtcbnZhciB2MCA9IFtcbiAge1xuICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICBcIm5hbWVcIjogXCJpc3N1ZWlzaFVybFwiLFxuICAgIFwidHlwZVwiOiBcIlVSSSFcIixcbiAgICBcImRlZmF1bHRWYWx1ZVwiOiBudWxsXG4gIH1cbl0sXG52MSA9IFtcbiAge1xuICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgXCJuYW1lXCI6IFwidXJsXCIsXG4gICAgXCJ2YXJpYWJsZU5hbWVcIjogXCJpc3N1ZWlzaFVybFwiXG4gIH1cbl0sXG52MiA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJfX3R5cGVuYW1lXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufSxcbnYzID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcImlkXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufSxcbnY0ID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcImxvZ2luXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufSxcbnY1ID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwic3RhdGVcIixcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICB9LFxuICB7XG4gICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgXCJuYW1lXCI6IFwibnVtYmVyXCIsXG4gICAgXCJhcmdzXCI6IG51bGwsXG4gICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgfSxcbiAge1xuICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgXCJhbGlhc1wiOiBudWxsLFxuICAgIFwibmFtZVwiOiBcInRpdGxlXCIsXG4gICAgXCJhcmdzXCI6IG51bGwsXG4gICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgfSxcbiAge1xuICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgXCJhbGlhc1wiOiBudWxsLFxuICAgIFwibmFtZVwiOiBcInJlcG9zaXRvcnlcIixcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcImNvbmNyZXRlVHlwZVwiOiBcIlJlcG9zaXRvcnlcIixcbiAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgIFwibmFtZVwiOiBcIm5hbWVcIixcbiAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgIFwibmFtZVwiOiBcIm93bmVyXCIsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgKHYyLyo6IGFueSovKSxcbiAgICAgICAgICAodjQvKjogYW55Ki8pLFxuICAgICAgICAgICh2My8qOiBhbnkqLylcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgICh2My8qOiBhbnkqLylcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICBcIm5hbWVcIjogXCJhdXRob3JcIixcbiAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICBcImFyZ3NcIjogbnVsbCxcbiAgICBcImNvbmNyZXRlVHlwZVwiOiBudWxsLFxuICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAodjIvKjogYW55Ki8pLFxuICAgICAgKHY0Lyo6IGFueSovKSxcbiAgICAgIHtcbiAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICBcIm5hbWVcIjogXCJhdmF0YXJVcmxcIixcbiAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICB9LFxuICAgICAgKHYzLyo6IGFueSovKVxuICAgIF1cbiAgfVxuXTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIlJlcXVlc3RcIixcbiAgXCJmcmFnbWVudFwiOiB7XG4gICAgXCJraW5kXCI6IFwiRnJhZ21lbnRcIixcbiAgICBcIm5hbWVcIjogXCJpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnlcIixcbiAgICBcInR5cGVcIjogXCJRdWVyeVwiLFxuICAgIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogKHYwLyo6IGFueSovKSxcbiAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgIFwibmFtZVwiOiBcInJlc291cmNlXCIsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICBcImFyZ3NcIjogKHYxLyo6IGFueSovKSxcbiAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJraW5kXCI6IFwiRnJhZ21lbnRTcHJlYWRcIixcbiAgICAgICAgICAgIFwibmFtZVwiOiBcImlzc3VlaXNoVG9vbHRpcENvbnRhaW5lcl9yZXNvdXJjZVwiLFxuICAgICAgICAgICAgXCJhcmdzXCI6IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG4gIFwib3BlcmF0aW9uXCI6IHtcbiAgICBcImtpbmRcIjogXCJPcGVyYXRpb25cIixcbiAgICBcIm5hbWVcIjogXCJpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnlcIixcbiAgICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogKHYwLyo6IGFueSovKSxcbiAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgIFwibmFtZVwiOiBcInJlc291cmNlXCIsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICBcImFyZ3NcIjogKHYxLyo6IGFueSovKSxcbiAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgKHYyLyo6IGFueSovKSxcbiAgICAgICAgICAodjMvKjogYW55Ki8pLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwia2luZFwiOiBcIklubGluZUZyYWdtZW50XCIsXG4gICAgICAgICAgICBcInR5cGVcIjogXCJJc3N1ZVwiLFxuICAgICAgICAgICAgXCJzZWxlY3Rpb25zXCI6ICh2NS8qOiBhbnkqLylcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwia2luZFwiOiBcIklubGluZUZyYWdtZW50XCIsXG4gICAgICAgICAgICBcInR5cGVcIjogXCJQdWxsUmVxdWVzdFwiLFxuICAgICAgICAgICAgXCJzZWxlY3Rpb25zXCI6ICh2NS8qOiBhbnkqLylcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG4gIFwicGFyYW1zXCI6IHtcbiAgICBcIm9wZXJhdGlvbktpbmRcIjogXCJxdWVyeVwiLFxuICAgIFwibmFtZVwiOiBcImlzc3VlaXNoVG9vbHRpcEl0ZW1RdWVyeVwiLFxuICAgIFwiaWRcIjogbnVsbCxcbiAgICBcInRleHRcIjogXCJxdWVyeSBpc3N1ZWlzaFRvb2x0aXBJdGVtUXVlcnkoXFxuICAkaXNzdWVpc2hVcmw6IFVSSSFcXG4pIHtcXG4gIHJlc291cmNlKHVybDogJGlzc3VlaXNoVXJsKSB7XFxuICAgIF9fdHlwZW5hbWVcXG4gICAgLi4uaXNzdWVpc2hUb29sdGlwQ29udGFpbmVyX3Jlc291cmNlXFxuICAgIC4uLiBvbiBOb2RlIHtcXG4gICAgICBpZFxcbiAgICB9XFxuICB9XFxufVxcblxcbmZyYWdtZW50IGlzc3VlaXNoVG9vbHRpcENvbnRhaW5lcl9yZXNvdXJjZSBvbiBVbmlmb3JtUmVzb3VyY2VMb2NhdGFibGUge1xcbiAgX190eXBlbmFtZVxcbiAgLi4uIG9uIElzc3VlIHtcXG4gICAgc3RhdGVcXG4gICAgbnVtYmVyXFxuICAgIHRpdGxlXFxuICAgIHJlcG9zaXRvcnkge1xcbiAgICAgIG5hbWVcXG4gICAgICBvd25lciB7XFxuICAgICAgICBfX3R5cGVuYW1lXFxuICAgICAgICBsb2dpblxcbiAgICAgICAgaWRcXG4gICAgICB9XFxuICAgICAgaWRcXG4gICAgfVxcbiAgICBhdXRob3Ige1xcbiAgICAgIF9fdHlwZW5hbWVcXG4gICAgICBsb2dpblxcbiAgICAgIGF2YXRhclVybFxcbiAgICAgIC4uLiBvbiBOb2RlIHtcXG4gICAgICAgIGlkXFxuICAgICAgfVxcbiAgICB9XFxuICB9XFxuICAuLi4gb24gUHVsbFJlcXVlc3Qge1xcbiAgICBzdGF0ZVxcbiAgICBudW1iZXJcXG4gICAgdGl0bGVcXG4gICAgcmVwb3NpdG9yeSB7XFxuICAgICAgbmFtZVxcbiAgICAgIG93bmVyIHtcXG4gICAgICAgIF9fdHlwZW5hbWVcXG4gICAgICAgIGxvZ2luXFxuICAgICAgICBpZFxcbiAgICAgIH1cXG4gICAgICBpZFxcbiAgICB9XFxuICAgIGF1dGhvciB7XFxuICAgICAgX190eXBlbmFtZVxcbiAgICAgIGxvZ2luXFxuICAgICAgYXZhdGFyVXJsXFxuICAgICAgLi4uIG9uIE5vZGUge1xcbiAgICAgICAgaWRcXG4gICAgICB9XFxuICAgIH1cXG4gIH1cXG59XFxuXCIsXG4gICAgXCJtZXRhZGF0YVwiOiB7fVxuICB9XG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnOGU2YjMyYjVjZGNkZDNkZWJjY2M3YWRhYTJiNGU4MmMnO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19