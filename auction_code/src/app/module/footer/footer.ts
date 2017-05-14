/**
 * Created by yongli.chen on 2016/12/7.
 */

export class  Footer{
  private selector:string = "footer";
  private template:string = "";
  private className:string = "";//装载组件的父ID
  private isSelectorLoaded:boolean  = false;

  constructor(module:string,className:string,callback?:Function) {
    this.className = className;
    this.template = './'+ module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html)=> {
        $(className).html(html);
        this.isSelectorLoaded = true;
        this.init();
        if(callback){
          callback();
        }
      }, (err)=> {
        console.log(err);
      });


  }

  public init(){

  }
}
