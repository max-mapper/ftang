var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc =
  { _id:'_design/ftang'
  , rewrites :
    [ {from:"/", to:'index.html'}
    , {from: "/iphone", to:'iphone.html'}
    , {from: "/play.gif", to:'img/play.gif'}
    , {from:"/api/artists", to:'_view/artists', query: {"group": "true"}}
    , {from:"/api/artist/:artist", to:"_view/artist", query:{startkey:":artist", endkey:":artist", include_docs: "true"}}
    , {from:"/api", to:'../../'}
    , {from:"/api/*", to:'../../*'}
    , {from:"/*", to:'*'}
    ]
  }
  ;

ddoc.views = {
  artists: {
    map: function(doc) {
      if (doc.artist) emit(doc.artist, 1);
    },
    reduce: "_sum"
  },
  artist: {
    map: function(doc) {
      if (doc.artist) emit(doc.artist);
    }
  }
}

ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {
  if (userCtx.roles.indexOf('_admin') === -1) throw "Only admin can do stuff on this database.";
};

couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));

module.exports = ddoc;