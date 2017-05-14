/**
 * Created by Administrator on 2016/12/31.
 */
require('bootstrapcss');
require('bootstrap_glyphicons_css');
export class Modal {

  private newDiv:any = null;
  private newDivWidth = 400;//新弹出层宽度
  private newDivHeight = 200;//新弹出层高度
  private newMask:any = null;
  private ele:any = null;
  private defaultDlgId:string = "default-modal";
  private callback:Function = null;

  private status:any = {
    code: -1,
    msg: ""
  };

  private _options:any = {
    showMask: true,
    title: "自定义对话框",
    content:"",
    ok: "确定",
    cancel: "取消",
    width:0,
    height:0
  };

  constructor() {

  }

  public getOptions() {
    return this._options;
  }

  public setOptions(opt:any):Modal {
    for(let key in opt){
      this._options[key] = opt[key];
    }
    return this;
  }

  public setMask() {
    let newMaskID = "mask";  //遮罩层id
    let newMaskWidth = document.body.scrollWidth;//遮罩层宽度
    let newMaskHeight = document.body.scrollHeight;//遮罩层高度
    //mask遮罩层
    this.newMask = document.createElement("div");//创建遮罩层
    this.newMask.id = newMaskID;//设置遮罩层id
    this.newMask.style.position = "absolute";//遮罩层位置
    this.newMask.style.zIndex = "10";//遮罩层zIndex
    this.newMask.style.width = newMaskWidth + "px";//设置遮罩层宽度
    this.newMask.style.height = newMaskHeight + "px";//设置遮罩层高度
    this.newMask.style.top = "0px";//设置遮罩层于上边距离
    this.newMask.style.left = "0px";//设置遮罩层左边距离
    this.newMask.style.background = "#eee";//遮罩层背景色
    this.newMask.style.filter = "alpha(opacity=40)";//遮罩层透明度IE
    this.newMask.style.opacity = "0.40";//遮罩层透明度FF
    //document.body.appendChild(this.newMask);//遮罩层添加到DOM中
    $(document.body).append(this.newMask);
  }

  newDivCenter(self:any) {
    self.newDiv.style.top = (document.body.scrollTop + document.body.clientHeight / 2
      - self.newDivHeight / 2) + "px";
    self.newDiv.style.left = (document.body.scrollLeft + document.body.clientWidth / 2
      - self.newDivWidth / 2) + "px";
  }

  public show(ele:any, callback?:Function):Modal {
    if (this._options.showMask) {
      this.setMask();
    }
    if (ele != null) {
      $(ele).show();
      this.ele = ele;
    } else {
      this.defaultWindow();
    }
    this.callback = callback;
    return this;
  }

  public close() {
    if (this.newMask != null) {
      document.body.removeChild(this.newMask);//移除遮罩层
      this.newMask = null;
    }
    if (this.ele != null) {
      $(this.ele).hide();
      this.ele = null;
    }
    else {
      $('#' + this.defaultDlgId).remove();
    }
    if(this.callback){
      this.callback({"status":this.status});
    }
  }

  public center(ele):Modal {
    let width = $(ele).width();
    if (width > 0) {
      let left = (document.body.scrollLeft + document.body.clientWidth / 2
      - width / 2);//新弹出层距离左边距离
      //$(ele).css({"left":left + "px"});
    }

    let height = $(ele).height();
    if (height > 0) {
      let top = ( document.body.clientHeight / 2
      - height / 2);//新弹出层距离上边距离document.body.scrollTop +
      $(ele).css({"margin": top + "px auto"});
    }
    return this;
  }

  public defaultWindow() {
    let self = this;
    let width = this._options.width > 10? this._options.width + 'px':'auto';
    let height = this._options.height > 10 ? this._options.height  + 'px':'auto';
    let html = `
      <div class="modal  modal-open" id="` + this.defaultDlgId + `" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
           aria-hidden="true" style="display: block;">
        <div class="modal-dialog" id="default-modal-dlg">
          <div class="modal-content" style="width: `+ width +`;height: `+ height +`">
            <div class="modal-header">
              <button type="button" class="close close-window" data-dismiss="modal" aria-hidden="true">&times;</button>
              <h4 class="modal-title" id="myModalLabel" style="font-weight: bold;">
                ` + this._options.title + `
              </h4>
            </div>
            <div class="modal-body">
              ` + this._options.content + `
            </div>
            <div class="row default-margin text-center">
              <button type="button" class="btn btn-primary text-center" id="btn-ok">` + this._options.ok + `</button>
              <button type="button" class="btn btn-default text-center close-window" id="btn-cancel">` + this._options.cancel + `</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $(document.body).append(html).show();
    this.center("#default-modal-dlg");
    let dlg = $('#' + this.defaultDlgId);
    dlg.find('#btn-ok').on('click', function (e) {
      self.status.code = 0;
      self.status.ms = "ok";
      self.close();
    });

    dlg.find('.close-window').on('click', function (e) {
      self.status.code = -1;
      self.status.ms = "cancel";
      self.close();
    });
  }

  public demo() {
    let newDivID = "test";

    this.newDiv = document.createElement("div");//创建新弹出层
    this.newDiv.id = newDivID;//设置新弹出层ＩＤ
    this.newDiv.style.position = "absolute";//新弹出层位置
    this.newDiv.style.zIndex = "9999";//新弹出层zIndex

    this.newDiv.style.width = this.newDivWidth + "px";//新弹出层宽度
    this.newDiv.style.height = this.newDivHeight + "px";//新弹出层高度
    let newDivtop = (document.body.scrollTop + document.body.clientHeight / 2
    - this.newDivHeight / 2);//新弹出层距离上边距离
    let newDivleft = (document.body.scrollLeft + document.body.clientWidth / 2
    - this.newDivWidth / 2);//新弹出层距离左边距离
    this.newDiv.style.top = newDivtop + "px";//新弹出层距离上边距离
    this.newDiv.style.left = newDivleft + "px";//新弹出层距离左边距离
    this.newDiv.style.background = "#EFEFEF";//新弹出层背景色
    this.newDiv.style.border = "1px solid #860001";///新弹出层边框样式
    this.newDiv.style.padding = "5px";//新弹出层
    this.newDiv.innerHTML = "content;content";//新弹出层内容
    //document.body.appendChild(this.newDiv);//新弹出层添加到DOM中
    $(document.body).append(this.newDiv);

    let self = this;
    if (document.all)//处理滚动事件，使弹出层始终居中
    {
      //window.attachEvent("onscroll",this.newDivCenter);
    }
    else {
      //window.addEventListener('scroll',self.newDivCenter,false);
      $(window).on('scroll', function (e) {
        self.newDivCenter(self);
      });
    }


    let newA = document.createElement("span");
    newA.style.position = "absolute";//span位置
    newA.style.left = 350 + "px";
    newA.innerHTML = "Close";

    newA.onclick = function ()//处理关闭事件
    {
      /*if(document.all)
       {
       window.detachEvent("onscroll",newDivCenter);
       }
       else
       {
       window.removeEventListener('scroll',newDivCenter,false);
       }*/
      document.body.removeChild(self.newMask);//移除遮罩层
      document.body.removeChild(self.newDiv);////移除弹出框
      return false;
    };
    this.newDiv.appendChild(newA);//添加关闭span

  }

}
