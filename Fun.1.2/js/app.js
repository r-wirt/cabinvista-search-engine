(function(){

  $(document).foundation();

  //Underline the current selected price sorting option
  $('[data-price-sorting-toggle] .price-sorting-option').click(function(){
      $(this).siblings().removeClass('is-active');
      $(this).addClass('is-active');

  });

  angular.module("fun", ['ngRoute', 'ngCookies'])

  .config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider){

          $routeProvider
          .when("/", {

              templateUrl:"views/home-page.html",
              controller: "homePageController",
              controllerAs:"homeControl"

          })
          .when("/search", {

              templateUrl: "views/search-page.html",
              controller: "searchController",
              controllerAs: "searchControl"

          })
          .when("/searchkidsfurniture", {

              templateUrl:"views/search-page-kids-furniture.html",
              controller:"searchController",
              controllerAs:"searchControl"

          }).when("/articles-regarding-eco-furniture",{

            templateUrl:"views/articles-regarding-eco-furniture.html",
            controller: "homePageController",
            controllerAs:"homeControl"


          })

          .otherwise({

              redirectTo: "/"
          });




      }])


})();
