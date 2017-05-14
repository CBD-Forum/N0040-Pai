/**
 * Created by Administrator on 2016/11/27.
 */
require('bootstrapcss');
require('indexcss');
require('logincss');
function login(){
  $("#login-btn").on("click",function (e) {
    window.location.href = "/index.html";
  });
}

$(function () {
  login();
});
