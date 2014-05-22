function IdiomsConstructor(){
    var self = this;
    this.parseAppId = 'Y9LJi7Ti007mowLGEI5mqaAy7BJYtma0D9V4qLP9';
    this.javascriptKey = 'TsXO6KtNqjBUvyw329GYf9vk3t3ClWCYBf1POzS5';
    this.savedNum = 0;
    this.savingItems = [];
    
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
        $('#saveToParseButton').click(function(){
            self.saveItemsToParse();
        });
    }
    
    this.getItems = function(){
        var list = [];
        $('.idiomItem').each(function(){
            console.log( $(this).children('.vimeoIdInput').val());
            var it = {
                vimeoId:  $(this).find('.vimeoIdInput').val(),
                transcript: $(this).find('.transcriptInput').val(),
                description: $('#description').val(),
                title: $('#title').val()
            };
            console.log(it);
            if (it.vimeoId == undefined || it.vimeoId == ''){
                return;
            }
            list.push(it);
        });
        return list;
    }
    
    this.updateParseElementWithImg = function(vimeoId){
        $.ajax({
            url: 'http://vimeo.com/api/v2/video/'+vimeoId + '.json',
            success: function(data){
                var img = data[0].thumbnail_small;
                var Idiom = Parse.Object.extend("Idiom");
                var query = new Parse.Query(Idiom);
                query.equalTo("vimeoId", vimeoId + '');
                query.find().then(function(idioms) {
                    idioms[0].set("imgSrc", img);
                    idioms[0].save();
                })
            }
        });
    }
    
    this.updateAllImagesFromList = function(list){
        for (var i in list){
            
            self.updateParseElementWithImg(list[i]);
        }
    }
    
    this.updateAllImages = function(){
        var Idiom = Parse.Object.extend("Idiom");
        var query = new Parse.Query(Idiom);
        query.find().then(function(idioms){
            var list = [];
            for (var i in idioms){
                console.log(idioms[i].get('imgSrc'));
                list.push(idioms[i].get('vimeoId'));
            }
            console.log(list);
            self.updateAllImagesFromList(list);
        })
    }
    
    this.saveItemToParse = function(it){
        var Idiom = Parse.Object.extend("Idiom");
        var idiom = new Idiom();
        var idiomType = ($('#idiometerCheckbox').is(':checked') == true) ? 'idiometer' : 'idiom';
        idiom.set('title', it.title);
        idiom.set('description', it.description);
        idiom.set('transcript', it.transcript);
        idiom.set('vimeoId', it.vimeoId);
        idiom.set('idiomType', idiomType);
        idiom.save(null,{
            success: function(item){
                self.savedNum++;
                if (self.savedNum == self.savingItems.length){
                    alert('saved!');
                    window.location.href = window.location.href;
                }
            }
        });
    }
    
    this.saveItemsToParse = function(){
        self.savedNum = 0;
        var items = self.getItems();
        self.savingItems = items;
        for (var i in items){
            var it = items[i];
            self.saveItemToParse(it);
        }
    }
   
}