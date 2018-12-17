let _vue_data = {};
let _vue_controller = {};

function _update_account(account,callback) {
    $.getJSON("https://api.corrently.io/core/accountInfo?account="+account,function(data) {
        if((data.err==null)||(data.err=="insufficient data")) {
          data.result.fetched=new Date().getTime();
          window.localStorage.setItem("account",JSON.stringify(data.result));
          if(typeof callback == "function") callback();
        } else {
          console.log(data.err);
          if(typeof callback == "function") {
            setTimeout(function() { callback(); },1000);
          }
        }
    });
}

function _account_model(_account,callback) {
  let data = JSON.parse(window.localStorage.getItem("account"));
  if((data==null)||(data.fetched<new Date().getTime()-10000)||(data.account!=_account)) {
    _update_account(_account,function() { _account_model(_account,callback) });
  } else {
    _vue_data.account = data;
    if(typeof _vue_controller.account == "undefined") {
      _vue_controller.account=function() {  _account_model(_account); };
     setInterval(_vue_controller.account,5000);
    }
    if(typeof callback == "function") callback();
  }
}


function vue_bootstrap() {
  $('#corrently-vue').hide();
  _account_model("0xe596B918cC07852dfA41dd7181492720C261C8E5",function() {
    let view = new Vue({
      el: '#corrently-vue',
      data: _vue_data,
      methods: {
          $_datefmt: function(milliseconds) { return new Date(milliseconds).toLocaleString(); },
          $_wattfmt: function(watt) {
            watt = watt/1000;
            let res = watt;
            if(watt>0.001) res=watt.toFixed(5);
            if(watt>0.01) res=watt.toFixed(3);
            if(watt>0.1) res=watt.toFixed(2);
            if(watt>10) res=watt.toFixed(0);
            return (res+"").replace('.',',');
          }
      }
    })
    $('#corrently-vue').show();
    $('#corrently-vue').attr('vue-initialized','true');
  });
}

$(document).ready(vue_bootstrap);
