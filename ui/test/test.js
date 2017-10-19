/*
 * Copyright 2017 Minebox IT Services GmbH 
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 *
 * http://www.apache.org/licenses/LICENSE-2.0 
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 * Various tools around backups, mostly to get info about them. 
 */

var mug_url = "/mug/"; // "https://" + location.hostname + ":5000/";

window.onload = function() {
  fetchMUG("status", "GET", null,
     function(aResult) {
        var status = document.getElementById("status");
        if (aResult["backup_type"]) {
          if (aResult["minebd_storage_mounted"] && aResult["users_created"]) {
            status.textContent = "Active";
          }
          else if (aResult["minebd_storage_mounted"]) {
            status.textContent = "Minebox storage ready, but no users have been set up.";
          }
          else if (!aResult["minebd_running"]) {
            status.textContent = "Storage inactive, call support!";
          }
          else if (aResult["minebd_encrypted"]) {
            status.textContent = "Encryption set up, getting ready for use...";
          }
          else {
            status.textContent = "No encryption key yet, please proceed to setup.";
          }
          document.getElementById("cheight").textContent = aResult["consensus_height"];
          document.getElementById("csync").textContent = aResult["consensus_synced"] ? "Yes" : "No";
          document.getElementById("user").textContent = aResult["logged_in"] ? aResult["user"] : "Not logged in";
          document.getElementById("wbalance").textContent = aResult["wallet_confirmed_balance_sc"];
          document.getElementById("wunlocked").textContent = aResult["wallet_unlocked"];
          document.getElementById("siad").textContent = aResult["sia_daemon_running"] ? "active" : "stopped";
        }
        else {
          status.textContent = "Unknown (Server issue?)"
          console.log(aResult);
        }
      },
      {}
  );

  document.getElementById("keybtn").onclick = function() {
    fetchMUG("key", "PUT", "foobar",
      function(aResult) {
        document.getElementById("keyoutput").textContent = aResult["statusCode"] + (aResult["message"] ? ": " + aResult["message"] : "")
      },
      {}
    );
  };

  document.getElementById("setupbtn").onclick = function() {
    document.getElementById("setupoutput").textContent = ""

    // First, set up a user via /setup_user, with a JSON request body.
    fetchRockstor("setup_user", "POST", "json", '{"username":"mbuser","password":"mypass","is_active":true}',
      function(aResult) {
        document.getElementById("setupoutput").textContent += " " + aResult["statusCode"]

        // Now that we have a user, log it as that one via /api/login (www-form-urlencoded body)
        fetchRockstor("api/login", "POST", "form", 'username=mbuser&password=mypass',
          function(aResult) {
            document.getElementById("setupoutput").textContent += " " + aResult["statusCode"]

            // Now that we are logged in, set the host name via /api/appliances (JSON request body)
            fetchRockstor("api/appliances", "POST", "json", '{"hostname":"DemoMinebox","current_appliance":true}',
              function(aResult) {
                document.getElementById("setupoutput").textContent += " " + aResult["statusCode"]
              },
              {}
            );
          },
          {}
        );
      },
      {}
    );
  };

  document.getElementById("backupbtn").onclick = function() {
    fetchMUG("backup/start", "POST", "",
      function(aResult) {
        document.getElementById("backupoutput").textContent = aResult["statusCode"] + (aResult["message"] ? ": " + aResult["message"] : "")
      },
      {}
    );
  };
}

function fetchMUG(aEndpoint, aMethod, aSendData, aCallback, aCallbackForwards) {
  var XHR = new XMLHttpRequest();
  XHR.onreadystatechange = function() {
    if (XHR.readyState == 4) {
      // State says we are fully loaded.
      var result = {};
      if (XHR.getResponseHeader("Content-Type") == "application/json") {
        // Got a JSON object, see if we have success.
        result = JSON.parse(XHR.responseText);
      }
      else {
        result = {"success": false, "data": XHR.responseText};
      }
      result["statusCode"] = XHR.status;
      aCallback(result, aCallbackForwards);
    }
  };
  XHR.open(aMethod, mug_url + aEndpoint, true);
  XHR.withCredentials = "true";
  //XHR.setRequestHeader("Accept", "application/json");
  try {
    XHR.send(aSendData); // Send actual form data.
  }
  catch (e) {
    aCallback({"success": false, "statusCode": 500, "data": e}, aCallbackForwards);
  }
}

function fetchRockstor(aEndpoint, aMethod, aDataFormat, aSendData, aCallback, aCallbackForwards) {
  var XHR = new XMLHttpRequest();
  XHR.onreadystatechange = function() {
    if (XHR.readyState == 4) {
      // State says we are fully loaded.
      var result = {};
      if (XHR.getResponseHeader("Content-Type") == "application/json") {
        // Got a JSON object, see if we have success.
        result = JSON.parse(XHR.responseText);
      }
      else {
        result = {"success": true, "data": XHR.responseText};
      }
      result["statusCode"] = XHR.status;
      aCallback(result, aCallbackForwards);
    }
  };
  XHR.open(aMethod, "/" + aEndpoint, true);
  if (aDataFormat == "json") { XHR.setRequestHeader("Content-Type", "application/json"); }
  else if (aDataFormat == "form") { XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); }
  //XHR.setRequestHeader("Accept", "application/json");
  // If a csrftoken cookie is set, send a header with the same value.
  csrftoken = getCookieValue("csrftoken");
  if (csrftoken) {
    XHR.setRequestHeader("X-CSRFToken", csrftoken);
  }
  XHR.withCredentials = "true";
  try {
    XHR.send(aSendData); // Send actual form data.
  }
  catch (e) {
    aCallback({"success": false, "statusCode": 500, "data": e}, aCallbackForwards);
  }
}

function getCookieValue(aCookieName) {
  var cmatch = document.cookie.match('(^|;)\\s*' + aCookieName + '\\s*=\\s*([^;]+)');
  return cmatch ? cmatch.pop() : '';
}
