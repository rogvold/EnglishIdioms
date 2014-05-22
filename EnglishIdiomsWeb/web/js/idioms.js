IdiomsApp = function(){
    var self = this;
    this.idioms = [];
    this.currentIdiom = undefined;
    this.currentVidemoId = undefined;
    this.baseList = [];
    this.currentIdiomNumber = undefined;
    this.visitedList = [];
    this.selectedLang = undefined;
    
    
    this.init = function(){
        console.log('init occured');
        self.loadIdioms();
        self.initSettingsPage();
    //        self.initPlayButton();
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
    
    this.initSettingsPage = function(){
        var localLang = localStorage.getItem('lang');
        if (localLang == undefined || localLang == ''){
            localStorage.setItem('lang', 'en');
            self.selectedLang = 'en';
        }else{
            self.selectedLang = localLang;
        }
        if (self.selectedLang == 'ru'){
            try{
                $('.langCheckbox').prop('checked',true).checkboxradio('refresh');
            }catch(e){}
        }
        $('.langCheckbox').bind('click', function(){
            var lang = $(this).attr('data-lang');
            if ($(this).is(':checked')){
                localStorage.setItem('lang', lang);
                self.selectedLang = lang;
            }else{
                localStorage.setItem('lang', 'en');
                self.selectedLang = 'en';
            }
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
    
    
    this.getExamplesHtml = function(item){
        var d = item;
        var sh = '';
        for (var i in d.vimeoIds){
            var vId = d.vimeoIds[i];
            var tr = d.transcripts[i];
            var ruTr = d.ruTranscripts[i];
            var w = Math.floor(Math.floor($(window).width()) * 0.8);
            var h = Math.floor(0.75 * w);
            console.log('w = ' + w + '; h = ' + h);
            var iframeHtml0 = '<iframe src=\"http://player.vimeo.com/video/' + vId +'\"  frameborder=\"0\" style="width: ' + w + 'px; height: '+ h +'px;" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>';
            var iframeHtml = '<img data-vimeoId="' + vId + '" src="' + d.imgSrcs[i] +'"  style="width: ' + w + 'px; height: '+ h +'px;"  />';
            var pHtml = '<img class="playButton" data-transcriptNum="' + i +'" data-w="' + w +'" data-h="' + h + '" data-vimeoId=\"' + vId + '\" src="assets/images/play_button.png"  style="width: ' + (w/3) +'px; cursor: pointer; opacity: 0.8; height: ' + (h/3) +'px; position: absolute; left: ' + (11*w/24) +'px; top: ' + h/3 + 'px;"  />';
            var hh = '<div class="ui-body ui-body-a" id="examplesItem' + i +'" > <center> ' + iframeHtml + pHtml + ' </center><p class="transcript">' + tr + '</p> <p class="transcript ruTranscript">' + ruTr +'</p> </div>';
            sh+=hh;
        }
        console.log(sh);
        return sh;
    }
  
    this.loadIdioms = function(callback){
        $.ajax({
            url: 'json/localBase.json',
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
        console.log('updateIdiomsList');
        var visited = self.visitedList;
        for (var i in visited){
            var title = visited[i];
            console.log(title);
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
            console.log('range for letter ' + letter + ' is ');
            console.log(range);
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
            console.log(letterHtml);
            console.log(lHtml);
            s = s + letterHtml + lHtml;
        }
        $('#idiomsList').html(s);
        $("#idiomsList").listview("refresh");
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
        }, 400);
        self.initPrevAdNextButtons();
        self.makeVisited(self.currentIdiom.title);
        self.updateIdiomsList();
        
        console.log(self.currentIdiom);
    }
    
    this.generateListItemHtml = function(vimeoId, imgSrc, title, description, number, labelNumber){
        var s = '<li data-title="' + title +'" onclick="idiomsApp.currentIdiomNumber=' + number +'" data-num="' + number +'" ><a data-transition="slide" href="#idiomPage" >'
        + '<img src="' + imgSrc +'" class="ui-li-thumb" />'
        + '<h3>' + title +'</h3>'
        + '<p>' +  description + ' ... </p>'
        + '<span class="ui-li-count">' + labelNumber +'</span>'
        + '</a>'
        + '</li>';
        return s;
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