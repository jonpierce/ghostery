/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2008-2009 David Cancel
 *
 * @author David Cancel
 * @copyright Copyright (C) 2008-2009 David Cancel <dcancel@dcancel.com>
*/
if( !ghostery ) { var ghostery = {}; }  // If Ghostery is not already loaded, define it and set current preferences state.

ghostery.ui = {
    
    /*
        Functions to deal with property files
    */
    getBundle: function()
    {
        ghostery.debug.log('getBundle() called', 5);       
        return document.getElementById( "ghostery-strings" );
    },
    
    // Access our resource bundle
    getString: function( key )
    {
        ghostery.debug.log('getString('+key+') called', 5);
        
        var bundle = this.getBundle();
        var text = bundle.getString( key );
        if( text ) return text;

        ghostery.debug.log( "Failed to find localized string for: " + key );
        return key;
    },
    
    getFormattedString: function( key, argv )
    {
        ghostery.debug.log('getFormattedString('+key+', '+argv+') called', 5);
        
        var bundle = this.getBundle();
        return bundle.getFormattedString( key, argv );
    },
    
    /*
        Functions to build dynamic menu
    */
    removeChildren: function(container)
    {
        ghostery.debug.log('removeChildren() called', 5);
        
        var children = container.childNodes;
        for( var i = children.length - 1; i >= 0; i-- )
        {
            var node = children[i];
            container.removeChild(node);
        }
    },
    
    addMenuItem: function(popup, onclick, label, value, img)
    {
        ghostery.debug.log('addMenuItem(): label = '+label+' value = '+value, 5);
        
        var item = document.createElement("menuitem");
        item.setAttribute("label", label);
        item.setAttribute("class", "menu-item");
        if ( value ) item.setAttribute("value", value);
        if ( onclick ) item.setAttribute("onclick", onclick);
        if ( img ) 
        { 
            item.setAttribute("image", img);
            item.setAttribute("class", "menuitem-iconic");
        }
        else
        {
            item.setAttribute("class", "ident");
        }
        popup.appendChild(item);

        return item;
    },
    
    // Add Popup header with Ghostery Icon
    addMenuHeader: function(menu, label)
    {
        ghostery.debug.log('addMenuHeader('+label+') called', 5);
        
        var item = document.createElement("toolbarbutton");
        item.setAttribute("label", label );
        item.setAttribute("class", "menu-header");
        item.setAttribute("image","chrome://ghostery/content/ghostery-16x16.png");
        menu.appendChild(item);
        return item;    
    },
    
    // Build Script Menu
    buildScriptMenu: function(menu, bugInfo)
    {
        ghostery.debug.log('buildScriptMenu() called', 5);
        
        var bug = bugInfo.bug;
        var script = bugInfo.script;
        ghostery.debug.log('buildScriptMenu: bug.name = '+bug.name+' script = '+script);
      
        var submenu = document.createElement("menu");
        submenu.setAttribute("label", script );
        submenu.setAttribute("class", "script-url-item"
        );
        menu.appendChild(submenu);
        
        var popup = document.createElement("menupopup");
        popup.setAttribute("class", "webbug-popup ");
        submenu.appendChild(popup);
        
        var item = document.createElement("menuitem");
        item.setAttribute("label", "View Script Source");
        item.setAttribute("value", script);
        item.setAttribute("onclick", "javascript:ghostery.ui.showScriptSource('"+bug.name+"','"+script+"')");
        popup.appendChild(item);
        
    },
    
    // Build Bug Menu and sub menu
    buildBugMenu: function(popup, bugInfo)
    {
        var bug = bugInfo.bug;
		var p = ghostery.prefs;
        ghostery.debug.log('buildBugMenu: bug.name = '+bug.name);
        
        var bugmenu = document.createElement("menu");
        bugmenu.setAttribute("label", bug.name );

        if (p.shouldBlockBug(bug.id))
        {
            bugmenu.setAttribute("class", "blocked-bug");
        }
        
        popup.appendChild(bugmenu);

        var subpop = document.createElement("menupopup");
        subpop.setAttribute("class", "webbug-popup ");
        bugmenu.appendChild(subpop);

        var label = this.getFormattedString( "menu.whatis", [ bug.name ] );
        var item = document.createElement("menuitem");
        item.setAttribute("label", label);
        item.setAttribute("value", bug.name);
        item.setAttribute("onclick", "javascript:ghostery.ui.showBugDirectory(this.value)");
        item.setAttribute("class", "menu-bug-whatis");
        subpop.appendChild(item);

        // Add Script submenu
        subpop.appendChild(document.createElement("menuseparator"));
        this.buildScriptMenu(subpop, bugInfo);

        // Add Blocking submenu
        subpop.appendChild(document.createElement("menuseparator"));
        
        item = document.createElement("menuitem");
        item.setAttribute("id", "toggle-" + bug.id);
        item.setAttribute("type", "checkbox");
        item.setAttribute("name", "block" + bug.id);
        item.setAttribute("value", bug.id);
        item.setAttribute("checked", "" + p.isSelectedBug(bug.id));
        item.setAttribute("label", this.getFormattedString("menu.blocking.block", [bug.name]));
        
        ghostery.debug.log('buildBugMenu() isSelectedBug = '+p.isSelectedBug(bug.id), 5);
        if (p.isSelectedBug(bug.id)) { item.setAttribute("class", "bug-icon-block"); }
        item.onclick = function() { p.toggleSelectedBug(this.value); if ( p.blockingMode !== p.blockSelected ) { p.set('blockingMode', p.blockSelected); } };

        subpop.appendChild(item);
    },
    
    getBlockingMenu: function(menu)
    {
        ghostery.debug.log('getBlockingMenu() called', 5);
        
        menu.appendChild(document.createElement("menuseparator"));
        var submenu = document.createElement("menu");
        submenu.setAttribute("label", this.getString("menu.blocking") );

        var menupopup = document.createElement("menupopup");
        var p = ghostery.prefs;
        var ui = ghostery.ui;
        var options = [
          // ["block-all", ui.getString("menu.blocking.all"), p.blockAll, p.isBlockingAll()],
          ["block-selected", "" /* set dynamically */, p.blockSelected, p.isBlockingSelected()],
          ["block-none", ui.getString("menu.blocking.off"), p.blockNone, p.isBlockingNone()]
        ];
        for (var i = 0; i < options.length; i++) 
        {
            var menuitem = document.createElement("menuitem");
            var option = options[i];
            menuitem.setAttribute("id", options[i][0]);
            menuitem.setAttribute("type", "radio");
            menuitem.setAttribute("name", "blockingMode");
            menuitem.setAttribute("label", options[i][1]);
            menuitem.setAttribute("value", options[i][2]);
            menuitem.setAttribute("checked", "" + options[i][3]);
            menuitem.onclick = function() { p.set('blockingMode', this.value); };
            menupopup.appendChild(menuitem);
        }

        // dynamically set label w/ selected bug count
        menupopup.addEventListener("popupshowing", function()
        {
            var menuitem = document.getElementById("block-selected");
            var num_of_selected_bugs = 0;
            if (ghostery.prefs.selectedBugs)
            {
              num_of_selected_bugs = ghostery.prefs.selectedBugs.length;
            }
            menuitem.setAttribute("label", ghostery.ui.getFormattedString("menu.blocking.on", [num_of_selected_bugs]));
         }, false);

        submenu.appendChild(menupopup);
        menu.appendChild(submenu);    
    },

    getMenuPopup: function() 
    {
        ghostery.debug.log("getMenuPopup(): called ----------------------");

        var popup = document.getElementById("ghostery-popup");
        this.removeChildren(popup);
        
        // Show bugs found as top menu
        var bugs = ghostery.currentBugs;
        ghostery.debug.log('getMenuPopup(): bugs.length = '+bugs.length, 5);
        
        // If bugs were found generate dynamic list
        if (bugs && bugs.length > 0)
        {
            // Add Title since web bugs were found
            this.addMenuHeader(popup, this.getString("menu.bugsfound"));
            
            for(var i = 0; i < bugs.length; i++)
            {
                this.buildBugMenu(popup, bugs[i]);                
            }
        }

        this.getBlockingMenu( popup );
                
        // add static footer options
        this.getMenuFooter(popup);
    },
        
    // Include static menu items
    getMenuFooter: function(popup)
    {
        ghostery.debug.log('getMenuFooter() called', 5);
        
        popup.appendChild(document.createElement("menuseparator"));
    
        this.addMenuItem(popup, "javascript:ghostery.ui.openBrowserTab(this.value)", this.getString("menu.help"), 'help/firefox');
        this.addMenuItem(popup, "javascript:ghostery.ui.showOptionsDialog()", this.getString("menu.options"), 'options');
        popup.appendChild( document.createElement("menuseparator"));
        // this.addMenuItem( dropdown, "javascript:ghostery.ui.openBrowserTab(this.value)", this.getString( "menu.community" ), 'community' );
        this.addMenuItem(popup, "javascript:ghostery.ui.openBrowserTab(this.value)", this.getString("menu.share"), 'share');
        popup.appendChild(document.createElement("menuseparator"));
        this.addMenuItem(popup, "javascript:ghostery.ui.openBrowserTab(this.value)", this.getString("menu.feedback"), 'feedback');
        this.addMenuItem(popup, "javascript:ghostery.ui.showAboutDialog()", this.getString("menu.about"), 'about');
    },
    
    showAboutDialog: function()
    {
        window.openDialog('chrome://ghostery/content/about.xul', 'ghostery-about-dialog', 'centerscreen,chrome,modal');
    },
    
    showOptionsDialog: function()
    {
        window.openDialog('chrome://ghostery/content/options.xul', 'Ghostery Options', 'chrome,titlebar,toolbar,centerscreen', 'ghostery_displayPane');
    },
    
    showScriptSource: function(bug_name, script_url)
    {
        bug_name = encodeURI(window.btoa(bug_name));
        script_url = encodeURI(window.btoa(script_url));
        var url = 'http://www.ghostery.com/gcache/?n='+bug_name+'&s='+script_url;
        ghostery.debug.log( "showScriptSource: opening new tab for: " + url );
        gBrowser.selectedTab = gBrowser.addTab(url);
    },
    
    showBugDirectory: function(bug)
    {
        bug = bug.replace(/\s+/g, "_");
        bug = bug.toLowerCase();
        var path = 'apps/'+bug;
        this.openBrowserTab(path);
    },
    
    openBrowserTab: function( url )
    {
        url = ghostery.prefs.siteURL+url;
        ghostery.debug.log( "openBrowserTab: opening new tab for: " + url );
        gBrowser.selectedTab = gBrowser.addTab(url);
    },
    
    showBlockWarningBar: function(message)
    {
        var messageBarText = message;
        
                
        var notificationBox = gBrowser.getNotificationBox();
        var notification = notificationBox.getNotificationWithValue("website-blocked");
        
        if (notification)
        {
            notification.label = messageBarText;
        }
        else
        {
            const priority = notificationBox.PRIORITY_WARNING_MEDIUM;
            notificationBox.appendNotification(messageBarText, "website-blocked", "chrome://browser/skin/Info.png", priority, null);
        }
    }
    
};