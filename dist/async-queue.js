"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Task {
  constructor(fn, parallel = true) {
    this.fn = fn;
    this.parallel = parallel;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  async execute() {
    try {
      const value = await this.fn.call(undefined);
      this.resolve(value);
    } catch (err) {
      this.reject(err);
    }
  }

  runsInParallel() {
    return this.parallel;
  }

  runsInSerial() {
    return !this.parallel;
  }

  getPromise() {
    return this.promise;
  }

}

class AsyncQueue {
  constructor(options = {}) {
    this.parallelism = options.parallelism || 1;
    this.nonParallelizableOperation = false;
    this.tasksInProgress = 0;
    this.queue = [];
  }

  push(fn, {
    parallel
  } = {
    parallel: true
  }) {
    const task = new Task(fn, parallel);
    this.queue.push(task);
    this.processQueue();
    return task.getPromise();
  }

  processQueue() {
    if (!this.queue.length || this.nonParallelizableOperation || this.disposed) {
      return;
    }

    const task = this.queue[0];
    const canRunParallelOp = task.runsInParallel() && this.tasksInProgress < this.parallelism;
    const canRunSerialOp = task.runsInSerial() && this.tasksInProgress === 0;

    if (canRunSerialOp || canRunParallelOp) {
      this.processTask(task, task.runsInParallel());
      this.queue.shift();
      this.processQueue();
    }
  }

  async processTask(task, runsInParallel) {
    if (this.disposed) {
      return;
    }

    this.tasksInProgress++;

    if (!runsInParallel) {
      this.nonParallelizableOperation = true;
    }

    try {
      await task.execute();
    } finally {
      this.tasksInProgress--;
      this.nonParallelizableOperation = false;
      this.processQueue();
    }
  }

  dispose() {
    this.queue = [];
    this.disposed = true;
  }

}

exports.default = AsyncQueue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9hc3luYy1xdWV1ZS5qcyJdLCJuYW1lcyI6WyJUYXNrIiwiY29uc3RydWN0b3IiLCJmbiIsInBhcmFsbGVsIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXhlY3V0ZSIsInZhbHVlIiwiY2FsbCIsInVuZGVmaW5lZCIsImVyciIsInJ1bnNJblBhcmFsbGVsIiwicnVuc0luU2VyaWFsIiwiZ2V0UHJvbWlzZSIsIkFzeW5jUXVldWUiLCJvcHRpb25zIiwicGFyYWxsZWxpc20iLCJub25QYXJhbGxlbGl6YWJsZU9wZXJhdGlvbiIsInRhc2tzSW5Qcm9ncmVzcyIsInF1ZXVlIiwicHVzaCIsInRhc2siLCJwcm9jZXNzUXVldWUiLCJsZW5ndGgiLCJkaXNwb3NlZCIsImNhblJ1blBhcmFsbGVsT3AiLCJjYW5SdW5TZXJpYWxPcCIsInByb2Nlc3NUYXNrIiwic2hpZnQiLCJkaXNwb3NlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsTUFBTUEsSUFBTixDQUFXO0FBQ1RDLEVBQUFBLFdBQVcsQ0FBQ0MsRUFBRCxFQUFLQyxRQUFRLEdBQUcsSUFBaEIsRUFBc0I7QUFDL0IsU0FBS0QsRUFBTCxHQUFVQSxFQUFWO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBSUMsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUM5QyxXQUFLRCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxXQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDRCxLQUhjLENBQWY7QUFJRDs7QUFFRCxRQUFNQyxPQUFOLEdBQWdCO0FBQ2QsUUFBSTtBQUNGLFlBQU1DLEtBQUssR0FBRyxNQUFNLEtBQUtQLEVBQUwsQ0FBUVEsSUFBUixDQUFhQyxTQUFiLENBQXBCO0FBQ0EsV0FBS0wsT0FBTCxDQUFhRyxLQUFiO0FBQ0QsS0FIRCxDQUdFLE9BQU9HLEdBQVAsRUFBWTtBQUNaLFdBQUtMLE1BQUwsQ0FBWUssR0FBWjtBQUNEO0FBQ0Y7O0FBRURDLEVBQUFBLGNBQWMsR0FBRztBQUNmLFdBQU8sS0FBS1YsUUFBWjtBQUNEOztBQUVEVyxFQUFBQSxZQUFZLEdBQUc7QUFDYixXQUFPLENBQUMsS0FBS1gsUUFBYjtBQUNEOztBQUVEWSxFQUFBQSxVQUFVLEdBQUc7QUFDWCxXQUFPLEtBQUtYLE9BQVo7QUFDRDs7QUE3QlE7O0FBZ0NJLE1BQU1ZLFVBQU4sQ0FBaUI7QUFDOUJmLEVBQUFBLFdBQVcsQ0FBQ2dCLE9BQU8sR0FBRyxFQUFYLEVBQWU7QUFDeEIsU0FBS0MsV0FBTCxHQUFtQkQsT0FBTyxDQUFDQyxXQUFSLElBQXVCLENBQTFDO0FBQ0EsU0FBS0MsMEJBQUwsR0FBa0MsS0FBbEM7QUFDQSxTQUFLQyxlQUFMLEdBQXVCLENBQXZCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDRDs7QUFFREMsRUFBQUEsSUFBSSxDQUFDcEIsRUFBRCxFQUFLO0FBQUNDLElBQUFBO0FBQUQsTUFBYTtBQUFDQSxJQUFBQSxRQUFRLEVBQUU7QUFBWCxHQUFsQixFQUFvQztBQUN0QyxVQUFNb0IsSUFBSSxHQUFHLElBQUl2QixJQUFKLENBQVNFLEVBQVQsRUFBYUMsUUFBYixDQUFiO0FBQ0EsU0FBS2tCLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQkMsSUFBaEI7QUFDQSxTQUFLQyxZQUFMO0FBQ0EsV0FBT0QsSUFBSSxDQUFDUixVQUFMLEVBQVA7QUFDRDs7QUFFRFMsRUFBQUEsWUFBWSxHQUFHO0FBQ2IsUUFBSSxDQUFDLEtBQUtILEtBQUwsQ0FBV0ksTUFBWixJQUFzQixLQUFLTiwwQkFBM0IsSUFBeUQsS0FBS08sUUFBbEUsRUFBNEU7QUFBRTtBQUFTOztBQUV2RixVQUFNSCxJQUFJLEdBQUcsS0FBS0YsS0FBTCxDQUFXLENBQVgsQ0FBYjtBQUNBLFVBQU1NLGdCQUFnQixHQUFHSixJQUFJLENBQUNWLGNBQUwsTUFBeUIsS0FBS08sZUFBTCxHQUF1QixLQUFLRixXQUE5RTtBQUNBLFVBQU1VLGNBQWMsR0FBR0wsSUFBSSxDQUFDVCxZQUFMLE1BQXVCLEtBQUtNLGVBQUwsS0FBeUIsQ0FBdkU7O0FBQ0EsUUFBSVEsY0FBYyxJQUFJRCxnQkFBdEIsRUFBd0M7QUFDdEMsV0FBS0UsV0FBTCxDQUFpQk4sSUFBakIsRUFBdUJBLElBQUksQ0FBQ1YsY0FBTCxFQUF2QjtBQUNBLFdBQUtRLEtBQUwsQ0FBV1MsS0FBWDtBQUNBLFdBQUtOLFlBQUw7QUFDRDtBQUNGOztBQUVELFFBQU1LLFdBQU4sQ0FBa0JOLElBQWxCLEVBQXdCVixjQUF4QixFQUF3QztBQUN0QyxRQUFJLEtBQUthLFFBQVQsRUFBbUI7QUFBRTtBQUFTOztBQUU5QixTQUFLTixlQUFMOztBQUNBLFFBQUksQ0FBQ1AsY0FBTCxFQUFxQjtBQUNuQixXQUFLTSwwQkFBTCxHQUFrQyxJQUFsQztBQUNEOztBQUVELFFBQUk7QUFDRixZQUFNSSxJQUFJLENBQUNmLE9BQUwsRUFBTjtBQUNELEtBRkQsU0FFVTtBQUNSLFdBQUtZLGVBQUw7QUFDQSxXQUFLRCwwQkFBTCxHQUFrQyxLQUFsQztBQUNBLFdBQUtLLFlBQUw7QUFDRDtBQUNGOztBQUVETyxFQUFBQSxPQUFPLEdBQUc7QUFDUixTQUFLVixLQUFMLEdBQWEsRUFBYjtBQUNBLFNBQUtLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRDs7QUFoRDZCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVGFzayB7XG4gIGNvbnN0cnVjdG9yKGZuLCBwYXJhbGxlbCA9IHRydWUpIHtcbiAgICB0aGlzLmZuID0gZm47XG4gICAgdGhpcy5wYXJhbGxlbCA9IHBhcmFsbGVsO1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgdGhpcy5mbi5jYWxsKHVuZGVmaW5lZCk7XG4gICAgICB0aGlzLnJlc29sdmUodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH1cblxuICBydW5zSW5QYXJhbGxlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJhbGxlbDtcbiAgfVxuXG4gIHJ1bnNJblNlcmlhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMucGFyYWxsZWw7XG4gIH1cblxuICBnZXRQcm9taXNlKCkge1xuICAgIHJldHVybiB0aGlzLnByb21pc2U7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXN5bmNRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGFyYWxsZWxpc20gPSBvcHRpb25zLnBhcmFsbGVsaXNtIHx8IDE7XG4gICAgdGhpcy5ub25QYXJhbGxlbGl6YWJsZU9wZXJhdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMudGFza3NJblByb2dyZXNzID0gMDtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gIH1cblxuICBwdXNoKGZuLCB7cGFyYWxsZWx9ID0ge3BhcmFsbGVsOiB0cnVlfSkge1xuICAgIGNvbnN0IHRhc2sgPSBuZXcgVGFzayhmbiwgcGFyYWxsZWwpO1xuICAgIHRoaXMucXVldWUucHVzaCh0YXNrKTtcbiAgICB0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuICAgIHJldHVybiB0YXNrLmdldFByb21pc2UoKTtcbiAgfVxuXG4gIHByb2Nlc3NRdWV1ZSgpIHtcbiAgICBpZiAoIXRoaXMucXVldWUubGVuZ3RoIHx8IHRoaXMubm9uUGFyYWxsZWxpemFibGVPcGVyYXRpb24gfHwgdGhpcy5kaXNwb3NlZCkgeyByZXR1cm47IH1cblxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnF1ZXVlWzBdO1xuICAgIGNvbnN0IGNhblJ1blBhcmFsbGVsT3AgPSB0YXNrLnJ1bnNJblBhcmFsbGVsKCkgJiYgdGhpcy50YXNrc0luUHJvZ3Jlc3MgPCB0aGlzLnBhcmFsbGVsaXNtO1xuICAgIGNvbnN0IGNhblJ1blNlcmlhbE9wID0gdGFzay5ydW5zSW5TZXJpYWwoKSAmJiB0aGlzLnRhc2tzSW5Qcm9ncmVzcyA9PT0gMDtcbiAgICBpZiAoY2FuUnVuU2VyaWFsT3AgfHwgY2FuUnVuUGFyYWxsZWxPcCkge1xuICAgICAgdGhpcy5wcm9jZXNzVGFzayh0YXNrLCB0YXNrLnJ1bnNJblBhcmFsbGVsKCkpO1xuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgICAgdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwcm9jZXNzVGFzayh0YXNrLCBydW5zSW5QYXJhbGxlbCkge1xuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy50YXNrc0luUHJvZ3Jlc3MrKztcbiAgICBpZiAoIXJ1bnNJblBhcmFsbGVsKSB7XG4gICAgICB0aGlzLm5vblBhcmFsbGVsaXphYmxlT3BlcmF0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGFzay5leGVjdXRlKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMudGFza3NJblByb2dyZXNzLS07XG4gICAgICB0aGlzLm5vblBhcmFsbGVsaXphYmxlT3BlcmF0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMuZGlzcG9zZWQgPSB0cnVlO1xuICB9XG59XG4iXX0=