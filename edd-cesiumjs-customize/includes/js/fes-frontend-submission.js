jQuery(document).ready(function($) {
	/*edd fes frontend submission sellable access show hide*/
	//$(".fes_multiple_price label").append('<span class="fes-required-indicator">*</span>');
	var default_val = $('input[name=sellable_access]:checked').val();
	if(default_val == 'View Only'){
		jQuery('.fes_multiple_price .fes-price-row').hide();
		jQuery('.fes_multiple_price .fes-label label').hide();
		$(".fes_multiple_price .fes-label").append('<label class="fes_url">URL<span class="fes-required-indicator">*</span></label>');
		//jQuery('.fes_multiple_price .fes-required-indicator').hide();

	} else {
		jQuery('.fes_multiple_price .fes-price-row').show();
		jQuery('.fes_multiple_price .fes-label label').show();
		jQuery('.fes_multiple_price .fes-label label.fes_url').hide();
		//jQuery('.fes_multiple_price .fes-required-indicator').show();
	}

	jQuery("input:radio[name=sellable_access]").click(function() {
		var radio_val = jQuery(this).val();
		if(radio_val == 'View Only'){
			jQuery('.fes_multiple_price .fes-price-row').hide();
			jQuery('.fes_multiple_price .fes-label label').hide();
			$(".fes_multiple_price .fes-label").append('<label class="fes_url">URL<span class="fes-required-indicator">*</span></label>');
			//jQuery('.fes_multiple_price .fes-required-indicator').hide();
		} else {
			jQuery('.fes_multiple_price .fes-price-row').show();
			jQuery('.fes_multiple_price .fes-label label').show();
			jQuery('.fes_multiple_price .fes-label label.fes_url').hide();
			//jQuery('.fes_multiple_price .fes-required-indicator').show();
		}		
	}) 
});
