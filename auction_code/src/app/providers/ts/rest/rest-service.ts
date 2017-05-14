/**
 * Created by yongli.chen on 2016/12/8.
 */
export class RestService{
  public post(url:string,data:any):JQueryPromise<any>{
    return  $.when($.post(url,data));
  }
}
