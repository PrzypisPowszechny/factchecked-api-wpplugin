/*
 *
 *  _____ ____  _____ ____  _   _ __  __    _    ___ _       ____ ___  __  __
 * |  ___|  _ \| ____/ ___|| | | |  \/  |  / \  |_ _| |     / ___/ _ \|  \/  |
 * | |_  | |_) |  _| \___ \| |_| | |\/| | / _ \  | || |    | |  | | | | |\/| |
 * |  _| |  _ <| |___ ___) |  _  | |  | |/ ___ \ | || |___ | |__| |_| | |  | |
 * |_|   |_| \_\_____|____/|_| |_|_|  |_/_/   \_\___|_____(_)____\___/|_|  |_|
 *
 *
 * FreshMail is a browser-based software for sending and tracking
 * email marketing campaigns. FreshMail is absolutely free if you send
 * less than 2 000 e-mails up to 500 subscribers per month.
 *
 * Visit: http://freshmail.com/
 *
 */

// admin
jQuery(document).ready(function() {
	jQuery(document).on('keypress', 'form#fm_form', function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			e.preventDefault();
			return false;
		}
	});

	initAddForm();

	jQuery('.report_checkbox').click(function() {
		console.log(jQuery(this).val());
		refreshReports();
	});

	jQuery('#report_type').change(function() {
		if (jQuery(this).val() == 'custom') {
			return false;
		}
		var ms_day = 86400000;
		var today = new Date();
		if (jQuery(this).val() == 'year') {
			var ms = ms_day * 365;
			var from_date = new Date(today.getTime() - ms);
		}
		if (jQuery(this).val() == 'quarter') {
			var ms = ms_day * 121;
			var from_date = new Date(today.getTime() - ms);
			from_date.setDate(today.getDate());
		}
		if (jQuery(this).val() == 'month') {
			var ms = ms_day * 31;
			var from_date = new Date(today.getTime() - ms);
			from_date.setDate(today.getDate());
		}
		if (jQuery(this).val() == 'week') {
			var ms = ms_day * 7;
			var from_date = new Date(today.getTime() - ms);
		}
		if (jQuery(this).val() == 'yestarday') {
			var ms = ms_day;
			var from_date = new Date(today.getTime() - ms);
		}
		if (jQuery(this).val() == 'today') {
			var ms = 0;
			var from_date = new Date(today.getTime() - ms);
		}
		jQuery('#to_d').val(today.getDate());
		jQuery('#from_d').val(from_date.getDate());
		jQuery('#to_m').val(today.getMonth() + 1);
		jQuery('#from_m').val(from_date.getMonth() + 1);
		jQuery('#to_y').val(today.getFullYear());
		jQuery('#from_y').val(from_date.getFullYear());
	});

	jQuery('.form_to').change(function() {
		jQuery('#report_type').val('custom');
	});

	jQuery('#report_type').val('year');

	jQuery('#report_type').change();

	jQuery('.allowAll').click(function() {
		jQuery(this).parent().find('option').each(function() {
			jQuery(this).attr('selected', 'selected');
		});
	});

	jQuery('.disallowAll').click(function() {
		jQuery(this).parent().find('option').each(function() {
			jQuery(this).removeAttr("selected");
		});
	});
});

function refreshReports() {
	jQuery.post(static_var.ajax, {'action': 'fm_get_reports', 'params': jQuery('#reports_form').serialize() }, function(response) {
		var response = JSON.parse(response);
		data = google.visualization.arrayToDataTable(response);
		var options = {
			title: 'Raport',
			curveType: 'function',
			legend: { position: 'right' }
		};
		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		chart.draw(data, options);
	});
}

function initAddForm() {
	jQuery('.popup-colorpicker').wpColorPicker({
		border: false,
		change: function(event, ui) {
			setTimeout(function() {
				freshmail_disable_submit_buttons();
				previewForm();
			}, 500);
		},
		clear: function () { }
	});
	jQuery('#fm_form input').change(function() {
		freshmail_disable_submit_buttons();
		previewForm();
	});
	jQuery('#fm_form select').change(function() {
		freshmail_disable_submit_buttons();
		previewForm();
	});
	jQuery('#fm_form select').change(function() {
		freshmail_disable_submit_buttons();
		previewForm();
	});

	jQuery("#accordion").accordion({
		heightStyle: 'content',
		collapsible: true,
		active: false
	});

	jQuery('body').click(function(){
		if (jQuery('.wp-picker-open').length == 1) {
			jQuery('.wp-picker-container').parent('td').attr('colspan', '1');
			jQuery('.wp-picker-container').parent('td').prev().show();
		}
	});
	jQuery('.wp-color-result').click(function(){
		if (jQuery('.wp-picker-open').length == 0) {
			jQuery(this).parent('.wp-picker-container').parent('td').attr('colspan', '1');
			jQuery(this).parent('.wp-picker-container').parent('td').prev().show();
		} else {
			jQuery(this).parent('.wp-picker-container').parent('td').attr('colspan', '2');
			jQuery(this).parent('.wp-picker-container').parent('td').prev().hide();
		}
	});
}

function freshmail_disable_submit_buttons() {
	jQuery('.freshmail_api_key_submit').removeAttr('disabled');
	if (!isNaN(parseInt(jQuery('#freshmail_select_theme').val()))) {
		jQuery('.freshmail_save_submit').attr('disabled', 'disabled');
	}
}

function get_freshmail_fields(list_hash) {
	jQuery('.freshmail_api_key_submit').attr('disabled', 'disabled');
	jQuery('#freshmail_fields').html('<img style="padding:10px;" src="' + static_var.plugin_url + '/assets/images/loader.gif" alt="..." />');
	jQuery.post(static_var.ajax, {'action': 'get_freshmail_fields', 'list_hash': list_hash }, function(response) {
		jQuery('#freshmail_fields').html(response);
		jQuery('.freshmail_api_key_submit').removeAttr('disabled');
	});
}

function saveAsCustomTheme() {
	jQuery('.freshmail_custom_submit').attr('disabled', 'disabled');
	jQuery('#preview_form').css('opacity', '0.3');
	jQuery('img#form_preview_loader').toggle();
	jQuery('.fm_updated').remove();
	jQuery.post(static_var.ajax+"?form_id="+jQuery('#fm_form').attr('form_id'), {'action': 'save_as_custom_theme', 'fm_form': jQuery('#fm_form').serialize() }, function(response) {
		var val;
		jQuery('#freshmail_select_theme option').each(function() {
			jQuery(this).removeAttr('selected');
			val = jQuery(this).val();
		});
		if (isNaN(val)) {
			val = 0;
		} else {
			val = parseInt(val) + 1;
		}
		jQuery('#freshmail_select_theme').append('<option value="' + val + '" selected>Custom theme #' + (val + 1) + '</a>');

		jQuery('#preview_form').css('opacity', '1');
		jQuery('img#form_preview_loader').toggle();

		jQuery('.wrap.freshmail h1').after('<div class="fm_updated"><p>The Sign Up Form has been updated!</p></div>');
	});
}

var changeThemeNow = false;
function changeTheme() {

	freshmail_disable_submit_buttons();

	if (changeThemeNow) {
		console.log('changeTheme is not available');
		return;
	}
	console.log('changeThemeNow set to not available');
	changeThemeNow = true;
	previewFormNow = true;
	jQuery('#preview_form').css('opacity', '0.3');
	jQuery('img#form_preview_loader').toggle();
	jQuery.post(static_var.ajax, {'action': 'freshmail_change_theme', 'theme_id': jQuery('#freshmail_select_theme').val() }, function(response) {
		jQuery('#appearance').html(response);

		freshmail_disable_submit_buttons();

		changeThemeNow = false;
		previewFormNow = false;
		previewForm();
		initAddForm();
		console.log('changeThemeNow set to available');
	});
}

var previewFormNow = false;
function previewForm() {
	if (previewFormNow) {
		console.log('previewForm is not available');
		return;
	}
	console.log('previewForm set to not available');
	jQuery('#preview_form').css('opacity', '0.3');
	jQuery('img#form_preview_loader').toggle();
	previewFormNow = true;
	jQuery.post(static_var.ajax, {'action': 'preview_form', 'form_id': jQuery('#fm_form').attr('form_id'), 'form_serialize': jQuery('#fm_form').serialize() }, function(response) {
		jQuery('img#form_preview_loader').toggle();
		jQuery('#preview_form').html(response);
		jQuery('#preview_form').css('opacity', '1');
		previewFormNow = false;
		console.log('previewFormNow set to available');
	});
}
