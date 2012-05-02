

(function($) {
	$.mobile.GapNote = {
			dbName: 'GapNote',
			dbVersion: '1.0',
			dbSize: 1000000,
			dbTitle: 'Notas PhoneGap',
			dbConnection: null,
			dbCount: 1,
		
		init: function() {
			var self = this;
			
			/*setTimeout(function() {
				$.mobile.changePage('#list', {'transition': 'slide'});
			}, 3000);*/
			
			$('#list').live('pagebeforeshow', function(event, ui) {
				$('#title, #description').val("");
				$('#date').val((new Date()).toLocaleString());

				self.transaction(function(tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS NOTE (id unique, title, description, date, pic)');
					
					tx.executeSql('select count(*) as count from note', [], function(tx, rs) {
						self.dbCount = (rs.rows.item(0).count <= 0)?1:rs.rows.item(0).count;
						console.log(self.dbCount);
					}, self.error);
					
					tx.executeSql('select * from note', [], function(tx, rs) {
						for (var i = 0; i < rs.rows.length; ++i) {
							self.addItem(rs.rows.item(i));
						}
					}, self.error);
				}, self.error);
			});
		},
		
		insertItem: function() {
			var self = this;
			++self.dbCount;
			var note = {
					'id': this.dbCount,
					'title': $('#title').val(),
					'description': $('#description').val(),
					'date': $('#date').val(),
					'pic': $('#pic').data('pic')
			};
			
			self.transaction(function(tx) {
				tx.executeSql('INSERT INTO NOTE (id, title, description, date, pic) VALUES (?, ?, ?, ?, ?)', [note.id, note.title, note.date, note.description, note.pic], self.error);
			}, self.error);
			
			$.mobile.changePage('#list');
		},
		
		capture: function() {
			navigator.camera.getPicture(function(imageData) {
				$('#pic').data('image', imageData).css('background-image', "url(data:image/jpeg;base64)" + imageData);
			},
			function(message) {
				alert('Failed because: ' + message);
			},
			{
				quality: 50,
			    destinationType: Camera.DestinationType.DATA_URL
			});
		},
		
		addItem: function(note) {
			$('<li/>').append(
				$('<a/>').append($('<h3/>').text(note.title)).append($('<p/>').text(note.description))
			).append($('<a data-theme="e" />')).appendTo('#items');
			
			$('#items').listview('refresh');
		},
		
		populateItems: function() {

		},
		
		connect: function() {
			this.dbConnection = window.openDatabase(this.dbName, this.dbVersion, this.dbTitle, this.dbSize);
		},
		
		transaction: function(fn, error) {
			this.connect();
			this.dbConnection.transaction(fn, error);
		},
		
		error: function(err) {
			alert('Error code: ' + err.code + ' Message: ' + err.message);
		}
	};
	
	$.mobile.GapNote.init();
})(jQuery);
