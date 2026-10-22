package com.jenniemusic.app;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static MainActivity instance;

    public static void handleMediaAction(final String action) {
        if (instance != null && instance.bridge != null && instance.bridge.getWebView() != null) {
            instance.bridge.getWebView().post(new Runnable() {
                @Override
                public void run() {
                    try {
                        WebView wv = instance.bridge.getWebView();
                        if (wv != null) {
                            wv.evaluateJavascript("window.__onNativeMediaAction && window.__onNativeMediaAction('" + action + "');", null);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    public class AndroidMediaBridge {
        @JavascriptInterface
        public void updatePlayback(String title, String artist, boolean isPlaying) {
            MediaPlaybackService.startOrUpdate(MainActivity.this, title, artist, isPlaying);
        }

        @JavascriptInterface
        public void stopPlayback() {
            MediaPlaybackService.stop(MainActivity.this);
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings settings = webView.getSettings();

            // Allow programmatic/background audio playback without requiring continuous gestures
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);

            // Register native bridge for seamless background playback & notifications
            webView.addJavascriptInterface(new AndroidMediaBridge(), "AndroidMediaBridge");
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView audio engine and JavaScript audio timers alive when screen turns off or app minimizes
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().onResume();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        // Keep WebView audio engine active when app is in the background
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().onResume();
        }
    }

    @Override
    public void onBackPressed() {
        // If music is actively playing in the background, move task to back instead of killing the app process!
        if (MediaPlaybackService.isPlaying) {
            moveTaskToBack(true);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }
}
