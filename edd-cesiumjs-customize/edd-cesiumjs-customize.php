<?php
/**
 * Plugin Name: EDD CesiumJS Customize
 * Plugin URI: http://www.worldwebtechnology.com/
 * Description: EDD CesiumJS Customize
 * Version: 1.0.3
 * Author: World Web
 * Author URI: http://www.worldwebtechnology.com/
 * Text Domain: edd_cjs
 * Domain Path: languages
 *
 * @package EDD CesiumJS Customize
 * @category Core
 * @author World Web
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
 *
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
 * Example Widget Class
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
								<li><button type="button"><?php echo 'Capture Thumbnail'; ?></button></li>
								<li><button type="button"><?php echo 'Save Current View'; ?></button></li>
								<li><button type="button"><?php echo 'Reset Camera View'; ?></button></li>
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


?>