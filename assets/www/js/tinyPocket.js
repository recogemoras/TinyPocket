(function($) {
	$.mobile.TinyPocket = {
		dbName: 'TinyPocket',
		dbVersion: '1.0',
		dbSize: 1000000,
		dbTitle: 'TinyPocket',
		dbConnection: null,

		update: false,
		currency: '€',

		init: function() {
			var self = this;

			self.transaction(function(tx) {
				//tx.executeSql('drop table if exists movement');
				tx.executeSql('create table if not exists movement (id auto_increment unique, concept, description, date, amount)');
			}, self.error);

			$('#movements').live('pagebeforeshow', function(event, ui) {
				$('#movementsList').html("");

				self.transaction(function(tx) {
					tx.executeSql('select * from movement order by id desc', [], function(tx, rs) {
						for (var i = 0; i < rs.rows.length; ++i)
							self.populateList(rs.rows.item(i));
					}, self.error);
				}, self.error);

				self.getTotal();
				$('.currency').text(self.currency);

				$('*').removeClass('ui-btn-active');
			});
		},

		prepareNewMovement: function(id) {
			if (id == 0) {
				$('#id').text("0");
				$('#concept').val("");
				$('#description').val("");
				$('#amount').val("");
				this.update = false;
			}
			else {
				var movement = this.getMovementFromId(id);
				$('#id').text(id);
				$('#concept').val(movement.concept);
				$('#description').val(movement.description);
				$('#amount').val(movement.amount);
				this.update = true;
			}

			$.mobile.changePage('#newMovement');
		},

		getNextId: function() {
			this.transaction(function(tx) {
				tx.executeSql('select max(id) as max from movement', [], function(tx, rs) {
					return (rs.rows.item(0).max <= 0? 1 : parseFloat(rs.rows.item(0).max) + 1);
				}, self.error);
			}, self.error);
		},

		getMovementFromId: function(id) {
			rs = this.transaction(function(tx) {
				tx.executeSql('select * from movement where id = ?', [id], function(tx, rs) {
					return rs.rows.item(0);
				});
			}, self.error);
			return rs.rows.item(0);
		},

		addMovement: function(mult) {
			var movement = this.getFormData(parseFloat(mult));
			if (self.update) this.updateMovement(movement);
			else this.insertMovement(movement);
		},

		getFormData: function(mult) {
			var movement = {
				'id': $('#id').text(),
				'concept': $('#concept').val(),
				'description': $('#description').val(),
				'date': $.format.date(new Date(), 'dd/M/yyyy ~ HH:mm'),
				'amount': mult * parseFloat($('#amount').val())
			};
			if (movement.amount) return movement;
			return false;
		},

		clear: function() {
			$('#concept').val("");
			$('#description').val("");
			$('#amount').val("");
		},

		insertMovement: function(movement) {
			if (movement) {
				this.transaction(function(tx) {
					tx.executeSql('insert into movement(concept, description, '
						+ 'date, amount) values(?, ?, ?, ?)', 
						[movement.concept, movement.description, 
						movement.date, movement.amount]);
				}, self.error);
			}
			else return alert("Insert a real amount");
			$.mobile.changePage('#movements');
		},

		updateMovement: function(movement) {
			if (movement) {
				this.transaction(function(tx) {
					tx.executeSql('update movement set concept = ?, description = ?, '
						+ 'amount = ? where id = ?', [movement.concept, movement.description, 
						movement.amount, movement.id]);
				}, self.error);
			}
			else return alert("Insert a real amount");
			$.mobile.changePage('#movements');
		},

		deleteMovement: function(id) {
			this.transaction(function(tx) {
				tx.executeSql('delete from movement where id = ?', [id]);
			}, self.error);
			$.mobile.changePage('#movements');
		},

		populateList: function(movement) {
			$('<li/>').append(
				$('<div class="info" />').append(
					($('<div class="concept" />').text(movement.concept))
				).append(
					($('<div class="date" />').text(movement.date))
				)
			).append(
				($('<span class="currency" />').text(this.currency))
			).append(
				($('<div class="amount" />').text(this.round(movement.amount)))
			).append(
				$('<div class="clear" />')
			).appendTo('#movementsList');

			$('#movementsList').listview('refresh');
		},

		getTotal: function() {
			total = 0;
			this.transaction(function(tx) {
				tx.executeSql('select * from movement', [], function(tx, rs) {
					for (var i = 0; i < rs.rows.length; ++i)
						total += parseFloat(rs.rows.item(i).amount);

					$('.totalAmount').text(String(Math.round(total * Math.pow(10, 2)) / Math.pow(10, 2)));
				}, self.error);
			}, self.error);
		},

		round: function(n) {
			return Math.round(n * Math.pow(10, 2)) / Math.pow(10, 2);
		},

		connect: function() {
			this.dbConnection = window.openDatabase(this.dbName, this.dbVersion, this.dbTitle, this.dbSize);
		},
		
		transaction: function(fn, error) {
			this.connect();
			this.dbConnection.transaction(fn, error, function() { });
		},
		
		error: function(err) {
			alert('Error code: ' + err.code + ' ~ Message: ' + err.message);
		}
	};

	$.mobile.TinyPocket.init();
})(jQuery);
