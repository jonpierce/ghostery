/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2008-2009 David Cancel
 *
 * @author David Cancel
 * @copyright Copyright (C) 2008-2009 David Cancel <dcancel@dcancel.com>
*/
if( !ghostery ) { var ghostery = {}; }

ghostery = {
    bugsDetected:       0,
    bugsBlocked:        0,
    bugBubbleMsg:       '',
    currentTab:         false,
    leftClickStatus:    false,
    currentBugs:        null, 
        
    init: function()
    {
        ghostery.debug.log('*** init() called ***');
        
        window.removeEventListener('load', ghostery.init, false);
        window.addEventListener('unload', ghostery.shutdown, false);
        
        var appcontent = document.getElementById("appcontent");
        if ( appcontent ) 
        {
            // Initialize preferences
            ghostery.prefs.startup();
            
            // Conditional listener on page load
            appcontent.addEventListener("DOMContentLoaded", ghostery.onPageLoad, true); 
            
            // Add listener for tab selection
            gBrowser.tabContainer.addEventListener("TabSelect", ghostery.onTabSelect, false);
        }
    },

    shutdown: function()
    {
        // Clean-up after ourselves
        ghostery.prefs.shutdown();
        
        // Unhook extension
        window.removeEventListener( "unload", ghostery.shutdown, false);
    },

    onPageLoad: function(event)
    {
        ghostery.debug.log('*** onPageLoad() called ***');
        
        var doc = event.originalTarget;
        
        // Only analyze if extension is enabled.
        if ( ghostery.prefs.enabled ) { ghostery.analyzePage(doc, true); }
    },  
    
    onTabSelect: function(event)
    {
        ghostery.debug.log('*** onTabSelect() called ***');
        
        // First clear exisiting bugs
        ghostery.clearDetectedBugs();
        
        var doc = gBrowser.selectedBrowser.contentDocument;     

        // Only analyze if extension is enabled.
        if ( ghostery.prefs.enabled ) { ghostery.analyzePage(doc, false); }
    },

    /*
        Analyze the contents of page
    */
    analyzePage: function(doc, countBug)
    {
        page = doc.location.href;
        if (! page ) { return; }    // Make sure page is not null
        
        ghostery.debug.log('analyzePage('+page+', '+countBug+')');
        
        ghostery.currentTab = false;

        // Test to make sure we're being called for the current tab
        if ( page == gBrowser.selectedBrowser.contentDocument.location.href )
        {
            ghostery.currentTab = true;
            ghostery.clearDetectedBugs();
            ghostery.currentBugs = [];  // Reset bug list
        }
        
        // Add this back when we want to search over entire HTML. Currently just search over JS tags for better performance.
        var html = doc.getElementsByTagName('script');
        
        if ( html ) 
        {
            ghostery.debug.log('html == '+html);
            for ( var bug_num = 0; bug_num < ghostery.db.bugs.length; bug_num++ )
            {
                // Just search over the Javascript src
                for( var js_num = 0; js_num < html.length; js_num++ )
                {
                    var js_src_tag = html[js_num].src;
                    var bug = ghostery.db.bugs[bug_num];

                    // Decide what to do next based on if we're analyzing the current tab
                    if ( bug.regex.test(js_src_tag) ) 
                    {   
                        if ( ghostery.currentTab ) 
                        {
                            ghostery.debug.log('Bug: '+bug.name+' found on '+page+'. Matching source: '+js_src_tag);
                            ghostery.showBug(bug, doc, countBug);
                            ghostery.currentBugs.push({ "bug": bug, "script": js_src_tag });
                        }
                        else
                        {
                            ghostery.recordStats(bug, doc.domain);
                        }

                        // Match was made so we should return and end loop
                        break;
                    }
                }
            }
        }
        
        html = '';
        
        // After processing the page report on any bugs found.
        if ( ghostery.currentTab ) { ghostery.bugReport(ghostery.bugsDetected, ghostery.bugsBlocked); }
    },

    /*
        Bug was found, display it
    */
    showBug: function(detectedBug, doc, countBug)
    {
        ghostery.debug.log('showBug('+detectedBug.name+', '+doc.location.href+', '+countBug+')');
        
        if ( detectedBug )
        {
            // Dedup
            if ( ghostery.bugBubbleMsg.indexOf(detectedBug.name) == -1 )  // No match 
            {
                // Append message
                var detectedBugMsg = detectedBug.name;
                var blocked = ghostery.prefs.shouldBlockBug(detectedBug.id);
                if (blocked) { detectedBugMsg = '<span style="color: #777; font-style: italic">' + detectedBug.name + '</span>'; }
                ghostery.bugBubbleMsg += detectedBugMsg + '<br/>';

                // Increment bug count
                ghostery.bugsDetected ++;
                if (blocked) { ghostery.bugsBlocked ++; }                

                // test notification bar
                // ghostery.ui.showBlockWarningBar(detectedBug +" was found.");
                
                // Record bug
                if ( countBug ) { ghostery.recordStats(detectedBug, doc.domain); }
            }
        }
    },

    /*
        Report on bugs found for the current page.
    */
    bugReport: function(bugCount, blockedCount)
    {
        ghostery.debug.log('bugReport('+bugCount+','+blockedCount+')');
        
        var status      = document.getElementById('ghostery-status');
        var tooltip     = document.getElementById('ghostery-tooltip-value');
        
        // We found some objects change icon to "active".
        if ( bugCount > 0 ) 
        {
            ghostery.debug.log('bugReport():> setting status to "found"');
            
            // Display message bubble if preference enabled OR this event came through a left click on the statusbar icon
            if ( ghostery.prefs.showBubble || ghostery.leftClickStatus ) 
            {
                var doc = gBrowser.selectedBrowser.contentDocument;
                
                // Reset this to false in-case it was set to true.
                ghostery.leftClickStatus = false;

                // Inject this javascript function to allow closing of the bubble message by clicking on it
                var head        = doc.getElementsByTagName("head")[0];         
                var js          = doc.createElement('script');
                js.type         = 'text/javascript';
                js.innerHTML    = 'function closeGhostery(){ var dgf = document.getElementById("'+ghostery.settings.bugBubbleId+'");    document.body.removeChild(dgf); }';
                head.appendChild(js);

                // output any of the strings found by adding a div element to this site
                var body    = doc.getElementsByTagName("body");
                var anchor  = doc.createElement('a');

                // Style Definition of message bubble
                anchor.id = ghostery.settings.bugBubbleId;
                anchor.style.opacity = "0.9";
                anchor.style.filter = "alpha(opacity=90)";
                anchor.style.position = "fixed";
                anchor.style.zIndex = "9000";
                anchor.style.top = "15px";
                anchor.style.right = "20px";
                anchor.style.background = "#330033";
                anchor.style.styleFloat = "right";
                anchor.style.padding = "7px 10px";
                anchor.style.color = "#ffffff";
                anchor.style.border = "solid 2px #fff";
                anchor.style.textDecoration = "none";
                anchor.style.textAlign = "left";
                anchor.style.font = "13px Arial,Helvetica";
                anchor.style.MozBorderRadius = "5px";
                anchor.style.WebkitBorderRadius = "5px";
                anchor.style.WebkitBoxShadow = "0px 0px 20px #000";
                anchor.style.MozBoxShadow = "0px 0px 20px #000";
                anchor.href = "javascript:closeGhostery()";
                doc.body.appendChild(anchor);

                anchor.innerHTML = ghostery.bugBubbleMsg;

                body[0].appendChild(anchor);

                if ( ghostery.prefs.autoDismissBubble ) 
                {
                    // Dismiss bubble after 15 seconds (default)
                    timeout = ghostery.prefs.bubbleTimeout * 1000;
                    setTimeout('ghostery.closeBubbleMessage();', timeout);
                }               
            }
            
            // Define bug label suffix
            bug_count_label = ' tracker';
            if (bugCount > 1) 
            {
                bug_count_label = ' trackers';
            }


            // Set statusbar
            status.setAttribute('status','found');
            tooltip.setAttribute('value', bugCount+bug_count_label+' found on this page, '+blockedCount+' blocked');

            // Display label if feature enabled
            if ( ghostery.prefs.showBugCount )
            {
                ghostery.debug.log('Setting label because ghostery.prefs.showBugCount returned "TRUE"');
                status.label.hidden = false;
                status.disabled = false;
                
                // If blocking enabled
                // Status text: Blocked 0 of 15
                if ( ghostery.prefs.blockingMode !== ghostery.prefs.blockNone )
                {
                    status.label = 'Blocked: '+blockedCount+' of '+bugCount;
                }
                // If blocking disabled
                // Status text: 15 trackers
                else 
                {
                    status.label = bugCount+bug_count_label;
                }
            }
            else
            {
                status.label.hidden = true; 
                status.disabled = true;
            }
            
        }
        // We didn't find any objects change status to "none"
        else
        {
            ghostery.debug.log('setGhosteryStatus():> setting status to "none"');
            
            // Set statusbar
            status.setAttribute('status', 'none');
            status.label = '';
            tooltip.setAttribute('value', 'n/a');
        }   
    },

    recordStats: function(bug, domain)
    {
        ghostery.debug.log("recordStats() called");
        if ( bug && domain )
        {
            ghostery.debug.log("recordStats("+bug.name+","+domain+")");
            // Check to see user has opted-in first
            if ( ghostery.prefs.shareData ) 
            {
                // First check if current [domain]:[web bug] has already been submitted for today
                domain_bug = domain+bug.name;
                var now = new Date();
                var today = ""+now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate();
                ghostery.debug.log("recordStats:> domain_bug="+domain_bug+", today="+today);
                
                if ( domain_bug in ghostery.censusCache) 
                {
                    // We found an entry for domain+webbug combo, now check to make sure we didn't already send an event today
                    ghostery.debug.log("recordStats:>> Found domain_bug="+domain_bug);
                    if (ghostery.censusCache[domain_bug] === today)
                    {
                        ghostery.debug.log("recordStats:>>> Already recorded this domain_bug today. Returning.");
                        return;
                    }
                    else
                    {
                        // A record exists for domain+webbug combo but we didn't see it today, update cache with new date
                        ghostery.censusCache[domain_bug] = today;
                    }                   
                } 
                else    // No entry from [domain]:[web bug] exists, create one
                {
                    ghostery.debug.log("recordStats:>> No entry found for domain_bug="+domain_bug+". Adding one now.");
                    ghostery.censusCache[domain_bug] = today;
                }
                            
                var p = ghostery.prefs;
                var census_url = p.censusURL + 
                    '?bid=' + bug.id + 
                    '&b=' + escape(bug.name) + 
                    '&d=' + escape(domain) + 
                    '&bl=' + p.shouldBlockBug(bug.id) + 
                    '&blm=' + p.blockingMode + 
                    '&bs=' + p.isSelectedBug(bug.id) + 
                    '&rnd=' + Math.ceil(9999999 * Math.random());
                var status = document.getElementById('ghostery-status');
                var child = document.createElement('image');
                child.setAttribute('src', census_url);
                status.appendChild(child);
                ghostery.debug.log("recordStats:>>>> Recorded web bug: "+census_url, 5);
            }
    }
    },
    
    /*
        Toggle Firefox Extension (active/inactive)
    */
    toggleSuspend: function(event)
    {
        ghostery.debug.log('toggleSuspend()');

        var tooltip             = document.getElementById('ghostery-tooltip-value');
        var status              = document.getElementById('ghostery-status');
        var suspend_menu_item   = document.getElementById('ghostery-menu-toggle-suspend');
        var doc                 = gBrowser.selectedBrowser.contentDocument;

        var pref = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
        pref = pref.getBranch("extensions.ghostery.");

        // Store in preferences
        if ( ghostery.prefs.enabled )
        {
            // Current state is "ENABLED" so toggle state to "DISABLED"
            pref.set('enabled', false);
            
            status.setAttribute("status", "disabled");
            tooltip.setAttribute("value", "Disabled");
            suspend_menu_item.setAttribute("label", "Resume Ghostery");
            
            ghostery.clearDetectedBugs();          
        }
        else
        {
            // Current state is "DISABLED" so toggle state to "ENABLED"
            pref.set('enabled', true);

            status.setAttribute("status", "enabled");
            tooltip.setAttribute("value", "Enabled");
            suspend_menu_item.setAttribute("label", "Suspend Ghostery");

            ghostery.onTabSelect(event);
        }
    },
    
    /*
        Handle clicks on the statusbar icon
    */
    iconClick: function(event)
    {
        ghostery.debug.log('iconClick() called.');

        const LEFT = 0, RIGHT = 2;
        
        if (event.button === LEFT && ghostery.prefs.enabled === true)
        {
            ghostery.leftClickStatus = true;
            // ghostery.onTabSelect(event);
            
            // Build pop-up menu

        }
    },
    
    clearDetectedBugs: function()
    {
        ghostery.debug.log("clearDetectedBugs() called for: "+gBrowser.selectedBrowser.contentDocument.location.href+" \n\n");
        
        ghostery.bugsDetected = ghostery.bugsBlocked = 0;
        ghostery.bugBubbleMsg = '';
        ghostery.closeBubbleMessage();
    },
    
    /*
       Close Ghostery Bubble Message
    */
    closeBubbleMessage: function()
    {
        ghostery.debug.log('closeBubbleMessage() called.');
        
        var doc = gBrowser.selectedBrowser.contentDocument;

        if (doc)
        {
            // Dismiss bubble if already exists
            el = doc.getElementById(ghostery.settings.bugBubbleId);
            if (el) 
            {
                doc.body.removeChild(el);
            }   
        }
    }
};

// hook our install
window.addEventListener( "load", ghostery.init, false );