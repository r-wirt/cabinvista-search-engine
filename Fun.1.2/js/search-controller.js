(function(){

  angular.module("fun")

  ///////////Search Controller////////////////
  .controller("searchController", ["$window", "$http", "$scope", "$cookies", "$location" ,"controllerSharedData", function($window, $http, $scope, $cookies, $location,  controllerSharedData){

    $(document).foundation();
    /////Google analytics, send page view////
    $scope.$on('$viewContentLoaded', function(event){
      $window.ga('set', 'page', $location.url());
      $window.ga('send','pageview', { page: $location.url() });
    });


    //Underline the current selected price sorting option
    $('.price-sorting-option').click(function(){
      $(this).siblings().removeClass('is-active');
      $(this).addClass('is-active');
    });

    ///Highlight selected price filter/range option
    $('input.checkboxoption').on('change', function(){

      if($(this).next().hasClass('highlight-green')){
        $(this).next().removeClass('highlight-green')
        return
      }

      $(this).next().addClass('highlight-green');
      $('input.checkboxoption').not(this).prop('checked',false);
      $('input.checkboxoption').not(this).next().removeClass('highlight-green')


    })

    ////Reset underline of price sort to 'best match' when mega menu selection has been chosen
    $('.mega-menu-div, .mega-menu-div-retailers, .searchbarbutton, #top-section-site-menu').click(function(){
      $('.price-sorting div').first().addClass('is-active').siblings().removeClass('is-active');
    });
    ////Reset underline of price sort to 'best match' when search bar request has been submitted
    $('.search-form').submit(function(){
      $('.price-sorting div').first().addClass('is-active').siblings().removeClass('is-active');
    });

    var vm = this;

    ////Mega menu functionality
    vm.showFurnitureByCatgMenu = false;
    vm.showBabyKidsMenu = false;
    vm.showBabyKidsCatgMenu = false;
    vm.showRetailerMenu = false;

    window.addEventListener('scroll', function(){

      if(window.scrollY > 250 && vm.showFurnitureByCatgMenu ||
         window.scrollY > 250 && vm.showBabyKidsMenu ||
          window.scrollY > 250 && vm.showRetailerMenu ){
        vm.showFurnitureByCatgMenu = false;
        vm.showBabyKidsMenu = false;
        vm.showRetailerMenu = false;
        console.log("initiated")
        console.log(window.scrollY)
        $scope.$digest();

      }
    })


    vm.searchFromMenu = searchFromMenu;

    vm.requestFromSearchBar = requestFromSearchBar;

    vm.furnitureMenuOptns = controllerSharedData.furnitureMenuOptns

    ////Save user's last query in case of page refresh
    vm.saveQueryInCookies = $cookies.getObject("saveUserQueryVar");


    vm.saveQueryObject = {};

    vm.searchBarQuery= '';

    //Variable for search requests originating from search bar in search-page.html
    vm.currentSearchRequest = '';

    //String of current price direction ('asc' or 'desc')//
    vm.currentPriceSort = undefined;

    vm.currentPriceRange = undefined;

    //Hides content client results until available
    //Remains false until query results are available for requestFromSearchBar()
    vm.revealSearchBarResults = false;

    ////Hides content requested from menu/mega-menu until available
    ///Remains false until searchFromMenu() returns results
    vm.revealMenuSearchResults = false;

    //The vm.getMoreUntilDone() function will make this falsey
    //when it has figured that no more data is available for search query
    vm.allResultsLoaded = false;

    ///Changes to true during page load in certain functions
    vm.blurPageAddSpinner = false;

    //Container for search results
    vm.searchResults = [];

    //Container for current retailers being searched
    vm.currentRetailersSearching = [];

    vm.priceRangeOptions = [{'lowestprice': { 'gte': 50, 'lte':500}},
                            { 'lowestprice': {'gte': 500, 'lte':1000 }},
                            { 'lowestprice': { 'gte': 1000, 'lte':1500}},
                            { 'lowestprice': { 'gte': 1500, 'lte':3000}},
                            { 'lowestprice': { 'gte': 3000 }}]

    vm.toRelevantArticles = function(){
      $location.url('/articles-regarding-eco-furniture');
    }


    vm.filterPriceRange = function(pricerange){


      if(vm.currentPriceRange === pricerange){
        vm.currentPriceRange = undefined;

    }else{
      //Store current price range
      vm.currentPriceRange = pricerange
    }



      ///vm.allResultsLoaded should remain false until the vm.getMoreUntilDone() function
      ///decides that all results have been loaded
      vm.allResultsLoaded = false;

      //Add blur and loading spinner to page while fetching results
      vm.blurPageAddSpinner = true;



      ///Begin searching ES with the selected menu category and furniture type(standard or kids) as arguments
      $http({
        method: 'GET',
        url: 'http://localhost:8080/pricerange',
        params: {
          "currentuserquery": vm.currentSearchRequest,
          "currentretailerssearching[]": vm.currentRetailersSearching,
          "pricesort":vm.currentPriceSort,
          "pricerange": vm.currentPriceRange,
          "furnituretype":  $location.path()
        }}).then(function(response){

          ///Store each product from server's response in array searchResults
          vm.searchResults = response.data.hits.hits;

          ///Add tool tip to certification in product card
          vm.addToolTips();

          //Remove blur and loading spinner since data is available
          vm.blurPageAddSpinner = false;

        })

    }


    vm.addToolTips = function(){

      setTimeout(function(){

        tippy('[title]', {
          arrow: true,
          animation: 'fade',
          theme:'certification'
         });

       },1000)

    }

    vm.digestQuery = function(){
      ////Launch conditional if query originated from search bar
      if(vm.searchBarQuery){
        vm.requestFromSearchBar({searchQuery: vm.searchBarQuery});
        return
      /////Launch conditional if menu-style query data is being transferred from homepage to search page
      }else if(controllerSharedData.userQuery && controllerSharedData.menuOrSearchBarQuery === 'menu'){
        ////All 'browser-back-button' presses should lead back to home page
        ////Launch conditional if user clicks back button from '/searchkidsfurniture.html' back into '/search.html' with a 'searchkidsfurniture' query
        ///Client will be redirected to home page instead of staying on '/search.html' with '/searchkidsfurniture.html' query
        if('kidsFurniture' in controllerSharedData.userQuery && $location.url()==='/search'){
          $location.url('/')
          return

        }else{
          vm.searchFromMenu(controllerSharedData.userQuery);
          return
        }

     /////Launch conditional if searchbar-style query data is being transferred from homepage to search page
      }else if(controllerSharedData.userQuery && controllerSharedData.menuOrSearchBarQuery === 'searchbar'){
        vm.requestFromSearchBar(controllerSharedData.userQuery);
        return

      /////Launch conditional if page is refreshed and last saved query needs to be used
      }else if(vm.saveQueryInCookies){
        ////All 'browser-back-button' presses should lead back to home page
        ////Launch conditional if user clicks back button from '/searchkidsfurniture.html' back into '/search.html' with a 'searchkidsfurniture' query
        ///Client will be redirected to home page instead of staying on '/search.html' with '/searchkidsfurniture.html' query
        if('kidsFurniture' in vm.saveQueryInCookies && $location.url()==='/search'){
          $location.url('/')
          return

        ////If 'furnitureDescript' is in vm.saveQueryInCookies, it is a menu-style query object
        ////Use vm.searchFromMenu() for menu-style query objects
        }else if('furnitureDescript' in vm.saveQueryInCookies){
          vm.searchFromMenu(vm.saveQueryInCookies);
          return

        }else{
          vm.requestFromSearchBar(vm.saveQueryInCookies);
          return
        }
      }
    }

    //Function initiates as soon as controller loads
    vm.digestQuery();


    function searchFromMenu(menuRequestObject){

      /////Google Analytics: Send menu request to google analytics/////
       $window.ga('send',{
         hitType:'event',
         eventCategory:'Menu Selection',
         eventAction:'Menu Selection Clicked',
         eventLabel: menuRequestObject.furnitureTitle

       });

      // $('input.checkboxoption').prop('checked',false);
      //   $('label[for="checkboxoption"]').removeClass('highlight-green')

       ////Clear previous search bar queries from top of navigation
       vm.searchBarQuery = '';

       ////Currently saving request object in memory-- in the case the filterPriceRange function needs it.
       vm.saveQueryObject = menuRequestObject;

      ///Save menu request in case of page refresh
      $cookies.putObject("saveUserQueryVar", menuRequestObject);


      ///vm.allResultsLoaded should remain false until the vm.getMoreUntilDone() function
      ///decides that all results have been loaded
      vm.allResultsLoaded = false;

      //Add blur and loading spinner to page while fetching results
      vm.blurPageAddSpinner = true;
      ////If searchRetailerIndex/searchFurniture By Retailer has been specified/clicked
      ////Inititiate search with the only specified index
      if(menuRequestObject.searchRetailerIndex){
        vm.currentRetailersSearching = menuRequestObject.searchRetailerIndex;
        vm.clientSearchbyOneRetailer = true;
      }else{
        ///Reset current retailers searching in memory to 'all'
        ///In case user decides to product filter/sort the menu results
        vm.currentRetailersSearching = []
        vm.clientSearchbyOneRetailer = false;
      }


      vm.currentSearchRequest = menuRequestObject.searchQuery;
      vm.furnitureDescript = menuRequestObject.furnitureDescript;
      vm.furnitureTitle = menuRequestObject.furnitureTitle;


      ///Begin searching ES with the selected menu category and furniture type(standard or kids) as arguments
      $http({
        method: 'GET',
        url: 'http://localhost:8080/searchbar',
        params: {
          "currentuserquery": menuRequestObject.searchQuery,
          "currentretailerssearching[]": vm.currentRetailersSearching,
          "furnituretype":  $location.path()
        }})
        .then(function(response){


          vm.totalResultsFound = response.data.hits.total


          vm.searchResults = response.data.hits.hits;


          vm.siteNames = response.data.aggregations.site_names.buckets


          vm.priceRanges = response.data.aggregations.price_ranges.buckets

         //Show menu result numbers[Ex: Bedroom Furniture >>> Beds, # results found]
          vm.revealMenuSearchResults = true;

          ///Add tool tip to certification in product card
          vm.addToolTips();

          //Remove blur and loading spinner since data is available
          vm.blurPageAddSpinner = false;

      });

    }

    ///Request begins on enter key/search icon being pressed in search bar
    //Also initiates on search-controller.js loading
    function requestFromSearchBar (searchBarRequestObject){
      /////Google Analytics: Send search bar request to google analytics/////
      $window.ga('send',{
        hitType:'event',
        eventCategory:'Search Bar Request',
        eventAction:'Search Bar Request Submitted',
        eventLabel: searchBarRequestObject.searchQuery

      });


      ////Currently saving request object in memory-- in the case that filterPriceRange needs it.
      vm.saveQueryObject = searchBarRequestObject;

      //Hide any previous menu result layouts
      //Ex: Bedroom Furniture >>> Beds, # results found
      vm.revealMenuSearchResults = false;

      //Start page loading CSS
      vm.blurPageAddSpinner = true;

      ///vm.allResultsLoaded should remain false until the vm.getMoreUntilDone() function
      ///decides that all content has been loaded
      vm.allResultsLoaded = false;

      //Variable should remain false since all queries from search bar
      //return results for all brands
      vm.clientSearchbyOneRetailer = false;

      ///Save search request in variable during session
      vm.currentSearchRequest = searchBarRequestObject.searchQuery;



      ///Save query in case of page refresh
      $cookies.putObject("saveUserQueryVar", searchBarRequestObject)

      //https request to '/searchbar/ +the Client's query on server to get data based on query
      $http({
        method:'GET',
        url:'http://localhost:8080/searchbar',
        params: {
          "currentretailerssearching[]":[],///ES will interpret empty as search all indices
          "currentuserquery": searchBarRequestObject.searchQuery,
          "furnituretype":  $location.path()
        }})
        .then(function(response){

          //Shows up as 'x' results found for 'searchResultvalue' on client's page, one-time binding
          vm.searchResultValue = searchBarRequestObject.searchQuery;


          vm.currentSearchRequest = searchBarRequestObject.searchQuery;


          vm.totalResultsFound = response.data.hits.total


          vm.searchResults = response.data.hits.hits;


          vm.siteNames = response.data.aggregations.site_names.buckets


          vm.priceRanges = response.data.aggregations.price_ranges.buckets

          ///Add tool tip to certification in product card
          vm.addToolTips();

          //Discard loading page css since data is available
          vm.blurPageAddSpinner = false;
          //Show all query data
          vm.revealSearchBarResults = true;
    });
  }

  vm.switchToKidsOrStandardFurniture = function(megaMenuSelection){

    //Update current user's query in memory
    //Variable will be an object
    controllerSharedData.userQuery = megaMenuSelection;
    controllerSharedData.menuOrSearchBarQuery = 'menu';
    if($location.url() ==='/'){
      $location.url('/searchkidsfurniture');

    }else if($location.url() === '/search'){
      $location.url('/searchkidsfurniture');

    }else if($location.url() === '/searchkidsfurniture'){
      $location.url('/search');
    }



  }


  /////Price sorting function arranges price by either asc or desc based on user's request
  vm.sortThePrice = function(pricesort){


    ///vm.allResultsLoaded should remain false until the vm.getMoreUntilDone() function
    ///decides that all content has been loaded
    vm.allResultsLoaded = false;

    //Start page loading CSS
    vm.blurPageAddSpinner = true;

    //Assign the desired price sorting (either asc or desc) to vm.currentPriceSort
    vm.currentPriceSort = pricesort;


    ////Get search results from ES based on current price-sorting
    ////and current brands being searched
    $http({
      method: 'GET',
      url: 'http://localhost:8080/sortthepricing',
      params: {
        "currentuserquery": vm.currentSearchRequest,
        ///pricesort will be undefined when 'Best Match is selected'
        "pricesort": vm.currentPriceSort,
        "pricerange": vm.currentPriceRange,
        "currentretailerssearching[]": vm.currentRetailersSearching,
        "furnituretype":  $location.path()
      }})
      .then(function(response){

        ///Store each product from server's response in array searchResults (low to high)
        vm.searchResults = response.data.hits.hits;

        ///Add tool tip to certification in product card
        vm.addToolTips();
        //Discard loading page css since data is available
        vm.blurPageAddSpinner = false;
      });
    }


    //Request begins on client clicking brand listed in side navigation
    //The siteinfo parameter is an object containing data regarding the specific site
    vm.narrowSearchByBrand = function(siteinfo){


      ////Toggles the css of each site when selected/unselected
      siteinfo.highlighted = !siteinfo.highlighted;

      //Start page loading CSS
      vm.blurPageAddSpinner = true;

      ///vm.allResultsLoaded should remain false until the vm.getMoreUntilDone() function
      ///decides that all content has been loaded
      vm.allResultsLoaded = false;

      //Remove spaces and uppercase characters from sitename string so it matches the Elastic Search index exactly
      vm.elasticSearchIndexName = siteinfo.key.replace(/\s+/g, '').toLowerCase();

      ///If/else statement adds or removes sitename from vm.currentRetailersSearching array
      ///based on those checked/unchecked by client
      if(vm.currentRetailersSearching.includes(vm.elasticSearchIndexName)){

        ///Removes the site name from currentRetailersSearching
        ///Based on client unchecking box in side-nav
        vm.siteNameIndex = vm.currentRetailersSearching.indexOf(vm.elasticSearchIndexName)
        vm.currentRetailersSearching.splice(vm.siteNameIndex, 1)


        ////Begins search based on updated info in currentRetailersSearching variable
        $http({
          method: 'GET',
          url:'http://localhost:8080/narrowbybrand/',
          params: {
            "currentretailerssearching[]": vm.currentRetailersSearching,
            "currentuserquery": vm.currentSearchRequest,
            "pricesort": vm.currentPriceSort,
            "pricerange": vm.currentPriceRange,
            "furnituretype":  $location.path()
          }})
          .then(function(response){



            ///Update user's search results
            vm.searchResults = response.data.hits;



            ///Add tool tip to certification in product card
            vm.addToolTips();

            //Discard loading page css since data is available
            vm.blurPageAddSpinner = false;
          })
        }else{


          ////If the site is checked for the first time
          ////Add it to the currentretailerssearching array
          vm.currentRetailersSearching.push(vm.elasticSearchIndexName);



          $http({
            method: 'GET',
            url:'http://localhost:8080/narrowbybrand/',
            params: {
              "currentretailerssearching[]": vm.currentRetailersSearching,
              "currentuserquery": vm.currentSearchRequest,
              "pricesort": vm.currentPriceSort,
              "pricerange":vm.currentPriceRange,
              "furnituretype":  $location.path()
            }})
            .then(function(response){



                  ///Update user's search results
                  vm.searchResults = response.data.hits;



                  ///Add tool tip to certification in product card
                  vm.addToolTips();

                  //Discard loading page css since data is available
                  vm.blurPageAddSpinner = false;
              })
          }


      }



     ///Call more search results function once bottom of page is reached
      $window.onscroll = function(){

        if(!vm.allResultsLoaded && $(window).scrollTop() == $(document).height() - $(window).height()){
               vm.getMoreUntilDone();

        }
      }

      /////Fetch more results for the user once bottom of page is reached
      vm.getMoreUntilDone = function(){


        ////Loading spinner for bottom of page
        vm.addBottomPageSpinner = true;

        $http({
            method:'GET',
            url: 'http://localhost:8080/fetchmoreresults',
            params: {
              "currentretailerssearching[]": vm.currentRetailersSearching,
              "currentuserquery": vm.currentSearchRequest,
              "pricesort":vm.currentPriceSort,
              "pricerange":vm.currentPriceRange,
              "searchafterid": vm.searchResults[vm.searchResults.length - 1]._id,
              "searchafterlowestprice":vm.searchResults[vm.searchResults.length-1]._source.lowestprice,
              "furnituretype":  $location.path()
            }
          })

          .then(function(response){

              ///If ES returns empty array due to all content being loaded
              ///Turn vm.allResultsLoaded to true & turn vm.addBottomPageSpinner spinner off
              if(response.data.hits.length === 0){


                vm.addBottomPageSpinner = false;
                vm.allResultsLoaded = true;
                return

              }else{
                ////Push new results into vm.searchResults array
                response.data.hits.forEach(function(product){
                    vm.searchResults.push(product)
                });

                ////Remove loading spinner from bottom of page
                /// and place current status of search in memory
                vm.addBottomPageSpinner = false;

                ///Add tool tip to certification in product card
                vm.addToolTips();

              }

          });



      }

  }]);

})();
