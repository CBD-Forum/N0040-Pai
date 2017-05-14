/**
 * Created by yongli.chen on 2016/12/3.
 */
export class Slider {
  private option:any = {
    speed: "3000",//间隔运动时间
    a_speed: "500",//运动时间
    conuntW: "1180",//整体内容宽度
    countH: "530",//整体内容高度
    w1: "800",//大图宽度
    h1: "530",//大图高度
    w2: "190",//小图宽度
    h2: "500"//小图高度
  };

  private half:number = 0;
  private number:number;
  private T:any;

  private imgContainer:any = null;
  private li = null;

  constructor(imgContainer:any, opt:any) {
    this.imgContainer = imgContainer;
    this.option = $.extend(this.option, opt || {});

    var ul = this.imgContainer.find("ul.slide-img");
    this.li = ul.children("li");
    var length = ul.children("li").length;
    this.half = length / 2;
    if (length % 2 == 0) {
      this.half = this.half - 1;
    }

    this.init();

  }

  init() {
    var ul = this.imgContainer.find("ul.slide-img");
    var btn = this.imgContainer.find(".i_btn");
    var lion = ul.children("li.on");
    var self = this;

    this.number = this.now_show(this.li);

    this.pos_dex(this.number);
    this.T = setInterval(function () {
      self.ss();
      self.pos_dex(self.number)
    }, self.option.speed);


    btn.unbind('click').click(function () {
      clearInterval(self.T);
      self.number = self.now_show(self.li);
      let tip = parseInt($(this).attr("tip"));
      if (tip == 0) {
        //向前
        if (self.number == 0) {
          self.number = length - 1;
        } else {
          self.number = self.number - 1;
        }
      } else {
        //向后
        if (self.number == length - 1) {
          self.number = 0;
        } else {
          self.number = self.number + 1;
        }
      }
      if (!lion.is(":animated")) {
        self.pos_dex(self.number);
        self.T = setInterval(function () {
          self.ss();
          self.pos_dex(self.number)
        }, self.option.speed)
      }

    });

    //鼠标点击
    ul.on("click", "li.on .icon", function () {
      clearInterval(self.T);
      $(this).hide();
      $(this).siblings(".info").show();
      $(this).siblings(".bg").show();
    });


    this.li.on("click", ".info i", function () {
      $(this).parent(".info").siblings(".icon").show();
      $(this).parent(".info").hide();
      $(this).parent(".info").siblings(".bg").hide();
      self.number = self.now_show(this.li);
      setTimeout(function () {
        self.T = setInterval(function () {
          self.ss();
          self.pos_dex(self.number)
        }, self.option.speed)
      }, 300);
      return false;
    });

  }


  pos_dex(N) {
    var next;
    var z = this.li.length;

    //	alert(z);
    this.li.eq(N).attr("class", "on");
    this.li.eq(N).find(".icon").show();
    this.li.eq(N).siblings("li").find(".bg").hide();
    this.li.eq(N).siblings("li").find(".info").hide();

    //大图left
    let left1 = (this.option.conuntW - this.option.w1) / 2;
    //大图top
    let top1 = (this.option.countH - this.option.h1) / 2;
    let left2 = this.option.conuntW - this.option.w2;//小图left

    //小图top
    let top2 = (this.option.countH - this.option.h2) / 2;
    let w2 = this.option.w2;//小图宽度
    let h2 = this.option.h2;//小图高度

    let w1 = this.option.w1;//大图宽度
    let h1 = this.option.h1;//大图高度

    for (let i = 1; i <= this.half; i++) {
      //right
      next = N + i;
      z = z - i;
      if (next == this.li.length) {
        next = 0;
      }
      this.li.eq(next).css("z-index", z);
      this.li.eq(next).attr("class", "right");


      this.li.eq(next).animate({"left": left2, "width": w2, "height": h2, "top": top2}, this.option.a_speed);
      // li.eq(next).css("z-index",z);
      //left
      var pre = N - i;
      if (pre == -1) {
        pre = this.li.length - 1;
      }
      this.li.eq(pre).attr("class", "left");
      this.li.eq(pre).css("z-index", z);
      // li.eq(pre).css("z-index",z);
      this.li.eq(pre).animate({"left": "0px", "width": w2, "height": h2, "top": top2}, this.option.a_speed);
    }
    //mid
    if (this.li.length % 2 == 0) {
      this.li.eq(next + 1).attr("class", "mid");
      this.li.eq(next + 1).css("z-index", z - 2);
      this.li.eq(next + 1).animate({"left": left2, "width": w2, "height": h2, "top": top2}, this.option.a_speed);
    }
    //li.eq(N).css("z-index",length);
    this.li.eq(N).css("z-index", parseInt(this.li.length) + 3);
    this.li.eq(N).animate({"left": left1, "width": w1, "height": h1, "top": top1}, this.option.a_speed);
  }

  //当前显示的是第几个图片
  public now_show(chi):number {
    let now:number = 0;
    for (let i = 0; i < chi.length; i++) {
      var li = chi[i];
      if ($(li).hasClass("on")) {
        now = i;
      }
    }
    return now;
  }

  ss() {
    this.number = this.number + 1;
    if (this.number == this.li.length) {
      this.number = 0;
    }
  }


}
