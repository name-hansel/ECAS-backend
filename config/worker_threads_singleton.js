var WorkerThreads = (function () {
  // Instance stores a reference to the Singleton
  var instance;
  function init() {
    return {
      active_worker_threads: []
    };
  };
  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();

module.exports = WorkerThreads