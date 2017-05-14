/**
 * Created by yongli.chen on 2016/11/28.
 */
export class Routes {
  public routers:any = {};//保存注册的所有路由
  public defaultRouter:string = "";
  public beforeFun:Function = undefined;
  public afterFun:Function = undefined;

  constructor() {

  }


  public init(defaultRouter:string) {
    this.defaultRouter = defaultRouter;
    let self = this;
    //页面加载匹配路由
    window.addEventListener('load', function () {
      self.urlChange()
    });
    //路由切换
    window.addEventListener('hashchange', function () {
      self.urlChange()
    });
  }

  //单层路由注册
  map(path:string, callback:Function) {
    path = path.replace(/\s*/g, "");//过滤空格
    if (callback && Object.prototype.toString.call(callback) === '[object Function]') {
      this.routers[path] = {
        callback: callback,//回调
        fn: null //存储异步文件状态
      }
    } else {
      console.trace('注册' + path + '地址需要提供正确的的注册回调')
    }
  }

  refresh(currentHash:any) {
    if (this.beforeFun) {
      this.beforeFun({
        to: {
          path: currentHash.path,
          query: currentHash.query
        },
        next: function () {
          this.routers[currentHash.path].callback.call(this, currentHash)
        }
      })
    } else {
      this.routers[currentHash.path].callback.call(this, currentHash)
    }
  }

  //获取路由的路径和详细参数
  getParamsUrl():any {
    let start = location.href.indexOf("?");
    let end = location.href.indexOf("#");
    let query = {};
    let hashDeatail = location.hash.split("?"),
        hashName = hashDeatail[0].split("#")[1];//路由地址
    if (start > end) {
      let params = hashDeatail[1] ? hashDeatail[1].split("&") : [];//参数内容
      for (let i = 0; i < params.length; i++) {
        let item = params[i].split("=");
        query[item[0]] = item[1]
      }
    }
    else {
      let params = location.href.substring(start+1,end).split("&");
      for (let i = 0; i < params.length; i++) {
        let item = params[i].split("=");
        query[item[0]] = item[1]
      }

    }


    return {
      path: hashName,
      query: query
    }
  }

  //路由处理
  urlChange() {
    let currentHash = this.getParamsUrl();
    if (this.routers[currentHash.path]) {
      this.refresh(currentHash)
    } else {
      //不存在的地址重定向到首页
      if (this.defaultRouter)
        location.hash = this.defaultRouter;
    }
  }

  //切换之前一些处理
  beforeEach(callback:Function) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.beforeFun = callback;
    } else {
      console.trace('路由切换前钩子函数不正确')
    }
  }


  //切换成功之后
  afterEach(callback:Function) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.afterFun = callback;
    } else {
      console.trace('路由切换后回调函数不正确')
    }
  }


}
