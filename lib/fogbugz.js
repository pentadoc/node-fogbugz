/*jslint node:true*/
// FogBugz API v8
var xml2js = require('xml2js'),
    rest = require('restler'),
    url = require('url'),
    querystring = require('querystring');

function FogBugz($config) {
  var self = this;
  self.endpoint = $config.endpoint + '?';
  self.token = $config.token || null;

  this.setToken = function (token) {
    self.token = token;
  };

  this.authenticate = function(email, password) {
    var q = querystring.stringify({cmd: 'logon', email: email, password: password});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'token');
  };

  this.allProjects = function() {
    var q = querystring.stringify({token: self.token, cmd: 'listProjects', fwrite: 1});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'projects.project');
  };

  this.allPeople = function(projectID) {
    var q = querystring.stringify({token: self.token, cmd: 'listPeople'});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'people.person');
  };

  this.allActiveMilestones = function(projectID) {
    var q = querystring.stringify({token: self.token, cmd: 'listFixFors', ixProject: projectID});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'fixfors.fixfor');
  };

  this.allMilestones = function(projectID) {
    var q = querystring.stringify({token: self.token, cmd: 'listFixFors', ixProject: projectID, fIncludeDeleted: 1});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'fixfors.fixfor');
  };

  this.allAreas = function(projectID) {
    var q = querystring.stringify({token: self.token, cmd: 'listAreas', ixProject: projectID});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'areas.area');
  };

  this.allPriorities = function(token) {
    var q = querystring.stringify({token: self.token, cmd: 'listPriorities'});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'priorities.priority');
  };

  this.allCategories = function(token) {
    var q = querystring.stringify({token: self.token, cmd: 'listCategories'});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'categories.category');
  };

  this.allStatuses = function(token) {
    var q = querystring.stringify({token: self.token, cmd: 'listStatuses'});
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'statuses.status');
  };

  this.newCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'new'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.editCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'edit'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.reopenCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'reopen'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.reactivateCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'reactivate'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.resolveCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'resolve'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.closeCase = function(values) {
    var q = querystring.stringify({token: self.token, cmd: 'close'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: values });
    return _unwind(request, 'case');
  };

  this.startWork = function(caseID) {
    var q = querystring.stringify({token: self.token, cmd: 'startWork'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml, data: {ixBug: caseID} });
    return _unwind(request, 'case');
  };

  this.stopWork = function(token) {
    var q = querystring.stringify({token: self.token, cmd: 'stopWork'});
    var request = rest.post(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'case');
  };

  this.timeIntervals = function(fromDate) {
    var dateString = fromDate.getFullYear() + '-' + (fromDate.getMonth() + 1) + '-' + fromDate.getDate();
    var q = querystring.stringify({token: self.token, cmd: 'listIntervals', dtStart: dateString, ixPerson: 1})
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'intervals.interval');
  };

  this.query = function(query) {
    query.token = self.token;
    var q = querystring.stringify(query);
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'cases.case');
  };

  this.cases = function(query, columns, limit) {
    var q = { token: self.token, cols: columns, cmd: 'search', q: query, sFilter: 2 };
    if (limit) {
      q.max = limit;
    }
    q = querystring.stringify(q);
    var request = rest.get(self.endpoint + q, { parser: rest.parsers.xml });
    return _unwind(request, 'cases.case');
  };

}

function _unwind(request, keyPath) {
  return new Promise(function(resolve, reject){
    request.on('success', function(data) {

      var properties = keyPath.split('.');
      var object = data.response;
      for (var i=0; i<properties.length; i++) {
        var property = properties[i];

        if (object.hasOwnProperty(property)) {
          object = object[property];
        } else if (object.hasOwnProperty('error')) {
          reject(object.error['#']);
          return;
        } else {
          resolve(object[0]);
          return;
        }
      }

      if (!object.length) object = [object];
      resolve(object[0]);
      return;
    });

    request.on('error', function(error) {
      var error = error.message;
      reject(error);
      request.abort();
      return;
    });      
  });
};

module.exports = FogBugz;