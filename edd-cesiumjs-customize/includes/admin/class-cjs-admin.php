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
class EDD_CJS_Admin {

	public $model;

	//class constructor
	function __construct() {

		global $woo_cpi_model;

		$this->model = $woo_cpi_model;
	}

	/**
	 * Initialize settings api.
	 *
	 * Registers settings and setting fields.
	 *
	 * @since 1.0.0
	 */
	public function edd_cjs_media_settings_init() {

		register_setting( 'edd_cjs_constructed_options', 'edd_cjs_options', array($this, '') );
		register_setting( 'media', 'eddcjs_rcp_level_size', array($this, '') );
		//register_setting( 'edd_cjs_constructed_rcp_level', 'edd_cjs_rcp_level', array($this, '') );

	}

	/**
	* Create option page admin menu for frontend submission customization.
	*
	* @since 1.0.0
	*/
	public function edd_cjs_option_page_admin_menu() {
		add_options_page(
			'Constructed',
			'Constructed',
			'manage_options',
			'constructed_page',
			array($this,'edd_cjs_constructed_settings_page')
		);
	}

	/**
	* Create option page admin menu for tabbing set.
	*
	* @since 1.0.0
	*/
	public function edd_cjs_constructed_settings_page() {
		global $constructed_active_tab;
		$constructed_active_tab = isset( $_GET['tab'] ) ? $_GET['tab'] : 'cesium-viewer'; ?>

		<h2 class="nav-tab-wrapper">
			<?php
			do_action( 'constructed_settings_tab' );
			?>
		</h2>
		<?php
		do_action( 'constructed_settings_content' );
	}

	/**
	* Create option page admin menu for tabbing.
	*
	* @since 1.0.0
	*/
	public function edd_cjs_constructed_tab(){
		global $constructed_active_tab; ?>
		<a class="nav-tab <?php echo $constructed_active_tab == 'cesium-viewer' ? 'nav-tab-active' : ''; ?>" href="<?php echo admin_url( 'options-general.php?page=constructed_page&tab=cesium-viewer' ); ?>"><?php _e( 'Cesium Viewer', 'edd_cjs' ); ?> </a>

		<a class="nav-tab <?php echo $constructed_active_tab == 'subscription-plan' ? 'nav-tab-active' : ''; ?>" href="<?php echo admin_url( 'options-general.php?page=constructed_page&tab=subscription-plan' ); ?>"><?php _e( 'Subscription Plans', 'edd_cjs' ); ?> </a>

		<?php
	}

	/**
	* Create option page admin menu for tabbing content.
	*
	* @since 1.0.0
	*/
	public function edd_cjs_constructed_tab_content() {
		global $constructed_active_tab;
		if ( 'cesium-viewer' == $constructed_active_tab)
		{ 
			include_once( EDD_CJS_INC_DIR . '/admin/forms/edd-cjs-cesium-viewer-settings.php' );
		} else {
			include_once( EDD_CJS_INC_DIR . '/admin/forms/edd-cjs-subscription-plan-settings.php' );
		}
	}

	/**
	 * Register Settings
	 *
	 * @package SCGC GetEDGE API
	 * @since 1.0.0
	 */

	
	/**
	 * Adding Hooks
	 *
	 * @package EDD CesiumJS Customize
	 * @since 1.0.0
	 */
	function add_hooks() {

    	// Add settings option
		add_action( 'admin_init', array( $this, 'edd_cjs_media_settings_init' ), 50, 1 );

		//add_action('admin_init', array($this, 'edd_cjs_admin_init'));

		/*Sttings in create option menu*/
		add_action( 'admin_menu', array( $this, 'edd_cjs_option_page_admin_menu' ) );

		add_action( 'constructed_settings_tab', array( $this, 'edd_cjs_constructed_tab' ) );

		add_action( 'constructed_settings_content', array( $this, 'edd_cjs_constructed_tab_content' ) );


	}
}
