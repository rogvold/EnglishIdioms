function IdiomsEditor(){
    var self = this;
    this.parseAppId = 'Y9LJi7Ti007mowLGEI5mqaAy7BJYtma0D9V4qLP9';
    this.javascriptKey = 'TsXO6KtNqjBUvyw329GYf9vk3t3ClWCYBf1POzS5';
    this.tableId = 'idiomsTable';
    this.idiomsList = [];
    
    this.online = function(){
        return navigator.onLine;
    }
    
    this.initParse = function(){
        if (!self.online()){
            return;
        }
        Parse.initialize(self.parseAppId, self.javascriptKey);
    }
    
    this.init = function(){
        self.initParse();
        self.loadIdioms(self.generateTable);
        self.initApplyButtons();
    }
    
    this.initApplyButtons = function(){
        $('.idiomButton').live('click', function(){
            var vId = $(this).attr('data-vimeoId').trim();
            console.log(vId);
            var title = $('tr[data-vimeoId="' + vId +'"] td.idiomTitle textarea').val().trim();
            var description = $('tr[data-vimeoId="' + vId +'"] td.idiomDescription textarea').val().trim();
            var transcript = $('tr[data-vimeoId="' + vId +'"] td.idiomTranscript textarea').val().trim();
            var ruDescription = $('tr[data-vimeoId="' + vId +'"] td.idiomRuDescription textarea').val().trim();
            var ruTranscript = $('tr[data-vimeoId="' + vId +'"] td.idiomRuTranscript textarea').val().trim();
            var check = title + description + transcript + ruDescription + ruTranscript;
            // alert(check);
            self.updateParseItem(vId, title, description, transcript, ruDescription, ruTranscript);
        });
    }
    
    this.updateParseItem = function(vimeoId, title, description, transcript, ruDescription, ruTranscript){
        var Idiom = Parse.Object.extend("Idiom");
        var query = new Parse.Query(Idiom);
        query.equalTo("vimeoId", vimeoId);
        query.find().then(function(idioms) {
            idioms[0].set("title", title);
            idioms[0].set("description", description);
            idioms[0].set("transcript", transcript);
            idioms[0].set("ruDescription", ruDescription);
            idioms[0].set("ruTranscript", ruTranscript);
            return idioms[0].save();
        }).then(function(){
            $('tr[data-vimeoId="' + vimeoId +'"]').removeClass('todo');
            $('tr[data-vimeoId="' + vimeoId +'"]').addClass('updated');
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
    
    this.loadIdioms = function(callback){
        var Idiom = Parse.Object.extend("Idiom");
        var query = new Parse.Query(Idiom);
        query.ascending("title");
        query.limit(1000);
        query.find().then(function(idioms){
            var list = self.getIdiomsListFromParseIdiomsList(idioms);
            list.sort(function(a,b) {
                if (a.title.toLowerCase() > b.title.toLowerCase() ) return 1;
                if (a.title.toLowerCase() < b.title.toLowerCase() ) return -1;
                return 0;
            } );
            self.idiomsList = list;
            $('#totalNumber').text(list.length);
            if(typeof callback == 'function')
            {
                callback(list);
            }
        });
    }
    
    this.isTodo = function(item){
        return (item.title == undefined || item.description == undefined 
            || item.transcript == undefined || item.ruTranscript == undefined || item.ruTranscript == 'undefined' || item.ruTranscript == ''
            || item.ruDescription == undefined || item.ruDescription == 'undefined' || item.ruDescription == '');
    }
    
    this.generateTable = function(list){
        var s = '<tr><th>vimeo id</th><th>preview img</th><th>title</th><th>explanation</th><th>transcript</th><th>ru explanation</th><th>ru transcript</th><th>apply</th></tr>';
        for (var i in list){
            if (list[i].ruTranscript == 'undefined' || list[i].ruTranscript == undefined) list[i].ruTranscript = '';
            if (list[i].ruDescription == 'undefined' || list[i].ruDescription == undefined) list[i].ruDescription = '';
            var todoClass = (self.isTodo(list[i])) ? 'todo' : '';
            s+='<tr data-vimeoId="' + list[i].vimeoId +'" class="' + todoClass +'" > <td><a target="_blank" href="https://vimeo.com/' + list[i].vimeoId +'" >' + list[i].vimeoId + '</a> </td> <td> <img src="' + list[i].imgSrc +'" /></td><td class="idiomTitle" > <textarea ' + ((gup('titleEnabled') == undefined || gup('titleEnabled') == "") ? ' disabled="1" ' : ' ') +'>' + list[i].title + '</textarea></td>';
            s+='<td class="idiomDescription" > <textarea>' + list[i].description + '</textarea></td>';
            s+='<td class="idiomTranscript" > <textarea>' + list[i].transcript + '</textarea></td>';
            s+='<td class="idiomRuDescription" > <textarea>' + list[i].ruDescription + '</textarea></td>';
            s+='<td class="idiomRuTranscript" > <textarea>' + list[i].ruTranscript + '</textarea></td>';
            s+='<td ><button class="idiomButton" data-vimeoId="' + list[i].vimeoId +'" > Apply! </button></td>';
            s+='</tr>';
        }
        $('#' + self.tableId).html(s);
    }
    
    this.generateJson = function(){
        var list = self.idiomsList;
        for (var i in list){
            var s = list[i].imgSrc;
            var t = s.lastIndexOf('/');
            s = 'assets/pics/' + s.substr(t + 1);
            list[i].imgSrc = s;
        }
        return JSON.stringify(list);
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
