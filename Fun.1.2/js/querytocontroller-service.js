(function(){

  angular.module("fun")

  .service('controllerSharedData', function(){

    this.userQuery;
    this.menuOrSearchBarQuery;
    this.furnitureMenuOptns = {
        bedroom:{
      
          allBedroom:{furnitureDescript:"Bedroom Furniture", furnitureTitle: "All Bedroom", searchQuery: "beds headboards dressers armoires drawers nightstands desks"},
          beds:{furnitureDescript:"Bedroom Furniture", furnitureTitle:"Beds", searchQuery: "beds"},
          dressers: {furnitureDescript:"Bedroom Furniture", furnitureTitle: "Dressers", searchQuery: "dressers armoires drawers"},
          nightstands: {furnitureDescript:"Bedroom Furniture", furnitureTitle: "Nightstands", searchQuery:"nightstands"},
          desks:{furnitureDescript:"Bedroom Furniture", furnitureTitle: "Desks", searchQuery: "desks"}
        },
        livingroom:{
          allLivingroom:{furnitureDescript:"Living Room Furniture", furnitureTitle: "All Living Room", searchQuery:"sofas sectionals coffee seats chairs stools"},
          sofasAndSectionals:{furnitureDescript:"Living Room Furniture", furnitureTitle: "Sofas and Sectionals", searchQuery: "sofas sectionals"},
          coffeeTables: {furnitureDescript:"Living Room Furniture",furnitureTitle: "Coffee Tables", searchQuery: "coffee"},
          accentChairsAndOttomans:{furnitureDescript:"Living Room Furniture", furnitureTitle:"Accent Chairs & Ottomans", searchQuery: "seats chairs stools"}
        },
        dining: {
          allDining:{furnitureDescript:"Dining & Kitchen Furniture", furnitureTitle: "All Dining & Kitchen Furniture", searchQuery:"dining"},
          diningTables:[],
          diningChairsAndStools:[]

        },
        storage: {
          allStorage:{furnitureDescript:"Storage Furniture", furnitureTitle:"All Storage Furniture", searchQuery: "media console shelf shelves cabinets credenzas"},
          mediaConsoles:{furnitureDescript: "Storage Furniture", furnitureTitle:"Media Consoles", searchQuery: "media consoles"},
          shelves:{furnitureDescript: "Storage Furniture", furnitureTitle:"Shelves", searchQuery:"shelf shelves"},
          cabinets:{furnitureDescript: "Storage Furniture", furnitureTitle:"Cabinets", searchQuery:"cabinets credenzas"}
        },
        outdoor: {
          allOutdoor: {furnitureDescript: "Outdoor Furniture", furnitureTitle:"All Outdoor Furniture", searchQuery: "outdoor"}
        },
        kidsFurniture: {
          allKidsFurniture: {furnitureDescript: "Kids Furniture", furnitureTitle: "All Kids Furniture", searchQuery: "beds cribs dressers nightstands desks", kidsFurniture:true},
          bedsAndCribs: {furnitureDescript:'Bedroom Furniture', furnitureTitle:'Beds & Cribs', searchQuery: 'beds cribs', kidsFurniture:true },
          dressers: {furnitureDescript: 'Bedroom Furniture', furnitureTitle:'Dressers', searchQuery:'dressers', kidsFurniture: true},
          nightstands: {furnitureDescript:'Bedroom Furniture', furnitureTitle:'Nightstands', searchQuery:'nightstands', kidsFurniture:true},
          desks: {furnitureDescript: 'Bedroom Furniture', furnitureTitle:'desks', searchQuery:'desks', kidsFurniture:true}
        },
        searchByRetailer: {
          westElm: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"West Elm", searchQuery: "west elm", searchRetailerIndex: "westelm"},
          potteryBarn: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"Pottery Barn", searchQuery: "pottery barn", searchRetailerIndex: "potterybarn"},
          potteryBarnKids: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"Pottery Barn Kids", searchQuery: "pottery barn", searchRetailerIndex: "potterybarnkids"},
          pbTeen: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"pbteen", searchQuery: "pbteen", searchRetailerIndex: "pbteen"},
          williamsSonoma: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"Williams Sonoma", searchQuery: "williams sonoma", searchRetailerIndex: "williamssonoma"},
          medley: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"medley", searchQuery: "medley", searchRetailerIndex: "medley"},
          aptTwoB: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"apt2b", searchQuery: "apt2b", searchRetailerIndex: "apt2b"},
          oneKingsLane: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"One Kings Lane", searchQuery: "kings", searchRetailerIndex: "onekingslane"},
          davinciBaby: {furnitureDescript:"Sustainable furniture by retailer", furnitureTitle:"Davinci Baby", searchQuery: "davinci baby", searchRetailerIndex: "davincibaby"}


        }

      }

  })

})();
