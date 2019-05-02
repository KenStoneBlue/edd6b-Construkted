<?php

// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Plugin Model Class
 *
 * Handles generic functionailties
 *
 * @package Woo Csv Products Importer
 * @since 1.0.0
 */

class EDD_CJS_Model {

 	//class constructor
	public function __construct() {
	}

	/**
	  * Escape Tags & Slashes
	  *
	  * Handles escapping the slashes and tags
	  *
	  * @package Woo Csv Products Importer
	  * @since 1.0.0
	  */

	 public function edd_cjs_escape_attr($data){

	 	return esc_attr(stripslashes($data));
	 }

	 /**
	  * Stripslashes
 	  *
  	  * It will strip slashes from the content
	  *
	  * @package Woo Csv Products Importer
	  * @since 1.0.0
	  */

	 public function edd_cjs_escape_slashes_deep($data = array(),$flag = false){

	 	if($flag != true) {
			$data = $this->edd_cjs_nohtml_kses($data);
		}
		$data = stripslashes_deep($data);
		return $data;
	 }

	/**
	 * Strip Html Tags
	 *
	 * It will sanitize text input (strip html tags, and escape characters)
	 *
	 * @package Woo Csv Products Importer
	 * @since 1.0.0
	 */
	public function edd_cjs_nohtml_kses($data = array()) {

		if ( is_array($data) ) {

			$data = array_map(array($this,'edd_cjs_nohtml_kses'), $data);

		} elseif ( is_string( $data ) ) {

			$data = wp_filter_nohtml_kses($data);
		}

		return $data;
	}

}
