/**
 * Created by yongli.chen on 2016/11/25.
 */
import {Modal} from "../../providers/ts/modal";
import {Toast} from "../../providers/ts/toast";
import {RestApi} from "../../providers/ts/rest/rest-api";
import {AddressInfo} from "../../module/address-editor/address.def";
import {AddressEditor} from "../../module/address-editor/address-editor";

export class Address {
  private selector: string = "address";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private modal = new Modal();
  private addInfo: AddressInfo = {} as AddressInfo;
  private restApi = new RestApi();
  private addressList = [];
  private defaultAddId = null;
  private addEditor: AddressEditor = null;
  private toast: Toast = new Toast();

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
    this.getAddressList();
    this.bidEvent();
  }

  private bidAddressEvent() {
    let self = this;
    //删除地址
    $(".remove-address").on('click', function (e) {
      let id = $(this).data('id');
      self.removeAddress(id);
    });
    //编辑地址
    $(".btn-edit-address").on('click', function (e) {
      self.editAddress($(this).data('id'))
    });
    //设置默认地址
    $('.btn-default-address').on('click', function (e) {
      let defaultAddId = $(this).data('id');
      self.restApi.setDefaultAddress("id=" + defaultAddId).then((res) => {
        if (!res.code) {
          self.setDefaultAddTag(defaultAddId);
        } else {
          self.toast.show({content: "设置默认地址失败"});
        }
      });
    });
  }

  private bidEvent() {
    let self = this;
    //添加地址
    $("#addAddress").on('click', function () {
      self.addAddress();
    });
  }

  private getAddressList() {
    let self = this;
    this.restApi.get("/v1/addresses").then((res) => {
      if (!res.code) {
        self.setAddressContent(res.data);
      } else {
        self.toast.show({content: "获取地址列表失败" + res.msg});
      }
    });
  }

  private setUserDisplay(current: number, total: number) {
    $("#user-display").text("您已创建" + current + "个收货地址，最多可创建" + total + "个")
  }

  private setAddressContent(addressList: any) {
    let addressListSelector = $("#my-address");
    addressListSelector.empty();
    //默认地址ID
    let defaultAddId = "";
    for (let i = 0; i < addressList.length; ++i) {
      let address = addressList[i];
      let status = 0;
      if (address.status == 1) {
        defaultAddId = address.id;
        status = 1;
      }
      let html = `
        <div class="row default-margin" id="` + address.id + `" style="border:1px solid #eee;">
          <div class="row default-margin">
            <h4 class="col-md-2 text-left" style="width: auto;font-weight: bold;">` + address.receivername + `</h4>
            <label class="col-md-2 text-left lbl-default-address" 
                   data-id="` + address.id + `" data-status="` + status + ` "
                   style="background-color: #a56322;color: white;width: auto;">
              默认地址
            </label>
            <div class="col-md-8 text-right" style="float: right;">
              <button class="btn btn-default" style="border-color: transparent;color: #999;">
                  <span class="glyphicon glyphicon-remove remove-address" aria-hidden="true" data-id="` + address.id + `"></span>
              </button>
              
            </div>
          </div>
          <div class="row default-margin">
            <label class="col-md-2 text-right">收货人：</label>
            <label class="col-md-10 text-left add-receiver">` + address.receivername + `</label>
          </div>
          <div class="row default-margin">
            <label class="col-md-2 text-right">所在地区：</label>
            <label class="col-md-10 text-left add-region" 
                   data-province="` + address.provincecode + `" data-city="` + address.citycode + `" data-district="` + address.districtcode + `">
                   ` + address.provincename + address.cityname + address.districtname + `
            </label>
          </div>
          <div class="row default-margin">
            <label class="col-md-2 text-right">地址：</label>
            <label class="col-md-10 text-left add-detail">` + address.detailaddress + `</label>
          </div>
          <div class="row default-margin">
            <label class="col-md-2 text-right">手机：</label>
            <label class="col-md-2 text-left add-tel">` + address.receiverphone + `</label>
            <div class="col-md-8 text-right">
              <button class="btn btn-default btn-default-address" data-id="` + address.id + `"
                      style="border-color: transparent;color: #00b0e8;">
                设为默认
              </button>
              <button class="btn btn-default btn-edit-address" data-id="` + address.id + `"
                      style="border-color: transparent;color: #00b0e8;">
                编辑
              </button>
            </div>
          </div>
      </div>
      `;
      addressListSelector.append(html);
    }
    this.addressList = addressList;
    this.setUserDisplay(addressList.length, 3);
    this.setDefaultAddTag(defaultAddId);
    this.bidAddressEvent();
  }

  //设置默认地址标记
  private setDefaultAddTag(defaultAddId: string) {
    this.defaultAddId = defaultAddId;
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
    $("#my-address").prepend(defaultNode.clone(true));
    defaultNode.remove();
  }

  private removeAddress(id: string) {
    let self = this;
    this.modal.setOptions({
      title: "删除地址",
      content: "你确定要删除该地址吗？"
    }).show(null, (res) => {
      if (res.status.code != 0)
        return;
      self.restApi.deleteAddress("id=" + id).then((res) => {
        $('#' + id).remove();
        self.toast.show({content: "删除成功"});
        self.getAddressList();
      }, (res, err) => {
        self.toast.show({content: res.responseJSON.msg});
      });
    });
  }

  private addAddress() {
    let self = this;
    this.addEditor.addNewAddress(function (res) {
      if (res.status == null || res.status.code != 0)
        return;
      self.getAddressList();
    });
  }

  private editAddress(id: string) {
    let self = this;
    let editAddressNode = $('#' + id);
    let receiver = editAddressNode.find('.add-receiver').text();
    let region = editAddressNode.find('.add-region');
    let provinceCode = region.data("province").toString();
    let cityCode = region.data("city").toString();
    let districtCode = region.data("district").toString();

    let detail = editAddressNode.find('.add-detail').text();
    let tel = editAddressNode.find('.add-tel').text();

    let status = editAddressNode.find('.lbl-default-address').data('status').trim();

    let addInfo: AddressInfo = {
      id: id,
      receivername: receiver.trim(),
      receiverphone: tel.trim(),
      provincecode: provinceCode,
      provincename: "",
      citycode: cityCode,
      cityname: "",
      districtcode: districtCode,
      districtname: "",
      detailaddress: detail.trim(),
      status: self.defaultAddId == id ? parseInt(status) : 0
    };
    this.addEditor.editAddress(addInfo, function (res) {
      if (res.status == null || res.status.code != 0)
        return;
      self.getAddressList();
    });
  }

}
