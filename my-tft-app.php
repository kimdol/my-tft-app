<?php
/**
 * Plugin Name: TFT Workspace React App
 * Description: Elementor에서 사용하는 TFT 빌더 컴포넌트
 * Version: 1.0
 */

if (!defined('ABSPATH')) exit;

function enqueue_tft_app_scripts() {
    $js_file = plugins_url('/dist/assets/app.js', __FILE__);
    $css_file = plugins_url('/dist/assets/index.css', __FILE__);

    wp_enqueue_script('tft-react-app', $js_file, array(), '1.0', true);
    
    wp_enqueue_style('tft-react-style', $css_file, array(), '1.0');
}


add_action('wp_enqueue_scripts', 'enqueue_tft_app_scripts');
add_shortcode('tft_builder', function() {
    return '<div id="tft-workspace-root"></div>'; 
});