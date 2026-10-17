package com.jenniemusic.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings settings = webView.getSettings();
            // Allow programmatic/background audio playback without requiring continuous gestures
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView audio engine and JavaScript audio timers alive when the phone screen turns off or app minimizes
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().onResume();
        }
    }
}
