(function(){

  angular.module("fun")

  ///////////Home-page controller/////////////////
  .controller("homePageController", ["$window", "$http","$scope", "$location", "controllerSharedData",function($window, $http, $scope, $location, controllerSharedData){




    $(document).foundation();
    /////Google analytics, send page view////
    $scope.$on('$viewContentLoaded', function(event){
      $window.ga('set', 'page', $location.url())
      $window.ga('send','pageview', { page: $location.url() })
    });

      var vm = this;



      ////Mega menu functionality
      vm.showFurnitureByCatgMenu = false;
      vm.showBabyKidsMenu = false;
      vm.showRetailerMenu = false;
      ///Navigation bar functionality -- hide menu on scroll down
      window.addEventListener('scroll', function(){

        if(window.scrollY > 250 && vm.showFurnitureByCatgMenu ||
           window.scrollY > 250 && vm.showBabyKidsMenu ||
            window.scrollY > 250 && vm.showRetailerMenu ){
          vm.showFurnitureByCatgMenu = false;
          vm.showBabyKidsMenu = false;
          vm.showRetailerMenu = false;


          $scope.$digest();

        }
      })



      /////Google analytics, send page view////
      $scope.$on('$viewContentLoaded', function(event){
        $window.ga('send','pageview', { page: $location.url() })
      });

      vm.furnitureMenuOptns = controllerSharedData.furnitureMenuOptns

      vm.showQueryData = false;
      vm.addToolTips = function(){

        setTimeout(function(){

          tippy('[title]', {
          //  html:'#certification-tip',
            arrow: true,
            animation: 'fade',
            theme:'certification'
           });

         },1000)

      }

      vm.fetchCategoryPrevs = function(){

        //Start page loading CSS
        vm.addSpinner = true;


        $http({
          method:'GET',
          url: 'http://localhost:8080/homepageprev'
        }).then(function(response){


          vm.livingRoomPrev = response.data.responses[0].hits.hits;
          vm.babyAndKidsPrev = response.data.responses[1].hits.hits;
          vm.bedRoomPrev = response.data.responses[2].hits.hits;
          vm.dineAndKitchenPrev = response.data.responses[3].hits.hits;

          vm.showQueryData = true;
          vm.addSpinner = false;
          vm.addToolTips();

        });
      }

      vm.fetchCategoryPrevs();

      vm.searchBarQueryFromHome = function(){
        ////In case someone presses submit on search bar query without the query
        //being included in search bar
        if(!vm.userQueryFromHome){
          return
        }

        controllerSharedData.userQuery = { searchQuery: vm.userQueryFromHome };
        controllerSharedData.menuOrSearchBarQuery = 'searchbar';
        $location.url('/search');




      }

     vm.searchMenuFromHome = function(megaMenuSelection){

       //Update current user's query in memory
       //Variable will be an object
       controllerSharedData.userQuery = megaMenuSelection;
       controllerSharedData.menuOrSearchBarQuery = 'menu';

       $location.url('/search');

     }

     vm.switchToKidsFurniture = function(megaMenuSelection){

       //Update current user's query in memory
       //Variable will be an object
       controllerSharedData.userQuery = megaMenuSelection;
       controllerSharedData.menuOrSearchBarQuery = 'menu';

       $location.url('/searchkidsfurniture');


     }

     vm.toRelevantArticles = function(){

        $location.url('/articles-regarding-eco-furniture');

     }


  }]);


})();
