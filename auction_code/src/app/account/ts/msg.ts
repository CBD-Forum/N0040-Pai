/**
 * Created by yongli.chen on 2016/11/25.
 */

import {WebSocketClient} from "../../providers/ts/websocket-client";
export class Msg {


  private selector:string = "msg";
  private template:string = "";
  private containerId:string = "";//装载组件的父ID
  private isSelectorLoaded:boolean  = false;
  private username:string = "";
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


    let self = this;
    let options= {
      notify:self.notify
    };

    let ws = new WebSocketClient(options);

  }

  private notify(msg){
    $("#msg").text(msg);
  }
}
