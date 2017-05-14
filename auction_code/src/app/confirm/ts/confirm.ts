/**
 * Created by yongli.chen on 2017/1/25.
 */
require('bootstrapcss');
require('bootstrap_glyphicons_css');
require('indexcss');
require('confirmcss');

import {Auth} from "../../providers/ts/auth";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Toast} from "../../providers/ts/toast";
import {AddressInfo} from "../../module/address-editor/address.def";
import {AddressEditor} from "../../module/address-editor/address-editor";
import {Modal} from "../../providers/ts/modal";

let restApi:RestApi = new RestApi();
let addEditor:AddressEditor = new AddressEditor("module");
let toast:Toast = new Toast();
let modal = new Modal();

let loadModule = function () {

  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("订单确认").show();
  });
  let footer = new Footer("module", ".footer");
};

let init = function () {
  getAddressList();
  bindEvent();
};
let bindEvent = function () {

  let self = this;
  //展开/收起地址
  $("#expand-add").on('click', function (e) {
    expandAddress();
  });

  //添加新地址
  $("#add-new-add").on('click', function (e) {
    addAddress();
  });
};
/**
 * 绑定消息
 * */
let bindAddressEvent = function () {

  //设置默认地址
  $(".default-add").on('click', function (e) {
    let id = $(this).data('id');
    restApi.setDefaultAddress("id=" + id).then((res) => {
      if (!res.code) {
        setDefaultAddTag(id);
      } else {
        toast.show({content: "设置默认地址失败"});
      }
    });
  });
  //删除地址
  $(".del-add").on('click', function (e) {
    let id = $(this).data('id');
    delAddress(id);
  });
  //编辑地址
  $(".edit-add").on('click', function (e) {
    let id = $(this).data('id');
    editAddress(id);
  });

  let addressNode = $(".add-item");
  addressNode.on('mouseover', function (e) {
    $(this).children().each(function (index) {
      if (index != 0) {
        $(this).addClass("add-hover");
        $(this).children('span').each(function (index) {
          let node = $(this).prev();
          if (node.is("input") && !node.is(':hidden')) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      }
    });
  });

  addressNode.on("mouseout", function (e) {
    $(this).children().each(function (index) {
      if (index != 0) {
        $(this).removeClass("add-hover");
        $(this).children('span').each(function (index) {
          $(this).hide();
        });
      }
    });
  });
};

/**
 * 设置默认地址
 * */
let setDefaultAddTag = function (defaultAddId:string) {
  $(".lbl-default-address").each(function (e) {
    let id = $(this).data('id');
    if (id == defaultAddId) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });

  $(".btn-default-address").each(function (e) {
    let id = $(this).data('id');
    if (id == defaultAddId) {
      $(this).hide();
    } else {
      $(this).show();
    }
  });

  //默认地址放在最靠前
  let defaultNode = $('#' + defaultAddId);
  $("#add-list").prepend(defaultNode.clone(true));
  defaultNode.remove();
};

/**
 * 获取地址列表
 * */
let getAddressList = function () {
  restApi.getAddressList().then((res) => {
    if (!res.code) {
      setAddressContent(res.data);
    } else {
      toast.show({content: "获取地址列表失败" + res.msg});
      $("#expand-add").hide();
    }
  });
};

/**
 * 添加地址信息
 * */
let setAddressContent = function (addressList:any) {
  $("#add-list").empty();
  let firstAddress = null;
  let hasDefault = false;
  for (let i = 0; i < addressList.length; ++i) {
    let addInfo:AddressInfo = addressList[i];
    if (firstAddress == null) {
      firstAddress = addInfo;
    }
    let html = `<div class="row order-item add-item" id="` + addInfo.id + `">
          <div class="col-md-2" >
            <span class="name-area" id="name-` + addInfo.id + `" 
                  data-province="` + addInfo.provincecode + `" 
                  data-city="` + addInfo.citycode + `" 
                  data-district="` + addInfo.districtcode + `">
              ` + addInfo.receivername + `&nbsp;&nbsp;` + addInfo.provincename + `
            </span>
          </div>
          <div class="col-md-5" id="detail-` + addInfo.id + `" >
            ` + addInfo.receivername + `
            &nbsp;&nbsp;
            ` + addInfo.detailaddress + `
            &nbsp;&nbsp;
            ` + addInfo.receiverphone + `
          </div>
          <div class="col-md-2 text-right">
            <input type="button" id="defaulted-add-` + addInfo.id + `"
                   class="btn-metro lbl-default-address" 
                   data-id="` + addInfo.id + `" 
                   data-status="` + (addInfo.status == 1 ? 1 : 0) + `"
                   style="height: 30px;line-height: 30px;width: 100px;" 
                   value="默认地址"/>
                   
            <span id="set-default-add-` + addInfo.id + `"
                  class="btn-action default-add btn-default-address" 
                  data-id="` + addInfo.id + `" 
                  style="margin: auto 5px;width: 100px;">
                  设为默认地址
            </span>       
            
          </div>
          <div class="col-md-3 text-right">
            <span class="btn-action del-add" data-id="` + addInfo.id + `" style="margin: auto 5px;display: none;">删除</span>
            <span class="btn-action edit-add" data-id="` + addInfo.id + `" style="margin: auto 5px;display: none;">编辑</span>
          </div>
        </div>
        `;

    if (addInfo.status == 1) {
      hasDefault = true;
      $("#add-list").prepend(html);
      $("#name-" + addInfo.id).addClass("add-selected");
      $("#defaulted-add-" + addInfo.id).show();
    } else {
      $("#add-list").append(html);
      $("#" + addInfo.id).hide();
      $("#defaulted-add-" + addInfo.id).hide();
    }
    $("#set-default-add-" + addInfo.id).hide();
  }
  if (!hasDefault && firstAddress) {
    $("#name-" + firstAddress.id).addClass("add-selected");
  }
  let nameSelector = $(".name-area");
  if (nameSelector) {
    nameSelector.on('click', function (e) {
      setReceiveAdd(e);
    });
  }
  if (addressList != null && addressList.length > 0) {
    $("#" + addressList[0].id).show();
  }
  if (addressList == null || addressList.length < 2) {
    $("#expand-add").hide();
  } else {
    $("#expand-add").show();
  }
  bindAddressEvent();
};

/**
 *设置收获地址
 * */
let setReceiveAdd = function (ele:any) {
  let addressIdStr = $(ele.target).attr("id");
  this.addressId = parseInt(addressIdStr.substr("name-".length));
  if ($(ele.target).hasClass('add-selected')) {
    return;
  }
  $("#add-list").find(".add-selected").removeClass("add-selected");
  $(ele.target).addClass("add-selected");
};

/**
 * 添加地址
 * */
let addAddress = function () {
  addEditor.addNewAddress(function (res) {
    if (res.status == null || res.status.code != 0)
      return;
    getAddressList();
  });
};

let delAddress = function (id:string) {
  if (id == null || id.length < 1)
    return;

  modal.setOptions({
    "title": "删除地址",
    "content": "确定要删除该地址吗？"
  }).show(null, (res) => {
    if (res.status == null || res.status.code != 0)
      return;
    restApi.deleteAddress("id=" + id).then((res) => {
      $('#' + id).remove();
      toast.show({content: "删除成功", position: "center"});
      if ($('#add-list').children().length < 2) {
        $("#expand-add").hide();
      }
    }, (res, err) => {
      toast.show({content: res.responseJSON.msg});
    });
  });
};

/**
 * 展开/收起地址
 */
let expandAddress = function () {
  let parent = $("#expand-add");
  let dom1 = parent.children()[0];
  let dom2 = parent.children()[1];
  if ($(dom1).text() == "展开地址") {
    $(dom1).text("收起地址");
    $(dom2).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");

    $("#add-list").children().each(function (e) {
      $(this).show();
    });
  } else {
    $(dom1).text("展开地址");
    $(dom2).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    $("#add-list").children().each(function (e) {
      $(this).hide();
    });
    $("#add-list").find(".add-selected").parent().show();
  }
};

/**
 * 编辑地址
 */
let editAddress = function (id:string) {
  let nbsp = String.fromCharCode(160);
  //$("#name-" + id)中含两个&nbsp;特殊字符
  let nameCode = $("#name-" + id);
  let arry1 = nameCode.text().trim().split(nbsp + nbsp);
  let arry2 = $("#detail-" + id).text().trim().split(nbsp + nbsp);
  let provinceCode = nameCode.data("province");
  let cityCode = nameCode.data("city");
  let districtCode = nameCode.data("district");
  let status = $("#defaulted-add-" + id).data("status");

  let addInfo:AddressInfo = {
    id: id,
    receivername: arry1[0].trim(),
    receiverphone: arry2[2].trim(),
    provincecode: provinceCode,
    provincename: arry1[1].trim(),
    citycode: cityCode,
    cityname: "",
    districtcode: districtCode,
    districtname: "",
    detailaddress: arry2[1].trim(),
    status: status
  };
  addEditor.editAddress(addInfo, function (res) {
    if (res.status == null || res.status.code != 0)
      return;
    getAddressList();
  });
};

$(function () {
  loadModule();
  init();
});
