<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Public Class
 *
 * Manage Public Class
 *
 * @package EDD CesiumJS Customize
 * @since 1.0.0
 */
class EDD_CJS_Public {

	public $model;

	//class constructor
	function __construct() {

		global $woo_cpi_model;

		$this->model = $woo_cpi_model;
	}

	/**
	 * Show CesiumJS Assets Output Div
	 */
/*	public function edd_cjs_show_CesiumJS_Assets( $content ){

	  	global $post;

	  	if ( $post->post_type != 'download' ) {
	  		return $content;
	  	}

	    if( is_singular('download') ){

	      $post_id = $post->ID;
				$download_asset_id = get_post_meta( $post_id, 'download_asset_id', true );
	      $download_asset_url = get_post_meta( $post_id, 'download_asset_url', true );

	      if( !empty($download_asset_id) || !empty($download_asset_url) ){
	          $content .= '<div id="cesiumContainer" style="width: 700px; height:400px"></div>';
	      }
	    }

	    return $content;
	}*/

	/*
	* Show CesiumJS Assets Output Div
	*/
	public function edd_cjs_fes_submission_form_display_fields_fields( $fields, $class_object, $user_id ){




		
		if( class_exists( 'RCP_Levels' ) ) {

			$levels_db = new RCP_Levels();
			$level_id = rcp_get_subscription_id( get_current_user_id() );

			$levels    = $levels_db->get_level( $level_id );
			$subscription = rcp_get_subscription( get_current_user_id() );

			$member_status =  rcp_get_status(get_current_user_id());				

			$eddcjs_rcp_level_size = get_option( 'eddcjs_rcp_level_size' );

			if ( ! empty( $levels )  &&  !empty($eddcjs_rcp_level_size) ) {
				if($eddcjs_rcp_level_size['allowed_access_'.$levels->id] == $levels->id){

				} else {
					if( !empty($fields['download_access']) ){
						unset($fields['download_access']);
					}
				}
			} else {
				if( !empty($fields['download_access']) ){
					unset($fields['download_access']);
				}
			}


			if ( ! empty( $levels )  &&  !empty($eddcjs_rcp_level_size)) {
				if($eddcjs_rcp_level_size['sellable_access_'.$levels->id] == $levels->id){

				} else {
					?>
					<style type="text/css">
						.fes_multiple_price .fes-fields .fes-variations-list-multiple .fes-price-row{
						display: none !important; 
						}
					</style>
					<?php
					if( !empty($fields['sellable_access']) ){
						unset($fields['sellable_access']);
						//unset($fields['multiple_pricing']);
						update_post_meta( $class_object->save_id, 'edd_price', 0.00 );
						//update_post_meta( $class_object->save_id, 'edd_download_files', '' );
						update_post_meta( $class_object->save_id, 'edd_variable_prices', '' );
						update_post_meta( $class_object->save_id, 'sellable_access', 'View Only' );	
											
					}
				}
			} else {
				?>
					<style type="text/css">
						.fes_multiple_price .fes-fields .fes-variations-list-multiple .fes-price-row{
						display: none !important; 
						}
					</style>
					<?php
				if( !empty($fields['sellable_access']) ){
					unset($fields['sellable_access']);
					//unset($fields['multiple_pricing']);
					update_post_meta( $class_object->save_id, 'edd_price', 0.00 );
					//update_post_meta( $class_object->save_id, 'edd_download_files', '' );
					update_post_meta( $class_object->save_id, 'edd_variable_prices', '' );	
					update_post_meta( $class_object->save_id, 'sellable_access', 'View Only' );	
									
				}
			}

		}

		if( !empty($fields['download_asset_id']) ){
			unset($fields['download_asset_id']);
		}
		if( !empty($fields['download_asset_url']) ){
			unset($fields['download_asset_url']);
		}

		return $fields;
	}

	/*
	* Show CesiumJS Assets Output Div
	*/
	public function edd_cjs_fes_render_submission_form_frontend_fields( $fields, $class_object, $user_id, $readonly ){	

		//echo '<pre>'; print_r($readonly); echo '</pre>';

		if( class_exists( 'RCP_Levels' ) ) {

			$levels_db = new RCP_Levels();
			$level_id = rcp_get_subscription_id( get_current_user_id() );

			$levels    = $levels_db->get_level( $level_id );
			$subscription = rcp_get_subscription( get_current_user_id() );

			$member_status =  rcp_get_status(get_current_user_id());				

			$eddcjs_rcp_level_size = get_option( 'eddcjs_rcp_level_size' );

			if ( ! empty( $levels )  &&  !empty($eddcjs_rcp_level_size) ) {
				if($eddcjs_rcp_level_size['allowed_access_'.$levels->id] == $levels->id){

				} else {
					if( !empty($fields['download_access']) ){
						unset($fields['download_access']);
					}
				}
			} else {
				if( !empty($fields['download_access']) ){
					unset($fields['download_access']);
				}
			}


			if ( ! empty( $levels )  &&  !empty($eddcjs_rcp_level_size)) {
				if($eddcjs_rcp_level_size['sellable_access_'.$levels->id] == $levels->id){

				} else {
					?>
					<style type="text/css">
						.fes_multiple_price .fes-fields .fes-variations-list-multiple .fes-price-row{
						display: none !important; 
						}
					</style>
						<?php	
					if( !empty($fields['sellable_access']) ){
						unset($fields['sellable_access']);
						//unset($fields['multiple_pricing']);
						update_post_meta( $class_object->save_id, 'edd_price', 0.00 );
						//update_post_meta( $class_object->save_id, 'edd_download_files', '' );
						update_post_meta( $class_object->save_id, 'edd_variable_prices', '' );
						update_post_meta( $class_object->save_id, 'sellable_access', 'View Only' );	
										
					}
				}
			} else {
				?>
					<style type="text/css">
						.fes_multiple_price .fes-fields .fes-variations-list-multiple .fes-price-row{
						display: none !important; 
						}
					</style>
					<?php	
				if( !empty($fields['sellable_access']) ){
					unset($fields['sellable_access']);
					//unset($fields['multiple_pricing']);
					update_post_meta( $class_object->save_id, 'edd_price', 0.00 );
					//update_post_meta( $class_object->save_id, 'edd_download_files', '' );
					update_post_meta( $class_object->save_id, 'edd_variable_prices', '' );	
					update_post_meta( $class_object->save_id, 'sellable_access', 'View Only' );	
								
				}
			}

		}

		if( !empty($fields['download_asset_id']) ){
			unset($fields['download_asset_id']);
		}
		if( !empty($fields['download_asset_url']) ){
			unset($fields['download_asset_url']);
		}

		return $fields;
	}

	/**
	 * Pre Post Filter
	 */
	public function edd_download_pre_get_post_filter( $query ) {

		global $wpdb;

		// Should not apply this filter to in backend.
		if ( is_admin() ) return $query;

		if ( !is_admin()  && $_GET['task'] != 'products' && isset( $query->query_vars['post_type'] ) && $query->query_vars['post_type'] == 'download'  ) { // Should not apply this filter on vendor dashboard page.

				$download_access_metas = $wpdb->get_results("SELECT * FROM `".$wpdb->postmeta."` WHERE meta_key='download_access' AND meta_value = 'Private'");
				if(!empty($download_access_metas)){
					foreach ($download_access_metas as $key => $download_access_meta) {
						$values[] = $download_access_meta->post_id;
					}
				}
				if(  is_front_page()  || is_page() || $query->is_search() ) {
					$query->query_vars['post__not_in'] = $values;
				}

		}

		return $query;
	}

	/**
	 * Upload size change by current user level
	 */
	public function edd_cjs_tuxbfu_max_upload_size($max_upload_size=0){

		if( class_exists( 'RCP_Levels' ) && is_user_logged_in() ) {

			$eddcjs_rcp_level_size = ( get_option( 'eddcjs_rcp_level_size' ) );
			$levels_db = new RCP_Levels();
			$level_id = rcp_get_subscription_id( get_current_user_id() );

			$levels    = $levels_db->get_level( $level_id );
			$level_size = (!empty($eddcjs_rcp_level_size[$level_id])) ? $eddcjs_rcp_level_size[$level_id] : 0 ;
			if( !empty($level_size) ){
				return $level_size;
			}
		}
		return $max_upload_size;
	}


	/*fes frontemd submission form in if sellable select than multi price require otherwise hide */
	public function fes_cjs_fes_save_submission_form_after_frontend( $output, $save_id, $values, $user_id )  {	
	 	
	 		if($values['sellable_access'] == 'View Only'){
	 			update_post_meta( $save_id, 'edd_price', 0.00 );
	 			//update_post_meta( $save_id, 'edd_download_files', '' );
	 			update_post_meta( $save_id, 'edd_variable_prices', '' );
	 		}
	 		/*if($values['multiple_pricing']['files'][0] == '' && $values['sellable_access'] == 'Sellable' ){		
	 			$output['errors'] = array('multiple_pricing' => __( 'Please enter a valid URL.', 'edd_cjs' ) );
	 		} */
	 	
        return $output;
    }

    /*fes frontemd submission form in if sellable select than multi price require otherwise hide */	
	public function edd_cjs_fes_frontend_submission_error_check( $output, $save_id, $values, $user_id ){

		
	 	/*if($values['multiple_pricing']['files'][0] == '' && $values['sellable_access'] == 'Sellable' ){
	 		
	 			$output['errors'] = array('multiple_pricing' => __( 'Please enter a valid URL.', 'edd_cjs' ) );
	 	} */
	 	
        return $output;
    }

    /*not sellable product price and button hide other wise display in product listing*/
    function edd_cjs_edd_puchase( $purchase_form, $args ) {	

    	$sellable_access = get_post_meta( get_the_ID(), 'sellable_access', true );
    	if($sellable_access == 'View Only'){
    		?>
    		<style type="text/css">
    		.cart-box{
    			display: none;
    		}
    	</style>
    	<?php
    	return false;
	    }  else {
	    	return $purchase_form;
	    }	
	}


	/**
	 * Check the item we want to add in cart (Step #7)
	 * @param  array $item 
	 * @return array|boolean       
	 */
	function dp_check_item_to_add( $item ) {

		
		if( isset( $item['id'] ) ) {

			global $wpdb;

			$sellable_access = $wpdb->get_results("SELECT * FROM `".$wpdb->postmeta."` WHERE meta_key='sellable_access' AND meta_value = 'View Only'");				

			foreach ($sellable_access as $key => $value) {	

				$values[] = $value->post_id;
				
			}

			if (in_array($item['id'], $values))
			{
				return false;
			}
			else
			{
				return $item;
			}

		}
		
	}
	
	/**
	 * Adding Hooks
	 *
	 * @package EDD CesiumJS Customize
	 * @since 1.0.0
	 */
	function add_hooks() {

		// Change the Add to cart Text
		//add_filter( 'the_content', array( $this, 'edd_cjs_show_CesiumJS_Assets' ) );

		add_filter( 'fes_submission_form_display_fields_fields', array( $this, 'edd_cjs_fes_submission_form_display_fields_fields' ), 10, 3 );

		add_filter( 'fes_render_submission_form_frontend_fields', array( $this, 'edd_cjs_fes_render_submission_form_frontend_fields' ), 10, 4 );

		add_filter( 'fes_after_submission_form_save_frontend', array( $this, 'fes_cjs_fes_save_submission_form_after_frontend' ), 15, 4 );

		// Check error for preview video with membership level
        add_filter( 'fes_before_submission_form_error_check_frontend', array( $this, 'edd_cjs_fes_frontend_submission_error_check'), 16, 4);

		add_action( 'pre_get_posts', array( $this, 'edd_download_pre_get_post_filter' ) );

		add_filter( 'tuxbfu_max_upload_size', array( $this, 'edd_cjs_tuxbfu_max_upload_size' ), 90, 1 );		

		add_filter( 'edd_purchase_download_form', array( $this, 'edd_cjs_edd_puchase'), 12, 2 );

		add_filter( 'edd_add_to_cart_item', array( $this, 'dp_check_item_to_add' ) );


	}
}
