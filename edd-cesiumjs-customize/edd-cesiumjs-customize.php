<?php
/**
 * Plugin Name: EDD CesiumJS Customize
 * Plugin URI: http://www.worldwebtechnology.com/
 * Description: EDD CesiumJS Customize
 * Version: 1.0.2
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
 *
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
