/**
 * Created by yongli.chen on 2017/1/9.
 */
export class Contract {
  private selector: string = "contract";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;

  constructor(module: string, containerId: string) {
    this.containerId = containerId;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(containerId).html(html);
        this.isSelectorLoaded = true;
        this.init();
      }, (err) => {
        console.log(err);
      });
  }

  public init() {
    $("#agree-span").on('click', function (e) {
      if ($('#agree').prop('checked')) {
        $('#agree').prop('checked', false);
      } else {
        $('#agree').prop('checked', true);
      }
    });
  }
}
