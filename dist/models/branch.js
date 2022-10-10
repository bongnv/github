"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nullBranch = exports.default = void 0;
const DETACHED = Symbol('detached');
const REMOTE_TRACKING = Symbol('remote-tracking');

class Branch {
  constructor(name, upstream = nullBranch, push = upstream, head = false, attributes = {}) {
    this.name = name;
    this.upstream = upstream;
    this.push = push;
    this.head = head;
    this.attributes = attributes;
  }

  static createDetached(describe) {
    return new Branch(describe, nullBranch, nullBranch, true, {
      [DETACHED]: true
    });
  }

  static createRemoteTracking(refName, remoteName, remoteRef) {
    return new Branch(refName, nullBranch, nullBranch, false, {
      [REMOTE_TRACKING]: {
        remoteName,
        remoteRef
      }
    });
  }

  getName() {
    return this.name;
  }

  getShortRef() {
    return this.getName().replace(/^(refs\/)?((heads|remotes)\/)?/, '');
  }

  getFullRef() {
    if (this.isDetached()) {
      return '';
    }

    if (this.isRemoteTracking()) {
      if (this.name.startsWith('refs/')) {
        return this.name;
      } else if (this.name.startsWith('remotes/')) {
        return `refs/${this.name}`;
      }

      return `refs/remotes/${this.name}`;
    }

    if (this.name.startsWith('refs/')) {
      return this.name;
    } else if (this.name.startsWith('heads/')) {
      return `refs/${this.name}`;
    } else {
      return `refs/heads/${this.name}`;
    }
  }

  getRemoteName() {
    if (!this.isRemoteTracking()) {
      return '';
    }

    return this.attributes[REMOTE_TRACKING].remoteName || '';
  }

  getRemoteRef() {
    if (!this.isRemoteTracking()) {
      return '';
    }

    return this.attributes[REMOTE_TRACKING].remoteRef || '';
  }

  getShortRemoteRef() {
    return this.getRemoteRef().replace(/^(refs\/)?((heads|remotes)\/)?/, '');
  }

  getRefSpec(action) {
    if (this.isRemoteTracking()) {
      return '';
    }

    const remoteBranch = action === 'PUSH' ? this.push : this.upstream;
    const remoteBranchName = remoteBranch.getShortRemoteRef();
    const localBranchName = this.getName();

    if (remoteBranchName && remoteBranchName !== localBranchName) {
      if (action === 'PUSH') {
        return `${localBranchName}:${remoteBranchName}`;
      } else if (action === 'PULL') {
        return `${remoteBranchName}:${localBranchName}`;
      }
    }

    return localBranchName;
  }

  getSha() {
    return this.attributes.sha || '';
  }

  getUpstream() {
    return this.upstream;
  }

  getPush() {
    return this.push;
  }

  isHead() {
    return this.head;
  }

  isDetached() {
    return this.attributes[DETACHED] !== undefined;
  }

  isRemoteTracking() {
    return this.attributes[REMOTE_TRACKING] !== undefined;
  }

  isPresent() {
    return true;
  }

}

exports.default = Branch;
const nullBranch = {
  getName() {
    return '';
  },

  getShortRef() {
    return '';
  },

  getFullRef() {
    return '';
  },

  getSha() {
    return '';
  },

  getUpstream() {
    return this;
  },

  getPush() {
    return this;
  },

  isHead() {
    return false;
  },

  getRemoteName() {
    return '';
  },

  getRemoteRef() {
    return '';
  },

  getShortRemoteRef() {
    return '';
  },

  isDetached() {
    return false;
  },

  isRemoteTracking() {
    return false;
  },

  isPresent() {
    return false;
  },

  inspect(depth, options) {
    return '{nullBranch}';
  }

};
exports.nullBranch = nullBranch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvYnJhbmNoLmpzIl0sIm5hbWVzIjpbIkRFVEFDSEVEIiwiU3ltYm9sIiwiUkVNT1RFX1RSQUNLSU5HIiwiQnJhbmNoIiwiY29uc3RydWN0b3IiLCJuYW1lIiwidXBzdHJlYW0iLCJudWxsQnJhbmNoIiwicHVzaCIsImhlYWQiLCJhdHRyaWJ1dGVzIiwiY3JlYXRlRGV0YWNoZWQiLCJkZXNjcmliZSIsImNyZWF0ZVJlbW90ZVRyYWNraW5nIiwicmVmTmFtZSIsInJlbW90ZU5hbWUiLCJyZW1vdGVSZWYiLCJnZXROYW1lIiwiZ2V0U2hvcnRSZWYiLCJyZXBsYWNlIiwiZ2V0RnVsbFJlZiIsImlzRGV0YWNoZWQiLCJpc1JlbW90ZVRyYWNraW5nIiwic3RhcnRzV2l0aCIsImdldFJlbW90ZU5hbWUiLCJnZXRSZW1vdGVSZWYiLCJnZXRTaG9ydFJlbW90ZVJlZiIsImdldFJlZlNwZWMiLCJhY3Rpb24iLCJyZW1vdGVCcmFuY2giLCJyZW1vdGVCcmFuY2hOYW1lIiwibG9jYWxCcmFuY2hOYW1lIiwiZ2V0U2hhIiwic2hhIiwiZ2V0VXBzdHJlYW0iLCJnZXRQdXNoIiwiaXNIZWFkIiwidW5kZWZpbmVkIiwiaXNQcmVzZW50IiwiaW5zcGVjdCIsImRlcHRoIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsTUFBTUEsUUFBUSxHQUFHQyxNQUFNLENBQUMsVUFBRCxDQUF2QjtBQUNBLE1BQU1DLGVBQWUsR0FBR0QsTUFBTSxDQUFDLGlCQUFELENBQTlCOztBQUVlLE1BQU1FLE1BQU4sQ0FBYTtBQUMxQkMsRUFBQUEsV0FBVyxDQUFDQyxJQUFELEVBQU9DLFFBQVEsR0FBR0MsVUFBbEIsRUFBOEJDLElBQUksR0FBR0YsUUFBckMsRUFBK0NHLElBQUksR0FBRyxLQUF0RCxFQUE2REMsVUFBVSxHQUFHLEVBQTFFLEVBQThFO0FBQ3ZGLFNBQUtMLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FB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QUNELEdBZnVCOztBQWlCeEJFLEVBQUFBLFdBQVcsR0FBRztBQUNaLFdBQU8sSUFBUDtBQUNELEdBbkJ1Qjs7QUFxQnhCQyxFQUFBQSxPQUFPLEdBQUc7QUFDUixXQUFPLElBQVA7QUFDRCxHQXZCdUI7O0FBeUJ4QkMsRUFBQUEsTUFBTSxHQUFHO0FBQ1AsV0FBTyxLQUFQO0FBQ0QsR0EzQnVCOztBQTZCeEJaLEVBQUFBLGFBQWEsR0FBRztBQUNkLFdBQU8sRUFBUDtBQUNELEdBL0J1Qjs7QUFpQ3hCQyxFQUFBQSxZQUFZLEdBQUc7QUFDYixXQUFPLEVBQVA7QUFDRCxHQW5DdUI7O0FBcUN4QkMsRUFBQUEsaUJBQWlCLEdBQUc7QUFDbEIsV0FBTyxFQUFQO0FBQ0QsR0F2Q3VCOztBQXlDeEJMLEVBQUFBLFVBQVUsR0FBRztBQUNYLFdBQU8sS0FBUDtBQUNELEdBM0N1Qjs7QUE2Q3hCQyxFQUFBQSxnQkFBZ0IsR0FBRztBQUNqQixXQUFPLEtBQVA7QUFDRCxHQS9DdUI7O0FBaUR4QmdCLEVBQUFBLFNBQVMsR0FBRztBQUNWLFdBQU8sS0FBUDtBQUNELEdBbkR1Qjs7QUFxRHhCQyxFQUFBQSxPQUFPLENBQUNDLEtBQUQsRUFBUUMsT0FBUixFQUFpQjtBQUN0QixXQUFPLGNBQVA7QUFDRDs7QUF2RHVCLENBQW5CIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgREVUQUNIRUQgPSBTeW1ib2woJ2RldGFjaGVkJyk7XG5jb25zdCBSRU1PVEVfVFJBQ0tJTkcgPSBTeW1ib2woJ3JlbW90ZS10cmFja2luZycpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmFuY2gge1xuICBjb25zdHJ1Y3RvcihuYW1lLCB1cHN0cmVhbSA9IG51bGxCcmFuY2gsIHB1c2ggPSB1cHN0cmVhbSwgaGVhZCA9IGZhbHNlLCBhdHRyaWJ1dGVzID0ge30pIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudXBzdHJlYW0gPSB1cHN0cmVhbTtcbiAgICB0aGlzLnB1c2ggPSBwdXNoO1xuICAgIHRoaXMuaGVhZCA9IGhlYWQ7XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVEZXRhY2hlZChkZXNjcmliZSkge1xuICAgIHJldHVybiBuZXcgQnJhbmNoKGRlc2NyaWJlLCBudWxsQnJhbmNoLCBudWxsQnJhbmNoLCB0cnVlLCB7W0RFVEFDSEVEXTogdHJ1ZX0pO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZVJlbW90ZVRyYWNraW5nKHJlZk5hbWUsIHJlbW90ZU5hbWUsIHJlbW90ZVJlZikge1xuICAgIHJldHVybiBuZXcgQnJhbmNoKHJlZk5hbWUsIG51bGxCcmFuY2gsIG51bGxCcmFuY2gsIGZhbHNlLCB7W1JFTU9URV9UUkFDS0lOR106IHtyZW1vdGVOYW1lLCByZW1vdGVSZWZ9fSk7XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cblxuICBnZXRTaG9ydFJlZigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXROYW1lKCkucmVwbGFjZSgvXihyZWZzXFwvKT8oKGhlYWRzfHJlbW90ZXMpXFwvKT8vLCAnJyk7XG4gIH1cblxuICBnZXRGdWxsUmVmKCkge1xuICAgIGlmICh0aGlzLmlzRGV0YWNoZWQoKSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzUmVtb3RlVHJhY2tpbmcoKSkge1xuICAgICAgaWYgKHRoaXMubmFtZS5zdGFydHNXaXRoKCdyZWZzLycpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubmFtZS5zdGFydHNXaXRoKCdyZW1vdGVzLycpKSB7XG4gICAgICAgIHJldHVybiBgcmVmcy8ke3RoaXMubmFtZX1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGByZWZzL3JlbW90ZXMvJHt0aGlzLm5hbWV9YDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5uYW1lLnN0YXJ0c1dpdGgoJ3JlZnMvJykpIHtcbiAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWUuc3RhcnRzV2l0aCgnaGVhZHMvJykpIHtcbiAgICAgIHJldHVybiBgcmVmcy8ke3RoaXMubmFtZX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHJlZnMvaGVhZHMvJHt0aGlzLm5hbWV9YDtcbiAgICB9XG4gIH1cblxuICBnZXRSZW1vdGVOYW1lKCkge1xuICAgIGlmICghdGhpcy5pc1JlbW90ZVRyYWNraW5nKCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1tSRU1PVEVfVFJBQ0tJTkddLnJlbW90ZU5hbWUgfHwgJyc7XG4gIH1cblxuICBnZXRSZW1vdGVSZWYoKSB7XG4gICAgaWYgKCF0aGlzLmlzUmVtb3RlVHJhY2tpbmcoKSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW1JFTU9URV9UUkFDS0lOR10ucmVtb3RlUmVmIHx8ICcnO1xuICB9XG5cbiAgZ2V0U2hvcnRSZW1vdGVSZWYoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVtb3RlUmVmKCkucmVwbGFjZSgvXihyZWZzXFwvKT8oKGhlYWRzfHJlbW90ZXMpXFwvKT8vLCAnJyk7XG4gIH1cblxuICBnZXRSZWZTcGVjKGFjdGlvbikge1xuICAgIGlmICh0aGlzLmlzUmVtb3RlVHJhY2tpbmcoKSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCByZW1vdGVCcmFuY2ggPSBhY3Rpb24gPT09ICdQVVNIJyA/IHRoaXMucHVzaCA6IHRoaXMudXBzdHJlYW07XG4gICAgY29uc3QgcmVtb3RlQnJhbmNoTmFtZSA9IHJlbW90ZUJyYW5jaC5nZXRTaG9ydFJlbW90ZVJlZigpO1xuICAgIGNvbnN0IGxvY2FsQnJhbmNoTmFtZSA9IHRoaXMuZ2V0TmFtZSgpO1xuICAgIGlmIChyZW1vdGVCcmFuY2hOYW1lICYmIHJlbW90ZUJyYW5jaE5hbWUgIT09IGxvY2FsQnJhbmNoTmFtZSkge1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ1BVU0gnKSB7XG4gICAgICAgIHJldHVybiBgJHtsb2NhbEJyYW5jaE5hbWV9OiR7cmVtb3RlQnJhbmNoTmFtZX1gO1xuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdQVUxMJykge1xuICAgICAgICByZXR1cm4gYCR7cmVtb3RlQnJhbmNoTmFtZX06JHtsb2NhbEJyYW5jaE5hbWV9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxvY2FsQnJhbmNoTmFtZTtcbiAgfVxuXG4gIGdldFNoYSgpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzLnNoYSB8fCAnJztcbiAgfVxuXG4gIGdldFVwc3RyZWFtKCkge1xuICAgIHJldHVybiB0aGlzLnVwc3RyZWFtO1xuICB9XG5cbiAgZ2V0UHVzaCgpIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoO1xuICB9XG5cbiAgaXNIZWFkKCkge1xuICAgIHJldHVybiB0aGlzLmhlYWQ7XG4gIH1cblxuICBpc0RldGFjaGVkKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbREVUQUNIRURdICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBpc1JlbW90ZVRyYWNraW5nKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbUkVNT1RFX1RSQUNLSU5HXSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNQcmVzZW50KCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn1cblxuZXhwb3J0IGNvbnN0IG51bGxCcmFuY2ggPSB7XG4gIGdldE5hbWUoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIGdldFNob3J0UmVmKCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcblxuICBnZXRGdWxsUmVmKCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcblxuICBnZXRTaGEoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIGdldFVwc3RyZWFtKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGdldFB1c2goKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgaXNIZWFkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBnZXRSZW1vdGVOYW1lKCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcblxuICBnZXRSZW1vdGVSZWYoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIGdldFNob3J0UmVtb3RlUmVmKCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcblxuICBpc0RldGFjaGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBpc1JlbW90ZVRyYWNraW5nKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBpc1ByZXNlbnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGluc3BlY3QoZGVwdGgsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gJ3tudWxsQnJhbmNofSc7XG4gIH0sXG59O1xuIl19