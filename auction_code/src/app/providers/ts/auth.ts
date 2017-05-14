/**
 * Created by yongli.chen on 2016/12/7.
 */
export class Auth {

  public days: number = 1;

  public setCookie(name: string, value: string): void {
    let exp = new Date();
    exp.setTime(exp.getTime() + this.days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires=" + exp.toUTCString();
  }

  public getCookie(name): any {
    let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
      return arr[2];
    } else {
      return null;
    }
  }

  public delCookie(name): void {
    let exp = new Date();
    exp.setTime(exp.getTime() - 1);
    let cval = this.getCookie(name);
    if (cval != null) {
      document.cookie = name + "=" + cval + "; expires=" + exp.toUTCString();
    }
  }

  /**
   * 获取用户信息
   * @returns {{userid: any, username: any, nickname: any}}
   */
  public getUserInfo(): any {
    let userid = this.getCookie("userid");
    if (!userid) {
      return null;
    }
    let username = this.getCookie("username");
    let nickname = this.getCookie("nickname");
    return {
      userid: userid,
      username: username,
      nickname: nickname
    }
  }

  /**
   * 添加用户信息到cookies
   * @param userInfo
   */
  public addUserInfo(userInfo: any): void {
    this.setCookie("userid", userInfo.userid);
    this.setCookie("username", userInfo.username);
    this.setCookie("nickname", userInfo.nickname);
  }

  /**
   * 删除cookies里面的用户信息
   */
  public deleteUserInfo(): void {
    this.delCookie("userid");
    this.delCookie("username");
    this.delCookie("nickname");
  }
}
