var localstorageApp = angular.module('BlurAdmin.pages.users');
localstorageApp.controller('UserPageCtrl', ['$rootScope', '$scope', '$filter', 'editableOptions', 'editableThemes', '$window', '$http',
  '$uibModal', 'baProgressModal', 'localStorageService', '$state', '$rootScope',

  function($rootScope, $scope, $filter, editableOptions, editableThemes, $window, $http, $uibModal,
    baProgressModal, localStorageService, $state, $rootScope) {

    var token = localStorageService.get('TOKEN')
    if (token == null) {
      $window.location.href = '/index.html';
    }
    token = token.substring(1, token.length - 1);

    $scope.users = [];

    $scope.id = 0;

    $http.get("/api/all-users?token=" + token).then(function(response) {
      if (response.data.error === 0) {
        // //console.log("got 0");
        localStorageService.remove('TOKEN')
        $window.location.href = '/index.html';
      }
      $scope.loading = true;
      setTimeout(function() {
        $scope.loading = false;
        $scope.$apply();
      }, 2000);
      $scope.users = response.data.data;
    });

    $scope.open = function(size, bool, id) {
      $scope.bool = bool
      $scope.id = id


      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/users/addUser.html',
        controller: 'ModalInstanceCtrl',
        controllerAs: '$scope',
        size: size,
        resolve: {
          users: function() {
            return $scope.users;
          },
          bool: function() {
            return $scope.bool;
          },
          id: function() {
            return $scope.id;
          },
          token: function() {
            return token
          }
        }
      });

      modalInstance.result.then(function(selectedItem) {
          $scope.loading = true;
          setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
          }, 2000);
          if (bool == 0) {
            $scope.users = selectedItem;
          } else if (bool == 1) {
            $scope.users.push(selectedItem.data)

          }

          // //console.log("updates users" + JSON.stringify($scope.users))
        }
        // , function () {
        //   $log.info('Modal dismissed at: ' + new Date());
        // }
      );
    };



    $scope.removeCourse = function(id, $index) {
      var m = parseInt(id);
      if ($window.confirm("Are you sure you want to delete?") == true) {
        $http.post("/api/delete-user/" + m + "/" + "?token=" + token).then(function(response) {
          $scope.loading = true;
          setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
          }, 2000);
          $scope.users.splice($index, 1);
        });
      } else {}
    }

    $scope.openProgressDialog = baProgressModal.open;
    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';
  }
])


angular.module('BlurAdmin.pages.users').controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', '$http', 'bool', 'id', '$timeout', 'token','users',
 function($scope, $uibModalInstance, $http, bool, id, $timeout, token, users) {

  $scope.error = ""
  $scope.form = {};
  $scope.b = bool;
  // //console.log($scope.b);
  // //console.log("token" + token)
  $scope.levels = [{
    level: 1
  }, {
    level: 2
  }];
  if (bool == 1) {
    $scope.form.level = $scope.levels[1];

  }

  //console.log("id value " + id)

  //console.log("Bool value " + bool)
  if (bool == 0) {
    $http.get("/api/get-user/" + id + "/" + "?token=" + token).then(function(response) {
      // //console.log(response);
      // //console.log(response.data.response.data);
      $scope.form = response.data.response.data;
      $scope.form.level = $scope.levels[response.data.response.data.level - 1];
      // //console.log($scope.form.level);
    });
  }
  $scope.updatedCourse = function() {
    // //console.log("Update called");
    var count=0
    users.forEach(function(el){
      if(el.email == $scope.form.email)
      count++
    })
    if(count > 1 )
    $scope.error = "Title already exists"

    else {
    var m = parseInt(id);
    // //console.log($scope.form);
    // //console.log("level " + $scope.form.level);
    $http({
        method: 'POST',
        format: 'json',
        url: '/api/edit-user/' + m + '/' + '?token=' + token,
        data: JSON.stringify({
          name: $scope.form.name,
          mobile: $scope.form.mobile,
          email: $scope.form.email,
          // password: $scope.form.password,
          level: $scope.form.level.level
        })
      })
      .then(function(success) {
        // //console.log("api");
        // //console.log("hit " + JSON.stringify(success));
        $http.get("/api/all-users/?token=" + token).then(function(response) {
          $uibModalInstance.close(response.data.data);
        });

      }, function(error) {
        // //console.log("not hit " + JSON.stringify(error));
      });
  }
}

  $scope.createPost = function(named, mobiled, emailid, levelid) {
    // //console.log(levelid);
    var data = {
      name: named,
      mobile: mobiled,
      email: emailid,
      password: emailid,
      level: parseInt(levelid)
    }
    $http({
        method: 'POST',
        format: 'json',
        url: '/api/add-user/?token=' + token,
        data: JSON.stringify({
          name: named,
          mobile: mobiled,
          email: emailid,
          password: emailid,
          level: parseInt(levelid)
        })
      })
      .then(function(success) {
        // //console.log(success)
        // //console.log("success data" + JSON.stringify(success));
        // //console.log("success data" + JSON.stringify(success.data.error));

        if (success.data.error == true)
          $scope.error = "User already exists. Please enter a new email id"

        else {
          $uibModalInstance.close(success.data.data);
        }
      }, function(error) {
        // //console.log("not hit " + JSON.stringify(error));
      });
  }
}]);
