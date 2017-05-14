/**
 * Created by yongli.chen on 2016/11/25.
 */
import {GoodsParams} from "../../providers/ts/common.def";

export class Desc {
  private selector: string = "desc";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;

  constructor(module: string, containerId: string) {
    this.containerId = containerId;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(containerId).html(html);
        this.isSelectorLoaded = true;
      }, (err) => {
        console.log(err);
      });
  }

  public init(goods:GoodsParams) {
    this.setDesc(goods);
  }

  private setDesc(data: GoodsParams) {
    let images = data.images;
    if (images != null && images.length > 0) {
      let len = images.length;
      for (let i = 0; i < len; ++i) {
        let record = `
        <img data-lazyload="done" alt="" width="750" src="` + images[i] + `" style="margin: 0; padding: 0; border: 0; vertical-align: middle; color: #666666; font-family: Arial, Verdana, 宋体; font-size: 12px; line-height: 18px; text-align: center; background-color: #ffffff;"/>
      `;
        $("#ctl00_ContentPlaceHolder1_lbContent").append(record);
      }
    }
  }
}
