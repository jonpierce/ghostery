/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2008-2009 David Cancel
 *
 * @author David Cancel
 * @author Jon Pierce
 * @copyright Copyright (C) 2008-2009 David Cancel <dcancel@dcancel.com>
*/
if( !ghostery ) { var ghostery = {}; }  // If Ghostery is not already loaded, define it and set current preferences state.

ghostery.settings = {
    bugBubbleId:        '__ghosteryfirefox'
};

ghostery.debug = {
    log: function( msg, level )
    {
        // Check if logging is enabled?
        var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        pref = pref.getBranch("extensions.ghostery.");
        if( !pref.getBoolPref( "debug" ) )
        {
            return;
        }

        // Give up if we've tried before and  ailed to get a logger
        if( ghostery.debug.logger )
        {
            if( ghostery.debug.logger === false )
            {
                return;
            }
        }

        if( !ghostery.debug.logger )
        {
            try 
            {
                // Use DebugLogger Extension: https://addons.mozilla.org/en-US/firefox/addon/3983
                var logMgr = Components.classes[ "@mozmonkey.com/debuglogger/manager;1" ].getService( Components.interfaces.nsIDebugLoggerManager );
                ghostery.debug.logger = logMgr.registerLogger( "ghostery" );
            }
            catch( err )
            {
                // DebugLogger extension is not installed; remember so we don't try to find it again
                ghostery.debug.logger = false;
                return;
            }
        }

        // what level?
        if( !level ) level = 3;

        // finally... lets log!
        ghostery.debug.logger.log( level, msg );
    }
};

ghostery.prefs = {
    enabled:            null,
    debug:              null,
    showBubble:         null,
    showBugCount:       null,
    autoDismissBubble:  null,
    shareData:          null, 
    bubbleTimeout:      null,
    censusURL:          null,
    pref:               null,
    siteURL:            "http://www.ghostery.com/",
    blockNone: -1,
    blockSelected: 0,
    blockAll: 1,
    blockingMode: null,
    selectedBugsDelimiter: ",",
    selectedBugsString: null,
    selectedBugs: null,
    selectedBugsMap: null,

    /*
        Startup preference observer
    */
    startup: function()
    {
        ghostery.debug.log('ghostery.prefs.startup()');

        try
        {
            // Register to receive notifications of preference changes
            this.pref = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService)
                    .getBranch("extensions.ghostery.");
            this.pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
            this.pref.addObserver("", this, false);

            // Set values from preferences
            this.enabled            = this.pref.getBoolPref('enabled');
            this.debug              = this.pref.getBoolPref('debug');
            this.showBubble         = this.pref.getBoolPref('showBubble');
            this.showBugCount       = this.pref.getBoolPref('showBugCount');
            this.autoDismissBubble  = this.pref.getBoolPref('autoDismissBubble');
            this.shareData          = this.pref.getBoolPref('shareData'); 
            this.bubbleTimeout      = this.pref.getIntPref('bubbleTimeout');
            this.censusURL          = this.pref.getCharPref('censusURL');
            this.blockingMode       = this.pref.getIntPref('blockingMode');
            this.setSelectedBugsFromString(this.readSelectedBugsFile());
            
        }
        catch (err) {}  // Catch preference error
    },
    
    /*
        Called on unload
    */
    shutdown: function()
    {
        ghostery.debug.log('ghostery.prefs.shutdown()');
        this.pref.removeObserver("", this);
    },
    
    /*
        Called when events occur on the preferences
    */
    observe: function(subject, topic, data)
    {
        ghostery.debug.log('ghostery.prefs.observe() called');
        
        if (topic != 'nsPref:changed')
        {
            return;
        }

        ghostery.debug.log('observe() data='+data, 5);
        switch(data)
        {
            case 'enabled':
                this.enabled = this.pref.getBoolPref('enabled');
                break;
            case 'debug':
                this.debug = this.pref.getBoolPref('debug');
                break;
            case 'showBubble':
                this.showBubble = this.pref.getBoolPref('showBubble');
                break;
            case 'showBugCount':
                this.showBugCount = this.pref.getBoolPref('showBugCount');
                break;
            case 'autoDismissBubble':
                this.autoDismissBubble = this.pref.getBoolPref('autoDismissBubble');
                break;
            case 'shareData':
                this.shareData = this.pref.getBoolPref('shareData');
                break;
            case 'bubbleTimeout':
                this.bubbleTimeout = this.pref.getIntPref('bubbleTimeout');
                break;
            case 'censusURL':
                this.censusURL = this.pref.getCharPref('censusURL');
                break;
            case 'blockingMode':
                this.blockingMode = this.pref.getIntPref('blockingMode');
                break;
            case 'selectedBugsUpdated':
                this.setSelectedBugsFromString(this.readSelectedBugsFile());
                break;
        }
    },
    

    /*
        Get Mozilla Preference
    */
    set: function(prefName, prefValue)
    {
        ghostery.debug.log('ghostery.prefs.set('+prefName+', '+prefValue+')', 5);
  
        var pref = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
        pref = pref.getBranch("extensions.ghostery.");

        // Determine the type of the preference and then set it using the correct function
        switch (pref.getPrefType(prefName))
        {
            case pref.PREF_STRING: 
                return pref.setCharPref(prefName, prefValue);
                break;
            case pref.PREF_INT: 
                return pref.setIntPref(prefName, prefValue);
                break;
            case pref.PREF_BOOL: 
                return pref.setBoolPref(prefName, prefValue);
                break;
            default: 
                break;
        }
        return -1;    
    },

    /*
        Get Mozilla Preference
    */
    get: function(prefName)
    {
        ghostery.debug.log('ghostery.prefs.get('+prefName+')', 5);
  
        var pref = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
        pref = pref.getBranch("extensions.ghostery.");

        // ghostery.debug.log('ghostery.prefs.get():> prefs.getPrefType('+prefName+') == '+pref.getPrefType(prefName));
        // Determine the type of the preference and then set it using the correct function
        switch (pref.getPrefType(prefName))
        {
            case pref.PREF_STRING: 
                return pref.getCharPref(prefName);
                break;
            case pref.PREF_INT: 
                return pref.getIntPref(prefName);
                break;
            case pref.PREF_BOOL: 
                return pref.getBoolPref(prefName);
                break;
            default: 
                break;
        }
        return -1;    
    },

    /*
        Check if Mozilla Preference is set
    */
    has: function(prefName)
    {
        ghostery.debug.log('ghostery.prefs.has('+prefName+')', 5);

        var pref = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
        pref = pref.getBranch("extensions.ghostery.");
                
        if( pref.prefHasUserValue(prefName) ) { return true; }

        return false;  // Otherwise return false    
    },
    
    /*
        Load prefs state into Options Dialog
    */
    load: function()
    {
        ghostery.debug.log('ghostery.prefs.load()');

        var gp = ghostery.prefs;
        
        try { document.getElementById('showBubble').checked = gp.get('showBubble'); } catch (err) {}
        try { document.getElementById('showBugCount').checked = gp.get('showBugCount'); } catch (err) {}
        try { document.getElementById('autoDismissBubble').checked = gp.get('autoDismissBubble'); } catch (err) {}
        try { document.getElementById('shareData').checked = gp.get('shareData'); } catch (err) {}  
        try { document.getElementById('bubbleTimeout').valueNumber = gp.get('bubbleTimeout'); } catch (err) {}
        try { document.getElementById('blockingMode').value = gp.get('blockingMode'); } catch (err) {}
        try { document.getElementById('bugTree').selectedBugs = this.parseSelectedBugs(gp.readSelectedBugsFile()); } catch (err) {}
        
    },

    /*
        Save prefs state from Options Dialog
    */
    save: function()
    {
        ghostery.debug.log('ghostery.prefs.save()');
        
        var gp = ghostery.prefs;
        
        gp.set('showBubble', document.getElementById('showBubble').checked);
        gp.set('showBugCount', document.getElementById('showBugCount').checked);
        gp.set('autoDismissBubble', document.getElementById('autoDismissBubble').checked);      
        gp.set('shareData', document.getElementById('shareData').checked);
        gp.set('bubbleTimeout', document.getElementById('bubbleTimeout').valueNumber);
        gp.set('blockingMode', document.getElementById('blockingMode').value);
        gp.writeSelectedBugsFile(this.formatSelectedBugs(document.getElementById('bugTree').selectedBugs));
        
    },
    
    shouldBlockBug: function(id)
    {
        ghostery.debug.log('ghostery.prefs.shouldBlockBug('+id+'), 5');
        return this.isBlockingAll() || (this.isBlockingSelected() && this.isSelectedBug(id));
    },
    
    isBlockingEnabled: function() { return this.blockingMode !== this.blockNone; },
    isBlockingNone: function() { return this.blockingMode == this.blockNone; },
    isBlockingSelected: function() { return this.blockingMode == this.blockSelected; },
    isBlockingAll: function() { return this.blockingMode == this.blockAll; },
    
    isSelectedBug: function(id)
    {
        ghostery.debug.log('ghostery.prefs.isSelectedBug('+id+'), 5');
        
        id = id.toString();
        selected = false;
        if (this.selectedBugsMap)
        {
          selected = this.selectedBugsMap[id] ? true : false;
        }
        ghostery.debug.log('ghostery.prefs.isSelectedBug('+id+') selected = '+selected, 5);
        return selected;
    },
    
    selectBug: function(id)
    {
        ghostery.debug.log('ghostery.prefs.selectBug('+id+')', 5);
        if (!this.isSelectedBug(id))
        {
            this.selectedBugs.push(id);
            this.writeSelectedBugsFile(this.formatSelectedBugs(this.selectedBugs));
        }
    },
    
    deselectBug: function(id)
    {
        ghostery.debug.log('ghostery.prefs.deselectBug('+id+')', 5);
      if (this.isSelectedBug(id))
      {
        var found = false; // sanity check
        for (var i = 0; i < this.selectedBugs.length; i++)
          if (this.selectedBugs[i] == id) { found = true; break; }
        if (found)
        {
        this.selectedBugs.splice(i, 1);
        this.writeSelectedBugsFile(this.formatSelectedBugs(this.selectedBugs));
      }
      }
    },
    
    toggleSelectedBug: function(id)
    {
        ghostery.debug.log('ghostery.prefs.toggleSelectedBug('+id+')', 5);
      if (this.isSelectedBug(id))
        this.deselectBug(id);
      else
        this.selectBug(id);
    },
    
    parseSelectedBugs: function(selectedBugsString)
    {
        ghostery.debug.log('ghostery.prefs.parseSelectedBugs()', 5);
        trimmed = selectedBugsString.replace(/^\s+|\s+$/g,"");
        selectedBugs = trimmed.length == 0 ? [] : trimmed.split(this.selectedBugsDelimiter);
        return selectedBugs;
    },
    
    formatSelectedBugs: function(selectedBugsArray)
    {
        ghostery.debug.log('ghostery.prefs.formatSelectedBugs()', 5);
        
        return selectedBugsArray.join(this.selectedBugsDelimiter);
    },
    
    setSelectedBugsFromString: function(selectedBugsString)
    {
        ghostery.debug.log('ghostery.prefs.setSelectedBugsFromString()', 5);
        this.selectedBugsString = selectedBugsString ? selectedBugsString : "";
        this.selectedBugs = this.parseSelectedBugs(this.selectedBugsString);
        // copy to hash for key lookup
        this.selectedBugsMap = {};
        for (var i = 0; i < this.selectedBugs.length; i++)
          this.selectedBugsMap[this.selectedBugs[i]] = true;
    },
    
    readSelectedBugsFile: function()
    {
        ghostery.debug.log('ghostery.prefs.readSelectedBugsFile()');
        
        var file = this.getSelectedBugsFile();
        var selectedBugsString = this.readFile(file);
        return selectedBugsString;
    },
    
    writeSelectedBugsFile: function(selectedBugsString)
    {
        ghostery.debug.log('ghostery.prefs.writeSelectedBugsFile()');
        
        var file = this.getSelectedBugsFile();
        this.writeFile(file, selectedBugsString);
        this.set('selectedBugsUpdated', new Date().toString()); // hack to trigger pref change event
    },
    
    getSelectedBugsFile: function()
    {
        ghostery.debug.log('ghostery.prefs.getSelectedBugsFile()');
        
        var file = this.getStorageDirectory();
        return this.getOrCreateFile(file, "selectedBugs", false);
    },
    
    getStorageDirectory: function()
    {
        ghostery.debug.log('ghostery.prefs.getStorageDirectory()', 5);
        
        var file = this.getProfileDirectory();
        return this.getOrCreateFile(file, "ghostery", true);
    },
    
    getProfileDirectory: function()
    {
        ghostery.debug.log('ghostery.prefs.getProfileDirectory()', 5);
        return Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    },
    
    getOrCreateFile: function(parentFile, childFileName, isDirectory)
    {
        ghostery.debug.log('ghostery.prefs.getOrCreateFile()', 5);
        
        var file = parentFile;
        file.append(childFileName);
        if( !file.exists() || (isDirectory && !file.isDirectory()) || (!isDirectory && !file.isFile()) ) 
        {
            type = isDirectory ? Components.interfaces.nsIFile.DIRECTORY_TYPE : Components.interfaces.nsIFile.NORMAL_FILE_TYPE;
            file.create(type, 0777);
        }
        return file;
    },
    
    readFile: function(file)
    {
        ghostery.debug.log('ghostery.prefs.readFile('+file+')');
        var data = "";
        var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        var cis = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);
        fis.init(file, -1, 0, 0);
        cis.init(fis, "UTF-8", 0, 0);
        var str = {};
        cis.readString(-1, str);
        data = str.value;
        cis.close();
        return data;
    },

    writeFile: function(file, data)
    {
        ghostery.debug.log('ghostery.prefs.writeFile('+file+','+data+')');
        var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        // write, create, truncate, use 0x02 | 0x10 to open file for appending.
        fos.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
        var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        cos.init(fos, "UTF-8", 0, 0);
        cos.writeString(data);
        cos.close();
    }
};
