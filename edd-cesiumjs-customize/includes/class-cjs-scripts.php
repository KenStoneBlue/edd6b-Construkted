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

    global $post, $product;

    $edd_cjs_options = get_option( 'edd_cjs_options' );

    wp_register_script('fes-frontend-submission-script',  EDD_CJS_INC_URL.'/js/fes-frontend-submission.js', array(), EDD_CJS_LIB_VER , true );
		wp_enqueue_script('fes-frontend-submission-script');

    

    /*wp_register_script('fes-frontend-submission', EDD_CJS_INC_URL . '/js/fes-frontend-submission.js', array('jquery','edd-cjs-script'), EDD_CJS_LIB_VER, true);
        wp_enqueue_script('fes-frontend-submission');*/

    if( is_singular('download') && !empty($edd_cjs_options['edd_cjs_cesiumjs_token_key']) ) {

      $post_id = $post->ID;
			$download_asset_id = get_post_meta( $post_id, 'download_asset_id', true );
      $download_asset_url = get_post_meta( $post_id, 'download_asset_url', true );
      //$cesium_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZGQwMGU5NC1hNjk5LTQxYmEtODlkYi1mMjA2MWU0MDVkMGUiLCJpZCI6OTY3OSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU1NDczMDU0NH0.ykKSXfrG12-yU14xwpdFq6oWExDOZUpB7Pphbu952h8";
			
	  $cesium_token = $edd_cjs_options['edd_cjs_cesiumjs_token_key'];

      if( !empty($download_asset_id) || !empty($download_asset_url) ){

				$inline_script = "";
				/*if( !empty($download_asset_url) ){
					$download_asset_id = '';
				}*/

    		// add css for check code in public
    		wp_enqueue_style( 'edd-cjs-cesium-widgets-style',  'https://cesiumjs.org/releases/1.57/Build/Cesium/Widgets/widgets.css', array(), EDD_CJS_LIB_VER );
    		// wp_register_style( 'edd-cjs-public-style', EDD_CJS_INC_URL . '/css/edd-cjs-public.css', array(), EDD_CJS_LIB_VER );
    		// wp_enqueue_style( 'edd-cjs-public-style' );

        wp_enqueue_script('edd-cjs-cesium-script', 'https://cesiumjs.org/releases/1.57/Build/Cesium/Cesium.js', array('jquery'), EDD_CJS_LIB_VER, true);
        
				wp_register_script('edd-cjs-public-script', EDD_CJS_INC_URL . '/js/edd-cjs-public-script.js', array('jquery','edd-cjs-cesium-script'), EDD_CJS_LIB_VER, true);
        wp_enqueue_script('edd-cjs-public-script');
    		wp_localize_script( 'edd-cjs-public-script', 'EDD_CJS_PUBLIC_AJAX',
    			array(
    				'ajaxurl' => admin_url( 'admin-ajax.php' ),
						'download_asset_id' => $download_asset_id,
            'download_asset_url' => $download_asset_url,
    				'cesium_token' => $cesium_token,
    			)
    		);

				if( !empty($download_asset_url) ){
					ob_start(); ?>
jQuery(document).ready(function(){

		Cesium.Ion.defaultAccessToken = "<?php echo $cesium_token;  ?>";

		var viewer = new Cesium.Viewer('cesiumContainer');

		var tileset = viewer.scene.primitives.add(
			new Cesium.Cesium3DTileset({
				url: "<?php echo $download_asset_url;  ?>",
				modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0))
			})
		);

		viewer.zoomTo(tileset)
			.otherwise(function (error) {
				console.log(error);
			});

});
<?php
					$inline_script = ob_get_clean();
				} else if( !empty($download_asset_id) ) {
					ob_start(); ?>
jQuery(document).ready(function(){

    Cesium.Ion.defaultAccessToken = "<?php echo $cesium_token; ?>";
    var viewer = new Cesium.Viewer('cesiumContainer');

    var imageryLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.IonImageryProvider({ assetId: <?php echo $download_asset_id;  ?> })
    );

    viewer.zoomTo(imageryLayer)
        .otherwise(function (error) {
            console.log(error);
        });
});
<?php
					$inline_script = ob_get_clean();
				}
				if( !empty($inline_script) ){

//					wp_add_inline_script( 'edd-cjs-cesium-script', $inline_script );
				}

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
