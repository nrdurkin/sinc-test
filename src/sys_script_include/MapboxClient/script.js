"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MapboxClient =
/*#__PURE__*/
function () {
  function MapboxClient() {
    _classCallCheck(this, MapboxClient);

    _defineProperty(this, "baseDirectionsEndpoint", 'directions/v5/mapbox/driving-traffic/');

    _defineProperty(this, "baseMatrixEndpoint", 'directions-matrix/v1/mapbox/driving/');

    _defineProperty(this, "baseEndpoint", 'https://api.mapbox.com/');
  }

  _createClass(MapboxClient, [{
    key: "getDrivingTime",

    /**
     * Gets the driving time in seconds for two latitude and longitude points
     *
     * @param {LatLong} start
     * @param {LatLong} end
     * @returns number of seconds to drive between the points
     */
    value: function getDrivingTime(start, end) {
      var endpoint = "".concat(this.baseDirectionsEndpoint + start.longitude, ",").concat(start.latitude, ";").concat(end.longitude, ",").concat(end.latitude);
      var result = this.execute('GET', endpoint, {});

      if (result.error) {
        return -1;
      }

      var _JSON$parse = JSON.parse(result.body),
          routes = _JSON$parse.routes;

      if (routes.length === 0) {
        return -1;
      }

      return routes[0].duration;
    }
    /**
     * Returns a matrix of drive times from the sources to every destination.
     * Useful for doing batch drive time calcuations
     *
     * @param {string[]} sources array of comma-separated longitude latitude coordinates
     * @param {string[]} destinations array of comma-separated longitude latitude coordinates
     * @returns a map object to serve as a matrix of drive times between the sources and destinations
     */

  }, {
    key: "getDriveTimeMatrix",
    value: function getDriveTimeMatrix(sources, destinations) {
      try {
        if (sources.length + destinations.length > 25) {
          return null;
        }

        var sourceString = sources.join(';');
        var destString = destinations.join(';');
        var fullEndpoint = "".concat(this.baseMatrixEndpoint + sourceString, ";").concat(destString);
        var queryParams = {
          sources: '',
          destinations: ''
        };
        var sourcesParam = sources.map(function (cur, index) {
          return index;
        }).join(';');
        var destinationsParam = destinations.map(function (cur, index) {
          return index + sources.length;
        }).join(';');
        queryParams.sources = sourcesParam; // gs.info("MBC: sources:"+sourcesParam+" "+sourceString);

        queryParams.destinations = destinationsParam; // gs.info("MBC: dests:"+destinationsParam + " "+destString);

        var result = this.execute('GET', fullEndpoint, queryParams);

        if (result.error) {
          gs.info("MAPBOXCLIENT: Error during getDriveTimeMatrix.\nStatus Code:".concat(result.statusCode, "\nHeaders:\n").concat(JSON.stringify(result.headers, null, 2)));
          return null;
        }

        var matrixObj = JSON.parse(result.body);
        var matrixMap = {};
        var durations = matrixObj.durations;

        for (var i = 0; i < durations.length; i += 1) {
          var curSource = sources[i];

          for (var j = 0; j < durations[i].length; j += 1) {
            var curDest = destinations[j];
            matrixMap["dur".concat(curSource, ">").concat(curDest)] = durations[i][j];
          }
        }

        return matrixMap;
      } catch (e) {
        return null;
      }
    }
    /**
     * @name getDriveTimes
     * @description This is a wrapper method for getDriveTimeMatrix.
     *
     * The inherent limitation of getDriveTimeMatrix is that
     * it can't calculate more than 25 sources+destinations.
     *
     * This will handle unlimited sources and destinations as long as the API doesn't quit on us
     *
     * @param {Object[]} routes array of route objects in the following format:
     * {source: "long1,lat1", dest: "long2,lat2"}
     * @returns a drive time map object that contains drive times for all routes
     */

  }, {
    key: "getDriveTimes",
    value: function getDriveTimes(routes) {
      var _this = this;

      var routesToChange = routes.slice(); // shallow copy array

      var MAX_LIMIT = 50;
      var matrixMap = {};
      var keepgoing = true;
      var numTimes = 0;

      var doBatch = function doBatch() {
        var sources = {};
        var dests = {};
        var total = 0;
        var r;

        for (var i = routesToChange.length - 1; i > -1; i -= 1) {
          r = routesToChange[i];

          if (!Object.prototype.hasOwnProperty.call(sources, r.source)) {
            sources[r.source] = true;
            total += 1;

            if (total === 25) {
              break;
            }
          }

          if (!Object.prototype.hasOwnProperty.call(dests, r.dest)) {
            dests[r.dest] = true;
            total += 1;

            if (total === 25) {
              break;
            }
          }
        }

        var matrix = _this.getDriveTimeMatrix(Object.keys(sources), Object.keys(dests));

        if (!matrix) {
          gs.info('MAPBOXCLIENT: Hit an error, most likely a rate limit');
          keepgoing = false;
          return;
        }

        Object.keys(matrix).forEach(function (k) {
          matrixMap[k] = matrix[k];
        }); // remove routes from the queue if we calculated their drive time already

        for (var j = routesToChange.length - 1; j > -1; j -= 1) {
          r = routesToChange[j];
          var searchString = "dur".concat(r.source, ">").concat(r.dest);

          if (Object.prototype.hasOwnProperty.call(matrixMap, searchString)) {
            routesToChange.splice(j, 1);
          }
        }
      };

      while (routesToChange.length > 0 && keepgoing && numTimes < MAX_LIMIT) {
        doBatch();
        numTimes += 1;
      }

      return matrixMap;
    }
    /**
     * Executes a request against the mapbox api
     *
     * @param {string} method HTTP Method to use
     * @param {string} endpoint endpoint to hit
     * @param {object} queryParams object mapping query parameters to their values
     * @returns plaintext response body
     */

  }, {
    key: "execute",
    value: function execute(method, endpoint) {
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var localQueryParams = queryParams;
      localQueryParams.access_token = gs.getProperty('x_nuvo_csd.mapbox_api_token');
      var request = new sn_ws.RESTMessageV2();
      request.setHttpMethod(method);
      var queryParamString = '?';
      var chunks = [];
      Object.keys(queryParams).forEach(function (p) {
        chunks.push("".concat(p, "=").concat(queryParams[p]));
      });
      queryParamString += chunks.join('&');
      var completeEndpoint = this.baseEndpoint + endpoint + queryParamString;
      request.setEndpoint(completeEndpoint);
      var res = request.execute();
      var sc = res.getStatusCode();
      var resObj = {
        error: false,
        body: '',
        statusCode: 0,
        headers: ''
      };
      resObj.statusCode = sc;

      if (sc > 199 && sc < 300) {
        resObj.error = false;
      } else {
        resObj.error = true;
      }

      resObj.headers = res.getAllHeaders();
      resObj.body = res.getBody();
      return resObj;
    }
  }]);

  return MapboxClient;
}();