<?php
/**
 * The Template for displaying single download page.
 *
 * @package Olam
 */

get_header(); ?>

    <div class="section">
        <div class="container">
            <div class="page-head single-download-head">
                <h1>
                    <?php
                    $altTitle=olam_get_page_option(get_the_ID(),"olam_download_alttitle");
                    if(isset($altTitle) && (strlen($altTitle)>0 ) ) {
                        echo wp_kses($altTitle,array('span'=>array('class'=>array())));
                    } else{
                        the_title();
                    }
                    ?>
                </h1>
                <?php $subTitle=get_post_meta(get_the_ID(),"subheading");
                $videoCode=get_post_meta(get_the_ID(),"download_item_video_id");
                $audioCode=get_post_meta(get_the_ID(),"download_item_audio_id");
                if(isset($subTitle[0]) && (strlen($subTitle[0])>0) ) { ?>   <div class="page_subtitle"><?php echo esc_html($subTitle[0]); ?> </div> <?php } ?>
            </div>
            <div class="row">
                <?php
                $sideBarFlag=0;
                $columnWidth=12;
                $columnWidth2=12;
                if ( is_active_sidebar( 'olam-single-download' )){
                    $sideBarFlag=1;
                    $columnWidth=9;
                    $columnWidth2=8;
                }
                ?>
                <div class="col-lg-<?php echo esc_attr($columnWidth); ?> col-md-<?php echo esc_attr($columnWidth2); ?>">
                    <?php if ( have_posts() ) : ?>
                    <?php /* The loop */ ?>
                    <?php while ( have_posts() ) : the_post(); ?>
                    <div class="paper">
                        <?php
                        $download_asset_id = get_post_meta( get_the_ID(), 'download_asset_id', true );
                        $download_asset_url = get_post_meta( get_the_ID(), 'download_asset_url', true );

                        $display_3dtileset = true;

                        //if( !empty($download_asset_id) || !empty($download_asset_url) ){
                        if($display_3dtileset){
                            echo '<div class ="preview-area">
                                    <div id="cesiumContainer" style="width:100%; height:500px"></div>
                                    <div id="toolbar">
                                        <button id="exitFPVModeButton" class="cesium-button">EXIT FPV MODE</button>
                                    </div>
                                  </div>
                                 ';
                        } else { ?>
                            <div class="preview-area">
                                <div class="preview-image">

                                    <?php
                                    if(isset($videoCode[0]) && (strlen($videoCode[0])>0) ){
                                        $videoUrl=$videoCode[0];//wp_get_attachment_url($videoCode[0]);
                                        $videoFlag=1;

                                        if (strpos($videoUrl, 'vimeo') !== false) {
                                            echo '<div class="media-thumb vimeovid">'.do_shortcode("[video src='".esc_url($videoUrl)."']").'</div>';
                                        } else {
                                            echo '<div class="banner-media othervid">'.do_shortcode("[video src='".esc_url($videoUrl)."']").'</div>';
                                        }
                                    }
                                    else if(isset($audioCode[0]) && (strlen($audioCode[0])>0) ){
                                        $audioUrl=wp_get_attachment_url($audioCode[0]);
                                        echo '<div class="banner-media audiomed">'.do_shortcode("[audio src='".$audioUrl."']").'</div>';
                                    }
                                    ?>

                                    <!--  Post Image Gallery  -->
                                    <?php
                                    $post_gallery_img = get_post_meta($post->ID, '_olam_post_image_gallery', true);
                                    $arr=explode(",",$post_gallery_img);
                                    if((!has_post_thumbnail() && $post_gallery_img=='') || (has_post_thumbnail() && $post_gallery_img=='') || (!has_post_thumbnail() && count($arr)<2))
                                    {
                                        echo '<ul class="banner-slider2">';
                                    }
                                    else
                                    {
                                        echo '<ul class="banner-slider">';
                                    }
                                    if (has_post_thumbnail())
                                    { ?>
                                        <li>
                                        <?php the_post_thumbnail('olam-preview-image'); ?>
                                        </li><?php
                                    }
                                    if($post_gallery_img!='')//!empty($arr)
                                    {
                                        foreach ($arr as $value)
                                        {
                                            $img_url = wp_get_attachment_image_src ( $value, 'olam-product-thumb', false );
                                            $img_url2 = wp_get_attachment_image_src ( $value, false );
                                            echo '<li>
                                            <img alt="" src="'.$img_url[0].'">
                                          </li>';
                                        }
                                    }
                                    if (!has_post_thumbnail() && $post_gallery_img == '')
                                    {
                                        echo '<li>
                                        <img alt="" src="' . esc_url( get_stylesheet_directory_uri() )  . '/img/preview-image-default.jpg" />
                                      </li>';
                                    }
                                    ?>
                                    </ul>

                                </div>
                                <div class="preview-options">
                                    <?php $previewLink=get_post_meta(get_the_ID(),'preview_url');  ?>
                                    <?php if(isset($previewLink[0])&& (strlen($previewLink[0])>0) ) { ?> <a href="<?php echo esc_url($previewLink[0]); ?>" class="active" target="_blank" ><i class="demo-icons icon-eye"></i><?php esc_html_e('Live Preview','olam'); ?></a> <?php } ?>
                                </div>
                            </div>
                        <?php } ?>
                        <div class="content-area">
                            <?php the_content(); ?>
                        </div>
                        <?php endwhile; ?>
                        <?php else : ?>
                            <?php get_template_part( 'content', 'none' ); ?>
                        <?php endif; ?>
                        <?php if ( comments_open() && !class_exists( 'Walker_EDD_Review' ) ) : ?>

                            <div id="comments_area" class="wp_comments comment-list">
                                <?php comments_template( '', true ); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <?php  if ( $sideBarFlag==1){ ?>
                    <div class="col-lg-3 col-md-4">
                        <div class="sidebar">
                            <?php  dynamic_sidebar( 'olam-single-download' ); ?>
                        </div>
                    </div>
                <?php } ?>

            </div>

        </div>
    </div>
<?php get_footer();
