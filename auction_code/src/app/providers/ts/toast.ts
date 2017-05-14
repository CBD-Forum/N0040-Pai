/**
 * Created by Administrator on 2017/1/2.
 */
export class Toast {
  private id: string = "toastMessage";
  private msgEntity: any = null;

  private _options: any = {
    content: 'Toast效果显示',
    left: null,
    top: null,
    time: 6000,
    width: null,
    position: "top"//top、bottom、middle、center
  };

  public get options() {
    return this._options;
  }

  public set options(opt: any) {
    for (let key in opt) {
      this._options[key] = opt[key];
    }
  }

  constructor() {
  }

  init() {
    $("#" + this.id).remove();
    //设置消息体
    let html = `
      <div id="` + this.id + `" style="border-radius:18px;-moz-opacity:0.6;opacity:0.6;">
          <span> ` + this._options.content + `</span>
      </div>
    `;
    let body = $(document.body);
    this.msgEntity = $(html).appendTo(body);
    //设置消息样式
    let left = this._options.left == null ? body.width() / 2 - this.msgEntity.find('span').width() / 2 : this._options.left;
    let top = this._options.top == null ? '20px' : this._options.top;

    this.msgEntity.css({
      position: 'fixed',
      'z-index': '2000',
      left: left,
      'background-color': '#a56322',
      color: 'white',
      'font-size': '15px',
      padding: '10px',
      margin: '10px'
    });
    switch (this._options.position) {
      case 'top':
        this.msgEntity.css({top: top});
        break;
      case 'bottom':
        this.msgEntity.css({bottom: top});
        break;
      case 'center':
      case 'middle':
        /*top = (document.body.scrollTop + document.body.clientHeight / 2
        - this.msgEntity.height() / 2);*/
        top = (document.body.clientHeight / 2
        - this.msgEntity.height() / 2);
        this.msgEntity.css({top: top});
        break;
      default:
        this.msgEntity.css({bottom: top});
        break;
    }
    this.msgEntity.hide();
  }

  //显示动画
  public show(opt?: any) {
    if (opt != null) {
      this.options = opt;
    }
    this.init();
    this.animate();

  }

  animate() {
    this.msgEntity.fadeIn(this._options.time / 2);
    this.msgEntity.fadeOut(this._options.time / 2);
  }

  remove() {
    $("#" + this.id).remove();
  }

}
