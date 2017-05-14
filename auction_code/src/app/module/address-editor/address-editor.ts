/**
 * Created by yongli.chen on 2017/1/10.
 */
import {Modal} from "../../providers/ts/modal";
import {provinces} from "./provinces";
import {AddressInfo} from "./address.def";
import {Toast} from "../../providers/ts/toast";
import {RestApi} from "../../providers/ts/rest/rest-api";

export class AddressEditor {
  private selector: string = "address-editor";
  private template: string = "";
  private className: string = "";//装载组件的父ID
  private modal = new Modal();
  private addInfo: AddressInfo = {} as AddressInfo;
  private callback: Function = null;
  private restApi = new RestApi();
  private toast: Toast = new Toast();

  private status: any = {
    code: -1,
    msg: ""
  };

  constructor(module: string, callback?: Function) {
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(document.body).append(html);
        this.init();
        if (callback) {
          callback();
        }
      }, (err) => {
        console.log(err);
      });
  }

  public init() {

    this.bindEvent();
    this.initRegion();
  }

  public bindEvent() {
    let self = this;
    $(".address-err").hide();

    //保存收获地址
    $("#saveAddress").on('click', function (e) {
      let editNode = $("#new-address");
      let id = self.addInfo.id;
      let status = self.addInfo.status ? 1 : 0;
      self.status.code = 0;
      self.status.msg = "ok";
      self.addInfo = {
        id: id,
        receivername: editNode.find(".new-receiver").val().trim(),
        receiverphone: editNode.find(".new-tel").val().trim(),
        provincecode: $("select#provinces1").val().trim(),
        provincename: $("select#provinces1").find(":selected").text().trim(),
        citycode: $("select#cities1").val().trim(),
        cityname: $("select#cities1").find(":selected").text().trim(),
        districtcode: $("select#districts1").val().trim(),
        districtname: $("select#districts1").find(":selected").text().trim(),
        detailaddress: editNode.find(".new-detail").val().trim(),
        status: status
      };
      self.saveAddress();
    });

    //关闭对话框
    $(".close-modal").on('click', function (e) {
      self.status.code = -1;
      self.status.msg = "cancel";
      self.resetModal();
      self.callback = null;
      self.modal.close();
    });

  }

  //初始化行政区
  private initRegion() {
    let self = this;
    //设置省列表
    this.setProvinces();
    //省
    $("#provinces1").change(function (e) {
      let provincesNode = $("#provinces1");
      let provinceName = provincesNode.find("option:selected").text();
      let provinceCode = provincesNode.val();
      if (provinceCode == null || provinceCode == "0")
        return;
      self.setCities(provinceCode);
    });
    //市
    $("#cities1").change(function (e) {
      let provincesNode = $("#provinces1");
      let provinceName = provincesNode.find("option:selected").text();
      let provinceCode = provincesNode.val();
      if (provinceCode == null || provinceCode == "0")
        return;

      let citiesNode = $("#cities1");
      let cityName = citiesNode.find("option:selected").text();
      let cityCode = citiesNode.val();
      if (cityCode == null || cityCode == "0")
        return;
      self.setDistricts(provinceCode, cityCode);
    });
    $("#districts1").change(function (e) {
      let districtsNode = $("#districts1");
      let districtName = districtsNode.find("option:selected").text();
      let districtCode = districtsNode.val();
      if (districtCode == null || districtCode == "0")
        return;
      self.addInfo.districtcode = districtCode;
      self.addInfo.districtname = districtName;
    });
  }

  public addNewAddress(callback?: Function) {
    $("#modal-title").text("添加收货地址");
    $(".address-err").hide();
    this.callback = callback;
    $("#saveAddress").removeAttr("disabled").removeClass("disabled");
    this.modal.show("#new-address").center(".modal-dialog");
  }

  public editAddress(addInfo: AddressInfo, callback?: Function) {
    $("#saveAddress").removeAttr("disabled").removeClass("disabled");
    $(".address-err").hide();
    $("#modal-title").text("编辑收货地址");
    this.callback = callback;
    this.addInfo = addInfo;
    let editNode = $("#new-address");
    editNode.find(".new-receiver").val(addInfo.receivername);
    editNode.find(".new-detail").val(addInfo.detailaddress);
    editNode.find(".new-tel").val(addInfo.receiverphone);

    $("select#provinces1").val(addInfo.provincecode);
    this.setCities(addInfo.provincecode.toString(), addInfo.citycode.toString());
    this.setDistricts(addInfo.provincecode.toString(), addInfo.citycode.toString(), addInfo.districtcode.toString());

    this.modal.show("#new-address").center(".modal-dialog");
  }

  private saveAddress() {
    if (this.addInfo == null)
      return;
    if (this.addInfo.receivername == null || this.addInfo.receivername.length < 1) {
      $("#address-name-err").text("请输入收货人姓名").show();
      return;
    }
    if (this.addInfo.receivername.length < 2) {
      $("#address-name-err").text("收货人姓名至少两个汉字").show();
      return;
    }
    if (this.addInfo.provincecode == '0' || this.addInfo.provincecode.length != 6 ||
      this.addInfo.citycode == '0' || this.addInfo.citycode.length != 6 ||
      this.addInfo.districtcode == '0' || this.addInfo.citycode.length != 6) {
      $("#address-region-err").text("请选择完整所在地区").show();
      return;
    }
    if (this.addInfo.detailaddress == null || this.addInfo.detailaddress.length < 6) {
      $("#address-detail-err").text("请输入至少6个汉字的详细地址").show();
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(this.addInfo.receiverphone))) {
      $("#address-tel-err").text("手机号码有误，请重填").show();
      return;
    }
    $(".address-err").hide();
    $("#saveAddress").attr({"disabled": "disabled"}).addClass("disabled");
    let self = this;
    //添加地址
    if (!this.addInfo.id) {
      this.restApi.addAddress({
        receivername: self.addInfo.receivername,
        receiverphone: self.addInfo.receiverphone,
        provincecode: self.addInfo.provincecode,
        provincename: self.addInfo.provincename,
        citycode: self.addInfo.citycode,
        cityname: self.addInfo.cityname,
        districtcode: self.addInfo.districtcode,
        districtname: self.addInfo.districtname,
        detailaddress: self.addInfo.detailaddress
      }).then((res) => {
        $("#saveAddress").removeAttr("disabled").removeClass("disabled");
        self.resetModal();
        self.modal.close();
        self.toast.show({content: "添加成功", position: "center"});
        //self.getAddressList();
        if (self.callback) {
          self.status = {code: 0, msg: "ok"};
          self.callback({status: self.status});
        }

      }, (res, err) => {
        self.resetModal();
        self.modal.close();
        $("#saveAddress").removeAttr("disabled").removeClass("disabled");
        let msg = "";
        if (res.responseJSON == null || res.responseJSON.msg == null)
          msg = "未知错误，添加失败";
        else
          msg = res.responseJSON.msg;
        self.toast.show({content: msg, position: "center"});
      });
    } else {//更新地址
      this.restApi.updateAddress({
        id: self.addInfo.id,
        receivername: self.addInfo.receivername,
        receiverphone: self.addInfo.receiverphone,
        provincecode: self.addInfo.provincecode,
        provincename: self.addInfo.provincename,
        citycode: self.addInfo.citycode,
        cityname: self.addInfo.cityname,
        districtcode: self.addInfo.districtcode,
        districtname: self.addInfo.districtname,
        detailaddress: self.addInfo.detailaddress,
        status: self.addInfo.status
      }).then((res) => {
        $("#saveAddress").removeAttr("disabled").removeClass("disabled");
        if (!res.code) {
          self.resetModal();
          self.modal.close();
          self.toast.show({content: "更新成功", position: "center"});
          //self.getAddressList();
          if (self.callback) {
            self.status = {code: 0, msg: "ok"};
            self.callback({status: self.status});
          }
        }
      }, (res, err) => {
        $("#saveAddress").removeAttr("disabled").removeClass("disabled");
        self.resetModal();
        self.modal.close();
        self.toast.show({content: res.responseJSON.msg, position: "center"});
      });
    }

  }

  private resetModal() {
    let editAddressNode = $("#new-address");
    editAddressNode.find(".new-receiver").val("");
    editAddressNode.find(".new-detail").val("");
    editAddressNode.find(".new-tel").val("");

    $("select#provinces1").val("0");
    let citiesNode = $("#cities1");
    citiesNode.empty().append("<option value='0'>请选择</option>");
    let districtNode = $("#districts1");
    districtNode.empty().append("<option value='0'>请选择</option>");
  }

  private setProvinces(provinceCode?: string) {
    let provincesNode = $("#provinces1");
    provincesNode.empty().append("<option value='0'>请选择</option>");
    $("#cities1").empty().append("<option value='0'>请选择</option>");
    $("#districts1").empty().append("<option value='0'>请选择</option>");
    let selIndex = 0;
    provinces.forEach((province, index) => {
      let html = `
      <option  id='` + index + `' value='` + province.code + `'> ` + province.name + `</option>
      `;
      if (province.code == provinceCode) {
        selIndex = index;
      }
      provincesNode.append(html);
    });
    if (provinceCode != null && provinceCode.length == 6) {
      //provincesNode.find("option[value='" + provinceCode + "']").attr({'selected': true});
      $("select#provinces1").val(provinceCode);
      this.addInfo.provincecode = provinceCode;
    }
  }

  private setCities(provinceCode: string, selCityCode?: string) {
    if (provinceCode == null || provinceCode.length != 6)
      return;
    let subProvinces = null;
    for (let i = 0; i < provinces.length; ++i) {
      if (provinces[i].code == provinceCode) {
        subProvinces = provinces[i].subProvinces;
        break;
      }
    }
    if (subProvinces == null)
      return;
    let citiesNode = $("#cities1");
    citiesNode.empty().append("<option value='0'>请选择</option>");
    let districtNode = $("#districts1");
    districtNode.empty().append("<option value='0'>请选择</option>");
    subProvinces.forEach((city) => {
      let html = `
      <option value='` + city.code + `'> ` + city.name + `</option>
      `;
      citiesNode.append(html);
    });
    this.addInfo.provincecode = provinceCode;
    if (selCityCode != null && selCityCode.length == 6) {
      citiesNode.find("option[value='" + selCityCode + "']").attr({'selected': true});
      this.addInfo.citycode = selCityCode;
    }
  }

  private setDistricts(provinceCode: string, cityCode: string, selDistrictCode?: string) {
    if (provinceCode == null || provinceCode.length != 6)
      return;
    if (cityCode == null || cityCode.length != 6)
      return;
    let districts = null;
    for (let i = 0; i < provinces.length; ++i) {
      if (provinces[i].code == provinceCode) {
        let cities = provinces[i].subProvinces;
        for (let j in cities) {
          if (cities[j].code == cityCode) {
            districts = cities[j].subProvinces;
            break;
          }
        }
        break;
      }
    }
    if (districts == null)
      return;
    let districtNode = $("#districts1");
    districtNode.empty().append("<option value='0'>请选择</option>");
    districts.forEach((district) => {
      let html = `
      <option value='` + district.code + `'> ` + district.name + `</option>
      `;
      districtNode.append(html);
    });

    this.addInfo.citycode = cityCode;
    if (selDistrictCode != null && selDistrictCode.length == 6) {
      districtNode.find("option[value='" + selDistrictCode + "']").attr({'selected': true});
      this.addInfo.districtcode = selDistrictCode;
    }
  }
}
