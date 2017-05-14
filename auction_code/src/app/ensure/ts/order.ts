/**
 * Created by yongli.chen on 2017/1/9.
 */
import {RestApi} from "../../providers/ts/rest/rest-api";
import {AddressEditor} from "../../module/address-editor/address-editor";
import {AddressInfo} from "../../module/address-editor/address.def";
import {Toast} from "../../providers/ts/toast";
import {Modal} from "../../providers/ts/modal";

export class Order {
  private selector: string = "order";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private restApi: RestApi = new RestApi();
  private addressId: number = 0;
  private addEditor: AddressEditor = null;
  private toast: Toast = new Toast();
  private modal: Modal = new Modal();

  constructor(module: string, containerId: string) {
    this.containerId = containerId;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(containerId).html(html);
        this.isSelectorLoaded = true;
        this.init();
      }, (err) => {
        console.log(err);
      });

    this.addEditor = new AddressEditor("module");
  }

  public init() {
    let goodsId = this.restApi.getParameter("id");
    this.restApi.getGoodDetail("id=" + goodsId)
      .then((res) => {
        if (res.code != 0 || res.data == null) {
          return;
        }
        $("#goodsname").text(res.data.goodsname);
        $("#deposit-money").text(parseFloat(res.data.deposit).toFixed(2));
      }, (res, err) => {
        console.log(err);
      });
    this.getAddressList();
    this.bindEvent();
  }

  private bindEvent() {
    let self = this;
    //展开/收起地址
    $("#expand-add").on('click', function (e) {
      self.expandAddress();
    });

    //添加新地址
    $("#add-new-add").on('click', function (e) {
      self.addAddress();
    });
  }

  private bindAddressEvent() {
    let self = this;

    //设置默认地址
    $(".default-add").on('click', function (e) {
      let id = $(this).data('id');
      self.restApi.setDefaultAddress("id=" + id).then((res) => {
        if (!res.code) {
          self.setDefaultAddTag(id);
        } else {
          self.toast.show({content: "设置默认地址失败"});
        }
      });
    });
    //删除地址
    $(".del-add").on('click', function (e) {
      let id = $(this).data('id');
      self.delAddress(id);
    });
    //编辑地址
    $(".edit-add").on('click', function (e) {
      let id = $(this).data('id');
      self.editAddress(id);
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
  }

  //获取地址列表
  private getAddressList() {
    let self = this;
    this.restApi.get("/v1/addresses").then((res) => {
      if (!res.code) {
        self.setAddressContent(res.data);
      } else {
        self.toast.show({content: "获取地址列表失败" + res.msg});
        $("#expand-add").hide();
      }
    });
  }

  private setAddressContent(addressList: any) {
    $("#add-list").empty();
    let firstAddress = null;
    let hasDefault = false;
    for (let i = 0; i < addressList.length; ++i) {
      let addInfo: AddressInfo = addressList[i];
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
    let self = this;
    let nameSelector = $(".name-area");
    if (nameSelector) {
      nameSelector.on('click', function (e) {
        self.setReceiveAdd(e);
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
    this.bindAddressEvent();
  }

  //设置默认地址标记
  private setDefaultAddTag(defaultAddId: string) {
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
    // $("#name-" + defaultAddId).addClass("add-selected");
    $("#add-list").prepend(defaultNode.clone(true));
    defaultNode.remove();
  }

  //添加收货地址
  private addAddress() {
    let self = this;
    this.addEditor.addNewAddress(function (res) {
      if (res.status == null || res.status.code != 0)
        return;
      self.getAddressList();
    });
  }

  //编辑地址
  private editAddress(id: string) {
    let self = this;
    let nbsp = String.fromCharCode(160);
    //$("#name-" + id)中含两个&nbsp;特殊字符
    let nameCode = $("#name-" + id);
    let arry1 = nameCode.text().trim().split(nbsp + nbsp);
    let arry2 = $("#detail-" + id).text().trim().split(nbsp + nbsp);
    let provinceCode = nameCode.data("province");
    let cityCode = nameCode.data("city");
    let districtCode = nameCode.data("district");
    let status = $("#defaulted-add-" + id).data("status");

    let addInfo: AddressInfo = {
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
    this.addEditor.editAddress(addInfo, function (res) {
      if (res.status == null || res.status.code != 0)
        return;
      self.getAddressList();
    });
  }

  //删除地址
  private delAddress(id: string) {
    if (id == null || id.length < 1)
      return;

    this.modal.setOptions({
      "title": "删除地址",
      "content": "确定要删除该地址吗？"
    }).show(null, (res) => {
      if (res.status == null || res.status.code != 0)
        return;
      this.restApi.deleteAddress("id=" + id).then((res) => {
        $('#' + id).remove();
        this.toast.show({content: "删除成功", position: "center"});
        if ($('#add-list').children().length < 2) {
          $("#expand-add").hide();
        }
      }, (res, err) => {
        this.toast.show({content: res.responseJSON.msg});
      });
    });


  }

  //设置收获地址
  private setReceiveAdd(ele: any) {
    let addressIdStr = $(ele.target).attr("id");
    this.addressId = parseInt(addressIdStr.substr("name-".length));
    if ($(ele.target).hasClass('add-selected')) {
      return;
    }
    $("#add-list").find(".add-selected").removeClass("add-selected");
    $(ele.target).addClass("add-selected");
  }

  //展开/收起地址
  private expandAddress() {
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
  }


}
