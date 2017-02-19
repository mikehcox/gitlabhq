/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var droplabAjaxFilter = {
  init: function init(hook) {
    this.destroyed = false;
    this.hook = hook;
    this.notLoading();

    this.eventWrapper = {};
    this.eventWrapper.debounceTrigger = this.debounceTrigger.bind(this);
    this.hook.trigger.addEventListener('keydown.dl', this.eventWrapper.debounceTrigger);
    this.hook.trigger.addEventListener('focus', this.eventWrapper.debounceTrigger);

    this.trigger(true);
  },

  notLoading: function notLoading() {
    this.loading = false;
  },

  debounceTrigger: function debounceTrigger(e) {
    var NON_CHARACTER_KEYS = [16, 17, 18, 20, 37, 38, 39, 40, 91, 93];
    var invalidKeyPressed = NON_CHARACTER_KEYS.indexOf(e.detail.which || e.detail.keyCode) > -1;
    var focusEvent = e.type === 'focus';
    if (invalidKeyPressed || this.loading) {
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.trigger.bind(this, focusEvent), 200);
  },

  trigger: function trigger(getEntireList) {
    var config = this.hook.config.droplabAjaxFilter;
    var searchValue = this.trigger.value;
    if (!config || !config.endpoint || !config.searchKey) {
      return;
    }
    if (config.searchValueFunction) {
      searchValue = config.searchValueFunction();
    }
    if (config.loadingTemplate && this.hook.list.data === undefined || this.hook.list.data.length === 0) {
      var dynamicList = this.hook.list.list.querySelector('[data-dynamic]');
      var loadingTemplate = document.createElement('div');
      loadingTemplate.innerHTML = config.loadingTemplate;
      loadingTemplate.setAttribute('data-loading-template', true);
      this.listTemplate = dynamicList.outerHTML;
      dynamicList.outerHTML = loadingTemplate.outerHTML;
    }
    if (getEntireList) {
      searchValue = '';
    }
    if (config.searchKey === searchValue) {
      return this.list.show();
    }
    this.loading = true;
    var params = config.params || {};
    params[config.searchKey] = searchValue;
    var self = this;
    self.cache = self.cache || {};
    var url = config.endpoint + this.buildParams(params);
    var urlCachedData = self.cache[url];
    if (urlCachedData) {
      self._loadData(urlCachedData, config, self);
    } else {
      this._loadUrlData(url).then(function (data) {
        self._loadData(data, config, self);
      });
    }
  },

  _loadUrlData: function _loadUrlData(url) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            self.cache[url] = data;
            return resolve(data);
          } else {
            return reject([xhr.responseText, xhr.status]);
          }
        }
      };
      xhr.send();
    });
  },

  _loadData: function _loadData(data, config, self) {
    var list = self.hook.list;
    if (config.loadingTemplate && list.data === undefined || list.data.length === 0) {
      var dataLoadingTemplate = list.list.querySelector('[data-loading-template]');
      if (dataLoadingTemplate) {
        dataLoadingTemplate.outerHTML = self.listTemplate;
      }
    }
    if (!self.destroyed) {
      var hookListChildren = list.list.children;
      var onlyDynamicList = hookListChildren.length === 1 && hookListChildren[0].hasAttribute('data-dynamic');
      if (onlyDynamicList && data.length === 0) {
        list.hide();
      }
      list.setData.call(list, data);
    }
    self.notLoading();
    list.currentIndex = 0;
  },

  buildParams: function buildParams(params) {
    if (!params) return '';
    var paramsArray = Object.keys(params).map(function (param) {
      return param + '=' + (params[param] || '');
    });
    return '?' + paramsArray.join('&');
  },

  destroy: function destroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.destroyed = true;
    this.hook.trigger.removeEventListener('keydown.dl', this.eventWrapper.debounceTrigger);
    this.hook.trigger.removeEventListener('focus', this.eventWrapper.debounceTrigger);
  }
};

window.droplabAjaxFilter = droplabAjaxFilter;

exports.default = droplabAjaxFilter;

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjM3NjcyYjdmNTI4YjQ3MmE0NGM/ZWM1ZioqIiwid2VicGFjazovLy8uL3NyYy9wbHVnaW5zL2FqYXhfZmlsdGVyLmpzIl0sIm5hbWVzIjpbImRyb3BsYWJBamF4RmlsdGVyIiwiaW5pdCIsImhvb2siLCJkZXN0cm95ZWQiLCJub3RMb2FkaW5nIiwiZXZlbnRXcmFwcGVyIiwiZGVib3VuY2VUcmlnZ2VyIiwiYmluZCIsInRyaWdnZXIiLCJhZGRFdmVudExpc3RlbmVyIiwibG9hZGluZyIsImUiLCJOT05fQ0hBUkFDVEVSX0tFWVMiLCJpbnZhbGlkS2V5UHJlc3NlZCIsImluZGV4T2YiLCJkZXRhaWwiLCJ3aGljaCIsImtleUNvZGUiLCJmb2N1c0V2ZW50IiwidHlwZSIsInRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZ2V0RW50aXJlTGlzdCIsImNvbmZpZyIsInNlYXJjaFZhbHVlIiwidmFsdWUiLCJlbmRwb2ludCIsInNlYXJjaEtleSIsInNlYXJjaFZhbHVlRnVuY3Rpb24iLCJsb2FkaW5nVGVtcGxhdGUiLCJsaXN0IiwiZGF0YSIsInVuZGVmaW5lZCIsImxlbmd0aCIsImR5bmFtaWNMaXN0IiwicXVlcnlTZWxlY3RvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsInNldEF0dHJpYnV0ZSIsImxpc3RUZW1wbGF0ZSIsIm91dGVySFRNTCIsInNob3ciLCJwYXJhbXMiLCJzZWxmIiwiY2FjaGUiLCJ1cmwiLCJidWlsZFBhcmFtcyIsInVybENhY2hlZERhdGEiLCJfbG9hZERhdGEiLCJfbG9hZFVybERhdGEiLCJ0aGVuIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwiRE9ORSIsInN0YXR1cyIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsInNlbmQiLCJkYXRhTG9hZGluZ1RlbXBsYXRlIiwiaG9va0xpc3RDaGlsZHJlbiIsImNoaWxkcmVuIiwib25seUR5bmFtaWNMaXN0IiwiaGFzQXR0cmlidXRlIiwiaGlkZSIsInNldERhdGEiLCJjYWxsIiwiY3VycmVudEluZGV4IiwicGFyYW1zQXJyYXkiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwicGFyYW0iLCJqb2luIiwiZGVzdHJveSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ2hFQSxJQUFNQSxvQkFBb0I7QUFDeEJDLFFBQU0sY0FBU0MsSUFBVCxFQUFlO0FBQ25CLFNBQUtDLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLRCxJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLRSxVQUFMOztBQUVBLFNBQUtDLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxTQUFLQSxZQUFMLENBQWtCQyxlQUFsQixHQUFvQyxLQUFLQSxlQUFMLENBQXFCQyxJQUFyQixDQUEwQixJQUExQixDQUFwQztBQUNBLFNBQUtMLElBQUwsQ0FBVU0sT0FBVixDQUFrQkMsZ0JBQWxCLENBQW1DLFlBQW5DLEVBQWlELEtBQUtKLFlBQUwsQ0FBa0JDLGVBQW5FO0FB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QU9BLFFBQVEsR0FBUixJQUFlcEMsT0FBT29DLEtBQVAsS0FBaUIsRUFBaEMsQ0FBUDtBQUNELEtBRmlCLENBQWxCO0FBR0EsV0FBTyxNQUFNSixZQUFZSyxJQUFaLENBQWlCLEdBQWpCLENBQWI7QUFDRCxHQXZIdUI7O0FBeUh4QkMsV0FBUyxTQUFTQSxPQUFULEdBQW1CO0FBQzFCLFFBQUksS0FBSzlELE9BQVQsRUFBa0I7QUFDaEJDLG1CQUFhLEtBQUtELE9BQWxCO0FBQ0Q7O0FBRUQsU0FBS2pCLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLRCxJQUFMLENBQVVNLE9BQVYsQ0FBa0IyRSxtQkFBbEIsQ0FBc0MsWUFBdEMsRUFBb0QsS0FBSzlFLFlBQUwsQ0FBa0JDLGVBQXRFO0FBQ0EsU0FBS0osSUFBTCxDQUFVTSxPQUFWLENBQWtCMkUsbUJBQWxCLENBQXNDLE9BQXRDLEVBQStDLEtBQUs5RSxZQUFMLENBQWtCQyxlQUFqRTtBQUNEO0FBakl1QixDQUExQjs7QUFvSUE4RSxPQUFPcEYsaUJBQVAsR0FBMkJBLGlCQUEzQjs7a0JBRWVBLGlCIiwiZmlsZSI6Ii4vZGlzdC9wbHVnaW5zL2FqYXhfZmlsdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTEpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGYzNzY3MmI3ZjUyOGI0NzJhNDRjIiwiY29uc3QgZHJvcGxhYkFqYXhGaWx0ZXIgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKGhvb2spIHtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuaG9vayA9IGhvb2s7XG4gICAgdGhpcy5ub3RMb2FkaW5nKCk7XG5cbiAgICB0aGlzLmV2ZW50V3JhcHBlciA9IHt9O1xuICAgIHRoaXMuZXZlbnRXcmFwcGVyLmRlYm91bmNlVHJpZ2dlciA9IHRoaXMuZGVib3VuY2VUcmlnZ2VyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5ob29rLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bi5kbCcsIHRoaXMuZXZlbnRXcmFwcGVyLmRlYm91bmNlVHJpZ2dlcik7XG4gICAgdGhpcy5ob29rLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLmV2ZW50V3JhcHBlci5kZWJvdW5jZVRyaWdnZXIpO1xuXG4gICAgdGhpcy50cmlnZ2VyKHRydWUpO1xuICB9LFxuXG4gIG5vdExvYWRpbmc6IGZ1bmN0aW9uIG5vdExvYWRpbmcoKSB7XG4gICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgZGVib3VuY2VUcmlnZ2VyOiBmdW5jdGlvbiBkZWJvdW5jZVRyaWdnZXIoZSkge1xuICAgIHZhciBOT05fQ0hBUkFDVEVSX0tFWVMgPSBbMTYsIDE3LCAxOCwgMjAsIDM3LCAzOCwgMzksIDQwLCA5MSwgOTNdO1xuICAgIHZhciBpbnZhbGlkS2V5UHJlc3NlZCA9IE5PTl9DSEFSQUNURVJfS0VZUy5pbmRleE9mKGUuZGV0YWlsLndoaWNoIHx8IGUuZGV0YWlsLmtleUNvZGUpID4gLTE7XG4gICAgdmFyIGZvY3VzRXZlbnQgPSBlLnR5cGUgPT09ICdmb2N1cyc7XG4gICAgaWYgKGludmFsaWRLZXlQcmVzc2VkIHx8IHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy50aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLnRyaWdnZXIuYmluZCh0aGlzLCBmb2N1c0V2ZW50KSwgMjAwKTtcbiAgfSxcblxuICB0cmlnZ2VyOiBmdW5jdGlvbiB0cmlnZ2VyKGdldEVudGlyZUxpc3QpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5ob29rLmNvbmZpZy5kcm9wbGFiQWpheEZpbHRlcjtcbiAgICB2YXIgc2VhcmNoVmFsdWUgPSB0aGlzLnRyaWdnZXIudmFsdWU7XG4gICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy5lbmRwb2ludCB8fCAhY29uZmlnLnNlYXJjaEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnNlYXJjaFZhbHVlRnVuY3Rpb24pIHtcbiAgICAgIHNlYXJjaFZhbHVlID0gY29uZmlnLnNlYXJjaFZhbHVlRnVuY3Rpb24oKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5sb2FkaW5nVGVtcGxhdGUgJiYgdGhpcy5ob29rLmxpc3QuZGF0YSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLmhvb2subGlzdC5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFyIGR5bmFtaWNMaXN0ID0gdGhpcy5ob29rLmxpc3QubGlzdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1keW5hbWljXScpO1xuICAgICAgdmFyIGxvYWRpbmdUZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbG9hZGluZ1RlbXBsYXRlLmlubmVySFRNTCA9IGNvbmZpZy5sb2FkaW5nVGVtcGxhdGU7XG4gICAgICBsb2FkaW5nVGVtcGxhdGUuc2V0QXR0cmlidXRlKCdkYXRhLWxvYWRpbmctdGVtcGxhdGUnLCB0cnVlKTtcbiAgICAgIHRoaXMubGlzdFRlbXBsYXRlID0gZHluYW1pY0xpc3Qub3V0ZXJIVE1MO1xuICAgICAgZHluYW1pY0xpc3Qub3V0ZXJIVE1MID0gbG9hZGluZ1RlbXBsYXRlLm91dGVySFRNTDtcbiAgICB9XG4gICAgaWYgKGdldEVudGlyZUxpc3QpIHtcbiAgICAgIHNlYXJjaFZhbHVlID0gJyc7XG4gICAgfVxuICAgIGlmIChjb25maWcuc2VhcmNoS2V5ID09PSBzZWFyY2hWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMubGlzdC5zaG93KCk7XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdmFyIHBhcmFtcyA9IGNvbmZpZy5wYXJhbXMgfHwge307XG4gICAgcGFyYW1zW2NvbmZpZy5zZWFyY2hLZXldID0gc2VhcmNoVmFsdWU7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuY2FjaGUgPSBzZWxmLmNhY2hlIHx8IHt9O1xuICAgIHZhciB1cmwgPSBjb25maWcuZW5kcG9pbnQgKyB0aGlzLmJ1aWxkUGFyYW1zKHBhcmFtcyk7XG4gICAgdmFyIHVybENhY2hlZERhdGEgPSBzZWxmLmNhY2hlW3VybF07XG4gICAgaWYgKHVybENhY2hlZERhdGEpIHtcbiAgICAgIHNlbGYuX2xvYWREYXRhKHVybENhY2hlZERhdGEsIGNvbmZpZywgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xvYWRVcmxEYXRhKHVybClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHNlbGYuX2xvYWREYXRhKGRhdGEsIGNvbmZpZywgc2VsZik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfbG9hZFVybERhdGE6IGZ1bmN0aW9uIF9sb2FkVXJsRGF0YSh1cmwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICBzZWxmLmNhY2hlW3VybF0gPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoW3hoci5yZXNwb25zZVRleHQsIHhoci5zdGF0dXNdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB4aHIuc2VuZCgpO1xuICAgIH0pO1xuICB9LFxuXG4gIF9sb2FkRGF0YTogZnVuY3Rpb24gX2xvYWREYXRhKGRhdGEsIGNvbmZpZywgc2VsZikge1xuICAgIGNvbnN0IGxpc3QgPSBzZWxmLmhvb2subGlzdDtcbiAgICBpZiAoY29uZmlnLmxvYWRpbmdUZW1wbGF0ZSAmJiBsaXN0LmRhdGEgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgbGlzdC5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgZGF0YUxvYWRpbmdUZW1wbGF0ZSA9IGxpc3QubGlzdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1sb2FkaW5nLXRlbXBsYXRlXScpO1xuICAgICAgaWYgKGRhdGFMb2FkaW5nVGVtcGxhdGUpIHtcbiAgICAgICAgZGF0YUxvYWRpbmdUZW1wbGF0ZS5vdXRlckhUTUwgPSBzZWxmLmxpc3RUZW1wbGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzZWxmLmRlc3Ryb3llZCkge1xuICAgICAgdmFyIGhvb2tMaXN0Q2hpbGRyZW4gPSBsaXN0Lmxpc3QuY2hpbGRyZW47XG4gICAgICB2YXIgb25seUR5bmFtaWNMaXN0ID0gaG9va0xpc3RDaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgaG9va0xpc3RDaGlsZHJlblswXS5oYXNBdHRyaWJ1dGUoJ2RhdGEtZHluYW1pYycpO1xuICAgICAgaWYgKG9ubHlEeW5hbWljTGlzdCAmJiBkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBsaXN0LmhpZGUoKTtcbiAgICAgIH1cbiAgICAgIGxpc3Quc2V0RGF0YS5jYWxsKGxpc3QsIGRhdGEpO1xuICAgIH1cbiAgICBzZWxmLm5vdExvYWRpbmcoKTtcbiAgICBsaXN0LmN1cnJlbnRJbmRleCA9IDA7XG4gIH0sXG5cbiAgYnVpbGRQYXJhbXM6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKSByZXR1cm4gJyc7XG4gICAgdmFyIHBhcmFtc0FycmF5ID0gT2JqZWN0LmtleXMocGFyYW1zKS5tYXAoZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgIHJldHVybiBwYXJhbSArICc9JyArIChwYXJhbXNbcGFyYW1dIHx8ICcnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gJz8nICsgcGFyYW1zQXJyYXkuam9pbignJicpO1xuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuaG9vay50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24uZGwnLCB0aGlzLmV2ZW50V3JhcHBlci5kZWJvdW5jZVRyaWdnZXIpO1xuICAgIHRoaXMuaG9vay50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5ldmVudFdyYXBwZXIuZGVib3VuY2VUcmlnZ2VyKTtcbiAgfVxufTtcblxud2luZG93LmRyb3BsYWJBamF4RmlsdGVyID0gZHJvcGxhYkFqYXhGaWx0ZXI7XG5cbmV4cG9ydCBkZWZhdWx0IGRyb3BsYWJBamF4RmlsdGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3BsdWdpbnMvYWpheF9maWx0ZXIuanMiXSwic291cmNlUm9vdCI6IiJ9