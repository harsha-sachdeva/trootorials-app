var localstorageApp = angular.module('BlurAdmin.pages.courses.addCourses');
localstorageApp.controller('TablesPageCtrl', ['$rootScope', '$scope', '$filter', 'editableOptions', 'editableThemes', '$window', '$http',
  '$uibModal', 'baProgressModal', 'localStorageService', '$state', '$rootScope',

  function($rootScope, $scope, $filter, editableOptions, editableThemes, $window, $http, $uibModal,
    baProgressModal, localStorageService, $state, $rootScope) {
    var token = null
    // console.log("retrieve" + localStorageService.get('TOKEN'))
    token = localStorageService.get('TOKEN')
    if (token == null) {
      $window.location.href = '/index.html';
    }
    token = token.substring(1, token.length - 1);

    $scope.courses = [];
    $scope.id = 0;

    $http.get("/api/all-courses?token=" + token).then(function(response) {
      //   console.log(response.data.data);
      if (response.data.error === 0) {
        // console.log("got 0");
        localStorageService.remove('TOKEN')
        $window.location.href = '/index.html';
      }
      $scope.loading = true;
      setTimeout(function() {
        $scope.loading = false;
        $scope.$apply();
      }, 2000);
      $scope.courses = response.data.data;
    });

    $scope.open = function(size, bool, id) {
      $scope.bool = bool
      $scope.id = id

      var modalInstance = $uibModal.open({
        // animation: $ctrl.animationsEnabled,
        // ariaLabelledBy: 'modal-title',
        // ariaDescribedBy: 'modal-body',
        templateUrl: 'app/pages/courses/addCourses/add.html',
        controller: 'ModalInstanceCtrlCourse',
        controllerAs: '$scope',
        size: size,
        // appendTo: parentElem,
        resolve: {
          courses: function() {
            return $scope.courses;
          },
          bool: function() {
            return $scope.bool;
          },
          id: function() {
            return $scope.id;
          },
          token: function() {
            return token;
          }
        }
      });

      modalInstance.result.then(function(selectedItem) {
          // console.log("selectedItem"+JSON.stringify(selectedItem.data));
          $scope.loading = true;
          setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
          }, 2000);
          if (bool == 0) {
            $scope.courses = selectedItem;
          } else if (bool == 1) {
            $scope.courses.push(selectedItem.data)
          }
          // $scope.$apply();
          //  console.log($scope.form);
          // console.log("updates users"+JSON.stringify($scope.users))
        },
        //    function () {
        //     $log.info('Modal dismissed at: ' + new Date());
        //   }
      );
    };



    $scope.removeCourse = function(id, $index) {
      var m = parseInt(id);
      // console.log($index);
      if ($window.confirm("Are you sure you want to delete?") == true) {
        $http.post("/api/delete-course/" + m + "?token=" + token).then(function(response) {
          $scope.loading = true;
          setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
          }, 2000);
          $scope.courses.splice($index, 1);
        });
      } else {}
    }



    $scope.openProgressDialog = baProgressModal.open;
    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';
  }
])


angular.module('BlurAdmin.pages.courses.addCourses').controller('ModalInstanceCtrlCourse', ['$scope', '$uibModalInstance', '$http', 'bool', 'id', '$timeout', 'token','courses',
 function($scope, $uibModalInstance, $http, bool, id, $timeout, token,courses) {
  $scope.form = {};
  $scope.b = bool;
  $scope.error = ""
  // console.log(JSON.stringify(courses))

  // console.log($scope.b);

  // console.log("id value " + id)

  // console.log("Bool value " + bool)
  if (bool == 0) {
    $http.get("/api/get-course/" + id + "?token=" + token).then(function(response) {
      // console.log(response);
      // console.log(response.data.response.data);
      $scope.form = response.data.response.data;
    });
  }

  $scope.updateCourse = function() {
    // console.log("Update called");
    var count=1
    courses.forEach(function(el){
      if(el.title == $scope.form.title)
      count++
      // console.log($scope.form.title)
      // console.log(count);
    })
    if(count > 1 )
    $scope.error = "Title already exists"

    else {
      var m = parseInt(id);
      // console.log($scope.form);
      $http({
          method: 'POST',
          format: 'json',
          url: '/api/edit-course/' + m + "?token=" + token,
          data: JSON.stringify({
            title: $scope.form.title,
            description: $scope.form.description,
            duration: $scope.form.duration
          })
        })
        .then(function(success) {
          // console.log("api");
          // console.log("hit " + JSON.stringify(success));
          $http.get("/api/all-courses?token=" + token).then(function(response) {
            //  $scope.usersupdated = response.data.data;
            $uibModalInstance.close(response.data.data);
          });

          // $window.location.reload()
        }, function(error) {
          // console.log("not hit " + JSON.stringify(error));
        });
    }
  }

  $scope.createPost = function(title, description, duration) {
    var data = {
      title: title,
      description: description,
      duration: duration
    }
    $http({
        method: 'POST',
        format: 'json',
        url: '/api/add-course?token=' + token,
        data: JSON.stringify({
          title: title,
          description: description,
          duration: duration
        })
      })
      .then(function(success) {
        // console.log(success)
        // console.log("success data" + JSON.stringify(success));
        if (success.data.error == true) {
          $scope.error = "Title already exists. Please enter new a title"
        } else
          $uibModalInstance.close(success.data.data);
      }, function(error) {
        // console.log("not hit " + JSON.stringify(error));
      });
  }
}]);
