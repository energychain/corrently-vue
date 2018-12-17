let corrently_model = {};

function gsiInfo(element,account) {
    if($(element).attr('data-account')) {
        account=$(element).attr('data-account');
    }
    $.getJSON("https://api.corrently.io/core/gsi?account="+account,function(data) {
        if((typeof data.points == "undefined")||(data.points == 0)) {
            $(element).hide();
            return;
        } else {
            data.points_kwh = (data.points/1000).toFixed(3).replace('.',',');
            data.residual_kwh = (data.residual/1000).toFixed(3).replace('.',',');
            data.gsi_balance_kwh = ((data.points-data.residual)/1000).toFixed(3).replace('.',',');
            data.created_formated = new Date(data.created).toLocaleString();
            corrently_model.gsi=data;

            if($(element).attr('vue-initialized')!="true") {
                let view = new Vue({
                  el: element,
                  data: corrently_model.gsi
                })
                $(element).show();
                $(element).attr('vue-initialized','true');
            }

            setTimeout(function() {
                    gsiInfo(element,account);
                },3600000);
        }
    });
}
function accountInfo(element,account) {
    if($(element).attr('data-account')) {
        account=$(element).attr('data-account');
    }
    $.getJSON("https://api.corrently.io/core/accountInfo?account="+account,function(data) {
        if(typeof data.result.generation != "undefined") {
            data.result.generation_formated = (data.result.generation+"").replace('.',',');
            if(data.result.generation>0.01) {
                data.result.generation_formated = data.result.generation.toFixed(4).replace('.',',');
            }
            if(data.result.generation>100) {
                data.result.generation_formated = (Math.round(data.result.generation)+"").replace('.',',');
            }
           if(typeof data.result.meteredconsumption != "undefined") {
               data.result.energy_balance=Math.round(data.result.generation-data.result.meteredconsumption);
           }
        }
        if(typeof data.result.created != "undefined") {
            data.result.created_formated = new Date(data.result.created).toLocaleString();
        } else {
            data.result.created_formated = "./.";
        }
        corrently_model.account = data.result;

        if($(element).attr('vue-initialized')!="true") {
            let view = new Vue({
              el: element,
              data: corrently_model.account
            })
            $(element).show();
            $(element).attr('vue-initialized','true');
        }
        ui_controller();
        //console.log(data.result);
        if(typeof data.result.refreshIn != "undefined") {
            setTimeout(function() {
                accountInfo(element,account);
            },data.result.refreshIn);
        } else {
             setTimeout(function() {
                accountInfo(element,account);
            },900000);
        }
    })
}

function ui_views(account) {
    $('.corrently-view').attr('data-account',account);
    accountInfo("#account-view",account);
    gsiInfo("#gsi-view",account);
    $('#app').show();
}
function ctrl_privateKey() {
    $('#btn_privateKey').attr('disabled','disabled');
    window.localStorage.setItem("privateKey",$('#txt_privateKey').val());
    location.reload();
    return false;
}
function ctrl_forget() {
    $('#btn_forget').attr('disabled','disabled');
    let wallet = CorrentlyWallet.default.Wallet.createRandom();
    window.localStorage.setItem("privateKey",wallet.privateKey);
    location.reload();
    return false;
}
function ctrl_usernamePassword() {

   $('#btn_usernamePassword').attr('disabled','disabled');
    CorrentlyWallet.default.Wallet.fromBrainWallet($('#txt_username').val(),$('#txt_password').val()).then(function(wallet) {
           window.localStorage.setItem("privateKey",wallet.privateKey);
            location.reload();
        });
    return false;
}
function ctrl_login() {
    $('.app').hide();
    $('#login_card_div').removeClass('d-none');
    $('#login_card_div').show();
    $('#app').hide();
}
function ui_controller() {
    $('#btn_privateKey').click(ctrl_privateKey);
    $('#btn_usernamePassword').click(ctrl_usernamePassword);
    $('#btn_forget').click(ctrl_forget);
    $('#login_card').click(ctrl_login);
}
function ui_bootstrap() {
    $('.navbar-nav').append('<ul class="nav navbar-nav ml-auto"><li role="presentation" class="nav-item"><a href="#" class="nav-link btn btn-sm btn-success" id="login_card">Identität</a></li></ul>');
    $('.app').hide();
    /* Negotiate Account to use */
    let account="0xc430fAB09288C272A321C086d330609CD8b71447";
    if(window.localStorage.getItem("privateKey")!=null) {
        const wallet =new CorrentlyWallet.default.Wallet(window.localStorage.getItem("privateKey"))
        account=wallet.address;
         ui_views(account);
    }  else {
         ui_views(account);
    }
}

$(document).ready(ui_bootstrap);
