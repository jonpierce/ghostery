/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2009 Jon Pierce
 *
 * @author Jon Pierce
 * @copyright Copyright (C) 2009 Jon Pierce <jon@jonpierce.com>
 */

var log = function(msg)
{
  consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}

// See http://mxr.mozilla.org/mozilla1.9.1/source/content/base/public/nsIContentPolicy.idl

function GhosteryContentPolicy()
{
  this.resources = {}
  loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
  loader.loadSubScript("chrome://ghostery/content/ghostery-common.js", this.resources);
  loader.loadSubScript("chrome://ghostery/content/ghostery-db.js", this.resources);
  this.resources.ghostery.prefs.startup();
}

GhosteryContentPolicy.prototype =
{
    shouldLoad: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra)
    {
      var prefs = this.resources.ghostery.prefs;
      if (prefs.enabled && prefs.isBlockingEnabled() && contentLocation && contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT)
  		{
  		  var bugs = this.resources.ghostery.db.bugs;
        for (var i = 0; i < bugs.length; i++)
        {
          var bug = bugs[i];
          if (prefs.shouldBlockBug(bug.id) && bug.regex.test(contentLocation.spec))
          {            
            if (prefs.debug) log("Blocked " + bug.name + ": " + contentLocation.spec);
            return Components.interfaces.nsIContentPolicy.REJECT_REQUEST;
          }
        }
		  }
  		return Components.interfaces.nsIContentPolicy.ACCEPT;
    },

    shouldProcess: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra)
    {
      return Components.interfaces.nsIContentPolicy.ACCEPT;
    },

    QueryInterface: function (iid)
    {
      if (!iid.equals(Components.interfaces.nsIContentPolicy) &&
          !iid.equals(Components.interfaces.nsISupports) &&
          !iid.equals(Components.interfaces.nsIFactory) &&
          !iid.equals(Components.interfaces.nsIObserver))
      {
          throw Components.results.NS_ERROR_NO_INTERFACE;
      }
      return this;
    }
}

var GhosteryContentPolicyModule =
{
  classId: Components.ID("{a4992d70-56f2-11de-8a39-0800200c9a66}"),
  className: "Ghostery Content Policy",
  contractId: "@ghostery.com/content-policy;1",

  getClassObject: function(compMgr, cid, iid)
  {
    if (!cid.equals(this.classId))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    if (!iid.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    return this.factory;
  },

  registerSelf: function(compMgr, fileSpec, location, type)
  {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(this.classId, this.className, this.contractId, fileSpec, location, type);
    this.getCategoryManager().addCategoryEntry("content-policy", this.contractId, this.contractId, true, true);
  },

  unregisterSelf: function(compMgr, fileSpec, location)
  {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(this.classId, fileSpec);
    this.getCategoryManager().deleteCategoryEntry("content-policy", this.contractId, true);
  },

  canUnload: function(compMgr)
  {
    return true;
  },

  getCategoryManager: function()
  {
    return Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
  },
  
  factory:
  { 
    createInstance: function(outer, iid)
    {
      if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;
      return (new GhosteryContentPolicy()).QueryInterface(iid);
    }
  }
};

function NSGetModule(compMgr, fileSpec) 
{
  return GhosteryContentPolicyModule;
}