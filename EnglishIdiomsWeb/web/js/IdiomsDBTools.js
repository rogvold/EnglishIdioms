IdiomsDBTools = function(){
    var self = this;
    this.parseAppId = 'Y9LJi7Ti007mowLGEI5mqaAy7BJYtma0D9V4qLP9';
    this.javascriptKey = 'TsXO6KtNqjBUvyw329GYf9vk3t3ClWCYBf1POzS5';
    this.base = [];
    this.visitedList = [];
    this.idiomsSortedBase = {};
    this.currentIdiom = undefined;
    this.checkUpdatesInterval = 5;
    this.successfullyLoadedFromParse = false;
    this.loadingDelay = 8 * 1000;
    
    this.init = function(){
        Parse.initialize(self.parseAppId, self.javascriptKey);
        prepareProgressDiv();
        //        self.loadBase(self.initIdiomsList);
        
        self.loadBaseFromLocalJson(function(){
            //            if (navigator.onLine == true){
            self.loadAllIdioms(function(){
                window.location.href='test.html#listPage';
            });
        //            }
        });
        
    }
    
    this.initIdiomsList = function(){
        self.base = self.getBaseFromLocalStorage();
        var base = self.base;
        //        console.log('base = ');
        //        console.log(base);
        var dict = {};
        for (var k in base){
            var idiom = base[k];
            if (dict[idiom.title] == undefined){
                dict[idiom.title] = {
                    title: idiom.title,
                    description: idiom.description,
                    vimeoIds: [],
                    transcripts: []
                };
                dict[idiom.title].vimeoIds.push(idiom.vimeoId);
                dict[idiom.title].transcripts.push(idiom.transcript);
            }else{
                dict[idiom.title].vimeoIds.push(idiom.vimeoId);
                dict[idiom.title].transcripts.push(idiom.transcript);
            }
        }
        
        self.idiomsSortedBase = dict;
        
        FlurryAgent.logEvent('ListLoaded');
    //        console.log(dict);
    }
    
    this.getIdiomsByTitle = function(t){
        var list = [];
        for (var i in self.base){
            if (self.base[i].title == t){
                list.push(self.base[i]);
            }
        }
        return list;
    }
    
    this.getPrevTitle = function(t){
        var keys = Object.keys(self.idiomsSortedBase);
        if (keys[0] == t){
            return undefined;
        }else{
            for (var i = 1; i < keys.length; i++){
                if (keys[i] == t){
                    return keys[i-1];
                }
            }
        }
        return undefined;
    }
    
    this.getNextTitle = function(t){
        var keys = Object.keys(self.idiomsSortedBase);
        if (keys[keys.length - 1] == t){
            return undefined;
        }else{
            for (var i = 0; i < keys.length - 1; i++){
                if (keys[i] == t){
                    return keys[i+1];
                }
            }
        }
        return undefined;
    }
    
    this.initPrevAdNextButtons = function(){
        $('#prevButton').attr('href', 'javascript: void(0);');
        $('#nextButton').attr('href', 'javascript: void(0);');
        $('#prevButton').addClass('ui-disabled');
        $('#nextButton').addClass('ui-disabled');
        var currentTitle = self.currentIdiom.title;
        var prevName = self.getPrevTitle(currentTitle);
        var nextName = self.getNextTitle(currentTitle);
        var vId = undefined;
        if (prevName != undefined){
            vId = self.getIdiomsByTitle(prevName)[0].vimeoId;
            //            $('#prevButton').attr('href', 'idiom.html?vimeoId='+vId);
            //            $('#prevButton').attr('href', 'javascript: $.cookie(\'data-currentVimeoId\', \'' + vId +'\');" window.history.pushState("", "' + prevName +'", "idiom.html?vimeoId='+vId+'"); iBase.prepareIdiomHtml();');
            $('#prevButton').attr('href', 'javascript: localStorage.setItem(\'data-currentVimeoId\', \'' + vId +'\');  iBase.prepareIdiomHtml();');
            //            $('#prevButton').attr('href', 'javascript: $.cookie(\'data-currentVimeoId\', \'' + vId +'\');  window.location.reload()');
            $('#prevButton').removeClass('ui-disabled');
        }
        if (nextName != undefined){
            vId = self.getIdiomsByTitle(nextName)[0].vimeoId;
            //            $('#nextButton').attr('href', 'idiom.html?vimeoId='+vId);
            //            $('#nextButton').attr('href', 'javascript: $.cookie(\'data-currentVimeoId\', \'' + vId +'\');"  window.history.pushState("", "' + prevName +'", "idiom.html?vimeoId='+vId+'"); iBase.prepareIdiomHtml();');
            $('#nextButton').attr('href', 'javascript: localStorage.setItem(\'data-currentVimeoId\', \'' + vId +'\');  iBase.prepareIdiomHtml(); ');
            //            $('#nextButton').attr('href', 'javascript: $.cookie(\'data-currentVimeoId\', \'' + vId +'\');   window.location.reload()');
            
            $('#nextButton').removeClass('ui-disabled');
        }
    }
    
    this.getIdiomByVimeoId = function(vimeoId){
        return self.base[vimeoId];
    }
    
    this.generateListHtml = function(){
        var s = '';
        var keys = Object.keys(self.idiomsSortedBase);
        for (var k in keys){
            var it = self.idiomsSortedBase[keys[k]];
            var idi0 = self.getIdiomByVimeoId(it.vimeoIds[0]);
            s+= self.generateListItem(idi0.vimeoId, idi0.imgSrc, idi0.title, idi0.description, it.vimeoIds.length);
        }
        //        console.log('list html = ');
        //        console.log(s);
        $('#idiomsList').html(s);
        $("#idiomsList").listview("refresh");
        $("li a img").error(function () {
            $(this).hide(); 
        });
    }
    
    this.generateListItem = function(vimeoId, imgSrc, title, description, number){
        //        var s = '<li><a href="idiom.html?vimeoId=' + vimeoId +'" class="' + ( (self.isVisitedIdiom(vimeoId) == true) ? 'visitedIdiom' : '') +'" >'
        //        var s = '<li><a href="#idiomPage?vimeoId=' + vimeoId +'" class="' + ( (self.isVisitedIdiom(vimeoId) == true) ? 'visitedIdiom' : '') +'" >'
        //        var s = '<li><a onclick="$(\'#idiomName\').attr(\'data-currentVimeoId\', \'' + vimeoId +'\')" href="#idiomPage?vimeoId=' + vimeoId +'" class="' + ( (self.isVisitedIdiom(vimeoId) == true) ? 'visitedIdiom' : '') +'" >'
        var s = '<li><a onclick="localStorage.setItem(\'data-currentVimeoId\', \'' + vimeoId +'\');" data-transition="slide" href="#idiomPage?vimeoId=' + vimeoId +'" class="' + ( (self.isVisitedIdiom(vimeoId) == true) ? 'visitedIdiom' : '') +'" >'
        + '<img src="' + imgSrc +'" class="ui-li-thumb" />'
        + '<h3>' + title +'</h3>'
        + '<p>' +  description + ' ... </p>'
        + '<span class="ui-li-count">' + number +'</span>'
        + '</a>'
        + '</li>';
        return s;
    }
    
    this.getBaseFromLocalStorage = function(){
        self.initVisitedList();
        var base2 = localStorage.getItem('base');
        if (base2 == undefined){
            console.log('base is undefined');
            return {};
        }else{
            base2 = JSON.parse(base2);
        }
        if (typeof base2 == 'string'){
            base2 = JSON.parse(base2);
        }
        return base2;
    }
    
    this.isVisitedIdiom = function(vimeoId){
        for (var i in self.visitedList){
            if (self.visitedList[i] == vimeoId){
                //                console.log(vimeoId + ' is visted');
                return true;
            }
        }
        return false;
    }
    
    this.initVisitedList = function(){
        self.visitedList = [];
        self.visitedList = (localStorage.getItem('visited') == undefined) ? [] : JSON.parse(localStorage.getItem('visited'));
    }
    
    this.makeVisited = function(vimeoId){
        var vl = [];
        var idiom = self.getIdiomByVimeoId(vimeoId);
        var idiomsList = self.getIdiomsByTitle(idiom.title);
        for (var i in idiomsList){
            vl.push(idiomsList[i].vimeoId);
        }
        self.visitedList = union_arrays(self.visitedList, vl);
        localStorage.setItem('visited', JSON.stringify(self.visitedList));
    }
    
    this.loadBaseFromLocalJson = function(callback){
        if (localStorage.getItem('base') != undefined){
            console.log('launcing callback');
            callback();
            return;
        }
        $.ajax({
            url:'json/localDB.json',
            dataType: 'json',
            success: function(data){
                //                data = JSON.parse(data);
                //                self.base = self.getBaseFromLocalStorage();
                localStorage.setItem('base', JSON.stringify(data));
                callback();
            }
        });
    }
    
    this.prepareIdiomHtml = function(){
        console.log('prepareIdiomHtml occured');
        //        var vimId = gup('vimeoId');
        //        var vimId = $('#idiomName').attr('data-currentVimeoId').trim();
        //        var vimId = $.cookie('data-currentVimeoId');
        var vimId = localStorage.getItem('data-currentVimeoId');
        
        console.log('vimId = ' + vimId);
        self.base = self.getBaseFromLocalStorage();
        self.initIdiomsList();
        self.currentIdiom = self.getIdiomByVimeoId(vimId);
        //        console.log(self.currentIdiom);
        var d = self.idiomsSortedBase[self.currentIdiom.title];
        $('.idiomName').text(self.currentIdiom.title);
        $('#description').text(self.currentIdiom.description);
        var sh = '';
        console.log('d = ');
        console.log(d);
        console.log('d.vimeoIds:');
        console.log(d.vimeoIds);
        for (var i in d.vimeoIds){
            var vId = d.vimeoIds[i];
            var tr = d.transcripts[i];
            //            var w = Math.floor($('.ui-body.ui-body-a').width());
            var w = Math.floor(Math.floor($(window).width()) * 0.8);
            
            var h = Math.floor(0.75 * w);
            console.log('w = ' + w + '; h = ' + h);
            var iframeHtml = '<iframe src="http://player.vimeo.com/video/' + vId +'"  frameborder="0" style="width: ' + w + 'px; height: '+ h +'px;" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>';
            var h = '<div class="ui-body ui-body-a"> <center> ' + iframeHtml + ' </center><p class="transcript">' + tr + '</p> </div>';
            sh+=h;
        }
        console.log(sh);
        //        $('#examplesPanel').append(sh);
        $('#examplesBlock').html(sh);
        
        $('#idiomPage').trigger('create');
        
        self.initPrevAdNextButtons();
        self.makeVisited(vimId);
        
        FlurryAgent.logEvent('IdiomLoaded',{
            vimeoId: vimId
        });
    }
    
    this.loadBase = function(callback){
        self.loadBaseFromLocalJson(function(){
            if (navigator.onLine == true){
                self.loadAllIdioms(callback);
            }
        });
    }
    
    this.getIdiomFromParseItem = function(parseItem){
        var idiom = {
            vimeoId: parseItem.get('vimeoId'),
            title: parseItem.get('title'),
            description: parseItem.get('description'),
            transcript: parseItem.get('transcript'),
            imgSrc: parseItem.get('imgSrc')
        }
        return idiom;
    }
    
    this.saveIdiomToLocalStorage = function(idiom){
        var base = self.getBaseFromLocalStorage();
        base[idiom.vimeoId] = idiom;
        self.base = base;
        base = JSON.stringify(base);
        localStorage.setItem('base', base);
    }
    
    this.saveIdiomsToLocalStorage = function(list){
        for (var i in list){
            self.saveIdiomToLocalStorage(list[i]);
        }
    }
    
    this.getIdiomsListFromParseIdiomsList = function(parseIdiomsList){
        var list = [];
        for (var i in parseIdiomsList){
            list.push(self.getIdiomFromParseItem(parseIdiomsList[i]));
        }
        return list;
    }
    
    this.shouldLoadIdiomsFromParse = function(){
        var t = getIntFromLocalStorage('launchNumber');
        if (t % self.checkUpdatesInterval == 0){
            return true;
        }
        return false;
    }
    
    this.incrementLaunchNumber = function(){
        var t = getIntFromLocalStorage('launchNumber');
        t++;
        localStorage.setItem('launchNumber', t);
    }
    
    this.loadAllIdioms = function(callback){
        
        setTimeout(function(){
            if(typeof callback == 'function') {
                callback();
            }
        }, self.loadingDelay);
        
        if (self.shouldLoadIdiomsFromParse() == false){
            self.incrementLaunchNumber();
            return;
        }
        self.incrementLaunchNumber();
        
        
        var Idiom = Parse.Object.extend("Idiom");
        var query = new Parse.Query(Idiom);
        query.ascending("title");
        query.limit(1000);
        query.find().then(function(idioms){
            self.successfullyLoadedFromParse = true;
            var list = self.getIdiomsListFromParseIdiomsList(idioms);
            self.saveIdiomsToLocalStorage(list);
            
            if(typeof callback == 'function')
            {
                callback();
            }
        });
    }
    
    this.prepareSettingsPage = function(){
        if (localStorage.getItem('email') != undefined){
            $('#email').val(localStorage.getItem('email'));
        }
        if (localStorage.getItem('feedback') != undefined){
            $('#feedback').val(localStorage.getItem('feedback'));
        }
        Parse.initialize(self.parseAppId, self.javascriptKey);
        $('#emailButton').click(function(){
            var userEmail = $('#email').val().trim();
            if (!validateEmail(userEmail)){
                $("#emailPopup").html('<h2>Email is incorrect!</h2>');
                $("#emailPopup").popup('open');
                return;
            }
            console.log('email clicked');
            var MobileEmail = Parse.Object.extend("MobileEmail");
            var email = new MobileEmail();
            email.set('email', userEmail);
            email.save().then(function(){
                $("#emailPopup").html('<h2>Thank you!</h2>');
                $("#emailPopup").popup('open');
                localStorage.setItem('email', userEmail);
                FlurryAgent.logEvent('EmailSent');
            });
        });
        $('#feedbackButton').click(function(){
            var userFeedback = $('#feedback').val().trim();
            if (userFeedback == undefined || userFeedback == ''){
                $("#emailPopup").html('<h2>Feedback is empty</h2>');
                $("#emailPopup").popup('open');
                return;
            }
            console.log('feedback clicked');
            var MobileFeedback = Parse.Object.extend("MobileFeedback");
            var feedback = new MobileFeedback();
            feedback.set('message', userFeedback);
            feedback.set('email', localStorage.getItem('email'));
            feedback.save().then(function(){
                $("#emailPopup").html('<h2>Thank you!</h2> <p>Your opinion is very important for us.</p>');
                $("#emailPopup").popup('open');
                localStorage.setItem('feedback', userFeedback);
                FlurryAgent.logEvent('FeedbackSent');
            });
        });
        console.log('settings page is prepared');
    }
    
}

function gup(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
    var regexS = "[\\?&]"+name+"=([^&#]*)";  
    var regex = new RegExp( regexS );  
    var results = regex.exec( window.location.href ); 
    if( results == null )    return "";  
    else    return results[1];
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

function getIntFromLocalStorage(name){
    var s = localStorage.getItem(name);
    //    var s = $.cookie(name);
    if (s == undefined){
        localStorage.setItem(name, 0);
        return 0;
    }
    return parseInt('' + s);
}

function union_arrays (x, y) {
    var obj = {};
    var i = 0;
    for (i = x.length-1; i >= 0; -- i)
        obj[x[i]] = x[i];
    for (i = y.length-1; i >= 0; -- i)
        obj[y[i]] = y[i];
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k))  // <-- optional
            res.push(obj[k]);
    }
    return res;
}

global_percent = 0;

function prepareProgressDiv(){
    $('<input>').appendTo('#progressDiv').attr({
        'name':'slider',
        'id':'slider',
        'data-highlight':'true',
        'min':'0',
        'max':'100',
        'value':'0'
    //        ,
    //        'type':'range'
    }).slider({
        create: function( event, ui ) {
            $(this).parent().find('input').hide();
            $(this).parent().find('input').css('margin-left','-9999px'); // Fix for some FF versions
            $(this).parent().find('.ui-slider-track').css('margin','0 15px 0 15px');
            $(this).parent().find('.ui-slider-handle').hide();
            
            var percent_interval = setInterval(function(){
                global_percent++;
                progressBar.setValue('#slider',global_percent * 1.5)
                if(global_percent === 100) {
                    clearInterval(percent_interval);
                }
            }, 100);
        }
    }).slider("refresh");     
}

var progressBar = {
    setValue:function(id, value) {
        $(id).val(value);
        $(id).slider("refresh");
    }
}