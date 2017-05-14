import {RestApi} from "../../providers/ts/rest/rest-api";

let VALIDATE_TIME = 60;
/**
 * Created by yongli.chen on 2016/11/25.
 */
export class Setting {
  private selector: string = "setting";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private editType = "";
  private restApi = new RestApi();

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
  }

  public init() {
    $(".edit-panel").hide();
    this.editPersonalInfo();

    this.restApi.get("/v1/user").then((res) => {
      if (!res.code) {
        let user = res.data;
        this.setFieldName("username", user.username);
        this.setFieldName("nickname", user.nickname);
        this.setFieldName("email", user.email);
        this.setFieldName("phone", user.phone);
        this.setFieldName("address", user.address);
      } else {
        alert("获取用户信息失败" + res.msg);
      }
    });
  }

  private setFieldName(fieldName, fieldValue) {
    this.setDisplayFieldName(fieldName, fieldValue);
    this.setEditFieldName(fieldName, fieldValue);
  }

  private setDisplayFieldName(fieldName, fieldValue) {
    $('#display-' + fieldName).text(fieldValue);
  }

  private setEditFieldName(fieldName, fieldValue) {
    $('#edit-' + fieldName).val(fieldValue);
  }

  private getEditFieldName(fieldName): string {
    return $('#edit-' + fieldName).val();
  }

  public editPersonalInfo() {
    let self = this;
    //编辑事件
    $(".edit-btn").on('click', function (e) {
      let type = $(this).data('type');
      $(".edit-panel").hide();
      $(".personal-info").show();
      let info = "#" + type + "-info";
      let panel = "#" + type + "-edit-panel";
      self.editType = type;
      $(info).hide();
      $(panel).show();
    });

    //提交数据
    $(".btn-submit").on('click', function (e) {
      if (self.editType == 'nickname' || self.editType == 'phone' || self.editType == 'email' || self.editType == 'password') {
        let data = {};
        data[self.editType] = self.getEditFieldName(self.editType);
        if (self.editType == 'nickname') {
          if (data[self.editType].length < 3) {
            return alert("用户昵称长度能低于3个字符.");
          }
        }
        if (self.editType == 'phone' || self.editType == 'email') {
          data['code'] = $("#edit-" + self.editType + "-code").val();
          if (!data['code']) {
            return alert("验证码不能为空.");
          }
        }
        if (self.editType == 'password') {
          data['newPassword'] = $('#edit-password-new').val();
          data['confirmNewPassword'] = $('#edit-password-new-confirm').val();
        }
        return self.restApi.updateUser(data).then((res) => {
          if (!res.code) {
            self.setDisplayFieldName(self.editType, self.getEditFieldName(self.editType));
            let info = "#" + self.editType + "-info";
            let panel = "#" + self.editType + "-edit-panel";
            $(info).show();
            $(panel).hide();
          } else {
            alert("修改用户信息失败" + res.msg);
          }
        });
      }
      alert("暂时不支持, 敬请期待");
    });

    //取消编辑
    $(".cancel-edit").on('click', function (e) {
      $(".edit-panel").hide();
      $(".personal-info").show()
    });

    $("#validate-btn").on('click', (e) => {
      let phone = $("#edit-phone").val().trim();
      if (phone.length < 1) {
        return alert("手机号不能为空");
      }
      $("#validate-btn").addClass("disabled");
      self.restApi.sendCode({
        "phone": phone
      }).then((res) => {
        if (res.code) {
          return alert(res.msg);
        }
        let intervalTime = VALIDATE_TIME;//获取验证码的间隔时间
        let interval = setInterval(() => {
          $("#validate-btn").val((--intervalTime) + "秒后重发");
          if (intervalTime <= 0) {
            intervalTime = VALIDATE_TIME;
            $("#validate-btn").removeClass("disabled").val("获取验证码");
            clearInterval(interval);
          }
        }, 1000);
      }, (err) => {
        console.log(err);
      });
    });
  }
}
