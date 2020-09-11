'use strict';

// web worker
addEventListener("message", function(e) {self.postMessage("TZP-"+e.data)}, false)
