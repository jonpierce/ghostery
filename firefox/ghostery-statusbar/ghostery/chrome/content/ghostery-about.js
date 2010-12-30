/**
 * Ghostery Firefox Extension: http://www.ghostery.com/
 *
 * Copyright (C) 2008-2009 David Cancel
 *
 * @author David Cancel
 * @copyright Copyright (C) 2008-2009 David Cancel <dcancel@dcancel.com>
*/
function openURL(aUrl){

  if("@mozilla.org/xre/app-info;1" in Components.classes)      
     return;
  else{
     //for pre 1.5 version
     window.opener.openURL(aUrl)  
  }
}