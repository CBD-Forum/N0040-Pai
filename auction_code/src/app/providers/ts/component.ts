/**
 * Created by yongli.chen on 2016/11/28.
 */
export interface ComponentEx {
  selector:string ;
  template:string;
  parent:string;//装载组件的父ID
  isSelectorLoaded?:boolean ;
}
