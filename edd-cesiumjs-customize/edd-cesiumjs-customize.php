<?php
/**
 * Plugin Name: EDD CesiumJS Customize
 * Plugin URI: http://www.construkted.com/
 * Description: EDD CesiumJS Customize
 * Version: 1.0.4
 * Author: Construkted Team
 * Author URI: http://www.construkted.com/
 * Text Domain: edd_cjs
 * Domain Path: languages
 *
 * @package EDD CesiumJS Customize
 * @category Core
 * @author Construkted Team
 *
 * CHANGELOG
 * 1.0.0
 * - Initial Release
 *
 * 1.0.1
 * - Added further functions and fixes
 *
 * 1.0.2
 * - Moved all settings to one common page Settings>Contrukted
 *
 *1.0.3
 * - Added extra FES hidden field:
 *      field : default_camera_position_direction
 *      This field stores the camera position and view direction, and it becomes the default position and direction when a model is loaded
 *
 *1.0.4
 * - Added random characters as item slug. (length of 10)
 * - Added a hyphen between slug and file name when file gets renamed before sending to S3
 * - Added load speed optimizations as suggested by Omar
 * - Modified keyboard key assignments, so "A" and "D" move the camera rather then rotate it.
 * 
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Basic plugin definitions
 *
 * @package EDD CesiumJS Customize
 * @since 1.0.0
 */
if( !defined( 'EDD_CJS_LIB_VER' ) ) {
	define( 'EDD_CJS_LIB_VER', '1.0.0' ); //libraray version of js and css
}
if( !defined( 'EDD_CJS_DIR' ) ) {
	define( 'EDD_CJS_DIR', dirname( __FILE__ ) ); // plugin dir
}
if( !defined( 'EDD_CJS_URL' ) ) {
	define( 'EDD_CJS_URL', plugin_dir_url( __FILE__ ) ); // plugin url
}

if( !defined( 'EDD_CJS_INC_DIR' ) ) {
  define( 'EDD_CJS_INC_DIR', EDD_CJS_DIR.'/includes' );   // Plugin include dir
}
if( !defined( 'EDD_CJS_INC_URL' ) ) {
  define( 'EDD_CJS_INC_URL', EDD_CJS_URL.'includes' );    // Plugin include url
}
if( !defined( 'EDD_CJS_ADMIN_DIR' ) ) {
  define( 'EDD_CJS_ADMIN_DIR', EDD_CJS_INC_DIR.'/admin' );  // Plugin admin dir
}


/**
 * Load Text Domain
 *
 * This gets the plugin ready for translation.
 *
 * @package Woo Csv Products Importer
 * @since 1.0.0
 */
load_plugin_textdomain( 'edd_cjs', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

/**
 * Activation Hook
 *
 * Register plugin activation hook.
 *
 * @package Woo Csv Products Importer
 * @since 1.0.0
 */
register_activation_hook( __FILE__, 'edd_cjs_install' );

function edd_cjs_install() {
	//Setup Cron Job
	$utc_timestamp = time();
	/*if( ! wp_next_scheduled ( 'edd_cjs_importing_scheduled_cron' ) ) {
		//wp_schedule_event($utc_timestamp, 'hourly', 'edd_cjs_importing_scheduled_cron');
		wp_schedule_event($utc_timestamp, 'every_10_minutes', 'edd_cjs_importing_scheduled_cron');
	}*/
}

/**
 * Deactivation Hook
 *
 * Register plugin deactivation hook.
 *
 * @package Woo Csv Products Importer
 * @since 1.0.0
 */
register_deactivation_hook( __FILE__, 'edd_cjs_uninstall');

function edd_cjs_uninstall() {

	//Clear Cron Job
  	//wp_clear_scheduled_hook( 'edd_cjs_importing_scheduled_cron' );
}

// Global variables
global $edd_cjs_model, $edd_cjs_admin, $edd_cjs_public, $edd_cjs_scripts, $edd_cjs_layero_edd_download;

// this code for download single page in also like post list not a private Access
include_once( EDD_CJS_INC_DIR .'/class-cjs-layero-edd-related-download.php' );

// Misc handles all misc functions
//include_once( EDD_CJS_INC_DIR .'/wcesl-misc-functions.php' );

// Model class handles most of model functionalities of plugin
include_once( EDD_CJS_INC_DIR .'/class-cjs-model.php' );
$edd_cjs_model = new EDD_CJS_Model();

// Model class handles most of model functionalities of plugin
include_once( EDD_CJS_INC_DIR .'/class-cjs-scripts.php' );
$edd_cjs_scripts = new EDD_CJS_Scripts();
$edd_cjs_scripts->add_hooks();

// Admin class handles most of admin panel functionalities of plugin
include_once( EDD_CJS_INC_DIR .'/admin/class-cjs-admin.php' );
$edd_cjs_admin = new EDD_CJS_Admin();
$edd_cjs_admin->add_hooks();

// Public class handles most of fronted functionalities of plugin
include_once( EDD_CJS_INC_DIR .'/class-cjs-public.php' );
$edd_cjs_public = new EDD_CJS_Public();
$edd_cjs_public->add_hooks();

/**
 * Asset Editor Widget
 */
class asset_editor extends WP_Widget {
     /** constructor -- name this the same as the class above */
    function asset_editor() {
        parent::WP_Widget(false, $name = 'Asset Editor');	
    }
 
    /** @see WP_Widget::widget -- do not rename this */
    function widget($args, $instance) {	
        extract( $args );
        $title 		= apply_filters('widget_title', $instance['title']);
        $message 	= $instance['message'];
        ?>
              <?php echo $before_widget; ?>
                  <?php if ( $title )
                        echo $before_title . $title . $after_title; ?>
 							<ul>
								<li><button type="button" id="capture_thumbnail">Capture Thumbnail</button></li>
								<li><button type="button" id="save_current_view">Save Current View</button></li>
								<li><button type="button" id="reset_camera_view">Reset Camera View</button></li>
							</ul>
              <?php echo $after_widget; ?>
        <?php
    }
 
    /** @see WP_Widget::update -- do not rename this */
    function update($new_instance, $old_instance) {		
		$instance = $old_instance;
		$instance['title'] = strip_tags($new_instance['title']);

        return $instance;
    }
 
    /** @see WP_Widget::form -- do not rename this */
    function form($instance) {	
        $title 		= esc_attr($instance['title']);
        $message	= esc_attr($instance['message']);
        ?>
         <p>
          <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:'); ?></label> 
          <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <?php 
    }
} // end class asset_editor

add_action('widgets_init', create_function('', 'return register_widget("asset_editor");'));
/**
 * Asset Editor Widget End
 */

/**
 * Geo-Location Editor Widget
 */
class geolocation_editor extends WP_Widget {
     /** constructor -- name this the same as the class above */
    function geolocation_editor() {
        parent::WP_Widget(false, $name = 'Geo-Location Editor');	
    }
 
    /** @see WP_Widget::widget -- do not rename this */
    function widget($args, $instance) {	
        extract( $args );
        $title 		= apply_filters('widget_title', $instance['title']);
        $message 	= $instance['message'];
        ?>
              <?php echo $before_widget; ?>
                  <?php if ( $title )
                        echo $before_title . $title . $after_title; ?>
 							<ul>
								<li>Lat: <input type="text" id ="tileset_latitude" size="15"/></li>
								<li>Lon: <input type="text" id="tileset_longitude" size="15"/></li>
								<li>Alt: <input type="text" id="tileset_altitude" size="15"/></li>
								<li>Heading: <input type="text" id="tileset_heading" size="15"/></li>
								<li><button id = "set_tileset_model_matrix_json">Save Geo-Location</button></li>
							</ul>
              <?php echo $after_widget; ?>
        <?php
    }
 
    /** @see WP_Widget::update -- do not rename this */
    function update($new_instance, $old_instance) {		
		$instance = $old_instance;
		$instance['title'] = strip_tags($new_instance['title']);

        return $instance;
    }
 
    /** @see WP_Widget::form -- do not rename this */
    function form($instance) {	
        $title 		= esc_attr($instance['title']);
        $message	= esc_attr($instance['message']);
        ?>
         <p>
          <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:'); ?></label> 
          <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <?php 
    }
} // end class asset_editor

add_action('widgets_init', create_function('', 'return register_widget("geolocation_editor");'));

/**
 * Geo-Location Editor Widget End
 */

add_action( 'wp_ajax_nopriv_post_set_thumbnail', 'post_set_thumbnail' );
add_action( 'wp_ajax_post_set_thumbnail', 'post_set_thumbnail' );

function post_set_thumbnail() {
    $post_id = $_REQUEST['post_id'];
    $thumbnail_id = get_post_meta( $post_id, '_thumbnail_id', true );
    
    // check old thumbnail and delete
    if($thumbnail_id != "")
        if( ! wp_delete_attachment( $thumbnail_id, true )) {
            echo "failed to delete old thumbnail!";
            return;
        }
    
    // save image
    
    $image = $_REQUEST['capturedJpegImage'];
    $image = str_replace('data:image/jpeg;base64,', '', $image);
    $image = str_replace(' ', '+', $image);
    $imageData = base64_decode($image);
    
    $thumbnailFileName = 'thumbnail' . time().'.jpg';
    
    $wordpress_upload_dir = wp_upload_dir();
    
    $new_file_path = $wordpress_upload_dir['path'] . '/' . $thumbnailFileName;
    
    file_put_contents($new_file_path, $imageData);
    
    // end save image 
    
    // insert new attachment
    
    $siteurl = get_option('siteurl');

    $artdata = array();
    
    $artdata = array(
        'post_author' => 1, 
        'post_date' => current_time('mysql'),
        'post_date_gmt' => current_time('mysql'),
        'post_title' => $thumbnailFileName, 
        'post_status' => 'inherit',
        'comment_status' => 'open',
        'ping_status' => 'closed',
        'post_name' => sanitize_title_with_dashes(str_replace("_", "-", $thumbnailFileName)),   
        'post_modified' => current_time('mysql'),
        'post_modified_gmt' => current_time('mysql'),
        'post_parent' => $post_id,
        'post_type' => 'attachment',
        'guid' => $siteurl.'/'. $new_file_path,
        'post_mime_type' => 'image/jpeg',
        'post_excerpt' => '',
        'post_content' => ''
    );
    
    //insert the database record
    $attach_id = wp_insert_attachment( $artdata, $new_file_path, $post_id );
    
    if($attach_id == 0) {
        echo 'failed to insert attach!';
        return;
    }
    
    //generate metadata and thumbnails
    if ($attach_data = wp_generate_attachment_metadata( $attach_id, $new_file_path)) {
        wp_update_attachment_metadata($attach_id, $attach_data);
    }
    else {

    }

    $ret = update_post_meta( $post_id, '_thumbnail_id', $attach_id ); 
    
    if($ret == true) {
        echo "successfully update thumbnail";
    }
    else {
        echo "failed to update thumbnail";
    }
}

add_action( 'wp_ajax_nopriv_post_set_current_view', 'post_set_current_view' );
add_action( 'wp_ajax_post_set_current_view', 'post_set_current_view' );

function post_set_current_view() {
     $post_id = $_REQUEST['post_id'];
     $view_data = $_REQUEST['view_data'];
     
     $ret = update_post_meta( $_REQUEST['post_id'], 'default_camera_position_direction', $view_data ); 
     
     if($ret == true) 
         echo "successfully updated!";
     else {
        echo "failed to updated!";
     }
}

add_action( 'wp_ajax_nopriv_post_reset_current_view', 'post_reset_current_view' );
add_action( 'wp_ajax_post_reset_current_view', 'post_reset_current_view' );

function post_reset_current_view() {
     $post_id = $_REQUEST['post_id'];
     
     $ret = update_post_meta( $_REQUEST['post_id'], 'default_camera_position_direction', '' ); 
     
     if($ret == true) 
         echo "successfully updated!";
     else {
        echo "failed to updated!";
     }
}

add_action( 'wp_ajax_nopriv_get_post_data', 'get_post_data' );
add_action( 'wp_ajax_get_post_data', 'get_post_data');

function get_post_data() {
    $edd_cjs_options = get_option( 'edd_cjs_options' );
    
    $cesium_token = $edd_cjs_options['edd_cjs_cesiumjs_token_key'];
    
    $post_id = $_REQUEST['post_id'];
     
    $download_asset_id = get_post_meta( $post_id, 'download_asset_id', true );
    $download_asset_url = get_post_meta( $post_id, 'download_asset_url', true );
    $view_data = get_post_meta( $post_id, 'default_camera_position_direction', true);
    $tileset_model_matrix_json = get_post_meta( $post_id, 'asset_geo-location', true);
    
    $data->cesium_token = $cesium_token;
    $data->download_asset_id = $download_asset_id;
    $data->download_asset_url = $download_asset_url;
    $data->view_data = $view_data;
    $data->tileset_model_matrix_json = $tileset_model_matrix_json;
    
    $json = json_encode($data);
    
    echo $json;
}

add_action( 'wp_ajax_nopriv_get_tileset_model_matrix_json', 'get_tileset_model_matrix_json');
add_action( 'wp_ajax_get_tileset_model_matrix_data_json', 'get_tileset_model_matrix_json');

function get_tileset_model_matrix_json() {
    $post_id = $_REQUEST['post_id'];

    $tileset_model_matrix_json = get_post_meta( $post_id, 'asset_geo-location', true );

    echo $tileset_model_matrix_json;
}

add_action( 'wp_ajax_nopriv_set_tileset_model_matrix_json', 'set_tileset_model_matrix_json');
add_action( 'wp_ajax_set_tileset_model_matrix_json', 'set_tileset_model_matrix_json');

function set_tileset_model_matrix_json() {
    $post_id = $_REQUEST['post_id'];
    $tileset_model_matrix_json = $_REQUEST['tileset_model_matrix_json'];

	$ret0 = update_post_meta( $_REQUEST['post_id'], 'default_camera_position_direction', '' );
    $ret = update_post_meta( $post_id, 'asset_geo-location', $tileset_model_matrix_json );

    $data->ret = $ret;

    $json = json_encode($data);

    echo $json;
}
?>