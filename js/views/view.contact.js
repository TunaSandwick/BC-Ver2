(function ($) {

	'use strict';

	/*
	Custom Rules
	*/

	// No White Space
	$.validator.addMethod("noSpace", function (value, element) {
		if ($(element).attr('required')) {
			return value.search(/^(?! *$)[^]+$/) == 0;
		}

		return true;
	}, 'Please fill this empty field.');

	/*
	Assign Custom Rules on Fields
	*/
	$.validator.addClassRules({
		'form-control': {
			noSpace: true
		}
	});

	/*
	Contact Form: Basic
	*/
	$('.contact-form').each(function () {
		$(this).validate({
			errorPlacement: function (error, element) {
				if (element.attr('type') == 'radio' || element.attr('type') == 'checkbox') {
					error.appendTo(element.closest('.form-group'));
				} else if (element.is('select') && element.closest('.custom-select-1')) {
					error.appendTo(element.closest('.form-group'));
				} else {
					if (element.closest('.form-group').length) {
						error.appendTo(element.closest('.form-group'));
					} else {
						error.insertAfter(element);
					}
				}
			},
			submitHandler: function (form) {

				var $form = $(form),
					$messageSuccess = $form.find('.contact-form-success'),
					$messageError = $form.find('.contact-form-error'),
					$submitButton = $(this.submitButton),
					$errorMessage = $form.find('.mail-error-message'),
					submitButtonText = $submitButton.val();

				$submitButton.val($submitButton.data('loading-text') ? $submitButton.data('loading-text') : 'Loading...').attr('disabled', true);

				// Fields Data
				var formData = $form.serializeArray(),
					data = {};

				$(formData).each(function (index, obj) {
					if (data[obj.name]) {
						data[obj.name] = data[obj.name] + ', ' + obj.value;
					} else {
						data[obj.name] = obj.value;
					}
				});

				// Google Recaptcha v2
				if (data["g-recaptcha-response"] != undefined) {
					data["g-recaptcha-response"] = $form.find('#g-recaptcha-response').val();
					if (data["g-recaptcha-response"].length === 0) {
						$(".contact-form-error").addClass("d-block").html("Vui lòng xác minh reCAPTCHA.");
						$messageSuccess.addClass('d-none');
						$messageError.removeClass('d-none');
						$submitButton.val(submitButtonText).attr('disabled', false);
						return
					}
				}

				// Set action
				var action = $(this).attr("action");
				if (!action) {
					action =
						"https://script.google.com/macros/s/AKfycbxRtnFA9Kk8A9xv0GmUqWVLLjhfqD3WUjT-1ebzVE4wVsEKY4DM9Wzl7rzY5f2QXU9xTA/exec";
				}

				// Ajax Submit
				$.ajax({
					type: 'POST',
					url: action,
					data: data
				}).always(function (data, textStatus, jqXHR) {

					$errorMessage.empty().hide();

					if (data.result == 'success') {

						$messageSuccess.removeClass('d-none');
						$messageError.addClass('d-none');

						// Reset Form
						$form.find('.form-control')
							.val('')
							.blur()
							.parent()
							.removeClass('has-success')
							.removeClass('has-danger')
							.find('label.error')
							.remove();

						if (($messageSuccess.offset().top - 80) < $(window).scrollTop()) {
							$('html, body').animate({
								scrollTop: $messageSuccess.offset().top - 80
							}, 300);
						}

						$form.find('.form-control').removeClass('error');

						$submitButton.val(submitButtonText).attr('disabled', false);

						return;

					} else {
						$(".contact-form-error").addClass("d-block").html("Đã có lỗi xảy ra! Vui lòng thử lại sau.");
						$messageSuccess.addClass('d-none');
						$messageError.removeClass('d-none');
					}
				});
			}
		});
	});

}).apply(this, [jQuery]);