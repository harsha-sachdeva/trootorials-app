var localstorageApp = angular.module('BlurAdmin.pages.reset_password');
localstorageApp.controller('PasswordPageCtrl', ['$scope', '$window', '$http', 'localStorageService',
  function($scope, $window, $http, localStorageService) {
    $scope.error = ""
    $scope.success = ""

    var token = localStorageService.get('TOKEN')
    if (token == null) {
      $window.location.href = '/index.html';
    }

    var currentPassword = ""

    token = token.substring(1, token.length - 1);
    $http.get("/api/show-password?token=" + token).then(function(response) {
      // console.log("response here" + JSON.stringify(response.data.password));
      if (response.data.error === 0) {
        //        console.log("got 0");
        localStorageService.remove('TOKEN')
        $window.location.href = '/index.html';
      }
      currentPassword = response.data.password
    });

    $scope.resetPassword = function() {
      // console.log("old password" + $scope.form.oldPassword);

      if (currentPassword != $scope.form.oldPassword) {
        $scope.error = "Current password doesnot match"
      }

      if ($scope.form.newPassword != $scope.form.confirmPassword) {
        $scope.error = "New password and confirm password donot match"
      }

      if (currentPassword == $scope.form.oldPassword && $scope.form.newPassword == $scope.form.confirmPassword) {
        // console.log("currentPassword matches ")
        $http({
            method: 'POST',
            format: 'json',
            url: '/api/update-password?token=' + token,
            data: JSON.stringify({
              new_password: $scope.form.newPassword,
              // confirm_password: $scope.form.currentPassword,
              //duration: durationd
            })
          })
          .then(function(success) {
              // console.log("Successs" + success)
              $scope.success = "Password changed successfully"
              $scope.form = {}
            },
            function(error) {
              //console.log("not hit " + JSON.stringify(error));
            });
      }
    }
  }
]);
