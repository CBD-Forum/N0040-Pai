/**
 * Created by Administrator on 2017/1/8.
 */
import * as encoding from "text-encoding";

export class WebSocketClient {
  static rawHeaderLen: number = 16;
  static packetOffset: number = 0;
  static headerOffset: number = 4;
  static verOffset: number = 6;
  static opOffset: number = 8;
  static seqOffset: number = 12;

  static MAX_CONNECT_TIMES: number = 10;
  static DELAY: number = 15000;

  private options: any = null;
  private ws: WebSocket = null;
  private textEncoder: any = new encoding.TextEncoder();
  private textDecoder: any = new encoding.TextDecoder("utf-8");

  constructor(options: any) {
    this.options = options;
    if (!this.options) {
      alert("参数不能为空.");
      return;
    }
    if (this.options.userid == null || this.options.userid < 0) {
      alert("用户id不能为空.");
      return;
    }
    if (!this.options.callback) {
      alert("消息回调接口不能为空.");
      return;
    }
    this.createConnect(WebSocketClient.MAX_CONNECT_TIMES, WebSocketClient.DELAY);
  }

  private createConnect(max, delay) {
    if (max === 0) {
      return;
    }
    this.connect();
  }

  private connect() {
    let self = this;
    let heartbeatInterval;

    this.ws = new WebSocket('wss://pai.skyfromwell.com/websocket/sub');
    this.ws.binaryType = 'arraybuffer';
    this.ws.onopen = function () {
      self.auth();
    };

    this.ws.onmessage = function (event) {
      let data = event.data;
      let dataView = new DataView(data, 0);
      let packetLen = dataView.getInt32(WebSocketClient.packetOffset);
      let headerLen = dataView.getInt16(WebSocketClient.headerOffset);
      let ver = dataView.getInt16(WebSocketClient.verOffset);
      let op = dataView.getInt32(WebSocketClient.opOffset);
      let seq = dataView.getInt32(WebSocketClient.seqOffset);

      console.log("receiveHeader: packetLen=" + packetLen, "headerLen=" + headerLen, "ver=" + ver, "op=" + op, "seq=" + seq);
      switch (op) {
        case 8:
          self.heartbeat(self);
          heartbeatInterval = setInterval(self.heartbeat, 30 * 1000, self);
          break;
        case 3:
          console.log("receive: heartbeat");
          break;
        case 5:
          let length = data.byteLength;
          for (let offset = 0; offset < length; offset += packetLen) {
            let packetLen = dataView.getInt32(offset);
            let headerLen = dataView.getInt16(offset + WebSocketClient.headerOffset);
            let version = dataView.getInt16(offset + WebSocketClient.verOffset);
            let body = self.textDecoder.decode(data.slice(offset + headerLen, offset + packetLen));
            self.messageReceived(version, body);
          }
          break;
      }
    };

    this.ws.onclose = function () {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      setTimeout(self.reConnect, WebSocketClient.DELAY, self);
    };
  }

  private mergeArrayBuffer(ab1, ab2) {
    let u81 = new Uint8Array(ab1);
    let u82 = new Uint8Array(ab2);
    let res = new Uint8Array(ab1.byteLength + ab2.byteLength);
    res.set(u81, 0);
    res.set(u82, ab1.byteLength);
    return res.buffer;
  }

  private messageReceived(version, body) {
    console.log("message:", "ver=" + version, "body=" + body);
    let callback = this.options.callback;
    callback(version, body);
  }

  private heartbeat(self) {
    let headerBuf = new ArrayBuffer(WebSocketClient.rawHeaderLen);
    let headerView = new DataView(headerBuf, 0);
    headerView.setInt32(WebSocketClient.packetOffset, WebSocketClient.rawHeaderLen);
    headerView.setInt16(WebSocketClient.headerOffset, WebSocketClient.rawHeaderLen);
    headerView.setInt16(WebSocketClient.verOffset, 1);
    headerView.setInt32(WebSocketClient.opOffset, 2);
    headerView.setInt32(WebSocketClient.seqOffset, 1);
    self.ws.send(headerBuf);
    console.log("send: heartbeat");
  }

  private auth() {
    let token;
    if (this.options.userid == null || this.options.userid < 0) {
      return;
    }
    token = this.options.userid;
    if (this.options.roomid) {
      token += ("," + this.options.roomid);
    }
    let headerBuf = new ArrayBuffer(WebSocketClient.rawHeaderLen);
    let headerView = new DataView(headerBuf, 0);

    let bodyBuf = this.textEncoder.encode(token);
    headerView.setInt32(WebSocketClient.packetOffset, WebSocketClient.rawHeaderLen + bodyBuf.byteLength);
    headerView.setInt16(WebSocketClient.headerOffset, WebSocketClient.rawHeaderLen);
    headerView.setInt16(WebSocketClient.verOffset, 1);
    headerView.setInt32(WebSocketClient.opOffset, 7);
    headerView.setInt32(WebSocketClient.seqOffset, 1);
    this.ws.send(this.mergeArrayBuffer(headerBuf, bodyBuf));
  }

  private char2ab(str) {
    let buf = new ArrayBuffer(str.length);
    let bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str[i];
    }
    return buf;
  }

  public reConnect(self) {
    self.createConnect(--WebSocketClient.MAX_CONNECT_TIMES, WebSocketClient.DELAY * 2);
  }
}
