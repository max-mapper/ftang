
function runit(){
  var font_percent = .009;
 	element_id="#tiles";
    
   msg='';
   msg=document.body.clientWidth;
   	var font_math = Math.round(font_percent*msg*10);
   if(navigator.appName.indexOf('Microsoft')!=-1){
     document.styleSheets[0].removeRule(0);
     document.styleSheets[0].addRule(element_id,"font-size:"+font_math+"%;",0);
   }else{
     document.styleSheets[0].deleteRule(0);
     document.styleSheets[0].insertRule(element_id+" {font-size:"+font_math+"%;}",0);
   }
 }

 var nn4_prev_width, nn4_prev_height, is_nn4 = false;
 window.onload=function(){addWinResizeListener(runit);runit();}

 function addWinResizeListener(fn){
   if(window.addEventListener){
     window.addEventListener('resize', fn, false);
   }else if(window.attachEvent){
     window.attachEvent('onresize', fn);
   }else if(document.layers && typeof(window.innerWidth)!='undefined'){
     nn4_prev_width=window.innerWidth;
     nn4_prev_height=window.innerHeight;
     is_nn4=true;
     setTimeout("nn_resize()", 500);
   }else{
     window.onresize=fn;
   }
 }

 function nn_resize(){
   if(window.innerWidth != nn4_prev_width || window.innerHeight != nn4_prev_height){
     runit();
   }else {
     setTimeout("nn_resize()", 500);
   }
 }