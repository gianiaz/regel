#! ./node_modules/phantomjs/bin/phantomjs --ignore-ssl-errors=true

Regel = {

    debug: false,
    debugLevel: null,
    config: null,
    fs: null,
    env: false,
    webPage: null,
    dataJson: null,
    version: '0.2',
    timeOutPointer: false,
    toReport: [],
    logLevels: {
        'VERBOSE': 3,
        'INFO': 2,
        'ERRORS': 1,
    },

    init: function(env, debug, debugLevel){

        if(typeof(debugLevel) === 'undefined'){
            debugLevel = this.logLevels.ERRORS;
        }
        this.debugLevel = debugLevel;

        if(typeof(debug) !== 'undefined'){
            this.debug = debug;
        }

        this.fs = require("fs");
        this.env = env;
        if(!this.fs.isDirectory('messages')){
            this.fs.makeDirectory('messages');
        }
        this.readConfig();

        this.initPhantomJS(this.config.url);

    },

    initPhantomJS: function(url){

        this._log('initPhantomJS: ' + url);

        var self = this;
        //
        this.webPage = require('webpage').create();

        this.webPage.viewportSize = {
            width: 1920,
            height: 1280
        };

        this.webPage.onConsoleMessage = function(msg){
            self._log(msg, self.logLevels.VERBOSE);
        };

        this.webPage.onResourceError = function(resourceError){
            self._log(resourceError.url + ' -  ' + resourceError.errorString, self.logLevels.ERRORS);
        };

        this.webPage.onLoadFinished = function(status){
            self._log('caricato ' + self.webPage.frameUrl + ' : ' + status);
            //if (status === 'success') {
            self._takeScreenShot(status);

            if(status === 'success'){
                self.webPage.includeJs('https://code.jquery.com/jquery-3.2.1.min.js', function(){

                    switch (self.webPage.frameUrl) {
                        case 'https://soic80400n.regel.it/login/':
                            self.doLogin().bind(self);
                            break;
                        case 'https://soic80400n.regel.it/':
                            self._log('Passo ad aprire la pagina delle comunicazioni, attendi 3 secodni');
                            clearTimeout(self.timeOutPointer);
                            self.timeOutPointer = setTimeout(function(){
                                self.webPage.open('https://soic80400n.regel.it/diario/pagine/comunicazioni.php?auth=');
                            }, 3000);
                            break;
                        case 'https://soic80400n.regel.it/diario/pagine/comunicazioni.php?auth=':
                            self.getComunicazioni().bind(self);
                            break;
                        default:
                    }

                });


            } else {
                self._log('Problemi di connettività, esco');
                phantom.exit();
            }


        };

        block_urls = ['gstatic.com', 'googleapis.com', 'google-analytics.com', 'tawk.to', 'perdeta.net', 'facebook.net', 'facebook.com', 'myfonts.net', 'data:image'];

        this.webPage.onResourceRequested = function(requestData, request){
            self._log('REQUEST: ' + requestData.url, self.logLevels.VERBOSE);
            for (url in block_urls) {
                if(requestData.url.indexOf(block_urls[url]) !== -1){
                    request.abort();
                    self._log('ABORTED', self.logLevels.VERBOSE);
                    return;
                }
            }
        };

        this.webPage.open(url);

    },

    readConfig: function(){
        this.config = JSON.parse(this.fs.read('config.' + this.env + '.json'));

        if(!this.fs.isFile(this.config.historyFile)){
            this.fs.write(this.config.historyFile, '[]', 'w');
        }
        this.config.history = JSON.parse(this.fs.read(this.config.historyFile));
        this.dataJson = JSON.stringify(this.config);

        this._log('Version: ' + this.version);
        this._log('Caricato file di config');
    },

    doLogin: function(){
        var self = this;
        this.webPage.evaluate(function(s){
            var dataJson = JSON.parse(s);
            var $loginForm = $('form');
            $loginForm.find('[name="CRED_UTENTE"]').val(dataJson.user);
            $loginForm.find('[name="CRED_PSWD"]').val(dataJson.pass);
            $loginForm.find('button:contains(Login)').click();
        }, this.dataJson);
        self._log('Eseguo il login');
    },

    getComunicazioni: function(){
        var self = this;
        var returnData = this.webPage.evaluate(function(s){
            var dataJson = JSON.parse(s);
            var toReport = [];
            var data = [];
            var logs = [];
            $('table tr').each(function(){
                var $tr = $(this);
                var $firstth = $tr.find('th:first');
                var idTH = $firstth.attr('id');
                if(idTH){
                    var record = {
                        'id': idTH.replace('time', ''),
                        'data': $firstth.find('span:visible').text(),
                        'author': $tr.find('th:eq(1)').text(),
                        'oggetto': $tr.find('th:eq(2)').text()
                    };
                    data.push(record);
                }
            });

            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if($.inArray(record.id, dataJson.history) === -1){
                    toReport.push(record);
                    logs.push('Da notificare: "' + record.oggetto + '"')
                } else {
                    logs.push('già notificata: "' + record.oggetto + '"')
                }
            }

            var returnData = {};

            returnData.logs = logs;
            returnData.toReport = toReport;

            return returnData;

        }, this.dataJson);

        for (var i = 0; i < returnData.logs.length; i++) {
            this._log(returnData.logs[i], self.logLevels.VERBOSE);
        }


        this.toReport = returnData.toReport;

        this._log(JSON.stringify(this.toReport), this.logLevels.VERBOSE);

        self.writeQueue();

        phantom.exit();

    },

    writeQueue: function(){

        this._log('writeQueue');

        this._log(this.toReport.length + ' comunicazioni da mettere in coda');

        for (var i = 0; i < this.toReport.length; i++) {
            var message = this.toReport[i];
            var outFile = 'messages/' + message.id + '.queue';
            this._log('Scrivo il file ' + outFile, this.logLevels.VERBOSE);

            this._log(message, this.logLevels.VERBOSE);


            if(this.fs.isFile(outFile)){
                this._log('File ' + outFile + ' già presente');
            }

            this.config.history.push(message.id);

            this.fs.write(outFile, JSON.stringify(message, null, 2), 'w');

        }

        this.fs.write(this.config.historyFile, JSON.stringify(this.config.history, null, 2), 'w');


    },

    _log: function(msg, level){

        if(typeof(level) === 'undefined'){
            level = this.logLevels.INFO;
        }

        if(this.debug && this.debugLevel >= level){
            console.log(msg);
        }

    },
    _getName: function(){
        var urlParts = this.webPage.frameUrl.split('/');
        var name = false;
        while (!name) {
            name = urlParts.pop();
        }
        return name;
    },
    _takeScreenShot: function(status){
        if(this.debug){
            if(typeof(status) === 'undefined'){
                status = 'unknown';
            }
            if(!this.fs.isDirectory('screen')){
                this.fs.makeDirectory('screen');
            }
            var name = this._getName();
            var screenFileName = 'screen/' + name + '-' + status + '.png';
            this.webPage.render(screenFileName);
            this._log('Screenshot acquisito: ' + screenFileName);
        }
    }
};

Regel.init('develop', true, 2);

