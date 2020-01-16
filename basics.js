
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

/**
 * 
 * @param {Obj} c1 circle of form {x, y, radius}
 * @param {Obj} c2 circle of form {x, y, radius}
 */
function intersectCircles(c1, c2) {
    const {x1, y1, r1} = c1;
    const {x2, y2, r2} = c2;
    const distSq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);  
    const radSumSq = (r1 + r2) * (r1 + r2);  
    return distSq <= radSumSq
}

/**
 * https://github.com/substack/point-in-polygon
 * @param {Obj} p point in form {x, y} 
 * @param {Obj} poly polygon in form [[coord1], [coord2], ...]
 */
function pointInPolygon(p, poly) {
    const {x, y} = p;
    
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i][0], yi = poly[i][1];
        let xj = poly[j][0], yj = poly[j][1];
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

// /**
//  * 
//  * @param {Obj} circle {x, y, radius}
//  * @param {Obj} polygon [[coord1], [coord2], ...]
//  */
// function intersect(circle, polygon) {
//     // def intersect(Circle(P, R), Rectangle(A, B, C, D)):
//     // S = Circle(P, R)
//     return (pointInPolygon({'x': circle.x, 'y': circle.y}, polygon) ||
//             intersectCircles(circle, (A, B)) ||
//             intersectCircle(circle, (B, C)) ||
//             intersectCircle(circle, (C, D)) ||
//             intersectCircle(circle, (D, A)));
// }