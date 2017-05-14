/**
 * Created by yongli.chen on 2017/1/10.
 */
import {Modal} from "../../providers/ts/modal";
import {Toast} from "../../providers/ts/toast";
import {RestApi} from "../../providers/ts/rest/rest-api";

export class PayNotice {
  private selector: string = "pay-notice";
  private template: string = "";
  private className: string = "";//装载组件的父ID
  private modal = new Modal();
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
  }

  public bindEvent() {
    let self = this;
    //保存收获地址
    $("#btn-ok").on('click', function (e) {
      self.status.code = 0;
      self.status.msg = "ok";
      if(self.callback)
        self.callback({status:self.status});
      self.modal.close();
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

  private resetModal() {

  }

  public show(callback?: Function) {
    $("#modal-title").text("提示");
    this.callback = callback;
    this.modal.show("#pay-notice").center(".modal-dialog");
  }

}
