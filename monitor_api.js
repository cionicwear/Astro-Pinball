'use strict';

var MonitorAPI = MonitorAPI || {};
MonitorAPI.private_keys = [];
MonitorAPI.codes = [];
MonitorAPI.Players = []
MonitorAPI.VERSION = '0.11';


MonitorAPI.Players.push(new cionicjs.Cionic({}));

MonitorAPI.initApis = function() {
    // Set BASE and ORG to connect
    if (window.isCionicGame) {
        MonitorAPI.MONITORS_URL = `/a/v${MonitorAPI.VERSION}/${MonitorAPI.orgname}/monitors`;
    } else {
        const BASE = 'https://cionic.com';
        const ORG = 'cionic'
        MonitorAPI.MONITORS_URL = `${BASE}/a/v${MonitorAPI.VERSION}/${ORG}/monitors`;
    }

    MonitorAPI.MONITOR_URL = function(code) { return `${MonitorAPI.MONITORS_URL}/${code}`; };
    MonitorAPI.GATEWAY_URL = function(code) { return `${MonitorAPI.MONITOR_URL(code)}/gateway`; };
}

MonitorAPI.getPlayerUrl = function(baseUrl, playerIdx) {
    let url = new URL(baseUrl, location.origin);
    if (playerIdx > 0) url.searchParams.set('playerIdx', playerIdx);
    return url;
}

//
// Generic Fetch request
//
// Params:
//   method - HTTP verb
//   url - route
//   data - JSON-able request body
// Returns: response from fetch
//
MonitorAPI.asyncReq = async function(method, url, data) {
    let options = {
        method,
        url,
        credentials: 'include' // includes cookies in requests
    };
    if (data != null) {
        data = JSON.stringify(data);
        options.headers = {...options, 'Content-Type': 'application/json'};
        options.body = data;
    }

    try {
        const res = await fetch(url, options);
        return res;
    } catch (e) {
        MonitorAPI.log(e);
    }
};

//
// Helper function for error handling
//
// Params:
//   data - object to send to the log
//
MonitorAPI.log = function (data) {
    console.log(data);
};


// Create a monitor, set the resultant code as a cookie
MonitorAPI.postMonitor = async function(private_key) {
    try {
        let res = await MonitorAPI.asyncReq('POST', MonitorAPI.MONITORS_URL, { private_key });

        if (res.status == 201) {
            return await res.json();
        }
    }
    catch(err) {
        MonitorAPI.log(err);
    }
}

// GET monitor based on code
MonitorAPI.getMonitor = async function(code, playerIdx) {
    try {
        let url = MonitorAPI.getPlayerUrl(MonitorAPI.MONITOR_URL(code), playerIdx);
        let res = await MonitorAPI.asyncReq('GET', url, null);
        
        let resBody;
        let resStatus = res.status;
        if (resStatus === 200) {
            resBody = await res.json();
        }
        
        return [resBody, res.status];
    } catch(err) {
        MonitorAPI.log(err);
    }
}

// Clear Gateway_IP <> Monitor mapping
MonitorAPI.deleteGateway = async function(code, playerIdx) {
    try {
        let url = MonitorAPI.getPlayerUrl(MonitorAPI.GATEWAY_URL(code), playerIdx);
        let res = await MonitorAPI.asyncReq('DELETE', url, null);

        if (res.status !== 202) {
            MonitorAPI.log(res.status);
        }
        MonitorAPI.nPlayers -= 1;

    } catch(err) {
        MonitorAPI.log(err);
    }
}

// generates and stores monitor key as cookie + POST request to create monitor
MonitorAPI.createMonitorAndSetCookies = async function(playerIdx) {
    try {
        let private_key = [...Array(16)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
        let key = 'monitor_key';
        if (playerIdx > 0) key += playerIdx;
        setCookie(key, private_key);
        MonitorAPI.private_keys[playerIdx] = private_key;
        let res = await MonitorAPI.postMonitor(private_key);
        if (res.code) {
            MonitorAPI.setCodeCookie(res.code, playerIdx);
            MonitorAPI.codes[playerIdx] = res.code;
        }
    } catch(err) {
        MonitorAPI.log(err);
    }
}

MonitorAPI.setCodeCookie = function(code, playerIdx) {
        MonitorAPI.codes[playerIdx] = code;
        let cmc = 'cionic_monitor_code';
        if (playerIdx > 0) cmc += playerIdx;
        setCookie(cmc, code);
}

// grabs appropriate values and polls
MonitorAPI.poll = async function(private_key, code, playerIdx) {
    // Grab/create cookies
    MonitorAPI.private_keys[playerIdx] = getCookie(private_key);
    MonitorAPI.codes[playerIdx] = getCookie(code);
    if (MonitorAPI.private_keys[playerIdx].length < 16 || MonitorAPI.codes[playerIdx].length < 3) await MonitorAPI.createMonitorAndSetCookies(playerIdx);
    $('#code').text('Code: ' + MonitorAPI.codes[playerIdx]);
    $('#code').show();

    // display code and poll till we get an ip address
    let resBody, resStatus;
    while (resStatus != 200) {
        try {
            // resBody undefined if resStatus != 200
            [resBody, resStatus] = await MonitorAPI.getMonitor(MonitorAPI.codes[playerIdx], playerIdx);
            
            // if 200 --> store ip_addr, show elems, connect to websocket
            if (resStatus === 200) {
                $('#code').hide();
                document.getElementById('host').value = resBody.gateway_ip_address;
                MonitorAPI.Players[playerIdx].websocket(resBody.gateway_ip_address);
            }
            
            // if 40X --> POST for new code
            if (resStatus === 401 || resStatus === 403 || resStatus === 404) {
                await MonitorAPI.createMonitorAndSetCookies(playerIdx);
            }
            await sleep(5000);
        } catch(err) {
            MonitorAPI.log(err);
        }
    }
}

MonitorAPI.engageGateway = async function(private_key, code, playerIdx) {
    await MonitorAPI.poll(private_key, code, playerIdx);

    // onclose doesn't take a callback; no good reverse-proxy solution
    // so instead we sleep
    while (MonitorAPI.Players[playerIdx].Stream.state != cionicjs.STREAM_STATES.CLOSED){
        await sleep(2000);
    } 
    MonitorAPI.deleteGateway(MonitorAPI.codes[playerIdx], playerIdx);
}

MonitorAPI.main = function() {
    MonitorAPI.orgname = getOrgname();
    MonitorAPI.initApis();

    MonitorAPI.nPlayers += 1;
    MonitorAPI.engageGateway('monitor_key', 'cionic_monitor_code', 0).then(() => {
        window.location.href = window.location.href;
    });
}
