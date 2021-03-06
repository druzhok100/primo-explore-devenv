var modRewrite = require('connect-modrewrite');
var fs = require('fs')
var Promise = require("bluebird");
var concat = require('concat-stream');
var config = require('./config');
var glob = require('glob');
Promise.promisifyAll(glob);
var Response = require('http-response-object');

module.exports.getCustimazationObject = function (vid) {


    var basedir = 'primo-explore/custom';
    var ignored = ['img', 'css', 'custom'];
    var base_path = 'custom/';
    var customizationObject = {
        viewJs: '',
        viewCss: '',
        centralCss: '',
        favIcon: '',
        libraryLogo: '',
        resourceIcons: '',
        homepageHtml: ''
    };
    var promises = [];
    var packages = glob.sync(base_path + "*", {cwd:'primo-explore',ignore:'**/README.md'});

    var isInherited = packages.indexOf(base_path + 'CENTRAL_PACKAGE') > -1;
    if(vid !== ''){
        var viewPackage = base_path + vid;
    }
    if(vid === '') {
        var viewPackage = packages.filter((package) => package !== base_path + 'CENTRAL_PACKAGE');
    }


    viewPackage = viewPackage || viewPackage[0];
    console.log(viewPackage);
    if(viewPackage.length ===0 ){
        viewPackage = '';
    }
    //js

    if(viewPackage !== '') {
        customizationObject.viewJs = glob.sync(viewPackage + "/js/custom.js", {cwd: 'primo-explore'});
    }

    //css


    customizationObject.viewCss = glob.sync(viewPackage + "/css/custom1.css", {cwd:'primo-explore'});

    if (isInherited) {
        customizationObject.centralCss = glob.sync(base_path + 'CENTRAL_PACKAGE' + "/css/custom1.css", {cwd:'primo-explore'})
    }

    //images

    customizationObject.favIcon = glob.sync(viewPackage + "/img/favicon.ico", {cwd:'primo-explore'});


    if (isInherited && customizationObject.favIcon === '') {
        customizationObject.favIcon = glob.sync(base_path + 'CENTRAL_PACKAGE' + "/img/favicon.ico", {cwd:'primo-explore'})
    }

    customizationObject.libraryLogo = glob.sync(viewPackage + "/img/library-logo.png", {cwd:'primo-explore'})[0];

    if (isInherited && customizationObject.logo === '') {
        customizationObject.libraryLogo = glob.sync(base_path + 'CENTRAL_PACKAGE' + "/img/library-logo.png", {cwd:'primo-explore'});
    }

    var paths = glob.sync(viewPackage + "/img/icon_**.png", {cwd:'primo-explore'});
    customizationObject.resourceIcons = {};
    for (path of paths) {
        var pathFixed = path.substring(path.indexOf('/img/icon_') + 10, path.indexOf('.png'));
        customizationObject.resourceIcons[pathFixed] = path;
    }


    if (isInherited) {
        var paths = glob.sync(base_path + 'CENTRAL_PACKAGE' + "/img/icon_**.png", {cwd:'primo-explore'});

        for (path of paths) {
            var pathFixed = path.substring(path.indexOf('/img/icon_') + 10, path.indexOf('.png'));
            if (!customizationObject.resourceIcons[pathFixed]) {
                customizationObject.resourceIcons[pathFixed] = path;
            }
        }


    }

    //html
    var paths = glob.sync(viewPackage + "/html/home_**.html", {cwd:'primo-explore'});

    customizationObject.homepageHtml = {};
    for (path of paths) {
        var pathFixed = path.substring(path.indexOf('/html/home_')+11, path.indexOf('.html'));
        customizationObject.homepageHtml[pathFixed] = path;
    }


    if (isInherited) {
        var paths = glob.sync(base_path + 'CENTRAL_PACKAGE' + "/html/home_**.html", {cwd:'primo-explore'});

        for (path of paths) {
            var pathFixed = path.substring(path.indexOf('/html/home_')+11, path.indexOf('.html'));
            if (!customizationObject.homepageHtml[pathFixed]) {
                customizationObject.homepageHtml[pathFixed] = path;
            }

        }


    }

    return customizationObject;
}


module.exports.proxy_function = function () {
    var proxyServer = config.PROXY_SERVER;
    var res = new Response(200, {'content-type': 'text/css'}, new Buffer(''), '');
    


    
    return modRewrite([
        '/primo_library/libweb/webservices/rest/(.*) ' + proxyServer + '/primo_library/libweb/webservices/rest/$1 [PL]',
        '/primo_library/libweb/primoExploreLogin ' + proxyServer + '/primo_library/libweb/primoExploreLogin [PL]',
        '/primo-explore/index.html ' + proxyServer + '/primo-explore/index.html [PL]',
        /*'/primo-explore/img/library-logo.png ' + customizationObject.libraryLogo[0].replace('primo-explore', '') + ' [L]',
        '/primo-explore/img/favicon.ico ' + customizationObject.favIcon[0].replace('primo-explore', '') + ' [L]',
        '/primo-explore/img/favicon.ico ' + customizationObject.favIcon[0].replace('primo-explore', '') + ' [L]',*/
        '/primo-explore/custom/(.*) /custom/$1 [L]',
        '/primo-explore/(.*) ' + proxyServer + '/primo-explore/$1 [PL]',
        '.*primoExploreJwt=.* /index.html [L]',
        '^[^\\.]*$ /index.html [L]'
    ]);


};
