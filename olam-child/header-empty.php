<!DOCTYPE html>
<html class="no-js" <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width">
  <?php if ( ! function_exists( 'has_site_icon' ) || ! has_site_icon() ) {
    $themefavicon=get_theme_mod('olam_theme_favicon');
    $themefavicon=olam_replace_site_url($themefavicon);
    if(isset($themefavicon) && (strlen($themefavicon)>0) ) { ?>
    <link rel="shortcut icon" type="image/x-icon" href="<?php echo esc_url($themefavicon); ?>">
    <?php } } else{ wp_site_icon(); } ?>
    <?php
    $customcss = get_theme_mod( 'olam_custom_css' ); 
    if(isset($customcss) && (strlen($customcss)>0 )  ){ ?>
    <style type="text/css">
      <?php echo esc_html($customcss); ?>
    </style>
    <?php } ?>
    <?php wp_head(); ?>
  </head>
  <?php 
  $bodyClassArray=array();
  $olamheadersticky=get_theme_mod('olam_header_sticky');
  $olamcategoryfilter=get_theme_mod('olam_category_filter');
  if(isset($olamheadersticky) && $olamheadersticky==1 ){ 
   $bodyClassArray[]="header-sticky";
 }
 ?>

 <body <?php body_class($bodyClassArray); ?>>
        <!--[if lt IE 8]>
            <p class="browserupgrade"><?php echo wp_kses(__('You are using an <strong>outdated</strong> browser. Please upgrade your browser to improve your experience.</p>','olam'),array('p'=>array(),'strong'=>array() )); ?>
            <![endif]-->


