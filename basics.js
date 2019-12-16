
function setCookie(cname, cvalue, expires) {
    var d = new Date();
    d.setTime(d.getTime() + (expires*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

function deleteCookie(cname) {
    document.cookie = cname + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
};

function TAG(tag, attrs, content) {
    var markup = '<' + tag;
    for (var a in attrs) {
        markup += ' ' + a + '="' + attrs[a] + '"';
    }
    if (content) {
        markup += '>' + content + '</' + tag + '>';
    }
    else {
        markup += '/>';
    }
    return markup;
};

function THUMB(path, size) {
    var src = path + '=s' + size + '-c';
    return TAG('img', {'height':size, 'width':size, 'src':src});
};

function DIV(attrs, content) {
    return TAG('div', attrs, content);
};

function SECTION(attrs, content) {
    return TAG('section', attrs, content);
};

function SPAN(attrs, content) {
    return TAG('span', attrs, content);
};

function A(attrs, content) {
    return TAG('a', attrs, content);
};


var MENU = MENU || {};

MENU._openT = null;
MENU._closeT = null;

MENU._selector = function(obj) {
    var controller = obj.attr('id');
    return controller + '-menu';
};

MENU.open = function(selector) {
    clearTimeout(MENU._closeT);
    MENU._openT = setTimeout(function() {
        $(selector).show();
    }, 100);
};

MENU.close = function(selector) {
    clearTimeout(MENU._openT);
    MENU._closeT = setTimeout(function() {
        $(selector).hide();
    }, 100);
};

MENU.toggle = function(selector) {
    $(selector).toggle();
};

MENU.init = function() {
    // assign magical powers to each menu-controller
    $('.menu-control').each(function(index,obj) {
        var selector = MENU._selector($(obj));
        $(obj).click(function() {
            MENU.toggle('#'+selector);
        }).mouseenter(function() {
            MENU.open('#'+selector);
        }).mouseleave(function() {
            MENU.close('#'+selector);
        });
        
        // give each menu item the same 
        $('.'+selector).each(function(index, obj) {
            $(obj).mouseenter(function() {
                MENU.open('#'+selector);
            }).mouseleave(function() {
                MENU.close('#'+selector);
            });
        });
    });
};

var logging = logging || {}

logging._once = {};

logging.debug = function() {
    if (console) console.debug.apply(this, arguments);
};

logging.warn = function() {
    if (console) console.warn.apply(this, arguments);
};

logging.error = function() {
    if (console) console.error.apply(this, arguments);
};

logging.once = function(key) {
    if (logging._once[key]) {
        return;
    }
    if (console) console.warn.apply(this, arguments);
    logging._once[key] = true;
};

var agent = agent || {}

agent.parse = function() {
    var agent = "other"

    if (navigator.userAgent.match(/iPad/i) != null) { agent = "ios"; }
    else if (navigator.userAgent.match(/iPhone/i) != null) { agent = "ios"; }
    else if (navigator.userAgent.match(/iPod/i) != null) { agent = "ios"; }
    else if (navigator.userAgent.match(/android/i) != null) { agent = "android"; }

    return agent;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getOrgname() {
    let urlParts = location.pathname.split('/');
    return urlParts[1];
} 