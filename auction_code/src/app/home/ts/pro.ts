/**
 * Created by yongli.chen on 2016/11/25.
 */
require('slidercss');

import {Slider} from "../../components/slider/slider";

export class Pro {
  private selector:string = "pro";
  private template:string = "";
  private containerId:string = "";//装载组件的父ID
  private isSelectorLoaded:boolean  = false;

  constructor(module:string,containerId:string) {
    this.containerId = containerId;
    this.template = './'+ module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html)=> {
        $(containerId).html(html);
        this.isSelectorLoaded = true;
        this.init();
      }, (err)=> {
        console.log(err);
      });


  }
  public init(){

    let newopt={
      w2:"180",//小图宽度
      h2:"490"//小图高度
    };

    let slider = new Slider($(".image-container"),newopt);
  }
}
