/*
 * This file contains functions to generate OBJECT and EMBED tags for QuickTime content. 
 */

/************** LOCALIZABLE GLOBAL VARIABLES ****************/

var gArgCountErr =    'The "%%" function requires an even number of arguments.'
              +   '\nArguments should be in the form "atttributeName", "attributeValue", ...';

/******************** END LOCALIZABLE **********************/

var gTagAttrs              = null;
var gQTGeneratorVersion     = 1.0;

function AC_QuickTimeVersion()  { return gQTGeneratorVersion; }

function _QTComplain(callingFcnName, errMsg)
{
    errMsg = errMsg.replace("%%", callingFcnName);
 alert(errMsg);
}

function _QTAddAttribute(prefix, slotName, tagName)
{
    var     value;

    value = gTagAttrs[prefix + slotName];
  if ( null == value )
       value = gTagAttrs[slotName];

  if ( null != value )
   {
      if ( 0 == slotName.indexOf(prefix) && (null == tagName) )
          tagName = slotName.substring(prefix.length); 
      if ( null == tagName ) 
            tagName = slotName;
        return tagName + '="' + value + '" ';
  }
  else
       return "";
}

function _QTAddObjectAttr(slotName, tagName)
{
   // don't bother if it is only for the embed tag
    if ( 0 == slotName.indexOf("emb#") )
       return "";

    if ( 0 == slotName.indexOf("obj#") && (null == tagName) )
      tagName = slotName.substring(4); 

 return _QTAddAttribute("obj#", slotName, tagName);
}

function _QTAddEmbedAttr(slotName, tagName)
{
    // don't bother if it is only for the object tag
   if ( 0 == slotName.indexOf("obj#") )
       return "";

    if ( 0 == slotName.indexOf("emb#") && (null == tagName) )
      tagName = slotName.substring(4); 

 return _QTAddAttribute("emb#", slotName, tagName);
}


function _QTAddObjectParam(slotName, generateXHTML)
{
   var     paramValue;
    var     paramStr = "";
 var     endTagChar = (generateXHTML) ? ' />' : '>';

   if ( -1 == slotName.indexOf("emb#") )
  {
      // look for the OBJECT-only param first. if there is none, look for a generic one
      paramValue = gTagAttrs["obj#" + slotName];
     if ( null == paramValue )
          paramValue = gTagAttrs[slotName];

     if ( 0 == slotName.indexOf("obj#") )
           slotName = slotName.substring(4); 
 
       if ( null != paramValue )
          paramStr = '  <param name="' + slotName + '" value="' + paramValue + '"' + endTagChar + '\n';
  }

 return paramStr;
}

function _QTDeleteTagAttrs()
{
 for ( var ndx = 0; ndx < arguments.length; ndx++ )
 {
      var attrName = arguments[ndx];
     delete gTagAttrs[attrName];
        delete gTagAttrs["emb#" + attrName];
       delete gTagAttrs["obj#" + attrName];
   }
}

       

// generate an embed and object tag, return as a string
function _QTGenerate(callingFcnName, generateXHTML, args)
{
  // is the number of optional arguments even?
   if ( args.length < 4 || (0 != (args.length % 2)) )
 {
      _QTComplain(callingFcnName, gArgCountErr);
     return "";
 }
  
   // allocate an array, fill in the required attributes with fixed place params and defaults
 gTagAttrs = new Array();
   gTagAttrs["src"] = args[0];
    gTagAttrs["width"] = args[1];
  gTagAttrs["height"] = args[2];
 gTagAttrs["classid"] = "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B";
   gTagAttrs["pluginspage"] = "http://www.apple.com/quicktime/download/";

    // set up codebase attribute with specified or default version before parsing args so
  //  anything passed in will override
   var activexVers = args[3]
  if ( (null == activexVers) || ("" == activexVers) )
        activexVers = "6,0,2,0";
   gTagAttrs["codebase"] = "http://www.apple.com/qtactivex/qtplugin.cab#version=" + activexVers;

 var attrName,
      attrValue;

    // add all of the optional attributes to the array
 for ( var ndx = 4; ndx < args.length; ndx += 2)
    {
      attrName = args[ndx].toLowerCase();
        attrValue = args[ndx + 1];

        // "name" and "id" should have the same value, the former goes in the embed and the later goes in
      //  the object. use one array slot 
        if ( "name" == attrName || "id" == attrName )
          gTagAttrs["name"] = attrValue;

        else 
          gTagAttrs[attrName] = attrValue;
   }

 // init both tags with the required and "special" attributes
   var objTag =  '<object '
                   + _QTAddObjectAttr("classid")
                  + _QTAddObjectAttr("width")
                    + _QTAddObjectAttr("height")
                   + _QTAddObjectAttr("codebase")
                 + _QTAddObjectAttr("name", "id")
                   + _QTAddObjectAttr("tabindex")
                 + _QTAddObjectAttr("hspace")
                   + _QTAddObjectAttr("vspace")
                   + _QTAddObjectAttr("border")
                   + _QTAddObjectAttr("align")
                    + _QTAddObjectAttr("class")
                    + _QTAddObjectAttr("title")
                    + _QTAddObjectAttr("accesskey")
                    + _QTAddObjectAttr("noexternaldata")
                   + '>\n'
                    + _QTAddObjectParam("src", generateXHTML);
 var embedTag = '  <embed '
                 + _QTAddEmbedAttr("src")
                   + _QTAddEmbedAttr("width")
                 + _QTAddEmbedAttr("height")
                    + _QTAddEmbedAttr("pluginspage")
                   + _QTAddEmbedAttr("name")
                  + _QTAddEmbedAttr("align")
                 + _QTAddEmbedAttr("tabindex");

    // delete the attributes/params we have already added
  _QTDeleteTagAttrs("src","width","height","pluginspage","classid","codebase","name","tabindex",
                 "hspace","vspace","border","align","noexternaldata","class","title","accesskey");

 // and finally, add all of the remaining attributes to the embed and object
    for ( var attrName in gTagAttrs )
  {
      attrValue = gTagAttrs[attrName];
       if ( null != attrValue )
       {
          embedTag += _QTAddEmbedAttr(attrName);
         objTag += _QTAddObjectParam(attrName, generateXHTML);
      }
  } 

    // end both tags, we're done
   return objTag + embedTag + '> </em' + 'bed>\n</ob' + 'ject' + '>';
}

// return the object/embed as a string
function QT_GenerateOBJECTText()
{
    return _QTGenerate("QT_GenerateOBJECTText", false, arguments);
}

function QT_GenerateOBJECTText_XHTML()
{
 return _QTGenerate("QT_GenerateOBJECTText_XHTML", true, arguments);
}

function QT_WriteOBJECT()
{
 document.writeln(_QTGenerate("QT_WriteOBJECT", false, arguments));
}

function QT_WriteOBJECT_XHTML()
{
    document.writeln(_QTGenerate("QT_WriteOBJECT_XHTML", true, arguments));
}


