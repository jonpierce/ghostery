/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2008-2009 David Cancel
 *
 * @author David Cancel
 * @author Jon Pierce
 * @copyright Copyright (C) 2008-2009 David Cancel <dcancel@dcancel.com>
*/

if( !ghostery ) { var ghostery = {}; }

ghostery.db = {
  
  bugs: Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
          .getService(Components.interfaces.mozIJSSubScriptLoader)
          .loadSubScript("chrome://ghostery/content/ghostery-bugs.js"),

  patternToRegex: function(pattern)
  {
    if (pattern)
    {
      var matches = pattern.match(/^\/(.+)\/(\w*)$/);
      if (matches)
      {
        var pattern = matches[1];
        var attributes = matches[2];
        if (attributes.length > 0)
          return new RegExp(pattern, attributes);
        else
          return new RegExp(pattern);
      }
    }
    return null;
  }
  
};

(function()
{
  
  var sortByBugName = function(a, b)
  {
    aName = a.name.toLowerCase();
    bName = b.name.toLowerCase();
    return aName > bName ? 1 : aName < bName ? -1 : 0
  };
  ghostery.db.bugs.sort(sortByBugName);
  
  var map = {};
  for (var i = 0; i < ghostery.db.bugs.length; i++) {
    var bug = ghostery.db.bugs[i];
    bug.regex = ghostery.db.patternToRegex(bug.pattern);
    bug.id = bug.id.toString(); // coerce to string, just in case
    map[bug.id] = bug; // support key lookup
  }
  ghostery.db.bugsMap = map;
})();

ghostery.censusCache = {};