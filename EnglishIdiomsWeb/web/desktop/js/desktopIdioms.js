IdiomsApp = function(){
    var self = this;
    this.idioms = [];
    this.idiometers = [];
    this.currentIdiom = undefined;
    this.currentVidemoId = undefined;
    this.baseList = [];
    this.currentIdiomNumber = undefined;
    this.visitedList = [];
    this.selectedLang = undefined;
    this.idiomsNameList = [];
    this.answeredIdiometersVimeoIds = [];
    
    this.rightAnsweredVimeoIds = [];
    this.wrongAnsweredVimeoIds = [];
    
    this.parseAppId = 'Y9LJi7Ti007mowLGEI5mqaAy7BJYtma0D9V4qLP9';
    this.javascriptKey = 'TsXO6KtNqjBUvyw329GYf9vk3t3ClWCYBf1POzS5';
    
    this.selectedIdiometerVimeoId = undefined;
    this.selectedIdiometerRightAnswer = '';
    
    this.init = function(){
        console.log('init occured');
        self.initGlobLang();
    //        self.loadIdioms();
    }
    
    this.initParse = function(){
        Parse.initialize(self.parseAppId, self.javascriptKey);
    }
    
    this.initAnsweredIdiometersList = function(){
        if (localStorage.getItem('answeredIdiometers') == undefined){
            localStorage.setItem('answeredIdiometers', JSON.stringify([]));
        }
        self.answeredIdiometersVimeoIds = ( (localStorage.getItem('answeredIdiometers') == undefined  || localStorage.getItem('answeredIdiometers') == "") ? [] : JSON.parse(localStorage.getItem('answeredIdiometers')));
        console.log('selfself.answeredIdiometersVimeoIds = ');
        console.log(self.answeredIdiometersVimeoIds);
    
        if (localStorage.getItem('rightAnsweredVimeoIds') == undefined){
            localStorage.setItem('rightAnsweredVimeoIds', JSON.stringify([]));
        }
        self.rightAnsweredVimeoIds = ((localStorage.getItem('rightAnsweredVimeoIds') == undefined || localStorage.getItem('rightAnsweredVimeoIds') == "") ? [] : JSON.parse(localStorage.getItem('rightAnsweredVimeoIds')));
    
        if (localStorage.getItem('wrongAnsweredVimeoIds') == undefined){
            localStorage.setItem('wrongAnsweredVimeoIds', JSON.stringify([]));
        }
        self.wrongAnsweredVimeoIds = ((localStorage.getItem('wrongAnsweredVimeoIds') == undefined  || localStorage.getItem('wrongAnsweredVimeoIds') == "") ? [] : JSON.parse(localStorage.getItem('wrongAnsweredVimeoIds')));
   
    }
    
    this.isAnsweredIdiometer = function(vimeoId){
        if (vimeoId == undefined){
            return undefined;
        }
        var list = self.answeredIdiometersVimeoIds;
        for (var i in list){
            if (list[i] == vimeoId){
                return true;
            }
        }
        return false;
    }
    
    this.isRightAnsweredIdiometer = function(vimeoId){
        if (vimeoId == undefined){
            return undefined;
        }
        var list = self.rightAnsweredVimeoIds;
        for (var i in list){
            if (list[i] == vimeoId){
                return true;
            }
        }
        return false;
    }
    
    this.isWrongAnsweredIdiometer = function(vimeoId){
        if (vimeoId == undefined){
            return undefined;
        }
        var list = self.wrongAnsweredVimeoIds;
        for (var i in list){
            if (list[i] == vimeoId){
                return true;
            }
        }
        return false;
    }
    
    this.addVimeoIdToAnsweredList = function(vimeoId){
        console.log('addVimeoIdToAnsweredList occured; vimeoId = ' + vimeoId);
        self.answeredIdiometersVimeoIds.push(vimeoId);
        localStorage.setItem('answeredIdiometers', JSON.stringify(self.answeredIdiometersVimeoIds));
    }
    
    this.addVimeoIdToRightAnsweredList = function(vimeoId){
        self.rightAnsweredVimeoIds.push(vimeoId);
        localStorage.setItem('rightAnsweredVimeoIds', JSON.stringify(self.rightAnsweredVimeoIds));
    }
    
    this.addVimeoIdToWrongAnsweredList = function(vimeoId){
        self.wrongAnsweredVimeoIds.push(vimeoId);
        localStorage.setItem('wrongAnsweredVimeoIds', JSON.stringify(self.wrongAnsweredVimeoIds));
    }
    
    this.prepareRussian = function(){
        
        $('#ruDescription').hide();
        $('.ruTranscript').hide();
        if (self.selectedLang == 'ru'){
            $('#ruDescription').show();
            $('.ruTranscript').show();
            //            $('.ruTranscript').css('display', 'block !important;');
            //            $('.ruTranscript').removeClass('ruTranscript');
            console.log('setting ru transcript');
        }
    }
    
    this.prepareBaseList = function(list){
        var dict = {};
        for (var k in list){
            var idiom = list[k];
            self.idiomsNameList.push(idiom.title);
            if (dict[idiom.title] == undefined){
                dict[idiom.title] = {
                    title: idiom.title,
                    description: idiom.description,
                    ruDescription: idiom.ruDescription,
                    vimeoIds: [],
                    transcripts: [],
                    imgSrcs: [],
                    ruTranscripts: [],
                    imgSrc: idiom.imgSrc,
                    examplesHtml: '',
                    letter: idiom.title.toLowerCase()[0]
                };
                dict[idiom.title].vimeoIds.push(idiom.vimeoId);
                dict[idiom.title].transcripts.push(idiom.transcript);
                dict[idiom.title].ruTranscripts.push(idiom.ruTranscript);
                dict[idiom.title].imgSrcs.push(idiom.imgSrc);
            }else{
                dict[idiom.title].vimeoIds.push(idiom.vimeoId);
                dict[idiom.title].transcripts.push(idiom.transcript);
                dict[idiom.title].ruTranscripts.push(idiom.ruTranscript);
                dict[idiom.title].imgSrcs.push(idiom.imgSrc);
            }
        }
        var keys = Object.keys(dict);
        self.baseList = [];
        for (var i in keys){
            self.baseList.push(dict[keys[i]]);
        }
        for (var i in self.baseList){
            self.baseList[i].examplesHtml = self.getExamplesHtml(self.baseList[i]);
        }
    }
    
    this.initGlobLang = function(){
        if (localStorage.getItem('lang') == undefined){
            localStorage.setItem('lang', 'ru');
            self.selectedLang = 'ru';
        }
        $.getJSON('http://freegeoip.net/json/', function(location) {
            var code = (location.country_code == undefined) ? 'en': location.country_code.toLowerCase();
            localStorage.setItem('lang', code);
            self.selectedLang = code;
        });
    }
    
    this.initPlayButton = function(){
        $('.playButton').on('click', function(){
            var res = '';
            var w = parseFloat(($(this).attr('data-w')));
            var h = parseFloat(($(this).attr('data-h')));
            var vId = $(this).attr('data-vimeoId');
            var num = parseInt($(this).attr('data-transcriptNum'));
            var tr = self.currentIdiom.transcripts[num];
            var iframeHtml0 = ' <center> <iframe src="http://player.vimeo.com/video/' + vId +'?autoplay=1"  frameborder="0" style="margin-bottom: 20px; width: ' + w + 'px; height: '+ h +'px;" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe></center> <p class="transcript">' + tr + '</p> ';
            
            $('#examplesItem' + num).html(iframeHtml0);
        });
    }
    
    this.loadIdiometersFromParse = function(){
        self.initParse();
        var Idiom = Parse.Object.extend("Idiom");
        var query = new Parse.Query(Idiom);
        query.equalTo("idiomType", 'idiometer');
        query.ascending('createdAt');
        query.find().then(function(idioms) {
            self.idiometers = self.getIdiomsListFromParseIdiomsList(idioms);
            self.initAnsweredIdiometersList();
            self.generateIdiometerListHtml();
            self.initAnswerButton();
            
            $.ajax({
                url: '../json/localBase.json',
                dataType: 'json',
                success: function(data){
                    var list = data;
                    list.sort(function(a,b) {
                        if (a.title.toLowerCase() > b.title.toLowerCase() ) return 1;
                        if (a.title.toLowerCase() < b.title.toLowerCase() ) return -1;
                        return 0;
                    } );
                    self.generateIdiometerAnswersHtml(list);
                }
            });
        });
    }
    
    this.getIdiomFromParseItem = function(parseItem){
        var idiom = {
            vimeoId: parseItem.get('vimeoId'),
            title: parseItem.get('title'),
            description: parseItem.get('description'),
            transcript: parseItem.get('transcript'),
            imgSrc: parseItem.get('imgSrc'),
            ruTranscript: parseItem.get('ruTranscript'),
            ruDescription: parseItem.get('ruDescription')
        }
        return idiom;
    }
    
    this.getIdiomsListFromParseIdiomsList = function(parseIdiomsList){
        var list = [];
        for (var i in parseIdiomsList){
            list.push(self.getIdiomFromParseItem(parseIdiomsList[i]));
        }
        return list;
    }
    
    this.getExamplesHtml = function(item){
        var d = item;
        var sh = '';
        for (var i in d.vimeoIds){
            var vId = d.vimeoIds[i];
            var tr = d.transcripts[i];
            var ruTr = d.ruTranscripts[i];
            //            var w = Math.floor(Math.floor($(window).width()) * 0.8);
            //            var h = Math.floor(0.75 * w);
            var w = '500';
            var h = '375';
            //            console.log('w = ' + w + '; h = ' + h);
            var iframeHtml0 = '<iframe src=\"http://player.vimeo.com/video/' + vId +'\"  frameborder=\"0\" style="width: ' + w + 'px; height: '+ h +'px;" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>';
            var hh = '<div class="ui-body ui-body-a" id="examplesItem' + i +'" > <center> ' + iframeHtml0+ ' </center><p class="transcript">' + tr + '</p> <p class="transcript ruTranscript">' + ruTr +'</p> </div>';
            sh+=hh;
        }
        //        console.log(sh);
        return sh;
    }
  
    this.loadIdioms = function(callback){
        $.ajax({
            url: '../json/localBase.json',
            dataType: 'json',
            success: function(data){
                var list = data;
                list.sort(function(a,b) {
                    if (a.title.toLowerCase() > b.title.toLowerCase() ) return 1;
                    if (a.title.toLowerCase() < b.title.toLowerCase() ) return -1;
                    return 0;
                } );
                self.idioms = list;
                self.prepareBaseList(list);
                self.generateListHtml();
                self.updateIdiomsList();
                
                //clicking on the first idiom
                self.currentIdiomNumber = 0; 
                self.initCurrentIdiom();
                
                setTimeout(function(){
                    self.makeDemo();
                }, 1000);
            }
        });
    }
    
    this.getLetterRangeIndexes = function(letter){
        var list = self.baseList;
        var f1 = false;
        var i1 = -1;
        var i2 = -1;
        for (var i in list){
            if (list[i].letter == letter && (f1 == false)){
                f1 = true;
                i1 = i;
            }
            if ((f1 == true) && (list[i].letter != letter)){
                i2 = i;
                break;
            }
            if ((f1 == true) && (i == list.length - 1)){
                i2 = list.length - 1;
            }
        }
        return [i1, i2];
    }
    
    this.initVisitedList = function(){
        self.visitedList = [];
        self.visitedList = (localStorage.getItem('visited') == undefined) ? [] : JSON.parse(localStorage.getItem('visited'));
    }
    
    this.updateIdiomsList = function(){
        self.initVisitedList();
        //        console.log('updateIdiomsList');
        var visited = self.visitedList;
        for (var i in visited){
            var title = visited[i];
            //            console.log(title);
            $('li[data-title="' + title +'"] a').addClass('visitedIdiom');
        }
    }
    
    this.makeVisited = function(title){
        var vl = [title];
        self.visitedList = union_arrays(self.visitedList, vl);
        localStorage.setItem('visited', JSON.stringify(self.visitedList));
    }
    
    this.generateListHtml = function(){
        var list = self.baseList;
        var s = '';
        var al = 'abcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < 26; i++){
            var letter = al[i];
            var range = self.getLetterRangeIndexes(letter);
            //            console.log('range for letter ' + letter + ' is ');
            //            console.log(range);
            if (range[0] == -1){
                continue;
            }
            var letterHtml = '<li style="text-align: center; background-color: burlywood; "><strong>' + letter.toUpperCase() +'</strong></li>';
            var lHtml = '';
            var i1 = parseInt(range[0]);
            var i2 = parseInt(range[1]);
            for (var j = i1; j < i2; j++){
                lHtml+= self.generateListItemHtml(self.baseList[j].vimeoId, self.baseList[j].imgSrc, self.baseList[j].title,  self.baseList[j].description, j, self.baseList[j].vimeoIds.length);
            }
            //            console.log(letterHtml);
            //            console.log(lHtml);
            s = s + letterHtml + lHtml;
        }
        $('#idiomsList').html(s);
    }
    
    this.initCurrentIdiom = function(){
        var num = self.currentIdiomNumber;
        self.currentIdiom = self.baseList[num];
        $('.idiomName').text(self.currentIdiom.title);
        $('#description').text(self.currentIdiom.description);
        $('#ruDescription').text(self.currentIdiom.ruDescription);
        
        setTimeout(function(){
            $('#examplesBlock').html(self.currentIdiom.examplesHtml);
            self.initPlayButton();
            self.prepareRussian();
        }, 100);
        self.initPrevAdNextButtons();
        self.makeVisited(self.currentIdiom.title);
        self.updateIdiomsList();
        $('#idiomBlock').show();
        
        $('#idiomsList li').removeClass('selectedIdiom');
        $('#idiomsList li[data-num=' + num +']').addClass('selectedIdiom');
        
    //        console.log(self.currentIdiom);
    }
    
    this.generateListItemHtml = function(vimeoId, imgSrc, title, description, number, labelNumber){
        var s = '<li  class="ui-li-has-count ui-li-has-thumb" data-title="' + title +'" onclick="idiomsApp.currentIdiomNumber=' + number +'; idiomsApp.initCurrentIdiom();" data-num="' + number +'" ><a class="ui-btn ui-btn-icon-right ui-icon-carat-r visitedIdiom" data-transition="slide" href="javascript: void(0);" >'
        + '<img src="' + imgSrc +'" class="ui-li-thumb" />'
        + '<h3>' + title +'</h3>'
        + '<p>' +  description + ' ... </p>'
        + '<span class="ui-li-count">' + labelNumber +'</span>'
        + '</a>'
        + '</li>';
        return s;
    }
    
    this.generateIdiometerListItem = function(title, vimeoId, imgSrc){
        var answeredClass= (self.isAnsweredIdiometer(vimeoId) == true) ? 'answeredIdiometer' : '';
        var isAnswered = self.isAnsweredIdiometer(vimeoId);
        var isRightAnswered = isAnswered && self.isRightAnsweredIdiometer(vimeoId);
        var isWrongAnswered = isAnswered && self.isWrongAnsweredIdiometer(vimeoId);
        
        if (isAnswered){
            $('#scoreBlock').show();
            $('#rightAnsweresNumber').text(self.rightAnsweredVimeoIds.length);
            $('#wrongAnsweresNumber').text(self.wrongAnsweredVimeoIds.length);
        }
        
        var s = '<li  class="ui-li-has-count ui-li-has-thumb idiometerItem" data-vimeoId="' + vimeoId +'" data-title="' + title +'"  ><a class="ui-btn ui-btn-icon-right ui-icon-carat-r  ' + answeredClass + ((isRightAnswered == true) ? ' rightAnswered ' : ' ') + ((isWrongAnswered == true) ? ' wrongAnswered ' : ' ') + '" data-vimeoId="' + vimeoId +'" data-title="' + title +'"  href="javascript: void(0);" >'
        + '<img src="' + imgSrc +'" class="ui-li-thumb" />'
        + '<h3>' + ((isAnswered == true) ? title : ' ? ' ) +'</h3>'
        //        + '<p>' +  description + ' ... </p>'
        //        + '<span class="ui-li-count">' + labelNumber +'</span>'
        + '</a>'
        + '</li>';
        return s;
    }
    
    this.generateIdiometerAnswersHtml = function(list){
        var s = '';
        var set = {};
        for (var i in list){
            if (set[list[i].title] != undefined){
                continue;
            }
            s+='<li data-title="' + list[i].title + '">' + list[i].title + '</li>';
            set[list[i].title] = list[i].title;
        }
        $('#answersList').html(s);
        $('#answersList li').click(function(){
            var answer = $(this).attr('data-title').trim();
            $('#userAnswerBlock').show();
            $('#userAnswer').text(answer);
            $('#answerButton').show();
        });
    }
    
    this.generateIdiometerListHtml = function(){
        var s = '';
        var list = self.idiometers;
        for (var i in list){
            s+= self.generateIdiometerListItem(list[i].title, list[i].vimeoId, list[i].imgSrc);
        }
        $('#idiomsList').html(s);
        $('#idiomsList li a').click(function(){
            if ($(this).hasClass('answeredIdiometer') == true){
                return;
            }
            self.selectedIdiometerVimeoId = $(this).attr('data-vimeoId');
            self.prepareCurrentIdiometerTest();
            
        });
        $('#idiomsList li a:not(.answeredIdiometer):first').click();
    }
    
    this.prepareCurrentIdiometerTest = function(){
        var vimeoId = self.selectedIdiometerVimeoId;
        var idi = self.getIdiometerByVimeoId(vimeoId);
        $('#idiometerIframe').attr('src', 'http://player.vimeo.com/video/' + vimeoId);
        self.selectedIdiometerRightAnswer = idi.title;
        $('#answerButton').hide();
        if (localStorage.getItem('lang') == 'ru'){
            $('#userAnswer').text('Ответ выберите из списка');
        }else{
            $('#userAnswer').text('Choose the right option from the list');
        }
            
    }
    
    this.initAnswerButton = function(){
        $('#answerButton').click(function(){
            var userAnswer = $('#userAnswer').text();
            console.log('userAnswer = ' + userAnswer);
            self.addVimeoIdToAnsweredList(self.selectedIdiometerVimeoId);
            $('#idiomsList li[data-vimeoId="' + self.selectedIdiometerVimeoId +'"]').addClass('answeredIdiometer');
            if (userAnswer == self.selectedIdiometerRightAnswer){
                if (localStorage.getItem('lang') == 'ru'){
                    alert('Правильный ответ');
                }else{
                    alert('You are right!');
                }
                self.addVimeoIdToRightAnsweredList(self.selectedIdiometerVimeoId);
                $('#idiomsList li[data-vimeoId="' + self.selectedIdiometerVimeoId +'"]').addClass('rightAnswered');
            }else{
                if (localStorage.getItem('lang') == 'ru'){
                    alert('Вы ошиблись. Правильный ответ - ' + self.selectedIdiometerRightAnswer);
                }else{
                    alert('You are wrong. Correct answer - ' + self.selectedIdiometerRightAnswer);
                }
                self.addVimeoIdToWrongAnsweredList(self.selectedIdiometerVimeoId);
                $('#idiomsList li[data-vimeoId="' + self.selectedIdiometerVimeoId +'"]').addClass('wrongAnswered');
            }
            $('#answerButton').hide();
            self.generateIdiometerListHtml();
        });
       
        
    }
    
    
    
    this.getIdiometerByVimeoId = function(vimeoId){
        if (vimeoId == undefined){
            return undefined;
        }
        for (var i in self.idiometers){
            var idi = self.idiometers[i];
            if ((idi.vimeoId == vimeoId) || ( (idi.vimeoId + "") == vimeoId) ){
                var ret = {
                    vimeoId: vimeoId,
                    title: idi.title,
                    imgSrc: idi.imgSrc
                }
                return ret;
            }
        }
        return undefined;
    }
    
    this.initPrevAdNextButtons = function(){
        $('#prevButton').attr('href', 'javascript: void(0);');
        $('#nextButton').attr('href', 'javascript: void(0);');
        $('#prevButton').addClass('ui-disabled');
        $('#nextButton').addClass('ui-disabled');
        console.log('currentIdiomNumber = ' + self.currentIdiomNumber);
        if (self.currentIdiomNumber > 0){
            $('#prevButton').attr('href', 'javascript: idiomsApp.currentIdiomNumber--; idiomsApp.initCurrentIdiom(); window.scrollTo(0,0);');
            $('#prevButton').removeClass('ui-disabled');
        }
        
        if (self.currentIdiomNumber < self.baseList.length - 1){
            $('#nextButton').attr('href', 'javascript: idiomsApp.currentIdiomNumber++; idiomsApp.initCurrentIdiom(); window.scrollTo(0,0);');
            $('#nextButton').removeClass('ui-disabled');
        }
        self.prepareRussian();
        
    }
    
    this.makeDemo = function(){
        $('#idiomsList').scrollTo('li[data-num="150"], 800');
        $('li[data-num="259"] a').click();
    }
    
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

