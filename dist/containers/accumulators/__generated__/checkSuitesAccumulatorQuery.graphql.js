/**
 * @flow
 * @relayHash 82a4dc1cfbeddf93b9ee378148cff9ce
 */

/* eslint-disable */
'use strict';
/*::
import type { ConcreteRequest } from 'relay-runtime';
type checkSuitesAccumulator_commit$ref = any;
export type checkSuitesAccumulatorQueryVariables = {|
  id: string,
  checkSuiteCount: number,
  checkSuiteCursor?: ?string,
  checkRunCount: number,
|};
export type checkSuitesAccumulatorQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: checkSuitesAccumulator_commit$ref
  |}
|};
export type checkSuitesAccumulatorQuery = {|
  variables: checkSuitesAccumulatorQueryVariables,
  response: checkSuitesAccumulatorQueryResponse,
|};
*/

/*
query checkSuitesAccumulatorQuery(
  $id: ID!
  $checkSuiteCount: Int!
  $checkSuiteCursor: String
  $checkRunCount: Int!
) {
  node(id: $id) {
    __typename
    ... on Commit {
      ...checkSuitesAccumulator_commit_4ncEVO
    }
    id
  }
}

fragment checkRunView_checkRun on CheckRun {
  name
  status
  conclusion
  title
  summary
  permalink
  detailsUrl
}

fragment checkRunsAccumulator_checkSuite_2YXw6r on CheckSuite {
  id
  checkRuns(first: $checkRunCount) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        status
        conclusion
        ...checkRunView_checkRun
        __typename
      }
    }
  }
}

fragment checkSuiteView_checkSuite on CheckSuite {
  app {
    name
    id
  }
  status
  conclusion
}

fragment checkSuitesAccumulator_commit_4ncEVO on Commit {
  id
  checkSuites(first: $checkSuiteCount, after: $checkSuiteCursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        status
        conclusion
        ...checkSuiteView_checkSuite
        ...checkRunsAccumulator_checkSuite_2YXw6r
        __typename
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
    "name": "id",
    "type": "ID!",
    "defaultValue": null
  }, {
    "kind": "LocalArgument",
    "name": "checkSuiteCount",
    "type": "Int!",
    "defaultValue": null
  }, {
    "kind": "LocalArgument",
    "name": "checkSuiteCursor",
    "type": "String",
    "defaultValue": null
  }, {
    "kind": "LocalArgument",
    "name": "checkRunCount",
    "type": "Int!",
    "defaultValue": null
  }],
      v1 = [{
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
      v4 = [{
    "kind": "Variable",
    "name": "after",
    "variableName": "checkSuiteCursor"
  }, {
    "kind": "Variable",
    "name": "first",
    "variableName": "checkSuiteCount"
  }],
      v5 = {
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
  },
      v6 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "cursor",
    "args": null,
    "storageKey": null
  },
      v7 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "status",
    "args": null,
    "storageKey": null
  },
      v8 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "conclusion",
    "args": null,
    "storageKey": null
  },
      v9 = {
    "kind": "ScalarField",
    "alias": null,
    "name": "name",
    "args": null,
    "storageKey": null
  },
      v10 = [{
    "kind": "Variable",
    "name": "first",
    "variableName": "checkRunCount"
  }];
  return {
    "kind": "Request",
    "fragment": {
      "kind": "Fragment",
      "name": "checkSuitesAccumulatorQuery",
      "type": "Query",
      "metadata": null,
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "node",
        "storageKey": null,
        "args": v1
        /*: any*/
        ,
        "concreteType": null,
        "plural": false,
        "selections": [{
          "kind": "InlineFragment",
          "type": "Commit",
          "selections": [{
            "kind": "FragmentSpread",
            "name": "checkSuitesAccumulator_commit",
            "args": [{
              "kind": "Variable",
              "name": "checkRunCount",
              "variableName": "checkRunCount"
            }, {
              "kind": "Variable",
              "name": "checkSuiteCount",
              "variableName": "checkSuiteCount"
            }, {
              "kind": "Variable",
              "name": "checkSuiteCursor",
              "variableName": "checkSuiteCursor"
            }]
          }]
        }]
      }]
    },
    "operation": {
      "kind": "Operation",
      "name": "checkSuitesAccumulatorQuery",
      "argumentDefinitions": v0
      /*: any*/
      ,
      "selections": [{
        "kind": "LinkedField",
        "alias": null,
        "name": "node",
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
          "type": "Commit",
          "selections": [{
            "kind": "LinkedField",
            "alias": null,
            "name": "checkSuites",
            "storageKey": null,
            "args": v4
            /*: any*/
            ,
            "concreteType": "CheckSuiteConnection",
            "plural": false,
            "selections": [v5
            /*: any*/
            , {
              "kind": "LinkedField",
              "alias": null,
              "name": "edges",
              "storageKey": null,
              "args": null,
              "concreteType": "CheckSuiteEdge",
              "plural": true,
              "selections": [v6
              /*: any*/
              , {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "CheckSuite",
                "plural": false,
                "selections": [v3
                /*: any*/
                , v7
                /*: any*/
                , v8
                /*: any*/
                , {
                  "kind": "LinkedField",
                  "alias": null,
                  "name": "app",
                  "storageKey": null,
                  "args": null,
                  "concreteType": "App",
                  "plural": false,
                  "selections": [v9
                  /*: any*/
                  , v3
                  /*: any*/
                  ]
                }, {
                  "kind": "LinkedField",
                  "alias": null,
                  "name": "checkRuns",
                  "storageKey": null,
                  "args": v10
                  /*: any*/
                  ,
                  "concreteType": "CheckRunConnection",
                  "plural": false,
                  "selections": [v5
                  /*: any*/
                  , {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "edges",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "CheckRunEdge",
                    "plural": true,
                    "selections": [v6
                    /*: any*/
                    , {
                      "kind": "LinkedField",
                      "alias": null,
                      "name": "node",
                      "storageKey": null,
                      "args": null,
                      "concreteType": "CheckRun",
                      "plural": false,
                      "selections": [v3
                      /*: any*/
                      , v7
                      /*: any*/
                      , v8
                      /*: any*/
                      , v9
                      /*: any*/
                      , {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "title",
                        "args": null,
                        "storageKey": null
                      }, {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "summary",
                        "args": null,
                        "storageKey": null
                      }, {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "permalink",
                        "args": null,
                        "storageKey": null
                      }, {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "detailsUrl",
                        "args": null,
                        "storageKey": null
                      }, v2
                      /*: any*/
                      ]
                    }]
                  }]
                }, {
                  "kind": "LinkedHandle",
                  "alias": null,
                  "name": "checkRuns",
                  "args": v10
                  /*: any*/
                  ,
                  "handle": "connection",
                  "key": "CheckRunsAccumulator_checkRuns",
                  "filters": null
                }, v2
                /*: any*/
                ]
              }]
            }]
          }, {
            "kind": "LinkedHandle",
            "alias": null,
            "name": "checkSuites",
            "args": v4
            /*: any*/
            ,
            "handle": "connection",
            "key": "CheckSuiteAccumulator_checkSuites",
            "filters": null
          }]
        }]
      }]
    },
    "params": {
      "operationKind": "query",
      "name": "checkSuitesAccumulatorQuery",
      "id": null,
      "text": "query checkSuitesAccumulatorQuery(\n  $id: ID!\n  $checkSuiteCount: Int!\n  $checkSuiteCursor: String\n  $checkRunCount: Int!\n) {\n  node(id: $id) {\n    __typename\n    ... on Commit {\n      ...checkSuitesAccumulator_commit_4ncEVO\n    }\n    id\n  }\n}\n\nfragment checkRunView_checkRun on CheckRun {\n  name\n  status\n  conclusion\n  title\n  summary\n  permalink\n  detailsUrl\n}\n\nfragment checkRunsAccumulator_checkSuite_2YXw6r on CheckSuite {\n  id\n  checkRuns(first: $checkRunCount) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    edges {\n      cursor\n      node {\n        id\n        status\n        conclusion\n        ...checkRunView_checkRun\n        __typename\n      }\n    }\n  }\n}\n\nfragment checkSuiteView_checkSuite on CheckSuite {\n  app {\n    name\n    id\n  }\n  status\n  conclusion\n}\n\nfragment checkSuitesAccumulator_commit_4ncEVO on Commit {\n  id\n  checkSuites(first: $checkSuiteCount, after: $checkSuiteCursor) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    edges {\n      cursor\n      node {\n        id\n        status\n        conclusion\n        ...checkSuiteView_checkSuite\n        ...checkRunsAccumulator_checkSuite_2YXw6r\n        __typename\n      }\n    }\n  }\n}\n",
      "metadata": {}
    }
  };
}(); // prettier-ignore


node
/*: any*/
.hash = 'b27827b6adb558a64ae6da715a8e438e';
module.exports = node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9jb250YWluZXJzL2FjY3VtdWxhdG9ycy9fX2dlbmVyYXRlZF9fL2NoZWNrU3VpdGVzQWNjdW11bGF0b3JRdWVyeS5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbIm5vZGUiLCJ2MCIsInYxIiwidjIiLCJ2MyIsInY0IiwidjUiLCJ2NiIsInY3IiwidjgiLCJ2OSIsInYxMCIsImhhc2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUFLQTtBQUVBO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZFQSxNQUFNQTtBQUFJO0FBQUEsRUFBeUIsWUFBVTtBQUM3QyxNQUFJQyxFQUFFLEdBQUcsQ0FDUDtBQUNFLFlBQVEsZUFEVjtBQUVFLFlBQVEsSUFGVjtBQUdFLFlBQVEsS0FIVjtBQUlFLG9CQUFnQjtBQUpsQixHQURPLEVBT1A7QUFDRSxZQUFRLGVBRFY7QUFFRSxZQUFRLGlCQUZWO0FBR0UsWUFBUSxNQUhWO0FBSUUsb0JBQWdCO0FBSmxCLEdBUE8sRUFhUDtBQUNFLFlBQVEsZUFEVjtBQUVFLFlBQVEsa0JBRlY7QUFHRSxZQUFRLFFBSFY7QUFJRSxvQkFBZ0I7QUFKbEIsR0FiTyxFQW1CUDtBQUNFLFlBQVEsZUFEVjtBQUVFLFlBQVEsZUFGVjtBQUdFLFlBQVEsTUFIVjtBQUlFLG9CQUFnQjtBQUpsQixHQW5CTyxDQUFUO0FBQUEsTUEwQkFDLEVBQUUsR0FBRyxDQUNIO0FBQ0UsWUFBUSxVQURWO0FBRUUsWUFBUSxJQUZWO0FBR0Usb0JBQWdCO0FBSGxCLEdBREcsQ0ExQkw7QUFBQSxNQWlDQUMsRUFBRSxHQUFHO0FBQ0gsWUFBUSxhQURMO0FBRUgsYUFBUyxJQUZOO0FBR0gsWUFBUSxZQUhMO0FBSUgsWUFBUSxJQUpMO0FBS0gsa0JBQWM7QUFMWCxHQWpD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LDBCQUFRLFdBSFY7QUFJRSwwQkFBU1E7QUFBRztBQUpkO0FBS0UsNEJBQVUsWUFMWjtBQU1FLHlCQUFPLGdDQU5UO0FBT0UsNkJBQVc7QUFQYixpQkFyRlksRUE4RlhSO0FBQUU7QUE5RlM7QUFSaEIsZUFGWTtBQVJoQixhQUZZO0FBUmhCLFdBRFksRUFrSVo7QUFDRSxvQkFBUSxjQURWO0FBRUUscUJBQVMsSUFGWDtBQUdFLG9CQUFRLGFBSFY7QUFJRSxvQkFBU0U7QUFBRTtBQUpiO0FBS0Usc0JBQVUsWUFMWjtBQU1FLG1CQUFPLG1DQU5UO0FBT0UsdUJBQVc7QUFQYixXQWxJWTtBQUhoQixTQUhZO0FBUmhCLE9BRFk7QUFKSCxLQWpEUjtBQXFOTCxjQUFVO0FBQ1IsdUJBQWlCLE9BRFQ7QUFFUixjQUFRLDZCQUZBO0FBR1IsWUFBTSxJQUhFO0FBSVIsY0FBUSx3dUNBSkE7QUFLUixrQkFBWTtBQUxKO0FBck5MLEdBQVA7QUE2TkMsQ0FyVmlDLEVBQWxDLEMsQ0FzVkE7OztBQUNDTDtBQUFJO0FBQUwsQ0FBZ0JZLElBQWhCLEdBQXVCLGtDQUF2QjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJkLElBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmxvd1xuICogQHJlbGF5SGFzaCA4MmE0ZGMxY2ZiZWRkZjkzYjllZTM3ODE0OGNmZjljZVxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyo6OlxuaW1wb3J0IHR5cGUgeyBDb25jcmV0ZVJlcXVlc3QgfSBmcm9tICdyZWxheS1ydW50aW1lJztcbnR5cGUgY2hlY2tTdWl0ZXNBY2N1bXVsYXRvcl9jb21taXQkcmVmID0gYW55O1xuZXhwb3J0IHR5cGUgY2hlY2tTdWl0ZXNBY2N1bXVsYXRvclF1ZXJ5VmFyaWFibGVzID0ge3xcbiAgaWQ6IHN0cmluZyxcbiAgY2hlY2tTdWl0ZUNvdW50OiBudW1iZXIsXG4gIGNoZWNrU3VpdGVDdXJzb3I/OiA/c3RyaW5nLFxuICBjaGVja1J1bkNvdW50OiBudW1iZXIsXG58fTtcbmV4cG9ydCB0eXBlIGNoZWNrU3VpdGVzQWNjdW11bGF0b3JRdWVyeVJlc3BvbnNlID0ge3xcbiAgK25vZGU6ID97fFxuICAgICskZnJhZ21lbnRSZWZzOiBjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdCRyZWZcbiAgfH1cbnx9O1xuZXhwb3J0IHR5cGUgY2hlY2tTdWl0ZXNBY2N1bXVsYXRvclF1ZXJ5ID0ge3xcbiAgdmFyaWFibGVzOiBjaGVja1N1aXRlc0FjY3VtdWxhdG9yUXVlcnlWYXJpYWJsZXMsXG4gIHJlc3BvbnNlOiBjaGVja1N1aXRlc0FjY3VtdWxhdG9yUXVlcnlSZXNwb25zZSxcbnx9O1xuKi9cblxuXG4vKlxucXVlcnkgY2hlY2tTdWl0ZXNBY2N1bXVsYXRvclF1ZXJ5KFxuICAkaWQ6IElEIVxuICAkY2hlY2tTdWl0ZUNvdW50OiBJbnQhXG4gICRjaGVja1N1aXRlQ3Vyc29yOiBTdHJpbmdcbiAgJGNoZWNrUnVuQ291bnQ6IEludCFcbikge1xuICBub2RlKGlkOiAkaWQpIHtcbiAgICBfX3R5cGVuYW1lXG4gICAgLi4uIG9uIENvbW1pdCB7XG4gICAgICAuLi5jaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdF80bmNFVk9cbiAgICB9XG4gICAgaWRcbiAgfVxufVxuXG5mcmFnbWVudCBjaGVja1J1blZpZXdfY2hlY2tSdW4gb24gQ2hlY2tSdW4ge1xuICBuYW1lXG4gIHN0YXR1c1xuICBjb25jbHVzaW9uXG4gIHRpdGxlXG4gIHN1bW1hcnlcbiAgcGVybWFsaW5rXG4gIGRldGFpbHNVcmxcbn1cblxuZnJhZ21lbnQgY2hlY2tSdW5zQWNjdW11bGF0b3JfY2hlY2tTdWl0ZV8yWVh3NnIgb24gQ2hlY2tTdWl0ZSB7XG4gIGlkXG4gIGNoZWNrUnVucyhmaXJzdDogJGNoZWNrUnVuQ291bnQpIHtcbiAgICBwYWdlSW5mbyB7XG4gICAgICBoYXNOZXh0UGFnZVxuICAgICAgZW5kQ3Vyc29yXG4gICAgfVxuICAgIGVkZ2VzIHtcbiAgICAgIGN1cnNvclxuICAgICAgbm9kZSB7XG4gICAgICAgIGlkXG4gICAgICAgIHN0YXR1c1xuICAgICAgICBjb25jbHVzaW9uXG4gICAgICAgIC4uLmNoZWNrUnVuVmlld19jaGVja1J1blxuICAgICAgICBfX3R5cGVuYW1lXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZyYWdtZW50IGNoZWNrU3VpdGVWaWV3X2NoZWNrU3VpdGUgb24gQ2hlY2tTdWl0ZSB7XG4gIGFwcCB7XG4gICAgbmFtZVxuICAgIGlkXG4gIH1cbiAgc3RhdHVzXG4gIGNvbmNsdXNpb25cbn1cblxuZnJhZ21lbnQgY2hlY2tTdWl0ZXNBY2N1bXVsYXRvcl9jb21taXRfNG5jRVZPIG9uIENvbW1pdCB7XG4gIGlkXG4gIGNoZWNrU3VpdGVzKGZpcnN0OiAkY2hlY2tTdWl0ZUNvdW50LCBhZnRlcjogJGNoZWNrU3VpdGVDdXJzb3IpIHtcbiAgICBwYWdlSW5mbyB7XG4gICAgICBoYXNOZXh0UGFnZVxuICAgICAgZW5kQ3Vyc29yXG4gICAgfVxuICAgIGVkZ2VzIHtcbiAgICAgIGN1cnNvclxuICAgICAgbm9kZSB7XG4gICAgICAgIGlkXG4gICAgICAgIHN0YXR1c1xuICAgICAgICBjb25jbHVzaW9uXG4gICAgICAgIC4uLmNoZWNrU3VpdGVWaWV3X2NoZWNrU3VpdGVcbiAgICAgICAgLi4uY2hlY2tSdW5zQWNjdW11bGF0b3JfY2hlY2tTdWl0ZV8yWVh3NnJcbiAgICAgICAgX190eXBlbmFtZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuKi9cblxuY29uc3Qgbm9kZS8qOiBDb25jcmV0ZVJlcXVlc3QqLyA9IChmdW5jdGlvbigpe1xudmFyIHYwID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgIFwibmFtZVwiOiBcImlkXCIsXG4gICAgXCJ0eXBlXCI6IFwiSUQhXCIsXG4gICAgXCJkZWZhdWx0VmFsdWVcIjogbnVsbFxuICB9LFxuICB7XG4gICAgXCJraW5kXCI6IFwiTG9jYWxBcmd1bWVudFwiLFxuICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVDb3VudFwiLFxuICAgIFwidHlwZVwiOiBcIkludCFcIixcbiAgICBcImRlZmF1bHRWYWx1ZVwiOiBudWxsXG4gIH0sXG4gIHtcbiAgICBcImtpbmRcIjogXCJMb2NhbEFyZ3VtZW50XCIsXG4gICAgXCJuYW1lXCI6IFwiY2hlY2tTdWl0ZUN1cnNvclwiLFxuICAgIFwidHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgfSxcbiAge1xuICAgIFwia2luZFwiOiBcIkxvY2FsQXJndW1lbnRcIixcbiAgICBcIm5hbWVcIjogXCJjaGVja1J1bkNvdW50XCIsXG4gICAgXCJ0eXBlXCI6IFwiSW50IVwiLFxuICAgIFwiZGVmYXVsdFZhbHVlXCI6IG51bGxcbiAgfVxuXSxcbnYxID0gW1xuICB7XG4gICAgXCJraW5kXCI6IFwiVmFyaWFibGVcIixcbiAgICBcIm5hbWVcIjogXCJpZFwiLFxuICAgIFwidmFyaWFibGVOYW1lXCI6IFwiaWRcIlxuICB9XG5dLFxudjIgPSB7XG4gIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gIFwiYWxpYXNcIjogbnVsbCxcbiAgXCJuYW1lXCI6IFwiX190eXBlbmFtZVwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn0sXG52MyA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJpZFwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn0sXG52NCA9IFtcbiAge1xuICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgXCJuYW1lXCI6IFwiYWZ0ZXJcIixcbiAgICBcInZhcmlhYmxlTmFtZVwiOiBcImNoZWNrU3VpdGVDdXJzb3JcIlxuICB9LFxuICB7XG4gICAgXCJraW5kXCI6IFwiVmFyaWFibGVcIixcbiAgICBcIm5hbWVcIjogXCJmaXJzdFwiLFxuICAgIFwidmFyaWFibGVOYW1lXCI6IFwiY2hlY2tTdWl0ZUNvdW50XCJcbiAgfVxuXSxcbnY1ID0ge1xuICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcInBhZ2VJbmZvXCIsXG4gIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJjb25jcmV0ZVR5cGVcIjogXCJQYWdlSW5mb1wiLFxuICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICB7XG4gICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgXCJuYW1lXCI6IFwiaGFzTmV4dFBhZ2VcIixcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICBcIm5hbWVcIjogXCJlbmRDdXJzb3JcIixcbiAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbiAgICB9XG4gIF1cbn0sXG52NiA9IHtcbiAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgXCJhbGlhc1wiOiBudWxsLFxuICBcIm5hbWVcIjogXCJjdXJzb3JcIixcbiAgXCJhcmdzXCI6IG51bGwsXG4gIFwic3RvcmFnZUtleVwiOiBudWxsXG59LFxudjcgPSB7XG4gIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gIFwiYWxpYXNcIjogbnVsbCxcbiAgXCJuYW1lXCI6IFwic3RhdHVzXCIsXG4gIFwiYXJnc1wiOiBudWxsLFxuICBcInN0b3JhZ2VLZXlcIjogbnVsbFxufSxcbnY4ID0ge1xuICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICBcImFsaWFzXCI6IG51bGwsXG4gIFwibmFtZVwiOiBcImNvbmNsdXNpb25cIixcbiAgXCJhcmdzXCI6IG51bGwsXG4gIFwic3RvcmFnZUtleVwiOiBudWxsXG59LFxudjkgPSB7XG4gIFwia2luZFwiOiBcIlNjYWxhckZpZWxkXCIsXG4gIFwiYWxpYXNcIjogbnVsbCxcbiAgXCJuYW1lXCI6IFwibmFtZVwiLFxuICBcImFyZ3NcIjogbnVsbCxcbiAgXCJzdG9yYWdlS2V5XCI6IG51bGxcbn0sXG52MTAgPSBbXG4gIHtcbiAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgIFwibmFtZVwiOiBcImZpcnN0XCIsXG4gICAgXCJ2YXJpYWJsZU5hbWVcIjogXCJjaGVja1J1bkNvdW50XCJcbiAgfVxuXTtcbnJldHVybiB7XG4gIFwia2luZFwiOiBcIlJlcXVlc3RcIixcbiAgXCJmcmFnbWVudFwiOiB7XG4gICAgXCJraW5kXCI6IFwiRnJhZ21lbnRcIixcbiAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlc0FjY3VtdWxhdG9yUXVlcnlcIixcbiAgICBcInR5cGVcIjogXCJRdWVyeVwiLFxuICAgIFwibWV0YWRhdGFcIjogbnVsbCxcbiAgICBcImFyZ3VtZW50RGVmaW5pdGlvbnNcIjogKHYwLyo6IGFueSovKSxcbiAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAge1xuICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgIFwibmFtZVwiOiBcIm5vZGVcIixcbiAgICAgICAgXCJzdG9yYWdlS2V5XCI6IG51bGwsXG4gICAgICAgIFwiYXJnc1wiOiAodjEvKjogYW55Ki8pLFxuICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBudWxsLFxuICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcImtpbmRcIjogXCJJbmxpbmVGcmFnbWVudFwiLFxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiQ29tbWl0XCIsXG4gICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiRnJhZ21lbnRTcHJlYWRcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlc0FjY3VtdWxhdG9yX2NvbW1pdFwiLFxuICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrUnVuQ291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ2YXJpYWJsZU5hbWVcIjogXCJjaGVja1J1bkNvdW50XCJcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIlZhcmlhYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrU3VpdGVDb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICBcInZhcmlhYmxlTmFtZVwiOiBcImNoZWNrU3VpdGVDb3VudFwiXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJWYXJpYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlQ3Vyc29yXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidmFyaWFibGVOYW1lXCI6IFwiY2hlY2tTdWl0ZUN1cnNvclwiXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuICBcIm9wZXJhdGlvblwiOiB7XG4gICAgXCJraW5kXCI6IFwiT3BlcmF0aW9uXCIsXG4gICAgXCJuYW1lXCI6IFwiY2hlY2tTdWl0ZXNBY2N1bXVsYXRvclF1ZXJ5XCIsXG4gICAgXCJhcmd1bWVudERlZmluaXRpb25zXCI6ICh2MC8qOiBhbnkqLyksXG4gICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICBcIm5hbWVcIjogXCJub2RlXCIsXG4gICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICBcImFyZ3NcIjogKHYxLyo6IGFueSovKSxcbiAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogbnVsbCxcbiAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgKHYyLyo6IGFueSovKSxcbiAgICAgICAgICAodjMvKjogYW55Ki8pLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwia2luZFwiOiBcIklubGluZUZyYWdtZW50XCIsXG4gICAgICAgICAgICBcInR5cGVcIjogXCJDb21taXRcIixcbiAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlc1wiLFxuICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICAgIFwiYXJnc1wiOiAodjQvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiQ2hlY2tTdWl0ZUNvbm5lY3Rpb25cIixcbiAgICAgICAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgKHY1Lyo6IGFueSovKSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiTGlua2VkRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJlZGdlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiY29uY3JldGVUeXBlXCI6IFwiQ2hlY2tTdWl0ZUVkZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwbHVyYWxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAodjYvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJub2RlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJDaGVja1N1aXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBsdXJhbFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICh2My8qOiBhbnkqLyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICh2Ny8qOiBhbnkqLyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICh2OC8qOiBhbnkqLyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJhcHBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIkFwcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjkvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHYzLyo6IGFueSovKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImNoZWNrUnVuc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiAodjEwLyo6IGFueSovKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbmNyZXRlVHlwZVwiOiBcIkNoZWNrUnVuQ29ubmVjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGx1cmFsXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2VsZWN0aW9uc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjUvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRGaWVsZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImVkZ2VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJDaGVja1J1bkVkZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbHVyYWxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzZWxlY3Rpb25zXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjYvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEZpZWxkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJub2RlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25jcmV0ZVR5cGVcIjogXCJDaGVja1J1blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbHVyYWxcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNlbGVjdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjMvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjcvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjgvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjkvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwidGl0bGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwic3VtbWFyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJTY2FsYXJGaWVsZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJwZXJtYWxpbmtcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyZ3NcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JhZ2VLZXlcIjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJraW5kXCI6IFwiU2NhbGFyRmllbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiZGV0YWlsc1VybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJnc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmFnZUtleVwiOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2Mi8qOiBhbnkqLylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtpbmRcIjogXCJMaW5rZWRIYW5kbGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiY2hlY2tSdW5zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmdzXCI6ICh2MTAvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGFuZGxlXCI6IFwiY29ubmVjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiQ2hlY2tSdW5zQWNjdW11bGF0b3JfY2hlY2tSdW5zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJzXCI6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHYyLyo6IGFueSovKVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwia2luZFwiOiBcIkxpbmtlZEhhbmRsZVwiLFxuICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJjaGVja1N1aXRlc1wiLFxuICAgICAgICAgICAgICAgIFwiYXJnc1wiOiAodjQvKjogYW55Ki8pLFxuICAgICAgICAgICAgICAgIFwiaGFuZGxlXCI6IFwiY29ubmVjdGlvblwiLFxuICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiQ2hlY2tTdWl0ZUFjY3VtdWxhdG9yX2NoZWNrU3VpdGVzXCIsXG4gICAgICAgICAgICAgICAgXCJmaWx0ZXJzXCI6IG51bGxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgXCJwYXJhbXNcIjoge1xuICAgIFwib3BlcmF0aW9uS2luZFwiOiBcInF1ZXJ5XCIsXG4gICAgXCJuYW1lXCI6IFwiY2hlY2tTdWl0ZXNBY2N1bXVsYXRvclF1ZXJ5XCIsXG4gICAgXCJpZFwiOiBudWxsLFxuICAgIFwidGV4dFwiOiBcInF1ZXJ5IGNoZWNrU3VpdGVzQWNjdW11bGF0b3JRdWVyeShcXG4gICRpZDogSUQhXFxuICAkY2hlY2tTdWl0ZUNvdW50OiBJbnQhXFxuICAkY2hlY2tTdWl0ZUN1cnNvcjogU3RyaW5nXFxuICAkY2hlY2tSdW5Db3VudDogSW50IVxcbikge1xcbiAgbm9kZShpZDogJGlkKSB7XFxuICAgIF9fdHlwZW5hbWVcXG4gICAgLi4uIG9uIENvbW1pdCB7XFxuICAgICAgLi4uY2hlY2tTdWl0ZXNBY2N1bXVsYXRvcl9jb21taXRfNG5jRVZPXFxuICAgIH1cXG4gICAgaWRcXG4gIH1cXG59XFxuXFxuZnJhZ21lbnQgY2hlY2tSdW5WaWV3X2NoZWNrUnVuIG9uIENoZWNrUnVuIHtcXG4gIG5hbWVcXG4gIHN0YXR1c1xcbiAgY29uY2x1c2lvblxcbiAgdGl0bGVcXG4gIHN1bW1hcnlcXG4gIHBlcm1hbGlua1xcbiAgZGV0YWlsc1VybFxcbn1cXG5cXG5mcmFnbWVudCBjaGVja1J1bnNBY2N1bXVsYXRvcl9jaGVja1N1aXRlXzJZWHc2ciBvbiBDaGVja1N1aXRlIHtcXG4gIGlkXFxuICBjaGVja1J1bnMoZmlyc3Q6ICRjaGVja1J1bkNvdW50KSB7XFxuICAgIHBhZ2VJbmZvIHtcXG4gICAgICBoYXNOZXh0UGFnZVxcbiAgICAgIGVuZEN1cnNvclxcbiAgICB9XFxuICAgIGVkZ2VzIHtcXG4gICAgICBjdXJzb3JcXG4gICAgICBub2RlIHtcXG4gICAgICAgIGlkXFxuICAgICAgICBzdGF0dXNcXG4gICAgICAgIGNvbmNsdXNpb25cXG4gICAgICAgIC4uLmNoZWNrUnVuVmlld19jaGVja1J1blxcbiAgICAgICAgX190eXBlbmFtZVxcbiAgICAgIH1cXG4gICAgfVxcbiAgfVxcbn1cXG5cXG5mcmFnbWVudCBjaGVja1N1aXRlVmlld19jaGVja1N1aXRlIG9uIENoZWNrU3VpdGUge1xcbiAgYXBwIHtcXG4gICAgbmFtZVxcbiAgICBpZFxcbiAgfVxcbiAgc3RhdHVzXFxuICBjb25jbHVzaW9uXFxufVxcblxcbmZyYWdtZW50IGNoZWNrU3VpdGVzQWNjdW11bGF0b3JfY29tbWl0XzRuY0VWTyBvbiBDb21taXQge1xcbiAgaWRcXG4gIGNoZWNrU3VpdGVzKGZpcnN0OiAkY2hlY2tTdWl0ZUNvdW50LCBhZnRlcjogJGNoZWNrU3VpdGVDdXJzb3IpIHtcXG4gICAgcGFnZUluZm8ge1xcbiAgICAgIGhhc05leHRQYWdlXFxuICAgICAgZW5kQ3Vyc29yXFxuICAgIH1cXG4gICAgZWRnZXMge1xcbiAgICAgIGN1cnNvclxcbiAgICAgIG5vZGUge1xcbiAgICAgICAgaWRcXG4gICAgICAgIHN0YXR1c1xcbiAgICAgICAgY29uY2x1c2lvblxcbiAgICAgICAgLi4uY2hlY2tTdWl0ZVZpZXdfY2hlY2tTdWl0ZVxcbiAgICAgICAgLi4uY2hlY2tSdW5zQWNjdW11bGF0b3JfY2hlY2tTdWl0ZV8yWVh3NnJcXG4gICAgICAgIF9fdHlwZW5hbWVcXG4gICAgICB9XFxuICAgIH1cXG4gIH1cXG59XFxuXCIsXG4gICAgXCJtZXRhZGF0YVwiOiB7fVxuICB9XG59O1xufSkoKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuKG5vZGUvKjogYW55Ki8pLmhhc2ggPSAnYjI3ODI3YjZhZGI1NThhNjRhZTZkYTcxNWE4ZTQzOGUnO1xubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuIl19