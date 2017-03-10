/* eslint-disable */
// var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
import { XMLHttpRequest } from 'xmlhttprequest';
import { parseString } from 'xml2js';

// var parseString = require('xml2js').parseString;

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

function translateXMLResponse(xml) {
  return new Promise(function(resolve, reject) {
    parseString(xml, function (err, result) {
      console.log(result);
      resolve(result);
      // return result;
    });
  });
}

export default function soapCall(url, ns, methodName, args) {
  return new Promise(function(resolve, reject) {
    var xhr = createCORSRequest('POST', url);

    // build SOAP request
    var soapRequest =
  `<?xml version="1.0" encoding="UTF-8"?>
  <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="${ns}">
    <SOAP-ENV:Body>
      <ns1:${methodName}>`;

    // Include all arguments in a request
    for(var key in args) {
      soapRequest += `      <ns1:${key}>${args[key]}</ns1:${key}>`;
    }

    soapRequest +=
  `    </ns1:${methodName}>
    </SOAP-ENV:Body>
  </SOAP-ENV:Envelope>`;

    xhr.onreadystatechange = function() {
      // console.log(xhr);
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          // console.log(xhr.responseText);
          translateXMLResponse(xhr.responseText).then(function(response) {
            resolve(response);
          });
          // return xhr.responseText;
        } else {
          reject(xhr.statusText);
        }
      }
    }
    // Send the POST request
    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    // xhr.setRequestHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Origin');
    // xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(soapRequest);
  });
}
