<?php

/**
 * Template Name: Update Product API
 *
 */

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
header('Access-Control-Allow-Headers: Content-Type');
header("Access-Control-Allow-Origin: *");

// http://localhost/wordpress5.3/update_product_api/?post_id=4827

if(isset($_REQUEST['post_id'])) {
    $post_id = $_REQUEST['post_id'];

    if ( !get_post ( $post_id ) ) {
        echo json_encode(array('errCode' => 1, 'errMsg' => 'specified post ' . $post_id . ' does not exist!'));
        //wp_die('specified post does not exist!', 'error');
        exit;
    }

    /*
    $post_arr = array();

    $post_arr['ID'] = $post_id;
    $post_arr['post_status'] = 'publish';

    $ret = wp_update_post( $post_arr );
    */

    wp_publish_post($post_id);

    echo json_encode(array('errCode' => 0, 'errMsg' => 'successfully published!'));
   // wp_die('successfully published!', 'error');
    exit;
}
else {
    $url = site_url() . '/';

    echo json_encode(array('errCode' => 1, 'errMsg' => 'please specify post id!'));
    //wp_die('please specify post id!', 'error');
    exit;
}
