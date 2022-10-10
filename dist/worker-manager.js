"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Operation = exports.RendererProcess = exports.Worker = exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _querystring = _interopRequireDefault(require("querystring"));

var _electron = require("electron");

var _eventKit = require("event-kit");

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  BrowserWindow
} = _electron.remote;

class WorkerManager {
  static getInstance() {
    if (!this.instance) {
      this.instance = new WorkerManager();
    }

    return this.instance;
  }

  static reset(force) {
    if (this.instance) {
      this.instance.destroy(force);
    }

    this.instance = null;
  }

  constructor() {
    (0, _helpers.autobind)(this, 'onDestroyed', 'onCrashed', 'onSick');
    this.workers = new Set();
    this.activeWorker = null;
    this.createNewWorker();
  }

  isReady() {
    return this.activeWorker.isReady();
  }

  request(data) {
    if (this.destroyed) {
      throw new Error('Worker is destroyed');
    }

    let operation;
    const requestPromise = new Promise((resolve, reject) => {
      operation = new Operation(data, resolve, reject);
      return this.activeWorker.executeOperation(operation);
    });
    operation.setPromise(requestPromise);
    return {
      cancel: () => this.activeWorker.cancelOperation(operation),
      promise: requestPromise
    };
  }

  createNewWorker({
    operationCountLimit
  } = {
    operationCountLimit: 10
  }) {
    if (this.destroyed) {
      return;
    }

    this.activeWorker = new Worker({
      operationCountLimit,
      onDestroyed: this.onDestroyed,
      onCrashed: this.onCrashed,
      onSick: this.onSick
    });
    this.workers.add(this.activeWorker);
  }

  onDestroyed(destroyedWorker) {
    this.workers.delete(destroyedWorker);
  }

  onCrashed(crashedWorker) {
    if (crashedWorker === this.getActiveWorker()) {
      this.createNewWorker({
        operationCountLimit: crashedWorker.getOperationCountLimit()
      });
    }

    crashedWorker.getRemainingOperations().forEach(operation => this.activeWorker.executeOperation(operation));
  }

  onSick(sickWorker) {
    if (!atom.inSpecMode()) {
      // eslint-disable-next-line no-console
      console.warn(`Sick worker detected.
        operationCountLimit: ${sickWorker.getOperationCountLimit()},
        completed operation count: ${sickWorker.getCompletedOperationCount()}`);
    }

    const operationCountLimit = this.calculateNewOperationCountLimit(sickWorker);
    return this.createNewWorker({
      operationCountLimit
    });
  }

  calculateNewOperationCountLimit(lastWorker) {
    let operationCountLimit = 10;

    if (lastWorker.getOperationCountLimit() >= lastWorker.getCompletedOperationCount()) {
      operationCountLimit = Math.min(lastWorker.getOperationCountLimit() * 2, 100);
    }

    return operationCountLimit;
  }

  getActiveWorker() {
    return this.activeWorker;
  }

  getReadyPromise() {
    return this.activeWorker.getReadyPromise();
  }

  destroy(force) {
    this.destroyed = true;
    this.workers.forEach(worker => worker.destroy(force));
  }

}

exports.default = WorkerManager;

_defineProperty(WorkerManager, "instance", null);

class Worker {
  constructor({
    operationCountLimit,
    onSick,
    onCrashed,
    onDestroyed
  }) {
    (0, _helpers.autobind)(this, 'handleDataReceived', 'onOperationComplete', 'handleCancelled', 'handleExecStarted', 'handleSpawnError', 'handleStdinError', 'handleSick', 'handleCrashed');
    this.operationCountLimit = operationCountLimit;
    this.onSick = onSick;
    this.onCrashed = onCrashed;
    this.onDestroyed = onDestroyed;
    this.operationsById = new Map();
    this.completedOperationCount = 0;
    this.sick = false;
    this.rendererProcess = new RendererProcess({
      loadUrl: this.getLoadUrl(operationCountLimit),
      onData: this.handleDataReceived,
      onCancelled: this.handleCancelled,
      onExecStarted: this.handleExecStarted,
      onSpawnError: this.handleSpawnError,
      onStdinError: this.handleStdinError,
      onSick: this.handleSick,
      onCrashed: this.handleCrashed,
      onDestroyed: this.destroy
    });
  }

  isReady() {
    return this.rendererProcess.isReady();
  }

  getLoadUrl(operationCountLimit) {
    const htmlPath = _path.default.join((0, _helpers.getPackageRoot)(), 'lib', 'renderer.html');

    const rendererJsPath = _path.default.join((0, _helpers.getPackageRoot)(), 'lib', 'worker.js');

    const qs = _querystring.default.stringify({
      js: rendererJsPath,
      managerWebContentsId: this.getWebContentsId(),
      operationCountLimit,
      channelName: Worker.channelName
    });

    return `file://${htmlPath}?${qs}`;
  }

  getWebContentsId() {
    return _electron.remote.getCurrentWebContents().id;
  }

  executeOperation(operation) {
    this.operationsById.set(operation.id, operation);
    operation.onComplete(this.onOperationComplete);
    return this.rendererProcess.executeOperation(operation);
  }

  cancelOperation(operation) {
    return this.rendererProcess.cancelOperation(operation);
  }

  handleDataReceived({
    id,
    results
  }) {
    const operation = this.operationsById.get(id);
    operation.complete(results, data => {
      const {
        timing
      } = data;
      const totalInternalTime = timing.execTime + timing.spawnTime;
      const ipcTime = operation.getExecutionTime() - totalInternalTime;
      data.timing.ipcTime = ipcTime;
      return data;
    });
  }

  onOperationComplete(operation) {
    this.completedOperationCount++;
    this.operationsById.delete(operation.id);

    if (this.sick && this.operationsById.size === 0) {
      this.destroy();
    }
  }

  handleCancelled({
    id
  }) {
    const operation = this.operationsById.get(id);

    if (operation) {
      // handleDataReceived() can be received before handleCancelled()
      operation.wasCancelled();
    }
  }

  handleExecStarted({
    id
  }) {
    const operation = this.operationsById.get(id);
    operation.setInProgress();
  }

  handleSpawnError({
    id,
    err
  }) {
    const operation = this.operationsById.get(id);
    operation.error(err);
  }

  handleStdinError({
    id,
    stdin,
    err
  }) {
    const operation = this.operationsById.get(id);
    operation.error(err);
  }

  handleSick() {
    this.sick = true;
    this.onSick(this);
  }

  handleCrashed() {
    this.onCrashed(this);
    this.destroy();
  }

  getOperationCountLimit() {
    return this.operationCountLimit;
  }

  getCompletedOperationCount() {
    return this.completedOperationCount;
  }

  getRemainingOperations() {
    return Array.from(this.operationsById.values());
  }

  getPid() {
    return this.rendererProcess.getPid();
  }

  getReadyPromise() {
    return this.rendererProcess.getReadyPromise();
  }

  async destroy(force) {
    this.onDestroyed(this);

    if (this.operationsById.size > 0 && !force) {
      const remainingOperationPromises = this.getRemainingOperations().map(operation => operation.getPromise().catch(() => null));
      await Promise.all(remainingOperationPromises);
    }

    this.rendererProcess.destroy();
  }

}
/*
Sends operations to renderer processes
*/


exports.Worker = Worker;

_defineProperty(Worker, "channelName", 'github:renderer-ipc');

class RendererProcess {
  constructor({
    loadUrl,
    onDestroyed,
    onCrashed,
    onSick,
    onData,
    onCancelled,
    onSpawnError,
    onStdinError,
    onExecStarted
  }) {
    (0, _helpers.autobind)(this, 'handleDestroy');
    this.onDestroyed = onDestroyed;
    this.onCrashed = onCrashed;
    this.onSick = onSick;
    this.onData = onData;
    this.onCancelled = onCancelled;
    this.onSpawnError = onSpawnError;
    this.onStdinError = onStdinError;
    this.onExecStarted = onExecStarted;
    this.win = new BrowserWindow({
      show: !!process.env.ATOM_GITHUB_SHOW_RENDERER_WINDOW,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        // The default of contextIsolation is changed to true so we'll have to set it to false.
        // See https://github.com/electron/electron/issues/23506 for more information
        contextIsolation: false
      }
    });
    this.webContents = this.win.webContents; // this.webContents.openDevTools();

    this.emitter = new _eventKit.Emitter();
    this.subscriptions = new _eventKit.CompositeDisposable();
    this.registerListeners();
    this.win.loadURL(loadUrl);
    this.win.webContents.on('crashed', this.handleDestroy);
    this.win.webContents.on('destroyed', this.handleDestroy);
    this.subscriptions.add(new _eventKit.Disposable(() => {
      if (!this.win.isDestroyed()) {
        this.win.webContents.removeListener('crashed', this.handleDestroy);
        this.win.webContents.removeListener('destroyed', this.handleDestroy);
        this.win.destroy();
      }
    }), this.emitter);
    this.ready = false;
    this.readyPromise = new Promise(resolve => {
      this.resolveReady = resolve;
    });
  }

  isReady() {
    return this.ready;
  }

  handleDestroy(...args) {
    this.destroy();
    this.onCrashed(...args);
  }

  registerListeners() {
    const handleMessages = (event, {
      sourceWebContentsId,
      type,
      data
    }) => {
      if (sourceWebContentsId === this.win.webContents.id) {
        this.emitter.emit(type, data);
      }
    };

    _electron.ipcRenderer.on(Worker.channelName, handleMessages);

    this.emitter.on('renderer-ready', ({
      pid
    }) => {
      this.pid = pid;
      this.ready = true;
      this.resolveReady();
    });
    this.emitter.on('git-data', this.onData);
    this.emitter.on('git-cancelled', this.onCancelled);
    this.emitter.on('git-spawn-error', this.onSpawnError);
    this.emitter.on('git-stdin-error', this.onStdinError);
    this.emitter.on('slow-spawns', this.onSick); // not currently used to avoid clogging up ipc channel
    // keeping it around as it's potentially useful for avoiding duplicate write operations upon renderer crashing

    this.emitter.on('exec-started', this.onExecStarted);
    this.subscriptions.add(new _eventKit.Disposable(() => _electron.ipcRenderer.removeListener(Worker.channelName, handleMessages)));
  }

  executeOperation(operation) {
    return operation.execute(payload => {
      if (this.destroyed) {
        return null;
      }

      return this.webContents.send(Worker.channelName, {
        type: 'git-exec',
        data: payload
      });
    });
  }

  cancelOperation(operation) {
    return operation.cancel(payload => {
      if (this.destroyed) {
        return null;
      }

      return this.webContents.send(Worker.channelName, {
        type: 'git-cancel',
        data: payload
      });
    });
  }

  getPid() {
    return this.pid;
  }

  getReadyPromise() {
    return this.readyPromise;
  }

  destroy() {
    this.destroyed = true;
    this.subscriptions.dispose();
  }

}

exports.RendererProcess = RendererProcess;

class Operation {
  constructor(data, resolve, reject) {
    this.id = Operation.id++;
    this.data = data;
    this.resolve = resolve;
    this.reject = reject;
    this.promise = null;

    this.cancellationResolve = () => {};

    this.startTime = null;
    this.endTime = null;
    this.status = Operation.status.PENDING;
    this.results = null;
    this.emitter = new _eventKit.Emitter();
  }

  onComplete(cb) {
    return this.emitter.on('complete', cb);
  }

  setPromise(promise) {
    this.promise = promise;
  }

  getPromise() {
    return this.promise;
  }

  setInProgress() {
    // after exec has been called but before results a received
    this.status = Operation.status.INPROGRESS;
  }

  getExecutionTime() {
    if (!this.startTime || !this.endTime) {
      return NaN;
    } else {
      return this.endTime - this.startTime;
    }
  }

  complete(results, mutate = data => data) {
    this.endTime = performance.now();
    this.results = results;
    this.resolve(mutate(results));
    this.cancellationResolve();
    this.status = Operation.status.COMPLETE;
    this.emitter.emit('complete', this);
    this.emitter.dispose();
  }

  wasCancelled() {
    this.status = Operation.status.CANCELLED;
    this.cancellationResolve();
  }

  error(results) {
    this.endTime = performance.now();
    const err = new Error(results.message, results.fileName, results.lineNumber);
    err.stack = results.stack;
    this.reject(err);
  }

  execute(execFn) {
    this.startTime = performance.now();
    return execFn(_objectSpread2({}, this.data, {
      id: this.id
    }));
  }

  cancel(execFn) {
    return new Promise(resolve => {
      this.status = Operation.status.CANCELLING;
      this.cancellationResolve = resolve;
      execFn({
        id: this.id
      });
    });
  }

}

exports.Operation = Operation;

_defineProperty(Operation, "status", {
  PENDING: Symbol('pending'),
  INPROGRESS: Symbol('in-progress'),
  COMPLETE: Symbol('complete'),
  CANCELLING: Symbol('cancelling'),
  CANCELLED: Symbol('canceled')
});

_defineProperty(Operation, "id", 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi93b3JrZXItbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJCcm93c2VyV2luZG93IiwicmVtb3RlIiwiV29ya2VyTWFuYWdlciIsImdldEluc3RhbmNlIiwiaW5zdGFuY2UiLCJyZXNldCIsImZvcmNlIiwiZGVzdHJveSIsImNvbnN0cnVjdG9yIiwid29ya2VycyIsIlNldCIsImFjdGl2ZVdvcmtlciIsImNyZWF0ZU5ld1dvcmtlciIsImlzUmVhZHkiLCJyZXF1ZXN0IiwiZGF0YSIsImRlc3Ryb3llZCIsIkVycm9yIiwib3BlcmF0aW9uIiwicmVxdWVzdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIk9wZXJhdGlvbiIsImV4ZWN1dGVPcGVyYXRpb24iLCJzZXRQcm9taXNlIiwiY2FuY2VsIiwiY2FuY2VsT3BlcmF0aW9uIiwicHJvbWlzZSIsIm9wZXJhdGlvbkNvdW50TGltaXQiLCJXb3JrZXIiLCJvbkRlc3Ryb3llZCIsIm9uQ3Jhc2hlZCIsIm9uU2ljayIsImFkZCIsImRlc3Ryb3llZFdvcmtlciIsImRlbGV0ZSIsImNyYXNoZWRXb3JrZXIiLCJnZXRBY3RpdmVXb3JrZXIiLCJnZXRPcGVyYXRpb25Db3VudExpbWl0IiwiZ2V0UmVtYWluaW5nT3BlcmF0aW9ucyIsImZvckVhY2giLCJzaWNrV29ya2VyIiwiYXRvbSIsImluU3BlY01vZGUiLCJjb25zb2xlIiwid2FybiIsImdldENvbXBsZXRlZE9wZXJhdGlvbkNvdW50IiwiY2FsY3VsYXRlTmV3T3BlcmF0aW9uQ291bnRMaW1pdCIsImxhc3RXb3JrZXIiLCJNYXRoIiwibWluIiwiZ2V0UmVhZHlQcm9taXNlIiwid29ya2VyIiwib3BlcmF0aW9uc0J5SWQiLCJNYXAiLCJjb21wbGV0ZWRPcGVyYXRpb25Db3VudCIsInNpY2siLCJyZW5kZXJlclByb2Nlc3MiLCJSZW5kZXJlclByb2Nlc3MiLCJsb2FkVXJsIiwiZ2V0TG9hZFVybCIsIm9uRGF0YSIsImhhbmRsZURhdGFSZWNlaXZlZCIsIm9uQ2FuY2VsbGVkIiwiaGFuZGxlQ2FuY2VsbGVkIiwib25FeGVjU3RhcnRlZCIsImhhbmRsZUV4ZWNTdGFydGVkIiwib25TcGF3bkVycm9yIiwiaGFuZGxlU3Bhd25FcnJvciIsIm9uU3RkaW5FcnJvciIsImhhbmRsZVN0ZGluRXJyb3IiLCJoYW5kbGVTaWNrIiwiaGFuZGxlQ3Jhc2hlZCIsImh0bWxQYXRoIiwicGF0aCIsImpvaW4iLCJyZW5kZXJlckpzUGF0aCIsInFzIiwicXVlcnlzdHJpbmciLCJzdHJpbmdpZnkiLCJqcyIsIm1hbmFnZXJXZWJDb250ZW50c0lkIiwiZ2V0V2ViQ29udGVudHNJZCIsImNoYW5uZWxOYW1lIiwiZ2V0Q3VycmVudFdlYkNvbnRlbnRzIiwiaWQiLCJzZXQiLCJvbkNvbXBsZXRlIiwib25PcGVyYXRpb25Db21wbGV0ZSIsInJlc3VsdHMiLCJnZXQiLCJjb21wbGV0ZSIsInRpbWluZyIsInRvdGFsSW50ZXJuYWxUaW1lIiwiZXhlY1RpbWUiLCJzcGF3blRpbWUiLCJpcGNUaW1lIiwiZ2V0RXhlY3V0aW9uVGltZSIsInNpemUiLCJ3YXNDYW5jZWxsZWQiLCJzZXRJblByb2dyZXNzIiwiZXJyIiwiZXJyb3IiLCJzdGRpbiIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsImdldFBpZCIsInJlbWFpbmluZ09wZXJhdGlvblByb21pc2VzIiwibWFwIiwiZ2V0UHJvbWlzZSIsImNhdGNoIiwiYWxsIiwid2luIiwic2hvdyIsInByb2Nlc3MiLCJlbnYiLCJBVE9NX0dJVEhVQl9TSE9XX1JFTkRFUkVSX1dJTkRPVyIsIndlYlByZWZlcmVuY2VzIiwibm9kZUludGVncmF0aW9uIiwiZW5hYmxlUmVtb3RlTW9kdWxlIiwiY29udGV4dElzb2xhdGlvbiIsIndlYkNvbnRlbnRzIiwiZW1pdHRlciIsIkVtaXR0ZXIiLCJzdWJzY3JpcHRpb25zIiwiQ29tcG9zaXRlRGlzcG9zYWJsZSIsInJlZ2lzdGVyTGlzdGVuZXJzIiwibG9hZFVSTCIsIm9uIiwiaGFuZGxlRGVzdHJveSIsIkRpc3Bvc2FibGUiLCJpc0Rlc3Ryb3llZCIsInJlbW92ZUxpc3RlbmVyIiwicmVhZHkiLCJyZWFkeVByb21pc2UiLCJyZXNvbHZlUmVhZHkiLCJhcmdzIiwiaGFuZGxlTWVzc2FnZXMiLCJldmVudCIsInNvdXJjZVdlYkNvbnRlbnRzSWQiLCJ0eXBlIiwiZW1pdCIsImlwYyIsInBpZCIsImV4ZWN1dGUiLCJwYXlsb2FkIiwic2VuZCIsImRpc3Bvc2UiLCJjYW5jZWxsYXRpb25SZXNvbHZlIiwic3RhcnRUaW1lIiwiZW5kVGltZSIsInN0YXR1cyIsIlBFTkRJTkciLCJjYiIsIklOUFJPR1JFU1MiLCJOYU4iLCJtdXRhdGUiLCJwZXJmb3JtYW5jZSIsIm5vdyIsIkNPTVBMRVRFIiwiQ0FOQ0VMTEVEIiwibWVzc2FnZSIsImZpbGVOYW1lIiwibGluZU51bWJlciIsInN0YWNrIiwiZXhlY0ZuIiwiQ0FOQ0VMTElORyIsIlN5bWJvbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOztBQUVBOztBQUVBOzs7Ozs7OztBQUhBLE1BQU07QUFBQ0EsRUFBQUE7QUFBRCxJQUFrQkMsZ0JBQXhCOztBQUtlLE1BQU1DLGFBQU4sQ0FBb0I7QUFHakMsU0FBT0MsV0FBUCxHQUFxQjtBQUNuQixRQUFJLENBQUMsS0FBS0MsUUFBVixFQUFvQjtBQUNsQixXQUFLQSxRQUFMLEdBQWdCLElBQUlGLGFBQUosRUFBaEI7QUFDRDs7QUFDRCxXQUFPLEtBQUtFLFFBQVo7QUFDRDs7QUFFRCxTQUFPQyxLQUFQLENBQWFDLEtBQWIsRUFBb0I7QUFDbEIsUUFBSSxLQUFLRixRQUFULEVBQW1CO0FBQUUsV0FBS0EsUUFBTCxDQUFjRyxPQUFkLENBQXNCRCxLQUF0QjtBQUErQjs7QUFDcEQsU0FBS0YsUUFBTCxHQUFnQixJQUFoQjtBQUNEOztBQUVESSxFQUFBQSxXQUFXLEdBQUc7QUFDWiwyQkFBUyxJQUFULEVBQWUsYUFBZixFQUE4QixXQUE5QixFQUEyQyxRQUEzQztBQUVBLFNBQUtDLE9BQUwsR0FBZSxJQUFJ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S0FBS0E7QUFBVixPQUFELENBQU47QUFDRCxLQUpNLENBQVA7QUFLRDs7QUFuRm9COzs7O2dCQUFWL0QsUyxZQUNLO0FBQ2RtSSxFQUFBQSxPQUFPLEVBQUVlLE1BQU0sQ0FBQyxTQUFELENBREQ7QUFFZGIsRUFBQUEsVUFBVSxFQUFFYSxNQUFNLENBQUMsYUFBRCxDQUZKO0FBR2RSLEVBQUFBLFFBQVEsRUFBRVEsTUFBTSxDQUFDLFVBQUQsQ0FIRjtBQUlkRCxFQUFBQSxVQUFVLEVBQUVDLE1BQU0sQ0FBQyxZQUFELENBSko7QUFLZFAsRUFBQUEsU0FBUyxFQUFFTyxNQUFNLENBQUMsVUFBRDtBQUxILEM7O2dCQURMbEosUyxRQVNDLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBxdWVyeXN0cmluZyBmcm9tICdxdWVyeXN0cmluZyc7XG5cbmltcG9ydCB7cmVtb3RlLCBpcGNSZW5kZXJlciBhcyBpcGN9IGZyb20gJ2VsZWN0cm9uJztcbmNvbnN0IHtCcm93c2VyV2luZG93fSA9IHJlbW90ZTtcbmltcG9ydCB7RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnZXZlbnQta2l0JztcblxuaW1wb3J0IHtnZXRQYWNrYWdlUm9vdCwgYXV0b2JpbmR9IGZyb20gJy4vaGVscGVycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdvcmtlck1hbmFnZXIge1xuICBzdGF0aWMgaW5zdGFuY2UgPSBudWxsO1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuaW5zdGFuY2UpIHtcbiAgICAgIHRoaXMuaW5zdGFuY2UgPSBuZXcgV29ya2VyTWFuYWdlcigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZTtcbiAgfVxuXG4gIHN0YXRpYyByZXNldChmb3JjZSkge1xuICAgIGlmICh0aGlzLmluc3RhbmNlKSB7IHRoaXMuaW5zdGFuY2UuZGVzdHJveShmb3JjZSk7IH1cbiAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGF1dG9iaW5kKHRoaXMsICdvbkRlc3Ryb3llZCcsICdvbkNyYXNoZWQnLCAnb25TaWNrJyk7XG5cbiAgICB0aGlzLndvcmtlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5hY3RpdmVXb3JrZXIgPSBudWxsO1xuICAgIHRoaXMuY3JlYXRlTmV3V29ya2VyKCk7XG4gIH1cblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZVdvcmtlci5pc1JlYWR5KCk7XG4gIH1cblxuICByZXF1ZXN0KGRhdGEpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHsgdGhyb3cgbmV3IEVycm9yKCdXb3JrZXIgaXMgZGVzdHJveWVkJyk7IH1cbiAgICBsZXQgb3BlcmF0aW9uO1xuICAgIGNvbnN0IHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgb3BlcmF0aW9uID0gbmV3IE9wZXJhdGlvbihkYXRhLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlV29ya2VyLmV4ZWN1dGVPcGVyYXRpb24ob3BlcmF0aW9uKTtcbiAgICB9KTtcbiAgICBvcGVyYXRpb24uc2V0UHJvbWlzZShyZXF1ZXN0UHJvbWlzZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbmNlbDogKCkgPT4gdGhpcy5hY3RpdmVXb3JrZXIuY2FuY2VsT3BlcmF0aW9uKG9wZXJhdGlvbiksXG4gICAgICBwcm9taXNlOiByZXF1ZXN0UHJvbWlzZSxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlTmV3V29ya2VyKHtvcGVyYXRpb25Db3VudExpbWl0fSA9IHtvcGVyYXRpb25Db3VudExpbWl0OiAxMH0pIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG4gICAgdGhpcy5hY3RpdmVXb3JrZXIgPSBuZXcgV29ya2VyKHtcbiAgICAgIG9wZXJhdGlvbkNvdW50TGltaXQsXG4gICAgICBvbkRlc3Ryb3llZDogdGhpcy5vbkRlc3Ryb3llZCxcbiAgICAgIG9uQ3Jhc2hlZDogdGhpcy5vbkNyYXNoZWQsXG4gICAgICBvblNpY2s6IHRoaXMub25TaWNrLFxuICAgIH0pO1xuICAgIHRoaXMud29ya2Vycy5hZGQodGhpcy5hY3RpdmVXb3JrZXIpO1xuICB9XG5cbiAgb25EZXN0cm95ZWQoZGVzdHJveWVkV29ya2VyKSB7XG4gICAgdGhpcy53b3JrZXJzLmRlbGV0ZShkZXN0cm95ZWRXb3JrZXIpO1xuICB9XG5cbiAgb25DcmFzaGVkKGNyYXNoZWRXb3JrZXIpIHtcbiAgICBpZiAoY3Jhc2hlZFdvcmtlciA9PT0gdGhpcy5nZXRBY3RpdmVXb3JrZXIoKSkge1xuICAgICAgdGhpcy5jcmVhdGVOZXdXb3JrZXIoe29wZXJhdGlvbkNvdW50TGltaXQ6IGNyYXNoZWRXb3JrZXIuZ2V0T3BlcmF0aW9uQ291bnRMaW1pdCgpfSk7XG4gICAgfVxuICAgIGNyYXNoZWRXb3JrZXIuZ2V0UmVtYWluaW5nT3BlcmF0aW9ucygpLmZvckVhY2gob3BlcmF0aW9uID0+IHRoaXMuYWN0aXZlV29ya2VyLmV4ZWN1dGVPcGVyYXRpb24ob3BlcmF0aW9uKSk7XG4gIH1cblxuICBvblNpY2soc2lja1dvcmtlcikge1xuICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oYFNpY2sgd29ya2VyIGRldGVjdGVkLlxuICAgICAgICBvcGVyYXRpb25Db3VudExpbWl0OiAke3NpY2tXb3JrZXIuZ2V0T3BlcmF0aW9uQ291bnRMaW1pdCgpfSxcbiAgICAgICAgY29tcGxldGVkIG9wZXJhdGlvbiBjb3VudDogJHtzaWNrV29ya2VyLmdldENvbXBsZXRlZE9wZXJhdGlvbkNvdW50KCl9YCk7XG4gICAgfVxuICAgIGNvbnN0IG9wZXJhdGlvbkNvdW50TGltaXQgPSB0aGlzLmNhbGN1bGF0ZU5ld09wZXJhdGlvbkNvdW50TGltaXQoc2lja1dvcmtlcik7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3V29ya2VyKHtvcGVyYXRpb25Db3VudExpbWl0fSk7XG4gIH1cblxuICBjYWxjdWxhdGVOZXdPcGVyYXRpb25Db3VudExpbWl0KGxhc3RXb3JrZXIpIHtcbiAgICBsZXQgb3BlcmF0aW9uQ291bnRMaW1pdCA9IDEwO1xuICAgIGlmIChsYXN0V29ya2VyLmdldE9wZXJhdGlvbkNvdW50TGltaXQoKSA+PSBsYXN0V29ya2VyLmdldENvbXBsZXRlZE9wZXJhdGlvbkNvdW50KCkpIHtcbiAgICAgIG9wZXJhdGlvbkNvdW50TGltaXQgPSBNYXRoLm1pbihsYXN0V29ya2VyLmdldE9wZXJhdGlvbkNvdW50TGltaXQoKSAqIDIsIDEwMCk7XG4gICAgfVxuICAgIHJldHVybiBvcGVyYXRpb25Db3VudExpbWl0O1xuICB9XG5cbiAgZ2V0QWN0aXZlV29ya2VyKCkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZVdvcmtlcjtcbiAgfVxuXG4gIGdldFJlYWR5UHJvbWlzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVXb3JrZXIuZ2V0UmVhZHlQcm9taXNlKCk7XG4gIH1cblxuICBkZXN0cm95KGZvcmNlKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKHdvcmtlciA9PiB3b3JrZXIuZGVzdHJveShmb3JjZSkpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFdvcmtlciB7XG4gIHN0YXRpYyBjaGFubmVsTmFtZSA9ICdnaXRodWI6cmVuZGVyZXItaXBjJztcblxuICBjb25zdHJ1Y3Rvcih7b3BlcmF0aW9uQ291bnRMaW1pdCwgb25TaWNrLCBvbkNyYXNoZWQsIG9uRGVzdHJveWVkfSkge1xuICAgIGF1dG9iaW5kKFxuICAgICAgdGhpcyxcbiAgICAgICdoYW5kbGVEYXRhUmVjZWl2ZWQnLCAnb25PcGVyYXRpb25Db21wbGV0ZScsICdoYW5kbGVDYW5jZWxsZWQnLCAnaGFuZGxlRXhlY1N0YXJ0ZWQnLCAnaGFuZGxlU3Bhd25FcnJvcicsXG4gICAgICAnaGFuZGxlU3RkaW5FcnJvcicsICdoYW5kbGVTaWNrJywgJ2hhbmRsZUNyYXNoZWQnLFxuICAgICk7XG5cbiAgICB0aGlzLm9wZXJhdGlvbkNvdW50TGltaXQgPSBvcGVyYXRpb25Db3VudExpbWl0O1xuICAgIHRoaXMub25TaWNrID0gb25TaWNrO1xuICAgIHRoaXMub25DcmFzaGVkID0gb25DcmFzaGVkO1xuICAgIHRoaXMub25EZXN0cm95ZWQgPSBvbkRlc3Ryb3llZDtcblxuICAgIHRoaXMub3BlcmF0aW9uc0J5SWQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5jb21wbGV0ZWRPcGVyYXRpb25Db3VudCA9IDA7XG4gICAgdGhpcy5zaWNrID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlbmRlcmVyUHJvY2VzcyA9IG5ldyBSZW5kZXJlclByb2Nlc3Moe1xuICAgICAgbG9hZFVybDogdGhpcy5nZXRMb2FkVXJsKG9wZXJhdGlvbkNvdW50TGltaXQpLFxuICAgICAgb25EYXRhOiB0aGlzLmhhbmRsZURhdGFSZWNlaXZlZCxcbiAgICAgIG9uQ2FuY2VsbGVkOiB0aGlzLmhhbmRsZUNhbmNlbGxlZCxcbiAgICAgIG9uRXhlY1N0YXJ0ZWQ6IHRoaXMuaGFuZGxlRXhlY1N0YXJ0ZWQsXG4gICAgICBvblNwYXduRXJyb3I6IHRoaXMuaGFuZGxlU3Bhd25FcnJvcixcbiAgICAgIG9uU3RkaW5FcnJvcjogdGhpcy5oYW5kbGVTdGRpbkVycm9yLFxuICAgICAgb25TaWNrOiB0aGlzLmhhbmRsZVNpY2ssXG4gICAgICBvbkNyYXNoZWQ6IHRoaXMuaGFuZGxlQ3Jhc2hlZCxcbiAgICAgIG9uRGVzdHJveWVkOiB0aGlzLmRlc3Ryb3ksXG4gICAgfSk7XG4gIH1cblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcmVyUHJvY2Vzcy5pc1JlYWR5KCk7XG4gIH1cblxuICBnZXRMb2FkVXJsKG9wZXJhdGlvbkNvdW50TGltaXQpIHtcbiAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihnZXRQYWNrYWdlUm9vdCgpLCAnbGliJywgJ3JlbmRlcmVyLmh0bWwnKTtcbiAgICBjb25zdCByZW5kZXJlckpzUGF0aCA9IHBhdGguam9pbihnZXRQYWNrYWdlUm9vdCgpLCAnbGliJywgJ3dvcmtlci5qcycpO1xuICAgIGNvbnN0IHFzID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgIGpzOiByZW5kZXJlckpzUGF0aCxcbiAgICAgIG1hbmFnZXJXZWJDb250ZW50c0lkOiB0aGlzLmdldFdlYkNvbnRlbnRzSWQoKSxcbiAgICAgIG9wZXJhdGlvbkNvdW50TGltaXQsXG4gICAgICBjaGFubmVsTmFtZTogV29ya2VyLmNoYW5uZWxOYW1lLFxuICAgIH0pO1xuICAgIHJldHVybiBgZmlsZTovLyR7aHRtbFBhdGh9PyR7cXN9YDtcbiAgfVxuXG4gIGdldFdlYkNvbnRlbnRzSWQoKSB7XG4gICAgcmV0dXJuIHJlbW90ZS5nZXRDdXJyZW50V2ViQ29udGVudHMoKS5pZDtcbiAgfVxuXG4gIGV4ZWN1dGVPcGVyYXRpb24ob3BlcmF0aW9uKSB7XG4gICAgdGhpcy5vcGVyYXRpb25zQnlJZC5zZXQob3BlcmF0aW9uLmlkLCBvcGVyYXRpb24pO1xuICAgIG9wZXJhdGlvbi5vbkNvbXBsZXRlKHRoaXMub25PcGVyYXRpb25Db21wbGV0ZSk7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyZXJQcm9jZXNzLmV4ZWN1dGVPcGVyYXRpb24ob3BlcmF0aW9uKTtcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbihvcGVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlclByb2Nlc3MuY2FuY2VsT3BlcmF0aW9uKG9wZXJhdGlvbik7XG4gIH1cblxuICBoYW5kbGVEYXRhUmVjZWl2ZWQoe2lkLCByZXN1bHRzfSkge1xuICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9uc0J5SWQuZ2V0KGlkKTtcbiAgICBvcGVyYXRpb24uY29tcGxldGUocmVzdWx0cywgZGF0YSA9PiB7XG4gICAgICBjb25zdCB7dGltaW5nfSA9IGRhdGE7XG4gICAgICBjb25zdCB0b3RhbEludGVybmFsVGltZSA9IHRpbWluZy5leGVjVGltZSArIHRpbWluZy5zcGF3blRpbWU7XG4gICAgICBjb25zdCBpcGNUaW1lID0gb3BlcmF0aW9uLmdldEV4ZWN1dGlvblRpbWUoKSAtIHRvdGFsSW50ZXJuYWxUaW1lO1xuICAgICAgZGF0YS50aW1pbmcuaXBjVGltZSA9IGlwY1RpbWU7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uT3BlcmF0aW9uQ29tcGxldGUob3BlcmF0aW9uKSB7XG4gICAgdGhpcy5jb21wbGV0ZWRPcGVyYXRpb25Db3VudCsrO1xuICAgIHRoaXMub3BlcmF0aW9uc0J5SWQuZGVsZXRlKG9wZXJhdGlvbi5pZCk7XG5cbiAgICBpZiAodGhpcy5zaWNrICYmIHRoaXMub3BlcmF0aW9uc0J5SWQuc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQ2FuY2VsbGVkKHtpZH0pIHtcbiAgICBjb25zdCBvcGVyYXRpb24gPSB0aGlzLm9wZXJhdGlvbnNCeUlkLmdldChpZCk7XG4gICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgLy8gaGFuZGxlRGF0YVJlY2VpdmVkKCkgY2FuIGJlIHJlY2VpdmVkIGJlZm9yZSBoYW5kbGVDYW5jZWxsZWQoKVxuICAgICAgb3BlcmF0aW9uLndhc0NhbmNlbGxlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV4ZWNTdGFydGVkKHtpZH0pIHtcbiAgICBjb25zdCBvcGVyYXRpb24gPSB0aGlzLm9wZXJhdGlvbnNCeUlkLmdldChpZCk7XG4gICAgb3BlcmF0aW9uLnNldEluUHJvZ3Jlc3MoKTtcbiAgfVxuXG4gIGhhbmRsZVNwYXduRXJyb3Ioe2lkLCBlcnJ9KSB7XG4gICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb25zQnlJZC5nZXQoaWQpO1xuICAgIG9wZXJhdGlvbi5lcnJvcihlcnIpO1xuICB9XG5cbiAgaGFuZGxlU3RkaW5FcnJvcih7aWQsIHN0ZGluLCBlcnJ9KSB7XG4gICAgY29uc3Qgb3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb25zQnlJZC5nZXQoaWQpO1xuICAgIG9wZXJhdGlvbi5lcnJvcihlcnIpO1xuICB9XG5cbiAgaGFuZGxlU2ljaygpIHtcbiAgICB0aGlzLnNpY2sgPSB0cnVlO1xuICAgIHRoaXMub25TaWNrKHRoaXMpO1xuICB9XG5cbiAgaGFuZGxlQ3Jhc2hlZCgpIHtcbiAgICB0aGlzLm9uQ3Jhc2hlZCh0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfVxuXG4gIGdldE9wZXJhdGlvbkNvdW50TGltaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uQ291bnRMaW1pdDtcbiAgfVxuXG4gIGdldENvbXBsZXRlZE9wZXJhdGlvbkNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBsZXRlZE9wZXJhdGlvbkNvdW50O1xuICB9XG5cbiAgZ2V0UmVtYWluaW5nT3BlcmF0aW9ucygpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLm9wZXJhdGlvbnNCeUlkLnZhbHVlcygpKTtcbiAgfVxuXG4gIGdldFBpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlclByb2Nlc3MuZ2V0UGlkKCk7XG4gIH1cblxuICBnZXRSZWFkeVByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyZXJQcm9jZXNzLmdldFJlYWR5UHJvbWlzZSgpO1xuICB9XG5cbiAgYXN5bmMgZGVzdHJveShmb3JjZSkge1xuICAgIHRoaXMub25EZXN0cm95ZWQodGhpcyk7XG4gICAgaWYgKHRoaXMub3BlcmF0aW9uc0J5SWQuc2l6ZSA+IDAgJiYgIWZvcmNlKSB7XG4gICAgICBjb25zdCByZW1haW5pbmdPcGVyYXRpb25Qcm9taXNlcyA9IHRoaXMuZ2V0UmVtYWluaW5nT3BlcmF0aW9ucygpXG4gICAgICAgIC5tYXAob3BlcmF0aW9uID0+IG9wZXJhdGlvbi5nZXRQcm9taXNlKCkuY2F0Y2goKCkgPT4gbnVsbCkpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocmVtYWluaW5nT3BlcmF0aW9uUHJvbWlzZXMpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcmVyUHJvY2Vzcy5kZXN0cm95KCk7XG4gIH1cbn1cblxuXG4vKlxuU2VuZHMgb3BlcmF0aW9ucyB0byByZW5kZXJlciBwcm9jZXNzZXNcbiovXG5leHBvcnQgY2xhc3MgUmVuZGVyZXJQcm9jZXNzIHtcbiAgY29uc3RydWN0b3Ioe2xvYWRVcmwsXG4gICAgb25EZXN0cm95ZWQsIG9uQ3Jhc2hlZCwgb25TaWNrLCBvbkRhdGEsIG9uQ2FuY2VsbGVkLCBvblNwYXduRXJyb3IsIG9uU3RkaW5FcnJvciwgb25FeGVjU3RhcnRlZH0pIHtcbiAgICBhdXRvYmluZCh0aGlzLCAnaGFuZGxlRGVzdHJveScpO1xuICAgIHRoaXMub25EZXN0cm95ZWQgPSBvbkRlc3Ryb3llZDtcbiAgICB0aGlzLm9uQ3Jhc2hlZCA9IG9uQ3Jhc2hlZDtcbiAgICB0aGlzLm9uU2ljayA9IG9uU2ljaztcbiAgICB0aGlzLm9uRGF0YSA9IG9uRGF0YTtcbiAgICB0aGlzLm9uQ2FuY2VsbGVkID0gb25DYW5jZWxsZWQ7XG4gICAgdGhpcy5vblNwYXduRXJyb3IgPSBvblNwYXduRXJyb3I7XG4gICAgdGhpcy5vblN0ZGluRXJyb3IgPSBvblN0ZGluRXJyb3I7XG4gICAgdGhpcy5vbkV4ZWNTdGFydGVkID0gb25FeGVjU3RhcnRlZDtcblxuICAgIHRoaXMud2luID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgICAgc2hvdzogISFwcm9jZXNzLmVudi5BVE9NX0dJVEhVQl9TSE9XX1JFTkRFUkVSX1dJTkRPVyxcbiAgICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgICAgZW5hYmxlUmVtb3RlTW9kdWxlOiB0cnVlLFxuXG4gICAgICAgIC8vIFRoZSBkZWZhdWx0IG9mIGNvbnRleHRJc29sYXRpb24gaXMgY2hhbmdlZCB0byB0cnVlIHNvIHdlJ2xsIGhhdmUgdG8gc2V0IGl0IHRvIGZhbHNlLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uL2VsZWN0cm9uL2lzc3Vlcy8yMzUwNiBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgICAgICBjb250ZXh0SXNvbGF0aW9uOiBmYWxzZVxuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLndlYkNvbnRlbnRzID0gdGhpcy53aW4ud2ViQ29udGVudHM7XG4gICAgLy8gdGhpcy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG5cbiAgICB0aGlzLndpbi5sb2FkVVJMKGxvYWRVcmwpO1xuICAgIHRoaXMud2luLndlYkNvbnRlbnRzLm9uKCdjcmFzaGVkJywgdGhpcy5oYW5kbGVEZXN0cm95KTtcbiAgICB0aGlzLndpbi53ZWJDb250ZW50cy5vbignZGVzdHJveWVkJywgdGhpcy5oYW5kbGVEZXN0cm95KTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMud2luLmlzRGVzdHJveWVkKCkpIHtcbiAgICAgICAgICB0aGlzLndpbi53ZWJDb250ZW50cy5yZW1vdmVMaXN0ZW5lcignY3Jhc2hlZCcsIHRoaXMuaGFuZGxlRGVzdHJveSk7XG4gICAgICAgICAgdGhpcy53aW4ud2ViQ29udGVudHMucmVtb3ZlTGlzdGVuZXIoJ2Rlc3Ryb3llZCcsIHRoaXMuaGFuZGxlRGVzdHJveSk7XG4gICAgICAgICAgdGhpcy53aW4uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHRoaXMuZW1pdHRlcixcbiAgICApO1xuXG4gICAgdGhpcy5yZWFkeSA9IGZhbHNlO1xuICAgIHRoaXMucmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IHRoaXMucmVzb2x2ZVJlYWR5ID0gcmVzb2x2ZTsgfSk7XG4gIH1cblxuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLnJlYWR5O1xuICB9XG5cbiAgaGFuZGxlRGVzdHJveSguLi5hcmdzKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgdGhpcy5vbkNyYXNoZWQoLi4uYXJncyk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICBjb25zdCBoYW5kbGVNZXNzYWdlcyA9IChldmVudCwge3NvdXJjZVdlYkNvbnRlbnRzSWQsIHR5cGUsIGRhdGF9KSA9PiB7XG4gICAgICBpZiAoc291cmNlV2ViQ29udGVudHNJZCA9PT0gdGhpcy53aW4ud2ViQ29udGVudHMuaWQpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQodHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlwYy5vbihXb3JrZXIuY2hhbm5lbE5hbWUsIGhhbmRsZU1lc3NhZ2VzKTtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ3JlbmRlcmVyLXJlYWR5JywgKHtwaWR9KSA9PiB7XG4gICAgICB0aGlzLnBpZCA9IHBpZDtcbiAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgdGhpcy5yZXNvbHZlUmVhZHkoKTtcbiAgICB9KTtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ2dpdC1kYXRhJywgdGhpcy5vbkRhdGEpO1xuICAgIHRoaXMuZW1pdHRlci5vbignZ2l0LWNhbmNlbGxlZCcsIHRoaXMub25DYW5jZWxsZWQpO1xuICAgIHRoaXMuZW1pdHRlci5vbignZ2l0LXNwYXduLWVycm9yJywgdGhpcy5vblNwYXduRXJyb3IpO1xuICAgIHRoaXMuZW1pdHRlci5vbignZ2l0LXN0ZGluLWVycm9yJywgdGhpcy5vblN0ZGluRXJyb3IpO1xuICAgIHRoaXMuZW1pdHRlci5vbignc2xvdy1zcGF3bnMnLCB0aGlzLm9uU2ljayk7XG5cbiAgICAvLyBub3QgY3VycmVudGx5IHVzZWQgdG8gYXZvaWQgY2xvZ2dpbmcgdXAgaXBjIGNoYW5uZWxcbiAgICAvLyBrZWVwaW5nIGl0IGFyb3VuZCBhcyBpdCdzIHBvdGVudGlhbGx5IHVzZWZ1bCBmb3IgYXZvaWRpbmcgZHVwbGljYXRlIHdyaXRlIG9wZXJhdGlvbnMgdXBvbiByZW5kZXJlciBjcmFzaGluZ1xuICAgIHRoaXMuZW1pdHRlci5vbignZXhlYy1zdGFydGVkJywgdGhpcy5vbkV4ZWNTdGFydGVkKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiBpcGMucmVtb3ZlTGlzdGVuZXIoV29ya2VyLmNoYW5uZWxOYW1lLCBoYW5kbGVNZXNzYWdlcykpLFxuICAgICk7XG4gIH1cblxuICBleGVjdXRlT3BlcmF0aW9uKG9wZXJhdGlvbikge1xuICAgIHJldHVybiBvcGVyYXRpb24uZXhlY3V0ZShwYXlsb2FkID0+IHtcbiAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgcmV0dXJuIHRoaXMud2ViQ29udGVudHMuc2VuZChXb3JrZXIuY2hhbm5lbE5hbWUsIHtcbiAgICAgICAgdHlwZTogJ2dpdC1leGVjJyxcbiAgICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uKG9wZXJhdGlvbikge1xuICAgIHJldHVybiBvcGVyYXRpb24uY2FuY2VsKHBheWxvYWQgPT4ge1xuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7IHJldHVybiBudWxsOyB9XG4gICAgICByZXR1cm4gdGhpcy53ZWJDb250ZW50cy5zZW5kKFdvcmtlci5jaGFubmVsTmFtZSwge1xuICAgICAgICB0eXBlOiAnZ2l0LWNhbmNlbCcsXG4gICAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5waWQ7XG4gIH1cblxuICBnZXRSZWFkeVByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZHlQcm9taXNlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBPcGVyYXRpb24ge1xuICBzdGF0aWMgc3RhdHVzID0ge1xuICAgIFBFTkRJTkc6IFN5bWJvbCgncGVuZGluZycpLFxuICAgIElOUFJPR1JFU1M6IFN5bWJvbCgnaW4tcHJvZ3Jlc3MnKSxcbiAgICBDT01QTEVURTogU3ltYm9sKCdjb21wbGV0ZScpLFxuICAgIENBTkNFTExJTkc6IFN5bWJvbCgnY2FuY2VsbGluZycpLFxuICAgIENBTkNFTExFRDogU3ltYm9sKCdjYW5jZWxlZCcpLFxuICB9XG5cbiAgc3RhdGljIGlkID0gMDtcblxuICBjb25zdHJ1Y3RvcihkYXRhLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICB0aGlzLmlkID0gT3BlcmF0aW9uLmlkKys7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgIHRoaXMucHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5jYW5jZWxsYXRpb25SZXNvbHZlID0gKCkgPT4ge307XG4gICAgdGhpcy5zdGFydFRpbWUgPSBudWxsO1xuICAgIHRoaXMuZW5kVGltZSA9IG51bGw7XG4gICAgdGhpcy5zdGF0dXMgPSBPcGVyYXRpb24uc3RhdHVzLlBFTkRJTkc7XG4gICAgdGhpcy5yZXN1bHRzID0gbnVsbDtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICB9XG5cbiAgb25Db21wbGV0ZShjYikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2NvbXBsZXRlJywgY2IpO1xuICB9XG5cbiAgc2V0UHJvbWlzZShwcm9taXNlKSB7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgfVxuXG4gIGdldFByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZTtcbiAgfVxuXG4gIHNldEluUHJvZ3Jlc3MoKSB7XG4gICAgLy8gYWZ0ZXIgZXhlYyBoYXMgYmVlbiBjYWxsZWQgYnV0IGJlZm9yZSByZXN1bHRzIGEgcmVjZWl2ZWRcbiAgICB0aGlzLnN0YXR1cyA9IE9wZXJhdGlvbi5zdGF0dXMuSU5QUk9HUkVTUztcbiAgfVxuXG4gIGdldEV4ZWN1dGlvblRpbWUoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0VGltZSB8fCAhdGhpcy5lbmRUaW1lKSB7XG4gICAgICByZXR1cm4gTmFOO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmRUaW1lIC0gdGhpcy5zdGFydFRpbWU7XG4gICAgfVxuICB9XG5cbiAgY29tcGxldGUocmVzdWx0cywgbXV0YXRlID0gZGF0YSA9PiBkYXRhKSB7XG4gICAgdGhpcy5lbmRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICB0aGlzLnJlc29sdmUobXV0YXRlKHJlc3VsdHMpKTtcbiAgICB0aGlzLmNhbmNlbGxhdGlvblJlc29sdmUoKTtcbiAgICB0aGlzLnN0YXR1cyA9IE9wZXJhdGlvbi5zdGF0dXMuQ09NUExFVEU7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2NvbXBsZXRlJywgdGhpcyk7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHdhc0NhbmNlbGxlZCgpIHtcbiAgICB0aGlzLnN0YXR1cyA9IE9wZXJhdGlvbi5zdGF0dXMuQ0FOQ0VMTEVEO1xuICAgIHRoaXMuY2FuY2VsbGF0aW9uUmVzb2x2ZSgpO1xuICB9XG5cbiAgZXJyb3IocmVzdWx0cykge1xuICAgIHRoaXMuZW5kVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihyZXN1bHRzLm1lc3NhZ2UsIHJlc3VsdHMuZmlsZU5hbWUsIHJlc3VsdHMubGluZU51bWJlcik7XG4gICAgZXJyLnN0YWNrID0gcmVzdWx0cy5zdGFjaztcbiAgICB0aGlzLnJlamVjdChlcnIpO1xuICB9XG5cbiAgZXhlY3V0ZShleGVjRm4pIHtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHJldHVybiBleGVjRm4oey4uLnRoaXMuZGF0YSwgaWQ6IHRoaXMuaWR9KTtcbiAgfVxuXG4gIGNhbmNlbChleGVjRm4pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnN0YXR1cyA9IE9wZXJhdGlvbi5zdGF0dXMuQ0FOQ0VMTElORztcbiAgICAgIHRoaXMuY2FuY2VsbGF0aW9uUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBleGVjRm4oe2lkOiB0aGlzLmlkfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==