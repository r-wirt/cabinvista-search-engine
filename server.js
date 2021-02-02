var express = require("express");
var path = require("path");
var elasticsearch = require("elasticsearch")


var bodyParser = require("body-parser");
var session = require('express-session');
var http = require("http");

var app = express();



// Currently used for parsing session id from application/json 'request' object
app.use(bodyParser.json());

// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('json spaces', 2);///For testing purposes at the moment, sends back a pretty JSON response

////Currently used to grab users session id for /randomresults GET request
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))



///Allows localhost to make requests itself(localhost)
app.use(function(req, res, next) {
     res.header('Access-Control-Allow-Origin', '*');
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
     res.header('Access-Control-Allow-Headers', 'Content-Type');
      // Set to true to include cookies
     res.setHeader('Access-Control-Allow-Credentials', true);

   next();
  });

app.use(express.static(path.join(__dirname,"/Fun.1.2")));

///Establishes connection with ES API
var client = new elasticsearch.Client({
   host: 'http://localhost:9200'
   //,log: ['error', 'trace']
});
///Variables for standard and kids furniture ES indices
var standardFurnitureRetailers = ["westelm","onekingslane","williamssonoma", "medley","apt2b", "potterybarn"]
var kidsFurnitureRetailers = ["potterybarnkids","pbteen","davincibaby"]

app.get("/",function(request, response){
    response.sendFile("index.html", {root: "Fun.1.2"});
});

app.get("/homepageprev", function(request,response){

  ////ES Multi-search request
  ////Uses Session in request to return random results for client
  client.msearch({
    body:[

      /////Request for living room furniture category
      {index: standardFurnitureRetailers},
      {
        size:4,
        query:{
        function_score: {
          query: {
            query_string: {
              query:"livingroom sofa sofa sectional sectionals coffee seat chair stool",
              fields:[
                "sitename","productname"
              ]
            }
          },
          functions:[{random_score: {seed: request.sessionID}}]
        }
      }
    },

      //////Request for Baby & Kids Furniture
      {index: kidsFurnitureRetailers},
      {
        size: 4,
        query:{
        function_score: {
          query: {match_all: {}},
          functions: [{random_score: {seed: request.sessionID}}]
        }
      }
    },

       //////Request for bedroom furniture category
      {index:standardFurnitureRetailers},
      {
        size:4,
        query:{
        function_score: {
          query: {
            query_string: {
              query:"bedroom bedrooms bed beds headboard headboards dresser dressers armoire armoires drawer nightstand nightstands desk desks",
              fields:[
                "sitename","productname"
              ]
            }
          },
          functions:[{random_score: {seed: request.sessionID}}]
        }
      }
    },

      /////Request for Dining & Kitchen FURNITURE
      {index:standardFurnitureRetailers},
      {
        size:4,
        query:{
        function_score: {
          query: {
            query_string: {
              query:"dining kitchen",
              fields:[
                "sitename","productname"
              ]
            }
          },
          functions:[{random_score: {seed: request.sessionID}}]
        }
      }
    }



    ]
  }).then(function(body){

    response.send(body)

  }, function(err){

    console.trace(err.message)
  })


})

/////User's initial search bar request
app.get("/searchbar", function(request,response){


  //If request is regarding kids furniture
  //and no specific retailers have been narrowed
  //Search all kids related retailers
 if(request.query.furnituretype === '/searchkidsfurniture' && request.query.currentretailerssearching === undefined){
   console.log("kids furniture")
   request.query.currentretailerssearching = kidsFurnitureRetailers
 }
 //If request is regarding standard furniture
 //and no specific retailers have been narrowed
 //Search all standard furniture related retailers
 else if(request.query.furnituretype === '/search' && request.query.currentretailerssearching === undefined ){


   request.query.currentretailerssearching = standardFurnitureRetailers

 }



///Search is sorted by id descending
client.search({
    index: request.query.currentretailerssearching,
    body: {
        size: 27,
        query: {
            multi_match: {
                query: request.query.currentuserquery,
                fields: [
                    "sitename",
                    "productname",
                    "certifications.certification",
                    "certifications.title"
                  ]
            }
        },
        sort: [{_id: "desc"}],
        aggs: { site_names: { terms: {field: "sitename.raw"} },
            price_ranges:{
                range: {
                    field: "lowestprice",
                    ranges: [
                        { to: 500.0 },
                        { from : 500.0, "to" : 1000.0 },
                        { from : 1000.0, "to" : 1500.0 },
                        { from : 1500.0, "to" : 3000.0},
                        { from : 3000.0}
                    ]
                }
            }
        }
    }
}).then(function (body){
    ///Sends query results to the client
    response.send(body);

}, function(err){


    console.trace(err.message)
});

});

app.get("/pricerange", function(request,response){
if(!request.query.pricerange){


}


  //If request is regarding kids furniture
  //and no specific retailers have been narrowed
  //Search all kids related retailers
 if(request.query.furnituretype === '/searchkidsfurniture.html' && request.query.currentretailerssearching === undefined){
   request.query.currentretailerssearching = kidsFurnitureRetailers
 }
 //If request is regarding standard furniture
 //and no specific retailers have been narrowed
 //Search all standard furniture related retailers
 else if(request.query.furnituretype === '/search.html' && request.query.currentretailerssearching === undefined ){

   request.query.currentretailerssearching = standardFurnitureRetailers

 }

 ////If price sort & price range have not been selected, or have been unselected
 ////Search according to id descending
if(!request.query.pricerange && !request.query.pricesort){

  client.search({
    index: request.query.currentretailerssearching,
    body: {
      size: 27,
      query:{
        bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
        }
      }, sort: { _id:{ order:"desc"}}
  }

  }).then(function(body){
    response.send(body)
  },function(err){
      console.log(err)
  })
  return

////Begin search based on only a price range being specified, with no price sorting
////Sorts products by id descending
}else if(request.query.pricerange && !request.query.pricesort){
   client.search({
     index: request.query.currentretailerssearching,
     body: {
       size: 27,
       query:{
         bool: {
           must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
           filter: { range: JSON.parse(request.query.pricerange) }
         }
       }, sort: { _id:{ order:"desc"}}
   }

   }).then(function(body){
     response.send(body)
   },function(err){
       console.log(err)
   })
   return


////Begin search based on only a price sort being specified, with no price range
}else if(request.query.pricesort && !request.query.pricerange){



   client.search({
     index: request.query.currentretailerssearching,
     body: {
       size: 27,
       query:{
         bool: {
           must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
         }
       }, sort: {lowestprice: {order: request.query.pricesort}}
  }

  }).then(function(body){

    response.send(body)


  },function(err){
      console.log(err)
  })

////Begin search based on a price sorting and price range being specified
}else if(request.query.pricerange && request.query.pricesort){

  client.search({
    index: request.query.currentretailerssearching,
    body: {
      size: 27,
      query:{
        bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
          filter: { range: JSON.parse(request.query.pricerange) }
        }
      }, sort: {lowestprice: {order: request.query.pricesort}}
 }

 }).then(function(body){

   response.send(body)


 },function(err){
     console.log(err)
 })

}


});

///Initiate customer search based on client's requested order of price
app.get("/sortthepricing", function(request, response){

  //If request is regarding kids furniture
  //and no specific retailers have been narrowed
  //Search all kids related retailers
  if(request.query.furnituretype === '/searchkidsfurniture.html' && request.query.currentretailerssearching === undefined){
    request.query.currentretailerssearching = kidsFurnitureRetailers
  }
  else if(request.query.furnituretype === '/search.html' && request.query.currentretailerssearching === undefined ){

     request.query.currentretailerssearching = standardFurnitureRetailers

  }

  /////If price range object is available sort the price based on current price range
  /////If no price range has been specified, sort results according the price either 'asc' or 'desc'
  /////Tip: Null is returned as an object(in case needed for debugging)


  if(!request.query.pricesort && !request.query.pricerange){

    /////If no price range or price sort has been specified, sort results according the id desc
   client.search({
     index: request.query.currentretailerssearching,
     body: {
       size: 27,
       query:{
       bool: {
         must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
       }
     },sort: {_id:{ order:"desc"}}
     }
   }).then(function(body){

       response.send(body)

   },function(err){
       console.log(err)
   })

  return

//If price sorting and price range has been specified, return results according to both specifications
}else if(request.query.pricesort && request.query.pricerange){

  client.search({
    index: request.query.currentretailerssearching,
    body: {
     size: 27,
     query:{
       bool: {
         must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
         filter: {
           range: JSON.parse(request.query.pricerange)
         }
       }
     },sort: {lowestprice: {order:request.query.pricesort}}
   }
 }).then(function(body){
   response.send(body)
 },function(err){
     console.log(err)
 });

 return


/////If price sort object is available and price range is unavailable, sort the products based on desired price sort
}else if(request.query.pricesort && !request.query.pricerange){

    client.search({
      index: request.query.currentretailerssearching,
      body: {
       size: 27,
       query:{
         bool: {
           must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"]}}
         }
       },sort: {lowestprice: {order:request.query.pricesort}}
     }
   }).then(function(body){
     response.send(body)
   },function(err){
       console.log(err)
   });

   return


}else if(request.query.pricerange && !request.query.pricesort){

  client.search({
    index: request.query.currentretailerssearching,
    body: {
     size: 27,
     query:{
       bool: {
         must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
         filter: {
           range: JSON.parse(request.query.pricerange)
         }
       }
     }
   }
 }).then(function(body){
   response.send(body)
 },function(err){
     console.log(err)
 });

 return


}

});


////Narrow search results by desired brands
app.get("/narrowbybrand", function(request, response){

  //If request is regarding kids furniture
  //and no specific retailers have been narrowed
  //Search all kids related retailers
  //These if/else if blocks are required in case the user decides to leave all retailers unchecked again
  if(request.query.furnituretype === '/searchkidsfurniture.html' && request.query.currentretailerssearching === undefined){
    request.query.currentretailerssearching = kidsFurnitureRetailers
  }
  else if(request.query.furnituretype === '/search.html' && request.query.currentretailerssearching === undefined){

    request.query.currentretailerssearching = standardFurnitureRetailers

  }

  ///If no price sorting or price range has been specified, fetch more results based on id desc & brands searched
  if(!request.query.pricesort && !request.query.pricerange){


    client.search({
      index: request.query.currentretailerssearching,
      body: {
        size: 27,
        query:{
          bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
        }
      },sort: {_id:{ order:"desc"}}
      }


    }).then(function(body){

      var results = body.hits;//Contains results from ES
      response.send(results);///Sends query results to the client

    },function(err){

      console.trace(err.message)
    });

    return

  ///If price sorting has been specified without price range, fetch more results based in desired price sorting order
  }else if(request.query.pricesort && !request.query.pricerange){

    
    client.search({
      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
        }
      },sort: {lowestprice:{ order:request.query.pricesort}}

      }
    }).then(function(body){

      var results = body.hits;//Contains results from ES
      response.send(results);///Sends query results to the client

    },function(err){

      console.trace(err.message)
    });

    return

  ///If price range has been specified without price sort
  ///Fetch more results that fit description of desired price ranges
  ///Sorting will be id descending
  }else if(request.query.pricerange && !request.query.pricesort){


    client.search({

      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
            must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
            filter: { range: JSON.parse(request.query.pricerange)}
          }
        },sort: { _id:{ order:"desc"}}
      }

     }).then(function(body){

      var results = body.hits;
      response.send(results);

    },function(err){

      console.trace(err.message)
    });

    return




  }else if(request.query.pricerange && request.query.pricesort){


    client.search({

      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
            must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
            filter: { range: JSON.parse(request.query.pricerange)}
          }
        },
        sort: {lowestprice:{ order:request.query.pricesort}}
      }

     }).then(function(body){

      var results = body.hits;
      response.send(results);

    },function(err){

      console.trace(err.message)
    });

    return

  }
});


////Get more results on scroll
app.get("/fetchmoreresults", function(request, response){

  //If request is regarding kids furniture
  //and no specific retailers have been narrowed
  //Search all kids related retailers
  if(request.query.furnituretype === '/searchkidsfurniture.html' && request.query.currentretailerssearching === undefined){
    request.query.currentretailerssearching = kidsFurnitureRetailers
  }
  else if(request.query.furnituretype === '/search.html' && request.query.currentretailerssearching === undefined ){
    request.query.currentretailerssearching = standardFurnitureRetailers
  }

  ///If no price sorting or price range has been specified, fetch more results based on id desc
  if(!request.query.pricesort && !request.query.pricerange){



    client.search({
      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
        }
      },
      sort: { _id: { order:'desc'}},
      search_after:[request.query.searchafterid]

      }

    }).then(function(body){

      var results = body.hits;
      response.send(results);

    },function(err){

      console.trace(err.message)
    });

    return
  ///If price sorting has been specified without a price range,
  ///fetch more results based on the order of desired price sorting
  }else if(request.query.pricesort && !request.query.pricerange){




    client.search({
      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }}
        }
      },
      search_after:[request.query.searchafterlowestprice],
      sort: { lowestprice:{ order:request.query.pricesort}}
      }
    }).then(function(body){

      var results = body.hits;
      response.send(results);

    },function(err){

      console.trace(err.message)
    });

    return
    ///If price range has been specified without a price sorting,
    ///fetch more results sorted by id descending
  }else if(request.query.pricerange && !request.query.pricesort){


    client.search({
      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
          must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
          filter: {range: JSON.parse(request.query.pricerange) }
        }
      },
        sort: { _id: { order:'desc'}},
        search_after:[request.query.searchafterid]

      }
    }).then(function(body){

      var results = body.hits;
      response.send(results);
    },function(err){

      console.trace(err.message)
    });

    return
  ///If price range and price sorting have been specified
  ///Fetch more results that fit the price range,
  ///and are sorted by the desired price sorting
  }else if(request.query.pricerange && request.query.pricesort){


    client.search({

      index: request.query.currentretailerssearching,
      body:{
        size: 27,
        query:{
          bool: {
            must: { multi_match: { query: request.query.currentuserquery, fields:["sitename","productname", "certifications.certification","certifications.title"] }},
            filter: { range: JSON.parse(request.query.pricerange)}
          }
        },
        search_after:[request.query.searchafterlowestprice],
        sort: {lowestprice:{ order:request.query.pricesort}}
      }
     }).then(function(body){

      var results = body.hits;
      response.send(results);

    },function(err){

      console.trace(err.message)
    });

    return


  }

});
app.listen(8080,function(){
  console.log("App is listening")
})
