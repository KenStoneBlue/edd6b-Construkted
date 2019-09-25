<?php

// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Scripts Class
 *
 * Handles adding scripts functionality to the admin pages
 * as well as the front pages.
 *
 * @package EDD CesiumJS Customize
 * @since 1.0.0
 */
class EDD_CJS_Scripts {

	public function __construct() {

	}

	/**
	 * Adding Scripts
	 *
	 * Adding Scripts for check code public
	 */
	public function wedd_cjs_public_scripts(){
        global $post;

        $edd_cjs_options = get_option( 'edd_cjs_options' );

        wp_register_script('fes-frontend-submission-script',  EDD_CJS_INC_URL.'/js/fes-frontend-submission.js', array(), EDD_CJS_LIB_VER , true );
		wp_enqueue_script('fes-frontend-submission-script');

        if( is_singular('download') && !empty($edd_cjs_options['edd_cjs_cesiumjs_token_key']) ) {
            $post_id = $post->ID;
    		$download_asset_id = get_post_meta( $post_id, 'download_asset_id', true );
            $download_asset_url = get_post_meta( $post_id, 'download_asset_url', true );

            $display_3dtileset = true;

            //if( !empty($download_asset_id) || !empty($download_asset_url) ){
            if($display_3dtileset ){
        		// add css for check code in public
        		wp_enqueue_style( 'edd-cjs-cesium-widgets-style',  'https://cesiumjs.org/releases/1.61/Build/Cesium/Widgets/widgets.css', array(), EDD_CJS_LIB_VER );
                wp_enqueue_script('edd-cjs-cesium-script', 'https://cesiumjs.org/releases/1.61/Build/Cesium/Cesium.js', array('jquery'), EDD_CJS_LIB_VER, true);

                $script_dir = '/wp-content/plugins/edd-cesiumjs-customize/includes/js/';

                wp_enqueue_script('edd-cjs-camera-controller-script',  $script_dir . 'edd-cjs-camera-controller.js', array('jquery', 'edd-cjs-cesium-script'), EDD_CJS_LIB_VER, true);
                wp_enqueue_script('edd-cjs-3dtileset-location-editor-script', $script_dir . 'edd-cjs-3dtileset-location-editor.js', array('jquery', 'edd-cjs-cesium-script'), EDD_CJS_LIB_VER, true);
                wp_enqueue_script('edd-cjs-measurer-script', $script_dir . 'edd-cjs-measurer.js', array('jquery', 'edd-cjs-cesium-script'), EDD_CJS_LIB_VER, true);
            
    			wp_register_script('edd-cjs-public-script', EDD_CJS_INC_URL . '/js/edd-cjs-public-script.js',
                                   array('jquery',
                                          'edd-cjs-camera-controller-script',
                                          'edd-cjs-3dtileset-location-editor-script',
                                          'edd-cjs-measurer-script',
                                          'edd-cjs-cesium-script'), EDD_CJS_LIB_VER, true);

                wp_enqueue_script('edd-cjs-public-script');
                
        		wp_localize_script( 'edd-cjs-public-script', 'EDD_CJS_PUBLIC_AJAX',
        			array(
        				'ajaxurl' => admin_url( 'admin-ajax.php' ),
        				'post_id' => $post_id
        			)
        		);
            }
        }
    }

	/**
	 * Adding Hooks
	 *
	 * @package EDD CesiumJS Customize
	 * @since 1.0.0
	 */
	public function add_hooks() {
		//add scripts for fronted side
		add_action( 'wp_enqueue_scripts', array( $this, 'wedd_cjs_public_scripts' ));
	}
}
