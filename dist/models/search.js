"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nullSearch = exports.default = void 0;

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const NULL = Symbol('null');
const CREATE_ON_EMPTY = Symbol('create on empty');

class Search {
  constructor(name, query, attrs = {}) {
    this.name = name;
    this.query = query;
    this.attrs = attrs;
  }

  getName() {
    return this.name;
  }

  createQuery() {
    return this.query;
  } // A null search has insufficient information to construct a canned query, so it should always return no results.


  isNull() {
    return this.attrs[NULL] || false;
  }

  showCreateOnEmpty() {
    return this.attrs[CREATE_ON_EMPTY] || false;
  }

  getWebURL(remote) {
    if (!remote.isGithubRepo()) {
      throw new Error(`Attempt to generate web URL for non-GitHub remote ${remote.getName()}`);
    }

    return `https://${remote.getDomain()}/search?q=${encodeURIComponent(this.createQuery())}`;
  }

  static inRemote(remote, name, query, attrs = {}) {
    if (!remote.isGithubRepo()) {
      return new this(name, '', _objectSpread2({}, attrs, {
        [NULL]: true
      }));
    }

    return new this(name, `repo:${remote.getOwner()}/${remote.getRepo()} ${query.trim()}`, attrs);
  }

}

exports.default = Search;
const nullSearch = new Search('', '', {
  [NULL]: true
});
exports.nullSearch = nullSearch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvc2VhcmNoLmpzIl0sIm5hbWVzIjpbIk5VTEwiLCJTeW1ib2wiLCJDUkVBVEVfT05fRU1QVFkiLCJTZWFyY2giLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJxdWVyeSIsImF0dHJzIiwiZ2V0TmFtZSIsImNyZWF0ZVF1ZXJ5IiwiaXNOdWxsIiwic2hvd0NyZWF0ZU9uRW1wdHkiLCJnZXRXZWJVUkwiLCJyZW1vdGUiLCJpc0dpdGh1YlJlcG8iLCJFcnJvciIsImdldERvbWFpbiIsImVuY29kZVVSSUNvbXBvbmVudCIsImluUmVtb3RlIiwiZ2V0T3duZXIiLCJnZXRSZXBvIiwidHJpbSIsIm51bGxTZWFyY2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsTUFBTUEsSUFBSSxHQUFHQyxNQUFNLENBQUMsTUFBRCxDQUFuQjtBQUNBLE1BQU1DLGVBQWUsR0FBR0QsTUFBTSxDQUFDLGlCQUFELENBQTlCOztBQUVlLE1BQU1FLE1BQU4sQ0FBYTtBQUMxQkMsRUFBQUEsV0FBVyxDQUFDQyxJQUFELEVBQU9DLEtBQVAsRUFBY0MsS0FBSyxHQUFHLEVBQXRCLEVBQTBCO0FBQ25DLFNBQUtGLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNEOztBQUVEQyxFQUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLEtBQUtILElBQVo7QUFDRDs7QUFFREksRUFBQUEsV0FBVyxHQUFHO0FBQ1osV0FBTyxLQUFLSCxLQUFaO0FBQ0QsR0FieUIsQ0FlMUI7OztBQUNBSSxFQUFBQSxNQUFNLEdBQUc7QUFDUCxXQUFPLEtBQUtILEtBQUwsQ0FBV1AsSUFBWCxLQUFvQixLQUEzQjtBQUNEOztBQUVEVyxFQUFBQSxpQkFBaUIsR0FBRztBQUNsQixXQUFPLEtBQUtKLEtBQUwsQ0FBV0wsZUFBWCxLQUErQixLQUF0QztBQUNEOztBQUVEVSxFQUFBQSxTQUFTLENBQUNDLE1BQUQsRUFBUztBQUNoQixRQUFJLENBQUNBLE1BQU0sQ0FBQ0MsWUFBUCxFQUFMLEVBQTRCO0FBQzFCLFlBQU0sSUFBSUMsS0FBSixDQUFXLHFEQUFvREYsTUFBTSxDQUFDTCxPQUFQLEVBQWlCLEVBQWhGLENBQU47QUFDRDs7QUFFRCxXQUFRLFdBQVVLLE1BQU0sQ0FBQ0csU0FBUCxFQUFtQixhQUFZQyxrQkFBa0IsQ0FBQyxLQUFLUixXQUFMLEVBQUQsQ0FBcUIsRUFBeEY7QUFDRDs7QUFFRCxTQUFPUyxRQUFQLENBQWdCTCxNQUFoQixFQUF3QlIsSUFBeEIsRUFBOEJDLEtBQTlCLEVBQXFDQyxLQUFLLEdBQUcsRUFBN0MsRUFBaUQ7QUFDL0MsUUFBSSxDQUFDTSxNQUFNLENBQUNDLFlBQVAsRUFBTCxFQUE0QjtBQUMxQixhQUFPLElBQUksSUFBSixDQUFTVCxJQUFULEVBQWUsRUFBZixxQkFBdUJFLEtBQXZCO0FBQThCLFNBQUNQLElBQUQsR0FBUTtBQUF0QyxTQUFQO0FBQ0Q7O0FBRUQsV0FBTyxJQUFJLElBQUosQ0FBU0ssSUFBVCxFQUFnQixRQUFPUSxNQUFNLENBQUNNLFFBQVAsRUFBa0IsSUFBR04sTUFBTSxDQUFDTyxPQUFQLEVBQWlCLElBQUdkLEtBQUssQ0FBQ2UsSUFBTixFQUFhLEVBQTdFLEVBQWdGZCxLQUFoRixDQUFQO0FBQ0Q7O0FBdEN5Qjs7O0FBeUNyQixNQUFNZSxVQUFVLEdBQUcsSUFBSW5CLE1BQUosQ0FBVyxFQUFYLEVBQWUsRUFBZixFQUFtQjtBQUFDLEdBQUNILElBQUQsR0FBUTtBQUFULENBQW5CLENBQW5CIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTlVMTCA9IFN5bWJvbCgnbnVsbCcpO1xuY29uc3QgQ1JFQVRFX09OX0VNUFRZID0gU3ltYm9sKCdjcmVhdGUgb24gZW1wdHknKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgY29uc3RydWN0b3IobmFtZSwgcXVlcnksIGF0dHJzID0ge30pIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgICB0aGlzLmF0dHJzID0gYXR0cnM7XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cblxuICBjcmVhdGVRdWVyeSgpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeTtcbiAgfVxuXG4gIC8vIEEgbnVsbCBzZWFyY2ggaGFzIGluc3VmZmljaWVudCBpbmZvcm1hdGlvbiB0byBjb25zdHJ1Y3QgYSBjYW5uZWQgcXVlcnksIHNvIGl0IHNob3VsZCBhbHdheXMgcmV0dXJuIG5vIHJlc3VsdHMuXG4gIGlzTnVsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyc1tOVUxMXSB8fCBmYWxzZTtcbiAgfVxuXG4gIHNob3dDcmVhdGVPbkVtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJzW0NSRUFURV9PTl9FTVBUWV0gfHwgZmFsc2U7XG4gIH1cblxuICBnZXRXZWJVUkwocmVtb3RlKSB7XG4gICAgaWYgKCFyZW1vdGUuaXNHaXRodWJSZXBvKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdCB0byBnZW5lcmF0ZSB3ZWIgVVJMIGZvciBub24tR2l0SHViIHJlbW90ZSAke3JlbW90ZS5nZXROYW1lKCl9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGBodHRwczovLyR7cmVtb3RlLmdldERvbWFpbigpfS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmNyZWF0ZVF1ZXJ5KCkpfWA7XG4gIH1cblxuICBzdGF0aWMgaW5SZW1vdGUocmVtb3RlLCBuYW1lLCBxdWVyeSwgYXR0cnMgPSB7fSkge1xuICAgIGlmICghcmVtb3RlLmlzR2l0aHViUmVwbygpKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMobmFtZSwgJycsIHsuLi5hdHRycywgW05VTExdOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyB0aGlzKG5hbWUsIGByZXBvOiR7cmVtb3RlLmdldE93bmVyKCl9LyR7cmVtb3RlLmdldFJlcG8oKX0gJHtxdWVyeS50cmltKCl9YCwgYXR0cnMpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBudWxsU2VhcmNoID0gbmV3IFNlYXJjaCgnJywgJycsIHtbTlVMTF06IHRydWV9KTtcbiJdfQ==