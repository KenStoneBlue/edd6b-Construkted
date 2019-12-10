<?php
/**
 * Template Name: Viewer Only Template
 * The Template for displaying the viewer only page.
 * 
 *
 * @package Olam
 */

get_header('empty'); ?>

    <div class="section">
        <div class="container">
            <div class="row">
                <div class="col-lg-<?php echo esc_attr($columnWidth); ?> col-md-<?php echo esc_attr($columnWidth2); ?>">
                    <?php if ( have_posts() ) : ?>
                    <?php /* The loop */ ?>
                    <?php while ( have_posts() ) : the_post(); ?>
                    <div class="paper">
                        <?php
                        $download_asset_id = get_post_meta( get_the_ID(), 'download_asset_id', true );
                        $download_asset_url = get_post_meta( get_the_ID(), 'download_asset_url', true );

                        $display_3dtileset = TRUE;

                        //if( !empty($download_asset_id) || !empty($download_asset_url) ){
                        if($display_3dtileset){
                            echo '<div class ="preview-area">
                                    <div id="cesiumContainer" style="width:100%; height:500px"></div>
                                    <div id="toolbar">
                                        <button id="exitFPVModeButton" class="cesium-button">EXIT FPV MODE</button>
                                    </div>
                                  </div>
                                 ';
			} 


                        endwhile; ?>
                        <?php else : ?>
                            <?php get_template_part( 'content', 'none' ); ?>
                        <?php endif; ?>
                    </div>
                </div>

            </div>

        </div>
    </div>
<?php get_footer('empty');
